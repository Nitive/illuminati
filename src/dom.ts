import xs, { Stream } from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats'
import * as _ from 'lodash'

const JSXText: JSX.TextElementType = '_text'

function createTextElement(text: string | number): JSX.TextElement {
  return {
    type: JSXText,
    text: String(text),
  }
}

export type Child = JSX.Element | string | number | Stream<string | number>

function createChild(child: Child): JSX.Element | JSX.TextElement | Stream<JSX.TextElement> {
  if (typeof child === 'string' || typeof child === 'number') {
    return createTextElement(child)
  }

  if (child instanceof Stream) {
    return child.map(createTextElement)
  }

  return child
}

function collection(type: 'collection', props: JSX.CollectionProps, ...children: Array<JSX.ChildrenMap>): JSX.Collection {
  return {
    type,
    props,
    childrenMap: children[0],
  }
}

function element(type: JSX.ElementType, props: JSX.ElementProps, ...children: Array<Child | _.RecursiveArray<Child>>): JSX.Element {
  return {
    type,
    props,
    children: _.flattenDeep(children).map(createChild),
  }
}

export function h(type: any, props?: any, ...children: any[]) {
  // TODO: check there is no prop and prop$ together

  if (type === 'collection') {
    return collection(type, props, ...children)
  }

  return element(type, props || {}, ...children)
}

function error(err: Error) {
  console.error(err)
}

type Update<S> = (state: S) => void
interface MountArgs<S> {
  state$: Stream<S>,
  firstMount: Update<S>,
  nextMounts: Update<S>,
}

function watch<S>({ state$, firstMount, nextMounts }: MountArgs<S>) {
  state$
    .take(1)
    .addListener({
      next: firstMount,
      error,
    })

  state$
    .compose(dropRepeats())
    .drop(1)
    .addListener({
      next: nextMounts,
      error,
    })
}

const setAttribute = (attributeName: string) => (node: Element) => (state: string) => {
  if (state) {
    node.setAttribute(attributeName, state)
  } else {
    node.removeAttribute(attributeName)
  }
}

function watchAttribute(plainAttr: JSX.PlainPropsKeys, streamAttr: JSX.StreamPropsKeys, node: Element, props: JSX.ElementProps) {
  const setAttr = setAttribute(plainAttr)(node)

  watch({
    state$: props[streamAttr] || (props[plainAttr] ? xs.of(props[plainAttr]) : xs.empty()),
    firstMount: setAttr,
    nextMounts: setAttr,
  })
}

export type RemoveNodeFn = () => Promise<void>

function createElementSubscriber<ParentType extends Element, State>(parent: ParentType, state$: Stream<State>) {
  return function createElementWithHooks<NodeType>(hooks: {
    mount: (state: State, parent: ParentType) => Promise<NodeType>,
    update: (vnode: State, node: NodeType, parent: ParentType) => Promise<NodeType>,
    remove: (node: NodeType, parent: ParentType) => Promise<void>,
  }): RemoveNodeFn {
    const stateHead$ = state$.take(1)
    const stateTail$ = state$.compose(dropRepeats()).drop(1)

    const node$ = xs.create<NodeType>({
      start(listener) {
        let node: NodeType
        stateHead$.addListener({
          async next(state) {
            node = await hooks.mount(state, parent)
            listener.next(node)
            stateTail$.addListener({
              async next(state) {
                // TODO: add update to stack and run consistently
                // to prevent situation when second update applied before first
                node = await hooks.update(state, node, parent)
                listener.next(node)
              },
              error(err) {
                listener.error(err)
              },
            })
          },
          error(err) {
            listener.error(err)
          },
        })
      },
      stop() {}, // tslint:disable-line:no-empty
    })

    node$.addListener({ error })

    return async function removeElement() {
      stateHead$.shamefullySendComplete()
      stateTail$.shamefullySendComplete()
      node$.last().addListener({
        next(node) {
          // in fact node can be already remove and NodeType contain undefined
          if (node) {
            hooks.remove(node, parent)
          }
        },
        error,
      })
    }
  }
}

function nextFrame(): Promise<void> {
  return new Promise<void>(resolve => {
    requestAnimationFrame(() => {
      resolve()
    })
  })
}

async function createTextNode<ParentNode extends Element>(parent: ParentNode, text: string) {
  await nextFrame()
  const node = document.createTextNode(text)
  parent.appendChild(node)
  return node
}

async function removeNode<ParentNode extends Element>(parent: ParentNode, node: Element | Text) {
  await nextFrame()
  parent.removeChild(node)
}

function createTextNodeFromStream<ParentNode extends Element>(parent: ParentNode, vnode$: Stream<JSX.TextElement>): RemoveNodeFn {
  const createElementWithHooks = createElementSubscriber(parent, vnode$.map(vnode => vnode.text))
  return createElementWithHooks<Text>({
    async mount(text, parent) {
      return await createTextNode(parent, text)
    },
    async update(text, node) {
      await nextFrame()
      node.textContent = text
      return node
    },
    async remove(node, parent) {
      await removeNode(parent, node)
    },
  })
}

function createElement(parent: Element, vnode: JSX.Element): RemoveNodeFn {
  const { type, props, children } = vnode
  async function add(parent: Element) {
    await nextFrame()

    const node = document.createElement(type)
    parent.appendChild(node)
    watchAttribute('class', 'class$', node, props)
    watchAttribute('id', 'id$', node, props)
    watchAttribute('type', 'type$', node, props)

    children.forEach(child => {
      createNode(node!, child)
    })
    return node
  }

  async function remove(node: Element, parent: Element) {
    await removeNode(parent, node)
  }

  const visible$ = props.if$ || xs.of(true)
  const createElementWithHooks = createElementSubscriber(parent, visible$)

  return createElementWithHooks<Element | void>({
    async mount(shouldBeVisible, parent) {
      if (shouldBeVisible) {
        return await add(parent)
      }
      return
    },
    async update(shouldBeVisible, node, parent) {
      if (shouldBeVisible) {
        return await add(parent)
      } else {
        // node always exist because dropRepeats() guarantees previous state is false
        // so we can use ! to remove undefined variant from type
        await remove(node!, parent)
        return
      }
    },
    async remove(node, parent) {
      if (node) {
        await remove(node, parent)
      }
    },
  })
}

export function createNode(parent: Element, jsxChild: JSX.Child): RemoveNodeFn {
  // Stream<JSX.TextElement>

  if (jsxChild instanceof Stream) {
    return createTextNodeFromStream(parent, jsxChild)
  }


  // VNodes

  const vnode = jsxChild

  if (vnode.type === 'collection') {
    return () => Promise.resolve()
  }

  // JSX.TextElement

  if (vnode.type === JSXText) {
    const nodeP = createTextNode(parent, vnode.text)
    return async function removeTextNode() {
      await removeNode(parent, await nodeP)
    }
  }

  // JSX.Element
  return createElement(parent, vnode)
}

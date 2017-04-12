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

function createElementSubscriber<ParentType extends Element, VNode>(parent: ParentType, vnode$: Stream<VNode>) {
  return function createElementWithHooks<NodeType>(hooks: {
    mount: (vnode: VNode, parent: ParentType) => Promise<NodeType>,
    update: (vnode: VNode, node: NodeType, parent: ParentType) => Promise<void>,
    remove: (node: NodeType, parent: ParentType) => Promise<void>,
  }): RemoveNodeFn {
    const first$ = vnode$.take(1)
    const next$ = vnode$.drop(1)
    const nodeP = new Promise<NodeType>((resolve, reject) => {
      first$.addListener({
        next(vnode) {
          const nodeP = hooks.mount(vnode, parent)
          nodeP.then(node => {
            next$.addListener({
              next(vnode) {
                // TODO: validate that previous update was completed
                hooks.update(vnode, node, parent)
              },
              error: reject,
            })
            resolve(node)
          })
        },
        error: reject,
      })
    })

    return () => nodeP.then(node => {
      first$.shamefullySendComplete()
      next$.shamefullySendComplete()
      hooks.remove(node, parent)
    })
  }
}

function nextFrame(): Promise<void> {
  return new Promise<void>(resolve => {
    requestAnimationFrame(() => {
      resolve()
    })
  })
}

async function createTextNode<ParentNode extends Element>(parent: ParentNode, vnode: JSX.TextElement) {
  await nextFrame()
  const node = document.createTextNode(vnode.text)
  parent.appendChild(node)
  return node
}

async function removeNode<ParentNode extends Element>(parent: ParentNode, node: Element | Text) {
  await nextFrame()
  parent.removeChild(node)
}

function createTextNodeFromStream<ParentNode extends Element>(parent: ParentNode, vnode$: Stream<JSX.TextElement>): RemoveNodeFn {
  const createElementWithHooks = createElementSubscriber(parent, vnode$)
  return createElementWithHooks<Text>({
    mount(vnode, parent) {
      return createTextNode(parent, vnode)
    },
    async update(vnode, node) {
      await nextFrame()
      node.textContent = vnode.text
    },
    remove(node, parent) {
      return removeNode(parent, node)
    },
  })
}

function createElement(parent: Element, vnode: JSX.Element): RemoveNodeFn {
  let node: Element | null
  const { type, props, children } = vnode
  async function add() {
    await nextFrame()

    node = document.createElement(type)
    parent.appendChild(node)
    watchAttribute('class', 'class$', node, props)
    watchAttribute('id', 'id$', node, props)
    watchAttribute('type', 'type$', node, props)

    children.forEach(child => {
      createNode(node!, child)
    })
  }

  async function remove() {
    if (!node) {
      throw new Error('Trying to remove node when ')
    }
    await removeNode(parent, node)
    node = null
  }

  const visible$ = props.if$ || xs.of(true)

  watch({
    state$: visible$,
    firstMount(shouldBeVisible) {
      if (shouldBeVisible) {
        add()
      }
    },
    nextMounts(shouldBeVisible) {
      if (shouldBeVisible) {
        add()
      } else {
        remove()
      }
    },
  })

  return async function removeElement() {
    await remove()
    visible$.shamefullySendComplete()
  }
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
    const nodeP = createTextNode(parent, vnode)
    return async function removeTextNode() {
      const node = await nodeP
      return removeNode(parent, node)
    }
  }

  // JSX.Element
  return createElement(parent, vnode)
}

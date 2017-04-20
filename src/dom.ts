import xs, { Stream } from 'xstream'
import dropRepeats from 'xstream/extra/dropRepeats'
import { RecursiveArray } from 'lodash'
import last = require('lodash/last')
import flattenDeep = require('lodash/flattenDeep')

const JSXText: JSX.TextElementType = '_text'

function createTextElement(text: string | number): JSX.TextElement {
  return {
    type: JSXText,
    text: String(text),
  }
}

type Child = JSX.Element | string | number | Stream<string | number>

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

function element(type: JSX.ElementType, props: JSX.ElementProps, ...children: Array<Child | RecursiveArray<Child>>): JSX.Element {
  return {
    type,
    props,
    children: flattenDeep(children).map(createChild),
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

const setAttribute = (attributeName: string) => (node: HTMLElement) => (state: string) => {
  if (state) {
    node.setAttribute(attributeName, state)
  } else {
    node.removeAttribute(attributeName)
  }
}

function watchAttribute(plainAttr: JSX.PlainPropsKeys, streamAttr: JSX.StreamPropsKeys, node: HTMLElement, props: JSX.ElementProps) {
  const setAttr = setAttribute(plainAttr)(node)

  watch({
    state$: props[streamAttr] || (props[plainAttr] ? xs.of(props[plainAttr]) : xs.empty()),
    firstMount: setAttr,
    nextMounts: setAttr,
  })
}

type NodeE = {
  nodeP: Promise<HTMLElement | Text | void>,
  remove: () => Promise<void>,
}

type InsertFn = <N extends HTMLElement | Text>(node: N) => void

function toPromise<S>(stream: Stream<S>): Promise<S> {
  return new Promise<S>((resolve, reject) => {
    stream.last() .addListener({
      next: resolve,
      error: reject,
    })
  })
}

function createElementSubscriber<State>(insert: InsertFn, state$: Stream<State>) {
  return function createElementWithHooks<NodeType extends HTMLElement | Text | void>(hooks: {
    mount: (state: State, insert: InsertFn) => Promise<NodeType>,
    update: (vnode: State, node: NodeType, insert: InsertFn) => Promise<NodeType>,
    remove: (node: NodeType, insert: InsertFn) => Promise<void>,
  }): NodeE {
    const stateHead$ = state$.take(1)
    const stateTail$ = state$.compose(dropRepeats()).drop(1)

    // TODO: Rewrite in declarative manner. Can't do it at 3 AM :(
    const node$ = xs.create<NodeType>({
      start(listener) {
        let node: NodeType
        stateHead$.addListener({
          async next(state) {
            node = await hooks.mount(state, insert)
            listener.next(node)
            stateTail$.addListener({
              async next(state) {
                // TODO: add update to stack and run consistently
                // to prevent situation when second update applied before first
                node = await hooks.update(state, node, insert)
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

    const nodeP = toPromise(node$.take(1))
    return {
      nodeP,
      async remove() {
        stateHead$.shamefullySendComplete()
        stateTail$.shamefullySendComplete()
        removeNode(await nodeP as any)
      },
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

async function createTextNode(insert: InsertFn, text: string) {
  await nextFrame()
  const node = document.createTextNode(text)
  insert(node)
  return node
}

async function removeNode(node: HTMLElement | Text) {
  await nextFrame()
  if (node.remove) {
    node.remove()
  } else {
    const parent = node.parentNode
    if (parent) {
      parent.removeChild(node)
    }
  }
}

function createTextNodeFromStream(insert: InsertFn, vnode$: Stream<JSX.TextElement>): NodeE {
  const createElementWithHooks = createElementSubscriber(insert, vnode$.map(vnode => vnode.text))
  return createElementWithHooks<Text>({
    async mount(text, insert) {
      return await createTextNode(insert, text)
    },
    async update(text, node) {
      await nextFrame()
      node.textContent = text
      return node
    },
    remove: removeNode,
  })
}

function createElement(insert: InsertFn, vnode: JSX.Element): NodeE {
  const { type, props, children } = vnode
  async function add(insert: InsertFn) {
    await nextFrame()

    const node = document.createElement(type)
    insert(node)
    watchAttribute('class', 'class$', node, props)
    watchAttribute('href', 'href$', node, props)
    watchAttribute('id', 'id$', node, props)
    watchAttribute('type', 'type$', node, props)

    const childrenNodes: Array<HTMLElement | Text | void> = []

    children.forEach((child, index) => {
      function insert(n: HTMLElement) {
        if (index >= childrenNodes.length) {
          node.appendChild(n)
          return
        }

        const prevNodes = childrenNodes
          .filter(Boolean)
          .slice(0, index)

        const prevNode = last(prevNodes)
        if (prevNode) {
          node.insertBefore(n, prevNode.nextSibling)
          return
        }

        node.insertBefore(n, node.firstChild)
      }

      createNode(insert, child).nodeP.then(node => {
        childrenNodes[index] = node
      })
    })
    return node
  }

  const visible$ = props.if$ || xs.of(true)
  const createElementWithHooks = createElementSubscriber(insert, visible$)

  return createElementWithHooks<HTMLElement | void>({
    async mount(shouldBeVisible, insert) {
      if (shouldBeVisible) {
        return await add(insert)
      }
      return
    },
    async update(shouldBeVisible, node, insert) {
      if (shouldBeVisible) {
        return await add(insert)
      } else {
        // node always exist because dropRepeats() guarantees previous state is false
        // so we can use ! to remove undefined variant from type
        await removeNode(node!)
        return
      }
    },
    async remove(node) {
      if (node) {
        await removeNode(node)
      }
    },
  })
}

function createNode(insert: InsertFn, jsxChild: JSX.Child): NodeE {
  // Stream<JSX.TextElement>

  if (jsxChild instanceof Stream) {
    return createTextNodeFromStream(insert, jsxChild)
  }


  // VNodes

  const vnode = jsxChild

  if (vnode.type === 'collection') {
    throw new Error('Dynamic collections are not implemented yet')
  }

  // JSX.TextElement

  if (vnode.type === JSXText) {
    const nodeP = createTextNode(insert, vnode.text)
    return {
      nodeP,
      remove: () => nodeP.then(removeNode),
    }
  }

  // JSX.Element
  return createElement(insert, vnode)
}

export function render(vtree: JSX.Child, root: HTMLElement) {
  function insert(node: HTMLElement) {
    root.appendChild(node)
  }

  createNode(insert, vtree)
}

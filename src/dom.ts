import xs, { Stream } from 'xstream'
import fromEvent from 'xstream/extra/fromEvent'
import dropRepeats from 'xstream/extra/dropRepeats'
import * as _ from 'lodash'

const JSXText: JSX.TextElementType = '_text'

function createTextElement(text: string): JSX.TextElement {
  return {
    type: JSXText,
    text,
  }
}

type Child = JSX.Element | string | Stream<string>

function createChild(child: Child): JSX.Element | JSX.TextElement | Stream<JSX.TextElement> {
  if (typeof child === 'string') {
    return createTextElement(child)
  }

  if (child instanceof Stream) {
    return child.map(createTextElement)
  }

  return child
}

export function h(type: JSX.ElementType, props?: JSX.ElementProps, ...children: Array<Child | _.RecursiveArray<Child>>): JSX.Element {
  // TODO: check there is no prop and prop$ together
  return {
    type,
    props: props || {},
    children: _.flattenDeep(children).map(createChild),
  }
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
function mount<S>({ state$, firstMount, nextMounts }: MountArgs<S>) {
  state$
    .take(1)
    .addListener({
      next: state => {
        firstMount(state)
      },
      error,
    })

  state$
    .compose(dropRepeats())
    .drop(1)
    .addListener({
      next: state => {
        nextMounts(state)
      },
      error,
    })
}

function createNode(parent: Element, vnode: JSX.Child): Element | Text {
  if (vnode instanceof Stream) {
    const node = document.createTextNode('')
    vnode
      .addListener({
        next: element => {
          node.textContent = element.text
        },
        error,
      })
    return node
  }

  if (vnode.type === JSXText) {
    const node = document.createTextNode(vnode.text)
    return node
  }

  const node = document.createElement(vnode.type)
  const { props } = vnode

  function createElement() {
    const setClass = (state: string) => {
      if (state) {
        node.setAttribute('class', state)
      } else {
        node.removeAttribute('class')
      }
    }

    mount({
      state$: props.class$ || (props.class ? xs.of(props.class) : xs.empty()),
      firstMount: setClass,
      nextMounts: setClass,
    })

    let children: Array<Element | Text>
    if (!(vnode instanceof Stream) && vnode.type !== JSXText) {
      children = vnode.children.map(child => {
        const childNode = createNode(node, child)
        node.appendChild(childNode)
        return childNode
      })
    }
    parent.appendChild(node)
    return function remove() {
      parent.removeChild(node)
      children.forEach(child => child.remove())
    }
  }

  let remove: Function
  mount({
    state$: props.if$ || xs.of(true),
    firstMount(state) {
      if (!state) { return }
      remove = createElement()
    },

    nextMounts(state) {
      if (state) {
        remove = createElement()
      } else {
        remove()
      }
    },
  })
  return node
}

export class DOMSource {
  public selectEvents(selector: string, eventName: string) {
    return fromEvent(document.body, eventName)
      .filter(event => event.target.matches(selector))
  }
}

export function makeDOMDriver(selector: string) {
  const root = document.querySelector(selector)
  if (!root) {
    throw new Error(`makeDOMDriver(...): Cannot find element with selector \`${selector}\``)
  }

  return function domDriver(tree$: Stream<JSX.Element>) {
    tree$.take(1).addListener({
      next: tree => {
        // TODO: use root.replaceWith(createNode(root, tree))
        root.innerHTML = ''
        createNode(root, tree)
      },
      error,
    })

    return new DOMSource()
  }
}

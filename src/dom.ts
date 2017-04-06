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
const setClassForNode = setAttribute('class')


function createNode(parent: Element, vnode: JSX.Child): void {

  // Stream<JSX.TextElement>

  if (vnode instanceof Stream) {
    let node: Text
    mount({
      state$: vnode,
      firstMount: element => {
        node = document.createTextNode(element.text)
        parent.appendChild(node)
      },
      nextMounts: element => {
        node.textContent = element.text
      },
    })
    return
  }


  // JSX.TextElement

  if (vnode.type === JSXText) {
    const node = document.createTextNode(vnode.text)
    parent.appendChild(node)
    return
  }


  // JSX.Element

  let node: Element
  const { type, props, children } = vnode
  function add() {
    node = document.createElement(type)
    parent.appendChild(node)
    const setClass = setClassForNode(node)

    mount({
      state$: props.class$ || (props.class ? xs.of(props.class) : xs.empty()),
      firstMount: setClass,
      nextMounts: setClass,
    })

    children.forEach(child => {
      createNode(node, child)
    })
  }

  function remove() {
    parent.removeChild(node)
  }

  mount({
    state$: props.if$ || xs.of(true),
    firstMount(state) {
      if (state) {
        add()
      }
    },

    nextMounts(state) {
      if (state) {
        add()
      } else {
        remove()
      }
    },
  })
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

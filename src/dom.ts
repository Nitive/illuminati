import xs, { Stream } from 'xstream'
import fromEvent from 'xstream/extra/fromEvent'
import dropRepeats from 'xstream/extra/dropRepeats'
import * as _ from 'lodash'

const JSXText: JSX.TextElementType = '_text'

function createTextElement(text: string): JSX.TextElement {
  return {
    type: JSXText,
    text,
    key: text,
  }
}

type Child = JSX.Element | string | Stream<string>

function createChild(child: Child): JSX.Element | JSX.TextElement | Stream<JSX.TextElement | Array<JSX.Element | JSX.TextElement>> {
  if (typeof child === 'string') {
    return createTextElement(child)
  }

  if (child instanceof Stream) {
    return child.map(textOrArray => {
      return Array.isArray(textOrArray)
        ? textOrArray
        : createTextElement(textOrArray)
    })
  }

  return child
}

export function h(type: JSX.ElementType, _props?: JSX.ElementProps, ...children: Array<Child | _.RecursiveArray<Child>>): JSX.Element {
  const props = _props || {}
  // TODO: check there is no prop and prop$ together
  return {
    type,
    props,
    children: _.flattenDeep(children).map(createChild),
    key: props.key != null ? props.key : Math.random(),
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

function watchAttribute(plainAttr: JSX.PlainPropsKeys, streamAttr: JSX.StreamPropsKeys, node: Element, props: JSX.ElementProps) {
  const setAttr = setAttribute(plainAttr)(node)

  mount({
    state$: props[streamAttr] || (props[plainAttr] ? xs.of(props[plainAttr]) : xs.empty()),
    firstMount: setAttr,
    nextMounts: setAttr,
  })
}


function createNode(parent: Element, jsxChild: JSX.Child): () => Element | Text {

  // Stream<JSX.TextElement>

  if (jsxChild instanceof Stream) {
    const vnode$ = jsxChild
    let node: Text
    let prevArr: Array<{ key: JSX.Key, node: Element | Text }>
    mount({
      state$: vnode$,
      firstMount: vnode => {
        if (Array.isArray(vnode)) {
          prevArr = vnode.map(el => ({
            key: el.key,
            node: createNode(parent, el)(),
          }))
          return
        }

        node = document.createTextNode(String(vnode.text))
        parent.appendChild(node)
      },
      nextMounts: vnode => {
        if (Array.isArray(vnode)) {
          prevArr
            .filter(e => !vnode.map(el => el.key).includes(e.key))
            .forEach(e => {
              parent.removeChild(e.node)
            })

          prevArr = vnode.map(el => {
            const exists = prevArr.find(e => e.key === el.key)
            return exists
              ? exists
              : { key: el.key, node: createNode(parent, el)() }
          })
          return
        }

        node.textContent = String(vnode.text)
      },
    })
    return () => node
  }

  // VNodes

  const vnode = jsxChild

  // JSX.TextElement

  if (vnode.type === JSXText) {
    const node = document.createTextNode(String(vnode.text))
    parent.appendChild(node)
    return () => node
  }


  // JSX.Element

  let node: Element
  const { type, props, children } = vnode
  function add() {
    node = document.createElement(type)
    parent.appendChild(node)
    watchAttribute('class', 'class$', node, props)
    watchAttribute('id', 'id$', node, props)
    watchAttribute('type', 'type$', node, props)

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

  return () => node
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

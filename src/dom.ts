import xs, { Stream } from 'xstream'
import fromEvent from 'xstream/extra/fromEvent'
import dropRepeats from 'xstream/extra/dropRepeats'
// import * as _ from 'lodash'

(window as any).xs = xs

const JSXText: JSX.TextElementType = '_text'

function createTextElement(text: string): JSX.TextElement {
  return {
    type: JSXText,
    text,
  }
}

export function h(type: JSX.ElementType, props?: JSX.ElementProps, ...children: Array<JSX.Element | string>): JSX.Element {
  const properties = {
    class: props && props.class,
    if$: props && props.if$,
  }

  return {
    type,
    props: properties,
    children: children.map(
      child => typeof child === 'string'
        ? createTextElement(child)
        : child,
    ),
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
  if (vnode.type === JSXText) {
    const node = document.createTextNode(vnode.text)
    return node
  }

  const node = document.createElement(vnode.type)
  const { props } = vnode

  if (props.class) {
    node.setAttribute('class', props.class)
  }

  const exist$ = props.if$ || xs.of(true)
  mount({
    state$: exist$,
    firstMount(state) {
      if (state) {
        parent.appendChild(node)
      }
    },
    nextMounts(state) {
      if (state) {
        parent.appendChild(node)
      } else {
        node.remove()
      }
    },
  })

  vnode.children.forEach(child => {
    const childNode = createNode(node, child)
    node.appendChild(childNode)
  })
  return node


  // if (element instanceof Stream) {
  //   mount({
  //     state$: element,
  //     firstMount(state) {
  //       element.
  //     },
  //     nextMounts(state) {

  //     },
  //   })
  // }

  // const children = arrify(tree.children)

  // children
  //   .forEach(child => {
  //     if (child instanceof Stream) {
  //       const node = children.length > 1
  //         ? document.createElement('span')
  //         : root
  //       if (children.length > 1) {
  //         root.appendChild(node)
  //       }
  //       child.addListener({
  //         next: str => {
  //           node.innerHTML = str
  //         },
  //         error,
  //       })
  //       return
  //     }

  //     if (typeof child === 'string') {
  //       if (children.length === 1) {
  //         root.innerHTML = child
  //         return
  //       }

  //       const node = document.createElement('span')
  //       node.innerHTML = child
  //       root.appendChild(node)
  //       return
  //     }

  //     const createNode = (vnode: JSX.Element) => {
  //       const node = document.createElement(vnode.type)
  //       if (vnode.className) {
  //         node.className = vnode.className
  //       }
  //       createDOM(node, vnode)
  //       return node
  //     }

  //     const visible$ = child.visible$ || xs.of(true)


  //     visible$
  //       .take(1)
  //       .addListener({
  //         next: state => {
  //           // node does not exits here
  //           if (state) {
  //             child.node = root.appendChild(createNode(child))
  //           }
  //         },
  //         error,
  //       })

  //     visible$
  //       .compose(dropRepeats())
  //       .drop(1)
  //       .addListener({
  //         next: state => {
  //           // last state was equal !state
  //           if (state) {
  //             child.node = root.appendChild(createNode(child))
  //           } else {
  //             child.node!.remove()
  //           }
  //         },
  //         error,
  //       })
  //   })
}

export class DOMSource {
  private root: Element
  private namespace: string[]

  public constructor(root: Element, namespace: string[] = []) {
    this.root = root
    this.namespace = namespace
  }

  public selectEvents(selector: string, eventName: string) {
    return fromEvent(this.root, eventName)
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
        // TODO: use root.replateWith(createNode(tree))
        root.innerHTML = ''
        createNode(root, tree)
      },
      error,
    })

    return new DOMSource(root)
  }
}

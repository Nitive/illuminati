import xs, { Stream } from 'xstream'
import fromEvent from 'xstream/extra/fromEvent'
import dropRepeats from 'xstream/extra/dropRepeats'

(window as any).xs = xs

export type ElementType = 'div' | 'button'

export interface VNode {
  type: ElementType,
  selector: string,
  children: Children,
  node?: Element,
  visible$?: Stream<boolean>,
}

export type Children = string | VNode | Array<string | VNode>

export interface VNodeProps {
  visible$?: Stream<boolean>,
}

export function div(selector: string, props: VNodeProps, children: Children): VNode {
  return {
    type: 'div' as 'div',
    selector,
    children,
    visible$: props.visible$,
  }
}

export function button(selector: string, props: VNodeProps, children: Children): VNode {
  return {
    type: 'button' as 'button',
    selector,
    children,
    visible$: props.visible$,
  }
}

function arrify(children: Children): Array<string | VNode> {
  return Array.isArray(children) ? children : [children]
}

function error(err: Error) {
  console.log(err)
}

// function stringifyTree(tree: string | VNode): string {
//   if (typeof tree === 'string') {
//     return tree
//   }

//   const children = tree.children
//     ? arrify(tree.children)
//       .map(stringifyTree)
//       .join('')
//     : ''

//   return `<${tree.type}${tree.selector.startsWith('.') ? ` class="${tree.selector.slice(1)}"` : ''}>${children}</${tree.type}>`
// }

function createDOM(root: Element, tree: string | VNode): void {
  if (typeof tree === 'string') {
    root.innerHTML = tree
    return
  }

  const children = arrify(tree.children)

  children
    .forEach(child => {
      if (typeof child === 'string') {
        if (children.length === 1) {
          root.innerHTML = child
          return
        }

        const node = document.createElement('span')
        node.innerHTML = child
        root.appendChild(node)
        return
      }

      const createNode = (vnode: VNode) => {
        const node = document.createElement(vnode.type)
        if (vnode.selector.startsWith('.')) {
          node.className = vnode.selector.slice(1)
        }
        createDOM(node, vnode)
        return node
      }

      const visible$ = child.visible$ || xs.of(true)


      visible$
        .take(1)
        .addListener({
          next: state => {
            // node does not exits here
            if (state) {
              root.appendChild(createNode(child))
            }
          },
          error,
        })

      visible$
        .compose(dropRepeats())
        .drop(1)
        .addListener({
          next: state => {
            // last state was equal !state
            if (state) {
              child.node = root.appendChild(createNode(child))
            } else {
              child.node!.remove()
            }
          },
          error,
        })
    })
}

export class TranspositionDOMSource {
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

export function makeTranspositionDOMDriver(selector: string) {
  const root = document.querySelector(selector)
  if (!root) {
    throw new Error(`makeTranspositionDOMDriver(...): Cannot find element with selector \`${selector}\``)
  }

  return function transpositionDOMDriver(tree$: Stream<VNode>) {
    console.log('dom driver')
    tree$.take(1).addListener({
      next: tree => {
        root.innerHTML = ''
        createDOM(root, tree)
      },
      error: err => console.log(err),
    })

    return new TranspositionDOMSource(root)
  }
}

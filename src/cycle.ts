import { Stream } from 'xstream'
import fromEvent from 'xstream/extra/fromEvent'
import { createNode } from './dom'
export { h } from './dom'

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
      error(err) {
        console.error(err)
      },
    })

    return new DOMSource()
  }
}

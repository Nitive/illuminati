import { RecursiveArray, flattenDeep } from 'lodash'
import fromEvent from 'xstream/extra/fromEvent'
import { render } from './dom'

type Falsy = undefined | null | 0 | '' | false

export function cx(...classes: Array<string | Falsy | RecursiveArray<string | Falsy>>): string {
  return flattenDeep(classes).filter(Boolean).join(' ')
}

export function select(selector: string) {
  return {
    events(eventName: string) {
      return fromEvent(document.body, eventName)
        .filter(event => event.target.matches(selector))
    },
  }
}

export function attach(selector: string, vtree: JSX.Element) {
  const root = document.querySelector(selector) as HTMLElement | null

  if (!root) {
    throw new Error(`attach: Cannot find element with selector \`${selector}\``)
  }

  root.innerHTML = ''
  render(vtree, root)
}

import xs from 'xstream'

import { h } from '../../src/cycle'
import { Sources, Sinks } from './'

export function main({ DOM }: Sources): Sinks {
  const visible$ = DOM.selectEvents('.toggle', 'click')
    .fold(visible => !visible, false)

  const vtree = (
    <div>
      <button class='toggle'>toggle</button>
      <div if$={visible$}>content</div>
    </div>
  )

  return {
    DOM: xs.of(vtree),
  }
}

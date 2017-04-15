import xs from 'xstream'

import { h } from '../../src/cycle'
import { cx } from '../../src/helpers'
import { Sources, Sinks } from './'

export function main({ DOM }: Sources): Sinks {
  const buttonClick$ = DOM.selectEvents('.pressme', 'click')

  const containerClass$ = buttonClick$
    .fold(state => !state, false)
    .map(state => cx('container', state && 'highlighted'))

  const vtree = (
    <div class$={containerClass$}>
      <button class='pressme'>Press Me</button>
    </div>
  )

  return {
    DOM: xs.of(vtree),
  }
}

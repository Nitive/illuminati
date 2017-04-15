import xs from 'xstream'

import { h } from '../../src/cycle'
import { Sources, Sinks } from './'

export function main({ DOM }: Sources): Sinks {
  const count$ = xs
    .merge(
      DOM.selectEvents('.inc', 'click').mapTo(+1),
      DOM.selectEvents('.dec', 'click').mapTo(-1),
    )
    .fold((count, x) => count + x, 0)

  const vtree = (
    <div>
      <div>{count$}</div>
      <button class='dec'>-</button>
      <button class='inc'>+</button>
    </div>
  )

  return {
    DOM: xs.of(vtree),
  }
}

import xs, { Stream } from 'xstream'
import { run, Drivers, FantasyObservable } from '@cycle/run'

import { h, makeDOMDriver, DOMSource } from '../../src/cycle'

export interface Sources {
  DOM: DOMSource,
}

export interface Sinks {
  DOM: Stream<JSX.Element>,
  [key: string]: FantasyObservable,
}


const drivers: Drivers<Sources, Sinks> = {
  DOM: makeDOMDriver('#app'),
}

function main({ DOM }: Sources): Sinks {
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

run(main, drivers)

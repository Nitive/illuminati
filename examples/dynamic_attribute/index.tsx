import xs, { Stream } from 'xstream'
import { run, Drivers, FantasyObservable } from '@cycle/run'

import { h, makeDOMDriver, DOMSource } from '../../src/dom'

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
  const buttonClick$ = DOM.selectEvents('.pressme', 'click')

  const containerClass$ = buttonClick$
    .fold(state => !state, false)
    .map(state => state ? 'highlighted' : '')
    .map(className => className + ' container')

  const vtree = (
    <div class$={containerClass$}>
      <button class='pressme'>press me</button>
    </div>
  )

  return {
    DOM: xs.of(vtree),
  }
}

run(main, drivers)

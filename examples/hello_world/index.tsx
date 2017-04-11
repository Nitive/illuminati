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

function main(): Sinks {
  const vtree = <h1>Hello, World!</h1>
  return {
    DOM: xs.of(vtree),
  }
}

run(main, drivers)

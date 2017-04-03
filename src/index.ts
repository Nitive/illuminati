import { Stream } from 'xstream'
import { run, Drivers, FantasyObservable } from '@cycle/run'

import { makeTranspositionDOMDriver, TranspositionDOMSource, VNode } from './dom'
import { App } from './app'

export interface Sources {
  DOM: TranspositionDOMSource,
}

export interface Sinks {
  DOM: Stream<VNode>,
  [key: string]: FantasyObservable,
}


const drivers: Drivers<Sources, Sinks> = {
  DOM: makeTranspositionDOMDriver('#app'),
}

function main(sources: Sources): Sinks {
  return App(sources)
}

run(main, drivers)

import { Stream } from 'xstream'
import { run, Drivers, FantasyObservable } from '@cycle/run'

import { makeDOMDriver, DOMSource } from './dom'
import { App } from './app'

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

function main(sources: Sources): Sinks {
  return App(sources)
}

run(main, drivers)

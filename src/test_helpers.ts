import { createNode } from './dom'
import { DOMSource } from './cycle'

import { FantasyObservable } from '@cycle/run'

import { Stream } from 'xstream'

function wait(time: number = 0) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, time)
  })
}

export async function click(selector: string) {
  (document.querySelector(selector) as HTMLElement).click()
  await wait()
}

function toPromise<T>(stream: Stream<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    stream
      .last()
      .addListener({
        next: resolve,
        error: reject,
      })
  })
}

interface Sinks {
  DOM: DOMSource,
}

interface Sources {
  DOM: Stream<JSX.Element>,
  [key: string]: FantasyObservable,
}

(window as any).requestAnimationFrame = function monkeyPatchedSyncRequestAnimationFrame(cb: () => void) {
  cb()
}

export async function run(main: (sinks: Sinks) => Sources) {
  const sinks = { DOM: new DOMSource() }
  const vtree = await toPromise(main(sinks).DOM)
  const app = document.createElement('div')
  app.setAttribute('id', 'app')
  document.body.appendChild(app)
  createNode(app, vtree)
  await wait()
  return app
}

import { createNode } from './dom'

function wait(time: number = 0) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, time)
  })
}

export async function click(selector: string) {
  (document.querySelector(selector) as HTMLElement).click()
  await wait()
}

(window as any).requestAnimationFrame = function monkeyPatchedSync_requestAnimationFrame(cb: () => void) {
  cb()
}

export async function run(vtree: JSX.Element) {
  const app = document.createElement('div')
  app.setAttribute('id', 'app')
  document.body.appendChild(app)
  createNode(app, vtree)
  await wait()
  return app
}

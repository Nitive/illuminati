import { h, select } from '../../src/'

export function main() {
  const oneVisible$ = select('.one').events('click').fold(visible => !visible, true)
  const twoVisible$ = select('.two').events('click').fold(visible => !visible, true)

  return (
    <div>
      <button class='one'>toggle one</button>
      <button class='two'>toggle two</button>
      <div class='content'>
        <div if$={oneVisible$}>1. one</div>
        <div if$={twoVisible$}>2. two</div>
      </div>
    </div>
  )
}

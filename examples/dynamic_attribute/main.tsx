import { h, cx, click } from '../../src/'

export function main() {
  const buttonClick$ = click('.pressme')

  const containerClass$ = buttonClick$
    .fold(state => !state, false)
    .map(state => cx('container', state && 'highlighted'))

  return (
    <div class$={containerClass$}>
      <button class='pressme'>Press Me</button>
    </div>
  )
}

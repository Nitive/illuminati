import { h, click } from '../../src/'

export function main() {
  const visible$ = click('.toggle').fold(visible => !visible, false)

  return (
    <div>
      <button class='toggle'>toggle</button>
      <div if$={visible$}>content</div>
    </div>
  )
}

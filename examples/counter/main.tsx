import xs from 'xstream'
import { h, click } from '../../src/'

export function main() {
  const count$ = xs
    .merge(
      click('.inc').mapTo(+1),
      click('.dec').mapTo(-1),
    )
    .fold((count, x) => count + x, 0)

  return (
    <div>
      <div>{count$}</div>
      <button class='dec'>-</button>
      <button class='inc'>+</button>
    </div>
  )
}

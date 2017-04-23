import xs, { Stream } from 'xstream'
import { h, click } from '../../src/'
import shuffle = require('lodash/shuffle')
import range = require('lodash/range')
import random = require('lodash/random')

interface Item {
  text: string,
}

const one: Item[] = [
  { text: '1' },
  { text: '2' },
  { text: '3' },
]

const two: Item[] = [
  { text: '2' },
  { text: '3' },
]

function getRandomItems(): Item[] {
  return shuffle(range(1, 6))
    .slice(0, random(2, 5))
    .map(n => ({ text: String(n) }))
}

export function main() {
  const items$ = xs
    .merge(
      click('.b-123').mapTo(one),
      click('.b-32').mapTo(two),
      click('.b-random').map(getRandomItems),
    )
    .startWith(one)

  return (
    <div>
      <button class='b-123'>1, 2, 3</button>
      <button class='b-32'>3, 2</button>
      <button class='b-random'>random (1-5)</button>
      {items$.map(items => items.map(item => item.text).join(', '))}
      <ul>
        <collection items$={items$} trackBy={item => item.text}>
          {(item$: Stream<Item>) => (
            <li>{item$.map(item => item.text)}</li>
          )}
        </collection>
      </ul>
    </div>
  )
}

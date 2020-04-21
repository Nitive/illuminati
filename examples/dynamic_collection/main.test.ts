import { main } from './main'
import { run, click } from '../../src/test_helpers'

describe('dynamic_collection', () => {
  let list: HTMLUListElement

  beforeAll(async() => {
    const app = await run(main())
    list = app.querySelector('ul')!
  })

  it('should render 1, 2, 3 first time', async() => {
    expect(list.innerHTML).toBe('<li>1</li><li>2</li><li>3</li>')
  })

  it('should change to 3, 2 after 32 button click', async() => {
    await click('.b-32')
    expect(list.innerHTML).toBe('<li>3</li><li>2</li>')
  })
})

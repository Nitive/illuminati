import { main } from './main'
import { run, click } from '../../src/test_helpers'

describe('two_elements', () => {
  let content: HTMLDivElement

  it('should render two elements', async() => {
    content = (await run(main)).querySelector('.content') as HTMLDivElement
    expect(content.innerHTML).toBe('<div>1. one</div><div>2. two</div>')
  })

  it('should hide element one after first button.one click', async() => {
    await click('button.one')
    expect(content.innerHTML).toBe('<div>2. two</div>')
  })

  it('should show element one after second button.one click', async() => {
    await click('button.one')
    expect(content.innerHTML).toBe('<div>1. one</div><div>2. two</div>')
  })
})

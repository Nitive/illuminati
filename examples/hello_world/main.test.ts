import { main } from './main'
import { run } from '../../src/test_helpers'

describe('hello_world', () => {
  it('should render Hello, World!', async() => {
    const app = await run(main)
    expect(app.innerHTML).toBe('<h1>Hello, World!</h1>')
  })
})

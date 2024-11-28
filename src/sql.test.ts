import {test, expect} from 'bun:test'
import { toSQL } from './'

test('toSQL', () => {

  const input = `
User {
  id(primary_key auto_increment): int,
  name?: text,
  email(unique): text,
  gender(default:0): int,
}
`
  expect(toSQL(input)).toMatchSnapshot()
})
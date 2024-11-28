import {test, expect} from 'bun:test'
import { parse } from './parser'
import { genSQL } from './sql'

test('parse', () => {

  const input = `
User {
  id(primary_key auto_increment): int,
  name?: text,
  email(unique): text,
  gender(default:0): int,
}
`
  expect(genSQL(parse(input))).toMatchSnapshot()
})
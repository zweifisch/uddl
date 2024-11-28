import {test, expect} from 'bun:test'
import { parse } from './parser'
import { genTS } from './ts'

test('genTs', () => {
  const input = `
User {
  id(primary_key auto_increment): int,
  name?: text,
  email(unique): text,
  gender(default:0): int,
}
`
  expect(genTS(parse(input))).toMatchSnapshot()
})
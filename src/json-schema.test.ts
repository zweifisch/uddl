import {test, expect} from 'bun:test'
import { parse } from './parser'
import { genJSONSchema } from './json-schema'

test('parse', () => {

  const input = `
User {
  id(primary_key auto_increment): int,
  name?: text,
  email(unique): text,
  gender(default:0): int,
}
`
  expect(genJSONSchema(parse(input))).toMatchSnapshot()
})
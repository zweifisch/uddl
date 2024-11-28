import {test, expect} from 'bun:test'
import { parse } from './parser'

function skipRexExp(input: any): any {
  if (Array.isArray(input)) {
    return input.map(skipRexExp)
  }
  if (input instanceof RegExp) {
    return undefined
  }
  if (input !== null && typeof input === 'object') {
    return Object.fromEntries(Object.entries(input).map(([k, v]) => [k, skipRexExp(v)]))
  }
  return input
}

test('parse', () => {

  const input = `
User {
  id(primary_key auto_increment): int,
  name?: text,
  email(unique): text,
  gender(default:0): int,
}
`
  expect(skipRexExp(parse(input))).toMatchSnapshot()
})
import {test, expect} from 'bun:test'
import { toSQL } from './'

test('toSQL', () => {
  const input = `
User {
  id(primary_key auto_increment): int,
  name?: string,
  email(unique): string,
  gender(default:0): int,
}
`
  expect(toSQL(input)).toMatchSnapshot()
})

test('toSQL psql', () => {
  const input = `
User {
  id(primary_key auto_increment): int,
  name?: text,
  email(unique): text,
  gender(default:0): int,
}
`
  expect(toSQL(input, {flavor: 'postgresql'})).toMatchSnapshot()
})

test('toSQL psql2', () => {
  const input = `
User {
  id(primary_key auto_increment): int
  name(maxLength:255)?: text
  email(maxLength:255): text
  gender(default:0 maximum:2): int
}
`
  expect(toSQL(input, {flavor: 'postgresql'})).toMatchSnapshot()
})

test('toSQL unknow attrs', () => {
  const input = `
User {
  email(foo:255): text
}
`
  expect(() => toSQL(input, {flavor: 'postgresql'})).toThrowError(new Error('Unknow attribute: foo at 3,9'))
})

test('toSQL skip attrs', () => {
  const input = `
User {
  email(maxLength:255): string
}
`
  expect(toSQL(input, {flavor: 'sqlite'})).toMatchSnapshot()
})
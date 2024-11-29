import {test, expect} from 'bun:test'
import { toJSONSchema } from './'

test('toJSONSchema', () => {

  const input = `
User {
  id(primary_key auto_increment): int,
  name?: text,
  email(unique maxLength: 255): text,
  gender(default:1 maximum: 2): int,
}
`
  expect(toJSONSchema(input)).toMatchSnapshot()
})
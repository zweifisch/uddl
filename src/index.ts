export {parse} from './parser'
export {gen} from './gen'
export {genSQL} from './sql'
export {genTS} from './ts'
export {genJSONSchema} from './json-schema'

export const toSQL(input: string) => genSQL(parse(input))
export const toTS(input: string) => genTS(parse(input))
export const toJSONSchema(input: string) => genJSONSchema(parse(input))

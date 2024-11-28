export {gen} from './gen'
import {parse} from './parser'
import {genSQL} from './sql'
import {genTS} from './ts'
import {genJSONSchema} from './json-schema'

export {parse, genSQL, genTS, genJSONSchema}

export const toSQL = (input: string) => genSQL(parse(input))
export const toTS = (input: string) => genTS(parse(input))
export const toJSONSchema = (input: string) => genJSONSchema(parse(input))

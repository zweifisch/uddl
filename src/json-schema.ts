import {File, isIdentifier, isNumber} from './parser'

export interface Schema {
  definitions: Record<string, Definition>
}

type Definition = (ObjectSchema | StringSchema | IntegerSchema | BooleanSchema | ArraySchema) & {
  title?: string
  description?: string
}

interface ObjectSchema {
  type: 'object'
  properties: Record<string, Definition>
  required?: Array<string>
  dependentRequired?: Record<string, Array<string>>
  maxProperties?: number
  minProperties?: number
}

interface ArraySchema {
  type: 'array'
  items: Definition
  maxItems?: number
  minItems?: number
}

interface StringSchema {
  type: 'string'
  pattern?: string
  maxLength?: number
  minLength?: number
}

interface IntegerSchema {
  type: 'integer'
  minimum?: number
  maximum?: number
  multipleOf?: number
}

interface BooleanSchema {
  type: 'boolean'
}

const props = {
  string: new Set(['maxLength', 'minLength', 'pattern']),
  integer: new Set(['maximum', 'minimum', 'multipleOf']),
  boolean: new Set(),
}

function toSchema(kind: string, attrs: Array<[key: string, value: string | number | undefined]> | undefined) {
  const alias: Record<string, string> = {
    int: 'integer',
    bool: 'boolean',
    text: 'string',
  }
  const typ = alias[kind.toLowerCase()] || kind.toLowerCase()
  if (typ !== 'string' && typ !== 'integer' && typ !== 'boolean') {
    throw new Error(`Invalid type ${kind}`)
  }
  return attrs ? {
    type: typ,
    ... Object.fromEntries(attrs.filter(([key, val]) => props[typ].has(key))),
  } : {type: typ}
}

export function genJSONSchema(input: File): Schema {
  return {
    definitions: Object.fromEntries(
      input.children.entry.map(entry => [
        entry.children.Identifier[0].image,
        {
          type: 'object',
          required: entry.children.property
            .filter(property => !property.children.Optional)
            .map(property => property.children.Identifier[0].image),
          properties: Object.fromEntries(entry.children.property.map(property => [
            property.children.Identifier[0].image,
            toSchema(
              property.children.Identifier[1].image,
              property.children.attribute?.map(attr => [
                attr.children.Identifier[0].image,
                attr.children.value
                  ? (isIdentifier(attr.children.value[0]) ? attr.children.value[0].children.Identifier[0].image :
                    isNumber(attr.children.value[0]) ? parseFloat(attr.children.value[0].children.Number[0].image) : undefined)
                  : undefined
              ])
            )
          ]))
        }
      ])
    )
  }
}
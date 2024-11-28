import {File, isIdentifier, isNumber} from './parser'

export interface Entry {
  name: string
  properties: Array<Property>
}

interface Property {
  key: string
  value: string
  attributes?: Array<Attribute>
}

interface Attribute {
  key: string
  value?: number | string
}

export function gen(input: File): Array<Entry> {
  return input.children.entry.map(entry => ({
    name: entry.children.Identifier[0].image,
    properties: entry.children.property.map(property => ({
      key: property.children.Identifier[0].image,
      value: property.children.Identifier[1].image,
      attributes: property.children.attribute?.map(attr => ({
        key: attr.children.Identifier[0].image,
        value: attr.children.value
          ? (isIdentifier(attr.children.value[0]) ? attr.children.value[0].children.Identifier[0].image :
            isNumber(attr.children.value[0]) ? parseFloat(attr.children.value[0].children.Number[0].image) : undefined)
          : undefined
      }))
    }))
  }))
}
interface Token {
  image: string,
  startColumn: number,
  startLine: number,
  startOffset: number,
  endColumn: number,
  endLine: number,
  endOffset: number,
  tokenType: {
    name: string
  },
}

interface Node<T> {
  name: string
  children: T
}

type File = Node<{entry: Array<EntryNode>}>
type EntryNode = Node<{Identifier: [Token], property: Array<PropertyNode>}>
type PropertyNode = Node<{Identifier: [Token, Token], attribute?: Array<AttributeNode>}>
type AttributeNode = Node<{Identifier: [Token], value?: [ValueNode]}>
type ValueNode = Node<{Number: Token} | {Identifier: Token}>

interface Entry {
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

function isNumber(value: ValueNode): value is Node<{Number: Token}> {
  return 'Number' in value.children
} 

function isIdentifier(value: ValueNode): value is Node<{Identifier: Token}> {
  return 'Identifier' in value.children
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
          ? (isIdentifier(attr.children.value[0]) ? attr.children.value[0].children.Identifier.image :
            isNumber(attr.children.value[0]) ? parseFloat(attr.children.value[0].children.Number.image) : undefined)
          : undefined
      }))
    }))
  }))
}
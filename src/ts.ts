import {File, isIdentifier, isNumber, AttributeNode} from './parser'

function value(input: string) {
  const alias: Record<string, string> = {
    int: 'number',
    text: 'string',
  }
  return alias[input.toLowerCase()]
}

function init(attributes: Array<AttributeNode> | undefined): string {
  const attr = attributes?.find(attr =>
    attr.children.Identifier[0].image.toLowerCase() === 'default')
  if (!attr?.children.value) {
    return ''
  }
  return isIdentifier(attr.children.value[0]) ? ` = "${attr.children.value[0].children.Identifier[0].image}"` :
    isNumber(attr.children.value[0]) ? ` = ${attr.children.value[0].children.Number[0].image}` : ''
}

export const genTS = (input: File) =>
  input.children.entry.map(entry =>
    `export class ${entry.children.Identifier[0].image} {\n  ${entry.children.property.map(property => `${
        property.children.Identifier[0].image}${property.children.Optional ? '?' : ''}: ${
        value(property.children.Identifier[1].image)}${init(property.children.attribute)}`
      ).join('\n  ')
    }\n}`
  ).join('\n\n')
import {File, isIdentifier, isNumber} from './parser'

function attribute(key: string, val?: string | number): string {
  const alias: Record<string, string> = {
    auto_increment: `AUTOINCREMENT`,
    primary_key: `PRIMARY KEY`,
  }
  if (key === 'default') {
    return `DEFAULT ${val}`
  }
  if (key === 'not') {
    return `NOT ${val}`
  }
  return alias[key] || key.toUpperCase()
}

function value(input: string) {
  const alias: Record<string, string> = {
    int: 'INTEGER',
  }
  return alias[input] || input.toUpperCase()
}

function attributes(attrs: Array<string> | undefined, optional: boolean): string {
  if (!optional && !attrs?.includes('PRIMARY KEY')) {
    attrs = [...attrs || [], 'NOT NULL']
  }
  return attrs?.length ? " " + attrs.join(' ') : ''
}

export const genSQL = (input: File) =>
  input.children.entry.map(entry =>
    `CREATE TABLE ${entry.children.Identifier[0].image.toLowerCase()} (\n  ${entry.children.property.map(property => `${
        property.children.Identifier[0].image} ${
        value(property.children.Identifier[1].image)}${
        attributes(property.children.attribute?.map(attr =>
          attribute(
            attr.children.Identifier[0].image,
            attr.children.value
              ? (isIdentifier(attr.children.value[0]) ? attr.children.value[0].children.Identifier[0].image :
                isNumber(attr.children.value[0]) ? parseFloat(attr.children.value[0].children.Number[0].image) : undefined)
              : undefined)),
          !!property.children.Optional)
        }`
      ).join(',\n  ')
    }\n);`
  ).join('\n\n')
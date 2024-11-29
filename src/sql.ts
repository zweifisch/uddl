import {File, isIdentifier, isNumber} from './parser'

export type Flavor = 'sqlite' | 'postgresql'

const aliases: Record<Flavor, Record<string, string>> = {
  sqlite: {
    primary_key: 'PRIMARY KEY',
    auto_increment: 'AUTOINCREMENT',

    smallint: 'INTEGER',
    integer: 'INTEGER',
    bigint: 'INTEGER',
    real: 'REAL',
    double_precision: 'REAL',
    smallserial: 'AUTOINCREMENT',
    serial: 'AUTOINCREMENT',
    bigserial: 'AUTOINCREMENT',

    character: 'TEXT',
    varchar: 'TEXT',
    text: 'TEXT',
    string: 'TEXT',

    int: 'INTEGER',
    number: 'REAL',
  },

  postgresql: {
    primary_key: 'PRIMARY KEY',

    auto_increment: 'BIGSERIAL',
    double_precision: 'DOUBLE PRECISION',
    int: 'BIGINT',
    integer: 'BIGINT',
    text: 'TEXT',
    string: 'TEXT',
    number: 'DOUBLE PRECISION',

    varchar: 'VARCHAR'
  }
}

function value(input: string, flavor?: Flavor) {
  return aliases[flavor || 'sqlite'][input] || input.toUpperCase()
}

function attributes(
  typ: string,
  attrs: Array<[string, number | string | undefined]> | undefined,
  optional: boolean,
  flavor?: Flavor
): string {
  const kvs = attrs ? Object.fromEntries(
    attrs.map(([k, v]) => [aliases[flavor || 'sqlite'][k] || k, v])) : {}
  if (!optional && !('PRIMARY KEY' in kvs)) {
    attrs = [...attrs || [], ['NOT NULL', undefined]]
  }
  if (!attrs?.length) {
    return typ
  }
  if (flavor !== 'postgresql') {
    return [
      typ,
      ...Object.entries(kvs).flatMap(([k, v]) => v === undefined ? [k] : [k, v])
    ].join(' ')
  }

  if (typ === 'TEXT' && kvs['maxLength']) {
    typ = `VARCHAR(${kvs.maxLength})`
    delete kvs['maxLength']
  }
  if (typ === 'BIGINT' && kvs['maximum']) {
    if (kvs['maximum'] as number < 32768) {
      typ = 'SMALLINT'
    } else if (kvs['maximum'] as number < 2147483648) {
      typ = 'INTEGER'
    }
    delete kvs['maximum']
  }
  return [
    ...['BIGSERIAL', 'SERIAL', 'SMALLSERIAL'].some(x => x in kvs) ? [] : [typ],
    ...Object.entries(kvs).flatMap(([k, v]) => v === undefined ? [k] : [k, v])
  ].join(' ')
}

export const genSQL = (input: File, opts?: {flavor: Flavor}) =>
  input.children.entry.map(entry =>
    `CREATE TABLE "${entry.children.Identifier[0].image.toLowerCase()}" (\n  ${entry.children.property.map(property => `${
        property.children.Identifier[0].image} ${
        attributes(
          value(property.children.Identifier[1].image, opts?.flavor),
          property.children.attribute?.map(attr => [
            attr.children.Identifier[0].image,
            attr.children.value
              ? (isIdentifier(attr.children.value[0]) ? attr.children.value[0].children.Identifier[0].image :
                isNumber(attr.children.value[0]) ? parseFloat(attr.children.value[0].children.Number[0].image) : undefined)
              : undefined]),
          !!property.children.Optional,
          opts?.flavor
        )}`
      ).join(',\n  ')
    }\n);`
  ).join('\n\n')
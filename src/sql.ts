import {File, isIdentifier, isNumber, ValueNode, Token} from './parser'

export type Flavor = 'sqlite' | 'postgresql'

const aliases: Record<Flavor, Record<string, string>> = {
  sqlite: {
    primary_key: 'PRIMARY KEY',
    auto_increment: 'AUTOINCREMENT',
    unique: 'UNIQUE',
    default: 'DEFAULT',

    maxLength: 'maxLength',
    minLength: 'minLength',
    maximum: 'maximum',
    minimum: 'minimum',

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

    datetime: 'DATETIME',
    current_timestamp: 'CURRENT_TIMESTAMP'
  },

  postgresql: {
    primary_key: 'PRIMARY KEY',
    unique: 'UNIQUE',
    default: 'DEFAULT',

    maxLength: 'maxLength',
    minLength: 'minLength',
    maximum: 'maximum',
    minimum: 'minimum',

    auto_increment: 'BIGSERIAL',
    double_precision: 'DOUBLE PRECISION',
    int: 'BIGINT',
    integer: 'BIGINT',
    text: 'TEXT',
    string: 'TEXT',
    number: 'DOUBLE PRECISION',

    varchar: 'VARCHAR',

    date: 'DATE',
    time: 'TIME',
    tiemstamp: 'TIMESTAMP',
    interval: 'INTERVAL',
    current_timestamp: 'CURRENT_TIMESTAMP'
  }
}

type AttrMap = Record<string, string | undefined>
type Handler = (key: string, typ: string, attrs: AttrMap) => [string, AttrMap] 

const omit: Handler = (key, typ, attrs) => {
  const {[key]: _, ...rest} = attrs
  return [typ, rest]
}

const attrHandler: Record<Flavor, Record<string, Handler>> = {
  sqlite: {
    maxLength: omit,
    minLength: omit,
    maximum: omit,
    minimum: omit,
  },
  postgresql: {
    maxLength(_, typ, attrs) {
      const {maxLength, ...rest} = attrs
      return [`VARCHAR(${maxLength})`, rest]
    },
    maximum(_, typ, attrs) {
      const {maximum, ...rest} = attrs
      if (typ === 'BIGINT' && maximum) {
        if (parseFloat(maximum) < 32768) {
          typ = 'SMALLINT'
        } else if (parseFloat(maximum) < 2147483648) {
          typ = 'INTEGER'
        }
      }
      return [typ, rest]
    },
    minLength: omit,
    minimum: omit,
    BIGSERIAL: (_, _typ, attrs) => ['', attrs],
    SERIAL: (_, _typ, attrs) => ['', attrs],
    SMALLSERIAL: (_, _typ, attrs) => ['', attrs],
  }
}

function value(input: string, flavor?: Flavor) {
  return aliases[flavor || 'sqlite'][input] || input.toUpperCase()
}

function attributes(
  typ: string,
  attrs: Array<[key: Token, val: Token | undefined]> | undefined,
  optional: boolean,
  flavor?: Flavor
): string {
  if (!attrs) {
    return optional ? typ : `${typ} NOT NULL`
  }

  flavor = flavor || 'sqlite'

  let kvs = Object.fromEntries(attrs.map(([k, v]) => {
    const name = aliases[flavor][k.image]
    if (!name) {
      const error = new Error(`Unknow attribute: ${k.image} at ${k.startLine},${k.startColumn}`)
      console.log(error.stack)
      throw error
    }
    return [name, v?.image]
  }))

  for (const name of Object.keys(kvs)) {
    if (attrHandler[flavor][name]) {
      [typ, kvs] = attrHandler[flavor][name](name, typ, kvs)
    }
  }

  return [
    typ,
    !optional && !('PRIMARY KEY' in kvs) && 'NOT NULL',
    ...Object.entries(kvs).flatMap(([k, v]) => v === undefined ? [k] : [k, v])
  ].filter(Boolean).join(' ')
}

function getValue(node: ValueNode | undefined): Token | undefined {
  if (!node) {
    return undefined
  }
  return isIdentifier(node) ? node.children.Identifier[0] : isNumber(node) ? node.children.Number[0] : undefined
}

export const genSQL = (input: File, opts?: {flavor: Flavor}) =>
  input.children.entry.map(entry =>
    `CREATE TABLE "${entry.children.Identifier[0].image.toLowerCase()}" (\n  ${entry.children.property.map(property => `${
        property.children.Identifier[0].image} ${
        attributes(
          value(property.children.Identifier[1].image, opts?.flavor),
          property.children.attribute?.map(attr => [
            attr.children.Identifier[0],
            getValue(attr.children.value?.[0])]),
          !!property.children.Optional,
          opts?.flavor
        )}`
      ).join(',\n  ')
    }\n);`
  ).join('\n\n')
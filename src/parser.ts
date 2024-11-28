import { createToken, Lexer, CstParser  } from "chevrotain"

const LCurly = createToken({ name: "LCurly", pattern: /{/ })
const RCurly = createToken({ name: "RCurly", pattern: /}/ })
const LBrace = createToken({ name: "LBrace", pattern: /\(/ })
const RBrace = createToken({ name: "RBrace", pattern: /\)/ })
const Optional = createToken({ name: "Optional", pattern: /\?/ })
const Colon = createToken({ name: "Colon", pattern: /:/ })
const Comma = createToken({ name: "Comma", pattern: /,/ })
const Identifier = createToken({ name: "Identifier", pattern: /[a-zA-Z_][a-zA-Z0-9_]*/ })
const Number = createToken({ name: "Number", pattern: /\d+/ })
const LineBreak = createToken({ name: "LineBreak", pattern: /[\r\n]+/, group: Lexer.SKIPPED })
const WhiteSpace = createToken({ name: "WhiteSpace", pattern: /\s+/, group: Lexer.SKIPPED });

const allTokens = [ LineBreak, WhiteSpace, LCurly, RCurly, LBrace, RBrace, Optional, Colon, Comma, Identifier, Number ]


class SchemaParser extends CstParser {
  constructor() {
    super(allTokens)

    this.RULE("file", () => {
      this.MANY(() => this.SUBRULE((this as any).entry))
    })

    this.RULE("entry", () => {
      this.CONSUME(Identifier)
      this.CONSUME(LCurly)
      this.OPTION(() => this.MANY(() => this.SUBRULE((this as any).property)))
      this.CONSUME(RCurly)
    })

    this.RULE("property", () => {
      this.CONSUME(Identifier)
      this.OPTION(() => {
        this.CONSUME(LBrace)
        this.OPTION2(() => this.MANY(() => this.SUBRULE((this as any).attribute)))
        this.CONSUME(RBrace)
      })
      this.OPTION3(() => this.CONSUME(Optional))
      this.CONSUME(Colon)
      this.CONSUME2(Identifier)
      this.OPTION4(() => this.CONSUME(Comma))
    })

    this.RULE("attribute", () => {
      this.CONSUME(Identifier)
      this.OPTION(() => {
        this.CONSUME(Colon)
        this.SUBRULE((this as any).value)
      })
    })

    this.RULE("value", () => {
      this.OR([
        { ALT: () => this.CONSUME(Number) },
        { ALT: () => this.CONSUME(Identifier) },
      ])
    })

    this.performSelfAnalysis()
  }
}

const lexer = new Lexer(allTokens)
const parser = new SchemaParser()

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

export type File = Node<{entry: Array<EntryNode>}>
type EntryNode = Node<{Identifier: [Token], property: Array<PropertyNode>}>
type PropertyNode = Node<{
  Identifier: [Token, Token],
  attribute?: Array<AttributeNode>,
  Optional?: Array<Token>}
>
type AttributeNode = Node<{Identifier: [Token], value?: [ValueNode]}>
type ValueNode = Node<{Number: [Token]} | {Identifier: [Token]}>


export function parse(input: string): File {
  const {errors, tokens} = lexer.tokenize(input)

  if (errors.length > 0) {
    throw errors
  }

  parser.input = tokens
  const result = (parser as any).file()

  if (parser.errors.length > 0) {
    throw parser.errors[0]
  }

  return result
}

export function formatError(input: string, error: any) {
  if (typeof Array.isArray(error)) {
    return error.map((x: { message: string, line: number, column: number }) =>
      (x.line > 2 ? input.split("\n")[x.line - 2] + "\n" : '') +
      input.split('\n')[x.line - 1] + "\n"
      + " ".repeat(x.column - 1) + "^ "
      + x.message
    ).join("\n")
  }
  if (error.token) {
    const { message, token: { startLine, startColumn } } = error as { message: string, token: { startLine: number, startColumn: number } }
    return [
      startLine > 2 && input.split("\n")[startLine - 2],
      input.split("\n")[startLine - 1],
      " ".repeat(startColumn - 1) + "^ ",
      `${message} at ${startLine},${startColumn}`,
    ].filter(x => x).join('\n')
  }
  return error
}

export function isNumber(value: ValueNode): value is Node<{Number: [Token]}> {
  return 'Number' in value.children
} 

export function isIdentifier(value: ValueNode): value is Node<{Identifier: [Token]}> {
  return 'Identifier' in value.children
} 

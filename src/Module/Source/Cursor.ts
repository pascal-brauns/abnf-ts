import * as Type from './Type';
import Token from './Token';

export default class Cursor {
  private index = 0;
  public readonly tokens: Token[];
  public readonly input: string;

  static of(input: string) {
    const tokens: Token[] = [];
    let index = 0;

    while (index < input.length) {
      const text = input.slice(index);
      const token = new Token(text, index);
      tokens.push(token);
      index += token.length;
    }

    return new Cursor({ tokens, input });
  }

  constructor(init: Pick<Cursor, 'tokens' | 'input'>) {
    this.tokens = init.tokens;
    this.input = init.input;
  }

  open() {
    return this.index < this.tokens.length;
  }

  skip(types: Type.Key[]) {
    while (true) {
      const [token] = this.take();
      const key = token?.key;

      if (!key || !types.includes(key)) {
        break;
      }

      this.index++;
      continue;
    };
  }

  consume(type: Type.Key) {
    const [token] = this.take();
    
    if (token?.key !== type) {
      throw new SyntaxError(`Expected ${type} at position ${this.index}, got ${token?.key}`);
    }

    const start = token.index;
    const end = token.index + token.length;
    const text = this.input.substring(start, end);

    this.index++;
    return text;
  }

  take(amount = 1, { skip = [] }: { skip?: Type.Key[] } = {}) {
    const tokens: Token[] = [];

    let i = 0;
    while (tokens.length !== amount) {
      const token = this.tokens.at(this.index + i++) ?? null;

      if (token === null) {
        break;
      }

      if (skip.includes(token.key)) {
        continue;
      }

      tokens.push(token);
    }

    return tokens;
  }
};
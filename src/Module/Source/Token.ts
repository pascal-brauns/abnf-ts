import * as Type from './Type';
import * as Pattern from './Pattern';

export default class Token {
  public readonly key: Type.Key;
  public readonly index: number;
  public readonly length: number;

  private static match(text: string) {
    for (const key of Pattern.keys) {
      const regex = Pattern.map[key];
      const match = text.match(regex);
      if (match) {
        const value = match[0];
        return { key, value };
      }
    }

    return null;
  }

  constructor(text: string, index: number) {
    const match = Token.match(text);

    if (match === null) {
      throw new SyntaxError(`Cannot parse token at index ${index}`);
    }

    this.key = match.key as Type.Key;
    this.index = index;
    this.length = match.value.length;
  }
};
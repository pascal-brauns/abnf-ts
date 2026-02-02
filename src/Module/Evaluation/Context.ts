import { Rule } from "./Type";

export default class Context {
  constructor(
    public readonly input: string,
    public readonly rules: Record<string, Rule>,
  ) { }

  peek(index: number, length: number) {
    const start = index;
    const end = index + length;
    return this.input.substring(start, end);
  }
};
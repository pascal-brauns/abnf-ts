export default class Path<T extends string = string> {
  stack: T[];

  constructor(...stack: T[]) {
    this.stack = stack;
  }

  get tail() {
    return this.stack.at(-1) ?? null;
  }

  fork(name: T) {
    return new Path(...this.stack, name);
  }

  match(path: Path<T>) {
    return (
      this.stack.length === path.stack.length &&
      this.toString() === path.toString()
    );
  }

  toString() {
    return this.stack.map(segment => segment.toUpperCase()).join('=>');
  }
}
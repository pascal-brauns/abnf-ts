import Context from "./Context";
import Path from "./Path";

type State<T extends string = string> = {
  readonly context: Context;
  readonly path: Path<T>;
  readonly index: number;
  readonly depth: number;
  readonly nameMap: Map<number, Set<string>>;
}

export default class Cursor<T extends string = string> {
  static init(name: string, context: Context) {
    const path = new Path(name);
    const index = 0;
    const depth = 0;
    const nameMap = new Map<number, Set<string>>();
    return new Cursor({ context, index, depth, path, nameMap });
  }

  constructor(public readonly state: State<T>) { }

  clone(state: Partial<State<T>>) {
    return new Cursor({ ...this.state, ...state });
  }

  at(index: number) {
    return this.clone({ index });
  }

  label(name: T) {
    const depth = this.state.depth + 1;
    const path = this.state.path.fork(name);

    const { index } = this.state;
    const value = new Set<string>([...this.state.nameMap.get(index) ?? new Set<string>(), name]);

    const nameMap = new Map<number, Set<string>>([...this.state.nameMap]);
    nameMap.set(index, value);

    return this.clone({ depth, path, nameMap });
  }

  peek(length: number) {
    return this.state.context.peek(this.state.index, length);
  }
};
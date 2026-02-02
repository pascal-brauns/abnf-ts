import Node from "./Node";
import Path from "./Path";
import { Component, Input } from "./Type";

export default class Query<T extends string> {
  public readonly type: Component | null;
  public readonly path: Path<T> | null;
  public readonly name: T | null;

  constructor(input: Input<T>) {
    this.type = input.type ? Component[input.type] : null;
    this.path = input.path ? new Path(...input.path) : null;
    this.name = typeof input.name === 'string' ? input.name : null;
  }

  match(node: Node) {
    return (
      (!this.type || node.expression === this.type) &&
      (!this.path || node.cursor.state.path.match(this.path)) &&
      (!this.name || node.cursor.state.path.tail === this.name.toUpperCase())
    );
  }
}
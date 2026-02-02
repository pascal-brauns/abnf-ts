import Node from "./Node";
import Query from './Query';
import { Input } from './Type';

export default class Graph<T extends string = string> {
  constructor(public readonly root: Node) { }

  filter(input: Input<T>, nodes = [this.root], query = new Query(input)): Node[] {
    const matches: Node[] = [];
    for (const node of nodes) {
      if (query.match(node)) {
        matches.push(node);
      }
      const children = this.filter(input, node.children, query);
      matches.push(...children);
    }

    return matches;
  }

  find(input: Input<T>): Node | null {
    const nodes = this.filter(input);
    return nodes?.at(0) ?? null;
  }
}
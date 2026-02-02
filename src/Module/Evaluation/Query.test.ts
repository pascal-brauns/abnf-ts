import Query from "./Query";
import Node from './Node';
import Cursor from './Cursor';
import { Component } from './Type';
import Path from "./Path";
import Context from "./Context";

describe('Evaluation.Query.match()', () => {
  it('should match a node whose cursor path equals the path of the query', () => {
    const query = new Query({ path: ['A', 'B', 'C'] });
    const node = new Node({
      expression: Component.REF,
      children: [],
      cursor: new Cursor({
        path: new Path('A', 'B', 'C'),
        depth: 1,
        index: 0,
        nameMap: new Map<number, Set<string>>(),
        context: new Context('BAR', {}),
      }),
      data: Node.success(3),
    });

    const match = query.match(node);
    expect(match).toBe(true);
  });

  it('should not match a node whose cursor path does not equal the path of the query', () => {
    const query = new Query({ path: ['A', 'B', 'C', 'D'] });
    const node = new Node({
      expression: Component.REF,
      children: [],
      cursor: new Cursor({
        path: new Path('A', 'B', 'C'),
        depth: 1,
        index: 0,
        nameMap: new Map<number, Set<string>>(),
        context: new Context('BAR', {}),
      }),
      data: Node.success(3),
    });

    const match = query.match(node);
    expect(match).toBe(false);
  });

  it('should match a node whose cursor path ends with the name specified in the query', () => {
    const query = new Query({ name: 'C' });
    const node = new Node({
      expression: Component.REF,
      children: [],
      cursor: new Cursor({
        path: new Path('A', 'B', 'C'),
        depth: 1,
        index: 0,
        nameMap: new Map<number, Set<string>>(),
        context: new Context('BAR', {}),
      }),
      data: Node.success(3),
    });

    const match = query.match(node);
    expect(match).toBe(true);
  });

  it('should not match a node whose cursor path does not end with the name specified in the query', () => {
    const query = new Query({ name: 'C' });
    const node = new Node({
      expression: Component.REF,
      children: [],
      cursor: new Cursor({
        path: new Path('A', 'B', 'C', 'D'),
        depth: 1,
        index: 0,
        nameMap: new Map<number, Set<string>>(),
        context: new Context('BAR', {}),
      }),
      data: Node.success(3),
    });

    const match = query.match(node);
    expect(match).toBe(false);
  });

  it('should match a node whose expression type equals the type specified in the query', () => {
    const query = new Query({ type: 'REF' });
    const node = new Node({
      expression: Component.REF,
      children: [],
      cursor: new Cursor({
        path: new Path(),
        depth: 1,
        index: 0,
        nameMap: new Map<number, Set<string>>(),
        context: new Context('BAR', {}),
      }),
      data: Node.success(3),
    });

    const match = query.match(node);
    expect(match).toBe(true);
  });

  it('should not match a node whose expression type does not equal the type specified in the query', () => {
    const query = new Query({ type: 'REF' });
    const node = new Node({
      expression: Component.PROSE,
      children: [],
      cursor: new Cursor({
        path: new Path(),
        depth: 1,
        index: 0,
        nameMap: new Map<number, Set<string>>(),
        context: new Context('BAR', {}),
      }),
      data: Node.success(3),
    });

    const match = query.match(node);
    expect(match).toBe(false);
  });
});
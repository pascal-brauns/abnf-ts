import Context from './Context';
import Cursor from './Cursor';
import Node from './Node';
import Path from './Path';
import { Component, Reason } from './Type';

describe('Evaluation.Node.text()', () => {
  it('should return the text of success length at the cursor position', () => {
    const node = new Node({
      children: [],
      cursor: new Cursor({
        context: new Context('BAR baz', {}),
        depth: 1,
        index: 0,
        path: new Path('FOO'),
        nameMap: new Map<number, Set<string>>(),
      }),
      expression: Component.REF,
      data: Node.success(3)
    });

    const text = node.text();
    expect(text).toBe('BAR')
  });

  it('should return null when accessing the text of a failure node', () => {
    const node = new Node({
      children: [],
      cursor: new Cursor({
        context: new Context('BAR', {}),
        depth: 1,
        index: 0,
        path: new Path('FOO'),
        nameMap: new Map<number, Set<string>>(),
      }),
      expression: Component.REF,
      data: Node.failure(Reason.MOCK_FAILURE)
    });

    const text = node.text();
    expect(text).toBe(null)
  });
});
import Path from "./Path";

describe('Evaluation.Path.tail', () => {
  test('should return null for empty stacks', () => {
    const path = new Path();
    expect(path.tail).toBe(null);
  });

  test('should return the last element of the stack', () => {
    const path = new Path('a', 'b', 'c');
    expect(path.tail).toBe('c')
  });
});

describe('Evaluation.Path.fork()', () => {
  test('should return a new path with an additional segment', () => {
    const original = new Path();
    const next = original.fork('a');
    expect(next.stack).toStrictEqual(['a']);
  });
});

describe('Evaluation.Path.match()', () => {
  test('should return true for another path with an equivalent stack in the same casing', () => {
    const path = new Path('a');
    const match = path.match(new Path('a'));
    expect(match).toBe(true);
  });

  test('should return true for another path with an equivalent stack in different casing', () => {
    const path = new Path<'a' | 'A'>('a');
    const match = path.match(new Path('A'));
    expect(match).toBe(true);
  });

  test('should return false for another path with non-equivalent stack', () => {
    const path = new Path<'a' | 'b'>('a');
    const match = path.match(new Path('b'));
    expect(match).toBe(false);
  })
})
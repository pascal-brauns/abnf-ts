import * as Evaluation from '@/Evaluation';
import * as Source from '@/Source';
import * as Mock from './Mock';
import Literal from './Literal';

describe('Literal.binval()', () => {
  test('parses a binary representation of a single character', () => {
    const literal = Literal.binval({
      cursor: new Source.Cursor({
        tokens: [{ index: 0, key: 'BINLIT', length: 9 }],
        input: '%b1000001'
      }),
      parse: () => fail('Literal.binval() should never call context.parse()'),
    });

    expect(literal.charsets).toEqual([new Set('A')]);
  });

  test('parses a binary representation of a character sequence', () => {
    const literal = Literal.binval({
      cursor: new Source.Cursor({
        tokens: [{ index: 0, key: 'BINLIT', length: 17 }],
        input: '%b1000001.1000010'
      }),
      parse: () => fail('Literal.binval() should never call context.parse()'),
    });

    expect(literal.charsets).toEqual([new Set('A'), new Set('B')]);
  });

  test('parses a binary representation of a range of characters', () => {
    const literal = Literal.binval({
      cursor: new Source.Cursor({
        tokens: [{ index: 0, key: 'BINLIT', length: 17 }],
        input: '%b1000001-1000011',
      }),
      parse: () => fail('Literal.binval() should never call context.parse()'),
    });

    expect(literal.charsets).toEqual([new Set(['A', 'B', 'C'])]);
  });

  test('parses a binary representation of a sequence of ranges of characters', () => {
    const literal = Literal.binval({
      cursor: new Source.Cursor({
        tokens: [{ index: 0, key: 'BINLIT', length: 33 }],
        input: '%b1000001-1000011.1011000-1011010',
      }),
      parse: () => fail('Literal.binval() should never call context.parse()'),
    });

    expect(literal.charsets).toEqual([new Set(['A', 'B', 'C']), new Set(['X', 'Y', 'Z'])]);
  });

  test('throws a RangeError when a numval out of range was provided', () => {
    const execute = () => Literal.binval({
      cursor: new Source.Cursor({
        tokens: [{ index: 0, key: 'BINLIT', length: 11 }],
        input: '%b111111111'
      }),
      parse: () => fail(),
    });

    expect(execute).toThrow(RangeError);
  })
});

describe('Literal.decval()', () => {
  test('parses a decimal representation of a single character', () => {
    const literal = Literal.decval({
      cursor: new Source.Cursor({
        tokens: [{ index: 0, key: 'DECLIT', length: 4 }],
        input: '%d65'
      }),
      parse: () => fail('Literal.decval() should never call context.parse()'),
    });

    expect(literal.charsets).toEqual([new Set('A')]);
  });
});

describe('Literal.hexval()', () => {
  test('parses a hexadecimal representation of a single character', () => {
    const literal = Literal.hexval({
      cursor: new Source.Cursor({
        tokens: [{ index: 0, key: 'HEXLIT', length: 4 }],
        input: '%x41'
      }),
      parse: () => fail('Literal.hexval() should never call context.parse()'),
    });

    expect(literal.charsets).toEqual([new Set('A')]);
  });
});

describe('Literal.string()', () => {
  test('parses a case insensitive string literal', () => {
    const literal = Literal.string({
      cursor: new Source.Cursor({
        tokens: [{ index: 0, key: 'STRING', length: 5 }],
        input: '"Abc"'
      }),
      parse: () => fail('Literal.string() should never call context.parse()'),
    });

    expect(literal.charsets).toEqual([
      new Set(['A', 'a']),
      new Set(['B', 'b']),
      new Set(['C', 'c']),
    ]);
  });
});

describe('Literal.istring()', () => {
  test('parses a case insensitive string literal', () => {
    const literal = Literal.istring({
      cursor: new Source.Cursor({
        tokens: [{ index: 0, key: 'ISTRING', length: 7 }],
        input: '%i"Abc"'
      }),
      parse: () => fail('Literal.istring() should never call context.parse()'),
    });

    expect(literal.charsets).toEqual([
      new Set(['A', 'a']),
      new Set(['B', 'b']),
      new Set(['C', 'c']),
    ]);
  });
});

describe('Literal.sstring()', () => {
  test('parses a case sensitive string literal', () => {
    const literal = Literal.sstring({
      cursor: new Source.Cursor({
        tokens: [{ index: 0, key: 'SSTRING', length: 7 }],
        input: '%s"Abc"'
      }),
      parse: () => fail('Literal.sstring() should never call context.parse()'),
    });

    expect(literal.charsets).toEqual([
      new Set(['A']),
      new Set(['b']),
      new Set(['c']),
    ]);
  });
});

describe('Literal.evaluate()', () => {
  test('succeeds when literal has length of 0', () => {
    const literal = Literal.of('');
    const context = new Evaluation.Context('abc', {});
    const cursor = Mock.cursor(context).at(0);
    const evaluation = literal.evaluate(cursor);
    if (evaluation.data.type === Evaluation.Type.Result.SUCCESS) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.LITERAL);
      expect(evaluation.cursor.state.index).toBe(0);
      expect(evaluation.data.length).toBe(0);
      expect(evaluation.children).toEqual([]);
    }
  });

  test('fails when input is shorter than literal', () => {
    const literal = Literal.of('abbd');
    const context = new Evaluation.Context('abc', {});
    const cursor = Mock.cursor(context).at(0);
    const evaluation = literal.evaluate(cursor);
    if (evaluation.data.type === Evaluation.Type.Result.FAILURE) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.LITERAL);
      expect(evaluation.cursor.state.index).toBe(0);
      expect(evaluation.data.reason).toBe(Evaluation.Type.Reason.LITERAL_CHARSET_MISMATCH);
      expect(evaluation.children).toEqual([]);
    }
  });

  test('succeeds when input starts with literal as prefix', () => {
    const literal = Literal.of('abc');
    const context = new Evaluation.Context('abcdef', {});
    const cursor = Mock.cursor(context).at(0);
    const evaluation = literal.evaluate(cursor);
    if (evaluation.data.type === Evaluation.Type.Result.SUCCESS) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.LITERAL);
      expect(evaluation.cursor.state.index).toBe(0);
      expect(evaluation.data.length).toBe(3);
      expect(evaluation.children).toEqual([]);
    }
  });

  test('succeeds when input exactly equals literal', () => {
    const literal = Literal.of('abc');
    const context = new Evaluation.Context('abc', {});
    const cursor = Mock.cursor(context).at(0);
    const evaluation = literal.evaluate(cursor);
    if (evaluation.data.type === Evaluation.Type.Result.SUCCESS) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.LITERAL);
      expect(evaluation.cursor.state.index).toBe(0);
      expect(evaluation.data.length).toBe(3);
      expect(evaluation.children).toEqual([]);
    }
  });

  test('fails when the first character does not match', () => {
    const literal = Literal.of('abc');
    const context = new Evaluation.Context('xbc', {});
    const cursor = Mock.cursor(context).at(0);
    const evaluation = literal.evaluate(cursor);
    if (evaluation.data.type === Evaluation.Type.Result.FAILURE) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.LITERAL);
      expect(evaluation.cursor.state.index).toBe(0);
      expect(evaluation.data.reason).toBe(Evaluation.Type.Reason.LITERAL_CHARSET_MISMATCH);
      expect(evaluation.children).toEqual([]);
    }
  });

  test('succeeds when the input equals the literal at a non-zero index', () => {
    const literal = Literal.of('def')
    const context = new Evaluation.Context('abcdef', {});
    const cursor = Mock.cursor(context).at(3);
    const evaluation = literal.evaluate(cursor);
    if (evaluation.data.type === Evaluation.Type.Result.SUCCESS) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.LITERAL);
      expect(evaluation.cursor.state.index).toBe(3);
      expect(evaluation.data.length).toBe(3);
      expect(evaluation.children).toEqual([]);
    }
  });

  test('fails at non-zero index when remaining input does not match', () => {
    const literal = Literal.of('def');
    const context = new Evaluation.Context('abcxyz', {});
    const cursor = Mock.cursor(context).at(3);
    const evaluation = literal.evaluate(cursor);
    if (evaluation.data.type === Evaluation.Type.Result.FAILURE) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.LITERAL);
      expect(evaluation.cursor.state.index).toBe(3);
      expect(evaluation.data.reason).toBe(Evaluation.Type.Reason.LITERAL_CHARSET_MISMATCH);
      expect(evaluation.children).toEqual([]);
    }
  });
});

describe('Literal.flat()', () => {
  test('returns the literal itself', () => {
    const literal = new Literal([]);
    const result = literal.flat();
    expect(result).toBe(literal);
  });
});
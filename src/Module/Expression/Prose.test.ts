import * as Evaluation from '@/Evaluation';
import * as Source from '@/Source';
import * as Mock from './Mock';
import Prose from './Prose';

describe('Prose.parse()', () => {
  test('parses the prose text successfully', () => {
    const prose = Prose.parse({
      cursor: new Source.Cursor({
        tokens: [{ index: 0, key: 'PROSE', length: 12, }],
        input: '<prose text>',
      }),
      parse: () => fail('Prose.parse() should never call context.parse()'),
    });

    expect(prose.text).toBe('prose text');
  })
});

describe('Prose.evaluate()', () => {
  test('fails always because it is not evaluable', () => {
    const option = new Prose('prose');
    const context = new Evaluation.Context('abcdef', {});
    const cursor = Mock.cursor(context).at(0);
    const evaluation = option.evaluate(cursor);
    if (evaluation.data.type === Evaluation.Type.Result.FAILURE) {
      expect(evaluation.expression).toBe(Evaluation.Type.Component.PROSE);
      expect(evaluation.cursor.state.index).toBe(0);
      expect(evaluation.data.reason).toBe(Evaluation.Type.Reason.PROSE_NOT_EVALUABLE);
      expect(evaluation.children).toEqual([]);
    }
  });
});

describe('Prose.flat()', () => {
  test('returns the prose itself', () => {
    const prose = new Prose('text');
    const result = prose.flat();
    expect(result).toBe(prose);
  });
});
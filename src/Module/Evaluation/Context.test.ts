import Context from "./Context";

describe('Evaluation.Context.peek()', () => {
  test('returns substring at the specified position and length', () => {
    const context = new Context('ABCDEF', {});
    const text = context.peek(1, 2);
    expect(text).toBe('BC');
  });
});
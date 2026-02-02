import Token from './Token';

describe('Source.Token', () => {
  test('successfully parses token that is registered in Pattern.map', () => {
    const token = new Token('=', 0);
    expect(token.index).toBe(0);
    expect(token.key).toBe('EQUAL');
    expect(token.length).toBe(1);
  });
})
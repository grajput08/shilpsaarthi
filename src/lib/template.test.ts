import { describe, it, expect } from 'vitest';
import { renderTemplate } from './template';

describe('renderTemplate', () => {
  it('substitutes provided variables', () => {
    expect(
      renderTemplate('Namaste {{name}}, visit at {{village}}.', { name: 'Sukhram', village: 'Karanjia' }),
    ).toBe('Namaste Sukhram, visit at Karanjia.');
  });
  it('leaves unknown placeholders intact', () => {
    expect(renderTemplate('Hi {{name}} {{missing}}', { name: 'A' })).toBe('Hi A {{missing}}');
  });
  it('handles whitespace inside braces', () => {
    expect(renderTemplate('{{ name }}', { name: 'X' })).toBe('X');
  });
});

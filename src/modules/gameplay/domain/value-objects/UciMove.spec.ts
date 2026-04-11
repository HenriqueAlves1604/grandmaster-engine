import { describe, expect, it } from 'vitest';
import { UciMove } from './UciMove.js';

describe('UciMove Value Object', () => {
  it('should create a valid UCI move for standard moves', () => {
    const move = UciMove.create('e2e4');
    expect(move.getValue()).toBe('e2e4');
    expect(move.getFrom()).toBe('e2');
    expect(move.getTo()).toBe('e4');
    expect(move.getPromotion()).toBeUndefined();
  });

  it('should create a valid UCI move for promotions', () => {
    const move = UciMove.create('e7e8q');
    expect(move.getValue()).toBe('e7e8q');
    expect(move.getPromotion()).toBe('q');
  });

  it('should format to lowercase automatically', () => {
    const move = UciMove.create('E2E4');
    expect(move.getValue()).toBe('e2e4');
  });

  it('should throw an error for invalid SAN inputs', () => {
    expect(() => UciMove.create('Nf3')).toThrow('Invalid UCI move format');
    expect(() => UciMove.create('O-O')).toThrow('Invalid UCI move format');
  });

  it('should throw an error for malformed strings or injections', () => {
    expect(() => UciMove.create('e2e9')).toThrow('Invalid UCI move format');
    expect(() => UciMove.create('DROP TABLE')).toThrow('Invalid UCI move format');
  });
});

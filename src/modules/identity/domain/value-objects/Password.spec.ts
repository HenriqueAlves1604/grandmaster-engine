import { describe, it, expect } from 'vitest';
import { Password } from './Password.js';
import { ValidationError } from '@shared/errors/ValidationError.js';

describe('Password Value Object', () => {
  it('should create a valid password', () => {
    const password = Password.create('StrongPass123');
    expect(password.getValue()).toBe('StrongPass123');
  });

  it('should throw ValidationError if password is too short', () => {
    expect(() => Password.create('Short1')).toThrow(ValidationError);
    expect(() => Password.create('Short1')).toThrow('Password must be at least 8 characters long.');
  });

  it('should throw ValidationError if password lacks a number', () => {
    expect(() => Password.create('NoNumberHere')).toThrow(ValidationError);
  });
});

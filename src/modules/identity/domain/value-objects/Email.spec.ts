import { describe, it, expect } from 'vitest';
import { Email } from './Email.js';
import { InvalidEmailError } from '../errors/InvalidEmailError.js';

describe('Email Value Object', () => {
  it('should create a valid email address', () => {
    const emailStr = 'grandmaster@chess.com';
    const email = Email.create(emailStr);

    expect(email.getValue()).toBe(emailStr);
  });

  it('should normalize email by trimming and converting to lowercase', () => {
    const email = Email.create('  GM_Magnus@CHESS.com  ');

    expect(email.getValue()).toBe('gm_magnus@chess.com');
  });

  it('should throw InvalidEmailError for malformed emails', () => {
    const invalidEmails = [
      'plainaddress',
      '#@%^%#$@#$@#.com',
      '@example.com',
      'Joe Smith <email@example.com>',
      'email.example.com',
      'email@example@example.com',
      '.email@example.com',
      'email.@example.com',
      'email..email@example.com',
      'email@example.com (Joe Smith)',
      'email@example',
      'email@-example.com',
      'email@example..com',
      'Abc..123@example.com',
    ];

    invalidEmails.forEach((invalid) => {
      expect(() => Email.create(invalid)).toThrow(InvalidEmailError);
    });
  });

  it('should return true when comparing two identical emails', () => {
    const email1 = Email.create('test@engine.com');
    const email2 = Email.create('TEST@engine.com ');

    expect(email1.equals(email2)).toBe(true);
  });

  it('should return false when comparing different emails', () => {
    const email1 = Email.create('player1@chess.com');
    const email2 = Email.create('player2@chess.com');

    expect(email1.equals(email2)).toBe(false);
  });
});

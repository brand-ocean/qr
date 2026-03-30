import { describe, expect, it } from 'vitest';
import { parseCardIdFromScannedValue } from './parseCardId.ts';

describe('parseCardIdFromScannedValue', () => {
  describe('https URLs', () => {
    it('parses https://viralsgame.nl/kaartXXXX', () => {
      expect(
        parseCardIdFromScannedValue('https://viralsgame.nl/kaart0001'),
      ).toBe('kaart0001');
    });

    it('parses https://www.viralsgame.nl/kaartXXXX', () => {
      expect(
        parseCardIdFromScannedValue('https://www.viralsgame.nl/kaart0001'),
      ).toBe('kaart0001');
    });

    it('parses http:// variant', () => {
      expect(
        parseCardIdFromScannedValue('http://viralsgame.nl/kaart0042'),
      ).toBe('kaart0042');
    });
  });

  describe('custom scheme', () => {
    it('parses viralsgame://kaartXXXX', () => {
      expect(parseCardIdFromScannedValue('viralsgame://kaart0001')).toBe(
        'kaart0001',
      );
    });
  });

  describe('domain-only', () => {
    it('parses viralsgame.nl/kaartXXXX', () => {
      expect(parseCardIdFromScannedValue('viralsgame.nl/kaart0001')).toBe(
        'kaart0001',
      );
    });

    it('parses www.viralsgame.nl/kaartXXXX', () => {
      expect(parseCardIdFromScannedValue('www.viralsgame.nl/kaart0001')).toBe(
        'kaart0001',
      );
    });
  });

  describe('normalisation', () => {
    it('lowercases the result', () => {
      expect(
        parseCardIdFromScannedValue('https://viralsgame.nl/KAART0001'),
      ).toBe('kaart0001');
    });

    it('trims leading/trailing whitespace', () => {
      expect(
        parseCardIdFromScannedValue('  https://viralsgame.nl/kaart0001  '),
      ).toBe('kaart0001');
    });

    it('ignores query strings', () => {
      expect(
        parseCardIdFromScannedValue('https://viralsgame.nl/kaart0001?foo=bar'),
      ).toBe('kaart0001');
    });

    it('ignores hash fragments', () => {
      expect(
        parseCardIdFromScannedValue('https://viralsgame.nl/kaart0001#section'),
      ).toBe('kaart0001');
    });
  });

  describe('invalid inputs', () => {
    it('returns null for empty string', () => {
      expect(parseCardIdFromScannedValue('')).toBeNull();
    });

    it('returns null for unrelated URL', () => {
      expect(
        parseCardIdFromScannedValue('https://example.com/kaart0001'),
      ).toBeNull();
    });

    it('returns null for card ID with wrong digit count', () => {
      expect(
        parseCardIdFromScannedValue('https://viralsgame.nl/kaart001'),
      ).toBeNull();
      expect(
        parseCardIdFromScannedValue('https://viralsgame.nl/kaart00001'),
      ).toBeNull();
    });

    it('returns null for plain text', () => {
      expect(parseCardIdFromScannedValue('kaart0001')).toBeNull();
    });

    it('returns null for malformed scheme', () => {
      expect(
        parseCardIdFromScannedValue('notviralsgame://kaart0001'),
      ).toBeNull();
    });
  });
});

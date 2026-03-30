const matchers = [
  /^https?:\/\/(?:www\.)?viralsgame\.nl\/(kaart\d{4})(?:[#/?].*)?$/i,
  /^viralsgame:\/\/(kaart\d{4})(?:[#/?].*)?$/i,
  /^(?:www\.)?viralsgame\.nl\/(kaart\d{4})(?:[#/?].*)?$/i,
];

export function parseCardIdFromScannedValue(value: string): string | null {
  const trimmedValue = value.trim();

  for (const matcher of matchers) {
    const match = trimmedValue.match(matcher);
    if (match?.[1]) {
      return match[1].toLowerCase();
    }
  }

  return null;
}

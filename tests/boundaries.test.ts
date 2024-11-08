import { test, expect } from 'vitest';
import { HumanGenome } from '../src/HumanGenome';

test('test global boundaries', () => {
  const hga = new HumanGenome('GRCh38');

  const first = hga.absoluteToRelative(1);
  expect(first).toStrictEqual({ chrom: 'chr1', pos: 1 });

  const last = hga.absoluteToRelative(hga.getTotalLength());
  expect(last).toStrictEqual({
    chrom: 'chrY',
    pos: hga.getChromLength('chrY'),
  });

  expect(() => hga.absoluteToRelative(0)).toThrowError(
    'Position out of bounds',
  );
  expect(() => hga.absoluteToRelative(hga.getTotalLength() + 1)).toThrowError(
    'Position out of bounds',
  );
});

test('test chrom boundaries', () => {
  const hga = new HumanGenome('GRCh38');

  const chromKeys = hga.getChromKeys();

  chromKeys.forEach((chrom) => {
    const len = hga.getChromLength(chrom);
    const interval = hga.getChromInterval(chrom);

    expect(hga.relativeToAbsolute(chrom, 1)).toBe(interval[0] + 1);
    expect(hga.relativeToAbsolute(chrom, len)).toBe(interval[1]);

    expect(() => hga.relativeToAbsolute(chrom, 0)).toThrowError(
      'Position out of bounds',
    );
    expect(() => hga.relativeToAbsolute(chrom, -1)).toThrowError(
      'Position out of bounds',
    );
    expect(() => hga.relativeToAbsolute(chrom, len + 1)).toThrowError(
      'Position out of bounds',
    );
  });
});

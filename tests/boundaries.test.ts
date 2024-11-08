import { test, expect } from 'vitest';
import { HumanGenomeAssembly } from '../src/HumanGenomeAssembly';

test('test global boundaries', () => {
  const hga = new HumanGenomeAssembly('GRCh38');

  const first = hga.absoluteToRelative(0);
  expect(first).toStrictEqual({ chrom: 'chr1', pos: 0 });

  const last = hga.absoluteToRelative(hga.getTotalLength() - 1);
  expect(last).toStrictEqual({
    chrom: 'chrY',
    pos: hga.getChromLength('chrY') - 1,
  });

  expect(() => hga.absoluteToRelative(-1)).toThrowError(
    'Position out of bounds',
  );
  expect(() => hga.absoluteToRelative(hga.getTotalLength())).toThrowError(
    'Position out of bounds',
  );
});

test('test chrom boundaries', () => {
  const hga = new HumanGenomeAssembly('GRCh38');

  const chromKeys = hga.getChromKeys();

  chromKeys.forEach((chrom) => {
    const len = hga.getChromLength(chrom);

    // [0] is inclusive, [1] is exclusive
    const interval = hga.getChromInterval(chrom);

    expect(hga.relativeToAbsolute(chrom, 0)).toBe(interval[0]);
    expect(hga.relativeToAbsolute(chrom, len - 1)).toBe(interval[1] - 1);

    expect(() => hga.relativeToAbsolute(chrom, -1)).toThrowError(
      'Position out of bounds',
    );
    expect(() => hga.relativeToAbsolute(chrom, len)).toThrowError(
      'Position out of bounds',
    );
  });
});

import { test, expect } from 'vitest';
import { HumanGenome } from '../src/HumanGenome';

test('parse range', () => {
  const hga = new HumanGenome('GRCh38');

  expect(hga.parseChromRange('chr1:100-200')).toEqual({
    chrom: 'chr1',
    start: 100,
    end: 200,
  });

  expect(hga.parseChromRange('chr1:100-200', 'ucsc')).toEqual({
    chrom: 'chr1',
    start: 100,
    end: 200,
  });

  // Randomly sample chromosomes
  const chromKeys = hga.getChromKeys();

  chromKeys.forEach((chrom) => {
    const len = hga.getChromLength(chrom);

    for (let i = 0; i < 1000; i++) {
      const start = Math.floor(Math.random() * len);
      const end = Math.floor(Math.random() * len);
      const range = `${chrom}:${start}-${end}`;

      expect(hga.parseChromRange(range)).toEqual({
        chrom,
        start,
        end,
      });
    }
  });
});

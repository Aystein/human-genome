import { expect, test } from 'vitest';
import { HumanGenome } from '../src/HumanGenome';

test('total length', () => {
  const hga = new HumanGenome('GRCh38');
  expect(hga.getTotalLength()).toBe(3088269832);
});

test('chrom keys', () => {
  const hga = new HumanGenome('GRCh38');
  expect(hga.getChromKeys()).toEqual([
    'chr1',
    'chr2',
    'chr3',
    'chr4',
    'chr5',
    'chr6',
    'chr7',
    'chr8',
    'chr9',
    'chr10',
    'chr11',
    'chr12',
    'chr13',
    'chr14',
    'chr15',
    'chr16',
    'chr17',
    'chr18',
    'chr19',
    'chr20',
    'chr21',
    'chr22',
    'chrX',
    'chrY',
  ]);
});

test('random sample chrom space', () => {
  const hga = new HumanGenome('GRCh38');
  const chromKeys = hga.getChromKeys();

  let abs = 0;
  chromKeys.forEach((chrom) => {
    const len = hga.getChromLength(chrom);
    const interval = hga.getChromInterval(chrom);

    for (let i = 0; i < 1000; i++) {
      const relative = 1 + Math.floor(Math.random() * len);
      abs = hga.relativeToAbsolute(chrom, relative);

      expect(abs).toBe(interval[0] + relative);
    }
  });
});

test('check edge cases in absolute to relative conversion', () => {
  const hga = new HumanGenome('GRCh38');
  const chromKeys = hga.getChromKeys();

  chromKeys.forEach((chrom) => {
    const len = hga.getChromLength(chrom);
    const interval = hga.getChromInterval(chrom);

    expect(() => hga.relativeToAbsolute(chrom, 0)).toThrowError(
      'Position out of bounds',
    );
    expect(() => hga.relativeToAbsolute(chrom, -1)).toThrowError(
      'Position out of bounds',
    );
    expect(() => hga.relativeToAbsolute(chrom, len + 1)).toThrowError(
      'Position out of bounds',
    );

    expect(hga.relativeToAbsolute(chrom, 1)).toBe(interval[0] + 1);
    expect(hga.relativeToAbsolute(chrom, len)).toBe(interval[1]);
  });
});

test('check generated intervals', () => {
  const hga = new HumanGenome('GRCh38');
  const intervals = hga.getChromIntervals();

  expect(intervals).toStrictEqual({
    chr1: [0, 248956422],
    chr2: [248956422, 491149951],
    chr3: [491149951, 689445510],
    chr4: [689445510, 879660065],
    chr5: [879660065, 1061198324],
    chr6: [1061198324, 1232004303],
    chr7: [1232004303, 1391350276],
    chr8: [1391350276, 1536488912],
    chr9: [1536488912, 1674883629],
    chr10: [1674883629, 1808681051],
    chr11: [1808681051, 1943767673],
    chr12: [1943767673, 2077042982],
    chr13: [2077042982, 2191407310],
    chr14: [2191407310, 2298451028],
    chr15: [2298451028, 2400442217],
    chr16: [2400442217, 2490780562],
    chr17: [2490780562, 2574038003],
    chr18: [2574038003, 2654411288],
    chr19: [2654411288, 2713028904],
    chr20: [2713028904, 2777473071],
    chr21: [2777473071, 2824183054],
    chr22: [2824183054, 2875001522],
    chrX: [2875001522, 3031042417],
    chrY: [3031042417, 3088269832],
  });
});

test('check generated lengths', () => {
  const hga = new HumanGenome('GRCh38');
  const lengths = hga.getChromLengths();

  expect(lengths).toStrictEqual({
    chr1: 248956422,
    chr2: 242193529,
    chr3: 198295559,
    chr4: 190214555,
    chr5: 181538259,
    chr6: 170805979,
    chr7: 159345973,
    chr8: 145138636,
    chr9: 138394717,
    chr10: 133797422,
    chr11: 135086622,
    chr12: 133275309,
    chr13: 114364328,
    chr14: 107043718,
    chr15: 101991189,
    chr16: 90338345,
    chr17: 83257441,
    chr18: 80373285,
    chr19: 58617616,
    chr20: 64444167,
    chr21: 46709983,
    chr22: 50818468,
    chrX: 156040895,
    chrY: 57227415,
  });
});

test('check chrom Index', () => {
  const hga = new HumanGenome('GRCh38');
  const chromKeys = hga.getChromKeys();

  chromKeys.forEach((chrom, i) => {
    expect(hga.getChromIndex(chrom)).toBe(i);
  });
});

test('prefix test', () => {
  const hga = new HumanGenome('GRCh38');
  expect(hga.prefixChromKey('1')).toBe('chr1');
  expect(hga.prefixChromKey('X')).toBe('chrX');
  expect(hga.prefixChromKey('chrY')).toBe('chrY');
})

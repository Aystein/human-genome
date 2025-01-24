import { ChromKey } from './types';

export function chromKeys() {
  return [
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
  ] as ChromKey[];
}

export function chromKeyIndexMap(): Record<ChromKey, number> {
  return {
    chr1: 0,
    chr2: 1,
    chr3: 2,
    chr4: 3,
    chr5: 4,
    chr6: 5,
    chr7: 6,
    chr8: 7,
    chr9: 8,
    chr10: 9,
    chr11: 10,
    chr12: 11,
    chr13: 12,
    chr14: 13,
    chr15: 14,
    chr16: 15,
    chr17: 16,
    chr18: 17,
    chr19: 18,
    chr20: 19,
    chr21: 20,
    chr22: 21,
    chrX: 22,
    chrY: 23,
  }
}
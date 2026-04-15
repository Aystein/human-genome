import { lengths as GRCh38_p14_lengths } from './GRCh38_p14';
import { AnyChromKey, ChromKey, ChromRange, StrippedChromKey } from './types';
import { chromKeyIndexMap, chromKeys } from './util';

export class HumanGenome {
  private lengths: Record<ChromKey, number>;

  private chromosomesInOrder: ChromKey[];

  private chromKeyIndexMap: Record<ChromKey, number>;

  private intervals: Record<ChromKey, [number, number]>;

  private totalLength: number;

  constructor(assembly: 'GRCh38') {
    switch (assembly) {
      case 'GRCh38': {
        this.lengths = GRCh38_p14_lengths();
        this.chromosomesInOrder = chromKeys();
        this.intervals = {} as Record<ChromKey, [number, number]>;
        this.chromKeyIndexMap = chromKeyIndexMap();

        let pos = 0;
        for (const chrom of this.chromosomesInOrder) {
          const len = this.lengths[chrom];
          const interval = [pos, pos + len] as [number, number];
          this.intervals[chrom] = interval;
          pos += len;
        }

        this.totalLength = pos;
        break;
      }
      default:
        throw new Error('Unsupported assembly version');
    }

    // Build assembly
  }

  /**
   * Parses a chromosome range string into its components.
   * Supports multiple formats.
   *
   * UTSC format: "chr:start-end"
   *
   * @example
   * const range = hg38.parseChromRange('chr1:100-200');
   * console.log(range); // { chrom: 'chr1', start: 100, end: 200 }
   */
  parseChromRange(range: string, format: 'ucsc' = 'ucsc'): ChromRange {
    const trimRange = range.trim();

    switch (format) {
      case 'ucsc': {
        const match = trimRange.match(/^(\w+):(\d+)-(\d+)$/);

        if (match) {
          const chrom = match[1] as ChromKey;
          const start = parseInt(match[2]);
          const end = parseInt(match[3]);

          return { chrom, start, end };
        }

        throw new Error('Range does not match USCS format');
      }
      default:
        throw new Error('Unsupported format');
    }
  }

  /**
   * Returns a half-open interval for a chromosome.
   * For chromosome 1, the interval would be (0, 248956422], so the first base included
   * is 1 and the last base included is 248956422.
   *
   * @example
   * const interval = hg38.getChromInterval('chr1');
   * console.log(interval); // [0, 248956422]
   */
  getChromInterval(chrom: ChromKey): [number, number] {
    return this.intervals[chrom];
  }

  /**
   * Returns a record of all chromosome intervals.
   *
   * @example
   * const intervals = hg38.getChromIntervals();
   * console.log(intervals.chr1); // [0, 248956422]
   * console.log(intervals.chr2); // [248956422, 491149951]
   */
  getChromIntervals(): Record<ChromKey, [number, number]> {
    return this.intervals;
  }

  /**
   * Returns the total length of the genome assembly.
   *
   * @example
   * const totalLength = hg38.getTotalLength();
   * console.log(totalLength); // 3088269832
   */
  getTotalLength() {
    return this.totalLength;
  }

  /**
   * Returns an array of all chromosome keys in order.
   *
   * @example
   * const chromKeys = hg38.getChromKeys();
   * console.log(chromKeys); // ['chr1', 'chr2', ..., 'chrY']
   */
  getChromKeys() {
    return this.chromosomesInOrder;
  }

  /**
   * Returns the domain of the genome assembly.
   * @deprecated Use getHalfOpenDomain instead, getDomain is 1 based (closed interval) while getHalfOpenDomain is 0 based (half open interval).
   */
  getDomain() {
    return [1, this.totalLength] as [number, number];
  }

  getHalfOpenDomain(): [number, number] {
    return [0, this.totalLength];
  }

  /**
   * Returns the length of a chromosome.
   *
   * @example
   * const length = hg38.getChromLength('chr1');
   * console.log(length); // 248956422
   */
  getChromLength(chrom: ChromKey): number {
    return this.lengths[chrom];
  }

  /**
   * Returns a record of all chromosome lengths.
   *
   * @example
   * const lengths = hg38.getChromLengths();
   * console.log(lengths.chr1); // 248956422
   * console.log(lengths.chr2); // 242193529
   */
  getChromLengths(): Record<ChromKey, number> {
    return this.lengths;
  }

  private _relativeToAbsolute(chrom: ChromKey, pos: number) {
    return this.intervals[chrom][0] + pos;
  }

  /**
   * Converts a relative position on a chromosome to an absolute position.
   *
   * @example
   * const abs = hg38.relativeToAbsolute('chr1', 100);
   * console.log(abs); // 100
   */
  relativeToAbsolute(chrom: ChromKey, pos: number): number {
    if (pos <= 0 || pos > this.lengths[chrom]) {
      throw new Error('Position out of bounds');
    }

    return this._relativeToAbsolute(chrom, pos);
  }

  safeRelativeToAbsolute(chrom: ChromKey, pos: number): number | null {
    if (pos <= 0 || pos > this.lengths[chrom]) {
      return null;
    }

    return this._relativeToAbsolute(chrom, pos);
  }

  private _absoluteToRelative(pos: number): { chrom: ChromKey; pos: number } {
    let left = 0;
    let right = this.chromosomesInOrder.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const chrom = this.chromosomesInOrder[mid];
      const interval = this.intervals[chrom];

      if (pos <= interval[0]) {
        right = mid - 1;
      } else if (pos > interval[1]) {
        left = mid + 1;
      } else {
        return { chrom, pos: pos - interval[0] };
      }
    }

    throw new Error('Position out of bounds');
  }

  /**
   * Converts an absolute position to a relative position on a chromosome.
   *
   * @example
   * const rel = hg38.absoluteToRelative(100);
   * console.log(rel); // { chrom: 'chr1', pos: 100 }
   */
  absoluteToRelative(pos: number): { chrom: ChromKey; pos: number } {
    if (pos <= 0 || pos > this.totalLength) {
      throw new Error('Position out of bounds');
    }

    return this._absoluteToRelative(pos);
  }

  safeAbsoluteToRelative(pos: number): { chrom: ChromKey; pos: number } | null {
    if (pos <= 0 || pos > this.totalLength) {
      return null;
    }

    return this._absoluteToRelative(pos);
  }

  /**
   * Returns the index (starting from 0) for a given ChromKey.
   *
   * @example
   * const index = hg38.getChromIndex('chr1');
   * console.log(index); // 0
   */
  getChromIndex(chrom: ChromKey): number {
    return this.chromKeyIndexMap[chrom];
  }

  isChromKey(chrom: string): chrom is ChromKey {
    return chrom in this.chromKeyIndexMap;
  }

  isAnyChromKey(chrom: string): chrom is AnyChromKey {
    return this.isChromKey(chrom) || this.isStrippedChromKey(chrom);
  }

  isStrippedChromKey(chrom: string): chrom is StrippedChromKey {
    return `chr${chrom}` in this.chromKeyIndexMap;
  }

  /**
   * Function that adds the 'chr' prefix to a chromosome key if it is not already present.
   *
   * @example
   * const chrom = hg38.prefixChromKey('1');
   * console.log(chrom); // 'chr1'
   *
   * const chrom = hg38.prefixChromKey('chr1');
   * console.log(chrom); // 'chr1'
   */
  prefixChromKey(chrom: string): ChromKey {
    return (chrom.startsWith('chr') ? chrom : `chr${chrom}`) as ChromKey;
  }

  /**
   * Function that removes the 'chr' prefix from a chromosome key if it is present.
   *
   * @example
   * const chrom = hg38.stripChromKey('chr1');
   * console.log(chrom); // '1'
   *
   * const chrom = hg38.stripChromKey('1');
   * console.log(chrom); // '1'
   */
  stripChromKey(chrom: AnyChromKey): StrippedChromKey {
    return this.isChromKey(chrom)
      ? (chrom.slice(3) as StrippedChromKey)
      : chrom;
  }
}

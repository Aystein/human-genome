import { lengths as GRCh38_p14_lengths } from './GRCh38_p14';
import { ChromKey, ChromRange } from './types';
import { chromKeys } from './util';

export class HumanGenome {
  private lengths: Record<ChromKey, number>;

  private chromosomesInOrder: ChromKey[];

  private intervals: Record<ChromKey, [number, number]>;

  private totalLength: number;

  constructor(assembly: 'GRCh38') {
    switch (assembly) {
      case 'GRCh38': {
        this.lengths = GRCh38_p14_lengths();
        this.chromosomesInOrder = chromKeys();
        this.intervals = {} as Record<ChromKey, [number, number]>;

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
   */
  getDomain() {
    return [1, this.totalLength] as [number, number];
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

    return this.intervals[chrom][0] + pos;
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

    // Binary search in intervals
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

  tickSpec(start: number, stop: number, count: number) {
    const e10 = Math.sqrt(50);
    const e5 = Math.sqrt(10);
    const e2 = Math.sqrt(2);

    const step = (stop - start) / count;
    const power = Math.floor(Math.log10(step));
    const error = step / Math.pow(10, power);

    const factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;

    let i1, i2, inc;
    if (power < 0) {
      inc = Math.pow(10, -power) / factor;
      i1 = Math.round(start * inc);
      i2 = Math.round(stop * inc);
      if (i1 / inc < start) ++i1;
      if (i2 / inc > stop) --i2;
      inc = -inc;
    } else {
      inc = Math.pow(10, power) * factor;
      i1 = Math.round(start / inc);
      i2 = Math.round(stop / inc);
      if (i1 * inc < start) ++i1;
      if (i2 * inc > stop) --i2;
    }

    return { i1, i2, inc };
  }

  ticks(domain: [number, number], count: number) {
    if (count <= 2) {
      throw new Error('Tick count must be at least 2');
    }
    if (domain[0] === domain[1]) {
      throw new Error('Invalid domain');
    }

    const [start, end] = domain;
    const ascending = start < end;

    const { i1, i2, inc } = ascending
      ? this.tickSpec(start, end, count)
      : this.tickSpec(end, start, count);

    if (!(i2 >= i1)) return [];

    const n = i2 - i1 + 1,
      ticks = new Array(n);

    if (ascending) {
      if (inc < 0) for (let i = 0; i < n; ++i) ticks[i] = (i1 + i) / -inc;
      else for (let i = 0; i < n; ++i) ticks[i] = (i1 + i) * inc;
    } else {
      if (inc < 0) for (let i = 0; i < n; ++i) ticks[i] = (i2 - i) / -inc;
      else for (let i = 0; i < n; ++i) ticks[i] = (i2 - i) * inc;
    }

    return ticks;
  }
}

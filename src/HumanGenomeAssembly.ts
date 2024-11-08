import { lengths as GRCh38_p14_lengths } from './GRCh38_p14';
import { ChromKey, ChromRange } from './types';
import { chromKeys } from './util';

export class HumanGenomeAssembly {
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
   * @param range A range string
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

  getChromInterval(chrom: ChromKey): [number, number] {
    return this.intervals[chrom];
  }

  getChromIntervals(): Record<ChromKey, [number, number]> {
    return this.intervals;
  }

  getTotalLength() {
    return this.totalLength;
  }

  getChromKeys() {
    return this.chromosomesInOrder;
  }

  getChromLength(chrom: ChromKey): number {
    return this.lengths[chrom];
  }

  getChromLengths(): Record<ChromKey, number> {
    return this.lengths;
  }

  relativeToAbsolute(chrom: ChromKey, pos: number): number {
    if (pos < 0 || pos >= this.lengths[chrom]) {
      throw new Error('Position out of bounds');
    }

    return this.intervals[chrom][0] + pos;
  }

  absoluteToRelative(pos: number): { chrom: ChromKey; pos: number } {
    if (pos < 0 || pos >= this.totalLength) {
      throw new Error('Position out of bounds');
    }

    // Binary search in intervals
    let left = 0;
    let right = this.chromosomesInOrder.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const chrom = this.chromosomesInOrder[mid];
      const interval = this.intervals[chrom];

      if (pos < interval[0]) {
        right = mid - 1;
      } else if (pos >= interval[1]) {
        left = mid + 1;
      } else {
        return { chrom, pos: pos - interval[0] };
      }
    }

    throw new Error('Position out of bounds');
  }
}

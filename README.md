# human-genome

This library contains convenient functions to work with genome coordinates. It exports one global assembly for each version. Currently the following versions are supported:

- GRCh38 (hg38)

## Setup

Install the dependencies:

```bash
yarn add human-genome
```

## Usage

```tsx
import { hg38 } from 'human-genome';

// Get chromosome length
const chr1Length = hg38.getChromLength('chr1'); // 248956422

// Get all chromosome keys
const keys = hg38.getChromKeys(); // ['chr1', 'chr2', ...]

// Convert relative to absolute coordinate
const abs = hg38.relativeToAbsolute('chrX', 50000);

// Convert absolute to relative coordinate
const rel = hg38.absoluteToRelative(5329844);

...
```

## API

```tsx
class HumanGenome {
  parseChromRange(range: string, format?: 'ucsc'): ChromRange;
  getChromInterval(chrom: ChromKey): [number, number];
  getChromIntervals(): Record<ChromKey, [number, number]>;
  getTotalLength(): number;
  getChromKeys(): ChromKey[];
  getChromLength(chrom: ChromKey): number;
  getChromLengths(): Record<ChromKey, number>;
  relativeToAbsolute(chrom: ChromKey, pos: number): number;
  absoluteToRelative(pos: number): {
    chrom: ChromKey;
    pos: number;
  };
}
```

## Tests

This library contains unit tests for coordinate conversions, lengths and intervals. Use

```bash
yarn test
```

to run them.

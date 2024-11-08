import { test } from 'vitest';
import { HumanGenome } from '../src/HumanGenome';

test('ticks', () => {
  const hg = new HumanGenome('GRCh38');

  console.log(hg.tickSpec(23, 80, 5));
});

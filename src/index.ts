import { HumanGenome } from './HumanGenome';

// Export types
export * from './types';

export * from './HumanGenome';

// Export singleton instance
export const hg38 = new HumanGenome('GRCh38');

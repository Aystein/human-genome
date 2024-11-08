import { HumanGenomeAssembly } from './HumanGenomeAssembly';

// Export types
export * from './types';

export * from './HumanGenomeAssembly';

// Export singleton instance
export const hg38 = new HumanGenomeAssembly('GRCh38');


import { civilTemplates } from './civilTemplates';
import { trabalhistaTemplates } from './trabalhistaTemplates';
import { penalTemplates } from './penalTemplates';
import { familiaTemplates } from './familiaTemplates';
import { constitucionalTemplates } from './constitucionalTemplates';
import { empresarialTemplates } from './empresarialTemplates';
import { recursalTemplates } from './recursalTemplates';
import { contratualTemplates } from './contratualTemplates';
import { administrativoTemplates } from './administrativoTemplates';

export const modelosReais = [
  ...civilTemplates,
  ...trabalhistaTemplates,
  ...penalTemplates,
  ...familiaTemplates,
  ...constitucionalTemplates,
  ...empresarialTemplates,
  ...recursalTemplates,
  ...contratualTemplates,
  ...administrativoTemplates
];

// Export individual template arrays for future use if needed
export {
  civilTemplates,
  trabalhistaTemplates,
  penalTemplates,
  familiaTemplates,
  constitucionalTemplates,
  empresarialTemplates,
  recursalTemplates,
  contratualTemplates,
  administrativoTemplates
};


import { civilTemplates } from './civilTemplates';
import { trabalhistaTemplates } from './trabalhistaTemplates';
import { penalTemplates } from './penalTemplates';
import { familiaTemplates } from './familiaTemplates';
import { constitucionalTemplates } from './constitucionalTemplates';
import { empresarialTemplates } from './empresarialTemplates';
import { recursalTemplates } from './recursalTemplates';
import { contratualTemplates } from './contratualTemplates';
import { administrativoTemplates } from './administrativoTemplates';
import { ambientalTemplates } from './ambientalTemplates';

export const modelosReais = [
  ...civilTemplates,
  ...trabalhistaTemplates,
  ...penalTemplates,
  ...familiaTemplates,
  ...constitucionalTemplates,
  ...empresarialTemplates,
  ...recursalTemplates,
  ...contratualTemplates,
  ...administrativoTemplates,
  ...ambientalTemplates
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
  administrativoTemplates,
  ambientalTemplates
};


import { useProcessFile as useProcessFileMain } from './useProcessFileMain';
import type { GptModel } from '../use-documents';

export const useProcessFile = (params: any & { gptModel?: GptModel }) => {
  return useProcessFileMain(params);
};

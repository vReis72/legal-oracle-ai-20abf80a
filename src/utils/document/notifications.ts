
import { toast } from "sonner";
import { TextExtractionOptions } from './types';

/**
 * Shows notification toast if enabled
 * @param options Text extraction options
 * @param type Toast type
 * @param message Message to show
 */
export const showNotification = (
  options: TextExtractionOptions, 
  type: 'info' | 'success' | 'warning' | 'error', 
  message: string
) => {
  if (options.showToasts !== false) {
    switch (type) {
      case 'info':
        toast.info(message);
        break;
      case 'success':
        toast.success(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      case 'error':
        toast.error(message);
        break;
    }
  }
};

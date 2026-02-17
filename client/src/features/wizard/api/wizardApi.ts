import { apiClient } from '../../../shared/api/client';
import type { WizardCategory, WizardSubmission, WizardResult } from '../types';

export const wizardApi = {
  getCategories: async (): Promise<WizardCategory[]> => {
    const response = await apiClient.get<WizardCategory[]>('/wizard/categories');
    return response.data;
  },

  submitWizard: async (data: WizardSubmission): Promise<WizardResult> => {
    const response = await apiClient.post<WizardResult>('/wizard/submit', data);
    return response.data;
  },
};

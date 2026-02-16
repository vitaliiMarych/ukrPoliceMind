import { apiClient } from '../../../shared/api/client';
import type { WizardCategory, WizardTemplate, WizardSubmission, WizardResult } from '../types';

export const wizardApi = {
  getCategories: async (): Promise<WizardCategory[]> => {
    const response = await apiClient.get<WizardCategory[]>('/wizard/categories');
    return response.data;
  },

  getTemplatesByCategory: async (categoryId: string): Promise<WizardTemplate[]> => {
    const response = await apiClient.get<WizardTemplate[]>(`/wizard/categories/${categoryId}/templates`);
    return response.data;
  },

  getTemplate: async (templateId: string): Promise<WizardTemplate> => {
    const response = await apiClient.get<WizardTemplate>(`/wizard/templates/${templateId}`);
    return response.data;
  },

  submitWizard: async (data: WizardSubmission): Promise<WizardResult> => {
    const response = await apiClient.post<WizardResult>('/wizard/submit', data);
    return response.data;
  },
};

export interface WizardCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface WizardFormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface WizardTemplate {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  fields: WizardFormField[];
}

export interface WizardSubmission {
  templateId: string;
  answers: Record<string, string>;
}

export interface WizardResult {
  id: string;
  sessionId: string;
  recommendation: string;
  createdAt: string;
}

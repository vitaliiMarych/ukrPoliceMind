export interface WizardCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  schema?: {
    fields: WizardFormField[];
  };
}

export interface WizardFormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  step?: number;
}

export interface WizardTemplate {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  fields: WizardFormField[];
}

export interface WizardSubmission {
  categoryId: string;
  answers: Record<string, string>;
}

export interface WizardResult {
  sessionId: string;
  assistantMessageId: string;
  streamUrl: string;
}

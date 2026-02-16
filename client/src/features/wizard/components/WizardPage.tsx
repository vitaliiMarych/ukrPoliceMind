import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CategoryPicker } from './CategoryPicker';
import { DynamicForm } from './DynamicForm';
import { wizardApi } from '../api/wizardApi';

export const WizardPage = () => {
  const navigate = useNavigate();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const { data: templates, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['wizardTemplates', selectedCategoryId],
    queryFn: () => wizardApi.getTemplatesByCategory(selectedCategoryId!),
    enabled: !!selectedCategoryId,
  });

  const { data: template, isLoading: isLoadingTemplate } = useQuery({
    queryKey: ['wizardTemplate', selectedTemplateId],
    queryFn: () => wizardApi.getTemplate(selectedTemplateId!),
    enabled: !!selectedTemplateId,
  });

  const submitMutation = useMutation({
    mutationFn: wizardApi.submitWizard,
    onSuccess: (result) => {
      navigate(`/history/${result.sessionId}`);
    },
  });

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const handleSubmitForm = (data: Record<string, string>) => {
    if (selectedTemplateId) {
      submitMutation.mutate({
        templateId: selectedTemplateId,
        answers: data,
      });
    }
  };

  const handleBack = () => {
    if (selectedTemplateId) {
      setSelectedTemplateId(null);
    } else if (selectedCategoryId) {
      setSelectedCategoryId(null);
    }
  };

  // Show category picker
  if (!selectedCategoryId) {
    return <CategoryPicker onSelectCategory={handleSelectCategory} />;
  }

  // Show template selection
  if (!selectedTemplateId) {
    if (isLoadingTemplates) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg text-gray-600">Завантаження шаблонів...</div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={handleBack}
          className="mb-6 text-blue-600 hover:text-blue-700 flex items-center"
        >
          ← Назад до категорій
        </button>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Оберіть тип консультації
        </h2>
        <div className="space-y-4">
          {templates?.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleSelectTemplate(tmpl.id)}
              className="w-full p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all text-left"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {tmpl.name}
              </h3>
              <p className="text-gray-600">{tmpl.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Show dynamic form
  if (isLoadingTemplate) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Завантаження форми...</div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">Помилка завантаження форми</div>
      </div>
    );
  }

  return (
    <DynamicForm
      template={template}
      onSubmit={handleSubmitForm}
      onBack={handleBack}
      isSubmitting={submitMutation.isPending}
    />
  );
};

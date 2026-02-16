import { useForm } from 'react-hook-form';
import type { WizardTemplate } from '../types';

interface DynamicFormProps {
  template: WizardTemplate;
  onSubmit: (data: Record<string, string>) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export const DynamicForm = ({ template, onSubmit, onBack, isSubmitting }: DynamicFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, string>>();

  const renderField = (field: WizardTemplate['fields'][0]) => {
    const commonProps = {
      ...register(field.id, {
        required: field.required ? `${field.label} є обов'язковим полем` : false,
      }),
      id: field.id,
      placeholder: field.placeholder,
      className:
        'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
    };

    switch (field.type) {
      case 'textarea':
        return <textarea {...commonProps} rows={4} />;

      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Оберіть...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'date':
        return <input {...commonProps} type="date" />;

      case 'number':
        return <input {...commonProps} type="number" />;

      default:
        return <input {...commonProps} type="text" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{template.name}</h2>
        <p className="text-gray-600">{template.description}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {template.fields.map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
            {errors[field.id] && (
              <p className="mt-1 text-sm text-red-600">
                {errors[field.id]?.message as string}
              </p>
            )}
          </div>
        ))}

        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Назад
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Відправка...' : 'Отримати рекомендацію'}
          </button>
        </div>
      </form>
    </div>
  );
};

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { CustomSelect } from '../../../shared/components/CustomSelect';
import type { WizardCategory, WizardFormField } from '../types';

interface DynamicFormProps {
  category: WizardCategory;
  onSubmit: (data: Record<string, string>) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export const DynamicForm = ({ category, onSubmit, onBack, isSubmitting }: DynamicFormProps) => {
  const fields = category.schema?.fields || [];

  const stepNumbers = [...new Set(fields.map((f) => f.step ?? 1))].sort((a, b) => a - b);
  const totalSteps = stepNumbers.length;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStepNumber = stepNumbers[currentStepIndex];

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors },
  } = useForm<Record<string, string>>({
    shouldUnregister: false,
  });

  const currentFields = fields.filter((f) => (f.step ?? 1) === currentStepNumber);
  const isLastStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;

  const handleNext = async () => {
    const fieldIds = currentFields.map((f) => f.id);
    const isValid = await trigger(fieldIds);
    if (isValid) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStepIndex((prev) => prev - 1);
  };

  const renderField = (field: WizardFormField) => {
    if (field.type === 'select') {
      return (
        <Controller
          name={field.id}
          control={control}
          rules={{
            required: field.required ? `${field.label} є обов'язковим полем` : false,
          }}
          render={({ field: { onChange, value } }) => (
            <CustomSelect
              id={field.id}
              options={field.options || []}
              value={value || ''}
              onChange={onChange}
              placeholder={field.placeholder || 'Оберіть...'}
              required={field.required}
              error={errors[field.id]?.message as string}
            />
          )}
        />
      );
    }

    const commonProps = {
      ...register(field.id, {
        required: field.required ? `${field.label} є обов'язковим полем` : false,
      }),
      id: field.id,
      placeholder: field.placeholder,
      className:
        'mt-1 block w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    };

    switch (field.type) {
      case 'textarea':
        return <textarea {...commonProps} rows={4} />;
      case 'date':
        return <input {...commonProps} type="date" />;
      case 'number':
        return <input {...commonProps} type="number" />;
      default:
        return <input {...commonProps} type="text" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-8 py-8">
      <button
        type="button"
        onClick={isFirstStep ? onBack : handlePrevious}
        disabled={isSubmitting}
        className="mb-8 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg font-semibold flex items-center transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        {isFirstStep ? 'Назад до категорій' : 'Попередній крок'}
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-900 bg-clip-text text-transparent mb-2">
          {category.name}
        </h2>
        <p className="text-slate-600">{category.description}</p>
      </div>

      {/* Progress bar */}
      {totalSteps > 1 && (
        <div className="flex items-center mb-8">
          {stepNumbers.map((step, index) => (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  index <= currentStepIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {index < currentStepIndex ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-colors ${
                    index < currentStepIndex ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-sm text-slate-500 mb-6 font-medium">
        Крок {currentStepIndex + 1} з {totalSteps}
      </p>

      <form
        onSubmit={
          isLastStep
            ? handleSubmit(onSubmit)
            : (e) => {
                e.preventDefault();
                handleNext();
              }
        }
        className="space-y-5"
      >
        {currentFields.map((field) => (
          <div key={field.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <label htmlFor={field.id} className="block text-sm font-semibold text-slate-700 mb-1.5">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
            {errors[field.id] && field.type !== 'select' && (
              <p className="mt-1.5 text-sm text-red-600">{errors[field.id]?.message as string}</p>
            )}
          </div>
        ))}

        <div className="pt-2">
          {isLastStep ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Відправка...' : 'Отримати рекомендацію'}
            </button>
          ) : (
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all duration-200 flex items-center justify-center"
            >
              Далі
              <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

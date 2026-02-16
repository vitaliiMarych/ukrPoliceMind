import { useQuery } from '@tanstack/react-query';
import { wizardApi } from '../api/wizardApi';
import type { WizardCategory } from '../types';

interface CategoryPickerProps {
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryPicker = ({ onSelectCategory }: CategoryPickerProps) => {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['wizardCategories'],
    queryFn: wizardApi.getCategories,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-600">Завантаження категорій...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-red-600">Помилка завантаження категорій</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Оберіть категорію вашого запитання
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories?.map((category: WizardCategory) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all text-left"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {category.name}
            </h3>
            <p className="text-gray-600">{category.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

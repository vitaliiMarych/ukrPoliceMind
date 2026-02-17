import { useQuery } from '@tanstack/react-query';
import { wizardApi } from '../api/wizardApi';
import type { WizardCategory } from '../types';

interface CategoryPickerProps {
  onSelectCategory: (category: WizardCategory) => void;
}

export const CategoryPicker = ({ onSelectCategory }: CategoryPickerProps) => {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['wizardCategories'],
    queryFn: wizardApi.getCategories,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-slate-600">Завантаження категорій...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-red-600">Помилка завантаження категорій</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-900 bg-clip-text text-transparent mb-2">
          Майстер консультацій
        </h1>
        <p className="text-base text-slate-600">
          Оберіть категорію вашого запитання для отримання персоналізованої консультації
        </p>
      </div>

      {!categories || categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-md border border-slate-200">
          <svg
            className="w-16 h-16 text-slate-300 mx-auto mb-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-lg text-slate-600 font-semibold mb-1">
            Категорії тимчасово недоступні
          </p>
          <p className="text-sm text-slate-500">
            Адміністратор ще не додав категорії консультацій
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((category: WizardCategory) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category)}
              className="group p-6 bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all duration-200 text-left"
            >
              <div className="flex items-start space-x-3 mb-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-blue-600 font-semibold text-xs group-hover:translate-x-1 transition-transform">
                Обрати категорію
                <svg
                  className="w-4 h-4 ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

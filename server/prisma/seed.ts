import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ukrpolicemind';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Delete existing categories to avoid duplicates
  await prisma.wizardCategory.deleteMany({});
  console.log('🗑️  Cleared existing categories');

  const categories = [
    {
      title: 'Трудові відносини',
      description: 'Консультації щодо трудових договорів, звільнення, зарплати',
      icon: '💼',
      schemaJson: JSON.stringify({
        fields: [
          {
            id: 'employment_type',
            type: 'select',
            label: 'Тип трудових відносин',
            required: true,
            options: ['Офіційне працевлаштування', 'Цивільно-правовий договір', 'Неофіційна робота'],
            step: 1,
          },
          {
            id: 'issue_type',
            type: 'select',
            label: 'Тип проблеми',
            required: true,
            options: ['Звільнення', 'Затримка зарплати', 'Порушення умов договору', 'Дискримінація', 'Інше'],
            step: 1,
          },
          {
            id: 'employer_name',
            type: 'text',
            label: 'Назва роботодавця',
            placeholder: 'Введіть назву організації',
            required: false,
            step: 2,
          },
          {
            id: 'employment_duration',
            type: 'text',
            label: 'Стаж роботи',
            placeholder: 'Наприклад: 2 роки 3 місяці',
            required: false,
            step: 2,
          },
          {
            id: 'salary_amount',
            type: 'number',
            label: 'Розмір заробітної плати (грн)',
            placeholder: 'Сума в гривнях',
            required: false,
            step: 2,
          },
          {
            id: 'incident_date',
            type: 'date',
            label: 'Дата інциденту',
            required: false,
            step: 2,
          },
          {
            id: 'issue_description',
            type: 'textarea',
            label: 'Опишіть вашу ситуацію',
            placeholder: 'Детально опишіть проблему, вкажіть всі важливі обставини...',
            required: true,
            step: 3,
          },
        ],
      }),
      isActive: true,
    },
    {
      title: 'Житлові питання',
      description: 'Питання оренди, купівлі-продажу нерухомості',
      icon: '🏠',
      schemaJson: JSON.stringify({
        fields: [
          {
            id: 'housing_type',
            type: 'select',
            label: 'Тип житла',
            required: true,
            options: ['Квартира', 'Будинок', 'Кімната в гуртожитку'],
            step: 1,
          },
          {
            id: 'ownership_type',
            type: 'select',
            label: 'Тип власності',
            required: true,
            options: ['Власність', 'Оренда', 'Соціальне житло', 'Спадщина'],
            step: 1,
          },
          {
            id: 'location',
            type: 'text',
            label: 'Місцезнаходження',
            placeholder: 'Місто, район',
            required: false,
            step: 2,
          },
          {
            id: 'area_size',
            type: 'number',
            label: 'Площа (м²)',
            placeholder: 'Площа в квадратних метрах',
            required: false,
            step: 2,
          },
          {
            id: 'contract_date',
            type: 'date',
            label: 'Дата договору / початку проблеми',
            required: false,
            step: 2,
          },
          {
            id: 'problem_description',
            type: 'textarea',
            label: 'Опис проблеми',
            placeholder: 'Детально опишіть ситуацію, вкажіть всі важливі обставини...',
            required: true,
            step: 3,
          },
        ],
      }),
      isActive: true,
    },
    {
      title: 'Сімейне право',
      description: 'Питання шлюбу, розлучення, аліментів',
      icon: '👨‍👩‍👧',
      schemaJson: JSON.stringify({
        fields: [
          {
            id: 'family_issue',
            type: 'select',
            label: 'Тип питання',
            required: true,
            options: ['Розлучення', 'Аліменти', 'Опіка', 'Інше'],
            step: 1,
          },
          {
            id: 'spouse_agreement',
            type: 'select',
            label: 'Позиція сторін',
            required: true,
            options: ['Обопільна згода', 'Одностороннє рішення', 'Спірна ситуація'],
            step: 1,
          },
          {
            id: 'marriage_date',
            type: 'date',
            label: 'Дата укладення шлюбу',
            required: false,
            step: 2,
          },
          {
            id: 'children_count',
            type: 'number',
            label: 'Кількість спільних дітей',
            placeholder: '0',
            required: false,
            step: 2,
          },
          {
            id: 'children_ages',
            type: 'text',
            label: 'Вік дітей',
            placeholder: 'Наприклад: 5, 12',
            required: false,
            step: 2,
          },
          {
            id: 'situation',
            type: 'textarea',
            label: 'Опишіть ситуацію',
            placeholder: 'Детально опишіть обставини, вкажіть всі важливі деталі...',
            required: true,
            step: 3,
          },
        ],
      }),
      isActive: true,
    },
  ];

  for (const category of categories) {
    const created = await prisma.wizardCategory.create({ data: category });
    console.log('✅ Created category:', created.title);
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

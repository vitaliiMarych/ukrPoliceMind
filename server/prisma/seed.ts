import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Створення admin користувача
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ukrpolicemind.com' },
    update: {},
    create: {
      email: 'admin@ukrpolicemind.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Створення тестового користувача
  const userPassword = await bcrypt.hash('user123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'user@ukrpolicemind.com' },
    update: {},
    create: {
      email: 'user@ukrpolicemind.com',
      passwordHash: userPassword,
      role: UserRole.USER,
    },
  });

  console.log('✅ Test user created:', user.email);

  // Створення system prompt
  await prisma.systemConfig.upsert({
    where: { key: 'system_prompt' },
    update: {},
    create: {
      key: 'system_prompt',
      value: `Ти - експертний асистент з питань правоохоронної діяльності в Україні.

Твоя роль:
- Надавати точні, структуровані та професійні відповіді
- Посилатися на чинне законодавство України
- Пояснювати складні юридичні терміни простою мовою
- Надавати практичні поради та рекомендації
- Зберігати нейтральність та об'єктивність

Завжди:
- Перевіряй актуальність інформації
- Якщо не впевнений - говори про це
- Рекомендуй звернутися до професійного юриста у складних випадках`,
    },
  });

  console.log('✅ System prompt created');

  // Створення wizard категорій
  const categories = [
    {
      title: 'Звернення до поліції',
      description: 'Допомога у складанні заяви до правоохоронних органів',
      icon: '🚔',
      schemaJson: JSON.stringify({
        fields: [
          {
            id: 'incident_type',
            type: 'select',
            label: 'Тип інциденту',
            options: [
              'Крадіжка',
              'Шахрайство',
              'Побиття',
              'Погроза',
              'Інше',
            ],
            required: true,
          },
          {
            id: 'incident_date',
            type: 'date',
            label: 'Дата інциденту',
            required: true,
          },
          {
            id: 'incident_location',
            type: 'text',
            label: 'Місце події',
            required: true,
          },
          {
            id: 'incident_description',
            type: 'textarea',
            label: 'Опис події',
            required: true,
          },
          {
            id: 'witnesses',
            type: 'textarea',
            label: 'Свідки (якщо є)',
            required: false,
          },
        ],
      }),
      isActive: true,
    },
    {
      title: 'Права при затриманні',
      description: 'Консультація щодо ваших прав при спілкуванні з поліцією',
      icon: '⚖️',
      schemaJson: JSON.stringify({
        fields: [
          {
            id: 'detention_type',
            type: 'select',
            label: 'Тип затримання',
            options: [
              'Зупинка на вулиці',
              'Затримання в автомобілі',
              'Затримання вдома',
              'Затримання на роботі',
              'Інше',
            ],
            required: true,
          },
          {
            id: 'reason_known',
            type: 'radio',
            label: 'Чи повідомили причину затримання?',
            options: ['Так', 'Ні'],
            required: true,
          },
          {
            id: 'documents_requested',
            type: 'checkbox',
            label: 'Які документи вимагали?',
            options: [
              'Паспорт',
              'Довідка про місце проживання',
              'Водійське посвідчення',
              'Інше',
            ],
            required: false,
          },
          {
            id: 'situation_description',
            type: 'textarea',
            label: 'Опишіть ситуацію',
            required: true,
          },
        ],
      }),
      isActive: true,
    },
    {
      title: 'Адміністративні правопорушення',
      description: 'Консультація з питань адміністративної відповідальності',
      icon: '📋',
      schemaJson: JSON.stringify({
        fields: [
          {
            id: 'violation_type',
            type: 'select',
            label: 'Тип правопорушення',
            options: [
              'ПДР (порушення правил дорожнього руху)',
              'Дрібне хуліганство',
              'Порушення тиші',
              'Розпивання алкоголю в громадських місцях',
              'Інше',
            ],
            required: true,
          },
          {
            id: 'protocol_issued',
            type: 'radio',
            label: 'Чи складено протокол?',
            options: ['Так', 'Ні'],
            required: true,
          },
          {
            id: 'penalty_amount',
            type: 'text',
            label: 'Сума штрафу (якщо відома)',
            required: false,
          },
          {
            id: 'question',
            type: 'textarea',
            label: 'Ваше питання',
            required: true,
          },
        ],
      }),
      isActive: true,
    },
  ];

  for (const category of categories) {
    await prisma.wizardCategory.upsert({
      where: { id: category.title }, // Використовуємо title як унікальний ідентифікатор
      update: {},
      create: category,
    });
    console.log(`✅ Wizard category created: ${category.title}`);
  }

  console.log('🎉 Seed completed successfully!');
  console.log('\n📝 Test credentials:');
  console.log('Admin: admin@ukrpolicemind.com / admin123');
  console.log('User: user@ukrpolicemind.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

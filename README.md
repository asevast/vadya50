# Vadya50 — Интерактивное поздравление с 50-летием

Интерактивное веб-приложение для отправки и просмотра поздравлений с 50-летием. Поддерживает три формата: текст, аудио и видео, с 3D графикой, частицами и современным дизайном в стиле "Luxury Dark Maximalism".

## 🌟 Особенности

- **Три формата поздравлений**: текст, аудиозапись, видео
- **3D графика**: металлизированная цифра «50» с эффектом bloom (React Three Fiber)
- **Эффекты частиц**: золотые частицы и конфетти (tsparticles)
- **Запись аудио/видео**: через браузерный MediaDevices API
- **Стена поздравлений**: masonry grid с бесконечной прокруткой
- **Уведомления в Telegram**: автоматическая отправка в канал
- **Ограничение запросов**: rate limiting (3 поздравления/IP/час)

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- Docker & Docker Compose (для локального Supabase и Redis)
- npm или yarn

### 1. Установка зависимостей

```bash
npm install
```

### 2. Запуск локальных сервисов (Supabase + Redis)

```bash
docker-compose up -d
```

Это поднимет:
- **Supabase PostgreSQL** на порту 54322
- **Redis** на порту 6379

### 3. Настройка переменных окружения

Скопируйте `.env.local.example` в `.env.local` и заполните:

```bash
cp .env.local.example .env.local
```

Минимальные значения для локальной разработки:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54322
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...  # Получите из Supabase
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...      # Получите из Supabase
TELEGRAM_BOT_TOKEN=123456:ABC...        # Опционально
TELEGRAM_CHANNEL_ID=@channel             # Опционально
UPSTASH_REDIS_REST_URL=http://localhost:6379
UPSTASH_REDIS_REST_TOKEN=                # Опционально
```

**Примечание**: Для Supabase выполните начальную миграцию после создания проекта в Supabase:
```bash
npx supabase db push
```

### 4. Сборка и запуск

**Режим разработки:**
```bash
npm run dev
```
Приложение будет доступно на http://localhost:3000

**Production сборка:**
```bash
npm run build
npm start
```

## 🛠️ Команды разработки

| Команда | Описание |
|---------|---------|
| `npm run dev` | Локальный сервер разработки (http://localhost:3000) |
| `npm run build` | Production сборка |
| `npm start` | Запуск production сборки |
| `npm run lint` | Запуск Biome (линтинг + форматирование) |
| `npm run lint:fix` | Автоматическое исправление ошибок Biome |
| `npm run type-check` | Проверка типов TypeScript |
| `npm run test` | Запуск Vitest unit-тестов |
| `npm run test:ui` | Vitest UI для отладки тестов |
| `npm run test:e2e` | Запуск Playwright E2E-тестов |
| `npm run prepare` | Установка Husky git хуков |

## 🗂️ Структура проекта

```
vadya50/
├── app/
│   ├── api/                    # API routes
│   │   ├── congratulations/   # Создание и получение поздравлений
│   │   └── upload/            # Предзагрузка медиафайлов
│   ├── congratulations/[slug]/ # Страница просмотра поздравления
│   ├── wall/                   # Стена всех поздравлений
│   ├── globals.css            # Глобальные стили и дизайн-токены
│   ├── layout.tsx             # Корневой layout
│   └── page.tsx               # Главная страница (hero + форма)
├── components/
│   ├── hero/                  # Hero section (3D, частицы)
│   ├── congratulation-form/  # Форма отправки с вкладками
│   ├── cards/                # Карточка поздравления
│   ├── shared/               # Shared UI (модалки, плееры)
│   ├── layout/               # Header, Footer (в будущем)
│   └── ui/                   # shadcn/ui компоненты
├── lib/
│   ├── supabase/             # Supabase клиенты (client, server, storage)
│   ├── telegram.ts           # Интеграция с Telegram Bot API
│   ├── validations.ts        # Zod схемы валидации
│   └── utils.ts              # Вспомогательные функции
├── hooks/                    # Кастомные React хуки
│   ├── useMediaRecorder.ts   # Запись аудио/видео
│   └── useCongratulation.ts  # Работа с API создания поздравлений
├── types/                    # Глобальные TypeScript типы
├── supabase/
│   └── migrations/          # SQL миграции
│       └── 001_initial.sql  # Начальная схема БД
├── docker-compose.yml       # Локальные сервисы (Supabase, Redis)
└── .env.local.example       # Шаблон переменных окружения
```

## 🗄️ База данных (Supabase)

### Таблица `congratulations`

```sql
CREATE TABLE congratulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  author_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text','audio','video')),
  message TEXT,
  media_url TEXT,
  media_key TEXT,
  duration_sec INTEGER,
  thumbnail_url TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Индексы:
- `idx_congratulations_slug`
- `idx_congratulations_type`
- `idx_congratulations_created_at DESC`

### Storage бакеты
- `congratulations-audio` — для аудиофайлов (.webm, .mp3, .ogg)
- `congratulations-video` — для видеофайлов (.webm, .mp4)

## 🔐 Безопасность

- **Rate limiting**: 3 поздравления с одного IP в час через Upstash Redis
- **Валидация файлов**: проверка MIME-типа и размера (audio ≤50MB, video ≤200MB)
- **Row Level Security**: включена, публичное чтение только одобренных записей
- **Sanitization**: HTML санитизация через DOMPurify на фронтенде
- **CORS**: только доверенные домены в API routes

## 🎨 Дизайн-система

### Цвета (Luxury Dark Maximalism)
- `--background-primary`: #0A0A0F (тёмно-синий фон)
- `--color-gold`: #FFD700 (золотой акцент)
- `--color-electric-blue`: #00D4FF (электрик-синий)

### Типографика
- **Display**: Playfair Display (заголовки, цифра «50»)
- **Body**: Plus Jakarta Sans (основной текст)

### Анимации
- Framer Motion: layout transitions, staggered анимации, confetti bursts
- tsparticles: золотые частицы на hero-секции
- Glassmorphism: `backdrop-filter: blur(20px)` с полупрозрачными карточками

## 📱 Доступность (A11y)

- Полная keyboard-навигация
- ARIA-лейблы для всех интерактивных элементов
- `prefers-reduced-motion` поддержка
- Альтернативный текст и captions для медиа
- Достаточный контраст (WCAG 2.1 AA)

## ⚡ Производительность

**Цели Core Web Vitals:**
- LCP < 2.5s
- CLS < 0.1
- INP < 200ms

**Оптимизации:**
- Ленивая загрузка тяжелых компонентов (Three.js, Wavesurfer)
- Next.js Image Optimization для thumbnail и OG-изображений
- Prefetch `/wall` при hover на CTA кнопку
- Supabase Storage CDN для медиафайлов
- ISR (revalidate 60s) для страниц поздравлений

## 🧪 Тестирование

### Unit-тесты (Vitest)
- Валидация Zod схем
- Форматирование дат и slug генерация
- Форматирование Telegram сообщений
- Кастомные хуки

Запуск:
```bash
npm run test
```

### E2E-тесты (Playwright)
- Happy path (текст/аудио/видео)
- Rate limiting
- Валидация форм
- Загрузка невалидных файлов

Запуск:
```bash
npm run test:e2e
```

## 🚀 Деплой

### Необходимые переменные окружения

| Переменная | Описание | Обязательная |
|------------|----------|--------------|
| `NEXT_PUBLIC_APP_URL` | URL приложения (например, https://vadya50.ru) | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase проекта | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Анонимный ключ Supabase | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role ключ Supabase (server-only) | ✅ |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота | ❌ |
| `TELEGRAM_CHANNEL_ID` | ID канала/чата для уведомлений | ❌ |
| `UPSTASH_REDIS_REST_URL` | URL Redis для rate limiting | ❌ |
| `UPSTASH_REDIS_REST_TOKEN` | Токен Redis | ❌ |

### Рекомендуемые платформы

- **Vercel** (Next.js 15-first, автоматическая настройка)
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**

### Шаги деплоя на Vercel

1. Push кода в GitHub/GitLab/Bitbucket
2. Создайте новый проект в Vercel и подключите репозиторий
3. Добавьте переменные окружения в Vercel Dashboard
4. Настройте Supabase как внешний ресурс
5. Deploy!

## 📚 Документация

- [Документ отклонений от ТЗ](docs/отклонения-от-тз.md)
- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [Framer Motion](https://www.framer.com/motion/)
- [shadcn/ui](https://ui.shadcn.com/)
- [tsparticles](https://particles.js.org/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)

## 📝 Лицензия

ISC

## 🙏 Благодарности

Проект создан с использованием современных open-source технологий: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Three.js и многих других.

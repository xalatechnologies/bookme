# Booknor Coding Standards

## 🎯 Overview

This document defines comprehensive coding standards for the Booknor project, emphasizing consistency, maintainability, and best practices across all development aspects.

## 🧩 Components & Architecture

### Functional Components

```typescript
// ✅ REQUIRED: Functional components with proper typing
"use client";

import React from 'react';

interface UserProfileProps {
  readonly user: {
    readonly id: string;
    readonly name: string;
    readonly email: string;
  };
  readonly onEdit: (userId: string) => void;
}

export const UserProfile = ({ user, onEdit }: UserProfileProps): JSX.Element => {
  const handleEdit = () => {
    onEdit(user.id);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
      <h2 className="text-xl font-semibold">{user.name}</h2>
      <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
      <button 
        onClick={handleEdit}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Edit Profile
      </button>
    </div>
  );
};
```

### Component Organization

```
src/components/
├── ui/                 # Basic UI components (Button, Input, Modal)
├── forms/              # Form-specific components
├── layout/             # Layout components (Header, Sidebar, Footer)
├── icons/              # Custom icon components
└── blocks/             # Complex page sections
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Files**: PascalCase for components, camelCase for utilities
- **Functions**: camelCase (`getUserById`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_ENDPOINTS`)
- **Types/Interfaces**: PascalCase (`UserProfile`, `ApiResponse`)

## 🗄️ Prisma Database Management

### Schema Design

```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  avatar    String?
  role      UserRole @default(USER)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  articles Article[]
  sessions Session[]

  @@map("users")
}

model Article {
  id           String        @id @default(cuid())
  title        String
  content      String        @db.Text
  slug         String        @unique
  status       ArticleStatus @default(DRAFT)
  authorId     String        @map("author_id")
  publishedAt  DateTime?     @map("published_at")
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")

  author User @relation(fields: [authorId], references: [id])

  @@map("articles")
}

enum UserRole {
  ADMIN
  EDITOR
  USER
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### Database Operations

```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}

// ✅ REQUIRED: Use Prisma methods, never raw SQL
export const getUserArticles = async (userId: string) => {
  return await db.article.findMany({
    where: { authorId: userId },
    include: { author: true },
    orderBy: { createdAt: 'desc' }
  });
};

// ✅ REQUIRED: Always use migrations
// Run: npx prisma migrate dev --name add_article_model
// NEVER use: npx prisma db push
```

## 🎨 Icon Management

### Lucide React Icons (Primary)

```typescript
// ✅ REQUIRED: Import Lucide icons in PascalCase
import { User, Settings, ChevronRight, ArrowLeft } from 'lucide-react';

export const NavigationMenu = (): JSX.Element => {
  return (
    <nav className="flex items-center space-x-4">
      <User className="h-5 w-5" />
      <Settings className="h-5 w-5" />
      <ChevronRight className="h-4 w-4" />
    </nav>
  );
};
```

### Custom Icons

```typescript
// src/components/icons/BooknorLogo.tsx
import React from 'react';

interface BooknorLogoProps {
  readonly size?: number;
  readonly className?: string;
}

export const BooknorLogo = ({ 
  size = 24, 
  className = '' 
}: BooknorLogoProps): JSX.Element => {
  return (
    <svg 
      width={size} 
      height={size} 
      className={className}
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      {/* SVG content */}
    </svg>
  );
};
```

## 🔔 Toast Notifications

### React Toastify Integration

```typescript
// ✅ REQUIRED: Use react-toastify for all notifications
"use client";

import { toast } from 'react-toastify';

export const useNotifications = () => {
  const showSuccess = (message: string) => {
    toast.success(message);
  };

  const showError = (message: string) => {
    toast.error(message);
  };

  const showInfo = (message: string) => {
    toast.info(message);
  };

  const showWarning = (message: string) => {
    toast.warning(message);
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
};

// Usage in components
export const ArticleForm = (): JSX.Element => {
  const { showSuccess, showError } = useNotifications();

  const handleSubmit = async () => {
    try {
      await saveArticle();
      showSuccess('Article saved successfully!');
    } catch (error) {
      showError('Failed to save article');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form content */}
    </form>
  );
};
```

## 📱 Next.js App Router Structure

### Directory Organization

```
src/app/
├── (auth)/
│   ├── login/
│   └── register/
├── (dashboard)/
│   ├── articles/
│   ├── analytics/
│   └── settings/
├── api/
│   ├── auth/
│   ├── articles/
│   └── upload/
├── globals.css
├── layout.tsx
└── page.tsx
```

### Server vs Client Components

```typescript
// ✅ Server Component (default)
// src/app/(dashboard)/articles/page.tsx
import { getArticles } from '@/lib/api/articles';

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <div>
      <h1>Articles</h1>
      <ArticleList articles={articles} />
    </div>
  );
}

// ✅ Client Component (when needed)
// src/components/forms/ArticleForm.tsx
"use client";

import React, { useState } from 'react';

export const ArticleForm = (): JSX.Element => {
  const [title, setTitle] = useState('');

  return (
    <form>
      <input 
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Article title"
      />
    </form>
  );
};
```

### Authentication Integration

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { db } from '@/lib/db';

const handler = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    // Provider configuration
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    session: ({ session, token }) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    }
  }
});

export { handler as GET, handler as POST };
```

## 🔗 tRPC Integration

### Router Structure

```typescript
// src/lib/api/routers/articles.ts
import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';

export const articlesRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(10)
    }))
    .query(async ({ input, ctx }) => {
      const articles = await ctx.db.article.findMany({
        skip: (input.page - 1) * input.limit,
        take: input.limit,
        include: { author: true }
      });
      return articles;
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      content: z.string().min(1),
      status: z.enum(['DRAFT', 'PUBLISHED'])
    }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.article.create({
        data: {
          ...input,
          authorId: ctx.session.user.id
        }
      });
    })
});
```

### Client Usage

```typescript
// Client component usage
"use client";

import { api } from '@/lib/trpc/react';

export const ArticlesList = (): JSX.Element => {
  const { data: articles, isLoading } = api.articles.getAll.useQuery({
    page: 1,
    limit: 10
  });

  const createArticle = api.articles.create.useMutation();

  const handleCreate = async () => {
    await createArticle.mutateAsync({
      title: 'New Article',
      content: 'Article content...',
      status: 'DRAFT'
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {articles?.map(article => (
        <div key={article.id}>{article.title}</div>
      ))}
    </div>
  );
};
```

## 📝 TypeScript Standards

### Strict Configuration

```typescript
// ✅ REQUIRED: Avoid any type
interface UserData {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

// ❌ FORBIDDEN: Using any
const userData: any = await fetchUser(); // NEVER DO THIS

// ✅ REQUIRED: Use union types instead of enums
const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
} as const;

type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

// ✅ REQUIRED: Optional chaining
const userTheme = user?.preferences?.theme ?? 'light';
```

## 📁 File Structure & Naming

### Route Naming (kebab-case)

```
src/app/
├── dashboard/           # ✅ kebab-case
├── user-profile/        # ✅ kebab-case
├── article-editor/      # ✅ kebab-case
└── media-library/       # ✅ kebab-case
```

### Import Organization

```typescript
// ✅ REQUIRED: Import order
// 1. External libraries
import React from 'react';
import { NextPage } from 'next';
import { toast } from 'react-toastify';

// 2. Internal libraries/utilities
import { api } from '@/lib/trpc/react';
import { cn } from '@/lib/utils/shared';

// 3. Sibling imports
import { UserCard } from './UserCard';
import { ArticleForm } from './ArticleForm';

// 4. Styles (if any)
import './styles.css';
```

### Type Definitions

```typescript
// src/lib/types.ts
export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
}

export interface Article {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly authorId: string;
  readonly status: ArticleStatus;
}

export type ApiResponse<T> = {
  readonly success: boolean;
  readonly data: T;
  readonly message?: string;
};
```

## 🎨 Tailwind CSS Usage

### Mobile-First Design

```typescript
// ✅ REQUIRED: Mobile-first responsive classes
<div className="
  p-4 sm:p-6 lg:p-8
  text-sm sm:text-base lg:text-lg
  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
  gap-4 sm:gap-6 lg:gap-8
">
  Content
</div>

// ✅ REQUIRED: Dark mode support
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    Title
  </h1>
</div>
```

### Custom Theme Configuration

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out'
      }
    }
  }
};
```

### Framer Motion Integration

```typescript
// ✅ REQUIRED: Use Framer Motion for animations
import { motion } from 'framer-motion';

export const AnimatedCard = ({ children }: { children: React.ReactNode }): JSX.Element => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
    >
      {children}
    </motion.div>
  );
};
```

## ⚡ Inngest Background Jobs

### Configuration

```typescript
// inngest.config.ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({ 
  id: 'booknor',
  name: 'Booknor Background Jobs' 
});
```

### Job Definitions

```typescript
// src/lib/jobs/processArticle.ts
import { inngest } from '../../inngest.config';

export const processArticle = inngest.createFunction(
  { id: 'process-article', name: 'Process Article' },
  { event: 'article.created' },
  async ({ event, step }) => {
    const { articleId } = event.data;

    // Step 1: Generate SEO metadata
    const seoData = await step.run('generate-seo', async () => {
      return generateSEOMetadata(articleId);
    });

    // Step 2: Create social media preview
    const preview = await step.run('create-preview', async () => {
      return createSocialPreview(articleId);
    });

    // Step 3: Update article with processed data
    await step.run('update-article', async () => {
      return updateArticleMetadata(articleId, { seoData, preview });
    });

    return { success: true, articleId };
  }
);
```

### API Route

```typescript
// src/app/api/inngest/route.ts
import { serve } from 'inngest/next';
import { inngest } from '../../../inngest.config';
import { processArticle } from '@/lib/jobs/processArticle';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processArticle,
    // Other functions...
  ]
});
```

## 🤖 AI Integration

### Centralized AI Client

```typescript
// src/lib/aiClient.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const generateChatCompletion = async (
  messages: Array<{ role: string; content: string }>,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
) => {
  const response = await openai.chat.completions.create({
    model: options?.model || 'o1-preview', // ✅ REQUIRED: Use O1 model
    messages,
    temperature: options?.temperature || 0.7,
    max_tokens: options?.maxTokens || 1000
  });

  return response.choices[0]?.message?.content || '';
};

// Usage example
export const generateArticleSummary = async (content: string): Promise<string> => {
  return await generateChatCompletion([
    {
      role: 'system',
      content: 'Generate a concise summary of the following article content.'
    },
    {
      role: 'user',
      content: content
    }
  ]);
};
```

## 📚 Storybook Integration

### Story Organization

```
src/stories/
├── components/
│   ├── Button.stories.tsx
│   ├── Card.stories.tsx
│   └── Modal.stories.tsx
├── pages/
│   └── Dashboard.stories.tsx
└── layouts/
    └── MainLayout.stories.tsx
```

### Story Example

```typescript
// src/stories/components/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      autodocs: true
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'danger']
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'base', 'lg']
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button'
  }
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Loading...'
  }
};
```

## 🛠️ Build & Deployment Workflow

### Pre-Commit Requirements

```bash
# ✅ REQUIRED: Always build before committing
npm run build

# Fix any errors (ignore warnings)
# Then update project log
echo "- Added comprehensive shadcn/ui integration standards" >> .project-updates

# Commit with semantic message
git add .
git commit -m "docs: add comprehensive coding standards with shadcn/ui integration"
```

### Project Updates Tracking

```markdown
<!-- .project-updates -->
# Booknor Project Updates

## Recent Changes

- Added comprehensive coding standards documentation
- Implemented shadcn/ui-first UI development approach
- Created TypeScript strict typing requirements
- Set up Inngest background job processing
- Configured Storybook for component development
- Established tRPC API architecture patterns
```

## 📋 Quality Checklist

**Before every commit, verify:**

- [ ] ✅ Components use shadcn/ui library
- [ ] ✅ TypeScript strict mode with no `any` types
- [ ] ✅ Proper import organization (external → internal → sibling)
- [ ] ✅ Mobile-first Tailwind CSS classes
- [ ] ✅ Dark mode compatibility
- [ ] ✅ Accessibility attributes included
- [ ] ✅ tRPC procedures use Zod validation
- [ ] ✅ Database operations use Prisma (no raw SQL)
- [ ] ✅ Toast notifications for user feedback
- [ ] ✅ Project builds successfully (`npm run build`)
- [ ] ✅ `.project-updates` file updated
- [ ] ✅ Semantic commit message format
- [ ] ✅ No console.log statements in production code

## 🎯 Success Metrics

**Every code contribution MUST achieve:**
- ✅ 100% shadcn/ui component usage for UI
- ✅ Zero TypeScript errors or warnings
- ✅ Responsive design with dark mode support
- ✅ Accessibility compliance (WCAG AA)
- ✅ Clean build without errors
- ✅ Proper file organization and naming
- ✅ Comprehensive error handling
- ✅ Type-safe API interactions
- ✅ No console.log statements

**VIOLATION CONSEQUENCES**: Code that doesn't meet these standards will be rejected during review and must be refactored to comply with all requirements.
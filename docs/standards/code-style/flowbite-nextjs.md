# Flowbite Next.js Integration Guide

## Installation & Configuration

### Package Installation
```bash
npm install flowbite flowbite-react
npm install -D tailwindcss postcss autoprefixer
```

### Tailwind Configuration
```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/flowbite-react/**/*.js',
    './public/**/*.html',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin')
  ],
}
```

### Global CSS Setup
```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## App Router Integration

### Layout Component
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'
import './globals.css'
import { Flowbite } from 'flowbite-react'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Flowbite>
          {children}
        </Flowbite>
      </body>
    </html>
  )
}
```

### Page Components
```typescript
// app/page.tsx
import { Button, Card, Navbar } from 'flowbite-react'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar fluid rounded>
        <Navbar.Brand href="/">
          <span className="text-xl font-semibold">My App</span>
        </Navbar.Brand>
      </Navbar>
      
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-sm mx-auto">
          <h1 className="text-2xl font-bold">Welcome</h1>
          <p className="text-gray-700">
            This is a Next.js app with Flowbite components.
          </p>
          <Button href="/about">Learn More</Button>
        </Card>
      </div>
    </main>
  )
}
```

## Server-Side Rendering (SSR)

### Static Generation with Flowbite
```typescript
// app/products/page.tsx
import { Card, Badge } from 'flowbite-react'

interface Product {
  id: string
  name: string
  price: number
  category: string
}

async function getProducts(): Promise<Product[]> {
  // Fetch data from API
  const res = await fetch('https://api.example.com/products')
  return res.json()
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id}>
          <h5 className="text-xl font-bold">{product.name}</h5>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">${product.price}</span>
            <Badge color="info">{product.category}</Badge>
          </div>
        </Card>
      ))}
    </div>
  )
}
```

## Client Components

### Interactive Components
```typescript
// components/SearchForm.tsx
'use client'

import { useState } from 'react'
import { TextInput, Button, Spinner } from 'flowbite-react'
import { HiSearch } from 'react-icons/hi'

export default function SearchForm() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Perform search
      await searchProducts(query)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <TextInput
        type="search"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        icon={HiSearch}
        className="flex-1"
      />
      <Button type="submit" disabled={loading}>
        {loading ? <Spinner size="sm" /> : 'Search'}
      </Button>
    </form>
  )
}
```

## Dark Mode Integration

### Theme Provider Setup
```typescript
// components/ThemeProvider.tsx
'use client'

import { Flowbite } from 'flowbite-react'
import { useTheme } from 'next-themes'

const customTheme = {
  button: {
    color: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600'
    }
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <Flowbite theme={{ theme: customTheme }}>
      {children}
    </Flowbite>
  )
}
```

### Dark Mode Toggle
```typescript
// components/DarkModeToggle.tsx
'use client'

import { useTheme } from 'next-themes'
import { Button } from 'flowbite-react'
import { HiMoon, HiSun } from 'react-icons/hi'

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      color="gray"
      size="sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <HiSun /> : <HiMoon />}
    </Button>
  )
}
```

## API Routes Integration

### Form Handling with API Routes
```typescript
// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const data = await request.json()
  
  // Process form data
  console.log('Contact form:', data)
  
  return NextResponse.json({ success: true })
}
```

```typescript
// components/ContactForm.tsx
'use client'

import { useState } from 'react'
import { Label, TextInput, Textarea, Button, Alert } from 'flowbite-react'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    
    if (response.ok) {
      setSuccess(true)
      setFormData({ name: '', email: '', message: '' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <Alert color="success">
          Message sent successfully!
        </Alert>
      )}
      
      <div>
        <Label htmlFor="name" value="Name" />
        <TextInput
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="email" value="Email" />
        <TextInput
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="message" value="Message" />
        <Textarea
          id="message"
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          required
        />
      </div>
      
      <Button type="submit">Send Message</Button>
    </form>
  )
}
```

## Performance Optimization

### Dynamic Imports
```typescript
// components/LazyModal.tsx
import dynamic from 'next/dynamic'

const Modal = dynamic(() => import('flowbite-react').then(mod => ({ default: mod.Modal })), {
  loading: () => <div>Loading modal...</div>
})

export default function LazyModal() {
  return <Modal>Content</Modal>
}
```

### Image Optimization with Flowbite
```typescript
import Image from 'next/image'
import { Card } from 'flowbite-react'

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Card>
      <div className="relative h-48 w-full">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover rounded-t-lg"
        />
      </div>
      <h5 className="text-xl font-bold">{product.name}</h5>
      <p className="text-gray-700">{product.description}</p>
    </Card>
  )
}
```

## Deployment Considerations

### Vercel Deployment
```json
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "@vercel/node"
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/app/$1"
    }
  ]
}
```

### Build Optimization
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig
```
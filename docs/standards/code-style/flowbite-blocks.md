# Flowbite Blocks

Comprehensive guide for implementing Flowbite Blocks - pre-built sections and page layouts for rapid web development.

## Overview

Flowbite Blocks provides ready-to-use website sections including heroes, features, testimonials, pricing, CTAs, and complete page layouts.

### Installation

```bash
npm install flowbite-react flowbite
npm install react-icons lucide-react
```

### Configuration

```typescript
// tailwind.config.js
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/flowbite-react/**/*.js',
  ],
  plugins: [require('flowbite/plugin')],
};
```

## Hero Sections

### Modern Hero with CTA
```typescript
import { Button } from 'flowbite-react';
import { HiPlay, HiArrowRight } from 'react-icons/hi';

const ModernHero: React.FC = () => {
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
          We invest in the world's potential
        </h1>
        
        <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
          Here at Flowbite we focus on markets where technology, innovation, and capital can unlock long-term value.
        </p>
        
        <div className="flex flex-col mb-8 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
          <Button size="lg">
            Learn more
            <HiArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <Button color="gray" size="lg">
            <HiPlay className="mr-2 w-5 h-5" />
            Watch video
          </Button>
        </div>
      </div>
    </section>
  );
};
```

## Feature Sections

### Feature Grid with Icons
```typescript
import { Card } from 'flowbite-react';
import { HiShieldCheck, HiLightningBolt, HiGlobe } from 'react-icons/hi';

const FeatureGrid: React.FC = () => {
  const features = [
    {
      title: 'Security First',
      description: 'Enterprise-grade security with end-to-end encryption.',
      icon: HiShieldCheck,
    },
    {
      title: 'Lightning Fast',
      description: 'Optimized performance with global CDN.',
      icon: HiLightningBolt,
    },
    {
      title: 'Global Scale',
      description: 'Deploy worldwide with multi-region support.',
      icon: HiGlobe,
    },
  ];

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16">
        <div className="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-12 md:space-y-0">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <div className="flex justify-center mb-4">
                <feature.icon className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="text-gray-500">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
```

## Testimonial Sections

### Customer Testimonials
```typescript
import { Card, Avatar, Rating } from 'flowbite-react';

const TestimonialGrid: React.FC = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO at TechCorp',
      avatar: '/avatars/sarah.jpg',
      content: 'Flowbite has transformed how we build applications.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Lead Developer',
      avatar: '/avatars/michael.jpg',
      content: 'Development speed increased dramatically with Flowbite.',
      rating: 5,
    },
  ];

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16">
        <h2 className="mb-4 text-4xl font-extrabold text-gray-900 dark:text-white">
          Testimonials
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 text-center">
              <blockquote className="mb-4 text-gray-500">
                "{testimonial.content}"
              </blockquote>
              
              <div className="flex items-center justify-center space-x-3">
                <Avatar img={testimonial.avatar} alt={testimonial.name} rounded />
                <div className="text-left">
                  <div className="font-medium">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                  <Rating size="sm">
                    {[...Array(5)].map((_, i) => (
                      <Rating.Star key={i} filled={i < testimonial.rating} />
                    ))}
                  </Rating>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
```

## Pricing Sections

### Pricing Table
```typescript
import { Button, Card, Badge } from 'flowbite-react';
import { HiCheck, HiX } from 'react-icons/hi';

const PricingTable: React.FC = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      features: [
        { name: 'Individual configuration', included: true },
        { name: 'Team size: 1 developer', included: true },
        { name: 'Premium support', included: false },
      ],
      buttonText: 'Get started',
    },
    {
      name: 'Company',
      price: '$99',
      period: '/month',
      popular: true,
      features: [
        { name: 'Individual configuration', included: true },
        { name: 'Team size: 10 developers', included: true },
        { name: 'Premium support', included: true },
      ],
      buttonText: 'Get started',
    },
  ];

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16">
        <div className="space-y-8 lg:grid lg:grid-cols-2 lg:gap-10 lg:space-y-0">
          {plans.map((plan, index) => (
            <Card key={index} className={`p-6 text-center ${plan.popular ? 'border-primary-600' : ''}`}>
              {plan.popular && (
                <Badge color="info" className="mb-4">Most popular</Badge>
              )}
              
              <h3 className="mb-4 text-2xl font-semibold">{plan.name}</h3>
              
              <div className="flex justify-center items-baseline my-8">
                <span className="text-5xl font-extrabold">{plan.price}</span>
                <span className="text-gray-500">{plan.period}</span>
              </div>
              
              <ul className="mb-8 space-y-4 text-left">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    {feature.included ? (
                      <HiCheck className="w-5 h-5 text-green-500" />
                    ) : (
                      <HiX className="w-5 h-5 text-gray-400" />
                    )}
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>
              
              <Button>{plan.buttonText}</Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
```

## Best Practices

### Component Organization
```typescript
// ✅ Organize blocks in dedicated directories
// /components/blocks/
//   ├── heroes/
//   ├── features/
//   ├── testimonials/
//   ├── pricing/
//   └── cta/

interface BlockProps {
  className?: string;
  id?: string;
}
```

### Responsive Design
```typescript
// ✅ Use responsive utilities
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Block content */}
</div>
```
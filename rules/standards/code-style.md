# Code Style Guide

## Context

Global code style rules for Agent OS projects.

<conditional-block context-check="general-formatting">
IF this General Formatting section already read in current context:
  SKIP: Re-reading this section
  NOTE: "Using General Formatting rules already in context"
ELSE:
  READ: The following formatting rules

## General Formatting

### Indentation
- Use 2 spaces for indentation (never tabs)
- Maintain consistent indentation throughout files
- Align nested structures for readability

### Naming Conventions

#### PHP/Laravel
- **Methods and Variables**: Use camelCase (e.g., `userProfile`, `calculateTotal`)
- **Classes and Models**: Use PascalCase (e.g., `UserProfile`, `PaymentProcessor`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Database Tables**: Use snake_case plural (e.g., `user_profiles`, `payment_transactions`)
- **Database Columns**: Use snake_case (e.g., `created_at`, `user_id`)

#### TypeScript/JavaScript
- **Variables and Functions**: Use camelCase (e.g., `userName`, `handleSubmit`)
- **Classes and Components**: Use PascalCase (e.g., `UserProfile`, `PaymentForm`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Interfaces**: Use PascalCase with 'I' prefix (e.g., `IUserData`, `IApiResponse`)
- **Types**: Use PascalCase (e.g., `UserType`, `PaymentStatus`)

### String Formatting

#### PHP
- Use single quotes for simple strings: `'Hello World'`
- Use double quotes for interpolation: `"Hello {$name}"`
- Use heredoc/nowdoc for multi-line strings

#### TypeScript/JavaScript
- Use single quotes for strings: `'Hello World'`
- Use template literals for interpolation: `` `Hello ${name}` ``
- Use template literals for multi-line strings

### Code Comments
- Add brief comments above non-obvious business logic
- Document complex algorithms or calculations
- Explain the "why" behind implementation choices
- Never remove existing comments unless removing the associated code
- Update comments when modifying code to maintain accuracy
- Keep comments concise and relevant

### shadcn/ui Component Usage
- **Always prefer shadcn/ui components** over custom HTML elements
- Import components from `@/components/ui`: `import { Button } from "@/components/ui/button"`
- Use shadcn/ui's variant-based styling instead of custom CSS classes
- Follow shadcn/ui's naming conventions for component props
- Leverage shadcn/ui's built-in TypeScript definitions (built on Radix UI)
</conditional-block>

<conditional-block task-condition="html-css-tailwind" context-check="html-css-style">
IF current task involves writing or updating HTML, CSS, or TailwindCSS:
  IF html-style.md AND css-style.md already in context:
    SKIP: Re-reading these files
    NOTE: "Using HTML/CSS style guides already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get HTML formatting rules from code-style/html-style.md"
        REQUEST: "Get CSS and TailwindCSS rules from code-style/css-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ the following style guides (only if not already in context):
        - @.agent-os/standards/code-style/html-style.md (if not in context)
        - @.agent-os/standards/code-style/css-style.md (if not in context)
        - @.agent-os/standards/code-style/ui-components.md (if not in context)
    </context_fetcher_strategy>
ELSE:
  SKIP: HTML/CSS style guides not relevant to current task
</conditional-block>

<conditional-block task-condition="php-laravel" context-check="php-style">
IF current task involves writing or updating PHP/Laravel code:
  IF php-style.md already in context:
    SKIP: Re-reading this file
    NOTE: "Using PHP/Laravel style guide already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get PHP/Laravel style rules from code-style/php-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ: @.agent-os/standards/code-style/php-style.md
    </context_fetcher_strategy>
ELSE:
  SKIP: PHP/Laravel style guide not relevant to current task
</conditional-block>

<conditional-block task-condition="typescript-react" context-check="typescript-style">
IF current task involves writing or updating TypeScript/React code:
  IF typescript-style.md already in context:
    SKIP: Re-reading this file
    NOTE: "Using TypeScript/React style guide already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get TypeScript/React style rules from code-style/typescript-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ: @.agent-os/standards/code-style/typescript-style.md
    </context_fetcher_strategy>

ELSE:
  SKIP: TypeScript/React style guide not relevant to current task
</conditional-block>

<conditional-block task-condition="livewire" context-check="livewire-style">
IF current task involves writing or updating Livewire components:
  IF livewire-style.md already in context:
    SKIP: Re-reading this file
    NOTE: "Using Livewire style guide already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get Livewire style rules from code-style/livewire-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ: @.agent-os/standards/code-style/livewire-style.md
    </context_fetcher_strategy>
ELSE:
  SKIP: Livewire style guide not relevant to current task
</conditional-block>

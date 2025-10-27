# Xaheen MCP Command Templates & Utilities

**Quick reference templates for common Xaheen MCP server operations following CLAUDE.md workflow patterns.**

## Core Workflow Commands

### Session Initialization Sequence

```bash
# 1. Check knowledge base availability
mcp__xaheen__get_available_sources()

# 2. Review project status
mcp__xaheen__list_tasks(
  filter_by="project",
  filter_value="[PROJECT_ID]",
  include_closed=false
)

# 3. Get next priority task
mcp__xaheen__list_tasks(
  filter_by="status",
  filter_value="todo",
  project_id="[PROJECT_ID]"
)
```

### Task Management Flow

**Complete Task Cycle:**
```bash
# Get task details
mcp__xaheen__get_task(task_id="[TASK_ID]")

# Start task
mcp__xaheen__update_task(task_id="[TASK_ID]", status="doing")

# Research phase (see Research Templates below)
# Implementation phase
# Validation phase

# Complete task
mcp__xaheen__update_task(task_id="[TASK_ID]", status="review")
# After validation:
mcp__xaheen__update_task(task_id="[TASK_ID]", status="done")
```

## Research Command Templates

### Pre-Implementation Research Sequence

```bash
# 1. High-level architectural research
mcp__xaheen__perform_rag_query(
  query="[TECHNOLOGY] architecture patterns best practices",
  match_count=5
)

# 2. Security considerations
mcp__xaheen__perform_rag_query(
  query="[FEATURE] security best practices vulnerabilities",
  match_count=3
)

# 3. Implementation examples
mcp__xaheen__search_code_examples(
  query="[SPECIFIC_FEATURE] implementation example",
  match_count=3
)

# 4. Common pitfalls
mcp__xaheen__perform_rag_query(
  query="[TECHNOLOGY] common mistakes antipatterns",
  match_count=2
)
```

### Feature-Specific Research Templates

**Authentication Research:**
```bash
mcp__xaheen__perform_rag_query(
  query="JWT authentication security best practices",
  match_count=5
)
mcp__xaheen__search_code_examples(
  query="Express JWT middleware implementation",
  match_count=3
)
mcp__xaheen__perform_rag_query(
  query="JWT token refresh security patterns",
  match_count=2
)
```

**API Development Research:**
```bash
mcp__xaheen__perform_rag_query(
  query="REST API design principles versioning",
  match_count=4
)
mcp__xaheen__search_code_examples(
  query="Express.js middleware validation setup",
  match_count=2
)
mcp__xaheen__perform_rag_query(
  query="API rate limiting security headers",
  match_count=3
)
```

**Database Research:**
```bash
mcp__xaheen__perform_rag_query(
  query="PostgreSQL connection pooling performance",
  match_count=3
)
mcp__xaheen__search_code_examples(
  query="Prisma database migrations schema",
  match_count=2
)
mcp__xaheen__perform_rag_query(
  query="database security SQL injection prevention",
  match_count=3
)
```

**Frontend Component Research:**
```bash
mcp__xaheen__perform_rag_query(
  query="React component composition patterns",
  match_count=3
)
mcp__xaheen__search_code_examples(
  query="React TypeScript component best practices",
  match_count=3
)
mcp__xaheen__perform_rag_query(
  query="React performance optimization patterns",
  match_count=2
)
```

## Project Management Templates

### Project Scenario Handlers

**New Project Setup:**
```bash
# Create project
mcp__xaheen__create_project(
  title="[PROJECT_NAME]",
  description="[PROJECT_DESCRIPTION]",
  github_repo="[GITHUB_URL]"
)

# Research tech stack
mcp__xaheen__perform_rag_query(
  query="[TECH_STACK] architecture patterns",
  match_count=5
)

# Create initial tasks
mcp__xaheen__create_task(
  project_id="[PROJECT_ID]",
  title="[TASK_TITLE]",
  description="[TASK_DESCRIPTION]",
  task_order=10,
  feature="[FEATURE_NAME]"
)
```

**Existing Project Integration:**
```bash
# Analyze existing project first (read major files)
# Then create project container
mcp__xaheen__create_project(
  title="[EXISTING_PROJECT_NAME]",
  description="Integration of existing codebase"
)

# Create tasks for remaining work only
mcp__xaheen__create_task(
  project_id="[PROJECT_ID]",
  title="[REMAINING_WORK_TASK]",
  description="[WHAT_NEEDS_TO_BE_BUILT]",
  task_order=5
)
```

### Task Creation Templates

**Standard Task Creation:**
```bash
mcp__xaheen__create_task(
  project_id="[PROJECT_ID]",
  title="[SPECIFIC_ACTIONABLE_TITLE]",
  description="[DETAILED_DESCRIPTION_WITH_ACCEPTANCE_CRITERIA]",
  assignee="AI IDE Agent",  # or "User", "Xaheen", etc.
  task_order=10,  # Higher = more priority
  feature="[FEATURE_NAME]",
  sources=[
    {
      "url": "[DOCUMENTATION_URL]",
      "type": "documentation",
      "relevance": "[WHY_RELEVANT]"
    }
  ],
  code_examples=[
    {
      "file": "[FILE_PATH]",
      "function": "[FUNCTION_NAME]",
      "purpose": "[PURPOSE_DESCRIPTION]"
    }
  ]
)
```

**Epic Task with Subtasks:**
```bash
# Main epic task
mcp__xaheen__create_task(
  project_id="[PROJECT_ID]",
  title="Epic: [FEATURE_NAME] Implementation",
  description="Complete implementation of [FEATURE_NAME] with all components",
  task_order=20,
  feature="[FEATURE_NAME]"
)

# Subtasks
mcp__xaheen__create_task(
  project_id="[PROJECT_ID]",
  title="[FEATURE_NAME]: Backend API",
  description="Implement backend API endpoints for [FEATURE_NAME]",
  task_order=15,
  feature="[FEATURE_NAME]"
)
```

## Documentation Management Templates

### Technical Specification Document:**
```bash
mcp__xaheen__create_document(
  project_id="[PROJECT_ID]",
  title="[API_NAME] Specification",
  document_type="spec",
  content={
    "overview": "[API_OVERVIEW]",
    "endpoints": [
      {
        "path": "[ENDPOINT_PATH]",
        "method": "[HTTP_METHOD]",
        "description": "[ENDPOINT_DESCRIPTION]",
        "parameters": {...},
        "responses": {...}
      }
    ],
    "authentication": "[AUTH_METHOD]",
    "version": "[VERSION_NUMBER]"
  },
  tags=["api", "backend", "[FEATURE_TAG]"],
  author="[AUTHOR_NAME]"
)
```

**Design Document:**
```bash
mcp__xaheen__create_document(
  project_id="[PROJECT_ID]",
  title="[FEATURE_NAME] Design Document",
  document_type="design",
  content={
    "overview": "[DESIGN_OVERVIEW]",
    "components": ["[COMPONENT_1]", "[COMPONENT_2]"],
    "architecture": {
      "pattern": "[ARCHITECTURE_PATTERN]",
      "layers": ["[LAYER_1]", "[LAYER_2]"]
    },
    "flow": {
      "step1": "[STEP_DESCRIPTION]",
      "step2": "[STEP_DESCRIPTION]"
    },
    "considerations": {
      "security": "[SECURITY_NOTES]",
      "performance": "[PERFORMANCE_NOTES]",
      "scalability": "[SCALABILITY_NOTES]"
    }
  },
  tags=["design", "[FEATURE_TAG]"]
)
```

## Version Management Templates

**Create Version Snapshot:**
```bash
mcp__xaheen__create_version(
  project_id="[PROJECT_ID]",
  field_name="docs",  # or "features", "data", "prd"
  content={
    # Complete content to snapshot
    "documents": [...],
    "specifications": [...],
    "current_state": {...}
  },
  change_summary="[DESCRIPTION_OF_CHANGES]",
  created_by="system"
)
```

**Version History Management:**
```bash
# List versions
mcp__xaheen__list_versions(
  project_id="[PROJECT_ID]",
  field_name="docs"
)

# Restore previous version
mcp__xaheen__restore_version(
  project_id="[PROJECT_ID]",
  field_name="docs",
  version_number=2,
  restored_by="system"
)
```

## Quick Reference Commands

### Status Checks
```bash
# Project health check
mcp__xaheen__list_projects()
mcp__xaheen__get_project(project_id="[PROJECT_ID]")
mcp__xaheen__get_project_features(project_id="[PROJECT_ID]")

# Task status overview
mcp__xaheen__list_tasks(filter_by="status", filter_value="doing")
mcp__xaheen__list_tasks(filter_by="status", filter_value="review")

# Knowledge base status
mcp__xaheen__get_available_sources()
```

### Emergency Commands
```bash
# Archive problematic task
mcp__xaheen__delete_task(task_id="[TASK_ID]")

# Reset task status
mcp__xaheen__update_task(task_id="[TASK_ID]", status="todo")

# Create urgent task
mcp__xaheen__create_task(
  project_id="[PROJECT_ID]",
  title="URGENT: [ISSUE_DESCRIPTION]",
  task_order=100  # Highest priority
)
```

## Command Chaining Patterns

### Research → Implement → Validate Chain
```bash
# 1. Research
mcp__xaheen__perform_rag_query(query="[RESEARCH_QUERY]", match_count=3)
mcp__xaheen__search_code_examples(query="[CODE_QUERY]", match_count=2)

# 2. Update task to doing
mcp__xaheen__update_task(task_id="[TASK_ID]", status="doing")

# 3. Implementation (code work)
# 4. Validation (tests, linting)

# 5. Complete task
mcp__xaheen__update_task(task_id="[TASK_ID]", status="review")
```

### Feature Development Chain
```bash
# 1. Get feature context
mcp__xaheen__get_project_features(project_id="[PROJECT_ID]")

# 2. Research feature patterns
mcp__xaheen__perform_rag_query(query="[FEATURE] implementation patterns", match_count=4)

# 3. Create feature tasks
mcp__xaheen__create_task(project_id="[PROJECT_ID]", feature="[FEATURE]", ...)

# 4. Execute task cycle for each feature task
```

## Variable Substitution Guide

**Common Variables:**
- `[PROJECT_ID]`: UUID of the current project
- `[TASK_ID]`: UUID of the current task
- `[FEATURE_NAME]`: Feature category (e.g., "Authentication", "API", "Frontend")
- `[TECHNOLOGY]`: Tech stack component (e.g., "React", "Node.js", "PostgreSQL")
- `[SPECIFIC_FEATURE]`: Specific implementation (e.g., "JWT middleware", "user registration")

**Usage Examples:**
```bash
# Replace [PROJECT_ID] with actual project UUID
mcp__xaheen__list_tasks(filter_by="project", filter_value="550e8400-e29b-41d4-a716-446655440000")

# Replace [TECHNOLOGY] with actual tech
mcp__xaheen__perform_rag_query(query="React hooks best practices", match_count=3)
```
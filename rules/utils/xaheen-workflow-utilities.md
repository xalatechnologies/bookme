# Xaheen Workflow Utilities & Helper Functions

**Utility functions and workflow helpers to streamline Xaheen MCP integration and enforce CLAUDE.md patterns.**

## Workflow Validation Utilities

### Xaheen-First Rule Enforcement

**Pre-Task Validation Checklist:**
```bash
# MANDATORY: Check before any task management
function validate_xaheen_first() {
  # 1. Verify Xaheen MCP server availability
  mcp__xaheen__health_check()
  
  # 2. Confirm knowledge base access
  mcp__xaheen__get_available_sources()
  
  # 3. Validate session info
  mcp__xaheen__session_info()
  
  # RULE: If any of these fail, STOP and resolve before proceeding
}
```

**Violation Detection:**
```markdown
## Xaheen-First Violation Indicators:
- [ ] Used TodoWrite before Xaheen task check
- [ ] Started coding without task research
- [ ] Skipped task status updates
- [ ] Bypassed knowledge base queries
- [ ] Created tasks outside Xaheen system

If ANY of these are true: STOP, reset, and restart with Xaheen workflow.
```

## Task Workflow Utilities

### Complete Task Cycle Automation

**Standard Development Task Flow:**
```bash
function execute_development_task(task_id) {
  # 1. Get and validate task
  task_details = mcp__xaheen__get_task(task_id="$task_id")
  
  # 2. Update to doing status
  mcp__xaheen__update_task(task_id="$task_id", status="doing")
  
  # 3. Conduct research
  execute_task_research("$task_details")
  
  # 4. Implementation phase (manual)
  echo "Ready for implementation based on research findings"
  
  # 5. Quality validation
  validate_implementation()
  
  # 6. Move to review
  mcp__xaheen__update_task(task_id="$task_id", status="review")
}
```

### Task Priority Management

**Get Next Priority Task:**
```bash
function get_next_priority_task(project_id) {
  # Get all todo tasks for project
  todo_tasks = mcp__xaheen__list_tasks(
    filter_by="status",
    filter_value="todo",
    project_id="$project_id"
  )
  
  # Sort by task_order (highest first)
  # Return highest priority task
  echo "Next task: [TASK_WITH_HIGHEST_ORDER]"
}
```

**Task Breakdown Utilities:**
```bash
function create_atomic_task(project_id, epic_title, task_details) {
  # Ensure task is 1-4 hours scope
  # Include acceptance criteria
  # Add relevant sources and examples
  mcp__xaheen__create_task(
    project_id="$project_id",
    title="$epic_title: $task_details",
    description="Atomic task with clear acceptance criteria",
    task_order=10,
    sources=[...],
    code_examples=[...]
  )
}
```

## Research Automation Utilities

### Research Sequence Automation

**Complete Pre-Implementation Research:**
```bash
function execute_comprehensive_research(feature_name, technology) {
  # 1. High-level patterns
  arch_research = mcp__xaheen__perform_rag_query(
    query="$technology architecture patterns best practices",
    match_count=5
  )
  
  # 2. Security considerations
  security_research = mcp__xaheen__perform_rag_query(
    query="$feature_name security best practices",
    match_count=3
  )
  
  # 3. Implementation examples
  code_examples = mcp__xaheen__search_code_examples(
    query="$feature_name implementation example",
    match_count=3
  )
  
  # 4. Common pitfalls
  pitfalls = mcp__xaheen__perform_rag_query(
    query="$technology common mistakes antipatterns",
    match_count=2
  )
  
  return {
    "architecture": arch_research,
    "security": security_research, 
    "examples": code_examples,
    "pitfalls": pitfalls
  }
}
```

### Research Query Generators

**Feature-Specific Query Templates:**
```bash
function generate_auth_queries(auth_type) {
  case $auth_type in
    "jwt")
      queries=[
        "JWT authentication security best practices",
        "JWT token refresh security patterns", 
        "JWT middleware implementation Node.js"
      ]
      ;;
    "oauth")
      queries=[
        "OAuth 2.0 PKCE flow implementation",
        "OAuth security best practices",
        "OAuth provider integration patterns"
      ]
      ;;
  esac
  echo $queries
}

function generate_api_queries(api_type) {
  case $api_type in
    "rest")
      queries=[
        "REST API design principles versioning",
        "REST API security headers rate limiting",
        "REST API error handling patterns"
      ]
      ;;
    "graphql")
      queries=[
        "GraphQL security best practices",
        "GraphQL schema design patterns",
        "GraphQL authentication authorization"
      ]
      ;;
  esac
  echo $queries
}
```

## Project Scenario Utilities

### Project Type Detection

**Scenario Classification:**
```bash
function detect_project_scenario() {
  # Check for existing Xaheen project
  existing_projects = mcp__xaheen__list_projects()
  
  # Check for existing codebase
  if [[ -f "package.json" ]] || [[ -f "Cargo.toml" ]] || [[ -f "requirements.txt" ]]; then
    if [[ ${#existing_projects[@]} -eq 0 ]]; then
      echo "SCENARIO_2_EXISTING_PROJECT"
    else
      echo "SCENARIO_3_CONTINUING_PROJECT"
    fi
  else
    echo "SCENARIO_1_NEW_PROJECT"
  fi
}
```

**Scenario-Specific Initialization:**
```bash
function initialize_project_by_scenario(scenario, project_name) {
  case $scenario in
    "SCENARIO_1_NEW_PROJECT")
      # Create new project and research tech stack
      project_id = mcp__xaheen__create_project(
        title="$project_name",
        description="New project from scratch"
      )
      research_tech_stack()
      create_initial_tasks($project_id)
      ;;
      
    "SCENARIO_2_EXISTING_PROJECT")
      # Analyze existing codebase first
      analyze_existing_codebase()
      project_id = mcp__xaheen__create_project(
        title="$project_name (Existing)",
        description="Integration of existing codebase"
      )
      create_remaining_work_tasks($project_id)
      ;;
      
    "SCENARIO_3_CONTINUING_PROJECT")
      # Resume existing project
      project_id = get_active_project_id()
      resume_task_workflow($project_id)
      ;;
  esac
}
```

## Quality Assurance Utilities

### Implementation Validation

**Code Quality Checks:**
```bash
function validate_implementation() {
  # 1. Run linting (project-specific)
  if [[ -f "package.json" ]]; then
    npm run lint || yarn lint || pnpm lint
  elif [[ -f "Cargo.toml" ]]; then
    cargo clippy
  fi
  
  # 2. Run type checking
  if [[ -f "tsconfig.json" ]]; then
    npm run typecheck || tsc --noEmit
  fi
  
  # 3. Run tests
  if [[ -f "package.json" ]]; then
    npm test || yarn test || pnpm test
  fi
  
  # 4. Security scan (if available)
  npm audit || echo "No security audit available"
}
```

**Research Validation:**
```bash
function validate_research_quality(research_results) {
  # Check for multiple sources
  if [[ ${#research_results.sources[@]} -lt 2 ]]; then
    echo "WARNING: Insufficient research sources"
  fi
  
  # Validate security coverage
  if [[ ! $research_results =~ "security" ]]; then
    echo "WARNING: No security considerations found"
  fi
  
  # Check for implementation examples
  if [[ ${#research_results.examples[@]} -eq 0 ]]; then
    echo "WARNING: No code examples found"
  fi
}
```

## Status Monitoring Utilities

### Project Health Dashboard

**Project Status Summary:**
```bash
function generate_project_status(project_id) {
  # Task distribution
  todo_count = mcp__xaheen__list_tasks(filter_by="status", filter_value="todo", project_id="$project_id") | wc -l
  doing_count = mcp__xaheen__list_tasks(filter_by="status", filter_value="doing", project_id="$project_id") | wc -l
  review_count = mcp__xaheen__list_tasks(filter_by="status", filter_value="review", project_id="$project_id") | wc -l
  done_count = mcp__xaheen__list_tasks(filter_by="status", filter_value="done", project_id="$project_id") | wc -l
  
  # Feature progress
  features = mcp__xaheen__get_project_features(project_id="$project_id")
  
  echo "Project Status Dashboard:"
  echo "Tasks: $todo_count todo, $doing_count doing, $review_count review, $done_count done"
  echo "Features: ${#features[@]} total features"
  echo "Active: $doing_count tasks in progress"
}
```

### Task Flow Monitoring

**Workflow Compliance Check:**
```bash
function check_workflow_compliance(project_id) {
  # Check for multiple doing tasks (violation)
  doing_tasks = mcp__xaheen__list_tasks(filter_by="status", filter_value="doing", project_id="$project_id")
  if [[ ${#doing_tasks[@]} -gt 1 ]]; then
    echo "VIOLATION: Multiple tasks in 'doing' status"
  fi
  
  # Check for stale review tasks
  review_tasks = mcp__xaheen__list_tasks(filter_by="status", filter_value="review", project_id="$project_id")
  if [[ ${#review_tasks[@]} -gt 5 ]]; then
    echo "WARNING: Many tasks awaiting review"
  fi
  
  # Check for task atomicity (description length as proxy)
  for task in todo_tasks; do
    if [[ ${#task.description} -lt 50 ]]; then
      echo "WARNING: Task may not be sufficiently detailed: $task.title"
    fi
  done
}
```

## Error Recovery Utilities

### Research Recovery

**When Research Yields No Results:**
```bash
function handle_empty_research(original_query) {
  # 1. Try broader terms
  broader_query = broaden_search_terms("$original_query")
  broader_results = mcp__xaheen__perform_rag_query(query="$broader_query", match_count=3)
  
  # 2. Try related technologies
  related_query = find_related_technologies("$original_query") 
  related_results = mcp__xaheen__perform_rag_query(query="$related_query", match_count=2)
  
  # 3. Document knowledge gap
  echo "Knowledge gap identified: $original_query"
  echo "Proceeding with conservative approach based on: $broader_results"
}
```

### Task Recovery

**When Tasks Become Unclear:**
```bash
function handle_unclear_task(task_id) {
  # 1. Get current task details
  task = mcp__xaheen__get_task(task_id="$task_id")
  
  # 2. Research unclear aspects
  unclear_research = mcp__xaheen__perform_rag_query(
    query="$task.title implementation approach",
    match_count=3
  )
  
  # 3. Break down into subtasks
  create_subtasks("$task_id", "$unclear_research")
  
  # 4. Update main task with clearer description
  mcp__xaheen__update_task(
    task_id="$task_id",
    description="Updated with research findings: $unclear_research.summary"
  )
}
```

## Integration Helpers

### Sub-Agent Coordination

**Sub-Agent Handoff Utilities:**
```bash
function handoff_to_research(task_requirements) {
  research_request = {
    "task_context": task_requirements,
    "research_areas": ["architecture", "security", "implementation", "pitfalls"],
    "priority": "high"
  }
  return research_request
}

function handoff_from_research(research_results, task_id) {
  implementation_context = {
    "task_id": task_id,
    "research_findings": research_results,
    "next_actions": ["implement", "validate", "complete"]
  }
  return implementation_context
}
```

### Version Control Integration

**Automated Versioning:**
```bash
function auto_version_on_milestone(project_id, milestone_name) {
  # Create version snapshot
  current_state = get_project_current_state(project_id)
  
  mcp__xaheen__create_version(
    project_id="$project_id",
    field_name="features",
    content="$current_state",
    change_summary="Milestone: $milestone_name completed",
    created_by="system"
  )
}
```

## Command Shortcuts

### Quick Task Operations
```bash
alias xt-next="mcp__xaheen__list_tasks filter_by=status filter_value=todo | head -1"
alias xt-doing="mcp__xaheen__list_tasks filter_by=status filter_value=doing"
alias xt-review="mcp__xaheen__list_tasks filter_by=status filter_value=review"

# Quick research
alias xr-arch="mcp__xaheen__perform_rag_query query='{} architecture patterns' match_count=5"
alias xr-sec="mcp__xaheen__perform_rag_query query='{} security best practices' match_count=3"
alias xr-code="mcp__xaheen__search_code_examples query='{} implementation' match_count=3"
```

### Status Shortcuts
```bash
alias xp-status="mcp__xaheen__list_projects && mcp__xaheen__get_project_features"
alias xs-health="mcp__xaheen__health_check && mcp__xaheen__session_info"
alias xk-sources="mcp__xaheen__get_available_sources"
```
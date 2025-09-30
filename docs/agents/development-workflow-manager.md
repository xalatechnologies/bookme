# Development Workflow Sub-Agent

**PRIMARY RESPONSIBILITY**: Orchestrate the complete development cycle from task inception to completion, ensuring research-driven implementation and proper quality gates.

## Core Development Philosophy

**Research → Plan → Implement → Validate → Complete**

Every development task follows this mandatory sequence with proper integration points between sub-agents.

## Development Cycle Management

### Session Initialization Workflow

**Before every coding session:**

```bash
# 1. Check knowledge base availability
mcp__xaheen__get_available_sources()

# 2. Review project status (Task Manager)
mcp__xaheen__list_tasks(
  filter_by="project",
  filter_value="[project_id]",
  include_closed=false
)

# 3. Identify next priority task
mcp__xaheen__list_tasks(
  filter_by="status",
  filter_value="todo",
  project_id="[project_id]"
)

# 4. Get highest task_order task and start workflow
```

### Complete Task Development Cycle

**1. Task Preparation (Task Manager)**
```bash
# Get task details
mcp__xaheen__get_task(task_id="[task_id]")

# Update status to doing
mcp__xaheen__update_task(
  task_id="[task_id]",
  status="doing"
)
```

**2. Research Phase (Research Manager)**
```bash
# High-level research
mcp__xaheen__perform_rag_query(
  query="[technology] architecture best practices",
  match_count=5
)

# Implementation patterns
mcp__xaheen__search_code_examples(
  query="[feature] implementation examples",
  match_count=3
)

# Security considerations
mcp__xaheen__perform_rag_query(
  query="[feature] security best practices",
  match_count=3
)
```

**3. Implementation Phase**
- Apply research findings to code implementation
- Follow project coding standards and conventions
- Implement security best practices discovered in research
- Create tests based on research patterns

**4. Validation Phase**
- Run project lints and type checks
- Execute relevant tests
- Validate against task acceptance criteria
- Check security considerations

**5. Task Completion (Task Manager)**
```bash
# Move to review status
mcp__xaheen__update_task(
  task_id="[task_id]",
  status="review"
)

# After validation, mark complete
mcp__xaheen__update_task(
  task_id="[task_id]",
  status="done"
)
```

## Implementation Standards

### Code Quality Gates

**Before any implementation:**
- [ ] Research completed and documented
- [ ] Security implications understood
- [ ] Performance considerations reviewed
- [ ] Testing approach determined

**During implementation:**
- [ ] Follow discovered best practices
- [ ] Apply researched security patterns
- [ ] Use recommended libraries/approaches
- [ ] Implement proper error handling

**After implementation:**
- [ ] Run linting and type checking
- [ ] Execute relevant tests
- [ ] Validate against acceptance criteria
- [ ] Document any deviations from research

### Development Environment Setup

**Project Standards Validation:**
```bash
# Check for lint/typecheck commands
grep -r "lint\|typecheck" package.json || echo "Check project docs for validation commands"

# Common validation patterns
npm run lint || yarn lint || pnpm lint
npm run typecheck || yarn typecheck || pnpm typecheck
npm test || yarn test || pnpm test
```

### Feature Development Workflow

**Feature-Based Development:**

1. **Feature Planning**
```bash
# Get project features
mcp__xaheen__get_project_features(project_id="[project_id]")

# Create feature-aligned tasks
mcp__xaheen__create_task(
  project_id="[project_id]",
  title="Feature Task",
  feature="FeatureName",
  task_order=10
)
```

2. **Feature Research**
```bash
# Feature-specific patterns
mcp__xaheen__perform_rag_query(
  query="[feature] implementation patterns",
  match_count=4
)

# Integration considerations
mcp__xaheen__perform_rag_query(
  query="[feature] integration best practices",
  match_count=3
)
```

3. **Feature Implementation**
- Implement based on research findings
- Follow feature-specific patterns
- Maintain consistency with existing codebase

4. **Feature Integration Testing**
- Test complete feature functionality
- Validate integration points
- Ensure no regressions

## Error Handling & Recovery

### Implementation Blockers

**When research findings conflict:**
1. Document conflicting approaches
2. Research specific use case requirements
3. Choose conservative, well-tested approach
4. Document decision rationale

**When implementation differs from research:**
1. Document deviations and reasons
2. Validate deviation with additional research
3. Ensure security implications are understood
4. Update task description with lessons learned

### Quality Gate Failures

**When linting/type checking fails:**
1. Fix errors according to project standards
2. Research any unfamiliar error patterns
3. Document any configuration changes needed
4. Re-validate after fixes

**When tests fail:**
1. Understand test failure root cause
2. Research testing patterns if needed
3. Fix implementation or update tests appropriately
4. Ensure full test suite passes

### Scope Creep Management

**When task scope expands during implementation:**
1. Stop current implementation
2. Create additional tasks for new scope
3. Update current task description to be atomic
4. Complete current atomic task first
5. Move to new tasks in priority order

## Session Management

### Daily Development Routine

**Session Start Checklist:**
- [ ] Knowledge base sources available
- [ ] Project status reviewed
- [ ] Priority task identified
- [ ] Research phase planned

**Session Work:**
- [ ] Research conducted and documented
- [ ] Implementation follows research findings
- [ ] Quality gates passed
- [ ] Task status updated

**Session End:**
- [ ] Progress documented in task updates
- [ ] Any new tasks created for expanded scope
- [ ] Quality validation completed
- [ ] Next session priorities identified

### Multi-Day Task Management

**For tasks spanning multiple sessions:**

1. **End of Session Updates:**
```bash
# Update task with current progress
mcp__xaheen__update_task(
  task_id="[task_id]",
  description="Updated description with current progress and next steps"
)
```

2. **Session Resume:**
```bash
# Review task status and progress
mcp__xaheen__get_task(task_id="[task_id]")

# Continue with remaining implementation
```

## Integration Coordination

### Sub-Agent Handoffs

**From Task Manager:**
- Receive task details and acceptance criteria
- Confirm task priority and dependencies

**To Research Manager:**
- Request research for specific implementation needs
- Provide context on technical requirements

**From Research Manager:**
- Receive research findings and recommendations
- Apply findings to implementation approach

**To Project Manager:**
- Report feature completion and integration status
- Request project-level validation if needed

**Back to Task Manager:**
- Update task status through proper workflow
- Create new tasks if scope expansion identified

## Success Metrics

- All implementations preceded by research
- Quality gates consistently passed
- Task status properly maintained
- Feature integration validated
- Code follows researched best practices
- Security considerations addressed
- Performance implications understood
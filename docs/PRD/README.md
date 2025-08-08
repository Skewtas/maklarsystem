# Product Requirements Documents (PRDs)

This folder contains the single source of truth for all Mäklarsystem product requirements.

## Structure

- `MASTER_PRD.md` - Main comprehensive PRD with all features and phases
- `phase-1-mvp.md` - MVP requirements (current phase)
- `phase-2-complete.md` - Full system implementation requirements
- `phase-3-advanced.md` - Advanced features and integrations
- `technical-requirements.md` - Technical architecture and constraints
- `feature-backlog.md` - Future features and ideas

## Document Status

| Document | Status | Last Updated | Owner |
|----------|--------|--------------|-------|
| MASTER_PRD.md | Active | 2025-08-07 | Product Team |
| phase-1-mvp.md | In Progress | 2025-08-07 | Development Team |
| phase-2-complete.md | Planning | 2025-08-07 | Product Team |
| phase-3-advanced.md | Backlog | 2025-08-07 | Product Team |

## Guidelines

1. **Single Source of Truth**: All requirements should be documented here, not in Task Master or other locations
2. **Version Control**: Use git to track changes to requirements
3. **Clear Structure**: Each PRD should follow the standard template
4. **Swedish Context**: Include Swedish terminology and business rules
5. **Regular Updates**: Keep documents current with decisions and changes

## Standard PRD Template

```markdown
# [Feature/Phase Name] PRD

## Overview
- Project context
- Business objectives
- Success criteria

## User Personas
- Target users
- User needs and pain points

## Requirements
### Functional Requirements
- Core features
- User stories
- Acceptance criteria

### Non-Functional Requirements
- Performance
- Security
- Scalability

## Technical Specifications
- Architecture
- Data models
- APIs
- Integrations

## UI/UX Requirements
- Design principles
- User flows
- Mockups/wireframes

## Implementation Plan
- Phases
- Timeline
- Dependencies

## Success Metrics
- KPIs
- Measurement methods
```

## Notes

Previously, PRD content was scattered across:
- Task Master docs (`.taskmaster/docs/`)
- Random text files in project root
- Various markdown files

All useful content has been consolidated here for clarity and maintainability.
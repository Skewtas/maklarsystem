# PRD Migration Notes

## Migration Summary

All Product Requirements Documents have been consolidated from various locations into this single `/docs/PRD/` folder.

### Previous Locations (Now Deprecated)

1. **Taskmaster Drafts** (`/.taskmaster/docs/`)
   - `phase2_prd.txt` → Merged into `MASTER_PRD.md` and `phase-1-mvp.md`
   - `missing-fields-prd.txt` → Field list integrated into `MASTER_PRD.md` Section 4.1
   - `auth-restoration-prd.txt` → Auth requirements moved to `phase-1-mvp.md` Critical Path

2. **Root Level Files**
   - `/maklarsystem/prd-phase2.txt` → Content merged into Phase 2 section of `MASTER_PRD.md`

3. **Scattered Documentation**
   - Various requirements in code comments → Extracted to appropriate PRD sections
   - Vitec analysis docs → Referenced in `MASTER_PRD.md` Competitive Analysis

## What Was Extracted

### From Taskmaster Phase 2 PRD
✅ Complete feature list for all modules
✅ CRUD operation requirements
✅ Integration points
✅ Success criteria

### From Missing Fields PRD  
✅ Comprehensive property field list (40+ fields)
✅ Field categorization and priorities
✅ Swedish terminology mappings
✅ UI/UX field requirements

### From Auth Restoration PRD
✅ Authentication architecture requirements
✅ Role-based access control specs
✅ Security requirements
✅ Session management needs

## New Structure Benefits

### Single Source of Truth
- All requirements in one location: `/docs/PRD/`
- No confusion about which document is current
- Clear versioning through git

### Better Organization
```
/docs/PRD/
├── README.md              # Index and guidelines
├── MASTER_PRD.md         # Complete system requirements
├── phase-1-mvp.md        # Current sprint work
├── technical-requirements.md  # Architecture & tech specs
└── MIGRATION_NOTES.md    # This file
```

### Improved Workflow
1. Product decisions → Update PRD
2. Sprint planning → Reference phase PRDs
3. Development → Check technical requirements
4. Task creation → Generate from PRD sections

## Action Items for Team

### For Developers
- [ ] Stop referencing `.taskmaster/docs/` PRDs
- [ ] Use `/docs/PRD/` for all requirement lookups
- [ ] Update bookmarks/shortcuts to new location

### For Product Manager
- [ ] Review consolidated `MASTER_PRD.md`
- [ ] Validate priorities in `phase-1-mvp.md`
- [ ] Add any missing requirements

### For Task Master Users
- [ ] When creating new tasks, reference `/docs/PRD/` files
- [ ] Don't create new PRDs in `.taskmaster/docs/`
- [ ] Keep Taskmaster for task management only, not requirements

## Taskmaster Integration

### Correct Usage
```bash
# Good: Reference PRD for task creation
task-master add-task --prompt="Implement property CRUD as defined in /docs/PRD/phase-1-mvp.md section 3"

# Bad: Creating PRDs in Taskmaster
task-master parse-prd .taskmaster/docs/new-prd.txt  # Don't do this
```

### PRD Updates
When requirements change:
1. Update the appropriate file in `/docs/PRD/`
2. Commit changes with clear message
3. Update related tasks in Taskmaster if needed
4. Notify team of requirement changes

## Migration Checklist

### Completed ✅
- [x] Created `/docs/PRD/` structure
- [x] Consolidated all PRD content
- [x] Created MASTER_PRD with all features
- [x] Split into phase-specific PRDs
- [x] Added technical requirements
- [x] Created migration notes

### To Do
- [ ] Delete old PRD files after team confirmation
- [ ] Update any hardcoded references in code
- [ ] Update CI/CD documentation references
- [ ] Team training on new structure

## File Mapping Reference

| Old Location | New Location | Status |
|--------------|--------------|--------|
| `.taskmaster/docs/phase2_prd.txt` | `MASTER_PRD.md` | Merged |
| `.taskmaster/docs/missing-fields-prd.txt` | `MASTER_PRD.md` Section 4.1 | Merged |
| `.taskmaster/docs/auth-restoration-prd.txt` | `phase-1-mvp.md` Critical Path | Merged |
| `/maklarsystem/prd-phase2.txt` | `MASTER_PRD.md` Phase 2 | Merged |

## Notes

- The Taskmaster PRDs had good structure for task generation but mixed requirements with implementation details
- The new PRDs separate "what" (requirements) from "how" (implementation)
- Technical details that were in PRDs are now in `technical-requirements.md`
- User stories and acceptance criteria are now clearly defined

---

*Migration completed: 2025-08-07*
*Next review date: After Phase 1 MVP completion*
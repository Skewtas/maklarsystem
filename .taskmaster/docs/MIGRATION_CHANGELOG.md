# Migration Changelog

## Overview
This document tracks all database migrations for the Mäklarsystem project.

## Migration History

### 2025-08-01: Missing Fields Migration
**Files Created**: 
- `20250801030000_add_priority_missing_fields.sql`
- `20250801031000_add_priority2_fields.sql`
- `20250801032000_add_all_missing_fields_consolidated.sql`
- `20250801032000_rollback_missing_fields.sql`

**Purpose**: Add comprehensive set of missing fields identified from Swedish real estate system analysis

**Fields Added**:

#### Priority 1 - Essential (5 fields)
- `fastighetsbeteckning` (TEXT) - Official property designation from Lantmäteriet
- `undertyp` (TEXT with CHECK) - Detailed property sub-type classification
- `andel_i_forening` (DECIMAL(5,2)) - Share percentage in housing cooperative
- `andelstal` (DECIMAL(10,6)) - Share ratio for cost distribution
- `virtuell_visning_url` (TEXT) - Virtual tour link

#### Priority 2 - Valuable (8 fields)
- `boendekalkyl_url` (TEXT) - Living cost calculation document
- `standard_niva` (TEXT with CHECK) - Property standard level
- `tillganglighetsanpassad` (BOOLEAN) - Accessibility adaptations
- `laddbox` (BOOLEAN) - EV charging box present
- `solceller` (BOOLEAN) - Solar panels installed
- `solceller_kapacitet_kwp` (DECIMAL(5,2)) - Solar capacity
- `laddbox_typ` (TEXT with CHECK) - EV charger type
- `laddbox_antal` (INTEGER) - Number of charging points

#### Priority 3 - Additional (40+ fields)
Includes financial, technical, legal, marketing, historical, and environmental fields

**Indexes Created**: 7 new indexes for performance optimization

**Status**: ⏳ Ready for deployment

---

### 2025-01-29: VITEC Integration Fields
**File**: `20250129120000_add_vitec_missing_fields.sql`
**Status**: ✅ Applied
**Description**: Added fields based on VITEC system comparison including ownership, pricing, energy certification, and timeline tracking

---

### 2025-01-29: Extended Fields Implementation
**Files**:
- `20250129104300_add_objekt_extended_fields_enums.sql`
- `20250129104301_add_objekt_extended_fields_columns.sql`
- `20250129104302_add_objekt_extended_fields_indexes.sql`
**Status**: ✅ Applied
**Description**: Initial extended fields for property details, technical information, and location data

---

## Migration Best Practices

1. **Naming Convention**: 
   - Format: `YYYYMMDDHHMMSS_descriptive_name.sql`
   - Use underscores, lowercase

2. **Testing Protocol**:
   - Always test locally first
   - Test rollback scripts
   - Verify in staging before production

3. **Documentation**:
   - Update this changelog
   - Update TypeScript types
   - Document in task management system

## Rollback Procedures

Each migration should have a corresponding rollback script. Naming convention:
- Migration: `20250801030000_add_fields.sql`
- Rollback: `20250801030000_rollback_fields.sql`

## Environment Status

| Environment | Last Migration | Date | Status |
|-------------|----------------|------|--------|
| Local | - | - | Not tracked |
| Staging | 20250129120000 | 2025-01-29 | ✅ Stable |
| Production | 20250129120000 | 2025-01-29 | ✅ Stable |

## Pending Migrations

1. **20250801032000_add_all_missing_fields_consolidated.sql**
   - Priority: High
   - Estimated Impact: Low (all nullable fields)
   - Testing Required: Yes
   - TypeScript Update: Required

## Notes

- All new fields are nullable to ensure backward compatibility
- Consider applying Priority 1 fields first, then Priority 2
- Priority 3 fields are optional based on business requirements
- Always update `database.ts` after applying migrations
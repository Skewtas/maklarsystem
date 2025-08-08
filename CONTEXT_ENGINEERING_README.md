# Context Engineering Setup for Mäklarsystem

This directory contains Context Engineering templates and guidelines for the Mäklarsystem (Swedish Real Estate Management System) project.

## 📁 Structure

```
/
├── CLAUDE.md                    # Main context file - project rules and guidelines
├── INITIAL.md                   # Initial feature requirements and project overview
├── examples/                    # Code examples and patterns
│   ├── objekt-form-example.tsx # Property form with Swedish validation
│   ├── supabase-api-example.ts # API route patterns with security
│   ├── glassmorphism-component.tsx # UI component patterns
│   └── swedish-validation.ts   # Swedish format validators
├── PRPs/                        # Product Requirements Prompts
│   └── field-grouping-collapsible-sections.md # Current feature PRP
└── CONTEXT_ENGINEERING_README.md # This file
```

## 🚀 How to Use

### 1. Starting a New Feature
1. Create a new PRP in the `PRPs/` folder based on the template
2. Include all context from `CLAUDE.md`
3. Reference relevant examples from `examples/`
4. Execute with Claude Code

### 2. Working with Claude Code
The `CLAUDE.md` file is automatically loaded by Claude Code and contains:
- Project-specific terminology (Swedish real estate terms)
- Code style guidelines
- Security requirements
- Performance standards
- Common patterns and anti-patterns

### 3. Using Examples
The `examples/` folder contains real patterns from the project:
- **objekt-form-example.tsx**: Shows form structure with Swedish validation
- **supabase-api-example.ts**: API patterns with proper security
- **glassmorphism-component.tsx**: UI component styling patterns
- **swedish-validation.ts**: Comprehensive Swedish format validators

### 4. Creating PRPs (Product Requirements Prompts)
When creating a new PRP:
1. Start with the context section
2. Define clear requirements
3. Include technical specifications
4. Reference existing patterns
5. Set success criteria
6. Add testing requirements

## 🇸🇪 Swedish Terminology Reference

Always use Swedish terms in the codebase:

| Swedish | English | Usage |
|---------|---------|-------|
| Objekt | Property/Listing | Main entity |
| Kontakter | Contacts | Buyers/Sellers |
| Visning | Showing | Open house |
| Bud | Bid/Offer | Purchase offers |
| Mäklare | Agent | Real estate agent |
| Fastighetsbeteckning | Property ID | Official property designation |
| Boarea | Living area | Square meters |
| Utgångspris | Asking price | Initial price |

## 🔧 Technical Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Forms**: React Hook Form + Zod
- **UI**: Radix UI + Glassmorphism
- **Testing**: Jest, Playwright

## 📋 Current Feature

**Field Grouping and Collapsible Sections**
- PRP: `/PRPs/field-grouping-collapsible-sections.md`
- Priority: High
- Organize property forms into logical, collapsible sections

## 🎯 Key Principles

1. **Swedish First**: All user-facing text in Swedish
2. **Type Safety**: Strict TypeScript, no `any` types
3. **Security**: Validate everything, trust nothing
4. **Performance**: <3s page loads, <100ms interactions
5. **Accessibility**: WCAG 2.1 AA compliance
6. **Mobile First**: Responsive design for field work

## 📚 Additional Resources

- Supabase docs: Reference for RLS policies and auth
- Swedish validation: `/examples/swedish-validation.ts`
- UI patterns: `/examples/glassmorphism-component.tsx`

## ⚙️ Workflow

1. **Review** CLAUDE.md for project context
2. **Check** feature requirements in PRP
3. **Reference** examples for patterns
4. **Implement** following guidelines
5. **Test** with Swedish data
6. **Verify** all requirements met

## 🔄 Maintaining Context

- Update CLAUDE.md when adding new patterns
- Add new examples when creating reusable components
- Create PRPs for complex features
- Document Swedish-specific requirements

## 🚨 Important Notes

- Never mix English/Swedish terms (use "objekt" not "property")
- Always validate Swedish formats (personnummer, postnummer, etc.)
- Use Europe/Stockholm timezone
- Format currency as SEK
- Test with Swedish characters (å, ä, ö)
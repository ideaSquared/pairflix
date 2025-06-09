# 📚 PairFlix Documentation

This directory contains comprehensive documentation for the PairFlix platform. Documentation is organized by topic and audience.

## 📖 Getting Started

- [**Development Setup Guide**](./dev-setup.md) - Complete setup instructions for local development
- [**Architecture Overview**](./architecture.md) - System architecture and design patterns
- [**Project Requirements**](./prd.md) - Product requirements and specifications

## 🔧 Technical Documentation

### API Documentation

- [**Complete API Documentation**](./api-docs.md) - Comprehensive API reference with request/response examples
- [**Database Schema**](./db-schema.md) - Database structure and relationships

### Component Development

- [**DataTable Migration Guide**](./datatable-migration-guide.md) - Guide for migrating to type-safe DataTable components

### Implementation Plans

- [**Phase 3 Implementation Plan**](./phase3-implementation-plan.md) - Technical improvements and standardization roadmap
- [**Phase 3 Implementation Details**](./phase3/) - Detailed implementation documentation
  - [Week 2 Implementation Plan](./phase3/week2-implementation-plan.md)
  - [Docker Analysis](./phase3/docker-analysis.md)
  - [Component Audit](./phase3/component-audit/) - Component library architecture and standards

## 📋 Decision Records

- [**Decision Log**](./decision-log.md) - Comprehensive record of all architectural and implementation decisions

## 🏗️ Application-Specific Documentation

### Backend API

- [**Backend README**](../backend/README.md) - Backend development guide, features, and API overview
- [**Security Documentation**](../backend/docs/SECURITY.md) - Security implementation details and best practices
- [**Middleware Documentation**](../backend/src/middlewares/README.md) - Authentication, rate limiting, and middleware guides

### Frontend Applications

- [**Client Application**](../app.client/README.md) - Main user-facing React application documentation
- [**Admin Panel**](../app.admin/README.md) - Administrative interface documentation

### Component Library

- [**Component Library**](../lib.components/README.md) - Shared UI component library documentation

## 📁 Documentation Organization

```
docs/
├── README.md                           # This file - documentation index
├── dev-setup.md                        # Development environment setup
├── architecture.md                     # System architecture overview
├── api-docs.md                         # Complete API documentation
├── db-schema.md                        # Database schema documentation
├── prd.md                             # Product requirements
├── datatable-migration-guide.md       # Component migration guide
├── phase3-implementation-plan.md      # Phase 3 roadmap
└── phase3/                            # Phase 3 detailed documentation
    ├── week2-implementation-plan.md
    ├── docker-analysis.md
    └── component-audit/
        ├── component-library-architecture.md
        ├── component-inventory.md
        └── component-api-standards.md
```

## 🔗 Quick Links

### For Developers

- [Development Setup](./dev-setup.md) - Start here for local development
- [API Documentation](./api-docs.md) - Complete API reference
- [Backend README](../backend/README.md) - Backend development guide

### For System Administrators

- [Security Documentation](../backend/docs/SECURITY.md) - Security configuration and best practices
- [Architecture Overview](./architecture.md) - System design and components

### For Product Teams

- [Product Requirements](./prd.md) - Feature specifications and requirements
- [Phase 3 Plan](./phase3-implementation-plan.md) - Upcoming technical improvements

### For UI/UX Teams

- [Component Library](../lib.components/README.md) - Shared component documentation
- [DataTable Migration](./datatable-migration-guide.md) - Component standardization guide

## 📝 Contributing to Documentation

When updating documentation:

1. **Keep documentation current** - Update docs when making code changes
2. **Use clear headings** - Structure content with proper markdown headers
3. **Include examples** - Provide code examples and usage patterns
4. **Cross-reference** - Link related documentation appropriately
5. **Update this index** - Add new documentation files to this README

## 🏷️ Documentation Types

- **📖 Guides** - Step-by-step instructions (setup, migration)
- **📚 Reference** - Comprehensive technical documentation (API, schema)
- **🏗️ Architecture** - System design and patterns
- **📋 Decisions** - Decision records and implementation rationale
- **📅 Plans** - Implementation roadmaps and project plans

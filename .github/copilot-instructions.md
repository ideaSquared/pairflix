# PairFlix Development Guidelines

This is the main instruction file for GitHub Copilot. It contains references to specialized instruction files for different aspects of development.

## Prime Directive

Follow project standards. Focus on one file at a time to prevent corruption. Explain your reasoning. **Document ALL significant decisions in the decision log.**

## Project Overview

PairFlix is a monorepo with:

- TypeScript backend (Express, PostgreSQL with Sequelize)
- React frontend (TypeScript, styled-components)
- Docker-based deployment

## Core Requirements

1. **MANDATORY Decision Logging**: Every significant technical decision MUST be documented in the decision log (`decision-log.md`) using the specified tabular format. This is non-negotiable.

2. **Code Quality**: Follow the defined code standards for TypeScript, React, and PostgreSQL development.

3. **Documentation**: Provide comprehensive documentation for all code and architecture decisions.

## Specialized Instruction Files

This project is organized with specialized instruction files for different aspects of development:

- [Decision Logging](./prompts/decision-logging.prompt.md) - **MANDATORY** process for documenting all technical decisions
- [Code Standards](./prompts/code-standards.prompt.md) - TypeScript, HTML/CSS, folder structure
- [Database Standards](./prompts/database-standards.prompt.md) - PostgreSQL and Sequelize rules
- [Security Guidelines](./prompts/security-guidelines.prompt.md) - Security best practices
- [Performance Guidelines](./prompts/performance-guidelines.prompt.md) - Performance optimization
- [Testing Requirements](./prompts/testing-requirements.prompt.md) - Testing strategies and requirements
- [Edit Protocol](./prompts/edit-protocol.prompt.md) - Protocol for making large edits
- [Documentation Standards](./prompts/documentation-standards.prompt.md) - Documentation requirements
- [Architecture Standards](./prompts/architecture-standards.prompt.md) - API, state management, error handling
- [DevOps Guidelines](./prompts/devops-guidelines.prompt.md) - Containers, CI/CD, environments
- [Accessibility Guidelines](./prompts/accessibility-guidelines.prompt.md) - WCAG compliance, a11y

Refer to these specialized files for detailed guidance in each area.

## Decision Logging Reminder

Before completing any task that involved significant technical choices:

1. Document your decisions in the decision log
2. Follow the tabular format specified in the decision-logging.prompt.md file
3. Include today's date, context, options considered, reasoning, and implementation details
4. State clearly that you have documented your decisions

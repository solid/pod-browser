# GitHub Actions Workflows

This directory contains the active GitHub Actions workflows for this project.

## Recent Changes

As part of the project transition, some workflows have been archived:

- The `audit.yml` workflow has been moved to `.github/archived-workflows/` as it depended on Inrupt's infrastructure
- Sonarqube integration has been removed from the CI workflow for the same reason

## Current Workflows

- `ci.yml`: Runs tests and linting on push events

## Future Considerations

New maintainers should consider implementing:

1. A new security audit workflow appropriate for the project's needs
2. Code quality checks using publicly available tools
3. Any additional CI/CD requirements specific to the new maintenance team

The archived workflows can serve as reference for the previous implementation.

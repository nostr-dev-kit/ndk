# NDK Development Environment

## Bun Configuration

- Development environment uses Bun 1.0.0 (specified in `packageManager` field)
- No Bun engine requirement in package.json to avoid restricting library users
- Bun version is pinned in:
  - package.json (packageManager field)
  - .devcontainer/Dockerfile
  - GitHub Actions workflow

## Version Requirements

- Node.js >=16.0 is the only engine requirement
- Libraries in this monorepo intentionally avoid specifying runtime requirements
- Development tools (Bun) are separate from library requirements

## Best Practices

- Keep runtime requirements minimal in libraries
- Pin development tool versions for consistency
- Separate development environment from library requirements
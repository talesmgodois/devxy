# Contributing to Devxy

First off, thank you for considering contributing to Devxy! 🎉

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs **actual behavior**
- **Screenshots** if applicable
- **Environment details** (browser, OS, etc.)

### Suggesting Features

Feature requests are welcome! Please:

- Use a clear, descriptive title
- Explain the problem your feature would solve
- Describe the solution you'd like
- Consider any alternatives you've thought of

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Start development server**: `npm run dev`
4. **Make your changes** following our coding standards
5. **Test your changes** thoroughly
6. **Commit with clear messages** following conventional commits
7. **Push to your fork** and submit a pull request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/devxy.git
cd devxy

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Coding Standards

### General Guidelines

- Write clean, readable, and maintainable code
- Follow existing code patterns and conventions
- Use TypeScript for type safety
- Keep components small and focused

### Naming Conventions

- **Components**: PascalCase (e.g., `TemperatureConverter.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useEmbeddedTools.ts`)
- **Utilities**: camelCase (e.g., `generators.ts`)
- **Constants**: SCREAMING_SNAKE_CASE

### File Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── visual-tools/    # Visual tool components
│   └── embedded-interpreters/
├── hooks/               # Custom React hooks
├── config/              # Configuration files
├── utils/               # Utility functions
└── pages/               # Page components
```

### Adding a New Command

1. **Generator commands** (`r.xxx`): Add to `GENERATOR_COMMANDS` in `Terminal.tsx`
2. **Pipe commands** (`xxx`): Add to `PIPE_COMMANDS` in `Terminal.tsx`
3. **Visual tools** (`v.xxx`): Create component in `visual-tools/` and register in `index.ts`
4. **Navigation commands** (`gt.xxx`): Add to `GOTO_COMMANDS` in `Terminal.tsx`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new temperature conversion feature
fix: resolve clipboard paste issue on Firefox
docs: update README with installation instructions
style: format code with prettier
refactor: simplify command parsing logic
test: add tests for CPF generator
chore: update dependencies
```

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards

Examples of positive behavior:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

Examples of unacceptable behavior:
- Trolling, insulting/derogatory comments
- Public or private harassment
- Publishing others' private information without permission

## Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

---

Thank you for contributing! 🚀

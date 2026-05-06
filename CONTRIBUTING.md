# Contributing to BhagyaSreeBorse

Thank you for taking the time to contribute! 🎉

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/bhagyasreeborse.git
   cd bhagyasreeborse
   npm install
   npm run dev
   ```
3. Create a **feature branch**:
   ```bash
   git checkout -b feature/your-feature
   ```
4. Make your changes
5. Verify before submitting:
   ```bash
   npm run type-check   # must pass with 0 errors
   npm run lint         # must pass with 0 warnings
   ```
6. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add new attendance chart
   fix: correct SGPA calculation edge case
   ui: improve mobile nav spacing
   docs: update deployment steps
   ```
7. Push and open a **Pull Request** against `main`

## PR Guidelines

- Keep PRs focused — one feature or fix per PR
- Add a screenshot / screen recording for any UI change
- Write clear PR descriptions explaining *what* and *why*
- Be responsive to review feedback

## Code Style

- TypeScript strict mode — no `any` types
- Tailwind classes over inline styles
- Components in `src/app/app/components/` for app-level, `src/components/ui/` for primitives
- No unused imports

## Questions?

Open a [GitHub Discussion](../../discussions) or an issue — happy to help!

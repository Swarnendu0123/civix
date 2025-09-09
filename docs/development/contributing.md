# Contributing to Civix

Thank you for your interest in contributing to Civix! This guide will help you get started with contributing to the civic issue reporting platform.

## Getting Started

### Development Environment
Before contributing, make sure you have your development environment set up by following our [Development Setup Guide](./setup.md).

### Ways to Contribute

#### 🐛 Bug Reports
- Use GitHub Issues to report bugs
- Include detailed reproduction steps
- Provide system information and screenshots
- Search existing issues before creating new ones

#### ✨ Feature Requests
- Discuss new features in GitHub Discussions first
- Provide clear use cases and benefits
- Consider implementation complexity
- Align with project goals and vision

#### 🔧 Code Contributions
- Follow our coding standards and conventions
- Write tests for new functionality
- Update documentation as needed
- Submit focused, single-purpose pull requests

#### 📚 Documentation
- Improve existing documentation
- Add missing documentation
- Fix typos and clarify instructions
- Translate documentation to other languages

## Development Process

### 1. Fork and Clone
```bash
# Fork the repository on GitHub
# Clone your fork locally
git clone https://github.com/YOUR_USERNAME/civix.git
cd civix

# Add upstream remote
git remote add upstream https://github.com/swrno/civix.git
```

### 2. Create Feature Branch
```bash
# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 3. Make Changes
- Follow existing code patterns and conventions
- Write clear, self-documenting code
- Add appropriate comments for complex logic
- Test your changes thoroughly

### 4. Commit Changes
```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add issue priority sorting functionality"
```

### 5. Push and Create PR
```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
# Include detailed description of changes
```

## Coding Standards

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Prefer const over let, avoid var
- Use async/await over promises where possible

### React Components
- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Follow React best practices for performance

### API Development
- Use RESTful conventions
- Include proper error handling
- Validate all inputs
- Document all endpoints
- Follow security best practices

### Database
- Use proper indexing for queries
- Validate data with Mongoose schemas
- Handle errors gracefully
- Follow MongoDB best practices

## Testing Guidelines

### Manual Testing
- Test all affected functionality
- Verify cross-browser compatibility
- Test mobile responsiveness
- Check accessibility features

### Code Quality
```bash
# Run linters before committing
cd clients/web && npm run lint
cd clients/app && npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Build to check for TypeScript errors
npm run build
```

## Pull Request Guidelines

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Manual testing completed
- [ ] Cross-browser testing done
- [ ] Mobile testing completed
- [ ] No TypeScript errors

## Screenshots
(If applicable)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process
1. **Automated checks** must pass (linting, building)
2. **Manual review** by maintainers
3. **Testing** by reviewers if needed
4. **Approval** and merge by maintainers

## Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Collaborate effectively with team members

### Communication
- Use GitHub Issues for bug reports
- Use GitHub Discussions for feature discussions
- Be clear and detailed in communication
- Respond promptly to feedback and questions

## Recognition

### Contributors
All contributors are recognized in:
- Repository README
- Release notes for significant contributions
- Special recognition for major features

### Maintainers
Long-term contributors may be invited to become maintainers with:
- Commit access to the repository
- Ability to review and merge pull requests
- Input on project direction and roadmap

Thank you for contributing to Civix and helping improve civic engagement technology!
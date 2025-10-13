# NDK Cookbook

Welcome to the NDK Cookbook! This is a collection of self-contained recipes for building with the Nostr Development Kit (NDK).

## What is a Cookbook Recipe?

A cookbook recipe is a focused, practical guide that shows you how to accomplish a specific task with NDK. Unlike tutorials that teach concepts step-by-step, recipes are:

- **Self-contained**: Everything you need is in one place
- **Practical**: Focuses on a specific, real-world use case
- **Copy-pasteable**: Includes complete working code examples
- **Focused**: Covers one topic deeply rather than many topics shallowly

## Recipe Structure

Each recipe follows a consistent structure:

1. **Problem Statement**: What you'll build and why
2. **Prerequisites**: Required packages and knowledge
3. **Quick Start**: Minimal working example
4. **Step-by-Step**: Detailed implementation
5. **Complete Example**: Full, production-ready code
6. **Common Patterns**: Alternative approaches
7. **Troubleshooting**: Solutions to common issues
8. **Best Practices**: Tips from experience

## Browse Recipes

Visit [/ndk/cookbook/](/ndk/cookbook/) to browse all recipes.

### By Category

- 🔐 **Authentication** - Login flows, signers, sessions
- 📝 **Events** - Creating, publishing, and handling events
- 🌐 **Relays** - Connection management, hints, outbox model
- 💰 **Payments** - Zaps, NWC, Cashu, Lightning
- 🧪 **Testing** - Mocks, fixtures, test patterns
- 📱 **Mobile** - React Native specific recipes

### By Package

- **ndk-core** - Core functionality, events, relays
- **svelte** - Svelte 5 reactive patterns
- **ndk-mobile** - React Native mobile apps
- **ndk-wallet** - Payment and wallet integration

### By Difficulty

- ⭐ **Beginner** - No prior NDK knowledge required
- ⭐⭐ **Intermediate** - Assumes basic NDK understanding
- ⭐⭐⭐ **Advanced** - Complex concepts, multiple systems

## Contributing a Recipe

We welcome contributions! Here's how to add a new recipe:

1. **Copy the template**: Use `/docs/cookbook/TEMPLATE.md` as a starting point
2. **Choose a category**: Place your recipe in the appropriate subdirectory
3. **Fill in metadata**: Complete all frontmatter fields
4. **Write the recipe**: Follow the structure in the template
5. **Add to index**: Update `/docs/cookbook/index.md` with your recipe card
6. **Submit PR**: Open a pull request with your recipe

### Recipe Guidelines

**Good recipes:**
- Solve a specific, real-world problem
- Include complete, working code examples
- Explain why, not just how
- Handle errors and edge cases
- Follow NDK best practices

**Avoid:**
- Overly broad topics (split into multiple recipes)
- Incomplete or broken examples
- Copying API documentation
- Explaining concepts without practical examples

### File Naming

Use kebab-case for file names:
- ✅ `implementing-outbox-model.md`
- ✅ `custom-event-validation.md`
- ❌ `Implementing_Outbox_Model.md`
- ❌ `customEventValidation.md`

### Directory Structure

```
cookbook/
├── index.md              # Main cookbook index
├── TEMPLATE.md           # Recipe template
├── README.md             # This file
├── core/                 # ndk-core recipes
│   ├── events/
│   ├── relays/
│   └── signers/
├── svelte5/              # svelte recipes
│   ├── authentication/
│   └── state-management/
├── mobile/               # ndk-mobile recipes
└── wallet/               # ndk-wallet recipes
```

## Getting Help

- **Questions**: Ask in [GitHub Discussions](https://github.com/nostr-dev-kit/ndk/discussions)
- **Issues**: Report bugs in [GitHub Issues](https://github.com/nostr-dev-kit/ndk/issues)
- **Chat**: Join the Nostr developer community

## License

All recipes are released under the MIT License unless otherwise specified.

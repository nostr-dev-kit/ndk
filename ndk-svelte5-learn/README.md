# NDK Svelte 5 Learn

Interactive tutorial platform for learning NDK with Svelte 5.

## Structure

### Three Main Sections

1. **Learn** (`/learn`) - Progressive tutorials from basics to advanced
   - Organized by levels (1-5)
   - Each level has multiple lessons
   - Interactive code examples and challenges

2. **Workshops** (`/workshops`) - Build complete features step-by-step
   - Full implementations of real-world features
   - Best practices included
   - Production-ready patterns

3. **Cookbooks** (`/cookbooks`) - Quick recipes for common tasks
   - Organized by category (20+ categories)
   - Hundreds of recipes
   - Copy-paste ready solutions

## Directory Structure

```
ndk-svelte5-learn/
├── src/
│   ├── routes/
│   │   ├── learn/
│   │   │   ├── +page.svelte           # Learn index
│   │   │   └── [level]/
│   │   │       └── [lesson]/
│   │   │           └── +page.svelte   # Individual lesson
│   │   ├── workshops/
│   │   │   ├── +page.svelte           # Workshops index
│   │   │   └── [workshop]/
│   │   │       └── +page.svelte       # Individual workshop
│   │   └── cookbooks/
│   │       ├── +page.svelte           # Cookbooks index with search
│   │       ├── [category]/
│   │       │   └── +page.svelte       # Category listing
│   │       └── [category]/[recipe]/
│   │           └── +page.svelte       # Individual recipe
│   ├── lib/
│   │   ├── data/
│   │   │   ├── learn-structure.ts      # Learn levels & lessons
│   │   │   ├── workshop-structure.ts   # Workshop definitions
│   │   │   └── cookbook-structure.ts   # Cookbook categories
│   │   └── components/
│   │       └── tutorial/               # Reusable tutorial components
│   │           ├── CodeEditor.svelte
│   │           ├── Preview.svelte
│   │           ├── CodeBlock.svelte
│   │           └── Challenge.svelte
│   └── app.html
└── content/                            # Content files (markdown/MDX)
    ├── learn/
    │   ├── 1-setup.md
    │   ├── 1-connect.md
    │   └── ...
    ├── workshops/
    │   ├── profile-viewer.md
    │   ├── post-composer.md
    │   └── ...
    └── cookbooks/
        ├── getting-started/
        │   ├── basic-setup.md
        │   └── ...
        ├── users/
        │   ├── fetch-profile.md
        │   ├── display-avatar.md
        │   └── ...
        └── ...
```

## Scalability for Hundreds of Recipes

### Cookbook Organization

Cookbooks are designed to scale to hundreds of recipes through:

1. **Category-based organization**: 20+ predefined categories
2. **Data-driven structure**: Categories and recipes defined in TypeScript
3. **Search functionality**: Full-text search across all recipes
4. **Tagging system**: Multiple tags per recipe for discoverability
5. **Difficulty levels**: Beginner, intermediate, advanced filtering

### Adding New Content

#### Add a Lesson
1. Add lesson to `src/lib/data/learn-structure.ts`
2. Create route at `src/routes/learn/[level]/[lesson]/+page.svelte`
3. Add content in `content/learn/`

#### Add a Workshop
1. Add workshop to `src/lib/data/workshop-structure.ts`
2. Create route at `src/routes/workshops/[workshop]/+page.svelte`
3. Add content in `content/workshops/`

#### Add a Recipe
1. Add recipe to appropriate category in `src/lib/data/cookbook-structure.ts`
2. Create route at `src/routes/cookbooks/[category]/[recipe]/+page.svelte`
3. Add content in `content/cookbooks/[category]/`

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Content Guidelines

### Learn Lessons
- Focus on one concept per lesson
- Include interactive examples
- Provide challenges for practice
- Build on previous lessons

### Workshops
- Show complete feature implementation
- Include best practices
- Explain architectural decisions
- Provide production-ready code

### Cookbook Recipes
- Be concise and focused
- Include copy-paste ready code
- Show common variations
- Link to related recipes

## Current Status

- ✅ Site structure and routing
- ✅ Data structures for all sections
- ✅ Index pages for all sections
- ✅ Scalable organization for 100s of recipes
- 🚧 Tutorial components (CodeEditor, Preview, etc.)
- 🚧 Content creation
- 🚧 Interactive code playground
- 🚧 Challenge system

## Next Steps

1. Create tutorial components (CodeEditor, Preview, Challenge)
2. Build first lesson as template
3. Build first workshop as template
4. Build first set of cookbook recipes (5-10 per category)
5. Add syntax highlighting (Shiki)
6. Add search functionality
7. Deploy to production

# Content Guidelines

This directory contains all tutorial content for NDK Svelte 5 Learn.

## Directory Structure

```
content/
├── learn/           # Progressive lessons organized by level
├── workshops/       # Complete feature implementations
└── cookbooks/       # Quick recipes organized by category
```

## Content Format

All content files should be in Markdown or MDX format.

### Frontmatter Template

```markdown
---
title: "Your Title Here"
description: "Brief description"
difficulty: "beginner" | "intermediate" | "advanced"
estimatedTime: "15 min"
tags: ["tag1", "tag2"]
---

# Your Title

Content here...
```

## Writing Guidelines

### Learn Lessons

**Goal**: Teach one concept clearly and build understanding progressively.

- Start with clear learning objectives
- Use simple, direct language
- Include interactive code examples
- End with a challenge or practice exercise
- Link to related lessons and resources

**Example structure**:
```markdown
# Lesson Title

## What You'll Learn
- Bullet points of objectives

## The Concept
Explanation with code examples

## Try It Yourself
Interactive example

## Challenge
Practice exercise

## Next Steps
Links to related content
```

### Workshops

**Goal**: Guide through building a complete, real-world feature.

- Start with feature overview and goals
- Break into clear steps
- Show complete code at each step
- Explain architectural decisions
- Include best practices
- Provide troubleshooting tips

**Example structure**:
```markdown
# Workshop Title

## What We'll Build
Feature description with screenshot/demo

## Prerequisites
Required knowledge

## Step 1: Setup
Initial code and setup

## Step 2: Core Feature
Main implementation

## Step 3: Polish
Refinements and best practices

## Complete Code
Full implementation

## Next Steps
How to extend/customize
```

### Cookbook Recipes

**Goal**: Provide quick, copy-paste solution to a specific problem.

- Be concise - get to the code quickly
- Show the most common use case first
- Include variations/options
- Link to related recipes
- Add troubleshooting notes

**Example structure**:
```markdown
# Recipe Title

Brief description of what this solves (1-2 sentences).

## Code

\`\`\`typescript
// Copy-paste ready code
\`\`\`

## Variations

Alternative approaches or options

## Related Recipes
- [Related Recipe 1](#)
- [Related Recipe 2](#)

## Notes
Important gotchas or tips
```

## Code Examples

### Use Real, Working Code
All code examples should be tested and working.

### Keep Examples Focused
```typescript
// ✅ Good - focused on the concept
const $event = $derived(/* ... */);

// ❌ Bad - too much boilerplate
import NDK from '@nostr-dev-kit/ndk';
import { browser } from '$app/environment';
// ... lots of setup
const $event = $derived(/* ... */);
```

### Show Progressive Enhancement
```typescript
// Basic
const $events = $derived(/* simple version */);

// With error handling
const $events = $derived(/* + error handling */);

// Production-ready
const $events = $derived(/* + caching, pagination, etc */);
```

## Interactive Elements

Use these components in your content:

- `<CodeEditor>` - Live code editing
- `<Preview>` - Live preview of code
- `<Challenge>` - Practice challenges
- `<CodeBlock>` - Syntax highlighted code
- `<Tip>` - Best practice tips
- `<Warning>` - Common pitfalls

## Adding New Content

1. Create your content file in the appropriate directory
2. Update the corresponding data structure file:
   - Learn: `src/lib/data/learn-structure.ts`
   - Workshops: `src/lib/data/workshop-structure.ts`
   - Cookbooks: `src/lib/data/cookbook-structure.ts`
3. Create the route file in `src/routes/`
4. Test locally before submitting

## Tips for Great Content

1. **Start Simple**: Don't assume prior knowledge
2. **Be Practical**: Show real-world use cases
3. **Be Concise**: Respect the reader's time
4. **Be Complete**: Don't skip important steps
5. **Be Visual**: Use examples and demos
6. **Be Current**: Keep content up to date with NDK changes
7. **Be Helpful**: Anticipate and answer questions

## Questions?

Open an issue or PR in the NDK repository.

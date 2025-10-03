# Site Structure Overview

## Content Flow

### Learn Section (Progressive Complexity)
```
/learn → Learn Index (shows all levels)
  ├── Level 1: Getting Started
  │   ├── /learn/1/setup
  │   ├── /learn/1/connect
  │   └── /learn/1/first-event
  ├── Level 2: Core Concepts
  │   ├── /learn/2/subscriptions
  │   ├── /learn/2/stores
  │   └── /learn/2/event-kinds
  ├── Level 3: User Interaction
  ├── Level 4: Advanced Features
  └── Level 5: Production Patterns
```

### Workshops Section (Build-a-Feature)
```
/workshops → Workshops Index (shows all workshops with filtering)
  ├── /workshops/profile-viewer
  ├── /workshops/post-composer
  ├── /workshops/notification-system
  ├── /workshops/chat-interface
  ├── /workshops/feed-builder
  ├── /workshops/zap-integration
  └── /workshops/community-manager
```

### Cookbooks Section (Recipe Collection)
```
/cookbooks → Cookbooks Index (shows categories + search)
  ├── /cookbooks/getting-started → Category Page (lists recipes)
  │   ├── /cookbooks/getting-started/basic-setup
  │   ├── /cookbooks/getting-started/connect-relays
  │   └── ...
  ├── /cookbooks/users → Category Page
  │   ├── /cookbooks/users/fetch-profile
  │   ├── /cookbooks/users/display-avatar
  │   ├── /cookbooks/users/follow-user
  │   └── ... (dozens more)
  ├── /cookbooks/events → Category Page
  ├── /cookbooks/subscriptions → Category Page
  └── ... (20+ categories total)
```

## Scaling Strategy

### For Hundreds of Cookbooks

1. **Category Organization** (20+ categories)
   - Each category can hold 10-50 recipes
   - Categories defined in `cookbook-structure.ts`
   - Easy to add new categories

2. **File Structure**
   ```
   content/cookbooks/
   ├── getting-started/
   │   ├── recipe-1.md
   │   ├── recipe-2.md
   │   └── ...
   ├── users/
   │   ├── recipe-1.md
   │   ├── recipe-2.md
   │   └── ... (50+ recipes)
   └── ... (20+ categories)
   ```

3. **Route Structure**
   ```
   src/routes/cookbooks/
   ├── +page.svelte                    # Index with search
   ├── [category]/
   │   └── +page.svelte                # Category listing
   └── [category]/[recipe]/
       └── +page.svelte                # Individual recipe
   ```

4. **Data Management**
   - All recipes registered in `src/lib/data/cookbook-structure.ts`
   - TypeScript types ensure consistency
   - Search function scans all recipes
   - Categories are easily expandable

5. **Discovery Features**
   - **Search**: Full-text search across all recipes
   - **Tags**: Multiple tags per recipe
   - **Difficulty**: Filter by skill level
   - **Categories**: Browse by topic
   - **Related**: Link to similar recipes

## Adding Content at Scale

### Quick Recipe Addition
```typescript
// 1. Add to cookbook-structure.ts
{
  id: 'fetch-user-posts',
  title: 'Fetch User Posts',
  description: 'Get the latest posts from a user',
  category: 'users',
  tags: ['fetch', 'posts', 'users'],
  difficulty: 'beginner',
  estimatedTime: '5 min'
}

// 2. Create content file
content/cookbooks/users/fetch-user-posts.md

// 3. Create route (can be templated)
src/routes/cookbooks/users/fetch-user-posts/+page.svelte
```

### Batch Content Creation
For adding many recipes at once:
1. Define all recipes in `cookbook-structure.ts`
2. Use a script to generate route files from template
3. Create content files following guidelines
4. Test search and navigation

## Component Reuse

All sections share these components:
- `CodeBlock.svelte` - Syntax highlighted code
- `CodeEditor.svelte` - Interactive code editing
- `Preview.svelte` - Live preview pane
- `Challenge.svelte` - Practice exercises
- `Tip.svelte` - Best practice callouts
- `Warning.svelte` - Common pitfall alerts

## Navigation

- **Top nav**: Learn | Workshops | Cookbooks
- **Breadcrumbs**: Show current location
- **Section nav**: Filter/search within section
- **Related content**: Links to similar material
- **Progress tracking**: Mark completed items (future)

## Future Enhancements

- [ ] User accounts for progress tracking
- [ ] Community contributions
- [ ] Recipe ratings/votes
- [ ] Copy-paste analytics
- [ ] Integrated playground
- [ ] Video tutorials
- [ ] AI-powered search
- [ ] Personalized learning paths

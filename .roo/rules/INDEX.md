Package manager = bun
Testing = vitest
Monorepo = yes

# Clean Code
Don't try to fit solutions with existent patterns, unless explicitly told to, you can modify implementations and interfaces; prefer clean code over patching existing code just to prevent modifying an interface.

When you are about to modify an interface, check if the interface you are modifying has been committed or if it's uncommited code. If it's uncommitted code just change it, if it's committed, ask the user for feedback.

# Don't guess
Prefer asking the user questions rather than guessing. When you are confused or have tried an approach and it doesn't work ALWAYS wait and ask the user for feedback.

# Don't reimplement code
Whenever you have trouble with an import, don't reimplement existing code, find a solution to fixing the imports or ask for help, but do not copy code or functionality that is implemented somewhere else in the codebase

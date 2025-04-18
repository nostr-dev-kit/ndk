# Use the specific Bun version that matches our package manager
FROM oven/bun:1.0.0

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy the rest of the code
COPY . .

# Build the project
RUN bun run build

# FIXME: Hardcoded node version
# FIXME: Use prod and dev stages!
FROM node:20-slim

RUN corepack enable

# FIXME: We need to use a WORKDIR because of
# https://stackoverflow.com/a/65443098 but
# the choice of the actual dir is quite arbitrary.
COPY . /app
WORKDIR /app

RUN pnpm install

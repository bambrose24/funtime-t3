# Use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Copy the Prisma schema file
COPY prisma ./prisma

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Validate Prisma schema
RUN bunx prisma validate

# Generate Prisma client
RUN bunx prisma generate

# Verify Prisma client generation
RUN ls -la node_modules/.prisma && ls -la node_modules/@prisma/client

# Ensure correct ownership for the bun user
RUN chown -R bun:bun /usr/src/app

# Run the application
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "sh", "-c", "bun run src/cron/index.ts" ]

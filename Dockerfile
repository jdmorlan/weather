FROM oven/bun:1-alpine AS build
WORKDIR /app
COPY package.json bun.lock* ./
COPY packages/ui/package.json packages/ui/package.json
COPY packages/server/package.json packages/server/package.json
RUN bun install --frozen-lockfile
COPY packages/ui packages/ui
RUN bun run --filter=ui build

FROM oven/bun:1-alpine
WORKDIR /app
COPY --from=build /app/packages/ui/dist /app/dist
COPY packages/server/server.ts /app/server.ts
ENV PORT=8080
ENV UI_DIST=/app/dist
EXPOSE 8080
USER bun
CMD ["bun", "run", "server.ts"]

FROM node:22-alpine AS build

WORKDIR /app
COPY Intranet/package.json Intranet/package-lock.json ./
RUN npm ci
COPY Intranet ./
RUN npm run build

FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production
COPY Intranet/package.json Intranet/package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared

CMD ["node", "server/index.js"]

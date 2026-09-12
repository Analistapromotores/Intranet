FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine

WORKDIR /app
RUN npm install --global serve@14.2.6
COPY --from=build /app/dist ./dist
CMD ["sh", "-c", "serve --single --listen ${PORT:-3000} dist"]

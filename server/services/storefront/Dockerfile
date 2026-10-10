FROM node:22-alpine AS build
ENV DATABASE_URL=mysql://pharmacy_app:build_only@127.0.0.1:3306/pharmacy_manager
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json ./
COPY prisma ./prisma
COPY src ./src
RUN npm run build

FROM node:22-alpine
ENV NODE_ENV=production
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
EXPOSE 3003
CMD ["npm", "start"]

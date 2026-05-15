# fido-vc-verifier-sidecar
# Installs @fido4vc/fido-vc-cryptosuite-ts from npmjs.com (public, no auth needed).

FROM node:22 AS builder
WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm install

COPY index.ts ./
RUN npm run build

FROM node:22 AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 8081
CMD ["npm", "start"]

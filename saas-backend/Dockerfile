# Use npm install instead of npm ci to avoid lock file sync issues
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Use npm install (not npm ci) - works without lock file and avoids sync errors
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY . .

EXPOSE 5005

# Run migrations then start (Render sets PORT automatically)
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]

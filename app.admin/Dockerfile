
# Build components library stage
FROM node:20-alpine AS components-builder

WORKDIR /app

# Copy the components library package.json and source code
COPY lib.components/package*.json ./lib.components/
COPY lib.components/tsconfig*.json ./lib.components/
COPY lib.components/vite.config.ts ./lib.components/
COPY lib.components/src/ ./lib.components/src/

# Install dependencies and build components
WORKDIR /app/lib.components
RUN npm install
RUN npm run build

# Build admin app stage
FROM node:20-alpine

WORKDIR /app

# Copy package.json files
COPY app.admin/package*.json ./

# Copy the built components from the previous stage
COPY --from=components-builder /app/lib.components/dist ./node_modules/@pairflix/components/dist
COPY --from=components-builder /app/lib.components/package.json ./node_modules/@pairflix/components/

# Install dependencies
RUN npm install

# Add rest of the admin code
COPY app.admin/ .

EXPOSE 5174

CMD ["npm", "run", "dev", "--", "--host"]
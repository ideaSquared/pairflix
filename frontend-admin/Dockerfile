FROM node:20-alpine

WORKDIR /app

# Add package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Add rest of the code
COPY . .

EXPOSE 5174

# Use ts-node-dev for hot reloading in development with host flag to expose on all interfaces
CMD ["npm", "run", "dev", "--", "--host"]
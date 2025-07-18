FROM node:18
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build code (nếu dùng TypeScript)
RUN npm run build

EXPOSE 3001

# Chạy file build ra (nếu dùng TypeScript)
CMD ["node", "dist/index.js"]
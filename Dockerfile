# Giai đoạn 1: Build ứng dụng
FROM node:20-alpine AS builder

WORKDIR /app

# Sao chép file package để install trước (tận dụng cache của Docker)
COPY package*.json ./
RUN npm install

# Sao chép toàn bộ code và build
COPY . .
RUN npm run build

# Giai đoạn 2: Chạy ứng dụng (Production)
FROM node:20-alpine

WORKDIR /app

# Chỉ copy những file cần thiết từ giai đoạn build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Khai báo biến môi trường (Có thể ghi đè khi chạy container)
ENV NODE_ENV=production

# Mở port (thường là 3000 cho NestJS)
EXPOSE 3000

# Lệnh chạy ứng dụng
CMD ["node", "dist/main"]
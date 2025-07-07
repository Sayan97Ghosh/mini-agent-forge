# Stage 1: Build the app
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# For dev / local server
# FROM node:20
# WORKDIR /app
# COPY . .
# RUN npm install
# RUN npm run build
# EXPOSE 4173
# CMD ["npm", "run", "preview"]

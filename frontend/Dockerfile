# -------- Stage 1: Build React App --------
FROM node:18-alpine as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Build the React app (CRA outputs to /build)
RUN npm run build

# -------- Stage 2: NGINX + Runtime Env Injection --------
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ✅ Fix: Copy correct React build folder (CRA = /build)
COPY --from=build /app/build /usr/share/nginx/html

# Copy env template and injection script
COPY public/env.template.js /usr/share/nginx/html/env.template.js
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
        
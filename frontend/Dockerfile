# -------- Stage 1: Build React App --------
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# -------- Stage 2: NGINX + Runtime Env Injection --------
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# CRA outputs 
#COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/dist /usr/share/nginx/html

COPY public/env.template.js /usr/share/nginx/html/env.template.js
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
    
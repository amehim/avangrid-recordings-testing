# -------- Stage 1: Build React App --------
FROM node:18-alpine as build

WORKDIR /app
        
        # Install dependencies
COPY package*.json ./
RUN npm install
        
        # Copy the rest of the code
COPY . .
        
        # Build the React app
RUN npm run build
        
        
        # -------- Stage 2: NGINX + Runtime Env Injection --------
FROM nginx:alpine
        
        # Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
        
        # Copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html
        
        # Copy env template (used to generate env.js)
COPY public/env.template.js /usr/share/nginx/html/env.template.js
        
        # Copy the entrypoint script and give it execution permission
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
        
        # Set entrypoint to the script that injects runtime env vars
ENTRYPOINT ["/entrypoint.sh"]
        
        # Expose port (default for nginx)
EXPOSE 80
        
        # Start nginx
CMD ["nginx", "-g", "daemon off;"]
        
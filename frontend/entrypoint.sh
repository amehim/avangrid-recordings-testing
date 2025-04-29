#!/bin/sh

# Replace placeholders in env.template.js and write to env.js
envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js

# Run NGINX in the foreground
exec nginx -g 'daemon off;'

FROM nginx:alpine

# Copy the exported web build to Nginx public directory
COPY dist /usr/share/nginx/html

# Expose port 80 (Nginx default)
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]

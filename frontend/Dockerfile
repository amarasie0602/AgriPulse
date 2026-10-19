# --- build stage: compile the Vite app -------------------------------------
# Vite inlines VITE_* vars into the bundle at build time, not at container
# startup — so they're passed in as build args, not runtime env vars.
FROM node:22-alpine AS builder
WORKDIR /app

ARG VITE_API_URL=http://localhost:3000
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_USE_MOCK_AUTH=false
ENV VITE_API_URL=$VITE_API_URL \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_USE_MOCK_AUTH=$VITE_USE_MOCK_AUTH

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- runtime stage: static files served by nginx ----------------------------
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

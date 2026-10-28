FROM nginxinc/nginx-unprivileged:1.31-alpine

COPY container/nginx/ /etc/nginx/

COPY src/ /usr/share/nginx/html/
COPY LICENSE /usr/share/nginx/html/

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1

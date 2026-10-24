FROM nginxinc/nginx-unprivileged:1.31-alpine

COPY container/nginx/ /etc/nginx/

COPY index.html app.js styles.css sw.js manifest.webmanifest LICENSE /usr/share/nginx/html/
COPY js/ /usr/share/nginx/html/js/
COPY icons/ /usr/share/nginx/html/icons/
COPY vendor/ /usr/share/nginx/html/vendor/

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1

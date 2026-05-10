# Nginx Config Required for WhatsApp QR (SSE)

Add this location block inside your server block for api.ruvali.co.in
in /etc/nginx/sites-available/api.ruvali.co.in (or similar path):

  location /api/admin/whatsapp/qr-stream {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Connection '';
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 300s;
    proxy_send_timeout 30;
    chunked_transfer_encoding on;
  }

After editing nginx config run:
  sudo nginx -t && sudo systemctl reload nginx

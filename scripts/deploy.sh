#!/usr/bin/env bash
# Deploys site/ to /var/www/pixeldodge.com and installs the NGINX site.
# Run on the Ubuntu box from the repo root after `git pull`:
#     sudo ./scripts/deploy.sh            # copy files, install site, reload nginx
#     sudo ./scripts/deploy.sh --tls      # the same, then request a certificate with certbot
# Safe to re-run: files are synced, and an existing NGINX config is left alone
# (certbot edits it in place, so overwriting it would drop the TLS block).
set -euo pipefail

DOMAIN="pixeldodge.com"
WEBROOT="/var/www/${DOMAIN}"
CONF_SRC="deploy/nginx/${DOMAIN}.conf"
CONF_DST="/etc/nginx/sites-available/${DOMAIN}.conf"
LINK="/etc/nginx/sites-enabled/${DOMAIN}.conf"

cd "$(dirname "$0")/.."
[[ $EUID -eq 0 ]] || { echo "run with sudo" >&2; exit 1; }
[[ -f site/index.html ]] || { echo "site/index.html not found; run from the repo" >&2; exit 1; }
command -v nginx >/dev/null || { echo "nginx is not installed" >&2; exit 1; }

echo "==> syncing site/ to ${WEBROOT}"
mkdir -p "${WEBROOT}"
if command -v rsync >/dev/null; then
  rsync -a --delete site/ "${WEBROOT}/"
else
  find "${WEBROOT}" -mindepth 1 -delete
  cp -a site/. "${WEBROOT}/"
fi
chown -R www-data:www-data "${WEBROOT}"

if [[ -f "${CONF_DST}" ]]; then
  echo "==> ${CONF_DST} already exists; leaving it as it is"
else
  echo "==> installing ${CONF_DST}"
  install -m 644 "${CONF_SRC}" "${CONF_DST}"
fi
[[ -e "${LINK}" ]] || ln -s "${CONF_DST}" "${LINK}"

echo "==> testing and reloading nginx"
nginx -t
systemctl reload nginx

if [[ "${1:-}" == "--tls" ]]; then
  command -v certbot >/dev/null || { echo "certbot is not installed (apt install certbot python3-certbot-nginx)" >&2; exit 1; }
  echo "==> requesting a certificate for ${DOMAIN}"
  certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" --redirect
fi

echo "==> done: http://${DOMAIN}/"

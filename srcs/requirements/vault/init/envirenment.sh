vault kv put secret/app SMTP_USER=example@mail.com SMTP_PASS=SuperSecretPassword 

vault kv put secret/app \
  SMTP_USER="example@mail.com" \
  SMTP_PASS="SuperSecretPassword" \
  PROXY_SSL="on" \
  BACKEND="http://app:3000" \
  SSL_PORT="8845" \
  SERVER_NAME="localhost" \
  MODSEC_AUDIT_ENGINE="On" \
  MODSEC_AUDIT_LOG="/var/log/modsec_audit.log" \
  GF_SECURITY_ADMIN_PASSWORD="1234" \
  GF_DASHBOARDS_DEFAULT_HOME_DASHBOARD_PATH="/etc/grafana/provisioning/dashboards/requests_count.json" \
  MAILER_USER="mppd.42.transcendence@gmail.com" \
  MAILER_PASS="txcj prjh exya uuop"



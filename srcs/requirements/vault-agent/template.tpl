{{ with secret "secret/data/app" }}
export SMTP_USER="{{ .Data.data.SMTP_USER }}"
export SMTP_PASS="{{ .Data.data.SMTP_PASS }}"
export PROXY_SSL="{{ .Data.data.PROXY_SSL }}"
export BACKEND="{{ .Data.data.BACKEND }}"
export SSL_PORT="{{ .Data.data.SSL_PORT }}"
export SERVER_NAME="{{ .Data.data.SERVER_NAME }}"
export MODSEC_AUDIT_ENGINE="{{ .Data.data.MODSEC_AUDIT_ENGINE }}"
export MODSEC_AUDIT_LOG="{{ .Data.data.MODSEC_AUDIT_LOG }}"
export GF_SECURITY_ADMIN_PASSWORD="{{ .Data.data.GF_SECURITY_ADMIN_PASSWORD }}"
export GF_DASHBOARDS_DEFAULT_HOME_DASHBOARD_PATH="{{ .Data.data.GF_DASHBOARDS_DEFAULT_HOME_DASHBOARD_PATH }}"
export MAILER_USER="{{ .Data.data.MAILER_USER }}"
export MAILER_PASS="{{ .Data.data.MAILER_PASS }}"
{{ end }}


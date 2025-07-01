{{ with secret "secret/data/app" }}
export SMTP_USER="{{ .Data.data.SMTP_USER }}"
export SMTP_PASS="{{ .Data.data.SMTP_PASS }}"
{{ end }}

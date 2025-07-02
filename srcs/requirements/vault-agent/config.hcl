vault {
  address = "http://vault:8200"
  retry {
    num_retries = 5
  }
}

auto_auth {
  method "token_file" {
    config = {
      token_file_path = "/tmp/vault-token"
    }
  }
  
  sink "file" {
    config = {
      path = "/tmp/vault-token-sink"
    }
  }
}

listener "tcp" {
  address     = "0.0.0.0:8100"
  tls_disable = true
}

template {
  source      = "/etc/vault-agent/template.tpl"
  destination = "/etc/secrets/env.sh"
  command     = "chmod 600 /etc/secrets/env.sh"
}

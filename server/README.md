# Bimbar Server - Guia de Deploy Seguro

## Pré-requisitos

- Node.js 18+
- VPS com Ubuntu 20.04+ ou Debian 11+
- Domínio próprio com SSL
- 2GB RAM mínimo

## 1. Instalação no Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Criar usuário do serviço
sudo useradd -r -s /bin/false bimbar

# Criar diretório
sudo mkdir -p /opt/bimbar-server
sudo chown bimbar:bimbar /opt/bimbar-server

# Clonar/receber código
cd /opt/bimbar-server
# (cole seus arquivos aqui)

# Instalar dependências
npm install --production

# Configurar variáveis de ambiente
cp .env.example .env
nano .env  # Edite com suas chaves seguras
```

## 2. Gerar Chaves Seguras

```bash
# Gerar LICENSE_SECRET (64 caracteres hex)
openssl rand -hex 32

# Gerar JWT_SECRET (128 caracteres hex)
openssl rand -hex 64

# Gerar ADMIN_SECRET (64 caracteres hex)
openssl rand -hex 32

# Gerar ADMIN_TOKEN_HASH
echo -n "seu-token-admin-aqui" | sha256sum | cut -d' ' -f1
```

## 3. Configurar Nginx com SSL

```bash
sudo apt install nginx certbot python3-certbot-nginx -y

sudo nano /etc/nginx/sites-available/bimbar
```

**Configuração Nginx:**

```nginx
server {
    listen 80;
    server_name api.seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.seudominio.com;

    ssl_certificate /etc/letsencrypt/live/api.seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.seudominio.com/privkey.pem;

    # Segurança SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Headers de segurança
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Limit size
    client_max_body_size 1k;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/bimbar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obter SSL
sudo certbot --nginx -d api.seudominio.com
```

## 4. Configurar Systemd

```bash
sudo nano /etc/systemd/system/bimbar-server.service
```

**Arquivo do serviço:**

```ini
[Unit]
Description=Bimbar License Server
After=network.target

[Service]
Type=simple
User=bimbar
WorkingDirectory=/opt/bimbar-server
EnvironmentFile=/opt/bimbar-server/.env
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

# Segurança
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/bimbar-server

[Install]
WantedBy=multi-user.target
```

```bash
# Ativar serviço
sudo systemctl daemon-reload
sudo systemctl enable bimbar-server
sudo systemctl start bimbar-server
sudo systemctl status bimbar-server
```

## 5. Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 6. Monitoramento

```bash
# Logs
sudo journalctl -u bimbar-server -f

# Status
sudo systemctl status bimbar-server

# Reiniciar
sudo systemctl restart bimbar-server
```

## 7. Backup

```bash
# Script de backup
#!/bin/bash
BACKUP_DIR="/backups/bimbar"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/licencas_$DATE.tar.gz /opt/bimbar-server/licencas.db

# Manter últimos 7 dias
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

## 8. Gerar Licenças

Use o script `generate-license.js` (veja na pasta tools):

```bash
node tools/generate-license.js \
  --tipo single \
  --email cliente@exemplo.com \
  --dias 0 \
  --secret YOUR_LICENSE_SECRET
```

## Variáveis de Ambiente Obrigatórias

```bash
LICENSE_SECRET=       # 64 chars hex (32 bytes)
JWT_SECRET=           # 128 chars hex (64 bytes)
ADMIN_SECRET=         # 64 chars hex (32 bytes)
ADMIN_TOKEN_HASH=     # SHA256 do token admin
PORT=3000
ALLOWED_ORIGINS=https://seudominio.com
NODE_ENV=production
```

## Testes de Segurança

```bash
# Testar HTTPS
curl -k https://localhost:3000/health

# Testar rate limiting
for i in {1..100}; do curl -k https://localhost:3000/health; done

# Verificar headers
curl -I https://localhost:3000
```

## Checklist de Segurança

- [ ] Todas as chaves geradas com `openssl rand`
- [ ] .env não está no gitignore
- [ ] SSL configurado com TLS 1.2+
- [ ] Firewall ativo (apenas 80, 443, 22)
- [ ] Systemd com isolamento de segurança
- [ ] Backup automático configurado
- [ ] Logs de auditoria ativos
- [ ] Rate limiting funcionando
- [ ] CORS restrito aos domínios permitidos
- [ ] NODE_ENV=production
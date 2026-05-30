# Bimbar - Sistema de Segurança

## 🛡️ Medidas de Segurança Implementadas

### 1. Licenciamento Server-Side
- ✅ Validação de licença no servidor (sem secret no client)
- ✅ Criptografia AES-256-GCM para dados sensíveis
- ✅ Tokens de sessão com expiração
- ✅ Binding por dispositivo (UUID + fingerprint)
- ✅ Rate limiting (10 ativações/hora por IP)
- ✅ Audit logging de todas as operações

### 2. Proteção do Dispositivo
- ✅ Detecção de root/jailbreak
- ✅ Verificação de integridade do APK
- ✅ Detecção de emulador
- ✅ Verificação de apps de root conhecidos
- ✅ Checagem de build props (debuggable, test-keys)

### 3. Segurança de Rede
- ✅ HTTPS obrigatório (HTTP bloqueado)
- ✅ TLS 1.2+ apenas
- ✅ Certificate pinning (configurar no deploy)
- ✅ Headers de segurança (HSTS, CSP, etc)
- ✅ CORS restrito

### 4. Segurança do Banco de Dados
- ✅ Criptografia AES-256 no SQLite
- ✅ Prepared statements (SQL injection prevention)
- ✅ Backup automático
- ✅ WAL mode para performance

### 5. Autenticação Admin
- ✅ Token-based authentication
- ✅ Rate limiting agressivo (50 req/hora)
- ✅ Hash constante para comparação (timing attack prevention)
- ✅ Audit log de todas as ações admin

### 6. Ofuscação de Código
- ✅ ProGuard/R8 habilitado
- ✅ Minification e tree-shaking
- ✅ Remoção de debug symbols

## 🚀 Deploy Seguro

### Pré-requisitos
- VPS com Ubuntu 20.04+ ou Debian 11+
- Domínio próprio com SSL
- Node.js 18+
- 2GB RAM mínimo

### Passos

1. **Configurar variáveis de ambiente**
```bash
cd server
cp .env.example .env
nano .env
```

Gerar chaves seguras:
```bash
node setup-env.js
```

2. **Instalar dependências**
```bash
npm install --production
```

3. **Configurar Nginx com SSL**
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.seudominio.com
```

4. **Configurar systemd**
```bash
sudo systemctl enable bimbar-server
sudo systemctl start bimbar-server
```

5. **Gerar licenças**
```bash
node generate-test-licenses.js
```

## 📋 Checklist de Segurança

### Antes do Deploy
- [ ] Chaves secretas geradas com `openssl rand`
- [ ] `.env` não está no git
- [ ] SSL configurado com TLS 1.2+
- [ ] Firewall ativo (apenas 80, 443, 22)
- [ ] CORS configurado para domínios específicos
- [ ] Rate limiting testado
- [ ] Backup automático configurado

### Após o Deploy
- [ ] Testar HTTPS
- [ ] Testar rate limiting
- [ ] Verificar headers de segurança
- [ ] Testar detecção de root
- [ ] Validar fluxo de ativação
- [ ] Verificar audit logs

## 🔧 Comandos Úteis

### Verificar status do servidor
```bash
sudo systemctl status bimbar-server
```

### Ver logs
```bash
sudo journalctl -u bimbar-server -f
```

### Testar ativação
```bash
curl -X POST https://api.seudominio.com/api/v2/ativar \
  -H "Content-Type: application/json" \
  -d '{"chave":"BIMBAR-xxx","device_uuid":"xxx","device_fingerprint":"xxx"}'
```

### Bloquear licença
```bash
curl -X POST https://api.seudominio.com/api/v2/admin/revisar \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"chave":"BIMBAR-xxx","acao":"bloquear","motivo":"Spam"}'
```

### Verificar audit logs
```bash
curl -X GET "https://api.seudominio.com/api/v2/admin/audit-log?limit=100" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 🚨 Incident Response

### Se uma chave for comprometida
1. Bloquear imediatamente via admin endpoint
2. Investigar logs de auditoria
3. Gerar nova chave para o cliente legítimo
4. Revisar configurações de segurança

### Se o servidor for comprometido
1. Desativar servidor imediatamente
2. Investigar acesso não autorizado
3. Rotacionar todas as chaves secretas
4. Restaurar do último backup limpo
5. Notificar clientes afetados

## 📞 Suporte

- Email: suporte@bimbar.com.br
- WhatsApp: +55 (XX) XXXXX-XXXX
- Docs: https://docs.bimbar.com.br

## 📜 Compliance

Este sistema segue as melhores práticas de:
- OWASP Mobile Top 10
- Android Security Best Practices
- NIST Cybersecurity Framework

---

**Última atualização:** 2026-05-28
**Versão:** 2.0.0
**Status:** ✅ Production Ready
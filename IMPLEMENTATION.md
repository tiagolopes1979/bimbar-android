# Bimbar - Guia de Implementação de Segurança

## ✅ Correções Implementadas

### 1. ✅ Credenciais Hardcoded REMOVIDAS
**Antes:**
```gradle
storePassword <senha_em_texto_puro>  // ❌ INSEGURO
```

**Depois:**
```gradle
storePassword System.getenv('KEYSTORE_PASSWORD')  // ✅ SEGURO
```

### 2. ✅ Criptografia no Banco de Dados
**Antes:**
```javascript
'no-encryption'  // ❌ Dados em texto plano
```

**Depois:**
```javascript
'AES-256'  // ✅ Criptografia forte
```

### 3. ✅ Backup Android DESATIVADO
**Antes:**
```xml
android:allowBackup="true"  // ❌ Dados extraíveis
```

**Depois:**
```xml
android:allowBackup="false"  // ✅ Protegido
```

### 4. ✅ ProGuard/R8 ATIVADO
**Antes:**
```gradle
minifyEnabled false  // ❌ Código legível
```

**Depois:**
```gradle
minifyEnabled true  // ✅ Código ofuscado
```

### 5. ✅ Licenciamento Server-Side
**Antes:**
```javascript
const SECRET = <segredo_no_client>  // ❌ No client!
```

**Depois:**
```javascript
// Cliente apenas envia chave para validação
// Servidor valida com secret segura
// Secret NUNCA exposta no client
```

### 6. ✅ HTTPS Obrigatório
**Implementado:**
- `networkSecurityConfig` bloqueia HTTP
- SSL/TLS 1.2+ obrigatório
- HSTS habilitado

### 7. ✅ Root/Jailbreak Detection
**Novo:**
- Plugin nativo Android para detecção
- Verifica paths de root
- Detecta apps de root conhecidos
- Verifica build props

### 8. ✅ Rate Limiting
**Implementado:**
- 100 req/15min (geral)
- 10 req/1h (ativação)
- 50 req/1h (admin)

### 9. ✅ Autenticação Admin
**Implementado:**
- Token-based auth
- Hash constante (timing attack prevention)
- Audit logging completo

### 10. ✅ Certificate Pinning Ready
**Configurado:**
- `networkSecurityConfig` pronto para pinning
- Headers de segurança completos

---

## 🚀 Próximos Passos

### IMEDIATO (HOJE)

1. **Gerar novas chaves secretas**
```bash
cd server
node setup-env.js
# GUARDE O ADMIN_TOKEN!
```

2. **Configurar variáveis de ambiente**
```bash
cp .env.example .env
nano .env
# Cole as chaves geradas
```

3. **Gerar licenças de teste**
```bash
node generate-test-licenses.js
cat test-licenses.txt
```

4. **Inserir licenças no banco**
```bash
sqlite3 licencas.db < licenses.sql
```

5. **Testar servidor localmente**
```bash
npm start
# Abrir https://localhost:3000/health
```

### CONFIGURAÇÃO DO ANDROID

6. **Configurar keystore seguro**
```bash
# Gerar novo keystore
keytool -genkey -v -keystore bimbar-release.keystore \
  -alias bimbar -keyalg RSA -keysize 2048 \
  -validity 10000

# Guardar em local seguro (NÃO no git)
```

7. **Configurar variáveis de build**
```bash
# No CI/CD ou máquina de build:
export KEYSTORE_PASSWORD=seu_password_seguro
export KEY_PASSWORD=seu_key_password
```

8. **Build do APK**
```bash
npm run build:android
```

### DEPLOY EM PRODUÇÃO

9. **Configurar VPS**
```bash
# Ver SECURITY.md para instruções completas
```

10. **Configurar Nginx + SSL**
```bash
sudo certbot --nginx -d api.seudominio.com
```

11. **Testar tudo**
```bash
# Testar ativação
curl -X POST https://api.seudominio.com/api/v2/ativar \
  -H "Content-Type: application/json" \
  -d '{...}'

# Testar admin
curl -X GET https://api.seudominio.com/api/v2/admin/listar \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 📊 Comparativo: Antes vs Depois

| Recursos | Antes | Depois |
|----------|-------|--------|
| Senhas hardcoded | ❌ Sim | ✅ Não |
| Criptografia DB | ❌ Não | ✅ AES-256 |
| Backup Android | ❌ Habilitado | ✅ Desabilitado |
| ProGuard | ❌ Desabilitado | ✅ Habilitado |
| Licenciamento | ❌ Client-side | ✅ Server-side |
| Secret no client | ❌ Sim | ✅ Não |
| HTTPS obrigatório | ❌ Não | ✅ Sim |
| Root detection | ❌ Não | ✅ Sim |
| Rate limiting | ❌ Não | ✅ Sim |
| Auth admin | ❌ Não | ✅ Sim |
| Audit logging | ❌ Não | ✅ Sim |
| TLS 1.2+ | ❌ Não | ✅ Sim |

---

## ⚠️ Importante

### O QUE NÃO DEVE SER FEITO

❌ **NUNCA** commitar `.env` ou chaves secretas
❌ **NUNCA** usar senhas hardcoded
❌ **NUNCA** permitir HTTP em produção
❌ **NUNCA** compartilhar ADMIN_TOKEN
❌ **NUNCA** desabilitar HTTPS

### O QUE DEVE SER FEITO

✅ **SEMPRE** usar variáveis de ambiente
✅ **SEMPRE** gerar chaves com `openssl rand`
✅ **SEMPRE** usar HTTPS
✅ **SEMPRE** rotacionar chaves periodicamente
✅ **SEMPRE** monitorar audit logs

---

## 🔐 Segurança em Camadas

```
┌─────────────────────────────────────┐
│  1. Network Security                │
│  - HTTPS/TLS                        │
│  - Certificate Pinning              │
│  - Firewall                         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  2. Application Security            │
│  - Root Detection                   │
│  - Integridade APK                  │
│  - ProGuard/R8                      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  3. License Validation              │
│  - Server-side only                 │
│  - Token-based auth                 │
│  - Rate limiting                    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  4. Data Protection                 │
│  - AES-256 Encryption               │
│  - No backup                        │
│  - Secure storage                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  5. Monitoring & Audit              │
│  - Audit logs                       │
│  - Security alerts                  │
│  - Incident response                │
└─────────────────────────────────────┘
```

---

## 📞 Suporte

Se encontrar vulnerabilidades ou tiver dúvidas:

- **Email:** security@bimbar.com.br
- **Docs:** SECURITY.md
- **Issues:** GitHub Issues

---

**Versão:** 2.0.0  
**Última atualização:** 2026-05-28  
**Status:** ✅ Production Ready

# Bimbar - Guia de Início Rápido de Segurança

## 🚀 Configuração Inicial (5 minutos)

### 1. Gerar chaves seguras

```bash
cd server
npm install
node setup-env.js
```

**GUARDE O ADMIN_TOKEN que será exibido!**

### 2. Configurar servidor

```bash
cp .env.example .env
# Edite .env com as chaves geradas
```

### 3. Gerar licenças de teste

```bash
node generate-test-licenses.js
cat test-licenses.txt
```

### 4. Inserir no banco

```bash
sqlite3 licencas.db < licenses.sql
```

### 5. Testar servidor

```bash
npm start
# Abrir https://localhost:3000/health
```

---

## 📱 Gerar Keystore Android

```bash
cd android/app
keytool -genkey -v \
  -keystore bimbar-release.keystore \
  -alias bimbar \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**GUARDE A SENHA DO KEYSTORE!**

### Configurar variáveis de ambiente

```bash
export KEYSTORE_PASSWORD=sua_senha_keystore
export KEY_PASSWORD=sua_senha_key
```

---

## 🏗️ Build do APK

```bash
npm run build:android
```

O APK será gerado em:
`android/app/build/outputs/apk/release/app-release.apk`

---

## 🖥️ Deploy do Servidor

### Pré-requisitos
- VPS com Ubuntu 20.04+
- Domínio com SSL
- Node.js 18+

### Passos rápidos

```bash
# 1. Instalar
cd /opt
git clone <seu-repo> bimbar-server
cd bimbar-server/server
npm install --production

# 2. Configurar
cp .env.example .env
nano .env  # Cole suas chaves

# 3. SSL
sudo apt install nginx certbot
sudo certbot --nginx -d api.seudominio.com

# 4. Systemd
sudo cp bimbar-server.service /etc/systemd/system/
sudo systemctl enable bimbar-server
sudo systemctl start bimbar-server
```

---

## ✅ Verificar Segurança

```bash
node check-security.js
```

Deve mostrar:
```
✅ Verificação PASSED - Tudo OK!
```

---

## 📚 Documentação Completa

- **SECURITY.md** - Detalhes de segurança
- **IMPLEMENTATION.md** - Guia de implementação
- **server/README.md** - Guia de deploy do servidor

---

## 🆘 Problemas Comuns

### Erro: "LICENSE_SECRET inválida"
```bash
cd server
node setup-env.js
```

### Erro: "Keystore não encontrado"
```bash
cd android/app
keytool -genkey -v -keystore bimbar-release.keystore ...
```

### Erro: "HTTPS necessário"
Configure URL do servidor com `https://` em vez de `http://`

---

## 📞 Suporte

- Email: suporte@bimbar.com.br
- Docs: SECURITY.md
# 📱 Sistema de Validação Única por Dispositivo
## Explicação para Clientes

---

## 🎯 O Que É Este Sistema?

O sistema de **Validação Única por Dispositivo** é uma tecnologia de segurança que garante que cada licença do Bimbar seja ativada **apenas uma vez** em cada aparelho celular.

### Analogia Simples
Imagine que sua licença é como uma **chave magnética** de hotel:
- ✅ A primeira vez que você usa, a porta abre e o sistema registra
- ❌ Se alguém copiar a chave e tentar usar em outro hotel, não funciona
- ❌ Se você tentar usar a mesma chave em outro quarto do mesmo hotel, é bloqueado

---

## 🔐 Como Funciona (Passo a Passo)

### 1️⃣ **Primeira Ativação**
```
Cliente compra licença → "BIMBAR-XXXX-YYYY-ZZZZ"
         ↓
Instala no celular Samsung Galaxy S21
         ↓
Sistema gera "digital" única do dispositivo:
- Modelo do celular
- Versão do Android
- Configurações de tela
- ID único do processador
- Características do hardware
         ↓
Essa "digital" é enviada para o servidor
         ↓
Servidor registra: "Licença X ativada no Dispositivo Y"
         ↓
✅ Acesso liberado!
```

### 2️⃣ **Tentativa de Cópia (Bloqueada)**
```
Alguém copia o APK para outro celular
         ↓
Tenta ativar com a mesma licença
         ↓
Servidor verifica: "Esta licença já foi usada neste dispositivo"
         ↓
❌ BLOQUEADO!
         ↓
Motivo: "Digital" do novo celular é diferente
```

### 3️⃣ **Reinstalação no Mesmo Celular**
```
Cliente desinstala e reinstala o app
         ↓
Tenta ativar novamente
         ↓
Servidor verifica: "Digital do dispositivo é a mesma"
         ↓
✅ PERMITIDO! (mesma licença, mesmo celular)
```

---

## 🛡️ O Que Isso Protege?

### ✅ **Protege Contra:**

1. **Compartilhamento de Licença**
   - ❌ Cliente A não pode comprar 1 licença e instalar em 5 celulares
   - ❌ Funcionários não podem compartilhar entre si

2. **Cópia Não Autorizada**
   - ❌ APK copiado para outro dispositivo não ativa
   - ❌ Licença roubada não pode ser usada por ladrão

3. **Revenda de Licenças Usadas**
   - ❌ Licença de cliente que cancelou não pode ser reutilizada
   - ❌ Cada licença é "grudada" no dispositivo original

4. **Testes Ilimitados**
   - ❌ Não pode criar múltiplos dispositivos virtuais para testar
   - ❌ Cada teste consome uma ativação

### ✅ **Permite:**

1. **Uso Normal**
   - ✅ Reinstalar no mesmo celular quantas vezes quiser
   - ✅ Atualizar o Android sem perder a licença
   - ✅ Fazer backup e restaurar

2. **Troca de Dispositivo (com controle)**
   - ✅ Se o celular quebrar, pode transferir (via suporte)
   - ✅ Se comprar celular novo, pode migrar (1 vez por ano)

---

## 🔍 Como o Sistema "Reconhece" o Dispositivo?

### **Fingerprint Digital (Impressão Digital)**

O sistema cria uma "impressão digital" única combinando:

| Característica | Exemplo | Por quê? |
|----------------|---------|----------|
| Modelo do dispositivo | Samsung Galaxy S21 | Identifica o hardware |
| Versão do Android | 14 (API 34) | Diferencia versões |
| Screen resolution | 1080x2400 | Característica física |
| Timezone | America/Sao_Paulo | Localização |
| Language | pt-BR | Configuração regional |
| Canvas fingerprint | Hash único | Identificador gráfico |
| Device UUID | Gerado no primeiro uso | Identificador persistente |

**Resultado:** Um hash único como:
```
a3f5b8c9d2e1f4a7b6c5d8e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0
```

### **Por que não pode burlar?**

1. **Não é apenas o IMEI** (que pode ser alterado)
2. **Não é apenas o Android ID** (que reseta na reinstalação)
3. **É uma combinação de 10+ fatores** que juntos são únicos

Mesmo que tente:
- ❌ Mudar IMEI → Outros fatores ainda são diferentes
- ❌ Resetar Android ID → Hardware permanece o mesmo
- ❌ Usar emulator → Fingerprint detecta como emulator
- ❌ Rootear dispositivo → Sistema bloqueia dispositivos rootados

---

## 📊 Fluxo Completo de Validação

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Celular)                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
              Instala App Bimbar v2.0
                            ↓
              Gera Fingerprint Único
              (10+ características)
                            ↓
              Insere Chave de Licença
              "BIMBAR-XXXX-YYYY-ZZZZ"
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  SERVIDOR DE LICENÇAS                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
              Recebe: Chave + Fingerprint
                            ↓
              1. Verifica se chave existe
                            ↓
              2. Verifica se chave está ativa
                            ↓
              3. Verifica se já foi usada neste dispositivo:
                 SELECT * FROM validacoes_dispositivo
                 WHERE licenca_id = ? AND device_uuid = ?
                            ↓
              ┌──────────────┐        ┌──────────────┐
              │  NÃO EXISTE  │        │  JÁ EXISTE   │
              └──────────────┘        └──────────────┘
                    ↓                        ↓
         ┌──────────────────┐      ┌──────────────────┐
         │  Verifica limite │      │  Verifica data   │
         │  de dispositivos │      │  da última uso   │
         └──────────────────┘      └──────────────────┘
                    ↓                        ↓
         ┌──────────────────┐      ┌──────────────────┐
         │  ≤ 1 dispositivo │      │  ≤ 30 dias       │
         └──────────────────┘      └──────────────────┘
                    ↓                        ↓
              ┌────────┐              ┌────────┐
              │   SIM  │              │   SIM  │
              └────────┘              └────────┘
                    ↓                        ↓
         ✅ ATIVA E REGISTRA        ✅ REATIVA (mesmo dev)
         INSERT INTO validacoes...
                            ↓
              ┌──────────────────┐
              │       NÃO        │
              └──────────────────┘
                    ↓
              ❌ BLOQUEADO
              "Licença já ativa neste dispositivo"
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Resultado)                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
              ✅ Acesso liberado OU
              ❌ Mensagem de erro
```

---

## 💼 Benefícios para o Negócio

### **Para Você (Vendedor do Bimbar)**

| Benefício | Impacto |
|-----------|---------|
| **Protege sua receita** | Cada licença = 1 cliente pago |
| **Impede pirataria** | APK copiado não funciona |
| **Controle total** | Você sabe onde cada licença está |
| **Bloqueio remoto** | Pode desativar licenças inadimplentes |
| **Dados de uso** | Quantos dispositivos ativos |

### **Para Seu Cliente (Comprador da Licença)**

| Benefício | Explicação |
|-----------|------------|
| **Exclusividade** | Ninguém mais usa sua licença |
| **Segurança** | Se perder celular, pode recuperar |
| **Suporte** | Em caso de problema, você ajuda |
| **Atualizações** | Recebe novidades gratuitamente |
| **Justo** | Paga apenas pelo que usa |

---

## 🚨 Cenários Comuns e Como o Sistema Reage

### Cenário 1: Cliente Compra, Instala, Usa
```
✅ NORMAL - Tudo funciona perfeitamente
```

### Cenário 2: Cliente Tenta Compartilhar com Amigo
```
Cliente: "Vou te mandar o APK, você instala"
Amigo instala no celular dele
Tenta ativar com a mesma chave
         ↓
❌ BLOQUEADO: "Esta licença já está ativa em outro dispositivo"
```

### Cenário 3: Cliente Formata o Celular
```
Cliente formata → Reinstala app
Tenta ativar novamente
         ↓
✅ PERMITIDO: "Mesmo dispositivo, mesma licença"
```

### Cenário 4: Cliente Compra Celular Novo
```
Cliente: "Comprei Samsung S23, quero migrar"
Tenta ativar no novo celular
         ↓
❌ BLOQUEADO: "Licença já ativa em outro dispositivo"
         ↓
Solução: Cliente entra em contato → Você libera 1 migração
```

### Cenário 5: Hacker Tenta Burlar
```
Hacker: "Vou rootar e mudar o IMEI"
Roota o dispositivo
         ↓
❌ BLOQUEADO: "Dispositivo não seguro (root detectado)"
```

### Cenário 6: Testador Cria 10 Emuladores
```
Testador: "Vou testar em 10 emuladores"
Cria emulador 1 → ativa
Cria emulador 2 → ativa
         ↓
❌ BLOQUEADO: "Emulador detectado" OU
              "Muitas ativações do mesmo IP"
```

---

## 📋 Política Recomendada para Seus Clientes

### **Licença Single (1 dispositivo)**
- ✅ 1 licença = 1 celular
- ✅ Pode reinstalar quantas vezes
- ✅ 1 migração por ano (celular novo)
- ❌ Não pode compartilhar
- ❌ Não pode usar em 2 celulares simultâneos

### **Licença Enterprise (múltiplos dispositivos)**
- ✅ Compra N licenças = N celulares
- ✅ Cada funcionário tem sua licença
- ✅ Controle centralizado
- ✅ Relatórios de uso

---

## 🔧 Como Gerenciar (Para Você)

### **Painel Admin**
```bash
# Ver todas as ativações
curl https://api.seudominio.com/api/v2/admin/listar \
  -H "Authorization: Bearer SEU_TOKEN"

# Bloquear licença
curl -X POST https://api.seudominio.com/api/v2/admin/revisar \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"chave":"BIMBAR-XXX","acao":"bloquear","motivo":"Inadimplente"}'

# Ver logs de ativação
curl https://api.seudominio.com/api/v2/admin/audit-log?limit=100
```

### **Migrar Cliente para Celular Novo**
```sql
-- No banco de dados do servidor
DELETE FROM validacoes_dispositivo 
WHERE licenca_id = 123 AND device_uuid = 'velho_uuid';

-- Agora cliente pode ativar no novo celular
```

---

## 💬 FAQ - Perguntas Frequentes dos Clientes

### **P: "Posso instalar no celular e tablet?"**
R: Depende da licença. Single = 1 dispositivo. Enterprise = pode comprar 2 licenças.

### **P: "E se meu celular quebrar?"**
R: Entre em contato com suporte. Podemos liberar 1 migração gratuita.

### **P: "Posso compartilhar com meu sócio?"**
R: Não. Cada dispositivo precisa de sua própria licença.

### **P: "E se eu mudar de operadora/trocar SIM card?"**
R: Não afeta. O sistema identifica o hardware, não o chip.

### **P: "Posso fazer root no celular?"**
R: Não. Por segurança, o app não funciona em dispositivos rootados.

### **P: "O que acontece se eu desinstalar?"**
R: Nada. Pode reinstalar whenever quiser, a licença permanece no mesmo dispositivo.

### **P: "E se eu vender meu celular?"**
R: Importante: desinstale antes de vender. O novo dono precisará comprar sua própria licença.

---

## 🎓 Resumo Técnico (Para Desenvolvedores)

### **Tecnologias Usadas**

| Componente | Tecnologia | Por quê? |
|------------|------------|----------|
| **Fingerprint** | SHA-256 + 10+ fatores | Único e não reversível |
| **Validação Única** | Tabela `validacoes_dispositivo` com UNIQUE | Garante 1 licença = 1 dispositivo |
| **Armazenamento** | SQLite com AES-256 | Dados criptografados no servidor |
| **Validação** | Prepared statements | Previne SQL injection |
| **Rate Limit** | express-rate-limit | Previne brute force |
| **Comunicação** | HTTPS + TLS 1.3 | Criptografia em trânsito |
| **Device Binding** | UNIQUE(licenca_id, device_uuid) | Garante validação única no banco |

### **Schema do Banco - Validação Única**

```sql
-- Tabela principal de licenças
CREATE TABLE licencas (
  id INTEGER PRIMARY KEY,
  chave_hash TEXT UNIQUE,
  tipo TEXT,  -- 'single' ou 'enterprise'
  status TEXT,
  device_uuid TEXT,
  ...
);

-- Tabela de validações únicas (NOVA!)
CREATE TABLE validacoes_dispositivo (
  id INTEGER PRIMARY KEY,
  licenca_id INTEGER NOT NULL REFERENCES licencas(id),
  device_uuid TEXT NOT NULL,
  device_fingerprint TEXT NOT NULL,
  validado_em TEXT NOT NULL DEFAULT (datetime('now')),
  ip TEXT,
  user_agent TEXT,
  UNIQUE(licenca_id, device_uuid)  -- ← GARANTE VALIDAÇÃO ÚNICA!
);

-- Índices para performance
CREATE INDEX idx_validacoes_licenca ON validacoes_dispositivo(licenca_id);
CREATE INDEX idx_validacoes_device ON validacoes_dispositivo(device_uuid);
```

### **Lógica de Validação ÚNICA**

```javascript
// 1. Verificar se já existe validação deste dispositivo
const validacaoExistente = db.prepare(`
  SELECT * FROM validacoes_dispositivo
  WHERE licenca_id = ? AND device_uuid = ?
`).get(licencaId, deviceUuid);

if (validacaoExistente) {
  // ✅ MESMO DISPOSITIVO → Reativação permitida
  // (cliente reinstalou, formatou, etc)
  return { valido: true, reativacao: true };
}

// 2. Nova combinação - verificar limite
const totalDispositivos = db.prepare(`
  SELECT COUNT(*) as count FROM validacoes_dispositivo
  WHERE licenca_id = ?
`).get(licencaId).count;

const limite = licenca.tipo === 'enterprise' ? 10 : 1;

if (totalDispositivos >= limite) {
  // ❌ LIMITE ALCANÇADO
  return { 
    valido: false, 
    motivo: `Limite de ${limite} dispositivo(s) atingido` 
  };
}

// 3. Nova validação - registrar
db.prepare(`
  INSERT INTO validacoes_dispositivo 
  (licenca_id, device_uuid, device_fingerprint)
  VALUES (?, ?, ?)
`).run(licencaId, deviceUuid, fingerprint);

// ✅ NOVOS DISPOSITIVO DENTRO DO LIMITE → Permitido
```

### **Fluxo Completo**

```
Cliente tenta ativar
         ↓
┌──────────────────────────────────────┐
│ 1. Verificar se dispositivo já validou│
│    SELECT * FROM validacoes_dispositivo│
│    WHERE licenca_id = X               │
│    AND device_uuid = Y                │
└──────────────────────────────────────┘
         ↓
    ┌──────────┐      ┌──────────┐
    │  EXISTE  │      │ NÃO EXISTE│
    └──────────┘      └──────────┘
         ↓                 ↓
    ✅ REATIVA       ┌──────────────┐
    (mesmo dev)      │ 2. Contar    │
                     │ dispositivos │
                     │ ativos       │
                     └──────────────┘
                             ↓
                        ┌──────────┐
                        │ ≤ Limite?│
                        └──────────┘
                             ↓
                   ┌────────┐    ┌────────┐
                   │   SIM  │    │   NÃO  │
                   └────────┘    └────────┘
                       ↓             ↓
              ✅ REGISTRAR    ❌ BLOQUEAR
              nova validação   "Limite atingido"
```

### **Exemplos de Uso**

#### Exemplo 1: Primeira Ativação (Single)
```javascript
// Cliente instala no Samsung S21
POST /api/v2/ativar
{
  "chave": "BIMBAR-XXXX-YYYY-ZZZZ",
  "device_uuid": "abc-123-def-456",
  "device_fingerprint": "a1b2c3d4..."
}

// Response: 200 OK
{
  "valido": true,
  "tipo": "single",
  "reativacao": false,
  "mensagem": "Licença ativada com sucesso"
}

// Banco: INSERT na tabela validacoes_dispositivo
```

#### Exemplo 2: Reinstalação no Mesmo Celular
```javascript
// Cliente formatou e reinstalou
POST /api/v2/ativar
{
  "chave": "BIMBAR-XXXX-YYYY-ZZZZ",
  "device_uuid": "abc-123-def-456",  // MESMO!
  "device_fingerprint": "a1b2c3d4..."  // MESMO!
}

// Response: 200 OK
{
  "valido": true,
  "reativacao": true,
  "mensagem": "Dispositivo reconhecido. Acesso reativado."
}

// Banco: UPDATE no registro existente (não cria novo)
```

#### Exemplo 3: Tentativa de Cópia para Outro Celular
```javascript
// Alguém copiou APK para iPhone
POST /api/v2/ativar
{
  "chave": "BIMBAR-XXXX-YYYY-ZZZZ",
  "device_uuid": "xyz-789-ghi-012",  // DIFERENTE!
  "device_fingerprint": "z9y8x7w6..."  // DIFERENTE!
}

// Response: 409 Conflict
{
  "valido": false,
  "motivo": "Limite de 1 dispositivo(s) atingido para esta licença"
}

// Banco: NÃO registra (já existe 1 dispositivo)
```

#### Exemplo 4: Enterprise (10 dispositivos)
```javascript
// Empresa com 5 celulares tentando ativar
Celular 1: ✅ Permite (1/10)
Celular 2: ✅ Permite (2/10)
Celular 3: ✅ Permite (3/10)
Celular 4: ✅ Permite (4/10)
Celular 5: ✅ Permite (5/10)
...
Celular 11: ❌ Bloqueia (Limite 10 atingido)
```

### **Lógica de Validação**
```javascript
// Server-side check
const jaExiste = db.prepare(`
  SELECT * FROM validacoes_dispositivo
  WHERE licenca_id = ? AND device_uuid = ?
`).get(licencaId, deviceUuid);

if (jaExiste) {
  // Mesma licença + mesmo dispositivo → PERMITIDO
  return { valido: true, reativacao: true };
}

// Nova combinação → Verifica limite
const totalAtivacoes = db.prepare(`
  SELECT COUNT(*) FROM validacoes_dispositivo
  WHERE licenca_id = ?
`).get(licencaId).count;

if (totalAtivacoes >= limite) {
  return { valido: false, motivo: 'Limite atingido' };
}

// Tudo OK → Registra
db.prepare(`
  INSERT INTO validacoes_dispositivo 
  (licenca_id, device_uuid, device_fingerprint)
  VALUES (?, ?, ?)
`).run(licencaId, deviceUuid, fingerprint);
```

---

## 📞 Contato e Suporte

**Dúvidas?**
- Email: suporte@bimbar.com.br
- WhatsApp: +55 (XX) XXXXX-XXXX
- Docs: https://docs.bimbar.com.br

---

**Versão:** 2.0.0  
**Última Atualização:** 2026-05-28  
**Status:** ✅ Production Ready
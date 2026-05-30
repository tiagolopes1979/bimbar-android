# 📱 Testes Manuais - Validação Única por Dispositivo

## Pré-requisitos

- Servidor rodando (`npm start` no servidor)
- APK do Bimbar instalado
- 2 dispositivos Android para teste
- Licença de teste (gerar com `node server/generate-test-licenses.js`)

---

## 📋 Checklist de Testes

### ✅ Teste 1: Primeira Ativação

**Objetivo:** Verificar que a primeira ativação funciona

**Passos:**
1. Instalar APK no Dispositivo A
2. Abrir o app
3. Inscrever licença de teste
4. No primeiro acesso, cadastrar um usuário admin e uma senha forte

**Resultado Esperado:**
- ✅ Acesso liberado
- ✅ Mensagem: "Licença ativada com sucesso"
- ✅ App funciona normalmente

**Resultado Real:** _______

---

### ✅ Teste 2: Reinstalação no Mesmo Dispositivo

**Objetivo:** Verificar que reinstalar no mesmo celular funciona

**Passos:**
1. Desinstalar app do Dispositivo A
2. Reiniciar o celular (opcional)
3. Instalar APK novamente no Dispositivo A
4. Abrir o app
5. Inscrever a MESMA licença

**Resultado Esperado:**
- ✅ Acesso liberado
- ✅ Mensagem: "Dispositivo reconhecido. Acesso reativado."
- ✅ Dados do banco preservados (se não formatou)

**Resultado Real:** _______

---

### ✅ Teste 3: Cópia para Outro Dispositivo (BLOQUEIO)

**Objetivo:** Verificar que copiar APK para outro celular é bloqueado

**Passos:**
1. Copiar APK para Dispositivo B (via Bluetooth, email, etc)
2. Instalar APK no Dispositivo B
3. Abrir o app
4. Inscrever a MESMA licença usada no Dispositivo A

**Resultado Esperado:**
- ❌ Acesso BLOQUEADO
- ❌ Mensagem: "Licença já ativa em outro dispositivo" OU "Limite de 1 dispositivo atingido"
- ❌ App não permite login

**Resultado Real:** _______

---

### ✅ Teste 4: Formatação do Dispositivo

**Objetivo:** Verificar que formatar o celular não impede reativação

**Passos:**
1. No Dispositivo A, fazer backup dos dados (opcional)
2. Fazer "Reset de fábrica" no Dispositivo A
3. Configurar o celular do zero
4. Instalar APK novamente
5. Inscrever a MESMA licença

**Resultado Esperado:**
- ✅ Acesso liberado (mesmo após formatação)
- ✅ Mensagem: "Dispositivo reconhecido" OU nova ativação permitida
- ⚠️ Dados do app perdidos (normal após formatação)

**Resultado Real:** _______

---

### ✅ Teste 5: Múltiplos Dispositivos (Enterprise)

**Objetivo:** Verificar que plano Enterprise permite múltiplos dispositivos

**Pré-requisito:** Licença Enterprise

**Passos:**
1. Instalar APK no Dispositivo A → Ativar com licença Enterprise
2. Instalar APK no Dispositivo B → Ativar com MESMA licença
3. Instalar APK no Dispositivo C → Ativar com MESMA licença

**Resultado Esperado:**
- ✅ Dispositivo A: Ativado com sucesso
- ✅ Dispositivo B: Ativado com sucesso
- ✅ Dispositivo C: Ativado com sucesso
- ✅ Todos os dispositivos funcionam simultaneamente

**Resultado Real:** _______

---

### ✅ Teste 6: Limite Enterprise Atingido

**Objetivo:** Verificar que limite de dispositivos é respeitado

**Pré-requisito:** Licença Enterprise (limite 10)

**Passos:**
1. Ativar em 10 dispositivos diferentes
2. Tentar ativar em 11º dispositivo

**Resultado Esperado:**
- ✅ Dispositivos 1-10: Ativados com sucesso
- ❌ Dispositivo 11: Bloqueado com mensagem "Limite de 10 dispositivos atingido"

**Resultado Real:** _______

---

### ✅ Teste 7: Dispositivo Rootado (BLOQUEIO)

**Objetivo:** Verificar que dispositivos rootados são bloqueados

**Pré-requisito:** Dispositivo com root (Magisk, SuperSU, etc)

**Passos:**
1. Obter root no Dispositivo C
2. Instalar APK no Dispositivo rootado
3. Tentar ativar com licença válida

**Resultado Esperado:**
- ❌ Acesso BLOQUEADO
- ❌ Mensagem: "Dispositivo não seguro" OU "Root detectado"
- ❌ App não permite uso

**Resultado Real:** _______

---

### ✅ Teste 8: Emulador (BLOQUEIO)

**Objetivo:** Verificar que emuladores são detectados e bloqueados

**Pré-requisito:** Emulador Android (BlueStacks, Nox, Genymotion, etc)

**Passos:**
1. Instalar emulador no PC
2. Instalar APK no emulador
3. Tentar ativar com licença válida

**Resultado Esperado:**
- ❌ Acesso BLOQUEADO
- ❌ Mensagem: "Emulador detectado" OU "Dispositivo não suportado"

**Resultado Real:** _______

---

### ✅ Teste 9: Licença Inexistente

**Objetivo:** Verificar que chaves inválidas são rejeitadas

**Passos:**
1. Instalar APK em qualquer dispositivo
2. Tentar ativar com chave falsa: `BIMBAR-FAKE-KEY-12345`

**Resultado Esperado:**
- ❌ Acesso BLOQUEADO
- ❌ Mensagem: "Chave não encontrada" OU "Chave inválida"

**Resultado Real:** _______

---

### ✅ Teste 10: Compartilhamento entre Amigos (BLOQUEIO)

**Objetivo:** Verificar que compartilhar licença é bloqueado

**Cenário:** João compra licença, quer compartilhar com Maria

**Passos:**
1. João instala no celular dele → Ativa com sucesso
2. João envia APK para Maria
3. Maria instala no celular dela
4. Maria tenta ativar com a mesma chave de João

**Resultado Esperado:**
- ✅ João: Acesso liberado
- ❌ Maria: Acesso BLOQUEADO
- ❌ Mensagem: "Licença já ativa em outro dispositivo"

**Resultado Real:** _______

---

## 📊 Tabela de Resultados

| Teste | Descrição | Esperado | Realizado | Status |
|-------|-----------|----------|-----------|--------|
| 1 | Primeira ativação | ✅ Permitir | _______ | ⬜ Pass / ⬜ Fail |
| 2 | Reinstalação mesmo dev | ✅ Permitir | _______ | ⬜ Pass / ⬜ Fail |
| 3 | Cópia outro dispositivo | ❌ Bloquear | _______ | ⬜ Pass / ⬜ Fail |
| 4 | Formatação dispositivo | ✅ Permitir | _______ | ⬜ Pass / ⬜ Fail |
| 5 | Enterprise multi-dev | ✅ Permitir 3 | _______ | ⬜ Pass / ⬜ Fail |
| 6 | Limite Enterprise | ❌ Bloquear 11 | _______ | ⬜ Pass / ⬜ Fail |
| 7 | Dispositivo rootado | ❌ Bloquear | _______ | ⬜ Pass / ⬜ Fail |
| 8 | Emulador | ❌ Bloquear | _______ | ⬜ Pass / ⬜ Fail |
| 9 | Licença inexistente | ❌ Bloquear | _______ | ⬜ Pass / ⬜ Fail |
| 10 | Compartilhamento | ❌ Bloquear | _______ | ⬜ Pass / ⬜ Fail |

**Total:** ___/10 testes passaram

---

## 🐛 Bugs Encontrados

| Teste | Descrição do Bug | Severidade | Screenshot |
|-------|------------------|------------|------------|
| | | Crítico / Alto / Médio / Baixo | [ ] |
| | | Crítico / Alto / Médio / Baixo | [ ] |

---

## 📝 Observações

```
(Escreva aqui qualquer observação sobre os testes)
- Tempo de ativação: _______ segundos
- Mensagens claras? Sim / Não
- Alguma mensagem confusa? _______
- Algum comportamento inesperado? _______
```

---

## ✅ Aprovação

- [ ] Todos os testes críticos passaram
- [ ] Nenhuma falha crítica encontrada
- [ ] Mensagens de erro são claras
- [ ] UX é satisfatória

**Aprovado para produção?** ☐ SIM ☐ NÃO

**Testado por:** ________________  
**Data:** ________________  
**Versão do app:** ________________  
**Versão do servidor:** ________________

---

## 📞 Suporte

Se encontrar bugs ou comportamentos inesperados:

- Email: suporte@bimbar.com.br
- WhatsApp: +55 (XX) XXXXX-XXXX
- Inclua:
  - Modelo do dispositivo
  - Versão do Android
  - Screenshot do erro
  - Chave de licença (parcial)
  - Logs do app (se possível)

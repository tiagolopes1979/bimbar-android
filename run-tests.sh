#!/bin/bash
# Script para rodar testes de validação única

echo "🧪 Iniciando testes de Validação Única por Dispositivo..."
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

# Verificar se better-sqlite3 está instalado
if ! node -e "require('better-sqlite3')" 2>/dev/null; then
    echo "⚠️  better-sqlite3 não encontrado. Instalando..."
    npm install better-sqlite3
fi

# Rodar testes
echo "🚀 Executando testes..."
echo ""

node tests/validation.test.js

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Todos os testes passaram!"
else
    echo "❌ Alguns testes falharam."
fi

exit $EXIT_CODE
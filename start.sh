#!/bin/bash
set -e
export PATH="/opt/homebrew/bin:$PATH"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║         TinerPay — Arranque          ║"
echo "╚══════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

# Verificar dependencias
if ! command -v cockroach &>/dev/null; then
    echo "ERROR: cockroach no está instalado."
    echo ""
    echo "Instalar con:"
    echo "  brew install cockroachdb/tap/cockroach"
    exit 1
fi

if ! command -v node &>/dev/null; then
    echo "ERROR: Node.js no está instalado."
    echo ""
    echo "Instalar con:"
    echo "  brew install node"
    exit 1
fi

echo "✓ CockroachDB: $(cockroach version --build-tag 2>/dev/null || echo 'instalado')"
echo "✓ Node.js: $(node --version)"
echo ""

# Instalar dependencias npm si hace falta
cd server
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias Node.js..."
    npm install --silent
    echo "✓ Dependencias instaladas"
    echo ""
fi

# Arrancar el servidor (que a su vez arranca CockroachDB y el schema)
echo "Iniciando cluster y servidor..."
node index.js

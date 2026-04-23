#!/bin/bash
export PATH="/opt/homebrew/bin:$PATH"

echo "Deteniendo TinerPay..."

# Parar nodos CockroachDB gracefully
for port in 26257 26258 26259; do
    cockroach quit --insecure --host=localhost:$port 2>/dev/null && \
        echo "  ✓ Nodo :$port detenido" || \
        echo "  - Nodo :$port ya estaba parado"
done

# Matar proceso node si sigue corriendo
pkill -f "node index.js" 2>/dev/null && echo "  ✓ Servidor Node detenido" || true

echo "TinerPay detenido."

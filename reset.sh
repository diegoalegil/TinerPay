#!/bin/bash
export PATH="/opt/homebrew/bin:$PATH"

echo "Limpiando base de datos TinerPay..."

cockroach sql --insecure --host=localhost:26257 <<'SQL'
USE tinerpay;
DELETE FROM transactions WHERE true;
DELETE FROM wallets WHERE true;
DELETE FROM users WHERE true;
SELECT 'BD limpia — ' || count(*)::string || ' usuarios' FROM users;
SQL

echo "Listo. La demo puede empezar desde cero."

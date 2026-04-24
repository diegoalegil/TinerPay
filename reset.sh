#!/bin/bash
export PATH="/opt/homebrew/bin:$PATH"

echo "Limpiando base de datos TinerPay..."

cockroach sql --insecure --host=localhost:26257 <<'SQL'
USE tinerpay;
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE wallets CASCADE;
TRUNCATE TABLE users CASCADE;
SELECT 'BD limpia — ' || count(*)::string || ' usuarios' FROM users;
SQL

echo "Listo. La demo puede empezar desde cero."

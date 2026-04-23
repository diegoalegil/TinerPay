const db = require('./db');

const TABLES = [
    `CREATE TABLE IF NOT EXISTS currencies (
        code   VARCHAR(3)  PRIMARY KEY,
        name   VARCHAR(100) NOT NULL,
        symbol VARCHAR(5)  NOT NULL
    )`,
    `INSERT INTO currencies (code, name, symbol) VALUES
        ('EUR', 'Euro', '€'),
        ('USD', 'US Dollar', '$')
    ON CONFLICT DO NOTHING`,
    `CREATE TABLE IF NOT EXISTS users (
        id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
        name       VARCHAR(255) NOT NULL,
        email      VARCHAR(255) UNIQUE NOT NULL,
        deleted_at TIMESTAMP   NULL DEFAULT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS wallets (
        id            UUID           DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id       UUID           REFERENCES users(id),
        currency_code VARCHAR(3)     REFERENCES currencies(code),
        balance       DECIMAL(18,2)  DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS transactions (
        id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
        from_wallet UUID          REFERENCES wallets(id),
        to_wallet   UUID          REFERENCES wallets(id),
        amount      DECIMAL(18,2) NOT NULL,
        created_at  TIMESTAMP     DEFAULT now()
    )`
];

async function initDB() {
    console.log('[db] Creando base de datos y schema...');

    // Crear la base de datos (conectar a defaultdb primero)
    await db.query('CREATE DATABASE IF NOT EXISTS tinerpay', [], 'defaultdb');

    // Crear tablas e insertar datos semilla
    for (const stmt of TABLES) {
        await db.query(stmt);
    }

    console.log('[db] Schema listo — tinerpay con 4 tablas');
}

module.exports = { initDB };

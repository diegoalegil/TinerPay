const express = require('express');
const cors    = require('cors');
const path    = require('path');
const db      = require('./db');
const cluster = require('./cluster');
const { initDB } = require('./init');

const app = express();
app.use(cors());
app.use(express.json());

// Servir el frontend estático desde la raíz del proyecto
app.use(express.static(path.join(__dirname, '..')));

/* ═══════════════════════════════════════════
   USUARIOS
═══════════════════════════════════════════ */

// POST /api/users  — crear usuario + wallet EUR
app.post('/api/users', async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'name y email son obligatorios' });

    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        const userRes = await client.query(
            'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id',
            [name, email]
        );
        const user_id = userRes.rows[0].id;

        const walletRes = await client.query(
            'INSERT INTO wallets (user_id, currency_code, balance) VALUES ($1, $2, 0) RETURNING id',
            [user_id, 'EUR']
        );
        const wallet_id = walletRes.rows[0].id;

        await client.query('COMMIT');
        res.json({ user_id, wallet_id, name, email, balance: '0.00' });
    } catch (e) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: e.message });
    } finally {
        await client.end();
    }
});

// GET /api/users  — listar usuarios con saldo
app.get('/api/users', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT u.id AS user_id, u.name, u.email,
                   w.id AS wallet_id, w.balance, w.currency_code
            FROM   users   u
            JOIN   wallets w ON w.user_id = u.id
            WHERE  u.deleted_at IS NULL
            ORDER  BY u.name
        `);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// DELETE /api/users/:id  — borrado lógico
app.delete('/api/users/:id', async (req, res) => {
    try {
        await db.query(
            'UPDATE users SET deleted_at = now() WHERE id = $1',
            [req.params.id]
        );
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/* ═══════════════════════════════════════════
   WALLETS
═══════════════════════════════════════════ */

// POST /api/wallets/deposit  — añadir saldo
app.post('/api/wallets/deposit', async (req, res) => {
    const { wallet_id, amount } = req.body;
    if (!wallet_id || !amount) return res.status(400).json({ error: 'wallet_id y amount son obligatorios' });

    try {
        const result = await db.query(
            'UPDATE wallets SET balance = balance + $1 WHERE id = $2 RETURNING balance AS new_balance',
            [amount, wallet_id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Wallet no encontrado' });
        res.json({ wallet_id, new_balance: result.rows[0].new_balance });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/* ═══════════════════════════════════════════
   TRANSACCIONES
═══════════════════════════════════════════ */

// POST /api/transactions  — transferencia entre wallets
app.post('/api/transactions', async (req, res) => {
    const { from_wallet_id, to_wallet_id, amount } = req.body;
    if (!from_wallet_id || !to_wallet_id || !amount)
        return res.status(400).json({ error: 'from_wallet_id, to_wallet_id y amount son obligatorios' });

    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        // Verificar saldo origen
        const balRes = await client.query(
            'SELECT balance FROM wallets WHERE id = $1',
            [from_wallet_id]
        );
        if (!balRes.rows.length) throw new Error('Wallet origen no encontrado');
        if (parseFloat(balRes.rows[0].balance) < amount)
            throw new Error('Saldo insuficiente');

        // Débito
        const debit = await client.query(
            'UPDATE wallets SET balance = balance - $1 WHERE id = $2 RETURNING balance',
            [amount, from_wallet_id]
        );

        // Crédito
        const credit = await client.query(
            'UPDATE wallets SET balance = balance + $1 WHERE id = $2 RETURNING balance',
            [amount, to_wallet_id]
        );

        // Registrar transacción
        const tx = await client.query(
            'INSERT INTO transactions (from_wallet, to_wallet, amount) VALUES ($1, $2, $3) RETURNING id',
            [from_wallet_id, to_wallet_id, amount]
        );

        await client.query('COMMIT');

        res.json({
            transaction_id: tx.rows[0].id,
            from_balance:   debit.rows[0].balance,
            to_balance:     credit.rows[0].balance
        });
    } catch (e) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: e.message });
    } finally {
        await client.end();
    }
});

// GET /api/transactions  — historial de transacciones
app.get('/api/transactions', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT t.id, t.amount, t.created_at,
                   uo.name AS from_user,
                   ud.name AS to_user
            FROM   transactions t
            JOIN   wallets wo ON wo.id = t.from_wallet
            JOIN   wallets wd ON wd.id = t.to_wallet
            JOIN   users   uo ON uo.id = wo.user_id
            JOIN   users   ud ON ud.id = wd.user_id
            ORDER  BY t.created_at DESC
            LIMIT  50
        `);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/* ═══════════════════════════════════════════
   CLUSTER
═══════════════════════════════════════════ */

// GET /api/cluster/status
app.get('/api/cluster/status', async (req, res) => {
    try {
        const nodes = await cluster.getStatus();
        res.json({ nodes });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/cluster/node/:id/kill
app.post('/api/cluster/node/:id/kill', (req, res) => {
    try {
        cluster.killNode(parseInt(req.params.id));
        res.json({ success: true, message: `Nodo ${req.params.id} eliminado` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/cluster/node/:id/restart
app.post('/api/cluster/node/:id/restart', (req, res) => {
    try {
        cluster.restartNode(parseInt(req.params.id));
        res.json({ success: true, message: `Nodo ${req.params.id} reiniciando...` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/* ═══════════════════════════════════════════
   ARRANQUE
═══════════════════════════════════════════ */

async function main() {
    try {
        await cluster.startCluster();
        await initDB();

        app.listen(3000, () => {
            console.log('');
            console.log('╔══════════════════════════════════════╗');
            console.log('║  TinerPay corriendo en :3000         ║');
            console.log('║  CockroachDB UI → http://localhost:8080 ║');
            console.log('╚══════════════════════════════════════╝');
            console.log('');
        });
    } catch (e) {
        console.error('Error al arrancar:', e.message);
        process.exit(1);
    }
}

main();

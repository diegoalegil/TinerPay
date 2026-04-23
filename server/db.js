const { Client } = require('pg');

const NODE_PORTS = [26257, 26258, 26259];

async function getClient(database = 'tinerpay') {
    for (const port of NODE_PORTS) {
        try {
            const client = new Client({
                host: 'localhost',
                port,
                database,
                user: 'root',
                ssl: false,
                connectionTimeoutMillis: 2000
            });
            await client.connect();
            return client;
        } catch (_) {
            // nodo caído, intentar el siguiente
        }
    }
    throw new Error('Ningún nodo de CockroachDB disponible');
}

async function query(sql, params = [], database = 'tinerpay') {
    const client = await getClient(database);
    try {
        return await client.query(sql, params);
    } finally {
        await client.end();
    }
}

module.exports = { query, getClient };

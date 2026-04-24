const { spawn, execSync } = require('child_process');
process.env.PATH = `/opt/homebrew/bin:${process.env.PATH}`;
const path = require('path');
const net = require('net');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'cockroach-data');
const JOIN = 'localhost:26257,localhost:26258,localhost:26259';

const NODES = [
    { id: 1, port: 26257, httpPort: 8080, dir: path.join(DATA_DIR, 'node1'), proc: null },
    { id: 2, port: 26258, httpPort: 8081, dir: path.join(DATA_DIR, 'node2'), proc: null },
    { id: 3, port: 26259, httpPort: 8082, dir: path.join(DATA_DIR, 'node3'), proc: null }
];

function checkPort(port) {
    return new Promise((resolve) => {
        const s = net.createConnection({ host: 'localhost', port });
        s.setTimeout(500);
        s.on('connect', () => { s.destroy(); resolve(true); });
        s.on('error', () => resolve(false));
        s.on('timeout', () => { s.destroy(); resolve(false); });
    });
}

function waitForPort(port, maxMs = 20000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const tick = async () => {
            if (await checkPort(port)) return resolve();
            if (Date.now() - start > maxMs) return reject(new Error(`Puerto ${port} no disponible tras ${maxMs}ms`));
            setTimeout(tick, 400);
        };
        tick();
    });
}

function spawnNode(node) {
    if (!fs.existsSync(node.dir)) fs.mkdirSync(node.dir, { recursive: true });

    const logDir = path.join(node.dir, 'logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

    const args = [
        'start',
        '--insecure',
        `--store=${node.dir}`,
        `--listen-addr=localhost:${node.port}`,
        `--http-addr=localhost:${node.httpPort}`,
        `--join=${JOIN}`,
        `--log-dir=${logDir}`
    ];

    const proc = spawn('cockroach', args, { stdio: 'ignore', detached: false });
    node.proc = proc;

    proc.on('exit', (code) => {
        console.log(`[cluster] Nodo ${node.id} terminó (código ${code})`);
        node.proc = null;
    });

    return proc;
}

async function startCluster() {
    console.log('[cluster] Iniciando CockroachDB (3 nodos)...');

    // Matar cualquier proceso CockroachDB huérfano de sesiones anteriores
    try {
        execSync('pkill -9 -f "cockroach start"', { stdio: 'pipe' });
        await new Promise(r => setTimeout(r, 1000));
    } catch (_) {}

    // Arrancar los 3 nodos siempre desde cero
    for (const node of NODES) {
        console.log(`[cluster] Arrancando nodo ${node.id} en :${node.port}`);
        spawnNode(node);
    }

    console.log('[cluster] Esperando que los 3 nodos respondan...');
    await Promise.all(NODES.map(n => waitForPort(n.port, 20000)));
    console.log('[cluster] Los 3 nodos están activos');

    // Inicializar el cluster (solo necesario la primera vez)
    try {
        execSync('cockroach init --insecure --host=localhost:26257', { stdio: 'pipe' });
        console.log('[cluster] Cluster inicializado');
        await new Promise(r => setTimeout(r, 3000)); // esperar estabilización
    } catch (e) {
        const msg = e.stderr ? e.stderr.toString() : '';
        if (msg.includes('already been initialized') || msg.includes('already initialized')) {
            console.log('[cluster] Cluster ya inicializado, continuando...');
        } else {
            console.log('[cluster] Init:', msg.trim() || 'posiblemente ya inicializado');
        }
    }
}

function killNode(id) {
    const node = NODES.find(n => n.id === id);
    if (!node) throw new Error(`Nodo ${id} no encontrado`);

    // 1. Matar el proceso rastreado si existe
    if (node.proc) {
        try { node.proc.kill('SIGKILL'); } catch (_) {}
        node.proc = null;
    }

    // 2. Fallback: solo el proceso que escucha en el puerto SQL (no clientes)
    try {
        const pid = execSync(
            `lsof -ti tcp:${node.port} -s TCP:LISTEN`,
            { stdio: 'pipe' }
        ).toString().trim();
        if (pid) execSync(`kill -9 ${pid}`, { stdio: 'pipe' });
    } catch (_) {}

    // 3. Fallback: solo el proceso que escucha en el puerto HTTP
    try {
        const pid = execSync(
            `lsof -ti tcp:${node.httpPort} -s TCP:LISTEN`,
            { stdio: 'pipe' }
        ).toString().trim();
        if (pid) execSync(`kill -9 ${pid}`, { stdio: 'pipe' });
    } catch (_) {}

    console.log(`[cluster] Nodo ${id} eliminado (SQL :${node.port} HTTP :${node.httpPort})`);
}

function restartNode(id) {
    const node = NODES.find(n => n.id === id);
    if (!node) throw new Error(`Nodo ${id} no encontrado`);

    if (node.proc) {
        node.proc.kill('SIGTERM');
        node.proc = null;
    }

    setTimeout(() => {
        console.log(`[cluster] Reiniciando nodo ${id}...`);
        spawnNode(node);
    }, 500);
}

async function getStatus() {
    return Promise.all(
        NODES.map(async (n) => ({
            id: n.id,
            port: n.port,
            httpPort: n.httpPort,
            alive: await checkPort(n.port)
        }))
    );
}

module.exports = { startCluster, killNode, restartNode, getStatus };

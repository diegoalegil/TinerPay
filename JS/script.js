/* ===== TINERPAY - demo JS (corregido y mejorado) ===== */

/* Datos base */
const usuariosBase = [
    { nombre: "Diego", email: "diegodam@gmail.com", saldo: 0 },
    { nombre: "Jorge", email: "jorgedam@gmail.com", saldo: 0 },
    { nombre: "Grecia", email: "greciadam@gmail.com", saldo: 0 },
    { nombre: "Jaime", email: "jaimedam@gmail.com", saldo: 0 },
    { nombre: "Atteneri", email: "atteneridam@gmail.com", saldo: 0 }
];

let usuarios = [];

/* ===== Util: typing effect ===== */
function escribir(texto, elemento) {

    if (!elemento) return;

    let i = 0;
    elemento.textContent = "";

    const contenedor = elemento.parentElement; // la terminal

    const intervalo = setInterval(() => {

        elemento.textContent += texto[i] ?? "";
        i++;

        contenedor.scrollTo({
            top: contenedor.scrollHeight,
            behavior: "smooth"
        });

        if (i >= texto.length) {
            clearInterval(intervalo);
        }

    }, 60);

}


const regiones = {
    node1: { nombre: "Europa", latencia: 600 },
    node2: { nombre: "USA", latencia: 1200 },
    node3: { nombre: "Latioamérica", latencia: 1800 }
}

/* ===== Replicación visual y estado del cluster ===== */

/**
 * replicarDatos(range)
 * - range (opcional): número de range (1..3). Si no se pasa, se elige aleatorio.
 * Simula: leader escribe log -> paquetes visuales a followers -> followers aplican -> consenso.
 */
function replicarDatos(rangeParam = null) {
    const range = rangeParam ?? obtenerRangeAleatorio();
    const leader = obtenerLeader("r" + range) || "node1"; // fallback seguro

    // Construir datos mostrados
    let datos = [];
    if (usuarios.length === 0) {
        datos = [
            "id:1 → Diego : 0€",
            "id:2 → Jorge : 0€",
            "id:3 → Grecia : 0€",
            "id:4 → Jaime : 0€",
            "id:5 → Atteneri : 0€"
        ];
    } else {
        usuarios.forEach((u, i) => {
            datos.push(`id:${i + 1} → ${u.nombre} : ${u.saldo}€`);
        });
    }

    // Map de elementos KV (nodos donde se aplica el estado)
    const nodosKV = {
        node1: document.getElementById("kv1"),
        node2: document.getElementById("kv2"),
        node3: document.getElementById("kv3")
    };

    // Limpiar pantallas KV
    Object.values(nodosKV).forEach(n => {
        if (n) n.innerText = "";
    });

    logRaft(`Cluster inicia replicación del Range ${range} mediante Raft`);

    // leader escribe primero (simulamos latencia)
    setTimeout(() => {

        nodosKV[leader].innerText = datos.join("\n")

        const leaderNode = document.getElementById(leader)

        leaderNode.classList.add("node-commit")

        setTimeout(() => {
            leaderNode.classList.remove("node-commit")
        }, 700)

        logRaft(`Leader (${leader}) escribe log entry`, "log-raft")

    }, 400)

    // followers reciben paquetes (animación) y aplican el log
    setTimeout(() => {
        const nodos = ["node1", "node2", "node3"];
        nodos.forEach(n => {
            if (n !== leader) {
                logRaft(
                    `Enviando datos ${regiones[leader].nombre} → ${regiones[n].nombre}
(latencia ${regiones[n].latencia} ms)`,
                    "log-raft"
                )
                animarReplicacion(leader, n);
                // Aplicar datos al nodo follower (con pequeña latencia para que la animación tenga sentido)
                setTimeout(() => {
                    if (nodosKV[n]) nodosKV[n].innerText = datos.join("\n");
                    logRaft(`${n} confirma replicación`, "log-raft")
                }, 350);
            }
        });
    }, 900);

    // consenso final
    setTimeout(() => {
        logRaft("Consenso alcanzado — estado consistente", "log-consensus")
    }, 1700);

    // glow en el nodo leader para feedback visual
    const leaderNode = document.getElementById(leader);
    if (leaderNode) {
        leaderNode.style.boxShadow = "0 0 25px #00ff88";
        setTimeout(() => {
            leaderNode.style.boxShadow = "";
        }, 900);
    }
}

function logRaft(texto, clase = "") {

    const log = document.getElementById("raft-log-content");

    const line = document.createElement("div");
    line.textContent = texto;

    if (clase) line.classList.add(clase);

    log.appendChild(line);

    // scroll automático al final
    log.scrollTop = log.scrollHeight;
}

/* ===== Simular fallo de nodo (visual + election) — EPIC VERSION ===== */
function fallarNodo() {
    const nodo1 = document.getElementById("node1");
    if (!nodo1) return;

    // Bloquear botón durante toda la secuencia
    const nuclearBtn = document.getElementById("nuclear-button");
    if (nuclearBtn) nuclearBtn.disabled = true;

    // ── FASE 1: parpadeo "se va la luz" (3 segundos) ──
    nodo1.classList.add("node-flickering");
    logRaft("⚠ Anomalía detectada en Nodo 1...", "log-fail");
    setTimeout(() => logType("Señal inestable — posible fallo de hardware"), 900);
    setTimeout(() => logType("⚡ Perdiendo conexión con Nodo 1..."), 1900);
    setTimeout(() => logType("CONEXIÓN PERDIDA ⚠"), 2650);

    // ── FASE 2: explosión épica tras 3 s ──
    setTimeout(() => {
        nodo1.classList.remove("node-flickering");

        // ── SCREEN SHAKE ÉPICO ──
        document.body.classList.add("screen-shake-epic");
        setTimeout(() => document.body.classList.remove("screen-shake-epic"), 700);

        // ── FLASH ROJO ──
        const flash = document.createElement("div");
        flash.className = "screen-flash";
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 650);

        // ── VIGNETTE ROJA ──
        const vignette = document.createElement("div");
        vignette.className = "red-alert";
        document.body.appendChild(vignette);
        setTimeout(() => vignette.remove(), 2000);

        // ── TEXTO DRAMÁTICO ──
        const critText = document.createElement("div");
        critText.className = "critical-text";
        critText.textContent = "⚠  NODE FAILURE  ⚠";
        document.body.appendChild(critText);
        setTimeout(() => critText.remove(), 2400);

        // ── LOG ALERT ──
        const alerta = document.createElement("div");
        alerta.textContent = "⚠ NODE FAILURE DETECTED";
        alerta.classList.add("log-alert");
        const logDiv = document.getElementById("raft-log-content");
        logDiv.appendChild(alerta);
        logDiv.scrollTop = logDiv.scrollHeight;
        setTimeout(() => alerta.classList.remove("log-alert"), 1000);

        // ── EXPLOSIÓN ÉPICA (200 partículas) ──
        nodo1.classList.add("node-explode");
        crearExplosionEpica(nodo1);

        // ── DEBRIS (fragmentos grandes girando) ──
        crearDebris(nodo1);

        // ── 3 ONDAS DE CHOQUE rojas escalonadas ──
        [0, 280, 560].forEach(delay => {
            setTimeout(() => {
                const wave = document.createElement("div");
                wave.className = "shockwave";
                nodo1.appendChild(wave);
                setTimeout(() => wave.remove(), 950);
            }, delay);
        });

        // ── EMP PULSE cian ──
        setTimeout(() => {
            const emp = document.createElement("div");
            emp.className = "shockwave-cyan";
            nodo1.appendChild(emp);
            setTimeout(() => emp.remove(), 1000);
        }, 180);

        // ── SECUENCIA RAFT ──
        setTimeout(() => {
            logRaft("⚡ NODO 1 HA FALLADO — CONEXIÓN PERDIDA", "log-fail");
            nodo1.classList.add("node-dead", "node-burning", "node-meltdown");
            electricidadNodo(nodo1);
            fuegoContinuo(nodo1);
        }, 1200);

        setTimeout(() => logType("Range 3 pierde su líder"), 2400);

        setTimeout(() => {
            logRaft("Range 3 inicia elección Raft", "log-election");
            const r3 = document.querySelectorAll(".r3");
            if (r3[1]) r3[1].classList.add("election");
        }, 3600);

        setTimeout(() => logType("Nodo 2 solicita votos para Range 3"), 4800);

        setTimeout(() => logType("Nodo 3 vota por Nodo 2"), 6000);

        setTimeout(() => {
            logRaft("Nodo 2 se convierte en líder del Range 3", "log-election");
            const ranges = document.querySelectorAll(".r3");
            ranges.forEach(r => r.classList.remove("leader"));
            if (ranges[1]) { ranges[1].classList.add("leader"); ranges[1].innerText = "Range 3 • Leader"; }
            if (ranges[2]) { ranges[2].innerText = "Range 3 • Follower"; }
        }, 7200);

    }, 3000);
}

/* ===== Reiniciar cluster (UI) ===== */
function reiniciarCluster() {
    document.querySelectorAll(".node-dead").forEach(n => n.classList.remove("node-dead"));
    document.querySelectorAll(".range").forEach(r => r.classList.remove("election"));
    logRaft("Cluster recuperado — todos los nodos activos");
}

/* ===== CRUD + Demo (simulación local) ===== */

function crearUsuario() {
    if (usuarios.length >= usuariosBase.length) {
        document.getElementById("resultado").textContent = "Todos los usuarios ya fueron creados.";
        return;
    }

    const u = usuariosBase[usuarios.length];
    usuarios.push({ ...u });

    // Query más coherente con esquema (user + wallet)
    const query =
        `WITH new_user AS (
INSERT INTO users (name,email)
VALUES ('${u.nombre}','${u.email}')
RETURNING id
)

INSERT INTO wallets (user_id,currency_code,balance)
SELECT id,'EUR',0 FROM new_user;`;

    escribir(query, document.getElementById("query"));

    setTimeout(() => {
        document.getElementById("resultado").textContent = `Usuario creado:\n${u.nombre} — ${u.email}`;
        replicarOperacion(1); // ahora replicarOperacion llamará a replicarDatos(range)
    }, 900);
}

function screenShake() {

    document.body.classList.add("screen-shake")

    setTimeout(() => {
        document.body.classList.remove("screen-shake")
    }, 500)

}

function agregarDinero() {

    if (usuarios.length === 0) {
        document.getElementById("resultado").textContent = "No hay usuarios creados.";
        return;
    }

    let salida = "";
    let query = "";

    usuarios.forEach(u => {

        const cantidad = Math.floor(Math.random() * 81) + 20;

        u.saldo += cantidad;

        query += `UPDATE wallets
SET balance = balance + ${cantidad}
WHERE user_id = (
SELECT id FROM users WHERE email='${u.email}'
);\n`;

        salida += `${u.nombre} recibe +${cantidad}€\n`;

    });

    escribir(query, document.getElementById("query"));

    setTimeout(() => {

        document.getElementById("resultado").textContent = salida;

        replicarOperacion(2);
        replicarDatos();

    }, 900);
}

function transferir() {

    logTransaccion("BEGIN TRANSACTION");

    if (usuarios.length < 2) {
        document.getElementById("resultado").textContent = "Se necesitan al menos 2 usuarios.";
        return;
    }

    let origen = usuarios[Math.floor(Math.random() * usuarios.length)];
    let destino = usuarios[Math.floor(Math.random() * usuarios.length)];

    while (destino === origen) {
        destino = usuarios[Math.floor(Math.random() * usuarios.length)];
    }

    let cantidad = Math.floor(Math.random() * 40) + 10;

    if (origen.saldo < cantidad) {
        document.getElementById("resultado").textContent =
            `${origen.nombre} no tiene saldo suficiente.`;
        return;
    }

    // estado local (simulación)
    origen.saldo -= cantidad;
    destino.saldo += cantidad;

    const query = `BEGIN;

UPDATE wallets
SET balance = balance - ${cantidad}
WHERE user_id = (
SELECT id FROM users WHERE email='${origen.email}'
);

UPDATE wallets
SET balance = balance + ${cantidad}
WHERE user_id = (
SELECT id FROM users WHERE email='${destino.email}'
);

INSERT INTO transactions (from_wallet,to_wallet,amount)
VALUES (
(SELECT id FROM wallets WHERE user_id =
    (SELECT id FROM users WHERE email='${origen.email}')
),
(SELECT id FROM wallets WHERE user_id =
    (SELECT id FROM users WHERE email='${destino.email}')
),
${cantidad}
);

COMMIT;`;

    escribir(query, document.getElementById("query"));

    setTimeout(() => {

        document.getElementById("resultado").textContent =
            `${origen.nombre} → ${destino.nombre} : ${cantidad}€`;

        replicarOperacion(3);
        replicarDatos();

        logTransaccion("COMMIT — transacción confirmada por mayoría");

    }, 900);
}

function verBalances() {
    if (usuarios.length === 0) {
        document.getElementById("resultado").textContent = "No hay usuarios.";
        return;
    }

    let salida = "";
    usuarios.forEach(u => salida += `${u.nombre} → ${u.saldo}€\n`);

    const query = `SELECT users.name, wallets.balance
FROM wallets
JOIN users ON wallets.user_id = users.id;`;
    escribir(query, document.getElementById("query"));

    setTimeout(() => {
        document.getElementById("resultado").textContent = salida;
    }, 900);
}

/* ===== Helpers de ranges / replicación ===== */

function obtenerRangeAleatorio() {
    return Math.floor(Math.random() * 3) + 1; // 1..3
}

/**
 * replicarOperacion:
 * deja el log de la operación y llama a replicarDatos(range)
 */
function replicarOperacion(range = null) {

    if (!range) {
        range = obtenerRangeAleatorio();
    }

    logTransaccion(`Range ${range} recibe la transacción`);

    setTimeout(() => {
        logTransaccion(`Leader del Range ${range} inicia replicación`);
    }, 400);

    setTimeout(() => {
        logTransaccion(`Followers confirman la escritura`);
    }, 800);

    setTimeout(() => {
        logTransaccion(`Consenso alcanzado → COMMIT aplicado`);
    }, 1200);

    setTimeout(() => {
        replicarDatos(range);
    }, 500);
}

/* ===== Logs de transacciones (UI) ===== */
function logTransaccion(texto) {
    const log = document.getElementById("tx-log");
    if (!log) return;
    log.innerHTML += texto + "<br>";
    log.scrollTop = log.scrollHeight;
}

/* ===== Heartbeat y efectos ===== */
function iniciarHeartbeat() {
    const leaders = document.querySelectorAll(".leader");
    leaders.forEach(lider => lider.classList.add("leader-heartbeat"));
}

function mostrarRegiones() {

    Object.keys(regiones).forEach(nodeId => {

        const region = document.getElementById("region-" + nodeId)
        const latency = document.getElementById("latency-" + nodeId)

        if (region) {
            region.textContent = "🌍 " + regiones[nodeId].nombre
        }

        if (latency) {
            latency.textContent = "latencia base: " + regiones[nodeId].latencia + " ms"
        }

    })

}

/* ===== Visual: explosión épica (200 partículas multicapa) ===== */
function crearExplosionEpica(nodo) {
    const gradients = [
        "radial-gradient(circle,#fff 0%,#ffee00 30%,#ff6600 70%)",
        "radial-gradient(circle,#ffae00,#ff3b3b,#cc0000)",
        "radial-gradient(circle,#ffcc00,#ff4400,#880000)",
        "radial-gradient(circle,#ffffff,#ffbb00,#ff5500)",
    ];

    for (let i = 0; i < 200; i++) {
        const p = document.createElement("div");
        p.className = "explosion";
        const angle = Math.random() * Math.PI * 2;
        const dist  = 120 + Math.random() * 380;
        p.style.setProperty("--x", (Math.cos(angle) * dist) + "px");
        p.style.setProperty("--y", (Math.sin(angle) * dist) + "px");
        const size = (5 + Math.random() * 18) + "px";
        p.style.width  = size;
        p.style.height = size;
        p.style.background = gradients[Math.floor(Math.random() * gradients.length)];
        p.style.animationDelay    = (Math.random() * 0.25) + "s";
        p.style.animationDuration = (0.7 + Math.random() * 0.7) + "s";
        nodo.appendChild(p);
        setTimeout(() => p.remove(), 1600);
    }
}

/* ===== Visual: debris — fragmentos grandes que salen girando ===== */
function crearDebris(nodo) {
    for (let i = 0; i < 24; i++) {
        const d = document.createElement("div");
        d.className = "debris";
        const angle = Math.random() * Math.PI * 2;
        const dist  = 150 + Math.random() * 280;
        d.style.setProperty("--x", (Math.cos(angle) * dist) + "px");
        d.style.setProperty("--y", (Math.sin(angle) * dist) + "px");
        d.style.setProperty("--size", (10 + Math.random() * 20) + "px");
        d.style.setProperty("--rot",  (Math.random() * 360) + "deg");
        d.style.setProperty("--delay", (Math.random() * 0.15) + "s");
        nodo.appendChild(d);
        setTimeout(() => d.remove(), 2200);
    }
}

/* ===== Función legacy (por si algo la llama) ===== */
function crearExplosion(nodo) { crearExplosionEpica(nodo); }

/* ===== Helpers de log visual simple ===== */
function log(msg, clase = "") {
    const log = document.getElementById("raft-log-content");
    if (!log) return;
    const line = document.createElement("div");
    line.textContent = msg;
    if (clase) line.classList.add(clase);
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
}

function logType(texto) {
    const log = document.getElementById("raft-log-content");
    if (!log) return;
    const line = document.createElement("div");
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
    escribir(texto, line);
}

/* ===== Reveal observer — Apple-style smooth ===== */
const revealElements = document.querySelectorAll(".reveal");

revealElements.forEach(el => {
    // Stagger: si hay hermanos .reveal en el mismo padre, retrasamos cada uno
    const siblings = Array.from(el.parentElement.children)
        .filter(c => c.classList.contains("reveal"));
    const i = siblings.indexOf(el);
    if (i > 0) el.style.transitionDelay = `${i * 0.08}s`;
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target); // solo una vez
        }
    });
}, {
    threshold: 0.08,
    rootMargin: "0px 0px -40px 0px"
});

revealElements.forEach(el => revealObserver.observe(el));

/* ===== Instalación: efecto terminal seguro ===== */
const installLines = [
    "$ docker compose up -d",
    "$ docker exec -it cockroach1 cockroach init --insecure",
    "$ docker exec -it cockroach1 cockroach sql --insecure",
    "",
    "initializing cluster...",
    "",
    "Cluster successfully initialized!",
    "node1:26257",
    "node2:26258",
    "node3:26259"
];

let terminal;
window.addEventListener("DOMContentLoaded", () => {

    terminal = document.getElementById("install-typing");

    iniciarHeartbeat();
    mostrarRegiones();

    // Placeholder inicial del terminal demo
    const queryEl = document.getElementById("query");
    const resultEl = document.getElementById("resultado");
    if (queryEl && !queryEl.textContent.trim())
        queryEl.textContent = "// Pulsa un botón para ejecutar una operación...";
    if (resultEl && !resultEl.textContent.trim())
        resultEl.textContent = "// El resultado aparecerá aquí";

    document.querySelectorAll(".leader").forEach(n => {
        n.style.boxShadow = "0 0 25px #00f7ff";
        setTimeout(() => n.style.boxShadow = "", 700);
    });

    /* ===== Mostrar shards ===== */

    document.querySelectorAll(".r1").forEach(r => {
        r.innerText = "Range 1 • Users"
    })

    document.querySelectorAll(".r2").forEach(r => {
        r.innerText = "Range 2 • Wallets"
    })

    document.querySelectorAll(".r3").forEach(r => {
        r.innerText = "Range 3 • Transactions"
    })

});

let lineIndex = 0;
let charIndex = 0;
function typeInstall() {
    if (!terminal) return;
    let currentLine = installLines[lineIndex];
    if (charIndex < currentLine.length) {
        terminal.textContent += currentLine.charAt(charIndex);
        charIndex++;
        setTimeout(typeInstall, 40);
    } else {
        terminal.textContent += "\n";
        lineIndex++;
        charIndex = 0;
        if (lineIndex < installLines.length) setTimeout(typeInstall, 350);
    }
}
const installSection = document.querySelector("#instalacion");
const installObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            typeInstall();
            installObserver.disconnect();
        }
    });
}, { threshold: 0.5 });
if (installSection) installObserver.observe(installSection);

/* ===== Animación: paquete de datos viajando entre nodos ===== */
function animarReplicacion(origen, destino) {

    const nodoOrigen = document.getElementById(origen);
    const nodoDestino = document.getElementById(destino);

    if (!nodoOrigen || !nodoDestino) return;

    const packet = document.createElement("div");
    packet.className = "data-packet";

    document.body.appendChild(packet);

    const rect1 = nodoOrigen.getBoundingClientRect();
    const rect2 = nodoDestino.getBoundingClientRect();

    packet.style.left = rect1.left + rect1.width / 2 + "px";
    packet.style.top = rect1.top + rect1.height / 2 + "px";

    // 🔬 latencia entre regiones
    const latencia = regiones[destino]?.latencia || 60;

    packet.style.transition = `transform ${latencia / 1000}s linear`;

    setTimeout(() => {

        packet.style.transform =
            `translate(${rect2.left - rect1.left}px, ${rect2.top - rect1.top}px)`;

    }, 50);

    setTimeout(() => packet.remove(), latencia + 200);
}

/* ===== Obtener leader del range (consulta DOM) ===== */
function obtenerLeader(rangeClase) {
    const ranges = document.querySelectorAll("." + rangeClase);
    for (let i = 0; i < ranges.length; i++) {
        if (ranges[i].classList.contains("leader")) {
            const nodo = ranges[i].closest(".cluster-node");
            if (nodo) return nodo.id;
        }
    }
    return null; // sin leader encontrado
}
function moverRange(rangeClase, nodoOrigenId, nodoDestinoId) {

    const origen = document.getElementById(nodoOrigenId)
    const destino = document.getElementById(nodoDestinoId)

    if (!origen || !destino) return

    // SOLO el range dentro de ese nodo
    const rangeMover = origen.querySelector(`:scope .${rangeClase}`)

    if (!rangeMover) return

    rangeMover.style.transition = "all .6s ease"

    destino.appendChild(rangeMover)

}
const logContainer = document.getElementById("raft-log-content");
const logPanel = document.querySelector(".raft-log");

function escribirLog(texto, clase = "") {

    const linea = document.createElement("div");
    linea.textContent = texto;

    if (clase) linea.classList.add(clase);

    logContainer.appendChild(linea);

    // auto scroll
    logPanel.scrollTop = logPanel.scrollHeight;
}

function logSecuencial(lineas, delay = 700) {

    lineas.forEach((linea, i) => {

        setTimeout(() => {
            escribirLog(linea.texto, linea.clase);
        }, i * delay);

    });

}

function abrirTapa() {

    const cover = document.getElementById("safety-cover")
    const button = document.getElementById("nuclear-button")

    cover.classList.add("open")

    button.disabled = false
    button.style.opacity = "1"
    button.style.pointerEvents = "auto"

}

function typeSQL(element, speed = 15) {

    const text = element.textContent
    element.innerHTML = ""

    let i = 0

    function write() {

        if (i < text.length) {

            element.textContent += text[i]

            i++

            element.scrollTop = element.scrollHeight

            setTimeout(write, speed)

        }

    }
    element.innerHTML += '<span class="sql-cursor"></span>'

    write()

}

const cards = document.querySelectorAll(".setup-card pre")

cards.forEach((card, index) => {

    setTimeout(() => {
        typeSQL(card, 15)
    }, index * 800)

})

function fuegoContinuo(nodo) {

    setInterval(() => {

        const p = document.createElement("div")
        p.className = "fire-particle"

        p.style.left = Math.random() * 100 + "%"
        p.style.bottom = "10px"

        nodo.appendChild(p)

        setTimeout(() => p.remove(), 1600)

    }, 80)

}

function electricidadNodo(nodo) {

    setInterval(() => {

        const rayo = document.createElement("div")
        rayo.className = "electric"

        rayo.style.left = Math.random() * 100 + "%"
        rayo.style.top = Math.random() * 80 + "%"

        nodo.appendChild(rayo)

        setTimeout(() => rayo.remove(), 300)

    }, 200)

}

document.querySelectorAll(".review-question").forEach(card => {

    card.addEventListener("click", () => {
        card.classList.toggle("flip");
    });

});

/* ===== Arquitectura: botón Transferir ===== */
(function () {

    const sendBtn      = document.getElementById("arch-send-btn");
    const balanceEl    = document.getElementById("bank-balance");
    const txList       = document.querySelector(".transactions");

    if (!sendBtn || !balanceEl || !txList) return;

    const destinatarios = ["Atteneri", "Grecia", "Jaime", "Sebastian", "Yasiel", "Iván"];

    let archClickCount = 0;

    sendBtn.addEventListener("click", () => {

        archClickCount++;
        const isFail = (archClickCount === 3);

        // Parsear saldo actual (formato español: "120,00")
        const balance = parseFloat(balanceEl.textContent.replace(",", "."));
        const balanceTextoOriginal = balanceEl.textContent; // guardamos antes de deducir

        const monto = Math.floor(Math.random() * 26) + 5; // 5 – 30 €

        if (balance < monto) {
            balanceEl.classList.add("balance-flash-red");
            setTimeout(() => balanceEl.classList.remove("balance-flash-red"), 800);
            archClickCount--; // no cuenta como transferencia válida
            return;
        }

        // Actualizar saldo
        const nuevo = (balance - monto).toFixed(2).replace(".", ",");
        balanceEl.textContent = nuevo;

        balanceEl.classList.add("balance-flash-red");
        setTimeout(() => balanceEl.classList.remove("balance-flash-red"), 800);

        // Hora actual
        const ahora  = new Date();
        const hhmm   = ahora.getHours().toString().padStart(2, "0") + ":" +
                       ahora.getMinutes().toString().padStart(2, "0");

        // Destinatario aleatorio
        const nombre = destinatarios[Math.floor(Math.random() * destinatarios.length)];

        // Crear fila de transacción
        const tx = document.createElement("div");
        tx.className = "tx tx-new";
        tx.innerHTML =
            `<div class="tx-left">` +
                `<div class="tx-title">Transferencia a ${nombre}</div>` +
                `<div class="tx-date">Hoy · ${hhmm}</div>` +
            `</div>` +
            `<div class="tx-amount tx-amount-val">-${monto}€</div>`;

        // Insertar al principio de la lista
        txList.insertBefore(tx, txList.firstChild);

        setTimeout(() => tx.classList.remove("tx-new"), 500);

        // Si es la 3ª transferencia, preparar el rollback
        if (isFail) {
            window.doRollback = function () {
                // Restaurar saldo original
                balanceEl.textContent = balanceTextoOriginal;
                balanceEl.classList.add("balance-flash-green");
                setTimeout(() => balanceEl.classList.remove("balance-flash-green"), 1200);

                // Marcar la transacción como revertida
                const txTitle = tx.querySelector(".tx-title");
                const txAmt   = tx.querySelector(".tx-amount-val");
                if (txTitle) txTitle.textContent = "⟳ Transferencia revertida";
                if (txAmt)   txAmt.style.textDecoration = "line-through";
                tx.style.transition = "opacity 0.5s ease";
                tx.style.opacity    = "0.45";

                // Resetear contador para que el ciclo se repita
                archClickCount = 0;
                window.doRollback = null;
            };
        }

    });

}());

/* ===== SQL Terminal — cambio de pestañas ===== */
(function () {

    function initSqlTabs() {
        const tabs   = document.querySelectorAll(".sql-tab");
        const panels = document.querySelectorAll(".sql-panel");

        if (!tabs.length) return;

        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                const target = tab.dataset.tab;

                tabs.forEach(t   => t.classList.remove("active"));
                panels.forEach(p => p.classList.remove("active"));

                tab.classList.add("active");
                const panel = document.getElementById("sql-" + target);
                if (panel) panel.classList.add("active");
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSqlTabs);
    } else {
        initSqlTabs();
    }

}());

/* ===== Setup Terminal — pestañas de estructura ===== */
(function () {

    function initSetupTabs() {
        const tabs   = document.querySelectorAll(".setup-tab");
        const panels = document.querySelectorAll(".setup-panel");

        if (!tabs.length) return;

        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                const target = tab.dataset.stab;

                tabs.forEach(t   => t.classList.remove("active"));
                panels.forEach(p => p.classList.remove("active"));

                tab.classList.add("active");
                const panel = document.getElementById("stab-" + target);
                if (panel) panel.classList.add("active");
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSetupTabs);
    } else {
        initSetupTabs();
    }

}());
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

OUTPUT = "/Users/diego/Desktop/TinerPay/TinerPay_Documentacion_Tecnica.pdf"

# ── Colores ───────────────────────────────────────────────────────────────────
DARK     = colors.HexColor("#0d1117")
ACCENT   = colors.HexColor("#00c896")
ACCENT2  = colors.HexColor("#0f7b6c")
CODE_BG  = colors.HexColor("#161b22")
CODE_FG  = colors.HexColor("#79c0ff")
CODE_STR = colors.HexColor("#a5d6ff")
GREY     = colors.HexColor("#f6f8fa")
BORDER   = colors.HexColor("#30363d")
TEXT     = colors.HexColor("#1c1c2e")
MUTED    = colors.HexColor("#57606a")
WHITE    = colors.white
WARN     = colors.HexColor("#e36209")
GREEN    = colors.HexColor("#1a7f37")

def S(name, **kw):
    return ParagraphStyle(name, **kw)

# ── Estilos base ──────────────────────────────────────────────────────────────
cover_title = S("CT", fontName="Helvetica-Bold", fontSize=36, textColor=WHITE,
    spaceAfter=8, alignment=TA_CENTER)
cover_sub   = S("CS", fontName="Helvetica", fontSize=14, textColor=ACCENT,
    spaceAfter=4, alignment=TA_CENTER)
cover_info  = S("CI", fontName="Helvetica", fontSize=10,
    textColor=colors.HexColor("#8b949e"), alignment=TA_CENTER, spaceAfter=3)

h2 = S("H2", fontName="Helvetica-Bold", fontSize=13, textColor=DARK,
    spaceBefore=14, spaceAfter=5)
h3 = S("H3", fontName="Helvetica-Bold", fontSize=11, textColor=ACCENT2,
    spaceBefore=10, spaceAfter=4)
body = S("Body", fontName="Helvetica", fontSize=10, textColor=TEXT,
    leading=15, spaceAfter=6, alignment=TA_JUSTIFY)
bullet = S("Blt", fontName="Helvetica", fontSize=10, textColor=TEXT,
    leading=14, spaceAfter=3, leftIndent=14)
code_p = S("CP", fontName="Courier", fontSize=8.5, textColor=CODE_FG,
    backColor=CODE_BG, leading=13, leftIndent=0, rightIndent=0,
    spaceBefore=0, spaceAfter=0, borderPadding=(4, 10, 4, 10))
code_c = S("CC", fontName="Courier-Oblique", fontSize=8.5,
    textColor=colors.HexColor("#8b949e"),
    backColor=CODE_BG, leading=13, spaceBefore=0, spaceAfter=0,
    borderPadding=(4, 10, 4, 10))
toc_m = S("TM", fontName="Helvetica-Bold", fontSize=10, textColor=TEXT,
    spaceAfter=3, leftIndent=0)
toc_s = S("TS", fontName="Helvetica", fontSize=9, textColor=MUTED,
    spaceAfter=2, leftIndent=16)
qa_q  = S("QQ", fontName="Helvetica-Bold", fontSize=10, textColor=WARN,
    spaceBefore=10, spaceAfter=3)
qa_a  = S("QA", fontName="Helvetica", fontSize=10, textColor=TEXT,
    leading=14, spaceAfter=4, leftIndent=12, alignment=TA_JUSTIFY)

# ── Helpers ───────────────────────────────────────────────────────────────────
def section_bar(num, title):
    """Barra de sección oscura sin texto superpuesto."""
    label = f"  {num}  {title}" if num else f"  {title}"
    data = [[Paragraph(label, S("SB", fontName="Helvetica-Bold", fontSize=15,
        textColor=WHITE, leading=20))]]
    t = Table(data, colWidths=[17*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), DARK),
        ("TOPPADDING",    (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("LEFTPADDING",   (0,0), (-1,-1), 16),
        ("RIGHTPADDING",  (0,0), (-1,-1), 16),
    ]))
    return [Spacer(1, 14), t, Spacer(1, 10)]

def code_block(lines):
    rows = []
    for ln in lines:
        txt = (ln.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
               or "&nbsp;")
        st = code_c if ln.strip().startswith(("#","--","//")) else code_p
        rows.append([Paragraph(txt, st)])
    t = Table(rows, colWidths=[17*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), CODE_BG),
        ("TOPPADDING",    (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
        ("LEFTPADDING",   (0,0), (-1,-1), 0),
        ("RIGHTPADDING",  (0,0), (-1,-1), 0),
        ("BOX",           (0,0), (-1,-1), 1, BORDER),
    ]))
    return [Spacer(1,4), t, Spacer(1,8)]

def hr():
    return HRFlowable(width="100%", thickness=0.5,
        color=colors.HexColor("#d0d7de"), spaceAfter=6, spaceBefore=6)

def note_box(text, bg=GREY, border=colors.HexColor("#d0d7de")):
    data = [[Paragraph(text, S("NB", fontName="Helvetica", fontSize=9.5,
        textColor=TEXT, leading=14))]]
    t = Table(data, colWidths=[17*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), bg),
        ("TOPPADDING",    (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING",   (0,0), (-1,-1), 12),
        ("RIGHTPADDING",  (0,0), (-1,-1), 12),
        ("BOX",           (0,0), (-1,-1), 1, border),
    ]))
    return [t, Spacer(1,6)]

def grid(rows, widths, header_color=DARK):
    t = Table(rows, colWidths=widths)
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), header_color),
        ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 9),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, GREY]),
        ("GRID",          (0,0), (-1,-1), 0.5, colors.HexColor("#d0d7de")),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
    ]))
    return [t, Spacer(1,8)]

# ── Documento ─────────────────────────────────────────────────────────────────
doc = SimpleDocTemplate(OUTPUT, pagesize=A4,
    leftMargin=2.5*cm, rightMargin=2.5*cm,
    topMargin=2*cm, bottomMargin=2.2*cm,
    title="TinerPay — Documentación Técnica")

story = []

# ══════════════════════════════════════════════════════════════════════════════
# PORTADA
# ══════════════════════════════════════════════════════════════════════════════
portada_rows = [
    [Paragraph("TINERPAY", cover_title)],
    [Paragraph("Documentación Técnica", cover_sub)],
    [Paragraph("Base de Datos Distribuida · CockroachDB · Node.js · Raft", cover_sub)],
    [Spacer(1, 24)],
    [Paragraph("Cómo funciona el backend · Cómo se creó la base de datos", cover_info)],
    [Paragraph("Cómo se sincronizan las consultas entre nodos", cover_info)],
    [Spacer(1, 36)],
    [Paragraph("Diego Gil González · 2026", cover_info)],
]
pt = Table([[r[0]] for r in portada_rows], colWidths=[17*cm])
pt.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,-1), DARK),
    ("TOPPADDING",    (0,0), (-1,-1), 8),
    ("BOTTOMPADDING", (0,0), (-1,-1), 8),
    ("LEFTPADDING",   (0,0), (-1,-1), 24),
    ("RIGHTPADDING",  (0,0), (-1,-1), 24),
]))
story.append(Spacer(1, 2.5*cm))
story.append(pt)
story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# ÍNDICE
# ══════════════════════════════════════════════════════════════════════════════
story += section_bar("", "Índice de Contenidos")
toc = [
    ("1.", "Arquitectura general del sistema", []),
    ("2.", "Cómo funciona el backend (Node.js + Express)", [
        "2.1  server/index.js — el servidor y sus rutas",
        "2.2  server/db.js — conexión a CockroachDB con fallback",
        "2.3  server/cluster.js — gestión real de los 3 procesos",
        "2.4  server/init.js — creación automática del schema",
    ]),
    ("3.", "Cómo se creó la base de datos", [
        "3.1  El schema completo y por qué cada decisión",
        "3.2  Por qué UUID en lugar de AUTO_INCREMENT",
        "3.3  Por qué soft delete en lugar de DELETE",
        "3.4  Relaciones entre tablas y foreign keys",
    ]),
    ("4.", "Cómo se sincronizan las consultas entre nodos", [
        "4.1  Consenso Raft — el algoritmo explicado",
        "4.2  Flujo completo de una escritura distribuida",
        "4.3  Qué pasa cuando un nodo cae",
        "4.4  Cómo el backend sobrevive al fallo (fallback en db.js)",
        "4.5  Transacciones ACID en un sistema distribuido",
    ]),
    ("5.", "El CRUD — SQL real explicado línea a línea", []),
    ("6.", "Preguntas técnicas del profesor", []),
    ("7.", "Referencia rápida de comandos", []),
]
for num, title, subs in toc:
    story.append(Paragraph(f"<b>{num}</b>  {title}", toc_m))
    for s in subs:
        story.append(Paragraph(f"— {s}", toc_s))
    story.append(Spacer(1, 2))
story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# 1. ARQUITECTURA GENERAL
# ══════════════════════════════════════════════════════════════════════════════
story += section_bar("1.", "Arquitectura general del sistema")

story.append(Paragraph(
    "TinerPay tiene tres capas completamente separadas que se comunican entre sí. "
    "Es importante entender esta separación porque explica por qué cada fichero existe "
    "y qué responsabilidad tiene.", body))

story += grid([
    ["Capa", "Tecnología", "Fichero principal", "Responsabilidad"],
    ["Frontend",      "HTML + CSS + JS",    "index.html + JS/script.js",
     "Interfaz visual. Nunca toca la BD directamente."],
    ["Backend / API", "Node.js + Express",  "server/index.js",
     "Recibe peticiones HTTP del frontend y ejecuta SQL en CockroachDB."],
    ["Base de datos", "CockroachDB (×3)",   "cluster de 3 procesos",
     "Almacena y replica todos los datos con consenso Raft."],
], [3.5*cm, 4*cm, 4.5*cm, 5*cm])

story.append(Paragraph(
    "El frontend <b>nunca habla directamente con la base de datos</b>. Solo hace "
    "llamadas HTTP al backend. El backend es el único que sabe cómo conectarse a "
    "CockroachDB. Esta separación es una práctica estándar de seguridad.", body))

story += note_box(
    "<b>Flujo de una operación:</b>  "
    "Botón en la web  →  fetch() HTTP  →  Express recibe  →  "
    "db.js conecta al nodo disponible  →  SQL ejecutado  →  "
    "Raft replica a los 3 nodos  →  respuesta JSON al frontend  →  "
    "UI actualizada",
    bg=colors.HexColor("#dafbe1"), border=colors.HexColor("#2da44e"))

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# 2. EL BACKEND
# ══════════════════════════════════════════════════════════════════════════════
story += section_bar("2.", "Cómo funciona el backend (Node.js + Express)")

story.append(Paragraph("2.1  server/index.js — el servidor y sus rutas", h2))
story.append(Paragraph(
    "Es el punto de entrada del backend. Hace dos cosas: arrancar el sistema completo "
    "y definir todas las rutas de la API REST.", body))
story += code_block([
    "// Al iniciarse, ejecuta estos pasos en orden:",
    "async function main() {",
    "  await cluster.startCluster();  // arranca los 3 nodos CockroachDB",
    "  await initDB();                // crea BD y tablas si no existen",
    "  app.listen(3000, ...);         // abre el servidor HTTP",
    "}",
])
story.append(Paragraph(
    "Las rutas definen qué URL hace qué. Express asocia cada URL + método HTTP "
    "con una función que ejecuta SQL:", body))
story += grid([
    ["Método", "URL", "Acción en la BD"],
    ["POST",   "/api/users",              "INSERT en users + INSERT en wallets"],
    ["GET",    "/api/users",              "SELECT users JOIN wallets"],
    ["POST",   "/api/wallets/deposit",    "UPDATE wallets SET balance = balance + X"],
    ["POST",   "/api/transactions",       "BEGIN + UPDATE + UPDATE + INSERT + COMMIT"],
    ["GET",    "/api/cluster/status",     "Comprueba qué puertos están activos"],
    ["POST",   "/api/cluster/node/:id/kill",    "Mata el proceso del nodo indicado"],
    ["POST",   "/api/cluster/node/:id/restart", "Respawn del proceso del nodo"],
], [2*cm, 6.5*cm, 8.5*cm], header_color=ACCENT2)

story.append(Paragraph("2.2  server/db.js — conexión con fallback entre nodos", h2))
story.append(Paragraph(
    "Este módulo resuelve el problema más importante del sistema distribuido: "
    "<b>¿qué pasa si el nodo al que estás conectado cae?</b>", body))
story.append(Paragraph(
    "La solución es simple y elegante: en vez de conectar siempre al mismo nodo, "
    "intentamos los tres en orden. El primero que responda gana.", body))
story += code_block([
    "// server/db.js",
    "const NODE_PORTS = [26257, 26258, 26259];",
    "",
    "async function query(sql, params = []) {",
    "  for (const port of NODE_PORTS) {",
    "    try {",
    "      // Crear una conexión nueva a este nodo",
    "      const client = new Client({",
    "        host: 'localhost',",
    "        port,                     // 26257, luego 26258, luego 26259",
    "        database: 'tinerpay',",
    "        user: 'root',",
    "        ssl: false,",
    "        connectionTimeoutMillis: 2000  // si no responde en 2s, siguiente",
    "      });",
    "      await client.connect();",
    "      const result = await client.query(sql, params);",
    "      await client.end();",
    "      return result;              // éxito: devolver y salir",
    "    } catch (_) {",
    "      // este nodo no responde → probar el siguiente",
    "    }",
    "  }",
    "  throw new Error('Ningún nodo disponible');",
    "}",
])
story.append(Paragraph(
    "CockroachDB habla el <b>protocolo de red de PostgreSQL</b> (wire protocol). "
    "Por eso usamos la librería <code>pg</code> de Node.js — la misma que se usa "
    "para PostgreSQL — sin ningún driver especial.", body))

story.append(Paragraph("2.3  server/cluster.js — gestión real de los 3 procesos", h2))
story.append(Paragraph(
    "Este módulo es el responsable de arrancar, matar y reiniciar los procesos "
    "reales de CockroachDB en el sistema operativo.", body))
story += code_block([
    "// Los 3 nodos definidos con sus puertos",
    "const NODES = [",
    "  { id: 1, port: 26257, httpPort: 8080, dir: 'cockroach-data/node1' },",
    "  { id: 2, port: 26258, httpPort: 8081, dir: 'cockroach-data/node2' },",
    "  { id: 3, port: 26259, httpPort: 8082, dir: 'cockroach-data/node3' },",
    "];",
    "",
    "// Arrancar un nodo — spawn crea un proceso hijo del sistema operativo",
    "function spawnNode(node) {",
    "  const proc = spawn('cockroach', [",
    "    'start', '--insecure',",
    "    '--store=' + node.dir,              // donde guarda sus datos",
    "    '--listen-addr=localhost:' + node.port,",
    "    '--http-addr=localhost:' + node.httpPort,",
    "    '--join=localhost:26257,26258,26259' // conoce a los otros nodos",
    "  ]);",
    "  node.proc = proc;   // guardamos referencia para poder matarlo",
    "}",
    "",
    "// Matar un nodo — SIGKILL termina el proceso inmediatamente",
    "function killNode(id) {",
    "  const node = NODES.find(n => n.id === id);",
    "  node.proc.kill('SIGKILL');   // señal del SO para terminar el proceso",
    "  node.proc = null;",
    "}",
])
story += note_box(
    "<b>¿Por qué --join?</b>  Cuando arranca un nodo, necesita saber dónde están "
    "los demás para unirse al cluster. El flag --join le pasa las direcciones de "
    "todos los nodos. Así CockroachDB puede establecer las conexiones Raft entre ellos.",
    bg=colors.HexColor("#fff8c5"), border=colors.HexColor("#d4a72c"))

story.append(Paragraph("2.4  server/init.js — creación automática del schema", h2))
story.append(Paragraph(
    "Cada vez que arranca el servidor, init.js ejecuta el schema SQL. "
    "Usa <code>IF NOT EXISTS</code> en todos los CREATE TABLE, por lo que es "
    "idempotente — se puede ejecutar mil veces y solo crea las tablas la primera.", body))
story += code_block([
    "// server/init.js — se ejecuta en cada arranque",
    "async function initDB() {",
    "  // 1. Crear la BD en defaultdb (la BD del sistema)",
    "  await db.query('CREATE DATABASE IF NOT EXISTS tinerpay', [], 'defaultdb');",
    "",
    "  // 2. Crear tablas en tinerpay (IF NOT EXISTS = seguro repetir)",
    "  await db.query(`CREATE TABLE IF NOT EXISTS users (...)`)  ;",
    "  await db.query(`CREATE TABLE IF NOT EXISTS currencies (...)`)  ;",
    "  await db.query(`CREATE TABLE IF NOT EXISTS wallets (...)`)  ;",
    "  await db.query(`CREATE TABLE IF NOT EXISTS transactions (...)`)  ;",
    "",
    "  // 3. Insertar divisas semilla (ON CONFLICT DO NOTHING = seguro repetir)",
    "  await db.query(`INSERT INTO currencies ... ON CONFLICT DO NOTHING`);",
    "}",
])
story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# 3. LA BASE DE DATOS
# ══════════════════════════════════════════════════════════════════════════════
story += section_bar("3.", "Cómo se creó la base de datos")

story.append(Paragraph("3.1  El schema completo y el razonamiento detrás de cada decisión", h2))

story.append(Paragraph("<b>Tabla currencies</b>", h3))
story += code_block([
    "CREATE TABLE currencies (",
    "  code   VARCHAR(3)   PRIMARY KEY,   -- 'EUR', 'USD' — clave corta y legible",
    "  name   VARCHAR(100) NOT NULL,      -- 'Euro', 'US Dollar'",
    "  symbol VARCHAR(5)   NOT NULL       -- 'EUR', 'USD'",
    ");",
    "INSERT INTO currencies VALUES ('EUR','Euro','EUR'), ('USD','US Dollar','USD');",
])
story.append(Paragraph(
    "La clave primaria es el código de divisa (EUR, USD) en lugar de un UUID. "
    "Esto es válido porque el código ISO 4217 ya garantiza unicidad global y "
    "hace las queries más legibles.", body))

story.append(Paragraph("<b>Tabla users</b>", h3))
story += code_block([
    "CREATE TABLE users (",
    "  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,",
    "  name       VARCHAR(255) NOT NULL,",
    "  email      VARCHAR(255) UNIQUE NOT NULL,  -- UNIQUE: no dos usuarios mismo email",
    "  deleted_at TIMESTAMP    NULL DEFAULT NULL  -- NULL = activo, fecha = borrado",
    ");",
])

story.append(Paragraph("<b>Tabla wallets</b>", h3))
story += code_block([
    "CREATE TABLE wallets (",
    "  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,",
    "  user_id       UUID          REFERENCES users(id),       -- FK a users",
    "  currency_code VARCHAR(3)    REFERENCES currencies(code),-- FK a currencies",
    "  balance       DECIMAL(18,2) DEFAULT 0  -- 18 dígitos, 2 decimales",
    ");",
])
story.append(Paragraph(
    "<b>¿Por qué DECIMAL(18,2) y no FLOAT?</b> Los tipos FLOAT tienen errores de "
    "precisión en coma flotante. En sistemas financieros NUNCA se usa FLOAT para "
    "dinero — DECIMAL almacena el valor exacto.", body))

story.append(Paragraph("<b>Tabla transactions</b>", h3))
story += code_block([
    "CREATE TABLE transactions (",
    "  id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,",
    "  from_wallet UUID          REFERENCES wallets(id),  -- origen",
    "  to_wallet   UUID          REFERENCES wallets(id),  -- destino",
    "  amount      DECIMAL(18,2) NOT NULL,",
    "  created_at  TIMESTAMP     DEFAULT now()  -- fecha automática del servidor",
    ");",
])

story.append(Paragraph("3.2  Por qué UUID en lugar de AUTO_INCREMENT", h2))
story += grid([
    ["",                    "AUTO_INCREMENT (MySQL)",       "UUID (CockroachDB)"],
    ["Generación",          "Coordinación central requerida",  "Local en cada nodo"],
    ["Nodos distribuidos",  "Cuello de botella — uno manda",   "Sin coordinación"],
    ["Colisiones",          "Imposible si centralizado",       "Imposible por probabilidad"],
    ["Rendimiento",         "Secuencial, lento en cluster",    "Paralelo, escalable"],
    ["Legibilidad",         "1, 2, 3... fácil",               "65ab7c84-... opaco"],
], [4*cm, 6.5*cm, 6.5*cm], header_color=ACCENT2)
story.append(Paragraph(
    "En un cluster de 3 nodos, si el nodo 1 genera IDs 1,2,3 y el nodo 2 también "
    "genera 1,2,3, habría colisiones. UUID v4 usa 122 bits aleatorios — la probabilidad "
    "de colisión es astronómicamente baja (1 en 2^61 con mil millones de UUIDs/segundo).", body))

story.append(Paragraph("3.3  Por qué soft delete en lugar de DELETE físico", h2))
story.append(Paragraph(
    "Cuando un usuario se 'elimina', no se borra de la base de datos. En su lugar "
    "se rellena el campo <code>deleted_at</code> con la fecha actual:", body))
story += code_block([
    "-- Soft delete: el registro sigue en la BD",
    "UPDATE users SET deleted_at = now() WHERE id = '<uuid>';",
    "",
    "-- Todas las queries normales filtran los borrados:",
    "SELECT * FROM users WHERE deleted_at IS NULL;",
    "",
    "-- El historial de transacciones sigue intacto",
    "SELECT * FROM transactions WHERE from_wallet = '<wallet_del_usuario_borrado>';",
])
story += note_box(
    "<b>¿Por qué es importante?</b>  Si borramos físicamente un usuario, las filas de "
    "transactions que referencian su wallet quedarían con una foreign key rota. "
    "Además, en finanzas la ley exige conservar el historial de operaciones.",
    bg=colors.HexColor("#fff8c5"), border=colors.HexColor("#d4a72c"))

story.append(Paragraph("3.4  Relaciones entre tablas", h2))
story += grid([
    ["Tabla origen", "Tabla destino", "Tipo", "Significado"],
    ["users",    "wallets",      "1 → N", "Un usuario puede tener varias wallets (EUR, USD...)"],
    ["currencies","wallets",     "1 → N", "Muchas wallets pueden usar la misma divisa"],
    ["wallets",  "transactions", "1 → N", "Una wallet aparece en muchas transacciones"],
], [3.5*cm, 3.5*cm, 2*cm, 8*cm])
story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# 4. SINCRONIZACIÓN DE CONSULTAS
# ══════════════════════════════════════════════════════════════════════════════
story += section_bar("4.", "Cómo se sincronizan las consultas entre nodos")

story.append(Paragraph("4.1  Consenso Raft — el algoritmo explicado", h2))
story.append(Paragraph(
    "Raft es el algoritmo que garantiza que todos los nodos del cluster ven los "
    "mismos datos en el mismo orden. Sin él, dos nodos podrían aceptar escrituras "
    "diferentes simultáneamente y el sistema quedaría inconsistente.", body))
story.append(Paragraph("Los 3 conceptos clave de Raft:", h3))
story += code_block([
    "LEADER    — El nodo que recibe todas las escrituras de su range.",
    "            Solo hay un leader por range en todo momento.",
    "",
    "FOLLOWER  — Los otros nodos. Solo replican lo que dice el leader.",
    "            No aceptan escrituras directamente.",
    "",
    "QUORUM    — Mayoría simple: 2 de 3 nodos deben confirmar cada escritura.",
    "            Si un follower no confirma, la escritura se bloquea hasta que lo haga.",
    "            Si el leader cae, los followers eligen uno nuevo.",
])
story.append(Paragraph("El proceso de una escritura con Raft:", h3))
steps_raft = [
    ("1. Cliente escribe", "El frontend pide una transferencia. El backend conecta al líder del range."),
    ("2. Leader propone",  "El leader añade la operación a su log local y la envía a los followers."),
    ("3. Followers votan", "Cada follower recibe la propuesta, la añade a su log y confirma al leader."),
    ("4. Quorum",          "En cuanto 2 de 3 nodos confirman (quórum), el leader aplica el commit."),
    ("5. Respuesta",       "El leader responde al cliente: transacción confirmada."),
    ("6. Followers aplican","Los followers aplican el commit a sus datos en segundo plano."),
]
for title, desc in steps_raft:
    story.append(Paragraph(f"<b>{title}:</b>  {desc}", bullet))
story.append(Spacer(1, 6))

story.append(Paragraph("Los 3 ranges del cluster", h3))
story += grid([
    ["Range", "Datos que gestiona", "Leader inicial", "Followers"],
    ["Range 1", "Tabla users",        "Nodo 2 (:26258)", "Nodo 1, Nodo 3"],
    ["Range 2", "Tabla wallets",      "Nodo 3 (:26259)", "Nodo 1, Nodo 2"],
    ["Range 3", "Tabla transactions", "Nodo 1 (:26257)", "Nodo 2, Nodo 3"],
], [2.5*cm, 4.5*cm, 4.5*cm, 5.5*cm], header_color=ACCENT2)
story.append(Paragraph(
    "Cada range tiene su propio leader independiente. Las escrituras en users, "
    "wallets y transactions pueden procesarse en paralelo en distintos nodos "
    "simultáneamente, lo que mejora el rendimiento.", body))

story.append(Paragraph("4.2  Flujo completo de una escritura distribuida", h2))
story.append(Paragraph(
    "Ejemplo concreto: Diego transfiere 30€ a Jorge.", body))
story += code_block([
    "1.  Script.js llama: fetch('POST /api/transactions', {from, to, amount: 30})",
    "2.  Express recibe la petición en server/index.js",
    "3.  db.js abre conexión con el primer nodo vivo (intenta 26257 primero)",
    "4.  Ejecuta: BEGIN",
    "5.  Ejecuta: SELECT balance FROM wallets WHERE id = '<from_wallet>'",
    "    → CockroachDB lee de la réplica local del nodo conectado",
    "6.  Comprueba que el saldo es suficiente (en Node.js)",
    "7.  Ejecuta: UPDATE wallets SET balance = balance - 30 WHERE id = '<from>'",
    "    → El leader del Range 2 recibe el UPDATE",
    "    → Lo propone a los followers del Range 2",
    "    → Quorum alcanzado: 2/3 nodos confirman",
    "8.  Ejecuta: UPDATE wallets SET balance = balance + 30 WHERE id = '<to>'",
    "    → Mismo proceso: leader propone, quorum, confirmado",
    "9.  Ejecuta: INSERT INTO transactions (...) VALUES (...)",
    "    → El leader del Range 3 recibe el INSERT",
    "    → Quorum: 2/3 nodos del Range 3 confirman",
    "10. Ejecuta: COMMIT",
    "    → CockroachDB hace el commit atómico en los 3 ranges",
    "11. db.js devuelve {from_balance: 70, to_balance: 30, transaction_id: uuid}",
    "12. Express responde con JSON al frontend",
    "13. script.js actualiza la UI y lanza las animaciones de replicación",
])

story.append(Paragraph("4.3  Qué pasa cuando un nodo cae", h2))
story.append(Paragraph(
    "Cuando se pulsa el botón nuclear y el nodo 1 cae:", body))
story += code_block([
    "T+0s    El proceso del nodo 1 recibe SIGKILL → muere inmediatamente",
    "T+1s    Los nodos 2 y 3 dejan de recibir heartbeat del nodo 1",
    "T+3s    Los followers del Range 3 detectan que el leader no responde",
    "T+3s    Inician elección Raft: nodo 2 se postula como candidato",
    "T+4s    Nodo 2 solicita votos al nodo 3",
    "T+4s    Nodo 3 vota por nodo 2 (cumple quorum: 2/3 nodos vivos votan)",
    "T+5s    Nodo 2 se convierte en nuevo leader del Range 3",
    "T+5s    El cluster vuelve a aceptar escrituras en Range 3",
    "",
    "→ El cluster estuvo ~5 segundos sin aceptar escrituras en Range 3",
    "→ Range 1 y Range 2 nunca se interrumpieron (sus leaders estaban en nodos 2 y 3)",
])

story.append(Paragraph("4.4  Cómo el backend sobrevive al fallo — fallback en db.js", h2))
story.append(Paragraph(
    "Mientras el nodo 1 estaba muerto, el backend seguía respondiendo peticiones "
    "porque db.js prueba los nodos en orden:", body))
story += code_block([
    "// Con nodo 1 muerto:",
    "Intento 1: puerto 26257 → ConnectionRefused → siguiente",
    "Intento 2: puerto 26258 → ÉXITO → ejecutar SQL aquí",
    "",
    "// El cliente no nota nada — la query funciona igual",
    "// Solo hay un retraso de ~2 segundos (el timeout de conexión al nodo muerto)",
])
story += note_box(
    "<b>Esto demuestra la resiliencia real del sistema.</b>  La UI de localhost:8080 "
    "cae (la servía el nodo 1), pero la API en el puerto 3000 sigue funcionando "
    "porque el servidor Node.js conecta automáticamente al nodo 2.",
    bg=colors.HexColor("#dafbe1"), border=colors.HexColor("#2da44e"))

story.append(Paragraph("4.5  Transacciones ACID en un sistema distribuido", h2))
story += grid([
    ["Propiedad ACID", "Significado", "Cómo lo garantiza CockroachDB"],
    ["Atomicidad",    "Todo o nada",
     "BEGIN/COMMIT: si falla cualquier UPDATE, ROLLBACK automático"],
    ["Consistencia",  "La BD siempre en estado válido",
     "Foreign keys, constraints y validaciones se comprueban antes de commit"],
    ["Aislamiento",   "Las transacciones no se interfieren",
     "MVCC: cada transacción ve un snapshot consistente"],
    ["Durabilidad",   "Un commit no se pierde nunca",
     "Raft: el commit se escribe en 2/3 nodos antes de confirmar"],
], [2.5*cm, 4*cm, 10.5*cm])
story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# 5. CRUD
# ══════════════════════════════════════════════════════════════════════════════
story += section_bar("5.", "El CRUD — SQL real explicado línea a línea")

story.append(Paragraph("INSERT — Crear usuario + wallet", h2))
story += code_block([
    "-- Se ejecuta dentro de una transacción BEGIN/COMMIT en Node.js",
    "BEGIN;",
    "",
    "-- 1. Crear el usuario — RETURNING id devuelve el UUID generado",
    "INSERT INTO users (name, email)",
    "VALUES ('Diego', 'diegodam@gmail.com')",
    "RETURNING id;",
    "",
    "-- 2. Crear su wallet EUR con saldo 0 usando el UUID del paso anterior",
    "INSERT INTO wallets (user_id, currency_code, balance)",
    "VALUES ('<uuid_del_user>', 'EUR', 0);",
    "",
    "COMMIT;  -- ambas inserciones se confirman juntas o ninguna",
])
story.append(Paragraph(
    "<b>¿Por qué una transacción para crear usuario + wallet?</b>  Si el INSERT de "
    "users tiene éxito pero el de wallets falla (por cualquier razón), quedaría un "
    "usuario sin wallet. La transacción garantiza que o se crean los dos o no se "
    "crea ninguno.", body))

story.append(Paragraph("SELECT — Leer usuarios con saldo", h2))
story += code_block([
    "SELECT u.name,          -- nombre del usuario",
    "       w.balance,       -- saldo actual (viene de wallets)",
    "       w.currency_code  -- divisa (EUR)",
    "FROM   wallets w",
    "JOIN   users u ON w.user_id = u.id  -- unir las dos tablas por FK",
    "WHERE  u.deleted_at IS NULL          -- excluir borrados lógicamente",
    "ORDER  BY u.name;                    -- ordenar alfabéticamente",
])
story.append(Paragraph(
    "El JOIN es necesario porque los datos están en dos tablas: el nombre en users "
    "y el saldo en wallets. La condición <code>deleted_at IS NULL</code> implementa "
    "el soft delete — excluye a los usuarios marcados como borrados.", body))

story.append(Paragraph("UPDATE — Depósito de saldo", h2))
story += code_block([
    "BEGIN;",
    "UPDATE wallets",
    "  SET balance = balance + 100    -- suma al valor actual, no lo reemplaza",
    "  WHERE id = '<wallet_uuid>'",
    "  RETURNING balance;             -- devuelve el nuevo saldo",
    "COMMIT;",
])

story.append(Paragraph("UPDATE — Transferencia entre wallets (transacción completa)", h2))
story += code_block([
    "BEGIN;",
    "",
    "-- Paso 1: verificar saldo suficiente ANTES de modificar",
    "SELECT balance FROM wallets WHERE id = '<from_wallet>';",
    "-- Si balance < amount → ROLLBACK en Node.js y error al cliente",
    "",
    "-- Paso 2: débito al origen",
    "UPDATE wallets SET balance = balance - 30",
    "  WHERE id = '<from_wallet>';",
    "",
    "-- Paso 3: crédito al destino",
    "UPDATE wallets SET balance = balance + 30",
    "  WHERE id = '<to_wallet>';",
    "",
    "-- Paso 4: registrar la transacción en el historial",
    "INSERT INTO transactions (from_wallet, to_wallet, amount)",
    "  VALUES ('<from_wallet>', '<to_wallet>', 30);",
    "",
    "COMMIT;  -- los 3 cambios se aplican juntos en los 3 nodos",
    "-- Si algo falla → ROLLBACK → ningún saldo cambia",
])

story.append(Paragraph("DELETE — Borrado lógico", h2))
story += code_block([
    "-- NO usamos DELETE FROM users WHERE id = '...'",
    "-- Usamos soft delete: marcar con la fecha actual",
    "UPDATE users",
    "  SET deleted_at = now()  -- now() = timestamp del servidor CockroachDB",
    "  WHERE id = '<user_uuid>';",
    "",
    "-- El usuario desaparece de todas las queries normales:",
    "SELECT * FROM users WHERE deleted_at IS NULL;  -- ya no aparece",
    "",
    "-- Pero sus transacciones siguen intactas:",
    "SELECT * FROM transactions WHERE from_wallet = '<su_wallet>';  -- sí aparece",
])
story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# 6. PREGUNTAS DEL PROFESOR
# ══════════════════════════════════════════════════════════════════════════════
story += section_bar("6.", "Preguntas técnicas del profesor")

qa_pairs = [
    ("¿Qué es el consenso Raft y para qué sirve?",
     "Raft es un algoritmo de consenso distribuido. Garantiza que todos los nodos "
     "acuerdan el mismo orden de operaciones. Una escritura solo se confirma cuando "
     "la mayoría (quórum: 2 de 3) la ha recibido. Sin Raft, dos nodos podrían "
     "aceptar escrituras contradictorias y los datos quedarían inconsistentes."),

    ("¿Por qué CockroachDB y no MySQL o PostgreSQL?",
     "MySQL y PostgreSQL son single-node por defecto — necesitan configuración externa "
     "compleja para distribuirse. CockroachDB nació distribuido: replicación, "
     "tolerancia a fallos y consistencia son características nativas del motor. "
     "Para una plataforma de pagos global, la disponibilidad continua es crítica."),

    ("¿Qué pasa si caen 2 de los 3 nodos?",
     "El cluster pierde quórum (necesita 2 de 3, solo queda 1) y deja de aceptar "
     "escrituras para proteger la consistencia. Con 3 nodos se tolera máximo 1 fallo. "
     "Para tolerar 2 fallos simultáneos harían falta 5 nodos (quórum de 3/5)."),

    ("¿Cómo funciona el fallback del backend cuando cae un nodo?",
     "db.js intenta conectar a los nodos en orden: 26257, 26258, 26259. Si el primero "
     "no responde en 2 segundos, prueba el siguiente. El cliente (frontend) recibe "
     "la respuesta correcta sin saber qué nodo la procesó."),

    ("¿Por qué usáis UUID en lugar de AUTO_INCREMENT?",
     "AUTO_INCREMENT necesita un contador centralizado — en un cluster de 3 nodos, "
     "todos tendrían que coordinarse para el siguiente número, creando un cuello de "
     "botella. UUID se genera de forma completamente local y aleatoria en cualquier "
     "nodo sin ninguna coordinación, lo que permite escrituras paralelas en todos los nodos."),

    ("¿Qué es MVCC y cómo lo usa CockroachDB?",
     "MVCC (Multi-Version Concurrency Control) permite que cada transacción vea un "
     "snapshot consistente de los datos sin bloquear a otras transacciones. En vez "
     "de bloquear filas para leer, CockroachDB mantiene múltiples versiones de cada "
     "fila con timestamps. Las lecturas ven la versión correcta para su timestamp de inicio."),

    ("¿Qué garantiza una transacción BEGIN/COMMIT en un sistema distribuido?",
     "Que todos los cambios de la transacción (debito + crédito + registro) se "
     "aplican juntos en todos los nodos, o ninguno se aplica. CockroachDB implementa "
     "two-phase commit distribuido — primero prepara el commit en todos los nodos "
     "afectados, y solo si todos aceptan ejecuta el commit global."),

    ("¿Por qué DECIMAL y no FLOAT para el dinero?",
     "FLOAT usa representación binaria de coma flotante que tiene errores de precisión: "
     "0.1 + 0.2 = 0.30000000000000004 en binario. DECIMAL(18,2) almacena el número "
     "exacto en base 10. En finanzas, un error de un céntimo multiplicado por millones "
     "de transacciones es inaceptable."),

    ("¿Cómo funciona el botón nuclear exactamente?",
     "1) El frontend llama fetch POST /api/cluster/node/1/kill. "
     "2) Express pasa la petición a cluster.js. "
     "3) cluster.js ejecuta node.proc.kill('SIGKILL') — una señal del sistema operativo "
     "que termina el proceso inmediatamente. "
     "4) CockroachDB en los nodos 2 y 3 detecta que el leader del Range 3 no responde. "
     "5) Inician elección Raft y eligen al nodo 2 como nuevo leader. "
     "6) El cluster sigue funcionando."),

    ("¿Por qué el frontend no se conecta directamente a la base de datos?",
     "Por seguridad. Si el frontend tuviera acceso directo a CockroachDB, cualquiera "
     "que inspeccionara el código JavaScript podría ver las credenciales de la BD y "
     "ejecutar queries arbitrarias. El backend actúa como intermediario validando "
     "cada petición antes de tocar la base de datos."),

    ("¿Qué es el wire protocol de PostgreSQL?",
     "Es el protocolo binario de red que usa PostgreSQL para comunicarse con clientes. "
     "CockroachDB implementa exactamente el mismo protocolo, lo que significa que "
     "cualquier cliente de PostgreSQL (librería pg de Node.js, psycopg2 de Python, "
     "DBeaver, TablePlus...) funciona con CockroachDB sin modificaciones."),

    ("¿Cuánto tarda en recuperarse el cluster tras el fallo de un nodo?",
     "La elección Raft del nuevo leader tarda entre 3 y 10 segundos. Durante ese "
     "tiempo el Range afectado no acepta escrituras. Los otros ranges (con sus "
     "leaders en nodos vivos) siguen funcionando sin interrupción. Cuando el nodo "
     "vuelve, se resincroniza automáticamente con los datos que le faltan."),
]

for q, a in qa_pairs:
    story.append(Paragraph(f"P: {q}", qa_q))
    story.append(Paragraph(f"R: {a}", qa_a))
    story.append(hr())

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# 7. REFERENCIA RÁPIDA
# ══════════════════════════════════════════════════════════════════════════════
story += section_bar("7.", "Referencia rápida de comandos")

story.append(Paragraph("Día de la presentación", h2))
story += code_block([
    "cd /Users/diego/Desktop/TinerPay",
    "",
    "# Antes de que llegue el profesor:",
    "./reset.sh          # limpiar todos los datos",
    "./start.sh          # arrancar cluster + servidor",
    "",
    "# Verificar instalación (mostrar en terminal):",
    "cockroach version   # → v26.1.3",
    "",
    "# Abrir consola SQL (para punto 7.2):",
    "cockroach sql --insecure --host=localhost:26257",
])

story.append(Paragraph("SQL para mostrar en vivo durante la presentación", h2))
story += code_block([
    "USE tinerpay;",
    "",
    "-- Punto 7.2: estructura de la BD",
    "SHOW TABLES;",
    "\\d users",
    "\\d wallets",
    "\\d transactions",
    "",
    "-- Punto 7.3: ver datos después de usar la demo",
    "SELECT * FROM users;",
    "SELECT u.name, w.balance, w.currency_code",
    "  FROM wallets w JOIN users u ON w.user_id = u.id",
    "  WHERE u.deleted_at IS NULL;",
    "SELECT * FROM transactions ORDER BY created_at DESC;",
    "",
    "-- Salir",
    "\\q",
])

story.append(Paragraph("URLs del navegador", h2))
story += grid([
    ["URL", "Cuándo usarla"],
    ["http://localhost:3000", "Demo web — siempre abierta"],
    ["http://localhost:8080", "CockroachDB UI nodo 1 — abrir al inicio"],
    ["http://localhost:8081", "CockroachDB UI nodo 2 — cambiar aquí cuando el nodo 1 explote"],
], [7*cm, 10*cm], header_color=ACCENT2)

story.append(Paragraph("Si algo falla", h2))
story += grid([
    ["Problema", "Solución"],
    ["Puerto 3000 ocupado",        "./start.sh lo libera automáticamente"],
    ["BD con datos de prueba",     "./reset.sh antes de empezar"],
    ["Servidor no responde",       "./stop.sh y luego ./start.sh"],
    ["localhost:8080 caído",       "Normal tras el botón nuclear — usar localhost:8081"],
    ["Nodo no se recupera",        "Esperar 15-20 segundos tras pulsar Reiniciar cluster"],
], [6*cm, 11*cm], header_color=WARN)

# ── Build ─────────────────────────────────────────────────────────────────────
def on_page(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    if doc.page > 1:
        canvas.drawString(2.5*cm, 1.2*cm, "TinerPay — Documentación Técnica")
        canvas.drawRightString(A4[0]-2.5*cm, 1.2*cm, f"Página {doc.page}")
    canvas.restoreState()

doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
print(f"PDF generado: {OUTPUT}")

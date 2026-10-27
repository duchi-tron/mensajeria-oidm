Sistema de Mensajería en Tiempo Real — Backend
Servidor backend para una aplicación de mensajería instantánea en tiempo real basado en una arquitectura MVC desacoplada, desarrollado con JavaScript, Bun, Express 5, PostgreSQL, Prisma ORM y Socket.IO 4.

🛠️ Stack Tecnológico
Entorno de ejecución: Bun

Framework Web: Express 5

Base de Datos: PostgreSQL (desplegado en contenedor Docker en el puerto 5480)

ORM: Prisma

Tiempo Real (WebSockets): Socket.IO 4

Autenticación y Seguridad: JSON Web Tokens (JWT) y cifrado de contraseñas con bcrypt

📂 Estructura del Proyecto
Plaintext
mensajeria-oidm/
├── docker-compose.yaml               # Contenedor de PostgreSQL
├── .gitignore                        # Archivos y carpetas excluidos del control de versiones
└── backend/
    ├── postman/
    │   └── Backup postman oidm.json  # Colección exportada de endpoints y casos de prueba
    ├── prisma/
    │   ├── schema.prisma             # Modelos User, Conversation, Participant y Message
    │   └── migrations/               # Historial de migraciones SQL generadas
    ├── src/
    │   ├── config/                   # Variables de entorno y cliente Prisma
    │   ├── controllers/              # Controladores REST (Auth, User, Conversation, Message)
    │   ├── middlewares/              # Validaciones y middleware de autenticación JWT
    │   ├── routes/                   # Definición de rutas modularizadas
    │   ├── services/                 # Lógica de negocio y persistencia en base de datos
    │   ├── sockets/
    │   │   └── chat.socket.js        # Configuración de salas y eventos Socket.IO
    │   ├── utils/                    # Generación y verificación de JWT
    │   ├── validators/               # Esquemas de validación de entrada
    │   ├── app.js                    # Inicialización de la aplicación Express
    │   └── server.js                 # Servidor HTTP montado con Socket.IO
    ├── package.json
    └── tsconfig.json
🚀 Instalación y Puesta en Marcha
1. Clonar el repositorio
git clone https://github.com/duchi-tron/mensajeria-oidm.git
cd mensajeria-oidm
2. Iniciar el contenedor de PostgreSQL
docker compose up -d
La base de datos queda expuesta en el host local en el puerto 5480 con el nombre chat_db.

3. Configurar variables de entorno
Dentro de la carpeta backend/, crea un archivo .env:

PORT=3000
DATABASE_URL="postgresql://usuario:password@localhost:5480/chat_db?schema=public"
JWT_SECRET="tu_secreto_super_seguro"
CLIENT_ORIGIN="*"
4. Instalar dependencias y sincronizar la base de datos
cd backend
bun install
bunx prisma migrate dev
5. Iniciar el servidor en modo desarrollo
bun run dev
La terminal confirmará que el servidor HTTP y WebSocket está escuchando en http://localhost:3000.

📡 Referencia de la API REST
Autenticación
POST /api/auth/register — Registro de nuevo usuario (nombre, email y contraseña cifrada).

POST /api/auth/login — Autenticación de credenciales y generación del token JWT.

Usuarios
GET /api/users — Listado de usuarios del sistema (requiere cabecera Authorization: Bearer <token>).

Conversaciones
POST /api/conversations — Creación de conversación directa o grupal asignando participantes.

GET /api/conversations — Listado de conversaciones donde participa el usuario autenticado.

Mensajes
POST /api/conversations/:id/messages — Envío y persistencia de un nuevo mensaje por HTTP.

GET /api/conversations/:id/messages — Consulta de historial de mensajes con soporte de paginación por cursor.

⚡ Comunicación en Tiempo Real con Socket.IO
Handshake y Autenticación
La conexión de Socket.IO valida el token JWT durante el handshake inicial mediante cualquiera de estos métodos:

Cabecera: Authorization: Bearer <token>

Objeto Auth: auth: { token: "<token>" }

Manejo de Salas (Rooms)
Sala de Usuario (user:<userId>): Cada usuario conectado se une a su propia sala para recibir actualizaciones generales.

Sala de Conversación (conversation:<conversationId>): Los miembros se suscriben para transmitir y recibir mensajes en vivo.

Eventos
conversation:join (Entrada): Valida la pertenencia del usuario a la conversación y lo une a la sala; responde con ack: { ok: true }.

conversation:leave (Entrada): Desuscribe el socket de la sala de conversación.

message:send (Entrada): Guarda el mensaje en base de datos vía Prisma y emite el broadcast; responde con ack: { ok: true, data: message }.

message:new (Salida): Transmite el nuevo mensaje a todos los clientes de la sala conversation:<conversationId>.

conversation:updated (Salida): Emite el último mensaje a las salas user:<memberId> de todos los integrantes.

🧪 Pruebas con Postman
Colección REST: El archivo JSON listo para importar se encuentra en:

backend/postman/Backup postman oidm.json

Pruebas Socket.IO: En Postman, crear una solicitud de tipo Socket.IO hacia http://localhost:3000, incluir el token JWT en las cabeceras (Authorization: Bearer <token>), registrar los listeners para message:new y conversation:updated, y emitir los eventos conversation:join y message:send.

# Around The U.S. — Full Stack

Aplicación web para compartir fotografías de lugares. Cada persona se registra, edita su perfil y gestiona sus propias tarjetas. Front end en React + TypeScript y API en Express + MongoDB, en un mismo repositorio. Proyecto del programa de desarrollo web de TripleTen.

## Despliegue

| Parte     | Dirección                                       |
| --------- | ----------------------------------------------- |
| Front end | https://web-project-around-full-js4h.vercel.app |
| API       | https://web-project-around-full-beta.vercel.app |

## Funcionalidades

- Registro e inicio de sesión con cuentas propias
- Sesión persistente: el token se guarda en `localStorage` y se valida al recargar
- Rutas protegidas: sin sesión todo lleva a `/signin`; con sesión, `/signin` y `/signup` llevan a `/`
- Edición de perfil y avatar
- Tarjetas propias: crear, eliminar (con confirmación), dar o quitar "me gusta"
- Cada persona solo ve y modifica sus tarjetas
- Vista ampliada de imágenes

## Tecnologías

**Front end (`client/`)**

- React 19, TypeScript y Vite
- React Router y Context API
- CSS con metodología BEM
- ESLint y Prettier

**Back end (`server/`)**

- Node.js, Express 5 y TypeScript estricto
- MongoDB (Atlas en producción) y Mongoose
- Contraseñas con hash (`bcrypt`) y sesiones con JWT de 7 días (`jsonwebtoken`)
- Middleware de autenticación en todas las rutas, salvo `/signup` y `/signin`
- Las respuestas nunca incluyen el hash; el correo solo se devuelve a su dueño
- Límite de peticiones por ruta (`express-rate-limit`)
- Manejo de errores centralizado en un solo middleware
- Configuración con variables de entorno (`dotenv`)

**Despliegue:** dos proyectos de Vercel desde este repositorio (Root Directory `server` y `client`) y base de datos en MongoDB Atlas.

## Cómo ejecutarlo

**Requisitos:** Node.js 20.19 o superior y MongoDB en ejecución en `mongodb://127.0.0.1:27017`.

1. Instala las dependencias:

   ```bash
   npm run install:all
   ```

2. Crea los archivos de entorno:

   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

3. Genera una clave y pégala como `JWT_SECRET` en `server/.env`:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"
   ```

4. En una terminal, levanta la API; en otra, la aplicación:

   ```bash
   npm run dev:server
   npm run dev:client
   ```

| Parte      | Dirección             |
| ---------- | --------------------- |
| API        | http://localhost:3001 |
| Aplicación | http://localhost:3000 |

Para empezar, regístrate en `/signup`. La cuenta nueva parte con el perfil "Jacques Cousteau / Explorador" y sin tarjetas.

### Variables de entorno

| Archivo       | Variable        | Uso                                                     |
| ------------- | --------------- | ------------------------------------------------------- |
| `server/.env` | `JWT_SECRET`    | Clave con la que se firman los tokens                   |
|               | `MONGO_URL`     | Cadena de conexión (incluye el nombre de la base)       |
|               | `PORT`          | Puerto de la API                                        |
|               | `CLIENT_ORIGIN` | Dirección del front end permitida por CORS              |
| `client/.env` | `VITE_API_URL`  | Dirección de la API (visible en el paquete del cliente) |

## Estructura

```
web_project_around_full/
├── client/               aplicación de React
│   ├── vercel.json       reescritura de rutas para recargas
│   └── src/
│       ├── components/   App, Header, Main, Card, Popup, Login, Register...
│       ├── contexts/     CurrentUserContext
│       ├── interfaces/   tipos de TypeScript
│       ├── utils/        api.ts (cuentas y tarjetas) y auth.ts (registro y login)
│       └── blocks/       estilos BEM
└── server/               API de Express
    └── src/
        ├── controllers/  lógica de cada ruta
        ├── models/       esquemas de Mongoose
        ├── routes/       rutas de usuarios y tarjetas
        ├── middleware/   autenticación, limitadores y errores
        └── utils/        errores HTTP
```

## API

Salvo `/health`, `/signup` y `/signin`, todas las rutas exigen el encabezado `Authorization: Bearer <token>`.

| Método | Ruta               | Qué hace                                                    |
| ------ | ------------------ | ----------------------------------------------------------- |
| GET    | `/health`          | Responde `{ "status": "ok" }`                               |
| POST   | `/signup`          | Registra una cuenta (`email` y `password` de 8+ caracteres) |
| POST   | `/signin`          | Devuelve `{ token, user }`                                  |
| GET    | `/users`           | Lista de usuarios (sin correo, salvo el propio)             |
| GET    | `/users/me`        | Devuelve el usuario actual                                  |
| GET    | `/users/:id`       | Devuelve un usuario por su `_id`                            |
| PATCH  | `/users/me`        | Actualiza `name` y `about`                                  |
| PATCH  | `/users/me/avatar` | Actualiza `avatar`                                          |
| GET    | `/cards`           | Tus tarjetas, de la más reciente a la más antigua           |
| POST   | `/cards`           | Crea una tarjeta (`name`, `link`)                           |
| DELETE | `/cards/:id`       | Elimina una tarjeta propia                                  |
| PUT    | `/cards/:id/likes` | Da "me gusta" a una tarjeta propia                          |
| DELETE | `/cards/:id/likes` | Quita el "me gusta"                                         |

### Códigos de error

Toda respuesta de error tiene la forma `{ "message": "..." }`.

| Código | Cuándo                                                                           |
| ------ | -------------------------------------------------------------------------------- |
| 400    | Faltan `email` o `password`, contraseña corta o datos que no pasan la validación |
| 401    | Token ausente, inválido o expirado; credenciales incorrectas                     |
| 403    | Se intenta modificar una tarjeta ajena                                           |
| 404    | El usuario, la tarjeta o la ruta no existen                                      |
| 409    | El correo ya está registrado                                                     |
| 429    | Se superó el límite de `/signin` (10 por 15 min) o `/signup` (10 por hora)       |
| 500    | Error del servidor                                                               |

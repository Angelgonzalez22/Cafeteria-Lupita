# Cafetería Lupita

## Requisitos

Instala Docker Desktop, .NET SDK 10, Node.js 22.13 o posterior de la rama 22 y Yarn Classic. Para ejecutar Android necesitas Android Studio con su SDK y un emulador abierto o un teléfono con depuración USB.

Los comandos siguientes se escriben en una terminal de PowerShell, comenzando en la carpeta principal del proyecto.

## 1. Configurar las variables

El primer comando que debes ejecutar desde la carpeta principal es:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ./scripts/Initialize-LocalEnv.ps1
```

El comando crea los `.env`, genera la clave JWT, las contraseñas de PostgreSQL y pgAdmin, y los PIN de 6 números de los usuarios de prueba. Si ya existen valores, los conserva y completa solamente los vacíos.

Abre `.env` para consultar los PIN generados. En una instalación nueva, el comando también deja `SEED_ENABLED=true` para crear los usuarios y productos al iniciar el backend:

| Usuario | Cédula | PIN guardado en `.env` |
| --- | --- | --- |
| Administración | `1-111-1111` | `SEED_PASSWORD_LUPITA` |
| Caja | `2-222-2222` | `SEED_PASSWORD_LUCIA` |
| Cocina | `3-333-3333` | `SEED_PASSWORD_ANGEL` |

El generador no modifica las contraseñas de usuarios que ya existen en la base de datos. La duración de sesión queda en `JWT_EXPIRATION_MINUTES=720` (12 horas); la app la renueva internamente antes de vencer cuando está activa y tiene conexión. Una sesión vencida o rechazada vuelve al login.

## 2. Levantar la base de datos en Docker

Abre Docker Desktop. Desde la carpeta principal ejecuta:

```powershell
docker compose up -d --wait postgres pgadmin
```

Esto descarga las imágenes y levanta PostgreSQL y pgAdmin. pgAdmin queda en http://localhost:5050.

## 3. Backend: instalar y aplicar las migraciones

En esa misma terminal, desde la carpeta principal, ejecuta:

```powershell
dotnet tool restore

$config = docker compose config --format json | ConvertFrom-Json
$env:ConnectionStrings__Postgres = $config.services.api.environment.ConnectionStrings__Postgres.Replace('Host=postgres;Port=5432;', 'Host=localhost;Port=5433;')

cd backend/Lupita.Api
dotnet restore
dotnet ef database update
cd ../..
```

Estos comandos toman la conexión del `.env` de Docker, instalan las dependencias del backend y crean o actualizan las tablas. Repite este paso cuando haya nuevas migraciones.

## 4. Backend: construir la imagen y ejecutarlo

Desde la carpeta principal ejecuta:

```powershell
docker compose up -d --build api
```

Este comando genera la imagen del backend y lo deja ejecutándose en Docker. También sirve para actualizarlo después de cambiar su código.

- API: http://localhost:8080/api
- Swagger: http://localhost:8080/swagger/index.html

Para ver sus mensajes en la terminal:

```powershell
docker compose logs -f api
```

## 5. Frontend: instalar y ejecutar

Abre otra terminal en la carpeta principal y entra a `frontend`:

```powershell
cd frontend
yarn install
```

Abre `frontend/.env` y configura `EXPO_PUBLIC_API_URL`:

| Cómo ejecutas la app | Dirección |
| --- | --- |
| Emulador Android | `http://10.0.2.2:8080/api` |
| Teléfono por Wi-Fi | `http://IP_DE_TU_PC:8080/api` |
| Teléfono por USB | `http://127.0.0.1:8080/api` |

Por Wi-Fi, el teléfono y la PC deben estar en la misma red. Reinicia el frontend si cambias el `.env`.

Para compilar, instalar y abrir la aplicación en Android, escribe dentro de `frontend`:

```powershell
yarn android
```

Si usas un teléfono por USB, utiliza este comando en su lugar:

```powershell
yarn android:usb
```

Cuando la aplicación ya esté instalada, en las siguientes sesiones basta con ejecutar:

```powershell
yarn start
```

Por USB, para volver a conectar Metro y la API sin recompilar:

```powershell
adb reverse tcp:8081 tcp:8081
yarn start:usb
```

Mantén abierta la terminal del frontend. Si PowerShell bloquea `yarn`, escribe `yarn.cmd` en los mismos comandos.

## 6. Detener la aplicación

Detén el frontend con `Ctrl + C`. Para detener los contenedores, abre una terminal en la carpeta principal y ejecuta:

```powershell
docker compose down
```

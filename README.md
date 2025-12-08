# HC Platform | Front

Portal web construido con Angular 17 + TailwindCSS para habilitar el login y las futuras vistas operativas de la plataforma de automatización.

## Stack principal

- Angular standalone + routing
- TailwindCSS con paleta personalizada (`night-*`)
- Lucide Icons para iconografía flexible
- PrimeNG (`p-table`) para el módulo de compañías
- RxJS + HttpClient para integración con la API (`/api/v1`)
- Interceptor HTTP que envía `Authorization: Bearer <token>` en las rutas protegidas
- Estado de autenticación con signals y guard de ruta para `/dashboard` y `/companies`

## Setup local

```bash
cd front
npm install
npm run start
```

El servidor de desarrollo levanta en `http://localhost:4200/` y utiliza la URL configurada en `src/environments/environment*.ts`.

## Estructura rápida

```
src/
 ├─ app/
 │   ├─ core/                # AuthService, CompanyService, guards, modelos
 │   ├─ features/auth/       # login page (standalone component)
 │   ├─ features/dashboard/  # dashboard con shell responsivo
 │   ├─ features/companies/  # formulario + tabla PrimeNG para compañías
 │   ├─ app.routes.ts        # rutas principales listas para crecer
 │   └─ app.component.*      # bootstrap + router outlet principal
 ├─ environments/            # configuración API por ambiente
 ├─ styles.scss              # Tailwind layers + tokens
 └─ main.ts                  # bootstrap + modo prod
```

## Tailwind & diseño

- `tailwind.config.js` incluye la escala `night-*`, tipografías y sombras personalizadas.
- `@tailwindcss/forms` mantiene inputs coherentes con el tema.
- Clases utilitarias como `.glass-card`, `.btn-primary`, `.card-secondary`, etc., viven en `src/styles.scss`.

## Autenticación rápida

- `AuthStateService` (`src/app/core/state/auth-state.service.ts`) persiste el `sessionToken` y expone `isAuthenticated`.
- `authGuard` (`src/app/core/guards/auth.guard.ts`) protege las rutas bajo `/app`.
- El shell autenticado (`features/shell`) muestra el menú lateral y expone el botón para cerrar sesión.

## Variables de entorno del front

- `src/environments/environment.development.ts`: usa `http://localhost:4000/api/v1`.
- `src/environments/environment.ts`: también apunta a `http://localhost:4000/api/v1`, pensado para trabajar junto al stack Docker (ajusta antes de un despliegue productivo).

## Docker

Se provee un `Dockerfile` (Angular + NGINX) y un `docker-compose.yml` en la raíz que construyen API y front.

1. Copia `api/.env.example` a `api/.env` y edita las credenciales (`DATABASE_URL`).
2. Desde la raíz del repo:

```bash
docker compose build
docker compose up
```

Servicios expuestos:

- Frontend → `http://localhost:8080`
- API → `http://localhost:4000`

## Próximos pasos sugeridos

1. Mover el manejo del token a un `AuthStore` para compartirlo entre más módulos.
2. Sustituir el guard genérico por validación real de tokens (JWT, cookies, etc.).
3. Extender Tailwind con componentes reutilizables (cards, tablas, timelines) para mantener coherencia visual.
4. Aprovechar las capacidades de PrimeNG (`sorting`, `paginator`, export) para enriquecer la tabla de compañías.

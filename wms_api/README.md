# Workshop Registration API

NestJS REST API backed by MySQL. Route paths use `/api` and have no version segment. Interactive OpenAPI documentation is available at `/api/docs`.

See [API.md](./API.md) for the endpoint reference and frontend integration architecture.

## Setup

Create a MySQL database named `wms_db`, copy `.env.example` to `.env`, and replace the JWT secret and bootstrap-admin credentials with private values. The admin is created on startup only when both `ADMIN_EMAIL` and `ADMIN_PASSWORD` are configured; the password must contain at least 12 characters. Existing accounts are not overwritten.

```powershell
npm install
npm run start:dev
```

`DB_SYNCHRONIZE=true` creates and updates tables automatically and is intended for local development. Set it to `false` in production and use reviewed database migrations. Never commit `.env`.

## Authentication and access

Send `Authorization: Bearer <accessToken>` for protected routes. Tokens expire after eight hours. Roles are `admin`, `manager`, and `staff`.

| Role | Permissions |
| --- | --- |
| Admin | Manage user accounts and view audit logs |
| Manager | Manage workshops, registrations, and view audit logs |
| Staff | View workshops and manage registrations |

## Auth

### `POST /api/auth/login`

Request:

```json
{ "email": "admin@example.com", "password": "your-private-password" }
```

Response `200`:

```json
{
  "accessToken": "jwt",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "fullName": "System Administrator",
    "role": "admin",
    "isActive": true,
    "createdAt": "2026-10-09T12:00:00.000Z"
  }
}
```

### `GET /api/auth/me`

Authenticated. Response `200`: `{ "id": 1, "email": "admin@example.com", "fullName": "System Administrator", "role": "admin" }`.

## Users

All user routes require the `admin` role.

| Method and path | Request body | Response |
| --- | --- | --- |
| `POST /api/users` | `{ "email": "staff@example.com", "fullName": "Jordan Lee", "password": "SecurePassword123!", "role": "staff" }` | `201` user object |
| `GET /api/users` | None | `200` array of user objects |
| `GET /api/users/:id` | None | `200` user object |
| `PATCH /api/users/:id/role` | `{ "role": "manager" }` | `200` updated user object |
| `PATCH /api/users/:id/status` | `{ "isActive": false }` | `200` updated user object |

User object: `{ "id": 2, "email": "staff@example.com", "fullName": "Jordan Lee", "role": "staff", "isActive": true, "createdAt": "2026-10-09T12:00:00.000Z" }`. Password hashes are never returned.

## Workshops

`GET` routes require `manager` or `staff`. Create, update, and cancel routes require `manager`.

| Method and path | Request body | Response |
| --- | --- | --- |
| `POST /api/workshops` | `{ "code": "POT-101", "title": "Introduction to Pottery", "instructor": "Morgan Chen", "startAt": "2026-11-15T09:00:00.000Z", "location": "Room 204", "capacity": 20 }` | `201` workshop object |
| `GET /api/workshops` | None | `200` array of workshop objects |
| `GET /api/workshops/:id` | None | `200` workshop object |
| `PATCH /api/workshops/:id` | Any subset of the create fields | `200` updated workshop object |
| `PATCH /api/workshops/:id/cancel` | None | `200` cancelled workshop object |

Workshop object: `{ "id": 3, "code": "POT-101", "title": "Introduction to Pottery", "instructor": "Morgan Chen", "startAt": "2026-11-15T09:00:00.000Z", "location": "Room 204", "capacity": 20, "activeCount": 12, "seatsAvailable": 8, "status": "scheduled", "createdBy": 1, "createdAt": "2026-10-09T12:00:00.000Z" }`.

Optional list filters: `from`, `to`, `status` (`scheduled`, `cancelled`, `completed`), `hasSeats` (`true` or `false`), and `search` (code, title, instructor), for example `/api/workshops?from=2026-10-12&to=2026-10-18&status=scheduled&hasSeats=true`.

## Registrations

All routes require `manager` or `staff`.

| Method and path | Request body | Response |
| --- | --- | --- |
| `POST /api/registrations` | `{ "workshopId": 3, "attendeeName": "Taylor Rivera", "attendeeEmail": "taylor@example.com" }` | `201` registration object |
| `PATCH /api/registrations/:id/cancel` | None | `200` cancelled registration object |
| `GET /api/registrations/workshop/:workshopId` | None | `200` registration history array |

Registration object: `{ "id": 12, "workshopId": 3, "attendeeName": "Taylor Rivera", "attendeeEmail": "taylor@example.com", "status": "active", "registeredBy": 2, "registeredAt": "2026-10-09T12:00:00.000Z", "cancelledBy": null, "cancelledAt": null }`. Add `?status=active` or `?status=cancelled` to filter the history.

Capacity is checked while holding a MySQL row lock in a transaction. Duplicate active attendee registrations are rejected with `409`; cancellations retain history and release the seat.

## Audit logs

`GET /api/audit-logs` requires `admin` or `manager`. Optional filters: `entityType`, `userId`, `from`, and `to`. The response is an array of `{ "id": 1, "actorId": 2, "entityType": "workshop", "entityId": 3, "action": "updated", "details": {}, "createdAt": "2026-10-09T12:00:00.000Z" }` records, capped at 500 results.

## API errors and documentation

Validation errors return `400`; missing or invalid authentication returns `401`; insufficient role returns `403`; missing records return `404`; duplicate, full, or otherwise conflicting operations return `409`. Swagger documents request DTOs, response shapes, bearer authentication, and endpoint roles at `/api/docs`.

# Teacher-Student Administration API

REST API for teacher-student administration using Node.js, TypeScript, Express, TypeORM, MySQL, Zod, and Jest.

## Hosted API

- Base URL: `https://gdsassessement-production.up.railway.app/`
- Health check: `GET https://gdsassessement-production.up.railway.app/health`

## Tech Stack

- Node.js + TypeScript (strict mode)
- Express.js
- MySQL 8 + TypeORM (`mysql2`)
- Zod (request validation)
- Jest + ts-jest (unit tests)
- Docker Compose (local MySQL / full stack)

## Project Structure

```text
src/
  controllers/
  services/
  repositories/
  entities/
  routes/
  config/
  middleware/
  schemas/
  types/
  utils/
migrations/
scripts/seed/
tests/services/
```

## Prerequisites

- Node.js 18+
- Docker + Docker Compose

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default values:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=app_user
DB_PASSWORD=app_password
DB_NAME=application
PORT=3000
```

## Run Locally

1. Start MySQL only (dev database in Docker):

```bash
docker compose -f docker-compose.dev.yml up -d
```

2. Install dependencies:

```bash
npm install
```

3. Run migrations:

```bash
npm run migration:run
```

4. (Optional) Seed sample data:

```bash
npm run seed:run
```

5. Start API (hot-reload):

```bash
npm run dev
```

Base URL: `http://localhost:3000`
Health check: `GET http://localhost:3000/health`

## Run With Docker (App + MySQL)

Use full stack compose file (`app` + `mysql`):

```bash
docker compose -f docker-compose.yml up --build
```

Run in background:

```bash
docker compose -f docker-compose.yml up -d --build
```

Stop:

```bash
docker compose -f docker-compose.yml down
```

## Scripts

```bash
npm run build
npm start
npm test
npm run dev
npm run lint
npm run format:check
```

## Migration Commands (TypeORM CLI)

Create empty migration:

```bash
npm run migration:create -- migrations/<MigrationName>
```

Generate migration from entity changes:

```bash
npm run migration:generate -- migrations/<MigrationName>
```

Run pending migrations:

```bash
npm run migration:run
```

Revert latest migration:

```bash
npm run migration:revert
```

## API Endpoints

### 1) Register students

- Method: `POST`
- Path: `/api/register`
- Body:

```json
{
  "teacher": "teacherken@gmail.com",
  "students": ["studentjon@gmail.com", "studenthon@gmail.com"]
}
```

- Success: `204 No Content`

### 2) Retrieve common students

- Method: `GET`
- Path: `/api/commonstudents`
- Query:
  - `/api/commonstudents?teacher=teacherken%40gmail.com`
  - `/api/commonstudents?teacher=teacherken%40gmail.com&teacher=teacherjoe%40gmail.com`
- Success: `200 OK`

```json
{
  "students": ["commonstudent1@gmail.com", "commonstudent2@gmail.com"]
}
```

### 3) Suspend a student

- Method: `POST`
- Path: `/api/suspend`
- Body:

```json
{
  "student": "studentmary@gmail.com"
}
```

- Success: `204 No Content`

### 4) Retrieve recipients for notification

- Method: `POST`
- Path: `/api/retrievefornotifications`
- Body:

```json
{
  "teacher": "teacherken@gmail.com",
  "notification": "Hello students! @studentagnes@gmail.com @studentmiche@gmail.com"
}
```

- Success: `200 OK`

```json
{
  "recipients": ["studentbob@gmail.com", "studentagnes@gmail.com", "studentmiche@gmail.com"]
}
```

## Error Response Format

All errors return JSON:

```json
{ "message": "Meaningful error message" }
```

Examples:

- `400` validation error
- `404` student not found (suspend)
- `500` unexpected error

## Test With cURL

Set base URL:

```bash
BASE_URL="http://localhost:3000"
```

### 1) Register students

```bash
curl -i -X POST "$BASE_URL/api/register" \
  -H "Content-Type: application/json" \
  -d '{
    "teacher": "teacherken@gmail.com",
    "students": [
      "studentjon@gmail.com",
      "studenthon@gmail.com"
    ]
  }'
```

Expected: `HTTP/1.1 204 No Content`

### 2) Retrieve common students

Single teacher:

```bash
curl -i "$BASE_URL/api/commonstudents?teacher=teacherken%40gmail.com"
```

Multiple teachers:

```bash
curl -i "$BASE_URL/api/commonstudents?teacher=teacherken%40gmail.com&teacher=teacherjoe%40gmail.com"
```

Expected body shape:

```json
{
  "students": ["student1@gmail.com", "student2@gmail.com"]
}
```

### 3) Suspend a student

```bash
curl -i -X POST "$BASE_URL/api/suspend" \
  -H "Content-Type: application/json" \
  -d '{
    "student": "studentmary@gmail.com"
  }'
```

Expected: `HTTP/1.1 204 No Content`

Not found example:

```bash
curl -i -X POST "$BASE_URL/api/suspend" \
  -H "Content-Type: application/json" \
  -d '{
    "student": "missingstudent@gmail.com"
  }'
```

Expected:

```json
{ "message": "Student not found" }
```

### 4) Retrieve recipients for notification

With mentions:

```bash
curl -i -X POST "$BASE_URL/api/retrievefornotifications" \
  -H "Content-Type: application/json" \
  -d '{
    "teacher": "teacherken@gmail.com",
    "notification": "Hello students! @studentagnes@gmail.com @studentmiche@gmail.com"
  }'
```

Without mentions:

```bash
curl -i -X POST "$BASE_URL/api/retrievefornotifications" \
  -H "Content-Type: application/json" \
  -d '{
    "teacher": "teacherken@gmail.com",
    "notification": "Hey everybody"
  }'
```

Expected body shape:

```json
{
  "recipients": ["studentbob@gmail.com", "studentagnes@gmail.com"]
}
```

### Validation error example

```bash
curl -i -X POST "$BASE_URL/api/register" \
  -H "Content-Type: application/json" \
  -d '{
    "teacher": "invalid-email",
    "students": []
  }'
```

Expected status: `400` with:

```json
{ "message": "..." }
```

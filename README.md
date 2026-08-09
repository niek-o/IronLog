# IronLog — Gym Workout Tracker

A full-stack fitness tracker: log workouts, build reusable routine templates,
track body measurements, and see progress charts over time.

**Stack**
- Frontend: Angular 19 (standalone components, signals, Chart.js)
- Backend: .NET 10 minimal APIs, EF Core, JWT auth
- Database: PostgreSQL 17
- Everything runs in Docker via `docker compose`

---

## Project layout

```
fitness-tracker/
├── docker-compose.yml
├── .env.example
├── backend/FitnessTracker.Api/     # .NET 10 minimal API
└── frontend/                       # Angular 19 app
```

---

## 1. One-time setup: generate the EF Core migration

The API applies migrations automatically on startup (`db.Database.Migrate()`
in `Program.cs`), but the **initial migration files** need to be generated
once and committed to the repo — they weren't generated as part of this
scaffold because it was built without a .NET SDK / NuGet access.

From a machine with the .NET 10 SDK installed:

```bash
cd backend/FitnessTracker.Api
dotnet tool install --global dotnet-ef   # if you don't already have it
dotnet restore
dotnet ef migrations add InitialCreate -o Migrations
```

This creates `Migrations/*_InitialCreate.cs` and the model snapshot. Commit
those files. After that, `docker compose up` will build the database schema
automatically on every fresh container.

> If you change any model in `backend/FitnessTracker.Api/Models/`, generate
> a follow-up migration the same way:
> `dotnet ef migrations add <DescriptiveName>`

---

## 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set a real `JWT_KEY` before deploying anywhere beyond your
laptop (e.g. `openssl rand -base64 48`). The defaults are fine for local dev.

---

## 3. Run everything

```bash
docker compose up --build
```

This starts three containers:

| Service  | URL                          | Notes                                   |
|----------|-------------------------------|------------------------------------------|
| frontend | http://localhost:8081         | Angular app served by nginx              |
| backend  | http://localhost:5000         | API + Swagger UI at `/swagger`           |
| db       | localhost:5432                | PostgreSQL (also usable by a local client) |

Open **http://localhost:8081**, register an account, and start logging.

The nginx container proxies `/api/*` requests through to the backend
container, so the Angular app always calls a same-origin `/api/...` path —
no CORS issues in production, and it also works if you serve everything
behind a single reverse proxy or domain later.

---

## 3b. Production deployment (Traefik)

Deploys behind the existing Traefik instance on the server, routing
`https://ironlog.niek.io` to the app. Use `docker-compose.prod.yml` instead
of the base compose file. It:

- Drops all published host ports (`5432`, `5000`, `8081`) — only Traefik
  reaches the app, over the external `traefik` Docker network.
- Adds Traefik router/TLS labels to the frontend container
  (`cloudflare` certresolver, matching the other apps on this host).
- Refuses to start unless `POSTGRES_PASSWORD` and `JWT_KEY` are set to real
  values in `.env` — no silent fallback to dev defaults.
- Keeps Swagger off by default (`ENABLE_SWAGGER=false`).

Set these in `.env` (see `.env.example`):

```
POSTGRES_PASSWORD=<a real password>
JWT_KEY=<openssl rand -base64 48>
```

Deploy:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 4. Local development (without Docker)

**Backend**
```bash
cd backend/FitnessTracker.Api
dotnet run
# API on http://localhost:5000, Swagger at /swagger
```
Set `ConnectionStrings:Default` in `appsettings.Development.json` (or the
`CONNECTION_STRING` env var) to point at a local or Dockerized Postgres
instance, e.g.:
```
Host=localhost;Database=fitnesstracker;Username=postgres;Password=postgres
```
You can start just the database with `docker compose up db`.

**Frontend**
```bash
cd frontend
npm install
npm start
# Dev server on http://localhost:4200
```
The Angular dev server calls `/api/...` too. Either run behind a proxy, or
temporarily point `API_BASE` in
`frontend/src/app/core/services/api-base.ts` at
`http://localhost:5000/api` while developing without nginx.

---

## Feature overview

- **Auth** — email/password registration and login, JWT bearer tokens, all
  API endpoints (besides `/auth/*` and `/health`) require a valid token.
- **Exercise library** — a seeded set of common lifts (bench press, squat,
  deadlift, overhead press, pull-up, rows, curls, leg press, plank,
  treadmill run, lunges) available to every user, plus the ability for each
  user to add their own custom exercises.
- **Workout templates** — save a named routine (e.g. "Push day") with target
  sets/reps/weight per exercise, then launch a pre-filled workout session
  from it in one click.
- **Workout logging** — start a session, add sets as you go (exercise, reps,
  weight, optional RPE), mark it complete when done.
- **Progress charts** — per-exercise trend of max weight and an estimated
  one-rep max (Epley formula) across your logged sessions.
- **Body metrics** — track weight, body fat %, and circumference
  measurements (chest, waist, hips, arms, thighs) over time.
- **Dashboard** — total workouts, workouts this week, this week's training
  volume, current day streak, an 8-week volume chart, and your latest body
  metrics.

## API reference

With the backend running, open **http://localhost:5000/swagger** for the
full interactive API reference (all request/response shapes, try-it-out).

## Data model notes

- `Exercise.UserId` is nullable: `null` means a global exercise available to
  everyone; a value means a custom exercise owned by that user (only its
  owner can edit/delete it).
- Deleting a `WorkoutTemplate` or `WorkoutSession` cascades to its child
  rows (`TemplateExercise` / `WorkoutSet`). Deleting an `Exercise` is
  restricted if it's referenced by any template or logged set — remove
  those first.
- All weights are stored in kilograms (`decimal(6,2)`); the frontend forms
  currently assume kg throughout.

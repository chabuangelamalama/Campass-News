# The Campus Line

A rebuild of my campus blog as a real full-stack app:

- **Backend:** Python (FastAPI) + **PostgreSQL**, with signup/login, hashed
  passwords, JWT tokens, and three user roles (`student`, `editor`, `admin`).
- **Frontend:** React + Tailwind CSS (Vite).
- **Stories:** editors/admins publish stories; anyone can read; logged-in
  users can comment.
- **Tea wall:** anyone can post anonymously (logged in or not). The public
  site NEVER shows who posted — not even in the raw API response. Only admins
  have a separate `/tea/admin` view that reveals the poster (or
  "Unregistered visitor" if they weren't logged in).

## 1. Get Postgres running

Easiest path — Docker:

```bash
cd backend
docker compose up -d
```

This starts Postgres on `localhost:5432` with a `campusnews` database, user,
and password all set to `campusnews`, matching `.env.example` below.

No Docker? Install Postgres locally and create matching credentials:

```sql
CREATE USER campusnews WITH PASSWORD 'campusnews';
CREATE DATABASE campusnews OWNER campusnews;
```

## 2. Run the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        
pip install -r requirements.txt
cp .env.example .env            
uvicorn app.main:app --reload --port 8000
```

Tables are created automatically on first run (no separate migration step
yet — see "Next steps" below). It also auto-creates an admin account:

```
username: admin
password: ChangeMe123!
```

**Log in and change this immediately.** There's no "change password" screen
yet — for now, sign up a new account, promote it to `admin` from the Admin →
Users tab, then remove or change the seed admin's password directly in the
database.

Optional demo content:

```bash
python seed.py
```

The API docs are auto-generated at `http://127.0.0.1:8000/docs`.

## 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://127.0.0.1:5173`. It talks to the backend at
`http://127.0.0.1:8000` by default — change this with a `frontend/.env`:

```
VITE_API_URL=http://127.0.0.1:8000
```

## Backend project layout

The API is organized by resource rather than one giant file, so each piece
is easy to find:

```
backend/
  app/
    main.py              # creates the app, includes routers, CORS, admin bootstrap
    database.py           # SQLAlchemy engine/session setup
    core/
      security.py         # password hashing, JWT, role-based auth dependencies
    models/                # one file per database table
      user.py
      story.py
      comment.py
      gossip.py
    schemas/               # one file per resource's request/response shapes
      auth.py
      user.py
      story.py
      comment.py
      gossip.py
    routers/               # one file per resource's endpoints
      auth.py
      stories.py
      comments.py
      gossip.py
      users.py
  seed.py
  requirements.txt
  docker-compose.yml
```

If you need to change how stories work, everything relevant is in
`models/story.py`, `schemas/story.py`, and `routers/stories.py` — no need to
scroll through unrelated gossip or auth code to find it. See `SECURITY.md`
for what `core/security.py` actually guarantees and what it doesn't.

## Roles

| Role    | Can do |
|---------|--------|
| student | Read stories, comment, post gossip |
| editor  | Everything a student can, plus create/edit/delete stories |
| admin   | Everything an editor can, plus manage user roles and see who posted each gossip entry |

Promote a user to `editor` or `admin` from **Admin → Users & roles** (you'll
need an existing admin account to get there — that's what the seeded
`admin` account is for).

## How the anonymity actually works

Every tea post records who submitted it (or `null` if they weren't logged
in) in the database, purely so admins can moderate abuse. The public API
route (`GET /gossip`) and the schema it uses to serialize posts **structurally
exclude** that field — it's not just hidden in the UI, it's never sent over
the wire to non-admins. Only `GET /tea/admin`, which requires an admin
token, includes it.

## Security

See **[SECURITY.md](./SECURITY.md)** for the full picture: how passwords,
JWTs, and roles are actually implemented, exactly how the gossip anonymity
guarantee is enforced, and what's deliberately out of scope for now (rate
limiting, email verification, migrations). At minimum before you deploy
anywhere:

- Change `CAMPUSNEWS_SECRET_KEY` (used to sign JWTs) in `.env` — don't ship
  the default.
- Change or remove the seed admin password immediately.
- Restrict CORS (`allow_origins` in `backend/app/main.py`) to your real
  frontend domain.

## Next steps worth doing

- Add Alembic for real schema migrations instead of `create_all()` — fine
  for a class project, not for production once you have live data.
- Add a "change password" flow and email verification.
- Add rate limiting to `/gossip` and `/auth/*` so nobody can spam either.

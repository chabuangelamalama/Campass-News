from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.rate_limit import limiter


from app import models
from app.core.security import hash_password
from app.database import Base, SessionLocal, engine
from app.routers import auth, comments, stories, users, tea, reactions, notifications,yearbook
from app.core.security_headers import SecurityHeadersMiddleware


Base.metadata.create_all(bind=engine)

app = FastAPI(title="CampassNews API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_origin_regex=r"https://campass-news.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(SecurityHeadersMiddleware)


app.include_router(auth.router)
app.include_router(stories.router)
app.include_router(comments.router)
app.include_router(tea.router)
app.include_router(users.router)
app.include_router(reactions.router)
app.include_router(notifications.router)
app.include_router(yearbook.router)




def _bootstrap_admin():
    """Create a default admin account on first run so someone can log in."""
    db = SessionLocal()
    try:
        exists = db.query(models.User).filter(models.User.role == "admin").first()
        if not exists:
            admin = models.User(
                username="admin",
                email="admin@campusnews.example",
                hashed_password=hash_password("ChangeMe123!"),
                role=models.RoleEnum.admin,
            )
            db.add(admin)
            db.commit()
            print(
                "Created default admin -> username: admin / password: ChangeMe123! "
                "(change this immediately — see SECURITY.md)"
            )
    finally:
        db.close()


_bootstrap_admin()


@app.get("/")
def root():
    return {"status": "ok", "service": "CampassNews API"}
"""Run with: python seed.py
Adds a few demo stories so the feed isn't empty on first run.
"""
from app.database import SessionLocal
from app import models

db = SessionLocal()

admin = db.query(models.User).filter(models.User.role == "admin").first()
if not admin:
    print("No admin found yet — start the server once first (it auto-creates one).")
else:
    if db.query(models.Story).count() == 0:
        demo = [
            dict(
                title="Annual School Trip Announced!",
                category="Announcement",
                summary="Educational trips are back on the calendar for this term.",
                body="Our students shall partake in a lot of educational trips to allow "
                "them to see firsthand how the real world works. Sign-up sheets go up "
                "in the main hall on Monday.",
                image_url="",
                featured=True,
            ),
            dict(
                title="Table Tennis Tournament This Friday",
                category="Sports",
                summary="Students are thrilled for the event.",
                body="In preparation for the Table Tennis tournament, students have "
                "been practicing every lunch break. Sign up at the sports desk.",
                image_url="",
                featured=False,
            ),
            dict(
                title="Culture Day Was a Hit",
                category="Arts",
                summary="Students shared a piece of their culture with everyone.",
                body="Culture Day gave students a chance to share a part of their "
                "cultures and traditions with the whole school, from food to dance "
                "to dress.",
                image_url="",
                featured=False,
            ),
        ]
        for d in demo:
            db.add(models.Story(**d, author_id=admin.id))
        db.commit()
        print(f"Seeded {len(demo)} stories.")
    else:
        print("Stories already exist — skipping seed.")

db.close()
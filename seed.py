from backend.database import SessionLocal, engine
from backend import models
from backend.services.interaction_service import interaction_service

# Ensure tables exist
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    print("Seeding database with critical interactions...")
    interaction_service.seed_db(db)
    print("Seed complete.")
finally:
    db.close()

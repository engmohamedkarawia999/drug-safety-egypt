from backend.services.interaction_generator import interaction_generator
from backend.database import SessionLocal, engine
from backend import models

models.Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    print("Starting smart interaction generation...")
    count = interaction_generator.generate_and_save(db)
    print(f"Success! Generated and injected {count} new scientific interactions into the Core Database.")
finally:
    db.close()

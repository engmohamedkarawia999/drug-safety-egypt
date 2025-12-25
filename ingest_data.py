from backend.services.ingestion_service import ingestion_service
from backend import models, database
import os

# Ensure DB created
models.Base.metadata.create_all(bind=database.engine)


# Ingest Interactions
interactions_path = os.path.join(os.path.dirname(__file__), "data", "interactions.csv")
if os.path.exists(interactions_path):
    print(f"Ingesting interactions from {interactions_path}...")
    count = ingestion_service.ingest_csv(interactions_path)
    print(f"Successfully ingested {count} new interactions.")

# Ingest Egyptian Drugs
egyptian_path = os.path.join(os.path.dirname(__file__), "data", "egyptian_drugs.csv")
if os.path.exists(egyptian_path):
    print(f"Ingesting Egyptian drugs from {egyptian_path}...")
    count = ingestion_service.ingest_egyptian_drugs(egyptian_path)
    print(f"Successfully ingested {count} new Egyptian drugs.")

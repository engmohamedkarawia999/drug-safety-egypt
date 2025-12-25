from backend.services.ingestion_service import ingestion_service
from backend import models, database
import os

# Ensure DB created
models.Base.metadata.create_all(bind=database.engine)

file_path = os.path.join(os.path.dirname(__file__), "data", "interactions.csv")

if os.path.exists(file_path):
    print(f"Ingesting data from {file_path}...")
    count = ingestion_service.ingest_csv(file_path)
    print(f"Successfully ingested {count} new interactions.")
else:
    print(f"File not found: {file_path}")

import csv
from sqlalchemy.orm import Session
from ..models import Interaction
from ..database import SessionLocal, engine

class IngestionService:
    def ingest_csv(self, file_path: str):
        """
        Ingest interactions from a CSV file into the database.
        CSV Format: drug_1_rxcui,drug_2_rxcui,severity,description,source
        """
        db = SessionLocal()
        try:
            count = 0
            with open(file_path, mode='r', encoding='utf-8') as f:
                # Filter out comment lines
                lines = [line for line in f if not line.strip().startswith('#')]
                reader = csv.DictReader(lines)
                for row in reader:
                    # Skip empty rows
                    if not row.get('drug_1_rxcui') or not row.get('drug_2_rxcui'):
                        continue
                    
                    # Check duplicates (simple check)
                    exists = db.query(Interaction).filter(
                        Interaction.drug_1_rxcui == row['drug_1_rxcui'],
                        Interaction.drug_2_rxcui == row['drug_2_rxcui']
                    ).first()
                    
                    if not exists:
                        interaction = Interaction(
                            drug_1_rxcui=row['drug_1_rxcui'],
                            drug_2_rxcui=row['drug_2_rxcui'],
                            severity=row['severity'],
                            description=row['description'],
                            source=row['source']
                        )
                        db.add(interaction)
                        count += 1
            
            db.commit()
            return count
        except Exception as e:
            db.rollback()
            print(f"Error ingesting data: {e}")
            return 0
        finally:
            db.close()

ingestion_service = IngestionService()

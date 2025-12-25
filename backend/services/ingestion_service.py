import csv
from sqlalchemy.orm import Session
from ..models import Interaction, EgyptianDrug
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


    def ingest_egyptian_drugs(self, file_path: str):
        """
        Ingest Egyptian drugs from a CSV file into the database.
        """
        db = SessionLocal()
        try:
            count = 0
            with open(file_path, mode='r', encoding='utf-8') as f:
                # Filter out comment lines and skip header
                lines = [line for line in f if not line.strip().startswith('#')]
                reader = csv.DictReader(lines)
                for row in reader:
                    # Skip empty/invalid rows
                    if not row.get('trade_name_en') or not row.get('trade_name_ar'):
                        continue
                    
                    # Check if already exists (by trade name and generic name)
                    exists = db.query(EgyptianDrug).filter(
                        EgyptianDrug.trade_name_en == row['trade_name_en'],
                        EgyptianDrug.generic_name == row['generic_name']
                    ).first()
                    
                    if not exists:
                        drug = EgyptianDrug(
                            trade_name_en=row['trade_name_en'],
                            trade_name_ar=row['trade_name_ar'],
                            generic_name=row['generic_name'],
                            manufacturer=row.get('manufacturer'),
                            category=row.get('category'),
                            forms=row.get('forms'),
                            strengths=row.get('strengths'),
                            adult_dose=row.get('adult_dose'),
                            child_dose=row.get('child_dose'),
                            price_egp=row.get('price_egp')
                        )
                        db.add(drug)
                        count += 1
            
            db.commit()
            return count
        except Exception as e:
            db.rollback()
            print(f"Error ingesting Egyptian drugs: {e}")
            return 0
        finally:
            db.close()

ingestion_service = IngestionService()

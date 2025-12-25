from sqlalchemy import Column, Integer, String, Text, Index
from .database import Base

class Drug(Base):
    __tablename__ = "drugs"
    
    id = Column(Integer, primary_key=True, index=True)
    rxcui = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False, index=True)  # Index for faster name searches
    synonyms = Column(Text)

class Interaction(Base):
    __tablename__ = "interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    drug_1_rxcui = Column(String, nullable=False)
    drug_2_rxcui = Column(String, nullable=False)
    description = Column(Text)
    severity = Column(String)
    source = Column(String, default="local")
    
    # Composite index for faster interaction lookups
    __table_args__ = (
        Index('idx_drug_interaction', 'drug_1_rxcui', 'drug_2_rxcui'),
        Index('idx_severity', 'severity'),  # Index for filtering by severity
    )

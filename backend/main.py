from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, database
from .services.rxnav_service import rxnav_service
from .services.interaction_service import interaction_service

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Drug Interaction Safety API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Drug Interaction Safety API is running"}

@app.get("/api/search_drug")
def search_drug(name: str):
    return rxnav_service.search_drug(name)

from .services.food_interaction_service import food_interaction_service
from .services.condition_service import condition_interaction_service
from .services.explanation_service import explanation_service
from pydantic import BaseModel
from typing import List, Optional

class CheckRequest(BaseModel):
    rxcuis: List[str]
    conditions: Optional[List[str]] = []

class ExplainRequest(BaseModel):
    drug1: str
    drug2: str
    severity: str

@app.post("/api/explain")
def explain_interaction(request: ExplainRequest):
    return explanation_service.explain(request.drug1, request.drug2, request.severity)

@app.post("/api/check_interactions")
def check_interactions(request: CheckRequest, db: Session = Depends(database.get_db)):
    rxcuis = request.rxcuis
    conditions = request.conditions
    
    # 1. Check Drug-Drug Interactions
    drug_interactions_response = interaction_service.check_interactions(rxcuis, db)
    
    # 2. Resolve Drug Names for Additional Checks
    drug_names = []
    for rxcui in rxcuis:
        name = rxnav_service.get_name(rxcui)
        if name:
            drug_names.append(name)
            
    # 3. Check Food Interactions
    food_interactions = food_interaction_service.check_food_interactions(drug_names)
    
    # 4. Check Health Condition Interactions
    condition_interactions = condition_interaction_service.check_condition_interactions(drug_names, conditions)
    
    # Merge responses
    response = drug_interactions_response
    response["food_interactions"] = food_interactions
    response["condition_interactions"] = condition_interactions
    return response

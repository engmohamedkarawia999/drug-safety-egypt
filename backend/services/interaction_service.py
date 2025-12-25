from sqlalchemy.orm import Session
from ..models import Interaction, Drug

from .openfda_service import openfda_service
from .rxnav_service import rxnav_service

class InteractionService:
    def check_interactions(self, rxcui_list: list[str], db: Session):
        """
        Check for interactions between any pair of drugs in the list.
        """
        interactions_found = []
        
        # Simple O(N^2) check for now, sufficient for small lists
        for i in range(len(rxcui_list)):
            for j in range(i + 1, len(rxcui_list)):
                id1 = rxcui_list[i]
                id2 = rxcui_list[j]
                
                # 1. Check Local DB
                local_results = []
                interaction = db.query(Interaction).filter(
                    ((Interaction.drug_1_rxcui == id1) & (Interaction.drug_2_rxcui == id2)) |
                    ((Interaction.drug_1_rxcui == id2) & (Interaction.drug_2_rxcui == id1))
                ).first()
                
                if interaction:
                    local_results.append({
                        "severity": interaction.severity,
                        "description": interaction.description,
                        "color": self._get_color(interaction.severity),
                        "source": "Local DB"
                    })

                # 2. Check OpenFDA (Always check for verification)
                fda_results = []
                name1 = rxnav_service.get_name(id1)
                name2 = rxnav_service.get_name(id2)
                
                # Even if names fail, we can now try with just IDs if OpenFDA supports it (implemented in service)
                # But our current service logic relies on names being present for the initial part of query, 
                # actually I made them optional in query construction (drug1_rxcui: str = None), 
                # but the method signature still requires name str. 
                # Let's pass what we have.
                
                if name1 and name2:
                    # Pass both names and IDs for maximum accuracy
                    fda_result = openfda_service.get_adverse_events(name1, name2, id1, id2)
                    
                    if fda_result.get('found') and fda_result.get('risk_score', 0) > 10:
                        fda_results.append({
                            "severity": "Potential Risk",
                            "description": f"OpenFDA reports: {', '.join([r['term'] for r in fda_result['top_reactions'][:3]])}",
                            "color": "yellow",
                            "source": "OpenFDA (Live)"
                        })

                # 3. Consensus / Merge Logic
                if local_results:
                    # Trust Local DB for Color/Severity, but append FDA info
                    primary = local_results[0]
                    if fda_results:
                        primary["description"] += f" | {fda_results[0]['description']}"
                        primary["multi_source_verified"] = True
                    interactions_found.append({
                        "drug_1": id1,
                        "drug_2": id2,
                        "drug1": name1 or id1,
                        "drug2": name2 or id2,
                        **primary
                    })
                elif fda_results:
                     # Only FDA found it using fallback
                    interactions_found.append({
                        "drug_1": id1,
                        "drug_2": id2,
                        "drug1": name1 or id1,
                        "drug2": name2 or id2,
                        **fda_results[0]
                    })

        return {"interactions": interactions_found}

    def _get_color(self, severity):
        severity = severity.lower()
        if "contraindicated" in severity: return "red"
        if "major" in severity or "severe" in severity: return "orange"
        if "moderate" in severity: return "yellow"
        return "green"

    def seed_db(self, db: Session):
        """
        Seed the database with some critical interactions for testing/prototype.
        """
        # Example 1: Warfarin (11289) + Aspirin (1191) -> Major bleeding risk
        # Note: RxNav IDs might vary, using what I found earlier or standard ones.
        # Warfarin RxCUI: 11289
        # Aspirin RxCUI: 1191
        
        if not db.query(Interaction).filter_by(drug_1_rxcui="11289", drug_2_rxcui="1191").first():
            db.add(Interaction(
                drug_1_rxcui="11289", 
                drug_2_rxcui="1191", 
                severity="Major", 
                description="Increased risk of bleeding due to additive anticoagulant effects.",
                source="DDInter Prototype"
            ))
            
        # Example 2: Sildenafil (10598) + Nitroglycerin (7646) -> Fatal hypotension
        if not db.query(Interaction).filter_by(drug_1_rxcui="10598", drug_2_rxcui="7646").first():
            db.add(Interaction(
                drug_1_rxcui="10598", 
                drug_2_rxcui="7646", 
                severity="Contraindicated", 
                description="Risk of severe hypotension (low blood pressure) which can be fatal.",
                source="DDInter Prototype"
            ))
            
        db.commit()

interaction_service = InteractionService()

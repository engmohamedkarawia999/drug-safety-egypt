import requests
import urllib.parse

class OpenFDAService:
    BASE_URL = "https://api.fda.gov/drug/event.json"

    def get_adverse_events(self, drug1_name: str, drug2_name: str, drug1_rxcui: str = None, drug2_rxcui: str = None):
        """
        Query OpenFDA for adverse events using BOTH Name and RxCUI for maximum coverage.
        Returns a rich risk assessment.
        """
        # Build query parts
        # We use OR logic for the *same* drug (Name OR ID) to catch reports that have one but not the other
        # But for the interaction we need Drug1 AND Drug2
        
        d1_query = f'(patient.drug.medicinalproduct:"{drug1_name}"'
        if drug1_rxcui:
            d1_query += f'+OR+patient.drug.openfda.rxcui:"{drug1_rxcui}"'
        d1_query += ")"
        
        d2_query = f'(patient.drug.medicinalproduct:"{drug2_name}"'
        if drug2_rxcui:
            d2_query += f'+OR+patient.drug.openfda.rxcui:"{drug2_rxcui}"'
        d2_query += ")"
        
        # Search query: Drug1 AND Drug2
        query = f'search={d1_query}+AND+{d2_query}'
        
        # Count by reaction, fetch top 10
        count_param = 'count=patient.reaction.reactionmeddrapt.exact&limit=10'
        
        full_url = f"{self.BASE_URL}?{query}&{count_param}"
        
        try:
            response = requests.get(full_url, timeout=10) # Increased timeout
            if response.status_code == 404:
                 return {"found": False, "risk_score": 0, "top_reactions": []}
            
            response.raise_for_status()
            data = response.json()
            
            results = data.get('results', [])
            
            # Enhanced Risk Analysis
            risk_score = 0
            critical_keywords = [
                "DEATH", "DRUG INTERACTION", "RENAL FAILURE", "HEMORRHAGE", 
                "RHABDOMYOLYSIS", "SEROTONIN SYNDROME", "CARDIAC ARREST", 
                "TORSADES DE POINTES", "STEVEN-JOHNSON SYNDROME", "PANCREATITIS"
            ]
            top_reactions = []
            
            total_count = 0
            for item in results:
                term = item['term'].upper()
                count = item['count']
                total_count += count
                top_reactions.append({"term": term, "count": count})
                
                # Weighting logic
                if any(k in term for k in critical_keywords):
                    risk_score += (count * 5) # High multiplier for critical terms
                else:
                    risk_score += count
            
            # If total reports are massive (>1000), scaling might be needed, but for interactions, raw count of bad stuff is usually a good signal.
            
            return {
                "found": True, 
                "risk_score": risk_score, 
                "top_reactions": top_reactions,
                "total_reports": total_count,
                "source": "OpenFDA (Enhanced)"
            }
            
        except Exception as e:
            print(f"OpenFDA Error: {e}")
            return {"error": str(e)}

openfda_service = OpenFDAService()

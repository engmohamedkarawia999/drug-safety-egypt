from sqlalchemy.orm import Session
from .drug_class_registry import DrugClassRegistry
from ..models import Interaction, Drug

class InteractionGenerator:
    def __init__(self):
        # 1. Use Central Registry
        self.classes = DrugClassRegistry.CLASSES

        # 2. Define Clinical Rules (Class A + Class B = Result)
        self.rules = [
            ("NSAIDs", "Anticoagulants", "Major", "Significant risk of bleeding. Avoid combination."),
            ("NSAIDs", "Antiplatelets", "Major", "Additive risk of bleeding."),
            ("Anticoagulants", "Antiplatelets", "Major", "High bleeding risk. Monitor INR/PTT closely."),
            
            # ... (Rest of existing rules) ...
            
            ("SSRI_Antidepressants", "NSAIDs", "Moderate", "Increased risk of upper GI bleeding."),
            ("SSRI_Antidepressants", "Anticoagulants", "Major", "Increased bleeding risk."),
            ("SSRI_Antidepressants", "MAOIs", "Contraindicated", "Severe Serotonin Syndrome risk."),
            ("SNRI_Antidepressants", "MAOIs", "Contraindicated", "Severe Serotonin Syndrome risk."),
            ("TCAs", "MAOIs", "Contraindicated", "Severe Serotonin Syndrome risk."),
            ("Opioids", "MAOIs", "Contraindicated", "Risk of Serotonin Syndrome or hypertensive crisis."),
            ("Opioids", "SSRI_Antidepressants", "Moderate", "Monitor for signs of Serotonin Syndrome."),
            ("Opioids", "SNRI_Antidepressants", "Moderate", "Monitor for signs of Serotonin Syndrome."),
            ("Opioids", "Benzodiazepines", "Major", "RISK OF RESPIRATORY DEPRESSION AND DEATH."),
            ("Opioids", "Opioids", "Major", "Cumulative respiratory depression risk."),
            ("Macrolide_Antibiotics", "Statins", "Major", "Risk of myopathy/rhabdomyolysis due to CYP3A4 inhibition."),
            ("Strong_CYP3A4_Inhibitors", "Statins", "Contraindicated", "Severe risk of myopathy/rhabdomyolysis."),
            ("ACE_Inhibitors", "K_Sparing_Diuretics", "Major", "Risk of severe hyperkalemia."),
            ("ARBs", "K_Sparing_Diuretics", "Major", "Risk of severe hyperkalemia."),
            ("ACE_Inhibitors", "ARBs", "Major", "Increased risk of renal failure and hyperkalemia."),
            ("ACE_Inhibitors", "NSAIDs", "Moderate", "NSAIDs may antagonize antihypertensive effect."),
            ("ARBs", "NSAIDs", "Moderate", "NSAIDs may antagonize antihypertensive effect."),
            ("PDE5_Inhibitors", "Nitrates", "Contraindicated", "FATAL HYPOTENSION RISK."),
            ("Beta_Blockers", "K_Sparing_Diuretics", "Moderate", "Potential additive hyperkalemic effect."),
            
            # 5. Metabolic & Endocrine (Diabetes, Thyroid)
            ("Beta_Blockers", "Antidiabetics_Sulfonylureas", "Moderate", "Beta blockers may mask signs of hypoglycemia (like tachycardia)."),
            ("Fluoroquinolones", "Antidiabetics_Sulfonylureas", "Major", "Risk of dysglycemia (severe hypoglycemia or hyperglycemia)."),
            ("Corticosteroids", "NSAIDs", "Moderate", "Increased risk of GI ulceration and bleeding."),
            ("Fluoroquinolones", "Corticosteroids", "Major", "Increased risk of tendon rupture (Black Box Warning)."),
            
            # 6. QT Prolongation Additive Risks
            ("Antipsychotics", "Macrolide_Antibiotics", "Major", "Additive QT prolongation risk; Torsades de pointes."),
            ("Antipsychotics", "Fluoroquinolones", "Major", "Additive QT prolongation risk."),
            ("Antipsychotics", "SSRI_Antidepressants", "Moderate", "Increased risk of CNS depression and QT prolongation (Citalopram esp)."),

            # 7. Gastrointestinal & Absorption
            ("PPIs", "Antiplatelets", "Moderate", "Omeprazole specifically may reduce the antiplatelet effect of Clopidogrel."),
            ("PPIs", "Macrolide_Antibiotics", "Moderate", "Potential for increased clarithromycin levels esp w/ omeprazole."),
            ("H2_Blockers", "Antifungals", "Moderate", "Reduced absorption of ketoconazole/itraconazole due to increased gastric pH."),

            # 8. Serotonin Syndrome (More Classes)
            ("Triptans", "SSRI_Antidepressants", "Major", "Potential risk of serotonin syndrome (Sumatriptan + SSRI)."),
            ("Triptans", "SNRI_Antidepressants", "Major", "Potential risk of serotonin syndrome."),
            ("Muscle_Relaxants", "Benzodiazepines", "Major", "Additive CNS depression. Severe sedation risk."),
            ("Muscle_Relaxants", "Opioids", "Major", "Risk of profound respiratory depression and death."),
            ("Muscle_Relaxants", "SSRI_Antidepressants", "Major", "Tizanidine + Fluvoxamine is CONTRAINDICATED (hypotension/sedation)."),

            # 9. Gout & Renal
            ("Anti_Gout", "ACE_Inhibitors", "Moderate", "Allopurinol + ACEI may increase risk of hypersensitivity reactions."),
            ("Anti_Gout", "Warfarin", "Major", "Allopurinol may enhance anticoagulant effect of Warfarin.")
        ]
        
        # 3. Add Duplicate Therapy Rules (Same Class vs Same Class)
        # Avoid generating for every class, pick dangerous ones
        dangerous_duplicates = [
            "NSAIDs", "Opioids", "Benzodiazepines", "Anticoagulants", "Antiplatelets", 
            "ACE_Inhibitors", "ARBs", "Beta_Blockers", "Statins", "SSRI_Antidepressants"
        ]
        
        for cls in dangerous_duplicates:
             self.rules.append((cls, cls, "Major", f"Duplicate Therapy: Concurrent use of multiple {cls} is generally not recommended."))

    def generate_and_save(self, db: Session):
        count = 0
        
        # 1. Ingest Drug Definitions first (Robustly)
        # We use a set to track what we've added in this session to avoid session-level duplicates
        seen_rxcuis = set()
        
        # Also pre-fetch existing drugs to avoid DB unique constraint errors
        existing_drugs = db.query(Drug.rxcui).all()
        for r in existing_drugs:
            seen_rxcuis.add(r[0])

        for class_name, drugs in self.classes.items():
            for d in drugs:
                rxcui = d['rxcui']
                if rxcui not in seen_rxcuis:
                    # Double check DB just in case (though pre-fetch should cover it)
                    exists = db.query(Drug).filter_by(rxcui=rxcui).first()
                    if not exists:
                        try:
                            db.add(Drug(rxcui=rxcui, name=d['name'], synonyms=class_name))
                            seen_rxcuis.add(rxcui)
                        except Exception:
                            db.rollback() 
                            pass # Skip if race condition or error
        
        # Commit drugs first to ensure foreign keys work
        db.commit()

        print("Generating interactions based on clinical classes...")
        
        for rule in self.rules:
            class_a_name, class_b_name, severity, desc_template = rule
            
            list_a = self.classes.get(class_a_name, [])
            list_b = self.classes.get(class_b_name, [])
            
            if not list_a or not list_b: continue

            for drug_a in list_a:
                for drug_b in list_b:
                    if drug_a['rxcui'] == drug_b['rxcui']: continue
                    
                    # Check if interaction exists (unordered pair check)
                    exists = db.query(Interaction).filter(
                        ((Interaction.drug_1_rxcui == drug_a['rxcui']) & (Interaction.drug_2_rxcui == drug_b['rxcui'])) |
                        ((Interaction.drug_1_rxcui == drug_b['rxcui']) & (Interaction.drug_2_rxcui == drug_a['rxcui']))
                    ).first()

                    if not exists:
                        interaction = Interaction(
                            drug_1_rxcui=drug_a['rxcui'],
                            drug_2_rxcui=drug_b['rxcui'],
                            severity=severity,
                            description=f"{desc_template} ({drug_a['name']} + {drug_b['name']})",
                            source=f"Generated: {class_a_name}+{class_b_name}"
                        )
                        db.add(interaction)
                        count += 1
                        
            # Commit occasionally
            if count % 100 == 0:
                db.commit()
        
        db.commit()
        return count

interaction_generator = InteractionGenerator()

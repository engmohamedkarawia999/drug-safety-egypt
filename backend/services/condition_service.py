from typing import List, Dict

class ConditionInteractionService:
    # Condition Keywords -> (Drug Keywords -> Rule)
    # This structure allows "If user has Condition X, check for Drug Y"
    
    # We will accept conditions as a list of strings IDs: 'hypertension', 'pregnancy', 'asthma', 'ulcer', 'diabetes'
    
    CONDITION_RULES = {
        "hypertension": [
            {
                "drugs": ["ibuprofen", "diclofenac", "naproxen", "indomethacin", "celecoxib", "etoricoxib"], # NSAIDs
                "severity": "Moderate",
                "color": "orange",
                "description_en": "NSAIDs can increase blood pressure and reduce the effect of antihypertensives.",
                "description_ar": "المسكنات (NSAIDs) قد ترفع ضغط الدم وتقلل فاعلية أدوية الضغط."
            },
            {
                "drugs": ["pseudoephedrine", "phenylephrine"], # Decongestants
                "severity": "Moderate",
                "color": "orange",
                "description_en": "Decongestants can raise blood pressure. Use cautiously.",
                "description_ar": "مضادات الاحتقان قد ترفع ضغط الدم. استخدمها بحذر."
            }
        ],
        "pregnancy": [
            {
                "drugs": ["lisinopril", "enalapril", "ramipril", "captopril", "losartan", "valsartan"], # ACE/ARBs
                "severity": "Major",
                "color": "red",
                "description_en": "Contraindicated in pregnancy. Can cause severe fetal harm.",
                "description_ar": "ممنوع أثناء الحمل. قد يسبب ضرراً شديداً للجنين."
            },
            {
                "drugs": ["warfarin"],
                "severity": "Major",
                "color": "red",
                "description_en": "Contraindicated. Teratogenic risks.",
                "description_ar": "ممنوع. يسبب تشوهات جنينية."
            },
            {
                "drugs": ["ibuprofen", "aspirin", "naproxen"], # NSAIDs 3rd trimester
                "severity": "Moderate", 
                "color": "orange",
                "description_en": "Avoid especially in 3rd trimester. Risks of closing ductus arteriosus.",
                "description_ar": "تجنب خاصة في الثلث الأخير. مخاطر على قلب الجنين."
            }
        ],
        "asthma": [
             {
                "drugs": ["propranolol", "carvedilol", "labetalol", "timolol"], # Non-selective Beta Blockers
                "severity": "Major",
                "color": "red",
                "description_en": "Non-selective beta blockers can trigger bronchospasm/asthma attacks.",
                "description_ar": "أدوية 'بيتا' غير الانتقائية قد تسبب نوبة ربو وضيق تنفس."
            },
            {
                "drugs": ["aspirin"],
                "severity": "Moderate",
                "color": "yellow",
                "description_en": "Use caution. Some asthmatics are sensitive to Aspirin.",
                "description_ar": "استخدم بحذر. بعض مرضى الربو يتحسسون من الأسبرين."
            }
        ],
        "ulcer": [
             {
                "drugs": ["aspirin", "ibuprofen", "diclofenac", "naproxen", "ketorolac"], # NSAIDs
                "severity": "Major",
                "color": "red",
                "description_en": "High risk of gastrointestinal bleeding. Avoid if history of ulcers.",
                "description_ar": "خطر عالي للنزيف المعوي. تجنب إذا كان لديك تاريخ مع القرحة."
            },
            {
                "drugs": ["warfarin", "clopidogrel", "rivaroxaban"], # Blood thinners
                "severity": "Major",
                "color": "red",
                "description_en": "Increases bleeding risk significantly.",
                "description_ar": "يزيد خطر النزيف بشكل كبير."
            }
        ],
         "diabetes": [
             {
                "drugs": ["prednisone", "dexamethasone", "hydrocortisone"], # Corticosteroids
                "severity": "Moderate",
                "color": "orange",
                "description_en": "Corticosteroids can significantly raise blood sugar levels.",
                "description_ar": "الكورتيزون قد يرفع مستويات السكر في الدم بشكل ملحوظ."
            }
        ]
    }

    def check_condition_interactions(self, drug_names: List[str], conditions: List[str]) -> List[Dict]:
        interactions = []
        for condition in conditions:
            condition_id = condition.lower()
            if condition_id not in self.CONDITION_RULES:
                continue
            
            rules = self.CONDITION_RULES[condition_id]
            
            for drug_name in drug_names:
                d_lower = drug_name.lower()
                
                for rule in rules:
                    # Check if any keyword in rule['drugs'] is in the drug name
                    matched_keyword = next((k for k in rule['drugs'] if k in d_lower), None)
                    
                    if matched_keyword:
                        interactions.append({
                            "drug": drug_name,
                            "condition": condition,
                            "severity": rule["severity"],
                            "color": rule["color"],
                            "description_en": rule["description_en"],
                            "description_ar": rule["description_ar"]
                        })
                        
        return interactions

condition_interaction_service = ConditionInteractionService()

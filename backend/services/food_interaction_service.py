from typing import List, Dict

class FoodInteractionService:
    # MVP: Hardcoded rules for high-impact interactions
    # In a real system, this would be in a DB
    
    # Generic Name Keywords -> Rules
    FOOD_RULES = {
        "atorvastatin": {
            "food": "Grapefruit Juice / عصير الجريب فروت",
            "severity": "Major", 
            "color": "red",
            "description_en": "Avoid large amounts of grapefruit juice. It increases the level of the drug in your blood, raising the risk of side effects (muscle pain).",
            "description_ar": "تجنب كميات كبيرة من عصير الجريب فروت. لأنه يرفع مستوى الدواء في الدم مما يزيد خطر الأعراض الجانبية (ألم العضلات)."
        },
        "simvastatin": {
            "food": "Grapefruit Juice / عصير الجريب فروت",
            "severity": "Major",
            "color": "red",
            "description_en": "Do not drink grapefruit juice. It significantly increases drug levels and risk of muscle toxicity.",
            "description_ar": "لا تشرب عصير الجريب فروت. لأنه يزيد بشكل كبير من مستويات الدواء وخطر تسمم العضلات."
        },
        "warfarin": {
            "food": "Vitamin K (Leafy Greens) / خضروات ورقية (فيتامين ك)",
            "severity": "Moderate",
            "color": "orange",
            "description_en": "Maintain a consistent intake of Vitamin K (spinach, kale). Sudden changes can alter the drug's effectiveness (INR).",
            "description_ar": "حافظ على كمية ثابتة من فيتامين 'ك' (السبانخ، الكرنب). التغيير المفاجئ قد يقلل فاعلية الدواء (السيولة)."
        },
        "ciprofloxacin": {
            "food": "Dairy (Calcium) / منتجات الألبان (كالسيوم)",
            "severity": "Moderate",
            "color": "yellow",
            "description_en": "Take 2 hours before or 6 hours after dairy products. Calcium binds to the drug and prevents absorption.",
            "description_ar": "تناوله قبل منتجات الألبان بساعتين أو بعدها بـ 6 ساعات. الكالسيوم يمنع امتصاص الدواء."
        },
        "metronidazole": {
            "food": "Alcohol / الكحول",
            "severity": "Contraindicated",
            "color": "red",
            "description_en": "Do NOT drink alcohol. Causes severe nausea, vomiting, and cramps (Disulfiram-like reaction).",
            "description_ar": "ممنوع شرب الكحول نهائياً. يسبب غثيان وقيء وتشنجات شديدة."
        },
        "digoxin": {
            "food": "Fiber / الألياف",
            "severity": "Minor",
            "color": "yellow",
            "description_en": "Take 1 hour before or 2 hours after high-fiber meals (e.g., bran). Fiber decreases absorption.",
            "description_ar": "تناوله قبل الوجبات الغنية بالألياف بساعة أو بعدها بساعتين. الألياف تقلل الامتصاص."
        },
        "spironolactone": {
            "food": "High Potassium / أطعمة غنية بالبوتاسيوم",
            "severity": "Moderate",
            "color": "orange",
            "description_en": "Avoid excessive potassium (bananas, salt substitutes). Risk of hyperkalemia (high blood potassium).",
            "description_ar": "تجنب الإفراط في البوتاسيوم (الموز، بدائل الملح). خطر ارتفاع البوتاسيوم في الدم."
        }
    }

    def check_food_interactions(self, drug_names: List[str]) -> List[Dict]:
        interactions = []
        for name in drug_names:
            name_lower = name.lower()
            for key, rule in self.FOOD_RULES.items():
                if key in name_lower:
                    interactions.append({
                        "drug": name,
                        "food": rule["food"],
                        "severity": rule["severity"],
                        "color": rule["color"],
                        "description_en": rule["description_en"],
                        "description_ar": rule["description_ar"]
                    })
        return interactions

food_interaction_service = FoodInteractionService()

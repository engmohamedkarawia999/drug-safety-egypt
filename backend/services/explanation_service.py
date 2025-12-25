import random

class ExplanationService:
    
    # Simple knowledge graph simulation
    DRUG_MECHANISMS = {
        "aspirin": "inhibiting Cyclooxygenase (COX) enzymes",
        "warfarin": "antagonizing Vitamin K recycling in the liver",
        "ibuprofen": "inhibiting prostaglandin synthesis",
        "lisinopril": "blocking the Angiotensin-Converting Enzyme (ACE)",
        "sildenafil": "inhibiting PDE5 and causing vasodilation",
        "nitroglycerin": "releasing nitric oxide to relax blood vessels",
        "atorvastatin": "inhibiting HMG-CoA reductase",
        "simvastatin": "inhibiting HMG-CoA reductase",
        "metformin": "reducing hepatic glucose production",
        "insulin": "promoting glucose uptake in cells",
        "ciprofloxacin": "inhibiting bacterial DNA gyrase",
        "fluoxetine": "inhibiting serotonin reuptake (SSRI)",
        "sertraline": "inhibiting serotonin reuptake (SSRI)",
        "tramadol": "binding to mu-opioid receptors and inhibiting serotonin reuptake",
    }

    def explain(self, drug1: str, drug2: str, severity: str) -> dict:
        d1 = drug1.lower()
        d2 = drug2.lower()
        
        mech1 = self._get_mechanism(d1)
        mech2 = self._get_mechanism(d2)
        
        text_en = ""
        text_ar = ""
        
        # Scenario 1: Both known
        if mech1 and mech2:
            combined = f"When {drug1} (works by {mech1}) is combined with {drug2} ({mech2}), the physiological balance is disrupted."
            text_en = f"AI Analysis: {combined} This combination significantly increases the risk of side effects due to overlapping systemic pathways."
            text_ar = f"تحليل الذكاء الاصطناعي: {drug1} يعمل عن طريق {self._translate_mech(mech1)}، بينما {drug2} يعمل بـ {self._translate_mech(mech2)}. الجمع بينهما يؤدي لتعطيل التوازن الفسيولوجي وزيادة خطر الآثار الجانبية."
            
        # Scenario 2: Generic High Severity
        elif severity.lower() in ["major", "high", "severe"]:
            text_en = f"AI Analysis: Pharmacokinetic conflict detected. {drug1} may significantly alter the metabolism of {drug2}, likely via the Cytochrome P450 enzyme system, leading to potentially toxic levels."
            text_ar = f"تحليل الذكاء الاصطناعي: تم رصد تعارض في التمثيل الغذائي (Pharmacokinetic). {drug1} قد يغير طريقة تخلص الجسم من {drug2}، غالباً عبر إنزيمات الكبد، مما يؤدي لتراكم الدواء لمستويات خطرة."
            
        else:
             text_en = f"AI Analysis: These medications may have additive pharmacodynamic effects. Monitor for enhanced side effects such as drowsiness or dizziness."
             text_ar = f"تحليل الذكاء الاصطناعي: هذه الأدوية قد تزيد من تأثير بعضها البعض (Additive Effect). يجب مراقبة الآثار الجانبية مثل الدوخة أو النعاس."

        return {
            "title_en": "Pharmacological AI Insight",
            "title_ar": "رؤية الذكاء الاصطناعي الصيدلانية",
            "text_en": text_en,
            "text_ar": text_ar
        }

    def _get_mechanism(self, drug_name):
        for key, mech in self.DRUG_MECHANISMS.items():
            if key in drug_name:
                return mech
        return None
        
    def _translate_mech(self, mech):
        # Very basic translation map for the demo
        map = {
            "inhibiting Cyclooxygenase (COX) enzymes": "تثبيط إنزيمات COX",
            "inhibiting prostaglandin synthesis": "منع تصنيع البروستاجلاندين",
            "antagonizing Vitamin K recycling in the liver": "تضاد فيتامين K في الكبد",
            "blocking the Angiotensin-Converting Enzyme (ACE)": "غلق إنزيم الأنجيوتنسين",
            "inhibiting PDE5 and causing vasodilation": "ت توسيع الأوعية الدموية",
            "releasing nitric oxide to relax blood vessels": "إطلاق أكسيد النيتريك",
            "inhibiting HMG-CoA reductase": "تثبيط إنزيم الكوليسترول",
            "reducing hepatic glucose production": "تقليل إنتاج الجلوكوز في الكبد",
            "promoting glucose uptake in cells": "زيادة امتصاص الخلايا للسكر",
            "inhibiting bacterial DNA gyrase": "تثبيط انقسام البكتيريا",
            "inhibiting serotonin reuptake (SSRI)": "زيادة السيروتونين في المخ",
            "binding to mu-opioid receptors and inhibiting serotonin reuptake": "التأثير على مستقبلات الألم والسيروتونين"
        }
        return map.get(mech, "آلية عمل معقدة")

explanation_service = ExplanationService()

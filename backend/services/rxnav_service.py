import requests
from fastapi import HTTPException
from difflib import SequenceMatcher
import re

class RxNavService:
    BASE_URL = "https://rxnav.nlm.nih.gov/REST"
    
    # Extended Arabic to English drug mapping
    ARABIC_MAP = {
        # Pain Relievers - مسكنات الألم
        "اسبرين": "Aspirin", "أسبرين": "Aspirin", "اسبيرين": "Aspirin",
        "بنادول": "Paracetamol", "بانادول": "Panadol", "باراسيتامول": "Paracetamol",
        "ادول": "Paracetamol", "أدول": "Paracetamol",
        "بروفين": "Ibuprofen", "ايبوبروفين": "Ibuprofen", "إيبوبروفين": "Ibuprofen",
        "فولتارين": "Diclofenac", "ديكلوفيناك": "Diclofenac", "كتافلام": "Diclofenac",
        "ترامادول": "Tramadol", "ترامال": "Tramadol",
        "نابروكسين": "Naproxen", "نوبين": "Naproxen",
        "سيليبريكس": "Celecoxib", "سيليكوكسيب": "Celecoxib",
        
        # Antibiotics - مضادات حيوية
        "اموكسيسيلين": "Amoxicillin", "أموكسيسيلين": "Amoxicillin", "اموكسل": "Amoxicillin",
        "اوجمنتين": "Augmentin", "اوجمنتيت": "Augmentin",
        "سيبروفلوكساسين": "Ciprofloxacin", "سيبرو": "Ciprofloxacin",
        "فلاجيل": "Metronidazole", "ميترونيدازول": "Metronidazole",
        "كلاريثرومايسين": "Clarithromycin", "كلاسيد": "Clarithromycin",
        "ازيثروميسين": "Azithromycin", "زيثروماكس": "Azithromycin", "زيماكس": "Azithromycin",
        "سيفترياكسون": "Ceftriaxone", "روسيفين": "Ceftriaxone",
        
        # Heart & Blood Pressure - القلب والضغط
        "وارفارين": "Warfarin", "كومادين": "Warfarin", "ماريفان": "Warfarin",
        "بلافيكس": "Clopidogrel", "كلوبيدوجريل": "Clopidogrel",
        "كونكور": "Bisoprolol", "بيزوبرولول": "Bisoprolol",
        "اتينولول": "Atenolol", "تينورمين": "Atenolol",
        "اميلوديبين": "Amlodipine", "نورفاسك": "Amlodipine",
        "انالابريل": "Enalapril", "ريناتك": "Enalapril",
        "ليزينوبريل": "Lisinopril", "زيستريل": "Lisinopril",
        "لوسارتان": "Losartan", "كوزار": "Losartan",
        "فالسارتان": "Valsartan", "تارج": "Valsartan",
        "ديجوكسين": "Digoxin", "لانوكسين": "Digoxin",
        
        # Cholesterol - الكوليسترول
        "ليبيتور": "Atorvastatin", "اتور": "Atorvastatin", "اتورفاستاتين": "Atorvastatin",
        "كرستور": "Rosuvastatin", "روزوفاستاتين": "Rosuvastatin",
        "زوكور": "Simvastatin", "سيمفاستاتين": "Simvastatin",
        
        # Diabetes - السكري
        "ميتفورمين": "Metformin", "جلوكوفاج": "Metformin", "كلوفاج": "Metformin",
        "جليمبريد": "Glimepiride", "اماريل": "Glimepiride",
        "جليكلازيد": "Gliclazide", "دياميكرون": "Gliclazide",
        "انسولين": "Insulin", "لانتوس": "Insulin glargine",
        "جارديانس": "Empagliflozin", "امباغليفلوزين": "Empagliflozin",
        
        # Stomach - المعدة
        "اوميبرازول": "Omeprazole", "لوسك": "Omeprazole", "بريلوسيك": "Omeprazole",
        "نيكسيوم": "Esomeprazole", "ايزوميبرازول": "Esomeprazole",
        "رانيتيدين": "Ranitidine", "زانتاك": "Ranitidine",
        "بانتوبرازول": "Pantoprazole", "بروتونيكس": "Pantoprazole",
        "موتيليوم": "Domperidone", "دومبيريدون": "Domperidone",
        
        # Thyroid - الغدة الدرقية
        "التروكسين": "Levothyroxine", "ليفوثيروكسين": "Levothyroxine", "يوثيروكس": "Levothyroxine",
        
        # Mental Health - الصحة النفسية
        "سبرالكس": "Escitalopram", "ليكسابرو": "Escitalopram",
        "زولوفت": "Sertraline", "سيرترالين": "Sertraline",
        "بروزاك": "Fluoxetine", "فلوكستين": "Fluoxetine",
        "زاناكس": "Alprazolam", "الفابرازولام": "Alprazolam",
        "فاليوم": "Diazepam", "ديازيبام": "Diazepam",
        "ريسبيريدون": "Risperidone", "ريسبردال": "Risperidone",
        
        # Allergies - الحساسية
        "كلاريتين": "Loratadine", "لوراتادين": "Loratadine",
        "زيرتك": "Cetirizine", "سيتريزين": "Cetirizine",
        "تلفاست": "Fexofenadine", "اليجرا": "Fexofenadine",
        
        # Respiratory - الجهاز التنفسي
        "فنتولين": "Salbutamol", "سالبوتامول": "Albuterol", "فينتولين": "Salbutamol",
        "سيريتايد": "Fluticasone-salmeterol", "سيمبيكورت": "Budesonide-formoterol",
        "سينجولير": "Montelukast", "مونتيلوكاست": "Montelukast",
        
        # Common categories
        "مضاد حيوي": "Antibiotic", "مسكن": "Painkiller", "خافض حرارة": "Antipyretic",
    }
    
    # Common drug brand/generic name synonyms for fuzzy matching
    DRUG_SYNONYMS = {
        "aspirin": ["acetylsalicylic acid", "asa", "bayer", "ecotrin"],
        "paracetamol": ["acetaminophen", "tylenol", "panadol", "adol"],
        "ibuprofen": ["advil", "motrin", "brufen", "nurofen"],
        "diclofenac": ["voltaren", "cataflam"],
        "amoxicillin": ["amoxil", "trimox"],
        "metformin": ["glucophage", "fortamet"],
        "omeprazole": ["prilosec", "losec"],
        "atorvastatin": ["lipitor"],
        "lisinopril": ["prinivil", "zestril"],
        "amlodipine": ["norvasc"],
        "metoprolol": ["lopressor", "toprol"],
        "losartan": ["cozaar"],
        "simvastatin": ["zocor"],
        "levothyroxine": ["synthroid", "levoxyl", "eltroxin"],
        "azithromycin": ["zithromax", "z-pack"],
        "ciprofloxacin": ["cipro", "ciproxin"],
        "warfarin": ["coumadin", "jantoven"],
        "clopidogrel": ["plavix"],
        "insulin": ["lantus", "humalog", "novolog"],
        "salbutamol": ["albuterol", "ventolin", "proair"],
    }

    def _normalize_arabic(self, text: str) -> str:
        """Normalize Arabic text for better matching."""
        # Remove diacritics/tashkeel
        text = re.sub(r'[\u064B-\u065F]', '', text)
        # Remove tatweel
        text = text.replace('\u0640', '')
        # Normalize alef variations
        text = re.sub(r'[آأإ]', 'ا', text)
        # Normalize taa marbuta
        text = text.replace('ة', 'ه')
        # Normalize yaa
        text = text.replace('ى', 'ي')
        return text.strip()

    def _fuzzy_match(self, query: str, target: str) -> float:
        """Calculate fuzzy match score between query and target."""
        query = query.lower().strip()
        target = target.lower().strip()
        
        # Exact match
        if query == target:
            return 1.0
        
        # Starts with
        if target.startswith(query) or query.startswith(target):
            return 0.9
        
        # Contains
        if query in target or target in query:
            return 0.8
        
        # Sequence matcher for typos
        return SequenceMatcher(None, query, target).ratio()

    def _translate_arabic(self, name: str) -> str:
        """Translate Arabic drug name to English."""
        normalized = self._normalize_arabic(name)
        
        # Direct match
        if name in self.ARABIC_MAP:
            return self.ARABIC_MAP[name]
        
        # Normalized match
        for arabic, english in self.ARABIC_MAP.items():
            if self._normalize_arabic(arabic) == normalized:
                return english
        
        # Fuzzy match for Arabic (catch typos)
        best_score = 0.0
        best_match = None
        for arabic, english in self.ARABIC_MAP.items():
            score = self._fuzzy_match(normalized, self._normalize_arabic(arabic))
            if score > best_score and score > 0.75:  # 75% similarity threshold
                best_score = score
                best_match = english
        
        return best_match or name

    def _expand_search_terms(self, name: str) -> list:
        """Expand search to include synonyms and variations."""
        terms = [name]
        name_lower = name.lower()
        
        # Check if it's a known synonym
        for generic, brands in self.DRUG_SYNONYMS.items():
            if name_lower == generic or name_lower in brands:
                terms.append(generic)
                terms.extend(brands)
                break
            # Fuzzy match against synonyms
            for brand in brands:
                if self._fuzzy_match(name_lower, brand) > 0.8:
                    terms.append(generic)
                    terms.extend(brands)
                    break
        
        return list(set(terms))

    def _suggest_corrections(self, query: str) -> list:
        """Suggest possible corrections for misspelled drug names."""
        suggestions = []
        query_lower = query.lower()
        
        # Check against all known drug names
        all_names = list(self.DRUG_SYNONYMS.keys())
        for synonyms in self.DRUG_SYNONYMS.values():
            all_names.extend(synonyms)
        
        for name in all_names:
            score = self._fuzzy_match(query_lower, name)
            if score > 0.6 and score < 1.0:
                suggestions.append({"name": name, "score": score})
        
        # Sort by score descending
        suggestions.sort(key=lambda x: x["score"], reverse=True)
        return suggestions[:5]  # Top 5 suggestions

    def search_drug(self, name: str):
        """
        Smart drug search with:
        - Arabic to English translation
        - Fuzzy matching for typos
        - Synonym expansion
        - Spelling suggestions
        """
        original_query = name.strip()
        
        # Check if it contains Arabic characters
        if re.search(r'[\u0600-\u06FF]', name):
            name = self._translate_arabic(name)
        
        # Expand to include synonyms
        search_terms = self._expand_search_terms(name)
        
        all_results = []
        tried_queries = []
        
        for term in search_terms[:3]:  # Limit to avoid too many API calls
            try:
                # Try approximate match first for typos
                response = requests.get(
                    f"{self.BASE_URL}/approximateTerm.json",
                    params={"term": term, "maxEntries": 10}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if 'approximateGroup' in data and 'candidate' in data['approximateGroup']:
                        candidates = data['approximateGroup']['candidate']
                        if isinstance(candidates, dict):
                            candidates = [candidates]
                        for candidate in candidates:
                            rxcui = candidate.get('rxcui', '')
                            name_val = candidate.get('name', '')
                            
                            # If name is missing, fetch it from RxCUI
                            if not name_val and rxcui:
                                name_val = self.get_name(rxcui) or f"Drug {rxcui}"
                            
                            if rxcui and name_val:
                                all_results.append({
                                    "rxcui": rxcui,
                                    "name": name_val,
                                    "score": int(float(candidate.get('score', 0))),
                                    "synonyms": ""
                                })
                
                tried_queries.append(term)
                
                # Also try exact drugs.json for complete info
                response = requests.get(f"{self.BASE_URL}/drugs.json", params={"name": term})
                if response.status_code == 200:
                    data = response.json()
                    if 'drugGroup' in data and 'conceptGroup' in data['drugGroup']:
                        for group in data['drugGroup']['conceptGroup']:
                            if 'conceptProperties' in group:
                                for prop in group['conceptProperties']:
                                    # Check if already added
                                    if not any(r['rxcui'] == prop['rxcui'] for r in all_results):
                                        all_results.append({
                                            "rxcui": prop['rxcui'],
                                            "name": prop['name'],
                                            "score": 100,  # Exact match
                                            "synonyms": prop.get('synonym', '')
                                        })
                
            except Exception as e:
                print(f"Search error for {term}: {e}")
                continue
        
        # Remove duplicates and sort by score
        seen = set()
        unique_results = []
        for r in sorted(all_results, key=lambda x: -x.get('score', 0)):
            if r['rxcui'] not in seen:
                seen.add(r['rxcui'])
                unique_results.append(r)
        
        # Get spelling suggestions if few results
        suggestions = []
        if len(unique_results) < 3:
            suggestions = self._suggest_corrections(original_query)
        
        return {
            "results": unique_results[:15],
            "query": name,
            "original_query": original_query,
            "suggestions": suggestions,
            "searched_terms": tried_queries
        }

    def get_name(self, rxcui: str):
        """Get drug name by RxCUI."""
        try:
            response = requests.get(f"{self.BASE_URL}/rxcui/{rxcui}/properties.json")
            if response.status_code == 200:
                data = response.json()
                return data.get('properties', {}).get('name', 'Unknown')
        except:
            return None
        return None

rxnav_service = RxNavService()

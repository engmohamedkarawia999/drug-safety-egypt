class DrugClassRegistry:
    """
    Definitive registry of Active Ingredients (Generic Names) mapped to RxCUIs.
    Source: RxNorm & Clinical Databases.
    """
    CLASSES = {
        "NSAIDs": [
            {"rxcui": "5640", "name": "Ibuprofen"}, {"rxcui": "1191", "name": "Aspirin"},
            {"rxcui": "7213", "name": "Naproxen"}, {"rxcui": "2623", "name": "Celecoxib"},
            {"rxcui": "3355", "name": "Diclofenac"}, {"rxcui": "5521", "name": "Indomethacin"},
            {"rxcui": "6387", "name": "Ketorolac"}, {"rxcui": "6832", "name": "Meloxicam"},
            {"rxcui": "4337", "name": "Etodolac"}, {"rxcui": "6873", "name": "Nabumetone"},
            {"rxcui": "7632", "name": "Piroxicam"}, {"rxcui": "10184", "name": "Sulindac"},
            {"rxcui": "4388", "name": "Fenoprofen"}, {"rxcui": "4392", "name": "Flurbiprofen"},
            {"rxcui": "6205", "name": "Ketoprofen"}, {"rxcui": "7033", "name": "Mefenamic Acid"},
            {"rxcui": "7714", "name": "Oxaprozin"}, {"rxcui": "10714", "name": "Tolmetin"},
            {"rxcui": "86009", "name": "Rofecoxib"}, {"rxcui": "86007", "name": "Valdecoxib"}
        ],
        "Anticoagulants": [
            {"rxcui": "11289", "name": "Warfarin"}, {"rxcui": "1364430", "name": "Apixaban"},
            {"rxcui": "1114197", "name": "Rivaroxaban"}, {"rxcui": "1599538", "name": "Edoxaban"},
            {"rxcui": "221147", "name": "Dabigatran"}, {"rxcui": "3251", "name": "Heparin"},
            {"rxcui": "4025", "name": "Enoxaparin"}, {"rxcui": "2032", "name": "Bivalirudin"},
            {"rxcui": "906", "name": "Argatroban"}, {"rxcui": "3046", "name": "Fondaparinux"},
            {"rxcui": "3198", "name": "Desirudin"}, {"rxcui": "2868", "name": "Dalteparin"}
        ],
        "Antiplatelets": [
            {"rxcui": "32968", "name": "Clopidogrel"}, {"rxcui": "8600", "name": "Ticagrelor"},
            {"rxcui": "3258", "name": "Prasugrel"}, {"rxcui": "2008", "name": "Dipyridamole"},
            {"rxcui": "2509", "name": "Cilostazol"}, {"rxcui": "10419", "name": "Ticlopidine"},
            {"rxcui": "40645", "name": "Eptifibatide"}, {"rxcui": "173", "name": "Abciximab"}
        ],
        "Statins": [
            {"rxcui": "36567", "name": "Simvastatin"}, {"rxcui": "15343", "name": "Atorvastatin"},
            {"rxcui": "35309", "name": "Rosuvastatin"}, {"rxcui": "83367", "name": "Pravastatin"},
            {"rxcui": "6472", "name": "Lovastatin"}, {"rxcui": "4493", "name": "Fluvastatin"},
            {"rxcui": "83367", "name": "Pitavastatin"}
        ],
        "Macrolide_Antibiotics": [
            {"rxcui": "42355", "name": "Erythromycin"}, {"rxcui": "21032", "name": "Clarithromycin"},
            {"rxcui": "613391", "name": "Azithromycin"}, {"rxcui": "10427", "name": "Telithromycin"}
        ],
        "Fluoroquinolones": [
            {"rxcui": "31555", "name": "Ciprofloxacin"}, {"rxcui": "6389", "name": "Levofloxacin"},
            {"rxcui": "7008", "name": "Moxifloxacin"}, {"rxcui": "7320", "name": "Ofloxacin"},
            {"rxcui": "4696", "name": "Gemifloxacin"}, {"rxcui": "7369", "name": "Norfloxacin"}
        ],
        "ACE_Inhibitors": [
            {"rxcui": "6902", "name": "Lisinopril"}, {"rxcui": "1886", "name": "Benazepril"},
            {"rxcui": "2147", "name": "Captopril"}, {"rxcui": "3992", "name": "Enalapril"},
            {"rxcui": "8998", "name": "Ramipril"}, {"rxcui": "8300", "name": "Quinapril"},
            {"rxcui": "5487", "name": "Fosinopril"}, {"rxcui": "10629", "name": "Trandolapril"},
            {"rxcui": "7980", "name": "Perindopril"}, {"rxcui": "7136", "name": "Moexipril"}
        ],
        "ARBs": [
            {"rxcui": "6904", "name": "Losartan"}, {"rxcui": "88249", "name": "Valsartan"},
            {"rxcui": "5495", "name": "Irbesartan"}, {"rxcui": "5482", "name": "Candesartan"},
            {"rxcui": "9000", "name": "Telmisartan"}, {"rxcui": "7488", "name": "Olmesartan"},
            {"rxcui": "3645", "name": "Eprosartan"}, {"rxcui": "1298808", "name": "Azilsartan"}
        ],
        "K_Sparing_Diuretics": [
            {"rxcui": "8640", "name": "Spironolactone"}, {"rxcui": "3443", "name": "Eplerenone"},
            {"rxcui": "6876", "name": "Amiloride"}, {"rxcui": "3523", "name": "Triamterene"}
        ],
        "SSRI_Antidepressants": [
            {"rxcui": "3628", "name": "Fluoxetine"}, {"rxcui": "9299", "name": "Sertraline"},
            {"rxcui": "8086", "name": "Paroxetine"}, {"rxcui": "2593", "name": "Citalopram"},
            {"rxcui": "2599", "name": "Escitalopram"}, {"rxcui": "4496", "name": "Fluvoxamine"}
        ],
        "SNRI_Antidepressants": [
            {"rxcui": "10829", "name": "Venlafaxine"}, {"rxcui": "72633", "name": "Duloxetine"},
            {"rxcui": "36437", "name": "Desvenlafaxine"}, {"rxcui": "4497", "name": "Milnacipran"},
            {"rxcui": "86008", "name": "Levomilnacipran"}
        ],
        "TCAs": [
            {"rxcui": "733", "name": "Amitriptyline"}, {"rxcui": "7247", "name": "Nortriptyline"},
            {"rxcui": "5691", "name": "Imipramine"}, {"rxcui": "2569", "name": "Clomipramine"},
            {"rxcui": "3289", "name": "Desipramine"}, {"rxcui": "3516", "name": "Doxepin"}
        ],
        "MAOIs": [
            {"rxcui": "8123", "name": "Phenelzine"}, {"rxcui": "10642", "name": "Tranylcypromine"},
            {"rxcui": "6467", "name": "Isocarboxazid"}, {"rxcui": "9618", "name": "Selegiline"}
        ],
        "Nitrates": [
            {"rxcui": "7646", "name": "Nitroglycerin"}, {"rxcui": "5449", "name": "Isosorbide Mononitrate"},
            {"rxcui": "5452", "name": "Isosorbide Dinitrate"}
        ],
        "PDE5_Inhibitors": [
            {"rxcui": "10598", "name": "Sildenafil"}, {"rxcui": "3255", "name": "Tadalafil"},
            {"rxcui": "641", "name": "Vardenafil"}, {"rxcui": "1298811", "name": "Avanafil"}
        ],
        "Opioids": [
            {"rxcui": "4492", "name": "Tramadol"}, {"rxcui": "7804", "name": "Oxycodone"},
            {"rxcui": "7052", "name": "Morphine"}, {"rxcui": "5489", "name": "Hydrocodone"},
            {"rxcui": "3571", "name": "Fentanyl"}, {"rxcui": "6813", "name": "Methadone"},
            {"rxcui": "2670", "name": "Codeine"}, {"rxcui": "5484", "name": "Hydromorphone"},
            {"rxcui": "7814", "name": "Oxymorphone"}, {"rxcui": "161", "name": "Acetaminophen-Codeine"}, # Often searched
             {"rxcui": "22097", "name": "Buprenorphine"}, {"rxcui": "6646", "name": "Meperidine"}
        ],
        "Benzodiazepines": [
            {"rxcui": "10689", "name": "Alprazolam"}, {"rxcui": "3322", "name": "Diazepam"},
            {"rxcui": "6470", "name": "Lorazepam"}, {"rxcui": "2598", "name": "Clonazepam"},
            {"rxcui": "10324", "name": "Temazepam"}, {"rxcui": "7421", "name": "Oxazepam"},
            {"rxcui": "2358", "name": "Chlordiazepoxide"}, {"rxcui": "7269", "name": "Midazolam"}
        ],
        "Antipsychotics": [
            {"rxcui": "8570", "name": "Quetiapine"}, {"rxcui": "7449", "name": "Olanzapine"},
            {"rxcui": "9362", "name": "Risperidone"}, {"rxcui": "4955", "name": "Haloperidol"},
            {"rxcui": "2601", "name": "Clozapine"}, {"rxcui": "827", "name": "Aripiprazole"},
            {"rxcui": "10609", "name": "Ziprasidone"}, {"rxcui": "6468", "name": "Lurasidone"},
            {"rxcui": "8024", "name": "Paliperidone"}
        ],
        "Antidiabetics_Sulfonylureas": [
            {"rxcui": "4815", "name": "Glipizide"}, {"rxcui": "4821", "name": "Glyburide"},
            {"rxcui": "4810", "name": "Glimepiride"}, {"rxcui": "2466", "name": "Chlorpropamide"}
        ],
        "Corticosteroids": [
            {"rxcui": "8640", "name": "Prednisone"}, {"rxcui": "6984", "name": "Methylprednisolone"},
            {"rxcui": "3196", "name": "Dexamethasone"}, {"rxcui": "5492", "name": "Hydrocortisone"},
            {"rxcui": "11402", "name": "Triamcinolone"}, {"rxcui": "1808", "name": "Betamethasone"},
             {"rxcui": "8639", "name": "Prednisolone"}
        ],
        "Strong_CYP3A4_Inhibitors": [
            {"rxcui": "23765", "name": "Ritonavir"}, {"rxcui": "6387", "name": "Ketoconazole"},
            {"rxcui": "6135", "name": "Itraconazole"}, {"rxcui": "3288", "name": "Voriconazole"},
            {"rxcui": "8479", "name": "Posaconazole"}, {"rxcui": "7322", "name": "Nefazodone"}
        ],
        "Beta_Blockers": [
            {"rxcui": "8700", "name": "Propranolol"}, {"rxcui": "6916", "name": "Metoprolol"},
            {"rxcui": "1376", "name": "Atenolol"}, {"rxcui": "2181", "name": "Carvedilol"},
            {"rxcui": "1841", "name": "Bisoprolol"}, {"rxcui": "6463", "name": "Labetalol"},
            {"rxcui": "7303", "name": "Nebivolol"}, {"rxcui": "7512", "name": "Nadolol"},
            {"rxcui": "10368", "name": "Timolol"}
        ],
        "PPIs": [
            {"rxcui": "10324", "name": "Omeprazole"}, {"rxcui": "3368", "name": "Esomeprazole"},
            {"rxcui": "6153", "name": "Lansoprazole"}, {"rxcui": "8638", "name": "Pantoprazole"},
            {"rxcui": "9020", "name": "Rabeprazole"}, {"rxcui": "3154", "name": "Dexlansoprazole"}
        ],
        "H2_Blockers": [
            {"rxcui": "2582", "name": "Cimetidine"}, {"rxcui": "4266", "name": "Famotidine"},
            {"rxcui": "7303", "name": "Ranitidine"}, {"rxcui": "7368", "name": "Nizatidine"}
        ],
        "Triptans": [
            {"rxcui": "4850", "name": "Sumatriptan"}, {"rxcui": "7138", "name": "Rizatriptan"},
            {"rxcui": "7329", "name": "Naratriptan"}, {"rxcui": "1198", "name": "Almotriptan"},
             {"rxcui": "3996", "name": "Eletriptan"}, {"rxcui": "4668", "name": "Frovatriptan"},
             {"rxcui": "10862", "name": "Zolmitriptan"}
        ],
        "Muscle_Relaxants": [
            {"rxcui": "10454", "name": "Tizanidine"}, {"rxcui": "2768", "name": "Cyclobenzaprine"},
            {"rxcui": "1815", "name": "Baclofen"}, {"rxcui": "6732", "name": "Methocarbamol"},
            {"rxcui": "2180", "name": "Carisoprodol"}, {"rxcui": "6918", "name": "Metaxalone"}
        ],
        "Anti_Gout": [
             {"rxcui": "596", "name": "Allopurinol"}, {"rxcui": "2667", "name": "Colchicine"},
             {"rxcui": "4276", "name": "Febuxostat"}, {"rxcui": "8706", "name": "Probenecid"}
        ]
    }

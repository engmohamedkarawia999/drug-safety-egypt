import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

def get_rxcui(name):
    print(f"Searching for {name}...")
    r = requests.get(f"{BASE_URL}/search_drug", params={"name": name})
    if r.status_code == 200:
        data = r.json()
        if data.get('rxcuis'):
            return data['rxcuis'][0]
    return None

def test_interaction():
    # 1. Get IDs for a pair likely to have adverse events but NOT in our local seed
    # "Ibuprofen" and "Aspirin" (Risk of bleeding, stomach issues)
    # Our seed only has Warfarin+Aspirin and Sildenafil+Nitroglycerin
    
    drug1 = "Ibuprofen"
    drug2 = "Aspirin"
    
    id1 = get_rxcui(drug1)
    id2 = get_rxcui(drug2)
    
    if not id1 or not id2:
        print("Failed to get RxCUIs")
        return

    print(f"Checking interaction for {drug1} ({id1}) + {drug2} ({id2})...")
    
    # 2. Check interactions
    payload = [id1, id2]
    r = requests.post(f"{BASE_URL}/check_interactions", json=payload)
    
    if r.status_code == 200:
        data = r.json()
        print("\nResponse:")
        print(json.dumps(data, indent=2))
        
        interactions = data.get('interactions', [])
        if interactions:
            print(f"\n[SUCCESS] Found {len(interactions)} interaction(s).")
            for i in interactions:
                print(f"- Source: {i.get('source')}")
                print(f"- Severity: {i.get('severity')}")
                print(f"- Description: {i.get('description')}")
        else:
            print("\n[WARNING] No interactions found. OpenFDA might not have returned high enough risk or names mismatch.")
    else:
        print(f"Error: {r.status_code} {r.text}")

if __name__ == "__main__":
    test_interaction()

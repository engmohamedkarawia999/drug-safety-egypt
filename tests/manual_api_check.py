import requests
import json

def check_access():
    print("1. Searching for Drug IDs (RxCUI)...")
    # Get ID for Warfarin
    r1 = requests.get("https://rxnav.nlm.nih.gov/REST/rxcui.json?name=Warfarin")
    id1 = r1.json()['idGroup']['rxnormId'][0]
    print(f"Warfarin ID: {id1}")

    # Get ID for Aspirin
    r2 = requests.get("https://rxnav.nlm.nih.gov/REST/rxcui.json?name=Aspirin")
    id2 = r2.json()['idGroup']['rxnormId'][0]
    print(f"Aspirin ID: {id2}")

    print("\n2. Checking Interactions...")
    # Check interaction
    url = f"https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis={id1}+{id2}"
    r3 = requests.get(url)
    data = r3.json()
    
    print("Raw Response Fragment:")
    print(json.dumps(data, indent=2)[:500]) # Print first 500 chars

    # Validate if interaction exists
    try:
        interaction_type = data['fullInteractionTypeGroup'][0]['fullInteractionType'][0]['interactionPair'][0]['description']
        print(f"\n[SUCCESS] Found Interaction: {interaction_type}")
    except:
        print("\n[FAILURE] No interaction found or API format changed.")

if __name__ == "__main__":
    check_access()

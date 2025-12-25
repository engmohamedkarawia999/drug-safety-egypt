export interface Drug {
    rxcui: string;
    name: string;
    synonyms?: string;
}

export interface Interaction {
    drug_1: string;
    drug_2: string;
    drug1?: string;
    drug2?: string;
    severity: "Contraindicated" | "Major" | "Moderate" | "Minor" | "Unknown";
    description: string;
    color: "red" | "orange" | "yellow" | "green";
    source?: string;
}

export interface SearchSuggestion {
    name: string;
    score: number;
}

export interface SearchResponse {
    results: Drug[];
    query: string;
    original_query?: string;
    suggestions?: SearchSuggestion[];
    searched_terms?: string[];
}

export interface FoodInteraction {
    drug: string;
    food: string;
    severity: string;
    color: "red" | "orange" | "yellow" | "green";
    description_en: string;
    description_ar: string;
}

export interface ConditionInteraction {
    drug: string;
    condition: string;
    severity: string;
    color: "red" | "orange" | "yellow" | "green";
    description_en: string;
    description_ar: string;
}

export interface CheckResponse {
    interactions: Interaction[];
    food_interactions: FoodInteraction[];
    condition_interactions: ConditionInteraction[];
}

import { SearchResponse, CheckResponse } from "@/types";
import { translateDrugName } from "@/lib/arabicDrugs";

const API_BASE = "http://127.0.0.1:8000/api";

// Simple in-memory cache with TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    cache.delete(key);
    return null;
}

function setCache(key: string, data: any) {
    cache.set(key, { data, timestamp: Date.now() });
}

export interface Drug {
    rxcui: string;
    name: string;
    synonyms?: string;
}

export async function searchDrug(query: string): Promise<SearchResponse> {
    // Translate Arabic to English if needed
    const translatedQuery = translateDrugName(query);
    const searchQuery = translatedQuery || query;

    const cacheKey = `search:${searchQuery.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const res = await fetch(`${API_BASE}/search_drug?name=${encodeURIComponent(searchQuery)}`);
    if (!res.ok) throw new Error("Failed to search");
    const data = await res.json();

    setCache(cacheKey, data);
    return data;
}

export async function checkInteractions(rxcuis: string[], conditions: string[] = []): Promise<CheckResponse> {
    const res = await fetch(`${API_BASE}/check_interactions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ rxcuis, conditions }),
    });
    if (!res.ok) throw new Error("Failed to check interactions");
    return res.json();
}

export async function explainInteraction(drug1: string, drug2: string, severity: string) {
    const res = await fetch(`${API_BASE}/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drug1, drug2, severity })
    });
    if (!res.ok) throw new Error("Failed to explain");
    return res.json();
}

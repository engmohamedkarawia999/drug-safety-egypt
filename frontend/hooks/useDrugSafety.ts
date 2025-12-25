import { useState, useEffect } from 'react';
import { Drug, Interaction, FoodInteraction, ConditionInteraction } from '@/types';
import { checkInteractions } from '@/lib/api';
import { generateReport } from '@/lib/report_generator';

export function useDrugSafety(isRTL: boolean) {
    const [drugs, setDrugs] = useState<Drug[]>([]);
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [foodInteractions, setFoodInteractions] = useState<FoodInteraction[]>([]);
    const [conditionInteractions, setConditionInteractions] = useState<ConditionInteraction[]>([]);

    const [analyzing, setAnalyzing] = useState(false);
    const [analyzed, setAnalyzed] = useState(false);
    const [error, setError] = useState("");

    // Load saved drug list on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const savedDrugs = localStorage.getItem('current_drug_list');
        if (savedDrugs) {
            try {
                setDrugs(JSON.parse(savedDrugs));
            } catch (e) {
                console.error('Failed to load saved drugs:', e);
            }
        }
    }, []);

    // Auto-save whenever drugs change
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (drugs.length > 0) {
            localStorage.setItem('current_drug_list', JSON.stringify(drugs));
        } else {
            localStorage.removeItem('current_drug_list');
        }
    }, [drugs]);

    const addDrug = (drug: Drug) => {
        if (drugs.find((d) => d.rxcui === drug.rxcui)) return;
        setDrugs(prev => [...prev, drug]);
        resetAnalysis();
    };

    const removeDrug = (rxcui: string) => {
        setDrugs(prev => prev.filter((d) => d.rxcui !== rxcui));
        resetAnalysis();
    };

    const resetAnalysis = () => {
        setAnalyzed(false);
        setInteractions([]);
        setFoodInteractions([]);
        setConditionInteractions([]);
        setError("");
    };

    const clearAllDrugs = () => {
        setDrugs([]);
        resetAnalysis();
        if (typeof window !== 'undefined') {
            localStorage.removeItem('current_drug_list');
        }
    };

    const saveDrugListAs = (name: string) => {
        if (typeof window === 'undefined') return;
        const savedLists = JSON.parse(localStorage.getItem('saved_drug_lists') || '{}');
        savedLists[name] = {
            drugs,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem('saved_drug_lists', JSON.stringify(savedLists));
    };

    const loadDrugList = (name: string) => {
        if (typeof window === 'undefined') return;
        const savedLists = JSON.parse(localStorage.getItem('saved_drug_lists') || '{}');
        if (savedLists[name]) {
            setDrugs(savedLists[name].drugs);
            resetAnalysis();
        }
    };

    const getSavedLists = () => {
        if (typeof window === 'undefined') return [];
        const savedLists = JSON.parse(localStorage.getItem('saved_drug_lists') || '{}');
        return Object.keys(savedLists).map(name => ({
            name,
            count: savedLists[name].drugs.length,
            savedAt: savedLists[name].savedAt
        }));
    };

    const analyze = async (selectedConditions: string[]) => {
        if (drugs.length < 1) {
            setError(isRTL ? "يرجى اختيار دواء واحد على الأقل." : "Please select at least 1 drug.");
            return;
        }

        setError("");
        setAnalyzing(true);
        try {
            const rxcuis = drugs.map((d) => d.rxcui);
            // Simulated delay for UX
            const [res] = await Promise.all([
                checkInteractions(rxcuis, selectedConditions),
                new Promise(r => setTimeout(r, 800))
            ]);

            setInteractions(res.interactions || []);
            setFoodInteractions(res.food_interactions || []);
            setConditionInteractions(res.condition_interactions || []);
            setAnalyzed(true);
        } catch (e) {
            console.error(e);
            setError(isRTL ? "فشل التحليل. حاول مرة أخرى." : "Failed to analyze. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    const downloadPDF = (conditions: string[]) => {
        generateReport(drugs, interactions, foodInteractions, conditionInteractions, conditions, isRTL);
    };

    return {
        drugs,
        interactions,
        foodInteractions,
        conditionInteractions,
        analyzing,
        analyzed,
        error,
        addDrug,
        removeDrug,
        clearAllDrugs,
        analyze,
        downloadPDF,
        saveDrugListAs,
        loadDrugList,
        getSavedLists
    };
}

import { renderHook, act } from '@testing-library/react';
import { useDrugSafety } from '@/hooks/useDrugSafety';
import { Drug } from '@/types';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useDrugSafety Hook', () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    it('should add a drug', () => {
        const { result } = renderHook(() => useDrugSafety(false));

        const testDrug: Drug = {
            rxcui: '12345',
            name: 'Aspirin',
            synonyms: 'ASA'
        };

        act(() => {
            result.current.addDrug(testDrug);
        });

        expect(result.current.drugs).toHaveLength(1);
        expect(result.current.drugs[0].name).toBe('Aspirin');
    });

    it('should prevent duplicate drugs', () => {
        const { result } = renderHook(() => useDrugSafety(false));

        const testDrug: Drug = {
            rxcui: '12345',
            name: 'Aspirin'
        };

        act(() => {
            result.current.addDrug(testDrug);
            result.current.addDrug(testDrug); // Try to add same drug
        });

        expect(result.current.drugs).toHaveLength(1);
    });

    it('should remove a drug', () => {
        const { result } = renderHook(() => useDrugSafety(false));

        const testDrug: Drug = {
            rxcui: '12345',
            name: 'Aspirin'
        };

        act(() => {
            result.current.addDrug(testDrug);
        });

        expect(result.current.drugs).toHaveLength(1);

        act(() => {
            result.current.removeDrug('12345');
        });

        expect(result.current.drugs).toHaveLength(0);
    });

    it('should clear all drugs', () => {
        const { result } = renderHook(() => useDrugSafety(false));

        act(() => {
            result.current.addDrug({ rxcui: '1', name: 'Drug 1' });
            result.current.addDrug({ rxcui: '2', name: 'Drug 2' });
        });

        expect(result.current.drugs).toHaveLength(2);

        act(() => {
            result.current.clearAllDrugs();
        });

        expect(result.current.drugs).toHaveLength(0);
    });

    it('should reset analysis', () => {
        const { result } = renderHook(() => useDrugSafety(false));

        const testDrug: Drug = {
            rxcui: '12345',
            name: 'Aspirin'
        };

        act(() => {
            result.current.addDrug(testDrug);
        });

        // Analysis should be reset when adding drug
        expect(result.current.analyzed).toBe(false);
        expect(result.current.interactions).toHaveLength(0);
    });
});

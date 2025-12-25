"use client";

import { useState, useEffect, useRef, forwardRef, useCallback } from "react";
import {
    Search, Plus, X, Mic, MicOff, Sparkles, Lightbulb, TrendingUp,
    Pill, Star, Clock, ArrowRight, Zap, Shield, AlertCircle, Check,
    ChevronRight, History, Bookmark
} from "lucide-react";
import { Drug, SearchSuggestion } from "@/types";
import { searchDrug } from "@/lib/api";

interface DrugSearchProps {
    onAdd: (drug: Drug) => void;
    placeholder?: string;
    isRTL?: boolean;
}

// Extend Window for Web Speech API
declare global {
    interface Window {
        webkitSpeechRecognition: new () => SpeechRecognition;
        SpeechRecognition: new () => SpeechRecognition;
    }
}

interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onerror: (() => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    start(): void;
    stop(): void;
}

interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
}

// Drug category icons and colors
const drugCategories: Record<string, { icon: string; color: string; label: string; labelAr: string }> = {
    "pain": { icon: "💊", color: "from-red-500 to-rose-500", label: "Pain Relief", labelAr: "مسكنات" },
    "antibiotic": { icon: "🦠", color: "from-green-500 to-emerald-500", label: "Antibiotic", labelAr: "مضاد حيوي" },
    "heart": { icon: "❤️", color: "from-pink-500 to-red-500", label: "Cardiovascular", labelAr: "القلب" },
    "diabetes": { icon: "🩸", color: "from-blue-500 to-cyan-500", label: "Diabetes", labelAr: "السكري" },
    "stomach": { icon: "🫁", color: "from-yellow-500 to-amber-500", label: "Digestive", labelAr: "المعدة" },
    "mental": { icon: "🧠", color: "from-purple-500 to-violet-500", label: "Mental Health", labelAr: "نفسي" },
    "allergy": { icon: "🤧", color: "from-orange-500 to-amber-500", label: "Allergy", labelAr: "حساسية" },
    "default": { icon: "💊", color: "from-blue-500 to-indigo-500", label: "Medication", labelAr: "دواء" },
};

// Categorize drug by name
const categorizeDrug = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (/aspirin|ibuprofen|paracetamol|acetaminophen|naproxen|diclofenac|tramadol/i.test(lowerName)) return "pain";
    if (/amoxicillin|ciprofloxacin|azithromycin|metronidazole|ceftr|penicillin/i.test(lowerName)) return "antibiotic";
    if (/warfarin|atorvastatin|metoprolol|amlodipine|losartan|clopidogrel|digoxin/i.test(lowerName)) return "heart";
    if (/metformin|insulin|glimepiride|gliclazide|empagliflozin/i.test(lowerName)) return "diabetes";
    if (/omeprazole|pantoprazole|ranitidine|lansoprazole|esomeprazole/i.test(lowerName)) return "stomach";
    if (/sertraline|fluoxetine|alprazolam|diazepam|escitalopram|risperidone/i.test(lowerName)) return "mental";
    if (/loratadine|cetirizine|fexofenadine|diphenhydramine/i.test(lowerName)) return "allergy";
    return "default";
};

// Typing animation component
const TypingIndicator = () => (
    <div className="flex items-center gap-1 px-3 py-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
);

const DrugSearch = forwardRef<HTMLInputElement, DrugSearchProps>(({ onAdd, placeholder = "Search for a drug...", isRTL = false }, ref) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Drug[]>([]);
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [translatedQuery, setTranslatedQuery] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [active, setActive] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Popular drugs with categories
    const popularDrugs = isRTL
        ? [
            { name: "بنادول", category: "pain" },
            { name: "اسبرين", category: "pain" },
            { name: "اوجمنتين", category: "antibiotic" },
            { name: "ميتفورمين", category: "diabetes" },
            { name: "وارفارين", category: "heart" },
        ]
        : [
            { name: "Aspirin", category: "pain" },
            { name: "Panadol", category: "pain" },
            { name: "Amoxicillin", category: "antibiotic" },
            { name: "Metformin", category: "diabetes" },
            { name: "Warfarin", category: "heart" },
        ];

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentDrugSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved).slice(0, 5));
        }
    }, []);

    // Save recent search
    const saveRecentSearch = useCallback((term: string) => {
        const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentDrugSearches', JSON.stringify(updated));
    }, [recentSearches]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setActive(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!active) return;

            const totalItems = results.length + suggestions.length;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % totalItems);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                if (selectedIndex < results.length) {
                    onSelect(results[selectedIndex]);
                } else {
                    const suggIndex = selectedIndex - results.length;
                    onSuggestionClick(suggestions[suggIndex]);
                }
            } else if (e.key === 'Escape') {
                setActive(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [active, results, suggestions, selectedIndex]);

    const handleSearch = async (val: string) => {
        if (!val || val.length < 2) {
            setResults([]);
            setSuggestions([]);
            setTranslatedQuery(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        setSelectedIndex(-1);

        try {
            const res = await searchDrug(val);
            setResults(res.results || []);
            setSuggestions(res.suggestions || []);

            if (res.query && res.original_query && res.query !== res.original_query) {
                setTranslatedQuery(res.query);
            } else {
                setTranslatedQuery(null);
            }
        } catch (e) {
            console.error(e);
            setResults([]);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setActive(true);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            handleSearch(val);
        }, 300); // Even faster
    };

    const onQuickSearch = (term: string) => {
        setQuery(term);
        setActive(true);
        handleSearch(term);
        saveRecentSearch(term);
    };

    const onSuggestionClick = (suggestion: SearchSuggestion) => {
        setQuery(suggestion.name);
        handleSearch(suggestion.name);
        saveRecentSearch(suggestion.name);
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        if (!('webkitSpeechRecognition' in window)) {
            alert(isRTL ? "البحث الصوتي غير مدعوم" : "Voice search not supported. Try Chrome.");
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = isRTL ? 'ar-SA' : 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            setQuery(transcript);
            setActive(true);
            handleSearch(transcript);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const onSelect = (drug: Drug) => {
        onAdd(drug);
        saveRecentSearch(drug.name.split(' ')[0]); // Save first word
        setQuery("");
        setResults([]);
        setSuggestions([]);
        setActive(false);
        setSelectedIndex(-1);
    };

    // Get short name from full drug name
    const getShortName = (fullName: string) => {
        const words = fullName.split(' ');
        if (words.length > 4) {
            return words.slice(0, 3).join(' ') + '...';
        }
        return fullName;
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto" ref={containerRef}>
            {/* Main Search Input - Premium Design */}
            <div className={`
                relative flex items-center bg-gradient-to-r from-white via-white to-blue-50/50 
                border-2 rounded-3xl shadow-xl transition-all duration-500
                ${active ? 'border-blue-500 shadow-blue-200/50 scale-[1.02]' : 'border-gray-200 hover:border-blue-300'}
                ${loading ? 'border-blue-400' : ''}
                ${isListening ? 'border-red-400 shadow-red-200/50 animate-pulse' : ''}
            `}>
                {/* Search Icon / Loading */}
                <div className={`p-4 ${isRTL ? 'order-last' : 'order-first'}`}>
                    {loading ? (
                        <div className="relative">
                            <div className="h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <Sparkles className="h-3 w-3 text-blue-500 absolute -top-1 -right-1 animate-pulse" />
                        </div>
                    ) : (
                        <div className="relative">
                            <Search className={`h-6 w-6 transition-colors ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                            {query.length > 0 && (
                                <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                            )}
                        </div>
                    )}
                </div>

                {/* Input Field */}
                <div className="flex-1 relative">
                    <input
                        type="text"
                        ref={(el) => {
                            inputRef.current = el;
                            if (typeof ref === 'function') ref(el);
                            else if (ref) ref.current = el;
                        }}
                        value={query}
                        onChange={onChange}
                        onFocus={() => setActive(true)}
                        placeholder={isListening
                            ? (isRTL ? "🎤 تحدث الآن..." : "🎤 Speak now...")
                            : placeholder
                        }
                        className={`
                            w-full bg-transparent border-none outline-none text-lg placeholder-gray-400 
                            text-gray-800 font-medium h-16 pr-2
                            ${isRTL ? 'text-right' : 'text-left'}
                        `}
                        dir={isRTL ? 'rtl' : 'ltr'}
                        autoComplete="off"
                    />

                    {/* Inline Translation Badge */}
                    {translatedQuery && (
                        <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-2' : 'right-2'} bg-gradient-to-r from-green-100 to-emerald-100 px-2 py-1 rounded-full text-xs text-green-700 flex items-center gap-1`}>
                            <Zap className="h-3 w-3" />
                            <span>{translatedQuery}</span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className={`flex items-center gap-2 p-3 ${isRTL ? 'order-first' : 'order-last'}`}>
                    {query && (
                        <button
                            onClick={() => { setQuery(""); setResults([]); setSuggestions([]); setTranslatedQuery(null); }}
                            className="p-2 hover:bg-red-50 rounded-full transition-all hover:scale-110 group"
                            title={isRTL ? "مسح" : "Clear"}
                            aria-label={isRTL ? "مسح البحث" : "Clear search"}
                        >
                            <X className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                        </button>
                    )}

                    <button
                        onClick={toggleListening}
                        className={`
                            p-3 rounded-2xl transition-all active:scale-95 
                            ${isListening
                                ? 'bg-gradient-to-r from-red-500 to-rose-500 shadow-lg shadow-red-300/50 animate-pulse'
                                : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:shadow-lg hover:shadow-blue-300/50 hover:scale-105'
                            }
                        `}
                        title={isListening ? (isRTL ? "إيقاف" : "Stop") : (isRTL ? "البحث الصوتي" : "Voice Search")}
                        aria-label={isListening ? (isRTL ? "إيقاف الاستماع" : "Stop Listening") : (isRTL ? "البحث الصوتي" : "Voice Search")}
                    >
                        {isListening ? <MicOff className="h-5 w-5 text-white" /> : <Mic className="h-5 w-5 text-white" />}
                    </button>
                </div>
            </div>

            {/* Dropdown Panel */}
            {active && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">

                    {/* Loading State */}
                    {loading && (
                        <div className="p-6 flex items-center justify-center gap-3">
                            <TypingIndicator />
                            <span className="text-sm text-gray-500">{isRTL ? "جاري البحث..." : "Searching..."}</span>
                        </div>
                    )}

                    {/* Quick Access (when no query) */}
                    {!query && !loading && (
                        <div className="p-4">
                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <div className="mb-4">
                                    <div className={`flex items-center gap-2 mb-3 text-xs text-gray-400 uppercase tracking-wider font-semibold ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <History className="h-3.5 w-3.5" />
                                        <span>{isRTL ? "عمليات بحث سابقة" : "Recent"}</span>
                                    </div>
                                    <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : ''}`}>
                                        {recentSearches.map((term, i) => (
                                            <button
                                                key={i}
                                                onClick={() => onQuickSearch(term)}
                                                className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full text-sm transition-all hover:scale-105 flex items-center gap-1.5"
                                            >
                                                <Clock className="h-3 w-3 text-gray-400" />
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Popular Drugs */}
                            <div className={`flex items-center gap-2 mb-3 text-xs text-gray-400 uppercase tracking-wider font-semibold ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <TrendingUp className="h-3.5 w-3.5" />
                                <span>{isRTL ? "الأكثر بحثاً" : "Trending"}</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {popularDrugs.map((drug) => {
                                    const cat = drugCategories[drug.category] || drugCategories.default;
                                    return (
                                        <button
                                            key={drug.name}
                                            onClick={() => onQuickSearch(drug.name)}
                                            className={`
                                                p-3 rounded-2xl bg-gradient-to-r ${cat.color} bg-opacity-10 
                                                hover:shadow-lg transition-all hover:scale-105 hover:-translate-y-0.5
                                                flex items-center gap-2 text-white
                                                ${isRTL ? 'flex-row-reverse' : ''}
                                            `}
                                        >
                                            <span className="text-xl">{cat.icon}</span>
                                            <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                                <div className="font-semibold text-sm">{drug.name}</div>
                                                <div className="text-xs opacity-80">{isRTL ? cat.labelAr : cat.label}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {!loading && results.length > 0 && (
                        <div className="max-h-96 overflow-y-auto">
                            {/* Results Header */}
                            <div className={`px-4 py-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 flex items-center gap-2 text-sm text-blue-700 font-medium border-b border-blue-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <Sparkles className="h-4 w-4" />
                                <span>{isRTL ? `تم العثور على ${results.length} نتيجة` : `${results.length} results found`}</span>
                                {translatedQuery && (
                                    <span className="ml-auto text-xs bg-white/80 px-2 py-0.5 rounded-full">
                                        {isRTL ? `ترجم إلى: ${translatedQuery}` : `Translated: ${translatedQuery}`}
                                    </span>
                                )}
                            </div>

                            {/* Result Items */}
                            {results.map((drug, index) => {
                                const category = categorizeDrug(drug.name);
                                const cat = drugCategories[category] || drugCategories.default;
                                const isSelected = index === selectedIndex;

                                return (
                                    <button
                                        key={drug.rxcui || index}
                                        onClick={() => onSelect(drug)}
                                        className={`
                                            w-full px-4 py-3 flex items-center gap-4 transition-all group
                                            ${isSelected ? 'bg-blue-50' : 'hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50'}
                                            border-b border-gray-50 last:border-0
                                            ${isRTL ? 'flex-row-reverse' : ''}
                                        `}
                                    >
                                        {/* Drug Icon */}
                                        <div className={`
                                            h-12 w-12 rounded-2xl bg-gradient-to-br ${cat.color} 
                                            flex items-center justify-center text-2xl shadow-sm
                                            group-hover:scale-110 group-hover:shadow-md transition-all
                                        `}>
                                            {cat.icon}
                                        </div>

                                        {/* Drug Info */}
                                        <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            <div className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors truncate">
                                                {getShortName(drug.name)}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-gray-400 font-mono">RxCUI: {drug.rxcui}</span>
                                                <span className={`text-xs px-1.5 py-0.5 rounded-full bg-gradient-to-r ${cat.color} text-white`}>
                                                    {isRTL ? cat.labelAr : cat.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Add Button */}
                                        <div className={`
                                            h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 
                                            flex items-center justify-center text-white shadow-md
                                            opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100
                                            ${isRTL ? 'rotate-180' : ''}
                                        `}>
                                            <Plus className="h-5 w-5" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Spelling Suggestions */}
                    {!loading && results.length === 0 && suggestions.length > 0 && (
                        <div className="p-4">
                            <div className={`flex items-center gap-2 mb-3 text-amber-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <Lightbulb className="h-5 w-5" />
                                <span className="font-medium">{isRTL ? "هل تقصد؟" : "Did you mean?"}</span>
                            </div>
                            <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : ''}`}>
                                {suggestions.map((sugg, i) => {
                                    const isSelected = i + results.length === selectedIndex;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => onSuggestionClick(sugg)}
                                            className={`
                                                px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105
                                                flex items-center gap-2 shadow-sm
                                                ${isSelected
                                                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
                                                    : 'bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-800 border border-amber-200'
                                                }
                                            `}
                                        >
                                            <span>{sugg.name}</span>
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/30' : 'bg-amber-200/50'}`}>
                                                {Math.round(sugg.score * 100)}%
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* No Results */}
                    {!loading && query.length > 2 && results.length === 0 && suggestions.length === 0 && (
                        <div className="p-8 text-center">
                            <div className="text-6xl mb-4">🔍</div>
                            <div className="text-gray-600 font-medium mb-2">
                                {isRTL ? "لم يتم العثور على نتائج" : "No results found"}
                            </div>
                            <div className="text-sm text-gray-400">
                                {isRTL
                                    ? "جرب كتابة اسم الدواء بطريقة مختلفة"
                                    : "Try a different spelling or drug name"
                                }
                            </div>
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <Shield className="h-4 w-4 text-blue-500" />
                                <span className="text-xs text-gray-400">
                                    {isRTL ? "يدعم العربية والإنجليزية" : "Supports Arabic & English"}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Keyboard Hints */}
                    {(results.length > 0 || suggestions.length > 0) && (
                        <div className={`px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono">↑↓</kbd>
                                {isRTL ? "تنقل" : "Navigate"}
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono">Enter</kbd>
                                {isRTL ? "اختيار" : "Select"}
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono">Esc</kbd>
                                {isRTL ? "إغلاق" : "Close"}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

DrugSearch.displayName = 'DrugSearch';

export default DrugSearch;

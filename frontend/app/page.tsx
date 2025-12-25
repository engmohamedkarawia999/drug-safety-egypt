"use client";

import { useState, useEffect, useRef, lazy, Suspense } from "react";
import DrugSearch from "@/components/DrugSearch";
import DrugList from "@/components/DrugList";
import InteractionResult from "@/components/InteractionResult";
const OCRScanner = lazy(() => import("@/components/OCRScanner"));
import DrugListManager from "@/components/DrugListManager";
import ThemeToggle from "@/components/ThemeToggle";
import SkeletonLoader from "@/components/SkeletonLoader";
import Tutorial from "@/components/Tutorial";
import MedicationReminders from "@/components/MedicationReminders";
import DosageCalculator from "@/components/DosageCalculator";
import DrugComparison from "@/components/DrugComparison";
import { Loader2, Activity, Globe, Download, Share2 } from "lucide-react";
import { translations, Language } from "@/lib/translations";
import { useDrugSafety } from "@/hooks/useDrugSafety";

export default function Home() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];
  const isRTL = lang === 'ar';

  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
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
  } = useDrugSafety(isRTL);

  // Keyboard Shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Ctrl+Enter to analyze
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && drugs.length >= 1) {
        e.preventDefault();
        analyze(selectedConditions);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [drugs, selectedConditions, analyze]);

  const shareAnalysis = async () => {
    const data = {
      drugs: drugs.map(d => ({ rxcui: d.rxcui, name: d.name })),
      conditions: selectedConditions
    };
    const encoded = btoa(JSON.stringify(data));
    const url = `${window.location.origin}?share=${encoded}`;

    try {
      await navigator.clipboard.writeText(url);
      alert(isRTL ? "تم نسخ الرابط!" : "Link copied to clipboard!");
    } catch {
      prompt(isRTL ? "انسخ هذا الرابط:" : "Copy this link:", url);
    }
  };

  const toggleLanguage = () => {
    setLang((curr) => curr === 'en' ? 'ar' : 'en');
  };

  const AVAILABLE_CONDITIONS = [
    { id: 'hypertension', en: 'Hypertension', ar: 'ارتفاع ضغط الدم' },
    { id: 'pregnancy', en: 'Pregnancy', ar: 'الحمل' },
    { id: 'asthma', en: 'Asthma', ar: 'الربو' },
    { id: 'ulcer', en: 'Peptic Ulcer', ar: 'قرحة المعدة' },
    { id: 'diabetes', en: 'Diabetes', ar: 'السكري' },
  ];

  const toggleCondition = (id: string) => {
    if (selectedConditions.includes(id)) {
      setSelectedConditions(selectedConditions.filter(c => c !== id));
    } else {
      setSelectedConditions([...selectedConditions, id]);
    }
  };

  const handleAnalyze = () => analyze(selectedConditions);
  const handleDownload = () => downloadPDF(selectedConditions);


  return (
    <main
      className={`min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-purple-200 selection:text-purple-900 ${isRTL ? 'rtl' : 'ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Navbar / Lang Toggle + Theme Toggle */}
      <div className="absolute top-5 right-5 z-20 flex gap-2">
        <ThemeToggle />
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-full shadow-sm hover:shadow-md transition-all text-sm font-semibold text-gray-700 dark:text-gray-200 active:scale-95"
        >
          <Globe className="h-4 w-4" />
          {lang === 'en' ? 'العربية' : 'English'}
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-12 relative z-10 max-w-2xl">
        <div className="inline-flex justify-center items-center gap-3 mb-4 p-3 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl shadow-lg ring-1 ring-white/50 dark:ring-gray-700/50">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-inner">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-indigo-800 dark:from-blue-400 dark:to-indigo-400 tracking-tight">
            {t.title}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed font-medium">
          {t.subtitle}
        </p>
      </div>

      {/* Main Glass Card */}
      <div className="w-full max-w-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-6 sm:p-10 relative overflow-hidden">
        {/* Decorative background blob */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-300 dark:bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-300 dark:bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 space-y-8">
          {/* Drug List Manager */}
          <div className="flex justify-center gap-2 flex-wrap">
            <DrugListManager
              onSave={saveDrugListAs}
              onLoad={loadDrugList}
              onClear={clearAllDrugs}
              getSavedLists={getSavedLists}
              currentDrugCount={drugs.length}
              isRTL={isRTL}
            />
            <MedicationReminders drugs={drugs} isRTL={isRTL} />
            <DosageCalculator isRTL={isRTL} />
          </div>

          <div className="text-center space-y-4">
            <div className="flex flex-col items-center gap-2">
              <label className="block text-lg font-bold text-gray-700 dark:text-gray-200">
                {t.addMedication}
              </label>
              {/* OCR Scanner Button with Suspense */}
              <Suspense fallback={<div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>}>
                <OCRScanner onDrugDetected={addDrug} isRTL={isRTL} t={t} />
              </Suspense>
            </div>
            <DrugSearch onAdd={addDrug} placeholder={t.searchPlaceholder} isRTL={isRTL} ref={searchInputRef} />
          </div>

          {/* Drug List */}
          <DrugList drugs={drugs} onRemove={removeDrug} removeText={t.remove} />

          {/* Conditions Selector */}
          <div className="mt-6 border-t border-gray-100 pt-6">
            <label className="block text-sm font-bold text-gray-700 mb-3 block">
              {isRTL ? "هل تعاني من أي أمراض مزمنة؟" : "Do you have any conditions?"}
            </label>
            <div className="flex flex-wrap gap-2 justify-center">
              {AVAILABLE_CONDITIONS.map(cond => (
                <button
                  key={cond.id}
                  onClick={() => toggleCondition(cond.id)}
                  className={`
                                px-4 py-2 rounded-full text-sm font-semibold transition-all
                                ${selectedConditions.includes(cond.id)
                      ? "bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }
                            `}
                >
                  {isRTL ? cond.ar : cond.en}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 mt-6 bg-red-100/80 backdrop-blur-sm border border-red-200 text-red-800 text-sm rounded-xl text-center shadow-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button
              onClick={handleAnalyze}
              disabled={drugs.length < 1 || analyzing}
              className={`
                 px-10 py-4 rounded-2xl font-bold text-white shadow-lg transition-all transform duration-200
                 items-center flex gap-3 text-lg group
                 ${drugs.length < 1
                  ? "bg-gray-300 cursor-not-allowed opacity-70"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/30 hover:-translate-y-1 active:scale-95 active:translate-y-0"
                }
               `}
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t.analyzing}
                </>
              ) : (
                <>
                  {t.analyzeBtn}
                  <Activity className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>
          </div>

        </div>

        <div className="border-t border-gray-200/50 dark:border-gray-700/50 mt-10 pt-8">
          {analyzing && !analyzed && (
            <SkeletonLoader />
          )}

          {analyzed && !analyzing && (
            <>
              <div className="flex justify-end gap-2 mb-4">
                <button
                  onClick={shareAnalysis}
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors"
                  title={isRTL ? "مشاركة التحليل" : "Share Analysis"}
                >
                  <Share2 className="h-5 w-5" />
                  {isRTL ? "مشاركة" : "Share"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold transition-colors"
                >
                  <Download className="h-5 w-5" />
                  {isRTL ? "تحميل التقرير (PDF)" : "Download Report (PDF)"}
                </button>
              </div>

              <InteractionResult
                // ...
                interactions={interactions}
                foodInteractions={foodInteractions}
                conditionInteractions={conditionInteractions}
                checked={analyzed}
                t={t}
                isRTL={isRTL}
              />

              {/* Smart Drug Comparison */}
              {showComparison && (
                <DrugComparison
                  drugs={drugs}
                  interactions={interactions}
                  foodInteractions={foodInteractions}
                  conditionInteractions={conditionInteractions}
                  isRTL={isRTL}
                  onClose={() => setShowComparison(false)}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Tutorial/Onboarding */}
      <Tutorial isRTL={isRTL} />

      <footer className="mt-16 text-center text-sm text-gray-500 font-medium">
        <p>{t.disclaimer}</p>
        <p className="mt-1 opacity-70">v.1.0 Beta • {t.source}: DDInter & OpenFDA</p>
      </footer>
    </main>
  );
}

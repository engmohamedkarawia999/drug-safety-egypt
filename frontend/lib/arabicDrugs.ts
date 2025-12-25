// Arabic to English drug name mapping
export const arabicDrugNames: Record<string, string[]> = {
    // Pain Relievers
    'اسبرين': ['aspirin', 'acetylsalicylic acid'],
    'أسبرين': ['aspirin', 'acetylsalicylic acid'],
    'بنادول': ['paracetamol', 'acetaminophen', 'panadol'],
    'باراسيتامول': ['paracetamol', 'acetaminophen'],
    'ايبوبروفين': ['ibuprofen', 'advil', 'motrin'],
    'إيبوبروفين': ['ibuprofen', 'advil', 'motrin'],
    'بروفين': ['ibuprofen', 'brufen'],
    'كيتوفان': ['ketoprofen'],
    'فولتارين': ['diclofenac', 'voltaren'],
    'ديكلوفيناك': ['diclofenac'],
    'نابروكسين': ['naproxen'],
    'ترامادول': ['tramadol'],

    // Antibiotics
    'اموكسيسيلين': ['amoxicillin'],
    'أموكسيسيلين': ['amoxicillin'],
    'اوجمنتين': ['augmentin', 'amoxicillin-clavulanate'],
    'سيفترياكسون': ['ceftriaxone'],
    'ازيثروميسين': ['azithromycin', 'zithromax'],
    'أزيثروميسين': ['azithromycin'],
    'زيثروماكس': ['azithromycin', 'zithromax'],
    'سيبروفلوكساسين': ['ciprofloxacin', 'cipro'],
    'سيبرو': ['ciprofloxacin'],
    'ميترونيدازول': ['metronidazole', 'flagyl'],
    'فلاجيل': ['metronidazole', 'flagyl'],

    // Heart & Blood Pressure
    'وارفارين': ['warfarin', 'coumadin'],
    'كومادين': ['warfarin', 'coumadin'],
    'اتورفاستاتين': ['atorvastatin', 'lipitor'],
    'ليبيتور': ['atorvastatin', 'lipitor'],
    'لوسارتان': ['losartan', 'cozaar'],
    'اميلوديبين': ['amlodipine', 'norvasc'],
    'ميتوبرولول': ['metoprolol'],
    'كونكور': ['bisoprolol', 'concor'],
    'بيزوبرولول': ['bisoprolol'],
    'كابتوبريل': ['captopril'],
    'اناللابريل': ['enalapril'],
    'فالسارتان': ['valsartan'],
    'كلوبيدوجريل': ['clopidogrel', 'plavix'],
    'بلافيكس': ['clopidogrel', 'plavix'],

    // Diabetes
    'ميتفورمين': ['metformin', 'glucophage'],
    'جلوكوفاج': ['metformin', 'glucophage'],
    'انسولين': ['insulin'],
    'جلميبريد': ['glimepiride', 'amaryl'],
    'اماريل': ['glimepiride', 'amaryl'],

    // Stomach & Digestive
    'اوميبرازول': ['omeprazole', 'prilosec'],
    'بريلوسك': ['omeprazole', 'prilosec'],
    'رانيتيدين': ['ranitidine', 'zantac'],
    'زانتاك': ['ranitidine', 'zantac'],
    'بانتوبرازول': ['pantoprazole'],
    'لانسوبرازول': ['lansoprazole'],
    'دومبيريدون': ['domperidone', 'motilium'],
    'موتيليوم': ['domperidone', 'motilium'],

    // Allergies & Respiratory
    'لوراتادين': ['loratadine', 'claritin'],
    'كلاريتين': ['loratadine', 'claritin'],
    'سيتريزين': ['cetirizine', 'zyrtec'],
    'زيرتك': ['cetirizine', 'zyrtec'],
    'فينتولين': ['salbutamol', 'ventolin', 'albuterol'],
    'سالبوتامول': ['salbutamol', 'albuterol'],
    'سيمبيكورت': ['budesonide-formoterol', 'symbicort'],

    // Mental Health
    'سيرترالين': ['sertraline', 'zoloft'],
    'زولوفت': ['sertraline', 'zoloft'],
    'اسيتالوبرام': ['escitalopram', 'lexapro'],
    'ليكسابرو': ['escitalopram', 'lexapro'],
    'فلوكستين': ['fluoxetine', 'prozac'],
    'بروزاك': ['fluoxetine', 'prozac'],
    'الفابرازولام': ['alprazolam', 'xanax'],
    'زاناكس': ['alprazolam', 'xanax'],
    'ديازيبام': ['diazepam', 'valium'],
    'فاليوم': ['diazepam', 'valium'],

    // Vitamins & Supplements
    'فيتامين د': ['vitamin d', 'cholecalciferol'],
    'فيتامين ب': ['vitamin b', 'b-complex'],
    'حديد': ['iron', 'ferrous sulfate'],
    'اوميغا 3': ['omega-3', 'fish oil'],
    'كالسيوم': ['calcium'],
    'زنك': ['zinc'],
    'ماغنسيوم': ['magnesium'],
};

// Translate Arabic drug name to English search terms
export function translateDrugName(query: string): string {
    const trimmedQuery = query.trim();

    // Check if it's already English (contains only English chars)
    if (/^[a-zA-Z0-9\s-]+$/.test(trimmedQuery)) {
        return trimmedQuery;
    }

    // First: Exact match check
    if (arabicDrugNames[trimmedQuery]) {
        return arabicDrugNames[trimmedQuery][0];
    }

    // Second: Check with normalized Arabic (remove diacritics/tashkeel)
    const normalizedQuery = normalizeArabic(trimmedQuery);

    for (const [arabic, english] of Object.entries(arabicDrugNames)) {
        const normalizedArabic = normalizeArabic(arabic);

        // Exact normalized match
        if (normalizedQuery === normalizedArabic) {
            return english[0];
        }

        // Partial match (query contains arabic or vice versa)
        if (normalizedQuery.includes(normalizedArabic) || normalizedArabic.includes(normalizedQuery)) {
            return english[0];
        }
    }

    // Return original if no translation found
    return trimmedQuery;
}

// Normalize Arabic text by removing diacritics/tashkeel
function normalizeArabic(text: string): string {
    return text
        .replace(/[\u064B-\u065F]/g, '') // Remove Arabic diacritics
        .replace(/\u0640/g, '')           // Remove tatweel
        .replace(/آ|إ|أ/g, 'ا')           // Normalize alef variations
        .replace(/ة/g, 'ه')               // Normalize taa marbuta
        .replace(/ى/g, 'ي')               // Normalize alef maksura
        .trim();
}

// Get all possible English names for an Arabic drug name
export function getAlternativeNames(arabicName: string): string[] {
    const normalized = arabicName.trim();

    for (const [arabic, english] of Object.entries(arabicDrugNames)) {
        if (normalized === arabic || arabic.includes(normalized)) {
            return english;
        }
    }

    return [];
}

// Get Arabic name for an English drug name
export function getArabicName(englishName: string): string | null {
    const normalized = englishName.toLowerCase().trim();

    for (const [arabic, english] of Object.entries(arabicDrugNames)) {
        if (english.some(e => e.toLowerCase() === normalized || normalized.includes(e.toLowerCase()))) {
            return arabic;
        }
    }

    return null;
}

# 🏥 Drug Safety & Interaction Checker (Premium AI)

A robust, full-stack application for checking drug-drug, drug-food, and drug-condition interactions, featuring a premium Glassmorphism UI, Bilingual support (Arabic/English), Voice Search, OCR Prescription Scanning, and PDF Reporting.

## Features 🌟

* **Drug Interaction Check**: Real-time analysis of potential drug-drug interactions.
* **Food & Health Condition Warnings**: Checks for contraindications with food or specific health conditions (Pregnancy, Hypertension, etc.).
* **AI Pharmacist Explainer** 🤖: Explains *why* an interaction occurs using simulated AI logic (Bilingual).
* **OCR Prescription Scanner** 📷: Upload prescription images to automatically detect drugs.
* **Voice Search** 🎙️: Search for drugs using voice commands (English & Arabic).
* **PDF Report Generation** 📄: Download professional reports of the analysis.
* **Bilingual Support**: Full English and Arabic (RTL) support.
* **Refactored Architecture**: Uses custom hooks (`useDrugSafety`) for clean, maintainable code.

## 🛠️ Tech Stack

### Frontend

* **Framework**: Next.js 14 (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS (with `tailwindcss-animate`)
* **Icons**: Lucide React
* **Libraries**: `tesseract.js` (OCR), `jspdf` (Reports), `framer-motion` (Animations).

### Backend

* **Framework**: FastAPI (Python)
* **Database**: SQLite (SQLAlchemy)
* **APIs**:
  * RxNav (NIH) for drug data.
  * OpenFDA for adverse events.
  * Custom Food/Condition Rules Engine.

## 🚀 Setup Instructions

### Prerequisites

* Node.js 18+
* Python 3.9+

### 1. Backend Setup

```bash
cd backend
# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r ../requirements.txt

# Run Server
uvicorn main:app --reload
```

*Server runs at: `http://localhost:8000`*

### 2. Frontend Setup

```bash
cd frontend
# Install dependencies
npm install

# Run Development Server
npm run dev
```

*App runs at: `http://localhost:3000`*

## 🔮 Future Improvements (Roadmap)

1. **AI Explanations (LLM)**: Integrate GPT-4 to explain *why* an interaction is dangerous in simple terms.
2. **User Accounts**: Save family profiles and history to the cloud (Supabase/Firebase).
3. **Mobile App**: Port to React Native for iOS/Android stores.
4. **Barcode Scanning**: Use camera to scan drug box barcodes directly.

---
Built with ❤️ for Drug Safety.

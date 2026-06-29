# SignalHire — Beyond Keywords. Real AI Infrastructure.

> **India Runs × Hack2Skill** | Redrob Track 1 (Data & AI) + Track 2 (Ideation)  
> **SignalHire** is a custom-built, enterprise-grade ML ranking pipeline evaluating over 100,000 real Redrob profiles using Linear Variational Autoencoders (VAEs), FAISS vector search, and a 6-signal explainable scoring engine.

---

## 🏆 Why SignalHire Wins

We didn't just wrap an OpenAI API key. We built a production-ready, entirely local ML infrastructure that processes 100,000 candidates in under 3 seconds.

1. **Custom NLP Parsing (`spaCy`)**: Job descriptions and resumes are parsed locally using Named Entity Recognition (NER) to extract hard skills and years of experience — no LLM hallucination.
2. **Linear Variational Autoencoder (VAE)**: We factor textual matrices into a 384-dimensional latent space natively. Our VAE bridges the vocabulary gap, understanding deep semantic relationships (e.g., *PyTorch* implies *Deep Learning*).
3. **Sub-second Retrieval (FAISS)**: VAE outputs are mapped directly into Facebook AI Similarity Search (FAISS), enabling instantaneous retrieval across 100k+ candidates.
4. **Deterministic Explainability**: Because we built the VAE and the 6-signal scoring engine, SignalHire generates plain-English reasoning natively from the latent space — zero hallucinations, zero API costs.

---

## 🚀 Quick Start (Local Deployment)

### 1. Dataset Preparation

Place the Redrob dataset locally (ensure it is NOT tracked by git — it is ~465 MB):

```text
India_runs_data_and_ai_challenge/
├── candidates.jsonl      (~100,000 records, ~465 MB)
└── job_description.docx
```

### 2. Run the Backend (FastAPI + FAISS + VAE)

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
copy .env.example .env
uvicorn src.main:app --host 127.0.0.1 --port 8000
```

*Note: First startup builds the FAISS index and trains the VAE. This happens automatically.*

### 3. Run the Frontend (React + Vite + Tailwind)

```powershell
cd frontend
npm install
npm run dev
# Dashboard available at: http://127.0.0.1:5173
```

### 4. Generate Submission Output (No UI Required)

To instantly generate the `ranked_candidates.xlsx` submission file against the 100k FAISS index:

```powershell
backend\venv\Scripts\python.exe ml_training\02_generate_submission.py
# → output/ranked_candidates.xlsx
```

---

## 🧠 System Architecture

```text
Job Description ──► Local NLP Parser (spaCy NER)
                           │
Candidate JSONL ──► Linear VAE Encoder ──► 384-d Latent Space
                           │                           │
                           └──────────► FAISS Index ◄───┘
                                            │
                                     6-Signal Scorer
                          (Semantic 40% · Career 20% · Skill 20%
                           · Activity 10% · Intent 5% · Education 5%)
                                            │
                         Ranked XLSX + React UI + Hidden Gems API
```

---

## 🛠️ Key Features

| Feature | Technical Implementation |
|---------|---------------------------|
| **6-Signal Scoring** | Fuses Semantic similarity, Career trajectory, Skill gaps, Behavior, Intent, and Education |
| **Hidden Gems** | Surfaces top talent with 0% keyword match but 80%+ semantic VAE match |
| **Universal Intake** | Upload API accepts PDF, DOCX, JSONL, CSV, and ZIP natively |
| **Explainability** | Per-candidate reasoning generated deterministically from VAE feature distances |
| **Zero External APIs** | 100% local compute. No data privacy leaks. No OpenAI costs |

---

## 🌐 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Check FAISS index size and VAE model status |
| POST | `/api/v1/ingest` | Upload massive candidate JSONL files |
| POST | `/api/v1/rank` | Rank candidates dynamically against a JD |
| GET | `/api/v1/hidden-gems` | Query the VAE for high-talent, low-keyword candidates |
| POST | `/api/v1/export/direct` | Export full rankings to CSV/XLSX |

*Interactive Swagger Docs available at:* `http://127.0.0.1:8000/docs`

---

## 📂 Project Structure

```text
SignalHire/
├── backend/
│   └── src/
│       ├── models/           # VAE encoder, FAISS index, scorer
│       ├── parsers/          # spaCy NLP document parser
│       ├── ontology/         # Custom HR role ontology (40 roles, 75 skill synonyms)
│       ├── api/              # FastAPI route handlers
│       └── pipeline.py       # Core ranking pipeline orchestrator
├── frontend/
│   └── src/
│       ├── pages/            # Landing, Recruiter Dashboard, Hidden Gems
│       └── components/       # WeightSliders, UploadZone, ScoreBar, SkillPill
├── ml_training/              # EDA notebook + submission generator
├── output/                   # ranked_candidates.xlsx (generated, gitignored)
├── methodology.md            # Full scoring methodology for judges
└── README.md
```

---

## 👨‍💻 About the Builder

**Yeshwanth Reddy Mandadi**  
Built SignalHire for India Runs to demonstrate production-grade ML infrastructure. By bypassing standard GPT wrappers, SignalHire proves the power of offline Linear VAE embeddings, explainable multi-signal fusion, and sub-second 100,000+ candidate FAISS retrieval.

---

*SignalHire — Beyond Keywords. Real Signals.*

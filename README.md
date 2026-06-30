

# SignalHire

**SignalHire** is a high-throughput, offline-first machine learning ranking pipeline developed for the India Runs × Hack2Skill (Redrob Track 1 & 2). It evaluates over 100,000 candidate profiles using a custom Linear Variational Autoencoder (VAE), FAISS vector search, and a deterministic 6-signal scoring engine.

---

## Architecture Overview

SignalHire bypasses standard generative LLM wrappers in favor of a determinisitic, offline infrastructure designed for scale, privacy, and sub-second latency.

1. **Entity Extraction (`spaCy`)**: Job descriptions and candidate resumes are parsed locally via a custom Named Entity Recognition (NER) pipeline to extract core competencies, roles, and temporal data (years of experience).
2. **Latent Representation (Linear VAE)**: Textual matrices are factored into a 384-dimensional latent space natively. The VAE captures deep semantic relationships, allowing the system to bridge vocabulary gaps (e.g., establishing the semantic proximity of *PyTorch* and *Deep Learning*).
3. **Vector Retrieval (FAISS)**: VAE outputs are indexed in Facebook AI Similarity Search (FAISS), enabling $O(1)$ nearest-neighbor retrieval across the 100k+ dataset.
4. **Deterministic Scoring Engine**: Retrieved candidates are evaluated against a multi-variable heuristic model (Semantic, Career, Skill, Activity, Intent, Education). Explainability is generated natively from latent space distances rather than generative prompt interpretation.

```text
Job Description ──► Local NLP Parser (spaCy NER)
                           │
Candidate JSONL ──► Linear VAE Encoder ──► 384-d Latent Space
                           │                           │
                           └──────────► FAISS Index ◄───┘
                                            │
                                     6-Signal Scorer
                                            │
                         Ranked Output (XLSX) / REST API
```

---

## Local Deployment

### 1. Data Ingestion
Ensure the source dataset is placed in the local directory structure. Due to size constraints (~465 MB), this file is excluded from version control.

```text
India_runs_data_and_ai_challenge/
├── candidates.jsonl      
└── job_description.docx
```

### 2. Backend Initialization (FastAPI)
The backend requires Python 3.9+. Initializing the server will automatically build the FAISS index and train the VAE on the provided dataset.

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
copy .env.example .env
uvicorn src.main:app --host 127.0.0.1 --port 8000
```

### 3. Frontend Initialization (React / Vite)
```powershell
cd frontend
npm install
npm run dev
# Server binds to: http://127.0.0.1:5173
```

### 4. CLI Execution
To execute the ranking pipeline headlessly and generate the submission artifact (`ranked_candidates.xlsx`):

```powershell
backend\venv\Scripts\python.exe ml_training\02_generate_submission.py
```

---

## API Reference

The backend exposes a RESTful API documented via Swagger UI (`/docs`).

| Method | Endpoint | Description |
|--------|------|-------------|
| `GET` | `/api/v1/health` | Validates FAISS index allocation and VAE model state. |
| `POST` | `/api/v1/ingest` | Initiates batch processing of candidate JSONL datasets. |
| `POST` | `/api/v1/rank` | Executes the 6-signal ranking pipeline against a provided JD. |
| `GET` | `/api/v1/hidden-gems` | Queries the latent space for high-semantic, low-keyword candidates. |
| `POST` | `/api/v1/export/direct` | Compiles the current FAISS retrieval output to CSV/XLSX. |

---

## Repository Structure

```text
SignalHire/
├── backend/
│   └── src/
│       ├── models/           # VAE encoder, FAISS index, Scorer
│       ├── parsers/          # spaCy NLP document parser
│       ├── ontology/         # Custom HR role ontology graph
│       ├── api/              # FastAPI route controllers
│       └── pipeline.py       # Core orchestration logic
├── frontend/
│   └── src/
│       ├── pages/            # React views (Dashboard, Analytics)
│       └── components/       # UI components (ScoreBar, WeightSliders)
├── ml_training/              # Inference scripts and EDA
├── output/                   # Directory for generated artifacts (gitignored)
└── methodology.md            # Mathematical breakdown of the scoring engine
```
<details>
  <summary><b>📸 Click to view all project screenshots</b></summary>
  <br>

  ![Screenshot 630](Screenshot%20(630).png)
  ![Screenshot 631](Screenshot%20(631).png)
  ![Screenshot 632](Screenshot%20(632).png)
  ![Screenshot 633](Screenshot%20(633).png)
  ![Screenshot 634](Screenshot%20(634).png)
  ![Screenshot 635](Screenshot%20(635).png)
  ![Screenshot 636](Screenshot%20(636).png)
  ![Screenshot 637](Screenshot%20(637).png)
  ![Screenshot 638](Screenshot%20(638).png)
  ![Screenshot 639](Screenshot%20(639).png)
  ![Screenshot 640](Screenshot%20(640).png)
  ![Screenshot 641](Screenshot%20(641).png)
  ![Screenshot 642](Screenshot%20(642).png)
  ![Screenshot 643](Screenshot%20(643).png)
  ![Screenshot 644](Screenshot%20(644).png)
  ![Screenshot 645](Screenshot%20(645).png)
  ![Screenshot 646](Screenshot%20(646).png)
  ![Screenshot 647](Screenshot%20(647).png)
  ![Screenshot 648](Screenshot%20(648).png)
  ![Screenshot 649](Screenshot%20(649).png)
  ![Screenshot 650](Screenshot%20(650).png)

</details>

---

## Author

**Yeshwanth Reddy Mandadi**  
Developed for the India Runs × Hack2Skill event to demonstrate the viability of local, explainable ML infrastructure in high-throughput recruitment environments.

@echo off
REM ============================================================
REM  SignalHire — Apply Upgrade Pack
REM  Run this from the CandidateIQ root folder in cmd:
REM    apply_upgrade.bat
REM ============================================================

set ROOT=%~dp0
set SRC=%ROOT%backend\src

echo.
echo === Copying upgraded files into place ===

copy /Y "%ROOT%upgrade_pack\role_ontology.json"   "%SRC%\ontology\role_ontology.json"
copy /Y "%ROOT%upgrade_pack\schemas.py"           "%SRC%\schemas.py"
copy /Y "%ROOT%upgrade_pack\pipeline_scorer.py"   "%SRC%\models\scorer.py"
copy /Y "%ROOT%upgrade_pack\embedder.py"          "%SRC%\models\embedder.py"
copy /Y "%ROOT%upgrade_pack\faiss_index.py"       "%SRC%\models\faiss_index.py"
copy /Y "%ROOT%upgrade_pack\gnn_role.py"          "%SRC%\models\gnn_role.py"
copy /Y "%ROOT%upgrade_pack\jd_parser.py"         "%SRC%\parsers\jd_parser.py"
copy /Y "%ROOT%upgrade_pack\career_signals.py"    "%SRC%\extractors\career_signals.py"
copy /Y "%ROOT%upgrade_pack\main.py"              "%SRC%\main.py"
copy /Y "%ROOT%upgrade_pack\hidden_gems.py"       "%SRC%\api\hidden_gems.py"

mkdir "%SRC%\scripts" 2>nul
copy /Y "%ROOT%upgrade_pack\build_index.py"       "%SRC%\scripts\build_index.py"
echo. > "%SRC%\scripts\__init__.py"

echo.
echo === NOTE: Real dataset (data\candidates.jsonl) is already in place ===
echo === If you need to re-add it, copy your 100k Redrob jsonl file there manually ===

echo.
echo === Removing stale index (will be rebuilt) ===
rmdir /s /q "%ROOT%backend\model_cache\faiss_index" 2>nul
del "%ROOT%backend\model_cache\gnn_model.pkl" 2>nul

echo.
echo === Done copying files ===
echo.
echo NEXT STEPS:
echo   1. cd backend
echo   2. venv\Scripts\activate
echo   3. python -m src.scripts.build_index --limit 5000     (quick test, ~2 min)
echo      OR
echo      python -m src.scripts.build_index                  (full 100k, ~15 min)
echo   4. python -m uvicorn src.main:app --reload --port 8000
echo.
pause

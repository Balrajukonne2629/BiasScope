# BiasScope - AI Fairness Audit Dashboard

BiasScope is a lightweight, end-to-end project to audit bias in AI hiring-style datasets.
It provides a FastAPI backend for fairness analysis and a React dashboard frontend for upload, mapping, audit execution, and visual reporting.

## What We Have Developed So Far

### 1) Backend Audit Engine (FastAPI)

Implemented a stateless API that accepts tabular input data and returns fairness and explainability signals.

Core capabilities implemented:
- RBI (Representation Balance Index) scoring
- DIR (Disparate Impact Ratio) computation with safe handling for edge cases
- SRD (Selection Rate Difference) computation
- Group-level rates and counts
- Feature correlation analysis using Cramer's V
- Rule-based recommendation generation with strength labels
- Data validation and warning generation
- Consistent response schema for frontend rendering

Backend endpoint:
- POST /api/v1/audit

Backend path:
- app/main.py, app/api/audit.py, app/models.py, app/core/*

### 2) Frontend Dashboard (React + Vite)

Implemented a complete Phase 2 dashboard flow:
- CSV upload and parsing
- Automatic column detection
- Gender and outcome mapping UI (+ optional feature selection)
- Run Audit action wired to backend API
- Structured results view

UI/UX refinements completed:
- Clear top header with title and subtitle
- Centered and emphasized Run Audit button
- Disabled Run Audit state while loading or when required mappings are incomplete
- Structured page sections in order: Header -> Upload -> Mapper -> Run -> Results
- Results hierarchy in order: Metrics -> Charts -> Warnings -> Recommendations
- Metric cards for RBI, DIR, SRD with labels and status color cues
- Bar charts for:
  - Group Distribution (group_counts)
  - Hire Rate Comparison (group_rates)
- Recommendation cards with issue, message, and strength emphasis
- Warnings displayed in highlighted yellow block
- Shared reusable color/card CSS utility classes

Frontend path:
- src/App.jsx
- src/components/*
- src/components/dashboard/*
- src/App.css

### 3) End-to-End Demo Flow

1. Start backend server
2. Start frontend dev server
3. Upload sample CSV
4. Map gender and outcome columns
5. Run audit
6. Review metrics, charts, warnings, and recommendations

## Project Structure

GOOGLE_AI_HACKATHON/
- backend/
  - app/
    - api/
    - core/
    - main.py
    - models.py
  - requirements.txt
  - README.md
- frontend/
  - src/
    - components/
      - dashboard/
    - App.jsx
    - App.css
    - main.jsx
  - package.json

## Tech Stack

Backend:
- FastAPI
- Pandas, NumPy, SciPy
- Pydantic
- Uvicorn

Frontend:
- React 18
- Vite
- Axios
- PapaParse
- Recharts

## Setup and Run

### Backend

Windows PowerShell:

cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

API docs:
http://localhost:8000/docs

### Frontend

Windows PowerShell:

cd frontend
npm install
npm run dev

Vite dev URL (default):
http://localhost:5173

## API Contract Summary

Request body:
- data: array of row objects
- columns:
  - gender: string
  - outcome: string
  - features: string[]

Response fields:
- rbi_score
- dir
- dir_safe
- srd
- group_rates
- group_counts
- correlation_scores
- recommendations
- warnings
- total_rows

## Fairness Thresholds Used

- RBI < 60: High Imbalance
- RBI 60-80: Moderate Imbalance
- RBI > 80: Balanced
- DIR < 0.8: High Bias
- SRD > 0.1: Significant Gap

## Current Status

Phase 2 is complete for both functional flow and demo-focused UI clarity.
The app is ready for walkthroughs, judging demos, and iterative model fairness experiments.

# BiasScope — Backend API

FastAPI-based stateless audit engine.

## Folder Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app + CORS + router
│   ├── models.py            # Pydantic request/response models
│   ├── api/
│   │   └── audit.py         # POST /api/v1/audit endpoint
│   └── core/
│       ├── rbi.py           # Representation Balance Index
│       ├── fairness.py      # DIR + SRD calculations
│       ├── correlation.py   # Cramér's V correlation engine
│       ├── recommendations.py # Rule-based recommendation engine
│       └── validator.py     # Data quality checks
├── requirements.txt
└── README.md
```

## Setup & Run

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## API Contract

POST /api/v1/audit

Request:
{
  "data": [ {...row...}, {...row...} ],
  "columns": {
    "gender": "column_name",
    "outcome": "column_name",
    "features": ["col1", "col2"]
  }
}

Response:
{
  "rbi_score": 76.2,          // 0-100, higher = more balanced
  "dir": 0.669,               // Disparate Impact Ratio
  "dir_safe": true,           // false = division by zero, DIR set to 0
  "srd": 0.178,               // Selection Rate Difference
  "group_rates": {...},       // hire rate per group
  "group_counts": {...},      // row count per group
  "correlation_scores": {...},// Cramér's V per feature
  "recommendations": [...],   // actionable cards with strength labels
  "warnings": [...],          // data quality warnings
  "total_rows": 487
}

## Thresholds

| Metric | Threshold | Meaning |
|--------|-----------|---------|
| RBI < 60 | High imbalance | Group underrepresented |
| RBI 60-80 | Moderate imbalance | Monitor |
| DIR < 0.8 | Biased | EEOC 4/5th rule |
| SRD > 0.1 | Notable gap | 10% selection difference |
| Cramér's V >= 0.3 | High signal | Feature correlates strongly |
| Cramér's V >= 0.15 | Moderate signal | Feature may correlate |

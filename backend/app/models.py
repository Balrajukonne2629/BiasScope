from pydantic import BaseModel
from typing import Any, Optional


class ColumnMapping(BaseModel):
    gender: str
    outcome: str
    features: list[str] = []


class AuditRequest(BaseModel):
    data: list[dict[str, Any]]
    columns: ColumnMapping


class RecommendationCard(BaseModel):
    issue: str
    message: str
    strength: Optional[str] = None  # "High" | "Moderate" | None


class DataQualityWarning(BaseModel):
    field: str
    message: str


class AuditResponse(BaseModel):
    rbi_score: float
    dir: float
    dir_safe: bool           # False = division by zero hit, DIR set to 0
    srd: float
    ai_summary: str
    group_rates: dict[str, float]        # hire rate per group
    group_counts: dict[str, int]         # row count per group
    correlation_scores: dict[str, Optional[float]]  # feature → Cramér's V
    recommendations: list[RecommendationCard]
    warnings: list[DataQualityWarning]
    total_rows: int
    dir_label: Optional[str] = None
    srd_label: Optional[str] = None
    rbi_label: Optional[str] = None
    overall_status: Optional[str] = None
    top_issue: Optional[str] = None
    processing_time_ms: Optional[float] = None

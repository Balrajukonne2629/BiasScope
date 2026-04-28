import logging
import time

import pandas as pd
from fastapi import APIRouter, HTTPException

from app.models import AuditRequest, AuditResponse, RecommendationCard, DataQualityWarning
from app.core.rbi import compute_rbi
from app.core.fairness import compute_dir_srd
from app.core.correlation import compute_correlations
from app.core.gemini_explainer import generate_explanation
from app.core.recommendations import generate_recommendations
from app.core.validator import validate_data

router = APIRouter()
logger = logging.getLogger(__name__)


def _get_dir_label(dir_score: float) -> str:
    if dir_score < 0.8:
        return "High Bias (below 0.8 threshold)"
    return "Acceptable range"


def _get_srd_label(srd_score: float) -> str:
    if srd_score > 0.1:
        return "Significant disparity"
    return "Within acceptable difference"


def _get_rbi_label(rbi_score: float) -> str:
    if rbi_score < 60:
        return "High imbalance"
    if rbi_score <= 80:
        return "Moderate imbalance"
    return "Balanced"


def _get_overall_status(dir_score: float, srd_score: float, rbi_score: float) -> str:
    if dir_score < 0.8 or srd_score > 0.1:
        return "High Bias Detected"
    if rbi_score < 60:
        return "Dataset Imbalance"
    return "No Significant Bias Detected"


def _get_top_issue(dir_score: float, srd_score: float, rbi_score: float) -> str:
    if dir_score < 0.8:
        return "Disparate impact detected across groups"
    if srd_score > 0.1:
        return "Selection rate disparity detected between groups"
    if rbi_score < 60:
        return "Representation imbalance detected in dataset"
    return "No major bias issue detected"


def _coerce_binary_outcome(series: pd.Series, outcome_col: str) -> pd.Series:
    mapping = {
        "1": 1,
        "0": 0,
        "yes": 1,
        "no": 0,
        "true": 1,
        "false": 0,
        "y": 1,
        "n": 0,
    }

    converted = pd.to_numeric(series, errors="coerce")
    normalized = series.astype("string").str.strip().str.lower()
    converted = converted.where(converted.notna(), normalized.map(mapping))

    invalid_mask = series.notna() & converted.isna()
    if invalid_mask.any():
        invalid_values = pd.unique(series[invalid_mask].astype(str))[:5]
        raise HTTPException(
            status_code=422,
            detail=(
                f"Could not convert outcome column '{outcome_col}' to binary values. "
                f"Invalid values: {list(invalid_values)}."
            ),
        )

    non_binary_values = pd.unique(converted.dropna()[~converted.dropna().isin([0, 1])])
    if len(non_binary_values) > 0:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Outcome column '{outcome_col}' must contain only binary values. "
                f"Found: {list(non_binary_values[:5])}."
            ),
        )

    return converted.astype("Int64")


@router.post("/audit", response_model=AuditResponse)
def audit(request: AuditRequest):
    start_time = time.perf_counter()

    # --- Build DataFrame ---
    try:
        df = pd.DataFrame(request.data)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse data rows: {e}")

    if df.empty:
        raise HTTPException(status_code=422, detail="Data array is empty.")

    gender_col = request.columns.gender
    outcome_col = request.columns.outcome
    requested_feature_cols = list(request.columns.features or [])

    missing_required_columns = [
        col_name
        for col_name in (gender_col, outcome_col)
        if col_name not in df.columns
    ]
    if missing_required_columns:
        raise HTTPException(
            status_code=422,
            detail=f"Required column(s) not found: {', '.join(missing_required_columns)}",
        )

    feature_cols = [feat for feat in requested_feature_cols if feat in df.columns]

    # --- Validate ---
    raw_warnings = validate_data(df, gender_col, outcome_col, requested_feature_cols)
    warnings = [DataQualityWarning(**w) for w in raw_warnings]

    df = df.copy()
    df[outcome_col] = _coerce_binary_outcome(df[outcome_col], outcome_col)

    # --- Drop rows missing protected attribute or outcome ---
    rows_before_drop = len(df)
    df = df.dropna(subset=[gender_col, outcome_col])
    rows_dropped = rows_before_drop - len(df)
    if df.empty:
        raise HTTPException(
            status_code=422,
            detail="No valid rows remaining after cleaning missing values.",
        )
    if rows_dropped > 0:
        warnings.append(
            DataQualityWarning(
                field="dataset",
                message=(
                    f"Dropped {rows_dropped} rows with missing '{gender_col}' or "
                    f"'{outcome_col}' values."
                ),
            )
        )

    if df[gender_col].nunique(dropna=True) < 2:
        raise HTTPException(
            status_code=422,
            detail="At least two groups required for bias analysis.",
        )

    # --- Compute metrics ---
    rbi_score = compute_rbi(df, gender_col)
    dir_score, dir_safe, srd_score, group_rates = compute_dir_srd(df, gender_col, outcome_col)
    correlation_results = compute_correlations(df, gender_col, feature_cols) if feature_cols else {}

    dir_label = _get_dir_label(dir_score)
    srd_label = _get_srd_label(srd_score)
    rbi_label = _get_rbi_label(rbi_score)
    overall_status = _get_overall_status(dir_score, srd_score, rbi_score)
    top_issue = _get_top_issue(dir_score, srd_score, rbi_score)
    ai_summary = (
        generate_explanation(rbi_score, dir_score, srd_score)
        if len(df) >= 50
        else "AI summary unavailable"
    )

    group_rates = {str(group): rate for group, rate in group_rates.items()}
    group_counts = {str(group): count for group, count in df[gender_col].value_counts().to_dict().items()}
    logger.info("Processed audit request: %s input rows, %s rows after cleanup", len(request.data), len(df))

    processing_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

    # --- Recommendations ---
    raw_cards = generate_recommendations(
        rbi=rbi_score,
        dir_score=dir_score,
        dir_safe=dir_safe,
        srd=srd_score,
        correlation_results=correlation_results,
    )
    recommendations = [RecommendationCard(**c) for c in raw_cards]

    return AuditResponse(
        rbi_score=rbi_score,
        dir=dir_score,
        dir_safe=dir_safe,
        srd=srd_score,
        group_rates=group_rates,
        group_counts=group_counts,
        correlation_scores=correlation_results,
        recommendations=recommendations,
        warnings=warnings,
        total_rows=len(df),
        dir_label=dir_label,
        srd_label=srd_label,
        rbi_label=rbi_label,
        overall_status=overall_status,
        top_issue=top_issue,
        processing_time_ms=processing_time_ms,
        ai_summary=ai_summary,
    )

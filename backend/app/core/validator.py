import pandas as pd


def validate_data(
    df: pd.DataFrame,
    gender_col: str,
    outcome_col: str,
    feature_cols: list,
) -> list[dict]:
    """
    Run data quality checks. Returns list of warning dicts.
    Warnings are informational — audit still proceeds.
    """
    warnings = []

    # --- Row count ---
    if len(df) < 30:
        warnings.append({
            "field": "dataset",
            "message": f"Only {len(df)} rows detected. Results may not be statistically reliable. Recommend 100+ rows.",
        })

    # --- Gender column ---
    if gender_col not in df.columns:
        warnings.append({
            "field": "gender",
            "message": f"Column '{gender_col}' not found in dataset.",
        })
    else:
        null_pct = df[gender_col].isnull().mean()
        if null_pct > 0.05:
            warnings.append({
                "field": "gender",
                "message": f"Column '{gender_col}' has {round(null_pct * 100, 1)}% missing values.",
            })
        n_unique = df[gender_col].nunique()
        if n_unique > 10:
            warnings.append({
                "field": "gender",
                "message": (
                    f"Column '{gender_col}' has {n_unique} unique values — "
                    "expected a protected attribute (e.g. gender, race). Verify mapping."
                ),
            })

    # --- Outcome column ---
    if outcome_col not in df.columns:
        warnings.append({
            "field": "outcome",
            "message": f"Column '{outcome_col}' not found in dataset.",
        })
    else:
        outcome_numeric = pd.to_numeric(df[outcome_col], errors="coerce")
        null_pct = outcome_numeric.isnull().mean()
        if null_pct > 0.05:
            warnings.append({
                "field": "outcome",
                "message": (
                    f"Column '{outcome_col}' has {round(null_pct * 100, 1)}% "
                    "non-numeric or missing values after conversion."
                ),
            })
        unique_vals = outcome_numeric.dropna().unique()
        non_binary = [v for v in unique_vals if v not in (0, 1)]
        if non_binary:
            warnings.append({
                "field": "outcome",
                "message": (
                    f"Column '{outcome_col}' contains non-binary values: {non_binary[:5]}. "
                    "Expected 0/1 or Yes/No. Map to binary before auditing."
                ),
            })

    # --- Feature columns ---
    for feat in feature_cols:
        if feat not in df.columns:
            warnings.append({
                "field": feat,
                "message": f"Feature column '{feat}' not found in dataset.",
            })

    return warnings

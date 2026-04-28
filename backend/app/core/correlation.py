import numpy as np
import pandas as pd

try:
    from scipy.stats import chi2_contingency
except Exception:
    chi2_contingency = None


def cramers_v(df: pd.DataFrame, col1: str, col2: str):
    """
    Cramers V - measures association between two categorical columns.
    Returns value in [0, 1]. Higher = stronger association.
    Returns None if computation fails (e.g. constant column).
    """
    try:
        s1 = df[col1].astype(str)
        s2 = df[col2].astype(str)

        confusion = pd.crosstab(s1, s2)

        if confusion.shape[0] < 2 or confusion.shape[1] < 2:
            return None

        chi2, _, _, _ = chi2_contingency(confusion)
        n = int(confusion.sum().sum())

        if n == 0:
            return None

        phi2 = chi2 / n
        r, k = confusion.shape
        phi2_corr = max(0.0, phi2 - ((k - 1) * (r - 1)) / (n - 1))
        r_corr = r - ((r - 1) ** 2) / (n - 1)
        k_corr = k - ((k - 1) ** 2) / (n - 1)

        denom = min(k_corr - 1, r_corr - 1)
        if denom <= 0:
            return None

        v = float(np.sqrt(phi2_corr / denom))
        return round(v, 3)

    except Exception:
        return None


def get_signal_strength(v):
    """Map Cramers V score to human-readable signal strength."""
    if v is None:
        return None
    if v >= 0.3:
        return "High"
    if v >= 0.15:
        return "Moderate"
    return "Low"


def compute_correlations(df: pd.DataFrame, gender_col: str, selected_features: list):
    """
    Compute Cramers V between gender column and each user-selected feature.
    Skips protected attribute itself and silently handles failures.
    """
    if chi2_contingency is None:
        return {}

    results = {}
    for feat in selected_features:
        if feat == gender_col:
            continue
        if feat not in df.columns:
            continue
        results[feat] = cramers_v(df, gender_col, feat)
    return results

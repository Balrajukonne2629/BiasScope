import pandas as pd


def compute_rbi(df: pd.DataFrame, gender_col: str) -> float:
    """
    Representation Balance Index (RBI).

    Formula:
        expected_ratio = 1 / number_of_groups   (equal share)
        max_deviation  = max(|actual_ratio - expected_ratio|) across groups
        RBI            = (1 - max_deviation) * 100

    Score 0–100:  80+ = balanced | 60–79 = moderate | <60 = high imbalance
    """
    counts = df[gender_col].value_counts(normalize=True)
    n_groups = len(counts)

    if n_groups < 2:
        # Only one group present — maximum imbalance
        return 0.0

    expected = 1.0 / n_groups
    max_deviation = float((counts - expected).abs().max())
    rbi = round((1.0 - max_deviation) * 100, 2)
    return max(0.0, min(100.0, rbi))   # clamp to [0, 100]

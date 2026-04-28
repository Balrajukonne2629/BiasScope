import pandas as pd


def compute_dir_srd(
    df: pd.DataFrame,
    gender_col: str,
    outcome_col: str,
) -> tuple[float, bool, float, dict[str, float]]:
    """
    Disparate Impact Ratio (DIR) and Selection Rate Difference (SRD).

    DIR = hire_rate(minority) / hire_rate(majority)
        < 0.8 → biased (EEOC 4/5th rule)
        dir_safe = False when majority hire rate == 0 (division by zero avoided)

    SRD = hire_rate(majority) - hire_rate(minority)
        > 0.1 → notable disparity

    Returns: (dir, dir_safe, srd, group_rates_dict)
    """
    # Ensure outcome is numeric
    df = df.copy()
    df[outcome_col] = pd.to_numeric(df[outcome_col], errors="coerce")

    group_rates: dict[str, float] = (
        df.groupby(gender_col)[outcome_col]
        .mean()
        .dropna()
        .round(4)
        .to_dict()
    )

    if not group_rates or len(group_rates) < 2:
        return 0.0, False, 0.0, group_rates

    rates = list(group_rates.values())
    majority_rate = max(rates)
    minority_rate = min(rates)

    # Safety: avoid division by zero
    if majority_rate == 0:
        return 0.0, False, 0.0, group_rates

    dir_score = round(minority_rate / majority_rate, 3)
    srd_score = round(majority_rate - minority_rate, 3)

    return dir_score, True, srd_score, group_rates

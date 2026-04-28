from app.core.correlation import get_signal_strength


def generate_recommendations(
    rbi: float,
    dir_score: float,
    dir_safe: bool,
    srd: float,
    correlation_results: dict,
) -> list:
    cards = []

    if rbi < 60:
        cards.append({
            "issue": "Dataset Imbalance",
            "message": (
                "Dataset may underrepresent one or more groups. "
                "Consider collecting more balanced samples before training or evaluating models."
            ),
            "strength": None,
        })
    elif rbi < 80:
        cards.append({
            "issue": "Moderate Dataset Imbalance",
            "message": (
                "Dataset shows moderate group imbalance. "
                "Monitor whether this imbalance affects downstream prediction fairness."
            ),
            "strength": None,
        })

    if not dir_safe:
        cards.append({
            "issue": "Disparate Impact - No Positive Outcomes",
            "message": (
                "No positive outcomes detected in majority group. "
                "DIR could not be computed. Review whether outcome column is correctly mapped."
            ),
            "strength": None,
        })
    elif dir_score < 0.8:
        cards.append({
            "issue": "Disparate Impact Detected",
            "message": (
                f"DIR = {dir_score} - below the EEOC 4/5th (0.8) threshold. "
                "Selection rates differ significantly across groups. "
                "Review outcome criteria for potential disparity."
            ),
            "strength": None,
        })

    if srd > 0.1:
        cards.append({
            "issue": "Selection Rate Gap",
            "message": (
                f"Selection rate difference of {round(srd * 100, 1)}% detected between groups. "
                "Threshold adjustment or re-weighting strategies may help reduce this gap."
            ),
            "strength": None,
        })

    for feat, v in correlation_results.items():
        strength = get_signal_strength(v)
        if strength in ("High", "Moderate"):
            cards.append({
                "issue": f"Feature Signal: '{feat}'",
                "message": (
                    f"Feature '{feat}' shows a {strength.lower()} correlation signal "
                    f"with the protected attribute (Cramers V = {v}). "
                    "It may contribute to bias based on correlation signals - "
                    "evaluate whether this feature is necessary."
                ),
                "strength": strength,
            })

    if not cards:
        cards.append({
            "issue": "No Major Bias Signals Detected",
            "message": (
                "Dataset and prediction metrics are within acceptable thresholds. "
                "Continue monitoring as data evolves."
            ),
            "strength": None,
        })

    return cards

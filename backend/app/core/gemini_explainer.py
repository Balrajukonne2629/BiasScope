from concurrent.futures import ThreadPoolExecutor, TimeoutError
import os
from threading import Lock

import google.generativeai as genai


_CACHE: dict[tuple[float, float, float], str] = {}
_CACHE_LOCK = Lock()
_EXECUTOR = ThreadPoolExecutor(max_workers=1)
_FALLBACK = "AI summary unavailable"
_TIMEOUT_SECONDS = 8


def _build_prompt(rbi: float, dir_score: float, srd: float) -> str:
    return (
        "Explain these audit results in simple human language. "
        "Say whether bias exists, identify the affected group if possible, and suggest one action. "
        "Keep it concise in 4-5 lines max, and do not use markdown.\n\n"
        f"RBI score: {rbi:.2f}\n"
        f"DIR score: {dir_score:.2f}\n"
        f"SRD score: {srd:.2f}"
    )


def generate_explanation(rbi: float, dir_score: float, srd: float) -> str:
    cache_key = (round(rbi, 2), round(dir_score, 2), round(srd, 2))

    with _CACHE_LOCK:
        cached_value = _CACHE.get(cache_key)
    if cached_value is not None:
        return cached_value

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return _FALLBACK

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")

        def _call_model() -> str:
            response = model.generate_content(_build_prompt(*cache_key))
            return (getattr(response, "text", "") or "").strip()

        future = _EXECUTOR.submit(_call_model)
        text = future.result(timeout=_TIMEOUT_SECONDS)
        summary = text if text else _FALLBACK
    except TimeoutError:
        summary = _FALLBACK
    except Exception:
        summary = _FALLBACK

    with _CACHE_LOCK:
        _CACHE[cache_key] = summary

    return summary
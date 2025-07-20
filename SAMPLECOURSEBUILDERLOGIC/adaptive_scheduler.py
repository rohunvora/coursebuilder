"""Adaptive scheduling.

This module provides a simple spaced‑repetition schedule.  It decides
when to resurface a skill based on the learner's estimated
proficiency.  The idea is to increase the interval between reviews as
the learner demonstrates mastery.  The algorithm here is rudimentary
and should not be used in production without refinement.
"""

from typing import Dict


def schedule_next_review(proficiency: float) -> float:
    """Compute the interval until the next review.

    Parameters
    ----------
    proficiency: float
        Estimated probability that the learner knows the skill.  Should
        lie between 0 and 1.

    Returns
    -------
    float
        The recommended number of hours until the skill should be
        reviewed again.  Lower proficiency yields shorter intervals.
    """
    # Clamp proficiency to [0, 1]
    p = max(0.0, min(1.0, proficiency))
    # Use a simple exponential schedule: low proficiency → short interval,
    # high proficiency → long interval.  The base interval is 12 hours.
    base_hours = 12.0
    # If proficiency is 0.5, next review in 12 hours.  If proficiency
    # approaches 1, interval approaches base_hours * 4; if near 0,
    # interval approaches base_hours / 4.
    factor = 1 + (p - 0.5) * 6
    interval = base_hours * factor
    # Minimum interval of one hour to avoid unreasonably small gaps
    return max(1.0, interval)
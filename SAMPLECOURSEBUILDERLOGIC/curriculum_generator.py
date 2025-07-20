"""Curriculum generation.

Given a set of micro‑skills, this module produces a simple
progression.  The aim is to illustrate how a curriculum generator
could order content from easy to hard.  In practice you might
incorporate reinforcement learning or difficulty estimation metrics as
described in the roadmap.
"""

from typing import Iterable, List


def generate_curriculum(skills: Iterable[str]) -> List[str]:
    """Order micro‑skills into a learnable curriculum.

    Parameters
    ----------
    skills: Iterable[str]
        A collection of micro‑skills as returned by the goal parser.

    Returns
    -------
    List[str]
        The micro‑skills sorted into a rough teaching order.  Here we
        simply sort the skills alphabetically as a stand‑in for
        increasing difficulty.  Replace this with a proper difficulty
        ranking mechanism in a real implementation.
    """
    # Remove duplicates while preserving insertion order (Python 3.7+)
    seen = set()
    unique_skills = []
    for s in skills:
        if s not in seen:
            unique_skills.append(s)
            seen.add(s)
    # Sort alphabetically for deterministic output
    return sorted(unique_skills)
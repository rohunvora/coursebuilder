"""Simple goal parser.

This module contains a naive implementation of a goal parser.  In a
production system you would likely replace this with a large language
model (LLM) coupled with a knowledge graph to map free‑form user
requests into a canonical set of micro‑skills.  Here we demonstrate
the idea using a few heuristics.
"""

import re
from typing import List


def parse_goal(goal: str) -> List[str]:
    """Parse a free‑text goal into a list of micro‑skills.

    Parameters
    ----------
    goal: str
        A user‑supplied description of what they want to learn.

    Returns
    -------
    List[str]
        A list of micro‑skills extracted from the goal.  The current
        implementation uses simple keyword extraction and splitting on
        punctuation.  For example, ``"learn venture‑grade term sheets"``
        will result in ``["learn", "venture", "grade", "term", "sheets"]``.

    Note
    ----
    This parser is intentionally simplistic; it demonstrates the
    interface while avoiding external dependencies.  For a real system
    you might leverage spaCy, transformers, or a retrieval‑augmented
    approach to map the goal onto an existing ontology.
    """
    # Convert to lower case and split on non‑word boundaries
    tokens = re.findall(r"[A-Za-z0-9]+", goal.lower())
    # Filter out very common stop words (this list can be extended)
    stop_words = {"to", "the", "a", "an", "of", "and"}
    micro_skills = [token for token in tokens if token not in stop_words]
    return micro_skills
"""Top level package for a lightweight course‑generation engine.

This package contains stub implementations for the components required to
build a gamified learning experience.  The goal of this code is to
illustrate how the different parts described in the project roadmap fit
together rather than to provide a production‑ready system.

Each module exposes a simple interface.  Feel free to expand or replace
the included logic with calls to more sophisticated services (large
language models, knowledge‑tracing algorithms, etc.).
"""

# Re‑export key classes and functions for convenience
from .goal_parser import parse_goal
from .curriculum_generator import generate_curriculum
from .exercise_generator import generate_exercises
from .learner_model import LearnerModel
from .adaptive_scheduler import schedule_next_review
from .gamification import GamificationState

__all__ = [
    "parse_goal",
    "generate_curriculum",
    "generate_exercises",
    "LearnerModel",
    "schedule_next_review",
    "GamificationState",
]
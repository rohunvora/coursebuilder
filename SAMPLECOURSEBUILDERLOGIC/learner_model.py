"""Learner model.

This module implements a rudimentary learner model using Bayesian
updating.  The learner model maintains a probability that the user
knows each micro‑skill and updates it based on observed answers.

In real systems you would likely implement one of the many knowledge
tracing models (e.g. Bayesian Knowledge Tracing, Deep Knowledge
Tracing) to capture forgetting and learning curves.  The version here
is simplified for clarity and ease of extension.
"""

from dataclasses import dataclass, field
from typing import Dict


@dataclass
class LearnerModel:
    """Maintain estimates of a learner's knowledge state.

    Attributes
    ----------
    knowledge: Dict[str, float]
        A mapping from skill to the estimated probability that the
        learner knows that skill.  Values lie in [0, 1], where 0
        indicates no knowledge and 1 indicates complete mastery.
    """
    knowledge: Dict[str, float] = field(default_factory=dict)

    def ensure_skill(self, skill: str) -> None:
        """Initialise skill with a neutral prior if not already present."""
        if skill not in self.knowledge:
            # Start with a neutral prior: 0.5 indicates uncertainty
            self.knowledge[skill] = 0.5

    def update(self, skill: str, correct: bool, learning_rate: float = 0.1) -> None:
        """Update the probability of knowing a skill based on an answer.

        Uses a simple Bayesian update: increases or decreases the
        estimate by a fixed learning rate.  Does not account for
        forgetting or item difficulty.

        Parameters
        ----------
        skill: str
            The skill that was tested.
        correct: bool
            Whether the learner answered correctly.
        learning_rate: float
            The magnitude of the update.  Values should be in (0, 1].
        """
        self.ensure_skill(skill)
        current = self.knowledge[skill]
        if correct:
            # Move probability towards 1
            updated = current + learning_rate * (1 - current)
        else:
            # Move probability towards 0
            updated = current - learning_rate * current
        # Clamp to [0, 1]
        self.knowledge[skill] = max(0.0, min(1.0, updated))

    def get_proficiency(self, skill: str) -> float:
        """Return the current proficiency estimate for a skill."""
        self.ensure_skill(skill)
        return self.knowledge[skill]
"""Gamification utilities.

This module implements a minimal gamification layer.  It tracks
experience points (XP), streaks, and levels.  Real products often
include more complex reward systems such as achievements, leader
boards, timed events, and social pressure.  Use this as a starting
point.
"""

from dataclasses import dataclass, field


@dataclass
class GamificationState:
    """Track the gamification metrics for a learner."""
    xp: int = 0
    streak: int = 0
    level: int = 1
    xp_for_next_level: int = 100

    def add_xp(self, amount: int) -> None:
        """Add XP and handle leveling up."""
        self.xp += amount
        while self.xp >= self.xp_for_next_level:
            self.xp -= self.xp_for_next_level
            self.level += 1
            # Increase difficulty to level up
            self.xp_for_next_level = int(self.xp_for_next_level * 1.5)

    def increment_streak(self) -> None:
        """Increment the daily streak."""
        self.streak += 1

    def reset_streak(self) -> None:
        """Reset the streak when the learner misses a day."""
        self.streak = 0
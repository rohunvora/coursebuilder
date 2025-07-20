"""Command‑line interface for the course engine prototype.

This script stitches together the modules in ``ai_course_engine`` to
demonstrate a basic learning loop.  It asks the user for a learning
goal, builds a simple curriculum, generates exercises, and updates
the learner model based on the user's answers.  It also awards XP
through the gamification layer.

Run this script with ``python3 main.py``.  For simplicity, no
persistent storage is used; progress is kept in memory.
"""

from __future__ import annotations

import sys
from typing import List

from ai_course_engine import (
    parse_goal,
    generate_curriculum,
    generate_exercises,
    LearnerModel,
    schedule_next_review,
    GamificationState,
)


def interactive_learning(goal: str) -> None:
    """Interactively guide the learner through a simple course."""
    print(f"\nParsing goal: '{goal}'")
    skills = parse_goal(goal)
    if not skills:
        print("No skills detected. Please enter a different goal.")
        return
    curriculum = generate_curriculum(skills)
    print(f"\nGenerated curriculum: {curriculum}\n")

    learner = LearnerModel()
    gamification = GamificationState()

    for skill in curriculum:
        print(f"=== Learning skill: {skill} ===")
        exercises = generate_exercises(skill)
        for ex in exercises:
            print(f"\nQuestion: {ex['question']}")
            user_answer = input("Your answer: ").strip()
            # Naively mark correctness if user typed anything non‑empty
            correct = bool(user_answer)
            print(
                "Correct!" if correct else f"Not quite. Expected: {ex['answer']}"
            )
            learner.update(skill, correct)
            gamification.add_xp(10 if correct else 5)
        proficiency = learner.get_proficiency(skill)
        next_review = schedule_next_review(proficiency)
        print(
            f"\nCurrent proficiency for '{skill}': {proficiency:.2f}"
            f" — schedule next review in {next_review:.1f} hours."
        )
        print(
            f"XP: {gamification.xp} (Level {gamification.level}), Streak: {gamification.streak}\n"
        )

    # End of curriculum
    print("Congratulations! You have completed the generated curriculum.")


def main(args: List[str]) -> None:
    if len(args) < 2:
        goal = input("Enter your learning goal: ").strip()
    else:
        goal = " ".join(args[1:])
    interactive_learning(goal)


if __name__ == "__main__":
    main(sys.argv)
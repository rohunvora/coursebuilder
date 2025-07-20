AI Course Engine Prototype
This repository contains a minimal prototype inspired by the
road‑map for building an AI‑powered system that turns a free‑text
learning goal into a gamified course. It demonstrates how the core
components—goal parsing, curriculum generation, exercise creation,
learner modelling, adaptive scheduling and gamification—can be wired
together in Python without external dependencies.

Disclaimer: This is not a production‑ready system. The
algorithms are deliberately simple so that the flow of data
between modules is easy to follow. In practice you would replace
these stubs with large language models, knowledge graphs,
reinforcement‑learning curriculum designers, sophisticated knowledge
tracing models and richer gamification mechanics.

Folder structure
ai_course_engine/ – Python package containing the core modules:

goal_parser.py – very simple keyword extractor that splits the
user’s goal into micro‑skills.

curriculum_generator.py – orders the micro‑skills into a
curriculum (currently alphabetical).

exercise_generator.py – produces placeholder question/answer
pairs for each skill.

learner_model.py – rudimentary Bayesian learner model that tracks
knowledge estimates and updates them after each exercise.

adaptive_scheduler.py – computes the time until the next review
using a basic spaced‑repetition formula.

gamification.py – tracks XP, levels and streaks.

main.py – command‑line script that ties the modules together. It
prompts the user for a learning goal, generates a curriculum and
interacts with them through a simple Q&A loop while updating the
learner model and awarding XP.

Running the prototype
To try the interactive demo, run:

bash
Copy
Edit
python3 main.py
or provide a goal directly:

bash
Copy
Edit
python3 main.py "learn venture‑grade term sheets"
The script will walk you through a basic lesson for each parsed
micro‑skill. Answers are judged on whether the user types anything at
all (non‑empty input counts as “correct”), so you can experiment with
how the learner model updates the proficiency estimates.

Extending the prototype
Here are some suggestions to extend this code closer to the full
vision:

Goal parsing: Replace the naive keyword extractor with a
language model (e.g. OpenAI GPT‑4 or Anthropic Claude) that
outputs a list of canonical concepts, and map these onto a
domain‑specific ontology.

Curriculum design: Implement the curriculum generation as an
iterative search problem (e.g. reinforcement learning). The
Eurekaverse paper provides a
starting point for ranking tasks by difficulty.

Exercise generation: Use templating or retrieval‑augmented
generation to create diverse exercises (flash cards, cloze tests,
code challenges) automatically. Ensure each exercise comes with an
answer key.

Learner model: Integrate Bayesian Knowledge Tracing or Deep
Knowledge Tracing frameworks to model forgetting and to adjust
difficulty more precisely.

Adaptive scheduling: Consider research on spaced repetition to
tune the review intervals based on learner performance.

Gamification: Add achievements, leader boards and social
features; A/B test which mechanics improve retention.

License
This prototype is provided without warranty. Feel free to modify and
reuse it under the terms of the MIT License.

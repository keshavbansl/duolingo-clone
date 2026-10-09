# Duolingo Clone

A Duolingo-inspired language-learning web application built with
**Next.js, TypeScript, Tailwind CSS, FastAPI, SQLAlchemy, and SQLite**.
The app provides a Spanish learning path, interactive lessons, exercise
validation, learner statistics, learning progress, and an XP
leaderboard.

> **Project status:** Steps 0--10, exercise and gamification features,
> Steps 18.1--18.3, and the planned Step 20 settings/placeholder UI are
> documented below. Step 21 (responsive design and UI polish) remains a
> follow-up task. Verify each feature in your local environment before
> presenting it as complete.

## Table of Contents

-   [Features](#features)
-   [Technology Stack](#technology-stack)
-   [Project Structure](#project-structure)
-   [Getting Started](#getting-started)
-   [Running the Application](#running-the-application)
-   [API Endpoints](#api-endpoints)
-   [Database Models](#database-models)
-   [Learning and Gamification Flow](#learning-and-gamification-flow)
-   [Application Pages](#application-pages)
-   [Development Roadmap](#development-roadmap)
-   [Troubleshooting](#troubleshooting)

## Features

-   Duolingo-inspired interface and learning-path layout.
-   Spanish course organized into units, skills, lessons, and exercises.
-   Skill availability states: completed, in progress, available, and
    locked.
-   Multiple-choice, translation, fill-in-the-blank, typed-answer, and
    matching-pair exercise interfaces.
-   Backend answer validation and answer feedback.
-   Hearts deducted for incorrect answers, with a lower limit of zero.
-   XP awards and lesson completion records.
-   Daily XP tracking, streak tracking, and daily-goal progress.
-   Profile page showing learner statistics.
-   Learning-progress page showing completed lessons, course completion
    percentage, and scores.
-   XP leaderboard with the current learner highlighted.
-   Settings interface and placeholder pages for future features.

## Technology Stack

### Frontend

-   Next.js 16 with the App Router
-   React 19
-   TypeScript
-   Tailwind CSS v4
-   `lucide-react` for icons
-   Native `fetch` through a shared API helper

### Backend

-   Python with a virtual environment (`.venv`)
-   FastAPI
-   Uvicorn
-   SQLAlchemy
-   Pydantic
-   SQLite

## Project Structure

The main workspace is `D:\duolingo-clone` on the development machine.

``` text
duolingo-clone/
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── lesson/
│   │   │   └── [lessonId]/
│   │   │       └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── progress/
│   │   │   └── page.tsx
│   │   ├── leaderboard/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   ├── achievements/
│   │   │   └── page.tsx
│   │   ├── shop/
│   │   │   └── page.tsx
│   │   ├── friends/
│   │   │   └── page.tsx
│   │   └── quests/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ExerciseRenderer.tsx
│   │   └── PlaceholderPage.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   └── types.ts
│   ├── package.json
│   └── ...
└── backend/
    ├── app/
    │   ├── __init__.py
    │   ├── main.py
    │   ├── database.py
    │   ├── models.py
    │   ├── seed.py
    │   └── routers/
    │       ├── home.py
    │       └── lessons.py
    ├── database.db
    ├── requirements.txt
    └── .venv/
```

Some files or routes may differ depending on the current state of the
workspace. Keep existing navigation and router code when adding new
features rather than replacing it wholesale.

## Getting Started

### Prerequisites

Install:

-   Node.js and npm
-   Python 3.10 or another version compatible with the installed backend
    dependencies
-   Visual Studio Code (recommended)

### 1. Set up the frontend

Open a terminal in the frontend directory:

``` powershell
cd D:\duolingo-clone\frontend
npm install
```

If dependencies are already installed, this step can be skipped.

### 2. Set up the backend

Open a second terminal:

``` powershell
cd D:\duolingo-clone\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

If PowerShell blocks virtual-environment activation, use the appropriate
local execution-policy setting or activate the environment through VS
Code. Do not delete the environment or database merely to resolve an
unrelated application error.

## Running the Application

Run the backend and frontend in separate terminals.

### Backend

``` powershell
cd D:\duolingo-clone\backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Backend base URL: `http://127.0.0.1:8000`

Interactive API documentation: `http://127.0.0.1:8000/docs`

### Frontend

``` powershell
cd D:\duolingo-clone\frontend
npm run dev
```

Frontend URL: `http://localhost:3000`

The frontend API helper (`frontend/lib/api.ts`) uses
`NEXT_PUBLIC_API_BASE_URL` when set; otherwise it defaults to
`http://127.0.0.1:8000`. Configure CORS in FastAPI to allow the frontend
origin during local development.

## API Endpoints

The following endpoints reflect the routes implemented or described
during development. Check `backend/app/main.py` and the router files for
the exact registered paths.

  ---------------------------------------------------------------------------------------------------------------
  Method                  Endpoint                                                        Purpose
  ----------------------- --------------------------------------------------------------- -----------------------
  GET                     `/`                                                             Backend root/status
                                                                                          response

  GET                     `/health`                                                       Application health
                                                                                          check

  GET                     `/docs`                                                         Interactive Swagger API
                                                                                          documentation

  GET                     `/api/home/`                                                    Home screen, learner
                                                                                          stats, course, units,
                                                                                          skills, lessons, and
                                                                                          progress

  GET                     `/api/home/profile`                                             Learner profile
                                                                                          statistics

  GET                     `/api/home/leaderboard`                                         Users ranked by XP

  GET                     `/api/lessons/{lesson_id}`                                      Retrieve a lesson and
                                                                                          its exercises

  POST                    `/api/lessons/{lesson_id}/exercises/{exercise_id}/validate`     Validate an exercise
                                                                                          answer

  POST                    `/api/lessons/{lesson_id}/exercises/{exercise_id}/heart-loss`   Deduct a heart for an
                                                                                          incorrect answer

  POST                    `/api/lessons/{lesson_id}/complete`                             Save completion/score
                                                                                          and award XP

  GET                     `/api/lessons/progress`                                         Completed lessons,
                                                                                          scores, and overall
                                                                                          completion percentage
  ---------------------------------------------------------------------------------------------------------------

The router prefixes and trailing slashes matter. Confirm actual paths in
`/docs` if an endpoint returns 404.

## Database Models

The application uses SQLite at `backend/database.db` and SQLAlchemy
models for:

1.  `users` --- name, XP, streak, hearts, gems, daily goal, last-active
    date, and daily XP tracking.
2.  `courses` --- course name and language.
3.  `units` --- ordered course units.
4.  `skills` --- ordered skills within a unit.
5.  `lessons` --- ordered lessons within a skill.
6.  `exercises` --- exercise type, question, answer, options/data, and
    order.
7.  `user_skill_progress` --- skill progress and completion state.
8.  `user_lesson_progress` --- lesson completion, score, and completion
    timestamp.

### Relationships

``` text
Course
└── Unit
    └── Skill
        └── Lesson
            └── Exercise

User
├── UserSkillProgress ── Skill
└── UserLessonProgress ── Lesson
```

### Database schema changes

SQLAlchemy's `Base.metadata.create_all()` creates missing tables but
does **not** add new columns to existing SQLite tables. When the
`daily_xp` and `daily_xp_date` fields were added to the `User` model, an
explicit migration was required.

The migration in `backend/app/database.py` should inspect the existing
`users` table and add only missing columns. `init_db()` should call
`migrate_daily_xp()` after `Base.metadata.create_all(bind=engine)`. This
preserves existing records.

## Learning and Gamification Flow

1.  The home API loads the demo learner and Spanish course structure.
2.  The learning path displays units and skill states.
3.  Selecting an accessible skill opens its lesson route.
4.  The lesson page loads exercises from the backend.
5.  The learner submits an answer; the backend validates it.
6.  Incorrect answers trigger feedback and a heart deduction.
7.  Lesson completion saves the score and completion state and awards
    XP.
8.  Daily XP and streak information are updated by the completion flow.
9.  Profile, progress, and leaderboard pages read their data from
    backend APIs.

**Security note:** For a production deployment, calculate scores and
rewards from server-validated answer records rather than trusting
client-supplied correct-answer counts. Add authentication and
authorization before exposing learner data to multiple real users.

## Application Pages

  -----------------------------------------------------------------------
  Route                   Purpose                 Status
  ----------------------- ----------------------- -----------------------
  `/`                     Home and learning path  Core application page

  `/lesson/[lessonId]`    Interactive lesson      Core application page

  `/profile`              Learner details and     Implemented
                          statistics              

  `/progress`             Completion percentage   Implemented
                          and lesson scores       

  `/leaderboard`          XP rankings and         Implemented
                          current-user highlight  

  `/settings`             Sound, animations, and  UI-only settings
                          reminder switches       

  `/achievements`         Future achievements     Placeholder
                          feature                 

  `/shop`                 Future rewards/shop     Placeholder
                          feature                 

  `/friends`              Future social feature   Placeholder

  `/quests`               Future daily-quests     Placeholder
                          feature                 
  -----------------------------------------------------------------------

Settings switches currently update local page state only; they do not
persist after refresh or control actual audio, animations, or
notifications. Placeholder pages are not backed by feature APIs.

## Development Roadmap

### Step 0 --- Project Planning & Structure

-   Create the VS Code workspace and root project folders.
-   Establish `frontend/` and `backend/`.
-   Define the folder structure, stack, database entities, application
    flow, page/component structure, API structure, seed-data scope, UI
    design system, and testing checkpoints.
-   Verify the workspace structure.

### Step 1 --- Next.js Frontend Setup

-   Verify Node.js/npm and create the Next.js TypeScript App Router
    application.
-   Configure Tailwind CSS, global styles, root layout, metadata, and
    the initial home page.
-   Create `lib/api.ts` and `lib/types.ts`.
-   Install required dependencies and verify the development server.

### Step 2 --- FastAPI Backend Setup

-   Verify Python and create/activate `.venv`.
-   Define and install `requirements.txt`.
-   Create the FastAPI application, root and health endpoints, and CORS
    configuration.
-   Verify Uvicorn, `/`, `/health`, and `/docs`.

### Step 3 --- Database & SQLAlchemy Setup

-   Configure SQLite, the SQLAlchemy engine, `SessionLocal`, `Base`, and
    the database dependency.
-   Initialize `backend/database.db`.
-   Verify connection/session handling and health checks.

### Step 4 --- Database Models

-   Define the eight core tables and their relationships.
-   Configure keys, foreign keys, defaults, constraints, and table
    creation.
-   Verify schema and relationships.

### Step 5 --- Seed Data

-   Seed the demo learner, Spanish course, units, skills, lessons,
    exercises, initial progress, and leaderboard users.
-   Make seeding repeatable and safe.
-   Verify record counts, relationships, exercise content, and
    persistence.

### Step 6 --- Home API

-   Retrieve learner stats and the course learning path.
-   Include skill/lesson progress and locking/availability states.
-   Register and test the home router.

### Step 7 --- UI Foundation & Top Bar

-   Establish the design system and typography.
-   Build reusable UI components, top bar, gamification stats, and
    bottom navigation.
-   Integrate the Home API and verify responsive behavior.

### Step 8 --- Learning Path UI

-   Build unit headers, skill nodes, lesson paths, progress/status
    styles, and lesson details.
-   Render units and skills from API data and verify ordering/locking.

### Step 9 --- Skill Navigation

-   Handle locked, available, in-progress, and completed skills.
-   Route learners to the appropriate lesson and verify selection
    behavior.

### Step 10 --- Lesson Page Structure

-   Add the dynamic `/lesson/[lessonId]` route.
-   Build the lesson header, progress bar, exercise layout,
    loading/error states, and exit navigation.

### Steps 11--14 --- Exercise System

-   Implement multiple-choice UI.
-   Build a reusable exercise renderer.
-   Support translation, fill-in-the-blank, typed-answer, and
    matching-pair exercises.
-   Add backend answer validation and feedback.

### Step 15 --- Gamification

-   **15.1 Hearts & feedback:** deduct hearts for incorrect answers and
    prevent negative values.
-   **15.2 XP & completion:** save completion/score, award XP, and show
    the completion screen.
-   **15.3 Streak & daily goal:** update streaks, track daily XP, and
    expose goal progress.

### Step 18 --- Profile, Progress & Leaderboard

-   **18.1 Profile:** show name, total XP, streak, hearts, gems, and
    daily goal.
-   **18.2 Learning progress:** show completed lessons, completion
    percentage, and scores.
-   **18.3 Leaderboard:** rank users by XP and highlight the current
    learner.

### Step 20 --- Settings & Placeholder Features

-   **20.1 Settings page:** add UI switches for sound effects,
    animations, and daily reminders.
-   **20.2 Reusable placeholder component:** create
    `components/PlaceholderPage.tsx`.
-   **20.3 Placeholder routes:** add Achievements, Shop, Friends, and
    Quests pages.
-   **20.4 Navigation:** link to settings and placeholder pages without
    overcrowding the bottom navigation.
-   **20.5--20.6 Verification:** test routes, navigation, and
    regressions.

### Step 21 --- Responsive Design & UI Polish (Next)

-   Verify mobile, tablet, and desktop layouts.
-   Refine spacing, typography, colors, card borders, shadows, and
    button states.
-   Check top/bottom navigation at narrow widths.
-   Test loading, empty, error, and success states.
-   Run a full frontend/backend regression test.

## Troubleshooting

### `sqlite3.OperationalError: no such column: users.daily_xp`

The model contains fields absent from the existing SQLite database.
Ensure the migration function in `backend/app/database.py` adds missing
columns and is called by `init_db()` after
`Base.metadata.create_all(bind=engine)`. Restart Uvicorn and retry the
endpoint. Do not delete the database as a first fix.

### Frontend cannot reach the backend

-   Confirm Uvicorn is running at `http://127.0.0.1:8000`.
-   Check `NEXT_PUBLIC_API_BASE_URL` if configured.
-   Confirm CORS permits `http://localhost:3000`.
-   Open `http://127.0.0.1:8000/docs` and verify the endpoint path.

### A page returns 404

-   Confirm the matching `frontend/app/<route>/page.tsx` exists.
-   Confirm the backend router is included in `main.py`.
-   Check the registered endpoint in `/docs`.

### Changes are not reflected

-   Save the file and inspect the terminal for compilation/runtime
    errors.
-   Restart the relevant development server if hot reload did not
    recover.
-   Avoid replacing whole existing components when only adding a route
    or endpoint.

## License

Add a license before distributing the project publicly.

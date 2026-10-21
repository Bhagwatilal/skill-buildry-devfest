# Skill Buildry AI — From Skill Gap to Skill Proof

**Skill Buildry AI** is an AI-powered career development platform that bridges the chasm between theoretical knowledge and verifiable hiring proof. Instead of collecting passive course certificates, learners discover their exact blind spots, execute targeted milestone sprints, build production-grade projects with a Staff-level AI mentor, and compile verifiable code artifacts into an Evidence Vault.

---

## 🚀 Key Problem Solved

Traditional online learning forces learners into "tutorial hell":
- **Passive consumption:** Completing 40 hours of videos without solving unscripted problems.
- **Generic portfolios:** Building identical, cookie-cutter todo apps that tech hiring managers disregard.
- **Hidden industry gaps:** Candidates remain unaware that product-tier tech companies prioritize automated testing, decoupled architecture, offline reliability, and CI/CD.
- **Interview anxiety:** Inability to articulate technical trade-offs during live technical interviews.

**The Skill Buildry AI Philosophy:**
> *Don't just tell people what skills they are missing. Help them build those skills and prove what they can do.*

---

## ✨ Features & Architecture

### 1. AI Career Gap Matrix (Gemini 3.8 Flash)
- Analyzes candidate profile, self-assessed levels, and weekly time availability.
- Identifies role-specific market benchmarks, categorizing competencies into:
  - **Strong Foundation:** Capabilities meeting production expectations.
  - **Needs Improvement:** Capabilities needing real-world practice.
  - **High Priority:** Critical missing skills required to pass technical screening.

### 2. Transparent Career Readiness Index
- Avoids arbitrary or fabricated numbers.
- Calculated directly from four objective pillars:
  1. **Skill Coverage (40%)**: Proven core competencies.
  2. **Project & Verifiable Evidence (25%)**: Repositories & live apps in the Evidence Vault.
  3. **Roadmap Task Completion (20%)**: Executed sprint tasks.
  4. **Interview Preparation (15%)**: Rubric-graded mock answers.
- Fully transparent breakdown with clear disclaimers (planning indicator, never an employment guarantee).

### 3. Phased Learning Roadmap
- Dynamic 4–5 phase sprint plan tailored to candidate gaps.
- Each task includes:
  - Practical learning objective & industry rationale.
  - Step-by-step implementation instructions.
  - Concrete **Acceptance Criteria (Definition of Done)**.
  - Curated documentation resources.
  - State tracking (`todo`, `in_progress`, `completed`) persisted directly to SQLite.
- Adaptable roadmap capability: recalculate milestones while preserving completed work.

### 4. Proof-of-Work Project Lab
- Recommends three tiered challenges:
  - **Starter Project** (4–8h): Builds initial confidence & local persistence.
  - **Portfolio Project** (10–16h): Multi-skill product module with offline cache & APIs.
  - **Production Challenge** (16–24h): Enterprise-grade architecture, CI/CD, and test suites.
- **Dedicated Staff AI Project Mentor**: Contextual assistant answering questions on architecture, library selection, edge-case test scenarios, and README formatting.

### 5. Technical Interview Simulator
- Category-specific question generator (Fundamentals, Implementation, Debugging, Architecture, Scenarios).
- Interactive answer terminal evaluated against multi-factor rubrics.
- Returns detailed score (0–100), what was explained well, missing concepts, model answer, and interviewer follow-up questions.

### 6. Evidence Vault & Proof Records
- Attach GitHub repositories, live URLs, and architecture decisions to specific skills.
- AI Reviewer audits submissions to suggest enhancements (ADRs, test badges, documentation).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons |
| **Backend** | Express 4.x running in Node 22 (`server.ts`) |
| **Database** | Node 22 built-in Native SQLite (`node:sqlite` / `DatabaseSync`) at `data/skillsprint.db` |
| **AI Integration** | Google GenAI SDK (`@google/genai`) with `gemini-3.8-flash` |
| **Authentication** | Cryptographic password hashing (`crypto.scryptSync`), token session management |
| **Build & Tooling** | Vite 8, TSX, Node.js Native Test Runner (`node:test`) |

---

## 📂 Project Structure

```
├── data/                         # SQLite database storage (persisted on disk)
│   └── skillsprint.db
├── server/
│   ├── db.ts                     # Schema definitions, queries, password hashing, demo seeder
│   └── gemini.ts                 # Server-side Gemini services with structured parsing
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── AppSidebar.tsx    # Desktop & mobile responsive sidebar
│   │       ├── Topbar.tsx        # Action header, quick controls, sync indicators
│   │       └── AuthModal.tsx     # Registration, login, and instant demo shortcut
│   ├── context/
│   │   └── AuthContext.tsx       # Session management & user state
│   ├── pages/
│   │   ├── LandingPage.tsx       # Public showcase & value proposition
│   │   ├── OnboardingPage.tsx    # Multi-step conversational profile builder
│   │   ├── DashboardPage.tsx     # Career Readiness, Today's Sprint, Weekly activity
│   │   ├── SkillProfilePage.tsx  # Categorized skill library & assessments
│   │   ├── SkillGapPage.tsx      # Role comparison matrix & priority breakdown
│   │   ├── RoadmapPage.tsx       # Phased milestone tasks with acceptance criteria
│   │   ├── ProjectLabPage.tsx    # Tiered project challenges & AI project mentor
│   │   ├── InterviewPrepPage.tsx # Rubric-graded technical interview simulator
│   │   ├── EvidencePage.tsx      # Evidence Vault for GitHub repos & live links
│   │   └── SettingsPage.tsx      # Profile editing, AI info, and demo data reset
│   ├── services/
│   │   └── api.ts                # Client API service communicating with Express backend
│   ├── types/
│   │   └── index.ts              # Strongly typed data models
│   ├── utils/
│   │   ├── scoring.ts            # Decoupled scoring logic & career readiness calculation
│   │   └── scoring.test.ts       # Native unit tests (node:test)
│   ├── App.tsx                   # Main root view router & state orchestration
│   ├── index.css                 # Midnight navy theme & custom styles
│   └── main.tsx                  # React entry point
├── server.ts                     # Full-stack server entry mounting Vite middleware in dev
├── package.json
└── tsconfig.json
```

---

## 🔒 Security & Credentials

- **Zero Client-Side API Key Exposure:** `@google/genai` is imported and called strictly on the Express backend (`server/gemini.ts`). The frontend communicates only through authenticated `/api/*` routes.
- **Environment Variable:** `process.env.GEMINI_API_KEY` is injected automatically by Google AI Studio.
- **Telemetry Header:** Sets `'User-Agent': 'aistudio-build'` in `httpOptions` as required.
- **Password Hashing:** Passwords hashed with 64-byte scrypt salts and validated with constant-time equality checks.

---

## 🧪 Running Unit Tests

SkillSprint AI logic is decoupled and tested using Node's native test runner:

```bash
npm run test
# or: node --test src/utils/scoring.test.ts
```

Tests verify:
- Categorical level conversions.
- Roadmap task completion calculations.
- Multi-pillar Career Readiness scoring.
- Today's sprint task filtering and prioritization.

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Launch full-stack dev server (Express + Vite)
npm run dev

# App runs at http://localhost:3000
```

---

## 🚢 Production Deployment

```bash
# 1. Build frontend assets
npm run build

# 2. Start production server
npm start
```

---

## 📝 Demo Showcase (DevFest Pune 2026)

To test the application immediately without registration:
1. Click **"Explore Demo"** on the landing page or in the Sign In dialog.
2. Automatically logs into the pre-seeded **Bhagwatilal Joshi** profile:
   - **Target Role:** Flutter Developer (Mid-Level)
   - **Pre-analyzed Gaps:** Automated Testing, Riverpod State, CI/CD pipelines.
   - **Roadmap:** 5 structured tasks with acceptance criteria.
   - **Project Lab:** 3 scoped challenges with working AI Project Mentor.
   - **Evidence Vault:** Attached GitHub repository with AI feedback.
3. To reset to the pristine demo state at any time, go to **Settings > Reset Demo Data**.

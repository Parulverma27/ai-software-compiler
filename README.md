# AI Software Compiler & Dynamic Runtime

> *Not just a prompt wrapper—a rigorous, multi-stage compiler that brings deterministic system design to LLM application generation.*

This project is a deterministic AI generation pipeline that acts as a software compiler. It translates open-ended natural language intent into strict, validated, and instantly executable application architectures (Database, API, UI, and Authentication rules).

---

## 🎯 The Problem it Solves
Typical LLM code generators spit out flat text files or unverified code snippets that hallucinate variable names or mismatch API endpoints. 

This system solves that by treating AI like a **compiler**:
1. It breaks generation into strict, isolated architectural layers.
2. It programmatically validates cross-layer consistency (e.g., ensuring a UI table requests an API endpoint that actually exists).
3. If the LLM hallucinates, an **Intelligent Repair Engine** surgically patches the broken JSON instead of blindly retrying from scratch.
4. The output is fed into a **Dynamic Sandbox Runtime**, which provisions an in-memory DB and virtual API, proving the schema is execution-ready.

---

## 🚀 Core Architecture (The Pipeline)

### 1. Intent Extraction (Stage 1)
Parses the user's open-ended instructions to identify implied user personas, core database entities, and extracts any conflicting or vague ambiguities into an Intermediate Representation (IR).

### 2. System Design Layer (Stage 2)
Takes the IR and designs the relational architecture, setting up join constraints, component layouts, and role-based security scopes.

### 3. Schema Generation (Stage 3)
Generates a massive, strictly enforced JSON `AppSchema` that maps to typescript interfaces covering:
* `dbSchema`: Tables, columns, and foreign keys.
* `apiSchema`: REST endpoints mapping to specific DB operations.
* `uiSchema`: Dashboards, data tables, and forms.
* `authSchema`: Role-Based Access Control (RBAC) and permissions.

### 4. Validation & Repair Engine (Stage 4)
The generated schema is checked against programmatic validators. If the UI references a non-existent API, or a DB table is missing a primary key, the system extracts those specific errors and runs a targeted **Self-Repair LLM Loop** to patch the inconsistencies.

---

## 🧪 Execution & Simulation
To prove the generated output is execution-aware, the project includes a **Sandbox Runtime**:
* **Virtual Database:** Instantiates an in-memory database using the generated `dbSchema`.
* **Virtual API Gateway:** Simulates an Express-like router that handles `SELECT`, `INSERT`, and `UPDATE` operations over the virtual DB.
* **Dynamic UI Renderer:** Renders React components (Stat Cards, Data Tables, Forms) dynamically based on the generated `uiSchema`, wired to the virtual API. 

*(You can literally fill out a generated form in the browser, hit submit, and watch the virtual database tables update).*

---

## 📊 Evaluation Framework
The repository includes a rigorous benchmarking suite located in `src/evaluation`.
* **20 Prompts:** 10 real-world product prompts + 10 edge cases (vague, conflicting, incomplete).
* **Metrics Tracked:** Evaluates the compiler across Success Rate, Generation Latency, Cost estimation (Tokens -> USD), and Repair Engine retries.
* **Failure Handling:** Intentionally vague prompts trigger assumptions which are explicitly documented in the IR logs rather than crashing the compiler.

---

## 🛠️ Tech Stack
* **Frontend:** React 18, Vite, TypeScript, TailwindCSS / Custom CSS Modules
* **LLM Providers:** Abstracted interfaces supporting Google Gemini, OpenAI, Claude, and Mock fallback.
* **Runtime:** In-memory TypeScript data structures simulating a full backend environment.

---

## 💻 Getting Started (Running Locally)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YourUsername/ai-software-compiler.git
   cd ai-software-compiler
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:** Navigate to `http://localhost:3000` to interact with the compiler, view the compilation pipeline in real-time, and test the Sandbox Runtime.

---

*This project was built to demonstrate high-agency system design, execution awareness, and rigorous LLM control for the Base44 AI Engineering assignment.*

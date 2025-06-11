# 🧠 Mini AI Forge

Mini AI Forge is a smart backend system designed to accept user prompts and tool selection (web search or calculator), process the input via intelligent services, and return a friendly, AI-generated response — all while leveraging Redis for lightning-fast caching and SQL for persistent storage.

---

## ⚙️ System Flow

1. **Frontend** sends a request to `POST /api/v1/query` with:
   - `prompt` (text)
   - `userId` (string/UUID)
   - `tool` (enum: `web_search` | `calculator`)

2. **Backend Workflow**:
   - 🔍 **Step 1**: Check **Redis cache** using a unique key generated from:

     ```
     ${userId}:${tool}:${prompt}
     ```

   - ⚡ **If matched**: Return cached response instantly (`0ms latency`).
   - 🧠 **If not matched**:
     - Route request to respective service:
       - 🧮 **Calculator Service**
       - 🌐 **Web Search Service** (fetches top result)
     - Generate **raw output** from the selected service.

3. **AI Processing**:
   - Send raw output to **Gemini LLM** to generate a **friendly and human-readable** response.

4. **Storage**:
   - 🔁 Save the friendly response in **Redis** cache:
     - Top 10 prompts by user.
     - Stored with **timestamp** for freshness.
   - 🗃️ Save full record in **PostgreSQL**:

     ```sql
     id SERIAL PRIMARY KEY,
     userId TEXT NOT NULL,
     prompt TEXT NOT NULL,
     tool TEXT NOT NULL,
     response TEXT NOT NULL,
     timestamp TIMESTAMPTZ NOT NULL,
     tokens INTEGER NOT NULL
     ```

5. ✅ Final response is returned to the **frontend** for display.

---

## 📌 Key Features

- ⚡ **0ms Latency** on repeated prompt queries via Redis caching.
- 🧠 **AI-Generated Responses** using Gemini.
- 🧮 **Custom Tool Routing** (Web Search / Calculator).
- 💾 **Redis + SQL Persistence** for high performance and durability.
- 🔐 **Unique Cache Keys** for each user/tool/prompt combo.

---

## 🧪 Example Request

```json
POST /api/v1/query

{
  "userId": "user123",
  "prompt": "23 * 42",
  "tool": "calculator"
}
```
**🐳 Docker Setup**

Step 1: Go to the root directory
```bash
cd mini-agent-forge/
```
Step 2: Run Docker Compose
``` bash
docker-compose up --build
```
This will spin up:

Backend

Frontend

PostgreSQL

Redis

Once started:

Backend: http://localhost:8082

Frontend: http://localhost:4173



🧰 Local Development Setup
✅ Prerequisites
Node.js v20+

npm

PostgreSQL

Redis

🔧 Backend Setup
Navigate to backend directory:

```bash
cd apps/backend
```
Install dependencies:
``` bash
npm install
```

**Create a .env file:**

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mini_agent"
REDIS_URL="redis://localhost:6379"
GEMINI_API_KEY="api key"
GEMINI_MODEL = "model"
NODE_ENV = "development"
LOG_LEVEL = "info"
REDIS_URL= "redis://localhost:6379"
NODE_ENV="development"
SSL_KEY_PATH=""
SSL_CERT_PATH=""
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW="1 minute"
PORT=3000
```
Start the backend server:

```bash
npm dev
```
Server will run at: http://localhost:8082

🌐 Frontend Setup
Navigate to frontend directory:

```bash
cd apps/frontend
```
Install dependencies:
```bash
npm install
```
Start the Vite development server:
```bash
npm dev
```
Frontend will be live at: http://localhost:5173

👨‍💻 Author
Sayan Ghosh
Full Stack Developer | AI-Driven Backend Architect

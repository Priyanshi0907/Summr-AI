# SummrAI — AI-Powered Email & Article Summarizer

> **Summarize Anything. Understand Everything.**
> From emails to research papers, SummrAI delivers accurate, intelligent summaries in seconds — saving you hours every week.

![SummrAI Dashboard](docs/screenshot-dashboard.png)

---

## ✨ Features

| Feature | Description |
|---|---|
| **Multi-format summarization** | Emails, articles, PDFs, research papers, blog posts |
| **3 summary lengths** | Short (2-3 sentences), Medium (1-2 paragraphs), Detailed (3-4 paragraphs) |
| **Structured extraction** | Bullet points, key takeaways, action items, names & dates |
| **Sentiment analysis** | Tone detection with score and explanation |
| **Smart email assistant** | Detect structure + generate professional/casual/follow-up replies |
| **Content repurposing** | Tweet threads, LinkedIn posts, TLDR, executive summaries, blog outlines, meeting notes |
| **Export** | PDF, DOCX, Markdown, plain text |
| **History & search** | Full searchable history with favorites, sort, delete |
| **Analytics** | Usage charts, word counts, time saved metrics |
| **Chrome extension** | Gmail integration + floating article summarizer |
| **Multiple AI models** | BART Large CNN, DistilBART, T5 (switchable) |

---

## 🏗 Tech Stack

### Frontend
- **Next.js 15** (App Router, Server Components)
- **TypeScript** — full type safety
- **Tailwind CSS** — utility-first styling
- **Framer Motion** — page transitions & animations
- **Shadcn/UI** — accessible component library
- **Zustand** — lightweight state management
- **Recharts** — analytics charts
- **React Hook Form + Zod** — form validation

### Backend
- **FastAPI** — high-performance async Python API
- **HuggingFace Transformers** — BART, DistilBART, T5
- **SQLAlchemy (async)** — ORM with PostgreSQL
- **Pydantic v2** — request/response validation

### Infrastructure
- **Clerk** — authentication & user management
- **Supabase** — PostgreSQL database + file storage
- **Vercel** — frontend deployment
- **Render** — backend deployment
- **Docker Compose** — local development

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL 15+ (or use Supabase)
- [Clerk account](https://clerk.com) (free)

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/summrai.git
cd summrai
```

### 2. Frontend setup

```bash
cd frontend
cp .env.local.example .env.local
# Fill in your keys (see Environment Variables section)
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Frontend runs at → `http://localhost:3000`

### 3. Backend setup

```bash
cd backend
cp .env.example .env
# Fill in your keys
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs at → `http://localhost:8000`
API docs at → `http://localhost:8000/docs`

### 4. Docker (alternative)

```bash
# Copy both env files first
cp frontend/.env.local.example frontend/.env.local
cp backend/.env.example backend/.env
# Edit both files with your keys

docker compose up --build
```

---

## 🔑 Environment Variables

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

NEXT_PUBLIC_API_URL=http://localhost:8000

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

DATABASE_URL=postgresql://postgres:password@localhost:5432/summrai
DIRECT_URL=postgresql://postgres:password@localhost:5432/summrai
```

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/summrai

CLERK_SECRET_KEY=sk_test_...
CLERK_JWKS_URL=https://your-app.clerk.accounts.dev/.well-known/jwks.json

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

HF_MODEL_BART=facebook/bart-large-cnn
HF_MODEL_DISTILBART=sshleifer/distilbart-cnn-12-6
HF_MODEL_T5=t5-base
HF_CACHE_DIR=./models_cache
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/summarize` | Summarize text |
| `POST` | `/summarize/repurpose` | Repurpose content |
| `POST` | `/reply` | Analyze email + generate reply |
| `GET` | `/history` | Get summary history |
| `DELETE` | `/history/{id}` | Delete summary |
| `PATCH` | `/history/{id}/favorite` | Toggle favorite |
| `GET` | `/export/{id}?format=pdf` | Export summary |
| `POST` | `/upload` | Upload PDF/TXT file |
| `GET` | `/models` | List available AI models |
| `GET` | `/analytics` | Usage analytics |

### Summarize request body

```json
{
  "text": "Your text here...",
  "length": "short | medium | detailed",
  "options": ["bullets", "takeaways", "actions", "names", "sentiment"],
  "model": "bart | distilbart | t5",
  "content_type": "text | email | article | pdf"
}
```

---

## 🌐 Deployment

### Frontend → Vercel

```bash
cd frontend
npx vercel --prod
```

Set all environment variables in the Vercel dashboard under **Settings → Environment Variables**.

### Backend → Render

1. Push backend to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from `.env.example`

### Database → Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy the **Connection String** (Transaction mode)
3. Set as `DATABASE_URL` in both frontend and backend
4. Run `npx prisma db push` to create tables

---

## 🧩 Chrome Extension

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `chrome-extension/` folder

**Features:**
- Right-click any selected text → "Summarize with SummrAI"
- Gmail integration: "Summarize" button appears on emails
- Floating ✨ button on any article page
- History stored in Chrome storage

---

## 🧪 Tests

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend type checking
cd frontend
npm run type-check

# Frontend linting
npm run lint
```

---

## 📁 Project Structure

```
summrai/
├── frontend/                    # Next.js 15 app
│   ├── app/
│   │   ├── page.tsx             # Landing page
│   │   ├── layout.tsx           # Root layout (Clerk)
│   │   ├── dashboard/           # Protected dashboard
│   │   │   ├── page.tsx         # Summarize
│   │   │   ├── history/         # History
│   │   │   ├── analytics/       # Analytics
│   │   │   ├── email/           # Email assistant
│   │   │   └── repurpose/       # Content repurpose
│   │   └── sign-in / sign-up/
│   ├── components/
│   │   ├── dashboard/           # StatCard, etc.
│   │   └── summarize/           # InputPanel, OutputPanel
│   ├── store/                   # Zustand stores
│   ├── services/                # API service layer
│   ├── hooks/                   # Custom React hooks
│   └── prisma/schema.prisma     # Database schema
│
├── backend/                     # FastAPI
│   ├── main.py                  # App entry point
│   └── app/
│       ├── api/routes/          # All API routes
│       ├── core/                # Config, database
│       ├── models/              # SQLAlchemy models
│       ├── schemas/             # Pydantic schemas
│       ├── services/            # AI, email, repurpose
│       ├── middleware/          # Auth, rate limiting
│       └── utils/               # Text, export utils
│
├── chrome-extension/            # Browser extension
│   ├── manifest.json
│   ├── background.js
│   ├── popup/                   # Extension popup UI
│   └── content/                 # Gmail + article scripts
│
├── docker-compose.yml
└── README.md
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ using Claude AI, Next.js, and FastAPI.

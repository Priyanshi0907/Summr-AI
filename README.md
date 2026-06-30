# SummrAI

**Turn walls of text into clear insights.**

SummrAI is an AI-powered summarization platform that condenses emails, articles, research papers, and PDFs into structured, actionable summaries in seconds. Built with enterprise-grade AI models and a clean, modern interface.

🔗 **Live app:** [summr-ai-delta.vercel.app](https://summr-ai-delta.vercel.app)

---

## ✨ Features

- **Multi-format summarization** — Paste emails, articles, blogs, research papers, or any text and get short, medium, or detailed summaries instantly.
- **Structured extraction** — Auto-extract bullet points, key takeaways, action items, names, dates, and questions answered.
- **Sentiment & readability analysis** — Get sentiment scores, reading time estimates, compression ratio, and difficulty level at a glance.
- **Content repurposing** — Transform any text into a tweet thread, LinkedIn post, executive summary, or meeting notes in one click.
- **Smart email assistant** — Detects greeting, body, and signature, and auto-generates professional, casual, or follow-up replies.
- **Export anywhere** — Download summaries as PDF, DOCX, Markdown, or plain text. Full history with search, filter, and favorites.
- **Analytics dashboard** — Track usage, time saved, and summary trends over time.
- **Secure authentication** — User accounts and session management handled via Clerk.

---

## 📸 Screenshots

> _Add screenshots or a demo GIF here_

| Landing Page | Dashboard | Summary Output |
|---|---|---|
| `screenshot-landing.png` | `screenshot-dashboard.png` | `screenshot-output.png` |

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** (App Router) — React framework with server components
- **[TypeScript](https://www.typescriptlang.org/)** — type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** — utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** — animations and transitions
- **[Clerk](https://clerk.com/)** — authentication and user management
- **[Radix UI](https://www.radix-ui.com/)** — accessible, unstyled UI primitives
- **[Recharts](https://recharts.org/)** — analytics data visualization
- **[Zustand](https://github.com/pmndrs/zustand)** — lightweight state management
- **[React Hook Form](https://react-hook-form.com/)** + **[Zod](https://zod.dev/)** — form handling and validation
- **[Axios](https://axios-http.com/)** — HTTP client for API requests

### Backend
- **[FastAPI](https://fastapi.tiangolo.com/)** — high-performance Python web framework
- **[SQLAlchemy](https://www.sqlalchemy.org/)** (async) + **[asyncpg](https://github.com/MagicStack/asyncpg)** — database ORM and PostgreSQL driver
- **[Alembic](https://alembic.sqlalchemy.org/)** — database migrations
- **[Hugging Face Transformers](https://huggingface.co/docs/transformers)** — AI summarization models (BART, DistilBART, T5)
- **[PyTorch](https://pytorch.org/)** — deep learning backend for model inference
- **[Supabase](https://supabase.com/)** — PostgreSQL database hosting and file storage
- **[python-jose](https://github.com/mpdavis/python-jose)** — JWT verification for Clerk-authenticated requests
- **[PyMuPDF](https://pymupdf.readthedocs.io/)** — PDF text extraction
- **[ReportLab](https://www.reportlab.com/)** + **[python-docx](https://python-docx.readthedocs.io/)** — PDF and DOCX export generation
- **[SlowAPI](https://github.com/laurentS/slowapi)** — rate limiting

### Infrastructure
- **[Vercel](https://vercel.com/)** — frontend hosting and deployment
- **[Render](https://render.com/)** — backend hosting (Dockerized FastAPI service)
- **[Supabase](https://supabase.com/)** — managed PostgreSQL database and file storage bucket

---

## 📁 Project Structure

```
summrai/
├── frontend/                  # Next.js application
│   ├── app/                   # App Router pages and layouts
│   │   ├── dashboard/         # Authenticated dashboard routes
│   │   ├── sign-in/           # Clerk sign-in page
│   │   ├── sign-up/           # Clerk sign-up page
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable UI components
│   ├── services/              # API client functions (axios)
│   ├── store/                 # Zustand state stores
│   ├── hooks/                 # Custom React hooks
│   ├── middleware.ts          # Clerk auth middleware
│   └── package.json
│
├── backend/                   # FastAPI application
│   ├── app/
│   │   ├── api/routes/        # API endpoint routers
│   │   ├── core/              # Config and database setup
│   │   ├── middleware/        # Auth and rate-limiting middleware
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # AI, email, and repurposing logic
│   │   └── utils/             # Text and export utilities
│   ├── tests/                 # API and service tests
│   ├── main.py                # FastAPI app entry point
│   ├── requirements.txt
│   └── Dockerfile
│
└── README.md
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11
- **PostgreSQL** database (or a [Supabase](https://supabase.com/) project)
- A **[Clerk](https://clerk.com/)** account for authentication keys

### 1. Clone the repository

```bash
git clone https://github.com/Priyanshi0907/Summr-AI.git
cd Summr-AI
```

### 2. Backend setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in `backend/` (use `.env.example` as a reference):

```env
DATABASE_URL=postgresql+asyncpg://<user>:<password>@<host>:5432/<database>
CLERK_SECRET_KEY=sk_test_xxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxx
CLERK_JWKS_URL=https://your-clerk-instance.clerk.accounts.dev/.well-known/jwks.json
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-key
SUPABASE_BUCKET=summrai-uploads
HF_MODEL_BART=facebook/bart-large-cnn
HF_MODEL_DISTILBART=sshleifer/distilbart-cnn-12-6
HF_MODEL_T5=t5-base
HF_CACHE_DIR=./models_cache
DEBUG=false
RATE_LIMIT_PER_MINUTE=20
MAX_TEXT_LENGTH=50000
```

Run the backend server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxx
CLERK_SECRET_KEY=sk_test_xxxx
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Run the frontend dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### 4. Run tests

Backend:
```bash
cd backend
pytest
```

Frontend:
```bash
cd frontend
npm run test
```

---

## 🌐 Deployment

This project is deployed as two independently hosted services:

- **Frontend** → [Vercel](https://vercel.com/), auto-deploys from the `main` branch
- **Backend** → [Render](https://render.com/), Dockerized FastAPI service, auto-deploys from the `main` branch

The frontend communicates with the backend over HTTPS using the `NEXT_PUBLIC_API_URL` environment variable. Both services must have matching CORS configuration (`ALLOWED_ORIGINS` in `backend/app/core/config.py`) and valid Clerk keys for authentication to work correctly across environments.

> **Note:** The backend runs on Render's free tier, which spins down after periods of inactivity. The first request after idle time may take 30–50 seconds while the instance wakes up.

---

## 🔐 Authentication

User authentication is handled entirely by [Clerk](https://clerk.com/), supporting sign-up, sign-in, and session management out of the box. Protected routes (e.g. `/dashboard/*`) are guarded via Clerk middleware on the frontend, and API requests are authenticated on the backend by verifying Clerk-issued JWTs against the Clerk JWKS endpoint.

---

## 🤝 Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to your branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the terms specified in the [LICENSE](./LICENSE) file.

---

## 👤 Author

**Priyanshi Choudhary**
GitHub: [@Priyanshi0907](https://github.com/Priyanshi0907)

---

Built with ❤️ using Claude AI.
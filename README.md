# Rekrut AI — AI-Powered Recruitment Platform

## Architecture

```
Frontend (Vite + React + shadcn/ui) ←→ Backend API (Express + Prisma + OpenAI)
                                              ↓
                                       Neon PostgreSQL
```

## Quick Start

### Backend
```bash
cd api
cp .env.example .env  # Fill in your values
npm install
npx prisma db push    # Push schema to database
npm run dev           # Start on port 3001
```

### Frontend
```bash
cd app
npm install
npm run dev           # Start on port 5173
```

## Features
- AI Interview Coach — Practice interviews with AI feedback
- AI Skill Assessments — Auto-generated, auto-graded
- AI Profile Matching — Smart candidate-job matching (coming)
- Recruiter Dashboard — Pipeline management (coming)

## Deployment
- Frontend: Vercel/Netlify (static)
- Backend: Render/Railway (Node.js)
- Database: Neon (serverless PostgreSQL)

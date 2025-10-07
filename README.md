# Article Autocomplete

A full-stack demo project for building a scalable, accessible autocomplete system using Node.js, Redis, and vanilla JavaScript.

## Features
- Fast, in-memory radix tree for backend prefix search
- Real-time popularity tracking and synchronization with Redis
- Accessible, debounced, and keyboard-friendly frontend
- Monorepo structure: `backend/` (Node.js + Redis) and `frontend/` (vanilla JS)

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- Redis (Upstash or local)

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/gkoos/article-autocomplete.git
   cd article-autocomplete
   ```
2. Install dependencies for both backend and frontend:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Configure Redis:
   - Copy `.env.example` to `.env` in `backend/` and set your `REDIS_URL`.

### Running Locally
- Start the backend:
  ```bash
  cd backend
  npm run dev
  ```
- Start the frontend:
  ```bash
  cd ../frontend
  npm run dev
  ```
- Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
```
article-autocomplete/
├── backend/   # Node.js + Redis backend
├── frontend/  # Vanilla JS frontend
├── .gitignore
└── README.md
```

## License
MIT

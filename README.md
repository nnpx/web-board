# Full-Stack Webboard

A modern, full-stack discussion forum application designed with a modern UI, robust real-time database capabilities, and rich-text editing features.

## Features

- **User Authentication**: Secure Login and Sign-up system using JWT and HttpOnly cookies, protecting sensitive routes.
- **Modern UI & UX**: Built carefully with React, Tailwind CSS, and Shadcn UI. Features responsive layouts, typography & themes, and smooth Loading Skeletons for optimistic loading.
- **Rich Text Editing**: Powered by `react-quill`, enabling rich post content, custom formatting, bulleted lists, and image insertions.
- **Advanced State & Routing**: Comprehensive Single Page Application (SPA) functionality powered by React Router. 
- **Rooms & Categories**: Organize posts by topics (e.g., Technology, Sports, Entertainment, Education).
- **Interactive Discussions**: Create, view, delete, and engage with posts through replies. Includes view counts tracking.
- **Service/Controller Backend**: Cleanly architected backend isolating Express routing from business logic controller implementations. Database schemas are highly modularized via Drizzle ORM.

## Technology Stack

### Frontend
- **React (Vite)**
- **TypeScript**
- **Tailwind CSS v4**
- **Lucide React** (Icons)
- **Shadcn UI** (Accessible primitives: Dialog, Card, Input, Tabs, Skeleton)
- **React Router Dom** 
- **React Quill** (Rich Text Editor)
- **Axios** (Data fetching)

### Backend
- **Node.js & Express**
- **TypeScript**
- **Drizzle ORM** (Type-safe Object Relational Mapper)
- **PostgreSQL**
- **Bcrypt & JSONWebToken** (Authentication)
- **Cors & Cookie Parser**
- **Zod** (Validation)

## API Routes

### Authentication (`/api/auth`)
- `POST /signup` – Register a new user
- `POST /login` – Log in and receive an HttpOnly JWT cookie
- `POST /logout` – Clear the authentication cookie
- `GET /me` – Retrieve the currently authenticated user session

### Rooms (`/api/rooms`)
- `GET /` – Fetch all available discussion rooms

### Posts (`/api/posts`)
- `GET /` – Retrieve posts (Supports query parameters: `roomId`, `search`, `sort`)
- `POST /` – Create a new post (*Requires Authentication*)
- `GET /:id` – Fetch a specific post by its ID
- `POST /:id/view` – Increment the view count for a post
- `DELETE /:id` – Delete a post (*Requires Authentication & Ownership*)
- `GET /:postId/replies` – Retrieve all replies associated with a post
- `POST /:postId/replies` – Submit a new reply to a post (*Requires Authentication*)

### Replies (`/api/replies`)
- `PUT /:id` – Edit an existing reply (*Requires Authentication & Ownership*)
- `DELETE /:id` – Delete a reply (*Requires Authentication & Ownership*)

## 📂 Project Structure

```text
web-board/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Business logic handlers
│   │   ├── db/
│   │   │   └── schema/       # Drizzle schemas (users, posts, rooms, replies)
│   │   ├── middleware/       # Express middlewares (auth, global error handler)
│   │   ├── routes/           # Express API endpoints mapping
│   │   └── index.ts          # Express server entry point
│   ├── .env                  # Backend environment variables
│   └── seed.ts               # Database migration & seeding script
│
└── frontend/
    ├── src/
    │   ├── components/ui/    # Reusable Shadcn UI components
    │   ├── lib/              # Utility functions (Axios base configuration, cn)
    │   ├── pages/            # Application views (Feed, Auth, Create Post, Detail)
    │   ├── types/            # Global TypeScript definitions (User, Post, Reply, Room)
    │   ├── App.tsx           # Main application routing and navigation shell
    │   └── index.css         # Global styles and Tailwind configurations
    └── index.html            # Vite entry point
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### 1. Starting the Backend

Navigate to the `backend` directory and install dependencies:

```bash
cd backend
npm install
```

Configure your environment variables by creating a `.env` file in the `backend` directory (e.g., `DATABASE_URL` and `JWT_SECRET`).

Run database migrations/seeding:
```bash
npx tsx seed.ts
```

Start the backend development server:
```bash
npm run dev
```
*(Server typically runs on http://localhost:3000)*

### 2. Starting the Frontend

Open a new terminal window, navigate to the `frontend` directory, and install dependencies:

```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

Visit the frontend natively at `http://localhost:5173`.

---
*Developed with focus on maintainability, aesthetics, and robust TypeScript conventions.*

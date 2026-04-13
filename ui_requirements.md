# UI/UX Overview
You are building the React frontend for a full-stack Webboard application. You must strictly follow these design guidelines to create a polished, responsive, and cohesive user interface.

# Frontend Tech Stack
- Framework: React (via Vite)
- Routing: React Router DOM
- Styling: Tailwind CSS
- Component Library: shadcn/ui (Use components like Card, Button, Input, Form, Dialog/Modal, DropdownMenu)
- Icons: Lucide React
- Rich Text Editor: React Quill
- API Client: Axios (Must be configured with `withCredentials: true` to handle HttpOnly cookies from the backend)

---

# Global Theme & Color Palette (Vibrant Community)
The app should feel warm, inviting, and clearly organized. Configure the `tailwind.config.js` to support these base rules:

**Base Colors:**
- **Background:** Soft, warm beige (e.g., `bg-stone-50` or `#FDFBF7`)
- **Text:** Dark charcoal for readability (`text-slate-800`)
- **Cards/Surfaces:** Pure white (`bg-white`) with soft, diffuse shadows (`shadow-sm` or `shadow-md`).

**Room Accent Colors (For Badges and Highlights):**
Each of the 5 rooms must have a distinct color pair (background + text) used for category badges and active UI states.
1. **Technology:** Teal (`bg-teal-100 text-teal-800`)
2. **Sports:** Orange (`bg-orange-100 text-orange-800`)
3. **Entertainment:** Pink/Purple (`bg-fuchsia-100 text-fuchsia-800`)
4. **Education:** Blue (`bg-blue-100 text-blue-800`)
5. **General Discussion:** Amber/Yellow (`bg-amber-100 text-amber-800`)

---

# Layout & Navigation Strategy

**Global Layout:**
Use a persistent **Left Sidebar** layout on desktop, collapsing into a top navbar with a hamburger menu on mobile devices.

**Sidebar Contents:**
1. **App Logo/Title:** Bold and vibrant at the top.
2. **Search Bar:** An input field that triggers a search query (`/api/posts?search=...`).
3. **Navigation Links:** - "All Posts" (Home)
   - A list of the 5 Rooms. The active room should be highlighted using its specific Accent Color.
4. **Bottom Anchor (Auth):**
   - If logged out: "Log In" and "Sign Up" buttons.
   - If logged in: Display the `username` and a "Log Out" button.

---

# Core Screens & Components

**1. Authentication Pages (Login / Sign Up)**
- Display a clean, centered shadcn `Card` on the soft beige background.
- Use shadcn `Form` and `Input` components. 
- Show clear error messages if authentication fails.

**2. Main Feed / Room View (Card Layout)**
- **Header:** Display the name of the current room (or "All Posts") and a prominent "Create Post" button.
- **Post Cards:** Map through the fetched posts and display them as shadcn `Card` components.
  - **Card Content:** Post Title (bold, large), Author Username, Date, Views Count, and the Room Badge (colored).
  - **Content Preview:** Show a 2-line snippet of the post's content. *Important: Strip HTML tags from the Rich Text string before showing the preview snippet so it renders as plain text on the card.*
  - **Interaction:** Clicking the card navigates to `/posts/:id`.
- **Empty State:** If a room has no posts or a search yields no results, display a friendly, centered illustration or text (e.g., "No posts here yet. Be the first!").

**3. Create Post (Modal or Dedicated Page)**
- A form containing:
  - Title input.
  - A Dropdown/Select menu to choose the Room.
  - **React Quill Editor:** For the post body. Configure the toolbar to allow Bold, Italic, Bullet Lists, and Image URLs.
  - "Submit" button.

**4. Post Detail Page (`/posts/:id`)**
- **Original Post:** Display the full Title, Author, Date, and colored Room Badge.
- **Body:** Render the raw HTML string saved in the database. Use a wrapper `div` with styling to ensure embedded `<img src="...">` tags do not exceed the width of the container (`max-w-full`).
- **Owner Actions:** If the currently authenticated user's ID matches the post's `user_id`, display a red "Delete Post" button. This must trigger an alert dialogue to confirm before executing the `DELETE` API call.
- **Reply History:** Display all replies in a vertical, chronological list. Each reply should show the author, date, and their content.
- **Add Reply:** At the bottom of the page, render a smaller React Quill editor and a "Reply" button.
## Tools
- Next.js
- Cursor
- Supabase
- Vercel
- N8N (Chat in web-site and WhatsApp Bot)

## Improvement Points

* Improve the security of **N8N Webhooks** using **API keys** and **IP whitelisting**, and apply the same principle to **Next.js routes**.
* Allow users to send **multiple messages at once** in the site chat.
* When a task is created via **WhatsApp** or **Website Chat**, update the **To-Do list** in real time without reloading the page.
* When the **AI Agent** doesn’t understand a task, add a validation algorithm to avoid wasting tokens generating a fixed fallback message.

# To-Do List - Challenge

A task management application built with **Next.js 15**, **TypeScript**, **TailwindCSS**, and **Supabase**.

## 🚀 Technologies

* **Next.js 15** (App Router)
* **TypeScript**
* **TailwindCSS**
* **Supabase**

## 📋 Prerequisites

* Node.js 18+ installed
* A Supabase account
* Supabase project credentials

## 🛠️ Installation

1. Clone the repository (or navigate to the project folder)

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

   * Copy the `.env.local.example` file to `.env.local`
   * Fill in your Supabase credentials:

     * `NEXT_PUBLIC_SUPABASE_URL`: your Supabase project URL
     * `NEXT_PUBLIC_SUPABASE_ANON_KEY`: your Supabase anon key

4. Set up the database on Supabase:

   * Run the script `supabase-schema.sql` to create the `users` table
   * Run the script `supabase-tasks-schema.sql` to create the `tasks` table
   * Or create them manually:

     * **users table:** `id` (uuid, PK), `name` (text), `email` (text), `created_at` (timestamp)
     * **tasks table:** `id` (uuid, PK), `user_email` (text), `title` (text), `description` (text), `is_done` (boolean), `created_at` (timestamp)

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
/app
 ├─ /dashboard/page.tsx    # Dashboard page
 ├─ page.tsx               # Login page
 ├─ layout.tsx             # Main layout
 └─ globals.css            # Global styles

/components
 ├─ LoginForm.tsx          # Login form
 ├─ Button.tsx             # Button component
 ├─ Input.tsx              # Input component
 ├─ TaskList.tsx           # Task list
 ├─ TaskItem.tsx           # Individual task item
 └─ AddTaskForm.tsx        # Add task form

/lib
 └─ supabaseClient.ts      # Supabase client

/utils
 └─ localStorage.ts        # Local storage utilities
```

## 🎨 Design

* **Primary color:** `#CA3040` (red)
* **Secondary color:** `#FFFFFF` (white)
* **Font:** Inter

## 🔐 Features

### Initial Version

* ✅ Login using name and email (no password)
* ✅ User storage in Supabase
* ✅ Session management via localStorage
* ✅ Route protection
* ✅ Dashboard with task system

### Task System

* ✅ List tasks for the logged-in user
* ✅ Add new tasks (title and optional description)
* ✅ Mark tasks as done/undone
* ✅ Responsive card-based interface
* ✅ Dynamic list updates

## 📝 Next Steps

Possible improvements and extensions:

* Task editing
* Task deletion
* Filters (all, pending, completed)
* Sorting by date or priority
* Categories / tags
* Task search

## 🚢 Deployment

The project is ready for deployment on **Vercel**:

1. Push your code to a Git repository
2. Connect the repository to Vercel
3. Configure environment variables in Vercel
4. Deploy!

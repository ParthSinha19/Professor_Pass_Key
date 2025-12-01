# Professor Passkey

A professional, **AI-powered tool** that automatically generates multiple-choice quizzes from **PDF documents**. It features a modern, fully responsive UI, secure user authentication, customizable quiz difficulty, and comprehensive progress tracking with downloadable PDF feedback reports.

## Project Structure

* **Document to Quiz:** Upload any PDF (lectures, research papers, notes) and instantly get a **tailored multiple-choice quiz**.
* **AI-Powered:** Utilizes **Google's Gemini 2.0 Flash** model for fast, accurate, and context-aware question generation.
* **Custom Difficulty:** Choose a difficulty level from **1 (Elementary) to 10 (Expert)** to match your study needs.
* **User Authentication:** Secure sign-up and login via Email, powered by **Supabase**.
* **Guest Mode:** A "Continue as Guest" option for instant access without requiring a full account setup.
* **Progress Tracking:** **Saves your quiz history and scores** to a database for continuous learning.
* **PDF Feedback:** Download a professional **PDF report** of your quiz results for review.
* **Dark/Light Mode:** Fully responsive UI with a toggleable **dark mode theme**.
* **Responsive Design:** Professional and modern interface built with **Tailwind CSS**.

---

## Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5, JavaScript (Vanilla), Tailwind CSS | Core UI structure, logic, and styling. |
| **Backend** | Python, Flask | REST API for handling file uploads and communicating with the AI. |
| **AI Model** | Google Gemini 2.0 Flash | The core intelligence for generating quizzes. |
| **Database & Auth** | Supabase (PostgreSQL) | Secure user authentication and database for progress tracking. |
| **PDF Generation** | jsPDF | Client-side library for creating the quiz result reports. |
| **Tools** | VS Code, Pip | Development environment and package management. |



---

## Getting Started

Follow these steps to set up and run the AI Knowledge Generator locally.

### Prerequisites

Before starting, ensure you have the following installed and configured:

* **Python 3.8+** installed.
* **Node.js** (Optional, but useful for package management/serving the frontend).
* A **Google Gemini API Key** (Get it from [Google AI Studio](https://ai.google.dev/)).
* A **Supabase Project** (Get it from [Supabase.com](https://supabase.com/)).

### 1. Clone the Repository

```bash
git clone [https://github.com/yourusername/ai-knowledge-generator.git](https://github.com/yourusername/ai-knowledge-generator.git)
cd ai-knowledge-generator
```
### 2. Create Virtual Environment(recommended)
```
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

## Setup Instructions

### 1. Frontend Setup

1. **Update Supabase Configuration** in `app.js`:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```

2. **Update Backend URL** in `app.js`:
   ```javascript
   const BACKEND_URL = 'http://localhost:5000';  // Local development
   // Or: 'https://your-backend.onrender.com'  // Production
   ```

### 2. Backend Setup

1. **Install Python dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```

3. **Run the backend**:
   ```bash
   python backend.py
   ```

   The server will start on `http://localhost:5000`

### 3. Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the migration**:
   - Go to SQL Editor in Supabase Dashboard
   - Copy and paste the contents of `supabase_migration.sql`
   - Run the query

3. **Enable Anonymous Auth**:
   - Go to Authentication → Settings
   - Enable "Anonymous sign-ins"

## Deployment

### Frontend (Vercel/Netlify)

1. **Push your frontend files to GitHub**

2. **Deploy to Vercel**:
   - Connect your GitHub repo
   - Set root directory to `frontend/`
   - Deploy!

3. **Update `BACKEND_URL` in `app.js`** to your production backend URL

### Backend (Render/Fly.io)

1. **Deploy to Render**:
   - Create a new Web Service
   - Connect your GitHub repo
   - Set root directory to `backend/`
   - Add environment variable: `GEMINI_API_KEY`
   - Deploy!

2. **Update CORS** in `backend.py` if needed:
   ```python
   CORS(app, origins=["https://your-frontend.vercel.app"])
   ```

## Getting API Keys

### Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click "Get API key"
3. Create API key in new project
4. Copy and save in `.env` file

### Supabase Keys
1. Go to your Supabase project settings
2. Navigate to API settings
3. Copy Project URL and anon public key
4. Add to `app.js`

## Features

- Upload PDF lessons
- AI-generated quizzes (3 questions)
- Multiple-choice format
- Progress tracking
- Anonymous authentication
- Persistent data storage

## Tech Stack

- **Frontend**: HTML, JavaScript, Tailwind CSS
- **Backend**: Python, Flask
- **AI**: Google Gemini API
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Anonymous Auth

## Environment Variables

### Backend (.env)
```
pip install -r requirements.txt
```

### 4. Configure Environment Variables

```
GEMINI_API_KEY=your_actual_api_key_here
```

## Troubleshooting

### 1. Run the Flask application
```
python backend.py
```
### 2. Frontend Setup
## 1. Open the main frontend JavaScript file, app.js, and replace the placeholder variables with your actual Supabase project credentials.

```
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

### 3.Database setup
## 1. Go to your Supabase Project dashboard.

## License

## 3. Run the following SQL script to create the quiz_progress table and set up Row-Level Security (RLS) policies:
```
create table public.quiz_progress (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users not null,
  quiz_title text,
  score integer,
  total_questions integer,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

## Contributing

create policy "Users can view their own progress" on public.quiz_progress for select using (auth.uid() = user_id);
create policy "Users can insert their own progress" on public.quiz_progress for insert with check (auth.uid() = user_id);
```

## 4. Run the frontend

## 1. Using Python's built-in server (easiest):
```
python -m http.server 8000
```

### OPEN TO COLLABORATIONS

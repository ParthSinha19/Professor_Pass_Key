# Professor Playtime Quiz Factory 🤖🚀

A full-stack web application that generates interactive quizzes from PDF documents using Google's Gemini AI.

## 📁 Project Structure

```
professor-playtime/
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── app.js              # Frontend JavaScript
│   └── styles.css          # Custom styles
├── backend/
│   ├── backend.py          # Flask server
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables (create this)
└── supabase/
    └── migration.sql       # Database schema
```

## 🚀 Setup Instructions

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

## 🌐 Deployment

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

## 🔑 Getting API Keys

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

## 📊 Features

- ✨ Upload PDF lessons
- 🤖 AI-generated quizzes (3 questions)
- 🎯 Multiple-choice format
- 📈 Progress tracking
- 🔐 Anonymous authentication
- 💾 Persistent data storage

## 🛠️ Tech Stack

- **Frontend**: HTML, JavaScript, Tailwind CSS
- **Backend**: Python, Flask
- **AI**: Google Gemini API
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Anonymous Auth

## 📝 Environment Variables

### Backend (.env)
```
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (app.js)
```javascript
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
BACKEND_URL=your_backend_url
```

## 🐛 Troubleshooting

### CORS Errors
- Make sure Flask-CORS is installed
- Update CORS origins in `backend.py`

### 403 API Errors
- Check Gemini API key is valid
- Verify API key is in `.env` file
- Restart backend after changing `.env`

### Database Errors
- Verify migration ran successfully
- Check RLS policies are enabled
- Enable anonymous sign-ins in Supabase

## 📄 License

MIT License - feel free to use for educational purposes!

## 🤝 Contributing

Pull requests welcome! Please test thoroughly before submitting.

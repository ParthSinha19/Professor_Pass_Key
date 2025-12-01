// AI Document Analyst - Frontend
const SUPABASE_URL = 'https://msziqggzrsjowfettyem.supabase.co';  
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zemlxZ2d6cnNqb3dmZXR0eWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MTMzMDMsImV4cCI6MjA4MDE4OTMwM30.YyQNF132u_mN7uLkjtRGYWls-rPBUSrAIUWQQTLVFh8';  
const BACKEND_URL = '';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let pdfBase64 = null;

// --- AUTHENTICATION LOGIC ---

async function checkSession() {
    document.getElementById('loading-screen').classList.remove('hidden');
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        handleLoginSuccess(session.user);
    } else {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('auth-screen').classList.remove('hidden');
    }
}

async function handleGuestLogin() {
    document.querySelector('.loading-text').textContent = 'Signing in as Guest...';
    document.getElementById('loading-screen').classList.remove('hidden');
    
    try {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        handleLoginSuccess(data.user);
    } catch (error) {
        console.error('Guest login error:', error);
        showCustomMessage('Login Error', error.message, 'alert-error');
        document.getElementById('loading-screen').classList.add('hidden');
    }
}

async function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    document.querySelector('.loading-text').textContent = 'Verifying Credentials...';
    document.getElementById('loading-screen').classList.remove('hidden');

    // 1. Try Sign In
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (!signInError && signInData.user) {
        return handleLoginSuccess(signInData.user);
    }

    // 2. If Sign In failed, check why
    if (signInError) {
        console.log("Sign in failed, attempting registration...");
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
        
        if (signUpError) {
            document.getElementById('loading-screen').classList.add('hidden');
            
            if (signUpError.message.includes("already registered") || signUpError.message.includes("unique")) {
                showCustomMessage('Login Failed', 'Incorrect password for existing account.', 'alert-error');
            } else {
                showCustomMessage('Error', signUpError.message, 'alert-error');
            }
            return;
        }

        if (signUpData.user) {
            if (!signUpData.session) {
                document.getElementById('loading-screen').classList.add('hidden');
                showCustomMessage('Check Email', 'Registration successful! Please verify your email.', 'info');
                return;
            }
            return handleLoginSuccess(signUpData.user);
        }
    }
}

function handleLoginSuccess(user) {
    currentUser = user;
    const displayEmail = user.email || "Guest User";
    document.getElementById('user-email-display').textContent = displayEmail;
    
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('loading-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    
    initializeTheme();
}

async function signOut() {
    await supabase.auth.signOut();
    location.reload();
}

// --- APP LOGIC ---

document.getElementById('pdf-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        document.getElementById('file-name').textContent = file.name;
        
        // Disable button while reading file
        document.getElementById('start-btn').disabled = true;
        document.getElementById('start-btn-text').textContent = 'Reading File...';

        const reader = new FileReader();
        
        reader.onload = function(event) {
            // 1. Save the file data FIRST
            pdfBase64 = event.target.result.split(',')[1];
            
            // 2. THEN enable the button
            setGeneratingState(false); 
            console.log("File loaded successfully");
        };

        reader.onerror = function() {
            showCustomMessage('File Error', 'Failed to read the file.', 'alert-error');
            setGeneratingState(false);
        };

        reader.readAsDataURL(file);
    } else {
        document.getElementById('file-name').textContent = 'No file selected.';
        pdfBase64 = null;
        setGeneratingState(false); // This will disable the button since pdfBase64 is null
    }
});

// Helper to manage spinner visibility
function setGeneratingState(isGenerating) {
    const startBtn = document.getElementById('start-btn');
    const btnText = document.getElementById('start-btn-text');
    const spinner = document.getElementById('start-btn-spinner');

    if (isGenerating) {
        startBtn.disabled = true;
        btnText.textContent = 'Generating...';
        spinner.classList.remove('hidden');
    } else {
        // Only enable if we actually have a file loaded
        startBtn.disabled = !pdfBase64; 
        btnText.textContent = 'Generate Knowledge Check';
        spinner.classList.add('hidden');
    }
}

async function handlePdfUpload() {
    if (!pdfBase64) return;
    
    setGeneratingState(true);
    
    const difficulty = document.getElementById('difficulty-range').value;

    try {
        const response = await fetch(`${BACKEND_URL}/api/generate-quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pdf_data: pdfBase64, difficulty })
        });
        
        if (!response.ok) {
             const err = await response.json();
             throw new Error(err.error || "Server Error");
        }

        quizData = await response.json();
        startQuiz();

    } catch (error) {
        showCustomMessage('Error', `Failed: ${error.message}`, 'alert-error');
        setGeneratingState(false);
    }
}

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('upload-section').classList.add('hidden');
    document.getElementById('quiz-section').classList.remove('hidden');
    renderQuestion();
}

function renderQuestion() {
    const question = quizData[currentQuestionIndex];
    document.getElementById('question-number').textContent = `${currentQuestionIndex + 1} of ${quizData.length}`;
    document.getElementById('score').textContent = score;
    document.getElementById('quiz-question').textContent = question.question;

    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => checkAnswer(index, btn);
        optionsContainer.appendChild(btn);
    });
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');
}

function checkAnswer(index, btn) {
    const question = quizData[currentQuestionIndex];
    const feedback = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.option-btn');
    
    buttons.forEach(b => b.onclick = null);

    if (index === question.correctAnswerIndex) {
        score++;
        btn.classList.add('correct');
        feedback.className = 'feedback-correct p-4 rounded-lg font-medium';
        feedback.textContent = 'Correct!';
    } else {
        btn.classList.add('incorrect');
        buttons[question.correctAnswerIndex].classList.add('correct');
        feedback.className = 'feedback-incorrect p-4 rounded-lg font-medium';
        feedback.textContent = `Incorrect. The answer was: ${question.options[question.correctAnswerIndex]}`;
    }
    
    document.getElementById('score').textContent = score;
    feedback.classList.remove('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
        renderQuestion();
    } else {
        endQuiz();
    }
}

async function endQuiz() {
    document.getElementById('quiz-section').classList.add('hidden');
    document.getElementById('results-section').classList.remove('hidden');
    document.getElementById('final-score').textContent = `${score} / ${quizData.length}`;
    await saveProgress('Document Quiz', score, quizData.length);
}

function resetApp() {
    quizData = [];
    currentQuestionIndex = 0;
    score = 0;
    pdfBase64 = null;
    document.getElementById('pdf-input').value = '';
    document.getElementById('file-name').textContent = 'No file selected.';
    document.getElementById('results-section').classList.add('hidden');
    document.getElementById('upload-section').classList.remove('hidden');
    
    setGeneratingState(false); 
}

// --- DATABASE HELPERS ---

async function saveProgress(title, score, total) {
    if (!currentUser) return;
    try {
        await supabase.from('quiz_progress').insert([{
            user_id: currentUser.id,
            quiz_title: title,
            score: score,
            total_questions: total,
            timestamp: new Date().toISOString()
        }]);
    } catch (error) { console.error('Save error:', error); }
}

async function loadProgress() {
    if (!currentUser) return [];
    try {
        const { data } = await supabase.from('quiz_progress').select('*').eq('user_id', currentUser.id).order('timestamp', { ascending: false });
        return data || [];
    } catch { return []; }
}

async function showProgress() {
    const container = document.getElementById('progress-container');
    if (!container.classList.contains('hidden')) {
        container.classList.add('hidden');
        return;
    }
    container.classList.remove('hidden');
    container.innerHTML = '<p class="text-center text-gray-500">Loading...</p>';
    
    const progress = await loadProgress();
    
    if (!progress.length) {
        container.innerHTML = '<p class="text-center text-gray-500">No history found.</p>';
    } else {
        container.innerHTML = progress.map(item => `
            <div class="p-3 bg-white dark:bg-gray-800 rounded shadow border dark:border-gray-700 flex justify-between mb-2">
                <div>
                    <p class="font-bold text-gray-800 dark:text-gray-200">${item.quiz_title}</p>
                    <p class="text-xs text-gray-500">${new Date(item.timestamp).toLocaleDateString()}</p>
                </div>
                <div class="font-bold text-indigo-600">${item.score}/${item.total_questions}</div>
            </div>
        `).join('');
    }
}

// --- PDF FEEDBACK GENERATION ---
function downloadFeedback() {
    if (!quizData.length) return;

    // Use jsPDF from the global window object
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFillColor(79, 70, 229); // Indigo color
    doc.rect(0, 0, 210, 20, 'F'); 
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("AI Knowledge Generator Report", 105, 13, { align: "center" });

    // Metadata
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    const dateStr = new Date().toLocaleString();
    const percent = ((score / quizData.length) * 100).toFixed(0);
    
    doc.text(`Date: ${dateStr}`, 14, 30);
    doc.text(`Final Score: ${score} / ${quizData.length} (${percent}%)`, 14, 38);

    // Separator Line
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 45, 196, 45);

    // Questions List
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Quiz Questions Overview:", 14, 55);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    let yPosition = 65;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 14;
    const maxWidth = 180; 

    quizData.forEach((q, i) => {
        const questionText = `${i + 1}. ${q.question}`;
        const lines = doc.splitTextToSize(questionText, maxWidth);
        
        if (yPosition + (lines.length * 5) > pageHeight - 20) {
            doc.addPage();
            yPosition = 20; 
        }

        doc.text(lines, margin, yPosition);
        yPosition += (lines.length * 5) + 5; 
    });

    doc.save("learning_feedback.pdf");
}

// --- THEME & UI ---

function initializeTheme() {
    const theme = localStorage.getItem('theme') || 'theme-light';
    applyTheme(theme);
}

function applyTheme(theme) {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
    
    if (theme === 'theme-dark') {
        document.getElementById('sun-icon').classList.add('hidden');
        document.getElementById('moon-icon').classList.remove('hidden');
    } else {
        document.getElementById('sun-icon').classList.remove('hidden');
        document.getElementById('moon-icon').classList.add('hidden');
    }
}

function toggleTheme() {
    const newTheme = document.body.classList.contains('theme-dark') ? 'theme-light' : 'theme-dark';
    applyTheme(newTheme);
}

function showCustomMessage(title, message, type) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[60]';
    
    let bg = 'bg-white dark:bg-gray-800';
    let text = 'text-gray-800 dark:text-gray-200';
    let border = 'border-indigo-500';
    
    if (type === 'alert-error') {
        border = 'border-red-500';
        text = 'text-red-600 dark:text-red-400';
    }

    overlay.innerHTML = `
        <div class="max-w-sm w-full p-6 ${bg} rounded-lg shadow-2xl border-t-4 ${border} transform scale-100">
            <h4 class="text-xl font-bold ${text} mb-2">${title}</h4>
            <p class="text-gray-600 dark:text-gray-400 mb-6">${message}</p>
            <button onclick="this.closest('.fixed').remove()" class="btn-primary w-full">OK</button>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Boot
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', checkSession);
else checkSession();
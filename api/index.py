# backend.py - Professor PassKey Backend
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import json
import base64
import tempfile


app = Flask(__name__)
# Allow all origins to prevent CORS issues
CORS(app, resources={r"/*": {"origins": "*"}})

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("API Key Error: GEMINI_API_KEY environment variable not set.")

genai.configure(api_key=GEMINI_API_KEY)

# --- DEBUG: LIST AVAILABLE MODELS ON STARTUP ---
print("\n[INFO] Checking available Gemini models...")
try:
    # List models without outputting huge tracebacks on initial server start
    print("---------------------------------------")
except Exception as e:
    print(f"[WARN] Could not list models: {e}")
print("---------------------------------------\n")

# --- QUIZ GENERATION SCHEMA ---
# This schema allows an array of ANY length (4 to 15 as per prompt)
QUIZ_SCHEMA = {
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "question": {
                "type": "string",
                "description": "The question text"
            },
            "options": {
                "type": "array",
                "description": "Exactly four answer options",
                "items": {
                    "type": "string"
                }
            },
            "correctAnswerIndex": {
                "type": "integer",
                "description": "Zero-based index of the correct option (0-3)"
            }
        },
        "required": ["question", "options", "correctAnswerIndex"]
    }
}

@app.route('/api/generate-quiz', methods=['POST'])
def generate_quiz():
    """
    Generate a quiz from PDF data using Gemini API with File Upload
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        pdf_base64 = data.get('pdf_data')
        difficulty = data.get('difficulty', 5) # Default to 5 if not provided

        if not pdf_base64:
            return jsonify({"error": "No PDF data provided"}), 400

        print(f"[INFO] PDF data received. Difficulty set to {difficulty}/10. Processing...")

        # 1. Decode Base64 to Bytes
        pdf_bytes = base64.b64decode(pdf_base64)

        # 2. Save to a temporary file (Bypasses 20MB inline limit)
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_pdf:
            temp_pdf.write(pdf_bytes)
            temp_pdf_path = temp_pdf.name
            print(f"[INFO] Saved temp file to: {temp_pdf_path}")

        uploaded_file = None
        try:
            # 3. Upload the file to Google Gemini
            print("[INFO] Uploading file to Gemini...")
            uploaded_file = genai.upload_file(temp_pdf_path, mime_type="application/pdf")
            print(f"[INFO] Upload successful: {uploaded_file.name}")

            # 4. Generate content
            # Using the compatible model
            model_name = 'gemini-2.0-flash' 
            print(f"[INFO] Analyzing document with {model_name}...")
            
            model = genai.GenerativeModel(model_name)
            
            # --- NEW PROFESSOR PASSKEY PROMPT ---
            prompt = f"""You are Professor PassKey and your aim is to read and analyze the provided PDF file.
            
            Task:
            - Create a quiz with questions ranging from 4 to 15 in number.
            - Each question must have exactly 4 options, one of them being correct.
            - Try and keep the options in coherence with the said topic.
            - Verify and then re-verify your questions, just remember that people are gonna learn with this, wrong answers are not acceptable.
            - Questions should assess the main knowledge and concepts found in the PDF at a level matching its content.
            - All options should be plausible, relevant, and consistent with the topic (no random distractors).
            
            Difficulty Context:
            - The user wants a difficulty level of {difficulty} out of 10. 
            - Generate questions that adhere strictly to this difficulty level.

            Output:
            - Return ONLY valid JSON that matches the given schema.
            """

            response = model.generate_content(
                [prompt, uploaded_file],
                generation_config={
                    "response_mime_type": "application/json",
                    "response_schema": QUIZ_SCHEMA
                }
            )

            # 5. Parse response
            quiz_data = json.loads(response.text)
            print(f"[INFO] Successfully generated {len(quiz_data)} questions.")
            
            return jsonify(quiz_data), 200

        finally:
            # 6. Cleanup: Delete the temporary file and the uploaded file from Gemini
            if os.path.exists(temp_pdf_path):
                os.unlink(temp_pdf_path)
                print("[INFO] Cleaned up local temp file")
            
            # Delete the remote file from Google's servers
            if uploaded_file:
                genai.delete_file(name=uploaded_file.name)
                print(f"[INFO] Cleaned up remote file: {uploaded_file.name}")


    except Exception as e:
        print(f"[ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
        
        error_msg = str(e)
        if "404" in error_msg and "models/" in error_msg:
             error_msg = "Model not found. Please check your model name/API configuration."
        
        return jsonify({"error": error_msg}), 500

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "Professor PassKey Backend is RUNNING",
        "status": "Ready"
    }), 200

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200
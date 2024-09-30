from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import GPT2Tokenizer, GPT2LMHeadModel

app = FastAPI()

# CORS settings to allow communication with the frontend
origins = [
    "http://localhost:3000",  # Local development URL
    "http://localhost:3001"   # Adjust as necessary for frontend dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Load GPT-2 model as placeholder to be replaced with our Movie dialog trained model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
model = GPT2LMHeadModel.from_pretrained("gpt2")
model.to(device)

# Define input schema for the chatbot endpoint
class ChatRequest(BaseModel):
    message: str

@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Welcome to our chatbot API."}

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        # Encode input message
        input_ids = tokenizer.encode(request.message, return_tensors="pt").to(device)

        # Generate response using the model
        output_ids = model.generate(input_ids, max_length=100, num_return_sequences=1,no_repeat_ngram_size=2, pad_token_id=tokenizer.eos_token_id)

        # Decode generated tokens to string
        response = tokenizer.decode(output_ids[0], skip_special_tokens=True)

        # Return only the response beyond the user input for clarity
        chat_response = response[len(request.message):].strip()

        return {"reply": chat_response}
    
    except Exception as e:
        # Log the exception for debugging
        print("Error processing chatbot request:", str(e))
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
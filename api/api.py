from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

# Initialize FastAPI app
app = FastAPI()

# CORS middleware configuration
origins = [
    "http://localhost:3000",  # Local frontend URLs
    "http://localhost:3001"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Device configuration
if torch.backends.mps.is_available() and torch.backends.mps.is_built():
    device = torch.device("mps")
elif torch.cuda.is_available():
    device = torch.device("cuda")
else:
    device = torch.device("cpu")

# Load fine tuned model. NOTE: unzip first
tokenizer = AutoTokenizer.from_pretrained("./movie_10_100")
model = AutoModelForCausalLM.from_pretrained("./movie_10_100").to(device)

# load vanilla model
#tokenizer = AutoTokenizer.from_pretrained("gpt2-medium")
#model = AutoModelForCausalLM.from_pretrained("gpt2-medium").to(device)

# Ensure pad token is set to avoid warnings
tokenizer.pad_token = tokenizer.eos_token

# Define request schema
class ChatRequest(BaseModel):
    message: str

# Root endpoint
@app.get("/", tags=["root"])
async def read_root() -> dict:
    return {"message": "Welcome to our chatbot API."}

# Chat endpoint
@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        prompt = f"You are a helpful ChatBot designed to answer questions. \nUser: {request.message} \nChatBot:"
            
        # Encode input with attention mask
        inputs = tokenizer(
            prompt, return_tensors="pt", padding=True
        ).to(device)

        input_ids = inputs["input_ids"]
        attention_mask = inputs["attention_mask"]

        # Generate the response with min_new_tokens constraint
        output_ids = model.generate(
            input_ids,
            attention_mask=attention_mask,
            max_length=input_ids.shape[1] + 100,  # Max total length (prompt + response)
            min_new_tokens=10,  # Ensure at least 10 token generated after the prompt
            no_repeat_ngram_size=2,  # Avoid repetition
            temperature=0.9,  # Introduce randomness for better responses
            eos_token_id=tokenizer.eos_token_id  # Stop when EOS is generated
        )

        # Decode the generated response
        response = tokenizer.decode(output_ids[0], skip_special_tokens=True).strip()
        chat_response = response[len(prompt):]
        chat_response = chat_response.split("user:")[0]
        
        # Return the response
        return {"reply": chat_response, "prompt_and_response": response}

    except Exception as e:
        # Log the error and raise an HTTP exception
        print(f"Error processing chatbot request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Deepfake Detector API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["*"],
)

app.get("/")
def health_check():
    return {"status": "ok"}

app.post("predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    return {"filename": file.filename, "message": "Model not connected yet!"}
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.model import predict_image


app = FastAPI(title="Deepfake Detector API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok"}

@app.post("predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    result = predict_image(contents)
    return result
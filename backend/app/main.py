from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.model import predict_image, predict_video
from app.preprocessing import extract_frames
import os


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

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()

    if file.content_type.startswith("video/"):
        frames = extract_frames(contents)
        result = predict_video(frames)
        if os.path.exists("temp_video.mp4"):
            os.remove("temp_video.mp4")
    else:
        result = predict_image(contents)

    return result

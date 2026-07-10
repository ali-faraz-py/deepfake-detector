import cv2
import numpy as np
from PIL import Image



def extract_frames(video_bytes: bytes, max_frames: int = 10):
    with open("temp_video.mp4", "wb") as f:
        f.write(video_bytes)

    cap = cv2.VideoCapture("temp_video.mp4")
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    step = max(total_frames // max_frames, 1)

    frames = []
    count = 0
    while cap.isOpened() and len(frames) < max_frames:
        ret, frame = cap.read()
        if not ret:
            break
        if count % step == 0:
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(frame_rgb)
            frames.append(pil_image)
        count += 1

    cap.release()
    return frames
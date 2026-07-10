import cv2
from PIL import Image
import numpy as np


def extract_frames(video_bytes: bytes, max_frames: int=10):
    with open("temp_video.mp4", "wb") as f:
        f.write(video_bytes)

    cap = cv2.VideoCapture("temp_video.mp4")
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    step = max(total_frames // max_frames, 1)

    frames = []
    count = 0

    
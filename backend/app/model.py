import torch
import torch.nn as nn
from efficientnet_pytorch import EfficientNet
from torchvision import transforms
from PIL import Image
import io

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = EfficientNet.from_pretrained('efficientnet-b0', num_classes=2)
model = model.to(device)
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def predict_image(image_bytes: bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image)
        probabilities = torch.softmax(outputs, dim=1)
        confidence, predicted_class = torch.max(probabilities, dim=1)

    label = "Fake" if predicted_class.item() == 1 else "Real"

    return{
        "prediction": label,
        "confidence": round(confidence.item() * 100, 2)
    }

def predict_video(frames):
    fake_scores = []

    for frame in frames:
        image = transform(frame).unsqueeze(0).to(device)
        with torch.no_grad():
            outputs = model(image)
            probabilities = torch.softmax(outputs, dim=1)
            fake_scores.append(probabilities[0][1].item())

    avg_fake_score = sum(fake_scores) / len(fake_scores)
    label = "Fake" if avg_fake_score > 0.5 else "Real"
    confidence = avg_fake_score if label == "Fake" else 1 - avg_fake_score

    return {
        "prediction": label,
        "confidence": round(confidence * 100, 2),
        "frames_analyzed": len(frames)
    }
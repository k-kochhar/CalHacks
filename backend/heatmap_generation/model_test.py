from models.vinet.Vinet_S_model import VideoSaliencyModel
import torch

model = VideoSaliencyModel()
checkpoint = torch.load(
    "models/vinet/checkpoints/vinet_s_mvva_randomsplit.pt", map_location="cpu"
)
model.load_state_dict(checkpoint)
model.eval()
print("✓ Model loaded successfully!")

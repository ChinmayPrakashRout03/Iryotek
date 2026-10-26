#!/usr/bin/env python3
"""
Whiteboard Animation CLI for Iryotek
Powered by letuandat131/whiteboard-animation-vi pipeline
"""

import sys
import argparse
from pathlib import Path
import cv2

# Locate bundled whiteboard engine
CANDIDATE_PATHS = [
    Path(__file__).resolve().parent / "whiteboard-engine",
    Path("/Users/chinmayprakashrout/.gemini/antigravity-ide/brain/0aed039c-6e48-415e-a543-d024881c004c/scratch/whiteboard-animation-vi")
]

ENGINE_PATH = next((p for p in CANDIDATE_PATHS if p.exists()), None)
if ENGINE_PATH:
    sys.path.insert(0, str(ENGINE_PATH))
else:
    print("Warning: Whiteboard animation engine directory not found in candidate paths.")

try:
    from handdraw.settings import Settings
    from handdraw.render import render_video
except ImportError as e:
    print(f"Error importing whiteboard engine: {e}")
    sys.exit(1)


def generate_animation(image_path: str, output_dir: str = None, duration: float = 6.0, fps: int = 30):
    img_path = Path(image_path).resolve()
    if not img_path.is_file():
        print(f"Error: Image file not found: {img_path}")
        sys.exit(1)

    img_bgr = cv2.imread(str(img_path))
    if img_bgr is None:
        print(f"Error: Could not decode image: {img_path}")
        sys.exit(1)
    
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    out_dir = Path(output_dir or Path(__file__).resolve().parent).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"Rendering whiteboard animation from: {img_path.name} ({img_rgb.shape[1]}x{img_rgb.shape[0]})")
    settings = Settings(
        mode='d',
        duration=duration,
        draw_percent=85.0,
        ink_percent=50.0,
        width=1920,
        height=1080,
        fps=fps,
        device='cpu',
        encoder='cpu',
        cpu_preset='fast',
        quality=20,
        subject_first=False,
        show_hand=True,
        clean_ink=True,
        paper_color='#ffffff',
        wrist_degrees=12.0,
        wrist_frequency=0.6,
        finger_motion=1.2,
        shadow_strength=1.1
    )

    def progress(fraction, desc):
        print(f"[{int(fraction * 100):3d}%] {desc}")

    out_file, report = render_video(img_rgb, settings, output_dir=out_dir, progress=progress)
    print(f"\nDone! Video output: {out_file}")
    return out_file


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a whiteboard drawing animation from any illustration")
    parser.add_argument("--image", default=str(Path(__file__).resolve().parent / "source_illustration.jpg"), help="Path to input image")
    parser.add_argument("--output", default=str(Path(__file__).resolve().parent), help="Output directory")
    parser.add_argument("--duration", type=float, default=30.0, help="Duration in seconds (default: 30.0)")
    parser.add_argument("--fps", type=int, default=30, help="Frames per second")
    args = parser.parse_args()

    generate_animation(args.image, args.output, args.duration, args.fps)

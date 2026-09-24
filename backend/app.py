import os
import io
import time
import cv2
import base64
import tempfile
import asyncio
import requests
import numpy as np
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
from PIL import Image

os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

app = FastAPI(title="HexaCore AI Disaster & Hazard Surveillance API (SIH26177)")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Mount static asset folders for demo galleries
for folder in ["demo-images", "demo-videos", "dalle-logos"]:
    folder_path = os.path.join(BASE_DIR, folder)
    if os.path.exists(folder_path):
        app.mount(f"/static/{folder}", StaticFiles(directory=folder_path), name=folder)

# Cache loaded models in memory (YOLO & Keras)
LOADED_MODELS = {}


def get_model(model_type: str, model_size: str) -> YOLO:
    """Retrieve or cache YOLO models (Fire, SAR Human, General)."""
    m_type = model_type.lower()
    if "human" in m_type or "sar" in m_type or "person" in m_type:
        dir_name = "human-models"
    elif "general" in m_type:
        dir_name = "general-models"
    else:
        dir_name = "fire-models"
    
    model_filename = f"{model_size}.pt" if not model_size.endswith(".pt") else model_size
    model_path = os.path.join(BASE_DIR, dir_name, model_filename)
    
    if not os.path.exists(model_path):
        if dir_name == "human-models":
            prefix = "aranyak-"
        elif dir_name == "general-models":
            prefix = "yolov8"
        else:
            prefix = "fire_"
            
        alt_filename = f"{prefix}{model_size.replace(prefix, '')}.pt"
        alt_path = os.path.join(BASE_DIR, dir_name, alt_filename)
        if os.path.exists(alt_path):
            model_path = alt_path
        else:
            target_dir = os.path.join(BASE_DIR, dir_name)
            available = [f for f in os.listdir(target_dir) if f.endswith(".pt")] if os.path.exists(target_dir) else []
            if available:
                model_path = os.path.join(target_dir, available[0])
            else:
                raise HTTPException(status_code=404, detail=f"Model file not found: {dir_name}/{model_filename}")
        
    cache_key = f"{model_type}_{os.path.basename(model_path)}"
    if cache_key not in LOADED_MODELS:
        LOADED_MODELS[cache_key] = YOLO(model_path)
    return LOADED_MODELS[cache_key]


def get_flood_models():
    """
    Lazy-load and cache the two-stage flood cascade models from SIH177 / SIH26177:
    - Stage 1: MobileNetV2 Binary Classifier (AIDERv2 Flood vs others)
    - Stage 2: U-Net MobileNetV2 Water Segmentation (FloodNet mask overlay)
    """
    if "flood_stage1" not in LOADED_MODELS or "flood_stage2" not in LOADED_MODELS:
        import tensorflow as tf
        s1_path = os.path.join(BASE_DIR, "flood-models", "flood_stage1_classifier.h5")
        s2_path = os.path.join(BASE_DIR, "flood-models", "flood_stage2_segmentation.h5")
        
        if not os.path.exists(s1_path) or not os.path.exists(s2_path):
            raise HTTPException(
                status_code=404,
                detail="Flood model weights not found in flood-models/. Expected flood_stage1_classifier.h5 and flood_stage2_segmentation.h5"
            )
        LOADED_MODELS["flood_stage1"] = tf.keras.models.load_model(s1_path, compile=False)
        LOADED_MODELS["flood_stage2"] = tf.keras.models.load_model(s2_path, compile=False)
        
    return LOADED_MODELS["flood_stage1"], LOADED_MODELS["flood_stage2"]


def get_building_model():
    """
    Lazy-load and cache the collapsed building classifier from SIH177 / SIH26177:
    - MobileNetV2 Structural Damage / Collapsed Building Classifier (AIDERv2 Earthquake)
    """
    if "collapsed_building" not in LOADED_MODELS:
        import tensorflow as tf
        b_path = os.path.join(BASE_DIR, "building-models", "collapsed_building_classifier.h5")
        if not os.path.exists(b_path):
            raise HTTPException(
                status_code=404,
                detail="Collapsed building model weights not found in building-models/collapsed_building_classifier.h5"
            )
        LOADED_MODELS["collapsed_building"] = tf.keras.models.load_model(b_path, compile=False)
        
    return LOADED_MODELS["collapsed_building"]


def format_yolo_result(res, model):
    class_name = model.model.names
    classes = res[0].boxes.cls
    class_counts = {}
    
    for c in classes:
        c = int(c)
        name = class_name[c]
        class_counts[name] = class_counts.get(name, 0) + 1

    prediction_text = 'Predicted '
    for k, v in sorted(class_counts.items(), key=lambda item: item[1], reverse=True):
        prediction_text += f'{v} {k}'
        if v > 1:
            prediction_text += 's'
        prediction_text += ', '

    if len(class_counts) == 0:
        prediction_text = "No objects detected"
    else:
        prediction_text = prediction_text[:-2]

    latency = sum(res[0].speed.values())
    latency_sec = round(latency / 1000, 2)
    prediction_text += f' in {latency_sec} seconds.'

    res_image = res[0].plot() # OpenCV BGR
    res_image_rgb = cv2.cvtColor(res_image, cv2.COLOR_BGR2RGB)
    
    pil_img = Image.fromarray(res_image_rgb)
    buffered = io.BytesIO()
    pil_img.save(buffered, format="PNG")
    img_b64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

    return {
        "status": "success",
        "counts": class_counts,
        "prediction_text": prediction_text,
        "latency_ms": round(latency, 1),
        "latency_sec": latency_sec,
        "image_base64": f"data:image/png;base64,{img_b64}"
    }


def run_flood_inference(bgr_image: np.ndarray, conf_threshold: float = 0.35) -> dict:
    """
    Execute the Two-Stage Flood Detection Cascade (from SIH177model notebook):
    Stage 1: MobileNetV2 classifier flags if the frame is flooded.
    Stage 2: If flooded, MobileNetV2 U-Net generates a water segmentation mask and overlays it.
    """
    t0 = time.time()
    s1_model, s2_model = get_flood_models()
    
    h, w = bgr_image.shape[:2]
    rgb_image = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)
    
    # Stage 1: (224, 224) classifier
    img_224 = cv2.resize(rgb_image, (224, 224)).astype(np.float32) / 255.0
    p1 = float(s1_model.predict(np.expand_dims(img_224, 0), verbose=0)[0, 0])
    
    annotated = bgr_image.copy()
    triggered = p1 >= conf_threshold
    coverage_pct = 0.0
    num_zones = 0

    if triggered:
        # Stage 2: (256, 256) segmentation U-Net
        img_256 = cv2.resize(rgb_image, (256, 256)).astype(np.float32) / 255.0
        mask_pred = s2_model.predict(np.expand_dims(img_256, 0), verbose=0)[0, :, :, 0]
        
        # Binary water mask at 0.5 threshold
        bin_mask_256 = (mask_pred >= 0.5).astype(np.uint8)
        full_mask = cv2.resize(bin_mask_256, (w, h), interpolation=cv2.INTER_NEAREST)
        
        water_pixels = int(np.sum(full_mask))
        coverage_pct = round((water_pixels / (h * w)) * 100.0, 1)
        
        # Translucent cyan/blue water mask overlay
        color_mask = np.zeros_like(annotated)
        color_mask[full_mask == 1] = [235, 140, 20] # BGR for tactical ocean cyan
        
        # Blend overlay
        mask_indices = full_mask == 1
        annotated[mask_indices] = cv2.addWeighted(
            annotated[mask_indices], 0.45,
            color_mask[mask_indices], 0.55, 0
        )
        
        # Draw water zone contours
        contours, _ = cv2.findContours(full_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        significant_contours = [c for c in contours if cv2.contourArea(c) > 150]
        num_zones = len(significant_contours)
        cv2.drawContours(annotated, significant_contours, -1, (255, 240, 0), 2) # Bright cyan outline
        
        # HUD Tactical Alert Banner
        cv2.rectangle(annotated, (15, 15), (min(w - 15, 480), 85), (10, 18, 36), -1)
        cv2.rectangle(annotated, (15, 15), (min(w - 15, 480), 85), (0, 75, 255), 2)
        cv2.putText(annotated, "CRITICAL: FLOOD HAZARD DETECTED", (25, 42),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 140, 255), 2)
        cv2.putText(annotated, f"Conf: {p1*100:.1f}% | Water: {coverage_pct}% | Stage 2 U-Net Active", (25, 68),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.48, (220, 235, 250), 1)

        counts = {"flood": 1, "water_zone": max(1, num_zones)}
        pred_text = f"Predicted Flood Hazard ({coverage_pct}% water surface coverage, {p1*100:.1f}% conf)"
    else:
        # Subtle Normal HUD Badge
        cv2.rectangle(annotated, (15, 15), (min(w - 15, 380), 65), (10, 25, 20), -1)
        cv2.rectangle(annotated, (15, 15), (min(w - 15, 380), 65), (100, 200, 120), 1)
        cv2.putText(annotated, f"NORMAL: NO FLOOD ({(1-p1)*100:.1f}% confidence)", (25, 45),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.52, (120, 240, 160), 1)
        counts = {}
        pred_text = f"No Flood detected ({(1-p1)*100:.1f}% normal confidence)"

    t_end = time.time()
    latency_ms = round((t_end - t0) * 1000, 1)
    latency_sec = round((t_end - t0), 2)
    pred_text += f" in {latency_sec} seconds."

    # Convert annotated to Base64
    _, buf = cv2.imencode('.jpg', annotated, [int(cv2.IMWRITE_JPEG_QUALITY), 88])
    b64_str = base64.b64encode(buf).decode('utf-8')

    return {
        "status": "success",
        "counts": counts,
        "prediction_text": pred_text,
        "latency_ms": latency_ms,
        "latency_sec": latency_sec,
        "image_base64": f"data:image/jpeg;base64,{b64_str}",
        "details": {
            "stage1_confidence": round(p1, 4),
            "stage2_triggered": triggered,
            "water_coverage_pct": coverage_pct,
            "water_zones_count": num_zones
        }
    }


def run_building_inference(bgr_image: np.ndarray, conf_threshold: float = 0.40) -> dict:
    """
    Execute the Collapsed Building & Structural Damage Classifier (from SIH177model notebook):
    MobileNetV2 binary classifier trained on AIDERv2 Earthquake disaster scenes.
    """
    t0 = time.time()
    b_model = get_building_model()
    
    h, w = bgr_image.shape[:2]
    rgb_image = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)
    
    # Input: (224, 224) in [0, 1] range (internal Rescaling maps to [-1, 1])
    img_224 = cv2.resize(rgb_image, (224, 224)).astype(np.float32) / 255.0
    prob = float(b_model.predict(np.expand_dims(img_224, 0), verbose=0)[0, 0])
    
    annotated = bgr_image.copy()
    is_collapsed = prob >= conf_threshold
    
    if is_collapsed:
        # Draw danger border and tactical SAR drone corner brackets
        corner_len = min(w, h) // 10
        color = (0, 69, 255) # Orange-Red in BGR
        thick = 3
        # Top-Left corner
        cv2.line(annotated, (20, 20), (20 + corner_len, 20), color, thick)
        cv2.line(annotated, (20, 20), (20, 20 + corner_len), color, thick)
        # Top-Right corner
        cv2.line(annotated, (w - 20, 20), (w - 20 - corner_len, 20), color, thick)
        cv2.line(annotated, (w - 20, 20), (w - 20, 20 + corner_len), color, thick)
        # Bottom-Left corner
        cv2.line(annotated, (20, h - 20), (20 + corner_len, h - 20), color, thick)
        cv2.line(annotated, (20, h - 20), (20, h - 20 - corner_len), color, thick)
        # Bottom-Right corner
        cv2.line(annotated, (w - 20, h - 20), (w - 20 - corner_len, h - 20), color, thick)
        cv2.line(annotated, (w - 20, h - 20), (w - 20, h - 20 - corner_len), color, thick)
        
        # Tactical Hazard Banner
        cv2.rectangle(annotated, (25, 25), (min(w - 25, 520), 95), (10, 15, 30), -1)
        cv2.rectangle(annotated, (25, 25), (min(w - 25, 520), 95), (0, 69, 255), 2)
        cv2.putText(annotated, "CRITICAL: STRUCTURAL DAMAGE / COLLAPSE", (35, 54),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.62, (0, 80, 255), 2)
        cv2.putText(annotated, f"Damage Conf: {prob*100:.1f}% | SAR Drone Grid Active", (35, 80),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.48, (220, 235, 250), 1)

        counts = {"collapsed_building": 1, "structural_hazard": 1}
        pred_text = f"Predicted Collapsed Building / Structural Damage ({prob*100:.1f}% conf)"
    else:
        # Normal Structural Integrity HUD
        cv2.rectangle(annotated, (25, 25), (min(w - 25, 420), 75), (10, 25, 20), -1)
        cv2.rectangle(annotated, (25, 25), (min(w - 25, 420), 75), (100, 200, 120), 1)
        cv2.putText(annotated, f"STRUCTURAL INTEGRITY INTACT ({(1-prob)*100:.1f}% intact)", (35, 55),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.52, (120, 240, 160), 1)
        counts = {}
        pred_text = f"No Structural Collapse detected ({(1-prob)*100:.1f}% normal confidence)"

    t_end = time.time()
    latency_ms = round((t_end - t0) * 1000, 1)
    latency_sec = round((t_end - t0), 2)
    pred_text += f" in {latency_sec} seconds."

    _, buf = cv2.imencode('.jpg', annotated, [int(cv2.IMWRITE_JPEG_QUALITY), 88])
    b64_str = base64.b64encode(buf).decode('utf-8')

    return {
        "status": "success",
        "counts": counts,
        "prediction_text": pred_text,
        "latency_ms": latency_ms,
        "latency_sec": latency_sec,
        "image_base64": f"data:image/jpeg;base64,{b64_str}",
        "details": {
            "collapse_confidence": round(prob, 4),
            "is_collapsed": is_collapsed
        }
    }


@app.get("/api/models")
def list_available_models():
    fire_dir = os.path.join(BASE_DIR, "fire-models")
    general_dir = os.path.join(BASE_DIR, "general-models")
    human_dir = os.path.join(BASE_DIR, "human-models")
    flood_dir = os.path.join(BASE_DIR, "flood-models")
    building_dir = os.path.join(BASE_DIR, "building-models")
    
    fire_models = [f.replace(".pt", "") for f in os.listdir(fire_dir) if f.endswith(".pt")] if os.path.exists(fire_dir) else []
    general_models = [f.replace(".pt", "") for f in os.listdir(general_dir) if f.endswith(".pt")] if os.path.exists(general_dir) else []
    human_models = [f.replace(".pt", "") for f in os.listdir(human_dir) if f.endswith(".pt")] if os.path.exists(human_dir) else []
    
    has_flood = os.path.exists(os.path.join(flood_dir, "flood_stage1_classifier.h5"))
    flood_models = ["flood-cascade-mobilenetv2"] if has_flood else []

    has_building = os.path.exists(os.path.join(building_dir, "collapsed_building_classifier.h5"))
    building_models = ["collapsed-building-mobilenetv2"] if has_building else []
    
    return {
        "fire_models": sorted(fire_models),
        "general_models": sorted(general_models),
        "human_models": sorted(human_models),
        "flood_models": flood_models,
        "building_models": building_models,
        "sih_notebook_models": [
            {
                "id": "flood_cascade",
                "name": "Flood Detection Cascade (MobileNetV2 + U-Net)",
                "source_notebook": "flood-detection (9).ipynb",
                "classes": ["flood", "water_zone"]
            },
            {
                "id": "collapsed_building",
                "name": "Collapsed Building & Structural Damage (MobileNetV2)",
                "source_notebook": "collapsed-building (8).ipynb",
                "classes": ["collapsed_building", "structural_hazard"]
            }
        ]
    }


@app.get("/api/demos")
def list_demo_files():
    images_dir = os.path.join(BASE_DIR, "demo-images")
    videos_dir = os.path.join(BASE_DIR, "demo-videos")
    
    images = [f for f in os.listdir(images_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))] if os.path.exists(images_dir) else []
    videos = [f for f in os.listdir(videos_dir) if f.lower().endswith(('.mp4', '.avi', '.mov', '.mkv'))] if os.path.exists(videos_dir) else []
    
    return {
        "images": [f"/static/demo-images/{img}" for img in sorted(images)],
        "videos": [f"/static/demo-videos/{vid}" for vid in sorted(videos)]
    }


@app.post("/api/predict/image")
async def predict_image_endpoint(
    model_type: str = Form("Fire Detection"),
    model_size: str = Form("m"),
    conf_threshold: float = Form(0.20),
    iou_threshold: float = Form(0.50),
    image_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    # Decode input image
    if file is not None:
        contents = await file.read()
        pil_img = Image.open(io.BytesIO(contents)).convert("RGB")
    elif image_url:
        try:
            if "/static/" in image_url:
                rel_path = image_url.split("/static/", 1)[1]
                local_file_path = os.path.join(BASE_DIR, rel_path.replace("/", os.sep))
                if os.path.exists(local_file_path):
                    pil_img = Image.open(local_file_path).convert("RGB")
                else:
                    resp = requests.get(image_url, timeout=10)
                    resp.raise_for_status()
                    pil_img = Image.open(io.BytesIO(resp.content)).convert("RGB")
            else:
                resp = requests.get(image_url, timeout=10)
                resp.raise_for_status()
                pil_img = Image.open(io.BytesIO(resp.content)).convert("RGB")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to fetch image from URL: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="Either a file upload or an image_url is required.")

    # Convert PIL Image to OpenCV BGR
    rgb_arr = np.array(pil_img)
    bgr_arr = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2BGR)
    m_type_lower = model_type.lower()

    # Route 1: Flood Cascade Model (from flood-detection (9).ipynb)
    if "flood" in m_type_lower:
        return run_flood_inference(bgr_arr, conf_threshold=conf_threshold)

    # Route 2: Collapsed Building Model (from collapsed-building (8).ipynb)
    if "building" in m_type_lower or "collapse" in m_type_lower or "structural" in m_type_lower:
        return run_building_inference(bgr_arr, conf_threshold=conf_threshold)

    # Route 3: YOLO Models (Fire, Human/SAR Drone, General Objects)
    model = get_model(model_type, model_size)
    res = model.predict(
        pil_img,
        conf=conf_threshold,
        iou=iou_threshold,
        device='cpu',
        verbose=False
    )
    return format_yolo_result(res, model)


@app.post("/api/predict/flood")
async def predict_flood_endpoint(
    conf_threshold: float = Form(0.35),
    image_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """Dedicated endpoint for Flood Detection Cascade."""
    return await predict_image_endpoint(
        model_type="Flood Detection",
        model_size="cascade",
        conf_threshold=conf_threshold,
        image_url=image_url,
        file=file
    )


@app.post("/api/predict/collapsed-building")
async def predict_building_endpoint(
    conf_threshold: float = Form(0.40),
    image_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """Dedicated endpoint for Collapsed Building & Structural Damage."""
    return await predict_image_endpoint(
        model_type="Collapsed Building",
        model_size="mobilenetv2",
        conf_threshold=conf_threshold,
        image_url=image_url,
        file=file
    )


@app.websocket("/ws/predict/video")
async def websocket_video_inference(websocket: WebSocket):
    await websocket.accept()
    tfile_path = None
    try:
        # Step 1: Wait for initial configuration
        init_data = await websocket.receive_json()
        model_type = init_data.get("model_type", "Fire Detection")
        model_size = init_data.get("model_size", "m")
        conf_threshold = float(init_data.get("conf_threshold", 0.20))
        iou_threshold = float(init_data.get("iou_threshold", 0.50))
        m_type_lower = model_type.lower()
        
        is_flood = "flood" in m_type_lower
        is_building = "building" in m_type_lower or "collapse" in m_type_lower or "structural" in m_type_lower
        
        yolo_model = None
        if not is_flood and not is_building:
            yolo_model = get_model(model_type, model_size)

        await websocket.send_json({"status": "ready_for_video"})

        # Step 2: Receive video binary
        video_bytes = await websocket.receive_bytes()

        tfile = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
        tfile.write(video_bytes)
        tfile.flush()
        tfile.close()
        tfile_path = tfile.name

        cap = cv2.VideoCapture(tfile_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 1
        frame_idx = 0

        # Step 3: Stream annotated frames in real-time
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_idx += 1

            if is_flood:
                f_res = run_flood_inference(frame, conf_threshold=conf_threshold)
                class_counts = f_res["counts"]
                latency = f_res["latency_ms"]
                fps = round(1000 / latency, 1) if latency > 0 else 0
                frame_b64 = f_res["image_base64"].replace("data:image/jpeg;base64,", "")
            elif is_building:
                b_res = run_building_inference(frame, conf_threshold=conf_threshold)
                class_counts = b_res["counts"]
                latency = b_res["latency_ms"]
                fps = round(1000 / latency, 1) if latency > 0 else 0
                frame_b64 = b_res["image_base64"].replace("data:image/jpeg;base64,", "")
            else:
                res = yolo_model.predict(
                    frame,
                    conf=conf_threshold,
                    iou=iou_threshold,
                    device='cpu',
                    verbose=False
                )

                class_name = yolo_model.model.names
                classes = res[0].boxes.cls
                class_counts = {}
                for c in classes:
                    c = int(c)
                    name = class_name[c]
                    class_counts[name] = class_counts.get(name, 0) + 1

                latency = sum(res[0].speed.values())
                fps = round(1000 / latency, 1) if latency > 0 else 0

                annotated_frame = res[0].plot() # BGR
                annotated_rgb = cv2.cvtColor(annotated_frame, cv2.COLOR_BGR2RGB)
                _, buffer = cv2.imencode('.jpg', cv2.cvtColor(annotated_rgb, cv2.COLOR_RGB2BGR), [int(cv2.IMWRITE_JPEG_QUALITY), 80])
                frame_b64 = base64.b64encode(buffer).decode("utf-8")

            msg = {
                "type": "frame",
                "frame": frame_idx,
                "total_frames": total_frames,
                "progress": round((frame_idx / total_frames) * 100, 1),
                "counts": class_counts,
                "latency_ms": round(latency, 1),
                "fps": fps,
                "image": f"data:image/jpeg;base64,{frame_b64}"
            }
            await websocket.send_json(msg)
            await asyncio.sleep(0.001)

        cap.release()
        await websocket.send_json({"type": "completed", "total_frames": frame_idx})

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except:
            pass
    finally:
        if tfile_path and os.path.exists(tfile_path):
            try:
                os.unlink(tfile_path)
            except:
                pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

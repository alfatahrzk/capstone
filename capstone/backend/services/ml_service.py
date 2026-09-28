import os
import numpy as np
import joblib
import logging
from tensorflow.keras.models import load_model # type: ignore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

LEARNING_TYPES = {
    "Standard Learner",
    "Reflective Learner",
    "Fast Learner",
    "Smart Learner",
}

#load model
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")

MODEL_PATH = os.path.join(MODELS_DIR, "learner_type_model.h5")
SCALER_PATH = os.path.join(MODELS_DIR, "scaler.joblib")
ENCODER_PATH = os.path.join(MODELS_DIR, "label_encoder.joblib")

try:
    logger.info("Memuat ML Model dan Preprocessors...")
    ml_model = load_model(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    label_encoder = joblib.load(ENCODER_PATH)
    logger.info("ML Model berhasil dimuat!")
except Exception as e:
    logger.error(f"Gagal memuat ML components. Error: {str(e)}")
    ml_model = None
    scaler = None
    label_encoder = None


def predict_learning_type(
    student: dict,
) -> dict:
    """
    Integration point untuk model ML.

    Input:
        student dengan 5 feature:
        - time_spent_on_course
        - number_of_videos_watched
        - number_of_quizzes_taken
        - quiz_scores
        - completion_rate

    Output:
        {
            "learning_type": str,
            "confidence": float
        }
    """

    if ml_model is None or scaler is None or label_encoder is None:
        raise RuntimeError("Service ML tidak tersedia karena model/scaler gagal dimuat.")

    try:
        # 1. Validasi dan Ekstrak Fitur
        input_features = np.array([[
            float(student["time_spent_on_course"]),
            int(student["number_of_videos_watched"]),
            int(student["number_of_quizzes_taken"]),
            float(student["quiz_scores"]),
            float(student["completion_rate"])
        ]])

        # 2. Preprocessing (Scaling)
        scaled_features = scaler.transform(input_features)

        # 3. Model Inference (Prediksi probabilitas)
        predictions = ml_model.predict(scaled_features, verbose=0)
        
        predicted_class_index = np.argmax(predictions, axis=-1)[0]
        confidence = float(np.max(predictions))

        # 4. Decode Label (inverse transform)
        learning_type = label_encoder.inverse_transform([predicted_class_index])[0]

        if str(learning_type) not in LEARNING_TYPES:
            raise ValueError(f"Invalid learning type dari model: {learning_type}")

        if not 0 <= confidence <= 1:
            raise ValueError("Confidence harus berada di antara 0 dan 1")

        return {
            "learning_type": str(learning_type),
            "confidence": round(confidence, 4),
        }

    except KeyError as e:
        logger.error(f"Missing feature dalam input payload: {str(e)}")
        raise ValueError(f"Input data tidak lengkap: {str(e)}")
    except Exception as e:
        logger.error(f"Terjadi error saat ML Inference: {str(e)}")
        raise RuntimeError(f"Gagal melakukan prediksi ML: {str(e)}")
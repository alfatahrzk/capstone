import logging
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types


load_dotenv()

logger = logging.getLogger(__name__)


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.1-flash-lite",
)


if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY harus tersedia di .env"
    )


client = genai.Client(
    api_key=GEMINI_API_KEY
)


def fallback_description(
    learning_type: str
) -> str:

    return (
        f"Kamu termasuk {learning_type}. "
        "Hasil ini diperoleh berdasarkan pola "
        "aktivitas pembelajaranmu pada course."
    )


def generate_learning_description(
    learning_type: str,
    student: dict,
) -> str:

    prompt = f"""
Kamu sedang menjelaskan hasil profil pembelajaran secara langsung
kepada seorang siswa.

Hasil klasifikasi dari model machine learning:
Learning Type: {learning_type}

Data aktivitas pembelajaran siswa:
- Time spent on course: {student["time_spent_on_course"]}
- Videos watched: {student["number_of_videos_watched"]}
- Quizzes taken: {student["number_of_quizzes_taken"]}
- Quiz score: {student["quiz_scores"]}
- Completion rate: {student["completion_rate"]}%

Buat penjelasan hasil klasifikasi tersebut dalam Bahasa Indonesia.

Aturan:
1. Berbicara langsung kepada siswa menggunakan kata "kamu".
2. Jangan menggunakan sudut pandang orang ketiga seperti
   "siswa ini", "siswa tersebut", atau sejenisnya.
3. Learning Type sudah ditentukan oleh model machine learning.
4. Jangan mengubah atau melakukan klasifikasi ulang terhadap
   Learning Type.
5. Jelaskan bagaimana pola aktivitas belajar siswa berkaitan
   dengan Learning Type tersebut berdasarkan data yang tersedia.
6. Jangan membuat klaim sebab-akibat yang tidak dapat
   disimpulkan dari data.
7. Gunakan bahasa yang natural, ramah, dan mudah dipahami mahasiswa.
8. Gunakan 2 sampai 3 kalimat.
9. Jangan menggunakan Markdown.
10. Jangan menggunakan simbol formatting seperti **, *, #,
    bullet list, atau heading.
11. Jangan menyebut diri sebagai AI, model bahasa, atau asisten.
12. Jangan mengawali jawaban dengan frasa seperti
    "Berdasarkan data yang diberikan".
13. Berikan hanya isi penjelasan, tanpa judul atau label tambahan.
""".strip()

    try:

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                max_output_tokens=512,
                automatic_function_calling=
                    types.AutomaticFunctionCallingConfig(
                        disable=True
                    ),
            ),
        )

        if not response.text:
            raise ValueError(
                "Gemini returned empty response"
            )

        return response.text.strip()

    except Exception as error:

        logger.warning(
            "Gemini unavailable, using fallback: %s",
            error,
        )

        return fallback_description(
            learning_type
        )
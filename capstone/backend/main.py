import os

from pydantic import BaseModel, Field
from fastapi import Header

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

from services.auth_service import get_current_user_id
from services.student_service import (
    get_student_by_auth_user_id,
    update_learning_profile,
)
from services.ml_service import (
    predict_learning_type,
)
from services.demo_service import (
    create_demo_student,
)
from services.llm_service import generate_learning_description


app = FastAPI(
    title="Learner Classification API",
    version="1.0.0",
)


FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://127.0.0.1:5500",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/me/learning-profile")
def get_my_learning_profile(
    auth_user_id: str = Depends(
        get_current_user_id
    )
):

    student = get_student_by_auth_user_id(
        auth_user_id
    )

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )


    # Belum punya prediction
    if not student.get("learning_type"):

        prediction = predict_learning_type(
            student
        )

        learning_type = (
            prediction["learning_type"]
        )

        confidence = (
            prediction["confidence"]
        )


        description = (
            generate_learning_description(
                learning_type=learning_type,
                student=student,
            )
        )


        updated_student = (
            update_learning_profile(
                student_id=student["student_id"],
                learning_type=learning_type,
                confidence=confidence,
                description=description,
            )
        )


        student["learning_type"] = (
            learning_type
        )

        student["confidence"] = (
            confidence
        )

        student["description"] = (
            description
        )


        if updated_student:
            student["predicted_at"] = (
                updated_student[0][
                    "predicted_at"
                ]
            )


    return {
        "student_id":
            student["student_id"],

        "activity": {
            "time_spent_on_course":
                student[
                    "time_spent_on_course"
                ],

            "number_of_videos_watched":
                student[
                    "number_of_videos_watched"
                ],

            "number_of_quizzes_taken":
                student[
                    "number_of_quizzes_taken"
                ],

            "quiz_scores":
                student["quiz_scores"],

            "completion_rate":
                student["completion_rate"],
        },

        "learning_profile": {
            "learning_type":
                student["learning_type"],

            "confidence":
                student["confidence"],

            "description":
                student["description"],

            "predicted_at":
                student.get(
                    "predicted_at"
                ),
        },
    }

class DemoStudentRequest(BaseModel):
    email: str

    password: str = Field(
        min_length=6
    )

    time_spent_on_course: int = Field(
        ge=0,
        le=100,
    )

    number_of_videos_watched: int = Field(
        ge=0,
        le=20,
    )

    number_of_quizzes_taken: int = Field(
        ge=0,
        le=10,
    )

    quiz_scores: int = Field(
        ge=0,
        le=100,
    )

    completion_rate: int = Field(
        ge=0,
        le=100,
    )

@app.post("/demo/students")
def create_student_for_demo(
    request: DemoStudentRequest,
    x_demo_admin_key: str = Header(...)
):

    demo_admin_key = os.getenv(
        "DEMO_ADMIN_KEY"
    )

    if (
        not demo_admin_key
        or x_demo_admin_key
        != demo_admin_key
    ):
        raise HTTPException(
            status_code=403,
            detail="Invalid demo admin key"
        )


    try:

        student = create_demo_student(
            email=request.email,
            password=request.password,

            time_spent_on_course=
                request.time_spent_on_course,

            number_of_videos_watched=
                request.number_of_videos_watched,

            number_of_quizzes_taken=
                request.number_of_quizzes_taken,

            quiz_scores=
                request.quiz_scores,

            completion_rate=
                request.completion_rate,
        )


        return {
            "message":
                "Student created successfully",

            "student_id":
                student["student_id"],

            "email":
                request.email,
        }


    except Exception as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )
from datetime import datetime, timezone

from database import supabase


TABLE_NAME = "student_learning_profiles"


def update_learning_profile(
    student_id: int,
    learning_type: str,
    confidence: float,
    description: str,
):

    predicted_at = datetime.now(timezone.utc).isoformat()

    response = (
        supabase
        .table(TABLE_NAME)
        .update({
            "learning_type": learning_type,
            "confidence": confidence,
            "description": description,
            "predicted_at": predicted_at,
        })
        .eq("student_id", student_id)
        .execute()
    )

    if response is None:
        return None

    return response.data

def get_student_by_auth_user_id(auth_user_id: str):

    response = (
        supabase
        .table(TABLE_NAME)
        .select("*")
        .eq("auth_user_id", auth_user_id)
        .limit(1)
        .execute()
    )

    if response is None or not response.data:
        return None

    return response.data[0]
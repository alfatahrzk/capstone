from database import supabase


TABLE_NAME = "student_learning_profiles"


def create_demo_student(
    email: str,
    password: str,
    time_spent_on_course: int,
    number_of_videos_watched: int,
    number_of_quizzes_taken: int,
    quiz_scores: int,
    completion_rate: int,
):

    auth_response = (
        supabase.auth.admin.create_user(
            {
                "email": email,
                "password": password,
                "email_confirm": True,
            }
        )
    )

    if not auth_response or not auth_response.user:
        raise RuntimeError(
            "Failed to create Supabase Auth user"
        )

    auth_user_id = str(
        auth_response.user.id
    )

    try:

        profile_response = (
            supabase
            .table(TABLE_NAME)
            .insert({
                "auth_user_id":
                    auth_user_id,

                "time_spent_on_course":
                    time_spent_on_course,

                "number_of_videos_watched":
                    number_of_videos_watched,

                "number_of_quizzes_taken":
                    number_of_quizzes_taken,

                "quiz_scores":
                    quiz_scores,

                "completion_rate":
                    completion_rate,

                "learning_type":
                    None,

                "confidence":
                    None,

                "description":
                    None,

                "predicted_at":
                    None,
            })
            .execute()
        )

        if (
            profile_response is None
            or not profile_response.data
        ):
            raise RuntimeError(
                "Failed to create student profile"
            )

        return profile_response.data[0]

    except Exception:

        try:
            supabase.auth.admin.delete_user(
                auth_user_id
            )
        except Exception:
            pass

        raise
LEARNING_TYPES = {
    "Standard Learner",
    "Reflective Learner",
    "Fast Learner",
    "Smart Learner",
}


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

    features = {
        "time_spent_on_course":
            student["time_spent_on_course"],

        "number_of_videos_watched":
            student["number_of_videos_watched"],

        "number_of_quizzes_taken":
            student["number_of_quizzes_taken"],

        "quiz_scores":
            student["quiz_scores"],

        "completion_rate":
            student["completion_rate"],
    }

    # ==========================
    # DUMMY MODEL
    # ==========================
    #
    # Nanti blok ini yang diganti
    # pipeline ML dari teman lu.
    #

    learning_type = "Fast Learner"
    confidence = 0.92


    if learning_type not in LEARNING_TYPES:
        raise ValueError(
            f"Invalid learning type: {learning_type}"
        )

    if not 0 <= confidence <= 1:
        raise ValueError(
            "Confidence harus berada di antara 0 dan 1"
        )


    return {
        "learning_type": learning_type,
        "confidence": confidence,
    }
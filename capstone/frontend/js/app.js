const API_URL = "http://127.0.0.1:8000";


const form = document.getElementById("predictionForm");

const predictButton =
    document.getElementById("predictButton");

const resultContainer =
    document.getElementById("resultContainer");

const predictionResult =
    document.getElementById("predictionResult");

const confidenceResult =
    document.getElementById("confidenceResult");

const errorContainer =
    document.getElementById("errorContainer");


form.addEventListener("submit", async function (event) {

    event.preventDefault();


    // ========================
    // Ambil data dari form
    // ========================

    const data = {

        time_spent_on_course:
            Number(
                document.getElementById("timeSpent").value
            ),

        number_of_videos_watched:
            Number(
                document.getElementById("videosWatched").value
            ),

        number_of_quizzes_taken:
            Number(
                document.getElementById("quizzesTaken").value
            ),

        quiz_scores:
            Number(
                document.getElementById("quizScores").value
            ),

        completion_rate:
            Number(
                document.getElementById("completionRate").value
            )

    };


    try {

        // reset UI
        errorContainer.classList.add("d-none");
        resultContainer.classList.add("d-none");

        predictButton.disabled = true;
        predictButton.innerText = "Predicting...";


        // ========================
        // Request ke FastAPI
        // ========================

        const response = await fetch(
            `${API_URL}/predict`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );


        if (!response.ok) {
            throw new Error(
                `API error: ${response.status}`
            );
        }


        const result = await response.json();


        // ========================
        // Tampilkan hasil
        // ========================

        predictionResult.innerText =
            result.prediction;


        confidenceResult.innerText =
            `${(result.confidence * 100).toFixed(2)}%`;


        resultContainer.classList.remove("d-none");


    }

    catch (error) {

        console.error(error);

        errorContainer.innerText =
            "Failed to get prediction. Make sure the backend is running.";

        errorContainer.classList.remove("d-none");

    }

    finally {

        predictButton.disabled = false;

        predictButton.innerText =
            "Predict Learner Type";

    }

});
const API_URL =
    window.APP_CONFIG.API_BASE_URL;


function showLoading() {

    document
        .getElementById("loadingState")
        .classList.remove("d-none");

    document
        .getElementById("dashboardContent")
        .classList.add("d-none");

    document
        .getElementById("errorAlert")
        .classList.add("d-none");
}


function showDashboard() {

    document
        .getElementById("loadingState")
        .classList.add("d-none");

    document
        .getElementById("dashboardContent")
        .classList.remove("d-none");
}


function showError(message) {

    document
        .getElementById("loadingState")
        .classList.add("d-none");

    const alert =
        document.getElementById("errorAlert");

    alert.innerText = message;

    alert.classList.remove("d-none");
}


function formatPredictedAt(value) {

    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    return date.toLocaleString(
        "id-ID",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


async function loadLearningProfile() {

    showLoading();


    const {
        data: { session }
    } = await supabaseClient.auth.getSession();


    if (!session) {

        window.location.href =
            "login.html";

        return;
    }


    document.getElementById(
        "userEmail"
    ).innerText =
        session.user.email;


    try {

        const response = await fetch(
            `${API_URL}/me/learning-profile`,
            {
                headers: {
                    Authorization:
                        `Bearer ${session.access_token}`
                }
            }
        );


        if (response.status === 401) {

            await supabaseClient.auth.signOut();

            window.location.href =
                "login.html";

            return;
        }


        if (response.status === 404) {

            throw new Error(
                "Student profile is not connected to this account."
            );
        }


        if (!response.ok) {

            throw new Error(
                `API error: ${response.status}`
            );
        }


        const data =
            await response.json();


        renderActivity(
            data.activity
        );

        renderLearningProfile(
            data.learning_profile
        );

        showDashboard();


    } catch (error) {

        console.error(error);

        showError(
            error.message ||
            "Failed to load learning profile."
        );
    }
}


function renderActivity(activity) {

    document.getElementById(
        "completionRate"
    ).innerText =
        `${activity.completion_rate}%`;


    document.getElementById(
        "quizScore"
    ).innerText =
        activity.quiz_scores;


    document.getElementById(
        "videosWatched"
    ).innerText =
        activity.number_of_videos_watched;


    document.getElementById(
        "quizzesTaken"
    ).innerText =
        activity.number_of_quizzes_taken;


    document.getElementById(
        "progressText"
    ).innerText =
        `${activity.completion_rate}%`;


    const progressBar =
        document.getElementById(
            "progressBar"
        );

    progressBar.style.width =
        `${activity.completion_rate}%`;

    progressBar.setAttribute(
        "aria-valuenow",
        activity.completion_rate
    );
}


function renderLearningProfile(profile) {

    document.getElementById(
        "learningType"
    ).innerText =
        profile.learning_type;


    document.getElementById(
        "confidence"
    ).innerText =
        `${(
            profile.confidence * 100
        ).toFixed(0)}% Confidence`;


    document.getElementById(
        "description"
    ).innerText =
        profile.description;


    document.getElementById(
        "predictedAt"
    ).innerText =
        formatPredictedAt(
            profile.predicted_at
        );
}


async function logout() {

    await supabaseClient.auth.signOut();

    window.location.href =
        "login.html";
}


document.addEventListener(
    "DOMContentLoaded",
    loadLearningProfile
);
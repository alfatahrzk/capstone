const API_URL = window.APP_CONFIG.API_BASE_URL;

function showLoading() {
    const loadingState = document.getElementById("loadingState");
    const dashboardContent = document.getElementById("dashboardContent");
    const errorAlert = document.getElementById("errorAlert");

    if (loadingState) {
        loadingState.classList.remove("hidden");
        loadingState.classList.remove("d-none");
    }
    if (dashboardContent) {
        dashboardContent.classList.add("hidden");
        dashboardContent.classList.add("d-none");
    }
    if (errorAlert) {
        errorAlert.classList.add("hidden");
        errorAlert.classList.add("d-none");
    }
}

function showDashboard() {
    const loadingState = document.getElementById("loadingState");
    const dashboardContent = document.getElementById("dashboardContent");

    if (loadingState) {
        loadingState.classList.add("hidden");
        loadingState.classList.add("d-none");
    }
    if (dashboardContent) {
        dashboardContent.classList.remove("hidden");
        dashboardContent.classList.remove("d-none");
    }
}

function showError(message) {
    const loadingState = document.getElementById("loadingState");
    const alert = document.getElementById("errorAlert");

    if (loadingState) {
        loadingState.classList.add("hidden");
        loadingState.classList.add("d-none");
    }

    if (alert) {
        alert.innerText = message;
        alert.classList.remove("hidden");
        alert.classList.remove("d-none");
    }
}

function formatPredictedAt(value) {
    if (!value) {
        return "Not available";
    }

    const date = new Date(value);
    return date.toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

async function loadLearningProfile() {
    showLoading();

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (!session) {
        window.location.href = "login.html";
        return;
    }

    const userEmailEl = document.getElementById("userEmail");
    const userAvatarEl = document.getElementById("userAvatar");

    if (userEmailEl) {
        userEmailEl.innerText = session.user.email;
    }

    if (userAvatarEl && session.user.email) {
        userAvatarEl.innerText = session.user.email.charAt(0).toUpperCase();
    }

    try {
        const response = await fetch(`${API_URL}/me/learning-profile`, {
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        });

        if (response.status === 401) {
            await supabaseClient.auth.signOut();
            window.location.href = "login.html";
            return;
        }

        if (response.status === 404) {
            throw new Error("Student profile is not connected to this account.");
        }

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        renderActivity(data.activity);
        renderLearningProfile(data.learning_profile);

        showDashboard();
    } catch (error) {
        console.error(error);
        if (error.name === "TypeError" && error.message.includes("fetch")) {
            showError("Tidak dapat terhubung ke server backend. Pastikan server backend berjalan di port yang benar (misal port 8000/8080).");
        } else {
            showError(error.message || "Failed to load learning profile.");
        }
    }
}

function renderActivity(activity) {
    const completionRateEl = document.getElementById("completionRate");
    const quizScoreEl = document.getElementById("quizScore");
    const videosWatchedEl = document.getElementById("videosWatched");
    const quizzesTakenEl = document.getElementById("quizzesTaken");
    const progressTextEl = document.getElementById("progressText");
    const progressBarEl = document.getElementById("progressBar");

    if (completionRateEl) completionRateEl.innerText = `${activity.completion_rate}%`;
    if (quizScoreEl) quizScoreEl.innerText = activity.quiz_scores;
    if (videosWatchedEl) videosWatchedEl.innerText = activity.number_of_videos_watched;
    if (quizzesTakenEl) quizzesTakenEl.innerText = activity.number_of_quizzes_taken;
    if (progressTextEl) progressTextEl.innerText = `${activity.completion_rate}%`;

    if (progressBarEl) {
        progressBarEl.style.width = `${activity.completion_rate}%`;
        progressBarEl.setAttribute("aria-valuenow", activity.completion_rate);
    }
}

function renderLearningProfile(profile) {
    const learningTypeEl = document.getElementById("learningType");
    const confidenceEl = document.getElementById("confidence");
    const descriptionEl = document.getElementById("description");
    const predictedAtEl = document.getElementById("predictedAt");

    if (learningTypeEl) learningTypeEl.innerText = profile.learning_type;
    if (confidenceEl) {
        const percent = (profile.confidence * 100).toFixed(0);
        confidenceEl.innerHTML = `
            <svg class="w-3.5 h-3.5 text-ontime-teal-200 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
            <span>${percent}% Confidence</span>
        `;
    }
    if (descriptionEl) descriptionEl.innerText = profile.description;
    if (predictedAtEl) predictedAtEl.innerText = formatPredictedAt(profile.predicted_at);
}

async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", loadLearningProfile);
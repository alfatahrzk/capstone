const API_URL =
    window.APP_CONFIG.API_BASE_URL;


const form =
    document.getElementById(
        "demoStudentForm"
    );


form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const button =
            document.getElementById(
                "createButton"
            );

        const successAlert =
            document.getElementById(
                "successAlert"
            );

        const errorAlert =
            document.getElementById(
                "errorAlert"
            );


        successAlert.classList.add(
            "d-none"
        );

        errorAlert.classList.add(
            "d-none"
        );


        button.disabled = true;

        button.innerText =
            "Creating student...";


        const payload = {


            email:
                document.getElementById(
                    "email"
                ).value,

            password:
                document.getElementById(
                    "password"
                ).value,

            time_spent_on_course:
                Number(
                    document.getElementById(
                        "timeSpent"
                    ).value
                ),

            number_of_videos_watched:
                Number(
                    document.getElementById(
                        "videosWatched"
                    ).value
                ),

            number_of_quizzes_taken:
                Number(
                    document.getElementById(
                        "quizzesTaken"
                    ).value
                ),

            quiz_scores:
                Number(
                    document.getElementById(
                        "quizScore"
                    ).value
                ),

            completion_rate:
                Number(
                    document.getElementById(
                        "completionRate"
                    ).value
                ),
        };


        const adminKey =
            document.getElementById(
                "adminKey"
            ).value;


        try {

            const response = await fetch(
                `${API_URL}/demo/students`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "X-Demo-Admin-Key":
                            adminKey,
                    },

                    body:
                        JSON.stringify(
                            payload
                        ),
                }
            );


            const data =
                await response.json();


            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    "Failed to create student"
                );
            }


            successAlert.innerHTML = `
                <strong>Student created.</strong><br>
                Student ID: ${data.student_id}<br>
                Email: ${data.email}<br><br>
                You can now login using this account.
            `;

            successAlert.classList.remove(
                "d-none"
            );


        } catch (error) {

            console.error(error);

            errorAlert.innerText =
                error.message;

            errorAlert.classList.remove(
                "d-none"
            );


        } finally {

            button.disabled = false;

            button.innerText =
                "Create Demo Student";
        }

    }
);
const loginForm =
    document.getElementById("loginForm");

const loginButton =
    document.getElementById("loginButton");

const errorMessage =
    document.getElementById("errorMessage");


loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;


        errorMessage.classList.add("d-none");

        loginButton.disabled = true;
        loginButton.innerText = "Signing in...";


        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email,
                password,
            });


        if (error) {

            errorMessage.innerText =
                "Email atau password salah.";

            errorMessage.classList.remove("d-none");

            loginButton.disabled = false;
            loginButton.innerText = "Login";

            return;
        }


        if (data.session) {
            window.location.href = "index.html";
        }

    }
);
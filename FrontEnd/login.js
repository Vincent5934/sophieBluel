const myForm = document.querySelector("#myForm");
const errorMessage = document.querySelector("#error");
myForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = e.target.querySelector("[name=email]").value;
  const password = e.target.querySelector("[name=password]").value;

  fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  })
    //Echec connexion
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur dans l'identifiant ou le mot de passe");
      }
      return response.json();
    })
    // Connexion réussie
    .then((data) => {
      window.localStorage.setItem("jeton", data.token);
      window.location.href = "index.html";
    })
    .catch((error) => {
      errorMessage.textContent = error.message;
      errorMessage.style.color = "red";
    });
});

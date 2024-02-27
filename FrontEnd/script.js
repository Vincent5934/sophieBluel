//récupération des données et mise en place du filtre
const apiWorks = "http://localhost:5678/api/works";
const apiCategories = "http://localhost:5678/api/categories";
let tab = [];

fetch(apiWorks)
  .then((response) => response.json())
  .then((works) => {
    displayImage(works);
    displayModal(works); /*Afin d'éviter de refaire un fetch par la suite*/
    tab = works;
  });
fetch(apiCategories)
  .then((response) => response.json())
  .then((categories) => {
    displayCategories(categories);
  });

function displayImage(works) {
  let image = document.querySelector(".gallery");
  image.innerHTML = "";

  for (let i = 0; i < works.length; i++) {
    let figure = document.createElement("figure");
    let img = document.createElement("img");
    let figcaption = document.createElement("figcaption");
    img.setAttribute("src", works[i].imageUrl);
    figure.setAttribute("id", works[i].id);
    figcaption.setAttribute("alt", works[i].title);
    img.setAttribute("crossorigin", "anonymous");
    figcaption.innerHTML = works[i].title;
    image.appendChild(figure);
    figure.append(img, figcaption);
  }
}

function displayCategories(categories) {
  let filtre = document.querySelector(".filtre");
  filtre.innerHTML = "";
  let allButton = document.createElement("button");
  allButton.innerHTML = "Tous";
  filtre.appendChild(allButton);
  allButton.addEventListener("click", function () {
    displayImage(tab);
  });

  for (let i = 0; i < categories.length; i++) {
    let button = document.createElement("button");
    button.setAttribute("value", categories[i].name);
    button.innerHTML = categories[i].name;
    filtre.appendChild(button);
    button.addEventListener("click", function () {
      const filtreImage = tab.filter(function (cat) {
        console.log(categories[i].id, cat.categoryId);
        return cat.categoryId === categories[i].id;
      });
      displayImage(filtreImage);
    });
  }
}

// Mode édition
const login = document.getElementById("login");
const logout = document.getElementById("logout");
const modeEdition = document.querySelector(".mode__edition");
const filtreBtn = document.querySelector(".filtre");
const modifier = document.querySelector(".modif");
const logoModifHaut = document.querySelector(".fa-pen-to-square");
const logoModifBas = document.querySelector(".fa-sharp");

// utilisateur connecté
if (localStorage.getItem("jeton")) {
  logout.style.display = "flex";
  login.style.display = "none";
  filtreBtn.style.display = "none";
  logoModifHaut.style.display = "flex";
  logoModifBas.style.display = "flex";
} else {
  modeEdition.style.display = "none";
  modifier.style.display = "none";
}

// Déconnexion
logout.addEventListener("click", function () {
  localStorage.removeItem("jeton");
  logout.style.display = "none";
  login.style.display = "block";
});

//Modal
const openModal = function (e) {
  e.preventDefault();
  const modal = document.querySelector(e.target.getAttribute("href"));
  modal.style.display = "block";
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");
};

const closeModal = function (e) {
  e.preventDefault();
  const modal = e.target.closest(".modal");
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");
};

document.querySelectorAll(".modif").forEach((a) => {
  a.addEventListener("click", openModal);
});

document.querySelectorAll(".croix").forEach((button) => {
  button.addEventListener("click", closeModal);
});

window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none";
    e.target.setAttribute("aria-hidden", "true");
    e.target.removeAttribute("aria-modal");
  }
});

// Contenu de la modal
function displayModal(works) {
  const modalContent = document.querySelector(".modalContent");
  modalContent.innerHTML = "";
  const jeton = window.localStorage.getItem("jeton");

  for (let i = 0; i < works.length; i++) {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const figcaption = document.createElement("figcaption");
    const poubelle = document.createElement("p");
    const editModal = document.createElement("e");

    img.setAttribute("src", works[i].imageUrl);
    figcaption.setAttribute("alt", works[i].title);
    img.setAttribute("crossorigin", "anonymous");
    poubelle.classList.add("fa-solid", "fa-trash-can");

    // Suppression image
    poubelle.addEventListener("click", function () {
      const supp = works[i].id;
      fetch(apiWorks + "/" + supp, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + jeton,
          "Content-Type": "application/json",
        },
      }).then((data) => {
        figure.remove();
        document.getElementById(works[i].id).remove();
      });
    });
    modalContent.appendChild(figure);
    figure.append(img, figcaption, poubelle, editModal);
  }
}

// Passage modal2 via ajout Image
const btnAjoutImage = document.querySelector(".ajoutImage");
const modal1 = document.getElementById("modal1");
const modal2 = document.getElementById("modal2");

btnAjoutImage.addEventListener("click", () => {
  modal2.style.display = "flex";
  modal1.style.display = "none";

});

// Passage modal1 via flèche retour
const flecheRetour = document.querySelector(".fa-arrow-left");
flecheRetour.addEventListener("click", () => {
  modal1.style.display = "flex";
  modal2.style.display = "none";
});

// Modal2 : ajout d'une image
const form = document.getElementById("formImage");
const ajoutPhoto = document.getElementById("uploadPhoto");
const jeton = window.localStorage.getItem("jeton");

// affichage de la prévisualisation de l'image sélectionnée
ajoutPhoto.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    const afficherImage = document.createElement("img");
    const afficherContainer = document.createElement("div");
    const modalContent2 = document.querySelector(".modalContent2");
    const reader = new FileReader();
    reader.onload = function (e) {
      afficherImage.setAttribute("src", e.target.result);
      afficherContainer.appendChild(afficherImage);
      form.insertBefore(afficherContainer, form.childNodes[0]);
    };
    reader.readAsDataURL(file);
    modalContent2.style.display = "none";
  }
 
});

// soumission du formulaire
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;
  const file = document.getElementById("uploadPhoto").files[0];
  if (!title || !category || !file) {
    alert("Veuillez remplir tous les champs du formulaire");
    return;
  }

  // envoi du formulaire
  const formData = new FormData();
  formData.append("title", title);
  formData.append("category", category);
  formData.append("image", file);

  // envoi de la requête pour ajout photo
  fetch(apiWorks, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + jeton,
    },
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const modalContent = document.querySelector(".modalContent");
      const galleryContent = document.querySelector(".gallery");
      const figureModal = document.createElement("figure");
      const figureGallery = document.createElement("figure");
      const imgModal = document.createElement("img");
      const imgGallery = document.createElement("img");
      const figcaption = document.createElement("figcaption");
      const corbeille = document.createElement("p");
      const editModal = document.createElement("e");  
      imgGallery.setAttribute("src", data.imageUrl);
      imgModal.setAttribute("src", data.imageUrl);
      imgModal.setAttribute("id", data.id);
      figcaption.innerHTML = data.title;
      corbeille.classList.add("fa-solid", "fa-trash-can");
      figureModal.append(imgModal, figcaption, corbeille, editModal);
      modalContent.appendChild(figureModal);
      figureGallery.append(imgGallery, figcaption);
      galleryContent.appendChild(figureGallery);
     
      closeModal(e);

      corbeille.addEventListener("click", () => {
        figureModal.remove();
        figureGallery.remove();
        const supp = data.id;
        fetch(apiWorks + "/" + supp, {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + jeton,
            "Content-Type": "application/json",
          },
        }).then((data) => {
          figureGallery.remove();
        });
        
      });
    
    })
  
    .catch((error) =>
      console.error("Erreur lors de l'ajout du projet :", error)
      
    );
    
});

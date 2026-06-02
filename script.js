const spacePhotos = [
  {
    title: "Recepção",
    caption: "Primeiro contato em um ambiente acolhedor no Albany Medical Center.",
    src: "./assets/space/recepcao-2.jpg",
    alt: "Recepção da Neo Fisioterapia e Pilates",
  },
  {
    title: "Sala de Pilates",
    caption: "Equipamentos para exercícios orientados de força, mobilidade e controle.",
    src: "./assets/space/sala-pilates-1.jpg",
    alt: "Sala de pilates equipada da Neo Fisioterapia",
  },
  {
    title: "Fisioterapia",
    caption: "Espaço para reabilitação, exercícios terapêuticos e acompanhamento.",
    src: "./assets/space/sala-fisio-4.jpg",
    alt: "Sala de fisioterapia da Neo Fisioterapia",
  },
  {
    title: "Cinesioterapia",
    caption: "Área preparada para recursos ativos e recuperação funcional.",
    src: "./assets/space/sala-cinesioterapia-1.jpg",
    alt: "Sala de cinesioterapia da Neo Fisioterapia",
  },
  {
    title: "Acupuntura",
    caption: "Sala reservada para atendimentos terapêuticos complementares.",
    src: "./assets/space/sala-acupuntura-1.jpg",
    alt: "Sala de acupuntura da Neo Fisioterapia",
  },
  {
    title: "RPG",
    caption: "Ambiente dedicado ao trabalho postural individualizado.",
    src: "./assets/space/sala-rpg.jpg",
    alt: "Sala de RPG da Neo Fisioterapia",
  },
  {
    title: "Consultório",
    caption: "Sala para sua avaliação, orientação e acompanhamento.",
    src: "./assets/space/consultorio-2.jpg",
    alt: "Consultório da Neo Fisioterapia",
  },
  {
    title: "Entrada da clínica",
    caption: "Localização no térreo do Albany Medical Center, em Águas Claras.",
    src: "./assets/space/entrada-clinica-1.jpg",
    alt: "Entrada da Neo Fisioterapia no Albany Medical Center",
  },
];

const spaceGallery = document.querySelector("#spaceGallery");

if (spaceGallery) {
  spaceGallery.innerHTML = spacePhotos
    .map(
      (photo) => `
        <article class="space-card ${photo.featured ? "featured" : ""}">
          <img src="${photo.src}" alt="${photo.alt}" decoding="async" />
          <div class="space-card-copy">
            <h3>${photo.title}</h3>
            <p>${photo.caption}</p>
          </div>
        </article>
      `,
    )
    .join("");
}

const serviceToggles = document.querySelectorAll(".service-toggle");

serviceToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const card = toggle.closest(".service-card");
    const details = card.querySelector(".service-details");
    const isOpen = card.classList.toggle("is-open");

    toggle.setAttribute("aria-expanded", String(isOpen));
    details.style.maxHeight = isOpen ? `${details.scrollHeight}px` : "0px";
  });
});

window.addEventListener("resize", () => {
  document.querySelectorAll(".service-card.is-open .service-details").forEach((details) => {
    details.style.maxHeight = `${details.scrollHeight}px`;
  });
});

const leadForm = document.querySelector("#leadForm");

if (leadForm) {
  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(leadForm);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const message = `Olá, meu nome é ${name}. Gostaria de agendar uma avaliação na Neo Fisioterapia e Pilates. Meu telefone é ${phone}.`;
    const whatsappUrl = `https://wa.me/5561998240564?text=${encodeURIComponent(message)}`;

    window.location.href = whatsappUrl;
  });
}

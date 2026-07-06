const runtimeScript = document.querySelector('script[src*="script.js"]');
const assetBaseUrl = new URL("./assets/", runtimeScript?.src || window.location.href);

const spacePhotos = [
  {
    title: "Recepção",
    caption: "Primeiro contato em um ambiente acolhedor no Albany Medical Center.",
    src: new URL("./space/recepcao-2.jpg", assetBaseUrl).href,
    alt: "Recepção da Neo Fisioterapia e Pilates",
  },
  {
    title: "Sala de Pilates",
    caption: "Equipamentos para exercícios orientados de força, mobilidade e controle.",
    src: new URL("./space/sala-pilates-1.jpg", assetBaseUrl).href,
    alt: "Sala de pilates equipada da Neo Fisioterapia",
  },
  {
    title: "Fisioterapia",
    caption: "Espaço para reabilitação, exercícios terapêuticos e acompanhamento.",
    src: new URL("./space/sala-fisio-4.jpg", assetBaseUrl).href,
    alt: "Sala de fisioterapia da Neo Fisioterapia",
  },
  {
    title: "Cinesioterapia",
    caption: "Área preparada para recursos ativos e recuperação funcional.",
    src: new URL("./space/sala-cinesioterapia-1.jpg", assetBaseUrl).href,
    alt: "Sala de cinesioterapia da Neo Fisioterapia",
  },
  {
    title: "Acupuntura",
    caption: "Sala reservada para atendimentos terapêuticos complementares.",
    src: new URL("./space/sala-acupuntura-1.jpg", assetBaseUrl).href,
    alt: "Sala de acupuntura da Neo Fisioterapia",
  },
  {
    title: "RPG",
    caption: "Ambiente dedicado ao trabalho postural individualizado.",
    src: new URL("./space/sala-rpg.jpg", assetBaseUrl).href,
    alt: "Sala de RPG da Neo Fisioterapia",
  },
  {
    title: "Consultório",
    caption: "Sala para sua avaliação, orientação e acompanhamento.",
    src: new URL("./space/consultorio-2.jpg", assetBaseUrl).href,
    alt: "Consultório da Neo Fisioterapia",
  },
  {
    title: "Entrada da clínica",
    caption: "Localização no térreo do Albany Medical Center, em Águas Claras.",
    src: new URL("./space/entrada-clinica-1.jpg", assetBaseUrl).href,
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

const revealElements = document.querySelectorAll(
  ".differentials-grid article, .insurance-list li, .insurance-cta, .lead-copy, .lead-form, .symptom-list article, .service-card, .team-card, .space-card, .journey-list article, .contact-copy, .map-frame, .faq-list details, .footer-main > *",
);

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else if ("IntersectionObserver" in window) {
  revealElements.forEach((element) => element.classList.add("reveal"));

  const revealVisibleElements = () => {
    revealElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        element.classList.add("is-visible");
      }
    });
  };

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
  revealVisibleElements();
  window.addEventListener("scroll", revealVisibleElements, { passive: true });
  window.setTimeout(revealVisibleElements, 120);
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  const ddd = digits.slice(0, 2);
  const firstPart = digits.length > 10 ? digits.slice(2, 7) : digits.slice(2, 6);
  const secondPart = digits.length > 10 ? digits.slice(7, 11) : digits.slice(6, 10);

  if (digits.length <= 2) {
    return ddd ? `(${ddd}` : "";
  }

  if (!secondPart) {
    return `(${ddd}) ${firstPart}`;
  }

  return `(${ddd}) ${firstPart}-${secondPart}`;
};

const getPhoneDigits = (value) => value.replace(/\D/g, "");

const LEAD_WEBHOOK_URL = "https://api.icebergcompany.com.br/lead-webhook/neofisioterapia";
const LEAD_ORIGIN = "neo-fisioterapia-lp";
const LEAD_UNIT = "Neo Fisioterapia e Pilates";
const LEAD_WHATSAPP_NUMBER = "5561998240564";
const LEAD_SUBMIT_LOCK_MS = 5000;

const isValidBrazilPhone = (value) => {
  const digits = getPhoneDigits(value);

  if (digits.length !== 10 && digits.length !== 11) {
    return false;
  }

  if (/^(\d)\1+$/.test(digits)) {
    return false;
  }

  const ddd = Number(digits.slice(0, 2));

  return ddd >= 11 && ddd <= 99;
};

const leadForm = document.querySelector("#leadForm");
const leadPhone = document.querySelector("#leadPhone");
const leadFormError = document.querySelector("#leadFormError");
const leadSubmitButton = leadForm?.querySelector('button[type="submit"]');
const leadSubmitButtonDefaultText = leadSubmitButton?.textContent || "Agendar";
const leadModal = document.querySelector("#leadModal");
const leadModalDialog = leadModal?.querySelector(".lead-modal-dialog");
const leadModalOpeners = document.querySelectorAll("[data-lead-open]");
const leadModalClosers = document.querySelectorAll("[data-lead-close]");

let leadFormUnlockTimer = null;
let leadFormLockedUntil = 0;
let leadFormStarted = false;

const pushDataLayerEvent = (eventName, params = {}) => {
  if (!Array.isArray(window.dataLayer)) return;

  window.dataLayer.push({
    event: eventName,
    page_path: window.location.pathname,
    ...params,
  });
};

const showLeadFormError = (message) => {
  if (!leadFormError) return;

  leadFormError.textContent = message;
  leadFormError.classList.toggle("is-visible", Boolean(message));
};

const setLeadFormLockedState = (isLocked) => {
  if (!leadForm || !leadSubmitButton) return;

  leadForm.dataset.submitting = String(isLocked);
  leadForm.setAttribute("aria-busy", String(isLocked));
  leadSubmitButton.disabled = isLocked;
  leadSubmitButton.textContent = isLocked ? "Abrindo..." : leadSubmitButtonDefaultText;
};

const lockLeadFormTemporarily = () => {
  leadFormLockedUntil = Date.now() + LEAD_SUBMIT_LOCK_MS;
  window.clearTimeout(leadFormUnlockTimer);
  setLeadFormLockedState(true);

  leadFormUnlockTimer = window.setTimeout(() => {
    leadFormLockedUntil = 0;
    setLeadFormLockedState(false);
  }, LEAD_SUBMIT_LOCK_MS);
};

if (leadPhone) {
  leadPhone.addEventListener("input", () => {
    leadPhone.value = formatPhone(leadPhone.value);
    leadPhone.setCustomValidity("");
    leadPhone.removeAttribute("aria-invalid");
    showLeadFormError("");
  });

  leadPhone.addEventListener("paste", (event) => {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData("text") || "";
    leadPhone.value = formatPhone(pastedText);
  });
}

const openLeadModal = (trigger = "cta") => {
  if (!leadModal) return;

  leadModal.classList.add("is-open");
  leadModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  pushDataLayerEvent("lead_modal_open", { modal_trigger: trigger });

  window.setTimeout(() => {
    leadForm?.querySelector("input")?.focus();
  }, 80);
};

const closeLeadModal = () => {
  if (!leadModal) return;

  leadModal.classList.remove("is-open");
  leadModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
};

leadModalOpeners.forEach((opener) => {
  opener.addEventListener("click", (event) => {
    event.preventDefault();
    const trigger = opener.getAttribute("data-lead-trigger") || "cta";
    openLeadModal(trigger);
  });
});

leadModalClosers.forEach((closer) => {
  closer.addEventListener("click", closeLeadModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && leadModal?.classList.contains("is-open")) {
    closeLeadModal();
  }
});

leadModalDialog?.addEventListener("click", (event) => {
  event.stopPropagation();
});

if (leadForm) {
  leadForm.addEventListener("focusin", () => {
    if (leadFormStarted) return;

    leadFormStarted = true;
    pushDataLayerEvent("lead_form_start");
  });
}

if (leadForm) {
  leadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (Date.now() < leadFormLockedUntil) {
      showLeadFormError("Aguarde alguns segundos antes de enviar novamente.");
      return;
    }

    const formData = new FormData(leadForm);
    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const phoneDigits = getPhoneDigits(phone);

    if (!name || name.length < 2) {
      showLeadFormError("Informe seu nome para continuar.");
      leadForm.querySelector("#leadName")?.focus();
      return;
    }

    if (!isValidBrazilPhone(phone)) {
      const message = "Informe um telefone válido com DDD. Use apenas números.";
      showLeadFormError(message);
      leadPhone?.setCustomValidity(message);
      leadPhone?.setAttribute("aria-invalid", "true");
      leadPhone?.reportValidity();
      leadPhone?.focus();
      return;
    }

    if (window.location.protocol === "https:" && !LEAD_WEBHOOK_URL.startsWith("https://")) {
      showLeadFormError("Não foi possível enviar seus dados com segurança. Tente novamente em instantes.");
      return;
    }

    const specialty = leadForm.dataset.specialty || "fisioterapia";
    const message = `Olá, gostaria de atendimento para ${specialty}, por favor. Meu nome é ${name} e meu telefone é ${phone}.`;
    const whatsappUrl = `https://wa.me/${LEAD_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    const leadPayload = {
      nome: name,
      whatsapp: phoneDigits,
      origem: LEAD_ORIGIN,
      unidade: LEAD_UNIT,
      pagina: window.location.href,
    };

    showLeadFormError("");
    lockLeadFormTemporarily();
    leadPhone.value = formatPhone(phoneDigits);

    pushDataLayerEvent("lead_form_submit");

    const webhookRequest = fetch(LEAD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadPayload),
      keepalive: true,
    });

    const whatsappWindow = window.open(whatsappUrl, "_blank", "noopener");
    pushDataLayerEvent("whatsapp_open");

    if (!whatsappWindow) {
      window.location.href = whatsappUrl;
    }

    leadForm.reset();

    try {
      const response = await webhookRequest;

      if (!response.ok) {
        throw new Error(`Lead webhook responded with status ${response.status}`);
      }
    } catch (error) {
      console.error("Lead webhook error:", error);
      showLeadFormError(
        "Seu WhatsApp foi aberto, mas não conseguimos registrar seus dados automaticamente. Se precisar, envie sua mensagem normalmente.",
      );
    }
  });
}

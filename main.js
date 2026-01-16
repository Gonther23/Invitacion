const leftFlower = document.querySelector(".flower-left");
const rightFlower = document.querySelector(".flower-right");
const heroText = document.querySelector(".hero-text");

const photoSection = document.querySelector(".photo-section");
const photoOverlay = document.querySelector(".photo-overlay");

/* 👉 NUEVO: sección padres */
const parentsContainer = document.querySelector(".parents-container");

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;

  /* FLORES */
  const move = scrollY * 0.9;
  const scale = 1 + Math.min(scrollY / 1000, 1.5);

  leftFlower.style.transform = `translateX(-${move}px) scale(${scale})`;
  rightFlower.style.transform = `translateX(${move}px) scale(${scale})`;

  /* =====================
   HERO TEXT SCROLL SHOW / HIDE
===================== */
const heroText = document.querySelector(".hero-text");
let heroHidden = false;
if (window.scrollY > 20 && !heroHidden) {
  heroText.classList.add("hide");
  heroHidden = true;
}


  /* TEXTO HERO */
  const maxHeroScroll = 400;
  const heroProgress = Math.min(scrollY / maxHeroScroll, 1);

  heroText.style.opacity = 1 - heroProgress;
  heroText.style.transform = `
    translate(-50%, -50%)
    scale(${1 + heroProgress * 0.3})
  `;

  /* TEXTO SOBRE FOTO */
  const sectionTop = photoSection.getBoundingClientRect().top;
  const triggerPoint = window.innerHeight * 0.75;

  if (sectionTop < triggerPoint) {
    photoOverlay.classList.add("show");
    photoSection.classList.add("active");
  }

  /* PALABRAS DE LOS PADRES */
  if (parentsContainer) {
    const parentsTop = parentsContainer.getBoundingClientRect().top;
    if (parentsTop < window.innerHeight * 0.8) {
      parentsContainer.classList.add("show");
    }
  }
});

/* =====================
   POLAROID STACK GALLERY
===================== */

const gallery = document.querySelector(".stack-gallery");
const stackImages = Array.from(document.querySelectorAll(".stack-img"));

let currentIndex = 0;
let startX = 0;
let isDragging = false;
let hasMoved = false;
let dragDelta = 0;

/* ROTACIONES */
function assignRotations() {
  stackImages.forEach((img) => {
    img.dataset.rotation = (Math.random() * 24 - 12).toFixed(2);
  });
}

/* STACK */
function updateStack() {
  stackImages.forEach((img, index) => {
    img.className = "stack-img";

    const rotation = img.dataset.rotation;
    const offset = index - currentIndex;

    if (offset === 0) {
      // ACTIVA
      img.classList.add("active");
      img.style.opacity = 1;
      img.style.transform = `rotate(${rotation}deg) scale(1) translateY(0)`;
      img.style.zIndex = 10;
    } else if (offset > 0) {
      // TODAS LAS DE ATRÁS (APILADAS)
      img.style.opacity = 1;
      img.style.transform = `
        rotate(${rotation}deg)
        scale(${1 - offset * 0.04})
        translateY(${offset * 14}px)
      `;
      img.style.zIndex = 10 - offset;
    } else {
      // LAS QUE YA PASARON
      img.style.opacity = 0;
      img.style.zIndex = 0;
    }
  });
}

/* CAMBIO */
function changeImage(direction = "right") {
  currentIndex++;

  /* =====================
     FIN → REGRESAN JUNTAS
  ===================== */
  if (currentIndex >= stackImages.length) {
    const fromX = direction === "right" ? "-220vw" : "220vw";

    stackImages.forEach((img) => {
      img.style.transition = "none";
      img.style.opacity = 0;
      img.style.transform = `
        translateX(${fromX})
        rotate(${img.dataset.rotation}deg)
        scale(1)
      `;
    });

    assignRotations();
    currentIndex = 0;

    /* regresan todas juntas */
    setTimeout(() => {
      stackImages.forEach((img) => {
        img.style.transition = "transform 1.4s ease, opacity 0.6s ease";
        img.style.opacity = 0;
      });
      updateStack();
    }, 80);

    return;
  }

  updateStack();
}
/* =====================
   CLICK → SOLO FOCUS
===================== */
gallery.addEventListener("click", () => {
  if (hasMoved) return;

  const img = stackImages[currentIndex];
  const rotation = img.dataset.rotation;

  img.classList.toggle("focused");
  img.style.transition = "transform 0.4s ease";

  if (img.classList.contains("focused")) {
    img.style.transform = `rotate(0deg) scale(0.95)`;
  } else {
    img.style.transform = `rotate(${rotation}deg) scale(1)`;
  }
});

/* =====================
   DESKTOP: CLICK → SIGUIENTE FOTO
===================== */

gallery.addEventListener("mousedown", (e) => {
  // Solo mouse (no touch)
  if (e.pointerType === "touch") return;

  // Click derecho → anterior
  const direction = e.button === 2 ? "left" : "right";

  const img = stackImages[currentIndex];
  const r = Number(img.dataset.rotation);

  img.style.transition = `
    transform 1.4s cubic-bezier(0.25, 0.8, 0.25, 1),
    opacity 0.6s ease
  `;

  img.style.transform = `
    translateX(${direction === "right" ? "110vw" : "-110vw"})
    rotate(${r * 1.2}deg)
    scale(1)
  `;
  img.style.opacity = 0;

  setTimeout(() => {
    changeImage(direction);
  }, 200);
});


/* =====================
   SWIPE
===================== */
gallery.addEventListener("pointerdown", (e) => {
  isDragging = true;
  hasMoved = false;
  startX = e.clientX;

  const img = stackImages[currentIndex];
  img.classList.remove("focused");
  img.style.transition = "none";
});

gallery.addEventListener("pointermove", (e) => {
  if (!isDragging) return;

  dragDelta = e.clientX - startX;
  if (Math.abs(dragDelta) > 10) hasMoved = true;

  const img = stackImages[currentIndex];
  const r = Number(img.dataset.rotation);

  img.style.transform = `
    translateX(${dragDelta}px)
    rotate(${r + dragDelta * 0.03}deg)
    scale(1)
  `;
});

gallery.addEventListener("pointerup", () => {
  if (!isDragging) return;
  isDragging = false;

  const img = stackImages[currentIndex];
  const r = Number(img.dataset.rotation);
  const direction = dragDelta > 0 ? "right" : "left";

  img.style.transition = `
    transform 1.6s cubic-bezier(0.25, 0.8, 0.25, 1),
    opacity 0.8s ease
  `;

  if (Math.abs(dragDelta) > 80) {
    img.style.transform = `
      translateX(${direction === "right" ? "110vw" : "-110vw"})
      rotate(${r * 1.2}deg)
      scale(1)
    `;
    img.style.opacity = 0;

    setTimeout(changeImage, 30);
  } else {
    img.style.transform = `rotate(${r}deg) scale(1)`;
  }

  dragDelta = 0;
});

gallery.addEventListener("pointerleave", () => {
  isDragging = false;
});

/* INIT */
assignRotations();
updateStack();

/*======================================*/

/* =====================
   COUNTDOWN TIMER
===================== */
const targetDate = new Date("2026-04-11T09:40:00");

const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

function updateCountdown() {
  const now = new Date();
  const diff = targetDate - now;

  if (diff <= 0) {
    daysEl.textContent = "00";
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    secondsEl.textContent = "00";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  daysEl.textContent = String(days).padStart(2, "0");
  hoursEl.textContent = String(hours).padStart(2, "0");
  minutesEl.textContent = String(minutes).padStart(2, "0");
  secondsEl.textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);




// FORZAR SCROLL AL INICIO AL RECARGAR
window.history.scrollRestoration = "manual";

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});

/* =====================
   RSVP SIMPLE 3 BOTONES
   OPCIÓN 2 - FORMSPREE
===================== */

/* =====================
   IDENTIFICADOR INVITADO
===================== */

const params = new URLSearchParams(window.location.search);
const invitadoId = params.get("id");

const invitadoInput = document.getElementById("invitado");

if (!invitadoId) {
  document.body.innerHTML = "<h2>Invitación no válida</h2>";
  throw new Error("Invitado no definido");
}

invitadoInput.value = invitadoId;
const storageKey = `rsvp_${invitadoId}`;

/* =====================
   CONFIGURACIÓN
===================== */

// 👇 CUPO MÁXIMO DE ESTA INVITACIÓN
const paramsInv = new URLSearchParams(window.location.search);

const INVITADOS_MAX = Number(params.get("max")) || 1;
/* =====================
   ELEMENTOS
===================== */

const form = document.querySelector('form[name="rsvp"]');
const respuesta = document.getElementById("respuesta");
const personas = document.getElementById("personas");

const btnSi = document.getElementById("btn-si");
const btnMenos = document.getElementById("btn-menos");
const btnNo = document.getElementById("btn-no");

const selectBox = document.getElementById("selectBox");
const selectPersonas = document.getElementById("selectPersonas");
const btnConfirmarMenor = document.getElementById("btn-confirmar-menor");

const buttonsContainer = document.querySelector(".rsvp-buttons");
const thanksMsg = document.getElementById("thanksMsg");

/* =====================
   BLOQUEO SI YA RESPONDIÓ
===================== */

if (localStorage.getItem(storageKey)) {
  buttonsContainer.style.display = "none";
  thanksMsg.textContent = "Invitación enviada 💌";
  thanksMsg.style.display = "block";
}

/* =====================
   INICIALIZACIÓN
===================== */

selectPersonas.innerHTML = "";
for (let i = 1; i < INVITADOS_MAX; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = i;
  selectPersonas.appendChild(option);
}

/* =====================
   FUNCIONES
===================== */

function mostrarGracias() {
  thanksMsg.textContent = "Gracias, tu respuesta ha sido registrada 💚";
  buttonsContainer.style.display = "none";
  thanksMsg.style.display = "block";
}

function enviarRespuesta(textoRespuesta, cantidadPersonas) {
  respuesta.value = textoRespuesta;
  personas.value = cantidadPersonas;

  localStorage.setItem(storageKey, "enviado");

  mostrarGracias();
  form.submit();
}

/* =====================
   EVENTOS
===================== */

/* 1️⃣ SI ASISTE */
btnSi.addEventListener("click", () => {
  enviarRespuesta("Asistirá", INVITADOS_MAX);
});

/* 2️⃣ MENOS PERSONAS */
btnMenos.addEventListener("click", () => {
  const abierto = selectBox.classList.toggle("show");

  btnMenos.classList.toggle("active", abierto);
  btnMenos.textContent = abierto
    ? "Cancelar selección"
    : "Asistiré con menos personas";

  buttonsContainer.classList.toggle("hide-others", abierto);
});

/* CONFIRMAR MENOR */
btnConfirmarMenor.addEventListener("click", () => {
  enviarRespuesta(
    "Asistirá con menos personas",
    selectPersonas.value
  );
});

/* 3️⃣ NO ASISTE */
btnNo.addEventListener("click", () => {
  enviarRespuesta("No asistirá", 0);
});

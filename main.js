/* =========================
   ELEMENTOS PRINCIPALES
========================= */
const leftFlower = document.querySelector(".flower-left");
const rightFlower = document.querySelector(".flower-right");
const heroText = document.querySelector(".hero-text");
const parentsContainer = document.querySelector(".parents-container");

/* =========================
   SCROLL ANIMATIONS
========================= */
let heroHidden = false;

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;

  /* FLORES */
  const move = scrollY * 0.9;
  const scale = 1 + Math.min(scrollY / 1000, 1.5);

  if (leftFlower && rightFlower) {
    leftFlower.style.transform = `translateX(-${move}px) scale(${scale})`;
    rightFlower.style.transform = `translateX(${move}px) scale(${scale})`;
  }

  /* HERO TEXT */
  if (scrollY > 20 && !heroHidden) {
    heroText.classList.add("hide");
    heroHidden = true;
  }

  const maxHeroScroll = 400;
  const heroProgress = Math.min(scrollY / maxHeroScroll, 1);

  heroText.style.opacity = 1 - heroProgress;
  heroText.style.transform = `
    translate(-50%, -50%)
    scale(${1 + heroProgress * 0.3})
  `;

  /* PALABRAS DE LOS PADRES */
  if (parentsContainer) {
    const parentsTop = parentsContainer.getBoundingClientRect().top;
    if (parentsTop < window.innerHeight * 0.8) {
      parentsContainer.classList.add("show");
    }
  }
});

/* =========================
   COUNTDOWN TIMER
========================= */
const targetDate = new Date("2026-04-11T04:00:00");

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

/* =========================
   FORZAR SCROLL AL INICIO
========================= */
window.history.scrollRestoration = "manual";
window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});

/* =========================
   RSVP (FORMSPREE)
========================= */
const params = new URLSearchParams(window.location.search);
const invitadoId = params.get("id");
const INVITADOS_MAX = Number(params.get("max")) || 1;

if (!invitadoId) {
  document.body.innerHTML = "<h2>Invitación no válida</h2>";
  throw new Error("Invitado no definido");
}

const storageKey = `rsvp_${invitadoId}`;

const form = document.querySelector('form[name="rsvp"]');
const invitadoInput = document.getElementById("invitado");
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

invitadoInput.value = invitadoId;

/* BLOQUEO SI YA RESPONDIÓ */
if (localStorage.getItem(storageKey)) {
  buttonsContainer.style.display = "none";
  thanksMsg.textContent = "Invitación enviada 💌";
  thanksMsg.style.display = "block";
}

/* SELECT PERSONAS */
selectPersonas.innerHTML = "";
for (let i = 1; i < INVITADOS_MAX; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = i;
  selectPersonas.appendChild(option);
}

function mostrarGracias() {
  thanksMsg.textContent = "Gracias, tu respuesta ha sido registrada 💚";
  buttonsContainer.style.display = "none";
  thanksMsg.style.display = "block";
}

function enviarRespuesta(texto, cantidad) {
  respuesta.value = texto;
  personas.value = cantidad;
  localStorage.setItem(storageKey, "enviado");
  mostrarGracias();
  form.submit();
}

btnSi.addEventListener("click", () => {
  enviarRespuesta("Asistirá", INVITADOS_MAX);
});

btnMenos.addEventListener("click", () => {
  const abierto = selectBox.classList.toggle("show");
  btnMenos.classList.toggle("active", abierto);
  btnMenos.textContent = abierto
    ? "Cancelar selección"
    : "Asistiré con menos personas";
  buttonsContainer.classList.toggle("hide-others", abierto);
});

btnConfirmarMenor.addEventListener("click", () => {
  enviarRespuesta("Asistirá con menos personas", selectPersonas.value);
});

btnNo.addEventListener("click", () => {
  enviarRespuesta("No asistirá", 0);
});

/* =========================
   SPOTIFY AUDIO PLAYER
========================= */
const music = document.getElementById("bgMusic");
const playBtn = document.getElementById("playBtn");
const progressBar = document.getElementById("progressBar");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");

let musicStarted = false;

music.volume = 0.6;

/* =====================
   PLAY / PAUSE MANUAL
===================== */
const playIcon = document.getElementById("playIcon");

playBtn.addEventListener("click", () => {
  if (music.paused) {
    music.play();
    playIcon.src = "assets/pausa.png";
    playIcon.alt = "Pausa";
  } else {
    music.pause();
    playIcon.src = "assets/boton-de-play.png";
    playIcon.alt = "Play";
  }
});

/* =====================
   AUTOPLAY CON PRIMER GESTO REAL
===================== */
function startMusic() {
  if (musicStarted) return;

  music
    .play()
    .then(() => {
      playIcon.src = "assets/pausa.png";
      musicStarted = true;

      // eliminar listeners después de iniciar
      window.removeEventListener("wheel", startMusic);
      window.removeEventListener("touchstart", startMusic);
      window.removeEventListener("keydown", startMusic);
    })
    .catch(() => {});
}

// gestos válidos según navegadores
window.addEventListener("wheel", startMusic, { passive: true });
window.addEventListener("touchstart", startMusic, { passive: true });
window.addEventListener("keydown", startMusic);

/* =====================
   METADATA
===================== */
music.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(music.duration);
});

/* =====================
   PROGRESO
===================== */
music.addEventListener("timeupdate", () => {
  if (!music.duration) return;

  const progress = (music.currentTime / music.duration) * 100;
  progressBar.style.width = `${progress}%`;
  currentTimeEl.textContent = formatTime(music.currentTime);
});

/* =====================
   FIN DE CANCIÓN
===================== */
music.addEventListener("ended", () => {
  playIcon.src = "assets/boton-de-play.png";
  progressBar.style.width = "0%";
  musicStarted = false;
});

/* =====================
   FORMATO TIEMPO
===================== */
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${min}:${sec}`;
}

import { saveProgress } from "./api.js";

const user = JSON.parse(localStorage.getItem("user") || "null");

const quiz = [
  {
    q: "Ce înseamnă XSS?",
    a: ["Cross Site Scripting", "Extra Secure System", "Extended Server Script"],
    c: 0
  },
  {
    q: "Ce tool este folosit des pentru scanare?",
    a: ["Nmap", "Excel", "Photoshop"],
    c: 0
  },
  {
    q: "Ce este phishing?",
    a: ["Un atac de inginerie socială", "Un firewall", "Un antivirus"],
    c: 0
  }
];

let current = 0;
let score = 0;
let answered = false;

const questionEl = document.getElementById("quiz-question");
const answersEl = document.getElementById("quiz-answers");
const feedbackEl = document.getElementById("quiz-feedback");
const scoreEl = document.getElementById("quiz-score");
const nextBtn = document.getElementById("next-quiz");

function renderQuestion() {
  answered = false;
  const item = quiz[current];

  if (!questionEl || !answersEl || !feedbackEl || !scoreEl) return;

  questionEl.textContent = item.q;
  feedbackEl.textContent = "";
  feedbackEl.classList.remove("error");
  scoreEl.textContent = String(score);
  answersEl.innerHTML = "";

  item.a.forEach((answer, idx) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = answer;
    btn.addEventListener("click", () => choose(idx));
    answersEl.appendChild(btn);
  });
}

async function choose(idx) {
  if (answered) return;
  answered = true;

  const item = quiz[current];
  const buttons = Array.from(document.querySelectorAll(".answer-btn"));

  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === item.c) btn.classList.add("correct");
    if (i === idx && idx !== item.c) btn.classList.add("wrong");
  });

  if (idx === item.c) {
    score += 1;
    feedbackEl.textContent = "Corect!";
    feedbackEl.classList.remove("error");
  } else {
    feedbackEl.textContent = "Greșit!";
    feedbackEl.classList.add("error");
  }

  scoreEl.textContent = String(score);

  if (user) {
    await saveProgress({
      user_id: user.id,
      lesson_id: `quiz-${current + 1}`,
      lesson_title: `Quiz ${current + 1}`,
      completed: true,
      score
    });
  }
}

nextBtn?.addEventListener("click", () => {
  current += 1;
  if (current >= quiz.length) current = 0;
  renderQuestion();
});

renderQuestion();

import { saveProgress } from "./api.js";

const user = JSON.parse(localStorage.getItem("user") || "null");

const tests = [
  {
    q: "HTTP folosește portul:",
    a: ["80", "443", "21"],
    c: 0
  },
  {
    q: "SQL Injection afectează în principal:",
    a: ["Baze de date", "Monitoare", "Tastaturi"],
    c: 0
  },
  {
    q: "HTTPS este:",
    a: ["HTTP securizat", "Un antivirus", "Un sistem de fișiere"],
    c: 0
  }
];

const listEl = document.getElementById("test-list");
const submitBtn = document.getElementById("submit-test");
const scoreEl = document.getElementById("test-score");

function renderTests() {
  if (!listEl) return;

  listEl.innerHTML = "";

  tests.forEach((item, i) => {
    const wrap = document.createElement("div");
    wrap.className = "card";
    wrap.style.marginTop = "14px";
    wrap.innerHTML = `
      <h3>${item.q}</h3>
      <div class="answers-grid">
        ${item.a.map((answer, j) => `
          <label class="answer-btn">
            <input type="radio" name="q${i}" value="${j}">
            ${answer}
          </label>
        `).join("")}
      </div>
    `;
    listEl.appendChild(wrap);
  });
}

async function submitTest() {
  let score = 0;

  tests.forEach((item, i) => {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    if (selected && Number(selected.value) === item.c) score += 1;
  });

  if (scoreEl) scoreEl.textContent = String(score);

  if (user) {
    await saveProgress({
      user_id: user.id,
      lesson_id: "test-1",
      lesson_title: "Test 1",
      completed: true,
      score
    });
  }
}

submitBtn?.addEventListener("click", submitTest);
renderTests();

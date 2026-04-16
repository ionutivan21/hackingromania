const term = document.getElementById("terminal");
const input = document.getElementById("cmd");

function appendLine(text) {
  const line = document.createElement("div");
  line.className = "line";
  line.textContent = text;
  term.appendChild(line);
  term.scrollTop = term.scrollHeight;
}

appendLine("Terminal ready. Type 'help'.");

input?.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  const cmd = input.value.trim().toLowerCase();
  if (!cmd) return;

  appendLine(`> ${cmd}`);

  if (cmd === "help") {
    appendLine("Commands: help, scan, hack, xp, clear");
  } else if (cmd === "scan") {
    appendLine("Scanning target...");
    appendLine("Target found.");
  } else if (cmd === "hack") {
    appendLine("Access granted 😈");
  } else if (cmd === "xp") {
    appendLine("XP +10");
  } else if (cmd === "clear") {
    term.innerHTML = "";
  } else {
    appendLine("Unknown command.");
  }

  input.value = "";
});

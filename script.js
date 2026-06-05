const STORAGE_KEY = "paroleMieWords";
const BACKUP_TIME_KEY = "paroleMieLastBackupAt";

function today() {
  return new Date().toISOString().slice(0, 10);
}

const starterWords = [
  { italian: "litigare", chinese: "吵架", note: "Non voglio litigare con te.", wrongCount: 0, createdAt: today() },
  { italian: "trasloco", chinese: "搬家", note: "Il trasloco è stato faticoso.", wrongCount: 0, createdAt: today() },
  { italian: "nostalgia", chinese: "怀念 / 乡愁", note: "Ho nostalgia di casa.", wrongCount: 0, createdAt: today() },
  { italian: "colloquio", chinese: "面试 / 谈话", note: "Domani ho un colloquio.", wrongCount: 0, createdAt: today() },
  { italian: "presenza", chinese: "存在 / 出席", note: "La tua presenza è importante.", wrongCount: 0, createdAt: today() }
];

let words = loadWords();
let currentQuestion = null;
let quizMode = "zhToIt";
let quizScope = "all";
let answeredCount = 0;

const views = document.querySelectorAll(".view");
const navButtons = document.querySelectorAll(".nav-btn");
const wordForm = document.getElementById("wordForm");
const italianInput = document.getElementById("italianInput");
const chineseInput = document.getElementById("chineseInput");
const noteInput = document.getElementById("noteInput");
const quizBox = document.getElementById("quizBox");
const nextQuestionBtn = document.getElementById("nextQuestionBtn");
const wordList = document.getElementById("wordList");
const wrongList = document.getElementById("wrongList");
const clearAllBtn = document.getElementById("clearAllBtn");
const clearWrongBtn = document.getElementById("clearWrongBtn");
const quizCounter = document.getElementById("quizCounter");
const exportBackupBtn = document.getElementById("exportBackupBtn");
const importBackupBtn = document.getElementById("importBackupBtn");
const backupFileInput = document.getElementById("backupFileInput");
const backupStatus = document.getElementById("backupStatus");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const searchResults = document.getElementById("searchResults");

function loadWords() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(starterWords));
    return [...starterWords];
  }
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [...starterWords];
  } catch {
    return [...starterWords];
  }
}

function saveWords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

function switchView(targetId) {
  views.forEach((view) => view.classList.toggle("active", view.id === targetId));
  navButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.target === targetId));
  document.querySelector(".view-stack").scrollTop = 0;
  render();
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.target));
});

function updateStats() {
  document.getElementById("totalWords").textContent = words.length;
  document.getElementById("todayWords").textContent = words.filter((word) => word.createdAt === today()).length;
  document.getElementById("wrongWords").textContent = words.filter((word) => (word.wrongCount || 0) > 0).length;
}


function renderSearchResults() {
  if (!searchResults || !searchInput) return;

  const keyword = searchInput.value.trim().toLowerCase();

  if (!keyword) {
    searchResults.innerHTML = `<p class="empty search-empty">输入中文或意大利语，就可以在词库里查找单词。</p>`;
    return;
  }

  const results = words.filter((word) => {
    const italian = String(word.italian || "").toLowerCase();
    const chinese = String(word.chinese || "").toLowerCase();
    const note = String(word.note || "").toLowerCase();
    return italian.includes(keyword) || chinese.includes(keyword) || note.includes(keyword);
  });

  renderList(searchResults, results, "没有找到这个单词。", false);
}

function renderWordList() {
  renderList(wordList, words, "现在还没有生词。先添加一个吧。", true);
  const wrongWords = words
    .filter((word) => (word.wrongCount || 0) > 0)
    .sort((a, b) => (b.wrongCount || 0) - (a.wrongCount || 0));
  renderList(wrongList, wrongWords, "现在还没有错题。答错的单词会自动出现在这里。", false);
}

function renderList(container, list, emptyText, allowDelete) {
  if (list.length === 0) {
    container.innerHTML = `<p class="empty">${emptyText}</p>`;
    return;
  }

  container.innerHTML = list.map((word) => {
    const originalIndex = words.indexOf(word);
    return `
      <article class="word-card">
        <div>
          <h3>${escapeHtml(word.italian)} <span>— ${escapeHtml(word.chinese)}</span></h3>
          ${word.note ? `<p class="word-note">${escapeHtml(word.note)}</p>` : ""}
          <p class="word-meta">错题次数：${word.wrongCount || 0}</p>
        </div>
        ${allowDelete ? `<button class="delete-btn" onclick="deleteWord(${originalIndex})">删除</button>` : ""}
      </article>
    `;
  }).join("");
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function deleteWord(index) {
  words.splice(index, 1);
  saveWords();
  render();
  createQuestion();
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function questionPool() {
  return quizScope === "wrong" ? words.filter((word) => (word.wrongCount || 0) > 0) : words;
}

function createQuestion() {
  const pool = questionPool();
  quizCounter.textContent = `${answeredCount}/${Math.max(pool.length, 0)}`;

  if (pool.length < 4) {
    quizBox.className = "quiz-box empty";
    quizBox.innerHTML = quizScope === "wrong"
      ? `<p>错题至少需要 4 个，才能生成选择题。你可以先用全部词库测试。</p>`
      : `<p>至少添加 4 个生词后，就可以开始选择题测试。</p>`;
    return;
  }

  const answer = pool[Math.floor(Math.random() * pool.length)];
  const wrongSource = words.filter((word) => word !== answer);
  const wrongOptions = shuffle(wrongSource).slice(0, 3);
  const options = shuffle([answer, ...wrongOptions]);

  currentQuestion = { answer, options, answered: false };
  const questionText = quizMode === "zhToIt"
    ? `“${answer.chinese}” 对应哪个意大利语？`
    : `“${answer.italian}” 是什么意思？`;

  quizBox.className = "quiz-box";
  quizBox.innerHTML = `
    <div class="quiz-question">${escapeHtml(questionText)}</div>
    ${options.map((option, index) => {
      const optionText = quizMode === "zhToIt" ? option.italian : option.chinese;
      const label = String.fromCharCode(65 + index);
      return `<button class="option" data-label="${label}" onclick="checkAnswer(${index})">${escapeHtml(optionText)}</button>`;
    }).join("")}
    <div id="feedback" class="feedback"></div>
  `;
}

function checkAnswer(selectedIndex) {
  if (!currentQuestion || currentQuestion.answered) return;
  currentQuestion.answered = true;
  answeredCount += 1;

  const selected = currentQuestion.options[selectedIndex];
  const isCorrect = selected === currentQuestion.answer;
  const optionButtons = document.querySelectorAll(".option");

  optionButtons.forEach((button, index) => {
    const option = currentQuestion.options[index];
    if (option === currentQuestion.answer) button.classList.add("correct");
    if (index === selectedIndex && !isCorrect) button.classList.add("wrong");
  });

  const feedback = document.getElementById("feedback");
  const answer = currentQuestion.answer;

  if (isCorrect) {
    feedback.textContent = `回答正确！“${answer.italian}” 意为 “${answer.chinese}”。`;
  } else {
    answer.wrongCount = (answer.wrongCount || 0) + 1;
    saveWords();
    feedback.textContent = `回答错误。正确答案：${answer.italian} = ${answer.chinese}`;
  }
  render();
}

function formatDateTime(isoText) {
  if (!isoText) return "还没有导出过备份";
  const date = new Date(isoText);
  if (Number.isNaN(date.getTime())) return "还没有导出过备份";
  return `最近一次导出：${date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  })}`;
}

function updateBackupStatus() {
  backupStatus.textContent = formatDateTime(localStorage.getItem(BACKUP_TIME_KEY));
}

function exportBackup() {
  const now = new Date().toISOString();
  const backup = {
    app: "Diario delle Parole di Lina",
    version: 6,
    exportedAt: now,
    words
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `salvataggio-parole-lina-${today()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  localStorage.setItem(BACKUP_TIME_KEY, now);
  updateBackupStatus();
}

function normalizeImportedWords(data) {
  const importedWords = Array.isArray(data) ? data : data && Array.isArray(data.words) ? data.words : null;
  if (!importedWords) return null;
  return importedWords
    .filter((word) => word && typeof word === "object")
    .map((word) => ({
      italian: String(word.italian || "").trim(),
      chinese: String(word.chinese || "").trim(),
      note: String(word.note || "").trim(),
      wrongCount: Number.isFinite(Number(word.wrongCount)) ? Math.max(0, Number(word.wrongCount)) : 0,
      createdAt: word.createdAt || today()
    }))
    .filter((word) => word.italian && word.chinese);
}

function importBackupFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const importedWords = normalizeImportedWords(parsed);
      if (!importedWords || importedWords.length === 0) {
        alert("这个备份文件里没有可导入的单词。");
        return;
      }
      const shouldReplace = confirm(
        `找到 ${importedWords.length} 个单词。\n\n点“确定”：覆盖当前词库。\n点“取消”：追加到当前词库。`
      );
      words = shouldReplace ? importedWords : [...importedWords, ...words];
      saveWords();
      answeredCount = 0;
      render();
      createQuestion();
      switchView("libraryView");
      alert("导入成功！");
    } catch {
      alert("导入失败：请选择本 App 导出的 .json 备份文件。");
    } finally {
      backupFileInput.value = "";
    }
  };
  reader.readAsText(file);
}

wordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const newWord = {
    italian: italianInput.value.trim(),
    chinese: chineseInput.value.trim(),
    note: noteInput.value.trim(),
    wrongCount: 0,
    createdAt: today()
  };
  if (!newWord.italian || !newWord.chinese) return;
  words.unshift(newWord);
  saveWords();
  wordForm.reset();
  render();
  createQuestion();
});

document.querySelectorAll(".mode-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".mode-btn").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    quizMode = button.dataset.mode;
    createQuestion();
  });
});

document.querySelectorAll(".scope-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".scope-btn").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    quizScope = button.dataset.scope;
    createQuestion();
  });
});

nextQuestionBtn.addEventListener("click", createQuestion);
exportBackupBtn.addEventListener("click", exportBackup);
importBackupBtn.addEventListener("click", () => backupFileInput.click());
backupFileInput.addEventListener("change", (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  importBackupFile(file);
});

searchInput.addEventListener("input", renderSearchResults);

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  renderSearchResults();
  searchInput.focus();
});

clearAllBtn.addEventListener("click", () => {
  if (!confirm("确定要清空全部生词吗？这个操作不能恢复。")) return;
  words = [];
  answeredCount = 0;
  saveWords();
  render();
  createQuestion();
});

clearWrongBtn.addEventListener("click", () => {
  words = words.map((word) => ({ ...word, wrongCount: 0 }));
  saveWords();
  render();
  createQuestion();
});

function render() {
  updateStats();
  renderWordList();
  renderSearchResults();
  updateBackupStatus();
  quizCounter.textContent = `${answeredCount}/${Math.max(questionPool().length, 0)}`;
}

render();
createQuestion();

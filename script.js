/* =========================================================
   STUDYFLOW
   Fresh-account student workspace
   ========================================================= */


/* ================= DATA ================= */

let accounts = JSON.parse(localStorage.getItem("studyflow_accounts")) || {};

let currentUser = localStorage.getItem("studyflow_current_user");

let currentLessonId = null;

let timerInterval = null;
let timerSeconds = 25 * 60;
let selectedTimerMinutes = 25;


/* ================= ACCOUNT SYSTEM ================= */

function saveAccounts() {
  localStorage.setItem(
    "studyflow_accounts",
    JSON.stringify(accounts)
  );
}


function showSignup() {
  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("signupBox").classList.remove("hidden");
  clearAuthMessage();
}


function showLogin() {
  document.getElementById("signupBox").classList.add("hidden");
  document.getElementById("loginBox").classList.remove("hidden");
  clearAuthMessage();
}


function showAuthMessage(message, success = false) {

  const box = document.getElementById("authMessage");

  box.textContent = message;

  box.style.color = success
    ? "#059669"
    : "#ef4444";
}


function clearAuthMessage() {
  document.getElementById("authMessage").textContent = "";
}


function signup() {

  const name =
    document.getElementById("signupName").value.trim();

  const email =
    document.getElementById("signupEmail").value.trim().toLowerCase();

  const password =
    document.getElementById("signupPassword").value;

  if (!name || !email || !password) {

    showAuthMessage(
      "Please fill in all the fields."
    );

    return;
  }

  if (accounts[email]) {

    showAuthMessage(
      "An account with this email or username already exists."
    );

    return;
  }


  /* IMPORTANT:
     No default subjects.
     No default lessons.
     No fake books.
     No fake quizzes.
  */

  accounts[email] = {

    name: name,

    email: email,

    password: password,

    subjects: [],

    lessons: [],

    books: [],

    quizzes: [],

    route: [],

    focusMinutes: 0,

    streak: 0,

    settings: {

      dark: false,

      compact: false,

      accent: "#6c5ce7"

    }

  };


  saveAccounts();

  currentUser = email;

  localStorage.setItem(
    "studyflow_current_user",
    currentUser
  );


  showApp();

}


function login() {

  const email =
    document.getElementById("loginEmail").value.trim().toLowerCase();

  const password =
    document.getElementById("loginPassword").value;


  if (!email || !password) {

    showAuthMessage(
      "Enter your login details."
    );

    return;
  }


  const account = accounts[email];


  if (!account) {

    showAuthMessage(
      "Account not found."
    );

    return;
  }


  if (account.password !== password) {

    showAuthMessage(
      "Incorrect password."
    );

    return;
  }


  currentUser = email;

  localStorage.setItem(
    "studyflow_current_user",
    currentUser
  );


  showApp();

}


function logout() {

  localStorage.removeItem(
    "studyflow_current_user"
  );

  currentUser = null;

  document.getElementById("app").classList.add("hidden");
  document.getElementById("authScreen").classList.remove("hidden");

  showLogin();

}


/* ================= CURRENT ACCOUNT ================= */

function getUser() {

  if (!currentUser) return null;

  return accounts[currentUser];

}


function saveUser() {

  if (!currentUser) return;

  accounts[currentUser] = getUser();

  saveAccounts();

}


/* ================= APP START ================= */

function showApp() {

  const user = getUser();

  if (!user) return;


  document.getElementById("authScreen")
    .classList.add("hidden");

  document.getElementById("app")
    .classList.remove("hidden");


  updateUserDisplay();

  applyUserSettings();

  refreshEverything();

}


function updateUserDisplay() {

  const user = getUser();

  if (!user) return;

  const name = user.name || "Student";

  document.getElementById("welcomeName")
    .textContent = name;

  document.getElementById("topUserName")
    .textContent = name;

  document.getElementById("sideUserName")
    .textContent = name;

  document.getElementById("userAvatar")
    .textContent = name.charAt(0).toUpperCase();

  document.getElementById("topAvatar")
    .textContent = name.charAt(0).toUpperCase();

}


/* ================= PAGE NAVIGATION ================= */

function showPage(pageId, button = null) {

  document.querySelectorAll(".page")
    .forEach(page => page.classList.remove("active-page"));

  const page = document.getElementById(pageId);

  if (page) {
    page.classList.add("active-page");
  }


  document.querySelectorAll(".nav-btn")
    .forEach(btn => btn.classList.remove("active"));


  if (button) {

    button.classList.add("active");

  } else {

    document.querySelectorAll(".nav-btn")
      .forEach(btn => {

        if (
          btn.getAttribute("onclick") &&
          btn.getAttribute("onclick").includes(
            `'${pageId}'`
          )
        ) {
          btn.classList.add("active");
        }

      });

  }


  const titles = {

    dashboard: "Dashboard",

    subjects: "My Subjects",

    learn: "Learn",

    route: "Study Route",

    focus: "Focus Center",

    revision: "Revision Radar",

    stuck: "I'm Stuck",

    books: "E-Book Library",

    quiz: "Quick Quiz",

    universe: "Knowledge Universe",

    customize: "Customize"

  };


  document.getElementById("pageTitle")
    .textContent = titles[pageId] || "StudyFlow";


  if (window.innerWidth <= 760) {

    document.querySelector(".sidebar")
      .classList.remove("open");

  }

}


/* ================= REFRESH EVERYTHING ================= */

function refreshEverything() {

  updateDashboard();

  renderSubjects();

  renderLearn();

  renderRoute();

  renderRevision();

  renderBooks();

  renderQuiz();

  renderUniverse();

}


/* ================= DASHBOARD ================= */

function updateDashboard() {

  const user = getUser();

  if (!user) return;


  const subjects =
    user.subjects || [];

  const lessons =
    user.lessons || [];


  document.getElementById("focusStat")
    .textContent =
    `${user.focusMinutes || 0} min`;


  document.getElementById("subjectStat")
    .textContent =
    subjects.length;


  document.getElementById("lessonStat")
    .textContent =
    lessons.length;


  document.getElementById("streakStat")
    .textContent =
    `${user.streak || 0} days`;


  const empty =
    document.getElementById("dashboardEmpty");

  const content =
    document.getElementById("dashboardContent");


  if (
    subjects.length === 0 &&
    lessons.length === 0
  ) {

    empty.classList.remove("hidden");
    content.classList.add("hidden");

    return;

  }


  empty.classList.add("hidden");
  content.classList.remove("hidden");


  renderDashboardSubjects();
  renderDashboardLessons();

}


function renderDashboardSubjects() {

  const user = getUser();

  const box =
    document.getElementById("dashboardSubjects");

  box.innerHTML = "";


  user.subjects.forEach(subject => {

    const lessons =
      user.lessons.filter(
        lesson =>
          lesson.subjectId === subject.id
      );

    const completed =
      lessons.filter(
        lesson => lesson.completed
      ).length;

    const percentage =
      lessons.length
        ? Math.round(
            completed / lessons.length * 100
          )
        : 0;


    box.innerHTML += `

      <div class="lesson-item">

        <strong>${escapeHTML(subject.name)}</strong>

        <span>
          ${lessons.length} lesson(s)
          • ${percentage}% complete
        </span>

      </div>

    `;

  });

}


function renderDashboardLessons() {

  const user = getUser();

  const box =
    document.getElementById("dashboardLessons");

  box.innerHTML = "";


  const lessons =
    [...user.lessons]
      .reverse()
      .slice(0, 5);


  if (lessons.length === 0) {

    box.innerHTML = `
      <div class="empty-mini">
        No lessons added yet.
      </div>
    `;

    return;
  }


  lessons.forEach(lesson => {

    const subject =
      user.subjects.find(
        s => s.id === lesson.subjectId
      );


    box.innerHTML += `

      <div class="lesson-item"
           onclick="openLesson('${lesson.id}')">

        <strong>
          ${escapeHTML(lesson.name)}
        </strong>

        <span>
          ${subject
            ? escapeHTML(subject.name)
            : "Unknown subject"}
        </span>

      </div>

    `;

  });

}


/* ================= SUBJECTS ================= */

function openSubjectModal() {

  document.getElementById("subjectModal")
    .classList.remove("hidden");

  document.getElementById("newSubjectName")
    .focus();

}


function closeSubjectModal() {

  document.getElementById("subjectModal")
    .classList.add("hidden");

  document.getElementById("newSubjectName")
    .value = "";

}


function addSubject() {

  const input =
    document.getElementById("newSubjectName");

  const name =
    input.value.trim();


  if (!name) return;


  const user = getUser();


  user.subjects.push({

    id: crypto.randomUUID(),

    name: name

  });


  saveUser();

  closeSubjectModal();

  refreshEverything();

}


function renderSubjects() {

  const user = getUser();

  const box =
    document.getElementById("subjectsList");

  const empty =
    document.getElementById("subjectsEmpty");


  box.innerHTML = "";


  if (user.subjects.length === 0) {

    empty.classList.remove("hidden");

    return;

  }


  empty.classList.add("hidden");


  user.subjects.forEach(subject => {

    const lessons =
      user.lessons.filter(
        lesson =>
          lesson.subjectId === subject.id
      );


    const completed =
      lessons.filter(
        lesson => lesson.completed
      ).length;


    const percentage =
      lessons.length
        ? Math.round(
            completed / lessons.length * 100
          )
        : 0;


    box.innerHTML += `

      <div class="subject-card">

        <h3>${escapeHTML(subject.name)}</h3>

        <p>
          ${lessons.length} lesson(s)
        </p>

        <div class="progress">
          <div style="width:${percentage}%"></div>
        </div>

        <div class="subject-footer">
          <span>${percentage}% complete</span>
          <span>${completed}/${lessons.length}</span>
        </div>

        <div class="add-lesson-box">

          <input
            id="lesson-${subject.id}"
            placeholder="Add a lesson..."
          >

          <button
            onclick="addLesson('${subject.id}')">
            + Add Lesson
          </button>

        </div>

      </div>

    `;

  });

}


function addLesson(subjectId) {

  const input =
    document.getElementById(
      `lesson-${subjectId}`
    );


  if (!input) return;


  const name =
    input.value.trim();


  if (!name) return;


  const user = getUser();


  user.lessons.push({

    id: crypto.randomUUID(),

    subjectId: subjectId,

    name: name,

    notes: "",

    completed: false,

    createdAt: Date.now()

  });


  saveUser();

  refreshEverything();

}


/* ================= LEARN ================= */

function renderLearn() {

  const user = getUser();

  const box =
    document.getElementById("learnLessons");

  const empty =
    document.getElementById("learnEmpty");


  box.innerHTML = "";


  if (user.lessons.length === 0) {

    empty.classList.remove("hidden");

    return;

  }


  empty.classList.add("hidden");


  user.lessons.forEach(lesson => {

    const subject =
      user.subjects.find(
        s => s.id === lesson.subjectId
      );


    box.innerHTML += `

      <div
        class="lesson-item"
        onclick="openLesson('${lesson.id}')"
      >

        <strong>
          ${escapeHTML(lesson.name)}
        </strong>

        <span>
          ${subject
            ? escapeHTML(subject.name)
            : ""}
        </span>

      </div>

    `;

  });

}


function openLesson(id) {

  const user = getUser();

  const lesson =
    user.lessons.find(
      item => item.id === id
    );


  if (!lesson) return;


  currentLessonId = id;


  const subject =
    user.subjects.find(
      s => s.id === lesson.subjectId
    );


  document.getElementById("lessonPlaceholder")
    .classList.add("hidden");


  document.getElementById("lessonDetails")
    .classList.remove("hidden");


  document.getElementById("detailSubject")
    .textContent =
    subject ? subject.name : "";


  document.getElementById("detailLesson")
    .textContent =
    lesson.name;


  document.getElementById("lessonNotes")
    .value =
    lesson.notes || "";


  showPage("learn");

}


function saveCurrentNotes() {

  if (!currentLessonId) return;


  const user = getUser();

  const lesson =
    user.lessons.find(
      item => item.id === currentLessonId
    );


  if (!lesson) return;


  lesson.notes =
    document.getElementById(
      "lessonNotes"
    ).value;


  saveUser();

}


function markLessonDone() {

  if (!currentLessonId) return;


  const user = getUser();

  const lesson =
    user.lessons.find(
      item => item.id === currentLessonId
    );


  if (!lesson) return;


  lesson.completed =
    !lesson.completed;


  saveUser();

  refreshEverything();

  openLesson(currentLessonId);

}


/* ================= STUDY ROUTE ================= */

function createRoute() {

  const user = getUser();

  if (user.lessons.length === 0) {

    alert(
      "Add some lessons first."
    );

    return;

  }


  user.route =
    user.lessons.map(
      lesson => lesson.id
    );


  saveUser();

  renderRoute();

}


function renderRoute() {

  const user = getUser();

  const box =
    document.getElementById("routeList");

  const empty =
    document.getElementById("routeEmpty");


  box.innerHTML = "";


  if (!user.route ||
      user.route.length === 0) {

    empty.classList.remove("hidden");

    return;

  }


  empty.classList.add("hidden");


  user.route.forEach(
    (lessonId, index) => {

      const lesson =
        user.lessons.find(
          l => l.id === lessonId
        );


      if (!lesson) return;


      const subject =
        user.subjects.find(
          s => s.id === lesson.subjectId
        );


      box.innerHTML += `

        <div class="route-item">

          <div class="route-number">
            ${index + 1}
          </div>

          <div>
            <strong>
              ${escapeHTML(lesson.name)}
            </strong>

            <span>
              ${subject
                ? escapeHTML(subject.name)
                : ""}
            </span>
          </div>

        </div>

      `;

    }

  );

}


/* ================= FOCUS TIMER ================= */

function setTimer(minutes) {

  selectedTimerMinutes = minutes;

  timerSeconds =
    minutes * 60;

  updateTimerDisplay();

}


function updateTimerDisplay() {

  const mins =
    Math.floor(
      timerSeconds / 60
    )
      .toString()
      .padStart(2, "0");


  const secs =
    (timerSeconds % 60)
      .toString()
      .padStart(2, "0");


  document.getElementById("timer")
    .textContent =
    `${mins}:${secs}`;


  const total =
    selectedTimerMinutes * 60;


  const percent =
    Math.max(
      0,
      Math.min(
        100,
        timerSeconds / total * 100
      )
    );


  document.getElementById("timerProgress")
    .style.width =
    `${percent}%`;

}


function startTimer() {

  if (timerInterval) return;


  timerInterval =
    setInterval(() => {

      if (timerSeconds <= 0) {

        clearInterval(timerInterval);

        timerInterval = null;

        const user = getUser();

        user.focusMinutes +=
          selectedTimerMinutes;

        saveUser();

        refreshEverything();

        alert("Focus session complete.");

        setTimer(
          selectedTimerMinutes
        );

        return;

      }


      timerSeconds--;

      updateTimerDisplay();

    }, 1000);

}


function pauseTimer() {

  clearInterval(timerInterval);

  timerInterval = null;

}


function resetTimer() {

  pauseTimer();

  setTimer(
    selectedTimerMinutes
  );

}


/* ================= REVISION ================= */

function renderRevision() {

  const user = getUser();

  const box =
    document.getElementById("revisionList");

  const empty =
    document.getElementById("revisionEmpty");


  box.innerHTML = "";


  const completed =
    user.lessons.filter(
      lesson => lesson.completed
    );


  if (completed.length === 0) {

    empty.classList.remove("hidden");

    return;

  }


  empty.classList.add("hidden");


  completed.forEach(lesson => {

    const subject =
      user.subjects.find(
        s => s.id === lesson.subjectId
      );


    box.innerHTML += `

      <div class="quiz-card">

        <strong>
          ${escapeHTML(lesson.name)}
        </strong>

        <div class="quiz-answer">
          ${subject
            ? escapeHTML(subject.name)
            : ""}
          • Completed
        </div>

      </div>

    `;

  });

}


/* ================= STUCK ================= */

function stuckResponse(type) {

  const answer =
    document.getElementById("stuckAnswer");


  const responses = {

    concept:
      "Break the topic into smaller ideas. Identify the exact term, rule, or step you do not understand, then study that piece before returning to the full lesson.",

    memory:
      "Try active recall: close your notes and explain the topic from memory. Then check what you missed and repeat after a short interval.",

    question:
      "Look at the question and identify what information is given, what is being asked, and which concept or formula connects the two.",

    start:
      "Choose one lesson, spend 5 minutes understanding its basic idea, then continue step-by-step. Avoid trying to study everything at once."

  };


  answer.textContent =
    responses[type];


  answer.classList.remove("hidden");

}


/* ================= BOOKS ================= */

function addBook() {

  const name =
    document.getElementById("bookName")
      .value.trim();

  const link =
    document.getElementById("bookLink")
      .value.trim();


  if (!name) return;


  const user = getUser();


  user.books.push({

    id: crypto.randomUUID(),

    name: name,

    link: link

  });


  saveUser();

  document.getElementById("bookName")
    .value = "";

  document.getElementById("bookLink")
    .value = "";

  renderBooks();

}


function renderBooks() {

  const user = getUser();

  const box =
    document.getElementById("booksList");

  const empty =
    document.getElementById("booksEmpty");


  box.innerHTML = "";


  if (user.books.length === 0) {

    empty.classList.remove("hidden");

    return;

  }


  empty.classList.add("hidden");


  user.books.forEach(book => {

    box.innerHTML += `

      <div class="book-card">

        <h3>
          ${escapeHTML(book.name)}
        </h3>

        ${
          book.link
            ? `
              <a
                href="${escapeAttribute(book.link)}"
                target="_blank"
                rel="noopener"
              >
                Open Resource →
              </a>
            `
            : `
              <span class="muted">
                No link added
              </span>
            `
        }

      </div>

    `;

  });

}


/* ================= QUIZ ================= */

function openQuizModal() {

  document.getElementById("quizModal")
    .classList.remove("hidden");

}


function closeQuizModal() {

  document.getElementById("quizModal")
    .classList.add("hidden");

  document.getElementById("questionText")
    .value = "";

  document.getElementById("answerText")
    .value = "";

}


function addQuizQuestion() {

  const question =
    document.getElementById("questionText")
      .value.trim();

  const answer =
    document.getElementById("answerText")
      .value.trim();


  if (!question || !answer) return;


  const user = getUser();


  user.quizzes.push({

    id: crypto.randomUUID(),

    question: question,

    answer: answer

  });


  saveUser();

  closeQuizModal();

  renderQuiz();

}


function renderQuiz() {

  const user = getUser();

  const box =
    document.getElementById("quizList");

  const empty =
    document.getElementById("quizEmpty");


  box.innerHTML = "";


  if (user.quizzes.length === 0) {

    empty.classList.remove("hidden");

    return;

  }


  empty.classList.add("hidden");


  user.quizzes.forEach(item => {

    box.innerHTML += `

      <div class="quiz-card">

        <strong>
          ${escapeHTML(item.question)}
        </strong>

        <div class="quiz-answer">
          Answer: ${escapeHTML(item.answer)}
        </div>

      </div>

    `;

  });

}


/* ================= KNOWLEDGE UNIVERSE ================= */

function renderUniverse() {

  const user = getUser();

  const box =
    document.getElementById("universeMap");

  const empty =
    document.getElementById("universeEmpty");


  box.innerHTML = "";


  if (user.subjects.length === 0) {

    box.classList.add("hidden");

    empty.classList.remove("hidden");

    return;

  }


  box.classList.remove("hidden");

  empty.classList.add("hidden");


  user.subjects.forEach(subject => {

    const count =
      user.lessons.filter(
        l =>
          l.subjectId === subject.id
      ).length;


    box.innerHTML += `

      <div class="universe-subject">

        <strong>
          ${escapeHTML(subject.name)}
        </strong>

        <span>
          ${count} lesson(s)
        </span>

      </div>

    `;

  });

}


/* ================= CUSTOMIZATION ================= */

function applyUserSettings() {

  const user = getUser();

  if (!user || !user.settings) return;


  document.documentElement
    .style
    .setProperty(
      "--accent",
      user.settings.accent
    );


  if (user.settings.dark) {

    document.body.classList.add("dark");

  } else {

    document.body.classList.remove("dark");

  }


  if (user.settings.compact) {

    document.body.classList.add("compact");

  } else {

    document.body.classList.remove("compact");

  }


  const dark =
    document.getElementById("darkMode");

  const compact =
    document.getElementById("compactMode");


  if (dark)
    dark.checked =
      user.settings.dark;


  if (compact)
    compact.checked =
      user.settings.compact;

}


function toggleDarkMode() {

  const user = getUser();

  user.settings.dark =
    document.getElementById(
      "darkMode"
    ).checked;


  saveUser();

  applyUserSettings();

}


function toggleCompact() {

  const user = getUser();

  user.settings.compact =
    document.getElementById(
      "compactMode"
    ).checked;


  saveUser();

  applyUserSettings();

}


function changeAccent(color) {

  const user = getUser();

  user.settings.accent =
    color;


  saveUser();

  applyUserSettings();

}


/* ================= MOBILE ================= */

function toggleSidebar() {

  document.querySelector(".sidebar")
    .classList.toggle("open");

}


/* ================= SECURITY HELPERS ================= */

function escapeHTML(value) {

  return String(value)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

  return String(value)
    .replaceAll('"', "%22")
    .replaceAll("'", "%27")
    .replaceAll("<", "%3C")
    .replaceAll(">", "%3E");

}


/* ================= KEYBOARD SHORTCUT ================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      document
        .getElementById("subjectModal")
        .classList.add("hidden");

      document
        .getElementById("quizModal")
        .classList.add("hidden");

    }

  }
);


/* ================= STARTUP ================= */

window.addEventListener(
  "DOMContentLoaded",
  () => {

    /*
      If there is an existing session,
      open that user's workspace.

      Otherwise show the clean login screen.
    */

    if (currentUser && accounts[currentUser]) {

      showApp();

    } else {

      document
        .getElementById("authScreen")
        .classList.remove("hidden");

      document
        .getElementById("app")
        .classList.add("hidden");

    }

  }
);
// ============================================================
// Business English Exam — script.js v5
// ============================================================

// ─── Sanity check ────────────────────────────────────────────
if (typeof questions === 'undefined' || !questions.length) {
  document.body.innerHTML =
    '<div style="color:#fff;text-align:center;padding:60px;font-family:sans-serif">' +
    '<h2>❌ Error: questions.js not loaded</h2>' +
    '<p>Make sure questions.js is in the same folder.</p></div>';
  throw new Error('questions.js missing');
}

// ─── State ───────────────────────────────────────────────────
const TOTAL        = questions.length;
let currentIndex   = 0;
let userAnswers    = new Array(TOTAL).fill(null);
let examSubmitted  = false;
let timerInterval  = null;
let timeRemaining  = 3600;
let timerStarted   = false;
let reviewVisible  = false;

// ─── DOM refs ────────────────────────────────────────────────
const pages = {
  instructions : document.getElementById('page-instructions'),
  exam         : document.getElementById('page-exam'),
  results      : document.getElementById('page-results'),
};

const el = {
  qCounter        : document.getElementById('q-counter'),
  timer           : document.getElementById('timer'),
  progressBar     : document.getElementById('progress-bar'),
  qNumber         : document.getElementById('q-number'),
  qSession        : document.getElementById('q-session'),
  diffBadge       : document.getElementById('diff-badge'),
  qText           : document.getElementById('q-text'),
  options         : document.getElementById('options-container'),
  explanation     : document.getElementById('explanation-box'),
  explText        : document.getElementById('explanation-text'),
  dotsNav         : document.getElementById('dots-nav'),
  btnPrev         : document.getElementById('btn-prev'),
  btnNext         : document.getElementById('btn-next'),
  btnSubmit       : document.getElementById('btn-submit'),
  scoreNum        : document.getElementById('score-number'),
  ringFill        : document.getElementById('ring-fill'),
  resultsTitle    : document.getElementById('results-title'),
  resultsMsg      : document.getElementById('results-msg'),
  correctCount    : document.getElementById('correct-count'),
  wrongCount      : document.getElementById('wrong-count'),
  skippedCount    : document.getElementById('skipped-count'),
  reviewSection   : document.getElementById('review-section'),
  reviewContainer : document.getElementById('review-container'),
};

// ─── Helpers ─────────────────────────────────────────────────
function showPage(name) {
  Object.values(pages).forEach(p => p.classList.remove('active'));
  pages[name].classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// START EXAM  (called from onclick in HTML)
// ============================================================
function startExam() {
  showPage('exam');
  buildDotsNav();
  renderQuestion(0);
  startTimer();
}

// ============================================================
// TIMER
// ============================================================
function startTimer() {
  if (timerStarted) return;
  timerStarted = true;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      submitExam(true);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(timeRemaining / 60);
  const s = timeRemaining % 60;
  el.timer.textContent =
    `⏱️ ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  el.timer.classList.toggle('warning', timeRemaining < 300);
}

// ============================================================
// RENDER QUESTION
// ============================================================
function renderQuestion(index) {
  const q = questions[index];
  if (!q) return;
  currentIndex = index;

  el.qCounter.textContent    = `${index + 1} / ${TOTAL}`;
  el.progressBar.style.width = `${((index + 1) / TOTAL) * 100}%`;
  el.qNumber.textContent     = `Question ${index + 1}`;

  if (el.qSession) el.qSession.textContent = q.session || '';

  const diffLabel = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
  el.diffBadge.textContent = diffLabel[q.difficulty] || 'Medium';
  el.diffBadge.className   = `diff-badge ${q.difficulty}`;

  el.qText.textContent = q.question;

  // Options
  el.options.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];
  q.options.forEach((opt, i) => {
    const div = document.createElement('div');
    div.className = 'option-item';
    div.setAttribute('role', 'button');
    div.setAttribute('tabindex', '0');
    div.innerHTML =
      `<span class="letter">${letters[i]}</span>` +
      `<span class="text">${opt}</span>`;
    div.addEventListener('click', () => selectOption(index, i));
    div.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') selectOption(index, i);
    });
    el.options.appendChild(div);
  });

  // Restore previous answer
  if (userAnswers[index] !== null) {
    showFeedback(index, userAnswers[index], false);
  } else {
    el.explanation.hidden = true;
  }

  el.btnPrev.disabled = index === 0;
  el.btnNext.disabled = index === TOTAL - 1;

  updateDots(index);
}

// ============================================================
// SELECT OPTION
// ============================================================
function selectOption(qIndex, optIndex) {
  if (examSubmitted) return;
  if (userAnswers[qIndex] !== null) return; // locked after first pick
  userAnswers[qIndex] = optIndex;
  showFeedback(qIndex, optIndex, true);
  updateDots(currentIndex);
}

// ============================================================
// SHOW FEEDBACK
// ============================================================
function showFeedback(qIndex, selectedIndex, animate) {
  const q    = questions[qIndex];
  const opts = el.options.querySelectorAll('.option-item');

  opts.forEach((opt, i) => {
    opt.classList.remove('correct', 'wrong', 'show-correct', 'disabled');
    opt.classList.add('disabled');
    if (i === selectedIndex) {
      opt.classList.add(i === q.correct ? 'correct' : 'wrong');
    } else if (i === q.correct) {
      opt.classList.add('show-correct');
    }
  });

  el.explText.textContent = q.explanation;
  if (animate) {
    el.explanation.hidden = false;
    el.explanation.style.animation = 'none';
    requestAnimationFrame(() => { el.explanation.style.animation = ''; });
  } else {
    el.explanation.hidden = false;
  }
}

// ============================================================
// DOTS NAVIGATOR
// ============================================================
function buildDotsNav() {
  if (!el.dotsNav) return;
  el.dotsNav.innerHTML = '';
  for (let i = 0; i < TOTAL; i++) {
    const btn = document.createElement('button');
    btn.className = 'dot';
    btn.setAttribute('aria-label', `Go to question ${i + 1}`);
    btn.addEventListener('click', () => renderQuestion(i));
    el.dotsNav.appendChild(btn);
  }
}

function updateDots(currentIdx) {
  if (!el.dotsNav) return;
  const dots = el.dotsNav.querySelectorAll('.dot');
  dots.forEach((dot, i) => {
    dot.className = 'dot';
    if (i === currentIdx) {
      dot.classList.add('current');
    } else if (examSubmitted && userAnswers[i] !== null) {
      dot.classList.add(userAnswers[i] === questions[i].correct ? 'correct-dot' : 'wrong-dot');
    } else if (userAnswers[i] !== null) {
      dot.classList.add('answered');
    }
  });
}

// ============================================================
// SUBMIT EXAM  (called from btn-submit & auto timer)
// ============================================================
function submitExam(forced) {
  if (examSubmitted) return;

  if (!forced) {
    const skipped = userAnswers.filter(a => a === null).length;
    if (skipped > 0) {
      const go = confirm(
        `You have ${skipped} unanswered question${skipped > 1 ? 's' : ''}.\nSubmit anyway?`
      );
      if (!go) return;
    }
  }

  examSubmitted = true;
  clearInterval(timerInterval);
  updateDots(-1);
  showPage('results');
  displayResults();
}

// ============================================================
// DISPLAY RESULTS
// ============================================================
function displayResults() {
  let correct = 0, wrong = 0, skipped = 0;
  const reviewData = [];

  questions.forEach((q, i) => {
    const ans       = userAnswers[i];
    const isCorrect = ans === q.correct;
    if (ans === null)   skipped++;
    else if (isCorrect) correct++;
    else                wrong++;
    reviewData.push({ question: q, userAnswer: ans, isCorrect });
  });

  window._reviewData = reviewData;

  const pct = Math.round((correct / TOTAL) * 100);

  // Score ring animation
  const circumference = 2 * Math.PI * 52;
  if (el.ringFill) {
    el.ringFill.style.strokeDasharray  = circumference;
    el.ringFill.style.strokeDashoffset = circumference;
    const svg = el.ringFill.closest('svg');
    if (svg && !svg.querySelector('defs')) {
      svg.insertAdjacentHTML('afterbegin',
        `<defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stop-color="#6c63ff"/>
            <stop offset="100%" stop-color="#a78bfa"/>
          </linearGradient>
        </defs>`
      );
      el.ringFill.setAttribute('stroke', 'url(#ringGrad)');
    }
    setTimeout(() => {
      el.ringFill.style.strokeDashoffset =
        circumference - (pct / 100) * circumference;
    }, 200);
  }

  el.scoreNum.textContent = `${pct}%`;
  if (el.correctCount) el.correctCount.textContent = correct;
  if (el.wrongCount)   el.wrongCount.textContent   = wrong;
  if (el.skippedCount) el.skippedCount.textContent = skipped;

  const { title, msg } = getResultMessage(pct);
  if (el.resultsTitle) el.resultsTitle.textContent = title;
  if (el.resultsMsg)   el.resultsMsg.textContent   = msg;
}

function getResultMessage(pct) {
  if (pct >= 90) return { title: '🏆 Outstanding!',   msg: 'Excellent work — you mastered Business English!' };
  if (pct >= 75) return { title: '🎉 Well Done!',     msg: 'Great performance — keep building on this!' };
  if (pct >= 60) return { title: '👍 Good Effort!',   msg: 'Solid result — review the explanations to improve.' };
  if (pct >= 40) return { title: '📚 Keep Studying',  msg: "You're on your way — revisit the course material." };
  return           { title: "💪 Don't Give Up!",    msg: 'Review the lectures and try again — you can do it!' };
}

// ============================================================
// RESTART  (called from onclick in HTML)
// ============================================================
function restartExam() {
  if (!confirm('Restart exam? All your progress will be lost.')) return;

  clearInterval(timerInterval);
  timerStarted  = false;
  timeRemaining = 3600;
  examSubmitted = false;
  currentIndex  = 0;
  userAnswers   = new Array(TOTAL).fill(null);
  reviewVisible = false;

  el.timer.classList.remove('warning');
  updateTimerDisplay();

  if (el.reviewSection) el.reviewSection.hidden = true;

  showPage('exam');
  buildDotsNav();
  renderQuestion(0);
  startTimer();
}

// ============================================================
// TOGGLE REVIEW  (called from onclick in HTML)
// ============================================================
function toggleReview() {
  reviewVisible = !reviewVisible;
  if (el.reviewSection) el.reviewSection.hidden = !reviewVisible;
  if (reviewVisible) {
    renderReview();
    updateDots(-1);
  }
}

function renderReview() {
  const data    = window._reviewData || [];
  const letters = ['A', 'B', 'C', 'D'];
  el.reviewContainer.innerHTML = '';

  data.forEach((item, i) => {
    const q          = item.question;
    const userLetter = item.userAnswer !== null ? letters[item.userAnswer] : '—';
    const corrLetter = letters[q.correct];
    const skipped    = item.userAnswer === null;

    const div = document.createElement('div');
    div.className = `review-item ${item.isCorrect ? 'correct-review' : 'wrong-review'}`;

    div.innerHTML = `
      <div class="review-q">
        <span style="color:#6b7280;font-size:.8rem;font-weight:700;margin-right:6px">Q${i + 1}</span>
        ${q.question}
      </div>
      <div class="review-answer" style="margin:8px 0">
        ${skipped
          ? '<span style="color:#d97706;font-weight:600">⏭️ Not answered</span>'
          : `Your answer: <span class="${item.isCorrect ? 'correct-answer' : 'wrong-answer'}">${userLetter}</span>`
        }
        ${!item.isCorrect
          ? ` &nbsp;|&nbsp; Correct: <span class="correct-answer">${corrLetter}. ${q.options[q.correct]}</span>`
          : ''
        }
      </div>
      <div class="review-explanation">💡 ${q.explanation}</div>
    `;
    el.reviewContainer.appendChild(div);
  });
}

// ============================================================
// NAVIGATION — button listeners
// ============================================================
el.btnPrev.addEventListener('click', goToPrev);
el.btnNext.addEventListener('click', goToNext);
el.btnSubmit.addEventListener('click', () => submitExam(false));

function goToPrev() {
  if (currentIndex > 0) renderQuestion(currentIndex - 1);
}
function goToNext() {
  if (currentIndex < TOTAL - 1) renderQuestion(currentIndex + 1);
}

// ─── Keyboard shortcuts ──────────────────────────────────────
document.addEventListener('keydown', e => {
  if (!pages.exam.classList.contains('active') || examSubmitted) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToNext();
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goToPrev();
  const num = parseInt(e.key);
  if (num >= 1 && num <= 4) selectOption(currentIndex, num - 1);
});

// ─── Init ────────────────────────────────────────────────────
updateTimerDisplay();

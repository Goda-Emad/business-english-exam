// ============================================================
// Business English Exam - Main Application
// ============================================================

console.log('🚀 SCRIPT LOADED! (v4)');

// ===== Check if questions are loaded =====
if (typeof questions === 'undefined') {
    console.error('❌ questions.js not loaded!');
    alert('Error: Questions file not loaded.');
} else {
    console.log('✅ Questions loaded:', questions.length);
}

// ===== Variables =====
let currentQuestionIndex = 0;
let userAnswers = new Array(150).fill(null);
let examSubmitted = false;
let timerInterval = null;
let timeRemaining = 3600;
let timerStarted = false;

// ===== DOM Elements =====
const pageInstructions = document.getElementById('page-instructions');
const pageExam = document.getElementById('page-exam');
const pageResults = document.getElementById('page-results');

const btnStart = document.getElementById('btn-start');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnSubmit = document.getElementById('btn-submit');
const btnRestart = document.getElementById('btn-restart');
const btnReview = document.getElementById('btn-review');

const qCounter = document.getElementById('q-counter');
const timerEl = document.getElementById('timer');
const progressBar = document.getElementById('progress-bar');
const qNumber = document.getElementById('q-number');
const diffBadge = document.getElementById('diff-badge');
const qText = document.getElementById('q-text');
const optionsContainer = document.getElementById('options-container');
const explanationBox = document.getElementById('explanation-box');
const explanationText = document.getElementById('explanation-text');
const reviewSection = document.getElementById('review-section');
const reviewContainer = document.getElementById('review-container');

// ============================================================
// ===== START EXAM FUNCTION =====
// ============================================================
function startExam() {
    console.log('🔄 START EXAM FUNCTION CALLED!');
    console.log('📄 Current page:', document.querySelector('.page.active')?.id);
    
    // إخفاء صفحة التعليمات وإظهار صفحة الاختبار
    pageInstructions.classList.remove('active');
    pageExam.classList.add('active');
    
    console.log('✅ Page switched to exam');
    
    // عرض أول سؤال
    renderQuestion(0);
    
    // بدء التايمر
    startTimer();
    
    console.log('✅ Exam started successfully!');
}

// ============================================================
// ===== Timer =====
// ============================================================
function startTimer() {
    if (timerStarted) return;
    console.log('⏱️ Timer started!');
    timerStarted = true;
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            submitExam();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    timerEl.textContent = `⏱️ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    if (timeRemaining < 300) timerEl.classList.add('warning');
    else timerEl.classList.remove('warning');
}

// ============================================================
// ===== Render Question =====
// ============================================================
function renderQuestion(index) {
    console.log('📝 Rendering question:', index);
    
    if (typeof questions === 'undefined') {
        qText.textContent = '❌ Error: Questions not loaded!';
        return;
    }

    const q = questions[index];
    if (!q) {
        console.error('Question not found at index:', index);
        return;
    }

    qCounter.textContent = `${index + 1} / ${questions.length}`;
    progressBar.style.width = `${((index + 1) / questions.length) * 100}%`;

    qNumber.textContent = `Question ${index + 1}`;
    const diffMap = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
    diffBadge.textContent = diffMap[q.difficulty] || 'Medium';
    diffBadge.className = `difficulty-badge ${q.difficulty}`;

    qText.textContent = q.question;

    optionsContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((option, optIndex) => {
        const div = document.createElement('div');
        div.className = 'option-item';
        div.dataset.index = optIndex;

        div.addEventListener('click', function() {
            selectOption(index, optIndex);
        });

        div.innerHTML = `
            <span class="letter">${letters[optIndex]}.</span>
            <span class="text">${option}</span>
        `;
        optionsContainer.appendChild(div);
    });

    explanationBox.style.display = 'none';
    btnPrev.disabled = index === 0;
    btnNext.disabled = index === questions.length - 1;
}

// ============================================================
// ===== Select Option =====
// ============================================================
function selectOption(index, optIndex) {
    if (examSubmitted) return;
    console.log('📌 Selected option:', optIndex);
    userAnswers[index] = optIndex;
    showImmediateFeedback(index, optIndex);
}

// ============================================================
// ===== Show Immediate Feedback =====
// ============================================================
function showImmediateFeedback(index, selectedIndex) {
    const q = questions[index];
    if (!q) return;
    
    const options = document.querySelectorAll('.option-item');
    
    options.forEach(opt => {
        opt.classList.remove('selected', 'correct', 'wrong', 'show-correct', 'disabled');
    });
    
    options.forEach((opt, i) => {
        opt.classList.add('disabled');
        
        if (i === selectedIndex) {
            if (i === q.correct) {
                opt.classList.add('correct');
                opt.classList.add('selected');
            } else {
                opt.classList.add('wrong');
                opt.classList.add('selected');
            }
        }
        
        if (i === q.correct && i !== selectedIndex) {
            opt.classList.add('show-correct');
        }
        
        if (i === q.correct && i === selectedIndex) {
            opt.classList.remove('show-correct');
            opt.classList.add('correct');
        }
    });
    
    explanationBox.style.display = 'block';
    explanationText.textContent = q.explanation;
}

// ============================================================
// ===== Navigation =====
// ============================================================
function goToPrev() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion(currentQuestionIndex);
    }
}

function goToNext() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion(currentQuestionIndex);
    }
}

// ============================================================
// ===== Submit Exam =====
// ============================================================
function submitExam() {
    if (examSubmitted) return;
    const answered = userAnswers.filter(a => a !== null).length;
    if (answered < questions.length) {
        if (!confirm(`You have answered ${answered} out of ${questions.length}. Submit anyway?`)) return;
    }
    examSubmitted = true;
    clearInterval(timerInterval);
    pageExam.classList.remove('active');
    pageResults.classList.add('active');
    displayResults();
}

// ============================================================
// ===== Display Results =====
// ============================================================
function displayResults() {
    let correct = 0;
    let wrong = 0;
    const reviewData = [];

    questions.forEach((q, index) => {
        const userAns = userAnswers[index];
        const isCorrect = userAns === q.correct;
        if (isCorrect) correct++;
        else wrong++;
        reviewData.push({ question: q, userAnswer: userAns, isCorrect });
    });

    const percentage = Math.round((correct / questions.length) * 100);

    document.getElementById('score-number').textContent = `${percentage}%`;
    document.getElementById('correct-count').textContent = correct;
    document.getElementById('wrong-count').textContent = wrong;
    document.getElementById('total-count').textContent = questions.length;

    window._reviewData = reviewData;
}

// ============================================================
// ===== Restart Exam =====
// ============================================================
function restartExam() {
    if (!confirm('Restart exam? All progress lost.')) return;
    clearInterval(timerInterval);
    timerStarted = false;
    timeRemaining = 3600;
    examSubmitted = false;
    userAnswers = new Array(150).fill(null);
    currentQuestionIndex = 0;
    timerEl.classList.remove('warning');
    updateTimerDisplay();
    reviewSection.style.display = 'none';
    btnReview.textContent = '📖 Review Answers';
    pageResults.classList.remove('active');
    pageExam.classList.add('active');
    renderQuestion(0);
    startTimer();
}

// ============================================================
// ===== Toggle Review =====
// ============================================================
function toggleReview() {
    if (reviewSection.style.display === 'none') {
        reviewSection.style.display = 'block';
        btnReview.textContent = '📖 Hide Review';
        renderReview();
    } else {
        reviewSection.style.display = 'none';
        btnReview.textContent = '📖 Review Answers';
    }
}

function renderReview() {
    const data = window._reviewData || [];
    reviewContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    data.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = `review-item ${item.isCorrect ? 'correct-review' : 'wrong-review'}`;
        const userLetter = item.userAnswer !== null ? letters[item.userAnswer] : 'Not answered';
        const correctLetter = letters[item.question.correct];

        div.innerHTML = `
            <div class="review-q">${index + 1}. ${item.question.question}</div>
            <div class="review-answer">
                Your answer: <span class="${item.isCorrect ? 'correct-answer' : 'wrong-answer'}">${userLetter}</span>
                ${!item.isCorrect ? ` | Correct: <span class="correct-answer">${correctLetter}</span>` : ''}
            </div>
            <div class="review-explanation">💡 ${item.question.explanation}</div>
        `;
        reviewContainer.appendChild(div);
    });
}

// ============================================================
// ===== Event Listeners =====
// ============================================================
btnPrev.addEventListener('click', goToPrev);
btnNext.addEventListener('click', goToNext);

btnSubmit.addEventListener('click', function() {
    if (examSubmitted) return;
    if (confirm('Submit exam?')) submitExam();
});

btnRestart.addEventListener('click', restartExam);
btnReview.addEventListener('click', toggleReview);

// ============================================================
// ===== Keyboard Shortcuts =====
// ============================================================
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (!examSubmitted && !btnNext.disabled) goToNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (!examSubmitted && !btnPrev.disabled) goToPrev();
    }
});

// ============================================================
// ===== Init =====
// ============================================================
console.log('✅ Business English Exam ready!');
console.log('📝 Total questions:', questions ? questions.length : 'ERROR');
console.log('🔍 startExam function:', typeof startExam);
console.log('🔍 btnStart element:', btnStart);

// ===== اختبار تلقائي =====
console.log('🔄 Running auto-test...');
if (typeof startExam === 'function') {
    console.log('✅ startExam function is defined and ready!');
} else {
    console.log('❌ startExam function NOT defined!');
}
console.log('🔄 Auto-test complete.');

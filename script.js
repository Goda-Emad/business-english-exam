// ===== Business English Exam - Main Application =====
console.log('🚀 SCRIPT VERSION: 3.1 - Fixed Start Button');
console.log('📅 Loaded at:', new Date().toLocaleString());

// NOTE: 'questions' is loaded from questions.js (global variable)
// DO NOT declare 'const questions' or 'var questions' in this file!

let currentQuestionIndex = 0;
let userAnswers = new Array(150).fill(null);
let examSubmitted = false;
let timerInterval = null;
let timeRemaining = 3600;
let timerStarted = false;

// DOM Elements
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

// ===== Check if questions are loaded =====
if (typeof questions === 'undefined') {
    console.error('❌ questions.js not loaded!');
    alert('Error: Questions file not loaded.');
} else {
    console.log('✅ Questions loaded:', questions.length);
}

// ===== Show Page =====
function showPage(pageId) {
    console.log('📄 Switching to page:', pageId);
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add('active');
        console.log('✅ Page activated:', pageId);
    } else {
        console.error('❌ Page not found:', pageId);
    }
}

// ===== Timer =====
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

// ===== Select Option (مع التصحيح الفوري) =====
function selectOption(index, optIndex) {
    if (examSubmitted) return;
    
    // حفظ إجابة المستخدم
    userAnswers[index] = optIndex;
    
    // عرض التصحيح الفوري
    showImmediateFeedback(index, optIndex);
}

// ===== عرض التصحيح الفوري =====
function showImmediateFeedback(index, selectedIndex) {
    const q = questions[index];
    if (!q) return;
    
    // جلب جميع خيارات السؤال
    const options = document.querySelectorAll('.option-item');
    
    // إزالة أي تصنيفات سابقة
    options.forEach(opt => {
        opt.classList.remove('selected', 'correct', 'wrong', 'show-correct', 'disabled');
    });
    
    // تحديد الإجابة المختارة
    options.forEach((opt, i) => {
        // تعطيل جميع الخيارات بعد الاختيار
        opt.classList.add('disabled');
        
        if (i === selectedIndex) {
            // الإجابة اللي اختارها المستخدم
            if (i === q.correct) {
                opt.classList.add('correct');
                opt.classList.add('selected');
            } else {
                opt.classList.add('wrong');
                opt.classList.add('selected');
            }
        }
        
        // إظهار الإجابة الصحيحة (دائماً)
        if (i === q.correct && i !== selectedIndex) {
            opt.classList.add('show-correct');
        }
        
        // لو الإجابة الصحيحة هي نفس اللي اختارها المستخدم
        if (i === q.correct && i === selectedIndex) {
            opt.classList.remove('show-correct');
            opt.classList.add('correct');
        }
    });
    
    // عرض الشرح
    const explanationBox = document.getElementById('explanation-box');
    const explanationText = document.getElementById('explanation-text');
    explanationBox.style.display = 'block';
    explanationText.textContent = q.explanation;
    
    // إضافة تأثير
    explanationBox.style.animation = 'none';
    setTimeout(() => {
        explanationBox.style.animation = 'slideDown 0.4s ease';
    }, 10);
}

// ===== Render Question =====
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

    // Update counter & progress
    qCounter.textContent = `${index + 1} / ${questions.length}`;
    progressBar.style.width = `${((index + 1) / questions.length) * 100}%`;

    // Question number & difficulty
    qNumber.textContent = `Question ${index + 1}`;
    const diffMap = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
    diffBadge.textContent = diffMap[q.difficulty] || 'Medium';
    diffBadge.className = `difficulty-badge ${q.difficulty}`;

    // Question text
    qText.textContent = q.question;

    // Options
    optionsContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((option, optIndex) => {
        const div = document.createElement('div');
        div.className = 'option-item';
        div.dataset.index = optIndex;

        // لو السؤال جاوب عليه قبل كده (في نفس الجلسة)
        const userAns = userAnswers[index];
        if (userAns !== null && !examSubmitted) {
            div.classList.add('disabled');
            if (optIndex === q.correct) div.classList.add('correct');
            if (optIndex === userAns && userAns !== q.correct) div.classList.add('wrong');
            if (optIndex === userAns) div.classList.add('selected');
            if (optIndex === q.correct && optIndex !== userAns) div.classList.add('show-correct');
            
            // إظهار الشرح
            explanationBox.style.display = 'block';
            explanationText.textContent = q.explanation;
        } else if (!examSubmitted) {
            div.addEventListener('click', function() {
                selectOption(index, optIndex);
            });
        }

        // بعد تقديم الاختبار
        if (examSubmitted) {
            div.classList.add('disabled');
            if (optIndex === q.correct) div.classList.add('correct');
            if (userAnswers[index] === optIndex && userAnswers[index] !== q.correct) div.classList.add('wrong');
            if (userAnswers[index] === optIndex) div.classList.add('selected');
        }

        div.innerHTML = `
            <span class="letter">${letters[optIndex]}.</span>
            <span class="text">${option}</span>
        `;
        optionsContainer.appendChild(div);
    });

    // Explanation (لو السؤال مش مجاب عليه)
    if (examSubmitted || userAnswers[index] !== null) {
        explanationBox.style.display = 'block';
        explanationText.textContent = q.explanation;
    } else {
        explanationBox.style.display = 'none';
    }

    // Navigation buttons
    btnPrev.disabled = index === 0;
    btnNext.disabled = index === questions.length - 1;
}

// ===== Navigation =====
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

// ===== Submit Exam =====
function submitExam() {
    if (examSubmitted) return;
    const answered = userAnswers.filter(a => a !== null).length;
    if (answered < questions.length) {
        if (!confirm(`You have answered ${answered} out of ${questions.length}. Submit anyway?`)) return;
    }
    examSubmitted = true;
    clearInterval(timerInterval);
    showPage('page-results');
    displayResults();
}

// ===== Display Results =====
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

// ===== Toggle Review =====
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

// ===== Restart Exam =====
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
    showPage('page-exam');
    renderQuestion(0);
    startTimer();
}

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (!examSubmitted && !btnNext.disabled) goToNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (!examSubmitted && !btnPrev.disabled) goToPrev();
    }
});

// ============================================================
// ===== START BUTTON - FIXED (طريقتين معاً للأمان) =====
// ============================================================

// الطريقة الأولى: onclick مباشر
btnStart.onclick = function() {
    console.log('🚀 START clicked! (onclick)');
    startExam();
};

// الطريقة الثانية: addEventListener (احتياطي)
btnStart.addEventListener('click', function() {
    console.log('🚀 START clicked! (addEventListener)');
    startExam();
});

// دالة بدء الاختبار
function startExam() {
    console.log('🔄 Starting exam...');
    showPage('page-exam');
    renderQuestion(0);
    startTimer();
    console.log('✅ Exam started successfully!');
}

// ===== Other Event Listeners =====
btnPrev.addEventListener('click', goToPrev);
btnNext.addEventListener('click', goToNext);

btnSubmit.addEventListener('click', function() {
    if (examSubmitted) return;
    if (confirm('Submit exam?')) submitExam();
});

btnRestart.addEventListener('click', restartExam);
btnReview.addEventListener('click', toggleReview);

// ===== Init =====
showPage('page-instructions');
updateTimerDisplay();

console.log('✅ Business English Exam ready!');
console.log('📝 Total questions:', questions ? questions.length : 'ERROR');
console.log('🔍 btnStart element:', btnStart);
console.log('🔍 btnStart text:', btnStart ? btnStart.textContent : 'NOT FOUND');
console.log('🔍 btnStart onclick:', btnStart ? btnStart.onclick : 'NOT SET');

// ===== اختبار تلقائي للزر =====
console.log('🔄 Auto-test: Trying to start exam from console...');
// اختبر إن الدالة شغالة
try {
    if (typeof startExam === 'function') {
        console.log('✅ startExam function is defined');
    } else {
        console.log('❌ startExam function NOT defined');
    }
} catch(e) {
    console.error('Error testing startExam:', e);
}

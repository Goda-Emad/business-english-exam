// ===== Select Option =====
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

// ===== Render Question (تعديل) =====
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

        // لو السؤال جاوب عليه قبل كده
        const userAns = userAnswers[index];
        if (userAns !== null && !examSubmitted) {
            div.classList.add('disabled');
            if (optIndex === q.correct) div.classList.add('correct');
            if (optIndex === userAns && userAns !== q.correct) div.classList.add('wrong');
            if (optIndex === userAns) div.classList.add('selected');
            if (optIndex === q.correct && optIndex !== userAns) div.classList.add('show-correct');
        } else if (!examSubmitted) {
            div.addEventListener('click', function() {
                selectOption(index, optIndex);
            });
        }

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

    // Explanation
    if (examSubmitted || userAnswers[index] !== null) {
        explanationBox.style.display = 'block';
        explanationText.textContent = q.explanation;
    } else {
        explanationBox.style.display = 'none';
    }

    btnPrev.disabled = index === 0;
    btnNext.disabled = index === questions.length - 1;
}

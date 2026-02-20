document.addEventListener('DOMContentLoaded', () => {

    // --- SUBTLE BACKGROUND AMBIANCE (Optional/Minimal) ---
    // If you prefer to disable this to strictly match the static Figma, 
    // remove the call to createGrid().
    const container = document.getElementById('bubble-container');
    const bubbles = [];

    function createGrid() {
        container.innerHTML = '';
        bubbles.length = 0;
        const baseSize = 250;
        const spacingX = window.innerWidth / 3;
        const spacingY = window.innerHeight / 3;

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const bubble = document.createElement('div');
                bubble.style.position = 'absolute';
                bubble.style.width = `${baseSize}px`;
                bubble.style.height = `${baseSize}px`;
                bubble.style.borderRadius = '50%';

                // Very subtle, dark, large radial gradient for moody depth
                bubble.style.background = 'radial-gradient(circle at center, rgba(0, 255, 102, 0.03) 0%, transparent 70%)';
                bubble.style.left = `${j * spacingX - baseSize / 2}px`;
                bubble.style.top = `${i * spacingY - baseSize / 2}px`;
                bubble.style.transition = 'transform 0.5s ease';
                bubble.style.pointerEvents = 'none';

                container.appendChild(bubble);
                bubbles.push({ element: bubble, x: j * spacingX, y: i * spacingY });
            }
        }
    }

    // createGrid(); // Uncomment if subtle cursor tracking is desired

    // --- NAVIGATION LOGIC ---
    let currentStepIndex = 0;
    const globalHeader = document.getElementById('global-header');
    const stepTitle = document.getElementById('step-title');
    const progressSteps = [
        document.getElementById('step-1'),
        document.getElementById('step-2'),
        document.getElementById('step-3')
    ];

    function updateHeaderState(stepNum) {
        if (stepNum === 0 || stepNum >= 4) {
            globalHeader.classList.add('hidden');
        } else {
            globalHeader.classList.remove('hidden');
            stepTitle.innerText = `STEP ${stepNum} OF 3`;

            // Update progress bars
            progressSteps.forEach((el, index) => {
                if (index < stepNum) el.classList.add('filled');
                else el.classList.remove('filled');
            });
        }
    }

    function navigateTo(pageId, stepNum = 0) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');

        currentStepIndex = stepNum;
        updateHeaderState(stepNum);

        // Run hooks
        if (pageId === 'page-tips') runGeminiMock();
        if (pageId === 'page-breathe') startBreathingExercise();
    }

    // --- PAGE 1: START TRANSITION ---
    const btnStart = document.getElementById('btn-start');
    const magZero = document.getElementById('mag-zero');
    const fadeText = document.getElementById('fade-text');
    const subtitle = document.querySelector('.hero-subtitle');

    btnStart.addEventListener('click', () => {
        // Immediately fade out surrounding elements
        fadeText.classList.add('fade-out-fast');
        subtitle.classList.add('fade-out-fast');
        btnStart.classList.add('fade-out-fast');

        // Start the massive scale
        magZero.classList.add('magnify-active');

        // Delay the blur slightly so the zoom gets going first
        setTimeout(() => {
            magZero.classList.add('magnify-blur');
        }, 500);

        // Trigger the page switch just as the 0 gets huge, avoiding any blank background delay
        setTimeout(() => {
            navigateTo('page-checkin', 1);

            // Clean up old state behind the scenes after new page fully fades in
            setTimeout(() => {
                magZero.classList.remove('magnify-active', 'magnify-blur');
                fadeText.classList.remove('fade-out-fast');
                subtitle.classList.remove('fade-out-fast');
                btnStart.classList.remove('fade-out-fast');
            }, 1000);
        }, 700);
    });

    // --- PAGE 2 LOGIC (Journal & To Page 3) ---
    const journalText = document.getElementById('journal-text');
    const wordCountDisplay = document.getElementById('word-count');

    journalText.addEventListener('input', () => {
        const text = journalText.value.trim();
        // Split by whitespace to count words, 0 if empty
        const words = text ? text.split(/\s+/).length : 0;
        wordCountDisplay.innerText = `${words} word${words === 1 ? '' : 's'}`;
    });

    document.getElementById('btn-checkin-next').addEventListener('click', () => {
        navigateTo('page-environment', 2); // Now step 2
    });

    // --- PAGE 3 LOGIC (Environment Click) ---
    const envBtns = document.querySelectorAll('.env-card');
    envBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            envBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    document.getElementById('btn-env-next').addEventListener('click', () => {
        navigateTo('page-tips', 2); // Still step 2: The Activity
    });

    // --- PAGE 4: MOCK API TIPS ---
    function runGeminiMock() {
        const spinner = document.getElementById('loading-spinner');
        const card = document.getElementById('generated-tip');
        const btnNext = document.getElementById('btn-tips-next');
        const heading = document.getElementById('tips-heading');

        heading.innerText = "Preparing your 5-minute activity...";
        spinner.classList.remove('hidden');
        card.classList.add('hidden');
        btnNext.style.display = 'none';

        const mood = document.getElementById('slider-mood').value;
        const energy = document.getElementById('slider-energy').value;
        const envCard = document.querySelector('.env-card.active');
        const env = envCard ? envCard.dataset.env : "Current Location";

        setTimeout(() => {
            spinner.classList.add('hidden');
            heading.innerText = "Here is a quick activity for you:";
            card.innerHTML = `<h3 style="color: var(--accent-neon); margin-bottom: 1rem;">Based on your check-in:</h3>
                              <p style="margin-bottom: 1.5rem;">We notice your energy level is around a ${energy}/9 while in the <strong>${env}</strong>.</p>
                              <p>Before we begin the main breathing exercise, gently stretch your arms above your head and roll your shoulders back to release accumulated tension.</p>`;
            card.classList.remove('hidden');
            // Unhide CTA
            btnNext.style.display = 'inline-block';
        }, 2000);
    }

    document.getElementById('btn-tips-next').addEventListener('click', () => {
        navigateTo('page-breathe', 3);
    });

    // --- PAGE 5: APPLE WATCH MANDALA TIMER ---
    let breathInterval;
    let timerInterval;
    let isBreathingActive = false;
    let isPaused = false;
    let timeLeft = 300; // 5 mins

    const btnStartBreathe = document.getElementById('btn-start-breathe');
    const sessionControls = document.getElementById('session-controls');
    const btnPause = document.getElementById('btn-pause-session');
    const btnEnd = document.getElementById('btn-end-session');

    const flower = document.getElementById('breathe-flower');
    const instruction = document.getElementById('breathe-instruction');
    const subtext = document.getElementById('breathe-subtext');
    const timerDisplay = document.getElementById('breathe-timer');

    let isExhaling = true; // bloom fully when exhale, droops when inhale.

    function resetBreathingState() {
        clearInterval(timerInterval);
        clearInterval(breathInterval);
        isBreathingActive = false;
        isPaused = false;
        timeLeft = 300;
        updateTimerDisplay();

        btnStartBreathe.classList.remove('hidden');
        sessionControls.classList.add('hidden');
        btnPause.innerHTML = `<span class="pause-icon">⏸</span> Pause`;

        flower.classList.remove('bloom', 'droop');
        instruction.innerText = "Ready";
        subtext.innerText = "";
    }

    function updateTimerDisplay() {
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        timerDisplay.innerText = `0${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function runBreathingCycle() {
        if (isPaused) return;

        if (isExhaling) {
            instruction.innerText = "Exhale slowly";
            subtext.innerText = "4 SECONDS";
            flower.classList.remove('bloom');
            flower.classList.add('droop');
        } else {
            instruction.innerText = "Inhale";
            subtext.innerText = "4 SECONDS";
            flower.classList.remove('droop');
            flower.classList.add('bloom');
        }
        isExhaling = !isExhaling;
    }

    // Called automatically globally when navigating to page-breathe
    window.startBreathingExercise = function () {
        resetBreathingState();
    };

    btnStartBreathe.addEventListener('click', () => {
        btnStartBreathe.classList.add('hidden');
        sessionControls.classList.remove('hidden');
        isBreathingActive = true;
        isPaused = false;

        // Start with exhale first (which will droop the flower)
        isExhaling = true;

        runBreathingCycle();
        breathInterval = setInterval(runBreathingCycle, 4000);

        timerInterval = setInterval(() => {
            if (isPaused) return;
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft <= 0) {
                resetBreathingState();
                navigateTo('page-complete', 0); // End Page is now page-complete
            }
        }, 1000);
    });

    btnPause.addEventListener('click', () => {
        isPaused = !isPaused;
        if (isPaused) {
            btnPause.innerHTML = `<span class="pause-icon">▶</span> Resume`;
            flower.classList.remove('bloom', 'droop');
            instruction.innerText = "Paused";
            subtext.innerText = "";
        } else {
            btnPause.innerHTML = `<span class="pause-icon">⏸</span> Pause`;
            // Re-invert exhaling because the cycle function flips it at the end
            isExhaling = !isExhaling;
            runBreathingCycle();
        }
    });

    btnEnd.addEventListener('click', () => {
        resetBreathingState();
        navigateTo('page-complete', 0); // navigate to session complete
    });

    // --- PAGE 6 & 7: COMPLETE / ABOUT LOGIC ---
    document.getElementById('btn-return-home').addEventListener('click', () => {
        // Reset state
        document.getElementById('slider-mood').value = 5;
        document.getElementById('slider-energy').value = 5;
        document.getElementById('journal-text').value = '';
        const wordCountDisplay = document.getElementById('word-count');
        if (wordCountDisplay) wordCountDisplay.innerText = '0 words';

        envBtns.forEach(b => b.classList.remove('active'));
        envBtns[1].classList.add('active'); // default to 'Home'

        navigateTo('page-home', 0);
    });

    document.getElementById('btn-nav-about').addEventListener('click', () => {
        navigateTo('page-about', 0);
    });

    document.getElementById('btn-about-back').addEventListener('click', () => {
        navigateTo('page-complete', 0);
    });

});

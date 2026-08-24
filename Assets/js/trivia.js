// Classic mode game loop: fetch a round from Open Trivia DB, run the timer,
// score answers, and show a round summary. No build step, no server —
// everything here runs in the browser.
(function () {
    'use strict';

    var QUESTIONS_PER_ROUND = 10;
    var SECONDS_PER_QUESTION = 15;
    var TOKEN_URL = 'https://opentdb.com/api_token.php?command=request';
    var QUESTIONS_URL = 'https://opentdb.com/api.php?amount=' + QUESTIONS_PER_ROUND + '&type=multiple';

    var RESPONSE_CODE_MESSAGES = {
        1: 'Open Trivia DB ran out of questions for that request. Try again.',
        2: 'Trivia request was malformed. Try again.',
        3: 'The trivia session expired. Try again to get a new one.',
        4: 'Ran out of new questions for this session — starting a fresh one.',
        5: 'Too many requests to Open Trivia DB. Waiting a moment before retrying.'
    };

    var els = {};
    var state = {
        token: null,
        questions: [],
        index: 0,
        correctCount: 0,
        timerId: null,
        secondsLeft: SECONDS_PER_QUESTION,
        answered: false
    };

    function decodeHtml(html) {
        var textarea = document.createElement('textarea');
        textarea.innerHTML = html;
        return textarea.value;
    }

    function shuffle(array) {
        var copy = array.slice();
        for (var i = copy.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = copy[i];
            copy[i] = copy[j];
            copy[j] = tmp;
        }
        return copy;
    }

    function show(el) { el.classList.remove('hidden'); }
    function hide(el) { el.classList.add('hidden'); }

    function showError(message, options) {
        hide(els.loading);
        hide(els.game);
        hide(els.summary);
        els.errorMessage.textContent = message;
        show(els.error);
        els.retryButton.classList.toggle('hidden', options && options.hideRetry === true);
    }

    function fetchJson(url) {
        return fetch(url).then(function (response) {
            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('rate-limited');
                }
                throw new Error('http-' + response.status);
            }
            return response.json();
        });
    }

    function requestToken() {
        return fetchJson(TOKEN_URL).then(function (data) {
            if (data.response_code !== 0 || !data.token) {
                throw new Error('token-failed');
            }
            return data.token;
        });
    }

    function fetchRound(token) {
        return fetchJson(QUESTIONS_URL + '&token=' + encodeURIComponent(token)).then(function (data) {
            if (data.response_code !== 0) {
                var err = new Error('response-code');
                err.responseCode = data.response_code;
                throw err;
            }
            return data.results;
        });
    }

    function startRound() {
        hide(els.error);
        hide(els.summary);
        hide(els.game);
        show(els.loading);

        state.questions = [];
        state.index = 0;
        state.correctCount = 0;

        requestToken()
            .then(function (token) {
                state.token = token;
                return fetchRound(token);
            })
            .then(function (questions) {
                if (!questions || questions.length === 0) {
                    throw new Error('response-code');
                }
                state.questions = questions;
                hide(els.loading);
                show(els.game);
                renderQuestion();
            })
            .catch(function (err) {
                var message = 'Could not reach Open Trivia DB. Check the network and try again — a flaky bar wifi connection is normal, this is not fatal.';
                if (err && err.message === 'rate-limited') {
                    message = RESPONSE_CODE_MESSAGES[5];
                } else if (err && err.responseCode && RESPONSE_CODE_MESSAGES[err.responseCode]) {
                    message = RESPONSE_CODE_MESSAGES[err.responseCode];
                }
                showError(message);
            });
    }

    function currentQuestion() {
        return state.questions[state.index];
    }

    function renderQuestion() {
        clearTimer();
        state.answered = false;
        state.secondsLeft = SECONDS_PER_QUESTION;

        var q = currentQuestion();
        els.questionNumber.textContent = String(state.index + 1);
        els.questionTotal.textContent = String(state.questions.length);
        els.roundScore.textContent = String(state.correctCount);
        els.question.textContent = decodeHtml(q.question);

        var answers = shuffle(q.incorrect_answers.concat([q.correct_answer])).map(decodeHtml);
        var correctAnswer = decodeHtml(q.correct_answer);

        var buttons = els.answersSection.querySelectorAll('.answer');
        buttons.forEach(function (button, i) {
            button.textContent = answers[i];
            button.disabled = false;
            button.className = 'answer';
            button.onclick = function () { handleAnswer(button, answers[i] === correctAnswer); };
        });

        hide(els.nextButton);
        resetTimerBar();
        startTimer(correctAnswer);
    }

    function resetTimerBar() {
        els.timerBar.style.transition = 'none';
        els.timerBar.style.width = '100%';
        els.timerBar.style.backgroundColor = '';
        // Force reflow so the next width change animates.
        void els.timerBar.offsetWidth;
        els.timerBar.style.transition = '';
        els.timerSeconds.textContent = String(SECONDS_PER_QUESTION);
    }

    function startTimer(correctAnswer) {
        els.timerBar.style.width = '0%';

        state.timerId = window.setInterval(function () {
            state.secondsLeft -= 1;
            els.timerSeconds.textContent = String(Math.max(state.secondsLeft, 0));
            if (state.secondsLeft <= 0) {
                clearTimer();
                lockAnswers(correctAnswer, null);
            }
        }, 1000);
    }

    function clearTimer() {
        if (state.timerId) {
            window.clearInterval(state.timerId);
            state.timerId = null;
        }
    }

    function handleAnswer(selectedButton, wasCorrect) {
        if (state.answered) return;
        clearTimer();
        if (wasCorrect) state.correctCount += 1;
        els.roundScore.textContent = String(state.correctCount);
        lockAnswers(currentQuestion() ? decodeHtml(currentQuestion().correct_answer) : null, selectedButton);
    }

    function lockAnswers(correctAnswer, selectedButton) {
        state.answered = true;
        var buttons = els.answersSection.querySelectorAll('.answer');
        buttons.forEach(function (button) {
            button.disabled = true;
            if (button.textContent === correctAnswer) {
                button.classList.add('correct');
            } else if (button === selectedButton) {
                button.classList.add('incorrect');
            }
        });
        show(els.nextButton);
    }

    function nextQuestion() {
        state.index += 1;
        if (state.index >= state.questions.length) {
            showSummary();
        } else {
            renderQuestion();
        }
    }

    function showSummary() {
        clearTimer();
        hide(els.game);
        els.summaryScore.textContent = state.correctCount + ' of ' + state.questions.length + ' correct';
        show(els.summary);
    }

    function init() {
        els.loading = document.getElementById('loading');
        els.error = document.getElementById('error');
        els.errorMessage = document.getElementById('error-message');
        els.retryButton = document.getElementById('retry-button');
        els.game = document.getElementById('game');
        els.summary = document.getElementById('summary');
        els.summaryScore = document.getElementById('summary-score');
        els.playAgainButton = document.getElementById('play-again-button');
        els.question = document.getElementById('question');
        els.questionNumber = document.getElementById('question-number');
        els.questionTotal = document.getElementById('question-total');
        els.roundScore = document.getElementById('round-score');
        els.timerBar = document.getElementById('timer-bar');
        els.timerSeconds = document.getElementById('timer-seconds');
        els.answersSection = document.getElementById('answers-section');
        els.nextButton = document.getElementById('next-button');

        els.retryButton.addEventListener('click', startRound);
        els.playAgainButton.addEventListener('click', startRound);
        els.nextButton.addEventListener('click', nextQuestion);

        startRound();
    }

    document.addEventListener('DOMContentLoaded', init);
})();

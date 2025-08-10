// Model Tests Implementation
import { AudioManager } from './audio-manager.js';

export class ModelTestManager {
    constructor() {
        this.currentTest = null;
        this.currentSection = null;
        this.currentQuestion = 0;
        this.answers = new Map();
        this.sectionTimers = new Map();
        this.testStartTime = null;
        this.audioManager = new AudioManager();
    }

    async loadTest(testId) {
        try {
            const response = await fetch('../content/model_tests.json');
            const data = await response.json();
            this.currentTest = data.modelTests.find(test => test.id === testId);
            if (!this.currentTest) {
                throw new Error('Test not found');
            }
            this.initializeTest();
        } catch (error) {
            console.error('Error loading test:', error);
            this.showError('Failed to load test. Please try again.');
        }
    }

    initializeTest() {
        this.answers.clear();
        this.sectionTimers.clear();
        this.testStartTime = null;
        this.renderTestOverview();
    }

    renderTestOverview() {
        const container = document.getElementById('model-tests-view');
        container.innerHTML = '';

        const overview = document.createElement('div');
        overview.className = 'model-test-container';
        
        overview.innerHTML = `
            <div class="test-overview">
                <div class="test-header">
                    <h2 class="test-title">${this.currentTest.title}</h2>
                </div>
                <div class="section-overview">
                    ${this.createSectionCards()}
                </div>
                <div class="instructions-panel">
                    <h3>Wichtige Informationen</h3>
                    <ul>
                        <li>Sie können jeden Teil nur einmal machen.</li>
                        <li>Die Zeit für jeden Teil ist begrenzt.</li>
                        <li>Sie können während des Tests keine Pause machen.</li>
                        <li>Hören Sie die Audiodateien genau zweimal.</li>
                    </ul>
                </div>
                <button class="start-test-btn" onclick="testManager.startTest()">
                    Test starten
                </button>
            </div>
        `;

        container.appendChild(overview);
    }

    createSectionCards() {
        return Object.entries(this.currentTest.sections).map(([key, section]) => `
            <div class="section-card" data-section="${key}">
                <h3>${this.getSectionTitle(key)}</h3>
                <div class="section-info">
                    <p>Dauer: ${this.getTotalSectionDuration(section)}</p>
                    <p>Aufgaben: ${this.getTaskCount(section)}</p>
                </div>
                <div class="section-status status-not-started">
                    Noch nicht begonnen
                </div>
            </div>
        `).join('');
    }

    getSectionTitle(section) {
        const titles = {
            listening: 'Hören',
            reading: 'Lesen',
            writing: 'Schreiben'
        };
        return titles[section] || section;
    }

    getTotalSectionDuration(section) {
        let totalMinutes = 0;
        Object.values(section).forEach(part => {
            if (part.duration) {
                totalMinutes += parseInt(part.duration);
            }
        });
        return `${totalMinutes} Minuten`;
    }

    getTaskCount(section) {
        let count = 0;
        Object.values(section).forEach(part => {
            if (part.questions) {
                count += part.questions.length;
            } else if (part.texts) {
                part.texts.forEach(text => {
                    count += text.questions.length;
                });
            } else if (part.task) {
                count += 1;
            }
        });
        return count;
    }

    startTest() {
        this.testStartTime = new Date();
        this.startSection('listening');
    }

    startSection(sectionName) {
        this.currentSection = sectionName;
        const section = this.currentTest.sections[sectionName];
        
        // Start the section timer
        this.startSectionTimer(sectionName, this.getTotalMinutes(section));
        
        // Render the section content
        switch(sectionName) {
            case 'listening':
                this.renderListeningSection();
                break;
            case 'reading':
                this.renderReadingSection();
                break;
            case 'writing':
                this.renderWritingSection();
                break;
        }
    }

    startSectionTimer(section, minutes) {
        let timeLeft = minutes * 60; // Convert to seconds
        const timerElement = document.createElement('div');
        timerElement.className = 'section-timer';
        document.body.appendChild(timerElement);

        const timer = setInterval(() => {
            timeLeft--;
            const minutesLeft = Math.floor(timeLeft / 60);
            const secondsLeft = timeLeft % 60;
            
            timerElement.textContent = `${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 300) { // 5 minutes warning
                timerElement.classList.add('time-warning');
            }
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                this.handleSectionTimeout(section);
            }
        }, 1000);

        this.sectionTimers.set(section, timer);
    }

    handleSectionTimeout(section) {
        alert(`Die Zeit für den Teil "${this.getSectionTitle(section)}" ist abgelaufen.`);
        this.completeSection(section);
    }

    renderListeningSection() {
        const container = document.getElementById('model-tests-view');
        const section = this.currentTest.sections.listening;
        const currentPart = this.currentQuestion < section.part1.questions.length ? 
            section.part1 : section.part2;
        const questionIndex = this.currentQuestion % currentPart.questions.length;
        const question = currentPart.questions[questionIndex];
        
        container.innerHTML = `
            <div class="test-content">
                <div class="instructions-panel">
                    <h3>${currentPart.title}</h3>
                    <p>${currentPart.description}</p>
                </div>
                
                <div class="situation-context">
                    <p><strong>Situation:</strong> ${question.situation}</p>
                </div>
                
                <div class="audio-player-container">
                    <audio id="audio-player" controls>
                        <source src="${this.getCurrentAudioSource()}" type="audio/mp3">
                        Your browser does not support the audio element.
                    </audio>
                    <div class="audio-controls">
                        <div class="play-count">
                            Wiedergabe: ${this.audioManager.getCurrentPlayCount() + 1}/2
                        </div>
                        <button class="replay-btn" onclick="testManager.replayAudio()"
                                ${this.audioManager.getRemainingPlays() === 0 ? 'disabled' : ''}>
                            <i class="fas fa-redo"></i> Wiederholen
                        </button>
                    </div>
                </div>

                ${this.renderCurrentQuestion()}
                
                <div class="test-navigation">
                    <button class="nav-button previous" onclick="testManager.previousQuestion()"
                            ${this.currentQuestion === 0 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-left"></i> Zurück
                    </button>
                    <div class="question-counter">
                        ${this.currentQuestion + 1}/${this.getMaxQuestions(section)}
                    </div>
                    <button class="nav-button next" onclick="testManager.nextQuestion()">
                        Weiter <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderReadingSection() {
        const container = document.getElementById('model-tests-view');
        const section = this.currentTest.sections.reading;
        
        container.innerHTML = `
            <div class="test-content">
                <div class="instructions-panel">
                    <h3>${section.part1.title}</h3>
                    <p>${section.part1.description}</p>
                </div>
                
                <div class="reading-text">
                    ${this.getCurrentReadingText()}
                </div>

                ${this.renderCurrentQuestion()}
                
                <div class="test-navigation">
                    <button class="nav-button previous" onclick="testManager.previousQuestion()"
                            ${this.currentQuestion === 0 ? 'disabled' : ''}>
                        Zurück
                    </button>
                    <button class="nav-button next" onclick="testManager.nextQuestion()">
                        Weiter
                    </button>
                </div>
            </div>
        `;
    }

    renderWritingSection() {
        const container = document.getElementById('model-tests-view');
        const section = this.currentTest.sections.writing;
        const currentTask = this.getCurrentWritingTask();
        
        container.innerHTML = `
            <div class="test-content">
                <div class="instructions-panel">
                    <h3>${currentTask.title}</h3>
                    <p>${currentTask.task.description}</p>
                </div>
                
                ${this.renderWritingTask(currentTask)}
                
                <div class="test-navigation">
                    <button class="nav-button previous" onclick="testManager.previousTask()"
                            ${this.currentQuestion === 0 ? 'disabled' : ''}>
                        Zurück
                    </button>
                    <button class="nav-button next" onclick="testManager.nextTask()">
                        Weiter
                    </button>
                </div>
            </div>
        `;

        // Initialize word counter for writing tasks
        this.initializeWordCounter();
    }

    renderWritingTask(task) {
        if (task.task.form) {
            return this.renderForm(task.task.form);
        } else {
            return this.renderTextWritingTask(task.task);
        }
    }

    renderForm(form) {
        return `
            <div class="writing-form">
                ${form.fields.map(field => `
                    <div class="form-field">
                        <label>${field.label}</label>
                        <input type="${field.type}" 
                               ${field.required ? 'required' : ''}
                               ${field.options ? 'list="options-' + field.label + '"' : ''}>
                        ${field.options ? `
                            <datalist id="options-${field.label}">
                                ${field.options.map(opt => `<option value="${opt}">`).join('')}
                            </datalist>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderTextWritingTask(task) {
        return `
            <div class="writing-form">
                <div class="form-field">
                    <textarea id="writing-response" 
                              rows="10" 
                              placeholder="Schreiben Sie Ihre Antwort hier..."
                    ></textarea>
                    <div class="word-counter">
                        Wörter: <span id="word-count">0</span>/${task.maximumWords}
                    </div>
                </div>
                ${task.example ? `
                    <div class="example-structure">
                        <h4>Beispielstruktur:</h4>
                        <pre>${task.example}</pre>
                    </div>
                ` : ''}
            </div>
        `;
    }

    initializeWordCounter() {
        const textarea = document.getElementById('writing-response');
        const counter = document.getElementById('word-count');
        
        if (textarea && counter) {
            textarea.addEventListener('input', () => {
                const words = textarea.value.trim().split(/\s+/).filter(word => word.length > 0);
                counter.textContent = words.length;
                
                const task = this.getCurrentWritingTask();
                if (words.length < task.task.minimumWords) {
                    counter.className = 'below-minimum';
                } else if (words.length > task.task.maximumWords) {
                    counter.className = 'above-maximum';
                } else {
                    counter.className = '';
                }
            });
        }
    }

    async replayAudio() {
        const audioId = this.getCurrentAudioId();
        if (audioId) {
            try {
                await this.audioManager.playAudio(audioId);
                this.updateAudioPlayCount();
            } catch (error) {
                console.error('Error playing audio:', error);
                // Show error message to user
                this.showError('Es gab ein Problem beim Abspielen der Audiodatei. Bitte versuchen Sie es erneut.');
            }
        }
    }

    getCurrentAudioId() {
        const section = this.currentTest.sections.listening;
        const currentPart = this.currentQuestion < section.part1.questions.length ? 
            section.part1 : section.part2;
        const questionIndex = this.currentQuestion % currentPart.questions.length;
        const question = currentPart.questions[questionIndex];
        
        // First try to find audio based on situation
        let audio = this.audioManager.findAudioForSituation(question.situation);
        
        // If no audio found by situation, try finding by question context
        if (!audio) {
            audio = this.audioManager.findAudioForContext(question.question);
        }
        
        return audio ? audio.id : null;
    }

    updateAudioPlayCount() {
        const playCountElement = document.querySelector('.play-count');
        if (playCountElement) {
            playCountElement.textContent = `Wiedergabe: ${this.audioManager.getCurrentPlayCount()}/2`;
        }

        const replayButton = document.querySelector('.replay-btn');
        if (replayButton) {
            replayButton.disabled = this.audioManager.getRemainingPlays() === 0;
        }
    }

    getCurrentAudioSource() {
        const section = this.currentTest.sections.listening;
        const currentPart = this.currentQuestion < section.part1.questions.length ? 
            section.part1 : section.part2;
        const questionIndex = this.currentQuestion % currentPart.questions.length;
        const question = currentPart.questions[questionIndex];
        
        // First try to find audio based on situation
        let audio = this.audioManager.findAudioForSituation(question.situation);
        
        // If no audio found by situation, try finding by question context
        if (!audio) {
            audio = this.audioManager.findAudioForContext(question.question);
        }
        
        return audio ? audio.filePath : null;
    }

    getCurrentReadingText() {
        const section = this.currentTest.sections.reading;
        const currentPart = this.currentQuestion < section.part1.texts.length ?
            section.part1 : section.part2;
        const textIndex = this.currentQuestion % currentPart.texts.length;
        return currentPart.texts[textIndex].text;
    }

    getCurrentWritingTask() {
        const section = this.currentTest.sections.writing;
        return this.currentQuestion === 0 ? section.part1 : section.part2;
    }

    renderCurrentQuestion() {
        const section = this.currentTest.sections[this.currentSection];
        let question;

        if (this.currentSection === 'listening') {
            const part = this.currentQuestion < section.part1.questions.length ? 
                section.part1 : section.part2;
            question = part.questions[this.currentQuestion % part.questions.length];
        } else if (this.currentSection === 'reading') {
            const part = this.currentQuestion < section.part1.texts.length ?
                section.part1 : section.part2;
            const text = part.texts[this.currentQuestion % part.texts.length];
            question = text.questions[0]; // Assuming one question per text for simplicity
        }

        return `
            <div class="question-container">
                <p class="question-text">${question.question}</p>
                <div class="options-container">
                    ${question.options.map((option, index) => `
                        <div class="option-item ${this.answers.get(question.id) === index ? 'selected' : ''}"
                             onclick="testManager.selectAnswer('${question.id}', ${index})">
                            ${option}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    selectAnswer(questionId, answerIndex) {
        this.answers.set(questionId, answerIndex);
        this.renderCurrentSection();
    }

    nextQuestion() {
        const section = this.currentTest.sections[this.currentSection];
        const maxQuestions = this.getMaxQuestions(section);
        
        if (this.currentQuestion < maxQuestions - 1) {
            this.currentQuestion++;
            this.renderCurrentSection();
        } else {
            this.completeSection();
        }
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.renderCurrentSection();
        }
    }

    getMaxQuestions(section) {
        if (this.currentSection === 'listening') {
            return section.part1.questions.length + section.part2.questions.length;
        } else if (this.currentSection === 'reading') {
            return section.part1.texts.length + section.part2.texts.length;
        }
        return 0;
    }

    renderCurrentSection() {
        switch(this.currentSection) {
            case 'listening':
                this.renderListeningSection();
                break;
            case 'reading':
                this.renderReadingSection();
                break;
            case 'writing':
                this.renderWritingSection();
                break;
        }
    }

    completeSection() {
        // Clear the section timer
        const timer = this.sectionTimers.get(this.currentSection);
        if (timer) {
            clearInterval(timer);
            this.sectionTimers.delete(this.currentSection);
        }

        // Update section status
        const sectionCard = document.querySelector(`[data-section="${this.currentSection}"]`);
        if (sectionCard) {
            sectionCard.querySelector('.section-status').className = 'section-status status-completed';
            sectionCard.querySelector('.section-status').textContent = 'Abgeschlossen';
        }

        // Move to next section or complete test
        const sections = ['listening', 'reading', 'writing'];
        const currentIndex = sections.indexOf(this.currentSection);
        
        if (currentIndex < sections.length - 1) {
            this.startSection(sections[currentIndex + 1]);
        } else {
            this.completeTest();
        }
    }

    completeTest() {
        const results = this.calculateResults();
        this.showResults(results);
    }

    calculateResults() {
        const results = {
            listening: this.calculateSectionScore('listening'),
            reading: this.calculateSectionScore('reading'),
            writing: this.calculateSectionScore('writing'),
            total: 0,
            passed: false
        };

        results.total = results.listening + results.reading + results.writing;
        results.passed = results.total >= 60; // Assuming 60% is passing score

        return results;
    }

    calculateSectionScore(section) {
        // Implement scoring logic based on answers and correct answers
        // Return a score between 0 and 100
        return 0; // Placeholder
    }

    showResults(results) {
        const container = document.getElementById('model-tests-view');
        
        container.innerHTML = `
            <div class="results-container">
                <h2>Testergebnisse</h2>
                
                <div class="results-summary">
                    <div class="section-score">
                        <span>Hören:</span>
                        <span>${results.listening}%</span>
                    </div>
                    <div class="section-score">
                        <span>Lesen:</span>
                        <span>${results.reading}%</span>
                    </div>
                    <div class="section-score">
                        <span>Schreiben:</span>
                        <span>${results.writing}%</span>
                    </div>
                </div>

                <div class="total-score">
                    Gesamtergebnis: ${results.total}%
                </div>

                <div class="pass-indicator ${results.passed ? 'passed' : 'failed'}">
                    ${results.passed ? 'Bestanden' : 'Nicht bestanden'}
                </div>

                <button class="nav-button" onclick="testManager.returnToOverview()">
                    Zurück zur Übersicht
                </button>
            </div>
        `;
    }

    returnToOverview() {
        this.initializeTest();
    }

    showError(message) {
        const container = document.getElementById('model-tests-view');
        container.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <button onclick="testManager.returnToOverview()">
                    Zurück zur Übersicht
                </button>
            </div>
        `;
    }
}

// Initialize the test manager when the page loads
let testManager;
document.addEventListener('DOMContentLoaded', () => {
    testManager = new ModelTestManager();
});

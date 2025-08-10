import { ModelTestManager } from './model-tests-manager.js';

class TelcTestUI {
    constructor() {
        this.testManager = new ModelTestManager();
        this.currentView = 'overview';
    }

    renderTestView(testId) {
        const container = document.getElementById('model-tests-view');
        container.innerHTML = '';
        
        const testSection = document.createElement('div');
        testSection.className = 'telc-test-container';

        switch (this.currentView) {
            case 'overview':
                testSection.appendChild(this.createOverview());
                break;
            case 'listening':
                testSection.appendChild(this.createListeningView());
                break;
            case 'reading':
                testSection.appendChild(this.createReadingView());
                break;
            case 'writing':
                testSection.appendChild(this.createWritingView());
                break;
        }

        container.appendChild(testSection);
    }

    createOverview() {
        const overview = document.createElement('div');
        overview.className = 'telc-section';
        
        overview.innerHTML = `
            <div class="section-header">
                <h1 class="section-title">Telc Deutsch A1 - Modelltest</h1>
            </div>

            <div class="instructions-panel">
                <h3>Wichtige Informationen zum Test</h3>
                <ul>
                    <li>Der Test besteht aus drei Teilen: Hören, Lesen und Schreiben</li>
                    <li>Jeder Teil hat ein Zeitlimit</li>
                    <li>Sie können jeden Teil nur einmal machen</li>
                    <li>Sie können während des Tests keine Pause machen</li>
                </ul>
            </div>

            <div class="test-sections">
                ${this.createSectionCards()}
            </div>
        `;

        return overview;
    }

    createSectionCards() {
        const sections = [
            {
                id: 'listening',
                title: 'Hören',
                duration: '25 Minuten',
                description: 'Kurze Gespräche und Durchsagen verstehen'
            },
            {
                id: 'reading',
                title: 'Lesen',
                duration: '40 Minuten',
                description: 'Kurztexte und Schilder verstehen'
            },
            {
                id: 'writing',
                title: 'Schreiben',
                duration: '30 Minuten',
                description: 'Formular ausfüllen und kurze Nachricht schreiben'
            }
        ];

        return sections.map(section => `
            <div class="test-section-card" data-section="${section.id}">
                <div class="section-info">
                    <h3>${section.title}</h3>
                    <p class="duration">${section.duration}</p>
                    <p class="description">${section.description}</p>
                </div>
                <button class="start-section-btn" onclick="telcUI.startSection('${section.id}')">
                    Starten
                </button>
            </div>
        `).join('');
    }

    createListeningView() {
        const view = document.createElement('div');
        view.className = 'telc-section';

        view.innerHTML = `
            <div class="telc-header">
                <div class="test-info">
                    <h2>Hören - Teil 1: Kurze Gespräche</h2>
                    <p class="test-progress">Frage 1 von 5</p>
                </div>
                <div class="test-timer">09:45</div>
            </div>

            <div class="situation-context">
                Situation: Sie sind im Supermarkt und hören ein Gespräch.
            </div>

            <div class="audio-container">
                <audio id="test-audio" controls>
                    <source src="audio/conversation1.mp3" type="audio/mp3">
                </audio>
                <div class="audio-controls">
                    <span class="play-count">Wiedergabe: 1/2</span>
                </div>
            </div>

            <div class="question-area">
                <div class="question-panel">
                    <p class="question-text">Was kostet das Brot?</p>
                    <div class="answer-options">
                        <div class="answer-option">1,85 €</div>
                        <div class="answer-option">2,85 €</div>
                        <div class="answer-option">1,58 €</div>
                    </div>
                </div>
            </div>

            <div class="test-bottom-nav">
                <button class="nav-button secondary" disabled>
                    <i class="fas fa-arrow-left"></i> Zurück
                </button>
                <span class="question-counter">1/5</span>
                <button class="nav-button">
                    Weiter <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;

        return view;
    }

    createReadingView() {
        const view = document.createElement('div');
        view.className = 'telc-section';

        view.innerHTML = `
            <div class="telc-header">
                <div class="test-info">
                    <h2>Lesen - Teil 1: Kurzmitteilungen</h2>
                    <p class="test-progress">Text 1 von 3</p>
                </div>
                <div class="test-timer">19:45</div>
            </div>

            <div class="question-area">
                <div class="content-panel">
                    <div class="reading-text">
                        Liebe Frau Weber,

                        ich kann morgen leider nicht zum Deutschkurs kommen. 
                        Meine Tochter ist krank und ich muss zu Hause bleiben. 
                        Können Sie mir bitte die Hausaufgaben per E-Mail schicken?

                        Viele Grüße
                        Erica Santos
                    </div>
                </div>
                <div class="question-panel">
                    <p class="question-text">Ist diese Aussage richtig oder falsch?</p>
                    <p class="statement">Frau Santos kommt nicht zum Kurs, weil sie krank ist.</p>
                    <div class="answer-options">
                        <div class="answer-option">Richtig</div>
                        <div class="answer-option">Falsch</div>
                    </div>
                </div>
            </div>

            <div class="test-bottom-nav">
                <button class="nav-button secondary" disabled>
                    <i class="fas fa-arrow-left"></i> Zurück
                </button>
                <span class="question-counter">1/3</span>
                <button class="nav-button">
                    Weiter <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;

        return view;
    }

    createWritingView() {
        const view = document.createElement('div');
        view.className = 'telc-section';

        view.innerHTML = `
            <div class="telc-header">
                <div class="test-info">
                    <h2>Schreiben - Teil 1: Formular</h2>
                </div>
                <div class="test-timer">14:45</div>
            </div>

            <div class="instructions-panel">
                <h3>Aufgabe</h3>
                <p>Füllen Sie das Anmeldeformular für einen Sportkurs aus.</p>
            </div>

            <div class="form-container">
                <h3>ANMELDEFORMULAR - Fitnessstudio Aktiv</h3>
                <div class="form-field">
                    <label>Name</label>
                    <input type="text" required>
                </div>
                <div class="form-field">
                    <label>Geburtsdatum</label>
                    <input type="date" required>
                </div>
                <div class="form-field">
                    <label>Adresse</label>
                    <input type="text" required>
                </div>
                <div class="form-field">
                    <label>Telefonnummer</label>
                    <input type="tel" required>
                </div>
            </div>

            <div class="test-bottom-nav">
                <button class="nav-button secondary">
                    <i class="fas fa-arrow-left"></i> Zurück
                </button>
                <button class="nav-button">
                    Weiter <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;

        return view;
    }

    startSection(sectionId) {
        this.currentView = sectionId;
        this.renderTestView();
    }
}

// Initialize the UI when the page loads
let telcUI;
document.addEventListener('DOMContentLoaded', () => {
    telcUI = new TelcTestUI();
    telcUI.renderTestView();
});

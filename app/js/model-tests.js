// Model Tests functionality
let currentTest = null;
let currentSection = null;

export async function loadModelTests() {
    try {
        const response = await fetch('../content/model_tests.json');
        const data = await response.json();
        displayModelTestsList(data.modelTests);
    } catch (error) {
        console.error('Error loading model tests:', error);
    }
}

function displayModelTestsList(tests) {
    const container = document.getElementById('model-tests-view');
    if (!container) return;

    const testsList = document.createElement('div');
    testsList.className = 'model-tests-list';

    tests.forEach(test => {
        const testCard = createTestCard(test);
        testsList.appendChild(testCard);
    });

    container.innerHTML = '';
    container.appendChild(testsList);
}

function createTestCard(test) {
    const card = document.createElement('div');
    card.className = 'test-card';
    card.innerHTML = `
        <h3>${test.title}</h3>
        <div class="test-sections">
            <button class="section-btn" data-section="listening">Listening</button>
            <button class="section-btn" data-section="reading">Reading</button>
            <button class="section-btn" data-section="writing">Writing</button>
        </div>
    `;

    card.querySelectorAll('.section-btn').forEach(btn => {
        btn.addEventListener('click', () => startTestSection(test, btn.dataset.section));
    });

    return card;
}

function startTestSection(test, section) {
    currentTest = test;
    currentSection = section;
    
    const container = document.getElementById('model-tests-view');
    container.innerHTML = '';

    switch (section) {
        case 'listening':
            displayListeningSection(test.sections.listening);
            break;
        case 'reading':
            displayReadingSection(test.sections.reading);
            break;
        case 'writing':
            displayWritingSection(test.sections.writing);
            break;
    }

    // Add back button
    const backBtn = document.createElement('button');
    backBtn.className = 'back-button';
    backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Test Selection';
    backBtn.addEventListener('click', () => loadModelTests());
    container.appendChild(backBtn);
}

function displayListeningSection(listeningSection) {
    const container = document.getElementById('model-tests-view');
    
    // Display Part 1
    const part1Container = document.createElement('div');
    part1Container.className = 'test-part';
    part1Container.innerHTML = `
        <h3>${listeningSection.part1.title}</h3>
        <p>Duration: ${listeningSection.part1.duration}</p>
        <div class="questions-container">
            ${createListeningQuestions(listeningSection.part1.questions)}
        </div>
    `;
    
    container.appendChild(part1Container);

    // Display Part 2
    const part2Container = document.createElement('div');
    part2Container.className = 'test-part';
    part2Container.innerHTML = `
        <h3>${listeningSection.part2.title}</h3>
        <p>Duration: ${listeningSection.part2.duration}</p>
        <div class="questions-container">
            ${createListeningQuestions(listeningSection.part2.questions)}
        </div>
    `;
    
    container.appendChild(part2Container);
}

function createListeningQuestions(questions) {
    return questions.map(q => `
        <div class="question" data-id="${q.id}">
            <audio controls>
                <source src="${q.audioFile}" type="audio/mp3">
                Your browser does not support the audio element.
            </audio>
            <p>${q.question}</p>
            <div class="options">
                ${q.options.map((opt, idx) => `
                    <label>
                        <input type="radio" name="q_${q.id}" value="${idx}">
                        ${opt}
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function displayReadingSection(readingSection) {
    const container = document.getElementById('model-tests-view');
    
    readingSection.part1.texts.forEach(text => {
        const textContainer = document.createElement('div');
        textContainer.className = 'reading-text-container';
        textContainer.innerHTML = `
            <div class="reading-text">
                ${text.text.replace(/\n/g, '<br>')}
            </div>
            <div class="questions-container">
                ${createReadingQuestions(text.questions)}
            </div>
        `;
        container.appendChild(textContainer);
    });
}

function createReadingQuestions(questions) {
    return questions.map(q => `
        <div class="question" data-id="${q.id}">
            <p>${q.question}</p>
            <div class="options">
                ${q.options.map((opt, idx) => `
                    <label>
                        <input type="radio" name="q_${q.id}" value="${idx}">
                        ${opt}
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function displayWritingSection(writingSection) {
    const container = document.getElementById('model-tests-view');
    
    // Display Part 1 - Form Filling
    const part1Container = document.createElement('div');
    part1Container.className = 'writing-part';
    part1Container.innerHTML = `
        <h3>${writingSection.part1.title}</h3>
        <p>Duration: ${writingSection.part1.duration}</p>
        <p>${writingSection.part1.task.description}</p>
        <form class="registration-form">
            ${writingSection.part1.task.form.fields.map(field => `
                <div class="form-field">
                    <label for="${field.toLowerCase().replace(/\s+/g, '-')}">${field}:</label>
                    <input type="text" id="${field.toLowerCase().replace(/\s+/g, '-')}" name="${field.toLowerCase().replace(/\s+/g, '-')}">
                </div>
            `).join('')}
        </form>
    `;
    container.appendChild(part1Container);

    // Display Part 2 - Short Message
    const part2Container = document.createElement('div');
    part2Container.className = 'writing-part';
    part2Container.innerHTML = `
        <h3>${writingSection.part2.title}</h3>
        <p>Duration: ${writingSection.part2.duration}</p>
        <p>${writingSection.part2.task.description}</p>
        <p>Write between ${writingSection.part2.task.minimumWords} and ${writingSection.part2.task.maximumWords} words.</p>
        <textarea class="writing-area" rows="8" cols="50"></textarea>
        <div class="word-count">Words: 0</div>
    `;
    container.appendChild(part2Container);

    // Add word counter functionality
    const textarea = part2Container.querySelector('.writing-area');
    const wordCount = part2Container.querySelector('.word-count');
    textarea.addEventListener('input', () => {
        const words = textarea.value.trim().split(/\s+/).filter(word => word.length > 0);
        wordCount.textContent = `Words: ${words.length}`;
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const modelTestsBtn = document.querySelector('[data-category="model-tests"]');
    if (modelTestsBtn) {
        modelTestsBtn.addEventListener('click', loadModelTests);
    }
});

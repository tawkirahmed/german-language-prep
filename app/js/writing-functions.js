// Writing exercise functionality
let currentWritingExercise = null;
let currentWritingSubcategory = '';

export function initializeWritingView() {
    const writingView = document.getElementById('writing-view');
    const backToWritingSubcategoriesBtn = document.getElementById('back-to-writing-subcategories');
    
    if (backToWritingSubcategoriesBtn) {
        backToWritingSubcategoriesBtn.addEventListener('click', showWritingSubcategoryView);
    }
}

export function showWritingSubcategoryView() {
    // Hide other views and show writing subcategory view
    document.getElementById('category-view').classList.add('hidden');
    document.getElementById('subcategory-view').classList.remove('hidden');
    document.getElementById('flashcard-view').classList.add('hidden');
    document.getElementById('reading-view').classList.add('hidden');
    document.getElementById('listening-view').classList.add('hidden');
    document.getElementById('writing-view').classList.add('hidden');
}

export function displayWritingExercise(exercise) {
    currentWritingExercise = exercise;
    const writingView = document.getElementById('writing-view');
    
    writingView.innerHTML = `
        <div class="writing-exercise">
            <h2 class="writing-title">${exercise.title}</h2>
            <p class="writing-description">${exercise.description}</p>
            
            <div class="keywords">
                ${exercise.keywords.map(keyword => `
                    <span class="keyword">${keyword}</span>
                `).join('')}
            </div>
            
            <div class="writing-prompt">
                <strong>Task:</strong> ${exercise.prompt}
            </div>
            
            <div class="writing-template">
                <strong>Template:</strong>
                ${exercise.template}
            </div>
            
            <textarea class="writing-textarea" placeholder="Write your text here..."
                rows="10"></textarea>
            
            <div class="tips-section">
                <h3>Tips</h3>
                <ul class="tips-list">
                    ${exercise.tips.map(tip => `
                        <li>${tip}</li>
                    `).join('')}
                </ul>
            </div>
            
            <div class="useful-phrases">
                <h3>Useful Phrases</h3>
                ${exercise.usefulPhrases.map(phrase => `
                    <div class="phrase-item">
                        <span>${phrase.german}</span>
                        <span>${phrase.english}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="writing-controls">
                <button class="show-solution-btn">
                    Show Example Solution
                </button>
                <button class="reset-btn">
                    Reset
                </button>
            </div>
            
            <div class="solution-section">
                <h3>Example Solution:</h3>
                <pre>${exercise.exampleSolution}</pre>
            </div>
        </div>
    `;
    
    // Show writing view and hide others
    document.getElementById('category-view').classList.add('hidden');
    document.getElementById('subcategory-view').classList.add('hidden');
    document.getElementById('flashcard-view').classList.add('hidden');
    document.getElementById('reading-view').classList.add('hidden');
    document.getElementById('listening-view').classList.add('hidden');
    writingView.classList.remove('hidden');
    
    // Add event listeners
    initializeWritingControls();
}

function initializeWritingControls() {
    const showSolutionBtn = document.querySelector('.show-solution-btn');
    const resetBtn = document.querySelector('.reset-btn');
    const textarea = document.querySelector('.writing-textarea');
    
    if (showSolutionBtn) {
        showSolutionBtn.addEventListener('click', () => {
            const solutionSection = document.querySelector('.solution-section');
            solutionSection.classList.toggle('visible');
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            textarea.value = '';
            document.querySelector('.solution-section').classList.remove('visible');
        });
    }
}

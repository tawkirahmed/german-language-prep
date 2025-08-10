// Listening functions for Telc A1 German Flashcards
import { contentData } from './flashcards.js';

// Declare state variables at the top
let currentListeningSubcategory = '';
let currentListeningExercise = null;

// DOM elements
const listeningTitle = document.getElementById('listening-title');
const audioPlayer = document.getElementById('audio-player');
const audioSource = document.getElementById('audio-source');
const transcriptText = document.getElementById('transcript-text');
const transcriptPanel = document.getElementById('transcript-panel');
const toggleTranscriptBtn = document.getElementById('toggle-transcript-btn');
const vocabularyPanelListening = document.getElementById('vocabulary-panel-listening');
const vocabularyListListening = document.getElementById('vocabulary-list-listening');
const toggleVocabularyListeningBtn = document.getElementById('toggle-vocabulary-listening-btn');
const listeningQuestions = document.getElementById('listening-questions');
const listeningResultsFeedback = document.getElementById('listening-results-feedback');
const categoryView = document.getElementById('category-view');
const subcategoryView = document.getElementById('subcategory-view');
const flashcardView = document.getElementById('flashcard-view');
const readingView = document.getElementById('reading-view');
const listeningView = document.getElementById('listening-view');

// Load a specific listening exercise
function loadListeningExercise(exerciseIndex) {
    try {
        console.log('Loading exercise with index:', exerciseIndex);
        console.log('Current subcategory:', currentListeningSubcategory);
        console.log('Content data:', contentData);
        
        if (!contentData) {
            throw new Error('Content data is not loaded');
        }
        if (!contentData.listening) {
            throw new Error('Listening content is not loaded');
        }

        // Get the exercises for the current subcategory
        const exercises = contentData.listening[currentListeningSubcategory];
        if (!exercises) {
            throw new Error(`No exercises found for subcategory: ${currentListeningSubcategory}`);
        }

        if (exerciseIndex >= exercises.length) {
            throw new Error('Listening exercise not found');
        }

        currentListeningExercise = exercises[exerciseIndex];
        
        // Update the listening view with the selected exercise
        const listeningTitle = document.getElementById('listening-title');
        const audioPlayer = document.getElementById('audio-player');
        const audioSource = document.getElementById('audio-source');
        const transcriptText = document.getElementById('transcript-text');
        const transcriptPanel = document.getElementById('transcript-panel');
        const toggleTranscriptBtn = document.getElementById('toggle-transcript-btn');
        const vocabularyPanelListening = document.getElementById('vocabulary-panel-listening');
        const toggleVocabularyListeningBtn = document.getElementById('toggle-vocabulary-listening-btn');
        const listeningResultsFeedback = document.getElementById('listening-results-feedback');
        const categoryView = document.getElementById('category-view');
        const subcategoryView = document.getElementById('subcategory-view');
        const flashcardView = document.getElementById('flashcard-view');
        const readingView = document.getElementById('reading-view');
        const listeningView = document.getElementById('listening-view');
        
        listeningTitle.textContent = currentListeningExercise.title;
        
            // Set up the audio player
        const audioContainer = document.querySelector('.audio-player-container');
        if (!audioContainer) {
            throw new Error('Audio container not found in the DOM');
        }
        
        // Get audio control buttons
        const replayBtn = document.getElementById('replay-btn');
        const slowerBtn = document.getElementById('slower-btn');
        const fasterBtn = document.getElementById('faster-btn');
        
        if (currentListeningExercise.audioUrl) {
            if (!audioPlayer || !audioSource) {
                throw new Error('Audio player elements not found');
            }
            
            // Set up audio source and controls
            audioSource.src = currentListeningExercise.audioUrl;
            audioPlayer.load();
            audioPlayer.style.display = 'block';
            
            // Set up replay button
            if (replayBtn) {
                replayBtn.addEventListener('click', () => {
                    audioPlayer.currentTime = 0;
                    audioPlayer.play();
                });
            }
            
            // Set up slower button
            if (slowerBtn) {
                slowerBtn.addEventListener('click', () => {
                    audioPlayer.playbackRate = Math.max(0.5, audioPlayer.playbackRate - 0.25);
                });
            }
            
            // Set up faster button
            if (fasterBtn) {
                fasterBtn.addEventListener('click', () => {
                    audioPlayer.playbackRate = Math.min(2, audioPlayer.playbackRate + 0.25);
                });
            }
            
            // Clear any previous error messages
            const existingMessage = audioContainer.querySelector('.audio-error-message');
            if (existingMessage) {
                existingMessage.remove();
            }
        } else {
            // If no audio URL is provided, show a message
            if (audioPlayer) {
                audioPlayer.style.display = 'none';
            }
            
            // Hide audio controls if no audio
            if (replayBtn) replayBtn.style.display = 'none';
            if (slowerBtn) slowerBtn.style.display = 'none';
            if (fasterBtn) fasterBtn.style.display = 'none';
            
            // Remove any existing error message first
            const existingMessage = audioContainer.querySelector('.audio-error-message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            const noAudioMessage = document.createElement('p');
            noAudioMessage.className = 'audio-error-message';
            noAudioMessage.textContent = 'Audio file not available. Please read the transcript.';
            noAudioMessage.style.textAlign = 'center';
            noAudioMessage.style.color = '#666';
            noAudioMessage.style.fontStyle = 'italic';
            audioContainer.appendChild(noAudioMessage);
        }        // Set up transcript
        transcriptText.textContent = currentListeningExercise.transcript;
        transcriptPanel.classList.add('hidden');
        toggleTranscriptBtn.innerHTML = '<i class="fas fa-file-alt"></i> Show Transcript';
        
        // Populate vocabulary panel
        populateListeningVocabularyPanel(currentListeningExercise.vocabulary);
        
        // Reset vocabulary panel visibility
        vocabularyPanelListening.classList.add('hidden');
        toggleVocabularyListeningBtn.innerHTML = '<i class="fas fa-book"></i> Show Vocabulary';
        
        // Generate questions
        generateListeningQuestions(currentListeningExercise.questions);
        
        // Hide previous results
        listeningResultsFeedback.classList.add('hidden');
        
        // Show listening view
        categoryView.classList.add('hidden');
        subcategoryView.classList.add('hidden');
        flashcardView.classList.add('hidden');
        readingView.classList.add('hidden');
        listeningView.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading listening exercise:', error);
        alert('Failed to load listening exercise. Please try another one.');
    }
}
// Populate vocabulary panel for listening exercises
function populateListeningVocabularyPanel(vocabulary) {
    vocabularyListListening.innerHTML = '';
    
    if (!vocabulary) return;
    
    // Sort vocabulary alphabetically by German word
    const sortedVocab = Object.entries(vocabulary).sort((a, b) => a[0].localeCompare(b[0]));
    
    sortedVocab.forEach(([germanWord, englishTranslation]) => {
        const vocabItem = document.createElement('div');
        vocabItem.className = 'vocabulary-item';
        
        vocabItem.innerHTML = `
            <span class="german-word">${germanWord}</span>
            <span class="english-translation">${englishTranslation}</span>
        `;
        
        vocabularyListListening.appendChild(vocabItem);
    });
}

// Toggle transcript panel visibility
function toggleTranscript() {
    if (!transcriptPanel || !toggleTranscriptBtn) {
        console.error('Transcript panel or button not found');
        return;
    }
    transcriptPanel.classList.toggle('hidden');
    
    if (transcriptPanel.classList.contains('hidden')) {
        toggleTranscriptBtn.textContent = 'Show Transcript';
        toggleTranscriptBtn.innerHTML = '<i class="fas fa-file-alt"></i> Show Transcript';
    } else {
        toggleTranscriptBtn.textContent = 'Hide Transcript';
        toggleTranscriptBtn.innerHTML = '<i class="fas fa-file-alt"></i> Hide Transcript';
    }
}

// Toggle vocabulary panel visibility for listening exercises
function toggleVocabularyListening() {
    vocabularyPanelListening.classList.toggle('hidden');
    
    if (vocabularyPanelListening.classList.contains('hidden')) {
        toggleVocabularyListeningBtn.innerHTML = '<i class="fas fa-book"></i> Show Vocabulary';
    } else {
        toggleVocabularyListeningBtn.innerHTML = '<i class="fas fa-book"></i> Hide Vocabulary';
    }
}

// Generate questions for the listening comprehension
function generateListeningQuestions(questions) {
    listeningQuestions.innerHTML = '';
    
    if (!questions || questions.length === 0) return;
    
    // Create progress indicator
    const progressDiv = document.createElement('div');
    progressDiv.className = 'question-progress';
    
    for (let i = 0; i < questions.length; i++) {
        const dot = document.createElement('span');
        dot.className = 'progress-dot';
        dot.setAttribute('data-question', i);
        progressDiv.appendChild(dot);
    }
    
    listeningQuestions.appendChild(progressDiv);
    
    // Generate each question
    questions.forEach((question, questionIndex) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'listening-question';
        questionDiv.setAttribute('data-question-index', questionIndex);
        
        const questionText = document.createElement('p');
        questionText.className = 'question-text';
        questionText.textContent = `${questionIndex + 1}. ${question.question}`;
        
        const optionsList = document.createElement('ul');
        optionsList.className = 'options-list';
        
        // Create radio buttons for each option
        question.options.forEach((option, optionIndex) => {
            const optionItem = document.createElement('li');
            optionItem.className = 'option-item';
            
            const optionLabel = document.createElement('label');
            optionLabel.className = 'option-label';
            
            const radioInput = document.createElement('input');
            radioInput.type = 'radio';
            radioInput.name = `listening-question-${questionIndex}`;
            radioInput.value = optionIndex;
            radioInput.className = 'option-input';
            
            // When an option is selected, update the progress indicator
            radioInput.addEventListener('change', function() {
                if (this.checked) {
                    const dots = document.querySelectorAll('.progress-dot');
                    dots[questionIndex].classList.add('answered');
                }
            });
            
            optionLabel.appendChild(radioInput);
            optionLabel.appendChild(document.createTextNode(option));
            
            optionItem.appendChild(optionLabel);
            optionsList.appendChild(optionItem);
        });
        
        questionDiv.appendChild(questionText);
        questionDiv.appendChild(optionsList);
        listeningQuestions.appendChild(questionDiv);
    });
}

// Show listening subcategory view
function showListeningSubcategoryView(subcategory) {
    if (!subcategory || typeof subcategory !== 'string') {
        console.error('Invalid subcategory provided:', subcategory);
        return;
    }

    currentListeningSubcategory = subcategory;
    console.log('Setting current subcategory to:', subcategory);

    // Map subcategories to display titles
    const subcategoryTitles = {
        'basicDialogues': 'Basic Dialogues',
        'phoneConversations': 'Phone Conversations',
        'announcements': 'Announcements',
        'weatherReports': 'Weather Reports'
    };

    const exercises = contentData.listening[subcategory];
    if (!exercises) {
        console.error('No exercises found for subcategory:', subcategory);
        return;
    }

    // Create a temporary container for the exercises
    subcategoryView.innerHTML = '';
    
    // Add back button
    const backButton = document.createElement('button');
    backButton.id = 'back-to-categories';
    backButton.className = 'back-button';
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Categories';
    backButton.addEventListener('click', () => {
        categoryView.classList.remove('hidden');
        subcategoryView.classList.add('hidden');
    });
    subcategoryView.appendChild(backButton);

    // Add title
    const titleDiv = document.createElement('h2');
    titleDiv.className = 'subcategory-title';
    titleDiv.textContent = subcategoryTitles[subcategory] || subcategory;
    subcategoryView.appendChild(titleDiv);

    // Create exercise cards
    exercises.forEach((exercise, index) => {
        const card = document.createElement('div');
        card.className = 'subcategory-card';
        card.innerHTML = `
            <i class="fas fa-headphones"></i>
            <h3>${exercise.title}</h3>
            <div class="category-info">${exercise.questions.length} questions</div>
        `;
        
        card.addEventListener('click', () => {
            loadListeningExercise(index);
        });
        
        subcategoryView.appendChild(card);
    });
    
    // Show subcategory view
    categoryView.classList.add('hidden');
    subcategoryView.classList.remove('hidden');
    flashcardView.classList.add('hidden');
    readingView.classList.add('hidden');
    listeningView.classList.add('hidden');
}

// Check answers for listening comprehension questions
function checkListeningAnswers() {
    if (!currentListeningExercise || !currentListeningExercise.questions) return;
    
    const questions = currentListeningExercise.questions;
    let correctAnswers = 0;
    
    // Check each question
    questions.forEach((question, questionIndex) => {
        const selectedOption = document.querySelector(`input[name="listening-question-${questionIndex}"]:checked`);
        const questionDiv = document.querySelector(`.listening-question[data-question-index="${questionIndex}"]`);
        
        // Reset previous marking
        questionDiv.classList.remove('correct-answer', 'wrong-answer');
        
        // Mark all options
        const options = questionDiv.querySelectorAll('.option-item');
        options.forEach((option, optionIndex) => {
            option.classList.remove('correct-answer', 'wrong-answer');
            
            // Highlight the correct answer
            if (optionIndex === question.correctAnswer) {
                option.classList.add('correct-answer');
            }
        });
        
        // If an option was selected
        if (selectedOption) {
            const selectedIndex = parseInt(selectedOption.value);
            const optionItem = selectedOption.closest('.option-item');
            
            if (selectedIndex === question.correctAnswer) {
                correctAnswers++;
                questionDiv.classList.add('correct-answer');
            } else {
                optionItem.classList.add('wrong-answer');
            }
        }
    });
    
    // Show results feedback
    listeningResultsFeedback.innerHTML = '';
    listeningResultsFeedback.classList.remove('hidden', 'success', 'partial', 'failure');
    
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    
    let feedbackClass = '';
    let feedbackMessage = '';
    
    if (percentage === 100) {
        feedbackClass = 'success';
        feedbackMessage = 'Perfect! You answered all questions correctly.';
    } else if (percentage >= 70) {
        feedbackClass = 'partial';
        feedbackMessage = `Good job! You got ${correctAnswers} out of ${questions.length} questions correct (${percentage}%).`;
    } else {
        feedbackClass = 'failure';
        feedbackMessage = `You got ${correctAnswers} out of ${questions.length} questions correct (${percentage}%). Try listening again carefully.`;
    }
    
    listeningResultsFeedback.classList.add(feedbackClass);
    listeningResultsFeedback.textContent = feedbackMessage;
    
    // Scroll to the results
    listeningResultsFeedback.scrollIntoView({ behavior: 'smooth' });
}

// Export all necessary functions
export {
    loadListeningExercise,
    showListeningSubcategoryView,
    toggleTranscript,
    toggleVocabularyListening,
    checkListeningAnswers
};

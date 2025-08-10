// Helper to get correct content path for local and GitHub Pages
export function getContentPath(filename) {
    const repo = 'german-language-prep';
    const isGithubPages = window.location.hostname.endsWith('github.io') && window.location.pathname.includes(repo);
    const base = isGithubPages ? `/${repo}/content/` : 'content/';
    return base + filename;
}
// Flashcard application for Telc A1 German - Updated with Card-based Navigation
import { loadSyllabusData, addSyllabusCard, handleSyllabusSelection } from './syllabus.js';

// Data structure
export let contentData = {
    vocabulary: null,
    grammar: null,
    irregular_verbs: null,
    phrases: null,
    reading: null,
    listening: null,
    writing: null,
    modal_verbs: null,
    separable_verbs: null,
    syllabus: null
};

// Import writing functions
import { displayWritingExercise, showWritingSubcategoryView } from './writing-functions.js';

// Current state
let currentCategory = '';
let currentSubcategory = '';
let currentCards = [];
let currentCardIndex = 0;
let isFlipped = false;
let currentReadingText = null;
let currentReadingSubcategory = '';
let currentListeningExercise = null;
let currentListeningSubcategory = '';

// DOM elements
const categoryView = document.getElementById('category-view');
const subcategoryView = document.getElementById('subcategory-view');
const flashcardView = document.getElementById('flashcard-view');
const readingView = document.getElementById('reading-view');
const listeningView = document.getElementById('listening-view');
const flashcard = document.querySelector('.flashcard');
const cardFront = document.querySelector('.flashcard-front');
const cardBack = document.querySelector('.flashcard-back');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const flipBtn = document.getElementById('flip-btn');
const cardCount = document.getElementById('card-count');
const printBtn = document.getElementById('print-btn');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const allCardsContainer = document.getElementById('all-cards-container');
const backToCategoriesBtn = document.getElementById('back-to-categories');
const backToSubcategoriesBtn = document.getElementById('back-to-subcategories');

// Search elements
const searchInput = document.getElementById('search-input');
const searchClearBtn = document.getElementById('search-clear-btn');
const searchResultsPanel = document.getElementById('search-results-panel');
const searchResultsList = document.getElementById('search-results-list');
const closeSearchResultsBtn = document.getElementById('close-search-results');

// Reading-specific elements
const readingTitle = document.getElementById('reading-title');
const readingText = document.getElementById('reading-text');
const vocabularyPanel = document.getElementById('vocabulary-panel');
const vocabularyList = document.getElementById('vocabulary-list');
const toggleVocabularyBtn = document.getElementById('toggle-vocabulary-btn');
const readingQuestions = document.getElementById('reading-questions');
const checkAnswersBtn = document.getElementById('check-answers-btn');
const resultsFeedback = document.getElementById('results-feedback');
const backToReadingSubcategoriesBtn = document.getElementById('back-to-reading-subcategories');

// Listening-specific elements
const listeningTitle = document.getElementById('listening-title');
const audioPlayer = document.getElementById('audio-player');
const audioSource = document.getElementById('audio-source');
const transcriptPanel = document.getElementById('transcript-panel');
const transcriptText = document.getElementById('transcript-text');
const toggleTranscriptBtn = document.getElementById('toggle-transcript-btn');
const vocabularyPanelListening = document.getElementById('vocabulary-panel-listening');
const vocabularyListListening = document.getElementById('vocabulary-list-listening');
const toggleVocabularyListeningBtn = document.getElementById('toggle-vocabulary-listening-btn');
const listeningQuestions = document.getElementById('listening-questions');
const checkListeningAnswersBtn = document.getElementById('check-listening-answers-btn');
const listeningResultsFeedback = document.getElementById('listening-results-feedback');
const backToListeningSubcategoriesBtn = document.getElementById('back-to-listening-subcategories');

// Breadcrumb navigation
const homeBreadcrumb = document.getElementById('home-link');
const categoryBreadcrumb = document.getElementById('category-link');
const subcategoryBreadcrumb = document.getElementById('subcategory-link');

    // Category icons mapping
    const categoryIcons = {
        model_tests: 'fa-tasks',
        vocabulary: 'fa-book',
        grammar: 'fa-spell-check',
        irregular_verbs: 'fa-language',
        modal_verbs: 'fa-cogs',
        separable_verbs: 'fa-cut',
        phrases: 'fa-comment-dots',
        reading: 'fa-book-reader',
        listening: 'fa-headphones',
        writing: 'fa-pencil-alt',
        syllabus: 'fa-graduation-cap'
    };
    
    // Add category buttons if they don't exist
    const addCategoryButton = (id, icon, text) => {
        if (!document.getElementById(id)) {
            const button = document.createElement('button');
            button.id = id;
            button.innerHTML = `<i class="fas ${icon}"></i> ${text}`;
            document.getElementById('category-view').appendChild(button);
            return button;
        }
        return document.getElementById(id);
    };
    
    // Add subcategory buttons if they don't exist
    const addSubcategoryButton = (id, icon, text) => {
        if (!document.getElementById(id)) {
            const button = document.createElement('button');
            button.id = id;
            button.innerHTML = `<i class="fas ${icon}"></i> ${text}`;
            document.getElementById('subcategory-view').appendChild(button);
            return button;
        }
        return document.getElementById(id);
    };// Subcategory icons mapping
const subcategoryIcons = {
    // Vocabulary subcategories
    greetings: 'fa-handshake',
    introductions: 'fa-user-plus',
    numbers: 'fa-calculator',
    colors: 'fa-palette',
    family: 'fa-users',
    food: 'fa-utensils',
    time: 'fa-clock',
    transportation: 'fa-bus',
    housing: 'fa-home',
    weather: 'fa-cloud-sun',
    shopping: 'fa-shopping-cart',
    clothing: 'fa-tshirt',
    health: 'fa-heartbeat',
    professions: 'fa-briefcase',
    verbs: 'fa-running',
    
    // Reading subcategories
    shortTexts: 'fa-align-left',
    advertisementsAndSigns: 'fa-sign',
    
    // Listening subcategories
    basicDialogues: 'fa-comments',
    phoneConversations: 'fa-phone',
    announcements: 'fa-bullhorn',
    weatherReports: 'fa-cloud-sun-rain',
    
    // Writing subcategories
    personalLetters: 'fa-envelope',
    emails: 'fa-at',
    forms: 'fa-wpforms',
    descriptions: 'fa-image',
    shortTexts: 'fa-file-alt',
    notes: 'fa-sticky-note',
    
    // Default icon if not found
    default: 'fa-bookmark'
};

// Import comprehensive view
import { ComprehensiveView } from './comprehensive-view.js';

// Initialize the application
function init() {
    // Initialize comprehensive view
    const comprehensiveView = new ComprehensiveView();
    const viewModeToggle = document.getElementById('view-mode-toggle');
    const comprehensiveViewContainer = document.getElementById('comprehensive-view');

    // Add event listener for view mode toggle
    viewModeToggle.addEventListener('change', (e) => {
        const navBreadcrumb = document.getElementById('navigation-breadcrumb');
        if (e.target.checked) {
            document.body.classList.add('comprehensive-mode');
            // Show comprehensive view
            comprehensiveView.initialize();
            comprehensiveViewContainer.classList.remove('hidden');
            categoryView.classList.add('hidden');
            subcategoryView.classList.add('hidden');
            flashcardView.classList.add('hidden');
            readingView.classList.add('hidden');
            listeningView.classList.add('hidden');
            // Hide flashcard-specific UI
            if (printBtn) printBtn.classList.add('hidden');
            if (exportPdfBtn) exportPdfBtn.classList.add('hidden');
            if (navBreadcrumb) navBreadcrumb.classList.add('hidden');
        } else {
            document.body.classList.remove('comprehensive-mode');
            // Show normal view
            comprehensiveViewContainer.classList.add('hidden');
            // Show flashcard-specific UI
            if (printBtn) printBtn.classList.remove('hidden');
            if (exportPdfBtn) exportPdfBtn.classList.remove('hidden');
            if (navBreadcrumb) navBreadcrumb.classList.remove('hidden');
            showCategoryView();
        }
    });

    // Default to Comprehensive View on initial load
    try {
        viewModeToggle.checked = true; // reflect UI state
        document.body.classList.add('comprehensive-mode');
        comprehensiveView.initialize();
        comprehensiveViewContainer.classList.remove('hidden');
        categoryView.classList.add('hidden');
        subcategoryView.classList.add('hidden');
        flashcardView.classList.add('hidden');
        readingView.classList.add('hidden');
        listeningView.classList.add('hidden');
        // Hide flashcard-specific UI on default load
        const navBreadcrumb = document.getElementById('navigation-breadcrumb');
        if (printBtn) printBtn.classList.add('hidden');
        if (exportPdfBtn) exportPdfBtn.classList.add('hidden');
        if (navBreadcrumb) navBreadcrumb.classList.add('hidden');
    } catch (err) {
        console.warn('Comprehensive View default init failed:', err);
    }
    // DOM elements are already declared as constants, no need to reassign
    
    // Instead of reassigning constants, we can use the existing variables directly
    
    // Navigation elements - creating new variables with different names
    const homeBreadcrumbLink = document.getElementById('home-link');
    const categoryBreadcrumbLink = document.getElementById('category-link');
    const subcategoryBreadcrumbLink = document.getElementById('subcategory-link');
    
    // Flashcard elements - creating new variables with different names
    const flashcardContainer = document.querySelector('.flashcard');
    const frontText = document.querySelector('.flashcard-front .flashcard-text');
    const backText = document.querySelector('.flashcard-back .flashcard-text');
    const examplesContainer = document.querySelector('.examples');
    const cardCountDisplay = document.getElementById('card-count');
    
    // Control buttons - creating new variables with different names
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const flipButton = document.getElementById('flip-btn');
    const backToCategoriesButton = document.getElementById('back-to-categories');
    const backToSubcategoriesButton = document.getElementById('back-to-subcategories');
    const backToReadingSubcategoriesButton = document.getElementById('back-to-reading-subcategories');
    const printButton = document.getElementById('print-btn');
    const exportPdfButton = document.getElementById('export-pdf-btn');
    
    // Reading elements - creating new variables with different names
    const readingTitleElement = document.getElementById('reading-title');
    const readingTextElement = document.getElementById('reading-text');
    const toggleVocabularyButton = document.getElementById('toggle-vocabulary-btn');
    const vocabularyPanelElement = document.getElementById('vocabulary-panel');
    const vocabularyListElement = document.getElementById('vocabulary-list');
    const readingQuestionsElement = document.getElementById('reading-questions');
    const checkAnswersButton = document.getElementById('check-answers-btn');
    const resultsFeedbackElement = document.getElementById('results-feedback');
    
    // Add event listeners for navigation and control buttons if they exist
    if (prevBtn) prevBtn.addEventListener('click', showPreviousCard);
    if (nextBtn) nextBtn.addEventListener('click', showNextCard);
    if (flipBtn) flipBtn.addEventListener('click', flipCard);
    if (backToCategoriesBtn) backToCategoriesBtn.addEventListener('click', showCategoryView);
    if (backToSubcategoriesBtn) backToSubcategoriesBtn.addEventListener('click', showSubcategoryView);
    if (backToReadingSubcategoriesBtn) backToReadingSubcategoriesBtn.addEventListener('click', showReadingSubcategoryView);
    if (printBtn) printBtn.addEventListener('click', preparePrint);
    if (exportPdfBtn) exportPdfBtn.addEventListener('click', exportToPdf);

    // Ensure buttons exist and initialize them
    addCategoryButton('vocab-btn', 'fa-book', 'Vocabulary');
    addCategoryButton('grammar-btn', 'fa-spell-check', 'Grammar');
    addCategoryButton('phrases-btn', 'fa-comment-dots', 'Phrases');
    addCategoryButton('verbs-btn', 'fa-language', 'Verbs');
    addCategoryButton('reading-btn', 'fa-book-reader', 'Reading');
    addCategoryButton('listening-btn', 'fa-headphones', 'Listening');

    // Add event listeners for category buttons
    const vocabBtnEl = document.getElementById('vocab-btn');
    const grammarBtnEl = document.getElementById('grammar-btn');
    const phrasesBtnEl = document.getElementById('phrases-btn');
    const verbsBtnEl = document.getElementById('verbs-btn');
    const readingBtnEl = document.getElementById('reading-btn');
    const listeningBtnEl = document.getElementById('listening-btn');

    if (vocabBtnEl) vocabBtnEl.addEventListener('click', () => showFlashcards('vocabulary'));
    if (grammarBtnEl) grammarBtnEl.addEventListener('click', () => showFlashcards('grammar'));
    if (phrasesBtnEl) phrasesBtnEl.addEventListener('click', () => showFlashcards('phrases'));
    if (verbsBtnEl) verbsBtnEl.addEventListener('click', () => showFlashcards('verbs'));
    if (readingBtnEl) readingBtnEl.addEventListener('click', () => {
        categoryView.classList.add('hidden');
        subcategoryView.classList.remove('hidden');
        flashcardView.classList.add('hidden');
        readingView.classList.add('hidden');
        listeningView.classList.add('hidden');
    });
    if (listeningBtnEl) listeningBtnEl.addEventListener('click', () => {
        categoryView.classList.add('hidden');
        subcategoryView.classList.remove('hidden');
        flashcardView.classList.add('hidden');
        readingView.classList.add('hidden');
        listeningView.classList.add('hidden');
    });

    // Initialize subcategory buttons
    addSubcategoryButton('dialogues-btn', 'fa-comments', 'Basic Dialogues');
    addSubcategoryButton('phone-btn', 'fa-phone', 'Phone Conversations');
    addSubcategoryButton('announcements-btn', 'fa-bullhorn', 'Announcements');
    addSubcategoryButton('weather-btn', 'fa-cloud-sun-rain', 'Weather Reports');

    // Add event listeners for listening subcategory buttons
    const dialoguesBtnEl = document.getElementById('dialogues-btn');
    const phoneBtnEl = document.getElementById('phone-btn');
    const announcementsBtnEl = document.getElementById('announcements-btn');
    const weatherBtnEl = document.getElementById('weather-btn');

    if (dialoguesBtnEl) dialoguesBtnEl.addEventListener('click', () => showListeningSubcategoryView('basicDialogues'));
    if (phoneBtnEl) phoneBtnEl.addEventListener('click', () => showListeningSubcategoryView('phoneConversations'));
    if (announcementsBtnEl) announcementsBtnEl.addEventListener('click', () => showListeningSubcategoryView('announcements'));
    if (weatherBtnEl) weatherBtnEl.addEventListener('click', () => showListeningSubcategoryView('weatherReports'));
    
    // Modal event listeners
    const showPluralRulesBtn = document.getElementById('show-plural-rules');
    const pluralRulesModal = document.getElementById('plural-rules-modal');
    const closeModalBtn = document.querySelector('.close-button');
    
    // Make sure the modal is hidden on page load
    pluralRulesModal.classList.add('hidden');
    
    showPluralRulesBtn.addEventListener('click', () => {
        pluralRulesModal.classList.remove('hidden');
    });
    
    closeModalBtn.addEventListener('click', () => {
        pluralRulesModal.classList.add('hidden');
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === pluralRulesModal) {
            pluralRulesModal.classList.add('hidden');
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !pluralRulesModal.classList.contains('hidden')) {
            pluralRulesModal.classList.add('hidden');
        }
    });
    
    // Navigation breadcrumb listeners
    homeBreadcrumb.addEventListener('click', showCategoryView);
    categoryBreadcrumb.addEventListener('click', showSubcategoryView);
    
    // Reading specific listeners
    toggleVocabularyBtn.addEventListener('click', toggleVocabulary);
    checkAnswersBtn.addEventListener('click', checkAnswers);
    
    // Search listeners
    searchInput.addEventListener('input', () => {
        performSearch();
        searchClearBtn.classList.toggle('hidden', searchInput.value === '');
    });
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission
        }
    });
    searchClearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchResultsPanel.classList.add('hidden');
        searchClearBtn.classList.add('hidden');
        searchInput.focus();
    });
    closeSearchResultsBtn.addEventListener('click', () => {
        searchResultsPanel.classList.add('hidden');
    });
    
    // Hide search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchResultsPanel.classList.add('hidden');
        }
    });

    // Listening functions are now imported at the top of the file
    
    // Listening specific listeners
    toggleTranscriptBtn.addEventListener('click', toggleTranscript);
    toggleVocabularyListeningBtn.addEventListener('click', toggleVocabularyListening);
    checkListeningAnswersBtn.addEventListener('click', checkListeningAnswers);
    backToListeningSubcategoriesBtn.addEventListener('click', () => {
        showListeningSubcategoryView(currentListeningSubcategory);
    });
    
    // Initialize audio controls and panels
    function initAudioControls() {
        // Audio elements
        const audioPlayer = document.getElementById('audio-player');
        const audioSource = document.getElementById('audio-source');
        if (!audioPlayer || !audioSource) {
            console.warn('Audio elements not found. They will be initialized when needed.');
            return;
        }
        
        // Audio control buttons
        const replayBtn = document.getElementById('replay-btn');
        const slowerBtn = document.getElementById('slower-btn');
        const fasterBtn = document.getElementById('faster-btn');
        
        // Panel close buttons
        const closeTranscriptBtn = document.getElementById('close-transcript-btn');
        const closeVocabularyBtn = document.getElementById('close-vocabulary-btn');
        
        // Toggle buttons
        const toggleTranscriptBtn = document.getElementById('toggle-transcript-btn');
        const toggleVocabularyBtn = document.getElementById('vocabulary-panel-listening');
        
        // Add event listeners for audio controls if they exist
        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                if (audioPlayer) {
                    audioPlayer.currentTime = 0;
                    audioPlayer.play();
                }
            });
        }
        
        if (slowerBtn) {
            slowerBtn.addEventListener('click', () => {
                if (audioPlayer) {
                    audioPlayer.playbackRate = Math.max(0.5, audioPlayer.playbackRate - 0.25);
                }
            });
        }
        
        if (fasterBtn) {
            fasterBtn.addEventListener('click', () => {
                if (audioPlayer) {
                    audioPlayer.playbackRate = Math.min(2, audioPlayer.playbackRate + 0.25);
                }
            });
        }
        
        // Add event listeners for panel toggles if they exist
        if (toggleTranscriptBtn) {
            toggleTranscriptBtn.addEventListener('click', () => {
                const panel = document.getElementById('transcript-panel');
                if (panel) {
                    panel.classList.toggle('hidden');
                    toggleTranscriptBtn.innerHTML = panel.classList.contains('hidden') 
                        ? '<i class="fas fa-file-alt"></i> Show Transcript'
                        : '<i class="fas fa-file-alt"></i> Hide Transcript';
                }
            });
        }
        
        if (toggleVocabularyBtn) {
            toggleVocabularyBtn.addEventListener('click', () => {
                const panel = document.getElementById('vocabulary-panel-listening');
                if (panel) {
                    panel.classList.toggle('hidden');
                    toggleVocabularyBtn.innerHTML = panel.classList.contains('hidden')
                        ? '<i class="fas fa-book"></i> Show Vocabulary'
                        : '<i class="fas fa-book"></i> Hide Vocabulary';
                }
            });
        }
        
        // Add event listeners for panel close buttons if they exist
        if (closeTranscriptBtn) {
            closeTranscriptBtn.addEventListener('click', () => {
                const panel = document.getElementById('transcript-panel');
                if (panel && toggleTranscriptBtn) {
                    panel.classList.add('hidden');
                    toggleTranscriptBtn.innerHTML = '<i class="fas fa-file-alt"></i> Show Transcript';
                }
            });
        }
        
        if (closeVocabularyBtn) {
            closeVocabularyBtn.addEventListener('click', () => {
                const panel = document.getElementById('vocabulary-panel-listening');
                if (panel && toggleVocabularyBtn) {
                    panel.classList.add('hidden');
                    toggleVocabularyBtn.innerHTML = '<i class="fas fa-book"></i> Show Vocabulary';
                }
            });
        }
    }
    
    // Initialize audio controls
    initAudioControls();
    
    // Add click listener for highlighted vocabulary words
    readingText.addEventListener('click', function(event) {
        if (event.target.classList.contains('highlight-word')) {
            // Toggle the visibility of the translation tooltip manually
            const currentTranslation = event.target.getAttribute('data-translation');
            const tooltip = document.createElement('div');
            tooltip.className = 'vocabulary-tooltip';
            tooltip.textContent = currentTranslation;
            tooltip.style.position = 'absolute';
            tooltip.style.top = (event.target.offsetTop - 30) + 'px';
            tooltip.style.left = event.target.offsetLeft + 'px';
            tooltip.style.backgroundColor = 'var(--primary-dark)';
            tooltip.style.color = 'white';
            tooltip.style.padding = '5px 10px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.zIndex = '100';
            
            // Remove any existing tooltips
            const existingTooltips = document.querySelectorAll('.vocabulary-tooltip');
            existingTooltips.forEach(t => t.remove());
            
            // Add the new tooltip
            readingText.appendChild(tooltip);
            
            // Remove the tooltip after 2 seconds
            setTimeout(() => {
                tooltip.remove();
            }, 2000);
        }
    });
    
    // Load content and populate category view
    loadContent();
}

    // Load content data from JSON files
async function loadContent() {
    try {
        // Load model tests content first
        try {
            const modelTestsResponse = await fetch(getContentPath('model_tests.json'));
            if (modelTestsResponse.ok) {
                contentData.model_tests = await modelTestsResponse.json();
                console.log('Successfully loaded model tests data');
            } else {
                throw new Error('Failed to load model tests data');
            }
        } catch (error) {
            console.error('Error loading model tests data:', error);
            displayError('Failed to load model tests. Please try again later.');
        }

        // Load listening content
        try {
            const listeningResponse = await fetch(getContentPath('listening.json'));
            if (listeningResponse.ok) {
                contentData.listening = await listeningResponse.json();
                console.log('Successfully loaded listening data');
            } else {
                throw new Error('Failed to load listening data');
            }
        } catch (error) {
            console.error('Error loading listening data:', error);
            displayError('Failed to load listening exercises. Please try again later.');
        }
        // Load other content types
        const contentTypes = ['vocabulary', 'grammar', 'irregular_verbs', 'phrases', 'reading', 'writing'];

        for (const contentType of contentTypes) {
            try {
                const path = getContentPath(`${contentType}.json`);
                console.log(`Trying to load from: ${path}`);
                const response = await fetch(path);
                if (response.ok) {
                    contentData[contentType] = await response.json();

                    // Extract modal verbs if they exist in irregular_verbs.json
                    if (contentType === 'irregular_verbs' && contentData[contentType].modalVerbs) {
                        contentData.modal_verbs = { modalVerbs: contentData[contentType].modalVerbs };
                    }

                    // Extract separable verbs if they exist in vocabulary.json
                    if (contentType === 'vocabulary' && contentData[contentType].separableVerbs) {
                        contentData.separable_verbs = { separableVerbs: contentData[contentType].separableVerbs };
                    }

                    console.log(`Successfully loaded ${contentType} from ${path}`);
                } else {
                    throw new Error(`Failed to load ${contentType} data from ${path}`);
                }
            } catch (error) {
                console.error(`Error loading ${contentType} data:`, error);
                displayError(`Failed to load ${contentType} data. Error: ${error.message}. Make sure you're running this from a web server with the JSON files accessible.`);
            }
        }
        
        // Expose verbs (regular/irregular/modal) from phrases for flashcards category
        if (contentData.phrases?.verbs) {
            contentData.verbs = contentData.phrases.verbs;
        }
        
        // Also load syllabus data
        try {
            contentData.syllabus = await loadSyllabusData();
            console.log('Successfully loaded syllabus data');
        } catch (error) {
            console.error('Error loading syllabus data:', error);
            // Non-critical, continue without syllabus data
        }
        
        // After loading all content, populate the category cards
        populateCategoryCards();
        
    } catch (error) {
        console.error('Error initializing content:', error);
        displayError('Failed to initialize application. Please reload the page.');
    }
}

// Populate the category cards view
function populateCategoryCards() {
    const categories = [
        {
            value: 'model_tests',
            label: 'Model Tests',
            description: 'Practice with real Telc A1 exam format',
            count: contentData.model_tests?.modelTests?.length || 0
        },
        { 
            value: 'vocabulary', 
            label: 'Vocabulary', 
            description: 'Essential German words by topic',
            count: getSubcategoryCount('vocabulary')
        },
        { 
            value: 'grammar', 
            label: 'Grammar Rules', 
            description: 'Basic German grammar structures',
            count: getSubcategoryCount('grammar')
        },
        { 
            value: 'verbs', 
            label: 'Verbs', 
            description: 'Regular, irregular, and modal verbs',
            count: getSubcategoryCount('verbs')
        },
        { 
            value: 'irregular_verbs', 
            label: 'Irregular Verbs', 
            description: 'Common irregular verb forms',
            count: contentData.irregular_verbs?.irregularVerbs?.length || 0
        },
        { 
            value: 'modal_verbs', 
            label: 'Modal Verbs', 
            description: 'Verbs that express ability, possibility, permission, etc.',
            count: contentData.modal_verbs?.modalVerbs?.length || 0
        },
        { 
            value: 'separable_verbs', 
            label: 'Separable Verbs', 
            description: 'Verbs with prefixes that separate in sentences',
            count: contentData.separable_verbs?.separableVerbs?.length || 0
        },
        { 
            value: 'phrases', 
            label: 'Common Phrases', 
            description: 'Useful everyday expressions',
            count: getSubcategoryCount('phrases')
        },
        { 
            value: 'reading', 
            label: 'Reading Practice', 
            description: 'Short texts to practice reading skills',
            count: getSubcategoryCount('reading')
        },
        { 
            value: 'listening', 
            label: 'Listening Practice', 
            description: 'Audio exercises to improve listening comprehension',
            count: getSubcategoryCount('listening')
        },
        { 
            value: 'writing', 
            label: 'Writing Practice', 
            description: 'Learn to write emails, letters, and forms',
            count: getSubcategoryCount('writing')
        }
    ];
    
    categoryView.innerHTML = '';
    
    categories.forEach(category => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'category-card';
        cardDiv.setAttribute('data-category', category.value);
        
        const iconClass = categoryIcons[category.value] || 'fa-bookmark';
        
        cardDiv.innerHTML = `
            <i class="fas ${iconClass}"></i>
            <h3>${category.label}</h3>
            <p>${category.description}</p>
            <div class="category-info">
                ${(category.value === 'irregular_verbs' || category.value === 'modal_verbs') ? 
                  `${category.count} verbs` : 
                  `${category.count} subcategories`}
            </div>
        `;
        
        cardDiv.addEventListener('click', () => {
            handleCategorySelection(category.value, category.label);
        });
        
        categoryView.appendChild(cardDiv);
    });
    
    // Add syllabus card if syllabus data is available
    if (contentData.syllabus) {
        addSyllabusCard(categoryView);
    }
    
    // Show the appropriate view based on current toggle
    const viewToggle = document.getElementById('view-mode-toggle');
    if (viewToggle && viewToggle.checked) {
        // Comprehensive mode: keep category grid hidden
        categoryView.classList.add('hidden');
    } else {
        // Normal mode: show categories
        showCategoryView();
    }
}

// Get count of subcategories for a category
function getSubcategoryCount(category) {
    if (!contentData[category]) return 0;
    return Object.keys(contentData[category]).length;
}

// Handle category selection
function handleCategorySelection(categoryValue, categoryLabel) {
    currentCategory = categoryValue;
    
    // Update breadcrumb
    categoryBreadcrumb.textContent = categoryLabel;
    categoryBreadcrumb.classList.remove('hidden');
    subcategoryBreadcrumb.classList.add('hidden');
    
    // Handle syllabus differently
    if (categoryValue === 'syllabus') {
        handleSyllabusSelection();
        return;
    }
    
    // Special case for irregular verbs and modal verbs
    if (categoryValue === 'irregular_verbs') {
        currentSubcategory = 'irregular_verbs';
        loadCards(currentCategory, currentSubcategory);
        showFlashcardView();
        subcategoryBreadcrumb.textContent = 'All Irregular Verbs';
        subcategoryBreadcrumb.classList.remove('hidden');
        return;
    } else if (categoryValue === 'modal_verbs') {
        currentSubcategory = 'modalVerbs';
        loadCards(currentCategory, currentSubcategory);
        showFlashcardView();
        subcategoryBreadcrumb.textContent = 'All Modal Verbs';
        subcategoryBreadcrumb.classList.remove('hidden');
        return;
    } else if (categoryValue === 'separable_verbs') {
        currentSubcategory = 'separableVerbs';
        loadCards(currentCategory, currentSubcategory);
        showFlashcardView();
        subcategoryBreadcrumb.textContent = 'All Separable Verbs';
        subcategoryBreadcrumb.classList.remove('hidden');
        return;
    }
    
    // Populate subcategory cards
    populateSubcategoryCards(categoryValue);
    
    // Show subcategory view
    showSubcategoryView();
}

// Populate subcategory cards based on selected category
function populateSubcategoryCards(category) {
    subcategoryView.innerHTML = '';
    
    // Add back button
    subcategoryView.appendChild(backToCategoriesBtn);
    
    if (!category || !contentData[category]) return;
    
    // Get subcategories from the selected category
    const subcategories = Object.keys(contentData[category]);
    
    subcategories.forEach(subcategory => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'subcategory-card';
        cardDiv.setAttribute('data-subcategory', subcategory);
        
        // Format the subcategory name for display (capitalize, replace camelCase with spaces)
        let displayName = subcategory
            .replace(/([A-Z])/g, ' $1')  // Insert space before capital letters
            .replace(/^./, str => str.toUpperCase());  // Capitalize first letter
        
        // Get icon for subcategory
        const iconClass = subcategoryIcons[subcategory] || subcategoryIcons.default;
        
        // Count items in subcategory
        const itemCount = contentData[category][subcategory]?.length || 0;
        
        cardDiv.innerHTML = `
            <i class="fas ${iconClass}"></i>
            <h3>${displayName}</h3>
            <div class="category-info">${itemCount} cards</div>
        `;
        
        cardDiv.addEventListener('click', () => {
            handleSubcategorySelection(subcategory, displayName);
        });
        
        subcategoryView.appendChild(cardDiv);
    });
}

// Handle subcategory selection
function handleSubcategorySelection(subcategory, displayName) {
    currentSubcategory = subcategory;
    
    // Update breadcrumb
    subcategoryBreadcrumb.textContent = displayName;
    subcategoryBreadcrumb.classList.remove('hidden');
    
    // For reading category, load reading view
    if (currentCategory === 'reading') {
        currentReadingSubcategory = subcategory;
        showReadingSubcategoryView();
        return;
    }
    
    // For listening category, load listening view
    if (currentCategory === 'listening') {
        currentListeningSubcategory = subcategory;
        showListeningSubcategoryView(subcategory);
        return;
    }
    
    // For writing category, load writing view
    if (currentCategory === 'writing') {
        const writingExercises = contentData[currentCategory][subcategory];
        if (writingExercises && writingExercises.length > 0) {
            displayWritingExercise(writingExercises[0]);
            return;
        }
    }

    // For other categories, load flashcard view
    loadCards(currentCategory, currentSubcategory);
    showFlashcardView();
}

// Load cards based on selected category and subcategory
function loadCards(category, subcategory) {
    if (!category || !subcategory) return;
    
    try {
        // Handle irregular verbs which has a different structure
        if (category === 'irregular_verbs' && subcategory === 'irregular_verbs') {
            currentCards = contentData.irregular_verbs.irregularVerbs.map(verb => ({
                front: verb.infinitive,
                back: verb.english,
                examples: verb.examples,
                conjugation: verb.present,
                isVerb: true
            }));
        } 
        // Handle modal verbs
        else if (category === 'modal_verbs' && subcategory === 'modalVerbs') {
            currentCards = contentData.modal_verbs.modalVerbs.map(verb => ({
                front: verb.infinitive,
                back: verb.english,
                examples: verb.examples,
                conjugation: verb.present,
                usage: verb.usage,
                isVerb: true,
                isModal: true
            }));
        }
        // Handle separable verbs
        else if (category === 'separable_verbs' && subcategory === 'separableVerbs') {
            currentCards = contentData.separable_verbs.separableVerbs.map(verb => ({
                front: verb.german,
                back: verb.english,
                examples: verb.examples,
                conjugation: verb.conjugation,
                prefix: verb.prefix,
                baseVerb: verb.baseVerb,
                note: verb.note,
                isVerb: true,
                isSeparable: true
            }));
        }
        // Handle consolidated verbs from phrases.json (regular, irregular, modal)
        else if (category === 'verbs') {
            const items = (contentData.verbs && contentData.verbs[subcategory]) || [];
            currentCards = items.map(verb => ({
                front: verb.infinitive,
                back: verb.english || '',
                examples: verb.examples,
                conjugation: verb.present,
                isVerb: true
            }));
        }
        else {
            currentCards = contentData[category][subcategory].map(item => {
                const card = {
                    front: item.german,
                    back: item.english,
                    examples: item.examples
                };

                // Add plural form if it exists (for nouns)
                if (item.plural) {
                    card.plural = item.plural;
                }

                // Add conjugation if it exists (for verbs)
                if (item.conjugation) {
                    card.conjugation = item.conjugation;
                    card.isVerb = true;
                }

                return card;
            });
        }
        
        currentCardIndex = 0;
        updateCardButtons();
        displayCard(currentCardIndex);
    } catch (error) {
        console.error('Error loading cards:', error);
        displayError('Failed to load flashcards. Please try another category.');
    }
}

// Show the category view
function showCategoryView() {
    categoryView.classList.remove('hidden');
    subcategoryView.classList.add('hidden');
    flashcardView.classList.add('hidden');
    readingView.classList.add('hidden');
    listeningView.classList.add('hidden');
    
    // Also hide syllabus view if it exists
    const syllabusView = document.getElementById('syllabus-view');
    if (syllabusView) {
        syllabusView.classList.add('hidden');
    }
    
    // Update breadcrumb
    homeBreadcrumb.classList.add('active');
    categoryBreadcrumb.classList.add('hidden');
    subcategoryBreadcrumb.classList.add('hidden');
    
    // Reset current selections
    currentCategory = '';
    currentSubcategory = '';
    resetCardDisplay();
}

// Show the subcategory view
function showSubcategoryView() {
    categoryView.classList.add('hidden');
    subcategoryView.classList.remove('hidden');
    flashcardView.classList.add('hidden');
    readingView.classList.add('hidden');
    listeningView.classList.add('hidden');
    
    // Update breadcrumb
    homeBreadcrumb.classList.remove('active');
    categoryBreadcrumb.classList.add('active');
    subcategoryBreadcrumb.classList.add('hidden');
}

// Show the flashcard view
function showFlashcardView() {
    categoryView.classList.add('hidden');
    subcategoryView.classList.add('hidden');
    flashcardView.classList.remove('hidden');
    readingView.classList.add('hidden');
    listeningView.classList.add('hidden');
    
    // Update navigation breadcrumbs
    homeBreadcrumb.classList.remove('active');
    categoryBreadcrumb.classList.remove('active');
    subcategoryBreadcrumb.classList.add('active');
    
    // Update breadcrumb
    homeBreadcrumb.classList.remove('active');
    categoryBreadcrumb.classList.remove('active');
    subcategoryBreadcrumb.classList.add('active');
}

// Display the current card
function displayCard(index) {
    if (!currentCards.length) return;
    
    const card = currentCards[index];
    
    // Update front of card
    cardFront.querySelector('.flashcard-text').textContent = card.front;
    
    // Reset any transforms to fix upside-down text
    cardFront.querySelector('.flashcard-text').style.transform = "none";
    
    // Update back of card
    cardBack.querySelector('.flashcard-text').textContent = card.back;
    cardBack.querySelector('.flashcard-text').style.transform = "none";
    
    // Before adding content, scroll to the top
    cardBack.scrollTop = 0;
    cardFront.scrollTop = 0;
    
    // Handle examples
    const examplesContainer = cardBack.querySelector('.examples');
    examplesContainer.innerHTML = '';
    
    // Add plural form for nouns if available
    if (card.plural) {
        const pluralDiv = document.createElement('div');
        pluralDiv.classList.add('plural-form');
        
        const pluralTitle = document.createElement('p');
        pluralTitle.textContent = 'Plural Form:';
        pluralTitle.style.fontWeight = 'bold';
        pluralTitle.style.marginTop = '15px';
        pluralDiv.appendChild(pluralTitle);
        
        const pluralP = document.createElement('p');
        pluralP.textContent = card.plural;
        pluralDiv.appendChild(pluralP);
        
        // Extract the plural rule pattern
        const singularWord = card.front.split(' ')[1] || card.front;
        const pluralWord = card.plural.split(' ')[1] || card.plural;
        const pluralRule = determinePluralRule(singularWord, pluralWord);
        
        if (pluralRule) {
            const ruleP = document.createElement('p');
            ruleP.innerHTML = `<strong>Rule:</strong> ${pluralRule}`;
            ruleP.style.marginTop = '5px';
            ruleP.style.fontSize = '14px';
            ruleP.style.fontStyle = 'italic';
            ruleP.style.color = 'rgba(255, 255, 255, 0.9)';
            pluralDiv.appendChild(ruleP);
        }
        
        examplesContainer.appendChild(pluralDiv);
        
        // Show the plural rules button only when a card has a plural form
        const showPluralRulesBtn = document.getElementById('show-plural-rules');
        if (showPluralRulesBtn) {
            showPluralRulesBtn.style.display = 'inline-block';
        }
    } else {
        // Hide the plural rules button when a card doesn't have a plural form
        const showPluralRulesBtn = document.getElementById('show-plural-rules');
        if (showPluralRulesBtn) {
            showPluralRulesBtn.style.display = 'none';
        }
    }
    
    // Add usage information for modal verbs
    if (card.usage) {
        const usageDiv = document.createElement('div');
        usageDiv.classList.add('usage-info');
        
        const usageTitle = document.createElement('p');
        usageTitle.textContent = 'Usage:';
        usageTitle.style.fontWeight = 'bold';
        usageTitle.style.marginTop = '15px';
        usageDiv.appendChild(usageTitle);
        
        const usageP = document.createElement('p');
        usageP.textContent = card.usage;
        usageP.style.fontStyle = 'italic';
        usageDiv.appendChild(usageP);
        
        examplesContainer.appendChild(usageDiv);
    }
    
    // Add information for separable verbs
    if (card.isSeparable) {
        const separableDiv = document.createElement('div');
        separableDiv.classList.add('separable-info');
        
        const separableTitle = document.createElement('p');
        separableTitle.textContent = 'Separable Verb Information:';
        separableTitle.style.fontWeight = 'bold';
        separableTitle.style.marginTop = '15px';
        separableDiv.appendChild(separableTitle);
        
        const prefixP = document.createElement('p');
        prefixP.innerHTML = `<strong>Prefix:</strong> ${card.prefix}`;
        separableDiv.appendChild(prefixP);
        
        const baseVerbP = document.createElement('p');
        baseVerbP.innerHTML = `<strong>Base Verb:</strong> ${card.baseVerb}`;
        separableDiv.appendChild(baseVerbP);
        
        if (card.note) {
            const noteP = document.createElement('p');
            noteP.innerHTML = `<strong>Note:</strong> ${card.note}`;
            separableDiv.appendChild(noteP);
        }
        
        examplesContainer.appendChild(separableDiv);
    }
    
    // Handle conjugation for verbs - MOVED BEFORE EXAMPLES
    if (card.conjugation) {
        const conjugationDiv = document.createElement('div');
        conjugationDiv.classList.add('conjugation');
        
        const conjugationTitle = document.createElement('p');
        conjugationTitle.textContent = 'Present Tense Conjugation:';
        conjugationTitle.style.fontWeight = 'bold';
        conjugationTitle.style.marginTop = '15px';
        conjugationTitle.style.marginBottom = '15px';
        conjugationDiv.appendChild(conjugationTitle);
        
        for (const [pronoun, form] of Object.entries(card.conjugation)) {
            const conjugationP = document.createElement('p');
            conjugationP.innerHTML = `<strong>${pronoun}:</strong> ${form}`;
            conjugationDiv.appendChild(conjugationP);
        }
        
        examplesContainer.appendChild(conjugationDiv);
    }
    
    // Handle examples - NOW AFTER CONJUGATION
    if (card.examples && card.examples.length) {
        const examplesWrapper = document.createElement('div');
        examplesWrapper.style.width = '100%';
        examplesWrapper.style.marginBottom = '20px';
        
        const examplesTitle = document.createElement('p');
        examplesTitle.textContent = 'Examples:';
        examplesTitle.style.fontWeight = 'bold';
        examplesTitle.style.marginTop = '15px';
        examplesTitle.style.marginBottom = '15px';
        examplesTitle.style.textAlign = 'center';
        examplesTitle.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
        examplesTitle.style.paddingBottom = '8px';
        examplesWrapper.appendChild(examplesTitle);
        
        card.examples.forEach(example => {
            const exampleDiv = document.createElement('div');
            exampleDiv.classList.add('example-item');
            
            // Handle new example format (object with german and english)
            if (typeof example === 'object') {
                const germanP = document.createElement('p');
                germanP.textContent = example.german;
                germanP.style.fontWeight = 'bold';
                exampleDiv.appendChild(germanP);
                
                const englishP = document.createElement('p');
                englishP.textContent = example.english;
                englishP.style.fontStyle = 'italic';
                englishP.style.color = '#ffffff'; // Changed from #666 to white
                englishP.style.textShadow = '0px 1px 2px rgba(0, 0, 0, 0.3)'; // Add text shadow for better readability
                exampleDiv.appendChild(englishP);
            } else {
                // Handle legacy format (just string)
                const exampleP = document.createElement('p');
                exampleP.textContent = example;
                exampleDiv.appendChild(exampleP);
            }
            
            examplesWrapper.appendChild(exampleDiv);
        });
        
        examplesContainer.appendChild(examplesWrapper);
    }
    
    // Reset card to front side
    isFlipped = false;
    flashcard.classList.remove('flipped');
    
    // Update card counter
    cardCount.textContent = `${index + 1}/${currentCards.length}`;
}

// Show previous card
function showPreviousCard() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        displayCard(currentCardIndex);
        updateCardButtons();
    }
}

// Show next card
function showNextCard() {
    if (currentCardIndex < currentCards.length - 1) {
        currentCardIndex++;
        displayCard(currentCardIndex);
        updateCardButtons();
    }
}

// Flip the current card
function flipCard() {
    isFlipped = !isFlipped;
    flashcard.classList.toggle('flipped');
}

// Update navigation buttons state
function updateCardButtons() {
    prevBtn.disabled = currentCardIndex === 0;
    nextBtn.disabled = currentCardIndex === currentCards.length - 1;
    flipBtn.disabled = currentCards.length === 0;
}

// Reset the card display
function resetCardDisplay() {
    currentCards = [];
    currentCardIndex = 0;
    cardFront.querySelector('.flashcard-text').textContent = 'Select a category and subcategory to start';
    cardBack.querySelector('.flashcard-text').textContent = 'The translation will appear here';
    cardBack.querySelector('.examples').innerHTML = '<p>Examples will appear here</p>';
    cardCount.textContent = '0/0';
    updateCardButtons();
    isFlipped = false;
    flashcard.classList.remove('flipped');
}

// Display error message
function displayError(message) {
    cardFront.querySelector('.flashcard-text').textContent = 'Error';
    cardBack.querySelector('.flashcard-text').textContent = message;
    cardBack.querySelector('.examples').innerHTML = '';
    cardCount.textContent = '0/0';
    updateCardButtons();
}

// Prepare cards for printing
function preparePrint() {
    if (!currentCards.length) {
        alert('Please select a category and subcategory first.');
        return;
    }
    
    // Clear previous content
    allCardsContainer.innerHTML = '';
    
    // Add print instructions
    const instructions = document.createElement('div');
    instructions.className = 'print-instructions';
    instructions.innerHTML = `
        <h2>Printing Instructions</h2>
        <ol>
            <li>Print these pages using your browser's print function (Ctrl+P or Cmd+P).</li>
            <li>For best results, print in color and select "Landscape" orientation.</li>
            <li>Cut along the dashed lines to create individual flashcards.</li>
            <li>Each card has a front (German) and back (English) side with matching numbers.</li>
            <li>The cards are designed to be double-sided. Match the numbers when studying.</li>
        </ol>
    `;
    allCardsContainer.appendChild(instructions);
    
    // Generate all cards for printing
    currentCards.forEach((card, index) => {
        // Create front of card
        const frontCard = document.createElement('div');
        frontCard.className = 'print-card front';
        frontCard.innerHTML = `
            <div class="print-card-title">German</div>
            <div class="print-card-text">${card.front}</div>
            <div class="print-card-number">Card ${index + 1}</div>
        `;
        
        // Create back of card
        const backCard = document.createElement('div');
        backCard.className = 'print-card back';
        
        // Handle plural for nouns
        let pluralHTML = '';
        if (card.plural) {
            const singularWord = card.front.split(' ')[1] || card.front;
            const pluralWord = card.plural.split(' ')[1] || card.plural;
            const pluralRule = determinePluralRule(singularWord, pluralWord);
            
            pluralHTML = `<div class="print-card-plural">
                <p><strong>Plural:</strong> ${card.plural}</p>
                ${pluralRule ? `<p><small><em>Rule: ${pluralRule}</em></small></p>` : ''}
            </div>`;
        }
        
        // Handle usage for modal verbs
        let usageHTML = '';
        if (card.usage) {
            usageHTML = `<div class="print-card-usage">
                <p><strong>Usage:</strong> ${card.usage}</p>
            </div>`;
        }
        
        // Handle separable verbs
        let separableHTML = '';
        if (card.isSeparable) {
            separableHTML = `<div class="print-card-separable">
                <p><strong>Prefix:</strong> ${card.prefix}</p>
                <p><strong>Base Verb:</strong> ${card.baseVerb}</p>
                ${card.note ? `<p><strong>Note:</strong> ${card.note}</p>` : ''}
            </div>`;
        }
        
        let examplesHTML = '';
        if (card.examples && card.examples.length) {
            examplesHTML = '<div class="print-card-examples">';
            card.examples.forEach(example => {
                if (typeof example === 'object') {
                    examplesHTML += `<p>${example.german}</p>`;
                    examplesHTML += `<p><i>${example.english}</i></p>`;
                } else {
                    examplesHTML += `<p>${example}</p>`;
                }
            });
            examplesHTML += '</div>';
        }
        
        // Add conjugation for verbs
        let conjugationHTML = '';
        if (card.conjugation) {
            conjugationHTML = '<div class="print-card-conjugation"><p><strong>Present Tense:</strong></p>';
            for (const [pronoun, form] of Object.entries(card.conjugation)) {
                conjugationHTML += `<p>${pronoun}: ${form}</p>`;
            }
            conjugationHTML += '</div>';
        }
        
        backCard.innerHTML = `
            <div class="print-card-title">English</div>
            <div class="print-card-text">${card.back}</div>
            ${pluralHTML}
            ${usageHTML}
            ${separableHTML}
            ${conjugationHTML}
            ${examplesHTML}
            <div class="print-card-number">Card ${index + 1}</div>
        `;
        
        // Add cards to container
        allCardsContainer.appendChild(frontCard);
        allCardsContainer.appendChild(backCard);
    });
    
    // Open print dialog
    window.print();
}

// Export as PDF (uses browser's print to PDF functionality)
function exportToPdf() {
    if (!currentCards.length) {
        alert('Please select a category and subcategory first.');
        return;
    }
    
    // Prepare cards for printing (same as print function)
    preparePrint();
    
    // Show a message to use Print to PDF option
    alert('To export as PDF, select "Save as PDF" or "Microsoft Print to PDF" in the printer options dialog.');
}

// Show the reading subcategory view with list of texts
function showReadingSubcategoryView() {
    // Create a temporary subcategory view specifically for reading texts
    subcategoryView.innerHTML = '';
    
    // Add back button
    const backButton = document.createElement('button');
    backButton.id = 'back-to-categories';
    backButton.className = 'back-button';
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Categories';
    backButton.addEventListener('click', showCategoryView);
    subcategoryView.appendChild(backButton);
    
    // Get reading texts from the selected subcategory
    const readingTexts = contentData.reading[currentReadingSubcategory];
    
    if (!readingTexts || readingTexts.length === 0) {
        const noTextsMessage = document.createElement('div');
        noTextsMessage.className = 'no-texts-message';
        noTextsMessage.textContent = 'No reading texts available in this category.';
        subcategoryView.appendChild(noTextsMessage);
        showSubcategoryView();
        return;
    }
    
    // Create a card for each reading text
    readingTexts.forEach((text, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'subcategory-card';
        
        // Determine the icon based on the type of text
        let iconClass = 'fa-file-alt';
        if (currentReadingSubcategory === 'advertisementsAndSigns') {
            iconClass = 'fa-sign';
        }
        
        cardDiv.innerHTML = `
            <i class="fas ${iconClass}"></i>
            <h3>${text.title}</h3>
            <div class="category-info">${text.questions.length} questions</div>
        `;
        
        cardDiv.addEventListener('click', () => {
            loadReadingText(index);
        });
        
        subcategoryView.appendChild(cardDiv);
    });
    
    showSubcategoryView();
}

// Import listening functions at the start of the file
import { 
    showListeningSubcategoryView,
    toggleTranscript,
    toggleVocabularyListening,
    checkListeningAnswers,
    loadListeningExercise
} from './listening-functions.js';

// Load and display a reading text
function loadReadingText(textIndex) {
    try {
        const texts = contentData.reading[currentReadingSubcategory];
        if (!texts || textIndex >= texts.length) {
            throw new Error('Reading text not found');
        }
        
        currentReadingText = texts[textIndex];
        
        // Update the reading view with the selected text
        readingTitle.textContent = currentReadingText.title;
        
        // Process text to add vocabulary highlights
        const processedText = processTextWithVocabulary(
            currentReadingText.text, 
            currentReadingText.vocabulary
        );
        readingText.innerHTML = processedText;
        
        // Populate vocabulary panel
        populateVocabularyPanel(currentReadingText.vocabulary);
        
        // Reset vocabulary panel visibility
        vocabularyPanel.classList.add('hidden');
        toggleVocabularyBtn.innerHTML = '<i class="fas fa-book"></i> Show Vocabulary';
        
        // Generate questions
        generateQuestions(currentReadingText.questions);
        
        // Hide previous results
        resultsFeedback.classList.add('hidden');
        
        // Show reading view
        categoryView.classList.add('hidden');
        subcategoryView.classList.add('hidden');
        flashcardView.classList.add('hidden');
        readingView.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading reading text:', error);
        alert('Failed to load reading text. Please try another one.');
    }
}

// Process text to add vocabulary highlighting
function processTextWithVocabulary(text, vocabulary) {
    if (!vocabulary) return text;
    
    let processedText = text;
    
    // Sort keys by length (descending) to replace longer phrases first
    const sortedVocabKeys = Object.keys(vocabulary).sort((a, b) => b.length - a.length);
    
    for (const germanWord of sortedVocabKeys) {
        const englishTranslation = vocabulary[germanWord];
        
        // Create a regular expression that matches the word with word boundaries
        // and is case-insensitive
        const regex = new RegExp(`\\b${germanWord}\\b`, 'gi');
        
        // Replace all occurrences with a span that has the translation as data attribute
        processedText = processedText.replace(regex, 
            `<span class="highlight-word" data-translation="${englishTranslation}">$&</span>`
        );
    }
    
    return processedText;
}

// Populate vocabulary panel
function populateVocabularyPanel(vocabulary) {
    vocabularyList.innerHTML = '';
    
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
        
        vocabularyList.appendChild(vocabItem);
    });
}

// Toggle vocabulary panel visibility
function toggleVocabulary() {
    vocabularyPanel.classList.toggle('hidden');
    
    if (vocabularyPanel.classList.contains('hidden')) {
        toggleVocabularyBtn.innerHTML = '<i class="fas fa-book"></i> Show Vocabulary';
    } else {
        toggleVocabularyBtn.innerHTML = '<i class="fas fa-book"></i> Hide Vocabulary';
    }
}

// Helper function to determine the plural rule
function determinePluralRule(singular, plural) {
    // Remove articles if present
    singular = singular.replace(/^(der|die|das) /, '');
    plural = plural.replace(/^(der|die|das) /, '');
    
    // Handle "no plural" or "always plural" cases
    if (plural === "no plural" || plural.includes("always plural")) {
        return plural;
    }
    
    // Check for no change
    if (singular === plural) {
        return 'Same form in plural (no change)';
    }
    
    // Check for -ung ending (important common pattern)
    if (singular.endsWith('ung') && plural === singular + 'en') {
        return 'Words ending in -ung add -en in plural';
    }
    
    // Check for -e ending
    if (plural === singular + 'e') {
        return 'Add -e to the singular form';
    }
    
    // Check for -er ending
    if (plural === singular + 'er') {
        return 'Add -er to the singular form';
    }
    
    // Check for -n or -en ending
    if (plural === singular + 'n') {
        return 'Add -n to the singular form';
    }
    if (plural === singular + 'en') {
        return 'Add -en to the singular form';
    }
    
    // Check for -s ending
    if (plural === singular + 's') {
        return 'Add -s to the singular form (common for foreign words)';
    }
    
    // Check for -tum → -tümer pattern
    if (singular.endsWith('tum') && plural.includes('tümer')) {
        return 'Words ending in -tum change to -tümer in plural';
    }
    
    // Check for Latin/Greek endings
    if ((singular.endsWith('um') && plural.endsWith('a')) || 
        (singular.endsWith('us') && plural.endsWith('i')) ||
        (singular.endsWith('a') && plural.endsWith('en'))) {
        return 'Special ending for Latin/Greek origin words';
    }
    
    // Check for umlaut changes
    if (plural.includes('ä') && singular.includes('a')) {
        if (plural.endsWith('e') && !singular.endsWith('e')) {
            return 'Change a → ä and add -e';
        }
        if (plural.endsWith('er') && !singular.endsWith('er')) {
            return 'Change a → ä and add -er';
        }
        return 'Change a → ä (umlaut)';
    }
    if (plural.includes('ö') && singular.includes('o')) {
        if (plural.endsWith('e') && !singular.endsWith('e')) {
            return 'Change o → ö and add -e';
        }
        return 'Change o → ö (umlaut)';
    }
    if (plural.includes('ü') && singular.includes('u')) {
        if (plural.endsWith('e') && !singular.endsWith('e')) {
            return 'Change u → ü and add -e';
        }
        return 'Change u → ü (umlaut)';
    }
    
    // Special case for -nen ending (feminine nouns ending in -in)
    if (singular.endsWith('in') && plural.endsWith('innen')) {
        return 'For feminine forms ending in -in, add -nen';
    }
    
    return 'Special plural form';
}

// Generate questions for the reading comprehension
function generateQuestions(questions) {
    readingQuestions.innerHTML = '';
    
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
    
    readingQuestions.appendChild(progressDiv);
    
    // Generate each question
    questions.forEach((question, questionIndex) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'reading-question';
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
            radioInput.name = `question-${questionIndex}`;
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
        readingQuestions.appendChild(questionDiv);
    });
}

// Check answers for reading comprehension questions
function checkAnswers() {
    if (!currentReadingText || !currentReadingText.questions) return;
    
    const questions = currentReadingText.questions;
    let correctAnswers = 0;
    
    // Check each question
    questions.forEach((question, questionIndex) => {
        const selectedOption = document.querySelector(`input[name="question-${questionIndex}"]:checked`);
        const questionDiv = document.querySelector(`.reading-question[data-question-index="${questionIndex}"]`);
        
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
    resultsFeedback.innerHTML = '';
    resultsFeedback.classList.remove('hidden', 'success', 'partial', 'failure');
    
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
        feedbackMessage = `You got ${correctAnswers} out of ${questions.length} questions correct (${percentage}%). Try reading the text again carefully.`;
    }
    
    resultsFeedback.classList.add(feedbackClass);
    resultsFeedback.textContent = feedbackMessage;
    
    // Scroll to the results
    resultsFeedback.scrollIntoView({ behavior: 'smooth' });
}

// Search functionality
function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    if (query.length < 2) {
        searchResultsPanel.classList.add('hidden');
        return;
    }

    const allContent = [];

    // Gather all content from different categories
    for (const category in contentData) {
        if (typeof contentData[category] === 'object') {
            for (const subcategory in contentData[category]) {
                if (Array.isArray(contentData[category][subcategory])) {
                    contentData[category][subcategory].forEach(item => {
                        allContent.push({ ...item, category, subcategory });
                    });
                }
            }
        }
    }

    const results = allContent.filter(item => {
        const german = (item.german || item.front || item.infinitive || '').toLowerCase();
        const english = (item.english || item.back || '').toLowerCase();
        return german.includes(query) || english.includes(query);
    });

    displaySearchResults(results);
}

function displaySearchResults(results) {
    searchResultsList.innerHTML = '';

    if (results.length === 0) {
        searchResultsList.innerHTML = '<div class="result-item no-results"><p>No results found.</p></div>';
    } else {
        results.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            const german = item.german || item.front || item.infinitive;
            const english = item.english || item.back;
            const category = item.category.replace('_', ' ');
            const subcategory = item.subcategory.replace(/([A-Z])/g, ' $1').trim();

            resultItem.innerHTML = `
                <div class="result-content">
                    <h4>${german}</h4>
                    <p>${english}</p>
                </div>
                <div class="result-category">
                    <small>${category} > ${subcategory}</small>
                </div>
            `;
            
            resultItem.addEventListener('click', () => {
                // Navigate to the specific card/item
                handleCategorySelection(item.category, item.category);
                if (contentData[item.category][item.subcategory]) {
                    handleSubcategorySelection(item.subcategory, item.subcategory);
                    
                    const cardIndex = contentData[item.category][item.subcategory].findIndex(i => (i.german || i.front || i.infinitive) === german);
                    if (cardIndex !== -1) {
                        currentCardIndex = cardIndex;
                        displayCard(currentCardIndex);
                    }
                }
                searchResultsPanel.classList.add('hidden');
            });
            searchResultsList.appendChild(resultItem);
        });
    }

    searchResultsPanel.classList.remove('hidden');
}

function showSearchResultsView() {
    // This function is no longer needed as the search results are shown in a panel
}


// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Syllabus functionality for Telc A1 German Flashcards

// Load and initialize syllabus data
async function loadSyllabusData() {
    try {
        const response = await fetch('../content/syllabus_a1.json');
        if (!response.ok) {
            throw new Error(`Failed to load syllabus data. Status: ${response.status}`);
        }
        
        const syllabusData = await response.json();
        return syllabusData;
    } catch (error) {
        console.error('Error loading syllabus data:', error);
        return null;
    }
}

// Add syllabus card to main category view
function addSyllabusCard(categoryView) {
    const syllabusCard = document.createElement('div');
    syllabusCard.className = 'category-card syllabus-card';
    syllabusCard.setAttribute('data-category', 'syllabus');
    
    syllabusCard.innerHTML = `
        <i class="fas fa-graduation-cap"></i>
        <h3>A1 Exam Syllabus</h3>
        <p>Complete syllabus and exam information</p>
        <div class="category-info">
            Study guide for A1 preparation
        </div>
    `;
    
    syllabusCard.addEventListener('click', () => {
        handleSyllabusSelection();
    });
    
    categoryView.appendChild(syllabusCard);
}

// Handle syllabus selection
async function handleSyllabusSelection() {
    // Update breadcrumb
    const categoryBreadcrumb = document.getElementById('category-link');
    categoryBreadcrumb.textContent = 'A1 Exam Syllabus';
    categoryBreadcrumb.classList.remove('hidden');
    
    const subcategoryBreadcrumb = document.getElementById('subcategory-link');
    subcategoryBreadcrumb.classList.add('hidden');
    
    // Hide other views
    const categoryView = document.getElementById('category-view');
    const subcategoryView = document.getElementById('subcategory-view');
    const flashcardView = document.getElementById('flashcard-view');
    const readingView = document.getElementById('reading-view');
    const syllabusView = document.getElementById('syllabus-view');
    
    categoryView.classList.add('hidden');
    subcategoryView.classList.add('hidden');
    flashcardView.classList.add('hidden');
    readingView.classList.add('hidden');
    
    // Load syllabus data
    const syllabusData = await loadSyllabusData();
    if (!syllabusData) {
        alert('Failed to load syllabus data. Please try again later.');
        return;
    }
    
    // Populate syllabus view
    populateSyllabusUnits(syllabusData.syllabus);
    populateExamFormat(syllabusData.examFormat);
    populateResources(syllabusData.resources);
    
    // Show syllabus view
    syllabusView.classList.remove('hidden');
    
    // Set up back button
    const backFromSyllabusBtn = document.getElementById('back-from-syllabus');
    backFromSyllabusBtn.addEventListener('click', () => {
        // Hide syllabus view and show category view
        syllabusView.classList.add('hidden');
        categoryView.classList.remove('hidden');
        
        // Update breadcrumb
        const homeBreadcrumb = document.getElementById('home-link');
        homeBreadcrumb.classList.add('active');
        categoryBreadcrumb.classList.add('hidden');
    });
}

// Populate syllabus units
function populateSyllabusUnits(syllabus) {
    const syllabusUnitsContainer = document.getElementById('syllabus-units');
    syllabusUnitsContainer.innerHTML = '';
    
    syllabus.forEach((unit, index) => {
        const unitDiv = document.createElement('div');
        unitDiv.className = 'syllabus-unit';
        unitDiv.setAttribute('data-unit-index', index);
        
        // Create unit header (clickable to expand)
        const headerDiv = document.createElement('div');
        headerDiv.className = 'unit-header';
        headerDiv.innerHTML = `
            <div class="unit-title">${unit.title}</div>
            <div class="unit-toggle"><i class="fas fa-chevron-down"></i></div>
        `;
        
        // Create unit content (initially collapsed)
        const contentDiv = document.createElement('div');
        contentDiv.className = 'unit-content';
        
        // Add topics section
        if (unit.topics && unit.topics.length) {
            const topicsSection = document.createElement('div');
            topicsSection.className = 'unit-section topics-section';
            
            topicsSection.innerHTML = `
                <h4>Topics</h4>
                <ul>
                    ${unit.topics.map(topic => `<li>${topic}</li>`).join('')}
                </ul>
            `;
            
            contentDiv.appendChild(topicsSection);
        }
        
        // Add grammar section
        if (unit.grammar && unit.grammar.length) {
            const grammarSection = document.createElement('div');
            grammarSection.className = 'unit-section grammar-section';
            
            grammarSection.innerHTML = `
                <h4>Grammar</h4>
                <ul>
                    ${unit.grammar.map(item => `<li>${item}</li>`).join('')}
                </ul>
            `;
            
            contentDiv.appendChild(grammarSection);
        }
        
        // Add click event to expand/collapse
        headerDiv.addEventListener('click', () => {
            unitDiv.classList.toggle('expanded');
            
            // Toggle icon
            const icon = headerDiv.querySelector('.unit-toggle i');
            if (unitDiv.classList.contains('expanded')) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            } else {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        });
        
        unitDiv.appendChild(headerDiv);
        unitDiv.appendChild(contentDiv);
        syllabusUnitsContainer.appendChild(unitDiv);
    });
}

// Populate exam format section
function populateExamFormat(examFormat) {
    const examSectionsContainer = document.getElementById('exam-sections');
    examSectionsContainer.innerHTML = '';
    
    // Add each exam section
    examFormat.sections.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'exam-section';
        
        sectionDiv.innerHTML = `
            <h4>${section.name}</h4>
            <div class="exam-section-details">
                <div class="exam-detail">
                    <span class="detail-label">Duration:</span>
                    <span class="detail-value">${section.duration}</span>
                </div>
                <div class="exam-detail">
                    <span class="detail-label">Parts:</span>
                    <span class="detail-value">${section.parts}</span>
                </div>
                <div class="exam-detail">
                    <span class="detail-label">Max Points:</span>
                    <span class="detail-value">${section.maximumPoints}</span>
                </div>
                <div class="exam-detail description">
                    <span class="detail-value">${section.description}</span>
                </div>
            </div>
        `;
        
        examSectionsContainer.appendChild(sectionDiv);
    });
    
    // Add passing score information
    const passingScoreDiv = document.createElement('div');
    passingScoreDiv.className = 'exam-passing-score';
    passingScoreDiv.innerHTML = `
        <i class="fas fa-check-circle"></i> Passing Score: ${examFormat.passingScore}
    `;
    
    examSectionsContainer.appendChild(passingScoreDiv);
}

// Populate resources section
function populateResources(resources) {
    const resourcesContainer = document.getElementById('resources-list');
    resourcesContainer.innerHTML = '';
    
    resources.forEach(resource => {
        const resourceDiv = document.createElement('div');
        resourceDiv.className = 'resource-item';
        
        let resourceContent = `
            <div class="resource-type">${resource.type}</div>
            <div class="resource-title">${resource.title}</div>
        `;
        
        if (resource.publisher) {
            resourceContent += `<div class="resource-publisher">${resource.publisher}</div>`;
        }
        
        if (resource.url) {
            resourceContent += `
                <div class="resource-url">
                    <a href="${resource.url}" target="_blank">
                        <i class="fas fa-external-link-alt"></i> Visit
                    </a>
                </div>
            `;
        }
        
        resourceDiv.innerHTML = resourceContent;
        resourcesContainer.appendChild(resourceDiv);
    });
}

// Export functions to make them available to main script
export { loadSyllabusData, addSyllabusCard, handleSyllabusSelection };

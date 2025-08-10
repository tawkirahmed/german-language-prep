// Helper to get correct content path for local and GitHub Pages
function getContentPath(filename) {
    // If running on GitHub Pages, the repo name is in the path
    const repo = 'german-language-prep';
    const isGithubPages = window.location.hostname.endsWith('github.io') && window.location.pathname.includes(repo);
    const base = isGithubPages ? `/${repo}/content/` : 'content/';
    return base + filename;
}
export class ComprehensiveView {
    constructor() {
        this.container = document.getElementById('comprehensive-view');
        this.contentArea = this.container.querySelector('.content-area');
        this.sidebar = this.container.querySelector('.sidebar');
        this.sidebarNav = this.container.querySelector('.sidebar-nav');
        this.currentSection = null;
        this.data = {};


        // Add sidebar toggle button for mobile
        this.sidebarToggleBtn = document.createElement('button');
        this.sidebarToggleBtn.className = 'sidebar-toggle';
        this.sidebarToggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        this.sidebarToggleBtn.setAttribute('aria-label', 'Open navigation menu');
        this.container.insertBefore(this.sidebarToggleBtn, this.sidebar);

        // Add overlay for sidebar
        this.sidebarOverlay = document.createElement('div');
        this.sidebarOverlay.className = 'sidebar-overlay';
        this.sidebarOverlay.style.display = 'none';
        this.sidebarOverlay.style.position = 'fixed';
        this.sidebarOverlay.style.top = '0';
        this.sidebarOverlay.style.left = '0';
        this.sidebarOverlay.style.width = '100vw';
        this.sidebarOverlay.style.height = '100vh';
        this.sidebarOverlay.style.background = 'rgba(0,0,0,0.18)';
        this.sidebarOverlay.style.zIndex = '999';
        this.sidebarOverlay.style.transition = 'opacity 0.2s';
        this.sidebarOverlay.style.pointerEvents = 'auto';
        this.sidebarOverlay.style.touchAction = 'none';
        this.container.appendChild(this.sidebarOverlay);

        this.initializeEventListeners();
    }

    async initialize() {
        // Load all data
        await this.loadAllData();
        this.renderSidebar();
        this.showSection('vocabulary'); // Default section
    }

    async loadAllData() {
        const files = [
            'vocabulary.json',
            'grammar.json',
            'phrases.json',
            'irregular_verbs.json'
        ];

        // Load each file independently so one failure doesn't break the rest
        for (const file of files) {
            try {
                const res = await fetch(getContentPath(file));
                if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
                const data = await res.json();
                this.data[file.replace('.json', '')] = data;
            } catch (err) {
                console.error(`Failed to load ${file}:`, err);
            }
        }
    }

    renderSidebar() {
        const formatTitle = (key) => key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());

        const phraseKeys = Object.keys(this.data.phrases || {});
        const excludedPhraseKeys = new Set(['verbs', 'questionWords', 'time', 'grammar']);
        const phraseSubsections = phraseKeys
            .filter(k => !excludedPhraseKeys.has(k))
            .map(key => ({ id: key, title: formatTitle(key) }));

        const sections = [
            { 
                id: 'vocabulary',
                title: 'Vocabulary',
                subsections: Object.keys(this.data.vocabulary || {}).map(key => ({
                    id: key,
                    title: formatTitle(key)
                }))
            },
            { 
                id: 'grammar',
                title: 'Grammar',
                subsections: Object.keys(this.data.grammar || {}).map(key => ({
                    id: key,
                    title: formatTitle(key)
                }))
            },
            {
                id: 'verbs',
                title: 'Verbs',
                subsections: Object.keys((this.data.phrases && this.data.phrases.verbs) || {}).map(key => ({
                    id: key,
                    title: formatTitle(key)
                }))
            },
            {
                id: 'questions',
                title: 'Questions',
                subsections: (() => {
                    const q = (this.data.phrases && this.data.phrases.questionWords) || {};
                    const subs = [];
                    if (q.basicQuestions) subs.push({ id: 'questionWords', title: 'Question Words' });
                    if (q.yesNoQuestions) subs.push({ id: 'yesNoQuestions', title: 'Yes/No Questions' });
                    if (q.negativeQuestions) subs.push({ id: 'negativeQuestions', title: 'Negative Questions' });
                    return subs;
                })()
            },
            {
                id: 'time',
                title: 'Time',
                subsections: Object.keys((this.data.phrases && this.data.phrases.time) || {}).map(key => ({
                    id: key,
                    title: formatTitle(key)
                }))
            },
            { 
                id: 'phrases',
                title: 'Phrases',
                subsections: phraseSubsections
            }
            // Removed separate 'Irregular Verbs' section; verbs now consolidated
        ];

        this.sidebarNav.innerHTML = sections.map(section => `
            <li class="sidebar-section">
                <a href="#" data-section="${section.id}" class="sidebar-link">
                    ${section.title}
                </a>
                ${section.subsections.length ? `
                    <div class="sidebar-subsections" data-parent="${section.id}">
                        ${section.subsections.map(sub => `
                            <a href="#" data-section="${section.id}" 
                               data-subsection="${sub.id}" 
                               class="sidebar-sublink">
                                ${sub.title}
                            </a>
                        `).join('')}
                    </div>
                ` : ''}
            </li>
        `).join('');
    }

    showSection(sectionId, subsectionId) {
        const data = this.getSectionData(sectionId);
        if (!data) return;

        let content;
        if (subsectionId) {
            // Show specific subsection
            content = `
                <div class="content-section">
                    <h2>${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}</h2>
                    ${this.renderSectionContent(sectionId, data, subsectionId)}
                </div>
            `;
        } else {
            // Show all subsections
            content = `
                <div class="content-section">
                    <h2>${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}</h2>
                    ${this.renderSectionContent(sectionId, data)}
                </div>
            `;
        }

        this.contentArea.innerHTML = content;
        this.currentSection = sectionId;
    }

    getSectionData(sectionId) {
        switch (sectionId) {
            case 'vocabulary':
                return this.data.vocabulary;
            case 'grammar':
                return this.data.grammar;
            case 'phrases':
                return this.data.phrases;
            case 'verbs':
                return (this.data.phrases && this.data.phrases.verbs) || {};
            case 'questions':
                return (this.data.phrases && this.data.phrases.questionWords) || {};
            case 'time':
                return (this.data.phrases && this.data.phrases.time) || {};
            case 'irregular_verbs':
                return this.data.irregular_verbs; // kept for backward compatibility (not shown in sidebar)
            default:
                return null;
        }
    }

    renderSectionContent(sectionId, data, subsectionId) {
        switch (sectionId) {
            case 'vocabulary':
                return this.renderVocabulary(subsectionId ? { [subsectionId]: data[subsectionId] } : data);
            case 'grammar':
                return this.renderGrammar(subsectionId ? { [subsectionId]: data[subsectionId] } : data);
            case 'phrases': {
                // filter out non-phrase categories
                const filtered = this.filterPhrasesData(data);
                return this.renderPhrases(subsectionId ? { [subsectionId]: filtered[subsectionId] } : filtered);
            }
            case 'verbs':
                return this.renderVerbs(data, subsectionId);
            case 'questions':
                return this.renderQuestions(data, subsectionId);
            case 'time':
                return this.renderTime(data, subsectionId);
            case 'irregular_verbs':
                return this.renderIrregularVerbs(data);
            default:
                return '';
        }
    }

    renderVocabulary(data) {
        return Object.entries(data).map(([category, items]) => {
            // Format the category name for display
            const displayCategory = category
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());

            return `
                <div class="subcategory-section">
                    <h3>${displayCategory}</h3>
                    <div class="items">
                        ${items.map(item => `
                            <div class="item">
                                <div class="item-header">
                                    <span class="item-title">${item.german}</span>
                                    <span class="item-translation">${item.english}</span>
                                </div>
                                ${item.examples ? `
                                    <div class="item-examples">
                                        ${Array.isArray(item.examples) ? 
                                            item.examples.map(example => {
                                                if (typeof example === 'object') {
                                                    return `
                                                        <div class="example-item">
                                                            <span class="example-german">${example.german}</span>
                                                            <span class="example-english">${example.english}</span>
                                                        </div>
                                                    `;
                                                } else {
                                                    return `
                                                        <div class="example-item">
                                                            <span class="example-german">${example}</span>
                                                        </div>
                                                    `;
                                                }
                                            }).join('') : 
                                            `<div class="example-item">
                                                <span class="example-german">${item.examples}</span>
                                            </div>`
                                        }
                                    </div>
                                ` : ''}
                                ${item.plural ? `
                                    <div class="item-plural">
                                        <strong>Plural:</strong> ${item.plural}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderGrammar(data) {
        // Check if data is an object
        if (typeof data === 'object' && !Array.isArray(data)) {
            return Object.entries(data).map(([category, items]) => {
                const displayCategory = category
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase());
                
                return `
                    <div class="subcategory-section">
                        <h3>${displayCategory}</h3>
                        <div class="items">
                            ${Array.isArray(items) ? items.map(item => `
                                <div class="item">
                                    <div class="item-header">
                                        ${item.topic ? `<h4 class="item-title">${item.topic}</h4>` : ''}
                                        ${item.rule ? `<div class="item-rule">${item.rule}</div>` : ''}
                                    </div>
                                    ${item.explanation ? `
                                        <div class="item-explanation">
                                            ${item.explanation}
                                        </div>
                                    ` : ''}
                                    ${item.examples ? `
                                        <div class="item-examples">
                                            <strong>Examples:</strong>
                                            <ul>
                                                ${Array.isArray(item.examples) ? 
                                                    item.examples.map(ex => {
                                                        if (typeof ex === 'object') {
                                                            return `<li>
                                                                <span class="example-german">${ex.german}</span>
                                                                <span class="example-english">${ex.english}</span>
                                                            </li>`;
                                                        }
                                                        return `<li>${ex}</li>`;
                                                    }).join('') : 
                                                    `<li>${item.examples}</li>`
                                                }
                                            </ul>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('') : `
                                <div class="item">
                                    <div class="item-content">${items}</div>
                                </div>
                            `}
                        </div>
                    </div>
                `;
            }).join('');
        } else if (Array.isArray(data)) {
            // Handle array data structure
            return `
                <div class="subcategory-section">
                    <div class="items">
                        ${data.map(item => `
                            <div class="item">
                                <div class="item-header">
                                    ${item.topic ? `<h4 class="item-title">${item.topic}</h4>` : ''}
                                    ${item.rule ? `<div class="item-rule">${item.rule}</div>` : ''}
                                </div>
                                ${item.explanation ? `
                                    <div class="item-explanation">
                                        ${item.explanation}
                                    </div>
                                ` : ''}
                                ${item.examples ? `
                                    <div class="item-examples">
                                        <strong>Examples:</strong>
                                        <ul>
                                            ${Array.isArray(item.examples) ? 
                                                item.examples.map(ex => {
                                                    if (typeof ex === 'object') {
                                                        return `<li>
                                                            <span class="example-german">${ex.german}</span>
                                                            <span class="example-english">${ex.english}</span>
                                                        </li>`;
                                                    }
                                                    return `<li>${ex}</li>`;
                                                }).join('') : 
                                                `<li>${item.examples}</li>`
                                            }
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        // Handle unexpected data format
        return `
            <div class="error-message">
                <p>Unable to display grammar content. Invalid data format.</p>
            </div>
        `;
    }

    filterPhrasesData(data) {
        const excluded = new Set(['verbs', 'questionWords', 'time', 'grammar']);
        return Object.fromEntries(Object.entries(data).filter(([k]) => !excluded.has(k)));
    }

    renderPhrases(data) {
        const formatTitle = (t) => t.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
        return Object.entries(data).map(([category, phrases]) => `
            <div class="category">
                <h3>${formatTitle(category)}</h3>
                <div class="items">
                    ${Array.isArray(phrases) ? phrases.map(phrase => `
                        <div class="item">
                            <div class="item-header">
                                <strong class="item-title">${phrase.german}</strong> 
                                <span class="item-translation">${phrase.english || ''}</span>
                            </div>
                            ${phrase.examples ? `
                                <div class="item-examples">
                                    ${phrase.examples.map(ex => `
                                        <div class="example-item">
                                            <span class="example-german">${ex.german}</span>
                                            <span class="example-english">${ex.english}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('') : `<div class="item">No data</div>`}
                </div>
            </div>
        `).join('');
    }

    renderVerbs(verbsData, subsectionId) {
        const renderVerbList = (list, heading) => `
            <div class="subcategory-section">
                <h3>${heading}</h3>
                <div class="items">
                    ${list.map(verb => `
                        <div class="item">
                            <div class="item-header">
                                <div class="item-title">${verb.infinitive}</div>
                                <div class="item-translation">${verb.english || ''}</div>
                            </div>
                            ${verb.present ? `
                                <div class="verb-conjugation">
                                    <h4>Present Tense</h4>
                                    <div class="conjugation-grid">
                                        ${Object.entries(verb.present).map(([pronoun, form]) => `
                                            <div class="conjugation-item">
                                                <span class="pronoun">${pronoun}:</span>
                                                <span class="form">${form}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            ${verb.examples ? `
                                <div class="item-examples">
                                    <h4>Examples</h4>
                                    ${verb.examples.map(example => `
                                        <div class="example-item">
                                            <span class="example-german">${example.german}</span>
                                            <span class="example-english">${example.english}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Merge irregular & modal verbs from phrases + separate file if present
        const irregularFromPhrases = verbsData.irregularVerbs || [];
        const modalFromPhrases = verbsData.modalVerbs || [];
        const irregularFromFile = (this.data.irregular_verbs && this.data.irregular_verbs.irregularVerbs) || [];
        const modalFromFile = (this.data.irregular_verbs && this.data.irregular_verbs.modalVerbs) || [];
        const irregularCombined = [...irregularFromPhrases, ...irregularFromFile];
        const modalCombined = [...modalFromPhrases, ...modalFromFile];

        if (subsectionId) {
            if (subsectionId === 'regularVerbs') return renderVerbList(verbsData.regularVerbs || [], 'Regular Verbs');
            if (subsectionId === 'irregularVerbs') return renderVerbList(irregularCombined, 'Irregular Verbs');
            if (subsectionId === 'modalVerbs') return renderVerbList(modalCombined, 'Modal Verbs');
        }

        // Show all subsections
        return [
            renderVerbList(verbsData.regularVerbs || [], 'Regular Verbs'),
            renderVerbList(irregularCombined, 'Irregular Verbs'),
            renderVerbList(modalCombined, 'Modal Verbs')
        ].join('');
    }

    renderQuestions(data, subsectionId) {
        const renderQuestionWordsTable = (basic) => `
            <div class="subcategory-section">
                <h3>Question Words</h3>
                <div class="responsive-table">
                    <table class="question-word-table">
                        <thead>
                            <tr>
                                <th>Word</th>
                                <th>Meaning</th>
                                <th>Example (DE)</th>
                                <th>Example (EN)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${basic.map(row => row.examples && row.examples.length ? row.examples.slice(0, 2).map(ex => `
                                <tr>
                                    <td class="question-word">${row.word}</td>
                                    <td>${row.english}</td>
                                    <td class="question-example">${ex.german}</td>
                                    <td class="question-example">${ex.english}</td>
                                </tr>
                            `).join('') : `
                                <tr>
                                    <td class="question-word">${row.word}</td>
                                    <td>${row.english}</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        const renderYesNo = (yn) => `
            <div class="subcategory-section">
                <h3>Yes/No Questions</h3>
                <div class="yes-no-grid">
                    ${yn.map(q => `
                        <div class="yes-no-card">
                            <div class="yes-no-question">${q.german}</div>
                            <div class="item-translation">${q.english || ''}</div>
                            ${q.response ? `
                                <div class="yes-no-answers">
                                    <div class="answer-positive"><strong>Yes:</strong> ${q.response.positive}</div>
                                    <div class="answer-negative"><strong>No:</strong> ${q.response.negative}</div>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const renderNegativeQuestions = (neg) => `
            <div class="subcategory-section">
                <h3>Negative Questions & 'Doch'</h3>
                <div class="items">
                    ${neg.map(item => `
                        <div class="item">
                            ${item.rule ? `
                            <div class="item-header">
                                <h4 class="item-title">${item.rule}</h4>
                            </div>
                            ` : ''}
                            ${item.explanation ? `
                            <div class="item-explanation">
                                ${item.explanation}
                            </div>
                            ` : ''}
                            <div class="item-examples">
                                ${item.examples.map(ex => `
                                    <div class="example-item">
                                        <span class="example-german">${ex.german}</span>
                                        <span class="example-english">${ex.english}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const basic = data.basicQuestions || [];
        const yn = data.yesNoQuestions || [];
        const neg = data.negativeQuestions || [];

        if (subsectionId === 'questionWords') return renderQuestionWordsTable(basic);
        if (subsectionId === 'yesNoQuestions') return renderYesNo(yn);
        if (subsectionId === 'negativeQuestions') return renderNegativeQuestions(neg);

        return renderQuestionWordsTable(basic) + renderYesNo(yn) + renderNegativeQuestions(neg);
    }

    renderTime(data, subsectionId) {
        const renderOfficial = (list) => `
            <div class="subcategory-section">
                <h3>Official Time</h3>
                <div class="items">
                    ${list.map(item => `
                        <div class="item">
                            <div class="item-header">
                                <span class="item-title">${item.german}</span>
                                <span class="item-translation">${item.english}</span>
                            </div>
                            ${item.unofficial ? `<div class="muted">Unofficial: ${item.unofficial}</div>` : ''}
                            ${Array.isArray(item.examples) ? `
                                <div class="item-examples">
                                    ${item.examples.map(ex => `
                                        <div class="example-item">
                                            <span class="example-german">${ex.german}</span>
                                            <span class="example-english">${ex.english}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const renderUnofficial = (list) => `
            <div class="subcategory-section">
                <h3>Unofficial Time</h3>
                <div class="items">
                    ${list.map(item => `
                        <div class="item">
                            <div class="item-header">
                                <span class="item-title">${item.german}</span>
                                <span class="item-translation">${item.english}</span>
                            </div>
                            ${item.official ? `<div class="muted">Official: ${item.official}</div>` : ''}
                            ${Array.isArray(item.examples) ? `
                                <div class="item-examples">
                                    ${item.examples.map(ex => `
                                        <div class="example-item">
                                            <span class="example-german">${ex.german}</span>
                                            <span class="example-english">${ex.english}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const renderExpressions = (list) => `
            <div class="subcategory-section">
                <h3>Time Expressions</h3>
                <div class="items">
                    ${list.map(item => `
                        <div class="item">
                            <div class="item-header">
                                <span class="item-title">${item.german}</span>
                                <span class="item-translation">${item.english}</span>
                            </div>
                            ${Array.isArray(item.examples) ? `
                                <div class="item-examples">
                                    ${item.examples.map(ex => `
                                        <div class="example-item">
                                            <span class="example-german">${ex.german}</span>
                                            <span class="example-english">${ex.english}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const official = data.officialTime || [];
        const unofficial = data.unofficialTime || [];
        const expressions = data.timeExpressions || [];

        if (subsectionId === 'officialTime') return renderOfficial(official);
        if (subsectionId === 'unofficialTime') return renderUnofficial(unofficial);
        if (subsectionId === 'timeExpressions') return renderExpressions(expressions);

        return renderOfficial(official) + renderUnofficial(unofficial) + renderExpressions(expressions);
    }

    renderIrregularVerbs(data) {
        // Check if data is in the correct format
        const verbs = data.irregularVerbs || [];
        
        return `
            <div class="subcategory-section">
                <div class="items">
                    ${verbs.map(verb => `
                        <div class="item">
                            <div class="item-header">
                                <div class="item-title">${verb.infinitive}</div>
                                <div class="item-translation">${verb.english}</div>
                            </div>
                            
                            <div class="verb-conjugation">
                                <h4>Present Tense:</h4>
                                <div class="conjugation-grid">
                                    ${Object.entries(verb.present).map(([pronoun, form]) => `
                                        <div class="conjugation-item">
                                            <span class="pronoun">${pronoun}:</span>
                                            <span class="form">${form}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            ${verb.examples ? `
                                <div class="item-examples">
                                    <h4>Examples:</h4>
                                    ${verb.examples.map(example => `
                                        <div class="example-item">
                                            <span class="example-german">${example.german}</span>
                                            <span class="example-english">${example.english}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    initializeEventListeners() {
        // Sidebar nav click
        this.sidebarNav.addEventListener('click', (e) => {
            const link = e.target.closest('.sidebar-link, .sidebar-sublink');
            if (!link) return;

            e.preventDefault();

            if (link.classList.contains('sidebar-link')) {
                // Handle main section click
                const section = link.closest('.sidebar-section');
                const subsections = section.querySelector('.sidebar-subsections');

                // Toggle subsections visibility
                if (subsections) {
                    this.sidebarNav.querySelectorAll('.sidebar-section').forEach(s => {
                        if (s !== section) s.classList.remove('expanded');
                    });
                    section.classList.toggle('expanded');
                }

                // Always show section content (even if subsections exist)
                this.showSection(link.dataset.section);

                // Do NOT close sidebar on mobile for main section click
                // Only overlay or outside click should close sidebar
            } else if (link.classList.contains('sidebar-sublink')) {
                // Handle subsection click
                this.showSection(link.dataset.section, link.dataset.subsection);
                // Do NOT close sidebar on mobile for subsection click
            }

            // Update active states
            this.sidebarNav.querySelectorAll('.sidebar-link, .sidebar-sublink').forEach(l => {
                l.classList.remove('active');
            });
            link.classList.add('active');
        });

        // Sidebar toggle button click
        this.sidebarToggleBtn.addEventListener('click', () => {
            this.sidebar.classList.toggle('open');
            if (this.sidebar.classList.contains('open')) {
                this.sidebarOverlay.style.display = 'block';
            } else {
                this.sidebarOverlay.style.display = 'none';
            }
        });

        // Overlay click closes sidebar
        this.sidebarOverlay.addEventListener('click', () => {
            this.sidebar.classList.remove('open');
            this.sidebarOverlay.style.display = 'none';
        });

        // Close sidebar when clicking outside (mobile only)
        document.addEventListener('click', (e) => {
            if (window.innerWidth > 900) return;
            if (!this.sidebar.contains(e.target) && !this.sidebarToggleBtn.contains(e.target) && !this.sidebarOverlay.contains(e.target)) {
                this.sidebar.classList.remove('open');
                this.sidebarOverlay.style.display = 'none';
            }
        });

        // Responsive: close sidebar on resize if desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 900) {
                this.sidebar.classList.remove('open');
                this.sidebarOverlay.style.display = 'none';
            }
        });
    }
}

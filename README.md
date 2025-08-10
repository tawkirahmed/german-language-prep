# Telc A1 German Flashcards

This is a comprehensive set of flashcards for studying German at the A1 level, specifically designed for the Telc A1 exam. The flashcards cover all the essential vocabulary, grammar, irregular verbs, common phrases, and reading practice texts required for the exam.

## Contents

This project includes:

1. **Vocabulary Flashcards**: Organized by themes (greetings, numbers, colors, food, time, transportation, etc.)
2. **Grammar Rules**: All grammar rules required for A1 level
3. **Irregular Verbs**: Complete list of irregular verbs required at A1 level with conjugations
4. **Common Phrases**: Useful phrases for exam situations and daily conversations
5. **Reading Practice**: Short texts and advertisements with comprehension questions and vocabulary
6. **Listening Practice**: Audio exercises with transcripts, vocabulary, and comprehension questions

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- An internet connection (only for initial loading)

### Installation

1. Clone or download this repository to your local machine
2. No installation required - it's a standalone web application

### Running the Application

Due to browser security restrictions (CORS policy), you need to run the application through a web server:

#### Option 1: Using Python (recommended)

1. Open your terminal/command prompt
2. Navigate to the project directory (`/Users/tfakir/personal/telca1`)
3. Run one of these commands (depending on your Python version):

   ```bash
   python -m http.server 8000
   # OR 
   python3 -m http.server 8000
   ```

4. Open your browser and navigate to: `http://localhost:8000/app/`

#### Option 2: Using any web server

1. Host the files on any web server of your choice (Apache, Nginx, etc.)
2. Access the application through the appropriate URL

#### Using the Application

1. Select a category and subcategory from the dropdown menus
2. Navigate through the flashcards using the "Previous" and "Next" buttons
3. Click the "Flip Card" button to see the translation and examples
4. For reading practice, select the Reading category and choose a text to practice comprehension

## Features

- **Interactive Flashcards**: Click to flip cards and see translations
- **Organized Content**: Content is organized by categories and subcategories for targeted learning
- **Print Functionality**: Print flashcards for offline study
- **Export to PDF**: Save flashcards as a PDF for digital study
- **Responsive Design**: Works on desktop and mobile devices
- **Reading Practice**: Interactive reading texts with highlighted vocabulary and comprehension questions
- **Listening Practice**: Audio exercises with transcripts, vocabulary, and comprehension questions

## Printing Instructions

1. Select a category and subcategory
2. Click the "Print Cards" button
3. The application will generate printable flashcards with front (German) and back (English) sides
4. Use your browser's print function (Ctrl+P or Cmd+P) to print the cards
5. For best results, print in color and select "Landscape" orientation
6. Cut along the dashed lines to create individual flashcards

## Exporting as PDF

1. Select a category and subcategory
2. Click the "Export as PDF" button
3. In the print dialog, select "Save as PDF" or "Microsoft Print to PDF" as your printer
4. Save the PDF to your preferred location

## Project Structure

```text
telca1/
├── app/
│   ├── css/
│   │   ├── styles.css       # Main CSS styles
│   │   └── print.css        # Print-specific CSS
│   ├── js/
│   │   ├── flashcards.js    # JavaScript for flashcard functionality
│   │   └── listening-functions.js # JavaScript for listening functionality
│   └── index.html           # Main HTML file
└── content/
    ├── vocabulary.json      # Vocabulary flashcard content
    ├── grammar.json         # Grammar rules content
    ├── irregular_verbs.json # Irregular verbs content
    ├── phrases.json         # Common phrases content
    ├── reading.json         # Reading practice texts content
    └── listening.json       # Listening practice content
```

## Content Details

### Vocabulary Categories

- Greetings and introductions
- Numbers
- Colors
- Family
- Food
- Time expressions
- Transportation
- Housing
- Weather
- Shopping
- Clothing
- Health
- Professions

### Grammar Topics

- Personal pronouns
- Articles (definite and indefinite)
- Plural forms
- Verb conjugation in present tense
- Modal verbs
- Cases (Nominative and Accusative)
- Sentence structure
- Negation
- Possessive pronouns
- Prepositions
- Conjunctions
- Time expressions

### Common Phrases for

- Introductions
- Asking questions
- Shopping
- Restaurants
- Directions
- Transportation
- Accommodation
- Emergencies
- Small talk
- Phone conversations
- Exam situations

### Reading Practice

- Short texts about everyday topics
- Advertisements and signs
- Comprehension questions
- Interactive vocabulary highlighting
- Instant feedback on answers

### Listening Practice

- Basic dialogues for everyday situations
- Phone conversations
- Public announcements
- Weather reports
- Audio playback with transcript options
- Vocabulary support
- Comprehension questions with instant feedback

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Content is based on the official Telc A1 German exam curriculum
- Designed for language learners by language learners

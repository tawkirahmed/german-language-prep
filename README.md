
# Telc A1 German Language Prep

An interactive, browser-based study tool for the Telc A1 German exam. Includes flashcards, grammar, phrases, reading, listening, and syllabus—all in one app.

## Features
- Flashcards for vocabulary, grammar, verbs, and phrases
- Reading and listening practice with comprehension and vocabulary support
- Syllabus and exam info
- Print and PDF export
- Works locally or on GitHub Pages (dynamic asset loading)

## Usage
**Online:**
- Visit: `https://tawkirahmed.github.io/german-language-prep/`

**Local:**
1. Clone this repo
2. Run a static server in the project root (e.g. `python3 -m http.server`)
3. Open `http://localhost:8000/docs/` in your browser

## Project Structure
```
docs/
  index.html
  js/
    flashcards.js
    comprehensive-view.js
    syllabus.js
    ...
  css/
    styles.css
    ...
  audio/
    *.mp3
  content/
    vocabulary.json
    grammar.json
    ...
```

## Notes
- All content and assets are in `/docs` for GitHub Pages compatibility
- Asset paths are handled automatically for both local and deployed use
- No build step or dependencies required

## License
MIT

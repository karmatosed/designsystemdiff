# Design System Comparison Tool

A minimal, clean comparison tool for open source design systems, inspired by the UX Tools database design aesthetic.

## Features

- **Pure vanilla stack**: HTML, CSS, and JavaScript (no frameworks, no build tools)
- **Responsive design**: Works seamlessly on desktop and mobile
- **Interactive filtering**: Filter by framework, license, and maintainer
- **Real-time search**: Search by name or maintainer
- **Sortable columns**: Click any column header to sort
- **Clean UI**: Minimal design inspired by uxtools.co

## Project Structure

```
├── data/
│   └── systems.json          # Design system data
├── css/
│   └── styles.css            # All styles (CSS Grid/Flexbox)
├── js/
│   └── app.js                # Vanilla JavaScript
└── index.html                # Main page
```

## Getting Started

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/karmatosed/desginsystemdiff.com.git
cd desginsystemdiff.com
```

2. Serve the files locally using any static server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (npx)
npx serve

# Using PHP
php -S localhost:8000
```

3. Open your browser to `http://localhost:8000`

### Deployment

This project is static and can be deployed to any static hosting service:

- **GitHub Pages**: Push to `gh-pages` branch or use GitHub Actions
- **Netlify**: Drag and drop the folder or connect your repo
- **Cloudflare Pages**: Connect your repo and deploy
- **Vercel**: Import your Git repository

No build step required!

## Data Structure

Each design system in `data/systems.json` includes:

- Basic info: name, logo, maintainer
- Licensing: license type
- Technical: supported frameworks, component count
- Resources: GitHub URL, docs, demo/Storybook
- Metrics: GitHub stars, last updated
- Capabilities: accessibility support, theming, maturity level

## Adding New Design Systems

Edit `data/systems.json` and add a new entry:

```json
{
  "id": "unique-id",
  "name": "Design System Name",
  "maintainer": "Company/Person",
  "license": "MIT",
  "frameworks": ["React", "Vue"],
  "componentCount": 50,
  "githubUrl": "https://github.com/...",
  "githubStars": 1000,
  "docsUrl": "https://...",
  "demoUrl": "https://...",
  "lastUpdated": "2025-01",
  "accessibility": "WCAG 2.1 AA",
  "theming": "Advanced",
  "maturity": "Stable"
}
```

## Code Stats

- **Total lines**: ~585 (excluding JSON data)
- **HTML**: 78 lines
- **CSS**: 281 lines
- **JavaScript**: 226 lines
- **No dependencies**: Zero npm packages, zero build tools

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - feel free to use and modify for your own projects.

## Contributing

Contributions welcome! Feel free to:
- Add more design systems to the database
- Improve the UI/UX
- Add new features (tags, ratings, etc.)
- Fix bugs or enhance performance

## Acknowledgments

Design inspiration from [UX Tools](https://uxtools.co)
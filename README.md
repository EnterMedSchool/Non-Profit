# EnterMedSchool.org

**Free, open-source medical education resources for educators worldwide.**

[EnterMedSchool.org](https://entermedschool.org) is a non-profit platform that provides 500+ free resources — question banks, video assets, PDF textbooks, anatomy visuals, interactive tools, and embeddable widgets — all designed for medical educators and students. No paywalls, no subscriptions.

> **Sister project of [entermedschool.com](https://entermedschool.com)**
> The `.com` platform offers paid courses and preparation materials. Revenue from `.com` directly funds this `.org` project, keeping every resource here completely free.

---

## What We Offer

| Category | Description |
|---|---|
| **Question Banks** | Exam-style MCQs across anatomy, physiology, biochemistry, pharmacology, and more |
| **Video Assets** | Lecture-ready video clips for classroom and online teaching |
| **PDF Textbooks** | Downloadable handouts and textbook chapters |
| **Visual Assets** | Anatomy diagrams, clinical visuals, and educational illustrations |
| **Interactive Tools** | MCQ Maker, Flashcard Maker, Illustration Maker, LaTeX Editor, BMI Calculator |
| **Clinical Semiotics** | Interactive clinical examination video chains |
| **Embeddable Resources** | All tools and visuals can be embedded in your website or LMS via iframe |
| **Teaching Resources** | Templates, guides, and assets specifically for professors |

---

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 16 (App Router, Turbopack)
- **UI:** [React](https://react.dev/) 19, [Tailwind CSS](https://tailwindcss.com/) 3
- **Language:** [TypeScript](https://www.typescriptlang.org/) 5
- **Internationalization:** [next-intl](https://next-intl.dev/)
- **Code Editor:** [CodeMirror](https://codemirror.net/) 6
- **Canvas/Illustrations:** [Fabric.js](http://fabricjs.com/) 7
- **LaTeX Rendering:** [LaTeX.js](https://latex.js.org/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Analytics:** [Plausible](https://plausible.io/) (privacy-friendly, optional)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/enterMedSchool/Non-Profit.git
cd Non-Profit

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start the development server
pnpm dev
```

The site will be available at `http://localhost:3000`.

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL of this site | `http://localhost:3000` |
| `NEXT_PUBLIC_MAIN_SITE_URL` | URL of the main entermedschool.com site | `https://entermedschool.com` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible analytics domain (optional) | — |
| `NEXT_PUBLIC_PLAUSIBLE_API` | Plausible analytics API endpoint (optional) | — |

### Available Scripts

```bash
pnpm dev       # Start dev server with Turbopack
pnpm build     # Build for production
pnpm start     # Start production server
pnpm lint      # Run ESLint
```

---

## Project Structure

```
Non-Profit/
├── app/                    # Next.js App Router pages
│   ├── [locale]/           # Locale-based routing (i18n)
│   │   ├── about/          # About page
│   │   ├── calculators/    # Medical calculators
│   │   ├── clinical-semiotics/  # Clinical exam video chains
│   │   ├── for-professors/ # Teaching resources hub
│   │   ├── for-students/   # Student resources
│   │   ├── license/        # License & attribution page
│   │   ├── resources/      # Resource archive (PDFs, videos, visuals, questions)
│   │   └── tools/          # Interactive tools
│   └── embed/              # Embeddable widget routes
├── components/             # React components
│   ├── clinical-semiotics/ # Clinical semiotics player
│   ├── embed/              # Embed viewers
│   ├── home/               # Homepage sections
│   ├── layout/             # Navbar, Footer, Breadcrumbs, Search
│   ├── license/            # Badge generator, FAQ
│   ├── pdf-viewer/         # PDF reader components
│   ├── professors/         # Professor hub components
│   ├── resources/          # Resource cards, attribution
│   ├── shared/             # Shared UI components
│   └── tools/              # Tool implementations
│       ├── calculators/    # BMI calculator, etc.
│       ├── flashcard-maker/
│       ├── illustration-maker/
│       ├── latex-editor/
│       └── mcq-maker/
├── data/                   # Static data (tools, resources, visuals, templates)
├── hooks/                  # Custom React hooks
├── i18n/                   # Internationalization (messages, routing)
├── lib/                    # Utility libraries (attribution, metadata, search)
├── public/                 # Static assets (images, icons, audio)
├── scripts/                # Build & generation scripts
├── styles/                 # Global CSS
└── types/                  # TypeScript type definitions
```

---

## Attribution

All resources on EnterMedSchool.org are free for **non-commercial educational use** with proper attribution.

### What You Can Do

- Download resources for lectures, slides, and handouts
- Embed tools and visuals on your website or LMS
- Share materials with students
- Modify content for your classes
- Print resources for educational use

### What You Cannot Do

- Sell or monetize any resources
- Use resources for commercial purposes without permission
- Remove attribution from materials
- Claim the work as your own

### How to Attribute

1. Visit the [Attribution Badge Generator](https://entermedschool.org/en/license#generator) on our site
2. Customize your badge (shape, size, colors)
3. Download the badge or copy the embed code
4. Place it alongside any resources you use

For full details, see our [License page](https://entermedschool.org/en/license).

---

## Contributing

We welcome contributions from the community! Here's how you can help:

1. **Report Issues** — Found a bug or have a suggestion? [Open an issue](https://github.com/enterMedSchool/Non-Profit/issues).
2. **Submit Pull Requests** — Fork the repo, make your changes, and submit a PR.
3. **Improve Translations** — Help us translate the platform into more languages. Translation files live in `i18n/messages/`.
4. **Add Resources** — Contribute new educational resources, question banks, or visual assets.

### Development Workflow

```bash
# Fork and clone the repo
git clone https://github.com/YOUR_USERNAME/Non-Profit.git
cd Non-Profit

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes, then push
git push origin feature/your-feature-name

# Open a Pull Request on GitHub
```

---

## License

This project is licensed under a **Non-Commercial Educational Use** license.

- Free for non-commercial educational use with attribution
- Commercial use requires prior written permission
- Contact [ari@entermedschool.com](mailto:ari@entermedschool.com) for commercial licensing inquiries

See [LICENSE](LICENSE) for full terms, or visit the [License page](https://entermedschool.org/en/license) on our website.

---

## Contact

- **Email:** [ari@entermedschool.com](mailto:ari@entermedschool.com)
- **Website:** [entermedschool.org](https://entermedschool.org)
- **Main Site:** [entermedschool.com](https://entermedschool.com)
- **GitHub:** [github.com/enterMedSchool/Non-Profit](https://github.com/enterMedSchool/Non-Profit)

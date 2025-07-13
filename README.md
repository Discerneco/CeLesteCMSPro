# CeLesteCMS Pro

<div align="center">
  <img src="static/logo.png" alt="CeLesteCMS Pro Logo" width="200" />
  
  **A modern, performant content management system built with SvelteKit, Cloudflare, and edge computing technologies**
  
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![SvelteKit](https://img.shields.io/badge/SvelteKit-2.21.0-ff3e00)](https://kit.svelte.dev/)
  [![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages%20%26%20D1-f38020)](https://pages.cloudflare.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
  
</div>

## 🚀 Overview

CeLesteCMS Pro is a next-generation content management system designed for performance, scalability, and developer experience. Built on modern edge computing technologies, it delivers lightning-fast static sites with a powerful admin interface.

### Key Features

- **⚡ Static Site Generation** - Pre-rendered pages for optimal performance
- **🎨 Modern Admin UI** - Built with Svelte 5 runes and TailwindCSS v4
- **🌐 Edge-First Architecture** - Powered by Cloudflare Pages and D1
- **🔒 Secure Authentication** - Role-based access with Oslo + Arctic (custom implementation)
- **🌍 Internationalization** - Language switching from login page (English/Portuguese)
- **🌓 Dark Mode** - Full dark mode support across the admin interface
- **📱 Responsive Design** - Mobile-first approach with DaisyUI components
- **🔌 Extensible** - Plugin architecture for custom functionality

## 📋 Current Status

CeLesteCMS Pro is currently in **Phase 1: MVP Development**. See our [Roadmap](Documentation/Development/NEW_ROADMAP.md) for detailed phase planning.

### MVP Features (In Progress)
- ✅ **Admin UI with dashboard** (SvelteKit 5 + TailwindCSS v4 + DaisyUI)
- ✅ **Authentication system** (Oslo + Arctic implementation - COMPLETE)
- ✅ **Dark mode implementation** (full admin interface)
- ✅ **Internationalization with language switching** (login/signup/auth pages)
- ✅ **Session management** (secure HTTP-only cookies, auto-extension)
- ✅ **Route protection** (SvelteKit hooks-based)
- 🔄 Content management schemas
- 🔄 Static site generation
- 🔄 Basic SEO features
- 🔄 Plugin foundation

## 🛠️ Tech Stack

- **Frontend Framework:** [SvelteKit](https://kit.svelte.dev/) with Svelte 5
- **Styling:** [TailwindCSS v4](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- **Database:** [Drizzle ORM](https://orm.drizzle.team/) with SQLite (dev) / Cloudflare D1 (prod)
- **Deployment:** [Cloudflare Pages](https://pages.cloudflare.com/)
- **Authentication:** Oslo + Arctic for lightweight, edge-optimized auth
- **Icons:** [Lucide Icons](https://lucide.dev/)
- **i18n:** [Paraglide JS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Cloudflare account (for production deployment)
- Wrangler CLI (`npm install -g wrangler`)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/celestecms-pro.git
cd celestecms-pro

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up the database
pnpm db:push
pnpm db:seed

# Start development server
pnpm dev
```

### Development

```bash
# Run development server
pnpm dev

# Run type checking
pnpm check

# Format code
pnpm format

# Lint code
pnpm lint

# Build for production
pnpm build
```

### Database Management

```bash
# Generate migrations
pnpm db:generate

# Push schema changes
pnpm db:push

# Run migrations
pnpm db:migrate

# Open Drizzle Studio
pnpm db:studio

# Seed database
pnpm db:seed
```

## 📁 Project Structure

```
CeLesteCMS Pro/
├── src/
│   ├── lib/
│   │   ├── components/     # Reusable UI components
│   │   ├── server/         # Server-side utilities
│   │   ├── db/            # Database schema and utilities
│   │   └── stores/        # Svelte stores
│   ├── routes/            # SvelteKit routes
│   │   ├── admin/         # Admin panel routes
│   │   └── api/           # API endpoints
│   └── app.html           # App template
├── static/                # Static assets
├── Documentation/         # Project documentation
│   ├── Architecture/      # System design docs
│   ├── Security/          # Security guidelines
│   ├── Development/       # Development guides
│   └── Guides/           # User guides
├── messages/             # i18n translations
└── drizzle/              # Database migrations
```

## 📚 Documentation

Comprehensive documentation is available in the [`Documentation/`](Documentation/) directory:

- [📚 Documentation Index](Documentation/INDEX.md) - Complete documentation overview
- [Getting Started Guide](Documentation/Guides/GETTING_STARTED.md)
- [UI Component Guide](Documentation/Guides/UI_Guide.md)
- [Security Checklist](Documentation/Security/Security_Check.md)
- [Authentication System](Documentation/Security/Authentication.md)
- [Development Roadmap](Documentation/Development/NEW_ROADMAP.md)
- [Localization Guide](Documentation/Guides/Localization_Guide.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Code of Conduct
- Development workflow
- Coding standards
- Pull request process

### Development Setup

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔒 Security

Security is a top priority for CeLesteCMS Pro. Please review our:

- [Security Policy](SECURITY.md) for reporting vulnerabilities
- [Security Checklist](Documentation/Security/Security_Check.md) for development guidelines

## 📄 License

CeLesteCMS Pro is open source software licensed under the [MIT License](LICENSE).

## 🌟 Acknowledgments

Built with amazing open source technologies:

- [SvelteKit](https://kit.svelte.dev/) - The web framework
- [Cloudflare](https://cloudflare.com/) - Edge computing platform
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
- [DaisyUI](https://daisyui.com/) - Component library
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM

## 📞 Support

- 📧 Email: [support@celestecms.com](mailto:support@celestecms.com)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/celestecms-pro/discussions)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/celestecms-pro/issues)

---

<div align="center">
  Made with ❤️ by the CeLesteCMS Pro Team
</div>

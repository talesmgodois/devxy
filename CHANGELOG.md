# Changelog

All notable changes to Devxy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Sponsorship integration with configurable sponsors and support links
- `sponsor` command to display sponsor and support information
- `gt.sponsor` navigation command to open GitHub Sponsors page
- `AdWrapper` component for optional ad zones (top banner, side columns)
- `SponsorBadge` component in footer

## [1.0.0] - 2025-01-10

### Added
- Initial release of Devxy - Developer Micro-Tools Console
- **Generator Commands (r.*)**
  - `r.cpf` - Generate random Brazilian CPF
  - `r.cnpj` - Generate random Brazilian CNPJ
  - `r.titulo` - Generate random Brazilian Título Eleitoral
  - `r.user` - Generate random username
  - `r.nick` - Generate random nickname
  - `r.email` - Generate random email address
  - Support for `-f` (formatted) and `-n` (count) flags
- **Pipe Commands**
  - `xc` - Copy to clipboard
  - `xp` - Paste from clipboard
  - `xl` - Convert to lowercase
  - `xu` - Convert to uppercase
  - `xt` - Trim whitespace
  - `xr` - Reverse string
  - `b64e` - Encode to Base64
  - `b64d` - Decode from Base64
- **Navigation Commands (gt.*)**
  - `gt <url>` - Open any URL in a new tab
  - `gt.repo` - Open Devxy GitHub repository
  - `gt.github` - Open GitHub homepage
  - `gt.author` - Open author website
- **Visual Tools (v.*)**
  - `v.json` - JSON Formatter and validator
  - `v.csv` - CSV Generator
  - `v.curl` - cURL Command Generator
  - `v.temp` - Temperature Converter
  - `v.embeds` - Manage embedded tools
  - `v.help` - Visual help panel
  - `v.about` - About Devxy visual panel
- **Embedded Interpreters (ei.*)**
  - `ei.js` - JavaScript interpreter
  - `ei.python` - Python interpreter (via Pyodide)
- **Embedded Tools (ve.*)**
  - Dynamic embedded tool support via `embed(name, url)` command
- **History Features**
  - `latest` - Get last command result
  - `latest(i)` - Get result at specific index
  - `latest(i,n)` - Get n results from index
  - `recent` - Show last 20 commands with timestamps
  - `clearhistory` - Clear command history
  - Persistent command history via localStorage
- **Utility Commands**
  - `about` - Show version and author information
  - `regex(pattern, text)` - Validate regex patterns
  - `help` - Show available commands
  - `clear` - Clear the terminal
- **UI Features**
  - Terminal-style interface with ASCII art welcome banner
  - Fuzzy search autocomplete with keyboard navigation
  - Quick command buttons for generators and pipes
  - Side panel for visual tools (desktop) / bottom sheet (mobile)
  - Responsive design for mobile devices
  - PWA support with installable app
  - Keyboard shortcuts (/, Ctrl+L, Ctrl+E, Tab, Arrows)
- **Project Setup**
  - Open source under MIT License
  - Contributing guidelines (CONTRIBUTING.md)
  - Centralized app configuration (appInfo.ts)

### Technical
- Built with React 18, Vite, TypeScript, and Tailwind CSS
- Uses shadcn/ui components
- Terminal theming with custom CSS tokens
- JetBrains Mono font for authentic terminal feel

---

## Legend

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Vulnerability fixes

[Unreleased]: https://github.com/mgodois/devxy/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/mgodois/devxy/releases/tag/v1.0.0

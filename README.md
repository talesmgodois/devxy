# Devxy

**Devxy** is an open-source developer toolkit aggregator - a collection of micro-tools designed to streamline your development workflow, all accessible from a unified terminal interface.

🌐 **Live Demo**: [devxy.mgodois.com](https://devxy.mgodois.com)

## Features

- 🖥️ **Terminal Interface** - Access all tools through a familiar command-line interface
- 🔧 **Micro-Tools** - JSON formatter, cURL generator, CSV generator, temperature converter, and more
- 🐍 **Embedded Interpreters** - Run Python and JavaScript code directly in the browser
- ⚡ **Pipe Support** - Chain commands together for powerful workflows
- 📱 **PWA Support** - Install as a standalone app on any device

## Quick Start

```bash
# Clone the repository
git clone https://github.com/talesmgodois/devxy.git

# Navigate to the project directory
cd devxy

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Available Commands

Type `help` in the terminal to see all available commands, or use `/` to open the quick command panel.

### Core Commands
- `help` - Show all available commands
- `about` or `v.about` - Display version and author information
- `clear` - Clear the terminal output

### Navigation Commands
- `gt <url>` - Open a URL in a new tab
- `gt.repo` - Open the Devxy GitHub repository
- `gt.github` - Open GitHub homepage

### Tools
- `json` - Format and validate JSON
- `curl` - Generate cURL commands
- `csv` - Generate CSV files
- `temp` - Temperature converter
- `embed` - Manage embedded content

### Interpreters
- `py` - Python interpreter
- `js` - JavaScript interpreter

## Technologies

- [Vite](https://vitejs.dev/) - Build tool
- [React](https://react.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## Author

**Tales Marinho Godois**

- Website: [mgodois.com](https://mgodois.com)
- GitHub: [@talesmgodois](https://github.com/talesmgodois)

## License

This project is open source and available under the [MIT License](LICENSE).

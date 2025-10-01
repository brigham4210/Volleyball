# Volleyball Formation Manager

A native desktop application for creating and managing volleyball team formations with 7 positions including libero.

## Features

- **7 Player Positions**: O1, O2, M1, M2, S, OP, L (customizable labels)
- **Drag & Drop Interface**: Easily arrange players on the volleyball court
- **Formation Management**: Save and load custom formations
- **Quick Presets**: Built-in formations (6-2, 5-1, 4-2)
- **Native App**: Cross-platform desktop application built with Electron
- **Customizable Labels**: Edit player labels to match your team

## Default Positions

- **O1**: Outside Hitter 1
- **O2**: Outside Hitter 2  
- **M1**: Middle Blocker 1
- **M2**: Middle Blocker 2
- **S**: Setter
- **OP**: Opposite
- **L**: Libero

## Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Run in development mode:
   ```bash
   npm start
   ```

3. Build for production:
   ```bash
   # Build for current platform
   npm run build
   
   # Build for specific platforms
   npm run build-mac    # macOS
   npm run build-win    # Windows
   npm run build-linux  # Linux
   ```

## Usage

### Basic Operations
- **Drag Players**: Click and drag any player circle to reposition on the court
- **Edit Labels**: Double-click a player or use the "Edit Labels" button
- **Reset Positions**: Click "Reset Positions" to return to default layout
- **Save Formation**: Save your current formation for later use
- **Load Formation**: Load previously saved formations

### Keyboard Shortcuts
- `Cmd/Ctrl + N`: New Formation
- `Cmd/Ctrl + S`: Save Formation
- `Cmd/Ctrl + O`: Load Formation
- `Cmd/Ctrl + E`: Edit Labels
- `Cmd/Ctrl + R`: Reset Positions

### Formation Presets
The app includes three common volleyball formations:
- **6-2 Formation**: Two setters, six attackers
- **5-1 Formation**: One setter, five attackers
- **4-2 Formation**: Two setters (front row), four attackers

## File Structure

```
volleyball-formation-app/
├── main.js           # Electron main process
├── app.html          # Main application UI
├── app.css           # Application styles
├── app.js            # Application logic
├── preload.js        # Electron preload script
├── package.json      # Node.js dependencies and scripts
└── assets/           # App icons and resources
```

## Technology Stack

- **Electron**: Cross-platform desktop app framework
- **HTML/CSS/JavaScript**: Core web technologies
- **Node.js**: Runtime environment

## Development

### Project Structure
The app follows a standard Electron application structure:
- `main.js`: Main Electron process and window management
- `app.html`: User interface markup
- `app.css`: Styling and responsive design
- `app.js`: Application logic and user interactions
- `preload.js`: Secure communication between main and renderer processes

### Adding Features
To add new features:
1. Update the UI in `app.html`
2. Add styles in `app.css`
3. Implement logic in `app.js`
4. Add menu items in `main.js` if needed

## License

MIT License - feel free to use and modify for your volleyball team needs.

## Contributing

Contributions welcome! Please feel free to submit issues and pull requests.
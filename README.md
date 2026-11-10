# PROSPECT - Football Scouting Notebook

A modern, minimalist, responsive football scouting notebook designed for football scouts, coaches, analysts and talent identification professionals.

## Features

### Core Functionality
- **Dashboard**: Overview of scouting activities with statistics
- **Player Management**: Create, edit, delete, search and filter player profiles
- **Scouting Reports**: Detailed player assessments with attribute ratings
- **Match Observations**: Record observations during or after matches
- **Digital Notebook**: Free-form notes and observations
- **Player Analysis**: Deep insights and assessments with visual charts
- **Pitch Annotations**: Visual football pitch for recording positional observations

### Attribute Categories
- **Technical**: First touch, ball control, passing, dribbling, shooting, crossing, heading
- **Tactical**: Positioning, decision making, spatial awareness, movement off ball, defensive awareness, game intelligence
- **Physical**: Acceleration, speed, strength, stamina, agility, balance
- **Mental**: Work rate, concentration, confidence, composure, leadership, determination

### Data Management
- **IndexedDB Storage**: All data stored locally for offline use
- **JSON Export/Import**: Backup and restore all data
- **Search**: Global search across all entities
- **Filters**: Filter players by position, age, club

## Installation

### As a Progressive Web App (PWA)

1. **Browser Installation**
   - Open the application in a modern browser (Chrome, Edge, Firefox, Safari)
   - The browser will prompt you to install the app
   - Click "Install" to add PROSPECT to your home screen

2. **Manual Installation**
   - Open the application in Chrome or Edge
   - Click the three-dot menu in the top-right corner
   - Select "More tools" > "Create shortcut"
   - Check "Open as window" and click "Create"

3. **Mobile Installation**
   - **Android**: Open in Chrome, tap "Add to Home Screen"
   - **iOS**: Open in Safari, tap the share button, select "Add to Home Screen"

### Local Development

1. Clone or download the repository
2. Place the files in a web server directory (e.g., Apache, Nginx, or use PHP built-in server)
3. Open `index.html` in a web browser

```bash
# Using PHP built-in server
php -S localhost:8000

# Then open http://localhost:8000 in your browser
```

### Server Requirements (Optional)

For server-side synchronization (optional):
- PHP 8.0 or higher
- MySQL 5.7 or higher / MariaDB 10.2 or higher
- Web server (Apache, Nginx)

## Project Structure

```
PROSPECT/
├── index.html                    # Main HTML file
├── manifest.json                # PWA manifest
├── service-worker.js            # Service worker for offline functionality
├── README.md                    # This file
│
├── assets/
│   ├── icons/                   # Application icons
│   │   ├── icon-192.svg        # 192x192 icon
│   │   ├── icon-512.svg        # 512x512 icon
│   │   ├── apple-touch-icon.svg # Apple touch icon
│   │   └── favicon.svg         # Favicon
│   ├── images/                  # Application images
│   └── fonts/                   # Custom fonts (if any)
│
├── css/
│   ├── style.css                # Main styles
│   ├── components.css           # Component styles
│   ├── themes.css               # Theme styles (light/dark)
│   └── responsive.css           # Responsive styles
│
├── js/
│   ├── database.js              # IndexedDB operations
│   ├── app.js                   # Main application logic
│   ├── players.js               # Player management
│   ├── scouting.js              # Scouting reports
│   ├── notebook.js              # Notebook functionality
│   ├── matches.js               # Match observations
│   ├── analysis.js              # Player analysis
│   ├── pitch.js                 # Pitch annotations
│   ├── exports.js               # Export functionality
│   └── settings.js              # Settings management
│
├── php/
│   ├── config.php               # PHP configuration
│   ├── database.php             # Database connection
│   └── api/                     # API endpoints
│       └── sync.php            # Sync endpoint
│
└── database/
    └── schema.sql               # MySQL database schema
```

## Usage

### Creating a Player
1. Navigate to the "Players" section
2. Click "Add Player" button
3. Fill in the player details
4. Click "Save Player"

### Creating a Scouting Report
1. Navigate to the "Scouting" section
2. Click "New Report" button
3. Select a player
4. Rate each attribute (1-5)
5. Add observations for each attribute
6. Fill in the overall assessment
7. Click "Save Report"

### Creating a Match Observation
1. Navigate to the "Matches" section
2. Click "New Match" button
3. Fill in match details
4. Select the observed player
5. Add observations
6. Click "Save Observation"

### Creating a Note
1. Navigate to the "Notebook" section
2. Click "New Note" button
3. Add title and content
4. Optionally associate with a player
5. Click "Save Note"

### Exporting Data
1. Navigate to the "Settings" section
2. Click "Export JSON" button
3. The browser will download a JSON file with all your data

### Importing Data
1. Navigate to the "Settings" section
2. Click "Import JSON" button
3. Select your backup file
4. The data will be imported

## Browser Compatibility

PROSPECT is compatible with modern browsers:

- Chrome (recommended)
- Firefox
- Safari (iOS and macOS)
- Edge
- Opera

## Offline Functionality

PROSPECT is designed to work offline:
- All data is stored locally using IndexedDB
- The application shell is cached for offline use
- You can continue using the app without an internet connection
- Data will sync when you come back online (if server sync is configured)

## Security

- All data is stored locally in your browser
- No data is transmitted without your explicit authorization
- If using server sync, all communications should be over HTTPS
- Input validation is performed on both client and server sides

## Customization

### Changing the Theme
1. Click the theme toggle button in the sidebar
2. Or go to Settings > Appearance and select your preferred theme

### Adding Custom Positions
Edit the position dropdown options in the player and match forms.

### Adding Custom Clubs
The club field uses a datalist, so you can add new clubs by typing them in.

## Performance Tips

- The app is optimized for performance with minimal dependencies
- All data operations are batched where possible
- Images are optimized for web
- Lazy loading is used where appropriate

## Troubleshooting

### Data not saving
- Check if IndexedDB is supported in your browser
- Check if you have enough storage space
- Try clearing your browser cache

### App not installing
- Make sure you're using a modern browser
- Check if PWA installation is supported
- Try refreshing the page

### Offline not working
- Make sure the service worker is registered
- Check if the app was loaded at least once with an internet connection
- Clear the cache and reload

## Development

### Adding New Features
1. Add new JavaScript files in the `js/` directory
2. Add new CSS styles in the appropriate CSS files
3. Update the HTML structure if needed
4. Test thoroughly

### Testing
- Test in multiple browsers
- Test offline functionality
- Test on different screen sizes
- Test data persistence

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

PROSPECT is released under the MIT License.

## Credits

- **Design**: Modern, minimalist football scouting notebook
- **Technology**: HTML5, CSS3, Vanilla JavaScript, IndexedDB
- **PWA**: Service Worker, Web App Manifest

## Version History

- **1.0.0** (Current): Initial release

## Contact

For questions, suggestions, or feedback, please open an issue on GitHub.

---

**PROSPECT - Modern Football Scouting Notebook**

Built with passion for football scouting.

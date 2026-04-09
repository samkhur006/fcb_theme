# FC Barcelona Chrome New Tab Theme

A custom Chrome extension that replaces your new tab page with an FC Barcelona-themed dashboard featuring live match updates, news, and productivity tools.

![Active Window - Blaugrana Blue](screenshots/active.png)
*Active window with Blaugrana blue tab bar*

![Inactive Window - Blaugrana Red](screenshots/inactive.png)
*Inactive window with Blaugrana red tab bar*

---

## Features

### Frequently Visited Sites (Left)
Your most visited websites are displayed as shortcuts on the left side of the page. Click the **+** button at the bottom to add custom shortcuts with a name and URL.

### FCB Match Center (Top Right)
A live match center panel that tracks FC Barcelona across multiple competitions:
- **LaLiga**, **Champions League**, **Copa del Rey**, **UEFA Super Cup**, **Club World Cup**
- **Live scores** with real-time updates every 15 seconds during a match
- **Last match result** with full-time score and team logos
- **Next match** with date, time, and competition info
- **La Liga standings** table with top 6 teams and Barcelona's position highlighted

**Header buttons:**
- **?** — Hover to see cache status (which data is cached and when it refreshes). Click to force a full refresh of all data.
- **↻** — Refresh live match data only (1 API call)
- **✕** — Collapse the panel (a floating ⚽ button appears to reopen it)

**Smart caching** minimizes API usage:
- Live scores cache until kickoff of the next match (or 15 seconds during a live game)
- Fixtures cache until 2 hours after the next match
- Standings cache until 2 hours after the next La Liga match

### News Ticker (Bottom Left)
Latest FC Barcelona news from Google News displayed in a scrollable ticker. Navigate between stories using the **◀ ▶** buttons. Click a headline to read the full article.

### Productivity Tools (Top Right Icons)
A collapsible toolbar with quick-access tools:
- **Google Apps** — Quick links to Google services
- **Calendar** — View your calendar
- **Sticky Notes** — Create and manage sticky notes
- **To-Do List** — Task management
- **Timer** — Stopwatch/countdown timer

### Blaugrana Browser Theme
A separate companion theme extension is included in the `blaugrana-theme/` folder. It colors your Chrome browser frame:
- **Blue** (#004D98) when the window is active
- **Red** (#A50044) when the window is inactive

---

## Installation

### Main Extension
1. Clone or download this repository
2. Set up your API key (see below)
3. Open `chrome://extensions` in Chrome
4. Enable **Developer mode** (top right toggle)
5. Click **Load unpacked** and select the `fcb_theme` root folder

### Blaugrana Theme (Optional)
1. In the same `chrome://extensions` page, click **Load unpacked** again
2. Select the `blaugrana-theme/` subfolder

Both extensions work independently and can be installed together.

---

## API Key Setup

The match center uses the [Free API Live Football Data](https://rapidapi.com/developer/) from RapidAPI (free tier: 100 requests/month).

1. Sign up at [RapidAPI](https://rapidapi.com/developer/) and subscribe to the free tier
2. Copy `js/config.example.js` to `js/config.js`:
   ```bash
   cp js/config.example.js js/config.js
   ```
3. Open `js/config.js` and replace `YOUR_RAPIDAPI_KEY_HERE` with your actual key:
   ```javascript
   const RAPID_API_KEY = 'your_actual_key_here';
   ```

> **Note:** `js/config.js` is gitignored and will not be committed to the repository.

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests for:
- New features or tools
- UI/UX improvements
- Bug fixes
- Additional competition support

Thank you for contributing!

---

## License

This project is open source. Feel free to use and modify it for personal use.

---

*Visca el Barca!*

---

Built on top of [Gameograf's FC Barcelona Emblem Live extension](https://chromewebstore.google.com/detail/fc-barcelona-emblem-live/pojadffognkepfclajophbeojahgkjlo)

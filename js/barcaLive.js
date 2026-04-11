// FC Barcelona Match Center
// Uses free-api-live-football-data from RapidAPI
// Free tier: 100 requests/month - uses localStorage caching aggressively

// RAPID_API_KEY is loaded from config.js (gitignored)
const RAPID_API_HOST = 'free-api-live-football-data.p.rapidapi.com';
const BARCA_KEYWORDS = ['barcelona', 'barça', 'barca'];
const BARCA_TEAM_ID = 8634;
const BARCA_LOGO = 'https://images.fotmob.com/image_resources/logo/teamlogo/8634.png';

const LEAGUE_IDS = {
  LALIGA: 87,
  CHAMPIONS_LEAGUE: 42,
  COPA_DEL_REY: 138,
  UEFA_SUPER_CUP: 74,
  CLUB_WORLD_CUP: 78
};

const COMP_NAMES = {
  LALIGA: 'LaLiga',
  CHAMPIONS_LEAGUE: 'Champions League',
  COPA_DEL_REY: 'Copa del Rey',
  UEFA_SUPER_CUP: 'UEFA Super Cup',
  CLUB_WORLD_CUP: 'Club World Cup'
};

// Cache TTLs in milliseconds
const CACHE_TTL = {
  LIVE: 15 * 1000,          // 15 seconds for live scores
  STANDINGS: 24 * 60 * 60 * 1000 // 24 hours for standings
  // Fixtures/matches: cached dynamically until 1h before next matchday
};

let matchCenterInterval = null;
let isLiveMatch = false;

// TEST FLAG: Set to true to show a mock last match when no live match is found
// Set to false before publishing
const USE_LAST_MATCH_IF_NO_LIVE = true;

// Dynamic team name → fotmob ID map (populated from API data, cached in localStorage)
const FM_BASE = 'https://images.fotmob.com/image_resources/logo/teamlogo';
let teamIdMap = {};

function loadTeamIdMap() {
  try {
    const saved = localStorage.getItem('fcb_team_id_map');
    if (saved) teamIdMap = JSON.parse(saved);
  } catch (e) { /* ignore */ }
}

function saveTeamIdMap() {
  try {
    localStorage.setItem('fcb_team_id_map', JSON.stringify(teamIdMap));
  } catch (e) { /* ignore */ }
}

function registerTeam(name, id) {
  if (!name || !id || typeof id !== 'number') return;
  teamIdMap[name.toLowerCase()] = id;
}

function getTeamLogo(teamName, teamId) {
  if (!teamName) return BARCA_LOGO;
  
  // If team ID is directly provided, use it
  if (teamId && typeof teamId === 'number') {
    return `${FM_BASE}/${teamId}.png`;
  }
  
  const lower = teamName.toLowerCase();
  
  // Look up in dynamic map
  if (teamIdMap[lower]) {
    return `${FM_BASE}/${teamIdMap[lower]}.png`;
  }
  
  // Partial match in dynamic map
  for (const [key, id] of Object.entries(teamIdMap)) {
    if (lower.includes(key) || key.includes(lower)) {
      return `${FM_BASE}/${id}.png`;
    }
  }
  
  // Final fallback
  return BARCA_LOGO;
}

// Load cached team IDs on startup
loadTeamIdMap();

// ============== API HELPER ==============
async function fetchAPI(endpoint, params = {}) {
  const queryStr = new URLSearchParams(params).toString();
  const url = `https://${RAPID_API_HOST}${endpoint}${queryStr ? '?' + queryStr : ''}`;
  
  console.log(`[MatchCenter] Fetching: ${endpoint}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPID_API_KEY,
      'x-rapidapi-host': RAPID_API_HOST
    }
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return await response.json();
}

// ============== CACHING ==============
function getCached(key) {
  try {
    const item = localStorage.getItem('fcb_' + key);
    if (!item) return null;
    const parsed = JSON.parse(item);
    if (Date.now() > parsed.expiry) {
      localStorage.removeItem('fcb_' + key);
      return null;
    }
    return parsed.data;
  } catch (e) {
    return null;
  }
}

function setCache(key, data, ttl) {
  try {
    localStorage.setItem('fcb_' + key, JSON.stringify({
      data: data,
      expiry: Date.now() + ttl
    }));
  } catch (e) {
    console.warn('[MatchCenter] Cache write failed:', e);
  }
}

// ============== DATE HELPERS ==============
function getTodayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatMatchTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatMatchDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function isBarcaTeam(name, teamId) {
  if (!name) return false;
  if (teamId === BARCA_TEAM_ID) return true;
  const lower = name.toLowerCase();
  // Exclude other clubs with "Barcelona" in name (e.g. Barcelona SC, Ecuador)
  if (lower.includes('barcelona sc') || lower.includes('barcelona de')) return false;
  return BARCA_KEYWORDS.some(kw => lower.includes(kw));
}

// ============== LEAGUE IDS ==============


// ============== FETCH LIVE MATCHES ==============
async function fetchLiveMatches() {
  const cached = getCached('live');
  if (cached) return cached;
  
  try {
    const data = await fetchAPI('/football-current-live');
    console.log('[MatchCenter] Live data:', data);
    
    let result = { isLive: false, match: null };
    
    if (data && data.status === 'success' && data.response && Array.isArray(data.response.live)) {
      for (const match of data.response.live) {
        const homeName = match.home?.name || '';
        const awayName = match.away?.name || '';
        
        if (isBarcaTeam(homeName, match.home?.id) || isBarcaTeam(awayName, match.away?.id)) {
          // Register opponent team ID from live data
          if (match.home?.name && match.home?.id) registerTeam(match.home.name, match.home.id);
          if (match.away?.name && match.away?.id) registerTeam(match.away.name, match.away.id);
          result = {
            isLive: true,
            match: {
              homeTeam: homeName,
              awayTeam: awayName,
              homeTeamId: match.home?.id || null,
              awayTeamId: match.away?.id || null,
              homeScore: match.home?.score ?? '-',
              awayScore: match.away?.score ?? '-',
              minute: match.status?.reason?.short || match.status?.liveTime?.short || '',
              status: 'LIVE',
              competition: match.tournament?.name || match.league?.name || 'Football',
              eventId: match.id || null
            }
          };
          break;
        }
      }
    }
    
    // Smart cache TTL: 2min if live match found, otherwise cache until next matchday
    if (result.isLive) {
      setCache('live', result, CACHE_TTL.LIVE);
    } else {
      // No live match — cache this "no match" result until next matchday
      const nextMatchTTL = getNextMatchTTL();
      setCache('live', result, nextMatchTTL);
      console.log(`[MatchCenter] No live match, caching for ${Math.round(nextMatchTTL/3600000)}h`);
    }
    return result;
  } catch (error) {
    console.error('[MatchCenter] Live fetch error:', error);
    return { isLive: false, match: null };
  }
}

// Returns ms until data should be refreshed: kickoff + 2h, or fallback
function getTTLUntilAfterMatch(matchDate, fallbackMs) {
  if (!matchDate) return fallbackMs;
  try {
    const msUntilUpdated = new Date(matchDate).getTime() + (2 * 60 * 60 * 1000 + 10 * 60 * 1000) - Date.now();
    if (msUntilUpdated > 0) return msUntilUpdated;
  } catch (e) { /* ignore */ }
  return fallbackMs;
}

function getNextMatchTTL() {
  const cached = getCached('barca_matches');
  const date = cached?.nextMatch?.date;
  if (!date) return 6 * 60 * 60 * 1000; // 6h fallback
  const msUntilKickoff = new Date(date).getTime() - Date.now();
  return msUntilKickoff > 0 ? msUntilKickoff : 15 * 1000; // cache till kickoff, or 15sec if already started
}

function getNextLaLigaMatchTTL() {
  const cached = getCached('barca_matches');
  return getTTLUntilAfterMatch(cached?.nextLaLigaDate, 24 * 60 * 60 * 1000);
}

// ============== FETCH BARCA MATCHES (ALL COMPETITIONS) ==============
async function fetchBarcaMatches() {
  const cached = getCached('barca_matches');
  if (cached) return cached;
  
  let allBarcaMatches = [];
  let nextAnyLaLigaDate = null; // Next La Liga match by ANY team (for standings cache)
  
  // Fetch from all competitions Barcelona plays in
  for (const [comp, leagueId] of Object.entries(LEAGUE_IDS)) {
    try {
      const data = await fetchAPI('/football-get-all-matches-by-league', { leagueid: leagueId });
      
      if (data && data.status === 'success' && data.response && Array.isArray(data.response.matches)) {
        // For La Liga: find the soonest match that will update standings
        // Priority: currently live match > next upcoming match
        if (comp === 'LALIGA') {
          const now = new Date();
          let liveMatch = null;
          let nextUpcoming = null;
          const sorted = [...data.response.matches].sort((a, b) =>
            (a.status?.utcTime || '').localeCompare(b.status?.utcTime || '')
          );
          for (const m of sorted) {
            const mDate = new Date(m.status?.utcTime || 0);
            if (m.status?.started && !m.status?.finished && !liveMatch) {
              liveMatch = m;
            }
            if (!m.status?.started && !m.status?.finished && mDate > now && !nextUpcoming) {
              nextUpcoming = m;
            }
            if (liveMatch && nextUpcoming) break;
          }
          // If a match is live, standings will update when it ends — use its kickoff
          if (liveMatch) {
            nextAnyLaLigaDate = liveMatch.status?.utcTime || null;
            console.log(`[MatchCenter] La Liga match LIVE: ${liveMatch.home?.name} vs ${liveMatch.away?.name} — standings will refresh after it ends`);
          } else if (nextUpcoming) {
            nextAnyLaLigaDate = nextUpcoming.status?.utcTime || null;
            console.log(`[MatchCenter] Next La Liga match (any team): ${nextUpcoming.home?.name} vs ${nextUpcoming.away?.name} at ${nextAnyLaLigaDate}`);
          }
        }
        
        const barcaInLeague = data.response.matches.filter(m => {
          const homeName = m.home?.name || '';
          const awayName = m.away?.name || '';
          return isBarcaTeam(homeName, m.home?.id) || isBarcaTeam(awayName, m.away?.id);
        });
        
        // Register team IDs only for Barca's opponents
        for (const m of barcaInLeague) {
          if (m.home?.name && m.home?.id) registerTeam(m.home.name, m.home.id);
          if (m.away?.name && m.away?.id) registerTeam(m.away.name, m.away.id);
        }
        
        // Tag with competition name
        barcaInLeague.forEach(m => {
          m._competition = COMP_NAMES[comp] || comp;
        });
        
        allBarcaMatches = allBarcaMatches.concat(barcaInLeague);
        console.log(`[MatchCenter] Found ${barcaInLeague.length} Barca matches in ${COMP_NAMES[comp] || comp}`);
      }
    } catch (error) {
      console.log(`[MatchCenter] Error fetching ${comp}:`, error);
    }
  }
  
  // Persist the team ID map for future use
  saveTeamIdMap();
  console.log(`[MatchCenter] Team ID map: ${Object.keys(teamIdMap).length} teams registered`);
  
  // Sort by date
  allBarcaMatches.sort((a, b) => {
    const dateA = a.status?.utcTime || '';
    const dateB = b.status?.utcTime || '';
    return dateA.localeCompare(dateB);
  });
  
  const now = new Date();
  
  // Find last finished match and next upcoming match
  let lastMatch = null;
  let nextMatch = null;
  
  for (const m of allBarcaMatches) {
    const matchDate = new Date(m.status?.utcTime || 0);
    
    if (m.status?.finished && matchDate < now) {
      lastMatch = m;
    } else if (!m.status?.started && !m.status?.finished && matchDate > now) {
      if (!nextMatch) nextMatch = m;
    }
  }
  
  const normalize = (m) => {
    if (!m) return null;
    return {
      homeTeam: m.home?.name || '?',
      awayTeam: m.away?.name || '?',
      homeTeamId: m.home?.id || null,
      awayTeamId: m.away?.id || null,
      homeScore: m.status?.finished ? (m.home?.score ?? 0) : null,
      awayScore: m.status?.finished ? (m.away?.score ?? 0) : null,
      minute: m.status?.reason?.short || '',
      status: m.status?.finished ? 'FINISHED' : (m.status?.started ? 'LIVE' : 'SCHEDULED'),
      competition: m._competition || 'Football',
      eventId: m.id || null,
      date: m.status?.utcTime || ''
    };
  };
  
  const result = {
    lastMatch: normalize(lastMatch),
    nextMatch: normalize(nextMatch),
    nextLaLigaDate: nextAnyLaLigaDate
  };
  
  console.log('[MatchCenter] Last match:', result.lastMatch);
  console.log('[MatchCenter] Next match:', result.nextMatch);
  
  // Cache until kickoff + 2h (when match data will have updated)
  const cacheTTL = getTTLUntilAfterMatch(result.nextMatch?.date, 24 * 60 * 60 * 1000);
  console.log(`[MatchCenter] Fixtures cached for ${Math.round(cacheTTL/3600000)}h`);
  
  setCache('barca_matches', result, cacheTTL);
  return result;
}

// ============== FETCH STANDINGS ==============
async function fetchStandings() {
  const cached = getCached('standings');
  if (cached) return cached;
  
  try {
    const data = await fetchAPI('/football-get-standing-all', { leagueid: LEAGUE_IDS.LALIGA });
    console.log('[MatchCenter] Standings data:', data);
    
    if (data && data.status === 'success' && data.response && Array.isArray(data.response.standing)) {
      let barcaPosition = null;
      const topTeams = [];
      
      data.response.standing.forEach(row => {
        // Register team ID from standings
        if (row.name && row.id) registerTeam(row.name, row.id);
        
        const entry = {
          position: row.idx || 0,
          team: row.name || '',
          teamId: row.id || null,
          played: row.played || 0,
          won: row.wins || 0,
          drawn: row.draws || 0,
          lost: row.losses || 0,
          points: row.pts || 0,
          goalDiff: row.goalConDiff || 0
        };
        
        topTeams.push(entry);
        
        if (row.id === BARCA_TEAM_ID || isBarcaTeam(row.name)) {
          barcaPosition = entry;
        }
      });
      
      saveTeamIdMap();
      const result = {
        barcaPosition: barcaPosition,
        topTeams: topTeams.slice(0, 6)
      };
      // Cache until next La Liga matchday
      const standingsTTL = getNextLaLigaMatchTTL();
      setCache('standings', result, standingsTTL);
      console.log(`[MatchCenter] Standings cached for ${Math.round(standingsTTL/3600000)}h`); 
      return result;
    }
  } catch (error) {
    console.error('[MatchCenter] Standings fetch error:', error);
  }
  
  return { barcaPosition: null, topTeams: [] };
}

// ============== RENDER FUNCTIONS ==============

function renderUpcomingAsMain(match) {
  const panel = document.getElementById('matchCenterContent');
  if (!panel) return;
  
  const homeLogo = getTeamLogo(match.homeTeam, match.homeTeamId);
  const awayLogo = getTeamLogo(match.awayTeam, match.awayTeamId);
  
  panel.innerHTML = `
    <div class="mc-upcoming-badge">UPCOMING</div>
    <div class="mc-competition">${match.competition}</div>
    <div class="mc-score-board">
      <div class="mc-team">
        <img src="${homeLogo}" alt="" class="mc-team-logo" onerror="this.src='${BARCA_LOGO}'">
        <span class="mc-team-name">${truncateTeam(match.homeTeam)}</span>
      </div>
      <div class="mc-score">
        <span class="mc-fix-vs" style="font-size:calc(18px * var(--scale))">vs</span>
      </div>
      <div class="mc-team">
        <img src="${awayLogo}" alt="" class="mc-team-logo" onerror="this.src='${BARCA_LOGO}'">
        <span class="mc-team-name">${truncateTeam(match.awayTeam)}</span>
      </div>
    </div>
    <div class="mc-fix-info" style="margin-top:calc(8px * var(--scale))">${formatMatchDate(match.date)} · ${formatMatchTime(match.date) || 'TBD'}</div>
  `;
}

function renderLiveScore(match) {
  const panel = document.getElementById('matchCenterContent');
  if (!panel) return;
  
  const homeLogo = getTeamLogo(match.homeTeam, match.homeTeamId);
  const awayLogo = getTeamLogo(match.awayTeam, match.awayTeamId);
  
  panel.innerHTML = `
    <div class="mc-live-badge">● LIVE ${match.minute ? '- ' + match.minute : ''}</div>
    <div class="mc-competition">${match.competition}</div>
    <div class="mc-score-board">
      <div class="mc-team">
        <img src="${homeLogo}" alt="" class="mc-team-logo" onerror="this.src='${BARCA_LOGO}'">
        <span class="mc-team-name">${truncateTeam(match.homeTeam)}</span>
      </div>
      <div class="mc-score">
        <span class="mc-score-num">${match.homeScore}</span>
        <span class="mc-score-sep">-</span>
        <span class="mc-score-num">${match.awayScore}</span>
      </div>
      <div class="mc-team">
        <img src="${awayLogo}" alt="" class="mc-team-logo" onerror="this.src='${BARCA_LOGO}'">
        <span class="mc-team-name">${truncateTeam(match.awayTeam)}</span>
      </div>
    </div>
  `;
}

function renderSecondaryMatch(match) {
  const section = document.getElementById('mcNextMatch');
  if (!section || !match) {
    if (section) section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  const isFinished = match.status === 'FINISHED';
  
  if (isFinished) {
    section.innerHTML = `
      <div class="mc-section-title">Last Result</div>
      <div class="mc-fixture">
        <span class="mc-fix-team">${truncateTeam(match.homeTeam)}</span>
        <span class="mc-fix-score">${match.homeScore ?? '-'} - ${match.awayScore ?? '-'}</span>
        <span class="mc-fix-team">${truncateTeam(match.awayTeam)}</span>
      </div>
      <div class="mc-fix-info">${match.competition}</div>
    `;
  } else {
    section.innerHTML = `
      <div class="mc-section-title">Next Match</div>
      <div class="mc-fixture">
        <span class="mc-fix-team">${truncateTeam(match.homeTeam)}</span>
        <span class="mc-fix-vs">vs</span>
        <span class="mc-fix-team">${truncateTeam(match.awayTeam)}</span>
      </div>
      <div class="mc-fix-info">${match.competition} · ${formatMatchDate(match.date)} ${formatMatchTime(match.date) || 'TBD'}</div>
    `;
  }
}

function renderStandings(data) {
  const section = document.getElementById('mcStandings');
  if (!section) return;
  
  if (!data || (!data.barcaPosition && data.topTeams.length === 0)) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  
  let html = '<div class="mc-section-title">La Liga Standings</div>';
  html += '<table class="mc-standings-table">';
  html += '<thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>Pts</th></tr></thead>';
  html += '<tbody>';
  
  const teams = data.topTeams.length > 0 ? data.topTeams : (data.barcaPosition ? [data.barcaPosition] : []);
  
  teams.forEach(team => {
    const isBarca = isBarcaTeam(team.team);
    html += `<tr class="${isBarca ? 'mc-barca-row' : ''}">
      <td>${team.position}</td>
      <td class="mc-stand-team">${truncateTeam(team.team)}</td>
      <td>${team.played}</td>
      <td>${team.won}</td>
      <td>${team.drawn}</td>
      <td>${team.lost}</td>
      <td class="mc-stand-pts">${team.points}</td>
    </tr>`;
  });
  
  html += '</tbody></table>';
  section.innerHTML = html;
}

function renderNoData() {
  const panel = document.getElementById('matchCenterContent');
  if (!panel) return;
  
  panel.innerHTML = `
    <div class="mc-no-data">
      <img src="${BARCA_LOGO}" alt="FCB" class="mc-barca-crest">
      <div class="mc-no-match">No live match</div>
      <div class="mc-no-match-sub">Check back on match day!</div>
    </div>
  `;
}

function truncateTeam(name) {
  if (!name) return '?';
  // Shorten common long names
  return name
    .replace('FC Barcelona', 'Barcelona')
    .replace('Real Madrid CF', 'Real Madrid')
    .replace('Atlético Madrid', 'Atl. Madrid')
    .replace('Athletic Club', 'Athletic')
    .replace('Real Sociedad', 'Real Sociedad');
}

// ============== MAIN UPDATE FUNCTION ==============
async function updateMatchCenter() {
  const panel = document.getElementById('matchCenterPanel');
  if (!panel) return;
  
  try {
    // 1. Fetch all Barca matches first (populates cache used by live TTL calculation)
    const barcaData = await fetchBarcaMatches();
    
    // 2. Check for live match
    const liveData = await fetchLiveMatches();
    
    if (liveData.isLive && liveData.match) {
      isLiveMatch = true;
      panel.classList.add('mc-live');
      renderLiveScore(liveData.match);
      
      // Start frequent refresh for live match
      if (!matchCenterInterval) {
        matchCenterInterval = setInterval(updateMatchCenter, 15000); // 15 sec during live
      }
      return;
    }
    
    panel.classList.remove('mc-live');
    isLiveMatch = false;
    
    if (USE_LAST_MATCH_IF_NO_LIVE && barcaData.lastMatch && barcaData.lastMatch.status === 'FINISHED') {
      // Show last match result
      renderLiveScore(barcaData.lastMatch);
      const badge = document.querySelector('.mc-live-badge');
      if (badge) {
        badge.textContent = barcaData.lastMatch.minute || 'FULL TIME';
        badge.style.color = '#4CAF50';
        badge.style.animation = 'none';
      }
    } else if (barcaData.nextMatch) {
      // No finished match found, show upcoming match as main content
      // not tested yet
      renderUpcomingAsMain(barcaData.nextMatch);
    } else {
      renderNoData();
    }
    
    // Show next upcoming match in secondary section (only if main shows a finished match)
    if (USE_LAST_MATCH_IF_NO_LIVE && barcaData.lastMatch && barcaData.lastMatch.status === 'FINISHED' && barcaData.nextMatch) {
      renderSecondaryMatch(barcaData.nextMatch);
    } else {
      const nextSection = document.getElementById('mcNextMatch');
      if (nextSection) nextSection.style.display = 'none';
    }
    
    // 3. Fetch standings (cached for 24h)
    const standingsData = await fetchStandings();
    renderStandings(standingsData);
    
    // Clear frequent refresh if match ended
    if (matchCenterInterval && !isLiveMatch) {
      clearInterval(matchCenterInterval);
      matchCenterInterval = null;
    }
    
  } catch (error) {
    console.error('[MatchCenter] Update error:', error);
    renderNoData();
  }
}

// ============== CACHE STATUS TOOLTIP ==============
function updateCacheTooltip() {
  const tooltip = document.getElementById('mcCacheTooltip');
  if (!tooltip) return;

  const cacheKeys = [
    { key: 'fcb_live', label: 'Live Scores' },
    { key: 'fcb_barca_matches', label: 'Fixtures' },
    { key: 'fcb_standings', label: 'Standings' }
  ];

  let html = '<table><thead><tr><th>Data</th><th>Status</th><th>Refreshes In</th></tr></thead><tbody>';

  for (const { key, label } of cacheKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        html += `<tr><td>${label}</td><td class="mc-cache-miss">No data</td><td>—</td></tr>`;
        continue;
      }
      const parsed = JSON.parse(raw);
      const expiresIn = parsed.expiry - Date.now();
      if (expiresIn <= 0) {
        html += `<tr><td>${label}</td><td class="mc-cache-miss">Expired</td><td>Next load</td></tr>`;
      } else {
        const hrs = Math.floor(expiresIn / 3600000);
        const mins = Math.floor((expiresIn % 3600000) / 60000);
        const timeStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
        html += `<tr><td>${label}</td><td class="mc-cache-hit">Cached</td><td>${timeStr}</td></tr>`;
      }
    } catch (e) {
      html += `<tr><td>${label}</td><td class="mc-cache-miss">Error</td><td>—</td></tr>`;
    }
  }

  html += '</tbody></table>';
  tooltip.innerHTML = html;
}

// ============== TOGGLE PANEL ==============
function toggleMatchCenter() {
  const panel = document.getElementById('matchCenterPanel');
  const fab = document.getElementById('mcFab');
  if (!panel) return;
  
  const isVisible = !panel.classList.contains('mc-hidden');
  
  if (isVisible) {
    // Hide panel, show FAB
    panel.classList.add('mc-hidden');
    if (fab) fab.classList.add('mc-fab-visible');
  } else {
    // Show panel, hide FAB
    panel.classList.remove('mc-hidden');
    if (fab) fab.classList.remove('mc-fab-visible');
  }
}

// ============== INIT ==============
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('mcToggle');
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMatchCenter();
    });
  }
  
  const fab = document.getElementById('mcFab');
  if (fab) {
    fab.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMatchCenter();
    });
  }
  
  const cacheInfo = document.getElementById('mcCacheInfo');
  if (cacheInfo) {
    cacheInfo.addEventListener('mouseenter', () => {
      updateCacheTooltip();
    });
    cacheInfo.addEventListener('click', (e) => {
      e.stopPropagation();
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('fcb_')) localStorage.removeItem(key);
      });
      updateMatchCenter();
    });
  }
  
  const refresh = document.getElementById('mcRefresh');
  if (refresh) {
    refresh.addEventListener('click', (e) => {
      e.stopPropagation();
      // Only clear live cache — fixtures/standings are expensive and rarely stale
      localStorage.removeItem('fcb_live');
      updateMatchCenter();
    });
  }
  
  // Clear fcb_ caches on extension install/update
  chrome.storage.local.get('fcb_clear_cache', (result) => {
    if (result.fcb_clear_cache) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('fcb_')) localStorage.removeItem(key);
      });
      chrome.storage.local.remove('fcb_clear_cache');
      console.log('[MatchCenter] Cleared caches after install/update');
    }
    // Initial load
    updateMatchCenter();
  });
});

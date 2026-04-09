// FC Barcelona News Ticker

let newsArticles = [];
let currentNewsIndex = 0;
let autoRotateInterval = null;

async function fetchBarcaNews() {
  // Start with curated FC Barcelona news immediately
  newsArticles = [
    {
      title: 'FC Barcelona Official News & Updates',
      link: 'https://www.fcbarcelona.com/en/news',
      source: 'FC Barcelona Official',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/200px-FC_Barcelona_%28crest%29.svg.png'
    },
    {
      title: 'Latest Match Results & Highlights',
      link: 'https://www.fcbarcelona.com/en/football/first-team/results',
      source: 'FC Barcelona',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/200px-FC_Barcelona_%28crest%29.svg.png'
    },
    {
      title: 'Team Squad & Player Profiles',
      link: 'https://www.fcbarcelona.com/en/football/first-team/players',
      source: 'FC Barcelona',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/200px-FC_Barcelona_%28crest%29.svg.png'
    },
    {
      title: 'Upcoming Fixtures & Schedule',
      link: 'https://www.fcbarcelona.com/en/football/first-team/schedule',
      source: 'FC Barcelona',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/200px-FC_Barcelona_%28crest%29.svg.png'
    },
    {
      title: 'FC Barcelona Videos & Media',
      link: 'https://www.fcbarcelona.com/en/videos',
      source: 'FC Barcelona',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/200px-FC_Barcelona_%28crest%29.svg.png'
    },
    {
      title: 'Club History & Achievements',
      link: 'https://www.fcbarcelona.com/en/club/history',
      source: 'FC Barcelona',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/200px-FC_Barcelona_%28crest%29.svg.png'
    },
    {
      title: 'Official FC Barcelona Store',
      link: 'https://store.fcbarcelona.com',
      source: 'FC Barcelona Shop',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/200px-FC_Barcelona_%28crest%29.svg.png'
    },
    {
      title: 'Camp Nou Stadium Information',
      link: 'https://www.fcbarcelona.com/en/club/facilities/camp-nou',
      source: 'FC Barcelona',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/200px-FC_Barcelona_%28crest%29.svg.png'
    }
  ];
  
  displayNews(0);
  // Only start auto-rotate if it's not already running
  if (!autoRotateInterval) {
    startAutoRotate();
  }
  
  // Try to fetch live news in background (optional)
  try {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://news.google.com/rss/search?q=FC+Barcelona&hl=en-US&gl=US&ceid=US:en')}&api_key=up8sg05sqghimsr54xe1awnaykczg3rnsqet36ri&count=10`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    console.log('RSS Feed Response:', data);
    
    if (data.status === 'ok' && data.items && data.items.length > 0) {
      newsArticles = data.items.map((item, index) => {
        let imageUrl = null;
        let sourceName = item.author || 'Google News';
        
        console.log(`Item ${index}:`, item.title);
        
        // Extract source name from title (Google News format: "Title - Source Name")
        let extractedSource = null;
        const titleMatch = item.title.match(/\s-\s(.+)$/);
        if (titleMatch && titleMatch[1]) {
          extractedSource = titleMatch[1].trim();
          console.log(`Extracted source from title: ${extractedSource}`);
        }
        
        // Use extracted source if available
        if (extractedSource) {
          sourceName = extractedSource;
        }
        
        // Map of known sources to their actual domains
        const knownDomains = {
          'The Athletic': 'theathletic.com',
          'The New York Times': 'nytimes.com',
          'ESPN': 'espn.com',
          'BBC Sport': 'bbc.com',
          'BBC': 'bbc.com',
          'beIN SPORTS': 'beinsports.com',
          'Barca Blaugranes': 'barcablaugranes.com',
          'Barca Universal': 'barcauniversal.com',
          'Marca': 'marca.com',
          'AS.com': 'as.com',
          'The Guardian': 'theguardian.com',
          'Sky Sports': 'skysports.com',
          'Goal.com': 'goal.com',
          'Goal': 'goal.com',
          'MSN': 'msn.com',
          'Footy Headlines': 'footyheadlines.com',
          'Sport': 'sport.es',
          'Mundo Deportivo': 'mundodeportivo.com',
          'UEFA.com': 'uefa.com',
          'UEFA': 'uefa.com',
          'FC Barcelona': 'fcbarcelona.com',
          'Reuters': 'reuters.com',
          'AP News': 'apnews.com',
          'Cybernews': 'cybernews.com',
          'Flashscore': 'flashscore.com'
        };
        
        // Try to match against known domains first
        let domain = null;
        for (const [source, url] of Object.entries(knownDomains)) {
          if (sourceName.includes(source)) {
            domain = url;
            console.log(`Matched known source: ${source} -> ${domain}`);
            break;
          }
        }
        
        // If no match, try to generate domain from source name
        if (!domain) {
          // Take only the first part if there are multiple sources (e.g., "Source1 - Source2")
          const firstSource = sourceName.split('-')[0].trim();
          domain = firstSource
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/g, '') + '.com';
          console.log(`Generated domain: ${domain} from source: ${firstSource}`);
        }
        
        // Use the domain's favicon
        imageUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        
        return {
          title: item.title || 'No title',
          link: item.link || '#',
          source: sourceName,
          imageUrl: imageUrl
        };
      });
      console.log('Final news articles:', newsArticles);
      // Don't call displayNews here - let the auto-rotation handle it
      // This prevents flickering when RSS loads in background
    }
  } catch (error) {
    console.error('Error fetching RSS:', error);
    console.log('Using curated news links');
  }
}

function extractImageFromDescription(description) {
  if (!description) return null;
  
  console.log('Extracting from description:', description.substring(0, 200));
  
  // Try to find image URL in description HTML
  // Method 1: Standard img tag
  let imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    console.log('Found img tag:', imgMatch[1]);
    return imgMatch[1];
  }
  
  // Method 2: Look for any image URL pattern
  imgMatch = description.match(/https?:\/\/[^\s<>"]+?\.(jpg|jpeg|png|gif|webp)/i);
  if (imgMatch && imgMatch[0]) {
    console.log('Found image URL:', imgMatch[0]);
    return imgMatch[0];
  }
  
  // Method 3: For Google News, try to extract from the article link itself
  // Google News articles often have thumbnails in their metadata
  const linkMatch = description.match(/href=["']([^"']+)["']/i);
  if (linkMatch && linkMatch[1]) {
    // Use a placeholder service to get Open Graph image
    // We'll use a generic approach: try to get favicon or use a screenshot service
    console.log('No image found in description, using fallback');
  }
  
  return null;
}

function displayNews(index) {
  if (newsArticles.length === 0) return;
  
  currentNewsIndex = index;
  const article = newsArticles[index];
  
  const newsImage = document.getElementById('newsImage');
  const newsTitle = document.getElementById('newsTitle');
  const newsSource = document.getElementById('newsSource');
  const newsTicker = document.getElementById('newsTicker');
  
  newsImage.src = article.imageUrl;
  newsImage.onerror = function() {
    this.src = 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/200px-FC_Barcelona_%28crest%29.svg.png';
  };
  
  newsTitle.textContent = article.title;
  newsSource.textContent = article.source;
  
  // Update click handler to open article
  newsTicker.onclick = (e) => {
    if (!e.target.classList.contains('news-nav-btn')) {
      window.open(article.link, '_blank');
    }
  };
}

function showError(message) {
  const newsTitle = document.getElementById('newsTitle');
  const newsSource = document.getElementById('newsSource');
  newsTitle.textContent = message;
  newsSource.textContent = '';
}

function nextNews() {
  if (newsArticles.length === 0) return;
  currentNewsIndex = (currentNewsIndex + 1) % newsArticles.length;
  displayNews(currentNewsIndex);
  resetAutoRotate();
}

function prevNews() {
  if (newsArticles.length === 0) return;
  currentNewsIndex = (currentNewsIndex - 1 + newsArticles.length) % newsArticles.length;
  displayNews(currentNewsIndex);
  resetAutoRotate();
}

function startAutoRotate() {
  if (autoRotateInterval) {
    clearInterval(autoRotateInterval);
  }
  autoRotateInterval = setInterval(() => {
    nextNews();
  }, 10000); // 10 seconds
}

function resetAutoRotate() {
  startAutoRotate();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const prevBtn = document.getElementById('prevNews');
  const nextBtn = document.getElementById('nextNews');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevNews();
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextNews();
    });
  }
  
  // Fetch news on load
  fetchBarcaNews();
  
  // Refresh news every 10 minutes
  setInterval(fetchBarcaNews, 600000);
});

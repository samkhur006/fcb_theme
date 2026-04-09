chrome.runtime.onInstalled.addListener(function() {
  // Signal new tab page to clear stale fcb_ caches on next load
  chrome.storage.local.set({ fcb_clear_cache: true });
  chrome.tabs.create({ url: chrome.runtime.getURL("newtab.html") });
});

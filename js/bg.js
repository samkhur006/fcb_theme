chrome.runtime.onInstalled.addListener(function() {

  chrome.tabs.create({ 
    url: "https://gameograf.com/?utm_source=Barcelona&utm_medium=install" 
  });

  chrome.tabs.create({ url: chrome.runtime.getURL("newtab.html") });
});

if (chrome.runtime.setUninstallURL) {
  chrome.runtime.setUninstallURL('https://gameograf.com/?utm_source=extension&utm_medium=install');
} else {
  console.warn("setUninstallURL not supported in this browser.");
}

indexedDB.databases().then((dbs) => {
  dbs.forEach((db) => {
    indexedDB.deleteDatabase(db.name);
    console.log(`Deleted IndexedDB database: ${db.name}`);
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const newsBar = document.getElementById("newsBar");
  const newsText = document.getElementById("newsText");
  const hideBtn = document.getElementById("hideNews");

  // Gizlenme kontrolü
  const hiddenUntil = localStorage.getItem("newsBarHiddenUntil");
  if (!hiddenUntil || Date.now() > parseInt(hiddenUntil)) {
    newsBar.classList.remove("hidden");
  } else {
    newsBar.classList.add("hidden");
  }

  let headlines = [];

  try {
    const res = await fetch("https://gameograf.com/wp-json/myplugin/v1/news");
    const data = await res.json();

    // Tarihe göre filtreleme: sadece geçmiş veya bugünün haberleri
    const today = new Date();
    headlines = data
      .map(post => ({ title: post.title, href: post.link }));

    if (!headlines.length) headlines.push({ title: "Yeni haber yok", href: "#" });

  } catch (err) {
    console.error("News could not be loaded:", err);
    headlines = [{ title: "News could not be loaded...", href: "#" }];
  }

  let index = 0;

  function showNextNews() {
    const { title, href } = headlines[index];
    newsText.textContent = title.length > 120 ? title.slice(0, 117) + "…" : title;
    newsText.onclick = () => window.open(href, "_blank");
    index = (index + 1) % headlines.length;
  }

  showNextNews();
  setInterval(showNextNews, 5000);

});

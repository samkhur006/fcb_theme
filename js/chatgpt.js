function createChatGptBox() {
  if (document.getElementById("chatGptBox")) return;

  const popup = document.createElement("div");
  popup.id = "chatGptBox";
  popup.className = "chatgpt-popup";
  popup.innerHTML = `
    <input type="text" id="chatGptInput" placeholder="Ask ChatGPT..." />
    <button id="chatGptSend">➤</button>
  `;
  document.body.appendChild(popup);

  const input = document.getElementById("chatGptInput");
  const send = document.getElementById("chatGptSend");

  function sendToChatGPT() {
    const query = input.value.trim();
    if (query) {
      const encoded = encodeURIComponent(query);
      window.open("https://chat.openai.com/?q=" + encoded, "_blank");
    }
  }

  send.addEventListener("click", sendToChatGPT);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendToChatGPT();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const icon = document.getElementById("chatgptIcon");

  icon.addEventListener("click", (e) => {
    e.stopPropagation(); // dış tıklamada kapanmaması için
    const box = document.getElementById("chatGptBox");
    if (box) {
      box.remove();
    } else {
      createChatGptBox();
      setTimeout(() => {
        const popup = document.getElementById("chatGptBox");
        if (popup) popup.classList.add("visible");
      }, 50);
    }
  });

  // Sayfanın herhangi boş bir yerine tıklayınca popup'ı kapat
  document.addEventListener("click", (e) => {
    const box = document.getElementById("chatGptBox");
    const icon = document.getElementById("chatgptIcon");
    if (box && !box.contains(e.target) && !icon.contains(e.target)) {
      box.remove();
    }
  });
});

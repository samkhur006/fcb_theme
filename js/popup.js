document.getElementById("uninstall-link").addEventListener("click", (event) => {
    event.preventDefault(); 
    if (confirm("Are you sure you want to remove this extension?")) {
        chrome.management.uninstallSelf({ showConfirmDialog: false }, () => {
            alert("The extension was removed successfully.");
        });
    }
});

document.getElementById("rate-us").addEventListener("click", function() {
    let extensionId = chrome.runtime.id; 
    let url = `https://chrome.google.com/webstore/detail/${extensionId}/reviews`;
    window.open(url, "_blank");
});

document.getElementById("more-extensions").addEventListener("click", function() {
    window.open("https://gameograf.com/top-100/", "_blank");
});

document.getElementById("privacy-policy").addEventListener("click", function() {
    window.open("https://gameograf.com/privacy-policy", "_blank");
});

document.addEventListener("DOMContentLoaded", () => {
    const popupContainer = document.getElementById("remote-popup");
    const lastShownKey = "popupLastShown";
    const showAgainAfter = 12 * 60 * 60 * 1000; // 12 saat

    fetch("https://api.gameograf.com/popup/message.json")
        .then((res) => {
            if (!res.ok) throw new Error("Failed to retrieve notification data");
            return res.json(); // JSON: { html: "...", timestamp: 1715376642000 }
        })
        .then((data) => {
            const { html, timestamp } = data;
            const lastShown = parseInt(localStorage.getItem(lastShownKey) || "0");

            const now = Date.now();

            if (timestamp > lastShown && (now - lastShown > showAgainAfter)) {
                // Güvenilir içerik olduğundan emin olmalısın
                popupContainer.innerHTML = html;

                const closeBtn = document.createElement("button");
                closeBtn.classList.add("close-btn");
                closeBtn.innerHTML = "&times;";
                closeBtn.style.position = "absolute";
                closeBtn.style.top = "5px";
                closeBtn.style.right = "10px";
                closeBtn.style.border = "none";
                closeBtn.style.background = "transparent";
                closeBtn.style.fontSize = "18px";
                closeBtn.style.cursor = "pointer";

                closeBtn.addEventListener("click", () => {
                    popupContainer.style.display = "none";
                    localStorage.setItem(lastShownKey, Date.now().toString()); // Kapatıldığında zamanı kaydet
                });

                popupContainer.appendChild(closeBtn);
                popupContainer.style.display = "block";
            }
        })
        .catch((err) => {
            console.error("Notification check failed:", err);
        });
});

document.getElementById("newNoteButton")?.addEventListener("click", (e) => {
    e.preventDefault();
    createStickyNote();
});

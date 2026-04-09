 loadNotes();  // Yapışkan notları yükle

function getRandomColor() {
    const colors = ["#FFD700", "#FFB6C1", "#ADFF2F", "#87CEFA", "#FFA07A", "#DA70D6"];
    return colors[Math.floor(Math.random() * colors.length)];
}

function createStickyNote(data = {}) {
    const id = data.id || Date.now().toString();

    const note = document.createElement("div");
    note.className = "sticky-note";
    note.style.backgroundColor = data.color || getRandomColor();

    note.style.left = data.left || `${Math.random() * 500}px`;
    note.style.top = data.top || `${Math.random() * 300}px`;
    note.dataset.id = id;

    const header = document.createElement("div");
    header.className = "sticky-header";

    const addBtn = document.createElement("button");
    addBtn.textContent = "+";
    addBtn.className = "sticky-button";
    addBtn.onclick = () => createStickyNote();

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "×";
    closeBtn.className = "sticky-button";
    closeBtn.onclick = () => {
        if (!textarea.value.trim() || confirm("Delete this note?")) {
            note.remove();
            saveNotes();
        }
    };

    header.appendChild(addBtn);
    header.appendChild(closeBtn);

    const textarea = document.createElement("textarea");
    textarea.placeholder = "Write something...";
    textarea.value = data.content || "";
    textarea.addEventListener("input", saveNotes);

    note.appendChild(header);
    note.appendChild(textarea);
    document.body.appendChild(note);

    makeDraggable(note);
    saveNotes();
}

function makeDraggable(el) {
    let offsetX = 0, offsetY = 0, isDragging = false;

    const header = el.querySelector(".sticky-header");
    if (!header) return;

    header.style.cursor = "move";

    header.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - el.offsetLeft;
        offsetY = e.clientY - el.offsetTop;
        el.style.zIndex = 9999;
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            el.style.left = `${e.clientX - offsetX}px`;
            el.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            el.style.zIndex = "";

            saveNotes();
        }
    });
}

function saveNotes() {
    const notes = Array.from(document.querySelectorAll(".sticky-note")).map(note => ({
        id: note.dataset.id,
        content: note.querySelector("textarea").value,
        color: note.style.backgroundColor,
        left: note.style.left,
        top: note.style.top
    }));
    localStorage.setItem("stickyNotes", JSON.stringify(notes));
}

function loadNotes() {
    const notes = JSON.parse(localStorage.getItem("stickyNotes") || "[]");
    notes.forEach(data => createStickyNote(data));
}

document.addEventListener("DOMContentLoaded", () => {
    loadNotes();
});
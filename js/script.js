let topSites = [];
let userShortcuts = [];
let deletedTopSites = [];

const videoUrl = "img/bg.mp4";

$(document).ready(function () {
    const sw = screen.width;
    const scale = sw / 1920;
    $("body").css("--scale", scale);

    if ($("#bgVdo").length === 0) {
        const videoElement = $('<video id="bgVdo" autoplay muted loop playsinline></video>');
        videoElement.attr("src", videoUrl);
        $("body").prepend(videoElement);
    }

    loadUserData();
    fetchTopSites();

    activateClock();
    handleSearch();
    handleCustomBackground();

    
});

// Kullanıcı verilerini localStorage'dan yükle
function loadUserData() {
    userShortcuts = JSON.parse(localStorage.getItem("userShortcuts") || "[]");
    deletedTopSites = JSON.parse(localStorage.getItem("deletedTopSites") || "[]");
}

// Kullanıcı verilerini localStorage'a kaydet
function saveUserData() {
    localStorage.setItem("userShortcuts", JSON.stringify(userShortcuts));
    localStorage.setItem("deletedTopSites", JSON.stringify(deletedTopSites));
}

// Chrome'un en çok ziyaret edilen sitelerini al
function fetchTopSites() {
    chrome.topSites.get((sites) => {
        topSites = sites.slice(0, 6).map(site => ({
            name: site.title,
            url: site.url,
            icon: null
        }));
        createShortcuts();
    });
}

// Kısayolları oluştur ve göster
function createShortcuts() {
    const shortcut_element = $("#shortcutContainer");
    shortcut_element.empty();

    // En çok ziyaret edilen sitelerden kullanıcı tarafından silinmiş olanları çıkar
    const filteredTopSites = topSites.filter(link => !deletedTopSites.includes(link.url));

    // Tüm kısayollar: En çok ziyaret edilenler + Kullanıcı ekledikleri
    const allShortcuts = [...filteredTopSites, ...userShortcuts];

    allShortcuts.forEach(link => {
        const icon_url = link.icon ? link.icon : `https://www.google.com/s2/favicons?domain=${link.url}&sz=48`;
        
        const element = $(`
            <div class="link">
                <a href="${link.url}" rel="noopener noreferrer" title="${link.url}" class="shortcutLink">
                    <img src="${icon_url}" alt="${link.name} icon" />
                    <p>${link.name}</p>
                </a>
                <a href="#" class="removeLink" title="Delete ${link.name} shortcut" data-url="${link.url}">
                    <span class="material-symbols-outlined">close</span>
                </a>
            </div>`);
        shortcut_element.append(element);
    });

    const createButton = $(`
        <div class="link">
            <a id="createShortcut" title="Add new shortcut" class="shortcutLink">
                <span class="material-symbols-outlined">add</span>
                <p>Add</p>
            </a>
        </div>`);
    shortcut_element.append(createButton);

    // Eventler
    $("#createShortcut").off("click").on("click", () => {
        $("#addShortcut").toggleClass("flex").toggleClass("none");
    });

    $(".removeLink").off("click").on("click", function (e) {
        e.preventDefault();
        const url = $(this).data("url");
        removeShortcut(url);
    });
}

function removeShortcut(url) {
    if (topSites.find(s => s.url === url)) {
        if (!deletedTopSites.includes(url)) {
            deletedTopSites.push(url);
        }
    } else {
        userShortcuts = userShortcuts.filter(s => s.url !== url);
    }
    saveUserData();
    createShortcuts();
}

$("#appendShortcut").off("click").on("click", () => {
    let link_name = $("#addName").val();
    let link_url = $("#addUrl").val();

    if (link_name && link_url) {
        if (!link_url.startsWith("http")) {
            link_url = `http://${link_url}`;
        }
        userShortcuts.push({ name: link_name, url: link_url });
        saveUserData();
        $("#addShortcut").toggleClass("flex").toggleClass("none");
        createShortcuts();
    }

    $("#addName").val("");
    $("#addUrl").val("");
});

function activateClock() {
    const time_element = $("#time");
    const today_element = $("#today");

    let is12HourFormat = true;

    function updateClock() {
        const date = new Date();
        let hh = date.getHours();
        let mm = date.getMinutes();
        let session = "";

        if (is12HourFormat) {
            session = hh >= 12 ? "PM" : "AM";
            hh = hh % 12 || 12;
        }

        hh = hh < 10 ? "0" + hh : hh;
        mm = mm < 10 ? "0" + mm : mm;

        time_element.text(`${hh}:${mm}${is12HourFormat ? " " + session : ""}`);

        const dayArray = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const monthArray = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        const todayStr = `${dayArray[date.getDay()]}, ${monthArray[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

        if (today_element.text() !== todayStr) {
            today_element.text(todayStr);
        }
    }

    time_element.on("click", () => {
        is12HourFormat = !is12HourFormat;
        updateClock();
    });

    updateClock();
    setInterval(updateClock, 60000);
}

function handleSearch() {
    const search_trigger = $("#searchTrigger");
    const search_input = $("#searchInput");

    search_input.keyup((e) => {
        if (e.keyCode === 13) {
            search_trigger.click();
        }
    });

    search_trigger.click(() => {
        const query = search_input.val();
        if (query) {
            chrome.search.query({ text: query }, function (results) {
                if (results && results.length > 0) {
                    window.location.href = results[0].url;
                }
            });
        } else {
            search_input.attr("placeholder", "Enter something to search");
            setTimeout(() => search_input.attr("placeholder", "Search"), 2000);
        }
    });
}

function handleCustomBackground() {
    const add_custom = $("#addCustom");
    const remove_custom = $("#removeCustom");

    add_custom.click(() => {
        const file_input = $('<input type="file" accept="image/*" />');
        file_input.trigger("click");
        file_input.change(() => {
            const file = file_input[0].files[0];
            if (file.size > 3500000) {
                alert("File size is too big. Maximum is 3MB.");
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                custom_img = reader.result;
                localStorage.setItem("customImg", reader.result);
                setBackground();
            };
            reader.readAsDataURL(file);
        });
    });

    remove_custom.click(() => {
        custom_img = null;
        localStorage.removeItem("customImg");
        setBackground();
    });
}
document.addEventListener("DOMContentLoaded", () => {
  const icon = document.getElementById("calculatorIcon");
  if (icon) icon.addEventListener("click", createCalculatorPopup);
});

document.addEventListener("DOMContentLoaded", () => {
  const todoIcon = document.getElementById("todoIcon");
  if (todoIcon) {
    todoIcon.addEventListener("click", createTodoPopup);
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const hint = document.getElementById("toolsHint");
  const closeBtn = document.getElementById("closeHint");

  // Daha önce kapatılmış mı kontrol et
  if (!localStorage.getItem("toolsHintClosed")) {
    hint.classList.remove("hidden");
  }

  // Kapatma butonuna basılırsa
  closeBtn.addEventListener("click", () => {
    hint.classList.add("hidden");
    localStorage.setItem("toolsHintClosed", "true");
  });
});


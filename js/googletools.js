const googleToolsData = [
  { name: "Gmail", url: "https://mail.google.com/", logo: "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico" },
  { name: "Drive", url: "https://drive.google.com/", logo: "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png" },
  { name: "Docs", url: "https://docs.google.com/", logo: "https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_document_x32.png" },
  { name: "Sheets", url: "https://sheets.google.com/", logo: "https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_spreadsheet_x32.png" },
  { name: "Slides", url: "https://slides.google.com/", logo: "https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_presentation_x32.png" },
  { name: "Calendar", url: "https://calendar.google.com/", logo: "https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_24_2x.png" },
  { name: "Translate", url: "https://translate.google.com/", logo: "https://translate.google.com/favicon.ico" },
  { name: "Maps", url: "https://maps.google.com/", logo: "https://maps.google.com/favicon.ico" },
  { name: "YouTube", url: "https://youtube.com/", logo: "https://www.gstatic.com/marketing-cms/assets/images/58/3f/ac28ee8b450e9e21be9d1626708a/youtube.png" },
  { name: "News", url: "https://news.google.com/", logo: "https://www.gstatic.com/marketing-cms/assets/images/ec/ca/17131dff4c4fa87ba0491b991ae3/news.png" },
  { name: "Keep", url: "https://keep.google.com/", logo: "https://www.gstatic.com/images/branding/product/1x/keep_2020q4_48dp.png" },
  { name: "Photos", url: "https://photos.google.com/", logo: "https://ssl.gstatic.com/social/photosui/images/logo/1x/photos_64dp.png" },
  { name: "Forms", url: "https://forms.google.com/", logo: "https://ssl.gstatic.com/docs/doclist/images/mediatype/icon_1_form_x32.png" },
  { name: "Google Search", url: "https://www.google.com/", logo: "https://www.google.com/favicon.ico" },
  { name: "Contacts", url: "https://contacts.google.com/", logo: "https://ssl.gstatic.com/images/branding/product/1x/contacts_2022_48dp.png" },
  { name: "Blogger", url: "https://www.blogger.com/", logo: "https://www.blogger.com/favicon.ico" },
  { name: "Play Store", url: "https://play.google.com/", logo: "https://play.google.com/favicon.ico" },
];

function createGoogleToolsPopup() {
  const existingPopup = document.getElementById("googleToolsPopup");
  if (existingPopup) {
    existingPopup.remove();
    return;
  }

  const popup = document.createElement("div");
  popup.id = "googleToolsPopup";

  const grid = document.createElement("div");
  grid.className = "grid";

  googleToolsData.forEach(tool => {
    const a = document.createElement("a");
    a.href = tool.url;
    a.target = "_blank";
    a.title = tool.name;

    const img = document.createElement("img");
    img.src = tool.logo;
    img.alt = tool.name;

    const p = document.createElement("p");
    p.textContent = tool.name;

    a.appendChild(img);
    a.appendChild(p);
    grid.appendChild(a);
  });

  popup.appendChild(grid);
  document.body.appendChild(popup);

  popup.style.display = "block";

  function clickOutsideListener(e) {
    const icon = document.getElementById("googleAppsIcon");
    if (!popup.contains(e.target) && e.target !== icon) {
      popup.remove();
      document.removeEventListener("click", clickOutsideListener);
    }
  }

  setTimeout(() => {
    document.addEventListener("click", clickOutsideListener);
  }, 0);
}

document.addEventListener("DOMContentLoaded", function () {
  const googleIcon = document.getElementById("googleAppsIcon");
  if (googleIcon) {
    googleIcon.addEventListener("click", createGoogleToolsPopup);

  }
});

class SkipToContent {
  static init() {
    const skipLink = document.querySelector(".skip-to-content");
    if (!skipLink) return;

    // Handle klik
    skipLink.addEventListener("click", (e) => {
      e.preventDefault();
      this.focusMainContent();
    });

    // Handle keyboard navigation
    skipLink.addEventListener("focus", () => {
      skipLink.classList.add("focused");
    });

    skipLink.addEventListener("blur", () => {
      skipLink.classList.remove("focused");
    });

    // Modern approach dengan :focus-visible
    skipLink.addEventListener("focusin", () => {
      if (this.isKeyboardEvent()) {
        skipLink.classList.add("focused");
      }
    });

    skipLink.addEventListener("focusout", () => {
      skipLink.classList.remove("focused");
    });
  }

  static focusMainContent() {
    const mainContent = document.getElementById("main-content");
    if (!mainContent) return;

    // Tambahkan tabindex sementara
    mainContent.setAttribute("tabindex", "-1");

    // Fokuskan dan scroll
    mainContent.focus();
    mainContent.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    // Hapus tabindex setelah selesai
    setTimeout(() => {
      mainContent.removeAttribute("tabindex");
    }, 1000);
  }

  static isKeyboardEvent() {
    return (
      document.documentElement.classList.contains("keyboard-user") ||
      this.wasKeyboardUsedRecently()
    );
  }

  static wasKeyboardUsedRecently() {
    // Deteksi apakah interaksi terakhir menggunakan keyboard
    return (
      document.documentElement.getAttribute("data-last-input") === "keyboard"
    );
  }
}

// Deteksi awal penggunaan keyboard
document.addEventListener("keydown", () => {
  document.documentElement.classList.add("keyboard-user");
  document.documentElement.setAttribute("data-last-input", "keyboard");
});

// Deteksi penggunaan mouse/touch
document.addEventListener("mousedown", () => {
  document.documentElement.classList.remove("keyboard-user");
  document.documentElement.setAttribute("data-last-input", "mouse");
});

document.addEventListener("touchstart", () => {
  document.documentElement.classList.remove("keyboard-user");
  document.documentElement.setAttribute("data-last-input", "touch");
});

export default SkipToContent;

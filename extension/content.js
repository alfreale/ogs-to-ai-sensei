function onGamePage() {
  return /\/game\//.test(location.pathname);
}

function waitForElement(selector, callback, root = document) {
  // Immediate check so we don't miss elements already present
  const found = root.querySelector(selector);
  if (found) {
    callback(found);
    return;
  }
  const obs = new MutationObserver(() => {
    const el = root.querySelector(selector);
    if (el) {
      obs.disconnect();
      callback(el);
    }
  });
  obs.observe(root.body || root, { childList: true, subtree: true });
}

function injectButton() {
  if (!onGamePage()) return;

  // Prevent duplicates
  if (document.querySelector('.TooltipContainer[data-ogs-ai-sensei]')) return;

  const dockElement = document.querySelector(".Dock");
  if (!dockElement) {
    // If Dock isn't here yet, wait for it and try again
    waitForElement(".Dock", () => injectButton());
    return;
  }

  const customDiv = document.createElement("div");
  customDiv.className = "TooltipContainer";
  customDiv.setAttribute("data-ogs-ai-sensei", "true");

  const innerDiv = document.createElement("div");
  const link = document.createElement("a");
  link.href = "https://ai-sensei.com/upload?sgf=" + encodeURIComponent(window.location.href);
  link.target = "_blank";

  const icon = document.createElement("i");
  icon.className = "fa";
  const img = document.createElement("img");
  img.src = "https://ai-sensei.com/img/Logo_192.png";
  img.alt = "AI Sensei";
  img.style.width = "28px";
  img.style.height = "28px";
  icon.appendChild(img);

  link.appendChild(icon);
  link.appendChild(document.createTextNode("AI Sensei"));

  innerDiv.appendChild(link);
  customDiv.appendChild(innerDiv);

  dockElement.appendChild(customDiv);
}

// Initial run
if (onGamePage()) {
  waitForElement(".Dock", () => injectButton());
}

// SPA navigation handling
(function listenForUrlChanges() {
  let lastUrl = location.href;

  const fireIfChanged = () => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      // On route change, wait again for Dock and inject
      if (onGamePage()) waitForElement(".Dock", () => injectButton());
    }
  };

  new MutationObserver(fireIfChanged).observe(document, { subtree: true, childList: true });

  const _ps = history.pushState;
  history.pushState = function () {
    _ps.apply(this, arguments);
    window.dispatchEvent(new Event("locationchange"));
  };
  const _rs = history.replaceState;
  history.replaceState = function () {
    _rs.apply(this, arguments);
    window.dispatchEvent(new Event("locationchange"));
  };
  window.addEventListener("popstate", () => window.dispatchEvent(new Event("locationchange")));
  window.addEventListener("locationchange", fireIfChanged);
})();

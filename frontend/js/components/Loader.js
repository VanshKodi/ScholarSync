// js/components/Loader.js

let loaderEl = null;

function createLoader() {
  loaderEl = document.createElement("div");
  loaderEl.id = "global-loader";

  loaderEl.innerHTML = `
    <div class="loader-backdrop">
      <div class="loader-box">
        <div class="spinner"></div>
        <p id="loader-text">Loading...</p>
      </div>
    </div>
  `;

  document.body.appendChild(loaderEl);
}

export function showLoader(text = "Loading...") {
  if (!loaderEl) createLoader();
  loaderEl.querySelector("#loader-text").textContent = text;
  loaderEl.style.display = "flex";
}

export function hideLoader() {
  if (loaderEl) loaderEl.style.display = "none";
}
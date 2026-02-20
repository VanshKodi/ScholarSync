// Loader CSS - hardcoded directly in component
const loaderCSS = `
  #global-loader {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: none;
  }
  .loader-backdrop {
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .loader-box {
    text-align: center;
    font-family: system-ui, Arial, sans-serif;
  }
  .spinner {
    width: 42px;
    height: 42px;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #5b6cff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 12px;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// Inject styles once
if (!document.getElementById('loader-styles')) {
  const style = document.createElement('style');
  style.id = 'loader-styles';
  style.textContent = loaderCSS;
  document.head.appendChild(style);
}

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

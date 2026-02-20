// Documents CSS - hardcoded directly in component
const documentsCSS = `
  .documents-view {
    padding: 0;
  }
  .documents-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  .documents-header h2 {
    color: #1f2937;
    font-size: 1.5rem;
  }
`;

// Inject styles once
if (!document.getElementById('documents-styles')) {
  const style = document.createElement('style');
  style.id = 'documents-styles';
  style.textContent = documentsCSS;
  document.head.appendChild(style);
}

import { DocumentUpload } from "../../components/DocumentUpload.js";

export function Documents(container) {
  const wrapper = document.createElement("div");
  wrapper.className = "documents-view";

  const header = document.createElement("div");
  header.className = "documents-header";

  const title = document.createElement("h2");
  title.textContent = "Documents";

  const upload = DocumentUpload();

  header.appendChild(title);
  

  wrapper.appendChild(header);
  container.appendChild(wrapper);
}

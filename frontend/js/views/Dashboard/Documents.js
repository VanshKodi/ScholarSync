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
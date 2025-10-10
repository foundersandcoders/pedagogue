import { c as create_ssr_component, a as subscribe, b as each, e as escape, v as validate_component, d as createEventDispatcher, f as add_attribute } from './ssr-280359d3.js';
import '@xmldom/xmldom';
import { d as derived, w as writable } from './index2-96eb7775.js';

const css$2 = {
  code: '.upload-area.svelte-17magzn.svelte-17magzn{flex:1}.upload-area.svelte-17magzn h3.svelte-17magzn{margin-bottom:1rem;color:#495057;font-weight:600}.drop-zone.svelte-17magzn.svelte-17magzn{border:2px dashed #dee2e6;border-radius:8px;padding:3rem 2rem;text-align:center;cursor:pointer;transition:all 0.3s ease;min-height:200px;display:flex;align-items:center;justify-content:center}.drop-zone.svelte-17magzn.svelte-17magzn:hover:not(.uploading){border-color:#007bff;background-color:#f8f9ff}.drop-zone.drag-over.svelte-17magzn.svelte-17magzn{border-color:#007bff;background-color:#f0f8ff;border-style:solid}.drop-zone.success.svelte-17magzn.svelte-17magzn{border-color:#28a745;background-color:#f8fff8}.drop-zone.error.svelte-17magzn.svelte-17magzn{border-color:#dc3545;background-color:#fff8f8}.drop-zone.uploading.svelte-17magzn.svelte-17magzn{cursor:wait;border-color:#007bff;background-color:#f8f9ff}.upload-status.svelte-17magzn.svelte-17magzn{display:flex;flex-direction:column;align-items:center;gap:1rem}.upload-prompt.svelte-17magzn.svelte-17magzn{display:flex;flex-direction:column;align-items:center;gap:0.5rem}.upload-icon.svelte-17magzn.svelte-17magzn{font-size:2.5rem;margin-bottom:0.5rem}.upload-prompt.svelte-17magzn p.svelte-17magzn{margin:0;color:#6c757d}.upload-hint.svelte-17magzn.svelte-17magzn{font-size:0.85rem;color:#999 !important}.checkmark.svelte-17magzn.svelte-17magzn{width:3rem;height:3rem;border-radius:50%;background-color:#28a745;color:white;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:bold}.error-icon.svelte-17magzn.svelte-17magzn{width:3rem;height:3rem;border-radius:50%;background-color:#dc3545;color:white;display:flex;align-items:center;justify-content:center;font-size:1.2rem}.error-message.svelte-17magzn.svelte-17magzn{color:#dc3545;font-weight:500;max-width:300px;word-break:break-word}.reset-button.svelte-17magzn.svelte-17magzn,.retry-button.svelte-17magzn.svelte-17magzn{background:transparent;border:2px solid currentColor;border-radius:6px;padding:0.5rem 1rem;font-size:0.9rem;cursor:pointer;transition:all 0.2s ease;font-family:inherit}.reset-button.svelte-17magzn.svelte-17magzn{color:#28a745}.reset-button.svelte-17magzn.svelte-17magzn:hover{background-color:#28a745;color:white}.retry-button.svelte-17magzn.svelte-17magzn{color:#dc3545}.retry-button.svelte-17magzn.svelte-17magzn:hover{background-color:#dc3545;color:white}code.svelte-17magzn.svelte-17magzn{background:#f8f9fa;padding:0.2rem 0.4rem;border-radius:4px;font-family:"SF Mono", Consolas, monospace;font-size:0.9em}',
  map: null
};
const FileUpload = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { fileType } = $$props;
  let { uploadState = "idle" } = $$props;
  let { error = null } = $$props;
  createEventDispatcher();
  const titles = {
    projects: "Project Briefs",
    skills: "Additional Skills Development",
    research: "Research Topics"
  };
  const expectedFiles = {
    projects: "projects.xml",
    skills: "skills.xml",
    research: "research.xml"
  };
  const title = titles[fileType];
  const expectedFile = expectedFiles[fileType];
  if ($$props.fileType === void 0 && $$bindings.fileType && fileType !== void 0)
    $$bindings.fileType(fileType);
  if ($$props.uploadState === void 0 && $$bindings.uploadState && uploadState !== void 0)
    $$bindings.uploadState(uploadState);
  if ($$props.error === void 0 && $$bindings.error && error !== void 0)
    $$bindings.error(error);
  $$result.css.add(css$2);
  return `<div class="upload-area svelte-17magzn"><h3 class="svelte-17magzn">${escape(title)}</h3> <div class="${[
    "drop-zone svelte-17magzn",
    " " + (uploadState === "uploading" ? "uploading" : "") + " " + (uploadState === "success" ? "success" : "") + " " + (uploadState === "error" ? "error" : "")
  ].join(" ").trim()}" role="button" tabindex="0">${uploadState === "uploading" ? `<div class="upload-status svelte-17magzn"><div class="spinner"></div> <p>Processing ${escape(expectedFile)}...</p></div>` : `${uploadState === "success" ? `<div class="upload-status success svelte-17magzn"><div class="checkmark svelte-17magzn" data-svelte-h="svelte-hgx0e5">✓</div> <p><strong>${escape(expectedFile)}</strong> uploaded successfully</p> <button type="button" class="reset-button svelte-17magzn" data-svelte-h="svelte-jpi8md">Upload different file</button></div>` : `${uploadState === "error" ? `<div class="upload-status error svelte-17magzn"><div class="error-icon svelte-17magzn" data-svelte-h="svelte-5q5zkp">⚠</div> <p class="error-message svelte-17magzn">${escape(error)}</p> <button type="button" class="retry-button svelte-17magzn" data-svelte-h="svelte-1wbh8u5">Try again</button></div>` : `<div class="upload-prompt svelte-17magzn"><div class="upload-icon svelte-17magzn" data-svelte-h="svelte-1chayn1">📄</div> <p class="svelte-17magzn">Drop <code class="svelte-17magzn">${escape(expectedFile)}</code> here or click to browse</p> <p class="upload-hint svelte-17magzn" data-svelte-h="svelte-1tf7hqo">XML files only, max 1MB</p></div>`}`}`}</div> <input type="file" accept=".xml,text/xml,application/xml" style="display: none;"> </div>`;
});
const css$1 = {
  code: '.structured-form.svelte-1hg9b65.svelte-1hg9b65{max-width:800px;margin:0 auto}.structured-form.svelte-1hg9b65 h2.svelte-1hg9b65{margin-bottom:0.5rem;color:#333}.form-description.svelte-1hg9b65.svelte-1hg9b65{color:#666;margin-bottom:2rem}.form-grid.svelte-1hg9b65.svelte-1hg9b65{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;margin-bottom:1.5rem}.form-field.svelte-1hg9b65.svelte-1hg9b65{display:flex;flex-direction:column}.form-field.full-width.svelte-1hg9b65.svelte-1hg9b65{grid-column:1 / -1;margin-bottom:1.5rem}label.svelte-1hg9b65.svelte-1hg9b65{margin-bottom:0.5rem;font-weight:600;color:#495057;font-size:0.95rem}.required.svelte-1hg9b65.svelte-1hg9b65{color:#dc3545}.optional.svelte-1hg9b65.svelte-1hg9b65{font-weight:400;color:#999;font-size:0.85rem}input[type="number"].svelte-1hg9b65.svelte-1hg9b65,input[type="date"].svelte-1hg9b65.svelte-1hg9b65,input[type="text"].svelte-1hg9b65.svelte-1hg9b65,select.svelte-1hg9b65.svelte-1hg9b65,textarea.svelte-1hg9b65.svelte-1hg9b65{padding:0.75rem;border:1px solid #dee2e6;border-radius:6px;font-size:1rem;font-family:inherit;transition:border-color 0.2s}input.svelte-1hg9b65.svelte-1hg9b65:focus,select.svelte-1hg9b65.svelte-1hg9b65:focus,textarea.svelte-1hg9b65.svelte-1hg9b65:focus{outline:none;border-color:#007bff;box-shadow:0 0 0 3px rgba(0, 123, 255, 0.1)}input.error.svelte-1hg9b65.svelte-1hg9b65{border-color:#dc3545}.error-message.svelte-1hg9b65.svelte-1hg9b65{color:#dc3545;font-size:0.85rem;margin-top:0.25rem}.field-hint.svelte-1hg9b65.svelte-1hg9b65{color:#999;font-size:0.85rem;margin-top:0.25rem}.tech-suggestions.svelte-1hg9b65.svelte-1hg9b65{display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1rem}.tech-suggestion.svelte-1hg9b65.svelte-1hg9b65{padding:0.5rem 0.75rem;border:1px solid #dee2e6;background:white;border-radius:6px;cursor:pointer;font-size:0.9rem;transition:all 0.2s}.tech-suggestion.svelte-1hg9b65.svelte-1hg9b65:hover{border-color:#007bff;background:#f8f9ff}.tech-suggestion.selected.svelte-1hg9b65.svelte-1hg9b65{background:#007bff;color:white;border-color:#007bff}.tech-input-group.svelte-1hg9b65.svelte-1hg9b65{display:flex;gap:0.5rem}.tech-input-group.svelte-1hg9b65 input.svelte-1hg9b65{flex:1}.add-tech-btn.svelte-1hg9b65.svelte-1hg9b65{padding:0.75rem 1.5rem;background:#28a745;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600;transition:background 0.2s}.add-tech-btn.svelte-1hg9b65.svelte-1hg9b65:hover:not(:disabled){background:#218838}.add-tech-btn.svelte-1hg9b65.svelte-1hg9b65:disabled{background:#6c757d;cursor:not-allowed;opacity:0.5}.selected-technologies.svelte-1hg9b65.svelte-1hg9b65{display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:1rem}.tech-tag.svelte-1hg9b65.svelte-1hg9b65{display:inline-flex;align-items:center;gap:0.5rem;padding:0.5rem 0.75rem;background:#e7f3ff;color:#0056b3;border-radius:6px;font-size:0.9rem}.remove-tech.svelte-1hg9b65.svelte-1hg9b65{background:none;border:none;color:#0056b3;font-size:1.2rem;cursor:pointer;padding:0;line-height:1;font-weight:bold}.remove-tech.svelte-1hg9b65.svelte-1hg9b65:hover{color:#dc3545}textarea.svelte-1hg9b65.svelte-1hg9b65{resize:vertical;min-height:100px}.form-section.svelte-1hg9b65.svelte-1hg9b65{margin:2rem 0;padding:1.5rem;background:#f8f9fa;border-radius:8px}.form-section.svelte-1hg9b65 h3.svelte-1hg9b65{margin:0 0 1rem 0;color:#333;font-size:1.1rem}.checkbox-group.svelte-1hg9b65.svelte-1hg9b65{display:flex;flex-direction:column;gap:1rem}.checkbox-label.svelte-1hg9b65.svelte-1hg9b65{display:flex;align-items:flex-start;gap:0.75rem;cursor:pointer;padding:0.75rem;border-radius:6px;transition:background 0.2s}.checkbox-label.svelte-1hg9b65.svelte-1hg9b65:hover{background:rgba(0, 123, 255, 0.05)}.checkbox-label.svelte-1hg9b65 input[type="checkbox"].svelte-1hg9b65{margin-top:0.25rem;width:1.25rem;height:1.25rem;cursor:pointer}.checkbox-text.svelte-1hg9b65.svelte-1hg9b65{display:flex;flex-direction:column;gap:0.25rem}.checkbox-hint.svelte-1hg9b65.svelte-1hg9b65{font-weight:400;color:#666;font-size:0.9rem}.form-actions.svelte-1hg9b65.svelte-1hg9b65{display:flex;justify-content:flex-end;margin-top:2rem;padding-top:2rem;border-top:1px solid #e9ecef}.submit-btn.svelte-1hg9b65.svelte-1hg9b65{padding:1rem 2rem;background:#007bff;color:white;border:none;border-radius:8px;font-size:1.1rem;font-weight:600;cursor:pointer;transition:all 0.3s ease;display:inline-flex;align-items:center;gap:0.5rem}.submit-btn.svelte-1hg9b65.svelte-1hg9b65:hover{background:#0056b3;transform:translateY(-1px);box-shadow:0 4px 12px rgba(0, 123, 255, 0.3)}@media(max-width: 768px){.form-grid.svelte-1hg9b65.svelte-1hg9b65{grid-template-columns:1fr}}',
  map: null
};
const StructuredInputForm = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { formData = {
    logistics: { duration: 3, startDate: "" },
    learners: {
      cohortSize: 12,
      experience: {
        prereq: "1-3 years",
        focus: "limited experience"
      }
    },
    content: { techs: [], info: "" },
    model: {
      enableResearch: true,
      useExtendedThinking: true
    }
  } } = $$props;
  createEventDispatcher();
  let techInput = "";
  let errors = {};
  const techList = {
    language: ["JavaScript", "Python", "TypeScript"],
    frontEnd: ["React", "Svelte", "Vue"],
    backEnd: ["Express"],
    runtime: ["Deno", "Node.js"],
    db: ["MongoDB", "PostgreSQL"],
    devOps: ["AWS", "Docker", "GitHub Actions"],
    other: ["FastAPI", "GraphQL", "REST APIs"]
  };
  const commonTechnologies = [].concat(techList.language, techList.frontEnd, techList.backEnd, techList.runtime, techList.db, techList.devOps, techList.other);
  if ($$props.formData === void 0 && $$bindings.formData && formData !== void 0)
    $$bindings.formData(formData);
  $$result.css.add(css$1);
  return `<div class="structured-form svelte-1hg9b65"><h2 class="svelte-1hg9b65" data-svelte-h="svelte-79a5t5">Module Context</h2> <p class="form-description svelte-1hg9b65" data-svelte-h="svelte-lpwr41">Provide additional context to help Claude generate a more targeted module
    specification.</p> <form> <div class="form-grid svelte-1hg9b65"> <div class="form-field svelte-1hg9b65"><label for="duration" class="svelte-1hg9b65" data-svelte-h="svelte-66pjix">Module Duration (weeks)
          <span class="required svelte-1hg9b65">*</span></label> <input id="duration" type="number" min="1" max="52" required class="${["svelte-1hg9b65", errors.logistics?.duration ? "error" : ""].join(" ").trim()}"${add_attribute("value", formData.logistics.duration, 0)}> ${errors.logistics?.duration ? `<span class="error-message svelte-1hg9b65">${escape(errors.logistics?.duration)}</span>` : ``}</div>  <div class="form-field svelte-1hg9b65"><label for="cohort" class="svelte-1hg9b65" data-svelte-h="svelte-eunork">Expected Cohort Size
          <span class="required svelte-1hg9b65">*</span></label> <input id="cohort" type="number" min="1" max="1000" required class="${["svelte-1hg9b65", errors.learners?.cohortSize ? "error" : ""].join(" ").trim()}"${add_attribute("value", formData.learners.cohortSize, 0)}> ${errors.learners?.cohortSize ? `<span class="error-message svelte-1hg9b65">${escape(errors.learners?.cohortSize)}</span>` : ``}</div>  <div class="form-field svelte-1hg9b65"><label for="skillPrereq" class="svelte-1hg9b65" data-svelte-h="svelte-1cneef3">Learners&#39; Experience in Related Fields
          <span class="required svelte-1hg9b65">*</span></label> <select id="skillPrereq" required class="svelte-1hg9b65"><option value="&lt;= 1 year" data-svelte-h="svelte-1i2000p">Less Than a Year</option><option value="1-3 years" data-svelte-h="svelte-1phqjec">1-3 Years</option><option value=">= 4 years" data-svelte-h="svelte-8e6sch">4 or More Years</option></select></div>  <div class="form-field svelte-1hg9b65"><label for="skillFocus" class="svelte-1hg9b65" data-svelte-h="svelte-1w5leod">Learners&#39; Experience in This Course&#39;s Focus
          <span class="required svelte-1hg9b65">*</span></label> <select id="skillFocus" required class="svelte-1hg9b65"><option value="no experience" data-svelte-h="svelte-vp0n1o">No Experience</option><option value="limited experience" data-svelte-h="svelte-an1j66">Limited Experience</option><option value="skilled amateur" data-svelte-h="svelte-4l2zho">Skilled Amateur</option><option value="current professional" data-svelte-h="svelte-hixojy">Current Professional</option></select></div>  <div class="form-field svelte-1hg9b65"><label for="delivery" class="svelte-1hg9b65" data-svelte-h="svelte-1few7et">Expected Delivery Date
          <span class="optional svelte-1hg9b65">(optional)</span></label> <input id="delivery" type="date" class="${["svelte-1hg9b65", errors.logistics?.startDate ? "error" : ""].join(" ").trim()}"${add_attribute("value", formData.logistics.startDate, 0)}> ${errors.logistics?.startDate ? `<span class="error-message svelte-1hg9b65">${escape(errors.logistics?.startDate)}</span>` : ``} <span class="field-hint svelte-1hg9b65" data-svelte-h="svelte-1s629m9">Helps research find current, relevant information</span></div></div>  <div class="form-field full-width svelte-1hg9b65"><label for="technologies" class="svelte-1hg9b65" data-svelte-h="svelte-gbp8i9">Required Technologies &amp; Techniques
        <span class="optional svelte-1hg9b65">(optional)</span></label> <div class="tech-suggestions svelte-1hg9b65">${each(commonTechnologies, (tech) => {
    return `<button type="button" class="${[
      "tech-suggestion svelte-1hg9b65",
      formData.content.techs.includes(tech) ? "selected" : ""
    ].join(" ").trim()}">${escape(tech)} ${formData.content.techs.includes(tech) ? `✓` : ``} </button>`;
  })}</div> <div class="tech-input-group svelte-1hg9b65"><input id="technologies" type="text" placeholder="Or add custom technology..." class="svelte-1hg9b65"${add_attribute("value", techInput, 0)}> <button type="button" class="add-tech-btn svelte-1hg9b65" ${!techInput.trim() ? "disabled" : ""}>Add</button></div> ${formData.content.techs.length > 0 ? `<div class="selected-technologies svelte-1hg9b65">${each(formData.content.techs, (tech) => {
    return `<span class="tech-tag svelte-1hg9b65">${escape(tech)} <button type="button" class="remove-tech svelte-1hg9b65" aria-label="${"Remove " + escape(tech, true)}">×</button> </span>`;
  })}</div>` : ``}</div>  <div class="form-field full-width svelte-1hg9b65"><label for="info" class="svelte-1hg9b65" data-svelte-h="svelte-92ick">Additional Information
        <span class="optional svelte-1hg9b65">(optional)</span></label> <textarea id="info" rows="4" placeholder="Any specific requirements, constraints, or goals for this module..." class="svelte-1hg9b65">${escape(formData.content.info || "")}</textarea> <span class="field-hint svelte-1hg9b65">${escape(formData.content.info.length)} / 1000 characters</span></div>  <div class="form-section svelte-1hg9b65"><h3 class="svelte-1hg9b65" data-svelte-h="svelte-yovzgo">Generation Options</h3> <div class="checkbox-group svelte-1hg9b65"><label class="checkbox-label svelte-1hg9b65"><input type="checkbox" class="svelte-1hg9b65"${add_attribute("checked", formData.model.enableResearch, 1)}> <span class="checkbox-text svelte-1hg9b65" data-svelte-h="svelte-csbkjn"><strong>Enable Deep Research</strong> <span class="checkbox-hint svelte-1hg9b65">Use web search to find current best practices and technologies</span></span></label> <label class="checkbox-label svelte-1hg9b65"><input type="checkbox" class="svelte-1hg9b65"${add_attribute("checked", formData.model.useExtendedThinking, 1)}> <span class="checkbox-text svelte-1hg9b65" data-svelte-h="svelte-12vqcj7"><strong>Use Extended Thinking</strong> <span class="checkbox-hint svelte-1hg9b65">Allow Claude more time to reason about complex requirements</span></span></label></div></div>  <div class="form-actions svelte-1hg9b65" data-svelte-h="svelte-185y7ep"><button type="submit" class="submit-btn svelte-1hg9b65">Continue to Review →</button></div></form> </div>`;
});
const currentStep = writable(1);
const projectsFile = writable(null);
const skillsFile = writable(null);
const researchFile = writable(null);
const structuredInput = writable({
  logistics: {
    duration: 3,
    startDate: ""
  },
  learners: {
    cohortSize: 12,
    experience: {
      prereq: "<= 1 year",
      focus: "limited experience"
    }
  },
  content: {
    techs: [],
    info: ""
  },
  model: {
    enableResearch: true,
    useExtendedThinking: true
  }
});
const uploadStates = writable({
  projects: "idle",
  skills: "idle",
  research: "idle"
});
const uploadErrors = writable({
  projects: null,
  skills: null,
  research: null
});
const allFilesUploaded = derived(
  [projectsFile, skillsFile, researchFile],
  ([$projectsFile, $skillsFile, $researchFile]) => $projectsFile !== null && $skillsFile !== null && $researchFile !== null
);
const canProceedToStep2 = derived(
  [allFilesUploaded, uploadStates],
  ([$allFilesUploaded, $uploadStates]) => $allFilesUploaded && $uploadStates.projects === "success" && $uploadStates.skills === "success" && $uploadStates.research === "success"
);
const css = {
  code: '.container.svelte-172akvm.svelte-172akvm{max-width:1000px;margin:0 auto}header.svelte-172akvm.svelte-172akvm{text-align:center;margin-bottom:3rem}header.svelte-172akvm h1.svelte-172akvm{font-size:3rem;color:#333;margin-bottom:0.5rem}header.svelte-172akvm p.svelte-172akvm{color:#666;font-size:1.1rem}.workflow.svelte-172akvm.svelte-172akvm{background:white;border-radius:12px;box-shadow:0 4px 16px rgba(0, 0, 0, 0.1);overflow:hidden}.steps.svelte-172akvm.svelte-172akvm{display:flex;background:#f8f9fa;padding:1rem;border-bottom:1px solid #e9ecef}.step.svelte-172akvm.svelte-172akvm{display:flex;align-items:center;flex:1;padding:0.5rem;position:relative}.step.svelte-172akvm.svelte-172akvm:not(:last-child)::after{content:"→";position:absolute;right:-0.5rem;color:#ccc;font-weight:bold}.step-number.svelte-172akvm.svelte-172akvm{width:2rem;height:2rem;border-radius:50%;background:#e9ecef;display:flex;align-items:center;justify-content:center;font-weight:bold;margin-right:0.5rem;font-size:0.9rem}.step.active.svelte-172akvm .step-number.svelte-172akvm{background:#007bff;color:white}.step.completed.svelte-172akvm .step-number.svelte-172akvm{background:#28a745;color:white}.step-name.svelte-172akvm.svelte-172akvm{font-size:0.9rem;color:#495057}.step.active.svelte-172akvm .step-name.svelte-172akvm{color:#007bff;font-weight:600}.content.svelte-172akvm.svelte-172akvm{padding:2rem}.upload-section.svelte-172akvm h2.svelte-172akvm{margin-bottom:1rem;color:#333}.upload-section.svelte-172akvm p.svelte-172akvm{color:#666;margin-bottom:2rem}.upload-areas.svelte-172akvm.svelte-172akvm{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1.5rem;margin-bottom:2rem}@media(max-width: 1024px){.upload-areas.svelte-172akvm.svelte-172akvm{grid-template-columns:1fr}}.proceed-section.svelte-172akvm.svelte-172akvm{text-align:center;padding-top:2rem;border-top:1px solid #e9ecef}.proceed-button.svelte-172akvm.svelte-172akvm{background:#007bff;color:white;border:none;border-radius:8px;padding:1rem 2rem;font-size:1.1rem;font-weight:600;cursor:pointer;transition:all 0.3s ease;display:inline-flex;align-items:center;gap:0.5rem}.proceed-button.svelte-172akvm.svelte-172akvm:hover{background:#0056b3;transform:translateY(-1px);box-shadow:0 4px 12px rgba(0, 123, 255, 0.3)}.placeholder.svelte-172akvm.svelte-172akvm{text-align:center;padding:4rem 2rem;color:#666}.generation-header.svelte-172akvm.svelte-172akvm{display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem}.generation-header.svelte-172akvm h2.svelte-172akvm{margin:0;color:#333}.back-button.svelte-172akvm.svelte-172akvm{background:white;color:#495057;border:1px solid #dee2e6;border-radius:6px;padding:0.5rem 1rem;font-size:0.9rem;cursor:pointer;transition:all 0.2s}.back-button.svelte-172akvm.svelte-172akvm:hover:not(:disabled){background:#e9ecef}.back-button.svelte-172akvm.svelte-172akvm:disabled{opacity:0.5;cursor:not-allowed}.loading-state.svelte-172akvm.svelte-172akvm{text-align:center;padding:4rem 2rem}.spinner.svelte-172akvm.svelte-172akvm{width:50px;height:50px;border:4px solid #f3f3f3;border-top:4px solid #007bff;border-radius:50%;animation:svelte-172akvm-spin 1s linear infinite;margin:0 auto 1.5rem auto}@keyframes svelte-172akvm-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.loading-state.svelte-172akvm p.svelte-172akvm{font-size:1.1rem;color:#495057;margin:0.5rem 0}.loading-hint.svelte-172akvm.svelte-172akvm{font-size:0.9rem !important;color:#999 !important}.error-state.svelte-172akvm.svelte-172akvm{text-align:center;padding:3rem 2rem;background:#f8d7da;border:1px solid #f5c6cb;border-radius:8px}.error-icon.svelte-172akvm.svelte-172akvm{font-size:3rem;color:#721c24;margin-bottom:1rem}.error-state.svelte-172akvm h3.svelte-172akvm{color:#721c24;margin:0 0 0.5rem 0}.error-state.svelte-172akvm p.svelte-172akvm{color:#721c24;margin:0 0 1.5rem 0}.retry-button.svelte-172akvm.svelte-172akvm{background:#dc3545;color:white;border:none;border-radius:6px;padding:0.75rem 1.5rem;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.2s}.retry-button.svelte-172akvm.svelte-172akvm:hover{background:#c82333}.empty-generation.svelte-172akvm.svelte-172akvm{text-align:center;padding:4rem 2rem}.empty-generation.svelte-172akvm p.svelte-172akvm{font-size:1.1rem;color:#666;margin-bottom:2rem}.generate-button.svelte-172akvm.svelte-172akvm{background:#007bff;color:white;border:none;border-radius:8px;padding:1rem 2rem;font-size:1.1rem;font-weight:600;cursor:pointer;transition:all 0.3s ease}.generate-button.svelte-172akvm.svelte-172akvm:hover{background:#0056b3;transform:translateY(-1px);box-shadow:0 4px 12px rgba(0, 123, 255, 0.3)}.result-section.svelte-172akvm.svelte-172akvm{display:flex;flex-direction:column;gap:1.5rem}.action-buttons.svelte-172akvm.svelte-172akvm{display:flex;justify-content:center;gap:1rem}.btn-secondary.svelte-172akvm.svelte-172akvm{background:white;color:#495057;border:1px solid #dee2e6;border-radius:6px;padding:0.75rem 1.5rem;font-size:1rem;font-weight:600;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:0.5rem}.btn-secondary.svelte-172akvm.svelte-172akvm:hover{background:#e9ecef}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $structuredInput, $$unsubscribe_structuredInput;
  let $$unsubscribe_researchFile;
  let $$unsubscribe_skillsFile;
  let $$unsubscribe_projectsFile;
  let $currentStep, $$unsubscribe_currentStep;
  let $uploadStates, $$unsubscribe_uploadStates;
  let $uploadErrors, $$unsubscribe_uploadErrors;
  let $canProceedToStep2, $$unsubscribe_canProceedToStep2;
  $$unsubscribe_structuredInput = subscribe(structuredInput, (value) => $structuredInput = value);
  $$unsubscribe_researchFile = subscribe(researchFile, (value) => value);
  $$unsubscribe_skillsFile = subscribe(skillsFile, (value) => value);
  $$unsubscribe_projectsFile = subscribe(projectsFile, (value) => value);
  $$unsubscribe_currentStep = subscribe(currentStep, (value) => $currentStep = value);
  $$unsubscribe_uploadStates = subscribe(uploadStates, (value) => $uploadStates = value);
  $$unsubscribe_uploadErrors = subscribe(uploadErrors, (value) => $uploadErrors = value);
  $$unsubscribe_canProceedToStep2 = subscribe(canProceedToStep2, (value) => $canProceedToStep2 = value);
  const steps = ["Upload Files", "Add Context", "Generate Module"];
  $$result.css.add(css);
  $$unsubscribe_structuredInput();
  $$unsubscribe_researchFile();
  $$unsubscribe_skillsFile();
  $$unsubscribe_projectsFile();
  $$unsubscribe_currentStep();
  $$unsubscribe_uploadStates();
  $$unsubscribe_uploadErrors();
  $$unsubscribe_canProceedToStep2();
  return `${$$result.head += `<!-- HEAD_svelte-1u006gg_START -->${$$result.title = `<title>Pedagogue - Module Generator</title>`, ""}<!-- HEAD_svelte-1u006gg_END -->`, ""} <div class="container svelte-172akvm"><header class="svelte-172akvm" data-svelte-h="svelte-18kz6uh"><h1 class="svelte-172akvm">Pedagogue</h1> <p class="svelte-172akvm">AI-powered module specification generator for peer-led courses</p></header> <main class="workflow svelte-172akvm"><nav class="steps svelte-172akvm">${each(steps, (step, index) => {
    return `<div class="${[
      "step svelte-172akvm",
      ($currentStep === index + 1 ? "active" : "") + " " + ($currentStep > index + 1 ? "completed" : "")
    ].join(" ").trim()}"><span class="step-number svelte-172akvm">${escape(index + 1)}</span> <span class="step-name svelte-172akvm">${escape(step)}</span> </div>`;
  })}</nav> <div class="content svelte-172akvm"> ${$currentStep === 1 ? `<section class="upload-section svelte-172akvm"><h2 class="svelte-172akvm" data-svelte-h="svelte-qgdr5y">Upload Module Files</h2> <p class="svelte-172akvm" data-svelte-h="svelte-1vdkls3">Upload your three XML files to begin: project briefs, additional
            skills, and research topics.</p> <div class="upload-areas svelte-172akvm">${validate_component(FileUpload, "FileUpload").$$render(
    $$result,
    {
      fileType: "projects",
      uploadState: $uploadStates.projects,
      error: $uploadErrors.projects
    },
    {},
    {}
  )} ${validate_component(FileUpload, "FileUpload").$$render(
    $$result,
    {
      fileType: "skills",
      uploadState: $uploadStates.skills,
      error: $uploadErrors.skills
    },
    {},
    {}
  )} ${validate_component(FileUpload, "FileUpload").$$render(
    $$result,
    {
      fileType: "research",
      uploadState: $uploadStates.research,
      error: $uploadErrors.research
    },
    {},
    {}
  )}</div> ${$canProceedToStep2 ? `<div class="proceed-section svelte-172akvm"><button type="button" class="proceed-button svelte-172akvm" data-svelte-h="svelte-obni2h">Continue to Context →</button></div>` : ``}</section>` : `${$currentStep === 2 ? `<section class="analysis-section">${validate_component(StructuredInputForm, "StructuredInputForm").$$render($$result, { formData: $structuredInput }, {}, {})}</section>` : `${$currentStep === 3 ? `<section class="generation-section"><div class="generation-header svelte-172akvm"><h2 class="svelte-172akvm" data-svelte-h="svelte-1mdfre8">Module Generation</h2> <button type="button" class="back-button svelte-172akvm" ${""}>← Back to Context</button></div> ${`${`${`<div class="empty-generation svelte-172akvm"><p class="svelte-172akvm" data-svelte-h="svelte-1na1esz">Ready to generate your module specification</p> <button type="button" class="generate-button svelte-172akvm" data-svelte-h="svelte-64s30s">Generate Module</button></div>`}`}`}</section>` : `<section class="placeholder svelte-172akvm"><p>Step ${escape($currentStep)} - ${escape(steps[$currentStep - 1])}</p> <p data-svelte-h="svelte-1qplcr6">Implementation coming soon...</p></section>`}`}`}</div></main> </div>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-11be30ed.js.map

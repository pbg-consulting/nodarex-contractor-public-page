// app.js (FULL FILE)
// This version supports:
// 1) Home page: https://nodarex-contractor-public-page.pages.dev/  -> loads /contractor.sample.json
// 2) Slug route: https://nodarex-contractor-public-page.pages.dev/contractor-johnsmithplumbing -> loads /data/johnsmithplumbing.json
// 3) Keeps your existing UI render + modal + gallery behavior, but fixes the broken modal toggle code.

// ---------------------------
// Application State
// ---------------------------
let appState = {
  contractor: null,
  currentPage: "home",
  scrollPosition: 0,
  isModalOpen: false,
  isGalleryOpen: false,
  currentGalleryIndex: 0,
  gallery: [],
};

// Initialize Application
document.addEventListener("DOMContentLoaded", initializeApp);

async function initializeApp() {
  try {
    const data = await loadContractorData();
    appState.contractor = data;

    renderPage();
    attachEventListeners();
  } catch (error) {
    console.error("Failed to initialize app:", error);
    renderErrorState();
  }
}

// ---------------------------
// Data Loader (IMPORTANT)
// ---------------------------
async function loadContractorData() {
  // Supports:
  // /contractor-johnsmithplumbing  -> /data/johnsmithplumbing.json
  // /                             -> /contractor.sample.json

  const path = window.location.pathname.replace(/\/+$/, "");
  const match = path.match(/\/contractor-([^/]+)$/);
  const slug = match ? match[1] : null;

  const url = slug ? `/data/${slug}.json` : `/contractor.sample.json`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load contractor data: ${url} (${response.status})`);
  }
  return response.json();
}

// ---------------------------
// Main Render
// ---------------------------
function renderPage() {
  const appRoot = document.getElementById("app-root");
  const contractor = appState.contractor;

  if (!appRoot) return;

  if (!contractor) {
    appRoot.innerHTML = '<div class="empty-state">No contractor data available</div>';
    return;
  }

  let html = "";

  html += renderHeroSection(contractor);

  if (hasTrustData(contractor)) {
    html += renderTrustSection(contractor);
  }

  if (contractor.about) {
    html += renderAboutSection(contractor);
  }

  if (contractor.services && contractor.services.length > 0) {
    html += renderServicesSection(contractor);
  }

  if (contractor.gallery && contractor.gallery.length > 0) {
    html += renderGallerySection(contractor);
    appState.gallery = contractor.gallery;
  } else {
    appState.gallery = [];
  }

  if (contractor.reviews && contractor.reviews.length > 0) {
    html += renderReviewsSection(contractor);
  }

  if (hasCredentialsData(contractor)) {
    html += renderCredentialsSection(contractor);
  }

  html += renderStandardsSection();
  html += renderFooter();

  appRoot.innerHTML = html;
}

// ---------------------------
// Sections
// ---------------------------
function renderHeroSection(contractor) {
  // Accept both your old field names and your new JSON names
  const name = sanitize(contractor.name || contractor.business_name || "Contractor");
  const category = sanitize(contractor.primary_category || contractor.category || "");
  const serviceArea = sanitize(contractor.service_area || contractor.location || "");
  const description = sanitize(contractor.description || "");

  return `
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-header">
            <div class="hero-title">
              <h1>${name}</h1>
              ${category ? `<span class="hero-badge">${category}</span>` : ""}
            </div>
            <div class="hero-meta">
              ${
                serviceArea
                  ? `
                <div class="hero-meta-item">
                  <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span>${serviceArea}</span>
                </div>
              `
                  : ""
              }
            </div>
          </div>

          ${description ? `<p class="hero-description">${description}</p>` : ""}

          <div class="hero-cta">
            <button class="btn btn-primary btn-request-service" type="button">Request Service</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderTrustSection(contractor) {
  const trustItems = [];

  const years = contractor.years_in_business;
  if (years) {
    trustItems.push({ label: "Years in Business", value: years, badge: null });
  }

  const licensed = contractor.is_licensed ?? contractor.licensed;
  if (licensed) {
    trustItems.push({ label: "Licensed", value: "Yes", badge: "verified" });
  }

  const insured = contractor.is_insured ?? contractor.insured;
  if (insured) {
    trustItems.push({ label: "Insured", value: "Yes", badge: "verified" });
  }

  const verified = contractor.is_verified ?? contractor.verified;
  if (verified) {
    trustItems.push({ label: "Verified by NODAREX", value: "Yes", badge: "verified" });
  }

  if (trustItems.length === 0) return "";

  let html = `<section class="trust"><div class="container"><div class="trust-grid">`;

  trustItems.forEach((item) => {
    html += `
      <div class="trust-item">
        <span class="trust-label">${sanitize(item.label)}</span>
        <div class="trust-value">${sanitize(String(item.value))}</div>
        ${
          item.badge === "verified"
            ? `
          <span class="trust-badge">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 10-1.414 1.414L9 13l4.707-4.707z" clip-rule="evenodd"></path>
            </svg>
            Verified
          </span>
        `
            : ""
        }
      </div>
    `;
  });

  html += `</div></div></section>`;
  return html;
}

function renderAboutSection(contractor) {
  const about = sanitize(contractor.about);
  return `
    <section class="about">
      <div class="container">
        <h2>About</h2>
        <p>${about}</p>
      </div>
    </section>
  `;
}

function renderServicesSection(contractor) {
  const services = (contractor.services || []).slice(0, 10);
  let html = `<section class="services"><div class="container"><h2>Services</h2><div class="services-list">`;

  services.forEach((service) => {
    html += `<div class="service-pill">${sanitize(service)}</div>`;
  });

  html += `</div></div></section>`;
  return html;
}

function renderGallerySection(contractor) {
  const images = (contractor.gallery || []).slice(0, 12);
  let html = `<section class="gallery"><div class="container"><h2>Projects</h2><div class="gallery-grid">`;

  images.forEach((image, index) => {
    const url = image.url || image;
    const alt = image.alt || "Project image";

    html += `
      <div class="gallery-item" data-index="${index}">
        <img src="${sanitize(url)}" alt="${sanitize(alt)}" loading="lazy">
        <div class="gallery-overlay">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"></path>
          </svg>
        </div>
      </div>
    `;
  });

  html += `</div></div></section>`;
  return html;
}

function renderReviewsSection(contractor) {
  const reviews = contractor.reviews || [];
  const rating = contractor.rating || 0;
  const reviewCount = reviews.length;

  if (reviewCount === 0) return "";

  let html = `
    <section class="reviews">
      <div class="container">
        <div class="reviews-header">
          <div class="reviews-rating">
            <div class="rating-score">
              <span class="rating-value">${Number(rating).toFixed(1)}</span>
            </div>
            <div class="rating-stars">
              ${renderStars(Math.round(rating))}
            </div>
            <div class="rating-count">${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}</div>
          </div>
        </div>
        <div class="reviews-list">
  `;

  reviews.slice(0, 3).forEach((review) => {
    const reviewDate = review.date
      ? new Date(review.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : "";

    html += `
      <div class="review-card">
        <div class="review-header">
          <span class="review-author">${sanitize(review.author || "Anonymous")}</span>
          ${reviewDate ? `<span class="review-date">${sanitize(reviewDate)}</span>` : ""}
        </div>
        <div class="review-stars">
          ${renderStars(review.rating || 5)}
        </div>
        <p class="review-text">${sanitize(review.text || "")}</p>
      </div>
    `;
  });

  html += `</div></div></section>`;
  return html;
}

function renderCredentialsSection(contractor) {
  const credentials = [];

  if (contractor.license_number && contractor.license_state) {
    credentials.push({ label: "License Number", value: `${contractor.license_number} (${contractor.license_state})` });
  }

  if (contractor.insurance_provider) {
    credentials.push({ label: "Insurance Provider", value: contractor.insurance_provider });
  }

  if (credentials.length === 0) return "";

  let html = `<section class="credentials"><div class="container"><h2>Credentials</h2><div class="credentials-grid">`;

  credentials.forEach((cred) => {
    html += `
      <div class="credential-item">
        <div class="credential-label">${sanitize(cred.label)}</div>
        <div class="credential-value">${sanitize(cred.value)}</div>
      </div>
    `;
  });

  html += `</div></div></section>`;
  return html;
}

function renderStandardsSection() {
  return `
    <section class="standards">
      <div class="container">
        <div class="standards-content">
          <h3>NODAREX Standards</h3>
          <p>
            This contractor has been verified through the NODAREX vetting process and meets our standards for quality and reliability.
            Continued access to this network is contingent upon maintaining these standards and can be revoked at any time for violations of NODAREX policies.
          </p>
        </div>
      </div>
    </section>
  `;
}

function renderFooter() {
  return `
    <footer>
      <div class="container">
        <div class="footer-content">
          <p class="footer-text">Powered by <a href="https://nodarex.com" class="footer-link">NODAREX</a></p>
          <p class="footer-text">Professional contractor network and service platform</p>
        </div>
      </div>
    </footer>
  `;
}

// ---------------------------
// Helpers
// ---------------------------
function renderStars(count) {
  let html = "";
  for (let i = 0; i < 5; i++) {
    html += `
      <svg class="star" fill="${i < count ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    `;
  }
  return html;
}

function hasTrustData(contractor) {
  return !!(
    contractor.is_licensed ||
    contractor.is_insured ||
    contractor.is_verified ||
    contractor.licensed ||
    contractor.insured ||
    contractor.verified ||
    contractor.years_in_business
  );
}

function hasCredentialsData(contractor) {
  return !!((contractor.license_number && contractor.license_state) || contractor.insurance_provider);
}

function sanitize(text) {
  if (text === null || text === undefined) return "";
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

function renderErrorState() {
  const appRoot = document.getElementById("app-root");
  if (!appRoot) return;

  appRoot.innerHTML = `
    <div class="container" style="padding-top: 3rem;">
      <div class="empty-state">
        <h2>Unable to Load Contractor Profile</h2>
        <p>Please check the contractor data and try again.</p>
      </div>
    </div>
  `;
}

// ---------------------------
// Event Listeners
// ---------------------------
function attachEventListeners() {
  // Request Service Modal
  const requestBtn = document.querySelector(".btn-request-service");
  const modal = document.getElementById("request-modal");
  const modalClose = document.querySelector(".modal-close");
  const modalOverlay = modal ? modal.querySelector(".modal-overlay") : null;
  const requestFormEl = document.getElementById("request-form");

  requestBtn && requestBtn.addEventListener("click", openModal);
  modalClose && modalClose.addEventListener("click", closeModal);
  modalOverlay && modalOverlay.addEventListener("click", closeModal);
  requestFormEl && requestFormEl.addEventListener("submit", handleFormSubmit);

  // Gallery Modal
  const galleryModal = document.getElementById("gallery-modal");
  const galleryClose = document.querySelector(".gallery-close");
  const galleryOverlay = galleryModal ? galleryModal.querySelector(".modal-overlay") : null;
  const galleryItems = document.querySelectorAll(".gallery-item");
  const galleryPrev = document.querySelector(".gallery-prev");
  const galleryNext = document.querySelector(".gallery-next");

  galleryItems.forEach((item) => item.addEventListener("click", openGallery));

  galleryClose && galleryClose.addEventListener("click", closeGallery);
  galleryOverlay && galleryOverlay.addEventListener("click", closeGallery);
  galleryPrev && galleryPrev.addEventListener("click", previousImage);
  galleryNext && galleryNext.addEventListener("click", nextImage);

  // Keyboard Navigation
  document.addEventListener("keydown", handleKeyPress);

  // Close modals on escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (appState.isModalOpen) closeModal();
      if (appState.isGalleryOpen) closeGallery();
    }
  });
}

// ---------------------------
// Modal Functions
// ---------------------------
function setModalUI(isOpen) {
  const appRoot = document.getElementById("app-root");
  const requestForm = document.querySelector(".request-form");
  if (appRoot) appRoot.style.overflow = isOpen ? "hidden" : "";
  if (requestForm) requestForm.style.display = isOpen ? "flex" : "flex";
}

function openModal() {
  const modal = document.getElementById("request-modal");
  const appRoot = document.getElementById("app-root");

  if (!modal || !appRoot) return;

  appState.scrollPosition = appRoot.scrollTop;
  appState.isModalOpen = true;

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");

  setModalUI(true);
}

function closeModal() {
  const modal = document.getElementById("request-modal");
  const appRoot = document.getElementById("app-root");

  if (!modal || !appRoot) return;

  appState.isModalOpen = false;

  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");

  setModalUI(false);

  // Reset form
  const form = document.getElementById("request-form");
  if (form) form.reset();

  const requestForm = document.querySelector(".request-form");
  if (requestForm) requestForm.style.display = "flex";

  const success = document.getElementById("form-success");
  if (success) success.style.display = "none";

  // Restore scroll position
  setTimeout(() => {
    appRoot.scrollTop = appState.scrollPosition;
  }, 0);
}

function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const payload = {
    timestamp: new Date().toISOString(),
    contractor_slug: appState.contractor?.slug || "unknown",
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    description: formData.get("description"),
    contact_method: formData.get("contact_method"),
  };

  console.log("Service Request Submitted:", payload);

  // Show success message
  const requestForm = document.querySelector(".request-form");
  if (requestForm) requestForm.style.display = "none";

  const success = document.getElementById("form-success");
  if (success) success.style.display = "flex";
}

// ---------------------------
// Gallery Functions
// ---------------------------
function openGallery(e) {
  const item = e.currentTarget;
  const index = parseInt(item.dataset.index, 10);

  appState.currentGalleryIndex = Number.isFinite(index) ? index : 0;

  const appRoot = document.getElementById("app-root");
  if (appRoot) appState.scrollPosition = appRoot.scrollTop;

  appState.isGalleryOpen = true;

  const modal = document.getElementById("gallery-modal");
  if (!modal) return;

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");

  if (appRoot) appRoot.style.overflow = "hidden";

  updateGalleryImage();
}

function closeGallery() {
  const modal = document.getElementById("gallery-modal");
  const appRoot = document.getElementById("app-root");
  if (!modal || !appRoot) return;

  appState.isGalleryOpen = false;

  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");

  appRoot.style.overflow = "";

  setTimeout(() => {
    appRoot.scrollTop = appState.scrollPosition;
  }, 0);
}

function updateGalleryImage() {
  const image = appState.gallery[appState.currentGalleryIndex];
  const galleryImage = document.getElementById("gallery-image");
  const counter = document.getElementById("gallery-counter");

  if (!image || !galleryImage || !counter) return;

  const url = image.url || image;
  const alt = image.alt || "Project image";

  galleryImage.src = url;
  galleryImage.alt = alt;

  counter.textContent = `${appState.currentGalleryIndex + 1} / ${appState.gallery.length}`;
}

function nextImage() {
  if (!appState.gallery || appState.gallery.length === 0) return;
  appState.currentGalleryIndex = (appState.currentGalleryIndex + 1) % appState.gallery.length;
  updateGalleryImage();
}

function previousImage() {
  if (!appState.gallery || appState.gallery.length === 0) return;
  appState.currentGalleryIndex = (appState.currentGalleryIndex - 1 + appState.gallery.length) % appState.gallery.length;
  updateGalleryImage();
}

function handleKeyPress(e) {
  if (!appState.isGalleryOpen) return;

  if (e.key === "ArrowRight") nextImage();
  if (e.key === "ArrowLeft") previousImage();
}

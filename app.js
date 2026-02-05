// Application State
let appState = {
  contractor: null,
  currentPage: 'home',
  scrollPosition: 0,
  isModalOpen: false,
  isGalleryOpen: false,
  currentGalleryIndex: 0,
  gallery: []
};

// Initialize Application
document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
  try {
    // Load contractor data
    const data = await loadContractorData();
    appState.contractor = data;
    
    // Render the page
    renderPage();
    
    // Attach event listeners
    attachEventListeners();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    renderErrorState();
  }
}

// Load contractor data from JSON
async function loadContractorData() {
  const response = await fetch('./contractor.sample.json');
  if (!response.ok) {
    throw new Error('Failed to load contractor data');
  }
  return response.json();
}

// Main render function
function renderPage() {
  const appRoot = document.getElementById('app-root');
  const contractor = appState.contractor;
  
  if (!contractor) {
    appRoot.innerHTML = '<div class="empty-state">No contractor data available</div>';
    return;
  }

  let html = '';

  // Hero Section
  html += renderHeroSection(contractor);

  // Trust Indicators
  if (hasTrustData(contractor)) {
    html += renderTrustSection(contractor);
  }

  // About Section
  if (contractor.about) {
    html += renderAboutSection(contractor);
  }

  // Services Section
  if (contractor.services && contractor.services.length > 0) {
    html += renderServicesSection(contractor);
  }

  // Gallery Section
  if (contractor.gallery && contractor.gallery.length > 0) {
    html += renderGallerySection(contractor);
    appState.gallery = contractor.gallery;
  }

  // Reviews Section
  if (contractor.reviews && contractor.reviews.length > 0) {
    html += renderReviewsSection(contractor);
  }

  // Credentials Section
  if (hasCredentialsData(contractor)) {
    html += renderCredentialsSection(contractor);
  }

  // Standards Section
  html += renderStandardsSection();

  // Footer
  html += renderFooter();

  appRoot.innerHTML = html;
}

// Hero Section
function renderHeroSection(contractor) {
  const name = sanitize(contractor.name || 'Contractor');
  const category = sanitize(contractor.primary_category || '');
  const serviceArea = sanitize(contractor.service_area || '');
  const description = sanitize(contractor.description || '');

  let html = `
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-header">
            <div class="hero-title">
              <h1>${name}</h1>
              ${category ? `<span class="hero-badge">${category}</span>` : ''}
            </div>
            <div class="hero-meta">
              ${serviceArea ? `
                <div class="hero-meta-item">
                  <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span>${serviceArea}</span>
                </div>
              ` : ''}
            </div>
          </div>
          ${description ? `<p class="hero-description">${description}</p>` : ''}
          <div class="hero-cta">
            <button class="btn btn-primary btn-request-service">Request Service</button>
          </div>
        </div>
      </div>
    </section>
  `;

  return html;
}

// Trust Indicators Section
function renderTrustSection(contractor) {
  const trustItems = [];

  if (contractor.years_in_business) {
    trustItems.push({
      label: 'Years in Business',
      value: contractor.years_in_business,
      badge: null
    });
  }

  if (contractor.is_licensed) {
    trustItems.push({
      label: 'Licensed',
      value: 'Yes',
      badge: 'verified'
    });
  }

  if (contractor.is_insured) {
    trustItems.push({
      label: 'Insured',
      value: 'Yes',
      badge: 'verified'
    });
  }

  if (contractor.is_verified) {
    trustItems.push({
      label: 'Verified by NODAREX',
      value: 'Yes',
      badge: 'verified'
    });
  }

  if (trustItems.length === 0) return '';

  let html = '<section class="trust"><div class="container"><div class="trust-grid">';

  trustItems.forEach(item => {
    html += `
      <div class="trust-item">
        <span class="trust-label">${item.label}</span>
        <div class="trust-value">${item.value}</div>
        ${item.badge === 'verified' ? `
          <span class="trust-badge">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-2.77 3.066 3.066 0 00-3.58 3.03A3.066 3.066 0 006.267 3.455zm9.8 8.334c.652-1.65.193-3.978-1.769-5.231-1.667.02-3.29.181-4.486.52a2.585 2.585 0 00-1.287 4.04 2.997 2.997 0 00-.725 1.491c-.108.662-.073 1.147.04 1.case.16.537.551 1.076 1.157 1.428.086.05.18.084.277.114.9.406 1.93.894 2.884 1.694.957.8 1.882 1.904 2.26 3.19.378 1.286.038 2.644-.932 3.437-.971.794-2.354.693-3.476-.212-1.122-.905-2.135-2.119-3.042-3.67-.571 1.013-.823 2.237-.823 3.517 0 .8.123 1.582.357 2.322C4.248 19.397 2.261 19.25 1 18.063c-.755-.675-1.009-1.677-.659-2.506.35-.828 1.012-1.374 1.91-1.633.15-.041.299-.084.447-.128 1.396-.41 2.763-.91 4.022-1.536.645-.32 1.237-.757 1.76-1.287-.524-.744-.905-1.772-.905-2.987 0-.839.112-1.633.33-2.365z" clip-rule="evenodd"></path>
            </svg>
            Verified
          </span>
        ` : ''}
      </div>
    `;
  });

  html += '</div></div></section>';
  return html;
}

// About Section
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

// Services Section
function renderServicesSection(contractor) {
  const services = contractor.services.slice(0, 10);
  let html = '<section class="services"><div class="container"><h2>Services</h2><div class="services-list">';

  services.forEach(service => {
    html += `<div class="service-pill">${sanitize(service)}</div>`;
  });

  html += '</div></div></section>';
  return html;
}

// Gallery Section
function renderGallerySection(contractor) {
  const images = contractor.gallery.slice(0, 12);
  let html = '<section class="gallery"><div class="container"><h2>Projects</h2><div class="gallery-grid">';

  images.forEach((image, index) => {
    html += `
      <div class="gallery-item" data-index="${index}">
        <img src="${image.url}" alt="${sanitize(image.alt || 'Project image')}" loading="lazy">
        <div class="gallery-overlay">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"></path>
          </svg>
        </div>
      </div>
    `;
  });

  html += '</div></div></section>';
  return html;
}

// Reviews Section
function renderReviewsSection(contractor) {
  const reviews = contractor.reviews || [];
  const rating = contractor.rating || 0;
  const reviewCount = reviews.length;

  if (reviewCount === 0) return '';

  let html = `
    <section class="reviews">
      <div class="container">
        <div class="reviews-header">
          <div class="reviews-rating">
            <div class="rating-score">
              <span class="rating-value">${rating.toFixed(1)}</span>
            </div>
            <div class="rating-stars">
              ${renderStars(Math.round(rating))}
            </div>
            <div class="rating-count">${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}</div>
          </div>
        </div>
        <div class="reviews-list">
  `;

  reviews.slice(0, 3).forEach(review => {
    const reviewDate = review.date ? new Date(review.date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : '';

    html += `
      <div class="review-card">
        <div class="review-header">
          <span class="review-author">${sanitize(review.author || 'Anonymous')}</span>
          ${reviewDate ? `<span class="review-date">${reviewDate}</span>` : ''}
        </div>
        <div class="review-stars">
          ${renderStars(review.rating || 5)}
        </div>
        <p class="review-text">${sanitize(review.text || '')}</p>
      </div>
    `;
  });

  html += '</div></div></section>';
  return html;
}

// Credentials Section
function renderCredentialsSection(contractor) {
  const credentials = [];

  if (contractor.license_number && contractor.license_state) {
    credentials.push({
      label: 'License Number',
      value: `${contractor.license_number} (${contractor.license_state})`
    });
  }

  if (contractor.insurance_provider) {
    credentials.push({
      label: 'Insurance Provider',
      value: contractor.insurance_provider
    });
  }

  if (credentials.length === 0) return '';

  let html = '<section class="credentials"><div class="container"><h2>Credentials</h2><div class="credentials-grid">';

  credentials.forEach(cred => {
    html += `
      <div class="credential-item">
        <div class="credential-label">${cred.label}</div>
        <div class="credential-value">${sanitize(cred.value)}</div>
      </div>
    `;
  });

  html += '</div></div></section>';
  return html;
}

// Standards Section
function renderStandardsSection() {
  return `
    <section class="standards">
      <div class="container">
        <div class="standards-content">
          <h3>NODAREX Standards</h3>
          <p>This contractor has been verified through the NODAREX vetting process and meets our standards for quality and reliability. Continued access to this network is contingent upon maintaining these standards and can be revoked at any time for violations of NODAREX policies.</p>
        </div>
      </div>
    </section>
  `;
}

// Footer
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

// Helper Functions
function renderStars(count) {
  let html = '';
  for (let i = 0; i < 5; i++) {
    html += `
      <svg class="star" fill="${i < count ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
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
    contractor.years_in_business
  );
}

function hasCredentialsData(contractor) {
  return !!(
    (contractor.license_number && contractor.license_state) ||
    contractor.insurance_provider
  );
}

function sanitize(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderErrorState() {
  const appRoot = document.getElementById('app-root');
  appRoot.innerHTML = `
    <div class="container" style="padding-top: 3rem;">
      <div class="empty-state">
        <h2>Unable to Load Contractor Profile</h2>
        <p>Please check the contractor data and try again.</p>
      </div>
    </div>
  `;
}

// Event Listeners
function attachEventListeners() {
  // Request Service Modal
  const requestBtn = document.querySelector('.btn-request-service');
  const modal = document.getElementById('request-modal');
  const modalClose = document.querySelector('.modal-close');
  const modalOverlay = modal.querySelector('.modal-overlay');
  const requestForm = document.getElementById('request-form');

  requestBtn?.addEventListener('click', openModal);
  modalClose?.addEventListener('click', closeModal);
  modalOverlay?.addEventListener('click', closeModal);
  requestForm?.addEventListener('submit', handleFormSubmit);

  // Gallery Modal
  const galleryModal = document.getElementById('gallery-modal');
  const galleryClose = document.querySelector('.gallery-close');
  const galleryOverlay = galleryModal?.querySelector('.modal-overlay');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const galleryPrev = document.querySelector('.gallery-prev');
  const galleryNext = document.querySelector('.gallery-next');

  galleryItems.forEach(item => {
    item.addEventListener('click', openGallery);
  });

  galleryClose?.addEventListener('click', closeGallery);
  galleryOverlay?.addEventListener('click', closeGallery);
  galleryPrev?.addEventListener('click', previousImage);
  galleryNext?.addEventListener('click', nextImage);

  // Keyboard Navigation
  document.addEventListener('keydown', handleKeyPress);

  // Close modals on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (appState.isModalOpen) closeModal();
      if (appState.isGalleryOpen) closeGallery();
    }
  });
}

// Modal Functions
function openModal() {
  const modal = document.getElementById('request-modal');
  appState.scrollPosition = document.getElementById('app-root').scrollTop;
  appState.isModalOpen = true;
  
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  
  document.getElementById('app-root').style.overflow = 'hidden';
  const requestForm = document.querySelector(".request-form");
if (requestForm) requestForm.style.display = "flex";
const requestForm = document.querySelector(".request-form");
if (requestForm) requestForm.style.display = "none";
}

function closeModal() {
  const modal = document.getElementById('request-modal');
  appState.isModalOpen = false;
  
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  
  document.getElementById('app-root').style.overflow = '';
  
  // Reset form
  document.getElementById('request-form').reset();
  document.querySelector('.request-form')?.style.display = 'flex';
  document.getElementById('form-success').style.display = 'none';
  
  // Restore scroll position
  setTimeout(() => {
    document.getElementById('app-root').scrollTop = appState.scrollPosition;
  }, 0);
}

function handleFormSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const payload = {
    timestamp: new Date().toISOString(),
    contractor_slug: appState.contractor?.slug || 'unknown',
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    address: formData.get('address'),
    description: formData.get('description'),
    contact_method: formData.get('contact_method')
  };

  console.log('Service Request Submitted:', payload);
  
  // Show success message
  document.querySelector('.request-form').style.display = 'none';
  document.getElementById('form-success').style.display = 'flex';
}

// Gallery Functions
function openGallery(e) {
  const item = e.currentTarget;
  const index = parseInt(item.dataset.index, 10);
  
  appState.currentGalleryIndex = index;
  appState.scrollPosition = document.getElementById('app-root').scrollTop;
  appState.isGalleryOpen = true;
  
  const modal = document.getElementById('gallery-modal');
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  
  document.getElementById('app-root').style.overflow = 'hidden';
  
  updateGalleryImage();
}

function closeGallery() {
  const modal = document.getElementById('gallery-modal');
  appState.isGalleryOpen = false;
  
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  
  document.getElementById('app-root').style.overflow = '';
  
  // Restore scroll position
  setTimeout(() => {
    document.getElementById('app-root').scrollTop = appState.scrollPosition;
  }, 0);
}

function updateGalleryImage() {
  const image = appState.gallery[appState.currentGalleryIndex];
  const galleryImage = document.getElementById('gallery-image');
  const counter = document.getElementById('gallery-counter');
  
  if (galleryImage && image) {
    galleryImage.src = image.url;
    galleryImage.alt = image.alt || 'Project image';
    counter.textContent = `${appState.currentGalleryIndex + 1} / ${appState.gallery.length}`;
  }
}

function nextImage() {
  appState.currentGalleryIndex = (appState.currentGalleryIndex + 1) % appState.gallery.length;
  updateGalleryImage();
}

function previousImage() {
  appState.currentGalleryIndex = (appState.currentGalleryIndex - 1 + appState.gallery.length) % appState.gallery.length;
  updateGalleryImage();
}

function handleKeyPress(e) {
  if (!appState.isGalleryOpen) return;
  
  if (e.key === 'ArrowRight') {
    nextImage();
  } else if (e.key === 'ArrowLeft') {
    previousImage();
  }
}

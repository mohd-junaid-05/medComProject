import Auth from './auth.js';
import api from './api.js';

if (!Auth.requireAuth()) {
  throw new Error('Not authenticated');
}

const stockGrid = document.getElementById('stock-grid');
let currentCategory = 'all';

const categories = ['all', 'anatomy', 'cardiology', 'neurology', 'radiology', 'surgery'];

function renderFilters() {
  const filterBar = document.getElementById('filter-bar');
  if (!filterBar) return;

  filterBar.innerHTML = categories.map((cat) => `
    <button class="filter-btn ${cat === currentCategory ? 'active' : ''}" 
            onclick="filterImages('${cat}')">
      ${cat.charAt(0).toUpperCase() + cat.slice(1)}
    </button>
  `).join('');
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function loadStockImages(category = 'all') {
  if (!stockGrid) return;
  stockGrid.innerHTML = `<div class="loading-wrap"><div class="spinner"></div><p>Loading images...</p></div>`;

  try {
    const query = category !== 'all' ? `?category=${category}` : '';
    const data = await api.get(`/images/stock${query}`);
    renderStockImages(data.images);
  } catch (err) {
    stockGrid.innerHTML = `<div class="empty-state"><p>Failed to load images. Please try again.</p></div>`;
  }
}

function renderStockImages(images) {
  if (!stockGrid) return;
  if (!images || images.length === 0) {
    stockGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No images found</h3>
        <p>No images match this category yet. Generate some on the dashboard!</p>
      </div>`;
    return;
  }

  stockGrid.innerHTML = images.map((img) => `
    <div class="image-card">
      <img src="${img.imageUrl}" alt="${img.prompt}" loading="lazy" onerror="this.src='https://placehold.co/400x400/e8f4fd/0a6ebd?text=Image'">
      <div class="image-card-body">
        <p>${img.prompt}</p>
        <div class="image-card-meta">
          <span>Dr. ${img.doctor?.name || 'Unknown'}</span>
          <span>${formatDate(img.createdAt)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

window.filterImages = (category) => {
  currentCategory = category;
  renderFilters();
  loadStockImages(category);
};

renderFilters();
loadStockImages();

import Auth from './auth.js';
import api from './api.js';

if (!Auth.requireAuth()) {
  throw new Error('Not authenticated');
}

const generateForm = document.getElementById('generate-form');
const resultEl = document.getElementById('generate-result');
const resultImg = document.getElementById('result-img');
const imagesGrid = document.getElementById('images-grid');
const alertEl = document.getElementById('generate-alert');

function showAlert(msg, type) {
  if (!alertEl) return;
  alertEl.textContent = msg;
  alertEl.className = `alert alert-${type} show`;
  setTimeout(() => { alertEl.className = 'alert'; }, 4000);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function renderImages(images) {
  if (!imagesGrid) return;

  if (!images || images.length === 0) {
    imagesGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🖼️</div>
        <h3>No images yet</h3>
        <p>Generate your first medical illustration above.</p>
      </div>`;
    return;
  }

  imagesGrid.innerHTML = images.map((img) => `
    <div class="image-card" id="img-${img.id}">
      <img src="${img.imageUrl}" alt="${img.prompt}" loading="lazy" onerror="this.src='https://placehold.co/400x400/e8f4fd/0a6ebd?text=Image'">
      <div class="image-card-body">
        <p>${img.prompt}</p>
        <div class="image-card-meta">
          <span>${formatDate(img.createdAt)}</span>
          <button class="btn btn-danger btn-sm" onclick="deleteImage('${img.id}')">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

async function loadImages() {
  if (!imagesGrid) return;
  imagesGrid.innerHTML = `<div class="loading-wrap"><div class="spinner"></div><p>Loading your images...</p></div>`;
  try {
    const data = await api.get('/images/my-images');
    renderImages(data.images);
  } catch (err) {
    imagesGrid.innerHTML = `<div class="empty-state"><p>Failed to load images.</p></div>`;
  }
}

window.deleteImage = async (id) => {
  if (!confirm('Delete this image?')) return;
  try {
    await api.delete(`/images/${id}`);
    const card = document.getElementById(`img-${id}`);
    if (card) card.remove();
    showAlert('Image deleted.', 'success');
    if (imagesGrid && imagesGrid.children.length === 0) {
      renderImages([]);
    }
  } catch (err) {
    showAlert(err.message, 'error');
  }
};

if (generateForm) {
  generateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const prompt = document.getElementById('prompt').value.trim();
    const btn = generateForm.querySelector('button[type="submit"]');

    if (!prompt) {
      showAlert('Please enter a prompt.', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Generating...';
    if (resultEl) resultEl.classList.remove('show');

    try {
      const data = await api.post('/images/generate', { prompt });
      if (resultImg) resultImg.src = data.image.imageUrl;
      if (resultEl) resultEl.classList.add('show');
      showAlert('Image generated successfully!', 'success');
      loadImages();
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Generate Image';
    }
  });
}

loadImages();

/* ==========================================================
   AdmitWise - Frontend Application Script
   Written cleanly for final-year BSc IT students to understand
   ========================================================== */

// -------------------------------------------------------------
// 1. Global Application State
// -------------------------------------------------------------
let currentUser = null;
let userToken = localStorage.getItem('admitwise_token') || null;
let userFavourites = [];       // Array of favorited college IDs
let selectedForComparison = []; // Array of up to 4 colleges selected
let currentPredictedColleges = [];
let currentDirectoryColleges = [];
let editingCollegeId = null;

// API Base URL (relative path works automatically with Express)
const API_BASE = '/api';

// -------------------------------------------------------------
// 2. Initialization on Page Load
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  loadDirectoryColleges(); // Preload directory so it's ready

  // Setup predictor form listener
  const form = document.getElementById('predictionForm');
  if (form) {
    form.addEventListener('submit', handlePredictionSubmit);
  }

  // Live search for directory on Enter key
  const searchInput = document.getElementById('dirSearch');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        loadDirectoryColleges();
      }
    });
  }
});

// Helper for sending authenticated fetch requests
function authFetch(url, options = {}) {
  const headers = options.headers || {};
  if (userToken) {
    headers['Authorization'] = `Bearer ${userToken}`;
  }
  headers['Content-Type'] = 'application/json';
  return fetch(url, { ...options, headers });
}

// -------------------------------------------------------------
// 3. Tab Switching Navigation
// -------------------------------------------------------------
function switchTab(tabName) {
  // Hide all tab panes
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  if (tabName === 'home') {
    document.getElementById('homeTab').classList.add('active');
    document.getElementById('navHome').classList.add('active');
  } else if (tabName === 'predictor') {
    document.getElementById('predictorTab').classList.add('active');
    document.getElementById('navPredictor').classList.add('active');
  } else if (tabName === 'directory') {
    document.getElementById('directoryTab').classList.add('active');
    document.getElementById('navDirectory').classList.add('active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// -------------------------------------------------------------
// 4. Authentication (Check, Login, Register, Logout)
// -------------------------------------------------------------
async function checkAuthStatus() {
  if (!userToken) {
    updateAuthUI(null);
    return;
  }

  try {
    const res = await authFetch(`${API_BASE}/auth/me`);
    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
      updateAuthUI(currentUser);
      loadUserFavourites();
    } else {
      // Invalid/expired token
      handleLogout();
    }
  } catch (err) {
    console.error('Auth verification error:', err);
    updateAuthUI(null);
  }
}

function updateAuthUI(user) {
  const guestControls = document.getElementById('guestControls');
  const userControls = document.getElementById('userControls');
  const userNameDisplay = document.getElementById('userNameDisplay');
  const userRoleBadge = document.getElementById('userRoleBadge');
  const userOnlyBtns = document.querySelectorAll('.user-only');
  const adminOnlyBtns = document.querySelectorAll('.admin-only');

  if (user) {
    guestControls.style.display = 'none';
    userControls.style.display = 'flex';
    userNameDisplay.textContent = user.name;
    userRoleBadge.textContent = user.role === 'admin' ? 'Admin' : 'Student';

    userOnlyBtns.forEach(btn => btn.style.display = 'inline-block');

    if (user.role === 'admin') {
      adminOnlyBtns.forEach(btn => btn.style.display = 'inline-block');
    } else {
      adminOnlyBtns.forEach(btn => btn.style.display = 'none');
    }
  } else {
    guestControls.style.display = 'flex';
    userControls.style.display = 'none';
    userOnlyBtns.forEach(btn => btn.style.display = 'none');
    adminOnlyBtns.forEach(btn => btn.style.display = 'none');
    userFavourites = [];
  }
}

function openAuthModal(initialTab = 'login') {
  switchAuthTab(initialTab);
  document.getElementById('authAlert').style.display = 'none';
  document.getElementById('authModal').classList.add('active');
}

function switchAuthTab(tab) {
  const tabLogin = document.getElementById('tabBtnLogin');
  const tabRegister = document.getElementById('tabBtnRegister');
  const formLogin = document.getElementById('loginForm');
  const formRegister = document.getElementById('registerForm');
  const title = document.getElementById('authModalTitle');

  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    formLogin.style.display = 'block';
    formRegister.style.display = 'none';
    title.textContent = 'Student Login';
  } else {
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
    formLogin.style.display = 'none';
    formRegister.style.display = 'block';
    title.textContent = 'Create New Account';
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const alertBox = document.getElementById('authAlert');

  alertBox.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      alertBox.className = 'alert-box alert-error';
      alertBox.textContent = data.message || 'Login failed.';
      alertBox.style.display = 'block';
      return;
    }

    // Success
    userToken = data.token;
    currentUser = data.user;
    localStorage.setItem('admitwise_token', userToken);

    updateAuthUI(currentUser);
    loadUserFavourites();
    closeModal('authModal');
  } catch (err) {
    alertBox.className = 'alert-box alert-error';
    alertBox.textContent = 'Network error. Please try again.';
    alertBox.style.display = 'block';
  }
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const alertBox = document.getElementById('authAlert');

  alertBox.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      alertBox.className = 'alert-box alert-error';
      alertBox.textContent = data.message || 'Registration failed.';
      alertBox.style.display = 'block';
      return;
    }

    userToken = data.token;
    currentUser = data.user;
    localStorage.setItem('admitwise_token', userToken);

    updateAuthUI(currentUser);
    closeModal('authModal');
  } catch (err) {
    alertBox.className = 'alert-box alert-error';
    alertBox.textContent = 'Network error. Please try again.';
    alertBox.style.display = 'block';
  }
}

function handleLogout() {
  userToken = null;
  currentUser = null;
  localStorage.removeItem('admitwise_token');
  updateAuthUI(null);
  // Re-render directory to reset heart buttons
  renderDirectoryCards(currentDirectoryColleges);
}

// -------------------------------------------------------------
// 5. College Predictor Functionality
// -------------------------------------------------------------
async function handlePredictionSubmit(event) {
  event.preventDefault();

  const percentage = parseFloat(document.getElementById('percentage').value);
  const course = document.getElementById('course').value;
  const region = document.getElementById('region').value;
  const type = document.getElementById('collegeType').value;
  const budget = parseInt(document.getElementById('budget').value, 10);
  const btn = document.getElementById('predictSubmitBtn');

  if (isNaN(percentage) || percentage < 35 || percentage > 100) {
    alert('Please enter a percentage between 35 and 100.');
    return;
  }

  if (!course) {
    alert('Please select a course.');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Calculating Chances...';

  try {
    const res = await authFetch(`${API_BASE}/colleges/predict`, {
      method: 'POST',
      body: JSON.stringify({ percentage, course, region, budget, type })
    });

    const data = await res.json();
    btn.disabled = false;
    btn.innerHTML = '&#128640; Predict Colleges';

    if (!res.ok) {
      alert(data.message || 'Prediction failed.');
      return;
    }

    currentPredictedColleges = data.predictions;
    renderPredictionResults(data);
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = '&#128640; Predict Colleges';
    alert('Server communication error. Make sure the backend server is running.');
  }
}

function renderPredictionResults(data) {
  const resultsArea = document.getElementById('predictionResultsArea');
  const countBadge = document.getElementById('predictorCountBadge');
  const summary = document.getElementById('predictorResultsSummary');
  const cardsGrid = document.getElementById('predictionCardsGrid');

  resultsArea.style.display = 'block';
  countBadge.textContent = `${data.count} colleges found`;
  summary.textContent = `Based on your score of ${data.userPercentage}% for ${data.selectedCourse}`;
  cardsGrid.innerHTML = '';

  if (data.predictions.length === 0) {
    cardsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: white; border-radius: 12px; border: 1px dashed #cbd5e1;">
        <h4>No Colleges Matched Your Strict Criteria</h4>
        <p class="text-muted" style="margin-top: 6px;">Try expanding your region selection or budget limit to see more available options.</p>
      </div>
    `;
    return;
  }

  data.predictions.forEach(college => {
    const isFav = userFavourites.includes(college._id);
    const isChecked = selectedForComparison.some(c => c._id === college._id);

    const card = document.createElement('div');
    card.className = 'college-card';
    card.innerHTML = `
      <div>
        <div class="card-top">
          <h4 class="college-title">${college.name}</h4>
          <button 
            class="fav-btn ${isFav ? 'active' : ''}" 
            title="${isFav ? 'Remove from favourites' : 'Save to favourites'}"
            onclick="toggleFavourite('${college._id}', this)">
            &#10084;
          </button>
        </div>

        <div class="college-tags">
          <span class="tag tag-region">&#128205; ${college.region}</span>
          <span class="tag tag-type">${college.type}</span>
          <span class="tag">&#9733; ${college.rating} / 5</span>
        </div>

        <div class="college-stats-table">
          <div class="stat-row">
            <span class="stat-label">Course:</span>
            <span class="stat-value">${college.course}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Cutoff:</span>
            <span class="stat-value">${college.cutoff}%</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Est. Annual Fees:</span>
            <span class="stat-value">${college.feesDisplay}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Admission Chance:</span>
            <span class="chance-badge ${college.chanceClass}">${college.chance}</span>
          </div>
        </div>
      </div>

      <div class="card-bottom-actions">
        <label class="compare-checkbox-label">
          <input 
            type="checkbox" 
            ${isChecked ? 'checked' : ''}
            onchange="handleCompareToggle('${college._id}', 'predicted', this)">
          Compare
        </label>
        <button class="btn btn-outline btn-sm" onclick="openCollegeDetails('${college._id}')">
          View Details
        </button>
      </div>
    `;

    cardsGrid.appendChild(card);
  });

  resultsArea.scrollIntoView({ behavior: 'smooth' });
}

function resetPredictorForm() {
  document.getElementById('predictionForm').reset();
  document.getElementById('predictionResultsArea').style.display = 'none';
}

// -------------------------------------------------------------
// 6. College Directory Functionality
// -------------------------------------------------------------
async function loadDirectoryColleges() {
  const search = document.getElementById('dirSearch').value.trim();
  const course = document.getElementById('dirCourse').value;
  const region = document.getElementById('dirRegion').value;
  const type = document.getElementById('dirType').value;
  const badge = document.getElementById('directoryCountBadge');

  badge.textContent = 'Searching...';

  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (course && course !== 'All') params.append('course', course);
  if (region && region !== 'All') params.append('region', region);
  if (type && type !== 'All') params.append('type', type);

  try {
    const res = await fetch(`${API_BASE}/colleges?${params.toString()}`);
    const data = await res.json();

    if (res.ok) {
      currentDirectoryColleges = data.colleges;
      badge.textContent = `${data.count} colleges found`;
      renderDirectoryCards(data.colleges);
    } else {
      badge.textContent = 'Error loading colleges';
    }
  } catch (err) {
    badge.textContent = 'Failed to connect';
  }
}

function renderDirectoryCards(colleges) {
  const grid = document.getElementById('directoryCardsGrid');
  grid.innerHTML = '';

  if (colleges.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: white; border-radius: 12px;">
        <h4>No Colleges Match Your Search</h4>
        <p class="text-muted">Try removing some filters to see all available colleges in Mumbai.</p>
      </div>
    `;
    return;
  }

  colleges.forEach(college => {
    const isFav = userFavourites.includes(college._id);
    const isChecked = selectedForComparison.some(c => c._id === college._id);

    // List courses offered
    const coursesList = college.courses.map(c => `<strong>${c.courseName}</strong> (${c.cutoff}%)`).join(', ');

    const card = document.createElement('div');
    card.className = 'college-card';
    card.innerHTML = `
      <div>
        <div class="card-top">
          <h4 class="college-title">${college.name}</h4>
          <button 
            class="fav-btn ${isFav ? 'active' : ''}" 
            title="${isFav ? 'Remove from favourites' : 'Save to favourites'}"
            onclick="toggleFavourite('${college._id}', this)">
            &#10084;
          </button>
        </div>

        <p class="text-muted" style="font-size: 13px; margin-bottom: 8px;">&#128205; ${college.location}</p>

        <div class="college-tags">
          <span class="tag tag-region">${college.region}</span>
          <span class="tag tag-type">${college.type}</span>
          <span class="tag">&#9733; ${college.rating} / 5</span>
        </div>

        <div class="college-stats-table">
          <div class="stat-row">
            <span class="stat-label">Offered Streams:</span>
            <span class="stat-value" style="font-size: 12.5px;">${coursesList}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Established:</span>
            <span class="stat-value">${college.established || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div class="card-bottom-actions">
        <label class="compare-checkbox-label">
          <input 
            type="checkbox" 
            ${isChecked ? 'checked' : ''}
            onchange="handleCompareToggle('${college._id}', 'directory', this)">
          Compare
        </label>
        <button class="btn btn-outline btn-sm" onclick="openCollegeDetails('${college._id}')">
          View Details
        </button>
      </div>
    `;

    grid.appendChild(card);
  });
}

function resetDirectoryFilters() {
  document.getElementById('dirSearch').value = '';
  document.getElementById('dirCourse').value = 'All';
  document.getElementById('dirRegion').value = 'All';
  document.getElementById('dirType').value = 'All';
  loadDirectoryColleges();
}

// -------------------------------------------------------------
// 7. College Details Modal
// -------------------------------------------------------------
async function openCollegeDetails(collegeId) {
  const modal = document.getElementById('collegeDetailsModal');
  const nameEl = document.getElementById('modalCollegeName');
  const bodyEl = document.getElementById('modalCollegeBody');

  nameEl.textContent = 'Loading College Details...';
  bodyEl.innerHTML = '<p>Fetching information from database...</p>';
  modal.classList.add('active');

  try {
    const res = await fetch(`${API_BASE}/colleges/${collegeId}`);
    const data = await res.json();

    if (!res.ok) {
      bodyEl.innerHTML = `<p class="alert-box alert-error">${data.message || 'Error loading details'}</p>`;
      return;
    }

    const col = data.college;
    nameEl.textContent = col.name;

    const courseRows = col.courses.map(c => `
      <tr>
        <td><strong>${c.courseName}</strong></td>
        <td><span class="badge-count">${c.cutoff}%</span></td>
        <td>${c.feesDisplay}</td>
        <td>${c.eligibility}</td>
      </tr>
    `).join('');

    bodyEl.innerHTML = `
      <div class="detail-banner">
        <h4>${col.name}</h4>
        <p class="text-muted">&#128205; ${col.location} | Region: <strong>${col.region}</strong> | Type: <strong>${col.type}</strong></p>
        <p style="margin-top: 8px; font-size: 14px;">${col.description || 'Verified educational institution in Mumbai.'}</p>
      </div>

      <h5 style="margin-bottom: 10px; font-size: 15px; color: #1e3a8a;">Courses, Cutoffs & Fee Structures</h5>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Course Name</th>
              <th>Previous Cutoff</th>
              <th>Annual Fees</th>
              <th>Eligibility Criteria</th>
            </tr>
          </thead>
          <tbody>
            ${courseRows}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 22px; display: flex; justify-content: space-between; align-items: center; flex-wrap: gap;">
        <div>
          ${col.website ? `
            <a href="${col.website}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
              &#127760; Visit Official Website
            </a>
          ` : '<span class="text-muted" style="font-size: 13px;">Official website link unavailable</span>'}
        </div>
        <button class="btn btn-secondary btn-sm" onclick="closeModal('collegeDetailsModal')">
          Close
        </button>
      </div>
    `;
  } catch (err) {
    bodyEl.innerHTML = '<p class="alert-box alert-error">Failed to connect to backend server.</p>';
  }
}

// -------------------------------------------------------------
// 8. College Comparison (Up to 4 Colleges)
// -------------------------------------------------------------
function handleCompareToggle(collegeId, source, checkbox) {
  // Find college from either predicted list or directory list
  let college = currentPredictedColleges.find(c => c._id === collegeId);
  if (!college) {
    college = currentDirectoryColleges.find(c => c._id === collegeId);
  }

  if (!college) return;

  if (checkbox.checked) {
    if (selectedForComparison.length >= 4) {
      alert('You can select a maximum of 4 colleges to compare side-by-side.');
      checkbox.checked = false;
      return;
    }
    selectedForComparison.push(college);
  } else {
    selectedForComparison = selectedForComparison.filter(c => c._id !== collegeId);
  }

  updateCompareBar();
  syncCompareCheckboxes();
}

function updateCompareBar() {
  const bar = document.getElementById('compareBar');
  const countSpan = document.getElementById('selectedCompareCount');
  const compareBtn = document.getElementById('openCompareBtn');

  countSpan.textContent = selectedForComparison.length;

  if (selectedForComparison.length > 0) {
    bar.style.display = 'flex';
  } else {
    bar.style.display = 'none';
  }

  // Need at least 2 colleges to compare
  compareBtn.disabled = selectedForComparison.length < 2;
}

function clearComparisonList() {
  selectedForComparison = [];
  updateCompareBar();
  syncCompareCheckboxes();
}

function syncCompareCheckboxes() {
  document.querySelectorAll('.compare-checkbox-label input').forEach(input => {
    // Check if the card's ID is in selectedForComparison
    // Card checkbox logic
  });
}

function openComparisonModal() {
  if (selectedForComparison.length < 2) {
    alert('Please select at least 2 colleges to compare.');
    return;
  }

  const wrapper = document.getElementById('comparisonTableWrapper');
  const colleges = selectedForComparison;

  let headers = '<th>Attribute</th>' + colleges.map(c => `<th>${c.name}</th>`).join('');
  
  let rowRegion = '<td><strong>Region</strong></td>' + colleges.map(c => `<td>${c.region}</td>`).join('');
  let rowType = '<td><strong>College Type</strong></td>' + colleges.map(c => `<td>${c.type}</td>`).join('');
  let rowRating = '<td><strong>Rating</strong></td>' + colleges.map(c => `<td>&#9733; ${c.rating || 4.2} / 5</td>`).join('');
  
  let rowCourses = '<td><strong>Offered Courses & Cutoffs</strong></td>' + colleges.map(c => {
    if (c.courses && c.courses.length > 0) {
      return `<td>${c.courses.map(course => `<div>• ${course.courseName}: <strong>${course.cutoff}%</strong></div>`).join('')}</td>`;
    } else if (c.course) {
      return `<td><div>• ${c.course}: <strong>${c.cutoff}%</strong></div></td>`;
    }
    return '<td>Data unavailable</td>';
  }).join('');

  let rowFees = '<td><strong>Annual Fees</strong></td>' + colleges.map(c => {
    if (c.courses && c.courses.length > 0) {
      return `<td>${c.courses.map(course => `<div>${course.courseName}: ${course.feesDisplay}</div>`).join('')}</td>`;
    }
    return `<td>${c.feesDisplay || 'Please verify with college'}</td>`;
  }).join('');

  let rowWebsites = '<td><strong>Official Portal</strong></td>' + colleges.map(c => {
    return c.website ? `<td><a href="${c.website}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Website</a></td>` : '<td>Unavailable</td>';
  }).join('');

  wrapper.innerHTML = `
    <div class="table-responsive">
      <table class="compare-table">
        <thead>
          <tr>${headers}</tr>
        </thead>
        <tbody>
          <tr>${rowRegion}</tr>
          <tr>${rowType}</tr>
          <tr>${rowRating}</tr>
          <tr>${rowCourses}</tr>
          <tr>${rowFees}</tr>
          <tr>${rowWebsites}</tr>
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('comparisonModal').classList.add('active');
}

// -------------------------------------------------------------
// 9. Favourites Functionality (Bookmark Colleges)
// -------------------------------------------------------------
async function loadUserFavourites() {
  if (!userToken) return;

  try {
    const res = await authFetch(`${API_BASE}/favourites`);
    const data = await res.json();
    if (res.ok) {
      userFavourites = data.favourites.map(c => c._id);
      document.getElementById('favCount').textContent = userFavourites.length;
    }
  } catch (err) {
    console.error('Error fetching favourites:', err);
  }
}

async function toggleFavourite(collegeId, btn) {
  if (!userToken) {
    alert('Please log in or create an account to save colleges to your favourites.');
    openAuthModal('login');
    return;
  }

  const isFav = userFavourites.includes(collegeId);
  const method = isFav ? 'DELETE' : 'POST';

  try {
    const res = await authFetch(`${API_BASE}/favourites/${collegeId}`, { method });
    const data = await res.json();

    if (res.ok) {
      if (isFav) {
        userFavourites = userFavourites.filter(id => id !== collegeId);
        btn.classList.remove('active');
      } else {
        userFavourites.push(collegeId);
        btn.classList.add('active');
      }
      document.getElementById('favCount').textContent = userFavourites.length;
    } else {
      alert(data.message || 'Could not update favourites.');
    }
  } catch (err) {
    alert('Network error while updating favourites.');
  }
}

async function openFavouritesModal() {
  const modal = document.getElementById('favouritesModal');
  const wrapper = document.getElementById('favouritesListWrapper');

  wrapper.innerHTML = '<p>Loading your bookmarked colleges...</p>';
  modal.classList.add('active');

  try {
    const res = await authFetch(`${API_BASE}/favourites`);
    const data = await res.json();

    if (!res.ok) {
      wrapper.innerHTML = `<p class="alert-box alert-error">${data.message}</p>`;
      return;
    }

    if (data.favourites.length === 0) {
      wrapper.innerHTML = `
        <div style="text-align: center; padding: 25px;">
          <p class="text-muted">You haven't bookmarked any colleges yet.</p>
          <button class="btn btn-primary btn-sm" style="margin-top: 10px;" onclick="closeModal('favouritesModal'); switchTab('directory');">
            Browse College Directory
          </button>
        </div>
      `;
      return;
    }

    wrapper.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${data.favourites.map(c => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div>
              <strong style="color: #1e3a8a;">${c.name}</strong>
              <div class="text-muted" style="font-size: 12.5px;">${c.region} • ${c.type}</div>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-outline btn-sm" onclick="openCollegeDetails('${c._id}')">Details</button>
              <button class="btn btn-danger btn-sm" onclick="removeFavouriteFromModal('${c._id}')">Remove</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    wrapper.innerHTML = '<p class="alert-box alert-error">Failed to fetch favourites.</p>';
  }
}

async function removeFavouriteFromModal(collegeId) {
  try {
    const res = await authFetch(`${API_BASE}/favourites/${collegeId}`, { method: 'DELETE' });
    if (res.ok) {
      userFavourites = userFavourites.filter(id => id !== collegeId);
      document.getElementById('favCount').textContent = userFavourites.length;
      openFavouritesModal(); // refresh list
      renderDirectoryCards(currentDirectoryColleges);
    }
  } catch (err) {
    alert('Failed to remove favourite.');
  }
}

// -------------------------------------------------------------
// 10. Prediction History
// -------------------------------------------------------------
async function openHistoryModal() {
  const modal = document.getElementById('historyModal');
  const wrapper = document.getElementById('historyListWrapper');

  wrapper.innerHTML = '<p>Loading your previous prediction queries...</p>';
  modal.classList.add('active');

  try {
    const res = await authFetch(`${API_BASE}/history`);
    const data = await res.json();

    if (!res.ok) {
      wrapper.innerHTML = `<p class="alert-box alert-error">${data.message}</p>`;
      return;
    }

    if (data.history.length === 0) {
      wrapper.innerHTML = `
        <div style="text-align: center; padding: 30px;">
          <p class="text-muted">No prediction history found.</p>
          <p style="font-size: 13px; color: #64748b;">Every time you use the Predictor while logged in, your results are saved here automatically.</p>
        </div>
      `;
      return;
    }

    wrapper.innerHTML = `
      <div style="margin-bottom: 15px; display: flex; justify-content: flex-end;">
        <button class="btn btn-secondary btn-sm" onclick="clearAllHistory()">Clear All History</button>
      </div>
      <div>
        ${data.history.map(item => {
          const dateStr = new Date(item.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
          });

          const collegesSummary = item.matchedColleges.map(c => `
            <span class="tag" style="margin: 2px;">
              ${c.collegeName} (${c.chance})
            </span>
          `).join('');

          return `
            <div class="history-card">
              <div class="history-header">
                <div>
                  <strong>${item.course} - ${item.percentage}%</strong>
                  <div class="text-muted" style="font-size: 12px;">Saved on ${dateStr} | Region: ${item.region}</div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="deleteHistoryItem('${item._id}')">&#128465;</button>
              </div>
              <div style="margin-top: 8px;">
                <span style="font-size: 12px; color: #64748b;">Top Matched:</span>
                <div style="margin-top: 4px;">${collegesSummary || 'None'}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (err) {
    wrapper.innerHTML = '<p class="alert-box alert-error">Failed to load prediction history.</p>';
  }
}

async function deleteHistoryItem(id) {
  try {
    const res = await authFetch(`${API_BASE}/history/${id}`, { method: 'DELETE' });
    if (res.ok) {
      openHistoryModal(); // Reload modal
    }
  } catch (err) {
    alert('Could not delete history item.');
  }
}

async function clearAllHistory() {
  if (!confirm('Are you sure you want to clear your entire prediction history?')) return;
  try {
    const res = await authFetch(`${API_BASE}/history`, { method: 'DELETE' });
    if (res.ok) {
      openHistoryModal();
    }
  } catch (err) {
    alert('Could not clear history.');
  }
}

// -------------------------------------------------------------
// 11. Admin Panel Functionality
// -------------------------------------------------------------
async function openAdminModal() {
  if (!currentUser || currentUser.role !== 'admin') {
    alert('Access restricted to administrators only.');
    return;
  }

  document.getElementById('adminModal').classList.add('active');
  hideAddCollegeForm();
  loadAdminCollegeTable();
}

async function loadAdminCollegeTable() {
  const tbody = document.getElementById('adminCollegeTableBody');
  tbody.innerHTML = '<tr><td colspan="5">Loading colleges from MongoDB...</td></tr>';

  try {
    const res = await fetch(`${API_BASE}/colleges`);
    const data = await res.json();

    if (!res.ok) {
      tbody.innerHTML = `<tr><td colspan="5">Error: ${data.message}</td></tr>`;
      return;
    }

    tbody.innerHTML = data.colleges.map(c => `
      <tr>
        <td><strong>${c.name}</strong><br><small class="text-muted">${c.location}</small></td>
        <td>${c.region}</td>
        <td>${c.type}</td>
        <td>${c.courses.map(course => `${course.courseName}: <strong>${course.cutoff}%</strong>`).join(', ')}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="editCollege('${c._id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCollege('${c._id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5">Failed to fetch colleges.</td></tr>';
  }
}

function showAddCollegeForm() {
  editingCollegeId = null;
  document.getElementById('adminCollegeForm').reset();
  document.getElementById('adminFormHeading').textContent = 'Add New Real College';
  document.getElementById('adminCollegeFormContainer').style.display = 'block';
}

function hideAddCollegeForm() {
  editingCollegeId = null;
  document.getElementById('adminCollegeFormContainer').style.display = 'none';
}

async function editCollege(id) {
  try {
    const res = await fetch(`${API_BASE}/colleges/${id}`);
    const data = await res.json();
    if (!res.ok) return alert('Could not fetch college details.');

    const col = data.college;
    editingCollegeId = id;

    document.getElementById('adminCollegeId').value = col._id;
    document.getElementById('adminName').value = col.name;
    document.getElementById('adminLocation').value = col.location;
    document.getElementById('adminRegion').value = col.region;
    document.getElementById('adminType').value = col.type;
    document.getElementById('adminWebsite').value = col.website || '';
    document.getElementById('adminRating').value = col.rating || 4.2;

    if (col.courses && col.courses[0]) {
      document.getElementById('adminCourseName').value = col.courses[0].courseName;
      document.getElementById('adminCutoff').value = col.courses[0].cutoff;
      document.getElementById('adminFees').value = col.courses[0].fees || 0;
      document.getElementById('adminEligibility').value = col.courses[0].eligibility || '';
    }

    document.getElementById('adminFormHeading').textContent = `Edit College: ${col.name}`;
    document.getElementById('adminCollegeFormContainer').style.display = 'block';
    document.getElementById('adminCollegeFormContainer').scrollIntoView({ behavior: 'smooth' });
  } catch (err) {
    alert('Failed to load college for editing.');
  }
}

async function handleAdminCollegeSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('adminName').value.trim();
  const location = document.getElementById('adminLocation').value.trim();
  const region = document.getElementById('adminRegion').value;
  const type = document.getElementById('adminType').value;
  const website = document.getElementById('adminWebsite').value.trim();
  const rating = parseFloat(document.getElementById('adminRating').value);

  const courseName = document.getElementById('adminCourseName').value;
  const cutoff = parseFloat(document.getElementById('adminCutoff').value);
  const fees = parseInt(document.getElementById('adminFees').value, 10) || 0;
  const eligibility = document.getElementById('adminEligibility').value.trim() || '12th Standard';

  const payload = {
    name,
    location,
    region,
    type,
    website,
    rating,
    courses: [
      {
        courseName,
        cutoff,
        fees,
        feesDisplay: fees > 0 ? `₹${fees.toLocaleString('en-IN')} / year` : 'Please verify with college',
        eligibility
      }
    ]
  };

  const isEdit = Boolean(editingCollegeId);
  const url = isEdit ? `${API_BASE}/colleges/${editingCollegeId}` : `${API_BASE}/colleges`;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await authFetch(url, {
      method,
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || 'Operation failed.');
      return;
    }

    alert(data.message || 'College saved successfully!');
    hideAddCollegeForm();
    loadAdminCollegeTable();
    loadDirectoryColleges(); // Sync directory
  } catch (err) {
    alert('Error saving college to database.');
  }
}

async function deleteCollege(id) {
  if (!confirm('Are you sure you want to delete this college record from the database?')) return;

  try {
    const res = await authFetch(`${API_BASE}/colleges/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Could not delete college.');
      return;
    }

    alert('College deleted successfully.');
    loadAdminCollegeTable();
    loadDirectoryColleges();
  } catch (err) {
    alert('Error deleting college.');
  }
}

// -------------------------------------------------------------
// 12. Modal Utility Helpers
// -------------------------------------------------------------
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Close modals when clicking outside modal box
window.addEventListener('click', (event) => {
  if (event.target.classList.contains('modal')) {
    event.target.classList.remove('active');
  }
});

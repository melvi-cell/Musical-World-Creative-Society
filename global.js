// global.js - All global UI functions (Regular script, NOT a module)

// ========== THEME FUNCTIONS ==========
function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    } else {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    }
}

function toggleTheme() {
    const isLight = document.body.classList.contains('light-mode');
    if (isLight) {
        localStorage.setItem('theme', 'dark');
        applyTheme('dark');
    } else {
        localStorage.setItem('theme', 'light');
        applyTheme('light');
    }
}

// ========== MOBILE MENU ==========
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

// ========== NOTIFICATIONS DROPDOWN ==========
function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown) dropdown.classList.toggle('show');
}

// ========== LOGOUT ==========
function logout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('index.html');
}

// ========== PROFILE PICTURE FUNCTIONS ==========
function triggerImageUpload() {
    const input = document.getElementById('profileImageInput');
    if (input) input.click();
}

async function uploadProfileImage(file) {
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
        alert('Image too large! Maximum 2MB.');
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('Please login first');
        return;
    }
    
    const avatars = document.querySelectorAll('.profile-avatar-img');
    avatars.forEach(img => { if(img) img.style.opacity = '0.5'; });
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageDataUrl = e.target.result;
        
        let profileImages = JSON.parse(localStorage.getItem('profileImages') || '{}');
        profileImages[userId] = imageDataUrl;
        localStorage.setItem('profileImages', JSON.stringify(profileImages));
        
        updateAllProfileImages(imageDataUrl);
        
        avatars.forEach(img => { if(img) img.style.opacity = '1'; });
        
        alert('Profile picture updated successfully!');
    };
    
    reader.onerror = function() {
        avatars.forEach(img => { if(img) img.style.opacity = '1'; });
        alert('Error reading file');
    };
    
    reader.readAsDataURL(file);
}

function updateAllProfileImages(imageUrl) {
    const avatars = document.querySelectorAll('.profile-avatar-img');
    avatars.forEach(img => {
        if (img) {
            img.src = imageUrl;
            img.style.display = 'inline-block';
        }
    });
}

function loadProfileImage() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    const profileImages = JSON.parse(localStorage.getItem('profileImages') || '{}');
    const savedImage = profileImages[userId];
    
    if (savedImage) {
        updateAllProfileImages(savedImage);
    }
}

// ========== UPDATE SCHOOL NAME IN SIDEBAR ==========
function updateSchoolName(name) {
    const schoolNameElement = document.getElementById('schoolName');
    if (schoolNameElement) {
        schoolNameElement.innerText = name || 'MWCS Portal';
    }
}

// ========== INITIALIZE ON PAGE LOAD ==========
document.addEventListener('DOMContentLoaded', function() {
    // Apply saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        applyTheme('light');
    } else {
        applyTheme('dark');
    }
    
    // Load profile image
    loadProfileImage();
    
    // Set up file input listener
    const setupImageInput = function() {
        const imageInput = document.getElementById('profileImageInput');
        if (imageInput && !imageInput.hasListener) {
            const newInput = imageInput.cloneNode(true);
            imageInput.parentNode?.replaceChild(newInput, imageInput);
            newInput.addEventListener('change', function(e) {
                if (e.target.files && e.target.files[0]) {
                    uploadProfileImage(e.target.files[0]);
                }
            });
            newInput.hasListener = true;
        }
    };
    
    setupImageInput();
    
    const observer = new MutationObserver(setupImageInput);
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const bell = document.querySelector('.notification-bell');
        const dropdown = document.getElementById('notificationsDropdown');
        if (bell && dropdown && !bell.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });
});
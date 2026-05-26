// global.js - All global UI functions (Regular script, NOT a module)

// ========== CONTACT INFORMATION ==========
window.MWCS_CONTACT = {
    email: "musicalworldcreative@gmail.com",
    phone: "+254 741 417587",
    phoneRaw: "254741417587",
    whatsapp: "https://wa.me/254741417587"
};

// ========== PROFILE PICTURE FUNCTIONS (WORKS ON ALL PAGES) ==========

// Load profile picture on any page
function loadProfilePicture() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    const profileImages = JSON.parse(localStorage.getItem('profileImages') || '{}');
    const savedImage = profileImages[userId];
    
    if (savedImage) {
        const avatars = document.querySelectorAll('.profile-avatar-img');
        avatars.forEach(img => {
            if (img) {
                img.src = savedImage;
            }
        });
    }
}

// Save profile picture (called after upload)
function saveProfilePicture(imageUrl) {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    let profileImages = JSON.parse(localStorage.getItem('profileImages') || '{}');
    profileImages[userId] = imageUrl;
    localStorage.setItem('profileImages', JSON.stringify(profileImages));
    
    // Update all avatars on current page
    const avatars = document.querySelectorAll('.profile-avatar-img');
    avatars.forEach(img => {
        if (img) {
            img.src = imageUrl;
        }
    });
}

// Trigger image upload (works on any page)
window.triggerImageUpload = function() {
    const input = document.getElementById('profileImageInput');
    if (input) input.click();
};

// ========== SCHOOL NAME FUNCTIONS (WORKS ON ALL PAGES) ==========

// Load school name on any page
function loadSchoolName() {
    const schoolName = localStorage.getItem('schoolName');
    const schoolNameElement = document.getElementById('schoolName');
    
    if (schoolNameElement) {
        if (schoolName && schoolName !== '') {
            schoolNameElement.innerText = schoolName;
        } else {
            schoolNameElement.innerText = 'MWCS Portal';
        }
    }
}

// Save school name (called from dashboard after loading)
function saveSchoolName(schoolName) {
    if (schoolName && schoolName !== '') {
        localStorage.setItem('schoolName', schoolName);
        const schoolNameElement = document.getElementById('schoolName');
        if (schoolNameElement) {
            schoolNameElement.innerText = schoolName;
        }
    }
}

// Load ALL user data on any page
function loadAllUserData() {
    loadProfilePicture();
    loadSchoolName();
}

// ========== SETUP PROFILE UPLOAD LISTENER ==========
function setupProfileUploadListener() {
    const profileInput = document.getElementById('profileImageInput');
    if (profileInput && !profileInput.hasListener) {
        const newInput = profileInput.cloneNode(true);
        profileInput.parentNode?.replaceChild(newInput, profileInput);
        newInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const userId = localStorage.getItem('userId');
            if (!userId) {
                alert('Please login first');
                return;
            }
            
            if (file.size > 2 * 1024 * 1024) {
                alert('Image too large! Maximum 2MB.');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const imageUrl = event.target.result;
                saveProfilePicture(imageUrl);
                alert('Profile picture updated!');
            };
            reader.readAsDataURL(file);
            newInput.value = '';
        });
        newInput.hasListener = true;
    }
}

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
    
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        if (document.body.classList.contains('light-mode')) {
            themeBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        } else {
            themeBtn.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        }
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
    window.location.href = 'index.html';
}

// ========== CONTACT ACTIONS ==========
function callSupport() {
    window.location.href = "tel:+254741417587";
}

function emailSupport() {
    window.location.href = "mailto:musicalworldcreative@gmail.com?subject=MWCS Support Request";
}

function whatsappSupport() {
    window.open("https://wa.me/254741417587", "_blank");
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
    
    // Load profile picture AND school name
    loadAllUserData();
    
    // Setup profile upload
    setupProfileUploadListener();
    
    // Update contact info display if elements exist
    const contactEmailElements = document.querySelectorAll('.contact-email');
    const contactPhoneElements = document.querySelectorAll('.contact-phone');
    
    contactEmailElements.forEach(el => {
        el.innerText = "musicalworldcreative@gmail.com";
        el.href = "mailto:musicalworldcreative@gmail.com";
    });
    
    contactPhoneElements.forEach(el => {
        el.innerText = "+254 741 417587";
        el.href = "tel:+254741417587";
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const bell = document.querySelector('.notification-bell');
        const dropdown = document.getElementById('notificationsDropdown');
        if (bell && dropdown && !bell.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });
});
// global.js - All global UI functions

// ========== CONTACT INFORMATION ==========
window.MWCS_CONTACT = {
    email: "musicalworldcreative@gmail.com",
    phone: "+254 741 417587",
    phoneRaw: "254741417587",
    whatsapp: "https://wa.me/254741417587"
};

// ========== FIREBASE SERVICES (set by each page) ==========
let firebaseAuth = null;
let firebaseDb = null;
let firebaseStorage = null;

// Function to set Firebase services (called from page modules)
window.setFirebaseServices = function(services) {
    console.log('Firebase services received');
    firebaseAuth = services.auth;
    firebaseDb = services.db;
    firebaseStorage = services.storage;
};

// Helper function to get Firestore document reference (works with both modular and compat)
async function getFirestoreDoc(collectionName, docId) {
    if (!firebaseDb) return null;
    
    // Check if it's modular Firebase (has collection method)
    if (typeof firebaseDb.collection === 'function') {
        // Compat mode
        return firebaseDb.collection(collectionName).doc(docId);
    } else {
        // Modular mode - need to import
        const { doc, getFirestore } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        const modularDb = getFirestore();
        return doc(modularDb, collectionName, docId);
    }
}

// Helper function to update Firestore document
async function updateFirestoreDoc(collectionName, docId, data) {
    if (!firebaseDb) return null;
    
    if (typeof firebaseDb.collection === 'function') {
        // Compat mode
        await firebaseDb.collection(collectionName).doc(docId).update(data);
    } else {
        // Modular mode
        const { doc, updateDoc, getFirestore } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        const modularDb = getFirestore();
        const docRef = doc(modularDb, collectionName, docId);
        await updateDoc(docRef, data);
    }
}

// Helper function to get Firestore document
async function getFirestoreDocData(collectionName, docId) {
    if (!firebaseDb) return null;
    
    if (typeof firebaseDb.collection === 'function') {
        // Compat mode
        const docSnap = await firebaseDb.collection(collectionName).doc(docId).get();
        return docSnap.exists ? docSnap.data() : null;
    } else {
        // Modular mode
        const { doc, getDoc, getFirestore } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        const modularDb = getFirestore();
        const docRef = doc(modularDb, collectionName, docId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists ? docSnap.data() : null;
    }
}

// ========== PROFILE PICTURE FUNCTIONS ==========

window.loadProfilePicture = async function() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.log('No userId found');
        return;
    }
    
    if (!firebaseDb) {
        console.log('Firestore not ready yet, will retry...');
        setTimeout(() => window.loadProfilePicture(), 500);
        return;
    }
    
    try {
        const data = await getFirestoreDocData('schools', userId);
        if (data && data.profileImageBase64) {
            const avatars = document.querySelectorAll('.profile-avatar-img');
            avatars.forEach(img => {
                if (img) img.src = data.profileImageBase64;
            });
            console.log('Profile picture loaded from Firestore');
        }
    } catch (error) {
        console.error('Error loading profile picture:', error);
    }
};

window.saveProfilePicture = async function(file) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('Please login first');
        return null;
    }
    
    if (!firebaseDb) {
        alert('Firebase not ready. Please refresh and try again.');
        return null;
    }
    
    // Increase limit to 2MB (2000KB)
    if (file.size > 2 * 1024 * 1024) {
        alert('Image too large! Maximum 2MB for profile picture.');
        return null;
    }
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function(event) {
            try {
                const base64String = event.target.result;
                console.log('Image converted to Base64, saving to Firestore...');
                
                await updateFirestoreDoc('schools', userId, {
                    profileImageBase64: base64String,
                    profileImageUpdatedAt: new Date().toISOString()
                });
                
                const avatars = document.querySelectorAll('.profile-avatar-img');
                avatars.forEach(img => {
                    img.src = base64String;
                });
                
                console.log('Profile picture saved successfully!');
                alert('Profile picture updated successfully!');
                resolve(base64String);
            } catch (error) {
                console.error('Error saving:', error);
                alert('Failed to save: ' + error.message);
                reject(error);
            }
        };
        reader.onerror = function(error) {
            console.error('FileReader error:', error);
            alert('Failed to read image file');
            reject(error);
        };
        reader.readAsDataURL(file);
    });
};

window.triggerImageUpload = function() {
    console.log('Camera icon clicked - looking for file input...');
    const input = document.getElementById('profileImageInput');
    if (input) {
        console.log('File input found, clicking...');
        input.click();
    } else {
        console.error('Profile image input not found!');
        alert('Upload feature not ready. Please refresh the page and try again.');
    }
};

// ========== SCHOOL NAME FUNCTIONS ==========

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

function saveSchoolName(schoolName) {
    if (schoolName && schoolName !== '') {
        localStorage.setItem('schoolName', schoolName);
        const schoolNameElement = document.getElementById('schoolName');
        if (schoolNameElement) {
            schoolNameElement.innerText = schoolName;
        }
    }
}

window.loadAllUserData = async function() {
    await window.loadProfilePicture();
    loadSchoolName();
};

// ========== SETUP PROFILE UPLOAD LISTENER ==========
function setupProfileUploadListener() {
    const profileInput = document.getElementById('profileImageInput');
    console.log('Setting up profile upload listener, input found:', !!profileInput);
    
    if (profileInput && !profileInput.hasListener) {
        const newInput = profileInput.cloneNode(true);
        profileInput.parentNode?.replaceChild(newInput, profileInput);
        newInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (!file) {
                console.log('No file selected');
                return;
            }
            console.log('File selected:', file.name, file.size, 'bytes');
            await window.saveProfilePicture(file);
            newInput.value = '';
        });
        newInput.hasListener = true;
        console.log('Profile upload listener attached');
    } else if (!profileInput) {
        console.error('Profile image input element not found in DOM!');
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
    console.log('DOM loaded, initializing global.js...');
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        applyTheme('light');
    } else {
        applyTheme('dark');
    }
    
    setupProfileUploadListener();
    
    // Try to load profile picture after a delay
    setTimeout(() => {
        if (localStorage.getItem('userId')) {
            window.loadProfilePicture();
        }
    }, 1000);
    
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
    
    document.addEventListener('click', function(event) {
        const bell = document.querySelector('.notification-bell');
        const dropdown = document.getElementById('notificationsDropdown');
        if (bell && dropdown && !bell.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });
});
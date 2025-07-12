// Anti-code theft protection
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});

document.addEventListener('keydown', function(e) {
  // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
  if (e.key === 'F12' || 
      (e.ctrlKey && e.shiftKey && e.key === 'I') || 
      (e.ctrlKey && e.shiftKey && e.key === 'J') || 
      (e.ctrlKey && e.key === 'u')) {
    e.preventDefault();
  }
});

// Tab switching
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.getAttribute('data-tab');
    
    // Update active tab button
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Show corresponding content
    tabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === tabId) {
        content.classList.add('active');
      }
    });
  });
});

// URL shortening form
const shortenForm = document.getElementById('shorten-form');
const urlInput = document.getElementById('url-input');
const resultContainer = document.getElementById('result-container');
const shortUrlInput = document.getElementById('short-url');
const copyBtn = document.getElementById('copy-btn');
const qrCodeContainer = document.getElementById('qr-code');

shortenForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const url = urlInput.value.trim();
  
  if (!url) return;
  
  try {
    const response = await fetch('/l/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      shortUrlInput.value = data.shortUrl;
      resultContainer.classList.add('active');
      
      // Generate QR code
      const qr = qrcode(0, 'L');
      qr.addData(data.shortUrl);
      qr.make();
      qrCodeContainer.innerHTML = qr.createImgTag(4);
    } else {
      alert(data.error || 'Failed to shorten URL');
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Failed to shorten URL');
  }
});

// Copy short URL
copyBtn.addEventListener('click', () => {
  shortUrlInput.select();
  document.execCommand('copy');
  
  copyBtn.textContent = 'Copied!';
  copyBtn.classList.add('copied');
  
  setTimeout(() => {
    copyBtn.textContent = 'Copy';
    copyBtn.classList.remove('copied');
  }, 2000);
});

// File upload form
const uploadForm = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const uploadBtn = document.querySelector('.upload-btn');
const uploadResult = document.getElementById('upload-result');
const downloadUrlInput = document.getElementById('download-url');
const copyDownloadBtn = document.getElementById('copy-download-btn');
const fileNameDisplay = document.querySelector('.file-name');

// Drag and drop functionality
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
  dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight() {
  dropZone.classList.add('highlight');
}

function unhighlight() {
  dropZone.classList.remove('highlight');
}

dropZone.addEventListener('drop', handleDrop, false);
dropZone.addEventListener('click', () => fileInput.click());

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  
  if (files.length) {
    fileInput.files = files;
    handleFiles(files);
  }
}

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) {
    handleFiles(fileInput.files);
  }
});

function handleFiles(files) {
  const file = files[0];
  
  if (file.size > 100 * 1024 * 1024) {
    alert('File size exceeds 100MB limit');
    return;
  }
  
  fileNameDisplay.textContent = file.name;
  uploadBtn.disabled = false;
}

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!fileInput.files.length) return;
  
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  
  try {
    const response = await fetch('/f/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (response.ok) {
      downloadUrlInput.value = data.downloadUrl;
      uploadResult.classList.add('active');
    } else {
      alert(data.error || 'Failed to upload file');
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Failed to upload file');
  }
});

// Copy download URL
copyDownloadBtn.addEventListener('click', () => {
  downloadUrlInput.select();
  document.execCommand('copy');
  
  copyDownloadBtn.textContent = 'Copied!';
  copyDownloadBtn.classList.add('copied');
  
  setTimeout(() => {
    copyDownloadBtn.textContent = 'Copy';
    copyDownloadBtn.classList.remove('copied');
  }, 2000);
});

// Animation on scroll
const animateOnScroll = () => {
  const features = document.querySelectorAll('.feature');
  
  features.forEach(feature => {
    const featurePosition = feature.getBoundingClientRect().top;
    const screenPosition = window.innerHeight / 1.3;
    
    if (featurePosition < screenPosition) {
      feature.style.opacity = '1';
      feature.style.transform = 'translateY(0)';
    }
  });
};

// Set initial state for animation
document.querySelectorAll('.feature').forEach(feature => {
  feature.style.opacity = '0';
  feature.style.transform = 'translateY(20px)';
  feature.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

window.addEventListener('scroll', animateOnScroll);
animateOnScroll(); // Run once on page load

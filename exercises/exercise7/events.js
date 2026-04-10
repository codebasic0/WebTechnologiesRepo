// Event Handling JavaScript

// Mouse Events
document.getElementById('hoverBtn').addEventListener('mouseover', function() {
    document.getElementById('hoverMsg').textContent = '✓ Mouse over detected!';
});

document.getElementById('hoverBtn').addEventListener('mouseout', function() {
    document.getElementById('hoverMsg').textContent = '✗ Mouse left the button';
});

document.getElementById('clickBtn').addEventListener('click', function() {
    document.getElementById('clickMsg').textContent = '✓ Button clicked! Click count: ' + (parseInt(this.dataset.clicks || 0) + 1);
    this.dataset.clicks = parseInt(this.dataset.clicks || 0) + 1;
});

document.getElementById('dblClickBtn').addEventListener('dblclick', function() {
    document.getElementById('dblClickMsg').textContent = '✓ Double click detected!';
    this.style.backgroundColor = '#667eea';
    setTimeout(() => {
        this.style.backgroundColor = '';
    }, 1000);
});

// Drag and Drop Events
const draggableBox = document.getElementById('draggableBox');
let offsetX = 0, offsetY = 0;
let isDragging = false;

draggableBox.addEventListener('mousedown', function(e) {
    isDragging = true;
    offsetX = e.clientX - draggableBox.getBoundingClientRect().left;
    offsetY = e.clientY - draggableBox.getBoundingClientRect().top;
    draggableBox.classList.add('dragging');
    document.getElementById('dragMsg').textContent = '✓ Dragging...';
});

document.addEventListener('mousemove', function(e) {
    if (isDragging) {
        draggableBox.style.position = 'absolute';
        draggableBox.style.left = (e.clientX - offsetX) + 'px';
        draggableBox.style.top = (e.clientY - offsetY) + 'px';
    }
});

document.addEventListener('mouseup', function() {
    if (isDragging) {
        isDragging = false;
        draggableBox.classList.remove('dragging');
        document.getElementById('dragMsg').textContent = '✓ Drag completed!';
    }
});

// Keyboard Events
const keyInput = document.getElementById('keyInput');

keyInput.addEventListener('keydown', function(e) {
    document.getElementById('keyDownMsg').textContent = `KeyDown: ${e.key} (Code: ${e.code})`;
});

keyInput.addEventListener('keyup', function(e) {
    document.getElementById('keyUpMsg').textContent = `KeyUp: ${e.key}`;
});

keyInput.addEventListener('keypress', function(e) {
    document.getElementById('keyPressMsg').textContent = `KeyPress: ${e.key}`;
});

// Form Events
document.getElementById('username').addEventListener('focus', function() {
    document.getElementById('focusMsg').textContent = '✓ Username field focused';
    this.style.borderColor = '#667eea';
});

document.getElementById('username').addEventListener('blur', function() {
    document.getElementById('focusMsg').textContent = '✗ Username field blurred';
    this.style.borderColor = '';
});

document.getElementById('email').addEventListener('change', function() {
    document.getElementById('changeMsg').textContent = `✓ Email changed to: ${this.value}`;
});

document.getElementById('subject').addEventListener('input', function() {
    const count = this.value.length;
    document.getElementById('inputMsg').textContent = `✓ Characters typed: ${count}`;
});

document.getElementById('eventForm').addEventListener('submit', function(e) {
    e.preventDefault();
    addEventLog('Form submitted');
    alert('Form Events Captured Successfully!');
});

// Window Events
window.addEventListener('resize', function() {
    document.getElementById('windowWidth').textContent = window.innerWidth;
    document.getElementById('windowHeight').textContent = window.innerHeight;
});

window.addEventListener('scroll', function() {
    document.getElementById('scrollPos').textContent = window.scrollY;
});

window.addEventListener('load', function() {
    document.getElementById('windowWidth').textContent = window.innerWidth;
    document.getElementById('windowHeight').textContent = window.innerHeight;
});

document.addEventListener('visibilitychange', function() {
    const status = document.getElementById('visibilityStatus');
    if (document.hidden) {
        status.textContent = '✗ Page is hidden';
    } else {
        status.textContent = '✓ Page is visible';
    }
});

// Custom Events
const customEvent = new CustomEvent('userAction', {
    detail: { message: 'Custom event triggered' }
});

document.getElementById('emitterBtn').addEventListener('click', function() {
    document.dispatchEvent(customEvent);
});

document.addEventListener('userAction', function(e) {
    addEventLog('CustomEvent: ' + e.detail.message);
});

// Event Logging
function addEventLog(message) {
    const eventLog = document.getElementById('eventLog');
    const logItem = document.createElement('div');
    logItem.className = 'log-item';
    const time = new Date().toLocaleTimeString();
    logItem.innerHTML = `
        <div><span class="log-time">${time}</span> - ${message}</div>
    `;
    eventLog.insertBefore(logItem, eventLog.firstChild);
    
    // Keep only last 10 items
    while (eventLog.children.length > 10) {
        eventLog.removeChild(eventLog.lastChild);
    }
}

function clearEventLog() {
    document.getElementById('eventLog').innerHTML = '';
}

// Event Bubbling / Capturing
const parent = document.getElementById('parent');
const child = document.getElementById('child');
const grandchild = document.getElementById('grandchild');

// Capturing phase (useCapture: true)
parent.addEventListener('click', function() {
    addPropagationLog('Parent clicked (Capturing)');
}, true);

// Bubbling phase (useCapture: false)
parent.addEventListener('click', function() {
    addPropagationLog('Parent clicked (Bubbling)');
}, false);

child.addEventListener('click', function(e) {
    // e.stopPropagation(); // Uncomment to stop bubbling
    addPropagationLog('Child clicked');
}, false);

grandchild.addEventListener('click', function(e) {
    addPropagationLog('Grandchild clicked');
}, false);

function addPropagationLog(message) {
    const propLog = document.getElementById('propagationLog');
    const logItem = document.createElement('div');
    logItem.className = 'log-item';
    const time = new Date().toLocaleTimeString();
    logItem.innerHTML = `<div><span class="log-time">${time}</span> - ${message}</div>`;
    propLog.insertBefore(logItem, propLog.firstChild);
    
    // Keep only last 15 items
    while (propLog.children.length > 15) {
        propLog.removeChild(propLog.lastChild);
    }
}

function clearPropagationLog() {
    document.getElementById('propagationLog').innerHTML = '';
}

// Scroll to Top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Initialize on load
window.addEventListener('load', function() {
    addEventLog('Page loaded - All event listeners initialized');
});

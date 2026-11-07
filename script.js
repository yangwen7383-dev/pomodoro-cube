// 1. Grab the cube and the buttons from the HTML
const cube = document.querySelector('.cube');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');

// --- Initialize the Alarm Sound ---
const alarmSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

// 2. Variables to track the current rotation angles
let currentX = 0;
let currentY = 0;

// 3. The function that actually spins the cube
function rotateCube() {
    // Update the CSS transform
    cube.style.transform = `translateZ(-100px) rotateX(${currentX}deg) rotateY(${currentY}deg)`;
    
    // NEW: Update the preview text immediately when the cube spins
    if (!isPlaying) {
        let previewMinutes = getActiveMinutes();
        updateDisplay(previewMinutes * 60);
    }
}

// 4. Listeners: When a button is clicked, add or subtract 90 degrees
leftBtn.addEventListener('click', () => {
    currentY -= 90;
    rotateCube();
});

rightBtn.addEventListener('click', () => {
    currentY += 90;
    rotateCube();
});

upBtn.addEventListener('click', () => {
    currentX += 90;
    rotateCube();
});

downBtn.addEventListener('click', () => {
    currentX -= 90;
    rotateCube();
});

// --- 5. Grab the Timer UI Elements ---
const timeDisplay = document.getElementById('time-display');
const playBtn = document.getElementById('play-btn');
let timerInterval;
let isPlaying = false;

// --- 6. Helper: Calculate which face is pointing forward ---
function getActiveMinutes() {
    // Just like in C++, modulo on negative numbers can be tricky. 
    // This formula ensures we always get a positive angle (0, 90, 180, or 270).
    let x = ((currentX % 360) + 360) % 360;
    let y = ((currentY % 360) + 360) % 360;

    // X-axis rotations (looking at Top or Bottom)
    if (x === 90) return 60;  // Bottom face
    if (x === 270) return 45; // Top face

    // If looking at the horizon (X is 0), check the Y-axis rotation
    if (x === 0) {
        if (y === 0) return 5;    // Front face
        if (y === 90) return 25;  // Left face
        if (y === 180) return 10; // Back face
        if (y === 270) return 15; // Right face
    }
    
    // If the cube is flipped completely upside down (X is 180)
    if (x === 180) {
        if (y === 0) return 10;   // Back face
        if (y === 90) return 15;  // Right face
        if (y === 180) return 5;  // Front face
        if (y === 270) return 25; // Left face
    }
    
    return 5; // Default fallback
}

// --- 7. Formatting the Time (MM:SS) ---
function updateDisplay(totalSeconds) {
    let m = Math.floor(totalSeconds / 60);
    let s = totalSeconds % 60;
    
    // Add a leading zero if the number is less than 10 (e.g., 5 becomes "05")
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    
    timeDisplay.textContent = `${m}:${s}`;
}

// --- 8. The Countdown Engine ---
playBtn.addEventListener('click', () => {
    // Prevent starting multiple timers if the user spams the Play button
    if (isPlaying) return;
    
    let minutes = getActiveMinutes();
    let totalSeconds = minutes * 60;
    
    isPlaying = true;
    playBtn.textContent = "Running...";
    playBtn.style.backgroundColor = "#ff595e"; // Turn button red while running

    // Immediately show the starting time
    updateDisplay(totalSeconds);

    // Start the 1-second loop
    timerInterval = setInterval(() => {
        totalSeconds--;
        updateDisplay(totalSeconds);

// Stop the timer when it hits zero
        if (totalSeconds <= 0) {
            clearInterval(timerInterval);
            isPlaying = false;
            playBtn.textContent = "Play";
            playBtn.style.backgroundColor = "#8ac926"; // Reset to green
            
            // 1. Play the audio file
            alarmSound.play();

            // 2. Delay the alert pop-up by half a second
            setTimeout(() => {
                alert("Pomodoro Complete! Time for a break.");
            }, 500);
        }
    }, 1000); // 1000 milliseconds = 1 second
});

// --- 9. Variables for Swipe Tracking ---
let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;

// --- 10. Process the Swipe Direction ---
function handleSwipe() {
    // Calculate the distance moved on both axes
    const diffX = endX - startX;
    const diffY = endY - startY;
    
    // Set a minimum distance (in pixels) so accidental twitches aren't counted
    const swipeThreshold = 30;

    // Determine if the swipe was mostly horizontal or mostly vertical
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal Swipe
        if (Math.abs(diffX) > swipeThreshold) {
            if (diffX > 0) {
                // Swipe Right
                currentY += 90;
            } else {
                // Swipe Left
                currentY -= 90;
            }
            rotateCube();
        }
    } else {
        // Vertical Swipe
        if (Math.abs(diffY) > swipeThreshold) {
            if (diffY > 0) {
                // Swipe Down
                currentX -= 90; 
            } else {
                // Swipe Up
                currentX += 90;
            }
            rotateCube();
        }
    }
}

// --- 11. Mobile Touch Events ---
document.addEventListener('touchstart', (e) => {
    // Record the starting coordinate of the first finger
    startX = e.changedTouches[0].screenX;
    startY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', (e) => {
    // Record the ending coordinate and trigger the logic
    endX = e.changedTouches[0].screenX;
    endY = e.changedTouches[0].screenY;
    handleSwipe();
});

// --- 12. Desktop Mouse Events ---
let isDragging = false;

document.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.screenX;
    startY = e.screenY;
});

document.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    endX = e.screenX;
    endY = e.screenY;
    handleSwipe();
});

// --- 13. The Reset Functionality ---
const resetBtn = document.getElementById('reset-btn');

resetBtn.addEventListener('click', () => {
    // 1. Kill the continuous countdown loop
    clearInterval(timerInterval);
    
    // 2. Reset our gatekeeper variable so Play can be clicked again
    isPlaying = false;
    
    // 3. Reset the Play button's appearance back to its default state
    playBtn.textContent = "Play";
    playBtn.style.backgroundColor = "#8ac926"; 
    
    // 4. Recalculate which face is active and reset the text display
    let resetMinutes = getActiveMinutes();
    updateDisplay(resetMinutes * 60);
});
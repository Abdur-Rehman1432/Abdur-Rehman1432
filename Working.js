
const arrayVisual = document.getElementById('array-visual');
const arraySizeSpan = document.getElementById('array-size');
const addInput = document.getElementById('add-input');
const addBtn = document.getElementById('add-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const playBtn = document.getElementById('play-btn');
const playText = document.getElementById('play-text'); // 🔹 FIX
const playIcon = document.getElementById('play-icon');   // ✅ NEW
const pauseIcon = document.getElementById('pause-icon'); // ✅ NEW
const stepBtn = document.getElementById('step-btn');
const resetBtn = document.getElementById('reset-btn');
const speedSlider = document.getElementById('speed-slider');
const speedValueSpan = document.getElementById('speed-value');

let arrayData = [64, 34, 25, 12, 22, 11, 90];
let animationSpeed = 800; // Default speed in ms
let isSorting = false;
let sortGenerator = null;
let timeoutId = null;

speedSlider.value = animationSpeed;
speedValueSpan.textContent = `${animationSpeed}ms`; // ✅ FIX

// Render Array
function renderArray() {
    arrayVisual.innerHTML = '';
    arrayData.forEach((value, index) => {
        const boxWrapper = document.createElement('div');
        boxWrapper.className = 'array-box-wrapper';
        boxWrapper.innerHTML = `
            <div class="array-box">${value}</div>
            <div class="array-index">[${index}]</div>
        `;
        arrayVisual.appendChild(boxWrapper);
    });
    arraySizeSpan.textContent = `Size: ${arrayData.length} elements`; // ✅ FIX
}

// Quick Add
function addElement() {
    const value = parseInt(addInput.value);
    if (isNaN(value)) {
        alert("Please enter a valid number.");
        return;
    }
    arrayData.push(value);
    renderArray();
    addInput.value = '';
}

// Shuffle Array
function shuffleArray() {
    for (let i = arrayData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayData[i], arrayData[j]] = [arrayData[j], arrayData[i]];
    }
    renderArray();
}

// Bubble Sort Generator (left → right highlighting)
function* bubbleSortGenerator() {
    const n = arrayData.length;
    let boxes = arrayVisual.querySelectorAll('.array-box');
    
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            boxes = arrayVisual.querySelectorAll('.array-box');
            // Highlight elements being compared
            boxes[j].classList.add('highlight-compare');
            boxes[j + 1].classList.add('highlight-compare');
            yield; // Pause for visualization

            if (arrayData[j] > arrayData[j + 1]) {
                // Swap logic
                [arrayData[j], arrayData[j + 1]] = [arrayData[j + 1], arrayData[j]];
                renderArray();
                boxes = arrayVisual.querySelectorAll('.array-box');
                boxes[j].classList.add('highlight-swap');
                boxes[j + 1].classList.add('highlight-swap');
                yield; // Pause after swap
            }
            
            boxes[j].classList.remove('highlight-compare', 'highlight-swap');
            boxes[j + 1].classList.remove('highlight-compare', 'highlight-swap');
        }

        // ✅ After each pass, mark the left side as sorted
        boxes = arrayVisual.querySelectorAll('.array-box');
        for (let k = 0; k <= i; k++) {
            boxes[k].classList.add('highlight-sorted');
        }
    }

    // ✅ Finally, mark the last element as sorted too
    if (n > 0) {
        boxes = arrayVisual.querySelectorAll('.array-box');
        boxes[n - 1].classList.add('highlight-sorted');
    }
}

// 🔹 Play / Pause toggle
function toggleSort() {
    if (!isSorting) {
        // Start / Resume Sorting
        isSorting = true;
        playText.textContent = "Pause"; 
        playIcon.classList.add("hidden");   // ✅ Hide Play
        pauseIcon.classList.remove("hidden"); // ✅ Show Pause

        if (!sortGenerator) {
            sortGenerator = bubbleSortGenerator();
        }

        function step() {
            const { done } = sortGenerator.next();
            if (done) {
                isSorting = false;
                sortGenerator = null;
                playText.textContent = "Play"; 
                playIcon.classList.remove("hidden"); // ✅ Show Play
                pauseIcon.classList.add("hidden");   // ✅ Hide Pause
                return;
            }
            if (isSorting) {
                timeoutId = setTimeout(step, animationSpeed);
            }
        }
        step();
    } else {
        // Pause Sorting
        isSorting = false;
        clearTimeout(timeoutId);
        playText.textContent = "Play"; 
        playIcon.classList.remove("hidden"); // ✅ Show Play
        pauseIcon.classList.add("hidden");   // ✅ Hide Pause
    }
}

// 🔹 Manual Step (1 move only)
function stepSort() {
    if (!sortGenerator) {
        sortGenerator = bubbleSortGenerator();
    }
    sortGenerator.next();
}

// 🔹 Reset
function resetArray() {
    clearTimeout(timeoutId);
    isSorting = false;
    sortGenerator = null;
    arrayData = [64, 34, 25, 12, 22, 11, 90];
    playText.textContent = "Play"; 
    playIcon.classList.remove("hidden"); // ✅ Show Play
    pauseIcon.classList.add("hidden");   // ✅ Hide Pause
    renderArray();
}

// Event Listeners
addBtn.addEventListener('click', addElement);
shuffleBtn.addEventListener('click', shuffleArray);
resetBtn.addEventListener('click', resetArray);
playBtn.addEventListener('click', toggleSort);
stepBtn.addEventListener('click', stepSort);

speedSlider.addEventListener('input', (e) => {
    animationSpeed = parseInt(e.target.value);
    speedValueSpan.textContent = `${animationSpeed}ms`; 
});

// Initial render
renderArray();

//create array....................

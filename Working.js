// ========================== DOM ELEMENT REFERENCES ==========================
const arrayVisual = document.getElementById('array-visual');
const arraySizeSpan = document.getElementById('array-size');
const addInput = document.getElementById('add-input');
const addBtn = document.getElementById('add-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const playBtn = document.getElementById('play-btn');
const stepBtn = document.getElementById('step-btn');
const resetBtn = document.getElementById('reset-btn');
const speedSlider = document.getElementById('speed-slider');
const speedValueSpan = document.getElementById('speed-value');
const sidebarItems = document.querySelectorAll('.sidebar-item');

// Play/Pause button icons and text
const playIcon = playBtn.querySelector('#play-icon');
const pauseIcon = playBtn.querySelector('#pause-icon');
const playText = playBtn.querySelector('#play-text');

// ========================== INITIAL STATE VARIABLES ==========================
const DEFAULT_ARRAY = [64, 34, 25, 12, 22, 11, 90];
let arrayData = [...DEFAULT_ARRAY];    // Current array data
let animationSpeed = 800;              // Default animation speed (ms)
let isSorting = false;                 // Sorting state flag
let sortGenerator = null;              // Holds sorting generator function
let timeoutId = null;                  // Holds timeout for animation loop

// Set initial slider and speed label
speedSlider.value = animationSpeed;
speedValueSpan.textContent = `${animationSpeed}ms`;

// ========================== SIDEBAR TAB HANDLING ==========================
function handleSidebarSelection(event) { 
    // event.preventDefault();  <-- removed

    sidebarItems.forEach(item => item.classList.remove('active-tab'));
    event.currentTarget.classList.add('active-tab');
}

// Add event listeners to each sidebar item
sidebarItems.forEach(item => {
    item.addEventListener('click', handleSidebarSelection);
});

// ========================== RENDERING THE ARRAY VISUAL ==========================
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
    updateArraySize();
}

// Update the "Size: N elements" text
function updateArraySize() {
    arraySizeSpan.textContent = `Size: ${arrayData.length} elements`;
}

// ========================== ADD ELEMENT FUNCTION ==========================
function addElement() {
    if (isSorting) stopSorting(); // Stop sorting before adding
    const value = parseInt(addInput.value);
    if (isNaN(value)) {
        // Show error message if input is invalid
        const messageBox = document.createElement('div');
        messageBox.textContent = "Please enter a valid number.";
        messageBox.className = 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-red-100 text-red-800 rounded-lg shadow-xl z-50';
        document.body.appendChild(messageBox);
        setTimeout(() => messageBox.remove(), 2000);
        return;
    }
    arrayData.push(value);
    renderArray();
    // Highlight newly added element
    const newBox = arrayVisual.lastElementChild.querySelector('.array-box');
    if (newBox) {
        newBox.classList.add('highlight-add');
        setTimeout(() => {
            newBox.classList.remove('highlight-add');
        }, animationSpeed);
    }
    addInput.value = '';
}

// ========================== SHUFFLE ARRAY FUNCTION ==========================
function shuffleArray() {
    if (isSorting) stopSorting(); // Stop sorting before shuffle
    for (let i = arrayData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayData[i], arrayData[j]] = [arrayData[j], arrayData[i]];
    }
    renderArray();
}

// ========================== BUBBLE SORT GENERATOR (left → right highlighting) ==========================
function* bubbleSortGenerator() {
    const n = arrayData.length;
    let boxes = arrayVisual.querySelectorAll('.array-box');

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            boxes = arrayVisual.querySelectorAll('.array-box');
            // Highlight elements being compared
            boxes[j].classList.add('highlight-compare');
            boxes[j + 1].classList.add('highlight-swap');
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

// ========================== SORT CONTROL FUNCTIONS ==========================
function toggleSort() {
    if (!isSorting) {
        startSorting();
    } else {
        pauseSorting();
    }
}

// Start/resume sorting
function startSorting() {
    if (!sortGenerator) {
        sortGenerator = bubbleSortGenerator();
    }
    isSorting = true;
    playBtn.classList.add('active-play-btn');
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    playText.textContent = "Pause";
    stepSort();
}

// Pause sorting
function pauseSorting() {
    isSorting = false;
    clearTimeout(timeoutId);
    playBtn.classList.remove('active-play-btn');
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    playText.textContent = "Play";
}

// Automatic step execution (loop with timeout)
function stepSort() {
    if (!isSorting) return;

    const { done } = sortGenerator.next();
    if (done) {
        isSorting = false;
        sortGenerator = null;
    } else {
        timeoutId = setTimeout(stepSort, animationSpeed);
    }
}

// Manual step-by-step sorting
function stepManual() {
    if (isSorting) pauseSorting();
    if (!sortGenerator) {
        sortGenerator = bubbleSortGenerator();
    }
    const { done } = sortGenerator.next();
    if (done) {
        isSorting = false;
        sortGenerator = null;
    }
}

// Stop sorting and reset state
function stopSorting() {
    isSorting = false;
    clearTimeout(timeoutId);
    sortGenerator = null;
    playBtn.classList.remove('active-play-btn');
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    playText.textContent = "Play";
    renderArray();
}

// ========================== RESET ARRAY FUNCTION ==========================
function resetArray() {
    stopSorting();
    arrayData = [...DEFAULT_ARRAY];
    renderArray();
}

// ========================== EVENT LISTENERS ==========================
addBtn.addEventListener('click', addElement);
shuffleBtn.addEventListener('click', shuffleArray);
resetBtn.addEventListener('click', resetArray);
playBtn.addEventListener('click', toggleSort);
stepBtn.addEventListener('click', stepManual);

// Speed slider change listener
speedSlider.addEventListener('input', (e) => {
    animationSpeed = parseInt(e.target.value);
    speedValueSpan.textContent = `${animationSpeed}ms`;
});

// ========================== INITIAL RENDER ==========================
// Initialize CodeMirror editor
var cppEditor = CodeMirror.fromTextArea(document.getElementById("cpp-editor"), {
  mode: "text/x-c++src",
  theme: "default",
  lineNumbers: true,
  autoCloseBrackets: true,
  matchBrackets: true,
});

// Run visualization on button click
document.getElementById("run-code").addEventListener("click", function () {
  const code = cppEditor.getValue();

  // Simple parsing: check if array is declared in code
  const match = code.match(/int\s+(\w+)\[(\d+)\]\s*=\s*{([^}]*)}/);
  const container = document.getElementById("array-visual");
  container.innerHTML = "";

  if (match) {
    const size = parseInt(match[2]);
    const values = match[3].split(",").map(v => v.trim());

    document.getElementById("array-size").textContent =
      "Size: " + size + " elements";

    values.forEach((val, i) => {
      const box = document.createElement("div");
      box.className =
        "w-12 h-12 flex items-center justify-center border border-blue-600 rounded text-blue-600 font-bold";
      box.textContent = val || 0;
      container.appendChild(box);
    });
  } else {
    alert("No valid C++ array found in the code!");
  }
});




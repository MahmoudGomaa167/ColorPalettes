// Selectors
const colorsDiv = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type = "range"]');
let currentHexes = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy-container');
const adjustmentBtn = document.querySelectorAll('.adjust');
const lockBtn = document.querySelectorAll('.lock');
const closeAdjustmentBtn = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');
const libraryContainer = document.querySelector('.library-container');
const libraryBtn = document.querySelector('.library');
const closeLibrary = document.querySelector('.close-library');
let savedPalettes = [];
let initialColors;


// Event Listeners
sliders.forEach(slider => {
    slider.addEventListener('input', hslControls)
});

colorsDiv.forEach((div, index) => {
    div.addEventListener('change', function () {
        updateTextUi(index);
    })
});

currentHexes.forEach(hex => {
    hex.addEventListener('click', (e) => {
        copyToClipboard(e);
    })
});

popup.addEventListener('transitionend', () => {
    const popupBox = popup.children[0];
    popup.classList.remove('active');
    popupBox.classList.remove('active');
});

adjustmentBtn.forEach((button, index) => {
    button.addEventListener('click', () => {
        openAdjustmentPanel(index);
    })
});

closeAdjustmentBtn.forEach((button, index) => {
    button.addEventListener('click', () => {
        closeAdjustmentPanel(index);
    })
});

generateBtn.addEventListener('click', randomColors);

lockBtn.forEach((button, index) => {
    button.addEventListener('click', () => {
        lockColor(index);
    })
});

saveBtn.addEventListener('click', openSavePalette);

closeSave.addEventListener('click', closeSavePalette);

submitSave.addEventListener('click', savePalette);

libraryBtn.addEventListener('click', openLibraryPanel);

closeLibrary.addEventListener('click', closeLibraryPanel);

// Functions
function generateHex() {
    let hexColor = chroma.random();
    return hexColor;
}

function randomColors() {

    initialColors = [];
    colorsDiv.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();
        if (div.classList.contains('locked')) {
            initialColors.push(hexText.textContent);
            return;
        } else {
            initialColors.push(chroma(randomColor).hex());
        }

        hexText.innerText = randomColor;
        div.style.backgroundColor = randomColor;

        checkTextContrast(randomColor, hexText);

        const color = chroma(randomColor);
        const sliders = div.querySelectorAll('.sliders input');
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSliders(color, hue, brightness, saturation);
    });

    resetInputs();

    adjustmentBtn.forEach((button, index) => {
        checkTextContrast(initialColors[index], button);
        checkTextContrast(initialColors[index], lockBtn[index]);
    })
}

function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();
    if (luminance > 0.5) {
        text.style.color = '#000';
    } else {
        text.style.color = '#fff';
    }
}

function colorizeSliders(color, hue, brightness, saturation) {
    // Scale Saturation
    const minSat = color.set('hsl.s', 0);
    const maxSat = color.set('hsl.s', 1);
    const scaleSat = chroma.scale([minSat, color, maxSat]);

    // Scale Brightness
    const midBright = color.set('hsl.l', 0.5);
    const scaleBright = chroma.scale(['black', midBright, 'white']);


    // Update Inputs
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204, 75, 75), rgb(204, 204, 75), rgb(75, 204, 75), rgb(75, 204, 204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75))`;
}

function hslControls(e) {
    const index = e.target.dataset.hue || e.target.dataset.bright || e.target.dataset.sat;

    const sliders = e.target.closest('.sliders').querySelectorAll('input[type = "range"]');
    const hue = sliders[0];
    const bright = sliders[1];
    const sat = sliders[2];

    const bgColor = initialColors[index];

    let color = chroma(bgColor).set('hsl.h', hue.value).set('hsl.s', sat.value).set('hsl.l', bright.value);

    colorsDiv[index].style.backgroundColor = color;

    colorizeSliders(color, hue, bright, sat)
}

function updateTextUi(index) {
    const activeDiv = colorsDiv[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');
    textHex.innerText = color.hex();
    checkTextContrast(color, textHex);
    icons.forEach(icon => {
        checkTextContrast(color, icon);
    })
}

function resetInputs() {
    const sliders = document.querySelectorAll('.sliders input');
    sliders.forEach(slider => {
        if (slider.name === 'hue') {
            const hueColor = initialColors[slider.dataset.hue];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        }
        if (slider.name === 'brightness') {
            const brightColor = initialColors[slider.dataset.bright];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = (brightValue * 100) / 100;
        }
        if (slider.name === 'saturation') {
            const satColor = initialColors[slider.dataset.sat];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = (satValue * 100) / 100;
        }
    })
}

async function copyToClipboard(e) {
    if (!navigator.clipboard) return;

    const text = e.target.innerText;
    try {
        await navigator.clipboard.writeText(text);
        const popupBox = popup.children[0];
        popup.classList.add('active');
        popupBox.classList.add('active');

    } catch (err) {
        alert(err);
    }
}

function openAdjustmentPanel(index) {
    sliderContainers[index].classList.toggle('active');
}

function closeAdjustmentPanel(index) {
    sliderContainers[index].classList.remove('active');
}

function lockColor(index) {
    colorsDiv[index].classList.toggle('locked');
    lockBtn[index].children[0].classList.toggle('fa-lock');
    lockBtn[index].children[0].classList.toggle('fa-lock-open');
}

function openSavePalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
}

function closeSavePalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
}

function savePalette() {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
    const name = saveInput.value;
    const colors = [];
    currentHexes.forEach(hex => {
        colors.push(hex.innerText);
    });

    let paletteNr;
    const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
    if(paletteObjects){
        paletteNr = paletteObjects.length;
    }else{
        paletteNr = savedPalettes.length;
    }
    const paletteObj = { name, colors, Nr: paletteNr };
    savedPalettes.push(paletteObj);

    saveToLocal(paletteObj);
    saveInput.value = '';
}

function saveToLocal(paletteObj) {
    let localPalettes;
    if (!localStorage.getItem('palettes')) {
        localPalettes = [];
    } else {
        localPalettes = JSON.parse(localStorage.getItem('palettes'));
    }

    localPalettes.push(paletteObj);
    localStorage.setItem('palettes', JSON.stringify(localPalettes));

    const palette = document.createElement('div');
    palette.classList.add('custom-palette');
    const title = document.createElement('h4');
    title.innerText = paletteObj.name;
    const preview = document.createElement('div');
    preview.classList.add('small-preview');
    paletteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
    });

    const paletteBtn = document.createElement('button');
    paletteBtn.classList.add('pick-palette-btn');
    paletteBtn.classList.add(paletteObj.Nr);
    paletteBtn.innerText = 'Select';

    paletteBtn.addEventListener('click', e => {
        closeLibraryPanel();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        savedPalettes[paletteIndex].colors.forEach((color, index) => {
            initialColors.push(color);
            colorsDiv[index].style.backgroundColor = color;
            const text = colorsDiv[index].children[0];
            checkTextContrast(color, text);
            updateTextUi(index);
        })
        resetInputs();
    })

    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);
}

function openLibraryPanel() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add('active');
    popup.classList.add('active');
}

function closeLibraryPanel() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove('active');
    popup.classList.remove('active');
}

function getLocal() {
    if (!localStorage.getItem('palettes')) {
        localPalettes = [];
    } else {
        const paletteObjects = JSON.parse(localStorage.getItem('palettes'));

        savedPalettes = [...paletteObjects];

        paletteObjects.forEach(paletteObj => {
            const palette = document.createElement('div');
            palette.classList.add('custom-palette');
            const title = document.createElement('h4');
            title.innerText = paletteObj.name;
            const preview = document.createElement('div');
            preview.classList.add('small-preview');
            paletteObj.colors.forEach(smallColor => {
                const smallDiv = document.createElement('div');
                smallDiv.style.backgroundColor = smallColor;
                preview.appendChild(smallDiv);
            });

            const paletteBtn = document.createElement('button');
            paletteBtn.classList.add('pick-palette-btn');
            paletteBtn.classList.add(paletteObj.Nr);
            paletteBtn.innerText = 'Select';

            paletteBtn.addEventListener('click', e => {
                closeLibraryPanel();
                const paletteIndex = e.target.classList[1];
                initialColors = [];
                paletteObjects[paletteIndex].colors.forEach((color, index) => {
                    initialColors.push(color);
                    colorsDiv[index].style.backgroundColor = color;
                    const text = colorsDiv[index].children[0];
                    checkTextContrast(color, text);
                    updateTextUi(index);
                })
                resetInputs();
            })

            palette.appendChild(title);
            palette.appendChild(preview);
            palette.appendChild(paletteBtn);
            libraryContainer.children[0].appendChild(palette);
        })
    }
}

getLocal();
randomColors();
let myStorage = localStorage;
let currentColorElem = document.querySelector(".currentColor");
let currentColorElemStyles = getComputedStyle(currentColorElem);

let previousColorElem = document.querySelector(".previousColor");
let previousColorElemStyles = getComputedStyle(previousColorElem);

let action;
let cols = document.querySelectorAll('.canvas div');
let tools = document.querySelector('.tools__container');

let canvas = document.querySelector('.canvas');
let canvasChilds = canvas.querySelectorAll('div');

window.onload = function() {
    action = myStorage.action;
    setCursor();
    previousColorElem.style.backgroundColor = myStorage.previousColorStyles;
    currentColorElem.style.backgroundColor = myStorage.currentColorStyles;
    if (!myStorage.canvasChildsChangedSt) return;
    let childsSt = JSON.parse(myStorage.canvasChildsChangedSt);
    for (var i = 0; i < canvasChilds.length; i++) {
        if (childsSt[i].length == 0 ) continue;
        if ('backgroundColor' in childsSt[i]) {
            canvasChilds[i].style.backgroundColor = childsSt[i].backgroundColor;
        }
        if (childsSt[i].borderRadius == '50%') {
            canvasChilds[i].setAttribute('class', 'circle');
        } else {
            canvasChilds[i].setAttribute('class', 'square');
        }
    }
}

tools.addEventListener('click', setAction);
function setAction(event) {
    let target = event.target;

    if (target.tagName != 'IMG') return;

    action = target.getAttribute('data-action');
    myStorage.setItem('action', action);
    setCursor();
}
function setCursor() {
    if (action == 'paint') {
        document.body.style.cursor = "url('assets/images/paint_bucket.png'), auto";
    }
    if (action == 'choose') {
        document.body.style.cursor = "url('assets/images/color_picker.png') 3 24, auto";
    }
    if (action == 'move') {
        document.body.style.cursor = "url('assets/images/move_tool.png'), auto"; 
        setDragHandler();
    }
    if (action == 'transform') {
        document.body.style.cursor = "url('assets/images/transform_tool.png'), auto";
    }
    if (action == '') {
        document.body.style.cursor = "auto";
    }
}
document.body.onkeypress = function(event) {
    
    if (event.charCode == 112) {
        action = 'paint';
    }
    if (event.charCode == 99) {
        action = 'choose';
    }
    if (event.charCode == 109) {
        action = 'move';
        setDragHandler();
    }
    if (event.charCode == 116) {
        action = 'transform';
    }
    if (event.charCode == 114) {
        action = '';
    }
    myStorage.setItem('action', action);
    setCursor();
}

canvas.onclick = function(event) {
    let target = event.target;
    if (event.which != 1) return;
    if (target.tagName != 'DIV') return;
    if (action == 'paint') {
        target.style.backgroundColor = currentColorElemStyles.backgroundColor;
    }
    if (action == 'transform') {
        (target.getAttribute('class') == 'square') ? target.setAttribute('class', 'circle') : target.setAttribute('class', 'square');
    }
    saveStyles();
}
                 
let dragSrcEl = null;
function handleDragStart(e) {
    this.style.opacity = '0.4';  
    dragSrcEl = this;
}
function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); 
    }
    e.dataTransfer.dropEffect = 'move';  
    return false;
}
function handleDragEnter(e) {
    this.classList.add('over');
}
function handleDragLeave(e) {
    this.classList.remove('over');  
}
function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation(); 
    }
    let elem1 = dragSrcEl;
    let elem2 = e.target;
    exchangeElements(elem1, elem2);
    saveStyles();
    return false;
}
function handleDragEnd(e) {
    dragSrcEl.style.opacity = '';
    [].forEach.call(cols, function (col) {
        col.classList.remove('over');
    });
}
function exchangeElements(elem1, elem2) {
    let result = elem1.compareDocumentPosition(elem2);
    const afterElem2 = (result == 4) ? elem2.nextElementSibling : elem1.nextElementSibling;
    const parent = elem2.parentNode;
    (result == 4) ? elem1.replaceWith(elem2) : elem2.replaceWith(elem1);
    (result == 4) ? canvas.insertBefore(elem1, afterElem2) : parent.insertBefore(elem2, afterElem2);
}
function setDragHandler() {
    [].forEach.call(cols, function(col) {
        col.addEventListener('dragstart', handleDragStart, false);
        col.addEventListener('dragenter', handleDragEnter, false);
        col.addEventListener('dragover', handleDragOver, false);
        col.addEventListener('dragleave', handleDragLeave, false);
        col.addEventListener('drop', handleDrop, false);
        col.addEventListener('dragend', handleDragEnd, false);
    });
}

document.body.addEventListener('click', chooseColor);
function chooseColor(event) {
    let target = event.target;
    if (target.tagName == 'IMG') return;
    if (action != 'choose') return;
                
    let tasrgetStyles = getComputedStyle(target);
    let color = tasrgetStyles.backgroundColor;

    previousColorElem.style.backgroundColor = currentColorElemStyles.backgroundColor;
    currentColorElem.style.backgroundColor = color;
    myStorage.previousColorStyles = myStorage.currentColorStyles;
    myStorage.currentColorStyles = color;
}

function saveStyles() {
    let canvasChilds = canvas.querySelectorAll('div');
    let canvasChildsChangedSt = Array.from(canvasChilds).map(item => getComputedStyle(item));
    myStorage.setItem('canvasChildsChangedSt', JSON.stringify(canvasChildsChangedSt));
}   
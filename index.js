const mutationQueue = [];

function addMutationToQueue(mutation) {
  mutationQueue.push(mutation);
}

function readMutationFromQueue() {
  return mutationQueue.shift();
}

const mutationObserverCallback = function (mutationsList, observer) {
  for (const mutation of mutationsList) {
    const target = mutation.target;
    const type = mutation.type;
    if (type === "childList") {
      continue;
    }

    if (type === "attributes") {
      const attributeName = mutation.attributeName;
      if (attributeName === null) {
        continue;
      }
      const attributeValue = mutation.target.getAttribute(attributeName);
      addMutationToQueue({
        attributeName,
        attributeValue,
      });
      continue;
    }
    if (type === "characterData") {
      continue;
    }
  }
};

function applyToPlayer(mutation) {
  console.log("applyToPlayer() mutation=", mutation);
  const player = document.getElementById("player");
  player[mutation.attributeName] = mutation.attributeValue;
}

const fullQueueTimeout = 100;
const emptyQueueTimeout = 500;

function tryApplyMutationFromQueue() {
  const nextMutation = readMutationFromQueue();
  console.log("nextMutation=", nextMutation);
  if (nextMutation == null) {
    setTimeout(() => tryApplyMutationFromQueue(), emptyQueueTimeout);
    return;
  }

  applyToPlayer(nextMutation);
  setTimeout(() => tryApplyMutationFromQueue(), fullQueueTimeout);
}

const colors = ["#FF0000", "#FF7900", "#FFEA00", "#2CFF00", "#0020A5"];

const sizes = ["50px", "100px", "150px", "200px", "250px"];

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

let currentColorIndex = null;
let currentSizeIndex = null;

function onClickChangeSourceElement() {
  console.log("changeSource()");
  const source = document.getElementById("source");

  let colorIndex = getRandomInt(0, colors.length);
  if (colorIndex === currentColorIndex) {
    colorIndex = (colorIndex + 1) % colors.length;
  }
  currentColorIndex = colorIndex;
  const newColor = colors[colorIndex];

  let sizeIndex = getRandomInt(0, sizes.length);
  if (sizeIndex === currentSizeIndex) {
    sizeIndex = (sizeIndex + 1) % sizes.length;
  }
  currentSizeIndex = sizeIndex;
  const newSize = sizes[sizeIndex];

  source.style.backgroundColor = newColor;
  source.style.width = newSize;
  source.style.height = newSize;
}

function setupPage() {
  const button = document.getElementById("changeSourceElement");
  button.onclick = onClickChangeSourceElement;

  const observer = new MutationObserver(mutationObserverCallback);
  const targetNode = document.getElementById("source");
  const config = { attributes: true, childList: true, subtree: true };
  observer.observe(targetNode, config);

  tryApplyMutationFromQueue();
}

document.onreadystatechange = () => {
  if (document.readyState === "complete") {
    setupPage();
  }
};

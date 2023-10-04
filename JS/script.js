async function getData(url) {
  try {
    let data = await fetch(url);

    if (!data.ok) {
      throw new Error(`HTTP error! Status: ${data.status}`);
    }
    return await data.json();
  } catch (err) {
    console.log(err);
  }
}

getData("data.json")
  .then(async (data) => {
    const lvl = await getLevel();
    return { data, lvl };
  })
  .then(({ data, lvl }) => {
    let levelsSeconds = {
      easy: 6,
      medium: 4,
      hard: 2,
    };
    startGame(data, lvl, levelsSeconds);
  })
  .catch((err) => {
    console.error(err);
  });

function getLevel() {
  return new Promise((resolve, reject) => {
    let form = document.querySelectorAll("form")[0];
    let lvlInput = form.querySelector("[name='level-selection']");

    form.onsubmit = function (event) {
      event.preventDefault();
      let lvl = lvlInput.value;
      form.remove();
      resolve(lvl);
    };
  });
}
function startGame(data, lvl, levelsSeconds) {
  let wordsArr = [];
  let duration = levelsSeconds[lvl];

  let controlBox = document.querySelector(".control-box");
  let currentWord = document.querySelector(".current-word");
  let enterWord = document.querySelector(".enter-word");
  let wordsContainer = document.querySelector(".words-container");
  let timerDiv = document.querySelector(".timer-div");
  let timerBox = timerDiv.querySelector(".timer");

  controlBox.classList.remove("none-class");
  currentWord.classList.remove("none-class");
  enterWord.classList.remove("none-class");
  wordsContainer.classList.remove("none-class");
  timerDiv.classList.remove("none-class");

  data["words"].forEach((word) => {
    if (lvl === "hard") {
      wordsArr.push(word);
    } else if (lvl === "medium" && word.length <= 7) {
      wordsArr.push(word);
    } else if (lvl === "easy" && word.length <= 5) {
      wordsArr.push(word);
    }
  });

  controlBox.querySelector(".current-level").textContent = `[ ${lvl} ]`;
  controlBox.querySelector(
    ".type-word-time"
  ).textContent = `[ ${levelsSeconds[lvl]} ]`;
  currentWord.textContent = wordsArr.shift();

  timer(duration, timerBox);
  updateContainer(wordsContainer, wordsArr);
}
function updateContainer(wordsContainer, wordArr) {
  wordsContainer.innerHTML = "";
  wordArr.forEach((element) => {
    let wordSpan = document.createElement("span");
    wordSpan.textContent = element;
    wordsContainer.appendChild(wordSpan);
  });
}

function timer(time, timerBox) {
  let duration = time;
  let intervalFun = setInterval(() => {
    timerBox.textContent = duration;
    if (--duration < 0) {
      clearInterval(intervalFun);
    }
  }, 1000);
}

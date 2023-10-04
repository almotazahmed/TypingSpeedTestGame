async function fetchData(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error; // Re-throw the error to propagate it to the caller.
  }
}

// Function to get the level from the user before remove the form.
async function getLevel() {
  return new Promise((resolve) => {
    const form = document.querySelector("form");
    const lvlInput = form.querySelector("[name='level-selection']");

    form.onsubmit = function (event) {
      event.preventDefault();
      const lvl = lvlInput.value;
      form.remove();
      resolve(lvl);
    };
  });
}

function startGame(data, lvl, levelsSeconds) {
  // Select HTML elements
  const gameBox = document.querySelector(".game");
  const controlBox = document.querySelector(".control-box");
  const currentWordBox = document.querySelector(".current-word");
  const enterWord = document.querySelector(".enter-word");
  const wordsContainer = document.querySelector(".words-container");
  const timerDiv = document.querySelector(".timer-div");
  const timerBox = document.querySelector(".timer");
  const currentScore = document.querySelector(".score-number");
  const wordsLengthBox = document.querySelector(".words-length");

  // Remove 'none-class' from selected elements
  [controlBox, currentWordBox, enterWord, wordsContainer, timerDiv].forEach(
    (element) => {
      element.classList.remove("none-class");
    }
  );

  let wordsArr = [];
  // Filter words based on the selected difficulty level
  data.words.forEach((word) => {
    if (
      lvl === "hard" ||
      (lvl === "medium" && word.length <= 7) ||
      (lvl === "easy" && word.length <= 5)
    ) {
      wordsArr.push(word);
    }
  });

  let wordsArrLength = wordsArr.length;
  let currentWord = wordsArr.shift();

  const game = {
    wordsArr,
    numberOfCorrectWords: 0,
    currentWord,
    level: lvl,
    timerInterval: null,
  };

  function updateUI() {
    currentWordBox.textContent = game.currentWord;
    currentScore.textContent = game.numberOfCorrectWords;
    updateWordList(wordsContainer, game.wordsArr);
  }

  // function to update the [wordsContainer] Box By the current [game.wordsArr].
  function updateWordList(wordsContainer, wordsArr) {
    wordsContainer.innerHTML = "";
    wordsArr.forEach((word) => {
      const wordSpan = document.createElement("span");
      wordSpan.textContent = word;
      wordsContainer.appendChild(wordSpan);
    });
  }

  // After finishing i publish a popup to tell the user if he/she when or lose.
  function finishPopup(flag) {
    gameBox.classList.add("finish");
    enterWord.classList.add("finish");
    let mainPopup = document.createElement("div");
    mainPopup.className = "finish-popup";
    let status = document.createElement("div");
    status.className = "status";
    if (flag) {
      status.innerHTML = `Congratulations You Won In The <span>${lvl}</span> Level, You Got <span>${wordsArrLength}/${wordsArrLength}</span>`;
    } else {
      status.innerHTML = `GameOver You Lose In The <span>${lvl}</span> Level You, Got  <span>${game.numberOfCorrectWords}/${wordsArrLength}</span>`;
    }
    let btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = "Replay";
    btn.addEventListener("click", () => {
      window.location.reload();
    });
    mainPopup.appendChild(status);
    mainPopup.appendChild(btn);
    document.body.appendChild(mainPopup);
  }

  // TimerOut function to set the [game.timerInterval], if the time finished before I write the word,
  // the function would call the [finishPopup] function which I enter to it as a parameter
  function timerOut(duration, callback) {
    game.timerInterval = setInterval(() => {
      timerBox.textContent = duration;
      if (--duration < 0) {
        clearInterval(game.timerInterval);
        if (typeof callback === "function") {
          callback(false);
        }
      }
    }, 1000);
  }

  // Assign the handleInput Event to the [enterWord] input field
  // which works every time I enter a character.
  enterWord.addEventListener("input", handleInput);

  function handleInput(event) {
    const typedWord = event.target.value.toLowerCase();

    if (typedWord === game.currentWord.toLowerCase()) {
      game.numberOfCorrectWords++;
      event.target.value = "";
      // If [game.wordsArr] is empty clear the interval, call [finishPopup] function
      // And remove the event listener from the [enterWord] input.
      if (game.wordsArr.length === 0) {
        clearInterval(game.timerInterval);
        finishPopup(true);
        enterWord.removeEventListener("input", handleInput);
      } else {
        // While the [game.wordsArr] does not empty renew the interval And update
        // [game.currentWord] by shifting a word from the [game.wordsArr].
        clearInterval(game.timerInterval);
        let duration = levelsSeconds[lvl];
        game.currentWord = game.wordsArr.shift();
        timerOut(duration, finishPopup);
      }
      // Every time i match the word the currentWordBox is updated the the score in the footer.
      updateUI();
    }
  }

  // Update displayed information One when i start the game.
  controlBox.querySelector(".current-level").textContent = `[ ${lvl} ]`;
  controlBox.querySelector(
    ".type-word-time"
  ).textContent = `[ ${levelsSeconds[lvl]} ]`;
  wordsLengthBox.textContent = game.wordsArr.length + 1;

  // Update the UI and turn on the Interval to first start.
  updateUI();
  timerOut(levelsSeconds[lvl] + 3, finishPopup);
}

async function initializeGame() {
  try {
    const data = await fetchData("data.json");
    const level = await getLevel();
    const levelsSeconds = {
      easy: 6,
      medium: 4,
      hard: 3,
    };

    startGame(data, level, levelsSeconds);
  } catch (error) {
    console.error(error);
  }
}

initializeGame();

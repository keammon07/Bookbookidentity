
(function () {
  "use strict";

  var DATA = window.BOOK_IDENTITY_DATA;
  var CHARACTERS = DATA.characters;
  var QUESTIONS = DATA.questions;
  var SCORE_KEYS = ["builder", "healer", "explorer", "detective", "dreamwalker"];
  var ROMANS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

  var state = {
    index: 0,
    answers: [],
    scores: createEmptyScores(),
    result: null,
    locked: false,
    readerName: "Dear Reader",
    shuffledAnswers: []
  };

  var screens = {
    cover: document.getElementById("coverScreen"),
    intro: document.getElementById("introScreen"),
    quiz: document.getElementById("quizScreen"),
    loading: document.getElementById("loadingScreen"),
    unlock: document.getElementById("unlockScreen"),
    result: document.getElementById("resultScreen")
  };

  var els = {
    startBtn: document.getElementById("startBtn"),
    beginBtn: document.getElementById("beginBtn"),
    backBtn: document.getElementById("backBtn"),
    restartBtn: document.getElementById("restartBtn"),
    downloadBtn: document.getElementById("downloadBtn"),
    shareBtn: document.getElementById("shareBtn"),
    unlockBookBtn: document.getElementById("unlockBookBtn"),
    unlockHintBtn: document.getElementById("unlockHintBtn"),
    readerName: document.getElementById("readerName"),

    chapterLabel: document.getElementById("chapterLabel"),
    chapterTitle: document.getElementById("chapterTitle"),
    pageLabel: document.getElementById("pageLabel"),
    progressFill: document.getElementById("progressFill"),
    progressText: document.getElementById("progressText"),
    questionPrompt: document.getElementById("questionPrompt"),
    questionText: document.getElementById("questionText"),
    answerList: document.getElementById("answerList"),
    questionCard: document.getElementById("questionCard"),

    loadingText: document.getElementById("loadingText"),
    loadingSubtext: document.getElementById("loadingSubtext"),
    loadingFill: document.getElementById("loadingFill"),

    resultHero: document.getElementById("resultHero"),
    resultOwner: document.getElementById("resultOwner"),
    resultSymbol: document.getElementById("resultSymbol"),
    resultName: document.getElementById("resultName"),
    resultThai: document.getElementById("resultThai"),
    resultQuote: document.getElementById("resultQuote"),
    resultDescription: document.getElementById("resultDescription"),
    dnaList: document.getElementById("dnaList"),
    secondaryText: document.getElementById("secondaryText"),
    categoryList: document.getElementById("categoryList"),

    shareCanvas: document.getElementById("shareCanvas")
  };

  function createEmptyScores() {
    var scores = {};
    SCORE_KEYS.forEach(function (key) {
      scores[key] = 0;
    });
    return scores;
  }

  function showScreen(name) {
    Object.keys(screens).forEach(function (key) {
      screens[key].classList.toggle("is-active", key === name);
    });
    window.scrollTo(0, 0);
  }

  function setAccent(character) {
    document.documentElement.style.setProperty("--accent", character.color);
    document.documentElement.style.setProperty("--accent-rgb", character.rgb);
  }

  function resetAccent() {
    document.documentElement.style.setProperty("--accent", "#b69450");
    document.documentElement.style.setProperty("--accent-rgb", "182,148,80");
  }

  function resetQuiz() {
    state.index = 0;
    state.answers = [];
    state.scores = createEmptyScores();
    state.result = null;
    state.locked = false;
    state.shuffledAnswers = [];
  }



  function shuffleArray(items) {
    var shuffled = items.slice();

    for (var i = shuffled.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }

    return shuffled;
  }

  function prepareShuffledAnswers() {
    state.shuffledAnswers = QUESTIONS.map(function (question) {
      return shuffleArray(
        question.answers.map(function (answer, originalIndex) {
          return {
            answer: answer,
            originalIndex: originalIndex
          };
        })
      );
    });
  }

  function getPrimaryScoreKey(answer) {
    var keys = Object.keys(answer.score);

    keys.sort(function (a, b) {
      return answer.score[b] - answer.score[a];
    });

    return keys[0];
  }

  function formatQuestionText(text) {
    var phrases = [
      "คุณจะเลือกโลกแบบไหน?",
      "คุณมักทำอะไรต่อ?",
      "ใกล้กับตัวคุณที่สุด?"
    ];

    var output = text;

    phrases.forEach(function (phrase) {
      if (output.indexOf(phrase) !== -1) {
        output = output.replace(
          phrase,
          '<span class="keep-together">' + phrase + '</span>'
        );
      }
    });

    return output;
  }

  function renderQuestion() {
    var question = QUESTIONS[state.index];

    els.chapterLabel.textContent = "Chapter " + ROMANS[state.index];
    els.chapterTitle.textContent = question.chapter;
    els.pageLabel.textContent = "Page " + String(state.index + 1).padStart(2, "0");
    els.progressFill.style.width = (((state.index + 1) / QUESTIONS.length) * 100) + "%";
    els.progressText.textContent = "บทที่ " + (state.index + 1) + " จาก " + QUESTIONS.length;
    els.questionPrompt.textContent = question.prompt;
    els.questionText.innerHTML = formatQuestionText(question.question);
    els.backBtn.disabled = state.index === 0;

    els.answerList.innerHTML = "";

    state.shuffledAnswers[state.index].forEach(function (item) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "answer-btn";
      button.textContent = item.answer.text;

      if (state.answers[state.index] === item.originalIndex) {
        button.classList.add("is-selected");
      }

      button.addEventListener("click", function () {
        selectAnswer(item.originalIndex, button);
      });

      els.answerList.appendChild(button);
    });

    els.questionCard.classList.remove("is-entering");
    void els.questionCard.offsetWidth;
    els.questionCard.classList.add("is-entering");
  }

  function selectAnswer(answerIndex, button) {
    if (state.locked) return;

    state.locked = true;
    button.classList.add("is-selected");
    state.answers[state.index] = answerIndex;

    window.setTimeout(function () {
      if (state.index < QUESTIONS.length - 1) {
        state.index += 1;
        state.locked = false;
        renderQuestion();
      } else {
        calculateScores();
        startLoading();
      }
    }, 260);
  }

  function calculateScores() {
    state.scores = createEmptyScores();

    state.answers.forEach(function (answerIndex, questionIndex) {
      var answer = QUESTIONS[questionIndex].answers[answerIndex];
      var primaryKey = getPrimaryScoreKey(answer);
      state.scores[primaryKey] += 1;
    });
  }

  function rankScores() {
    return SCORE_KEYS.slice().sort(function (a, b) {
      if (state.scores[b] !== state.scores[a]) {
        return state.scores[b] - state.scores[a];
      }
      return SCORE_KEYS.indexOf(a) - SCORE_KEYS.indexOf(b);
    });
  }

  function normalizeScores() {
    var total = SCORE_KEYS.reduce(function (sum, key) {
      return sum + state.scores[key];
    }, 0);

    var percentages = {};

    SCORE_KEYS.forEach(function (key) {
      percentages[key] = total > 0
        ? Number(((state.scores[key] / total) * 100).toFixed(1))
        : 0;
    });

    return percentages;
  }

  function startQuiz() {
    var typedName = els.readerName.value.trim();

    resetQuiz();
    state.readerName = typedName || "Dear Reader";
    prepareShuffledAnswers();

    showScreen("quiz");
    renderQuestion();
  }

  function goBack() {
    if (state.index === 0 || state.locked) return;
    state.index -= 1;
    renderQuestion();
  }

  function startLoading() {
    var messages = [
      {
        title: "กำลังอ่านคำโปรย...",
        subtext: "กำลังเริ่มต้นค้นหาเรื่องราวที่ใกล้กับคุณ"
      },
      {
        title: "กำลังเปิดสารบัญ...",
        subtext: "คำตอบทั้งแปดบทกำลังถูกจัดเรียง"
      },
      {
        title: "กำลังพลิกหน้าสำคัญ...",
        subtext: "ทุกตัวเลือกกำลังกลายเป็น Bookshelf DNA"
      },
      {
        title: "กำลังค้นหาเรื่องราวของคุณ...",
        subtext: "ตัวตนนักอ่านที่เด่นที่สุดกำลังปรากฏ"
      },
      {
        title: "กำลังเขียนหน้าสุดท้าย...",
        subtext: "หนังสือของคุณใกล้พร้อมเปิดแล้ว"
      }
    ];

    showScreen("loading");

    var index = 0;
    var progress = 20;

    els.loadingText.textContent = messages[0].title;
    els.loadingSubtext.textContent = messages[0].subtext;
    els.loadingFill.style.width = progress + "%";

    var timer = window.setInterval(function () {
      index += 1;

      if (index >= messages.length) {
        window.clearInterval(timer);
        els.loadingFill.style.width = "100%";

        window.setTimeout(function () {
          prepareUnlock();
        }, 450);

        return;
      }

      progress = Math.min((index + 1) * 20, 100);
      els.loadingText.textContent = messages[index].title;
      els.loadingSubtext.textContent = messages[index].subtext;
      els.loadingFill.style.width = progress + "%";
    }, 3000);
  }


  function prepareUnlock() {
    console.info("Book Identity build 3.1: unlock screen");
    var unlockStage = document.querySelector(".unlock-stage");
    if (unlockStage) {
      unlockStage.classList.remove("is-unlocking");
    }
    showScreen("unlock");
  }

  function unlockResult() {
    var unlockStage = document.querySelector(".unlock-stage");
    if (!unlockStage || unlockStage.classList.contains("is-unlocking")) return;

    unlockStage.classList.add("is-unlocking");

    window.setTimeout(function () {
      renderResult();
    }, 1750);
  }

  function renderResult() {
    var ranking = rankScores();
    var primaryKey = ranking[0];
    var secondaryKey = ranking[1];
    var primary = CHARACTERS[primaryKey];
    var secondary = CHARACTERS[secondaryKey];
    var percentages = normalizeScores();

    state.result = {
      primaryKey: primaryKey,
      secondaryKey: secondaryKey,
      primary: primary,
      secondary: secondary,
      percentages: percentages,
      readerName: state.readerName
    };

    setAccent(primary);

    els.resultHero.style.setProperty("--identity-color", primary.color);
    els.resultOwner.textContent = state.readerName;
    els.resultSymbol.textContent = primary.symbol;
    els.resultName.textContent = primary.name;
    els.resultThai.textContent = primary.thai;
    els.resultQuote.textContent = "“" + primary.quote + "”";
    els.resultDescription.textContent = primary.description;
    els.secondaryText.textContent =
      "ตัวตนของคุณมีความเป็น " + primary.thai +
      " เด่นที่สุด และยังผสมผสานความเป็น " + secondary.thai +
      " อยู่ในเรื่องราวเดียวกัน";

    els.dnaList.innerHTML = "";

    ranking.forEach(function (key) {
      var character = CHARACTERS[key];
      var row = document.createElement("div");
      row.className = "dna-row";

      var head = document.createElement("div");
      head.className = "dna-head";

      var label = document.createElement("span");
      label.textContent = character.name.replace("THE ", "");

      var percent = document.createElement("strong");
      percent.textContent = percentages[key] + "%";

      head.appendChild(label);
      head.appendChild(percent);

      var track = document.createElement("div");
      track.className = "dna-track";

      var bar = document.createElement("div");
      bar.className = "dna-bar";
      bar.style.setProperty("--dna-color", character.color);
      bar.setAttribute("data-width", String(percentages[key]));

      track.appendChild(bar);
      row.appendChild(head);
      row.appendChild(track);
      els.dnaList.appendChild(row);
    });

    els.categoryList.innerHTML = "";
    primary.categories.forEach(function (category) {
      var chip = document.createElement("span");
      chip.className = "category-chip";
      chip.textContent = category;
      els.categoryList.appendChild(chip);
    });

    showScreen("result");

    document.querySelectorAll(".result-hero, .result-section").forEach(function (el, index) {
      window.setTimeout(function () {
        el.classList.add("is-visible");
      }, index * 130);
    });

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        document.querySelectorAll(".dna-bar").forEach(function (bar) {
          bar.style.width = bar.getAttribute("data-width") + "%";
        });
      });
    });
  }

  function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
    var words = text.split(" ");
    var line = "";

    words.forEach(function (word) {
      var testLine = line ? line + " " + word : word;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line, x, y);
        y += lineHeight;
        line = word;
      } else {
        line = testLine;
      }
    });

    if (line) {
      ctx.fillText(line, x, y);
    }
  }

  function createShareImage() {
    if (!state.result) return null;

    var canvas = els.shareCanvas;
    var ctx = canvas.getContext("2d");
    var result = state.result;
    var primary = result.primary;
    var percentages = result.percentages;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var background = ctx.createLinearGradient(0, 0, 1080, 1920);
    background.addColorStop(0, "#F6F0E6");
    background.addColorStop(1, "#E8DDCD");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, 1080, 1920);

    ctx.fillStyle = primary.color;
    ctx.fillRect(70, 70, 940, 930);

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,.78)";
    ctx.font = "700 30px Arial";
    ctx.fillText("BOOK IDENTITY", 540, 145);

    ctx.font = "500 24px Arial";
    ctx.fillStyle = "rgba(255,255,255,.72)";
    ctx.fillText("THIS BOOK BELONGS TO", 540, 205);

    ctx.font = "600 42px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(state.result.readerName, 540, 255);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 104px Arial";
    ctx.fillText(primary.symbol, 540, 390);

    ctx.font = "700 82px Arial";
    ctx.fillText(primary.name, 540, 545);

    ctx.font = "500 38px Arial";
    ctx.fillText(primary.thai, 540, 610);

    ctx.font = "500 34px Arial";
    drawWrappedText(ctx, "“" + primary.quote + "”", 540, 715, 760, 48);

    ctx.textAlign = "left";
    ctx.fillStyle = "#2A2824";
    ctx.font = "700 46px Georgia";
    ctx.fillText("Bookshelf DNA", 110, 1110);

    SCORE_KEYS.forEach(function (key, index) {
      var y = 1200 + (index * 120);
      var character = CHARACTERS[key];

      ctx.font = "600 27px Arial";
      ctx.fillStyle = "#2A2824";
      ctx.fillText(character.name.replace("THE ", ""), 110, y);

      ctx.textAlign = "right";
      ctx.fillText(percentages[key] + "%", 970, y);
      ctx.textAlign = "left";

      ctx.fillStyle = "rgba(42,40,36,.10)";
      ctx.fillRect(110, y + 24, 860, 18);

      ctx.fillStyle = character.color;
      ctx.fillRect(110, y + 24, 860 * (percentages[key] / 100), 18);
    });

    ctx.textAlign = "center";
    ctx.fillStyle = "#746D63";
    ctx.font = "500 28px Arial";
    ctx.fillText("Discover Your Reading Identity", 540, 1840);

    return canvas.toDataURL("image/png");
  }

  function downloadCard() {
    var dataUrl = createShareImage();
    if (!dataUrl) return;

    var link = document.createElement("a");
    link.download = "book-identity-" + state.result.primaryKey + ".png";
    link.href = dataUrl;
    link.click();
  }

  function shareResult() {
    if (!state.result) return;

    var text =
      state.result.readerName + " คือ " + state.result.primary.name +
      " — " + state.result.primary.thai;

    var dataUrl = createShareImage();
    if (!dataUrl) {
      downloadCard();
      return;
    }

    fetch(dataUrl)
      .then(function (response) { return response.blob(); })
      .then(function (blob) {
        var file = new File(
          [blob],
          "book-identity-" + state.result.primaryKey + ".png",
          { type: "image/png" }
        );

        var shareData = {
          title: "Book Identity",
          text: text,
          files: [file]
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
          return navigator.share(shareData);
        }

        if (navigator.share) {
          return navigator.share({
            title: "Book Identity",
            text: text,
            url: window.location.href
          });
        }

        downloadCard();
        return null;
      })
      .catch(function () {
        downloadCard();
      });
  }

  function restart() {
    document.querySelectorAll(".result-hero, .result-section").forEach(function (el) {
      el.classList.remove("is-visible");
    });
    resetAccent();
    resetQuiz();
    showScreen("cover");
  }

  function bindEvents() {
    els.startBtn.addEventListener("click", function () {
      showScreen("intro");
    });

    els.beginBtn.addEventListener("click", startQuiz);
    els.backBtn.addEventListener("click", goBack);
    els.restartBtn.addEventListener("click", restart);
    els.downloadBtn.addEventListener("click", downloadCard);
    els.shareBtn.addEventListener("click", shareResult);
    els.unlockBookBtn.addEventListener("click", unlockResult);
    els.unlockHintBtn.addEventListener("click", unlockResult);
  }

  function init() {
    bindEvents();
    showScreen("cover");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

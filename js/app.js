
const App=(()=>{
  let index=0,answers=[],scores=emptyScores(),result=null;
  const romans=["I","II","III","IV","V","VI","VII","VIII"];

  const chapterRoman=document.getElementById("chapterRoman");
  const chapterTitle=document.getElementById("chapterTitle");
  const pageNumber=document.getElementById("pageNumber");
  const progressFill=document.getElementById("progressFill");
  const progressText=document.getElementById("progressText");
  const questionPrompt=document.getElementById("questionPrompt");
  const questionText=document.getElementById("questionText");
  const answerList=document.getElementById("answerList");
  const questionPage=document.getElementById("questionPage");
  const backBtn=document.getElementById("backBtn");

  function renderQuestion(){
    const q=QUESTIONS[index];
    chapterRoman.textContent=`Chapter ${romans[index]}`;
    chapterTitle.textContent=q.chapter;
    pageNumber.textContent=`Page ${String(index+1).padStart(2,"0")}`;
    progressFill.style.width=`${(index+1)/QUESTIONS.length*100}%`;
    progressText.textContent=`บทที่ ${index+1} จาก ${QUESTIONS.length}`;
    questionPrompt.textContent=q.prompt;
    questionText.textContent=q.question;
    backBtn.disabled=index===0;

    answerList.innerHTML="";
    q.answers.forEach((a,i)=>{
      const btn=document.createElement("button");
      btn.type="button";btn.className="answer-btn";btn.textContent=a[0];
      btn.addEventListener("click",()=>selectAnswer(i,btn));
      answerList.appendChild(btn)
    });

    questionPage.classList.remove("is-entering");
    void questionPage.offsetWidth;
    questionPage.classList.add("is-entering")
  }

  function selectAnswer(i,btn){
    if(answerList.dataset.locked==="1")return;
    answerList.dataset.locked="1";
    btn.classList.add("is-selected");
    answers[index]=i;
    setTimeout(()=>{
      if(index<QUESTIONS.length-1){
        index++;answerList.dataset.locked="0";renderQuestion()
      }else{
        calculate();startLoading()
      }
    },260)
  }

  function calculate(){
    scores=emptyScores();
    answers.forEach((a,qi)=>addPoints(scores,QUESTIONS[qi].answers[a][1]))
  }

  function begin(){
    index=0;answers=[];scores=emptyScores();answerList.dataset.locked="0";
    UI.show("quiz");renderQuestion()
  }

  function back(){
    if(index===0)return;
    index--;answerList.dataset.locked="0";renderQuestion()
  }

  function startLoading(){
    UI.show("loading");
    const texts=["กำลังอ่านเรื่องราวของคุณ...","กำลังพลิกหน้าสำคัญ...","กำลังค้นหาตัวตนนักอ่าน...","กำลังเรียบเรียง Bookshelf DNA..."];
    const label=document.getElementById("loadingText");
    const bar=document.getElementById("loadingBar");
    let i=0,p=12;label.textContent=texts[0];bar.style.width=p+"%";
    const timer=setInterval(()=>{i=Math.min(i+1,texts.length-1);p=Math.min(p+24,92);label.textContent=texts[i];bar.style.width=p+"%"},560);
    setTimeout(()=>{clearInterval(timer);bar.style.width="100%";setTimeout(()=>result=ResultView.render(scores),320)},2300)
  }

  function restart(){
    result=null;
    document.querySelectorAll(".result-hero,.result-section").forEach(el=>el.classList.remove("is-visible"));
    UI.resetAccent();UI.show("cover")
  }

  function bind(){
    document.getElementById("startBtn").onclick=()=>UI.show("intro");
    document.getElementById("beginQuizBtn").onclick=begin;
    backBtn.onclick=back;
    document.getElementById("restartBtn").onclick=restart;
    document.getElementById("downloadBtn").onclick=()=>result&&ResultView.download(result);
    document.getElementById("shareBtn").onclick=()=>result&&ResultView.share(result)
  }

  function init(){bind();UI.show("cover")}
  return{init}
})();
document.addEventListener("DOMContentLoaded",App.init);


const ResultView=(()=>{
  const canvas=document.getElementById("shareCanvas");
  function render(scores){
    const ranking=rankScores(scores);
    const primary=CHARACTERS[ranking[0][0]];
    const secondary=CHARACTERS[ranking[1][0]];
    const percentages=normalizeScores(scores);

    UI.accent(primary);
    const hero=document.getElementById("resultHero");
    hero.style.setProperty("--identity-color",primary.color);
    document.getElementById("resultSymbol").textContent=primary.symbol;
    document.getElementById("resultName").textContent=primary.name;
    document.getElementById("resultThai").textContent=primary.thai;
    document.getElementById("resultQuote").textContent=`“${primary.quote}”`;
    document.getElementById("resultDescription").textContent=primary.description;
    document.getElementById("secondaryText").textContent=
      `นอกจากความเป็น ${primary.thai} แล้ว คุณยังมีความเป็น ${secondary.thai} อยู่ในตัวด้วย`;

    const dna=document.getElementById("dnaList");
    dna.innerHTML="";
    SCORE_KEYS.forEach(key=>{
      const c=CHARACTERS[key];
      const row=document.createElement("div");
      row.className="dna-row";
      row.innerHTML=`
        <div class="dna-head"><span>${c.name.replace("THE ","")}</span><strong>${percentages[key]}%</strong></div>
        <div class="dna-track"><div class="dna-bar" data-width="${percentages[key]}" style="--dna-color:${c.color}"></div></div>`;
      dna.appendChild(row);
    });

    const cat=document.getElementById("categoryList");
    cat.innerHTML="";
    primary.categories.forEach(label=>{
      const chip=document.createElement("span");
      chip.className="category-chip";
      chip.textContent=label;
      cat.appendChild(chip);
    });

    UI.show("result");
    UI.revealResults();
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      dna.querySelectorAll(".dna-bar").forEach(bar=>bar.style.width=bar.dataset.width+"%")
    }));
    return{primary,secondary,percentages}
  }

  function drawCard(result){
    const {primary,percentages}=result;
    const ctx=canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);

    const grad=ctx.createLinearGradient(0,0,1080,1920);
    grad.addColorStop(0,"#F7F1E6");
    grad.addColorStop(1,"#E9DECE");
    ctx.fillStyle=grad;ctx.fillRect(0,0,1080,1920);

    ctx.fillStyle=primary.color;ctx.fillRect(70,70,940,930);
    ctx.textAlign="center";
    ctx.fillStyle="rgba(255,255,255,.78)";
    ctx.font="700 30px Arial";ctx.fillText("BOOK IDENTITY",540,150);
    ctx.fillStyle="#fff";
    ctx.font="700 112px Georgia";ctx.fillText(primary.symbol,540,330);
    ctx.font="700 88px Georgia";ctx.fillText(primary.name,540,500);
    ctx.font="500 40px Arial";ctx.fillText(primary.thai,540,565);
    ctx.font="500 38px Georgia";
    const quote="“"+primary.quote+"”";
    const words=quote.split(" ");
    let line="",y=680;
    words.forEach(word=>{
      const t=line?line+" "+word:word;
      if(ctx.measureText(t).width>760&&line){ctx.fillText(line,540,y);y+=52;line=word}else line=t
    });
    if(line)ctx.fillText(line,540,y);

    ctx.textAlign="left";ctx.fillStyle="#2b2925";
    ctx.font="700 46px Georgia";ctx.fillText("Bookshelf DNA",110,1110);
    SCORE_KEYS.forEach((key,i)=>{
      const yy=1200+i*120,c=CHARACTERS[key];
      ctx.font="600 27px Arial";ctx.fillStyle="#2b2925";ctx.fillText(c.name.replace("THE ",""),110,yy);
      ctx.textAlign="right";ctx.fillText(percentages[key]+"%",970,yy);ctx.textAlign="left";
      ctx.fillStyle="rgba(43,41,37,.1)";ctx.fillRect(110,yy+24,860,18);
      ctx.fillStyle=c.color;ctx.fillRect(110,yy+24,860*percentages[key]/100,18);
    });
    ctx.textAlign="center";ctx.fillStyle="#756f66";ctx.font="500 28px Arial";
    ctx.fillText("Discover Your Reading Identity",540,1840);
    return canvas.toDataURL("image/png")
  }

  function download(result){
    const a=document.createElement("a");
    a.download=`book-identity-${result.primary.name.toLowerCase().replaceAll(" ","-")}.png`;
    a.href=drawCard(result);a.click()
  }

  async function share(result){
    const dataUrl=drawCard(result);
    const blob=await (await fetch(dataUrl)).blob();
    const file=new File([blob],"book-identity.png",{type:"image/png"});
    const data={title:"Book Identity",text:`ฉันคือ ${result.primary.name} — ${result.primary.thai}`,files:[file]};
    if(navigator.canShare?.(data)){await navigator.share(data);return}
    if(navigator.share){await navigator.share({title:data.title,text:data.text,url:location.href});return}
    download(result)
  }
  return{render,download,share}
})();

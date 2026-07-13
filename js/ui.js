
const UI=(()=>{
  const screens=[...document.querySelectorAll(".screen")];
  function show(name){
    screens.forEach(s=>s.classList.toggle("screen--active",s.dataset.screen===name));
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function accent(character){
    document.documentElement.style.setProperty("--accent",character.color);
    document.documentElement.style.setProperty("--accent-rgb",character.rgb);
  }
  function resetAccent(){
    document.documentElement.style.setProperty("--accent","#b99752");
    document.documentElement.style.setProperty("--accent-rgb","185,151,82");
  }
  function revealResults(){
    document.querySelectorAll(".result-hero,.result-section").forEach((el,i)=>{
      setTimeout(()=>el.classList.add("is-visible"),130*i)
    });
  }
  return{show,accent,resetAccent,revealResults}
})();

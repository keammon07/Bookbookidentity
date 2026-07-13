
const SCORE_KEYS=["builder","healer","explorer","detective","dreamwalker"];
function emptyScores(){return SCORE_KEYS.reduce((a,k)=>(a[k]=0,a),{})}
function addPoints(target,points){Object.entries(points).forEach(([k,v])=>target[k]=(target[k]||0)+v)}
function rankScores(scores){return Object.entries(scores).sort((a,b)=>b[1]-a[1])}
function normalizeScores(scores){
  const max=Math.max(...Object.values(scores),1);
  return SCORE_KEYS.reduce((a,k)=>(a[k]=Math.round(scores[k]/max*100),a),{})
}

const NS="http://www.w3.org/2000/svg";
const C=["#FFB3BA","#FFDFBA","#FFFFBA","#BAFFC9","#BAE1FF","#E2BAFF","#FFC9DE","#C9FFE6","#B3E5FC","#C8E6C9","#DCEDC8","#F0F4C3","#FFF9C4","#FFE0B2","#F8BBD9"];
function getN(n){return n[0];}
const CX=170,CY=170,RO=160,RI=40;

/* ============ 全局玩家名单 ============ */
const LS_PLAYERS = "p5_all_players";
let globalPlayers = ["小凉","小白","小泉","兰秋","暖冬"];
try {
  const saved = localStorage.getItem(LS_PLAYERS);
  if (saved) {
    const arr = JSON.parse(saved);
    if (Array.isArray(arr) && arr.length > 0) globalPlayers = arr;
  }
} catch(e) {}

function savePlayers() {
  localStorage.setItem(LS_PLAYERS, JSON.stringify(globalPlayers));
  renderAllPlayerBtns();
}

function renderAllPlayerBtns() {
  const containers = ["sP", "tP", "hP", "cP"];
  containers.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = globalPlayers.map(p => `<button class="bn" data-p="${p}">${p}</button>`).join("");
  });
}

window.editPlayers = function() {
  const str = prompt("请输入所有玩家的名字（用中文或英文逗号隔开）：\n例如：小凉,小白,小溪,兰秋,暖冬", globalPlayers.join("，"));
  if (str === null) return;
  const arr = str.split(/[,，]/).map(s => s.trim()).filter(Boolean);
  if (arr.length === 0) return alert("至少要有1个玩家哦！");
  globalPlayers = [...new Set(arr)];
  savePlayers();
  alert("玩家名单已更新！所有转盘同步生效。");
};

/* ============ 吐槽文案库 ============ */
const COMMENTS_NORMAL = ["这个角色适合你！","手气不错哦～","缘分到了挡不住！","天意如此，认命吧哈哈","这波不亏！","要不……再来一次？","看来今天欧气在线！","这个角色，很有挑战性！","稳了稳了，就它了！","命运的齿轮开始转动～"];
const COMMENTS_COMBO2 = ["连中两次！这运气有点东西！","欧皇附体了吧？","你俩是不是串通好了？","这都能连中，服了！"];
const COMMENTS_COMBO3 = ["三次！天选之人就是你！","这已经不是运气了，这是玄学！","建议去买彩票，真的","连中三次，朋友还做不做了😂"];

/* ============ 音效 ============ */
let AC=null;
function ensureAudio(){
  if(!AC){ try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){} }
  if(AC && AC.state==="suspended") AC.resume();
  return AC;
}
function tick(){
  const ac=ensureAudio(); if(!ac) return;
  const t=ac.currentTime;
  const o=ac.createOscillator(), g=ac.createGain();
  o.type="square"; o.frequency.setValueAtTime(900,t); o.frequency.exponentialRampToValueAtTime(500,t+0.03);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.12,t+0.004); g.gain.exponentialRampToValueAtTime(0.0001,t+0.05);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t+0.06);
}
function ding(){
  const ac=ensureAudio(); if(!ac) return;
  const t=ac.currentTime;
  [880,1320].forEach((f,i)=>{
    const o=ac.createOscillator(), g=ac.createGain();
    o.type="sine"; o.frequency.setValueAtTime(f,t);
    g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.18,t+0.01+i*0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+0.5);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t+0.55);
  });
}
function fanfare(){
  const ac=ensureAudio(); if(!ac) return;
  const t=ac.currentTime;
  [523,659,784,1046].forEach((f,i)=>{
    const o=ac.createOscillator(), g=ac.createGain();
    o.type="triangle"; o.frequency.setValueAtTime(f,t+i*0.09);
    g.gain.setValueAtTime(0.0001,t+i*0.09); g.gain.exponentialRampToValueAtTime(0.16,t+i*0.09+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+i*0.09+0.35);
    o.connect(g).connect(ac.destination); o.start(t+i*0.09); o.stop(t+i*0.09+0.4);
  });
}
function scheduleTicks(duration){
  let t=0, interval=0.045;
  while(t<duration-0.15){
    setTimeout(tick, t*1000);
    interval*=1.13; if(interval>0.32) interval=0.32; t+=interval;
  }
}

/* ============ 绘制转盘 ============ */
function drawWheel(svg,list,colors){
  while(svg.firstChild) svg.removeChild(svg.firstChild);
  const N=list.length, A=2*Math.PI/N;
  list.forEach((name,i)=>{
    const a1=i*A-Math.PI/2, a2=(i+1)*A-Math.PI/2;
    const x1=CX+RO*Math.cos(a1),y1=CY+RO*Math.sin(a1);
    const x2=CX+RO*Math.cos(a2),y2=CY+RO*Math.sin(a2);
    const x3=CX+RI*Math.cos(a2),y3=CY+RI*Math.sin(a2);
    const x4=CX+RI*Math.cos(a1),y4=CY+RI*Math.sin(a1);
    const la=A>Math.PI?1:0;
    const d=`M${x1},${y1} A${RO},${RO} 0 ${la},1 ${x2},${y2} L${x3},${y3} A${RI},${RI} 0 ${la},0 ${x4},${y4} Z`;
    const p=document.createElementNS(NS,"path");
    p.setAttribute("d",d); p.setAttribute("fill",colors[i%colors.length]); p.setAttribute("stroke","#fff");
    svg.appendChild(p);
    const am=(a1+a2)/2, mR=(RO+RI)/2;
    const TX=CX+mR*Math.cos(am), TY=CY+mR*Math.sin(am);
    const rt=am*180/Math.PI+90;
    const t=document.createElementNS(NS,"text");
    t.setAttribute("x",TX); t.setAttribute("y",TY); t.setAttribute("text-anchor","middle"); t.setAttribute("dominant-baseline","middle"); t.setAttribute("transform",`rotate(${rt},${TX},${TY})`);
    t.setAttribute("font-size", N>30?"10":(N>15?"11":"12")); t.setAttribute("font-weight","bold"); t.setAttribute("fill","#333");
    t.textContent=getN(name);
    svg.appendChild(t);
  });
}

/* ============ 结果弹窗 ============ */
const resultMask=document.getElementById("resultMask");
const resultCard=document.getElementById("resultCard");
let resultTimer=null;
function showResult(player, charName, combo){
  clearTimeout(resultTimer);
  const emoji = combo>=3 ? "👑" : combo>=2 ? "🌟" : "🎉";
  const cls = combo>=3 ? "diamond" : combo>=2 ? "gold" : "";
  const comboText = combo>=3 ? `💎 天选之人！连中 ${combo} 次！` : combo>=2 ? `🔥 欧皇附体！连中 ${combo} 次！` : "";
  const commentPool = combo>=3 ? COMMENTS_COMBO3 : combo>=2 ? COMMENTS_COMBO2 : COMMENTS_NORMAL;
  const comment = commentPool[Math.floor(Math.random()*commentPool.length)];
  const firstChar = charName.charAt(0);
  const restChar = charName.slice(1);
  
  resultCard.className = "result-card " + cls;
  resultCard.innerHTML = `
    <div class="rc-emoji">${emoji}</div>
    <div class="rc-player">${player}</div>
    <div class="rc-arrow">▼ 抽到了 ▼</div>
    <div class="rc-char"><span class="first">${firstChar}</span>${restChar}</div>
    ${comboText ? `<div class="rc-combo">${comboText}</div>` : ""}
    <div class="rc-comment">💬 ${comment}</div>
    <div class="rc-hint">点击关闭 · 稍后自动消失</div>
  `;
  resultMask.classList.add("show");
  if(combo>=2) fanfare(); else ding();
  resultTimer=setTimeout(closeResult, combo>=2 ? 4500 : 3000);
}
function closeResult(){ clearTimeout(resultTimer); resultMask.classList.remove("show"); }
resultMask.addEventListener("click", closeResult);

/* ============ 编辑池子弹窗 ============ */
const LS_KEY = { s:"p5_wheel_survivor_pool", h:"p5_wheel_hunter_pool", c:"p5_wheel_challenge_pool" };
let poolCtx = null;
const poolMask=document.getElementById("poolMask");
const poolGrid=document.getElementById("poolGrid");
const poolTitle=document.getElementById("poolTitle");

function openPoolEditor(wheelKey, allList, selectedList, onSave){
  poolCtx={wheelKey, all:allList, selected:new Set(selectedList), onSave};
  const titles = { s:"🧡 编辑求生者池", h:"🖤 编辑监管者池", c:"💀 编辑监管挑战" };
  poolTitle.textContent = titles[wheelKey] || "编辑角色池";
  renderPoolGrid();
  poolMask.classList.add("show");
}
function renderPoolGrid(){
  if(!poolCtx) return;
  poolGrid.innerHTML = poolCtx.all.map(name=>{
    const on=poolCtx.selected.has(name);
    return `<div class="pool-item ${on?"on":""}" data-name="${name}">${name}</div>`;
  }).join("");
  poolGrid.querySelectorAll(".pool-item").forEach(el=>{
    el.addEventListener("click",()=>{
      const name=el.dataset.name;
      if(poolCtx.selected.has(name)){
        if(poolCtx.selected.size<=1) return alert("至少保留 1 个哦～");
        poolCtx.selected.delete(name);
      } else poolCtx.selected.add(name);
      renderPoolGrid();
    });
  });
}
document.getElementById("poolAll").addEventListener("click",()=>{
  if(!poolCtx) return;
  poolCtx.selected = (poolCtx.selected.size === poolCtx.all.length) ? new Set([poolCtx.all[0]]) : new Set(poolCtx.all);
  renderPoolGrid();
});
document.getElementById("poolOk").addEventListener("click",()=>{
  if(!poolCtx) return;
  const arr = poolCtx.all.filter(n=>poolCtx.selected.has(n));
  if(arr.length===0) return alert("至少保留 1 个哦～");
  try{ localStorage.setItem(LS_KEY[poolCtx.wheelKey], JSON.stringify(arr)); }catch(e){}
  poolCtx.onSave(arr);
  poolMask.classList.remove("show"); poolCtx=null;
});
poolMask.addEventListener("click",(e)=>{ if(e.target===poolMask){ poolMask.classList.remove("show"); poolCtx=null; }});

// 新增角色/挑战功能
document.getElementById("addPoolBtn").addEventListener("click", ()=>{
  if(!poolCtx) return;
  const input = document.getElementById("newPoolItem");
  const val = input.value.trim();
  if(!val) return;
  if(poolCtx.all.includes(val)) return alert("已经有这个啦！");
  poolCtx.all.push(val);
  poolCtx.selected.add(val);
  input.value = "";
  renderPoolGrid();
});
document.getElementById("newPoolItem").addEventListener("keypress", (e)=>{
  if(e.key === "Enter") document.getElementById("addPoolBtn").click();
});

/* ============ 通用转盘逻辑 ============ */
function createWheel(cfg){
  const svg=document.getElementById(cfg.svgId);
  const ptr=document.getElementById(cfg.ptrId);
  const btn=document.getElementById(cfg.btnId);
  const editBtn=cfg.editId ? document.getElementById(cfg.editId) : null;
  const recEl=document.getElementById(cfg.recId);
  const ALL=cfg.allList;
  let activeList=[...ALL];
  let curDeg=0, spinning=false, sel=null;
  const rec={}, comboMap={};

  try{
    const saved=localStorage.getItem(LS_KEY[cfg.wheelKey]);
    if(saved){
      const arr=JSON.parse(saved);
      if(Array.isArray(arr) && arr.length>0){
        const filtered=ALL.filter(n=>arr.includes(n));
        if(filtered.length>0) activeList=filtered;
      }
    }
  }catch(e){}

  const COLORS = cfg.colorOverride || C;
  function redraw(){ drawWheel(svg, activeList, COLORS); svg.style.transform="rotate(0deg)"; curDeg=0; }
  redraw();

  const container = document.getElementById(cfg.playersContainer);
  function updatePlayerListeners(){
    const btns = container.querySelectorAll(".bn");
    if (sel) {
      let found = false;
      btns.forEach(b => { if(b.dataset.p === sel) { b.classList.add("active"); found = true; }});
      if (!found) sel = null;
    }
    btns.forEach(b=>{
      b.addEventListener("click",()=>{
        if(spinning) return;
        btns.forEach(x=>x.classList.remove("active"));
        b.classList.add("active"); sel=b.dataset.p;
      });
    });
  }
  updatePlayerListeners();
  const observer = new MutationObserver(updatePlayerListeners);
  observer.observe(container, { childList: true });

  function renderRec(){
    const entries=Object.entries(rec);
    recEl.innerHTML = entries.length ? entries.map(([p,n])=>`<div class="it"><strong>${p}</strong> →「${n}」</div>`).join("") : '<p style="color:#999;text-align:center">暂无记录</p>';
  }

  if(editBtn) editBtn.addEventListener("click",()=>{
    if(spinning) return alert("转盘转动中，请稍等～");
    openPoolEditor(cfg.wheelKey, ALL, activeList, (newList)=>{ activeList=newList; redraw(); });
  });

  btn.addEventListener("click",()=>{
    if(!sel) return alert("先选名字！👤");
    if(spinning) return;
    const N=activeList.length; if(N===0) return alert("池子是空的！");
    spinning=true; btn.disabled=true; if(editBtn) editBtn.disabled=true;
    
    const ri=Math.floor(Math.random()*N), PD=360/N, turns=18+Math.floor(Math.random()*10);
    const offset=(360-(ri*PD+PD/2))%360, base=Math.ceil(curDeg/360)*360;
    const finalDeg=base + turns*360 + offset;
    curDeg=finalDeg;

    ptr.classList.add("shaking"); scheduleTicks(5.5);
    svg.style.transform=`rotate(${finalDeg}deg)`;

    setTimeout(()=>{
      ptr.classList.remove("shaking");
      svg.style.setProperty("--final-deg", finalDeg+"deg");
      svg.classList.add("bounce"); setTimeout(()=>svg.classList.remove("bounce"),460);

      const charName=activeList[ri];
      let combo=1; const prev=comboMap[sel];
      if(prev && prev.char===charName){ combo=prev.count+1; comboMap[sel]={char:charName, count:combo}; } else { comboMap[sel]={char:charName, count:1}; }
      rec[sel]=charName; renderRec(); showResult(sel, charName, combo);

      spinning=false; btn.disabled=false; if(editBtn) editBtn.disabled=false;
    },5500);
  });
}

/* ============ 卧底模式逻辑 ============ */
let ucPlayers = [...globalPlayers];
let shuffle = arr => {
  let a=[...arr];
  for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
};

window.updateUCPlayers = function(){
  ucPlayers = [...globalPlayers];
  const ucW = document.getElementById("ucW");
  if(ucW) drawWheel(ucW, ucPlayers, C);
  const targetR = document.getElementById("targetR");
  if(targetR) targetR.innerHTML = '<p style="color:#999;text-align:center">暂无记录</p>';
  if(window.resetTargetWheel) window.resetTargetWheel();
};
// 拦截改名字，同步卧底模式
const oldEdit = window.editPlayers;
window.editPlayers = function(){
  oldEdit();
  if(window.updateUCPlayers) window.updateUCPlayers();
};

function showUndercoverResult(undercover, hunter){
  clearTimeout(resultTimer);
  resultCard.className = "result-card";
  resultCard.innerHTML = `
    <div class="rc-emoji">🎭</div><div class="rc-player" style="color:#c44569">卧底</div><div class="rc-char" style="margin-bottom:14px">${undercover}</div>
    <div class="rc-emoji" style="font-size:36px">👮</div><div class="rc-player" style="color:#3a6ea5">监管者</div><div class="rc-char">${hunter}</div>
    <div class="rc-comment" style="margin-top:12px">💬 身份已分配，开始你的表演～</div><div class="rc-hint">点击关闭</div>
  `;
  resultMask.classList.add("show"); ding(); resultTimer=setTimeout(closeResult, 5000);
}

(function initUndercover(){
  const ucW=document.getElementById("ucW"), ucPt=document.getElementById("ucPt"), ucB=document.getElementById("ucB");
  const ucBox=document.getElementById("ucBox"), wrapEl=document.querySelector(".wrap");
  let spinning=false, curDeg=0;

  drawWheel(ucW, ucPlayers, C);

  document.getElementById("modeToggle").addEventListener("click",()=>{
    const showingUC = ucBox.style.display !== "none";
    if(showingUC){
      ucBox.style.display="none";
      wrapEl.querySelectorAll(".box:not(.undercover-box)").forEach(b=>b.style.display="");
      document.getElementById("modeToggle").textContent="🎭 卧底模式";
    } else {
      wrapEl.querySelectorAll(".box:not(.undercover-box)").forEach(b=>b.style.display="none");
      ucBox.style.display=""; document.getElementById("modeToggle").textContent="🎡 双转盘模式";
    }
  });

  ucB.addEventListener("click",()=>{
    if(spinning) return;
    if(ucPlayers.length<3) return alert("至少需要 3 个玩家哦～");
    spinning=true; ucB.disabled=true;

    ucPlayers=shuffle(ucPlayers); drawWheel(ucW, ucPlayers, C);
    ucW.style.transform="rotate(0deg)"; curDeg=0;

    const N=ucPlayers.length, PD=360/N, ri=Math.floor(Math.random()*N), turns=18+Math.floor(Math.random()*10);
    const offset=(360-(ri*PD+PD/2))%360, finalDeg=turns*360+offset; curDeg=finalDeg;

    ucPt.classList.add("shaking"); scheduleTicks(5.5);
    setTimeout(()=>{ ucW.style.transform=`rotate(${finalDeg}deg)`; }, 30);

    setTimeout(()=>{
      ucPt.classList.remove("shaking"); ucW.style.setProperty("--final-deg", finalDeg+"deg");
      ucW.classList.add("bounce"); setTimeout(()=>ucW.classList.remove("bounce"),460);

      const undercover = ucPlayers[ri];
      let oppositeIdx=ri, bestDiff=999;
      for(let k=0;k<N;k++){
        if(k===ri) continue;
        let diff = Math.abs((k-ri)*PD); diff = Math.min(diff, 360-diff);
        const d = Math.abs(diff-180);
        if(d<bestDiff){ bestDiff=d; oppositeIdx=k; }
      }
      const hunter = ucPlayers[oppositeIdx];
      showUndercoverResult(undercover, hunter);

      if(window.__startVote) window.__startVote(undercover, ucPlayers);
      if(window.startTargetWheel) window.startTargetWheel(ucPlayers.filter(p => p !== hunter));

      spinning=false; ucB.disabled=false;
    },5500);
  });
})();

/* ============ 新增：抓人顺序转盘 ============ */
(function initTargetWheel(){
  const targetW = document.getElementById("targetW");
  const targetPt = document.getElementById("targetPt");
  const targetB = document.getElementById("targetB");
  const targetR = document.getElementById("targetR");
  let spinning = false, curDeg = 0, targets = [], picked = [];

  function redraw(){ drawWheel(targetW, targets, C); targetW.style.transform="rotate(0deg)"; curDeg=0; }
  
  window.resetTargetWheel = function(){ targets = []; picked = []; redraw(); };
  window.startTargetWheel = function(available) {
    targets = [...available]; picked = [];
    redraw();
    targetR.innerHTML = "";
  };

  targetB.addEventListener("click", ()=>{
    if(spinning) return;
    if(targets.length === 0) return alert("请先在左侧抽取卧底和监管者哦！\n(或者人数不足无法抽)");
    
    spinning = true; targetB.disabled = true;
    const N = targets.length, PD = 360/N, ri = Math.floor(Math.random()*N), turns = 18+Math.floor(Math.random()*10);
    const offset=(360-(ri*PD+PD/2))%360, base = Math.ceil(curDeg/360)*360;
    const finalDeg = base + turns*360 + offset; curDeg = finalDeg;

    targetPt.classList.add("shaking"); scheduleTicks(5.5);
    targetW.style.transform = `rotate(${finalDeg}deg)`;

    setTimeout(()=>{
      targetPt.classList.remove("shaking"); targetW.style.setProperty("--final-deg", finalDeg+"deg");
      targetW.classList.add("bounce"); setTimeout(()=>targetW.classList.remove("bounce"),460);

      const chosen = targets[ri];
      picked.push(chosen);
      targets.splice(ri, 1); // 移除已抽中的

      // 重新渲染记录
      targetR.innerHTML = picked.map((p, i) => `<div class="it"><strong>第 ${i+1} 抓</strong> →「${p}」</div>`).join("");
      
      if (targets.length === 1) {
        picked.push(targets[0]);
        targetR.innerHTML += `<div class="it"><strong>第 ${picked.length} 抓</strong> →「${targets[0]}」 (默认)</div>`;
        targets = [];
      }

      redraw();
      if(targets.length === 0) {
        targetR.innerHTML += `<div style="text-align:center;color:#ff6b9d;font-weight:bold;margin-top:10px;">✅ 顺序已排好！</div>`;
      }

      spinning = false; targetB.disabled = (targets.length === 0);
    }, 5500);
  });
})();

/* ============ 投票环节 ============ */
(function initVote(){
  const votePanel=document.getElementById("votePanel"), voteMe=document.getElementById("voteMe"), voteTargets=document.getElementById("voteTargets");
  const voteSub=document.getElementById("voteSub"), voteStatus=document.getElementById("voteStatus");
  const revealMask=document.getElementById("revealMask"), revealCard=document.getElementById("revealCard");
  window.__voteState = { undercover:null, players:[], votes:{}, myName:null, active:false };

  function renderMe(){
    const st=window.__voteState;
    voteMe.innerHTML = st.players.map(p=>`<button data-name="${p}" class="${st.myName===p?"active":""}">${p}</button>`).join("");
    voteMe.querySelectorAll("button").forEach(b=>{
      b.addEventListener("click",()=>{
        st.myName=b.dataset.name; renderMe(); renderTargets();
        voteSub.textContent = "你已选择：" + st.myName + "，请投出你的一票";
      });
    });
  }
  function renderTargets(){
    const st=window.__voteState;
    if(!st.myName){ voteTargets.style.display="none"; return; }
    voteTargets.style.display="flex";
    voteTargets.innerHTML = st.players.map(p=>{
      if(p===st.myName) return "";
      const already = st.votes[st.myName];
      return `<button data-name="${p}" ${already?"disabled":""} class="${already===p?"active":""}">${p}</button>`;
    }).join("");
    voteTargets.querySelectorAll("button").forEach(b=>{
      b.addEventListener("click",()=>{ st.votes[st.myName]=b.dataset.name; renderTargets(); updateStatus(); });
    });
  }
  function updateStatus(){
    const st=window.__voteState, voted=Object.keys(st.votes).length, total=st.players.length;
    if(voted<total){
      voteStatus.textContent = `已投 ${voted}/${total}，还没投：${st.players.filter(p=>!st.votes[p]).join("、")}`;
    } else { voteStatus.textContent = "✅ 所有人已投票，正在统计…"; setTimeout(startReveal, 600); }
  }
  function countVotes(){
    const st=window.__voteState, tally={};
    st.players.forEach(p=>tally[p]=0);
    Object.values(st.votes).forEach(target=>{ tally[target]=(tally[target]||0)+1; });
    let max=0; Object.values(tally).forEach(v=>{ if(v>max) max=v; });
    const top = st.players.filter(p=>tally[p]===max);
    return top[Math.floor(Math.random()*top.length)];
  }
  function startReveal(){
    const st=window.__voteState, suspected=countVotes();
    revealCard.innerHTML = `<div class="reveal-title">🚨 ${suspected} 被怀疑是卧底！</div><div class="reveal-count" id="revealCount">3</div>`;
    revealMask.classList.add("show");
    let n=3; const countEl=document.getElementById("revealCount");
    const timer=setInterval(()=>{
      n--;
      if(n>0){ countEl.textContent=n; countEl.style.animation="none"; void countEl.offsetWidth; countEl.style.animation="countPop .5s ease-out"; } 
      else { clearInterval(timer); showAnswer(suspected); }
    },1000);
  }
  function showAnswer(suspected){
    const st=window.__voteState, real=st.undercover, right=(suspected===real);
    revealCard.innerHTML = `
      <div class="reveal-title">🎭 真卧底是——</div><div class="reveal-name">${real}</div>
      <div class="reveal-result ${right?"right":"wrong"}">${right ? `没错！卧底就是 ${real}，大家的眼睛很尖锐嘛！` : `原来 ${real} 才是卧底，演技是不是有点太好了？！`}</div>
      <div class="reveal-sub" style="margin-top:16px;margin-bottom:0;font-size:13px;color:#bbb">点击关闭</div>
    `;
    if(right) fanfare(); else ding();
  }
  revealMask.addEventListener("click",()=>{
    revealMask.classList.remove("show");
    const st=window.__voteState; st.votes={}; st.myName=null; st.active=false;
    votePanel.style.display="none"; voteTargets.style.display="none"; voteStatus.textContent="";
    voteSub.textContent="先选你自己是谁"; renderMe();
  });
  window.__startVote = function(undercover, players){
    const st=window.__voteState; st.undercover=undercover; st.players=[...players]; st.votes={}; st.myName=null; st.active=true;
    voteSub.textContent="先选你自己是谁"; renderMe(); renderTargets(); voteStatus.textContent=""; votePanel.style.display="block";
  };
})();

/* ============ 初始化所有转盘 ============ */
renderAllPlayerBtns();

const S=["幸运儿","医生","律师","慈善家","园丁","魔术师","冒险家","佣兵","空军","机械师","前锋","盲女","祭司","调香师","牛仔","舞女","先知","入殓师","勘探员","咒术师","野人","杂技演员","大副","调酒师","邮差","守墓人","囚徒","昆虫学者","画家","击球手","玩具商","心理学家","病患","小说家","小女孩","哭泣小丑","教授","古董商","作曲家","记者","飞行家","拉拉队员","木偶师","火灾调查员","法罗女士","骑士","气象学家","弓箭手","逃脱大师","幻灯师","斗牛士","神童"];
const H=["厂长","小丑","鹿头","杰克","蜘蛛","红蝶","黄衣之主","宿伞之魂","摄影师","疯眼","梦之女巫","爱哭鬼","孽蜥","红夫人","26号守卫/邦邦","使徒","小提琴家","雕刻家","博士","破轮","渔女","蜡像师","噩梦","记录员","隐士","守夜人","歌剧演员","愚人金","时空之影","跛脚羊","喧嚣","杂货商","台球手","女王蜂","牙医","心兽"];
const TALENTS=["无天赋","一个小天赋","两个小天赋","三个小天赋","四个小天赋","五个小天赋","一个主天赋【无小天赋】","两个主天赋【无小天赋】","一个主天赋【一个小天赋】","一个主天赋【两个小天赋】","一个主天赋【三个小天赋】","全天赋"];
const TALENT_COLORS=["#BDBDBD","#90CAF9","#64B5F6","#42A5F5","#2196F3","#1976D2","#CE93D8","#BA68C8","#AB47BC","#9C27B0","#7B1FA2","#FFD700"];
const CHALLENGES=["禁止使用辅助技能","禁止使用轻击","禁止使用重击","禁止翻窗","禁止挂椅","禁止踩板"];

createWheel({ wheelKey:"s", svgId:"sW", ptrId:"sPt", btnId:"sB", editId:"sEdit", recId:"sR", playersContainer:"sP", allList:S });
createWheel({ wheelKey:"t", svgId:"tW", ptrId:"tPt", btnId:"tB", editId:null, recId:"tR", playersContainer:"tP", allList:TALENTS, colorOverride:TALENT_COLORS });
createWheel({ wheelKey:"h", svgId:"hW", ptrId:"hPt", btnId:"hB", editId:"hEdit", recId:"hR", playersContainer:"hP", allList:H });
createWheel({ wheelKey:"c", svgId:"cW", ptrId:"cPt", btnId:"cB", editId:"cEdit", recId:"cR", playersContainer:"cP", allList:CHALLENGES });

/* ============ 背景系统 ============ */
(function initBg(){
  const BG_PRESETS = [{ name:"紫夜", css:"linear-gradient(135deg,#667eea 0%,#764ba2 100%)" },{ name:"深海", css:"linear-gradient(135deg,#0f2027,#203a43,#2c5364)" },{ name:"森林", css:"linear-gradient(135deg,#134e5e,#71b280)" },{ name:"暖阳", css:"linear-gradient(135deg,#f6d365,#fda085)" },{ name:"樱粉", css:"linear-gradient(135deg,#ff9a9e,#fad0c4)" },{ name:"石墨", css:"linear-gradient(135deg,#232526,#414345)" }];
  const BG_DEFAULT = { image: BG_PRESETS[0].css, overlay: 45, blur: true };
  const BG_LS_KEY = "p5_wheel_bg_settings";
  let bgSettings = { ...BG_DEFAULT };

  function applyBg(){
    const root = document.documentElement.style;
    const isImage = bgSettings.image.startsWith("data:") || bgSettings.image.startsWith("http") || bgSettings.image.startsWith("blob:");
    root.setProperty("--bg-image", isImage ? `url("${bgSettings.image}")` : bgSettings.image);
    root.setProperty("--bg-blur", bgSettings.blur && isImage ? "2.5px" : "0px");
    root.setProperty("--overlay-opacity", (bgSettings.overlay/100).toFixed(2));
  }
  function saveBg(){ try{ localStorage.setItem(BG_LS_KEY, JSON.stringify(bgSettings)); }catch(e){} }
  function loadBg(){ try{ const s = localStorage.getItem(BG_LS_KEY); if(s){ const o = JSON.parse(s); if(o) bgSettings = { ...BG_DEFAULT, ...o }; } }catch(e){} }
  
  const presetGrid = document.getElementById("presetGrid");
  function refreshPresetActive(){
    presetGrid.querySelectorAll(".preset-swatch").forEach(el=>{ el.classList.toggle("active", bgSettings.image===el.dataset.css); });
  }
  presetGrid.innerHTML = BG_PRESETS.map((p)=>`<div class="preset-swatch ${bgSettings.image===p.css?"active":""}" data-css="${p.css}" style="background:${p.css}" title="${p.name}"></div>`).join("");
  presetGrid.querySelectorAll(".preset-swatch").forEach(el=>{
    el.addEventListener("click",()=>{ bgSettings.image = el.dataset.css; applyBg(); saveBg(); refreshPresetActive(); });
  });

  const overlayRange = document.getElementById("overlayRange"), overlayVal = document.getElementById("overlayVal");
  overlayRange.value = bgSettings.overlay; overlayVal.textContent = bgSettings.overlay + "%";
  overlayRange.addEventListener("input",()=>{ bgSettings.overlay = +overlayRange.value; overlayVal.textContent = bgSettings.overlay + "%"; applyBg(); });
  overlayRange.addEventListener("change",saveBg);

  const blurToggle = document.getElementById("blurToggle");
  blurToggle.checked = !!bgSettings.blur;
  blurToggle.addEventListener("change",()=>{ bgSettings.blur = blurToggle.checked; applyBg(); saveBg(); });

  document.getElementById("bgReset").addEventListener("click",()=>{
    if(!confirm("确定恢复默认背景吗？")) return;
    bgSettings = { ...BG_DEFAULT }; overlayRange.value = bgSettings.overlay; overlayVal.textContent = bgSettings.overlay + "%"; blurToggle.checked = bgSettings.blur;
    try{ localStorage.removeItem(BG_LS_KEY); }catch(e){}
    applyBg(); refreshPresetActive();
  });

  document.getElementById("bgToggle").addEventListener("click",(e)=>{ e.stopPropagation(); document.getElementById("bgPanel").classList.toggle("show"); });
  document.addEventListener("click",(e)=>{ const p = document.getElementById("bgPanel"); if(!p.contains(e.target) && e.target.id!=="bgToggle") p.classList.remove("show"); });

  loadBg(); applyBg();
})();

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

// 渲染所有转盘的玩家按钮
function renderAllPlayerBtns() {
  const containers = ["sP", "tP", "hP", "cP"];
  containers.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = globalPlayers.map(p => `<button class="bn" data-p="${p}">${p}</button>`).join("");
  });
}

// 修改玩家名字
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

const $ = (s) => document.querySelector(s);
const defaultData = {
  tasks: [
    { id: 1, title: '아침 스트레칭 10분', category: '운동', done: true },
    { id: 2, title: '피아노 연습 30분', category: '음악', done: false },
    { id: 3, title: '논문 초록 읽기', category: '연구', done: false }
  ],
  goals: [
    { id: 1, title: '주 3회 운동하기', category: '운동', period: 'weekly', target: 3, current: 2 },
    { id: 2, title: '매일 피아노 연습', category: '음악', period: 'weekly', target: 5, current: 3 },
    { id: 3, title: '연구 노트 10개 쓰기', category: '연구', period: 'monthly', target: 10, current: 4 }
  ], journal: [], review: {}, mood: '🙂'
};
let data = JSON.parse(localStorage.getItem('gyeol-routine-data')) || defaultData;
let activePeriod = 'daily'; let entryType = 'task';
const moods = ['😄','🙂','😐','😔','😫'];
const save = () => localStorage.setItem('gyeol-routine-data', JSON.stringify(data));
const koDate = new Intl.DateTimeFormat('ko-KR', { month:'long', day:'numeric', weekday:'long' }).format(new Date());

function renderToday() {
  const done = data.tasks.filter(t => t.done).length, total = data.tasks.length, percent = total ? Math.round(done / total * 100) : 0;
  $('#today-progress').style.width = `${percent}%`; $('#today-percent').textContent = `${percent}%`;
  $('#focus-title').textContent = total ? `${total - done ? '오늘의 약속을 지켜봐요' : '오늘도 해냈어요!'}` : '나를 위한 한 걸음';
  $('#focus-copy').textContent = total ? `${done}개의 할 일을 완료했어요. ${total - done ? '천천히 다음 한 걸음으로.' : '편안한 마음으로 하루를 마무리하세요.'}` : '오늘 가장 중요한 일을 정해보세요.';
  $('#task-list').innerHTML = data.tasks.length ? data.tasks.map(t => `<article class="task-item"><button class="check ${t.done ? 'done' : ''}" data-task="${t.id}" aria-label="완료 표시">${t.done ? '✓' : ''}</button><span class="task-name ${t.done ? 'done' : ''}">${escapeHtml(t.title)}</span><span class="tag ${t.category}">${t.category}</span></article>`).join('') : '<p class="muted">아직 할 일이 없어요. 오늘의 첫 약속을 추가해 보세요.</p>';
}
function renderGoals() {
  const goals = data.goals.filter(g => g.period === activePeriod);
  const labels = {daily:'오늘',weekly:'이번 주',monthly:'이번 달',yearly:'올해'};
  const target = goals.reduce((s,g) => s + g.target, 0), current = goals.reduce((s,g) => s + g.current, 0), pct = target ? Math.round(current/target*100) : 0;
  $('#goal-summary').innerHTML = `<p>${labels[activePeriod]}의 목표 진행률</p><strong>${pct}% <span class="muted">완료</span></strong>`;
  $('#goal-list').innerHTML = goals.length ? goals.map(g => { const p=Math.min(100,Math.round(g.current/g.target*100)); return `<article class="goal-item"><div class="goal-head"><div><span class="tag ${g.category}">${g.category}</span><h3>${escapeHtml(g.title)}</h3></div><span class="goal-count">${g.current}/${g.target}</span></div><div class="progress-track"><span style="width:${p}%"></span></div><button class="goal-action" data-goal="${g.id}">+ 진행 기록</button></article>`}).join('') : `<p class="muted">${labels[activePeriod]} 목표를 만들어 보세요.</p>`;
}
function renderMood(){ $('#mood-picker').innerHTML=moods.map(m=>`<button type="button" class="mood-button ${data.mood===m?'selected':''}" data-mood="${m}">${m}</button>`).join(''); }
function renderJournal(){ $('#journal-date').textContent=koDate; $('#journal-text').value=''; renderMood(); $('#journal-history').innerHTML=data.journal.length ? data.journal.slice(0,4).map(x=>`<article class="journal-entry"><small>${x.date} ${x.mood}</small><p>${escapeHtml(x.text)}</p></article>`).join('') : '<p class="muted">아직 남긴 기록이 없어요.</p>'; }
function renderReview(){ const done=data.tasks.filter(t=>t.done).length,total=data.tasks.length,pct=total?Math.round(done/total*100):0; $('#review-score').textContent=`${pct}%`; $('#review-progress').style.width=`${pct}%`; $('#review-caption').textContent=pct>=70?'멋져요. 꾸준함이 자라고 있어요.':pct>=30?'흐름을 되찾는 중이에요. 한 걸음이면 충분해요.':'작은 시작이 쌓여 변화를 만들어요.'; for(const key of ['win','next','note']) $('#review-form')[key].value=data.review[key]||''; }
function renderAll(){ $('#date-label').textContent=koDate; renderToday();renderGoals();renderJournal();renderReview(); }
function escapeHtml(v){const d=document.createElement('div');d.textContent=v;return d.innerHTML;}
function openEntry(type){ entryType=type; $('#dialog-title').textContent=type==='task'?'오늘의 할 일 추가':'새로운 목표 만들기'; $('#task-fields').hidden=type!=='task'; $('#goal-fields').hidden=type!=='goal'; $('#entry-dialog').showModal(); }

document.addEventListener('click', (e) => {
  const tab=e.target.closest('[data-tab]'); if(tab){ document.querySelectorAll('.page,.nav-item').forEach(x=>x.classList.remove('active')); $(`#${tab.dataset.tab}`).classList.add('active'); document.querySelector(`.nav-item[data-tab="${tab.dataset.tab}"]`)?.classList.add('active'); if(tab.dataset.tab==='journal')renderJournal(); return; }
  const task=e.target.closest('[data-task]'); if(task){ const item=data.tasks.find(t=>t.id===Number(task.dataset.task)); item.done=!item.done; save();renderToday();renderReview();return; }
  const goal=e.target.closest('[data-goal]'); if(goal){ const item=data.goals.find(g=>g.id===Number(goal.dataset.goal)); item.current=Math.min(item.target,item.current+1);save();renderGoals();return; }
  const mood=e.target.closest('[data-mood]'); if(mood){data.mood=mood.dataset.mood;save();renderMood();return;}
  if(e.target.closest('[data-action="add-task"]'))openEntry('task'); if(e.target.closest('[data-action="add-goal"]'))openEntry('goal');
  if(e.target.closest('#open-settings'))$('#settings-dialog').showModal();
  const period=e.target.closest('[data-period]'); if(period){activePeriod=period.dataset.period;document.querySelectorAll('[data-period]').forEach(b=>b.classList.toggle('selected',b===period));renderGoals();}
});
$('#entry-form').addEventListener('submit',(e)=>{e.preventDefault();const form=new FormData(e.currentTarget); if(entryType==='task'){const title=form.get('taskTitle').trim();if(!title)return;data.tasks.push({id:Date.now(),title,category:form.get('taskCategory'),done:false});}else {const title=form.get('goalTitle').trim();if(!title)return;data.goals.push({id:Date.now(),title,category:form.get('goalCategory'),period:form.get('goalPeriod'),target:Number(form.get('goalTarget')),current:0});activePeriod=form.get('goalPeriod');document.querySelectorAll('[data-period]').forEach(b=>b.classList.toggle('selected',b.dataset.period===activePeriod));}save();e.currentTarget.reset();$('#entry-dialog').close();renderToday();renderGoals();renderReview();});
$('#save-journal').addEventListener('click',()=>{const text=$('#journal-text').value.trim();if(!text)return;data.journal.unshift({date:koDate,text,mood:data.mood});save();renderJournal();$('#save-journal').textContent='저장됐어요 ✓';setTimeout(()=>$('#save-journal').textContent='오늘 기록 저장하기',1300);});
$('#review-form').addEventListener('submit',(e)=>{e.preventDefault();data.review=Object.fromEntries(new FormData(e.currentTarget));save();const b=e.submitter;b.textContent='저장됐어요 ✓';setTimeout(()=>b.textContent='회고 저장하기',1300);});
$('#reset-data').addEventListener('click',()=>{localStorage.removeItem('gyeol-routine-data');data=structuredClone(defaultData);$('#settings-dialog').close();renderAll();});
renderAll();

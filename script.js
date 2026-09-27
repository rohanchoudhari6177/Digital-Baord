// Digital Notice Board — plain JavaScript, no libraries required.
const initialNotices = [
  {id:1,title:"Semester Examination Timetable",description:"The semester examination timetable is available. Check your subject dates and report to the examination hall on time.",category:"Examination",priority:"Important",date:"2026-09-25",deadline:"2026-10-05"},
  {id:2,title:"Library Book Return Reminder",description:"Students are requested to return borrowed library books before the due date to avoid late fees.",category:"Academic",priority:"Normal",date:"2026-09-24",deadline:"2026-10-02"},
  {id:3,title:"Annual Cultural Day Registration",description:"Registration is open for cultural performances, music, dance and other student activities. Contact the student committee for details.",category:"Events",priority:"Normal",date:"2026-09-22",deadline:"2026-10-10"},
  {id:4,title:"Important: Scholarship Form Submission",description:"Eligible students should complete their scholarship application and submit the required documents to the college office.",category:"Administration",priority:"Important",date:"2026-09-20",deadline:"2026-09-30"},
  {id:5,title:"Internal Assessment Schedule",description:"Internal assessments will be conducted according to the schedule shared by the respective departments. Please contact your faculty for subject-wise details.",category:"Academic",priority:"Normal",date:"2026-09-18",deadline:""}
];

let notices = load("dnb_notices", initialNotices);
let savedIds = load("dnb_saved", []);

const $ = id => document.getElementById(id);
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const prettyDate = value => value ? new Date(value + "T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "No deadline";
function load(key, fallback){ try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
function persist(){ localStorage.setItem("dnb_notices", JSON.stringify(notices)); localStorage.setItem("dnb_saved", JSON.stringify(savedIds)); }

function noticeCard(n){
  const isSaved = savedIds.includes(n.id);
  return `<article class="notice-card">
    <div class="notice-top"><span class="tag category">${escapeHTML(n.category)}</span>${n.priority === "Important" ? '<span class="tag important">! Important</span>' : '<span class="tag">Normal</span>'}<span class="notice-date">${prettyDate(n.date)}</span></div>
    <h4>${escapeHTML(n.title)}</h4><p>${escapeHTML(n.description)}</p>
    <div class="notice-bottom"><span class="deadline">${n.deadline ? `Deadline: <strong>${prettyDate(n.deadline)}</strong>` : "No deadline specified"}</span>
    <div class="card-actions"><button class="small-btn ${isSaved ? "saved" : ""}" data-save="${n.id}" type="button">${isSaved ? "♥ Saved" : "♡ Save"}</button><button class="small-btn delete-btn" data-delete="${n.id}" type="button">Delete</button></div></div>
  </article>`;
}
function miniItem(n){ return `<div class="mini-item"><strong>${escapeHTML(n.title)}</strong><span>${escapeHTML(n.category)} · ${prettyDate(n.date)}</span></div>`; }
function render(){
  const query = $("searchInput").value.trim().toLowerCase();
  const category = $("categoryFilter").value;
  const priority = $("priorityFilter").value;
  const filtered = notices.filter(n => (category === "All" || n.category === category) && (priority === "All" || n.priority === priority) && `${n.title} ${n.description} ${n.category}`.toLowerCase().includes(query)).sort((a,b)=>b.date.localeCompare(a.date));
  $("noticeList").innerHTML = filtered.map(noticeCard).join("");
  $("emptyState").hidden = filtered.length > 0;
  $("resultCount").textContent = `${filtered.length} shown`;
  $("totalCount").textContent = notices.length;
  $("importantCount").textContent = notices.filter(n=>n.priority==="Important").length;
  const today = new Date().toISOString().slice(0,10);
  $("deadlineCount").textContent = notices.filter(n=>n.deadline && n.deadline >= today).length;
  $("importantList").innerHTML = notices.filter(n=>n.priority==="Important").sort((a,b)=>b.date.localeCompare(a.date)).map(miniItem).join("") || '<p class="mini-empty">No important notices right now.</p>';
  $("savedList").innerHTML = notices.filter(n=>savedIds.includes(n.id)).map(miniItem).join("") || '<p class="mini-empty">Your saved notices will appear here.</p>';
}
$("searchInput").addEventListener("input", render);
$("categoryFilter").addEventListener("change", render);
$("priorityFilter").addEventListener("change", render);
$("noticeList").addEventListener("click", event => {
  const deleteButton = event.target.closest("[data-delete]");
  if(deleteButton){
    const id = Number(deleteButton.dataset.delete);
    const notice = notices.find(item => item.id === id);
    if(!notice || !confirm(`Delete "${notice.title}"? This cannot be undone.`)) return;
    notices = notices.filter(item => item.id !== id);
    savedIds = savedIds.filter(savedId => savedId !== id);
    persist(); render();
    return;
  }
  const button = event.target.closest("[data-save]");
  if(!button) return;
  const id = Number(button.dataset.save);
  savedIds = savedIds.includes(id) ? savedIds.filter(savedId=>savedId!==id) : [...savedIds,id];
  persist(); render();
});

const dialog = $("noticeDialog");
$("adminToggle").addEventListener("click",()=>dialog.showModal());
$("closeDialog").addEventListener("click",()=>dialog.close());
$("cancelDialog").addEventListener("click",()=>dialog.close());
$("noticeForm").addEventListener("submit",event=>{
  event.preventDefault();
  const title = $("noticeTitle").value.trim();
  const description = $("noticeDescription").value.trim();
  if(!title || !description) return;
  notices.unshift({
    id: Date.now(), title, description,
    category: $("noticeCategory").value,
    priority: $("noticePriority").value,
    date: new Date().toISOString().slice(0,10),
    deadline: $("noticeDeadline").value
  });
  persist(); render(); event.target.reset(); dialog.close();
});
render();
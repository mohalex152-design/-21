/* Online friend rooms for Guess Flags. Requires Firebase config + Anonymous Auth + Realtime Database. */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const ui = {
    notice: $("online-config-notice"), create: $("online-create"), join: $("online-join"), code: $("online-room-code"),
    roomPanel: $("online-room-panel"), roomCode: $("online-room-code-display"), status: $("online-room-status"), players: $("online-players"),
    question: $("online-question-area"), start: $("online-start-match"), next: $("online-next-question"), leave: $("online-leave"),
    copy: $("online-copy-code"), error: $("online-error"), back: $("online-back")
  };
  let db = null, authUser = null, roomRef = null, roomListener = null, currentRoom = "", roomData = null, answerLocked = false;
  const readyConfig = () => {
    const c = window.GUESS_FLAGS_FIREBASE_CONFIG || {};
    return c.apiKey && !c.apiKey.includes("PASTE_") && c.projectId && !c.projectId.includes("YOUR_") && c.databaseURL && !c.databaseURL.includes("YOUR_") && c.appId && !c.appId.includes("PASTE_");
  };
  function error(message) { ui.error.textContent = message; ui.error.classList.remove("hidden"); }
  function clearError() { ui.error.classList.add("hidden"); ui.error.textContent = ""; }
  function setBusy(busy) { ui.create.disabled = busy; ui.join.disabled = busy; }
  async function connect() {
    if (!window.firebase || !readyConfig()) throw new Error("لسه إعداد الاتصال مش مكتمل. افتح README.md واتبع خطوات إعداد Firebase مرة واحدة.");
    if (!firebase.apps.length) firebase.initializeApp(window.GUESS_FLAGS_FIREBASE_CONFIG);
    if (!db) db = firebase.database();
    if (!authUser) {
      const credential = await firebase.auth().signInAnonymously();
      authUser = credential.user;
    }
    return authUser;
  }
  function makeCode() { const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let out=""; for(let i=0;i<6;i++) out += chars[Math.floor(Math.random()*chars.length)]; return out; }
  async function openRoom(code) {
    if (roomListener && roomRef) roomRef.off("value", roomListener);
    currentRoom = code; roomRef = db.ref(`rooms/${code}`); roomListener = snap => renderRoom(snap.val());
    roomRef.on("value", roomListener, err => error(`انقطع الاتصال بالغرفة: ${err.message}`));
    ui.roomCode.textContent = code; ui.roomPanel.classList.remove("hidden"); ui.question.classList.add("hidden"); ui.start.classList.remove("hidden"); ui.next.classList.add("hidden");
  }
  async function createRoom() {
    clearError(); setBusy(true);
    try {
      await connect();
      if (!state.player) throw new Error("اكتب اسمك وادخل اللعبة الأول.");
      let code = makeCode(), exists = (await db.ref(`rooms/${code}`).once("value")).exists();
      while (exists) { code = makeCode(); exists = (await db.ref(`rooms/${code}`).once("value")).exists(); }
      const player = { uid: authUser.uid, name: String(state.player).slice(0,24), score: 0, connectedAt: firebase.database.ServerValue.TIMESTAMP };
      await db.ref(`rooms/${code}`).set({ code, host: authUser.uid, status: "lobby", createdAt: firebase.database.ServerValue.TIMESTAMP, players: { [authUser.uid]: player }, questions: [], currentIndex: 0, answers: {} });
      await openRoom(code);
    } catch (e) { error(e.message || "تعذر إنشاء الغرفة."); }
    finally { setBusy(false); }
  }
  async function joinRoom() {
    clearError(); setBusy(true);
    try {
      await connect();
      if (!state.player) throw new Error("اكتب اسمك وادخل اللعبة الأول.");
      const code = ui.code.value.trim().toUpperCase();
      if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) throw new Error("اكتب كود صحيح مكوّن من 6 حروف أو أرقام.");
      const ref = db.ref(`rooms/${code}`), snap = await ref.once("value"), room = snap.val();
      if (!room) throw new Error("الكود ده مش موجود. اتأكد من صاحبك وجرّب تاني.");
      if (room.status !== "lobby") throw new Error("المباراة بدأت بالفعل، اطلب من صاحبك يعمل غرفة جديدة.");
      if (Object.keys(room.players || {}).length >= 2 && !room.players[authUser.uid]) throw new Error("الغرفة مكتملة؛ الحد الأقصى لاعبان.");
      await ref.child(`players/${authUser.uid}`).set({ uid: authUser.uid, name: String(state.player).slice(0,24), score: 0, connectedAt: firebase.database.ServerValue.TIMESTAMP });
      await openRoom(code);
    } catch (e) { error(e.message || "تعذر دخول الغرفة."); }
    finally { setBusy(false); }
  }
  function renderRoom(room) {
    if (!room) { ui.status.textContent = "الغرفة اتقفلت أو لم تعد موجودة."; ui.start.disabled = true; return; }
    roomData = room;
    const players = Object.values(room.players || {});
    ui.players.innerHTML = players.map(p => `<div class="online-player"><span>👤</span><div><b>${escapeHTML(p.name || "لاعب")}${p.uid === room.host ? " · المضيف" : ""}</b><small>${Number(p.score)||0} نقطة</small></div><i>${p.uid === authUser?.uid ? "أنت" : "متصل"}</i></div>`).join("");
    ui.start.classList.toggle("hidden", room.status !== "lobby" || room.host !== authUser?.uid);
    ui.start.disabled = players.length < 2;
    if (room.status === "lobby") { ui.status.textContent = players.length < 2 ? "الغرفة جاهزة — ابعت الكود لصاحبك واستناه يدخل." : "اللاعبان جاهزان! المضيف يقدر يبدأ المباراة."; ui.question.classList.add("hidden"); ui.next.classList.add("hidden"); return; }
    if (room.status === "finished") { renderFinal(room); return; }
    renderQuestion(room);
  }
  function escapeHTML(s) { return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function renderQuestion(room) {
    const idx = Number(room.currentIndex)||0, q = room.questions?.[idx];
    if (!q) return;
    ui.question.classList.remove("hidden");
    const answers = room.answers?.[idx] || {}, mine = answers[authUser.uid]; answerLocked = Boolean(mine);
    const players = Object.values(room.players || {}), answeredCount = Object.keys(answers).length;
    ui.status.textContent = `السؤال ${idx+1} من ${room.questions.length} · إجابات وصلت ${answeredCount}/${players.length}`;
    const options = (q.options || []).map(c => `<button type="button" class="choice-button" data-code="${escapeHTML(c.code)}" ${mine ? "disabled" : ""}>${escapeHTML(c.name)}</button>`).join("");
    ui.question.innerHTML = `<div class="online-q-head"><b>السؤال ${idx+1} / ${room.questions.length}</b><span>🏆 ${Number(room.players?.[authUser.uid]?.score)||0} نقطة</span></div><img class="online-flag" src="${escapeHTML(q.flag)}" alt="علم الدولة"><p class="question-hint">اختار اسم الدولة الصحيحة</p><div class="choices">${options}</div><p class="online-answer-note">${mine ? (mine.correct ? "✅ إجابتك صحيحة!" : `❌ الإجابة الصحيحة: ${escapeHTML(q.name)}`) : "اختار إجابتك — الإجابة لا يمكن تغييرها."}</p>`;
    if (mine) ui.question.querySelectorAll("button[data-code]").forEach(b => { b.disabled=true; if(b.dataset.code===q.code)b.classList.add("correct"); if(b.dataset.code===mine.choice && !mine.correct)b.classList.add("wrong"); });
    else ui.question.querySelectorAll("button[data-code]").forEach(b => b.addEventListener("click", () => submitAnswer(idx,q,b.dataset.code)));
    const allAnswered = players.length >= 2 && answeredCount >= players.length;
    ui.next.classList.toggle("hidden", room.host !== authUser?.uid || !allAnswered);
    ui.next.textContent = idx === room.questions.length-1 ? "عرض النتيجة النهائية" : "السؤال التالي ←";
  }
  async function submitAnswer(idx, q, choice) {
    if (answerLocked || !roomRef || !authUser) return;
    answerLocked = true;
    const correct = choice === q.code;
    try {
      const playerRef = roomRef.child(`players/${authUser.uid}`), playerSnap = await playerRef.once("value"), player = playerSnap.val() || {};
      const answer = { choice, correct, at: firebase.database.ServerValue.TIMESTAMP };
      const updates = {}; updates[`answers/${idx}/${authUser.uid}`] = answer; updates[`players/${authUser.uid}/score`] = (Number(player.score)||0) + (correct ? 1 : 0);
      await roomRef.update(updates);
    } catch (e) { answerLocked = false; error("ماقدرناش نسجل إجابتك. تحقق من الاتصال بالغرفة."); }
  }
  async function startMatch() {
    clearError();
    try {
      if (!roomRef || !roomData || roomData.host !== authUser?.uid) return;
      if (Object.keys(roomData.players || {}).length < 2) throw new Error("استنى لما صاحبك يدخل بالكود الأول.");
      await state.loadingPromise; if (typeof loadCountries === "function") await loadCountries();
      const pool = shuffleCountries((state.countries || []).filter(c => c.code !== "IL"));
      if (pool.length < 8) throw new Error("مش متاح عدد كافٍ من الدول لبدء المباراة.");
      const questions = pool.slice(0,10).map(c => { const wrong = shuffleCountries(pool.filter(x=>x.code!==c.code)).slice(0,3); return { code:c.code, name:c.name, flag:c.flag, options:shuffleCountries([c,...wrong]).map(x=>({code:x.code,name:x.name})) }; });
      await roomRef.update({ status:"playing", questions, currentIndex:0, answers:{}, startedAt:firebase.database.ServerValue.TIMESTAMP, players: Object.fromEntries(Object.entries(roomData.players||{}).map(([id,p])=>[id,{...p,score:0}])) });
    } catch(e) { error(e.message || "تعذر بدء المباراة."); }
  }
  function shuffleCountries(arr) { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
  async function nextQuestion() {
    if (!roomRef || roomData?.host !== authUser?.uid) return;
    const next = Number(roomData.currentIndex||0)+1;
    if (next >= (roomData.questions||[]).length) await roomRef.update({status:"finished", finishedAt:firebase.database.ServerValue.TIMESTAMP});
    else await roomRef.update({currentIndex:next});
  }
  function renderFinal(room) {
    ui.question.classList.remove("hidden"); ui.next.classList.add("hidden"); ui.start.classList.add("hidden");
    const rank = Object.values(room.players||{}).sort((a,b)=>(b.score||0)-(a.score||0));
    ui.status.textContent = "المباراة انتهت!";
    ui.question.innerHTML = `<div class="online-finish">🏆<h3>نتيجة المباراة</h3>${rank.map((p,i)=>`<div class="online-rank"><span>${i===0?"🥇":i===1?"🥈":""} ${escapeHTML(p.name||"لاعب")}</span><b>${Number(p.score)||0} / ${room.questions?.length||10}</b></div>`).join("")}<p>${rank.length>1 && rank[0].score===rank[1].score ? "تعادل جامد! 🤝" : `الفائز: ${escapeHTML(rank[0]?.name||"—")} 🎉`}</p></div>`;
  }
  async function leaveRoom() {
    try { if(roomRef && authUser) { if(roomData?.host===authUser.uid) await roomRef.update({status:"finished", [`players/${authUser.uid}`]: null}); else await roomRef.child(`players/${authUser.uid}`).remove(); } } catch(e) { console.warn(e); }
    cleanupRoom(); ui.roomPanel.classList.add("hidden"); ui.code.value=""; ui.question.classList.add("hidden");
  }
  function cleanupRoom() { if(roomRef && roomListener) roomRef.off("value",roomListener); roomRef=null; roomListener=null; currentRoom=""; roomData=null; answerLocked=false; }
  ui.create.addEventListener("click", createRoom);
  ui.join.addEventListener("click", joinRoom);
  ui.code.addEventListener("input", () => { ui.code.value=ui.code.value.toUpperCase().replace(/[^A-HJ-NP-Z2-9]/g,"").slice(0,6); });
  ui.start.addEventListener("click", startMatch);
  ui.next.addEventListener("click", nextQuestion);
  ui.leave.addEventListener("click", leaveRoom);
  ui.copy.addEventListener("click", async () => { try { await navigator.clipboard.writeText(currentRoom); ui.copy.textContent="تم النسخ ✓"; setTimeout(()=>ui.copy.textContent="نسخ الكود",1400); } catch { ui.code.value=currentRoom; ui.code.select(); error("انسخ الكود المحدد يدويًا."); } });
  ui.back.addEventListener("click", () => { cleanupRoom(); ui.roomPanel.classList.add("hidden"); showScreen("menu-screen"); });
  window.openOnlineLobby = () => { clearError(); ui.roomPanel.classList.add("hidden"); ui.code.value=""; if (!readyConfig()) { ui.notice.textContent="⚙️ الاتصال الأونلاين محتاج إعداد Firebase مرة واحدة — راجع README.md. باقي اللعبة تشتغل عادي من غيره."; ui.notice.classList.add("needs-config"); } else { ui.notice.textContent="الاتصال جاهز للإعداد. أنشئ غرفة أو أدخل كود صاحبك."; ui.notice.classList.remove("needs-config"); } showScreen("online-screen"); };
  if (!readyConfig()) { ui.notice.textContent="ميزة اللعب أونلاين تحتاج إعداد Firebase مرة واحدة. خطوات الإعداد موجودة في README.md."; ui.notice.classList.add("needs-config"); }
})();

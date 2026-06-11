/* br-assistant — client-side intent → tool finder. No backend, no API key.
   Matches a user's described goal against the 275-tool catalog (apps.js) and
   replies with the right tool(s) + page links. */
(function(){
  if (window.__brAsk) return; window.__brAsk = 1;

  /* ---------- category intent map ---------- */
  var CATS = [
    {s:'coding',           l:'Coding',          k:['code','coding','program','programming','developer','dev tool','debug','autocomplete','copilot','write code','ide']},
    {s:'writing',          l:'Writing',         k:['write','writing','blog','article','essay','content','rewrite','paraphrase','grammar','draft','story','proofread']},
    {s:'image',            l:'Image',           k:['image','images','picture','photo','art','illustration','logo','ai art','generate image','drawing','render','graphic','avatar']},
    {s:'video',            l:'Video',           k:['video','edit video','clip','youtube video','film','movie','footage','reel','shorts','video maker']},
    {s:'voice',            l:'Voice',           k:['voice','voiceover','voice over','text to speech','tts','narration','clone voice','dubbing','speech']},
    {s:'presentations',    l:'Presentations',   k:['presentation','slides','slide deck','pitch deck','powerpoint','ppt','deck']},
    {s:'music',            l:'Music',           k:['music','song','beat','compose','melody','soundtrack','make music','generate music']},
    {s:'research',         l:'Research',        k:['research','paper','papers','study','literature','citation','academic','summarize paper','find papers']},
    {s:'note-taking',      l:'Note-taking',     k:['note','notes','note taking','second brain','knowledge base','notebook','organize notes']},
    {s:'motion-graphics',  l:'Motion Graphics', k:['motion graphics','animation','animate','after effects','mograph','animated graphic']},
    {s:'infographics',     l:'Infographics',    k:['infographic','infographics','chart','diagram','visualize data','data visual']},
    {s:'chatbots',         l:'Chatbots',        k:['chatbot','chat bot','support bot','customer chat','conversational bot','build a bot']},
    {s:'meeting-notes',    l:'Meeting Notes',   k:['meeting','meeting notes','transcribe meeting','meeting summary','call notes','zoom notes','transcription']},
    {s:'marketing-copy',   l:'Marketing Copy',  k:['marketing','ad copy','ads','copywriting','sales copy','headline','product description','campaign']},
    {s:'data-analysis',    l:'Data Analysis',   k:['data','analyze data','spreadsheet','analytics','sql','dataset','insights','data analysis']},
    {s:'app-builders', l:'App & Website Builders', g:'app-website-builders', k:['build app','no code','nocode','app builder','website builder','make a website','build website','web app','mvp','landing page']},
    {s:'ai-agents', l:'AI Agents & Automation', g:'ai-agents-automation', k:['agent','agents','automation','automate','workflow','autonomous','task automation']},
    {s:'seo',              l:'SEO',             k:['seo','search ranking','keyword','backlink','rank on google','serp','optimize search']},
    {s:'social-media',     l:'Social Media',    k:['social media','instagram','tiktok','twitter','schedule post','social post','content calendar']},
    {s:'translation',      l:'Translation',     k:['translate','translation','localize','subtitle','multilingual','language']}
  ];

  function slug(label){ return String(label).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
  function norm(s){ return ' ' + String(s).toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim() + ' '; }

  /* ---------- catalog loader (apps.js holds var APPS=[{n,c,s,l,d}]) ---------- */
  function getApps(cb){
    if (window.APPS && window.APPS.length) return cb(window.APPS);
    var sc = document.createElement('script');
    sc.src = 'apps.js';
    sc.onload  = function(){ cb(window.APPS || []); };
    sc.onerror = function(){ cb([]); };
    document.head.appendChild(sc);
  }

  /* ---------- matching ---------- */
  function findToolByName(q, apps){
    var nq = norm(q), best = null, bestLen = 0;
    for (var i=0;i<apps.length;i++){
      var a = apps[i]; if (!a.n) continue;
      var nm = a.n.toLowerCase();
      if (nm.length >= 4 && nq.indexOf(' '+nm+' ') > -1 && nm.length > bestLen){ best = a; bestLen = nm.length; }
    }
    return best;
  }
  function matchCats(q){
    var nq = norm(q), out = [];
    for (var i=0;i<CATS.length;i++){
      var c = CATS[i], sc = 0;
      for (var j=0;j<c.k.length;j++){
        var kw = c.k[j];
        if (nq.indexOf(' '+kw+' ') > -1 || nq.indexOf(' '+kw) > -1){ sc += (kw.indexOf(' ')>-1 ? 3 : 1); }
      }
      if (sc > 0) out.push({c:c, sc:sc});
    }
    out.sort(function(a,b){ return b.sc - a.sc; });
    return out;
  }
  function topTools(catSlug, apps, n){
    return apps.filter(function(a){ return slug(a.c)===catSlug && a.l && a.l !== '#'; })
               .sort(function(a,b){ return parseFloat(b.s||0) - parseFloat(a.s||0); })
               .slice(0, n);
  }
  function pageSlug(label){ var g=slug(label); for(var i=0;i<CATS.length;i++){ if((CATS[i].g||CATS[i].s)===g) return CATS[i].s; } return g; }
  function searchTools(q, apps, n){
    var nq = norm(q).trim().split(' ').filter(function(w){return w.length>2;});
    if (!nq.length) return [];
    return apps.filter(function(a){ return a.l && a.l!=='#'; })
      .map(function(a){ var hay=(a.n+' '+a.c).toLowerCase(), h=0; nq.forEach(function(w){ if(hay.indexOf(w)>-1)h++; }); return {a:a,h:h}; })
      .filter(function(x){ return x.h>0; })
      .sort(function(x,y){ return y.h-x.h || parseFloat(y.a.s||0)-parseFloat(x.a.s||0); })
      .slice(0,n).map(function(x){ return x.a; });
  }

  function answer(q, apps){
    var cats = matchCats(q), tool = findToolByName(q, apps);
    if (cats.length){
      var prim = cats[0].c, gs = prim.g||prim.s, tools = topTools(gs, apps, 3);
      if (tool && slug(tool.c)===gs){ tools = [tool].concat(tools.filter(function(t){return t.n!==tool.n;})).slice(0,3); }
      if (tools.length) return {text:'For '+prim.l.toLowerCase()+', these rank highest right now:', cards:tools, more:{label:'See all '+prim.l+' tools', href:prim.s+'.html'}};
    }
    if (tool) return {text:tool.n+' is a strong pick — here\u2019s its page:', cards:[tool], more:{label:'More '+tool.c+' tools', href:pageSlug(tool.c)+'.html'}};
    var hits = searchTools(q, apps, 3);
    if (hits.length) return {text:'Closest matches I found:', cards:hits, more:{label:'Browse all categories', href:'categories.html'}};
    return {text:'I couldn\u2019t pin that down. Try a few plain words \u2014 like \u201cmake a video\u201d, \u201cwrite blog posts\u201d or \u201cbuild a website\u201d.', cards:[], more:{label:'Browse all categories', href:'categories.html'}};
  }

  /* ---------- styles ---------- */
  var css = ''
  + '#brask-fab{position:fixed;right:20px;bottom:20px;z-index:9998;width:56px;height:56px;border:none;border-radius:50%;background:var(--grad,linear-gradient(135deg,#6c5cff,#b14dff,#ff5d8f));cursor:pointer;box-shadow:0 10px 28px rgba(108,92,255,.42);display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s}'
  + '#brask-fab:hover{transform:translateY(-2px) scale(1.04)}'
  + '#brask-fab svg{width:26px;height:26px;stroke:#fff;fill:none;stroke-width:2}'
  + '#brask-fab.open{transform:scale(.9);opacity:0}'
  + '#brask-panel{position:fixed;right:20px;bottom:20px;z-index:9999;width:370px;max-width:calc(100vw - 32px);height:540px;max-height:calc(100vh - 40px);background:var(--surface,#1a1b28);border:1px solid var(--line,rgba(255,255,255,.08));border-radius:20px;box-shadow:0 24px 64px rgba(0,0,0,.5);display:none;flex-direction:column;overflow:hidden;font-family:var(--body,system-ui,sans-serif)}'
  + '#brask-panel.show{display:flex;animation:braskIn .26s cubic-bezier(.16,.84,.34,1)}'
  + '@keyframes braskIn{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}'
  + '.brask-head{display:flex;align-items:center;gap:11px;padding:15px 16px;border-bottom:1px solid var(--line-soft,rgba(255,255,255,.06))}'
  + '.brask-badge{width:34px;height:34px;border-radius:10px;background:var(--grad,#6c5cff);display:flex;align-items:center;justify-content:center;flex-shrink:0}'
  + '.brask-badge svg{width:18px;height:18px;stroke:#fff;fill:none;stroke-width:2}'
  + '.brask-htext b{display:block;font-family:var(--display,serif);font-weight:600;font-size:15px;color:var(--ink,#fff);line-height:1.1}'
  + '.brask-htext span{font-size:11.5px;color:var(--ink-faint,#8a87a3)}'
  + '.brask-x{margin-left:auto;background:none;border:none;color:var(--ink-faint,#8a87a3);font-size:22px;line-height:1;cursor:pointer;padding:4px 6px;border-radius:8px}'
  + '.brask-x:hover{color:var(--ink,#fff);background:var(--line-soft,rgba(255,255,255,.06))}'
  + '.brask-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}'
  + '.brask-b{max-width:88%;padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.5;color:var(--ink,#fff)}'
  + '.brask-b.bot{align-self:flex-start;background:var(--bg,#12131c);border:1px solid var(--line-soft,rgba(255,255,255,.06));border-bottom-left-radius:5px}'
  + '.brask-b.me{align-self:flex-end;background:var(--accent-soft,rgba(108,92,255,.16));color:var(--ink,#fff);border-bottom-right-radius:5px}'
  + '.brask-card{display:flex;align-items:center;gap:10px;text-decoration:none;background:var(--surface,#1a1b28);border:1px solid var(--line,rgba(255,255,255,.09));border-radius:12px;padding:9px 11px;margin-top:8px;transition:border-color .18s,transform .18s}'
  + '.brask-card:hover{border-color:var(--accent,#6c5cff);transform:translateY(-1px)}'
  + '.brask-card img{width:30px;height:30px;border-radius:8px;background:#fff;object-fit:contain;padding:4px;flex-shrink:0}'
  + '.brask-cn{flex:1;min-width:0;font-weight:700;font-size:13.5px;color:var(--ink,#fff);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
  + '.brask-cs{font-family:var(--display,serif);font-weight:600;font-size:14px;color:var(--accent,#9b8bff);flex-shrink:0}'
  + '.brask-cg{font-size:11.5px;font-weight:700;color:var(--accent,#9b8bff);flex-shrink:0;white-space:nowrap}'
  + '.brask-more{display:inline-block;margin-top:10px;font-size:12.5px;font-weight:700;color:var(--accent,#9b8bff);text-decoration:none}'
  + '.brask-more:hover{text-decoration:underline}'
  + '.brask-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:9px}'
  + '.brask-chip{font-size:12.5px;font-weight:600;color:var(--ink-soft,#c8c6da);background:var(--bg,#12131c);border:1px solid var(--line,rgba(255,255,255,.09));border-radius:100px;padding:6px 12px;cursor:pointer;transition:border-color .18s,color .18s}'
  + '.brask-chip:hover{border-color:var(--accent,#6c5cff);color:var(--accent,#9b8bff)}'
  + '.brask-typing{display:flex;gap:4px;padding:12px 13px}'
  + '.brask-typing i{width:7px;height:7px;border-radius:50%;background:var(--ink-faint,#8a87a3);animation:braskBlink 1.2s infinite}'
  + '.brask-typing i:nth-child(2){animation-delay:.2s}.brask-typing i:nth-child(3){animation-delay:.4s}'
  + '@keyframes braskBlink{0%,60%,100%{opacity:.3}30%{opacity:1}}'
  + '.brask-foot{display:flex;gap:8px;padding:12px;border-top:1px solid var(--line-soft,rgba(255,255,255,.06))}'
  + '.brask-in{flex:1;background:var(--bg,#12131c);border:1px solid var(--line,rgba(255,255,255,.09));border-radius:11px;padding:10px 13px;color:var(--ink,#fff);font-size:14px;font-family:inherit;outline:none}'
  + '.brask-in:focus{border-color:var(--accent,#6c5cff)}'
  + '.brask-send{flex-shrink:0;width:42px;border:none;border-radius:11px;background:var(--grad,#6c5cff);cursor:pointer;display:flex;align-items:center;justify-content:center}'
  + '.brask-send svg{width:18px;height:18px;stroke:#fff;fill:none;stroke-width:2}'
  + '.brask-send:disabled{opacity:.5;cursor:default}'
  + '@media(max-width:480px){#brask-panel{right:8px;left:8px;width:auto;bottom:8px;height:78vh}#brask-fab{right:16px;bottom:16px}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- DOM ---------- */
  var fab = document.createElement('button');
  fab.id = 'brask-fab'; fab.setAttribute('aria-label','Find an AI tool');
  fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.6 8.6 0 0 1-3.9-.9L3 21l1.9-5.6A8.4 8.4 0 0 1 4 11.5 8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z"/></svg>';
  document.body.appendChild(fab);

  var panel = document.createElement('div');
  panel.id = 'brask-panel';
  panel.innerHTML =
    '<div class="brask-head">'
    + '<span class="brask-badge"><svg viewBox="0 0 24 24"><path d="M12 3l2.2 5.6L20 9l-4.5 3.7L17 19l-5-3.4L7 19l1.5-6.3L4 9l5.8-.4z"/></svg></span>'
    + '<div class="brask-htext"><b>Find your AI tool</b><span>Tell me what you want to do</span></div>'
    + '<button class="brask-x" aria-label="Close">&times;</button></div>'
    + '<div class="brask-msgs" id="braskMsgs"></div>'
    + '<div class="brask-foot"><input class="brask-in" id="braskIn" type="text" placeholder="e.g. make a logo, edit a video\u2026" autocomplete="off">'
    + '<button class="brask-send" id="braskSend" aria-label="Send"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div>';
  document.body.appendChild(panel);

  var msgs = panel.querySelector('#braskMsgs');
  var input = panel.querySelector('#braskIn');
  var send = panel.querySelector('#braskSend');
  var greeted = false;

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function scroll(){ msgs.scrollTop = msgs.scrollHeight; }

  function addMe(t){ var d=document.createElement('div'); d.className='brask-b me'; d.textContent=t; msgs.appendChild(d); scroll(); }
  function addBot(html){ var d=document.createElement('div'); d.className='brask-b bot'; d.innerHTML=html; msgs.appendChild(d); scroll(); return d; }
  function typing(){ var d=document.createElement('div'); d.className='brask-b bot brask-typing-wrap'; d.innerHTML='<div class="brask-typing"><i></i><i></i><i></i></div>'; msgs.appendChild(d); scroll(); return d; }

  function cardHTML(a){
    var fav = a.d ? '<img src="https://www.google.com/s2/favicons?domain='+esc(a.d)+'&sz=64" alt="" referrerpolicy="no-referrer" onerror="this.style.display=\'none\'">' : '';
    return '<a class="brask-card" href="'+esc(a.l)+'">'+fav+'<span class="brask-cn">'+esc(a.n)+'</span><span class="brask-cs">'+esc(a.s||'')+'</span><span class="brask-cg">Open \u2192</span></a>';
  }
  function replyHTML(r){
    var h = esc(r.text);
    r.cards.forEach(function(c){ h += cardHTML(c); });
    if (r.more) h += '<a class="brask-more" href="'+esc(r.more.href)+'">'+esc(r.more.label)+' \u2192</a>';
    return h;
  }

  function respond(q){
    var t = typing();
    getApps(function(apps){
      setTimeout(function(){
        t.remove();
        if (!apps.length){ addBot('My tool list didn\u2019t load \u2014 try the <a class="brask-more" href="categories.html">categories page \u2192</a>'); return; }
        addBot(replyHTML(answer(q, apps)));
      }, 380);
    });
  }

  function greet(){
    if (greeted) return; greeted = true;
    addBot('Hi! Describe what you\u2019re trying to do and I\u2019ll point you to the best-ranked AI tool for it.');
    var chips = ['Make an image','Edit a video','Write content','Build a website','Voiceover','Research papers'];
    var d = document.createElement('div'); d.className='brask-b bot';
    d.innerHTML = '<div style="font-size:12.5px;color:var(--ink-faint,#8a87a3);margin-bottom:2px">Try one:</div><div class="brask-chips">'
      + chips.map(function(c){ return '<button class="brask-chip">'+c+'</button>'; }).join('') + '</div>';
    msgs.appendChild(d); scroll();
    d.querySelectorAll('.brask-chip').forEach(function(b){ b.addEventListener('click', function(){ input.value=b.textContent; submit(); }); });
  }

  function submit(){
    var q = input.value.trim(); if (!q) return;
    addMe(q); input.value=''; respond(q);
  }

  function open(){ panel.classList.add('show'); fab.classList.add('open'); greet(); setTimeout(function(){ input.focus(); }, 120); }
  function close(){ panel.classList.remove('show'); fab.classList.remove('open'); }

  fab.addEventListener('click', open);
  panel.querySelector('.brask-x').addEventListener('click', close);
  send.addEventListener('click', submit);
  input.addEventListener('keydown', function(e){ if (e.key==='Enter'){ e.preventDefault(); submit(); } });
})();

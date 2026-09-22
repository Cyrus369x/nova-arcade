// Nova Arcade — builtin game engine. Each game: {init(canvas, done), restart(), destroy()}
const Engine = (() => {
  let raf=null, keys={}, current=null, onend=null;

  function make(canvas){
    const ctx = canvas.getContext('2d');
    return {ctx, W:()=>canvas.width, H:()=>canvas.height};
  }

  // ---------- SNAKE ----------
  function snake(canvas, done){
    const g = make(canvas); let snake, dir, food, score, dead=false, acc=0, last=0, grid=24;
    function reset(){ snake=[[10,10],[9,10],[8,10]]; dir=[1,0]; food=rand(); score=0; dead=false; }
    function rand(){ let p; do{ p=[~~(Math.random()*(canvas.width/grid)), ~~(Math.random()*(canvas.height/grid))]; }while(snake.some(s=>s[0]==p[0]&&s[1]==p[1])); return p; }
    function step(t){
      if(!dead){ acc += t-last; if(acc>110){ acc=0; move(); } }
      last=t; draw(); raf=requestAnimationFrame(step);
    }
    function move(){
      const h=[snake[0][0]+dir[0], snake[0][1]+dir[1]];
      if(h[0]<0||h[1]<0||h[0]>=canvas.width/grid||h[1]>=canvas.height/grid|| snake.some(s=>s[0]==h[0]&&s[1]==h[1])){ dead=true; done(score); return; }
      snake.unshift(h);
      if(h[0]==food[0]&&h[1]==food[1]){ score+=10; food=rand(); } else snake.pop();
    }
    function draw(){
      const c=g.ctx, gw=canvas.width/grid, gh=canvas.height/grid;
      c.fillStyle='#0b0e17'; c.fillRect(0,0,canvas.width,canvas.height);
      c.shadowColor='#00d2ff'; c.shadowBlur=8; c.fillStyle='#00d2ff';
      c.fillRect(food[0]*grid+4,food[1]*grid+4,grid-8,grid-8);
      snake.forEach((s,i)=>{ c.shadowColor='#6c5ce7'; c.shadowBlur=i?4:12; c.fillStyle=i?'#8f7bff':'#e8ecf8';
        c.fillRect(s[0]*grid+2,s[1]*grid+2,grid-4,grid-4); });
      c.shadowBlur=0; c.fillStyle='#8b93b5'; c.font='16px JetBrains Mono'; c.fillText('SCORE '+score,12,24);
      if(dead){ c.fillStyle='#ffa502'; c.font='bold 28px Space Grotesk'; c.fillText('GAME OVER — score '+score,40,canvas.height/2); }
    }
    const kd=e=>{ const m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];
      if(m && !(m[0]==-dir[0]&&m[1]==-dir[1])){ dir=m; e.preventDefault(); } };
    addEventListener('keydown',kd); reset(); raf=requestAnimationFrame(step);
    return {restart(){cancelAnimationFrame(raf);reset();raf=requestAnimationFrame(step);}, destroy(){cancelAnimationFrame(raf);removeEventListener('keydown',kd);}};
  }

  // ---------- 2048 ----------
  function g2048(canvas, done){
    const g=make(canvas), N=4, S=canvas.width/N; let b, score, won=false;
    const colors={2:'#3d4470',4:'#4a4f8f',8:'#6c5ce7',16:'#8f7bff',32:'#b39dff',64:'#00d2ff',128:'#38e1ff',256:'#2ed573',512:'#ffa502',1024:'#ff7f50',2048:'#ff6b81'};
    function reset(){ b=Array.from({length:N},()=>Array(N).fill(0)); score=0; won=false; add(); add(); draw(); }
    function add(){ const e=[]; b.forEach((r,i)=>r.forEach((v,j)=>!v&&e.push([i,j]))); if(e.length){ const [i,j]=e[~~(Math.random()*e.length)]; b[i][j]=Math.random()<.9?2:4; } }
    function slide(row){ let a=row.filter(v=>v), out=[], gained=0;
      for(let i=0;i<a.length;i++){ if(a[i]==a[i+1]){ out.push(a[i]*2); gained+=a[i]*2; i++; } else out.push(a[i]); }
      while(out.length<N) out.push(0); return [out,gained]; }
    function move(dirN){ let moved=false;
      for(let k=0;k<dirN;k++) b=rot(b);
      for(let i=0;i<N;i++){ const [nr,gained]=slide(b[i]); if(nr.join()!=b[i].join()) moved=true; score+=gained; b[i]=nr; }
      for(let k=0;k<(4-dirN)%4;k++) b=rot(b);
      if(moved){ add(); if(!won&&has2048()) won=true; draw(); if(!canMove()){ done(score); } } }
    function rot(m){ return m[0].map((_,i)=>m.map(r=>r[i]).reverse()); }
    function has2048(){ return b.some(r=>r.some(v=>v>=2048)); }
    function canMove(){ if(b.some(r=>r.some(v=>!v))) return true;
      for(let i=0;i<N;i++)for(let j=0;j<N;j++){ if(j<N-1&&b[i][j]==b[i][j+1])return true; if(i<N-1&&b[i][j]==b[i+1][j])return true; } return false; }
    function draw(){ const c=g.ctx; c.fillStyle='#0b0e17'; c.fillRect(0,0,canvas.width,canvas.height);
      const oy=(canvas.height-canvas.width)/2;
      for(let i=0;i<N;i++)for(let j=0;j<N;j++){ const v=b[i][j];
        c.fillStyle=v?colors[v]||'#ff4757':'#161b2e'; roundRect(c,j*S+6+0,oy+i*S+6,S-12,S-12,10); c.fill();
        if(v){ c.fillStyle='#fff'; c.font='bold '+(v<100?30:v<1000?24:18)+'px Space Grotesk'; c.textAlign='center'; c.textBaseline='middle';
          c.fillText(v, j*S+S/2, oy+i*S+S/2+1); } }
      c.textAlign='left'; c.fillStyle='#8b93b5'; c.font='16px JetBrains Mono'; c.fillText('SCORE '+score,12,24);
      if(won){ c.fillStyle='#2ed573'; c.font='bold 22px Space Grotesk'; c.fillText('★ 2048! Keep going',12,canvas.height-16); } }
    const kd=e=>{ const m={ArrowLeft:0,ArrowUp:1,ArrowRight:2,ArrowDown:3}[e.key]; if(m!=null){ move(m); e.preventDefault(); } };
    addEventListener('keydown',kd); reset();
    return {restart:reset, destroy(){removeEventListener('keydown',kd);}};
  }

  // ---------- BREAKOUT ----------
  function breakout(canvas, done){
    const g=make(canvas); let px,bx,by,vx,vy,score,lives,bricks,started=false,last=0;
    const PW=100,BH=20,COLS=8,ROWS=5;
    function reset(){ px=canvas.width/2; bx=px; by=canvas.height-60; vx=4; vy=-5; score=0; lives=3; started=false;
      bricks=[]; for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)bricks.push({x:c*(canvas.width/COLS)+6,y:r*(BH+8)+50,w:canvas.width/COLS-12,h:BH,hp:ROWS-r}); }
    function step(t){ const dt=Math.min((t-last)/16.7,3); last=t; update(dt); draw(); raf=requestAnimationFrame(step); }
    function update(dt){ if(!started) return;
      bx+=vx*dt; by+=vy*dt;
      if(bx<8||bx>canvas.width-8) vx=-vx;
      if(by<8) vy=Math.abs(vy);
      if(by>canvas.height-30 && by<canvas.height-20 && bx>px-PW/2-8 && bx<px+PW/2+8 && vy>0){
        vy=-Math.abs(vy); vx+= (bx-px)/PW*6; vx=Math.max(-7,Math.min(7,vx)); }
      if(by>canvas.height){ lives--; if(lives<=0){ done(score); } else { bx=px; by=canvas.height-60; vy=-5; started=false; } }
      bricks.forEach(br=>{ if(br.hp>0 && bx>br.x-8&&bx<br.x+br.w+8&&by>br.y-8&&by<br.y+br.h+8){ br.hp--; vy=-vy; score+=10; } });
    }
    function draw(){ const c=g.ctx; c.fillStyle='#0b0e17'; c.fillRect(0,0,canvas.width,canvas.height);
      const cols=['#ff6b81','#ffa502','#ffeAA0','#2ed573','#00d2ff'];
      bricks.forEach((br,i)=>{ if(br.hp>0){ c.fillStyle=cols[~~(i/COLS)]; c.globalAlpha=.5+br.hp*.15; roundRect(c,br.x,br.y,br.w,br.h,6); c.fill(); } });
      c.globalAlpha=1; c.shadowColor='#6c5ce7'; c.shadowBlur=12; c.fillStyle='#8f7bff';
      roundRect(c,px-PW/2,canvas.height-24,PW,12,6); c.fill();
      c.fillStyle='#e8ecf8'; c.beginPath(); c.arc(bx,by,7,0,7); c.fill(); c.shadowBlur=0;
      c.fillStyle='#8b93b5'; c.font='16px JetBrains Mono'; c.fillText('SCORE '+score+'  LIVES '+lives,12,24);
      if(!started){ c.fillStyle='#e8ecf8'; c.font='20px Space Grotesk'; c.textAlign='center'; c.fillText('Click / press SPACE to launch',canvas.width/2,canvas.height/2+40); c.textAlign='left'; } }
    const mm=e=>{ const r=canvas.getBoundingClientRect(); px=(e.clientX-r.left)/r.width*canvas.width; };
    const kd=e=>{ if(e.key==' '){ started=true; e.preventDefault(); } if(e.key=='ArrowLeft')px-=40; if(e.key=='ArrowRight')px+=40; };
    canvas.addEventListener('mousemove',mm); addEventListener('keydown',kd);
    canvas.addEventListener('click',()=>started=true);
    reset(); raf=requestAnimationFrame(step);
    return {restart(){cancelAnimationFrame(raf);reset();raf=requestAnimationFrame(step);},destroy(){cancelAnimationFrame(raf);canvas.removeEventListener('mousemove',mm);removeEventListener('keydown',kd);}};
  }

  // ---------- FLAPPY ----------
  function flappy(canvas, done){
    const g=make(canvas); let y,vy,pipes,score,dead,started,last=0;
    const G=.45,FLAP=-8.2,PS=160;
    function reset(){ y=canvas.height/2; vy=0; pipes=[]; score=0; dead=false; started=false; for(let i=0;i<3;i++)pipes.push(newPipe(300+i*PS)); }
    function newPipe(x){ return {x, gap:120+Math.random()*80, top:60+Math.random()*(canvas.height-320)}; }
    function step(t){ const dt=Math.min((t-last)/16.7,3); last=t;
      if(started&&!dead){ vy+=G*dt; y+=vy*dt;
        pipes.forEach(p=>{ p.x-=3.2*dt; if(p.x<-70){ Object.assign(p,newPipe(canvas.width+40)); score++; } });
        pipes.forEach(p=>{ if(60+20>p.x&&60-20<p.x+60&&(y-14<p.top||y+14>p.top+p.gap)) dead=true; });
        if(y>canvas.height-14||y<14) dead=true; }
      draw(); raf=requestAnimationFrame(step); }
    function draw(){ const c=g.ctx; c.fillStyle='#0b0e17'; c.fillRect(0,0,canvas.width,canvas.height);
      c.fillStyle='#161b2e'; c.fillRect(0,canvas.height-12,canvas.width,12);
      c.fillStyle='#2c3a6b'; pipes.forEach(p=>{ roundRect(c,p.x,-10,60,p.top+10,8); c.fill(); roundRect(c,p.x,p.top+p.gap,60,canvas.height,8); c.fill(); });
      c.save(); c.translate(60,y); c.rotate(Math.max(-.5,Math.min(1,vy/12)));
      c.shadowColor='#00d2ff'; c.shadowBlur=14; c.fillStyle='#00d2ff'; c.fillRect(-14,-14,28,28); c.restore(); c.shadowBlur=0;
      c.fillStyle='#8b93b5'; c.font='16px JetBrains Mono'; c.fillText('SCORE '+score,12,24);
      if(!started){ c.fillStyle='#e8ecf8'; c.font='20px Space Grotesk'; c.textAlign='center'; c.fillText('Click / SPACE to flap',canvas.width/2,canvas.height/2); c.textAlign='left'; }
      if(dead){ done(score); c.fillStyle='#ffa502'; c.font='bold 26px Space Grotesk'; c.textAlign='center'; c.fillText('GAME OVER — '+score,canvas.width/2,canvas.height/2); c.textAlign='left'; } }
    const flap=()=>{ if(!dead) started=true; vy=FLAP; };
    canvas.addEventListener('mousedown',flap); const kd=e=>{ if(e.key==' '){ flap(); e.preventDefault(); } }; addEventListener('keydown',kd);
    reset(); raf=requestAnimationFrame(step);
    return {restart(){cancelAnimationFrame(raf);reset();raf=requestAnimationFrame(step);},destroy(){cancelAnimationFrame(raf);canvas.removeEventListener('mousedown',flap);removeEventListener('keydown',kd);}};
  }

  // ---------- PONG ----------
  function pong(canvas, done){
    const g=make(canvas); let py,ay,bx,by,vx,vy,ps,as,started,last=0;
    function reset(){ py=ay=canvas.height/2; bx=canvas.width/2; by=canvas.height/2; vx=5; vy=3; ps=as=0; started=true; }
    function step(t){ const dt=Math.min((t-last)/16.7,3); last=t;
      if(started){ bx+=vx*dt; by+=vy*dt;
        if(by<8||by>canvas.height-8) vy=-vy;
        ay+=Math.sign(by-ay)*Math.min(3.4,Math.abs(by-ay));
        if(bx<28&&by>py-45&&by<py+45&&vx<0){ vx=Math.abs(vx)+.3; vy+=(by-py)/50; }
        if(bx>canvas.width-28&&by>ay-45&&by<ay+45&&vx>0){ vx=-Math.abs(vx)-.3; vy+=(by-ay)/50; }
        if(bx<0){ as++; done(ps); reset(); } if(bx>canvas.width){ ps++; reset(); } }
      draw(); raf=requestAnimationFrame(step); }
    function draw(){ const c=g.ctx; c.fillStyle='#0b0e17'; c.fillRect(0,0,canvas.width,canvas.height);
      c.strokeStyle='#232a4a'; c.setLineDash([8,10]); c.beginPath(); c.moveTo(canvas.width/2,0); c.lineTo(canvas.width/2,canvas.height); c.stroke(); c.setLineDash([]);
      c.shadowColor='#6c5ce7'; c.shadowBlur=10; c.fillStyle='#8f7bff'; roundRect(c,14,py-45,10,90,5); c.fill(); roundRect(c,canvas.width-24,ay-45,10,90,5); c.fill();
      c.fillStyle='#00d2ff'; c.beginPath(); c.arc(bx,by,8,0,7); c.fill(); c.shadowBlur=0;
      c.fillStyle='#8b93b5'; c.font='24px JetBrains Mono'; c.textAlign='center'; c.fillText(ps+'  –  '+as,canvas.width/2,34); c.textAlign='left'; }
    const mm=e=>{ const r=canvas.getBoundingClientRect(); py=(e.clientY-r.top)/r.height*canvas.height; };
    const kd=e=>{ if(e.key=='ArrowUp')py-=40; if(e.key=='ArrowDown')py+=40; if(['ArrowUp','ArrowDown'].includes(e.key))e.preventDefault(); };
    canvas.addEventListener('mousemove',mm); addEventListener('keydown',kd);
    reset(); raf=requestAnimationFrame(step);
    return {restart(){cancelAnimationFrame(raf);reset();raf=requestAnimationFrame(step);},destroy(){cancelAnimationFrame(raf);canvas.removeEventListener('mousemove',mm);removeEventListener('keydown',kd);}};
  }

  // ---------- MINESWEEPER ----------
  function mines(canvas, done){
    const g=make(canvas); const N=12, MINES=22, S=canvas.width/N; let grid,revealed,flags,over,startedAt;
    function reset(){ grid=Array.from({length:N},()=>Array(N).fill(0)); revealed=Array.from({length:N},()=>Array(N).fill(false));
      flags=Array.from({length:N},()=>Array(N).fill(false)); over=null; startedAt=Date.now();
      let placed=0; while(placed<MINES){ const i=~~(Math.random()*N),j=~~(Math.random()*N); if(!grid[i][j]){grid[i][j]=-1;placed++;} }
      for(let i=0;i<N;i++)for(let j=0;j<N;j++){ if(grid[i][j]==-1)continue; let n=0;
        for(let di=-1;di<2;di++)for(let dj=-1;dj<2;dj++){ const a=i+di,b=j+dj; if(a>=0&&b>=0&&a<N&&b<N&&grid[a][b]==-1)n++; } grid[i][j]=n; }
      draw(); }
    function flood(i,j){ if(i<0||j<0||i>=N||j>=N||revealed[i][j]||flags[i][j])return; revealed[i][j]=true;
      if(grid[i][j]==0) for(let di=-1;di<2;di++)for(let dj=-1;dj<2;dj++)flood(i+di,j+dj); }
    function click(e){ if(over)return; const r=canvas.getBoundingClientRect();
      const j=~~(((e.clientX-r.left)/r.width*canvas.width)/S), i=~~(((e.clientY-r.top)/r.height*canvas.height)/S);
      if(i<0||j<0||i>=N||j>=N)return;
      if(e.button===2||e.shiftKey){ if(!revealed[i][j]){flags[i][j]=!flags[i][j]; draw();} return; }
      if(flags[i][j]||revealed[i][j])return;
      if(grid[i][j]==-1){ over='lose'; done(-1); draw(); return; }
      flood(i,j);
      let left=0; for(let a=0;a<N;a++)for(let b=0;b<N;b++) if(!revealed[a][b]&&grid[a][b]!=-1)left++;
      if(left==0){ over='win'; done(Math.max(1,~~((Date.now()-startedAt)/1000))); }
      draw(); }
    function draw(){ const c=g.ctx; c.fillStyle='#0b0e17'; c.fillRect(0,0,canvas.width,canvas.height);
      const oy=(canvas.height-canvas.width)/2, colors=['','#00d2ff','#2ed573','#ffa502','#ff7f50','#ff6b81','#c56cf0','#e8ecf8','#8b93b5'];
      for(let i=0;i<N;i++)for(let j=0;j<N;j++){ const x=j*S, y=oy+i*S;
        if(revealed[i][j]){ c.fillStyle=grid[i][j]==-1?'#ff6b81':'#161b2e'; c.fillRect(x+1,y+1,S-2,S-2);
          if(grid[i][j]>0){ c.fillStyle=colors[grid[i][j]]; c.font='bold '+~~(S*.5)+'px Space Grotesk'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(grid[i][j],x+S/2,y+S/2+1); } }
        else { c.fillStyle='#232a4a'; roundRect(c,x+1,y+1,S-2,S-2,4); c.fill();
          if(flags[i][j]){ c.font=~~(S*.55)+'px sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('🚩',x+S/2,y+S/2+1); } } }
      c.textAlign='left'; c.textBaseline='alphabetic'; c.fillStyle='#8b93b5'; c.font='16px JetBrains Mono'; c.fillText('MINES '+MINES+' • shift+click to flag',12,24);
      if(over){ c.fillStyle=over=='win'?'#2ed573':'#ff6b81'; c.font='bold 26px Space Grotesk'; c.textAlign='center'; c.fillText(over=='win'?'CLEARED! 💥':'BOOM! Click restart',canvas.width/2,canvas.height-12); c.textAlign='left'; } }
    const h=e=>{e.preventDefault();click(e);}
    canvas.addEventListener('mousedown',h); canvas.addEventListener('contextmenu',e=>e.preventDefault());
    reset();
    return {restart:reset, destroy(){canvas.removeEventListener('mousedown',h);}};
  }

  // ---------- BLOCKFALL (tetris) ----------
  function blockfall(canvas, done){
    const g=make(canvas); const COLS=10,ROWS=18,S=Math.min(canvas.width/COLS,canvas.height/ROWS); let board,cur,next,score,over,acc=0,last=0;
    const SHAPES=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[1,1,0],[0,1,1]],[[0,1,1],[1,1,0]]];
    const COL=['#00d2ff','#ffeAA0','#b39dff','#ff7f50','#2ed573','#6c5ce7','#ff6b81'];
    function reset(){ board=Array.from({length:ROWS},()=>Array(COLS).fill(-1)); score=0; over=false; cur=newPiece(); draw(); }
    function newPiece(){ const t=~~(Math.random()*7); return {s:SHAPES[t].map(r=>[...r]), c:t, x:~~(COLS/2-1), y:0}; }
    function collide(p){ return p.s.some((r,i)=>r.some((v,j)=> v && (p.x+j<0||p.x+j>=COLS||p.y+i>=ROWS||(p.y+i>=0&&board[p.y+i][p.x+j]>=0)))); }
    function lock(){ cur.s.forEach((r,i)=>r.forEach((v,j)=>{ if(v&&cur.y+i>=0) board[cur.y+i][cur.x+j]=cur.c; }));
      let cleared=0; for(let i=ROWS-1;i>=0;i--){ if(board[i].every(v=>v>=0)){ board.splice(i,1); board.unshift(Array(COLS).fill(-1)); cleared++; i++; } }
      score+=[0,100,300,500,800][cleared]||0; cur=newPiece(); if(collide(cur)){ over=true; done(score); } }
    function move(dx){ const p={...cur,x:cur.x+dx,s:cur.s}; if(!collide(p)) cur.x=p.x; }
    function rotate(){ const p={...cur,s:cur.s[0].map((_,i)=>cur.s.map(r=>r[i]).reverse())}; if(!collide(p)) cur.s=p.s; }
    function drop(){ const p={...cur,y:cur.y+1}; if(!collide(p)) cur.y=p.y; else lock(); }
    function step(t){ const dt=Math.min((t-last)/16.7,3); last=t;
      if(!over){ acc+=dt; if(acc>16){ acc=0; drop(); draw(); } }
      raf=requestAnimationFrame(step); }
    function draw(){ const c=g.ctx; c.fillStyle='#0b0e17'; c.fillRect(0,0,canvas.width,canvas.height);
      const ox=(canvas.width-COLS*S)/2;
      for(let i=0;i<ROWS;i++)for(let j=0;j<COLS;j++) if(board[i][j]>=0){ c.fillStyle=COL[board[i][j]]; roundRect(c,ox+j*S+1,i*S+1,S-2,S-2,3); c.fill(); }
      cur.s.forEach((r,i)=>r.forEach((v,j)=>{ if(v){ c.fillStyle=COL[cur.c]; roundRect(c,ox+(cur.x+j)*S+1,(cur.y+i)*S+1,S-2,S-2,3); c.fill(); } }));
      c.strokeStyle='#161b2e'; for(let j=0;j<=COLS;j++){ c.beginPath(); c.moveTo(ox+j*S,0); c.lineTo(ox+j*S,ROWS*S); c.stroke(); }
      c.fillStyle='#8b93b5'; c.font='16px JetBrains Mono'; c.fillText('SCORE '+score,12,24);
      if(over){ c.fillStyle='#ffa502'; c.font='bold 24px Space Grotesk'; c.textAlign='center'; c.fillText('GAME OVER — '+score,canvas.width/2,canvas.height/2); c.textAlign='left'; } }
    const kd=e=>{ if(over)return; const k=e.key;
      if(k=='ArrowLeft'){move(-1);e.preventDefault();} if(k=='ArrowRight'){move(1);e.preventDefault();}
      if(k=='ArrowUp'){rotate();e.preventDefault();} if(k=='ArrowDown'){drop();e.preventDefault();}
      if(k==' '){ while(!collide({...cur,y:cur.y+1}))cur.y++; lock(); e.preventDefault(); } draw(); };
    addEventListener('keydown',kd); reset(); raf=requestAnimationFrame(step);
    return {restart(){cancelAnimationFrame(raf);reset();raf=requestAnimationFrame(step);},destroy(){cancelAnimationFrame(raf);removeEventListener('keydown',kd);}};
  }

  // ---------- REACTION ----------
  function reaction(canvas, done){
    const g=make(canvas); let state='idle',t0,attempts=[],best=null;
    function draw(msg,color,sub){ const c=g.ctx; c.fillStyle='#0b0e17'; c.fillRect(0,0,canvas.width,canvas.height);
      c.fillStyle=color||'#e8ecf8'; c.font='bold 28px Space Grotesk'; c.textAlign='center'; c.fillText(msg,canvas.width/2,canvas.height/2-10);
      if(sub){ c.fillStyle='#8b93b5'; c.font='16px JetBrains Mono'; c.fillText(sub,canvas.width/2,canvas.height/2+30); }
      if(best!=null){ c.fillStyle='#2ed573'; c.font='14px JetBrains Mono'; c.fillText('BEST '+best+'ms',canvas.width/2,canvas.height-20); } c.textAlign='left'; }
    function schedule(){ state='wait'; draw('Wait for green…','#ffa502','Click too early = penalty'); setTimeout(()=>{ if(state=='wait'){ state='go'; t0=performance.now(); draw('CLICK!','#2ed573'); } }, 1000+Math.random()*3000); }
    function click(){ if(state=='idle'){ schedule(); return; }
      if(state=='wait'){ state='idle'; draw('Too early! 😅','#ff6b81','Click to retry'); return; }
      if(state=='go'){ const ms=~~(performance.now()-t0); attempts.push(ms); best=best==null?ms:Math.min(best,ms);
        state='idle'; draw(ms+'ms','#00d2ff','Click to go again'); done(ms); } }
    const h=()=>click(); canvas.addEventListener('mousedown',h);
    draw('Reaction Test','#e8ecf8','Click to start');
    return {restart(){state='idle';attempts=[];draw('Reaction Test','#e8ecf8','Click to start');},destroy(){canvas.removeEventListener('mousedown',h);}};
  }

  function roundRect(c,x,y,w,h,r){ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }

  return { start(id, canvas, done){ const map={snake, '2048':g2048, breakout, flappy, pong, mines, tetris:blockfall, reaction };
    if(map[id]) return map[id](canvas, done); return null; } };
})();

import{A as e,C as t,E as n,P as r,R as i,S as a,T as o,U as s,c,ct as l,d as u,g as d,h as f,i as p,k as m,l as h,lt as g,m as _,s as v,t as y,u as b,ut as x,x as S}from"./_plugin-vue_export-helper.js";import{c as C,i as w,n as T,s as E,u as D}from"./app.js";import{t as O}from"./Modal.js";import{n as ee,t as te}from"./useEditAuth.js";import{t as ne}from"./useDebouncedSave.js";var k={key:0,class:`card-header`},A={class:`card-title`},j={class:`card-body`},M={key:1,class:`card-footer`},N=y(d({__name:`Card`,props:{size:{default:`medium`},shadow:{type:Boolean,default:!0},hoverable:{type:Boolean,default:!0},title:{},backgroundColor:{default:`var(--bg-container)`}},setup(e){let r={backgroundColor:e.backgroundColor};return(i,a)=>(t(),u(`div`,{class:l([`m-card`,[`size-${e.size}`,{"has-shadow":e.shadow,"is-hoverable":e.hoverable}]]),style:r},[i.$slots.header||e.title?(t(),u(`div`,k,[n(i.$slots,`header`,{},()=>[c(`h3`,A,x(e.title),1)],!0)])):b(``,!0),c(`div`,j,[n(i.$slots,`default`,{},void 0,!0)]),i.$slots.footer?(t(),u(`div`,M,[n(i.$slots,`footer`,{},void 0,!0)])):b(``,!0)],2))}}),[[`__scopeId`,`data-v-1834c394`]]),P={class:`letter-meta`},F={class:`letter-date`},I={key:0,class:`letter-tag`},L={class:`letter-preview`},R={class:`letter-footer`},z={class:`letter-year`},B={key:0,class:`favorite-icon`,viewBox:`0 0 24 24`,width:`16`,height:`16`,fill:`var(--color-primary)`,stroke:`none`},re=y(d({__name:`LoveLetterCard`,props:{letter:{}},emits:[`click`],setup(e){let n=e,r=v(()=>{let e=n.letter.content.replace(/\n/g,` `);return e.length>80?e.slice(0,80)+`...`:e}),i=e=>{let t=new Date(e);return`${t.getMonth()+1}月${t.getDate()}日`};return(n,a)=>(t(),h(N,{class:`letter-card`,size:`medium`,title:e.letter.title,onClick:a[0]||=t=>n.$emit(`click`,e.letter.id)},{default:m(()=>[c(`div`,P,[c(`span`,F,x(i(e.letter.date)),1),e.letter.tag?(t(),u(`span`,I,x(e.letter.tag),1)):b(``,!0)]),c(`p`,L,x(r.value),1),c(`div`,R,[c(`span`,z,x(e.letter.year)+`年`,1),e.letter.isFavorite?(t(),u(`svg`,B,[...a[1]||=[c(`path`,{d:`M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z`},null,-1)]])):b(``,!0)])]),_:1},8,[`title`]))}}),[[`__scopeId`,`data-v-db400d98`]]),ie={class:`starry-container`,role:`region`,"aria-label":`年度记忆星光图`},ae={class:`galaxy-canvas`},oe=[`data-satellite-id`,`onMouseenter`,`onClick`],V=[`data-count`,`onMouseenter`,`onClick`],H={class:`tooltip-header`},U={class:`tooltip-title`},W={class:`tooltip-meta`},G={class:`tooltip-excerpt`},K={class:`tooltip-month`},q={class:`tooltip-count`},J={key:0,class:`tooltip-hint`},Y={key:1,class:`tooltip-hint`},X={class:`progress-section`},se={class:`progress-header`},ce={class:`progress-percent`},le={class:`progress-track`},Z={class:`progress-text`},Q={class:`stats-panel`},ue={class:`stat-item`},de={class:`stat-value`},fe={class:`stat-item`},pe={class:`stat-value`},me={key:0,class:`stat-item`},he={class:`stat-value`},ge=y({__name:`StarryNightChart`,props:{letters:{type:Array,default:()=>[]}},emits:[`month-selected`,`date-selected`],setup(e,{emit:n}){let r=w(),s=e,d=n,f=i(null),m=i({width:800,height:320}),h=i(null),y=i(null),C=i(null),T=i({}),E=v(()=>{let e={};for(let t=1;t<=12;t++)e[t]={count:0,letters:[]};for(let t of s.letters)if(t.date){let n=parseInt(t.date.split(`-`)[1]);n>=1&&n<=12&&(e[n].count++,e[n].letters.push({id:t.id||`${t.date}-${t.title}`,title:t.title||`Untitled`,date:t.date,weather:t.weather||`晴`,excerpt:t.excerpt||t.content?.substring(0,50)||`暂无摘要...`}))}return e}),D=v(()=>{let e=m.value.width,t=m.value.height;return Array.from({length:12},(n,r)=>{let i=r+1,a=E.value[i]||{count:0,letters:[]},o=a.count,s=a.letters,c=ee(i,e,t);return{month:i,count:o,letters:s,corePosition:c,satellites:te(s,c,e,t),coreSize:k(o),coreBrightness:A(o)}})}),O=v(()=>{let e=[],t=D.value.filter(e=>e.count>0);for(let n=0;n<t.length-1;n++){let r=t[n],i=t[n+1],a=i.corePosition.x-r.corePosition.x,o=i.corePosition.y-r.corePosition.y,s=Math.sqrt(a*a+o*o),c=180/Math.PI*Math.atan2(o,a);e.push({style:{left:`${r.corePosition.x}px`,top:`${r.corePosition.y}px`,width:`${s}px`,transform:`rotate(${c}deg)`,opacity:.8,height:`2px`}})}return e});function ee(e,t,n){let r=t-120,i=60+e/13*r;if(e%2==1){let e=n*.2;return{x:i,y:n*.3+(Math.random()-.5)*e}}else{let e=n*.2;return{x:i,y:n*.7+(Math.random()-.5)*e}}}function te(e,t,n,r){if(!e||e.length===0)return[];let i=[];for(let a=0;a<e.length;a++){let o=e[a],s=30+Math.random()*30,c=20+Math.random()*20,l=a*2*Math.PI/e.length+(Math.random()*.5-.25),u=t.x+Math.cos(l)*s,d=t.y+Math.sin(l)*c,f=0;for(;f<30;){let e=!1;for(let t of i){let n=t.x-u,r=t.y-d,i=Math.sqrt(n*n+r*r);if(i<20){let t=Math.atan2(r,n),a=20-i+5;u+=Math.cos(t+Math.PI)*a,d+=Math.sin(t+Math.PI)*a,e=!0}}if(!e)break;f++}u=Math.max(10,Math.min(n-10,u)),d=Math.max(10,Math.min(r-10,d));let p=8+Math.random()*4;i.push({id:o.id,x:u,y:d,size:p,title:o.title,date:o.date,weather:o.weather,excerpt:o.excerpt})}return i}function ne(e,t){return C.value?C.value.month===e&&C.value.id!==t?.9:C.value.month===e?.8:.6:.8}function k(e){return e===0?20:e<=3?24:e<=6?28:32}function A(e){return e===0?.3:e<=3?.7:e<=6?.85:1}function j(e){return e===0?`0`:e<=3?`1-3`:e<=6?`4-6`:`7+`}let M=v(()=>{if(!s.letters||s.letters.length===0)return{percentage:0,count:0,total:365};let e=new Set;for(let t of s.letters)if(t.date){let n=new Date(t.date);if(!isNaN(n.getTime())){let t=n.toISOString().split(`T`)[0];e.add(t)}}let t=e.size;return{percentage:Math.min(Math.round(t/365*100),100),count:t,total:365}}),N=v(()=>s.letters.length),P=v(()=>Object.entries(E.value).filter(([e,t])=>t.count>0).length),F=v(()=>{if(!s.letters||s.letters.length===0)return null;let e=[...new Set(s.letters.map(e=>e.date).filter(Boolean))].map(e=>new Date(e)).sort((e,t)=>e-t);if(e.length===0)return null;let t=1,n=1;for(let r=1;r<e.length;r++)(e[r]-e[r-1])/(1e3*60*60*24)==1?(n++,t=Math.max(t,n)):n=1;return{maxStreak:t}});function I(e){if(C.value)return;y.value=e;let t=e.corePosition.x+20,n=e.corePosition.y-40;T.value={left:`${t}px`,top:`${n}px`},h.value=e.month}function L(){C.value||(y.value=null)}function R(e){h.value===e.month?ge():(h.value=e.month,d(`month-selected`,e.month))}function z(e,t){C.value={...t,month:e},y.value=null;let n=t.x+15,r=t.y-10;T.value={left:`${n}px`,top:`${r}px`}}function B(){C.value=null}function re(e){if(!e||!e.id)return;let t=document.querySelector(`[data-satellite-id="${e.id}"]`);t&&(t.classList.add(`is-clicked`),setTimeout(()=>{t.classList.remove(`is-clicked`)},200)),r.push({name:`LetterDetail`,params:{id:e.id}})}function ge(){h.value=null,d(`month-selected`,null)}function $(){f.value&&(m.value={width:f.value.offsetWidth,height:f.value.offsetHeight||320})}return S(()=>{$(),window.addEventListener(`resize`,$)}),a(()=>{window.removeEventListener(`resize`,$)}),(e,n)=>(t(),u(`div`,ie,[n[9]||=c(`div`,{class:`title-section`},[c(`div`,{class:`header-area`},[c(`h3`,{class:`card-title`},`✨ 时间脉络`),c(`p`,{class:`card-subtitle`},`每一个写下情书的日子，都是星空里闪亮的一颗星`)])],-1),c(`div`,{class:`visualization-wrapper`,ref_key:`canvasRef`,ref:f},[n[2]||=c(`div`,{class:`nebula-background`},null,-1),c(`div`,ae,[(t(!0),u(p,null,o(O.value,(e,n)=>(t(),u(`div`,{key:`conn-${n}`,class:`galaxy-connection`,style:g(e.style)},null,4))),128)),(t(!0),u(p,null,o(D.value,e=>(t(),u(`div`,{key:`satellites-${e.month}`},[(t(!0),u(p,null,o(e.satellites,(n,r)=>(t(),u(`div`,{key:`sat-${e.month}-${r}`,class:l([`satellite-star`,{"is-hovered":C.value&&C.value.id===n.id}]),style:g({left:`${n.x}px`,top:`${n.y}px`,width:`${n.size}px`,height:`${n.size}px`,opacity:ne(e.month,n.id),zIndex:C.value&&C.value.id===n.id?100:10}),"data-satellite-id":n.id,onMouseenter:t=>z(e.month,n),onMouseleave:B,onClick:e=>re(n)},null,46,oe))),128))]))),128)),(t(!0),u(p,null,o(D.value,e=>(t(),u(`div`,{key:`core-${e.month}`,class:l([`galaxy-core`,{active:h.value===e.month}]),style:g({left:`${e.corePosition.x}px`,top:`${e.corePosition.y}px`}),"data-count":j(e.count),onMouseenter:t=>I(e),onMouseleave:L,onClick:t=>R(e)},[...n[0]||=[c(`svg`,{viewBox:`0 0 24 24`,class:`star-svg`},[c(`polygon`,{points:`12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9`})],-1)]],46,V))),128)),C.value?(t(),u(`div`,{key:0,class:`satellite-tooltip`,style:g(T.value)},[c(`div`,H,[n[1]||=c(`span`,{class:`tooltip-icon`},`✍️`,-1),c(`span`,U,x(C.value.title),1)]),c(`div`,W,x(C.value.date)+` · `+x(C.value.weather),1),c(`div`,G,x(C.value.excerpt),1)],4)):b(``,!0),y.value&&!C.value?(t(),u(`div`,{key:1,class:`galaxy-tooltip`,style:g(T.value)},[c(`div`,K,x(y.value.month)+`月`,1),c(`div`,q,x(y.value.count)+` 封情书`,1),y.value.count>0?(t(),u(`div`,J,`点击查看详情`)):(t(),u(`div`,Y,`这个月还没有情书哦`))],4)):b(``,!0)])],512),c(`div`,X,[c(`div`,se,[n[3]||=c(`span`,{class:`progress-title`},`记忆星辰点亮度`,-1),c(`span`,ce,x(M.value.percentage)+`%`,1)]),c(`div`,le,[c(`div`,{class:`progress-fill`,style:g({width:M.value.percentage+`%`})},null,4)]),c(`div`,Z,` 已点亮 `+x(M.value.count)+` / `+x(M.value.total)+` 个日夜 `,1)]),c(`div`,Q,[c(`div`,ue,[n[5]||=c(`span`,{class:`stat-label`},`记录月份`,-1),c(`span`,de,[_(x(P.value),1),n[4]||=c(`span`,{class:`stat-unit`},`/12`,-1)])]),c(`div`,fe,[n[6]||=c(`span`,{class:`stat-label`},`星光总数`,-1),c(`span`,pe,x(N.value),1)]),F.value?(t(),u(`div`,me,[n[8]||=c(`span`,{class:`stat-label`},`最长连续`,-1),c(`span`,he,[_(x(F.value.maxStreak),1),n[7]||=c(`span`,{class:`stat-unit`},`天`,-1)])])):b(``,!0)])]))}},[[`__scopeId`,`data-v-6baee63c`]]);function $(){function e(e){let t=new Date(e);return`${t.getFullYear()}年${t.getMonth()+1}月${t.getDate()}日`}function t(e){let t={};for(let n of e){let e=new Date(n.date).getMonth()+1;t[e]||(t[e]=[]),t[e].push(n)}return t}function n(n,i,a=`你和我`){let o=[...i].sort((e,t)=>new Date(e.date).getTime()-new Date(t.date).getTime()),s=t(o),c=Object.keys(s).map(Number).sort((e,t)=>e-t),l=``,u=0;for(let t of c){l+=`<div class="toc-month">${t}月</div>`;for(let n of s[t]??[])u++,l+=`
          <div class="toc-item">
            <span class="toc-num">${String(u).padStart(2,`0`)}</span>
            <span class="toc-title">${r(n.title)}</span>
            <span class="toc-date">${e(n.date)}</span>
          </div>`}let d=``;u=0;for(let t of c)for(let n of s[t]??[]){u++;let t=n.content.split(/\n+/).filter(e=>e.trim()).map(e=>`<p>${r(e)}</p>`).join(``);d+=`
          <div class="letter-page">
            <div class="letter-index">${String(u).padStart(2,`0`)}</div>
            <h2 class="letter-title">${r(n.title)}</h2>
            <div class="letter-meta-line">
              <span>${e(n.date)}</span>
              ${n.tag?`<span class="tag">${r(n.tag)}</span>`:``}
            </div>
            <div class="letter-body">${t}</div>
          </div>`}return`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${n}年 情书集</title>
  <style>
    /* ── 全局 ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @import url('https://fonts.loli.net/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap');

    :root {
      --morandi-bg: #FDFBF7;
      --morandi-primary: #C4A8A2;
      --morandi-deep: #9B7B76;
      --morandi-text: #3D2E2C;
      --morandi-secondary: #7A6D6B;
      --morandi-border: #E8DFDB;
      --morandi-accent: #D4C4BE;
    }

    html, body {
      background: var(--morandi-bg);
      color: var(--morandi-text);
      font-family: 'Noto Serif SC', 'STSong', 'SimSun', serif;
      line-height: 1.8;
    }

    /* ── 封面 ── */
    .cover {
      width: 100%;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      page-break-after: always;
      position: relative;
      padding: 80px 60px;
      background: linear-gradient(160deg, #FDFBF7 0%, #F2EBE6 100%);
    }
    .cover-ornament {
      font-size: 48px;
      margin-bottom: 32px;
      opacity: 0.6;
    }
    .cover-year {
      font-size: 96px;
      font-weight: 700;
      color: var(--morandi-primary);
      letter-spacing: 8px;
      line-height: 1;
      margin-bottom: 12px;
    }
    .cover-title {
      font-size: 28px;
      color: var(--morandi-deep);
      letter-spacing: 12px;
      margin-bottom: 40px;
    }
    .cover-divider {
      width: 80px;
      height: 1px;
      background: var(--morandi-primary);
      margin: 0 auto 32px;
      opacity: 0.5;
    }
    .cover-subtitle {
      font-size: 15px;
      color: var(--morandi-secondary);
      letter-spacing: 4px;
    }
    .cover-count {
      margin-top: 60px;
      font-size: 13px;
      color: var(--morandi-secondary);
      letter-spacing: 2px;
      border: 1px solid var(--morandi-border);
      padding: 8px 24px;
      border-radius: 999px;
    }
    .cover-footer {
      position: absolute;
      bottom: 48px;
      font-size: 12px;
      color: var(--morandi-secondary);
      opacity: 0.5;
      letter-spacing: 2px;
    }

    /* ── 目录 ── */
    .toc-page {
      padding: 80px 100px;
      page-break-after: always;
      min-height: 100vh;
    }
    .toc-header {
      font-size: 13px;
      letter-spacing: 6px;
      color: var(--morandi-secondary);
      text-transform: uppercase;
      margin-bottom: 48px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--morandi-border);
    }
    .toc-month {
      font-size: 11px;
      letter-spacing: 4px;
      color: var(--morandi-primary);
      margin: 24px 0 8px;
      text-transform: uppercase;
    }
    .toc-item {
      display: flex;
      align-items: baseline;
      gap: 12px;
      padding: 6px 0;
      border-bottom: 1px dotted var(--morandi-border);
    }
    .toc-num {
      font-size: 11px;
      color: var(--morandi-primary);
      min-width: 24px;
      flex-shrink: 0;
    }
    .toc-title {
      flex: 1;
      font-size: 14px;
      color: var(--morandi-text);
    }
    .toc-date {
      font-size: 11px;
      color: var(--morandi-secondary);
      flex-shrink: 0;
    }

    /* ── 情书正文 ── */
    .letter-page {
      padding: 80px 120px;
      page-break-before: always;
      min-height: 100vh;
      position: relative;
    }
    .letter-index {
      font-size: 11px;
      letter-spacing: 3px;
      color: var(--morandi-primary);
      margin-bottom: 24px;
    }
    .letter-title {
      font-size: 26px;
      font-weight: 600;
      color: var(--morandi-text);
      margin-bottom: 16px;
      line-height: 1.4;
    }
    .letter-meta-line {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: var(--morandi-secondary);
      margin-bottom: 40px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--morandi-border);
    }
    .tag {
      background: var(--morandi-accent);
      color: var(--morandi-deep);
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 11px;
    }
    .letter-body p {
      font-size: 15px;
      color: var(--morandi-text);
      line-height: 2;
      margin-bottom: 16px;
      text-indent: 2em;
    }

    /* ── 打印 ── */
    @media print {
      .print-btn { display: none !important; }
      .cover, .toc-page, .letter-page { page-break-after: always; }
      @page { margin: 0; size: A4; }
    }

    /* ── 打印按钮（仅预览时可见） ── */
    .print-btn {
      position: fixed;
      bottom: 32px;
      right: 32px;
      background: var(--morandi-primary);
      color: white;
      border: none;
      border-radius: 999px;
      padding: 14px 28px;
      font-size: 14px;
      font-family: inherit;
      letter-spacing: 2px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(196,168,162,0.4);
      transition: all 0.2s;
      z-index: 999;
    }
    .print-btn:hover {
      background: var(--morandi-deep);
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(196,168,162,0.5);
    }
  </style>
</head>
<body>

  <!-- 封面 -->
  <div class="cover">
    <div class="cover-ornament">💌</div>
    <div class="cover-year">${n}</div>
    <div class="cover-title">情 书 集</div>
    <div class="cover-divider"></div>
    <div class="cover-subtitle">${r(a)}</div>
    <div class="cover-count">共 ${o.length} 封情书</div>
    <div class="cover-footer">以文字留住每一个相爱的瞬间</div>
  </div>

  <!-- 目录 -->
  <div class="toc-page">
    <div class="toc-header">目 录 · Contents</div>
    ${l}
  </div>

  <!-- 正文 -->
  ${d}

  <!-- 打印按钮 -->
  <button class="print-btn" onclick="window.print()">保存为 PDF ↗</button>

</body>
</html>`}function r(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function i(e,t,r){let i=n(e,t,r),a=new Blob([i],{type:`text/html;charset=utf-8`}),o=URL.createObjectURL(a),s=window.open(o,`_blank`);return setTimeout(()=>URL.revokeObjectURL(o),3e4),s}return{generateYearbookHTML:n,openYearbook:i}}var _e={class:`letters-page page-container`},ve={class:`page-header`},ye={class:`page-title`},be={class:`count`},xe={class:`header-actions`},Se={class:`filters`},Ce=[`value`],we={class:`search-box`},Te={key:0,class:`filter-hint`},Ee={key:0},De={key:1},Oe={class:`letters-grid`},ke=[`onClick`],Ae={key:2,class:`empty-state`},je={class:`yearbook-form`},Me={class:`form-group`},Ne=[`value`],Pe={class:`form-group`},Fe={class:`letter-form`},Ie={class:`form-group`},Le={class:`form-group`},Re={class:`form-group`},ze={class:`form-group`},Be=y(d({__name:`Letters`,setup(n){let a=w(),d=T(),h=i(`all`),g=i(`all`),y=i(null),k=i(``),{isEditMode:A,showAuth:j,authPassword:M,authError:N,openAuthModal:P,verifyAuth:F,exitEditMode:I}=te({password:`2025`}),{saveStatus:L,saveMessage:R,triggerDebouncedSave:z}=ne(),{openYearbook:B}=$();function ie(e){e===null?g.value=`all`:(g.value=String(e),y.value=null,k.value=``)}function ae(e){e===null?y.value=null:(y.value=e,g.value=`all`,k.value=``)}function oe(){h.value=`all`,g.value=`all`,y.value=null,k.value=``}let V=i(!1),H=i(new Date().getFullYear()),U=i(`你和我`);function W(){let e=d.letterYears[0];e!==void 0&&(H.value=e),V.value=!0}function G(e){return d.letters.filter(t=>t.year===e).length}function K(){let e=d.letters.filter(e=>e.year===H.value);if(e.length===0){alert(`该年暂无情书`);return}V.value=!1,B(H.value,e,U.value||`你和我`)}let q=i(!1),J=i(null),Y=i({title:``,date:``,tag:``,content:``}),X=()=>new Date().toISOString().split(`T`)[0]??new Date().toISOString().slice(0,10);function se(e){e?(J.value=e,Y.value={title:e.title,date:e.date,tag:e.tag??``,content:e.content}):(J.value=null,Y.value={title:``,date:X(),tag:``,content:``}),q.value=!0}function ce(){if(!Y.value.title.trim()||!Y.value.content.trim()){alert(`请填写标题和内容`);return}let e={id:J.value?J.value.id:`letter-`+Date.now(),title:Y.value.title.trim(),content:Y.value.content.trim(),date:Y.value.date||X(),year:new Date(Y.value.date||X()).getFullYear(),tag:Y.value.tag.trim()||void 0};if(J.value){let t=d.letters.findIndex(t=>t.id===e.id);t>=0&&(d.letters[t]=e)}else d.letters.unshift(e);q.value=!1,J.value=null,Z()}function le(e){confirm(`确定要删除这封情书吗？`)&&(d.letters=d.letters.filter(t=>t.id!==e),Z())}async function Z(){z(()=>d.saveLetters(`2025`))}let Q=v(()=>{let e=d.letters;if(y.value!==null)return e=e.filter(e=>e.date===y.value),e;if(h.value!==`all`&&(e=e.filter(e=>e.year===Number(h.value))),g.value!==`all`&&(e=e.filter(e=>{let t=e.date.split(`-`);return(t[1]?parseInt(t[1]):0)===Number(g.value)})),k.value.trim()){let t=k.value.toLowerCase();e=e.filter(e=>e.title.toLowerCase().includes(t)||e.content.toLowerCase().includes(t))}return e}),ue=e=>{a.push(`/letters/${e}`)};return S(()=>{d.letters.length===0&&d.loadLetters()}),(n,i)=>(t(),u(`div`,_e,[c(`div`,ve,[c(`h2`,ye,[i[17]||=_(` 情书馆 `,-1),c(`span`,be,`(`+x(Q.value.length)+`)`,1)]),c(`div`,xe,[c(`div`,Se,[e(c(`select`,{"onUpdate:modelValue":i[0]||=e=>h.value=e,class:`filter-select`},[i[18]||=c(`option`,{value:`all`},`全部年份`,-1),(t(!0),u(p,null,o(s(d).letterYears,e=>(t(),u(`option`,{key:e,value:e},x(e)+`年 `,9,Ce))),128))],512),[[E,h.value]]),c(`div`,we,[e(c(`input`,{"onUpdate:modelValue":i[1]||=e=>k.value=e,type:`text`,placeholder:`搜索情书...`,class:`search-input`},null,512),[[C,k.value]]),i[19]||=c(`svg`,{class:`search-icon`,viewBox:`0 0 24 24`,width:`18`,height:`18`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[c(`circle`,{cx:`11`,cy:`11`,r:`8`}),c(`path`,{d:`M21 21l-4.35-4.35`})],-1)])]),s(A)?b(``,!0):(t(),u(`button`,{key:0,class:`yearbook-btn`,onClick:W},[...i[20]||=[c(`svg`,{viewBox:`0 0 24 24`,width:`16`,height:`16`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[c(`path`,{d:`M4 19.5A2.5 2.5 0 0 1 6.5 17H20`}),c(`path`,{d:`M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z`})],-1),_(` 电子书 `,-1)]])),s(A)?(t(),u(p,{key:2},[c(`button`,{class:`add-btn`,onClick:i[3]||=e=>se()},[...i[22]||=[c(`svg`,{viewBox:`0 0 24 24`,width:`16`,height:`16`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[c(`path`,{d:`M12 5v14M5 12h14`})],-1),_(` 情书 `,-1)]]),c(`button`,{class:`done-btn`,onClick:i[4]||=(...e)=>s(I)&&s(I)(...e)},`完成`)],64)):(t(),u(`button`,{key:1,class:`edit-btn`,onClick:i[2]||=(...e)=>s(P)&&s(P)(...e)},[...i[21]||=[c(`svg`,{viewBox:`0 0 24 24`,width:`16`,height:`16`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[c(`path`,{d:`M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z`})],-1),_(` 编辑 `,-1)]]))])]),f(ge,{letters:s(d).letters,onMonthSelected:ie,onDateSelected:ae},null,8,[`letters`]),y.value!==null||h.value!==`all`||g.value!==`all`?(t(),u(`div`,Te,[y.value===null?(t(),u(`span`,De,[i[23]||=_(` 正在查看 `,-1),h.value===`all`?b(``,!0):(t(),u(p,{key:0},[_(x(h.value)+`年`,1)],64)),g.value===`all`?b(``,!0):(t(),u(p,{key:1},[_(x(g.value)+`月`,1)],64)),i[24]||=_(` 的情书 `,-1)])):(t(),u(`span`,Ee,`📅 正在查看 `+x(y.value)+` 的情书`,1)),c(`button`,{class:`clear-filter`,onClick:oe},`清除筛选`)])):b(``,!0),s(L)===`idle`?b(``,!0):(t(),u(`div`,{key:1,class:l([`save-toast`,s(L)])},[c(`span`,null,x(s(R)),1)],2)),c(`div`,Oe,[(t(!0),u(p,null,o(Q.value,e=>(t(),u(`div`,{key:e.id,class:l([`letter-card-wrapper`,{"edit-mode":s(A)}])},[f(re,{letter:e,onClick:t=>!s(A)&&ue(e.id)},null,8,[`letter`,`onClick`]),s(A)?(t(),u(`button`,{key:0,class:`delete-letter-btn`,onClick:D(t=>le(e.id),[`stop`])},[...i[25]||=[c(`svg`,{viewBox:`0 0 24 24`,width:`14`,height:`14`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[c(`path`,{d:`M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2`})],-1)]],8,ke)):b(``,!0)],2))),128))]),Q.value.length===0?(t(),u(`div`,Ae,[...i[26]||=[c(`p`,null,`暂无情书，写下第一封吧 💌`,-1)]])):b(``,!0),f(ee,{modelValue:s(j),"onUpdate:modelValue":i[5]||=e=>r(j)?j.value=e:null,password:s(M),error:s(N),"onUpdate:password":i[6]||=e=>M.value=e,onConfirm:s(F)},null,8,[`modelValue`,`password`,`error`,`onConfirm`]),f(O,{modelValue:V.value,"onUpdate:modelValue":i[10]||=e=>V.value=e,title:`生成年度电子书`},{footer:m(()=>[c(`button`,{class:`btn-text`,onClick:i[9]||=e=>V.value=!1},`取消`),c(`button`,{class:`btn-primary`,onClick:K},`生成并预览`)]),default:m(()=>[c(`div`,je,[i[29]||=c(`p`,{class:`yearbook-desc`},`将该年所有情书生成精美的电子书，可在浏览器中直接保存为 PDF 💌`,-1),c(`div`,Me,[i[27]||=c(`label`,null,`选择年份`,-1),e(c(`select`,{"onUpdate:modelValue":i[7]||=e=>H.value=e,class:`filter-select`,style:{width:`100%`}},[(t(!0),u(p,null,o(s(d).letterYears,e=>(t(),u(`option`,{key:e,value:e},x(e)+`年（`+x(G(e))+`封）`,9,Ne))),128))],512),[[E,H.value]])]),c(`div`,Pe,[i[28]||=c(`label`,null,`署名`,-1),e(c(`input`,{"onUpdate:modelValue":i[8]||=e=>U.value=e,type:`text`,placeholder:`例如：你和我 / 志浩和小丽`},null,512),[[C,U.value]])])])]),_:1},8,[`modelValue`]),f(O,{modelValue:q.value,"onUpdate:modelValue":i[16]||=e=>q.value=e,title:J.value?`编辑情书`:`写一封情书`},{footer:m(()=>[c(`button`,{class:`btn-text`,onClick:i[15]||=e=>q.value=!1},`取消`),c(`button`,{class:`btn-primary`,onClick:ce},`保存`)]),default:m(()=>[c(`div`,Fe,[c(`div`,Ie,[i[30]||=c(`label`,null,`标题`,-1),e(c(`input`,{"onUpdate:modelValue":i[11]||=e=>Y.value.title=e,type:`text`,placeholder:`给亲爱的你...`},null,512),[[C,Y.value.title]])]),c(`div`,Le,[i[31]||=c(`label`,null,`日期`,-1),e(c(`input`,{"onUpdate:modelValue":i[12]||=e=>Y.value.date=e,type:`date`},null,512),[[C,Y.value.date]])]),c(`div`,Re,[i[32]||=c(`label`,null,`标签`,-1),e(c(`input`,{"onUpdate:modelValue":i[13]||=e=>Y.value.tag=e,type:`text`,placeholder:`例如：纪念日、日常...`},null,512),[[C,Y.value.tag]])]),c(`div`,ze,[i[33]||=c(`label`,null,`内容`,-1),e(c(`textarea`,{"onUpdate:modelValue":i[14]||=e=>Y.value.content=e,rows:`8`,placeholder:`写下想说的话...`},null,512),[[C,Y.value.content]])])])]),_:1},8,[`modelValue`,`title`])]))}}),[[`__scopeId`,`data-v-913963ba`]]);export{Be as default};
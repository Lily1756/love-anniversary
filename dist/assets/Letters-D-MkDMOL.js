import{H as e,L as t,N as n,O as r,S as i,T as a,a as o,c as s,ct as c,d as l,g as u,h as d,i as f,k as p,l as m,lt as h,m as g,p as _,s as v,st as y,t as b,u as x,w as S,x as C}from"./_plugin-vue_export-helper-BryC1OKW.js";import{c as w,i as T,n as ee,s as E,u as D}from"./index-CnF0tnCO.js";import{t as te}from"./Modal-Bea6ZW7V.js";import{n as O,r as ne,t as k}from"./useDebouncedSave-CqqffBF-.js";var A={key:0,class:`card-header`},j={class:`card-title`},M={class:`card-body`},N={key:1,class:`card-footer`},P=b(u({__name:`Card`,props:{size:{default:`medium`},shadow:{type:Boolean,default:!0},hoverable:{type:Boolean,default:!0},title:{},backgroundColor:{default:`var(--bg-container)`}},setup(e){let t={backgroundColor:e.backgroundColor};return(n,r)=>(i(),l(`div`,{class:y([`m-card`,[`size-${e.size}`,{"has-shadow":e.shadow,"is-hoverable":e.hoverable}]]),style:t},[n.$slots.header||e.title?(i(),l(`div`,A,[a(n.$slots,`header`,{},()=>[s(`h3`,j,h(e.title),1)],!0)])):x(``,!0),s(`div`,M,[a(n.$slots,`default`,{},void 0,!0)]),n.$slots.footer?(i(),l(`div`,N,[a(n.$slots,`footer`,{},void 0,!0)])):x(``,!0)],2))}}),[[`__scopeId`,`data-v-1834c394`]]),F={class:`letter-meta`},I={class:`letter-date`},L={key:0,class:`letter-tag`},R={class:`letter-preview`},z={class:`letter-footer`},B={class:`letter-year`},V={key:0,class:`favorite-icon`,viewBox:`0 0 24 24`,width:`16`,height:`16`,fill:`var(--color-primary)`,stroke:`none`},re=b(u({__name:`LoveLetterCard`,props:{letter:{}},emits:[`click`],setup(e){let t=e,n=v(()=>{let e=t.letter.content.replace(/\n/g,` `);return e.length>80?e.slice(0,80)+`...`:e}),a=e=>{let t=new Date(e);return`${t.getMonth()+1}月${t.getDate()}日`};return(t,o)=>(i(),m(P,{class:`letter-card`,size:`medium`,title:e.letter.title,onClick:o[0]||=n=>t.$emit(`click`,e.letter.id)},{default:r(()=>[s(`div`,F,[s(`span`,I,h(a(e.letter.date)),1),e.letter.tag?(i(),l(`span`,L,h(e.letter.tag),1)):x(``,!0)]),s(`p`,R,h(n.value),1),s(`div`,z,[s(`span`,B,h(e.letter.year)+`年`,1),e.letter.isFavorite?(i(),l(`svg`,V,[...o[1]||=[s(`path`,{d:`M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z`},null,-1)]])):x(``,!0)])]),_:1},8,[`title`]))}}),[[`__scopeId`,`data-v-db400d98`]]),H={class:`starry-container`,role:`region`,"aria-label":`年度记忆星光图`},U=[`viewBox`],W=[`cx`,`cy`,`r`,`opacity`],G={class:`constellation-lines`},K=[`x1`,`y1`,`x2`,`y2`],q={class:`stars-group`},J=[`onMouseenter`,`onClick`],Y=[`cx`,`cy`,`r`,`fill`,`opacity`],X=[`cx`,`cy`,`r`,`fill`,`opacity`],Z=[`cx`,`cy`,`r`,`fill`,`opacity`,`filter`],ie=[`cx`,`cy`,`stroke`],ae={class:`month-labels`},oe=[`onClick`],se=[`x`,`y`],ce=[`x`,`y`,`fill`,`font-weight`],le=[`x`,`y`],ue={class:`svg-tooltip`},de={class:`tooltip-date`},fe={class:`tooltip-preview`},pe={class:`tooltip-count`},me={class:`progress-section`},he={class:`progress-header`},ge={class:`progress-percent`},_e={class:`progress-track`},ve={class:`progress-text`},ye={class:`stats-panel`},be={class:`stat-item`},xe={class:`stat-value`},Se={class:`stat-item`},Ce={class:`stat-value`},we={key:0,class:`stat-item`},Te={class:`stat-value`},Ee={key:0,class:`month-filter-hint`},Q=800,$=380,De=b({__name:`StarryNightChart`,props:{letters:{type:Array,default:()=>[]}},emits:[`month-selected`,`date-selected`],setup(e,{emit:n}){let r=e,a=n,o={left:80,right:80,top:40,bottom:50},u=Q-o.left-o.right,d=$-o.top-o.bottom,p=$/2-20,m=t(null),y=t(null),b=t({x:0,y:0}),C=t(null);function w(e){let t=e%2147483647;return t<=0&&(t+=2147483646),t=t*16807%2147483647,(t-1)/2147483646}function T(e){let t=(e-1)/11;return o.left+t*u}function ee(e,t,n){let r=w(t*31+e+n*1e3),i=d/2-20;return p+(r*2-1)*i}function E(e,t){return 3+(Math.min(e/5,1)*.5+Math.min(t/500,1)*.5)*6}function D(e){return e===1?{core:`#C9A8A9`,glowFill:`rgba(201, 168, 169, 0.3)`}:e<=3?{core:`#B8958A`,glowFill:`rgba(184, 149, 138, 0.3)`}:{core:`#A89080`,glowFill:`rgba(169, 144, 128, 0.25)`}}let te=v(()=>{let e={};for(let t of r.letters)t.date&&(e[t.date]||(e[t.date]=[]),e[t.date].push(t));return e}),O=v(()=>{let e=new Date,t=[];for(let[n,r]of Object.entries(te.value)){let[i,a,o]=n.split(`-`),s=parseInt(i),c=parseInt(a),l=parseInt(o);if(s>e.getFullYear()||s===e.getFullYear()&&c>e.getMonth()+1||s===e.getFullYear()&&c===e.getMonth()+1&&l>e.getDate())continue;let u=T(c),d=ee(l,c,s),f=Math.max(...r.map(e=>(e.content||``).length)),p=E(r.length,f),m=D(r.length),h=r[0].title?r[0].title.slice(0,16)+(r[0].title.length>16?`…`:``):(r[0].content||``).slice(0,16)+`…`,g=s===2025?.65:.9;t.push({key:n,x:u,y:d,size:p,r:p,outerR:p*2,middleR:p*1.2,coreR:p*.4,coreColor:m.core,glowFill:m.glowFill,opacity:g,year:s,month:c,day:l,count:r.length,preview:h,hovered:!1,animationDelay:w(s*1e3+c*31+l)})}return t}),ne=v(()=>{let e=[];for(let t=0;t<35;t++){let n=t*137;e.push({id:t,x:w(n)*Q,y:w(n+1)*$,r:.3+w(n+2)*.6,opacity:.1+w(n+3)*.2,delay:w(n+4)*5})}return e}),k=v(()=>{let e=[],t=[...O.value].sort((e,t)=>e.year-t.year||e.month-t.month||e.day-t.day),n={};for(let e of t)n[e.month]||(n[e.month]=[]),n[e.month].push(e);for(let t=1;t<12;t++){let r=n[t],i=n[t+1];if(r&&i){let t=r[r.length-1],n=i[0];e.push({x1:t.x,y1:t.y,x2:n.x,y2:n.y})}}return e});function A(e){return{x:T(e),y:$-o.bottom/2+5}}let j=v(()=>{if(!r.letters||r.letters.length===0)return{percentage:0,count:0,total:365};let e=new Set;for(let t of r.letters)if(t.date){let n=new Date(t.date);if(!isNaN(n.getTime())){let t=n.toISOString().split(`T`)[0];e.add(t)}}let t=e.size;return{percentage:Math.min(Math.round(t/365*100),100),count:t,total:365}}),M=v(()=>r.letters.length),N=v(()=>new Set(O.value.map(e=>e.month)).size),P=v(()=>{if(O.value.length===0)return null;let e=[...O.value].sort((e,t)=>e.year-t.year||e.month-t.month||e.day-t.day),t=1,n=1;for(let r=1;r<e.length;r++){let i=new Date(e[r-1].year,e[r-1].month-1,e[r-1].day);(new Date(e[r].year,e[r].month-1,e[r].day)-i)/(1e3*60*60*24)==1?(n++,t=Math.max(t,n)):n=1}return{maxStreak:t}});function F(e,t){y.value={...e,hovered:!0},b.value={x:e.x,y:e.y},m.value=e.month}function I(){y.value=null}function L(e){a(`date-selected`,e.key),a(`month-selected`,e.month)}function R(e){m.value===e?z():(m.value=e,a(`month-selected`,e))}function z(){m.value=null,a(`month-selected`,null)}function B(){y.value=null}return(e,t)=>(i(),l(`div`,H,[t[7]||=s(`div`,{class:`nebula-background`},null,-1),t[8]||=s(`div`,{class:`header-area`},[s(`h3`,{class:`card-title`},`✨ 时间脉络`),s(`p`,{class:`card-subtitle`},`每一个写下情书的日子，都是星空里闪亮的一颗星`)],-1),s(`div`,{class:`chart-area`,ref_key:`chartAreaRef`,ref:C},[(i(),l(`svg`,{class:`stars-canvas`,viewBox:`0 0 ${Q} ${$}`,xmlns:`http://www.w3.org/2000/svg`,onMouseleave:B},[t[0]||=_(`<defs data-v-a0e9824d><radialGradient id="star-glow-soft" cx="50%" cy="50%" r="50%" data-v-a0e9824d><stop offset="0%" stop-color="#C9A8A9" stop-opacity="0.8" data-v-a0e9824d></stop><stop offset="50%" stop-color="#C9A8A9" stop-opacity="0.3" data-v-a0e9824d></stop><stop offset="100%" stop-color="#C9A8A9" stop-opacity="0" data-v-a0e9824d></stop></radialGradient><radialGradient id="star-glow-bright" cx="50%" cy="50%" r="50%" data-v-a0e9824d><stop offset="0%" stop-color="#A89080" stop-opacity="1" data-v-a0e9824d></stop><stop offset="30%" stop-color="#C9A8A9" stop-opacity="0.5" data-v-a0e9824d></stop><stop offset="100%" stop-color="#D8C4B6" stop-opacity="0" data-v-a0e9824d></stop></radialGradient><filter id="star-glow-filter" x="-100%" y="-100%" width="300%" height="300%" data-v-a0e9824d><feGaussianBlur stdDeviation="3" result="blur" data-v-a0e9824d></feGaussianBlur><feMerge data-v-a0e9824d><feMergeNode in="blur" data-v-a0e9824d></feMergeNode><feMergeNode in="SourceGraphic" data-v-a0e9824d></feMergeNode></feMerge></filter><filter id="star-glow-strong" x="-150%" y="-150%" width="400%" height="400%" data-v-a0e9824d><feGaussianBlur stdDeviation="6" result="blur" data-v-a0e9824d></feGaussianBlur><feMerge data-v-a0e9824d><feMergeNode in="blur" data-v-a0e9824d></feMergeNode><feMergeNode in="blur" data-v-a0e9824d></feMergeNode><feMergeNode in="SourceGraphic" data-v-a0e9824d></feMergeNode></feMerge></filter></defs>`,1),s(`rect`,{width:Q,height:$,fill:`rgba(201, 168, 169, 0.03)`,rx:`16`}),(i(!0),l(f,null,S(ne.value,e=>(i(),l(`circle`,{key:`bg-`+e.id,cx:e.x,cy:e.y,r:e.r,opacity:e.opacity,fill:`#C9A8A9`,class:`bg-star`,style:c({animationDelay:e.delay+`s`})},null,12,W))),128)),s(`g`,G,[(i(!0),l(f,null,S(k.value,(e,t)=>(i(),l(`line`,{key:`const-`+t,x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2,stroke:`#D8C4B6`,"stroke-width":`0.5`,"stroke-dasharray":`2 4`,opacity:`0.3`},null,8,K))),128))]),s(`g`,q,[(i(!0),l(f,null,S(O.value,(e,t)=>(i(),l(`g`,{key:e.key,class:`star-wrapper`,style:c([{"--i":t,"--delay":e.animationDelay+`s`},{cursor:`pointer`}]),onMouseenter:t=>F(e,t),onMouseleave:I,onClick:t=>L(e)},[s(`circle`,{cx:e.x,cy:e.y,r:e.outerR,fill:e.glowFill,opacity:e.hovered?.4:.15,class:`star-outer-glow`},null,8,Y),s(`circle`,{cx:e.x,cy:e.y,r:e.middleR,fill:e.glowFill,opacity:e.hovered?.6:.25,class:`star-middle-glow`},null,8,X),s(`circle`,{cx:e.x,cy:e.y,r:e.coreR,fill:e.coreColor,opacity:e.hovered?1:e.opacity,filter:e.hovered?`url(#star-glow-strong)`:e.count>=4?`url(#star-glow-filter)`:`none`,class:`star-core`},null,8,Z),e.hovered?(i(),l(`circle`,{key:0,cx:e.x,cy:e.y,r:`4`,fill:`none`,stroke:e.coreColor,"stroke-width":`0.8`,class:`ripple-ring`},null,8,ie)):x(``,!0)],44,J))),128))]),s(`g`,ae,[(i(),l(f,null,S(12,e=>s(`g`,{key:`ml-`+e,onClick:t=>R(e),style:{cursor:`pointer`}},[s(`rect`,{x:A(e).x-16,y:A(e).y-10,width:`32`,height:`20`,fill:`transparent`,rx:`4`},null,8,se),s(`text`,{x:A(e).x,y:A(e).y,class:`month-label-text`,"text-anchor":`middle`,"dominant-baseline":`central`,fill:m.value===e?`#A89080`:`rgba(90, 90, 90, 0.5)`,"font-weight":m.value===e?`600`:`400`},h(e)+`月`,9,ce)],8,oe)),64))]),y.value?(i(),l(`foreignObject`,{key:0,x:b.value.x-90,y:b.value.y-80,width:`180`,height:`80`,style:{overflow:`visible`,"pointer-events":`none`}},[s(`div`,ue,[s(`div`,de,h(y.value.year)+`年`+h(y.value.month)+`月`+h(y.value.day)+`日`,1),s(`div`,fe,h(y.value.preview),1),s(`div`,pe,h(y.value.count)+`封情书`,1)])],8,le)):x(``,!0)],40,U))],512),t[9]||=s(`div`,{class:`divider`},null,-1),s(`div`,me,[s(`div`,he,[t[1]||=s(`span`,{class:`progress-title`},`记忆星辰点亮度`,-1),s(`span`,ge,h(j.value.percentage)+`%`,1)]),s(`div`,_e,[s(`div`,{class:`progress-fill`,style:c({width:j.value.percentage+`%`})},null,4)]),s(`div`,ve,` 已点亮 `+h(j.value.count)+` / `+h(j.value.total)+` 个日夜 `,1)]),s(`div`,ye,[s(`div`,be,[t[3]||=s(`span`,{class:`stat-label`},`记录月份`,-1),s(`span`,xe,[g(h(N.value),1),t[2]||=s(`span`,{class:`stat-unit`},`/12`,-1)])]),s(`div`,Se,[t[4]||=s(`span`,{class:`stat-label`},`星光总数`,-1),s(`span`,Ce,h(M.value),1)]),P.value?(i(),l(`div`,we,[t[6]||=s(`span`,{class:`stat-label`},`最长连续`,-1),s(`span`,Te,[g(h(P.value.maxStreak),1),t[5]||=s(`span`,{class:`stat-unit`},`天`,-1)])])):x(``,!0)]),m.value===null?x(``,!0):(i(),l(`div`,Ee,[s(`span`,null,`📅 正在查看 `+h(m.value)+` 月的情书`,1),s(`button`,{class:`clear-month-btn`,onClick:z},`清除筛选`)]))]))}},[[`__scopeId`,`data-v-a0e9824d`]]),Oe={class:`letters-page page-container`},ke={class:`page-header`},Ae={class:`header-row header-row--primary`},je={class:`page-title`},Me={class:`count`},Ne={class:`primary-actions`},Pe={class:`header-row header-row--tools`},Fe={class:`filter-tools`},Ie=[`value`],Le={class:`search-box`},Re=[`disabled`],ze={class:`ebook-picker`},Be={class:`picker-header`},Ve={class:`picker-years`},He=[`onClick`],Ue={key:0,class:`filter-hint`},We={key:0},Ge={key:1},Ke={class:`letters-grid`},qe=[`onClick`],Je={key:1,class:`empty-state`},Ye={key:0},Xe={key:1},Ze={key:2},Qe={class:`letter-form`},$e={class:`form-group`},et={class:`form-group`},tt={class:`form-group`},nt={class:`form-group`},rt=b(u({__name:`Letters`,setup(a){let c=T(),u=ee(),{isEditMode:_,showAuth:b,authPassword:A,authError:j,openAuthModal:M,verifyAuth:N,exitEditMode:P}=O({password:`2025`}),{saveStatus:F,saveMessage:I,triggerDebouncedSave:L}=k(),R=t(`all`),z=t(`all`),B=t(``),V=t(null),H=t(!1),U=t(!1),W=t(null),G=t({title:``,date:new Date().toISOString().split(`T`)[0]||``,content:``,tag:`日常`,id:void 0}),K=v(()=>{let e=u.letters;if(V.value!==null)return e=e.filter(e=>e.date===V.value),e;if(R.value!==`all`&&(e=e.filter(e=>e.year===Number(R.value))),z.value!==`all`&&(e=e.filter(e=>{let t=e.date.split(`-`);return(t[1]?parseInt(t[1]):0)===Number(z.value)})),B.value.trim()){let t=B.value.toLowerCase();e=e.filter(e=>e.title.toLowerCase().includes(t)||e.content.toLowerCase().includes(t))}return e}),q=e=>{c.push(`/letters/${e}`)},J=()=>{W.value=null,G.value={title:``,date:new Date().toISOString().split(`T`)[0]||``,content:``,tag:`日常`},U.value=!0},Y=e=>{W.value=e,G.value={title:e.title,date:e.date,content:e.content,tag:e.tag||`日常`},U.value=!0},X=()=>{if(!G.value.title.trim()){alert(`请输入标题`);return}if(!G.value.content.trim()){alert(`请输入内容`);return}let e=G.value;if(W.value){let t=u.letters.findIndex(e=>e.id===W.value.id);if(t>=0){let n=new Date(e.date||``).getFullYear()||new Date().getFullYear(),r=u.letters,i=r[t];i&&(r[t]={...i,title:e.title.trim(),content:e.content.trim(),date:e.date,tag:e.tag,year:n})}}else{let t=new Date(e.date||``).getFullYear()||new Date().getFullYear();u.letters.push({id:`letter_`+Date.now(),title:e.title.trim(),content:e.content.trim(),date:e.date,tag:e.tag,year:t,isFavorite:!1})}U.value=!1,W.value=null,L(()=>u.saveLetters(`2025`))},Z=e=>{if(!confirm(`确定要删除这封情书吗？`))return;let t=u.letters,n=t.findIndex(t=>t.id===e);n>=0&&t.splice(n,1),L(()=>u.saveLetters(`2025`))},ie=e=>{e===null?V.value=null:(V.value=e.date,R.value=`all`,z.value=`all`,B.value=``)},ae=e=>{e==null?z.value=`all`:(z.value=String(e),V.value=null,B.value=``)},oe=()=>{V.value=null,R.value=`all`,z.value=`all`,B.value=``},se=e=>{let t=u.letters.filter(t=>t.year===e).sort((e,t)=>new Date(e.date).getTime()-new Date(t.date).getTime());if(t.length===0){alert(`${e}年暂无情书记录`);return}let n=e=>{let t=e.split(`-`);return`${t[0]}年${Number(t[1])}月${Number(t[2])}日`},r=e=>{let t=e.trim();if(t.length===0)return e;let n=[`亲爱的`,`致`,`Hi`,`你好`,`宝贝`],r=0;for(let e of n)if(t.startsWith(e)){r=e.length;break}return`<span class="drop-cap">${t[r]}</span>${t.slice(r+1)}`},i=t.map((e,i)=>`
    <div class="letter-page">
      <div class="letter-date-head">
        <span class="date-line"></span>
        <span class="date-text">${n(e.date)}</span>
        <span class="date-line"></span>
      </div>
      <h2 class="letter-title">${e.title}</h2>
      <div class="letter-body">${r(e.content)}</div>
      <div class="page-num-print"></div>
    </div>
    ${i<t.length-1?`<div class="page-break"></div>`:``}
  `).join(``),a=t.map((e,t)=>{let r=n(e.date),i=e.title.length,a=r.length,o=Math.max(4,28-i-a);return`
      <div class="toc-entry">
        <span class="toc-num">${String(t+1).padStart(2,`0`)}</span>
        <span class="toc-name">${e.title}</span>
        <span class="toc-dots">${`·`.repeat(o)}</span>
        <span class="toc-date">${r}</span>
      </div>
    `}).join(``),o=`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${e}年 · 年度情书电子书</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&family=Noto+Serif+SC:wght@400;700&family=Ma+Shan+Zheng&display=swap" rel="stylesheet">
<style>
  @page { size: A5 portrait; margin: 0; }
  @page :first { margin: 0; }
  @media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .no-print, .print-toolbar { display: none !important; }
    .letter-page { page-break-inside: avoid; }
    .page-break { page-break-before: always; }
    .cover { page-break-after: always; }
    .toc { page-break-after: always; }
    .colophon { page-break-before: always; }
    .page-num-print { display: block !important; }
  }
  @media screen { .page-num-print { display: none; } }
  .toc { counter-reset: toc-page; }
  .toc .page-num-print {
    position: absolute; bottom: 12mm; left: 0; right: 0; text-align: center;
    counter-increment: toc-page; font-family: "Noto Sans SC", sans-serif; font-size: 8pt; color: #A8A8A8;
  }
  .toc .page-num-print::after { content: counter(toc-page, lower-roman); }
  .content-body { counter-reset: page 1; }
  .letter-page .page-num-print {
    position: absolute; bottom: 12mm; left: 0; right: 0; text-align: center;
    counter-increment: page; font-family: "Noto Sans SC", sans-serif; font-size: 8pt; color: #A8A8A8;
  }
  .letter-page .page-num-print::after { content: counter(page); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 148mm; margin: 0 auto; background: #FEFBF6; color: #3A3A3A; font-family: "Noto Serif SC", "Ma Shan Zheng", "Source Han Serif SC", serif; font-size: 11pt; line-height: 1.8; -webkit-font-smoothing: antialiased; }
  .print-toolbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
    background: linear-gradient(135deg, #FDF6EC, #FFF5F5);
    border-bottom: 1px solid #E8D4C8; padding: 10px 20px;
    display: flex; align-items: center; gap: 14px; font-family: "Noto Sans SC", sans-serif;
    box-shadow: 0 2px 12px rgba(184,151,154,0.18);
  }
  .print-tips-bar { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
  .print-toolbar .tips-icon { font-size: 16px; flex-shrink: 0; }
  .print-tips-bar span:last-child { font-size: 12.5px; color: #7A6058; white-space: nowrap; }
  .cover {
    height: 210mm; padding: 20mm; display: flex; flex-direction: column;
    justify-content: center; align-items: center; text-align: center;
    background: #FEFBF6; position: relative; overflow: hidden; box-sizing: border-box;
  }
  .cover::before {
    content: ""; position: absolute; inset: 0;
    background: radial-gradient(circle at 20% 30%, rgba(201,168,169,0.08) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(216,196,182,0.10) 0%, transparent 50%);
    pointer-events: none;
  }
  .cover-ornament { font-size: 48px; margin-bottom: 36px; position: relative; }
  .cover-year { font-family: "Ma Shan Zheng", "Noto Serif SC", serif; font-size: 48pt; font-weight: 400; color: #B8979A; letter-spacing: 4px; line-height: 1.1; margin-bottom: 12px; position: relative; }
  .cover-subtitle { font-family: "Noto Serif SC", serif; font-size: 14pt; color: #9A7A7C; font-style: italic; margin-bottom: 32px; position: relative; }
  .cover-divider { width: 60px; height: 1px; background: linear-gradient(90deg, transparent, #C9A8A9, transparent); margin-bottom: 20px; position: relative; }
  .cover-meta { font-family: "Noto Sans SC", sans-serif; font-size: 10pt; color: #A8A8A8; position: relative; }
  .cover-count { display: inline-block; margin-top: 16px; padding: 6px 20px; border: 1px solid rgba(201,168,169,0.4); border-radius: 20px; font-family: "Noto Sans SC", sans-serif; font-size: 9pt; color: #B8979A; background: rgba(201,168,169,0.06); position: relative; }
  .toc { padding: 20mm 20mm 15mm 20mm; position: relative; min-height: 210mm; box-sizing: border-box; }
  .toc-title { font-family: "Noto Sans SC", sans-serif; font-weight: 700; font-size: 16pt; color: #B8979A; text-align: center; margin-bottom: 8mm; letter-spacing: 4px; }
  .toc-entry { display: flex; align-items: baseline; padding: 7px 0; gap: 6px; }
  .toc-num { font-family: "Noto Sans SC", sans-serif; font-size: 9pt; color: #C9A8A9; min-width: 28px; flex-shrink: 0; }
  .toc-name { font-family: "Noto Serif SC", serif; font-size: 10.5pt; color: #4A4A4A; flex-shrink: 0; }
  .toc-dots { flex: 1; font-size: 8pt; color: #D5CFC8; letter-spacing: 2px; overflow: hidden; white-space: nowrap; }
  .toc-date { font-family: "Noto Sans SC", sans-serif; font-size: 8.5pt; color: #A8A8A8; flex-shrink: 0; }
  .content-body { }
  .letter-page { padding: 20mm 20mm 18mm 20mm; min-height: 210mm; position: relative; box-sizing: border-box; page-break-inside: avoid; }
  .page-break { page-break-before: always; }
  .letter-date-head { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 6mm; }
  .date-line { flex: 0 0 40px; height: 1px; background: linear-gradient(90deg, transparent, #D5CFC8); }
  .date-line:last-child { background: linear-gradient(90deg, #D5CFC8, transparent); }
  .date-text { font-family: "Noto Sans SC", sans-serif; font-size: 9pt; color: #A8A8A8; letter-spacing: 1px; white-space: nowrap; }
  .letter-title { font-family: "Noto Serif SC", serif; font-weight: 700; font-size: 13pt; color: #4A4A4A; text-align: center; margin-bottom: 6mm; line-height: 1.5; }
  .letter-body { font-family: "Noto Serif SC", "Ma Shan Zheng", serif; font-size: 11pt; line-height: 1.9; color: #3A3A3A; text-align: justify; text-indent: 0; }
  .drop-cap { font-family: "Ma Shan Zheng", "Noto Serif SC", serif; font-size: 2.4em; line-height: 1; float: left; margin-right: 6px; margin-top: 2px; color: #B8979A; font-weight: 400; }
  .colophon { height: 210mm; padding: 20mm; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; position: relative; box-sizing: border-box; background: #FEFBF6; }
  .colophon .page-num-print { position: absolute; bottom: 12mm; left: 0; right: 0; text-align: center; counter-increment: page; font-family: "Noto Sans SC", sans-serif; font-size: 8pt; color: #A8A8A8; }
  .colophon .page-num-print::after { content: counter(page); }
  .colophon-flower { font-size: 28px; margin-bottom: 16px; }
  .colophon-text { font-family: "Noto Serif SC", serif; font-size: 11pt; color: #A8A8A8; margin-bottom: 8px; }
  .colophon-italic { font-family: "Noto Serif SC", serif; font-style: italic; font-size: 10pt; color: #C9A8A9; }
  @media screen {
    html, body { box-shadow: 0 0 40px rgba(100,80,75,0.10); }
    .cover, .colophon { min-height: 210mm; height: auto; }
  }
</style>
</head>
<body>
  <div class="cover">
    <div class="cover-ornament">💌</div>
    <div class="cover-year">${e}</div>
    <div class="cover-subtitle">年度情书集</div>
    <div class="cover-divider"></div>
    <div class="cover-meta">我们的故事，一字一句，都是爱</div>
    <div class="cover-count">共 ${t.length} 封情书</div>
  </div>
  <div class="toc">
    <div class="toc-title">— 目 录 —</div>
    ${a}
    <div class="page-num-print"></div>
  </div>
  <div class="content-body">
    ${i}
  </div>
  <div class="colophon">
    <div class="page-num-print"></div>
    <div class="colophon-flower">🌸</div>
    <div class="colophon-text">这是我们 ${e} 年的故事</div>
    <div class="colophon-italic">每一个字，都满载着爱</div>
  </div>
  <div class="print-toolbar">
    <div class="print-tips-bar">
      <span class="tips-icon">💡</span>
      <span>打印时请关闭「页眉和页脚」→ 选「保存为 PDF」</span>
    </div>
    <button onclick="window.print()" style="padding:8px 18px;background:#B8979A;color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-family:'Noto Sans SC',sans-serif;box-shadow:0 3px 10px rgba(184,151,154,0.35);white-space:nowrap">
      🖨️ 打印 / PDF
    </button>
    <button onclick="document.querySelector('.print-toolbar').style.display='none'" style="padding:8px 12px;background:#F0EBE6;color:#9A7A7C;border:none;border-radius:8px;font-size:13px;cursor:pointer;">
      ✕
    </button>
  </div>
</body>
</html>`,s=new Blob([o],{type:`text/html;charset=utf-8`}),c=URL.createObjectURL(s);window.open(c,`_blank`)};return C(()=>{u.letters.length===0&&u.loadLetters()}),(t,a)=>(i(),l(`div`,Oe,[s(`div`,ke,[s(`div`,Ae,[s(`h2`,je,[a[15]||=g(` 情书馆 `,-1),s(`span`,Me,`(`+h(K.value.length)+`)`,1)]),s(`div`,Ne,[e(_)?(i(),l(f,{key:1},[s(`button`,{class:`add-btn`,onClick:J},[...a[17]||=[s(`svg`,{viewBox:`0 0 24 24`,width:`16`,height:`16`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[s(`line`,{x1:`12`,y1:`5`,x2:`12`,y2:`19`}),s(`line`,{x1:`5`,y1:`12`,x2:`19`,y2:`12`})],-1),g(` 写情书 `,-1)]]),s(`button`,{class:`done-btn`,onClick:a[1]||=(...t)=>e(P)&&e(P)(...t)},`完成`)],64)):(i(),l(`button`,{key:0,class:`edit-btn`,onClick:a[0]||=(...t)=>e(M)&&e(M)(...t)},[...a[16]||=[s(`svg`,{viewBox:`0 0 24 24`,width:`16`,height:`16`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[s(`path`,{d:`M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z`})],-1),g(` 编辑 `,-1)]]))])]),s(`div`,Pe,[s(`div`,Fe,[p(s(`select`,{"onUpdate:modelValue":a[2]||=e=>R.value=e,class:`filter-select`},[a[18]||=s(`option`,{value:`all`},`全部年份`,-1),(i(!0),l(f,null,S(e(u).letterYears,e=>(i(),l(`option`,{key:e,value:e},h(e)+`年 `,9,Ie))),128))],512),[[E,R.value]]),s(`div`,Le,[p(s(`input`,{"onUpdate:modelValue":a[3]||=e=>B.value=e,type:`text`,placeholder:`搜索情书...`,class:`search-input`},null,512),[[w,B.value]]),a[19]||=s(`svg`,{class:`search-icon`,viewBox:`0 0 24 24`,width:`18`,height:`18`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[s(`circle`,{cx:`11`,cy:`11`,r:`8`}),s(`path`,{d:`M21 21l-4.35-4.35`})],-1)])]),s(`button`,{class:`ebook-btn-sm`,onClick:a[4]||=e=>H.value=!0,disabled:e(u).letterYears.length===0,title:`生成年度电子书`},[...a[20]||=[s(`svg`,{viewBox:`0 0 24 24`,width:`15`,height:`15`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[s(`path`,{d:`M4 19.5A2.5 2.5 0 0 1 6.5 17H20`}),s(`path`,{d:`M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z`})],-1),g(` 电子书 `,-1)]],8,Re)])]),(i(),m(o,{to:`body`},[H.value?(i(),l(`div`,{key:0,class:`ebook-overlay`,onClick:a[6]||=D(e=>H.value=!1,[`self`])},[s(`div`,ze,[s(`div`,Be,[a[21]||=s(`span`,null,`📖 选择年份`,-1),s(`button`,{class:`picker-close`,onClick:a[5]||=e=>H.value=!1},`×`)]),s(`div`,Ve,[(i(!0),l(f,null,S(e(u).letterYears,e=>(i(),l(`button`,{key:e,class:`picker-year-btn`,onClick:t=>{se(e),H.value=!1}},h(e)+`年 `,9,He))),128))])])])):x(``,!0)])),d(De,{letters:e(u).letters,onDateSelected:ie,onMonthSelected:ae},null,8,[`letters`]),V.value!==null||R.value!==`all`||z.value!==`all`?(i(),l(`div`,Ue,[V.value===null?(i(),l(`span`,Ge,[a[22]||=g(` 正在查看 `,-1),R.value===`all`?x(``,!0):(i(),l(f,{key:0},[g(h(R.value)+`年`,1)],64)),z.value===`all`?x(``,!0):(i(),l(f,{key:1},[g(h(z.value)+`月`,1)],64)),a[23]||=g(` 的情书 `,-1)])):(i(),l(`span`,We,`📅 正在查看 `+h(V.value)+` 的情书`,1)),s(`button`,{class:`clear-filter`,onClick:oe},`清除筛选`)])):x(``,!0),s(`div`,Ke,[(i(!0),l(f,null,S(K.value,t=>(i(),l(`div`,{key:t.id,class:y([`letter-card-wrapper`,{"edit-mode":e(_)}])},[e(_)?(i(),l(`button`,{key:0,class:`delete-btn`,onClick:e=>Z(t.id),title:`删除情书`},[...a[24]||=[s(`svg`,{viewBox:`0 0 24 24`,width:`14`,height:`14`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[s(`path`,{d:`M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2`})],-1)]],8,qe)):x(``,!0),d(re,{letter:t,onClick:n=>e(_)?Y(t):q(t.id)},null,8,[`letter`,`onClick`])],2))),128))]),K.value.length===0?(i(),l(`div`,Je,[V.value===null?R.value!==`all`||z.value!==`all`?(i(),l(`p`,Xe,h(R.value===`all`?``:R.value+`年`)+h(z.value===`all`?``:z.value+`月`)+`暂无情书记录 `,1)):(i(),l(`p`,Ze,`暂无情书，写下第一封吧 💌`)):(i(),l(`p`,Ye,`这一天还没有情书记录`))])):x(``,!0),d(ne,{modelValue:e(b),"onUpdate:modelValue":a[7]||=e=>n(b)?b.value=e:null,password:e(A),error:e(j),"onUpdate:password":a[8]||=e=>A.value=e,onConfirm:e(N)},null,8,[`modelValue`,`password`,`error`,`onConfirm`]),d(te,{modelValue:U.value,"onUpdate:modelValue":a[14]||=e=>U.value=e,title:W.value?`编辑情书`:`写情书`},{footer:r(()=>[s(`button`,{class:`btn-text`,onClick:a[13]||=e=>U.value=!1},`取消`),s(`button`,{class:`btn-primary`,onClick:X},`保存`)]),default:r(()=>[s(`div`,Qe,[s(`div`,$e,[a[25]||=s(`label`,null,`标题`,-1),p(s(`input`,{"onUpdate:modelValue":a[9]||=e=>G.value.title=e,type:`text`,placeholder:`给这封情书起个名字...`,maxlength:`50`},null,512),[[w,G.value.title]])]),s(`div`,et,[a[26]||=s(`label`,null,`日期`,-1),p(s(`input`,{"onUpdate:modelValue":a[10]||=e=>G.value.date=e,type:`date`},null,512),[[w,G.value.date]])]),s(`div`,tt,[a[27]||=s(`label`,null,`内容`,-1),p(s(`textarea`,{"onUpdate:modelValue":a[11]||=e=>G.value.content=e,rows:`8`,placeholder:`写下你想说的话...`},null,512),[[w,G.value.content]])]),s(`div`,nt,[a[29]||=s(`label`,null,`标签`,-1),p(s(`select`,{"onUpdate:modelValue":a[12]||=e=>G.value.tag=e},[...a[28]||=[s(`option`,{value:`日常`},`日常`,-1),s(`option`,{value:`纪念日`},`纪念日`,-1),s(`option`,{value:`旅行`},`旅行`,-1),s(`option`,{value:`道歉`},`道歉`,-1),s(`option`,{value:`感谢`},`感谢`,-1)]],512),[[E,G.value.tag]])])])]),_:1},8,[`modelValue`,`title`])]))}}),[[`__scopeId`,`data-v-b735d86d`]]);export{rt as default};
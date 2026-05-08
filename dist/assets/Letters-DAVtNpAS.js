import{H as e,L as t,O as n,S as r,T as i,a,c as o,ct as s,d as c,g as l,h as u,i as d,k as f,l as p,lt as m,m as h,p as g,s as _,st as v,t as y,u as b,w as x,x as S}from"./_plugin-vue_export-helper-BryC1OKW.js";import{c as C,i as w,n as T,s as E,u as D}from"./index-vw7qIF0l.js";var O={key:0,class:`card-header`},k={class:`card-title`},A={class:`card-body`},j={key:1,class:`card-footer`},M=y(l({__name:`Card`,props:{size:{default:`medium`},shadow:{type:Boolean,default:!0},hoverable:{type:Boolean,default:!0},title:{},backgroundColor:{default:`var(--bg-container)`}},setup(e){let t={backgroundColor:e.backgroundColor};return(n,a)=>(r(),c(`div`,{class:v([`m-card`,[`size-${e.size}`,{"has-shadow":e.shadow,"is-hoverable":e.hoverable}]]),style:t},[n.$slots.header||e.title?(r(),c(`div`,O,[i(n.$slots,`header`,{},()=>[o(`h3`,k,m(e.title),1)],!0)])):b(``,!0),o(`div`,A,[i(n.$slots,`default`,{},void 0,!0)]),n.$slots.footer?(r(),c(`div`,j,[i(n.$slots,`footer`,{},void 0,!0)])):b(``,!0)],2))}}),[[`__scopeId`,`data-v-1834c394`]]),N={class:`letter-meta`},P={class:`letter-date`},F={key:0,class:`letter-tag`},I={class:`letter-preview`},L={class:`letter-footer`},R={class:`letter-year`},z={key:0,class:`favorite-icon`,viewBox:`0 0 24 24`,width:`16`,height:`16`,fill:`var(--color-primary)`,stroke:`none`},B=y(l({__name:`LoveLetterCard`,props:{letter:{}},emits:[`click`],setup(e){let t=e,i=_(()=>{let e=t.letter.content.replace(/\n/g,` `);return e.length>80?e.slice(0,80)+`...`:e}),a=e=>{let t=new Date(e);return`${t.getMonth()+1}月${t.getDate()}日`};return(t,s)=>(r(),p(M,{class:`letter-card`,size:`medium`,title:e.letter.title,onClick:s[0]||=n=>t.$emit(`click`,e.letter.id)},{default:n(()=>[o(`div`,N,[o(`span`,P,m(a(e.letter.date)),1),e.letter.tag?(r(),c(`span`,F,m(e.letter.tag),1)):b(``,!0)]),o(`p`,I,m(i.value),1),o(`div`,L,[o(`span`,R,m(e.letter.year)+`年`,1),e.letter.isFavorite?(r(),c(`svg`,z,[...s[1]||=[o(`path`,{d:`M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z`},null,-1)]])):b(``,!0)])]),_:1},8,[`title`]))}}),[[`__scopeId`,`data-v-db400d98`]]),ee={class:`starry-container`,role:`region`,"aria-label":`年度记忆星光图`},te=[`viewBox`],ne=[`cx`,`cy`,`r`,`opacity`],re={class:`constellation-lines`},ie=[`x1`,`y1`,`x2`,`y2`],ae={class:`stars-group`},oe=[`onMouseenter`,`onClick`],V=[`cx`,`cy`,`r`,`fill`,`opacity`],H=[`cx`,`cy`,`r`,`fill`,`opacity`],U=[`cx`,`cy`,`r`,`fill`,`opacity`,`filter`],W=[`cx`,`cy`,`stroke`],G={class:`month-labels`},K=[`onClick`],q=[`x`,`y`],se=[`x`,`y`,`fill`,`font-weight`],ce=[`x`,`y`],le={class:`svg-tooltip`},ue={class:`tooltip-date`},de={class:`tooltip-preview`},fe={class:`tooltip-count`},pe={class:`progress-section`},me={class:`progress-header`},he={class:`progress-percent`},ge={class:`progress-track`},_e={class:`progress-text`},ve={class:`stats-panel`},ye={class:`stat-item`},be={class:`stat-value`},xe={class:`stat-item`},Se={class:`stat-value`},Ce={key:0,class:`stat-item`},we={class:`stat-value`},Te={key:0,class:`month-filter-hint`},J=800,Y=380,X=y({__name:`StarryNightChart`,props:{letters:{type:Array,default:()=>[]}},emits:[`month-selected`,`date-selected`],setup(e,{emit:n}){let i=e,a=n,l={left:80,right:80,top:40,bottom:50},u=J-l.left-l.right,f=Y-l.top-l.bottom,p=Y/2-20,v=t(null),y=t(null),S=t({x:0,y:0}),C=t(null);function w(e){let t=e%2147483647;return t<=0&&(t+=2147483646),t=t*16807%2147483647,(t-1)/2147483646}function T(e){let t=(e-1)/11;return l.left+t*u}function E(e,t,n){let r=w(t*31+e+n*1e3),i=f/2-20;return p+(r*2-1)*i}function D(e,t){return 3+(Math.min(e/5,1)*.5+Math.min(t/500,1)*.5)*6}function O(e){return e===1?{core:`#C9A8A9`,glowFill:`rgba(201, 168, 169, 0.3)`}:e<=3?{core:`#B8958A`,glowFill:`rgba(184, 149, 138, 0.3)`}:{core:`#A89080`,glowFill:`rgba(169, 144, 128, 0.25)`}}let k=_(()=>{let e={};for(let t of i.letters)t.date&&(e[t.date]||(e[t.date]=[]),e[t.date].push(t));return e}),A=_(()=>{let e=new Date,t=[];for(let[n,r]of Object.entries(k.value)){let[i,a,o]=n.split(`-`),s=parseInt(i),c=parseInt(a),l=parseInt(o);if(s>e.getFullYear()||s===e.getFullYear()&&c>e.getMonth()+1||s===e.getFullYear()&&c===e.getMonth()+1&&l>e.getDate())continue;let u=T(c),d=E(l,c,s),f=Math.max(...r.map(e=>(e.content||``).length)),p=D(r.length,f),m=O(r.length),h=r[0].title?r[0].title.slice(0,16)+(r[0].title.length>16?`…`:``):(r[0].content||``).slice(0,16)+`…`,g=s===2025?.65:.9;t.push({key:n,x:u,y:d,size:p,r:p,outerR:p*2,middleR:p*1.2,coreR:p*.4,coreColor:m.core,glowFill:m.glowFill,opacity:g,year:s,month:c,day:l,count:r.length,preview:h,hovered:!1,animationDelay:w(s*1e3+c*31+l)})}return t}),j=_(()=>{let e=[];for(let t=0;t<35;t++){let n=t*137;e.push({id:t,x:w(n)*J,y:w(n+1)*Y,r:.3+w(n+2)*.6,opacity:.1+w(n+3)*.2,delay:w(n+4)*5})}return e}),M=_(()=>{let e=[],t=[...A.value].sort((e,t)=>e.year-t.year||e.month-t.month||e.day-t.day),n={};for(let e of t)n[e.month]||(n[e.month]=[]),n[e.month].push(e);for(let t=1;t<12;t++){let r=n[t],i=n[t+1];if(r&&i){let t=r[r.length-1],n=i[0];e.push({x1:t.x,y1:t.y,x2:n.x,y2:n.y})}}return e});function N(e){return{x:T(e),y:Y-l.bottom/2+5}}let P=_(()=>{if(!i.letters||i.letters.length===0)return{percentage:0,count:0,total:365};let e=new Set;for(let t of i.letters)if(t.date){let n=new Date(t.date);if(!isNaN(n.getTime())){let t=n.toISOString().split(`T`)[0];e.add(t)}}let t=e.size;return{percentage:Math.min(Math.round(t/365*100),100),count:t,total:365}}),F=_(()=>i.letters.length),I=_(()=>new Set(A.value.map(e=>e.month)).size),L=_(()=>{if(A.value.length===0)return null;let e=[...A.value].sort((e,t)=>e.year-t.year||e.month-t.month||e.day-t.day),t=1,n=1;for(let r=1;r<e.length;r++){let i=new Date(e[r-1].year,e[r-1].month-1,e[r-1].day);(new Date(e[r].year,e[r].month-1,e[r].day)-i)/(1e3*60*60*24)==1?(n++,t=Math.max(t,n)):n=1}return{maxStreak:t}});function R(e,t){y.value={...e,hovered:!0},S.value={x:e.x,y:e.y},v.value=e.month}function z(){y.value=null}function B(e){a(`date-selected`,e.key),a(`month-selected`,e.month)}function X(e){v.value===e?Z():(v.value=e,a(`month-selected`,e))}function Z(){v.value=null,a(`month-selected`,null)}function Q(){y.value=null}return(e,t)=>(r(),c(`div`,ee,[t[7]||=o(`div`,{class:`nebula-bg`},null,-1),t[8]||=o(`div`,{class:`header-area`},[o(`h3`,{class:`card-title`},`✨ 时间脉络`),o(`p`,{class:`card-subtitle`},`每一个写下情书的日子，都是星空里闪亮的一颗星`)],-1),o(`div`,{class:`chart-area`,ref_key:`chartAreaRef`,ref:C},[(r(),c(`svg`,{class:`stars-canvas`,viewBox:`0 0 ${J} ${Y}`,xmlns:`http://www.w3.org/2000/svg`,onMouseleave:Q},[t[0]||=g(`<defs data-v-00ba834a><radialGradient id="star-glow-soft" cx="50%" cy="50%" r="50%" data-v-00ba834a><stop offset="0%" stop-color="#C9A8A9" stop-opacity="0.8" data-v-00ba834a></stop><stop offset="50%" stop-color="#C9A8A9" stop-opacity="0.3" data-v-00ba834a></stop><stop offset="100%" stop-color="#C9A8A9" stop-opacity="0" data-v-00ba834a></stop></radialGradient><radialGradient id="star-glow-bright" cx="50%" cy="50%" r="50%" data-v-00ba834a><stop offset="0%" stop-color="#A89080" stop-opacity="1" data-v-00ba834a></stop><stop offset="30%" stop-color="#C9A8A9" stop-opacity="0.5" data-v-00ba834a></stop><stop offset="100%" stop-color="#D8C4B6" stop-opacity="0" data-v-00ba834a></stop></radialGradient><filter id="star-glow-filter" x="-100%" y="-100%" width="300%" height="300%" data-v-00ba834a><feGaussianBlur stdDeviation="3" result="blur" data-v-00ba834a></feGaussianBlur><feMerge data-v-00ba834a><feMergeNode in="blur" data-v-00ba834a></feMergeNode><feMergeNode in="SourceGraphic" data-v-00ba834a></feMergeNode></feMerge></filter><filter id="star-glow-strong" x="-150%" y="-150%" width="400%" height="400%" data-v-00ba834a><feGaussianBlur stdDeviation="6" result="blur" data-v-00ba834a></feGaussianBlur><feMerge data-v-00ba834a><feMergeNode in="blur" data-v-00ba834a></feMergeNode><feMergeNode in="blur" data-v-00ba834a></feMergeNode><feMergeNode in="SourceGraphic" data-v-00ba834a></feMergeNode></feMerge></filter></defs>`,1),o(`rect`,{width:J,height:Y,fill:`rgba(201, 168, 169, 0.03)`,rx:`16`}),(r(!0),c(d,null,x(j.value,e=>(r(),c(`circle`,{key:`bg-`+e.id,cx:e.x,cy:e.y,r:e.r,opacity:e.opacity,fill:`#C9A8A9`,class:`bg-star`,style:s({animationDelay:e.delay+`s`})},null,12,ne))),128)),o(`g`,re,[(r(!0),c(d,null,x(M.value,(e,t)=>(r(),c(`line`,{key:`const-`+t,x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2,stroke:`#D8C4B6`,"stroke-width":`0.5`,"stroke-dasharray":`2 4`,opacity:`0.3`},null,8,ie))),128))]),o(`g`,ae,[(r(!0),c(d,null,x(A.value,(e,t)=>(r(),c(`g`,{key:e.key,class:`star-wrapper`,style:s([{"--i":t,"--delay":e.animationDelay+`s`},{cursor:`pointer`}]),onMouseenter:t=>R(e,t),onMouseleave:z,onClick:t=>B(e)},[o(`circle`,{cx:e.x,cy:e.y,r:e.outerR,fill:e.glowFill,opacity:e.hovered?.4:.15,class:`star-outer-glow`},null,8,V),o(`circle`,{cx:e.x,cy:e.y,r:e.middleR,fill:e.glowFill,opacity:e.hovered?.6:.25,class:`star-middle-glow`},null,8,H),o(`circle`,{cx:e.x,cy:e.y,r:e.coreR,fill:e.coreColor,opacity:e.hovered?1:e.opacity,filter:e.hovered?`url(#star-glow-strong)`:e.count>=4?`url(#star-glow-filter)`:`none`,class:`star-core`},null,8,U),e.hovered?(r(),c(`circle`,{key:0,cx:e.x,cy:e.y,r:`4`,fill:`none`,stroke:e.coreColor,"stroke-width":`0.8`,class:`ripple-ring`},null,8,W)):b(``,!0)],44,oe))),128))]),o(`g`,G,[(r(),c(d,null,x(12,e=>o(`g`,{key:`ml-`+e,onClick:t=>X(e),style:{cursor:`pointer`}},[o(`rect`,{x:N(e).x-16,y:N(e).y-10,width:`32`,height:`20`,fill:`transparent`,rx:`4`},null,8,q),o(`text`,{x:N(e).x,y:N(e).y,class:`month-label-text`,"text-anchor":`middle`,"dominant-baseline":`central`,fill:v.value===e?`#A89080`:`rgba(90, 90, 90, 0.5)`,"font-weight":v.value===e?`600`:`400`},m(e)+`月`,9,se)],8,K)),64))]),y.value?(r(),c(`foreignObject`,{key:0,x:S.value.x-90,y:S.value.y-80,width:`180`,height:`80`,style:{overflow:`visible`,"pointer-events":`none`}},[o(`div`,le,[o(`div`,ue,m(y.value.year)+`年`+m(y.value.month)+`月`+m(y.value.day)+`日`,1),o(`div`,de,m(y.value.preview),1),o(`div`,fe,m(y.value.count)+`封情书`,1)])],8,ce)):b(``,!0)],40,te))],512),t[9]||=o(`div`,{class:`divider`},null,-1),o(`div`,pe,[o(`div`,me,[t[1]||=o(`span`,{class:`progress-title`},`记忆星辰点亮度`,-1),o(`span`,he,m(P.value.percentage)+`%`,1)]),o(`div`,ge,[o(`div`,{class:`progress-fill`,style:s({width:P.value.percentage+`%`})},null,4)]),o(`div`,_e,` 已点亮 `+m(P.value.count)+` / `+m(P.value.total)+` 个日夜 `,1)]),o(`div`,ve,[o(`div`,ye,[t[3]||=o(`span`,{class:`stat-label`},`记录月份`,-1),o(`span`,be,[h(m(I.value),1),t[2]||=o(`span`,{class:`stat-unit`},`/12`,-1)])]),o(`div`,xe,[t[4]||=o(`span`,{class:`stat-label`},`星光总数`,-1),o(`span`,Se,m(F.value),1)]),L.value?(r(),c(`div`,Ce,[t[6]||=o(`span`,{class:`stat-label`},`最长连续`,-1),o(`span`,we,[h(m(L.value.maxStreak),1),t[5]||=o(`span`,{class:`stat-unit`},`天`,-1)])])):b(``,!0)]),v.value===null?b(``,!0):(r(),c(`div`,Te,[o(`span`,null,`📅 正在查看 `+m(v.value)+` 月的情书`,1),o(`button`,{class:`clear-month-btn`,onClick:Z},`清除筛选`)]))]))}},[[`__scopeId`,`data-v-00ba834a`]]),Z={class:`letters-page page-container`},Q={class:`page-header`},Ee={class:`page-title`},De={class:`count`},Oe={class:`filters`},ke=[`value`],Ae={class:`search-box`},je=[`disabled`],Me={class:`ebook-picker`},Ne={class:`picker-header`},Pe={class:`picker-years`},$=[`onClick`],Fe={key:0,class:`filter-hint`},Ie={key:0},Le={key:1},Re={class:`letters-grid`},ze={key:1,class:`empty-state`},Be={key:0},Ve={key:1},He={key:2},Ue=y(l({__name:`Letters`,setup(n){let i=w(),s=T(),l=t(`all`),g=t(`all`),v=t(``),y=t(null),O=t(!1),k=_(()=>{let e=s.letters;if(y.value!==null)return e=e.filter(e=>e.date===y.value),e;if(l.value!==`all`&&(e=e.filter(e=>e.year===Number(l.value))),g.value!==`all`&&(e=e.filter(e=>{let t=e.date.split(`-`);return(t[1]?parseInt(t[1]):0)===Number(g.value)})),v.value.trim()){let t=v.value.toLowerCase();e=e.filter(e=>e.title.toLowerCase().includes(t)||e.content.toLowerCase().includes(t))}return e}),A=e=>{i.push(`/letters/${e}`)},j=e=>{e===null?y.value=null:(y.value=e.date,l.value=`all`,g.value=`all`,v.value=``)},M=e=>{e==null?g.value=`all`:(g.value=String(e),y.value=null,v.value=``)},N=()=>{y.value=null,l.value=`all`,g.value=`all`,v.value=``},P=e=>{let t=s.letters.filter(t=>t.year===e).sort((e,t)=>new Date(e.date).getTime()-new Date(t.date).getTime());if(t.length===0){alert(`${e}年暂无情书记录`);return}let n=e=>{let t=e.split(`-`);return`${t[0]}年${Number(t[1])}月${Number(t[2])}日`},r=e=>{let t=e.trim();if(t.length===0)return e;let n=[`亲爱的`,`致`,`Hi`,`你好`,`宝贝`],r=0;for(let e of n)if(t.startsWith(e)){r=e.length;break}return`<span class="drop-cap">${t[r]}</span>${t.slice(r+1)}`},i=t.map((e,i)=>`
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
  /* ============================================
     A5 出版物级电子书样式 v3
     - @page margin:0 解决白边问题
     - CSS counter 分层控制页码
     - 封面无页码、目录罗马数字、正文从 1 开始
     ============================================ */

  /* ---------- @page 核心规则 ---------- */
  @page {
    size: A5 portrait;
    margin: 0;
  }
  /* 封面页：无页码 */
  @page :first {
    margin: 0;
  }

  /* ---------- 打印行为 ---------- */
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .no-print, .print-toolbar { display: none !important; }
    .letter-page { page-break-inside: avoid; }
    .page-break { page-break-before: always; }
    .cover { page-break-after: always; }
    .toc { page-break-after: always; }
    .colophon { page-break-before: always; }
    /* 打印时显示页码，隐藏模拟页码 */
    .page-num-print { display: block !important; }
  }

  /* ---------- 屏幕：隐藏打印页码 ---------- */
  @media screen {
    .page-num-print { display: none; }
  }

  /* ---------- 页码：CSS counter 分层控制 ---------- */
  /* 目录页：罗马数字 (i, ii, iii...) */
  .toc {
    counter-reset: toc-page;
  }
  .toc .page-num-print {
    position: absolute;
    bottom: 12mm;
    left: 0; right: 0;
    text-align: center;
    counter-increment: toc-page;
    font-family: "Noto Sans SC", sans-serif;
    font-size: 8pt;
    color: #A8A8A8;
  }
  .toc .page-num-print::after {
    content: counter(toc-page, lower-roman);
  }

  /* 正文容器：重置页码计数器，从 1 开始 */
  .content-body {
    counter-reset: page 1;
  }
  .letter-page .page-num-print {
    position: absolute;
    bottom: 12mm;
    left: 0; right: 0;
    text-align: center;
    counter-increment: page;
    font-family: "Noto Sans SC", sans-serif;
    font-size: 8pt;
    color: #A8A8A8;
  }
  .letter-page .page-num-print::after {
    content: counter(page);
  }

  /* 尾页：继续正文页码 */
  .colophon .page-num-print {
    position: absolute;
    bottom: 12mm;
    left: 0; right: 0;
    text-align: center;
    counter-increment: page;
    font-family: "Noto Sans SC", sans-serif;
    font-size: 8pt;
    color: #A8A8A8;
  }
  .colophon .page-num-print::after {
    content: counter(page);
  }

  /* ---------- 全局重置 ---------- */
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 148mm;
    margin: 0 auto;
    background: #FEFBF6;
    color: #3A3A3A;
    font-family: "Noto Serif SC", "Ma Shan Zheng", "Source Han Serif SC", serif;
    font-size: 11pt;
    line-height: 1.8;
    -webkit-font-smoothing: antialiased;
  }

  /* ---------- 打印工具栏（仅屏幕显示） ---------- */
  .print-toolbar {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 9999;
    background: linear-gradient(135deg, #FDF6EC, #FFF5F5);
    border-bottom: 1px solid #E8D4C8;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    font-family: "Noto Sans SC", sans-serif;
    box-shadow: 0 2px 12px rgba(184,151,154,0.18);
  }
  .print-tips-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }
  .print-toolbar .tips-icon { font-size: 16px; flex-shrink: 0; }
  .print-tips-bar span:last-child {
    font-size: 12.5px; color: #7A6058; white-space: nowrap;
  }

  /* ---------- 封面 ---------- */
  .cover {
    height: 210mm;
    padding: 20mm;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: #FEFBF6;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
  }
  .cover::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 20% 30%, rgba(201,168,169,0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(216,196,182,0.10) 0%, transparent 50%);
    pointer-events: none;
  }
  .cover-ornament { font-size: 48px; margin-bottom: 36px; position: relative; }
  .cover-year {
    font-family: "Ma Shan Zheng", "Noto Serif SC", serif;
    font-size: 48pt; font-weight: 400;
    color: #B8979A;
    letter-spacing: 4px; line-height: 1.1;
    margin-bottom: 12px; position: relative;
  }
  .cover-subtitle {
    font-family: "Noto Serif SC", serif;
    font-size: 14pt; color: #9A7A7C;
    font-style: italic; margin-bottom: 32px; position: relative;
  }
  .cover-divider {
    width: 60px; height: 1px;
    background: linear-gradient(90deg, transparent, #C9A8A9, transparent);
    margin-bottom: 20px; position: relative;
  }
  .cover-meta {
    font-family: "Noto Sans SC", sans-serif;
    font-size: 10pt; color: #A8A8A8; position: relative;
  }
  .cover-count {
    display: inline-block; margin-top: 16px;
    padding: 6px 20px;
    border: 1px solid rgba(201,168,169,0.4);
    border-radius: 20px;
    font-family: "Noto Sans SC", sans-serif;
    font-size: 9pt; color: #B8979A;
    background: rgba(201,168,169,0.06);
    position: relative;
  }

  /* ---------- 目录 ---------- */
  .toc {
    padding: 20mm 20mm 15mm 20mm;
    position: relative;
    min-height: 210mm;
    box-sizing: border-box;
  }
  .toc-title {
    font-family: "Noto Sans SC", sans-serif;
    font-weight: 700; font-size: 16pt;
    color: #B8979A;
    text-align: center;
    margin-bottom: 8mm;
    letter-spacing: 4px;
  }
  .toc-entry {
    display: flex; align-items: baseline;
    padding: 7px 0; gap: 6px;
  }
  .toc-num {
    font-family: "Noto Sans SC", sans-serif;
    font-size: 9pt; color: #C9A8A9;
    min-width: 28px; flex-shrink: 0;
  }
  .toc-name {
    font-family: "Noto Serif SC", serif;
    font-size: 10.5pt; color: #4A4A4A;
    flex-shrink: 0;
  }
  .toc-dots {
    flex: 1; font-size: 8pt;
    color: #D5CFC8;
    letter-spacing: 2px;
    overflow: hidden; white-space: nowrap;
  }
  .toc-date {
    font-family: "Noto Sans SC", sans-serif;
    font-size: 8.5pt; color: #A8A8A8;
    flex-shrink: 0;
  }

  /* ---------- 正文容器 ---------- */
  .content-body {
    /* counter-reset: page 1; 已在上方 CSS 定义 */
  }

  /* ---------- 正文页 ---------- */
  .letter-page {
    padding: 20mm 20mm 18mm 20mm;
    min-height: 210mm;
    position: relative;
    box-sizing: border-box;
    page-break-inside: avoid;
  }
  .page-break { page-break-before: always; }

  /* 日期抬头 */
  .letter-date-head {
    display: flex; align-items: center;
    justify-content: center;
    gap: 12px; margin-bottom: 6mm;
  }
  .date-line {
    flex: 0 0 40px; height: 1px;
    background: linear-gradient(90deg, transparent, #D5CFC8);
  }
  .date-line:last-child {
    background: linear-gradient(90deg, #D5CFC8, transparent);
  }
  .date-text {
    font-family: "Noto Sans SC", sans-serif;
    font-size: 9pt; color: #A8A8A8;
    letter-spacing: 1px; white-space: nowrap;
  }

  /* 信件标题 */
  .letter-title {
    font-family: "Noto Serif SC", serif;
    font-weight: 700; font-size: 13pt;
    color: #4A4A4A;
    text-align: center;
    margin-bottom: 6mm; line-height: 1.5;
  }

  /* 信件正文 + 首字下沉 */
  .letter-body {
    font-family: "Noto Serif SC", "Ma Shan Zheng", serif;
    font-size: 11pt; line-height: 1.9;
    color: #3A3A3A;
    text-align: justify;
    text-indent: 0;
  }
  .drop-cap {
    font-family: "Ma Shan Zheng", "Noto Serif SC", serif;
    font-size: 2.4em; line-height: 1;
    float: left;
    margin-right: 6px; margin-top: 2px;
    color: #B8979A; font-weight: 400;
  }

  /* ---------- 尾页 ---------- */
  .colophon {
    height: 210mm;
    padding: 20mm;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    position: relative;
    box-sizing: border-box;
    background: #FEFBF6;
  }
  .colophon-flower { font-size: 28px; margin-bottom: 16px; }
  .colophon-text {
    font-family: "Noto Serif SC", serif;
    font-size: 11pt; color: #A8A8A8;
    margin-bottom: 8px;
  }
  .colophon-italic {
    font-family: "Noto Serif SC", serif;
    font-style: italic;
    font-size: 10pt; color: #C9A8A9;
  }

  /* ---------- 屏幕预览 ---------- */
  @media screen {
    html, body {
      box-shadow: 0 0 40px rgba(100,80,75,0.10);
    }
    .cover, .colophon { min-height: 210mm; height: auto; }
  }
</style>
</head>
<body>
  <!-- 封面（无页码，@page :first 控制） -->
  <div class="cover">
    <div class="cover-ornament">💌</div>
    <div class="cover-year">${e}</div>
    <div class="cover-subtitle">年度情书集</div>
    <div class="cover-divider"></div>
    <div class="cover-meta">我们的故事，一字一句，都是爱</div>
    <div class="cover-count">共 ${t.length} 封情书</div>
  </div>

  <!-- 目录（罗马数字页码，由 CSS counter 自动生成） -->
  <div class="toc">
    <div class="toc-title">— 目 录 —</div>
    ${a}
    <!-- 页码由 CSS 生成，打印时显示在底部居中 -->
    <div class="page-num-print"></div>
  </div>

  <!-- 正文（阿拉伯数字页码，从 1 开始） -->
  <div class="content-body">
    ${i}
  </div>

  <!-- 尾页（继续正文页码） -->
  <div class="colophon">
    <div class="page-num-print"></div>
    <div class="colophon-flower">🌸</div>
    <div class="colophon-text">这是我们 ${e} 年的故事</div>
    <div class="colophon-italic">每一个字，都满载着爱</div>
  </div>

  <!-- 屏幕操作栏 -->
  <div class="print-toolbar">
    <div class="print-tips-bar">
      <span class="tips-icon">💡</span>
      <span>打印时请关闭「页眉和页脚」→ 选「保存为 PDF」</span>
    </div>
    <button onclick="window.print()" style="padding:8px 18px;background:#B8979A;color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-family:'Noto Sans SC',sans-serif;box-shadow:0 3px 10px rgba(184,151,154,0.35);white-space:nowrap">
      &#x1F5A8;&#xFE0F; 打印 / PDF
    </button>
    <button onclick="document.querySelector('.print-toolbar').style.display='none'" style="padding:8px 12px;background:#F0EBE6;color:#9A7A7C;border:none;border-radius:8px;font-size:13px;cursor:pointer;">
      &#x2715;
    </button>
  </div>
</body>
</html>`,c=new Blob([o],{type:`text/html;charset=utf-8`}),l=URL.createObjectURL(c);window.open(l,`_blank`)};return S(()=>{s.letters.length===0&&s.loadLetters()}),(t,n)=>(r(),c(`div`,Z,[o(`div`,Q,[o(`h2`,Ee,[n[5]||=h(` 情书馆 `,-1),o(`span`,De,`(`+m(k.value.length)+`)`,1)]),o(`div`,Oe,[f(o(`select`,{"onUpdate:modelValue":n[0]||=e=>l.value=e,class:`filter-select`},[n[6]||=o(`option`,{value:`all`},`全部年份`,-1),(r(!0),c(d,null,x(e(s).letterYears,e=>(r(),c(`option`,{key:e,value:e},m(e)+`年 `,9,ke))),128))],512),[[E,l.value]]),o(`div`,Ae,[f(o(`input`,{"onUpdate:modelValue":n[1]||=e=>v.value=e,type:`text`,placeholder:`搜索情书...`,class:`search-input`},null,512),[[C,v.value]]),n[7]||=o(`svg`,{class:`search-icon`,viewBox:`0 0 24 24`,width:`18`,height:`18`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[o(`circle`,{cx:`11`,cy:`11`,r:`8`}),o(`path`,{d:`M21 21l-4.35-4.35`})],-1)]),o(`button`,{class:`ebook-btn-sm`,onClick:n[2]||=e=>O.value=!0,disabled:e(s).letterYears.length===0,title:`生成年度电子书`},[...n[8]||=[o(`svg`,{viewBox:`0 0 24 24`,width:`15`,height:`15`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[o(`path`,{d:`M4 19.5A2.5 2.5 0 0 1 6.5 17H20`}),o(`path`,{d:`M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z`})],-1),h(` 电子书 `,-1)]],8,je)]),(r(),p(a,{to:`body`},[O.value?(r(),c(`div`,{key:0,class:`ebook-overlay`,onClick:n[4]||=D(e=>O.value=!1,[`self`])},[o(`div`,Me,[o(`div`,Ne,[n[9]||=o(`span`,null,`📖 选择年份`,-1),o(`button`,{class:`picker-close`,onClick:n[3]||=e=>O.value=!1},`×`)]),o(`div`,Pe,[(r(!0),c(d,null,x(e(s).letterYears,e=>(r(),c(`button`,{key:e,class:`picker-year-btn`,onClick:t=>{P(e),O.value=!1}},m(e)+`年 `,9,$))),128))])])])):b(``,!0)]))]),u(X,{letters:e(s).letters,onDateSelected:j,onMonthSelected:M},null,8,[`letters`]),y.value!==null||l.value!==`all`||g.value!==`all`?(r(),c(`div`,Fe,[y.value===null?(r(),c(`span`,Le,[n[10]||=h(` 正在查看 `,-1),l.value===`all`?b(``,!0):(r(),c(d,{key:0},[h(m(l.value)+`年`,1)],64)),g.value===`all`?b(``,!0):(r(),c(d,{key:1},[h(m(g.value)+`月`,1)],64)),n[11]||=h(` 的情书 `,-1)])):(r(),c(`span`,Ie,`📅 正在查看 `+m(y.value)+` 的情书`,1)),o(`button`,{class:`clear-filter`,onClick:N},`清除筛选`)])):b(``,!0),o(`div`,Re,[(r(!0),c(d,null,x(k.value,e=>(r(),p(B,{key:e.id,letter:e,onClick:t=>A(e.id)},null,8,[`letter`,`onClick`]))),128))]),k.value.length===0?(r(),c(`div`,ze,[y.value===null?l.value!==`all`||g.value!==`all`?(r(),c(`p`,Ve,m(l.value===`all`?``:l.value+`年`)+m(g.value===`all`?``:g.value+`月`)+`暂无情书记录 `,1)):(r(),c(`p`,He,`暂无情书，写下第一封吧 💌`)):(r(),c(`p`,Be,`这一天还没有情书记录`))])):b(``,!0)]))}}),[[`__scopeId`,`data-v-6ea9d5ae`]]);export{Ue as default};
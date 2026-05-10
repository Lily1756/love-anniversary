import{A as e,C as t,E as n,P as r,R as i,S as a,T as o,U as s,a as c,c as l,ct as u,d,g as f,h as p,i as m,k as h,l as g,lt as _,m as v,s as y,t as b,u as x,ut as S,x as C}from"./_plugin-vue_export-helper-C9n2igPn.js";import{c as w,i as T,n as ee,s as E,u as D}from"./index-Ec9A01Rj.js";import{t as O}from"./Modal-DuiGBdoA.js";import{n as k,r as A,t as j}from"./useDebouncedSave-SOZResJl.js";var M={key:0,class:`card-header`},N={class:`card-title`},P={class:`card-body`},F={key:1,class:`card-footer`},I=b(f({__name:`Card`,props:{size:{default:`medium`},shadow:{type:Boolean,default:!0},hoverable:{type:Boolean,default:!0},title:{},backgroundColor:{default:`var(--bg-container)`}},setup(e){let r={backgroundColor:e.backgroundColor};return(i,a)=>(t(),d(`div`,{class:u([`m-card`,[`size-${e.size}`,{"has-shadow":e.shadow,"is-hoverable":e.hoverable}]]),style:r},[i.$slots.header||e.title?(t(),d(`div`,M,[n(i.$slots,`header`,{},()=>[l(`h3`,N,S(e.title),1)],!0)])):x(``,!0),l(`div`,P,[n(i.$slots,`default`,{},void 0,!0)]),i.$slots.footer?(t(),d(`div`,F,[n(i.$slots,`footer`,{},void 0,!0)])):x(``,!0)],2))}}),[[`__scopeId`,`data-v-1834c394`]]),L={class:`letter-meta`},R={class:`letter-date`},z={key:0,class:`letter-tag`},B={class:`letter-preview`},V={class:`letter-footer`},H={class:`letter-year`},U={key:0,class:`favorite-icon`,viewBox:`0 0 24 24`,width:`16`,height:`16`,fill:`var(--color-primary)`,stroke:`none`},te=b(f({__name:`LoveLetterCard`,props:{letter:{}},emits:[`click`],setup(e){let n=e,r=y(()=>{let e=n.letter.content.replace(/\n/g,` `);return e.length>80?e.slice(0,80)+`...`:e}),i=e=>{let t=new Date(e);return`${t.getMonth()+1}月${t.getDate()}日`};return(n,a)=>(t(),g(I,{class:`letter-card`,size:`medium`,title:e.letter.title,onClick:a[0]||=t=>n.$emit(`click`,e.letter.id)},{default:h(()=>[l(`div`,L,[l(`span`,R,S(i(e.letter.date)),1),e.letter.tag?(t(),d(`span`,z,S(e.letter.tag),1)):x(``,!0)]),l(`p`,B,S(r.value),1),l(`div`,V,[l(`span`,H,S(e.letter.year)+`年`,1),e.letter.isFavorite?(t(),d(`svg`,U,[...a[1]||=[l(`path`,{d:`M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z`},null,-1)]])):x(``,!0)])]),_:1},8,[`title`]))}}),[[`__scopeId`,`data-v-db400d98`]]),W={class:`starry-container`,role:`region`,"aria-label":`年度记忆星光图`},G={class:`galaxy-canvas`},K=[`onMouseenter`],q=[`data-count`,`onMouseenter`,`onClick`],J={class:`tooltip-title`},Y={class:`tooltip-meta`},X={class:`tooltip-excerpt`},Z={class:`tooltip-month`},Q={class:`tooltip-count`},$={key:0,class:`tooltip-hint`},ne={key:1,class:`tooltip-hint`},re={class:`progress-section`},ie={class:`progress-header`},ae={class:`progress-percent`},oe={class:`progress-track`},se={class:`progress-text`},ce={class:`stats-panel`},le={class:`stat-item`},ue={class:`stat-value`},de={class:`stat-item`},fe={class:`stat-value`},pe={key:0,class:`stat-item`},me={class:`stat-value`},he={key:0,class:`month-filter-hint`},ge=b({__name:`StarryNightChart`,props:{letters:{type:Array,default:()=>[]}},emits:[`month-selected`,`date-selected`],setup(e,{emit:n}){let r=e,s=n,c=i(null),f=i({width:800,height:320}),p=i(null),h=i(null),g=i(null),b=i({}),w=y(()=>{let e={};for(let t=1;t<=12;t++)e[t]={count:0,letters:[]};for(let t of r.letters)if(t.date){let n=parseInt(t.date.split(`-`)[1]);n>=1&&n<=12&&(e[n].count++,e[n].letters.push({id:t.id||`${t.date}-${t.title}`,title:t.title||`Untitled`,date:t.date,weather:t.weather||`晴`,excerpt:t.excerpt||t.content?.substring(0,50)||`暂无摘要...`}))}return e}),T=y(()=>{let e=f.value.width,t=f.value.height,n=[];return Array.from({length:12},(r,i)=>{let a=i+1,o=w.value[a]||{count:0,letters:[]},s=o.count,c=o.letters,l=E(a,e,t,n);return n.push(l),{month:a,count:s,letters:c,corePosition:l,satellites:D(c,l,e,t),coreSize:k(s),coreBrightness:A(s)}})}),ee=y(()=>{let e=[];for(let t=0;t<T.value.length-1;t++){let n=T.value[t],r=T.value[t+1];if(n.count>0&&r.count>0){let t=Math.sqrt((r.corePosition.x-n.corePosition.x)**2+(r.corePosition.y-n.corePosition.y)**2),i=Math.atan2(r.corePosition.y-n.corePosition.y,r.corePosition.x-n.corePosition.x)*(180/Math.PI);e.push({style:{left:`${n.corePosition.x}px`,top:`${n.corePosition.y}px`,width:`${t}px`,transform:`rotate(${i}deg)`,opacity:.3}})}}return e});function E(e,t,n,r){let i=e/13*t,a=t/13*.2,o=i+(Math.random()*2-1)*a,s=n*.6,c=n*.2+Math.random()*s,l=0;for(;l<50;){let e=!1;for(let t of r){let n=t.x-o,r=t.y-c;if(Math.sqrt(n*n+r*r)<80){let i=Math.atan2(r,n);o=t.x+Math.cos(i)*80,c=t.y+Math.sin(i)*80,e=!0;break}}if(!e)break;l++}return o=Math.max(50,Math.min(t-50,o)),c=Math.max(50,Math.min(n-50,c)),{x:o,y:c}}function D(e,t,n,r){if(!e||e.length===0)return[];let i=[];for(let a=0;a<e.length;a++){let o=e[a],s=30+Math.random()*30,c=20+Math.random()*20,l=a*2*Math.PI/e.length+(Math.random()*.5-.25),u=t.x+Math.cos(l)*s,d=t.y+Math.sin(l)*c,f=0;for(;f<30;){let e=!1;for(let t of i){let n=t.x-u,r=t.y-d,i=Math.sqrt(n*n+r*r);if(i<15){let t=Math.atan2(r,n),a=15-i+5;u+=Math.cos(t+Math.PI)*a,d+=Math.sin(t+Math.PI)*a,e=!0}}if(!e)break;f++}u=Math.max(10,Math.min(n-10,u)),d=Math.max(10,Math.min(r-10,d));let p=8+Math.random()*4;i.push({id:o.id,x:u,y:d,size:p,title:o.title,date:o.date,weather:o.weather,excerpt:o.excerpt})}return i}function O(e,t){return g.value?g.value.month===e&&g.value.id!==t?.8:(g.value.month,.6):.6}function k(e){return e===0?20:e<=3?24:e<=6?28:32}function A(e){return e===0?.3:e<=3?.7:e<=6?.85:1}function j(e){return e===0?`0`:e<=3?`1-3`:e<=6?`4-6`:`7+`}let M=y(()=>{if(!r.letters||r.letters.length===0)return{percentage:0,count:0,total:365};let e=new Set;for(let t of r.letters)if(t.date){let n=new Date(t.date);if(!isNaN(n.getTime())){let t=n.toISOString().split(`T`)[0];e.add(t)}}let t=e.size;return{percentage:Math.min(Math.round(t/365*100),100),count:t,total:365}}),N=y(()=>r.letters.length),P=y(()=>Object.entries(w.value).filter(([e,t])=>t.count>0).length),F=y(()=>{if(!r.letters||r.letters.length===0)return null;let e=[...new Set(r.letters.map(e=>e.date).filter(Boolean))].map(e=>new Date(e)).sort((e,t)=>e-t);if(e.length===0)return null;let t=1,n=1;for(let r=1;r<e.length;r++)(e[r]-e[r-1])/(1e3*60*60*24)==1?(n++,t=Math.max(t,n)):n=1;return{maxStreak:t}});function I(e){if(g.value)return;h.value=e;let t=e.corePosition.x+20,n=e.corePosition.y-40;b.value={left:`${t}px`,top:`${n}px`},p.value=e.month}function L(){g.value||(h.value=null)}function R(e){p.value===e.month?V():(p.value=e.month,s(`month-selected`,e.month))}function z(e,t){g.value={...t,month:e},h.value=null;let n=t.x+15,r=t.y-10;b.value={left:`${n}px`,top:`${r}px`}}function B(){g.value=null}function V(){p.value=null,s(`month-selected`,null)}function H(){c.value&&(f.value={width:c.value.offsetWidth,height:c.value.offsetHeight||320})}return C(()=>{H(),window.addEventListener(`resize`,H)}),a(()=>{window.removeEventListener(`resize`,H)}),(e,n)=>(t(),d(`div`,W,[n[8]||=l(`div`,{class:`title-section`},[l(`div`,{class:`header-area`},[l(`h3`,{class:`card-title`},`✨ 时间脉络`),l(`p`,{class:`card-subtitle`},`每一个写下情书的日子，都是星空里闪亮的一颗星`)])],-1),l(`div`,{class:`visualization-wrapper`,ref_key:`canvasRef`,ref:c},[n[1]||=l(`div`,{class:`nebula-background`},null,-1),l(`div`,G,[(t(!0),d(m,null,o(ee.value,(e,n)=>(t(),d(`div`,{key:`conn-${n}`,class:`galaxy-connection`,style:_(e.style)},null,4))),128)),(t(!0),d(m,null,o(T.value,e=>(t(),d(`div`,{key:`satellites-${e.month}`},[(t(!0),d(m,null,o(e.satellites,(n,r)=>(t(),d(`div`,{key:`sat-${e.month}-${r}`,class:u([`satellite-star`,{"is-hovered":g.value&&g.value.id===n.id}]),style:_({left:`${n.x}px`,top:`${n.y}px`,width:`${n.size}px`,height:`${n.size}px`,opacity:O(e.month,n.id),zIndex:g.value&&g.value.id===n.id?100:10}),onMouseenter:t=>z(e.month,n),onMouseleave:B},null,46,K))),128))]))),128)),(t(!0),d(m,null,o(T.value,e=>(t(),d(`div`,{key:`core-${e.month}`,class:`galaxy-core`,style:_({left:`${e.corePosition.x}px`,top:`${e.corePosition.y}px`,fontSize:`${e.coreSize}px`}),"data-count":j(e.count),onMouseenter:t=>I(e),onMouseleave:L,onClick:t=>R(e)},` ★ `,44,q))),128)),g.value?(t(),d(`div`,{key:0,class:`satellite-tooltip`,style:_(b.value)},[n[0]||=l(`div`,{class:`tooltip-icon`},`📝`,-1),l(`div`,J,S(g.value.title),1),l(`div`,Y,S(g.value.date)+` · `+S(g.value.weather),1),l(`div`,X,S(g.value.excerpt),1)],4)):x(``,!0),h.value&&!g.value?(t(),d(`div`,{key:1,class:`galaxy-tooltip`,style:_(b.value)},[l(`div`,Z,S(h.value.month)+`月`,1),l(`div`,Q,S(h.value.count)+` 封情书`,1),h.value.count>0?(t(),d(`div`,$,`点击查看详情`)):(t(),d(`div`,ne,`这个月还没有情书哦`))],4)):x(``,!0)])],512),l(`div`,re,[l(`div`,ie,[n[2]||=l(`span`,{class:`progress-title`},`记忆星辰点亮度`,-1),l(`span`,ae,S(M.value.percentage)+`%`,1)]),l(`div`,oe,[l(`div`,{class:`progress-fill`,style:_({width:M.value.percentage+`%`})},null,4)]),l(`div`,se,` 已点亮 `+S(M.value.count)+` / `+S(M.value.total)+` 个日夜 `,1)]),l(`div`,ce,[l(`div`,le,[n[4]||=l(`span`,{class:`stat-label`},`记录月份`,-1),l(`span`,ue,[v(S(P.value),1),n[3]||=l(`span`,{class:`stat-unit`},`/12`,-1)])]),l(`div`,de,[n[5]||=l(`span`,{class:`stat-label`},`星光总数`,-1),l(`span`,fe,S(N.value),1)]),F.value?(t(),d(`div`,pe,[n[7]||=l(`span`,{class:`stat-label`},`最长连续`,-1),l(`span`,me,[v(S(F.value.maxStreak),1),n[6]||=l(`span`,{class:`stat-unit`},`天`,-1)])])):x(``,!0)]),p.value===null?x(``,!0):(t(),d(`div`,he,[l(`span`,null,`📅 正在查看 `+S(p.value)+` 月的情书`,1),l(`button`,{class:`clear-month-btn`,onClick:V},`清除筛选`)]))]))}},[[`__scopeId`,`data-v-450bc4b2`]]),_e={class:`letters-page page-container`},ve={class:`page-header`},ye={class:`header-row header-row--primary`},be={class:`page-title`},xe={class:`count`},Se={class:`primary-actions`},Ce={class:`header-row header-row--tools`},we={class:`filter-tools`},Te=[`value`],Ee={class:`search-box`},De=[`disabled`],Oe={class:`ebook-picker`},ke={class:`picker-header`},Ae={class:`picker-years`},je=[`onClick`],Me={key:0,class:`filter-hint`},Ne={key:0},Pe={key:1},Fe={class:`letters-grid`},Ie=[`onClick`],Le={key:1,class:`empty-state`},Re={key:0},ze={key:1},Be={key:2},Ve={class:`letter-form`},He={class:`form-group`},Ue={class:`form-group`},We={class:`form-group`},Ge={class:`form-group`},Ke=b(f({__name:`Letters`,setup(n){let a=T(),f=ee(),{isEditMode:_,showAuth:b,authPassword:M,authError:N,openAuthModal:P,verifyAuth:F,exitEditMode:I}=k({password:`2025`}),{saveStatus:L,saveMessage:R,triggerDebouncedSave:z}=j(),B=i(`all`),V=i(`all`),H=i(``),U=i(null),W=i(!1),G=i(!1),K=i(null),q=i({title:``,date:new Date().toISOString().split(`T`)[0]||``,content:``,tag:`日常`,id:void 0}),J=y(()=>{let e=f.letters;if(U.value!==null)return e=e.filter(e=>e.date===U.value),e;if(B.value!==`all`&&(e=e.filter(e=>e.year===Number(B.value))),V.value!==`all`&&(e=e.filter(e=>{let t=e.date.split(`-`);return(t[1]?parseInt(t[1]):0)===Number(V.value)})),H.value.trim()){let t=H.value.toLowerCase();e=e.filter(e=>e.title.toLowerCase().includes(t)||e.content.toLowerCase().includes(t))}return e}),Y=e=>{a.push(`/letters/${e}`)},X=()=>{K.value=null,q.value={title:``,date:new Date().toISOString().split(`T`)[0]||``,content:``,tag:`日常`},G.value=!0},Z=e=>{K.value=e,q.value={title:e.title,date:e.date,content:e.content,tag:e.tag||`日常`},G.value=!0},Q=()=>{if(!q.value.title.trim()){alert(`请输入标题`);return}if(!q.value.content.trim()){alert(`请输入内容`);return}let e=q.value;if(K.value){let t=f.letters.findIndex(e=>e.id===K.value.id);if(t>=0){let n=new Date(e.date||``).getFullYear()||new Date().getFullYear(),r=f.letters,i=r[t];i&&(r[t]={...i,title:e.title.trim(),content:e.content.trim(),date:e.date,tag:e.tag,year:n})}}else{let t=new Date(e.date||``).getFullYear()||new Date().getFullYear();f.letters.push({id:`letter_`+Date.now(),title:e.title.trim(),content:e.content.trim(),date:e.date,tag:e.tag,year:t,isFavorite:!1})}G.value=!1,K.value=null,z(()=>f.saveLetters(`2025`))},$=e=>{if(!confirm(`确定要删除这封情书吗？`))return;let t=f.letters,n=t.findIndex(t=>t.id===e);n>=0&&t.splice(n,1),z(()=>f.saveLetters(`2025`))},ne=e=>{e===null?U.value=null:(U.value=e.date,B.value=`all`,V.value=`all`,H.value=``)},re=e=>{e==null?V.value=`all`:(V.value=String(e),U.value=null,H.value=``)},ie=()=>{U.value=null,B.value=`all`,V.value=`all`,H.value=``},ae=e=>{let t=f.letters.filter(t=>t.year===e).sort((e,t)=>new Date(e.date).getTime()-new Date(t.date).getTime());if(t.length===0){alert(`${e}年暂无情书记录`);return}let n=e=>{let t=e.split(`-`);return`${t[0]}年${Number(t[1])}月${Number(t[2])}日`},r=e=>{let t=e.trim();if(t.length===0)return e;let n=[`亲爱的`,`致`,`Hi`,`你好`,`宝贝`],r=0;for(let e of n)if(t.startsWith(e)){r=e.length;break}return`<span class="drop-cap">${t[r]}</span>${t.slice(r+1)}`},i=t.map((e,i)=>`
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
</html>`,s=new Blob([o],{type:`text/html;charset=utf-8`}),c=URL.createObjectURL(s);window.open(c,`_blank`)};return C(()=>{f.letters.length===0&&f.loadLetters()}),(n,i)=>(t(),d(`div`,_e,[l(`div`,ve,[l(`div`,ye,[l(`h2`,be,[i[15]||=v(` 情书馆 `,-1),l(`span`,xe,`(`+S(J.value.length)+`)`,1)]),l(`div`,Se,[s(_)?(t(),d(m,{key:1},[l(`button`,{class:`add-btn`,onClick:X},[...i[17]||=[l(`svg`,{viewBox:`0 0 24 24`,width:`16`,height:`16`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[l(`line`,{x1:`12`,y1:`5`,x2:`12`,y2:`19`}),l(`line`,{x1:`5`,y1:`12`,x2:`19`,y2:`12`})],-1),v(` 写情书 `,-1)]]),l(`button`,{class:`done-btn`,onClick:i[1]||=(...e)=>s(I)&&s(I)(...e)},`完成`)],64)):(t(),d(`button`,{key:0,class:`edit-btn`,onClick:i[0]||=(...e)=>s(P)&&s(P)(...e)},[...i[16]||=[l(`svg`,{viewBox:`0 0 24 24`,width:`16`,height:`16`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[l(`path`,{d:`M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z`})],-1),v(` 编辑 `,-1)]]))])]),l(`div`,Ce,[l(`div`,we,[e(l(`select`,{"onUpdate:modelValue":i[2]||=e=>B.value=e,class:`filter-select`},[i[18]||=l(`option`,{value:`all`},`全部年份`,-1),(t(!0),d(m,null,o(s(f).letterYears,e=>(t(),d(`option`,{key:e,value:e},S(e)+`年 `,9,Te))),128))],512),[[E,B.value]]),l(`div`,Ee,[e(l(`input`,{"onUpdate:modelValue":i[3]||=e=>H.value=e,type:`text`,placeholder:`搜索情书...`,class:`search-input`},null,512),[[w,H.value]]),i[19]||=l(`svg`,{class:`search-icon`,viewBox:`0 0 24 24`,width:`18`,height:`18`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[l(`circle`,{cx:`11`,cy:`11`,r:`8`}),l(`path`,{d:`M21 21l-4.35-4.35`})],-1)])]),l(`button`,{class:`ebook-btn-sm`,onClick:i[4]||=e=>W.value=!0,disabled:s(f).letterYears.length===0,title:`生成年度电子书`},[...i[20]||=[l(`svg`,{viewBox:`0 0 24 24`,width:`15`,height:`15`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[l(`path`,{d:`M4 19.5A2.5 2.5 0 0 1 6.5 17H20`}),l(`path`,{d:`M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z`})],-1),v(` 电子书 `,-1)]],8,De)])]),(t(),g(c,{to:`body`},[W.value?(t(),d(`div`,{key:0,class:`ebook-overlay`,onClick:i[6]||=D(e=>W.value=!1,[`self`])},[l(`div`,Oe,[l(`div`,ke,[i[21]||=l(`span`,null,`📖 选择年份`,-1),l(`button`,{class:`picker-close`,onClick:i[5]||=e=>W.value=!1},`×`)]),l(`div`,Ae,[(t(!0),d(m,null,o(s(f).letterYears,e=>(t(),d(`button`,{key:e,class:`picker-year-btn`,onClick:t=>{ae(e),W.value=!1}},S(e)+`年 `,9,je))),128))])])])):x(``,!0)])),p(ge,{letters:s(f).letters,onDateSelected:ne,onMonthSelected:re},null,8,[`letters`]),U.value!==null||B.value!==`all`||V.value!==`all`?(t(),d(`div`,Me,[U.value===null?(t(),d(`span`,Pe,[i[22]||=v(` 正在查看 `,-1),B.value===`all`?x(``,!0):(t(),d(m,{key:0},[v(S(B.value)+`年`,1)],64)),V.value===`all`?x(``,!0):(t(),d(m,{key:1},[v(S(V.value)+`月`,1)],64)),i[23]||=v(` 的情书 `,-1)])):(t(),d(`span`,Ne,`📅 正在查看 `+S(U.value)+` 的情书`,1)),l(`button`,{class:`clear-filter`,onClick:ie},`清除筛选`)])):x(``,!0),l(`div`,Fe,[(t(!0),d(m,null,o(J.value,e=>(t(),d(`div`,{key:e.id,class:u([`letter-card-wrapper`,{"edit-mode":s(_)}])},[s(_)?(t(),d(`button`,{key:0,class:`delete-btn`,onClick:t=>$(e.id),title:`删除情书`},[...i[24]||=[l(`svg`,{viewBox:`0 0 24 24`,width:`14`,height:`14`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[l(`path`,{d:`M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2`})],-1)]],8,Ie)):x(``,!0),p(te,{letter:e,onClick:t=>s(_)?Z(e):Y(e.id)},null,8,[`letter`,`onClick`])],2))),128))]),J.value.length===0?(t(),d(`div`,Le,[U.value===null?B.value!==`all`||V.value!==`all`?(t(),d(`p`,ze,S(B.value===`all`?``:B.value+`年`)+S(V.value===`all`?``:V.value+`月`)+`暂无情书记录 `,1)):(t(),d(`p`,Be,`暂无情书，写下第一封吧 💌`)):(t(),d(`p`,Re,`这一天还没有情书记录`))])):x(``,!0),p(A,{modelValue:s(b),"onUpdate:modelValue":i[7]||=e=>r(b)?b.value=e:null,password:s(M),error:s(N),"onUpdate:password":i[8]||=e=>M.value=e,onConfirm:s(F)},null,8,[`modelValue`,`password`,`error`,`onConfirm`]),p(O,{modelValue:G.value,"onUpdate:modelValue":i[14]||=e=>G.value=e,title:K.value?`编辑情书`:`写情书`},{footer:h(()=>[l(`button`,{class:`btn-text`,onClick:i[13]||=e=>G.value=!1},`取消`),l(`button`,{class:`btn-primary`,onClick:Q},`保存`)]),default:h(()=>[l(`div`,Ve,[l(`div`,He,[i[25]||=l(`label`,null,`标题`,-1),e(l(`input`,{"onUpdate:modelValue":i[9]||=e=>q.value.title=e,type:`text`,placeholder:`给这封情书起个名字...`,maxlength:`50`},null,512),[[w,q.value.title]])]),l(`div`,Ue,[i[26]||=l(`label`,null,`日期`,-1),e(l(`input`,{"onUpdate:modelValue":i[10]||=e=>q.value.date=e,type:`date`},null,512),[[w,q.value.date]])]),l(`div`,We,[i[27]||=l(`label`,null,`内容`,-1),e(l(`textarea`,{"onUpdate:modelValue":i[11]||=e=>q.value.content=e,rows:`8`,placeholder:`写下你想说的话...`},null,512),[[w,q.value.content]])]),l(`div`,Ge,[i[29]||=l(`label`,null,`标签`,-1),e(l(`select`,{"onUpdate:modelValue":i[12]||=e=>q.value.tag=e},[...i[28]||=[l(`option`,{value:`日常`},`日常`,-1),l(`option`,{value:`纪念日`},`纪念日`,-1),l(`option`,{value:`旅行`},`旅行`,-1),l(`option`,{value:`道歉`},`道歉`,-1),l(`option`,{value:`感谢`},`感谢`,-1)]],512),[[E,q.value.tag]])])])]),_:1},8,[`modelValue`,`title`])]))}}),[[`__scopeId`,`data-v-b735d86d`]]);export{Ke as default};
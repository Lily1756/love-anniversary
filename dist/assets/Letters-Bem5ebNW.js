const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/wordcloud2-DGkmnMOt.js","assets/chunk-CaILmz35.js"])))=>i.map(i=>d[i]);
import{n as e}from"./chunk-CaILmz35.js";import{A as t,C as n,E as r,O as i,P as a,R as o,S as s,T as c,U as l,b as u,c as d,ct as f,d as p,g as m,h,i as g,k as _,l as v,lt as y,m as b,s as x,t as S,u as C,ut as w,x as T}from"./_plugin-vue_export-helper-C9n2igPn.js";import{c as E,i as ee,n as te,s as D,t as O,u as ne}from"./index-BZctLxG9.js";import{t as k}from"./Modal-Dvx4mIKN.js";import{n as re,r as ie,t as A}from"./useDebouncedSave-DLC5lfep.js";var j={key:0,class:`card-header`},M={class:`card-title`},N={class:`card-body`},P={key:1,class:`card-footer`},F=S(m({__name:`Card`,props:{size:{default:`medium`},shadow:{type:Boolean,default:!0},hoverable:{type:Boolean,default:!0},title:{},backgroundColor:{default:`var(--bg-container)`}},setup(e){let t={backgroundColor:e.backgroundColor};return(i,a)=>(n(),p(`div`,{class:f([`m-card`,[`size-${e.size}`,{"has-shadow":e.shadow,"is-hoverable":e.hoverable}]]),style:t},[i.$slots.header||e.title?(n(),p(`div`,j,[r(i.$slots,`header`,{},()=>[d(`h3`,M,w(e.title),1)],!0)])):C(``,!0),d(`div`,N,[r(i.$slots,`default`,{},void 0,!0)]),i.$slots.footer?(n(),p(`div`,P,[r(i.$slots,`footer`,{},void 0,!0)])):C(``,!0)],2))}}),[[`__scopeId`,`data-v-1834c394`]]),I={class:`letter-meta`},L={class:`letter-date`},R={key:0,class:`letter-tag`},z={class:`letter-preview`},B={class:`letter-footer`},V={class:`letter-year`},ae={key:0,class:`favorite-icon`,viewBox:`0 0 24 24`,width:`16`,height:`16`,fill:`var(--color-primary)`,stroke:`none`},oe=S(m({__name:`LoveLetterCard`,props:{letter:{}},emits:[`click`],setup(e){let t=e,r=x(()=>{let e=t.letter.content.replace(/\n/g,` `);return e.length>80?e.slice(0,80)+`...`:e}),i=e=>{let t=new Date(e);return`${t.getMonth()+1}月${t.getDate()}日`};return(t,a)=>(n(),v(F,{class:`letter-card`,size:`medium`,title:e.letter.title,onClick:a[0]||=n=>t.$emit(`click`,e.letter.id)},{default:_(()=>[d(`div`,I,[d(`span`,L,w(i(e.letter.date)),1),e.letter.tag?(n(),p(`span`,R,w(e.letter.tag),1)):C(``,!0)]),d(`p`,z,w(r.value),1),d(`div`,B,[d(`span`,V,w(e.letter.year)+`年`,1),e.letter.isFavorite?(n(),p(`svg`,ae,[...a[1]||=[d(`path`,{d:`M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z`},null,-1)]])):C(``,!0)])]),_:1},8,[`title`]))}}),[[`__scopeId`,`data-v-db400d98`]]),se={class:`starry-container`,role:`region`,"aria-label":`年度记忆星光图`},H={class:`galaxy-canvas`},U=[`data-satellite-id`,`onMouseenter`,`onClick`],W=[`data-count`,`onMouseenter`,`onClick`],ce={class:`tooltip-header`},le={class:`tooltip-title`},ue={class:`tooltip-meta`},G={class:`tooltip-excerpt`},K={class:`tooltip-month`},q={class:`tooltip-count`},J={key:0,class:`tooltip-hint`},de={key:1,class:`tooltip-hint`},fe={class:`progress-section`},pe={class:`progress-header`},Y={class:`progress-percent`},me={class:`progress-track`},X={class:`progress-text`},Z={class:`stats-panel`},Q={class:`stat-item`},he={class:`stat-value`},$={class:`stat-item`},ge={class:`stat-value`},_e={key:0,class:`stat-item`},ve={class:`stat-value`},ye=S({__name:`StarryNightChart`,props:{letters:{type:Array,default:()=>[]}},emits:[`month-selected`,`date-selected`],setup(e,{emit:t}){let r=ee(),i=e,a=t,l=o(null),u=o({width:800,height:320}),m=o(null),h=o(null),_=o(null),v=o({}),S=x(()=>{let e={};for(let t=1;t<=12;t++)e[t]={count:0,letters:[]};for(let t of i.letters)if(t.date){let n=parseInt(t.date.split(`-`)[1]);n>=1&&n<=12&&(e[n].count++,e[n].letters.push({id:t.id||`${t.date}-${t.title}`,title:t.title||`Untitled`,date:t.date,weather:t.weather||`晴`,excerpt:t.excerpt||t.content?.substring(0,50)||`暂无摘要...`}))}return e}),E=x(()=>{let e=u.value.width,t=u.value.height;return Array.from({length:12},(n,r)=>{let i=r+1,a=S.value[i]||{count:0,letters:[]},o=a.count,s=a.letters,c=D(i,e,t);return{month:i,count:o,letters:s,corePosition:c,satellites:O(s,c,e,t),coreSize:k(o),coreBrightness:re(o)}})}),te=x(()=>{let e=[];for(let t=0;t<E.value.length-1;t++){let n=E.value[t],r=E.value[t+1];if(n.count>0&&r.count>0){let t=r.corePosition.x-n.corePosition.x,i=r.corePosition.y-n.corePosition.y,a=Math.sqrt(t*t+i*i),o=180/Math.PI*Math.atan2(i,t);e.push({style:{left:`${n.corePosition.x}px`,top:`${n.corePosition.y}px`,width:`${a}px`,transform:`rotate(${o}deg)`,opacity:.3}})}}return e});function D(e,t,n){let r=t-120,i=60+e/13*r;if(e%2==1){let e=n*.2;return{x:i,y:n*.3+(Math.random()-.5)*e}}else{let e=n*.2;return{x:i,y:n*.7+(Math.random()-.5)*e}}}function O(e,t,n,r){if(!e||e.length===0)return[];let i=[];for(let a=0;a<e.length;a++){let o=e[a],s=30+Math.random()*30,c=20+Math.random()*20,l=a*2*Math.PI/e.length+(Math.random()*.5-.25),u=t.x+Math.cos(l)*s,d=t.y+Math.sin(l)*c,f=0;for(;f<30;){let e=!1;for(let t of i){let n=t.x-u,r=t.y-d,i=Math.sqrt(n*n+r*r);if(i<20){let t=Math.atan2(r,n),a=20-i+5;u+=Math.cos(t+Math.PI)*a,d+=Math.sin(t+Math.PI)*a,e=!0}}if(!e)break;f++}u=Math.max(10,Math.min(n-10,u)),d=Math.max(10,Math.min(r-10,d));let p=8+Math.random()*4;i.push({id:o.id,x:u,y:d,size:p,title:o.title,date:o.date,weather:o.weather,excerpt:o.excerpt})}return i}function ne(e,t){return _.value?_.value.month===e&&_.value.id!==t?.9:_.value.month===e?.8:.6:.8}function k(e){return e===0?20:e<=3?24:e<=6?28:32}function re(e){return e===0?.3:e<=3?.7:e<=6?.85:1}function ie(e){return e===0?`0`:e<=3?`1-3`:e<=6?`4-6`:`7+`}let A=x(()=>{if(!i.letters||i.letters.length===0)return{percentage:0,count:0,total:365};let e=new Set;for(let t of i.letters)if(t.date){let n=new Date(t.date);if(!isNaN(n.getTime())){let t=n.toISOString().split(`T`)[0];e.add(t)}}let t=e.size;return{percentage:Math.min(Math.round(t/365*100),100),count:t,total:365}}),j=x(()=>{if(!i.letters||i.letters.length===0)return 0;let e=new Set;for(let t of i.letters)if(t.date){let n=new Date(t.date);if(!isNaN(n.getTime())){let t=n.toISOString().split(`T`)[0];e.add(t)}}return e.size}),M=x(()=>Object.entries(S.value).filter(([e,t])=>t.count>0).length),N=x(()=>{if(!i.letters||i.letters.length===0)return null;let e=[...new Set(i.letters.map(e=>e.date).filter(Boolean))].map(e=>new Date(e)).sort((e,t)=>e-t);if(e.length===0)return null;let t=1,n=1;for(let r=1;r<e.length;r++)(e[r]-e[r-1])/(1e3*60*60*24)==1?(n++,t=Math.max(t,n)):n=1;return{maxStreak:t}});function P(e){if(_.value)return;h.value=e;let t=e.corePosition.x+20,n=e.corePosition.y-40;v.value={left:`${t}px`,top:`${n}px`},m.value=e.month}function F(){_.value||(h.value=null)}function I(e){m.value===e.month?B():(m.value=e.month,a(`month-selected`,e.month))}function L(e,t){_.value={...t,month:e},h.value=null;let n=t.x+15,r=t.y-10;v.value={left:`${n}px`,top:`${r}px`}}function R(){_.value=null}function z(e){if(!e||!e.id)return;let t=document.querySelector(`[data-satellite-id="${e.id}"]`);t&&(t.classList.add(`is-clicked`),setTimeout(()=>{t.classList.remove(`is-clicked`)},200)),r.push({name:`LetterDetail`,params:{id:e.id}})}function B(){m.value=null,a(`month-selected`,null)}function V(){l.value&&(u.value={width:l.value.offsetWidth,height:l.value.offsetHeight||320})}return T(()=>{V(),window.addEventListener(`resize`,V)}),s(()=>{window.removeEventListener(`resize`,V)}),(e,t)=>(n(),p(`div`,se,[t[9]||=d(`div`,{class:`title-section`},[d(`div`,{class:`header-area`},[d(`h3`,{class:`card-title`},`✨ 时间脉络`),d(`p`,{class:`card-subtitle`},`每一个写下情书的日子，都是星空里闪亮的一颗星`)])],-1),d(`div`,{class:`visualization-wrapper`,ref_key:`canvasRef`,ref:l},[t[2]||=d(`div`,{class:`nebula-background`},null,-1),d(`div`,H,[(n(!0),p(g,null,c(te.value,(e,t)=>(n(),p(`div`,{key:`conn-${t}`,class:`galaxy-connection`,style:y(e.style)},null,4))),128)),(n(!0),p(g,null,c(E.value,e=>(n(),p(`div`,{key:`satellites-${e.month}`},[(n(!0),p(g,null,c(e.satellites,(t,r)=>(n(),p(`div`,{key:`sat-${e.month}-${r}`,class:f([`satellite-star`,{"is-hovered":_.value&&_.value.id===t.id}]),style:y({left:`${t.x}px`,top:`${t.y}px`,width:`${t.size}px`,height:`${t.size}px`,opacity:ne(e.month,t.id),zIndex:_.value&&_.value.id===t.id?100:10}),"data-satellite-id":t.id,onMouseenter:n=>L(e.month,t),onMouseleave:R,onClick:e=>z(t)},null,46,U))),128))]))),128)),(n(!0),p(g,null,c(E.value,e=>(n(),p(`div`,{key:`core-${e.month}`,class:f([`galaxy-core`,{active:m.value===e.month}]),style:y({left:`${e.corePosition.x}px`,top:`${e.corePosition.y}px`}),"data-count":ie(e.count),onMouseenter:t=>P(e),onMouseleave:F,onClick:t=>I(e)},[...t[0]||=[d(`svg`,{viewBox:`0 0 24 24`,class:`star-svg`},[d(`polygon`,{points:`12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9`})],-1)]],46,W))),128)),_.value?(n(),p(`div`,{key:0,class:`satellite-tooltip`,style:y(v.value)},[d(`div`,ce,[t[1]||=d(`span`,{class:`tooltip-icon`},`✍️`,-1),d(`span`,le,w(_.value.title),1)]),d(`div`,ue,w(_.value.date)+` · `+w(_.value.weather),1),d(`div`,G,w(_.value.excerpt),1)],4)):C(``,!0),h.value&&!_.value?(n(),p(`div`,{key:1,class:`galaxy-tooltip`,style:y(v.value)},[d(`div`,K,w(h.value.month)+`月`,1),d(`div`,q,w(h.value.count)+` 封情书`,1),h.value.count>0?(n(),p(`div`,J,`点击查看详情`)):(n(),p(`div`,de,`这个月还没有情书哦`))],4)):C(``,!0)])],512),d(`div`,fe,[d(`div`,pe,[t[3]||=d(`span`,{class:`progress-title`},`记忆星辰点亮度`,-1),d(`span`,Y,w(A.value.percentage)+`%`,1)]),d(`div`,me,[d(`div`,{class:`progress-fill`,style:y({width:A.value.percentage+`%`})},null,4)]),d(`div`,X,` 已点亮 `+w(A.value.count)+` / `+w(A.value.total)+` 个日夜 `,1)]),d(`div`,Z,[d(`div`,Q,[t[5]||=d(`span`,{class:`stat-label`},`记录月份`,-1),d(`span`,he,[b(w(M.value),1),t[4]||=d(`span`,{class:`stat-unit`},`/12`,-1)])]),d(`div`,$,[t[6]||=d(`span`,{class:`stat-label`},`星光总数`,-1),d(`span`,ge,w(j.value),1)]),N.value?(n(),p(`div`,_e,[t[8]||=d(`span`,{class:`stat-label`},`最长连续`,-1),d(`span`,ve,[b(w(N.value.maxStreak),1),t[7]||=d(`span`,{class:`stat-unit`},`天`,-1)])])):C(``,!0)])]))}},[[`__scopeId`,`data-v-0d0b3e72`]]),be={key:0,class:`wordcloud-skeleton`},xe=S(m({__name:`WordCloud`,props:{words:{},width:{},height:{}},emits:[`wordClick`],setup(t,{emit:r}){let a=t,l=r,m=o(null),h=o(null),_=o(!1),v=[`#f9d5e5`,`#eeac99`,`#e06377`,`#d4a5a5`,`#e8b4b8`];function b(){x()}async function x(){if(!m.value||a.words.length===0)return;_.value=!0;let t=(await O(async()=>{let{default:t}=await import(`./wordcloud2-DGkmnMOt.js`).then(t=>e(t.default,1));return{default:t}},__vite__mapDeps([0,1]))).default;h.value&&(m.value.innerHTML=``);let n={list:a.words.map(e=>[e.text,e.weight]),gridSize:13,weightFactor:e=>{let t=window.innerWidth<768?8:12;return e**.8*t},fontFamily:`'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif`,color:(e,t)=>v[Math.min(Math.floor(t/5),v.length-1)]??v[0],backgroundColor:`transparent`,rotateRatio:.5,rotationSteps:2,shape:`circle`,ellipticity:.9,drawOutOfBound:!1,shrinkToFit:!0,click:e=>{console.log(`🎯 词云点击事件触发:`,e);let t=e[0],n=a.words.find(e=>e.text===t);if(console.log(`   匹配的词语:`,n),n?.id){console.log(`   发出 wordClick 事件, id:`,n.id),l(`wordClick`,n.id);let e=document.getElementById(`letter-${n.id}`);e?(console.log(`   找到情书卡片，开始滚动...`),e.scrollIntoView({behavior:`smooth`,block:`center`}),e.classList.add(`highlight`),setTimeout(()=>e.classList.remove(`highlight`),2e3)):console.log(`   ⚠️ 未找到情书卡片 letter-`+n.id)}else console.log(`   ⚠️ 词语没有关联的 id`)}};t(m.value,n),h.value=!0,_.value=!1}return T(()=>{window.addEventListener(`resize`,b),u(()=>x())}),s(()=>{window.removeEventListener(`resize`,b),m.value&&(m.value.innerHTML=``)}),i(()=>a.words,()=>u(()=>x()),{deep:!0}),(e,t)=>(n(),p(`section`,{class:f([`wordcloud-section`,{"is-loading":_.value}])},[t[0]||=d(`div`,{class:`wordcloud-header`},[d(`h3`,{class:`section-title`},`情书关键词云`),d(`p`,{class:`section-subtitle`},`点击关键词，快速定位相关情书`)],-1),d(`div`,{ref_key:`wordcloudContainer`,ref:m,class:`wordcloud-container`},null,512),_.value?(n(),p(`div`,be,[(n(),p(g,null,c(20,e=>d(`div`,{key:e,class:`skeleton-item`,style:y({width:Math.random()*60+20+`px`,height:`20px`,borderRadius:`10px`})},null,4)),64))])):C(``,!0)],2))}}),[[`__scopeId`,`data-v-0a6a7ca3`]]);function Se(){function e(e){let t=new Date(e);return`${t.getFullYear()}年${t.getMonth()+1}月${t.getDate()}日`}function t(e){let t={};for(let n of e){let e=new Date(n.date).getMonth()+1;t[e]||(t[e]=[]),t[e].push(n)}return t}function n(n,i,a=`你和我`){let o=[...i].sort((e,t)=>new Date(e.date).getTime()-new Date(t.date).getTime()),s=t(o),c=Object.keys(s).map(Number).sort((e,t)=>e-t),l=``,u=0;for(let t of c){l+=`<div class="toc-month">${t}月</div>`;for(let n of s[t]??[])u++,l+=`
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
</html>`}function r(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function i(e,t,r){let i=n(e,t,r),a=new Blob([i],{type:`text/html;charset=utf-8`}),o=URL.createObjectURL(a),s=window.open(o,`_blank`);return setTimeout(()=>URL.revokeObjectURL(o),3e4),s}return{generateYearbookHTML:n,openYearbook:i}}var Ce={class:`letters-page page-container`},we={class:`page-header`},Te={class:`page-title`},Ee={class:`count`},De={class:`header-actions`},Oe={class:`filters`},ke=[`value`],Ae={class:`search-box`},je={key:1,class:`filter-hint`},Me={key:0},Ne={key:1},Pe={class:`letters-grid`},Fe=[`onClick`],Ie={key:3,class:`empty-state`},Le={class:`yearbook-form`},Re={class:`form-group`},ze=[`value`],Be={class:`form-group`},Ve={class:`letter-form`},He={class:`form-group`},Ue={class:`form-group`},We={class:`form-group`},Ge={class:`form-group`},Ke=S(m({__name:`Letters`,setup(e){let r=ee(),s=te(),u=o(`all`),m=o(`all`),y=o(null),S=o(``),{isEditMode:O,showAuth:j,authPassword:M,authError:N,openAuthModal:P,verifyAuth:F,exitEditMode:I}=re({password:`202505174everZHZY`}),{saveStatus:L,saveMessage:R,triggerDebouncedSave:z}=A(),{openYearbook:B}=Se();function V(e){e===null?m.value=`all`:(m.value=String(e),y.value=null,S.value=``)}function ae(e){e===null?y.value=null:(y.value=e,m.value=`all`,S.value=``)}function se(){u.value=`all`,m.value=`all`,y.value=null,S.value=``}let H=o(!1),U=o(new Date().getFullYear()),W=o(`你和我`);function ce(){let e=s.letterYears[0];e!==void 0&&(U.value=e),H.value=!0}function le(e){return s.letters.filter(t=>t.year===e).length}function ue(){let e=s.letters.filter(e=>e.year===U.value);if(e.length===0){alert(`该年暂无情书`);return}H.value=!1,B(U.value,e,W.value||`你和我`)}let G=o(!1),K=o(null),q=o({title:``,date:``,tag:``,content:``}),J=()=>new Date().toISOString().split(`T`)[0]??new Date().toISOString().slice(0,10);function de(e){e?(K.value=e,q.value={title:e.title,date:e.date,tag:e.tag??``,content:e.content}):(K.value=null,q.value={title:``,date:J(),tag:``,content:``}),G.value=!0}function fe(){if(!q.value.title.trim()||!q.value.content.trim()){alert(`请填写标题和内容`);return}let e={id:K.value?K.value.id:`letter-`+Date.now(),title:q.value.title.trim(),content:q.value.content.trim(),date:q.value.date||J(),year:new Date(q.value.date||J()).getFullYear(),tag:q.value.tag.trim()||void 0};if(K.value){let t=s.letters.findIndex(t=>t.id===e.id);t>=0&&(s.letters[t]=e)}else s.letters.unshift(e);G.value=!1,K.value=null,Y()}function pe(e){confirm(`确定要删除这封情书吗？`)&&(s.letters=s.letters.filter(t=>t.id!==e),Y())}async function Y(){z(()=>s.saveLetters(`202505174everZHZY`))}let me=`我们.一起.这个.那个.然后.因为.所以.可以.已经.还是.没有.不是.只是.但是.如果.知道.觉得.现在.今天.昨天.明天.想要.不会.不能.她的.什么.怎么.这么.真的.非常`.split(`.`),X=o([]),Z=null;function Q(){Z&&clearTimeout(Z),Z=setTimeout(()=>{let e=$.value;if(e.length===0){X.value=[];return}let t=e.map(e=>`${e.title} ${e.content}`).join(` `).match(/[\u4e00-\u9fa5]{2,}/g)||[],n={};t.forEach(e=>{n[e]=(n[e]||0)+1}),me.forEach(e=>{delete n[e]}),X.value=Object.entries(n).filter(([e])=>e.length>=2).map(([t,n])=>({text:t,weight:n,id:e.find(e=>e.title.includes(t)||e.content.includes(t))?.id})).sort((e,t)=>t.weight-e.weight).slice(0,80)},100)}function he(e){let t=document.getElementById(`letter-${e}`);t&&(t.scrollIntoView({behavior:`smooth`,block:`center`}),t.classList.add(`highlight`),setTimeout(()=>t.classList.remove(`highlight`),2e3))}let $=x(()=>{let e=s.letters;if(y.value!==null)return e=e.filter(e=>e.date===y.value),e;if(u.value!==`all`&&(e=e.filter(e=>e.year===Number(u.value))),m.value!==`all`&&(e=e.filter(e=>{let t=e.date.split(`-`);return(t[1]?parseInt(t[1]):0)===Number(m.value)})),S.value.trim()){let t=S.value.toLowerCase();e=e.filter(e=>e.title.toLowerCase().includes(t)||e.content.toLowerCase().includes(t))}return e}),ge=e=>{r.push(`/letters/${e}`)};return T(()=>{s.letters.length===0&&s.loadLetters(),Q()}),i(()=>s.letters,()=>{Q()},{deep:!0}),i([u,m,y,S],()=>{Q()},{flush:`post`}),(e,r)=>(n(),p(`div`,Ce,[d(`div`,we,[d(`h2`,Te,[r[17]||=b(` 情书馆 `,-1),d(`span`,Ee,`(`+w($.value.length)+`)`,1)]),d(`div`,De,[d(`div`,Oe,[t(d(`select`,{"onUpdate:modelValue":r[0]||=e=>u.value=e,class:`filter-select`},[r[18]||=d(`option`,{value:`all`},`全部年份`,-1),(n(!0),p(g,null,c(l(s).letterYears,e=>(n(),p(`option`,{key:e,value:e},w(e)+`年 `,9,ke))),128))],512),[[D,u.value]]),d(`div`,Ae,[t(d(`input`,{"onUpdate:modelValue":r[1]||=e=>S.value=e,type:`text`,placeholder:`搜索情书...`,class:`search-input`},null,512),[[E,S.value]]),r[19]||=d(`svg`,{class:`search-icon`,viewBox:`0 0 24 24`,width:`18`,height:`18`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[d(`circle`,{cx:`11`,cy:`11`,r:`8`}),d(`path`,{d:`M21 21l-4.35-4.35`})],-1)])]),l(O)?C(``,!0):(n(),p(`button`,{key:0,class:`yearbook-btn`,onClick:ce},[...r[20]||=[d(`svg`,{viewBox:`0 0 24 24`,width:`16`,height:`16`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[d(`path`,{d:`M4 19.5A2.5 2.5 0 0 1 6.5 17H20`}),d(`path`,{d:`M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z`})],-1),b(` 电子书 `,-1)]])),l(O)?(n(),p(g,{key:2},[d(`button`,{class:`add-btn`,onClick:r[3]||=e=>de()},[...r[22]||=[d(`svg`,{viewBox:`0 0 24 24`,width:`16`,height:`16`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[d(`path`,{d:`M12 5v14M5 12h14`})],-1),b(` 情书 `,-1)]]),d(`button`,{class:`done-btn`,onClick:r[4]||=(...e)=>l(I)&&l(I)(...e)},`完成`)],64)):(n(),p(`button`,{key:1,class:`edit-btn`,onClick:r[2]||=(...e)=>l(P)&&l(P)(...e)},[...r[21]||=[d(`svg`,{viewBox:`0 0 24 24`,width:`16`,height:`16`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[d(`path`,{d:`M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z`})],-1),b(` 编辑 `,-1)]]))])]),h(ye,{letters:l(s).letters,onMonthSelected:V,onDateSelected:ae},null,8,[`letters`]),X.value.length>0?(n(),v(xe,{key:0,words:X.value,onWordClick:he},null,8,[`words`])):C(``,!0),y.value!==null||u.value!==`all`||m.value!==`all`?(n(),p(`div`,je,[y.value===null?(n(),p(`span`,Ne,[r[23]||=b(` 正在查看 `,-1),u.value===`all`?C(``,!0):(n(),p(g,{key:0},[b(w(u.value)+`年`,1)],64)),m.value===`all`?C(``,!0):(n(),p(g,{key:1},[b(w(m.value)+`月`,1)],64)),r[24]||=b(` 的情书 `,-1)])):(n(),p(`span`,Me,`📅 正在查看 `+w(y.value)+` 的情书`,1)),d(`button`,{class:`clear-filter`,onClick:se},`清除筛选`)])):C(``,!0),l(L)===`idle`?C(``,!0):(n(),p(`div`,{key:2,class:f([`save-toast`,l(L)])},[d(`span`,null,w(l(R)),1)],2)),d(`div`,Pe,[(n(!0),p(g,null,c($.value,e=>(n(),p(`div`,{key:e.id,class:f([`letter-card-wrapper`,{"edit-mode":l(O)}])},[h(oe,{letter:e,onClick:t=>!l(O)&&ge(e.id)},null,8,[`letter`,`onClick`]),l(O)?(n(),p(`button`,{key:0,class:`delete-letter-btn`,onClick:ne(t=>pe(e.id),[`stop`])},[...r[25]||=[d(`svg`,{viewBox:`0 0 24 24`,width:`14`,height:`14`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[d(`path`,{d:`M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2`})],-1)]],8,Fe)):C(``,!0)],2))),128))]),$.value.length===0?(n(),p(`div`,Ie,[...r[26]||=[d(`p`,null,`暂无情书，写下第一封吧 💌`,-1)]])):C(``,!0),h(ie,{modelValue:l(j),"onUpdate:modelValue":r[5]||=e=>a(j)?j.value=e:null,password:l(M),error:l(N),"onUpdate:password":r[6]||=e=>M.value=e,onConfirm:l(F)},null,8,[`modelValue`,`password`,`error`,`onConfirm`]),h(k,{modelValue:H.value,"onUpdate:modelValue":r[10]||=e=>H.value=e,title:`生成年度电子书`},{footer:_(()=>[d(`button`,{class:`btn-text`,onClick:r[9]||=e=>H.value=!1},`取消`),d(`button`,{class:`btn-primary`,onClick:ue},`生成并预览`)]),default:_(()=>[d(`div`,Le,[r[29]||=d(`p`,{class:`yearbook-desc`},`将该年所有情书生成精美的电子书，可在浏览器中直接保存为 PDF 💌`,-1),d(`div`,Re,[r[27]||=d(`label`,null,`选择年份`,-1),t(d(`select`,{"onUpdate:modelValue":r[7]||=e=>U.value=e,class:`filter-select`,style:{width:`100%`}},[(n(!0),p(g,null,c(l(s).letterYears,e=>(n(),p(`option`,{key:e,value:e},w(e)+`年（`+w(le(e))+`封）`,9,ze))),128))],512),[[D,U.value]])]),d(`div`,Be,[r[28]||=d(`label`,null,`署名`,-1),t(d(`input`,{"onUpdate:modelValue":r[8]||=e=>W.value=e,type:`text`,placeholder:`例如：你和我 / 志浩和小丽`},null,512),[[E,W.value]])])])]),_:1},8,[`modelValue`]),h(k,{modelValue:G.value,"onUpdate:modelValue":r[16]||=e=>G.value=e,title:K.value?`编辑情书`:`写一封情书`},{footer:_(()=>[d(`button`,{class:`btn-text`,onClick:r[15]||=e=>G.value=!1},`取消`),d(`button`,{class:`btn-primary`,onClick:fe},`保存`)]),default:_(()=>[d(`div`,Ve,[d(`div`,He,[r[30]||=d(`label`,null,`标题`,-1),t(d(`input`,{"onUpdate:modelValue":r[11]||=e=>q.value.title=e,type:`text`,placeholder:`给亲爱的你...`},null,512),[[E,q.value.title]])]),d(`div`,Ue,[r[31]||=d(`label`,null,`日期`,-1),t(d(`input`,{"onUpdate:modelValue":r[12]||=e=>q.value.date=e,type:`date`},null,512),[[E,q.value.date]])]),d(`div`,We,[r[32]||=d(`label`,null,`标签`,-1),t(d(`input`,{"onUpdate:modelValue":r[13]||=e=>q.value.tag=e,type:`text`,placeholder:`例如：纪念日、日常...`},null,512),[[E,q.value.tag]])]),d(`div`,Ge,[r[33]||=d(`label`,null,`内容`,-1),t(d(`textarea`,{"onUpdate:modelValue":r[14]||=e=>q.value.content=e,rows:`8`,placeholder:`写下想说的话...`},null,512),[[E,q.value.content]])])])]),_:1},8,[`modelValue`,`title`])]))}}),[[`__scopeId`,`data-v-7cd7e516`]]);export{Ke as default};
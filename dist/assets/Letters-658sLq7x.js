import{H as e,L as t,N as n,O as r,S as i,T as a,c as o,d as s,g as c,h as l,i as u,k as d,l as f,lt as p,m,s as h,st as g,t as _,u as v,w as y,x as ee}from"./_plugin-vue_export-helper-BryC1OKW.js";import{c as b,i as te,n as ne,s as x,u as re}from"./index-B-vxnb3q.js";import{t as S}from"./Modal-e6XtR1N_.js";import{n as ie,t as ae}from"./useEditAuth-v5uGm-F_.js";import{t as oe}from"./useDebouncedSave-Dj_B_Ghs.js";var C={key:0,class:`card-header`},w={class:`card-title`},T={class:`card-body`},E={key:1,class:`card-footer`},D=_(c({__name:`Card`,props:{size:{default:`medium`},shadow:{type:Boolean,default:!0},hoverable:{type:Boolean,default:!0},title:{},backgroundColor:{default:`var(--bg-container)`}},setup(e){let t={backgroundColor:e.backgroundColor};return(n,r)=>(i(),s(`div`,{class:g([`m-card`,[`size-${e.size}`,{"has-shadow":e.shadow,"is-hoverable":e.hoverable}]]),style:t},[n.$slots.header||e.title?(i(),s(`div`,C,[a(n.$slots,`header`,{},()=>[o(`h3`,w,p(e.title),1)],!0)])):v(``,!0),o(`div`,T,[a(n.$slots,`default`,{},void 0,!0)]),n.$slots.footer?(i(),s(`div`,E,[a(n.$slots,`footer`,{},void 0,!0)])):v(``,!0)],2))}}),[[`__scopeId`,`data-v-1834c394`]]),O={class:`letter-meta`},k={class:`letter-date`},A={key:0,class:`letter-tag`},j={class:`letter-preview`},M={class:`letter-footer`},N={class:`letter-year`},P={key:0,class:`favorite-icon`,viewBox:`0 0 24 24`,width:`16`,height:`16`,fill:`var(--color-primary)`,stroke:`none`},se=_(c({__name:`LoveLetterCard`,props:{letter:{}},emits:[`click`],setup(e){let t=e,n=h(()=>{let e=t.letter.content.replace(/\n/g,` `);return e.length>80?e.slice(0,80)+`...`:e}),a=e=>{let t=new Date(e);return`${t.getMonth()+1}月${t.getDate()}日`};return(t,c)=>(i(),f(D,{class:`letter-card`,size:`medium`,title:e.letter.title,onClick:c[0]||=n=>t.$emit(`click`,e.letter.id)},{default:r(()=>[o(`div`,O,[o(`span`,k,p(a(e.letter.date)),1),e.letter.tag?(i(),s(`span`,A,p(e.letter.tag),1)):v(``,!0)]),o(`p`,j,p(n.value),1),o(`div`,M,[o(`span`,N,p(e.letter.year)+`年`,1),e.letter.isFavorite?(i(),s(`svg`,P,[...c[1]||=[o(`path`,{d:`M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z`},null,-1)]])):v(``,!0)])]),_:1},8,[`title`]))}}),[[`__scopeId`,`data-v-db400d98`]]);function ce(){function e(e){let t=new Date(e);return`${t.getFullYear()}年${t.getMonth()+1}月${t.getDate()}日`}function t(e){let t={};for(let n of e){let e=new Date(n.date).getMonth()+1;t[e]||(t[e]=[]),t[e].push(n)}return t}function n(n,i,a=`你和我`){let o=[...i].sort((e,t)=>new Date(e.date).getTime()-new Date(t.date).getTime()),s=t(o),c=Object.keys(s).map(Number).sort((e,t)=>e-t),l=``,u=0;for(let t of c){l+=`<div class="toc-month">${t}月</div>`;for(let n of s[t]??[])u++,l+=`
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
</html>`}function r(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function i(e,t,r){let i=n(e,t,r),a=new Blob([i],{type:`text/html;charset=utf-8`}),o=URL.createObjectURL(a),s=window.open(o,`_blank`);return setTimeout(()=>URL.revokeObjectURL(o),3e4),s}return{generateYearbookHTML:n,openYearbook:i}}var le={class:`letters-page page-container`},ue={class:`page-header`},F={class:`page-title`},I={class:`count`},L={class:`header-actions`},R={class:`filters`},z=[`value`],B={class:`search-box`},V={class:`letters-grid`},H=[`onClick`],U={key:1,class:`empty-state`},de={class:`yearbook-form`},fe={class:`form-group`},pe=[`value`],me={class:`form-group`},he={class:`letter-form`},W={class:`form-group`},ge={class:`form-group`},_e={class:`form-group`},ve={class:`form-group`},G=_(c({__name:`Letters`,setup(a){let c=te(),f=ne(),_=t(`all`),C=t(``),{isEditMode:w,showAuth:T,authPassword:E,authError:D,openAuthModal:O,verifyAuth:k,exitEditMode:A}=ae({password:`2025`}),{saveStatus:j,saveMessage:M,triggerDebouncedSave:N}=oe(),{openYearbook:P}=ce(),G=t(!1),K=t(new Date().getFullYear()),q=t(`你和我`);function ye(){let e=f.letterYears[0];e!==void 0&&(K.value=e),G.value=!0}function be(e){return f.letters.filter(t=>t.year===e).length}function xe(){let e=f.letters.filter(e=>e.year===K.value);if(e.length===0){alert(`该年暂无情书`);return}G.value=!1,P(K.value,e,q.value||`你和我`)}let J=t(!1),Y=t(null),X=t({title:``,date:``,tag:``,content:``}),Z=()=>new Date().toISOString().split(`T`)[0]??new Date().toISOString().slice(0,10);function Se(e){e?(Y.value=e,X.value={title:e.title,date:e.date,tag:e.tag??``,content:e.content}):(Y.value=null,X.value={title:``,date:Z(),tag:``,content:``}),J.value=!0}function Ce(){if(!X.value.title.trim()||!X.value.content.trim()){alert(`请填写标题和内容`);return}let e={id:Y.value?Y.value.id:`letter-`+Date.now(),title:X.value.title.trim(),content:X.value.content.trim(),date:X.value.date||Z(),year:new Date(X.value.date||Z()).getFullYear(),tag:X.value.tag.trim()||void 0};if(Y.value){let t=f.letters.findIndex(t=>t.id===e.id);t>=0&&(f.letters[t]=e)}else f.letters.unshift(e);J.value=!1,Y.value=null,Q()}function we(e){confirm(`确定要删除这封情书吗？`)&&(f.letters=f.letters.filter(t=>t.id!==e),Q())}async function Q(){N(()=>f.saveLetters(`2025`))}let $=h(()=>{let e=f.letters;if(_.value!==`all`&&(e=e.filter(e=>e.year===Number(_.value))),C.value.trim()){let t=C.value.toLowerCase();e=e.filter(e=>e.title.toLowerCase().includes(t)||e.content.toLowerCase().includes(t))}return e}),Te=e=>{c.push(`/letters/${e}`)};return ee(()=>{f.letters.length===0&&f.loadLetters()}),(t,a)=>(i(),s(`div`,le,[o(`div`,ue,[o(`h2`,F,[a[17]||=m(` 情书馆 `,-1),o(`span`,I,`(`+p($.value.length)+`)`,1)]),o(`div`,L,[o(`div`,R,[d(o(`select`,{"onUpdate:modelValue":a[0]||=e=>_.value=e,class:`filter-select`},[a[18]||=o(`option`,{value:`all`},`全部年份`,-1),(i(!0),s(u,null,y(e(f).letterYears,e=>(i(),s(`option`,{key:e,value:e},p(e)+`年 `,9,z))),128))],512),[[x,_.value]]),o(`div`,B,[d(o(`input`,{"onUpdate:modelValue":a[1]||=e=>C.value=e,type:`text`,placeholder:`搜索情书...`,class:`search-input`},null,512),[[b,C.value]]),a[19]||=o(`svg`,{class:`search-icon`,viewBox:`0 0 24 24`,width:`18`,height:`18`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[o(`circle`,{cx:`11`,cy:`11`,r:`8`}),o(`path`,{d:`M21 21l-4.35-4.35`})],-1)])]),e(w)?v(``,!0):(i(),s(`button`,{key:0,class:`yearbook-btn`,onClick:ye},[...a[20]||=[o(`svg`,{viewBox:`0 0 24 24`,width:`16`,height:`16`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[o(`path`,{d:`M4 19.5A2.5 2.5 0 0 1 6.5 17H20`}),o(`path`,{d:`M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z`})],-1),m(` 电子书 `,-1)]])),e(w)?(i(),s(u,{key:2},[o(`button`,{class:`add-btn`,onClick:a[3]||=e=>Se()},[...a[22]||=[o(`svg`,{viewBox:`0 0 24 24`,width:`16`,height:`16`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[o(`path`,{d:`M12 5v14M5 12h14`})],-1),m(` 情书 `,-1)]]),o(`button`,{class:`done-btn`,onClick:a[4]||=(...t)=>e(A)&&e(A)(...t)},`完成`)],64)):(i(),s(`button`,{key:1,class:`edit-btn`,onClick:a[2]||=(...t)=>e(O)&&e(O)(...t)},[...a[21]||=[o(`svg`,{viewBox:`0 0 24 24`,width:`16`,height:`16`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[o(`path`,{d:`M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z`})],-1),m(` 编辑 `,-1)]]))])]),e(j)===`idle`?v(``,!0):(i(),s(`div`,{key:0,class:g([`save-toast`,e(j)])},[o(`span`,null,p(e(M)),1)],2)),o(`div`,V,[(i(!0),s(u,null,y($.value,t=>(i(),s(`div`,{key:t.id,class:g([`letter-card-wrapper`,{"edit-mode":e(w)}])},[l(se,{letter:t,onClick:n=>!e(w)&&Te(t.id)},null,8,[`letter`,`onClick`]),e(w)?(i(),s(`button`,{key:0,class:`delete-letter-btn`,onClick:re(e=>we(t.id),[`stop`])},[...a[23]||=[o(`svg`,{viewBox:`0 0 24 24`,width:`14`,height:`14`,fill:`none`,stroke:`currentColor`,"stroke-width":`2`},[o(`path`,{d:`M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2`})],-1)]],8,H)):v(``,!0)],2))),128))]),$.value.length===0?(i(),s(`div`,U,[...a[24]||=[o(`p`,null,`暂无情书，写下第一封吧 💌`,-1)]])):v(``,!0),l(ie,{modelValue:e(T),"onUpdate:modelValue":a[5]||=e=>n(T)?T.value=e:null,password:e(E),error:e(D),"onUpdate:password":a[6]||=e=>E.value=e,onConfirm:e(k)},null,8,[`modelValue`,`password`,`error`,`onConfirm`]),l(S,{modelValue:G.value,"onUpdate:modelValue":a[10]||=e=>G.value=e,title:`生成年度电子书`},{footer:r(()=>[o(`button`,{class:`btn-text`,onClick:a[9]||=e=>G.value=!1},`取消`),o(`button`,{class:`btn-primary`,onClick:xe},`生成并预览`)]),default:r(()=>[o(`div`,de,[a[27]||=o(`p`,{class:`yearbook-desc`},`将该年所有情书生成精美的电子书，可在浏览器中直接保存为 PDF 💌`,-1),o(`div`,fe,[a[25]||=o(`label`,null,`选择年份`,-1),d(o(`select`,{"onUpdate:modelValue":a[7]||=e=>K.value=e,class:`filter-select`,style:{width:`100%`}},[(i(!0),s(u,null,y(e(f).letterYears,e=>(i(),s(`option`,{key:e,value:e},p(e)+`年（`+p(be(e))+`封）`,9,pe))),128))],512),[[x,K.value]])]),o(`div`,me,[a[26]||=o(`label`,null,`署名`,-1),d(o(`input`,{"onUpdate:modelValue":a[8]||=e=>q.value=e,type:`text`,placeholder:`例如：你和我 / 志浩和小丽`},null,512),[[b,q.value]])])])]),_:1},8,[`modelValue`]),l(S,{modelValue:J.value,"onUpdate:modelValue":a[16]||=e=>J.value=e,title:Y.value?`编辑情书`:`写一封情书`},{footer:r(()=>[o(`button`,{class:`btn-text`,onClick:a[15]||=e=>J.value=!1},`取消`),o(`button`,{class:`btn-primary`,onClick:Ce},`保存`)]),default:r(()=>[o(`div`,he,[o(`div`,W,[a[28]||=o(`label`,null,`标题`,-1),d(o(`input`,{"onUpdate:modelValue":a[11]||=e=>X.value.title=e,type:`text`,placeholder:`给亲爱的你...`},null,512),[[b,X.value.title]])]),o(`div`,ge,[a[29]||=o(`label`,null,`日期`,-1),d(o(`input`,{"onUpdate:modelValue":a[12]||=e=>X.value.date=e,type:`date`},null,512),[[b,X.value.date]])]),o(`div`,_e,[a[30]||=o(`label`,null,`标签`,-1),d(o(`input`,{"onUpdate:modelValue":a[13]||=e=>X.value.tag=e,type:`text`,placeholder:`例如：纪念日、日常...`},null,512),[[b,X.value.tag]])]),o(`div`,ve,[a[31]||=o(`label`,null,`内容`,-1),d(o(`textarea`,{"onUpdate:modelValue":a[14]||=e=>X.value.content=e,rows:`8`,placeholder:`写下想说的话...`},null,512),[[b,X.value.content]])])])]),_:1},8,[`modelValue`,`title`])]))}}),[[`__scopeId`,`data-v-92abc9d0`]]);export{G as default};
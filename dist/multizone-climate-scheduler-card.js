"use strict";/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const we=globalThis,at=we.ShadowRoot&&(we.ShadyCSS===void 0||we.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ot=Symbol(),vt=new WeakMap;let is=class{constructor(e,s,n){if(this._$cssResult$=true,n!==ot)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=s}get styleSheet(){let e=this.o;const s=this.t;if(at&&e===void 0){const n=s!==void 0&&s.length===1;n&&(e=vt.get(s)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&vt.set(s,e))}return e}toString(){return this.cssText}};const Ps=t=>new is(typeof t=="string"?t:t+"",void 0,ot),as=(t,...e)=>{const s=t.length===1?t[0]:e.reduce((n,i,a)=>n+(o=>{if(o._$cssResult$===true)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[a+1],t[0]);return new is(s,t,ot)},Ws=(t,e)=>{if(at)t.adoptedStyleSheets=e.map(s=>s instanceof CSSStyleSheet?s:s.styleSheet);else for(const s of e){const n=document.createElement("style"),i=we.litNonce;i!==void 0&&n.setAttribute("nonce",i),n.textContent=s.cssText,t.appendChild(n)}},$t=at?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let s="";for(const n of e.cssRules)s+=n.cssText;return Ps(s)})(t):t;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Hs,defineProperty:Fs,getOwnPropertyDescriptor:Us,getOwnPropertyNames:Bs,getOwnPropertySymbols:Ks,getPrototypeOf:qs}=Object,Te=globalThis,wt=Te.trustedTypes,Zs=wt?wt.emptyScript:"",Gs=Te.reactiveElementPolyfillSupport,le=(t,e)=>t,Se={toAttribute(t,e){switch(e){case Boolean:t=t?Zs:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=t!==null;break;case Number:s=t===null?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch{s=null}}return s}},rt=(t,e)=>!Hs(t,e),xt={attribute:true,type:String,converter:Se,reflect:false,useDefault:false,hasChanged:rt};Symbol.metadata??=Symbol("metadata"),Te.litPropertyMetadata??=new WeakMap;let G=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,s=xt){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(e)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(e,s),!s.noAccessor){const n=Symbol(),i=this.getPropertyDescriptor(e,n,s);i!==void 0&&Fs(this.prototype,e,i)}}static getPropertyDescriptor(e,s,n){const{get:i,set:a}=Us(this.prototype,e)??{get(){return this[s]},set(o){this[s]=o}};return{get:i,set(o){const c=i?.call(this);a?.call(this,o),this.requestUpdate(e,c,n)},configurable:true,enumerable:true}}static getPropertyOptions(e){return this.elementProperties.get(e)??xt}static _$Ei(){if(this.hasOwnProperty(le("elementProperties")))return;const e=qs(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(le("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(le("properties"))){const s=this.properties,n=[...Bs(s),...Ks(s)];for(const i of n)this.createProperty(i,s[i])}const e=this[Symbol.metadata];if(e!==null){const s=litPropertyMetadata.get(e);if(s!==void 0)for(const[n,i]of s)this.elementProperties.set(n,i)}this._$Eh=new Map;for(const[s,n]of this.elementProperties){const i=this._$Eu(s,n);i!==void 0&&this._$Eh.set(i,s)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const s=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const i of n)s.unshift($t(i))}else e!==void 0&&s.push($t(e));return s}static _$Eu(e,s){const n=s.attribute;return n===false?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,s=this.constructor.elementProperties;for(const n of s.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ws(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,s,n){this._$AK(e,n)}_$ET(e,s){const n=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,n);if(i!==void 0&&n.reflect===true){const a=(n.converter?.toAttribute!==void 0?n.converter:Se).toAttribute(s,n.type);this._$Em=e,a==null?this.removeAttribute(i):this.setAttribute(i,a),this._$Em=null}}_$AK(e,s){const n=this.constructor,i=n._$Eh.get(e);if(i!==void 0&&this._$Em!==i){const a=n.getPropertyOptions(i),o=typeof a.converter=="function"?{fromAttribute:a.converter}:a.converter?.fromAttribute!==void 0?a.converter:Se;this._$Em=i;const c=o.fromAttribute(s,a.type);this[i]=c??this._$Ej?.get(i)??c,this._$Em=null}}requestUpdate(e,s,n,i=false,a){if(e!==void 0){const o=this.constructor;if(i===false&&(a=this[e]),n??=o.getPropertyOptions(e),!((n.hasChanged??rt)(a,s)||n.useDefault&&n.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,n))))return;this.C(e,s,n)}this.isUpdatePending===false&&(this._$ES=this._$EP())}C(e,s,{useDefault:n,reflect:i,wrapped:a},o){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??s??this[e]),a!==true||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(s=void 0),this._$AL.set(e,s)),i===true&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=true;try{await this._$ES}catch(s){Promise.reject(s)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[i,a]of this._$Ep)this[i]=a;this._$Ep=void 0}const n=this.constructor.elementProperties;if(n.size>0)for(const[i,a]of n){const{wrapped:o}=a,c=this[i];o!==true||this._$AL.has(i)||c===void 0||this.C(i,void 0,a,c)}}let e=false;const s=this._$AL;try{e=this.shouldUpdate(s),e?(this.willUpdate(s),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(s)):this._$EM()}catch(n){throw e=false,this._$EM(),n}e&&this._$AE(s)}willUpdate(e){}_$AE(e){this._$EO?.forEach(s=>s.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=false}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return true}update(e){this._$Eq&&=this._$Eq.forEach(s=>this._$ET(s,this[s])),this._$EM()}updated(e){}firstUpdated(e){}};G.elementStyles=[],G.shadowRootOptions={mode:"open"},G[le("elementProperties")]=new Map,G[le("finalized")]=new Map,Gs?.({ReactiveElement:G}),(Te.reactiveElementVersions??=[]).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ct=globalThis,kt=t=>t,Ee=ct.trustedTypes,St=Ee?Ee.createPolicy("lit-html",{createHTML:t=>t}):void 0,os="$lit$",H=`lit$${Math.random().toFixed(9).slice(2)}$`,rs="?"+H,Vs=`<${rs}>`,K=document,pe=()=>K.createComment(""),ue=t=>t===null||typeof t!="object"&&typeof t!="function",lt=Array.isArray,Ys=t=>lt(t)||typeof t?.[Symbol.iterator]=="function",Ie=`[ 	
\f\r]`,re=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Et=/-->/g,zt=/>/g,F=RegExp(`>|${Ie}(?:([^\\s"'>=/]+)(${Ie}*=${Ie}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),At=/'/g,Tt=/"/g,cs=/^(?:script|style|textarea|title)$/i,Js=t=>(e,...s)=>({_$litType$:t,strings:e,values:s}),h=Js(1),Q=Symbol.for("lit-noChange"),f=Symbol.for("lit-nothing"),Ct=new WeakMap,B=K.createTreeWalker(K,129);function ls(t,e){if(!lt(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return St!==void 0?St.createHTML(e):e}const Xs=(t,e)=>{const s=t.length-1,n=[];let i,a=e===2?"<svg>":e===3?"<math>":"",o=re;for(let c=0;c<s;c++){const r=t[c];let d,l,p=-1,u=0;for(;u<r.length&&(o.lastIndex=u,l=o.exec(r),l!==null);)u=o.lastIndex,o===re?l[1]==="!--"?o=Et:l[1]!==void 0?o=zt:l[2]!==void 0?(cs.test(l[2])&&(i=RegExp("</"+l[2],"g")),o=F):l[3]!==void 0&&(o=F):o===F?l[0]===">"?(o=i??re,p=-1):l[1]===void 0?p=-2:(p=o.lastIndex-l[2].length,d=l[1],o=l[3]===void 0?F:l[3]==='"'?Tt:At):o===Tt||o===At?o=F:o===Et||o===zt?o=re:(o=F,i=void 0);const m=o===F&&t[c+1].startsWith("/>")?" ":"";a+=o===re?r+Vs:p>=0?(n.push(d),r.slice(0,p)+os+r.slice(p)+H+m):r+H+(p===-2?c:m)}return[ls(t,a+(t[s]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]};class he{constructor({strings:e,_$litType$:s},n){let i;this.parts=[];let a=0,o=0;const c=e.length-1,r=this.parts,[d,l]=Xs(e,s);if(this.el=he.createElement(d,n),B.currentNode=this.el.content,s===2||s===3){const p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(i=B.nextNode())!==null&&r.length<c;){if(i.nodeType===1){if(i.hasAttributes())for(const p of i.getAttributeNames())if(p.endsWith(os)){const u=l[o++],m=i.getAttribute(p).split(H),g=/([.?@])?(.*)/.exec(u);r.push({type:1,index:a,name:g[2],strings:m,ctor:g[1]==="."?en:g[1]==="?"?tn:g[1]==="@"?sn:Ce}),i.removeAttribute(p)}else p.startsWith(H)&&(r.push({type:6,index:a}),i.removeAttribute(p));if(cs.test(i.tagName)){const p=i.textContent.split(H),u=p.length-1;if(u>0){i.textContent=Ee?Ee.emptyScript:"";for(let m=0;m<u;m++)i.append(p[m],pe()),B.nextNode(),r.push({type:2,index:++a});i.append(p[u],pe())}}}else if(i.nodeType===8)if(i.data===rs)r.push({type:2,index:a});else{let p=-1;for(;(p=i.data.indexOf(H,p+1))!==-1;)r.push({type:7,index:a}),p+=H.length-1}a++}}static createElement(e,s){const n=K.createElement("template");return n.innerHTML=e,n}}function ee(t,e,s=t,n){if(e===Q)return e;let i=n!==void 0?s._$Co?.[n]:s._$Cl;const a=ue(e)?void 0:e._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(false),a===void 0?i=void 0:(i=new a(t),i._$AT(t,s,n)),n!==void 0?(s._$Co??=[])[n]=i:s._$Cl=i),i!==void 0&&(e=ee(t,i._$AS(t,e.values),i,n)),e}class Qs{constructor(e,s){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:s},parts:n}=this._$AD,i=(e?.creationScope??K).importNode(s,true);B.currentNode=i;let a=B.nextNode(),o=0,c=0,r=n[0];for(;r!==void 0;){if(o===r.index){let d;r.type===2?d=new ge(a,a.nextSibling,this,e):r.type===1?d=new r.ctor(a,r.name,r.strings,this,e):r.type===6&&(d=new nn(a,this,e)),this._$AV.push(d),r=n[++c]}o!==r?.index&&(a=B.nextNode(),o++)}return B.currentNode=K,i}p(e){let s=0;for(const n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,s),s+=n.strings.length-2):n._$AI(e[s])),s++}}class ge{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,s,n,i){this.type=2,this._$AH=f,this._$AN=void 0,this._$AA=e,this._$AB=s,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??true}get parentNode(){let e=this._$AA.parentNode;const s=this._$AM;return s!==void 0&&e?.nodeType===11&&(e=s.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,s=this){e=ee(this,e,s),ue(e)?e===f||e==null||e===""?(this._$AH!==f&&this._$AR(),this._$AH=f):e!==this._$AH&&e!==Q&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Ys(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==f&&ue(this._$AH)?this._$AA.nextSibling.data=e:this.T(K.createTextNode(e)),this._$AH=e}$(e){const{values:s,_$litType$:n}=e,i=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=he.createElement(ls(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(s);else{const a=new Qs(i,this),o=a.u(this.options);a.p(s),this.T(o),this._$AH=a}}_$AC(e){let s=Ct.get(e.strings);return s===void 0&&Ct.set(e.strings,s=new he(e)),s}k(e){lt(this._$AH)||(this._$AH=[],this._$AR());const s=this._$AH;let n,i=0;for(const a of e)i===s.length?s.push(n=new ge(this.O(pe()),this.O(pe()),this,this.options)):n=s[i],n._$AI(a),i++;i<s.length&&(this._$AR(n&&n._$AB.nextSibling,i),s.length=i)}_$AR(e=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);e!==this._$AB;){const n=kt(e).nextSibling;kt(e).remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class Ce{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,s,n,i,a){this.type=1,this._$AH=f,this._$AN=void 0,this.element=e,this.name=s,this._$AM=i,this.options=a,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=f}_$AI(e,s=this,n,i){const a=this.strings;let o=false;if(a===void 0)e=ee(this,e,s,0),o=!ue(e)||e!==this._$AH&&e!==Q,o&&(this._$AH=e);else{const c=e;let r,d;for(e=a[0],r=0;r<a.length-1;r++)d=ee(this,c[n+r],s,r),d===Q&&(d=this._$AH[r]),o||=!ue(d)||d!==this._$AH[r],d===f?e=f:e!==f&&(e+=(d??"")+a[r+1]),this._$AH[r]=d}o&&!i&&this.j(e)}j(e){e===f?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class en extends Ce{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===f?void 0:e}}class tn extends Ce{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==f)}}class sn extends Ce{constructor(e,s,n,i,a){super(e,s,n,i,a),this.type=5}_$AI(e,s=this){if((e=ee(this,e,s,0)??f)===Q)return;const n=this._$AH,i=e===f&&n!==f||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,a=e!==f&&(n===f||i);i&&this.element.removeEventListener(this.name,this,n),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class nn{constructor(e,s,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=s,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){ee(this,e)}}const an=ct.litHtmlPolyfillSupport;an?.(he,ge),(ct.litHtmlVersions??=[]).push("3.3.3");const on=(t,e,s)=>{const n=s?.renderBefore??e;let i=n._$litPart$;if(i===void 0){const a=s?.renderBefore??null;n._$litPart$=i=new ge(e.insertBefore(pe(),a),a,void 0,s??{})}return i._$AI(t),i};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const dt=globalThis;class V extends G{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const s=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=on(s,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false)}render(){return Q}}V._$litElement$=true,V.finalized=true,dt.litElementHydrateSupport?.({LitElement:V});const rn=dt.litElementPolyfillSupport;rn?.({LitElement:V});(dt.litElementVersions??=[]).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ds=t=>(e,s)=>{s!==void 0?s.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const cn={attribute:true,type:String,converter:Se,reflect:false,hasChanged:rt},ln=(t=cn,e,s)=>{const{kind:n,metadata:i}=s;let a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),n==="setter"&&((t=Object.create(t)).wrapped=true),a.set(s.name,t),n==="accessor"){const{name:o}=s;return{set(c){const r=e.get.call(this);e.set.call(this,c),this.requestUpdate(o,r,t,true,c)},init(c){return c!==void 0&&this.C(o,void 0,t,c),c}}}if(n==="setter"){const{name:o}=s;return function(c){const r=this[o];e.call(this,c),this.requestUpdate(o,r,t,true,c)}}throw Error("Unsupported decorator location: "+n)};function pt(t){return(e,s)=>typeof s=="object"?ln(t,e,s):((n,i,a)=>{const o=i.hasOwnProperty(a);return i.constructor.createProperty(a,n),o?Object.getOwnPropertyDescriptor(i,a):void 0})(t,e,s)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function b(t){return pt({...t,state:true,attribute:false})}const ps="0.7.6",ut="multizone-climate-scheduler-card",us="Multi-Zone Climate Scheduler Card",hs=`${ut}-editor`;function N(t){return(t??[]).map(e=>typeof e=="string"?{entity:e}:e).filter(e=>!!e&&typeof e.entity=="string"&&e.entity!=="").map(e=>{const s=e.last_seen;if(!("last_seen"in e))return e;if(typeof s=="string"&&s.trim()&&s.length<=255){const a=s.trim();return a===s?e:{...e,last_seen:a}}const{last_seen:n,...i}=e;return i})}function Ve(t){const e={entity:t.entity};return t.name?.trim()&&(e.name=t.name),typeof t.last_seen=="string"&&t.last_seen.trim()&&(e.last_seen=t.last_seen),e.name||e.last_seen?e:t.entity}const ht=3,ms=45;function Y(t){const e=t?.last_seen,s=Number(t?.ageing_minutes),n=Number(t?.stale_hours);return{lastSeen:e==="off"||e==="ageing"||e==="always"?e:"always",ageingMs:Number.isFinite(s)&&s>0?s*6e4:ms*6e4,staleMs:Number.isFinite(n)&&n>0?n*36e5:ht*36e5}}function te(t){const e=t?.eco_preset;return e===false?null:typeof e=="string"&&e.trim()?e.trim():"eco"}function J(t){const e=t?.off_peak_entity;if(typeof e!="string"||!e.trim())return null;const s=t?.off_peak_offset,n=typeof s=="number"&&Number.isFinite(s)?Math.round(Math.min(10,Math.max(0,s))):2;return{entity:e.trim(),offsetSeed:n}}function Re(t){if(!t||!Array.isArray(t.zones??[]))throw new Error("zones must be a list of { entity, name } items.");const e=t.zones??[];if(e.length>4)throw new Error("A maximum of 4 zones is supported.");if(t.seasons!==void 0&&!Array.isArray(t.seasons))throw new Error("seasons must be a list of { key, name, default_mode } items.");if(Array.isArray(t.seasons)&&t.seasons.some(a=>!a||typeof a!="object"))throw new Error('Every seasons entry must be a { key, name, default_mode } item (an empty "-" is not one).');e.forEach((a,o)=>{if(!a||typeof a!="object")throw new Error(`Zone ${o+1} must be a { entity, name } item.`);if(a.room_sensors!==void 0&&!Array.isArray(a.room_sensors))throw new Error(`Zone ${o+1}: room_sensors must be a list of sensor entity ids (one per line with a leading "-").`)});const s=e.map(a=>({...a,name:typeof a.name=="string"&&a.name.trim()?a.name:a.entity?a.entity.split(".")[1].replace(/_/g," "):"Zone"})),n=t.features?.fan_timer,i=t.features?{...t.features,fan_timer:Array.isArray(n)?n:typeof n=="number"?[n]:void 0}:void 0;return{...t,zones:s,...i?{features:i}:{}}}const mt={fan_timer:{domain:"timer",suffix:"fan"},room_override_timer:{domain:"timer",suffix:"room_override"},running_sensor:{domain:"binary_sensor",suffix:"running"},runtime_today:{domain:"sensor",suffix:"runtime_today"},runtime_mirror:{domain:"sensor",suffix:"runtime_mirror"},expected_runtime:{domain:"sensor",suffix:"expected_runtime"},target_room_select:{domain:"input_select",suffix:"target_room"},steer_target:{domain:"input_number",suffix:"steer_target"},sensor_schedule:{domain:"schedule",suffix:"sensor_schedule"},applied_block_marker:{domain:"input_text",suffix:"applied_block"},zone_enabled:{domain:"input_boolean",suffix:"enabled"},k_factor:{domain:"input_number",suffix:"k"}},ft={season_select:{domain:"input_select",suffix:"season"},season_mode:{domain:"input_select",suffix:"season_mode"},season_confirm_days:{domain:"input_number",suffix:"season_confirm_days"},season_dwell_days:{domain:"input_number",suffix:"season_dwell_days"},dev_green_max:{domain:"input_number",suffix:"dev_green_max"},dev_amber_max:{domain:"input_number",suffix:"dev_amber_max"},runtime_alert_margin:{domain:"input_number",suffix:"runtime_alert_margin"},runtime_alert_days:{domain:"input_number",suffix:"runtime_alert_days"},runtime_learn_days:{domain:"input_number",suffix:"runtime_learn_days"},cdd_base:{domain:"input_number",suffix:"cdd_base"},override_minutes:{domain:"input_number",suffix:"override_minutes"},steer_min_setpoint:{domain:"input_number",suffix:"steer_min_setpoint"},steer_max_setpoint:{domain:"input_number",suffix:"steer_max_setpoint"},steer_max_offset:{domain:"input_number",suffix:"steer_max_offset"},off_peak_offset:{domain:"input_number",suffix:"off_peak_offset"},off_peak_paused_on:{domain:"input_text",suffix:"off_peak_paused_on"},next_block_sensor:{domain:"sensor",suffix:"next_block"},outdoor_temp_sensor:{domain:"sensor",suffix:"outdoor_temp"},outdoor_daily_mean:{domain:"sensor",suffix:"outdoor_daily_mean"},theme:{domain:"input_text",suffix:"theme"}},Ye=new Set([...Object.values(mt).map(t=>t.suffix),...Object.values(ft).map(t=>t.suffix)]);function C(t){return t.toLowerCase().replace(/['’]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function w(t,e,s){const n=mt[t];return`${n.domain}.${e}_${s}_${n.suffix}`}function de(t,e,s){return`schedule.${t}_${e}_${s}`}function dn(t,e){const s=t?.find(n=>n?.name===e);return s?String(s.key):C(e)}function k(t,e){const s=ft[t];return`${s.domain}.${e}_${s.suffix}`}function D(t,e){return`${t}_mzcs_${e}`}function pn(t,e,s){return`automation.${j(t,e,s).toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}`}function j(t,e,s){const n=t.charAt(0).toUpperCase()+t.slice(1);return{engine:`${n}: schedule engine`,fan_timer:`${n}: ${s??"?"} fan timer finished`,season_recommender:`${n}: season recommender`,runtime_alert:`${n}: runtime anomaly alert`,runtime_learning:`${n}: runtime learning`,watchdog:`${n}: engine watchdog`,steering:`${n}: comfort steering`}[e]??`${n}: ${e}`}const un=Object.entries(ft),hn=Object.entries(mt);function ze(t,e,s,n){const i=t.indexOf(".");if(i<0)return null;const a=t.slice(0,i),o=t.slice(i+1);if(o!==e&&!o.startsWith(`${e}_`))return null;const c=o.slice(e.length+1);for(const[d,l]of un)if(a===l.domain&&c===l.suffix)return{cls:d};const r=[...s].sort((d,l)=>l.length-d.length);for(const d of r){if(c!==d&&!c.startsWith(`${d}_`))continue;const l=c.slice(d.length+1);for(const[p,u]of hn)if(a===u.domain&&l===u.suffix)return{cls:p,zone:d};if(a==="schedule"&&n.includes(l))return{cls:"zone_schedule",zone:d,season:l}}return null}const M=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"],fs=["monday","tuesday","wednesday","thursday","friday"],mn=["saturday","sunday"];function fn(t){const e=[];t.length===0&&e.push("A day needs at least one block.");const s=new Set;for(const n of t)/^([01]\d|2[0-3]):[0-5]\d$/.test(n.time)||e.push(`Bad time "${n.time}".`),s.has(n.time)&&e.push(`Duplicate block time ${n.time}.`),s.add(n.time),n.mode==="cool"&&n.cool_temp==null&&e.push(`${n.name}: cool needs cool_temp.`),n.mode==="heat"&&n.heat_temp==null&&e.push(`${n.name}: heat needs heat_temp.`),n.mode==="heat_cool"&&(n.cool_temp==null||n.heat_temp==null)&&e.push(`${n.name}: heat_cool needs both cool_temp and heat_temp.`),n.cool_temp!=null&&n.heat_temp!=null&&n.heat_temp>=n.cool_temp&&e.push(`${n.name}: heat_temp must be below cool_temp.`);return e}function Ne(t){return{block:t.name,mode:t.mode,...t.cool_temp!=null?{cool_temp:t.cool_temp}:{},...t.heat_temp!=null?{heat_temp:t.heat_temp}:{}}}function _n(t){const e=fn(t);if(e.length>0)throw new Error(e.join(" "));const s=[...t].sort((o,c)=>o.time.localeCompare(c.time)),n=s[0],i=s[s.length-1];if(s.length===1)return[{from:"00:00:00",to:"24:00:00",data:Ne(n)}];const a=[];n.time!=="00:00"&&a.push({from:"00:00:00",to:`${n.time}:00`,data:Ne(i)});for(let o=0;o<s.length;o++){const c=s[o],r=s[o+1];a.push({from:`${c.time}:00`,to:r?`${r.time}:00`:"24:00:00",data:Ne(c)})}return a}function _s(t,e){if(t==="all"&&e==="all")return M;if(t==="wdwe"&&e==="wd")return fs;if(t==="wdwe"&&e==="we")return mn;if(t==="days"&&M.includes(e.toLowerCase()))return[e.toLowerCase()];throw new Error(`Unknown set "${e}" for granularity "${t}".`)}function gn(t,e){const s={};for(const[n,i]of Object.entries(e)){const a=_n(i);for(const o of _s(t,n))s[o]=a}for(const n of M)if(!s[n])throw new Error(`No block set covers ${n}.`);return s}function yn(t,e,s){if(t===e)return s;const n=i=>{const a=s[i];if(!a)throw new Error(`Missing set "${i}" for transition ${t}\u2192${e}.`);return a.map(o=>({...o}))};if(t==="all"&&e==="wdwe")return{wd:n("all"),we:n("all")};if(t==="all"&&e==="days")return Object.fromEntries(M.map(i=>[i,n("all")]));if(t==="wdwe"&&e==="days")return Object.fromEntries(M.map(i=>[i,fs.includes(i)?n("wd"):n("we")]));if(t==="wdwe"&&e==="all")return{all:n("wd")};if(t==="days"&&e==="wdwe")return{wd:n("monday"),we:n("saturday")};if(t==="days"&&e==="all")return{all:n("monday")};throw new Error(`Unsupported transition ${t}\u2192${e}.`)}const se="Managed by Multi-Zone Climate Scheduler Card (mzcs).";function _t(t){return`{${t.map(e=>`${bn(e.name)}: '${e.key}'`).join(", ")}}`}function bn(t){return t.includes("'")?`"${t.replace(/\\/g,"\\\\").replace(/"/g,'\\"')}"`:`'${t}'`}function me(t){if(Array.isArray(t))return`[${t.map(me).join(",")}]`;if(t!==null&&typeof t=="object"){const e=t;return`{${Object.keys(e).sort().map(s=>`${JSON.stringify(s)}:${me(e[s])}`).join(",")}}`}return JSON.stringify(t)}function vn(t){const e=me(t);let s=5381;for(let n=0;n<e.length;n++)s=(s<<5)+s+e.charCodeAt(n)>>>0;return s.toString(16).padStart(8,"0")}const gs=/\[mzcs-sig:([0-9a-f]{8})\]/;function fe(t){const e=typeof t=="string"?t.match(gs):null;return e?e[1]:null}function _e(t){const e=String(t.description??"").replace(gs,"").trimEnd();return vn({...t,description:e})}function ne(t){const e=_e(t);return{...t,description:`${String(t.description??"")} [mzcs-sig:${e}]`}}function $n(t,e,s,n,i="eco",a=null,o=false){const c=d=>fe(d.description),r={[D(t,"engine")]:c(bs(t,e,s,i,a,o)),[D(t,"watchdog")]:c(xs(t)),[D(t,"runtime_learning")]:c(ws(t,e)),[D(t,"runtime_alert")]:c(ks(t,e))};o&&(r[D(t,"steering")]=c($s(t,e,s,i)));for(const d of e)r[D(t,`fan_timer_${d.slug}`)]=c(vs(t,d,n));return r}const ys="season ~ '|' ~ blk ~ '|' ~ blk_mode ~ '|' ~ blk_cool ~ '|' ~ blk_heat",wn=`{{ ${ys} }}`;function xn(t,e){const s={step:{alias:"Compute the applied-block marker",variables:{mark:wn}},coolExpr:"{{ blk_cool }}",heatExpr:"{{ blk_heat }}",singleExpr:"{{ blk_cool if blk_cool is not none else blk_heat }}",markerExpr:"mark"},n=e===null?"":e.replace(/['"\\]/g,"").trim();if(!n)return s;const i=k("off_peak_offset",t),a=k("off_peak_paused_on",t);return{step:{alias:"Compute the applied setpoints (off-peak comfort)",variables:{adj:`{{ (states('${i}') | float(0)) if is_state('${n}', 'on') and ((states('${a}') | as_datetime) is none or (states('${a}') | as_datetime | as_local).date() != now().date()) else 0 }}`,hc_adj:"{{ [ adj, [ ((blk_cool | float(0)) - (blk_heat | float(0)) - 2) / 2, 0 ] | max ] | min if blk_cool is not none and blk_heat is not none else adj }}",app_cool:"{{ (blk_cool | float(0)) - adj if blk_cool is not none else none }}",app_heat:"{{ (blk_heat | float(0)) + adj if blk_heat is not none else none }}",app_hi:"{{ (blk_cool | float(0)) - hc_adj if blk_cool is not none else none }}",app_lo:"{{ (blk_heat | float(0)) + hc_adj if blk_heat is not none else none }}",mark:`{{ ${ys} ~ '|op' ~ adj }}`}},coolExpr:"{{ app_hi }}",heatExpr:"{{ app_lo }}",singleExpr:"{{ app_cool if blk_cool is not none else app_heat }}",markerExpr:"mark"}}function kn(t,e,s){const n=s.map(i=>` and ${i}`).join("");return`{{ is_state(repeat.item.enabled, 'on') and blk is not none and states(repeat.item.climate) not in ['unavailable', 'unknown'] and ${t} != states(repeat.item.marker)${e}${n} }}`}function bs(t,e,s,n="eco",i=null,a=false){const o=n===null?null:n.replace(/['"\\]/g,"").trim()||"eco",c=o===null?"":o==="eco"?" Zones stand down while their Eco preset is active.":` Zones stand down while their '${o}' preset is active.`,r=o===null?"Skip when zone disabled, already applied, or no block data":o==="eco"?"Skip when zone disabled, already applied, Eco active, or no block data":"Skip when zone disabled, already applied, standby preset active, or no block data",d=o===null?"":` and state_attr(repeat.item.climate, 'preset_mode') != '${o}'`,l=e.flatMap(_=>s.map(z=>de(t,_.slug,z.key))),p=e.map(_=>w("zone_enabled",t,_.slug)),u=_t(s),m=xn(t,i),g=m.step?" On off-peak days (per the configured entity) applied setpoints shift toward comfort by the off-peak offset helper.":"",S=a?" Comfort steering owns a zone while its room-override timer is active; this engine skips it until the steering automation reverts.":"";return ne({id:D(t,"engine"),alias:j(t,"engine"),description:`${se} Applies the active season's schedule block to each ENABLED zone at block transitions. Per-zone applied-block markers mean manual changes and external raises HOLD until the next block; the 15-minute tick only recovers missed transitions.${c} heat_cool blocks apply dual setpoints.${g}${S}`,mode:"queued",max:5,triggers:[{trigger:"state",entity_id:l,alias:"Any zone schedule changed"},{trigger:"homeassistant",event:"start",alias:"HA started"},{trigger:"time_pattern",minutes:"/15",alias:"Safety tick"},{trigger:"state",entity_id:k("season_select",t),alias:"Season changed"},{trigger:"state",entity_id:p,to:"on",alias:"Zone re-enabled"},...a?[{trigger:"state",entity_id:e.map(_=>w("applied_block_marker",t,_.slug)),to:"",alias:"Steering released a zone"}]:[]],conditions:[],actions:[{alias:"Resolve the active season key",variables:{season:`{{ ${u}.get(states('${k("season_select",t)}'), states('${k("season_select",t)}') | lower) }}`}},{alias:"Apply per zone",repeat:{for_each:e.map(_=>({zone:_.slug,climate:_.climate,marker:w("applied_block_marker",t,_.slug),enabled:w("zone_enabled",t,_.slug),...a?{override_timer:w("room_override_timer",t,_.slug)}:{}})),sequence:[{alias:"Read this zone's active block",variables:{blk:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'block') }}`,blk_mode:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'mode') }}`,blk_cool:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'cool_temp') }}`,blk_heat:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'heat_temp') }}`}},...m.step?[m.step]:[],{alias:r,condition:"template",value_template:kn(m.markerExpr,d,a?["not (is_state(repeat.item.override_timer, 'active') and blk_mode == 'cool' and is_state(repeat.item.climate, 'cool'))"]:[])},{alias:"Apply the block (dual range, off, or single target)",continue_on_error:true,choose:[{conditions:[{condition:"template",value_template:"{{ blk_mode == 'heat_cool' }}"}],sequence:[{alias:"Apply heat_cool range",action:"climate.set_temperature",target:{entity_id:"{{ repeat.item.climate }}"},data:{target_temp_high:m.coolExpr,target_temp_low:m.heatExpr,hvac_mode:"heat_cool"}}]},{conditions:[{condition:"template",value_template:"{{ blk_mode == 'off' }}"}],sequence:[{alias:"Turn the zone off",action:"climate.set_hvac_mode",target:{entity_id:"{{ repeat.item.climate }}"},data:{hvac_mode:"off"}}]},{conditions:[{condition:"template",value_template:"{{ blk_cool is not none or blk_heat is not none }}"}],sequence:[{alias:"Apply single target",action:"climate.set_temperature",target:{entity_id:"{{ repeat.item.climate }}"},data:{temperature:m.singleExpr,hvac_mode:"{{ blk_mode }}"}}]}],default:[]},{alias:"Record the applied block",action:"input_text.set_value",target:{entity_id:"{{ repeat.item.marker }}"},data:{value:`{{ ${m.markerExpr} }}`}}]}}]})}function vs(t,e,s){return ne({id:D(t,`fan_timer_${e.slug}`),alias:j(t,"fan_timer",e.name),description:`${se} Turns the ${e.name} fan off when its fan timer ends.`,mode:"single",triggers:[{trigger:"event",event_type:"timer.finished",event_data:{entity_id:w("fan_timer",t,e.slug)},alias:`${e.name} fan timer finished`}],conditions:s?[{alias:"Stand down while the fan-guard helper wants the fan running",condition:"state",entity_id:s,state:"off"}]:[],actions:[{alias:`Turn the ${e.name} fan off`,action:"climate.set_fan_mode",target:{entity_id:e.climate},data:{fan_mode:"off"}}]})}function $s(t,e,s,n="eco"){const i=n===null?null:n.replace(/['"\\]/g,"").trim()||"eco",a=i===null?"":` and state_attr(repeat.item.climate, 'preset_mode') != '${i}'`,o=u=>w("room_override_timer",t,u.slug),c=u=>`states(${u}) | float(-999) > -900 and states[${u}] is not none and now() - states[${u}].last_reported < timedelta(hours=3) and (repeat.item.seens.get(${u}) is none or ((states(repeat.item.seens.get(${u})) | as_datetime) is not none and now() - (states(repeat.item.seens.get(${u})) | as_datetime) < timedelta(hours=3)))`,r=e.filter(u=>(u.rooms??[]).length>0),d=[...new Set(r.flatMap(u=>(u.rooms??[]).map(m=>m.entity)))],l=`{${e.map(u=>`'${o(u)}': '${w("applied_block_marker",t,u.slug)}'`).join(", ")}}`,p=k("season_select",t);return ne({id:D(t,"steering"),alias:j(t,"steering"),description:`${se} Drives a zone's thermostat so the SELECTED ROOM reaches the override target while the room-override timer runs (cool only). Commanded setpoint = thermostat reading minus how far the room is above target, clamped to the steering band and to the max offset from the scheduled block. When the timer ends or is cancelled, the applied-block marker is cleared so the schedule engine re-asserts the block on its next trigger.`,mode:"queued",max:25,triggers:[...d.length?[{trigger:"state",entity_id:d,alias:"A steered room reading changed"}]:[],...r.length?[{trigger:"state",entity_id:r.map(u=>w("sensor_schedule",t,u.slug)),alias:"A daypart boundary passed"}]:[],{trigger:"state",entity_id:e.map(u=>o(u)),to:"active",alias:"An override started"},...e.map(u=>({trigger:"event",event_type:"timer.finished",event_data:{entity_id:o(u)},alias:`${u.name} override timer finished`})),...e.map(u=>({trigger:"event",event_type:"timer.cancelled",event_data:{entity_id:o(u)},alias:`${u.name} override cancelled`})),{trigger:"time_pattern",minutes:"/5",alias:"Safety tick"},{trigger:"homeassistant",event:"start",alias:"HA started"}],conditions:[],actions:[{alias:"Revert on a timer event, steer otherwise",choose:[{conditions:[{condition:"template",value_template:"{{ trigger.platform == 'event' }}"}],sequence:[{alias:"Resolve which zone's override ended",variables:{marker:`{{ ${l}.get(trigger.event.data.entity_id) }}`}},{alias:"Only timers this card manages",condition:"template",value_template:"{{ marker is not none }}"},{alias:"Clear the applied-block marker so the engine re-asserts the schedule",action:"input_text.set_value",target:{entity_id:"{{ marker }}"},data:{value:""}}]}],default:[{alias:"Resolve the active season key",variables:{season:`{{ ${_t(s)}.get(states('${p}'), states('${p}') | lower) }}`}},{alias:"Steer each zone with an active override",repeat:{for_each:r.map(u=>({zone:u.slug,climate:u.climate,timer:o(u),select:w("target_room_select",t,u.slug),target:w("steer_target",t,u.slug),enabled:w("zone_enabled",t,u.slug),sensor_schedule:w("sensor_schedule",t,u.slug),rooms:Object.fromEntries((u.rooms??[]).map(m=>[m.label,m.entity])),labels:Object.fromEntries((u.rooms??[]).map(m=>[m.entity,m.label])),seens:Object.fromEntries((u.rooms??[]).filter(m=>m.seen).map(m=>[m.entity,m.seen]))})),sequence:[{alias:"Resolve this zone's steering inputs",variables:{room:"{{ repeat.item.rooms.get(states(repeat.item.select)) }}",blk_mode:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'mode') }}`,blk_cool:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'cool_temp') }}`,dp_label:"{{ repeat.item.labels.get(state_attr(repeat.item.sensor_schedule, 'sensor')) }}",dp_room:"{{ repeat.item.rooms.get(dp_label) }}",dp_fresh:`{{ dp_room is not none and ${c("dp_room")} }}`}},{alias:"Daypart pilot - start the scheduled steer when no override is running",choose:[{conditions:[{condition:"template",value_template:`{{ dp_label is not none and is_state(repeat.item.timer, 'idle') and is_state(repeat.item.enabled, 'on') and blk_mode == 'cool' and blk_cool is not none and blk_cool | float(0) >= 50 and blk_cool | float(0) <= 95 and dp_fresh${a} }}`}],sequence:[{alias:"Point the zone at the daypart room",continue_on_error:true,action:"input_select.select_option",target:{entity_id:"{{ repeat.item.select }}"},data:{option:"{{ dp_label }}"}},{alias:"Target the scheduled setpoint at that room",continue_on_error:true,action:"input_number.set_value",target:{entity_id:"{{ repeat.item.target }}"},data:{value:"{{ blk_cool | float }}"}},{alias:"Run the override until the daypart ends",continue_on_error:true,action:"timer.start",target:{entity_id:"{{ repeat.item.timer }}"},data:{duration:"{{ [ ((state_attr(repeat.item.sensor_schedule, 'next_event') - now()).total_seconds() | int) if state_attr(repeat.item.sensor_schedule, 'next_event') is not none else 1800, 300 ] | max }}"}}]}],default:[]},{alias:"Cancel the override if its zone was disabled mid-override",choose:[{conditions:[{condition:"template",value_template:"{{ is_state(repeat.item.timer, 'active') and not is_state(repeat.item.enabled, 'on') }}"}],sequence:[{alias:"Cancel this override - the kill switch outranks steering",continue_on_error:true,action:"timer.cancel",target:{entity_id:"{{ repeat.item.timer }}"}}]}],default:[]},{alias:"Steer only an enabled zone with an active override on a cooling block",condition:"template",value_template:`{{ is_state(repeat.item.timer, 'active') and is_state(repeat.item.enabled, 'on') and room is not none and blk_mode == 'cool' and blk_cool is not none${a} }}`},{alias:"Read the room, the thermostat and the target",variables:{t_room:"{{ states(room) | float(-999) }}",room_fresh:`{{ ${c("room")} }}`,t_thermo:"{{ state_attr(repeat.item.climate, 'current_temperature') }}",t_target:"{{ states(repeat.item.target) | float(-999) }}"}},{alias:"Refuse stale or unreadable inputs - the last commanded value stands",condition:"template",value_template:"{{ room_fresh and t_target > -900 and t_thermo is not none and state_attr(repeat.item.climate, 'temperature') is not none }}"},{alias:"Compute the commanded setpoint, clamped to the band and the block offset",variables:{smin:`{{ states('${k("steer_min_setpoint",t)}') | float(68) }}`,smax:`{{ states('${k("steer_max_setpoint",t)}') | float(85) }}`,moff:`{{ states('${k("steer_max_offset",t)}') | float(5) }}`,commanded:"{{ [ [ [ [ (t_thermo | float) - (t_room - t_target), (blk_cool | float) - moff ] | max, (blk_cool | float) + moff ] | min, smin ] | max, smax ] | min | round(1) }}"}},{alias:"Skip a write smaller than half a degree",condition:"template",value_template:"{{ (commanded - (state_attr(repeat.item.climate, 'temperature') | float(-999))) | abs >= 0.5 }}"},{alias:"Steer the zone toward the target room",continue_on_error:true,action:"climate.set_temperature",target:{entity_id:"{{ repeat.item.climate }}"},data:{temperature:"{{ commanded }}"}}]}}]}]})}function ws(t,e){return ne({id:D(t,"runtime_learning"),alias:j(t,"runtime_learning"),description:`${se} Nightly EMA update of each zone's runtime-per-cooling-degree-day factor. Skips mild days; first valid day seeds directly.`,mode:"single",triggers:[{trigger:"time",at:"23:58:00",alias:"Nightly close"}],conditions:[],actions:[{alias:"Compute today's cooling degree-days",variables:{cdd:`{{ [ (states('sensor.${t}_outdoor_daily_mean') | float(0)) - (states('${k("cdd_base",t)}') | float(75)), 0 ] | max }}`,alpha:`{{ 2 / ((states('${k("runtime_learn_days",t)}') | float(30)) + 1) }}`}},{alias:"Skip mild days",condition:"template",value_template:"{{ cdd > 0.5 }}"},{alias:"Update k per zone",repeat:{for_each:e.map(s=>({runtime:w("runtime_today",t,s.slug),k:w("k_factor",t,s.slug)})),sequence:[{alias:"Compute the EMA",variables:{runtime_h:"{{ states(repeat.item.runtime) | float(-1) }}",old_k:"{{ states(repeat.item.k) | float(0) }}"}},{alias:"Skip if unavailable",condition:"template",value_template:"{{ runtime_h >= 0 }}"},{alias:"Write the new k",continue_on_error:true,action:"input_number.set_value",target:{entity_id:"{{ repeat.item.k }}"},data:{value:"{{ [ ((runtime_h / cdd) if old_k == 0 else (alpha * (runtime_h / cdd) + (1 - alpha) * old_k)), 10 ] | min | round(2) }}"}}]}}]})}function xs(t){const e="automation."+j(t,"engine").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");return ne({id:D(t,"watchdog"),alias:j(t,"watchdog"),description:`${se} Alerts when the schedule engine automation is off or unavailable for 5 minutes.`,mode:"single",triggers:[{trigger:"state",entity_id:e,to:["off","unavailable"],for:{minutes:5},alias:"Engine down"}],conditions:[],actions:[{alias:"Notify all admins via persistent notification",action:"persistent_notification.create",data:{title:"Climate schedule engine is down",message:"The Climate: schedule engine automation is off or unavailable. Zone schedules are not being applied - your thermostats hold their last setpoints (their own app schedules still work)."}}]})}function ks(t,e){return ne({id:D(t,"runtime_alert"),alias:j(t,"runtime_alert"),description:`${se} Evening check: notifies when a zone's runtime is over the weather-normalized expectation by the alert margin. Uses learned k; silent while learning.`,mode:"single",triggers:[{trigger:"time",at:"20:00:00",alias:"Evening check"}],conditions:[],actions:[{alias:"Check each zone",repeat:{for_each:e.map(s=>({name:s.name,runtime:w("runtime_today",t,s.slug),expected:w("expected_runtime",t,s.slug)})),sequence:[{alias:"Compute exceedance",variables:{run_h:"{{ states(repeat.item.runtime) | float(0) }}",exp_h:"{{ states(repeat.item.expected) | float(0) }}",margin:`{{ states('${k("runtime_alert_margin",t)}') | float(35) }}`}},{alias:"Only alert on a real, learned exceedance",condition:"template",value_template:"{{ exp_h > 0 and run_h > exp_h * (1 + margin / 100) and (run_h - exp_h) > 1 }}"},{alias:"Notify",action:"persistent_notification.create",data:{title:"HVAC running high",message:"{{ repeat.item.name }} has run {{ run_h | round(1) }}h today vs ~{{ exp_h | round(1) }}h expected for this weather. Worth a look (filters, doors, refrigerant)."}}]}}]})}const Je="mzcs",Rt="r1";function Xe(t){const e=new Set(["thermostat"]),s=new Set,n=[];for(const i of N(t)){if(s.has(i.entity))continue;s.add(i.entity);let a=i.name??i.entity;e.has(a.trim().toLowerCase())&&(a=i.entity),e.add(a.trim().toLowerCase()),n.push({label:a,entity:i.entity,...i.last_seen?{seen:i.last_seen}:{}})}return n}const Sn=[{cls:"season_confirm_days",min:1,max:14,step:1,initial:3},{cls:"season_dwell_days",min:1,max:60,step:1,initial:14},{cls:"dev_green_max",min:1,max:10,step:1,initial:2,unit:"\xB0F"},{cls:"dev_amber_max",min:1,max:15,step:1,initial:4,unit:"\xB0F"},{cls:"runtime_alert_margin",min:5,max:100,step:5,initial:35,unit:"%"},{cls:"runtime_alert_days",min:1,max:7,step:1,initial:3},{cls:"runtime_learn_days",min:7,max:60,step:1,initial:30},{cls:"cdd_base",min:60,max:80,step:1,initial:75,unit:"\xB0F"}],En=[{cls:"override_minutes",min:15,max:240,step:15,initial:60},{cls:"steer_min_setpoint",min:50,max:80,step:1,initial:68},{cls:"steer_max_setpoint",min:70,max:95,step:1,initial:85},{cls:"steer_max_offset",min:1,max:10,step:1,initial:5}];function zn(t){return gn(t.granularity,t.sets)}function An(t){t.forEach((e,s)=>{if(typeof e?.name=="string")return;const n=e?.key!=null?` (key: ${String(e.key)})`:"";throw new Error(`Season ${s+1}${n} has no name. Every season needs a display name - add \`name: ...\` to it, or configure the card with the visual editor, which requires one.`)})}function Tn(t,e){if(e===0)return;const s=new Map;t.forEach((n,i)=>{const a=String(n?.key),o=s.get(a)??[];o.push({s:n,i}),s.set(a,o)});for(const[n,i]of s){if(i.length<2)continue;if(i.every(({s:o})=>o?.key==null||String(o.key).trim()==="")){const[o]=i,c=typeof o.s?.name=="string"&&o.s.name.trim(),r=c?`"${o.s.name}"`:`at position ${o.i+1}`,d=(c?o.s.name.trim().toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""):"")||`season_${o.i+1}`;throw new Error(`${i.length} seasons are missing their required "key", so they would all resolve to the same schedule entity names and collide. The key is the permanent id used in entity names; the display name is only a label and can be renamed freely. Give each season its own key - start with \`key: ${d}\` on season ${r} - or configure the card with the visual editor, which fills keys in for you.`)}throw new Error(`${i.length} seasons share the key "${n}", so their schedule entity names collide. The key is the permanent id used in entity names and must be unique per season; the display name is only a label and can be renamed freely.`)}}function Cn(t,e){if(e===0)return;const s=new Map;t.forEach((n,i)=>{if(typeof n?.name!="string")return;const a=s.get(n.name);if(a!==void 0)throw new Error(`Seasons ${a+1} and ${i+1} share the display name "${n.name}". Season names are the options of the season selector and must be unique - rename one of them (keys can stay as they are).`);s.set(n.name,i)})}function Rn(t,e){const s=/^[a-z][a-z0-9_]*\.[a-z0-9_]+$/;for(const n of t){if(n.id.startsWith("automation:")||s.test(n.id))continue;const i=e.seasons.find(o=>o?.key!=null&&!/^[a-z0-9_]+$/.test(String(o.key))),a=/^[a-z0-9_]+$/.test(e.prefix)?i?`The season key "${String(i.key)}" must use only lowercase letters, digits and underscores (the display name can stay as it is).`:"Use only lowercase letters, digits and underscores in the prefix and season keys.":`The prefix "${e.prefix}" must use only lowercase letters, digits and underscores.`;throw new Error(`"${n.id}" is not an entity id Home Assistant can create. ${a}`)}}function ce(t){An(t.seasons),Tn(t.seasons,t.zones.length),Cn(t.seasons,t.zones.length);const e=[],s=t.prefix,n=s.charAt(0).toUpperCase()+s.slice(1);for(const p of t.zones){t.features.fan_timer&&e.push({id:w("fan_timer",s,p.slug),kind:"helper",spec:{name:`${n} ${p.name} fan`,restore:true}}),e.push({id:w("running_sensor",s,p.slug),kind:"template_sensor",spec:{name:`${n} ${p.name} running`},meta:{source:"hvac_action",...p.power?{power:p.power}:{}}}),e.push({id:w("runtime_today",s,p.slug),kind:"stats_sensor",spec:{name:`${n} ${p.name} runtime today`},meta:{model:"history_stats"}}),e.push({id:w("runtime_mirror",s,p.slug),kind:"template_sensor",spec:{name:`${n} ${p.name} runtime mirror`},meta:{model:"runtime_mirror"}}),e.push({id:w("expected_runtime",s,p.slug),kind:"template_sensor",spec:{name:`${n} ${p.name} expected runtime`},meta:{model:"k_x_cdd"}}),e.push({id:w("applied_block_marker",s,p.slug),kind:"helper",spec:{name:`${n} ${p.name} applied block`}}),e.push({id:w("zone_enabled",s,p.slug),kind:"helper",spec:{name:`${n} ${p.name} enabled`}}),e.push({id:w("k_factor",s,p.slug),kind:"helper",spec:{name:`${n} ${p.name} K`,min:0,max:10,step:.01}}),t.features.steering&&(e.push({id:w("target_room_select",s,p.slug),kind:"helper",spec:{name:`${n} ${p.name} target room`,options:["Thermostat",...(p.rooms??[]).map(u=>u.label)]}}),e.push({id:w("room_override_timer",s,p.slug),kind:"helper",spec:{name:`${n} ${p.name} room override`,restore:true}}),e.push({id:w("steer_target",s,p.slug),kind:"helper",spec:{name:`${n} ${p.name} steer target`,min:50,max:95,step:1}}),e.push({id:w("sensor_schedule",s,p.slug),kind:"schedule",spec:{name:`${n} ${p.name} sensor schedule`}}));for(const u of t.seasons){const m=t.schedules[p.slug]?.[u.key];if(!m)throw new Error(`Missing schedule for ${p.slug}/${u.key}.`);e.push({id:de(s,p.slug,u.key),kind:"schedule",spec:{name:`${n} ${p.name} ${u.name}`},meta:{week:zn(m)}})}}e.push({id:k("season_select",s),kind:"helper",spec:{name:`${n} season`,options:t.seasons.map(p=>p.name)}}),e.push({id:k("season_mode",s),kind:"helper",spec:{name:`${n} season mode`,options:["Manual","Semi-auto","Full-auto"]}});for(const p of Sn)e.push({id:k(p.cls,s),kind:"helper",spec:{name:`${n} ${p.cls.replace(/_/g," ")}`,min:p.min,max:p.max,step:p.step,...p.unit?{unit:p.unit}:{}},meta:{seed:p.initial}});if(t.features.steering)for(const p of En)e.push({id:k(p.cls,s),kind:"helper",spec:{name:`${n} ${p.cls.replace(/_/g," ")}`,min:p.min,max:p.max,step:p.step},meta:{seed:p.initial}});const i=J(t.features);i&&(e.push({id:k("off_peak_offset",s),kind:"helper",spec:{name:`${n} off peak offset`,min:0,max:10,step:1,unit:"\xB0F"},meta:{seed:i.offsetSeed}}),e.push({id:k("off_peak_paused_on",s),kind:"helper",spec:{name:`${n} off peak paused on`}})),e.push({id:k("next_block_sensor",s),kind:"template_sensor",spec:{name:`${n} next block`}});const a=t.weather_entity?{}:{conditional:true};e.push({id:k("outdoor_temp_sensor",s),kind:"template_sensor",spec:{name:`${n} outdoor temp`},meta:{source:"weather"},...a}),e.push({id:k("outdoor_daily_mean",s),kind:"stats_sensor",spec:{name:`${n} outdoor daily mean`},meta:{model:"statistics_mean"},...a}),e.push({id:k("theme",s),kind:"helper",spec:{name:`${n} theme`}});const o=t.zones.map(p=>({...p,climate:p.climate??`climate.${p.slug}`})),c=$n(s,o,t.seasons,t.features.fan_guard,te(t.features),i?.entity??null,t.features.steering),r=(p,u)=>{const m=D(s,p);return{id:`automation:${m}`,kind:"automation",spec:{alias:j(s,p,u),sig:c[m]??Rt}}};if(e.push(r("engine")),e.push(r("watchdog")),e.push(r("runtime_learning")),t.features.anomaly_alerts&&e.push(r("runtime_alert")),t.features.fan_timer)for(const p of t.zones){const u=D(s,`fan_timer_${p.slug}`);e.push({id:`automation:${u}`,kind:"automation",spec:{alias:j(s,"fan_timer",p.name),sig:c[u]??Rt}})}t.features.steering&&e.push(r("steering"));const d=new Set,l=t.seasons.find(p=>Ye.has(String(p?.key)));for(const p of e){if(d.has(p.id)){if(l&&p.id.endsWith(`_${String(l.key)}`)){const u=String(l.key),m=typeof l.name=="string"&&l.name?l.name:u;throw new Error(`Season "${m}" uses the key "${u}", which is reserved for the card's own objects - "${p.id}" is also one of the card's "${u}" entities. Give the season a different \`key\` (the display name can stay as it is).`)}throw new Error(`Naming collision: two configured objects both resolve to "${p.id}". Rename the conflicting zone or season.`)}d.add(p.id)}return Rn(e,t),e}function On(t,e){return me(t)===me(e)}function Z(t,e){const s={create:[],adopt:[],update:[],delete:[],noop:[]},n=new Map(e.map(a=>[a.id,a])),i=new Set(t.map(a=>a.id));for(const a of t){const o=n.get(a.id);if(o)o.managed?On(o.spec,a.spec)?s.noop.push({op:"noop",id:a.id,kind:a.kind}):s.update.push({op:"update",id:a.id,kind:a.kind,spec:a.spec,from:o.spec}):s.adopt.push({op:"adopt",id:a.id,kind:a.kind,spec:a.spec});else{if(a.conditional)continue;s.create.push({op:"create",id:a.id,kind:a.kind,spec:a.spec,...a.meta?{meta:a.meta}:{}})}}for(const a of n.values())a.managed&&!i.has(a.id)&&s.delete.push({op:"delete",id:a.id,kind:a.kind});return s}function Dn(t){return[...t.create,...t.adopt,...t.update,...t.delete]}function be(t){return JSON.stringify([t.create.map(e=>e.id).sort(),t.adopt.map(e=>e.id).sort(),t.update.map(e=>e.id).sort(),t.delete.map(e=>e.id).sort()])}const Mn=Object.freeze([Object.freeze({key:"summer",name:"Summer",default_mode:"cool"}),Object.freeze({key:"winter",name:"Winter",default_mode:"heat_cool"})]);function ye(){return Mn.map(t=>({...t}))}function In(t,e,s){const n=t.features?.steering===true;return{prefix:t.prefix??"climate",zones:t.zones.map(i=>({slug:s(i.name),name:i.name,climate:i.entity,...n?{rooms:Xe(i.room_sensors)}:{},...typeof i.power_entity=="string"&&i.power_entity.trim()?{power:i.power_entity.trim()}:{}})),seasons:t.seasons??ye(),schedules:e,features:{fan_timer:(t.features?.fan_timer?.length??3)>0,anomaly_alerts:t.features?.anomaly_alerts??true,steering:n,fan_guard:t.features?.fan_guard,eco_preset:t.features?.eco_preset,off_peak_entity:t.features?.off_peak_entity,off_peak_offset:t.features?.off_peak_offset},weather_entity:t.weather_entity}}const Qe="climate",Nn=["cool","heat","heat_cool","off"],Ln=["manual","semi","full"];function Ot(t,e){return typeof t=="string"&&e.includes(t)?t:"<invalid>"}function jn(t){if(!t)return"unknown";const e=a=>a.test(t),s=e(/\bEdg\//)?"Edge":e(/\bOPR\//)?"Opera":e(/\bFirefox\//)?"Firefox":e(/\bChrome\//)?"Chrome":e(/\bSafari\//)?"Safari":"other browser",n=e(/Android/)?"Android":e(/iPhone|iPad|iPod/)?"iOS":e(/Windows/)?"Windows":e(/Macintosh|Mac OS/)?"macOS":e(/Linux/)?"Linux":"unknown platform",i=e(/HomeAssistant/)?" (HA companion app)":"";return s+" on "+n+i}function Pn(t){const e={};for(const s of t)e[s]=(e[s]??0)+1;return e}function Wn(t,e){return e?t:t===Qe?Qe:"<custom>"}function Hn(t,e){return t?t==="unknown"||t==="unavailable"||t==="none"||e?t:"set":"not read"}function Fn(t,e){if(t.eco_preset===false)return"disabled";const s=te(t)??"eco";return e?s:s==="eco"?"eco (default)":"<custom>"}function Un(t){const e=t.identifiers===true;let s=t.config,n;try{s=Re(t.config)}catch(l){n=l instanceof Error?l.message:String(l)}const i=typeof s.prefix=="string"&&s.prefix.trim()||Qe,a=Array.isArray(s.seasons)?s.seasons:s.seasons==null?ye():[],o=s.features??{},c=(s.zones??[]).map((l,p)=>{const u=N(l.room_sensors);return{name:e?l.name:`Zone ${p+1}`,climate:e?l.entity:`climate.<zone_${p+1}>`,room_sensors:e?u.map(m=>({entity:m.entity,...m.name?{name:m.name}:{},...m.last_seen?{last_seen:m.last_seen}:{}})):u.map((m,g)=>({entity:`sensor.<zone_${p+1}_room_${g+1}>`,...m.last_seen?{last_seen:`sensor.<zone_${p+1}_room_${g+1}_last_seen>`}:{}})),room_sensor_count:u.length,room_sensors_labelled:u.filter(m=>!!m.name?.trim()).length,room_sensors_with_last_seen:u.filter(m=>!!m.last_seen).length}}),r=(t.zoneEnabled??[]).map((l,p)=>({zone:e?l.zone:`Zone ${(l.index??p)+1}`,scheduling:l.state})),d={card_version:t.cardVersion,ha_version:t.haVersion??"unknown",identifiers_included:e,user_agent:jn(t.userAgent),...n?{config_rejected:n}:{},config:{prefix:Wn(i,e),zone_count:c.length,zones:c,seasons_defaulted:s.seasons==null,seasons:a.filter(l=>l!=null).map((l,p)=>{const u=typeof l.name=="string"?l.name:"";return{name:e?u:`Season ${p+1}`,key_matches_name_slug:l.key===u.trim().toLowerCase().replace(/[^a-z0-9]+/g,"_"),default_mode:Ot(l.default_mode,Nn)}}),active_season:Hn(t.activeSeason,e),weather_entity:e?s.weather_entity??null:s.weather_entity?"set":null,season_switch:s.season_switch===void 0?"manual":Ot(s.season_switch,Ln),features:{fan_timer:Array.isArray(o.fan_timer)?o.fan_timer.filter(l=>typeof l=="number"&&Number.isFinite(l)):null,anomaly_alerts:o.anomaly_alerts!==false,fan_guard:e?o.fan_guard??null:o.fan_guard?"set":null,eco_preset:Fn(o,e)},display:{configured:s.display!=null,...Y(s.display)}},scheduling_switches:r.length?r:"not read",last_dry_run:t.plan?{kind:t.planKind??"setup",create:t.plan.create,adopt:t.plan.adopt,update:t.plan.update,delete:t.plan.delete,unchanged:t.plan.noop,settled:t.plan.create+t.plan.adopt+t.plan.update+t.plan.delete===0,...s.weather_entity?{}:{note:"no weather entity: outdoor sensors not provisioned, CDD learning off"}}:"not run",managed_objects:t.objectStatuses?{total:t.objectStatuses.length,by_status:Pn(t.objectStatuses)}:"not loaded"};return JSON.stringify(d,null,2)}function Le(t){if(!Number.isFinite(t)||t<0)return"";const e=Math.floor(t/1e3);if(e<60)return"now";const s=Math.floor(e/60);if(s<60)return`${s}m`;const n=Math.floor(s/60);return n<24?`${n}h`:`${Math.floor(n/24)}d`}function Bn(t,e,s){return e===void 0||t==="off"?false:t==="always"?true:e>=s}function Kn(t,e){return t!==void 0&&t>=e}function qn(t){return/_temperature$/.test(t)?t.replace(/_temperature$/,"_last_seen"):null}function Ss(t,e){const s=qn(e);if(!s)return null;const n=t.states[s];return!n||n.attributes.device_class!=="timestamp"||n.state==="unavailable"||n.state==="unknown"||!n.state?null:s}function Es(t,e,s=new Set){const n=[];return t.forEach((i,a)=>{for(const o of N(i.room_sensors)){if(o.last_seen||s.has(o.entity))continue;const c=Ss(e,o.entity);c&&n.push({zoneIndex:a,sensorEntity:o.entity,lastSeen:c})}}),n}function Zn(t,e,s,n=new Set){const i=new Set(e.map(o=>`${o.sensorEntity}|${o.lastSeen}`)),a=Es(t,s,n).filter(o=>i.has(`${o.sensorEntity}|${o.lastSeen}`));return a.length===0?t:t.map((o,c)=>{const r=a.filter(l=>l.zoneIndex===c);if(r.length===0)return o;let d=o.room_sensors;for(const l of r)d=zs(d,l.sensorEntity,l.lastSeen);return{...o,room_sensors:d}})}function zs(t,e,s){return(t??[]).map(n=>{if(n==null||typeof n!="string"&&typeof n.entity!="string")return n;const i=typeof n=="string"?{entity:n}:n;return i.entity!==e?n:Ve({...i,last_seen:s??void 0})})}function Dt(t,e){return{prefix:t.prefix,zones:t.zones.map(s=>({...s,climate:s.climate??`climate.${s.slug}`})),seasons:t.seasons,fanGuard:t.features.fan_guard,ecoPreset:te(t.features),offPeakEntity:J(t.features)?.entity??null,steering:t.features.steering===true,weatherEntity:t.weather_entity,log:e}}const Gn=new Set(["template","history_stats","statistics"]);async function je(t,e){const{objectId:s}=X(e);try{const i=(await t.callWS({type:"config/entity_registry/get_entries",entity_ids:[e]}))?.[e]?.unique_id;if(typeof i=="string"&&i)return i}catch{}return s}async function Vn(t,e){try{const s=await t.callWS({type:"config_entries/get_single",entry_id:e}),n=s?.config_entry?.domain??s?.domain;if(typeof n=="string"&&n)return n}catch{}try{const s=await t.callWS({type:"config_entries/get"}),n=Array.isArray(s)?s.find(i=>i?.entry_id===e):void 0;if(typeof n?.domain=="string"&&n.domain)return n.domain}catch{}return null}const As=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];function gt(t){return t instanceof Error?t.message:t&&typeof t=="object"?JSON.stringify(t):String(t)}function Yn(t){const e=t;return e&&(e.status_code===404||e.status===404)?true:/\b404\b|not.found/i.test(gt(t))}function X(t){const e=t.indexOf(".");return{domain:t.slice(0,e),objectId:t.slice(e+1)}}function Ts(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function xe(t,e){const s=ze(t,e.prefix,e.zones.map(n=>n.slug),e.seasons.map(n=>n.key));return s?.zone?e.zones.find(n=>n.slug===s.zone)??null:null}async function Pe(t,e,s,n){const i=`${e}.${Ts(s)}`,a=[i,...[2,3,4,5].map(o=>`${i}_${o}`)];for(let o=0;o<3;o++){try{const c=await t.callWS({type:"config/entity_registry/get_entries",entity_ids:a});for(const r of a)if(c?.[r]?.config_entry_id===n)return r}catch{}await new Promise(c=>setTimeout(c,400*(o+1)))}throw new Error(`Could not locate the entity created by flow entry ${n} (expected around ${i})`)}async function We(t,e,s,n){if(e===s)return;let i;for(let a=0;a<3;a++)try{await t.callWS({type:"config/entity_registry/update",entity_id:e,new_entity_id:s}),n.log(`Renamed ${e} -> ${s}`);return}catch(o){i=o,await new Promise(c=>setTimeout(c,400*(a+1)))}throw new Error(`Could not rename ${e} to its contract id ${s} (${i instanceof Error?i.message:"registry error"})`)}async function Jn(t,e){try{await t.callWS({type:"config/label_registry/create",name:"mzcs",color:"blue",icon:"mdi:thermostat-box"}),e.log("Created label mzcs")}catch{}}async function et(t,e){try{const n=(await t.callWS({type:"config/entity_registry/get_entries",entity_ids:[e]}))?.[e]?.labels??[];n.includes("mzcs")||await t.callWS({type:"config/entity_registry/update",entity_id:e,labels:[...n,"mzcs"]})}catch{}}async function Mt(t,e,s,n){const i=`automation.${Ts(s)}`,a=[i,...[2,3,4,5].map(o=>`${i}_${o}`)];for(let o=0;o<3;o++){try{const c=await t.callWS({type:"config/entity_registry/get_entries",entity_ids:a});for(const r of a)if(c?.[r]?.unique_id===e){await et(t,r);return}}catch{}await new Promise(c=>setTimeout(c,400*(o+1)))}n.log(`NOTE: could not resolve the entity for automation ${e} to label it - the next Apply adopts it`)}function Xn(t,e){for(const s in t.states)if(s.startsWith("automation.")&&t.states[s]?.attributes.id===e)return s;return null}async function He(t,e,s,n){if(!t.callApi)throw new Error("callApi unavailable");let i=await t.callApi("POST","config/config_entries/flow",{handler:e,show_advanced_options:true});const a={...n};for(let o=0;o<8;o++){if(i.type==="create_entry"){const c=i.result?.entry_id;if(!c)throw new Error(`Flow ${e}: created an entry but returned no entry_id`);return c}if(i.type==="menu"){if(!s)throw new Error(`Flow ${e}: unexpected menu`);i=await t.callApi("POST",`config/config_entries/flow/${i.flow_id}`,{next_step_id:s});continue}if(i.type==="form"){const c=(i.data_schema??[]).map(d=>d.name),r={};for(const d of c)d in a&&(r[d]=a[d],delete a[d]);i=await t.callApi("POST",`config/config_entries/flow/${i.flow_id}`,r);continue}throw new Error(`Flow ${e}: unhandled step type ${i.type}`)}throw new Error(`Flow ${e}: did not complete`)}function Qn(t,e,s){const{objectId:n}=X(t),i=String(e.name??n),a=s.prefix;if(t.startsWith("binary_sensor.")&&e.source==="hvac_action"){const o=xe(t,s);if(!o)return null;const c=typeof e.power=="string"&&e.power?e.power:null;return{handler:"template",menu:"binary_sensor",fields:{name:i,state:c?`{{ (states('${c}') | float(0)) > 100 or (is_state('${o.climate}', 'cool') and (state_attr('${o.climate}', 'current_temperature') | float(-9999)) - (state_attr('${o.climate}', 'temperature') | float(9999)) >= 1) or (is_state('${o.climate}', 'heat') and (state_attr('${o.climate}', 'temperature') | float(-9999)) - (state_attr('${o.climate}', 'current_temperature') | float(9999)) >= 1) }}`:`{{ state_attr('${o.climate}', 'hvac_action') in ['cooling', 'heating'] }}`,device_class:"running"}}}if(t.startsWith("sensor.")&&e.model==="runtime_mirror"){const o=xe(t,s);return o?{handler:"template",menu:"sensor",fields:{name:i,state:`{{ states('sensor.${a}_${o.slug}_runtime_today') | float(0) }}`,unit_of_measurement:"h",state_class:"measurement"}}:null}if(t.startsWith("sensor.")&&e.model==="k_x_cdd"){const o=xe(t,s);return o?{handler:"template",menu:"sensor",fields:{name:i,state:`{{ (states('input_number.${a}_${o.slug}_k') | float(0)) * ([ (states('sensor.${a}_outdoor_daily_mean') | float(0)) - (states('input_number.${a}_cdd_base') | float(75)), 0 ] | max) | round(2) }}`,unit_of_measurement:"h",state_class:"measurement"}}:null}if(t===`sensor.${a}_next_block`){const o=`input_select.${a}_season`;return{handler:"template",menu:"sensor",fields:{name:i,state:`{% set season = ${_t(s.seasons)}.get(states('${o}'), states('${o}') | lower) %}{% set evs = states.schedule | selectattr('entity_id', 'search', '^schedule\\.${a}_[a-z0-9_]+_' ~ season ~ '$') | map(attribute='attributes.next_event') | reject('none') | list %}{{ evs | min if evs | count > 0 else 'unknown' }}`}}}return t===`sensor.${a}_outdoor_temp`&&e.source==="weather"&&s.weatherEntity?{handler:"template",menu:"sensor",fields:{name:i,state:`{{ state_attr('${s.weatherEntity}', 'temperature') }}`,unit_of_measurement:"\xB0F",state_class:"measurement"}}:null}function Cs(t,e){const s=e.prefix;if(t===`${s}_mzcs_engine`)return bs(s,e.zones,e.seasons,e.ecoPreset===void 0?"eco":e.ecoPreset,e.offPeakEntity??null,e.steering??false);if(t===`${s}_mzcs_steering`)return $s(s,e.zones,e.seasons,e.ecoPreset===void 0?"eco":e.ecoPreset);if(t===`${s}_mzcs_watchdog`)return xs(s);if(t===`${s}_mzcs_runtime_learning`)return ws(s,e.zones);if(t===`${s}_mzcs_runtime_alert`)return ks(s,e.zones);const n=t.match(new RegExp(`^${s}_mzcs_fan_timer_(.+)$`));if(n){const i=e.zones.find(a=>a.slug===n[1]);return i?vs(s,i,e.fanGuard):null}return null}async function ei(t,e,s,n=()=>{}){const i=r=>{const d={kind:"config_entry",entryId:r,registered:true};return n(d),d},a={...e.spec,...e.meta??{}};if(e.id.startsWith("automation:")){const r=e.id.slice(11),d=Cs(r,s);if(!d)return s.log(`SKIP ${e.id} - no payload generator`),null;let l=null;try{l=await t.callApi("GET",`config/automation/config/${r}`)}catch(p){if(!Yn(p))throw new Error(`Could not verify whether ${e.id} already exists: ${gt(p)}`);l=null}if(l){const p=fe(l.description);return p&&_e(l)===p?(await t.callApi("POST",`config/automation/config/${r}`,d),await Mt(t,r,String(d.alias),s),s.log(`Recreated ${e.id} (existed in storage, pristine)`),{kind:"automation",automationId:r,preexisted:true}):(s.log(`KEEP ${e.id} - exists in storage but is customized/unsigned; not overwritten`),null)}return await t.callApi("POST",`config/automation/config/${r}`,d),await Mt(t,r,String(d.alias),s),{kind:"automation",automationId:r}}const{domain:o,objectId:c}=X(e.id);if(["timer","input_text","input_select","input_number","input_boolean","schedule"].includes(o)){const r=String(a.name??c),d={};if(o==="timer"&&Object.assign(d,{restore:a.restore??true,duration:"0:30:00"}),o==="input_select"&&Object.assign(d,{options:a.options??["-"]}),o==="input_text"&&Object.assign(d,{max:255}),o==="input_number"&&Object.assign(d,{min:a.min??0,max:a.max??100,step:a.step??1,...a.unit?{unit_of_measurement:a.unit}:{}}),o==="schedule"){const u=a.week;for(const m of As)d[m]=u?.[m]??[]}const p=(await t.callWS({type:`${o}/create`,...d,name:c}))?.id??c;if(p!==c){try{await t.callWS({type:`${o}/delete`,[`${o}_id`]:p})}catch{s.log(`WARN: could not remove stray ${o} item ${p}`)}throw new Error(`HA assigned id "${p}" instead of "${c}" for ${e.id} - an object with that id likely already exists (possibly registry-disabled)`)}if(r!==p)try{await t.callWS({type:`${o}/update`,[`${o}_id`]:p,...d,name:r})}catch{s.log(`NOTE: created ${e.id} but could not set its display name to "${r}"`)}if(o==="input_number"&&typeof a.seed=="number")try{await t.callService("input_number","set_value",{entity_id:e.id,value:a.seed})}catch{s.log(`NOTE: created ${e.id} but could not seed its default value ${a.seed}`)}return{kind:"collection",domain:o,itemId:p}}if(e.kind==="template_sensor"||e.kind==="stats_sensor"){if(e.kind==="stats_sensor"){const u=String(a.name??c);if(a.model==="statistics_mean"){if(!s.weatherEntity)return s.log(`SKIP ${e.id} - no weather entity configured (CDD learning stays off)`),null;const _=await He(t,"statistics",null,{name:u,entity_id:`sensor.${s.prefix}_outdoor_temp`,state_characteristic:"mean",sampling_size:500,max_age:{hours:24,minutes:0,seconds:0},keep_last_sample:false,percentile:50,precision:1}),z=i(_);return await We(t,await Pe(t,"sensor",u,_),e.id,s),z}const m=xe(e.id,s);if(!m)return s.log(`SKIP ${e.id} - no zone match`),null;const g=await He(t,"history_stats",null,{name:u,entity_id:`binary_sensor.${s.prefix}_${m.slug}_running`,type:"time",state:["on"],start:"{{ today_at() }}",end:"{{ now() }}"}),S=i(g);return await We(t,await Pe(t,"sensor",u,g),e.id,s),S}const r=Qn(e.id,a,s);if(!r)return a.source==="weather"&&!s.weatherEntity?s.log(`SKIP ${e.id} - no weather entity configured`):s.log(`SKIP ${e.id} - not flow-creatable`),null;const d=await He(t,r.handler,r.menu,r.fields),l=i(d),p=r.menu==="binary_sensor"?"binary_sensor":"sensor";return await We(t,await Pe(t,p,String(r.fields.name),d),e.id,s),l}return s.log(`SKIP ${e.id} - unsupported kind ${e.kind}`),null}async function ti(t,e,s){for(const n of[...e].reverse())try{n.kind==="collection"?await t.callWS({type:`${n.domain}/delete`,[`${n.domain}_id`]:n.itemId}):n.kind==="automation"?await t.callApi("DELETE",`config/automation/config/${n.automationId}`):n.kind==="config_entry"&&n.entryId&&await t.callApi("DELETE",`config/config_entries/entry/${n.entryId}`),s.log(`Rolled back ${n.itemId??n.automationId??n.entryId}`)}catch{s.log(`ROLLBACK FAILED for ${n.itemId??n.automationId??n.entryId} - remove manually`)}}async function si(t,e,s,n){const i=Array.isArray(e.spec.options)?e.spec.options.map(String):null,a=Array.isArray(e.from?.options)?e.from.options.map(String):null,o=t.states[e.id]?.state;if(!i||typeof o!="string"||i.includes(o))return;const c=a?a.indexOf(o):-1,r=a?a.filter((d,l)=>d!==i[l]).length:1/0;if(a&&a.length===i.length&&c>=0&&r===1&&n)try{await t.callService("input_select","select_option",{entity_id:e.id,option:i[c]}),s.log(`Re-selected "${i[c]}" on ${e.id} (was "${o}") so the active season survives its rename`);return}catch{}s.log(`NOTE: ${e.id} was set to "${o}", which is no longer an option - Home Assistant falls back to "${i[0]}". Re-select the intended season.`)}async function It(t,e,s){const n={created:0,adopted:0,updated:0,deleted:0,skipped:0,ok:true},i=[];let a="create";await Jn(t,s);try{for(const o of e.create){const c=await ei(t,o,s,r=>i.push(r));c?(!c.preexisted&&!c.registered&&i.push(c),n.created++,s.log(`Created ${o.id}`),o.id.startsWith("automation:")||await et(t,o.id)):n.skipped++}a="adopt";for(const o of e.adopt){const c=o.id.startsWith("automation:")?Xn(t,o.id.slice(11)):o.id;c&&await et(t,c),n.adopted++,s.log(`Adopted ${o.id}`)}a="update";for(const o of e.update)if(o.kind==="helper"){const{domain:c}=X(o.id),{unit:r,...d}=o.spec,l={...d,...r?{unit_of_measurement:r}:{}};try{const p=await je(t,o.id);if(await t.callWS({type:`${c}/update`,[`${c}_id`]:p,...l}),n.updated++,s.log(`Updated ${o.id}`),c==="input_select"){const u=![...e.create,...e.delete].some(m=>m.id.startsWith("schedule."));await si(t,o,s,u)}}catch{n.skipped++,s.log(`SKIP update ${o.id} - not updatable`)}}else if(o.kind==="automation"&&t.callApi){const c=o.id.slice(11),r=Cs(c,s);if(!r)n.skipped++,s.log(`KEEP ${o.id} - no generator for this automation`);else try{const d=await t.callApi("GET",`config/automation/config/${c}`),l=fe(d?.description);l&&_e(d)===l?(await t.callApi("POST",`config/automation/config/${c}`,r),n.updated++,s.log(`Regenerated ${o.id} (config changed; automation was untouched)`)):(n.skipped++,s.log(`KEEP ${o.id} - customized since generation; review it manually`))}catch{n.skipped++,s.log(`KEEP ${o.id} - could not read its config to verify`)}}else if((o.kind==="template_sensor"||o.kind==="stats_sensor")&&t.callWS)try{await t.callWS({type:"config/entity_registry/update",entity_id:o.id,name:String(o.spec.name??"")}),n.updated++,s.log(`Renamed ${o.id} to "${String(o.spec.name)}"`)}catch{n.skipped++,s.log(`SKIP update ${o.id} - could not set its display name`)}else if(o.kind==="schedule"&&t.callWS){const{objectId:c}=X(o.id);try{const r=await je(t,o.id),l=(await t.callWS({type:"schedule/list"})).find(u=>u.id===r);if(!l)throw new Error(`no storage item "${r}"`);const p={};for(const u of As)p[u]=l[u]??[];await t.callWS({type:"schedule/update",schedule_id:r,name:String(o.spec.name??c),...p}),n.updated++,s.log(`Renamed ${o.id} to "${String(o.spec.name)}" (blocks preserved)`)}catch(r){n.skipped++,s.log(`SKIP update ${o.id} - could not rename without touching its blocks (${gt(r)})`)}}else n.skipped++,s.log(`KEEP ${o.id} - ${o.kind} updates never overwrite existing content`);a="delete";for(const o of e.delete){if(o.id.startsWith("automation:")){const c=o.id.slice(11);let r=null;try{r=await t.callApi("GET",`config/automation/config/${c}`)}catch{r=null}if(!r){n.skipped++,s.log(`SKIP delete ${o.id} - config not readable`);continue}const d=fe(r.description);if(!(d&&_e(r)===d)){n.skipped++,s.log(`KEEP ${o.id} - customized or unsigned; delete it manually if intended`);continue}s.log(`snapshot ${c}: ${JSON.stringify(r)}`),await t.callApi("DELETE",`config/automation/config/${c}`)}else if(o.kind==="template_sensor"||o.kind==="stats_sensor"){let c;try{c=(await t.callWS({type:"config/entity_registry/get_entries",entity_ids:[o.id]}))?.[o.id]?.config_entry_id}catch{c=void 0}if(!c){n.skipped++,s.log(`SKIP delete ${o.id} - no owning config entry found; remove it manually`);continue}const r=await Vn(t,c);if(!r||!Gn.has(r)){n.skipped++,s.log(`KEEP ${o.id} - its config entry ${c} belongs to "${r??"an unreadable integration"}", not to a template/history_stats/statistics helper; remove it manually if intended`);continue}s.log(`snapshot ${o.id}: config entry ${c} (${r})`),await t.callApi("DELETE",`config/config_entries/entry/${c}`)}else{const{domain:c}=X(o.id),r=await je(t,o.id),d=ze(o.id,s.prefix,s.zones.map(l=>l.slug),s.seasons.map(l=>l.key));if(d?.cls==="room_override_timer"&&d.zone){try{await t.callService("timer","cancel",{entity_id:o.id})}catch{}try{await t.callService("input_text","set_value",{entity_id:w("applied_block_marker",s.prefix,d.zone),value:""}),s.log(`Released steering override for ${d.zone} before deleting its timer`)}catch{s.log(`NOTE: could not clear ${d.zone}'s applied-block marker before deleting its timer`)}}if(c==="schedule")try{const p=(await t.callWS({type:"schedule/list"})).find(u=>u.id===r);p&&s.log(`snapshot ${r}: ${JSON.stringify(p)}`)}catch{s.log(`NOTE: could not snapshot ${o.id} before delete`)}else{const l=t.states[o.id];s.log(`snapshot ${o.id}: state=${JSON.stringify(l?.state??null)} attributes=${JSON.stringify(l?.attributes??{})}`)}await t.callWS({type:`${c}/delete`,[`${c}_id`]:r})}n.deleted++,s.log(`Deleted ${o.id}`)}}catch(o){n.ok=false,s.log(`ERROR during ${a}: ${o instanceof Error?o.message:String(o)} - rolling back this run's creates. Already-applied updates/deletes from this run are NOT reverted; see the log above for what landed.`),await ti(t,i,s)}return n}function Rs(t,e,s,n="on",i=6e4){const a=[...t].sort((l,p)=>l.t-p.t),o=[];let c="off";for(const l of a)if(l.t<=e)c=l.state;else break;let r=c===n?e:null;for(const l of a){if(l.t<=e||l.t>=s)continue;const p=l.state===n;p&&r==null&&(r=l.t),!p&&r!=null&&(o.push({start:r,end:l.t}),r=null)}r!=null&&o.push({start:r,end:s});const d=[];for(const l of o){const p=d[d.length-1];p&&l.start-p.end<=i?p.end=l.end:d.push({...l})}return d}function ni(t){return t.reduce((e,s)=>e+(s.end-s.start),0)}function ii(t){const e=[...t].sort((n,i)=>n.t-i.t),s=[];for(const n of e){const i=Number(n.state);if(!Number.isFinite(i))continue;const a=s[s.length-1];(!a||a.value!==i)&&s.push({t:n.t,value:i})}return s}function Nt(t){if(!Number.isFinite(t)||t<0)return"\u2013";const e=Math.round(t*4)/4,s=Math.floor(e),n=e-s,i=n===.25?"\xBC":n===.5?"\xBD":n===.75?"\xBE":"";return s===0&&i?`${i} hr`:`${s}${i} hr`}function ai(t,e,s){const n=s-e;return{left:(t.start-e)/n*100,width:(t.end-t.start)/n*100}}function oi(t,e,s,n="on"){const i=t.length?Math.min(...t.map(o=>o.t)):1/0,a=[];for(let o=e-1;o>=0;o--){const c=new Date(s);c.setHours(0,0,0,0),c.setDate(c.getDate()-o);const r=c.getTime();c.setDate(c.getDate()+1);const d=Math.min(c.getTime(),s);if(d<=r)continue;if(i>=d){a.push({day:r,hours:0,coverage:"none"});continue}const l=ni(Rs(t,r,d,n))/36e5;a.push({day:r,hours:l,coverage:i>r?"partial":"complete"})}return a}const ri=new Set(["climate.set_temperature","climate.set_hvac_mode","climate.turn_on","climate.turn_off","climate.toggle","homeassistant.turn_on","homeassistant.turn_off","homeassistant.toggle"]),ci=new Set(["climate.set_preset_mode","climate.set_fan_mode"]),li="(templated service)";function yt(t){return t.includes("{{")||t.includes("{%")}function di(t){const e=typeof t.action=="string"?t.action:typeof t.service=="string"?t.service:typeof t.service_template=="string"?t.service_template:null;if(e==null)return null;if("service_template"in t||yt(e)){const n=e.slice(0,e.search(/\{[{%]/)>=0?e.search(/\{[{%]/):e.length);return{service:null,templated:true,domain:(n.includes(".")?n.slice(0,n.indexOf(".")).trim().toLowerCase():null)||null}}const s=e.trim().toLowerCase();return s?{service:s,templated:false,domain:s.split(".")[0]??null}:null}function pi(t){return typeof t.device_id!="string"||typeof t.domain!="string"||typeof t.type!="string"||typeof t.platform=="string"||typeof t.condition=="string"||typeof t.trigger=="string"?null:`${t.domain}.${t.type}`.trim().toLowerCase()}function U(t,e,s){if(typeof t=="string"){if(yt(t)){s.templated=true;return}if(t.includes(",")){for(const i of t.split(","))U(i,e,s);return}const n=t.trim();if(!n||n==="none")return;if(n==="all"){s.all=true;return}e.push(n);return}if(Array.isArray(t))for(const n of t)U(n,e,s)}function Lt(t){const e={all:false,templated:false},s=[],n=[],i=[],a=[],o=[],c=[t.target,t.data,t.data_template,t];for(const r of c){if(typeof r=="string"&&yt(r)){e.templated=true;continue}if(!r||typeof r!="object"||Array.isArray(r))continue;const d=r;U(d.entity_id,s,e),U(d.area_id,n,e),U(d.device_id,i,e),U(d.label_id,a,e),U(d.floor_id,o,e)}return{entityIds:[...new Set(s)],areaIds:[...new Set(n)],deviceIds:[...new Set(i)],labelIds:[...new Set(a)],floorIds:[...new Set(o)],all:e.all,templated:e.templated}}const Os=100;function tt(t,e=0,s=[]){if(e>Os||t==null||typeof t!="object")return s;if(Array.isArray(t)){for(const a of t)tt(a,e+1,s);return s}const n=t,i=di(n);if(i)s.push({service:i.service,serviceTemplated:i.templated,serviceDomain:i.domain,target:Lt(n)});else{const a=pi(n);a&&s.push({service:a,serviceTemplated:false,serviceDomain:a.split(".")[0]??null,target:Lt(n)})}for(const a in n)tt(n[a],e+1,s);return s}function ui(t,e,s,n){return typeof t=="string"&&t.startsWith(`${s}_mzcs_`)&&e.includes(n)}const hi=new Set(["climate","homeassistant"]);function mi(t){if(t.service==null){const e=t.serviceDomain;return e==null||hi.has(e)?"conflict":null}return ri.has(t.service)?"conflict":ci.has(t.service)?"note":null}function fi(t,e){return t.entityIds.includes(e.entityId)||e.registryId&&t.entityIds.includes(e.registryId)?"entity":t.all?"all":e.areaId&&t.areaIds.includes(e.areaId)?"area":e.deviceId&&t.deviceIds.includes(e.deviceId)?"device":(e.labels??[]).some(s=>t.labelIds.includes(s))?"label":null}function _i(t,e){const s=t.target,n=[];for(const i of e){const a=fi(s,i);a&&n.push({zone:i,via:a,confidence:"certain"})}return n.length===0&&(s.templated?n.push({zone:null,via:"template",confidence:"possible"}):s.floorIds.length>0?n.push({zone:null,via:"floor",confidence:"possible"}):s.entityIds.some(i=>i.startsWith("group."))?n.push({zone:null,via:"group",confidence:"possible"}):t.serviceTemplated&&n.push({zone:null,via:"template",confidence:"possible"})),n}function Ds(t){return t!=null&&typeof t=="object"&&!Array.isArray(t)&&"use_blueprint"in t}function st(t,e=[],s=0){if(s>Os||t==null)return e;if(typeof t=="string")return e.push(t),e;if(Array.isArray(t)){for(const n of t)st(n,e,s+1);return e}if(typeof t=="object"){const n=t;for(const i in n)st(n[i],e,s+1)}return e}function gi(t,e){const s=[],n=new Set,i=a=>{const o=a.sourceId+"|"+a.service+"|"+a.zoneEntityId+"|"+a.via;n.has(o)||(n.add(o),s.push(a))};for(const a of t){if(Ds(a.config)){const o=st(a.config.use_blueprint);for(const c of e)(o.includes(c.entityId)||c.registryId!=null&&o.includes(c.registryId))&&i({sourceId:a.id,sourceName:a.name,sourceKind:a.kind,service:"(blueprint)",zoneEntityId:c.entityId,zoneName:c.name,severity:"conflict",confidence:"possible",via:"blueprint",sourceEnabled:a.enabled});continue}for(const o of tt(a.config)){const c=mi(o);if(c)for(const r of _i(o,e)){const d=o.serviceTemplated||r.confidence==="possible"?"possible":"certain";i({sourceId:a.id,sourceName:a.name,sourceKind:a.kind,service:o.service??li,zoneEntityId:r.zone?.entityId??null,zoneName:r.zone?.name??null,severity:c,confidence:d,via:r.via,sourceEnabled:a.enabled})}}}return s}function yi(t,e,s){const n=gi(t,e),i=t.filter(a=>Ds(a.config)).length;return{...s,scanned:t.length-i,blueprints:i,conflicts:n.filter(a=>a.severity==="conflict"),notes:n.filter(a=>a.severity==="note")}}function jt(t,e){const s=t.states[e];if(!s||s.state==="unavailable"||s.state==="unknown")return{available:false,mode:"unavailable",action:"",setpoint:null,targetLow:null,targetHigh:null,inside:null,humidity:null};const n=s.attributes,i=a=>typeof a=="number"?a:null;return{available:true,mode:s.state,action:typeof n.hvac_action=="string"?n.hvac_action:"",setpoint:i(n.temperature),targetLow:i(n.target_temp_low),targetHigh:i(n.target_temp_high),inside:i(n.current_temperature),humidity:i(n.current_humidity)}}function bi(t,e){return t.states[e]?.state==="active"}function O(t,e){return t.states[e]!==void 0}function vi(t,e){const s=t.states[e]?.attributes.hvac_modes;return Array.isArray(s)?s.filter(n=>typeof n=="string"):[]}function $i(t,e,s="eco"){const n=t.states[e]?.attributes.preset_modes;return Array.isArray(n)&&n.includes(s)}function Pt(t,e,s="eco"){return t.states[e]?.attributes.preset_mode===s}function Fe(t,e){const s=t.states[e];if(!s)return null;const n=Number(s.state);return Number.isFinite(n)?n:null}const wi=ht*60*60*1e3;function xi(t,e){let s=0;for(const n of e){const i=t.states[n],a=i?.last_reported??i?.last_updated,o=a?Date.parse(a):NaN;Number.isFinite(o)&&o>s&&(s=o)}return s>0?s:Date.now()}const ki=/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?([Zz]|[+-]\d{2}:?\d{2})$/,Si=300*1e3;function Ei(t,e,s=Date.now(),n){const i=t.states[e],a=typeof i?.attributes.friendly_name=="string"?i.attributes.friendly_name.replace(/ (Temperature|temperature)$/,""):e.split(".")[1]??e,o=i?Number(i.state):NaN,c=n?.staleMs??wi,r=n?.lastSeenEntity?t.states[n.lastSeenEntity]:void 0,d=r?.state&&ki.test(r.state)?Date.parse(r.state):NaN,l=Number.isFinite(d)&&d-s<=Si?d:NaN;let p;Number.isFinite(l)&&(p=Math.max(0,s-l));const u=i?.last_reported??i?.last_updated,m=u?Date.parse(u):NaN,g=Number.isFinite(l)&&s-l>c||Number.isFinite(m)&&s-m>c;return{entityId:e,name:a,temp:Number.isFinite(o)?o:null,stale:g,...p!==void 0?{ageMs:p}:{}}}function zi(t,e,s){return t.callService("climate","set_hvac_mode",{entity_id:e,hvac_mode:s})}function Ai(t,e,s,n="eco"){return t.callService("climate","set_preset_mode",{entity_id:e,preset_mode:s?n:"none"})}function Ti(t,e){const s=t.states[e]?.attributes.fan_modes;return Array.isArray(s)&&s.includes("on")}async function Ci(t,e,s,n){Ti(t,e)&&await t.callService("climate","set_fan_mode",{entity_id:e,fan_mode:"on"});const i=String(n%60).padStart(2,"0"),a=String(Math.floor(n/60)).padStart(2,"0");await t.callService("timer","start",{entity_id:s,duration:`${a}:${i}:00`})}function Ri(t,e,s,n){const i=typeof s=="number"?s:null,a=typeof n=="number"?n:null;return i!=null&&a!=null&&i<a&&e!=null&&e>=i&&e<=a?Math.min(a,Math.max(i,t)):t}const Ms=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];async function Wt(t,e){if(!t.callWS)return null;const s=e.split(".")[1];try{const i=(await t.callWS({type:"schedule/list"})).find(o=>o.id===s);if(!i)return null;const a={};for(const o of Ms)i[o]&&(a[o]=i[o]);return{id:String(i.id),name:typeof i.name=="string"?i.name:void 0,week:a}}catch{return null}}function Ht(t,e,s,n){if(!t.callWS)return Promise.reject(new Error("callWS unavailable"));const a={type:"schedule/update",schedule_id:e.split(".")[1],name:n};for(const o of Ms)a[o]=s[o]??[];return t.callWS(a)}function Oi(t,e,s){return t.callService("input_number","set_value",{entity_id:e,value:s})}function Di(t,e,s){return t.callService("input_select","select_option",{entity_id:e,option:s})}async function Ft(t,e,s,n){if(n)try{await t.callService("input_text","set_value",{entity_id:s,value:""})}catch{}await t.callService("input_boolean",n?"turn_on":"turn_off",{entity_id:e})}function Is(t,e){const s=[];for(const n of t){if(typeof n.lu!="number")continue;const i=n.lu*1e3;if(e){const a=n.a?.[e];if(a==null)continue;s.push({t:i,state:String(a)})}else typeof n.s=="string"&&s.push({t:i,state:n.s})}return s}async function Ut(t,e,s,n,i){if(!t.callWS)return{ok:false,error:"This Home Assistant connection cannot read history."};try{const a=await t.callWS({type:"history/history_during_period",start_time:new Date(s).toISOString(),end_time:new Date(n).toISOString(),entity_ids:[e],minimal_response:!i,no_attributes:!i,significant_changes_only:false});return{ok:true,rows:Is(a?.[e]??[],i)}}catch(a){return{ok:false,error:W(a)}}}async function Mi(t,e,s,n=Date.now()){if(!t.callWS)return{ok:false,error:"This Home Assistant connection cannot read history."};const i=new Date(n);i.setHours(0,0,0,0),i.setDate(i.getDate()-(s-1));try{const a=await t.callWS({type:"history/history_during_period",start_time:i.toISOString(),end_time:new Date(n).toISOString(),entity_ids:[e],minimal_response:true,no_attributes:true,significant_changes_only:false}),o=Is(a?.[e]??[]);return{ok:true,rows:oi(o,s,n)}}catch(a){return{ok:false,error:W(a)}}}function W(t){try{return Ii(t)}catch{return"Home Assistant gave no reason."}}function Ii(t){if(t instanceof Error&&t.message)return t.message;if(t&&typeof t=="object"){const e=t;if(typeof e.message=="string"&&e.message)return e.message;if(e.message!=null&&String(e.message))return String(e.message);if(e.code!=null)return Bt(e.code)}return(typeof t=="number"||typeof t=="string")&&String(t)?Bt(t):"Home Assistant gave no reason."}function Bt(t){const e=String(t);return/connection|closed|lost|3/i.test(e)?`The connection to Home Assistant dropped (${e}).`:`Home Assistant reported error ${e}.`}async function Ni(t,e,s){await t.callService("input_text","set_value",{entity_id:e,value:""}),await t.callService("automation","trigger",{entity_id:s})}function Li(t,e,s){return t.callService("climate","set_temperature",{entity_id:e,temperature:s})}const Kt=500,ji=6;async function Pi(t,e,s){const n=new Array(t.length);let i=0;const a=async()=>{for(;;){const o=i++;if(o>=t.length)return;n[o]=await s(t[o])}};return await Promise.all(Array.from({length:Math.min(e,t.length)},a)),n}async function Wi(t,e){const s=new Map;if(e.length===0)return s;if(!t.callWS)throw new Error("This Home Assistant connection cannot read the entity registry, so the conflict check could not run.");const n=await t.callWS({type:"config/entity_registry/get_entries",entity_ids:e});for(const[i,a]of Object.entries(n??{}))a&&s.set(i,a);return s}async function Hi(t,e,s){const n=e.some(c=>{const r=s.get(c.entity);return!!r&&!r.area_id&&!!r.device_id});let i=false,a=new Map;if(n&&t.callWS)try{const c=await t.callWS({type:"config/device_registry/list"});for(const r of c??[])r?.id&&a.set(r.id,r.area_id??null)}catch{a=new Map,i=true}return{refs:e.map(c=>{const r=s.get(c.entity),d=r?.area_id??(r?.device_id?a.get(r.device_id)??null:null);return{entityId:c.entity,name:c.name,areaId:d,deviceId:r?.device_id??null,registryId:r?.id??null,labels:r?.labels??[]}}),degraded:i}}async function Fi(t,e,s,n){if(!t.callApi)throw new Error("This Home Assistant connection cannot read automation configurations, so the conflict check could not run.");const i=[],a=new Map;for(const _ in t.states){const z=t.states[_];if(!z)continue;const x=String(z.attributes.friendly_name??_);if(_.startsWith("automation.")){const R=z.attributes.id;a.set(_,R),i.push({entityId:_,name:x,kind:"automation",path:typeof R=="string"&&R?`config/automation/config/${R}`:null})}else if(_.startsWith("script.")){const R=_.slice(7);i.push({entityId:_,name:x,kind:"script",path:R?`config/script/config/${R}`:null})}}const o=await Wi(t,[...n.map(_=>_.entity),...i.filter(_=>_.kind==="automation").map(_=>_.entityId)]),{refs:c,degraded:r}=await Hi(t,n,o);let d=0;const l=[];for(const _ of i){if(_.kind==="automation"&&ui(a.get(_.entityId),o.get(_.entityId)?.labels??[],e,s)){d++;continue}l.push(_)}const p=l.length>Kt,u=p?l.slice(0,Kt):l;let m=0;const g=await Pi(u,ji,async _=>{if(!_.path)return null;try{const z=await t.callApi("GET",_.path),x=t.states[_.entityId]?.state,R=_.kind==="automation"?x==="on"?true:x==="off"?false:void 0:void 0;return{id:_.entityId,name:_.name,kind:_.kind,enabled:R,config:z}}catch{return null}}),S=[];for(const _ of g)_?S.push(_):m++;return yi(S,c,{unreadable:m,skippedOwn:d,capped:p,degraded:r})}function Ui(t,e,s,n){if(!Number.isFinite(e)||e<=0)return{status:"learning",label:"learning"};if(n<6)return{status:"pending",label:""};const i=e*(Math.min(n,24)/24),a=i*(1+s/100);return t>a&&t-i>.5?{status:"high",label:"running high for the weather"}:{status:"normal",label:"normal for the weather"}}const bt={accent:"#1e88e5",accentBright:"#42a5f5",good:"#2bb673",warn:"#f59e0b",bad:"#e5484d",bg:"#1c262e",surface:"#243039",chip:"#2b3844",track:"#16202a",border:"#3d4a55",text:"#e8edf1",textDim:"#9fb0bd"},nt={cobalt:{label:"Cobalt",tokens:bt},ember:{label:"Ember",tokens:{accent:"#f4511e",accentBright:"#ff7043",good:"#66bb6a",warn:"#ffb300",bad:"#d32f2f",bg:"#241c18",surface:"#2f2521",chip:"#3a2d27",track:"#1a1310",border:"#54413a",text:"#f2e9e4",textDim:"#b8a69b"}},forest:{label:"Forest",tokens:{accent:"#43a047",accentBright:"#66bb6a",good:"#9ccc65",warn:"#ffa000",bad:"#e53935",bg:"#18211b",surface:"#212d25",chip:"#2a382e",track:"#111813",border:"#3d4f43",text:"#e6efe8",textDim:"#9fb3a5"}},orchid:{label:"Orchid",tokens:{accent:"#7e57c2",accentBright:"#9575cd",good:"#26a69a",warn:"#ffb300",bad:"#ec407a",bg:"#1f1b2a",surface:"#292336",chip:"#342c44",track:"#161221",border:"#4a4060",text:"#eae6f2",textDim:"#a89fbd"}},"ha-default":{label:"HA Default",tokens:{accent:"var(--primary-color, #03a9f4)",accentBright:"var(--light-primary-color, var(--primary-color, #03a9f4))",good:"var(--success-color, #2bb673)",warn:"var(--warning-color, #f59e0b)",bad:"var(--error-color, #e5484d)",bg:"var(--ha-card-background, var(--card-background-color, #fff))",surface:"var(--secondary-background-color, #f0f0f0)",chip:"var(--secondary-background-color, #f0f0f0)",track:"var(--divider-color, #e0e0e0)",border:"var(--divider-color, #e0e0e0)",text:"var(--primary-text-color, #212121)",textDim:"var(--secondary-text-color, #727272)"}}},Ue="cobalt",it=/^#[0-9a-f]{6}$/i,Ae=["accent","accentBright","good","warn","bad","bg","surface","chip","track","border","text","textDim"];function qt(t){return`custom:${Ae.map(e=>t[e]).join(",")}`}function Bi(t){return Ae.every(s=>it.test(t[s]))?{...t}:{...bt}}function Zt(t){const e={presetKey:Ue,tokens:nt[Ue].tokens};if(!t)return e;const s=t==="nest-blue"?Ue:t,n=nt[s];if(n)return{presetKey:s,tokens:n.tokens};if(t.startsWith("custom:")){const i=t.slice(7).split(",");if(i.length===5&&i.every(a=>it.test(a.trim()))){const[a,o,c,r,d]=i.map(l=>l.trim().toLowerCase());return{presetKey:"custom",tokens:{...bt,accent:a,accentBright:o,good:c,warn:r,bad:d}}}if(i.length===Ae.length&&i.every(a=>it.test(a.trim())))return{presetKey:"custom",tokens:Object.fromEntries(Ae.map((o,c)=>[o,i[c].trim().toLowerCase()]))}}return e}const ke=t=>q(t);function q(t){const e=t.data;return{time:t.from.slice(0,5),name:e.block??"?",mode:e.mode??"cool",cool_temp:e.cool_temp??null,heat_temp:e.heat_temp??null}}function Ki(t,e){const s=q(t),n=q(e);return s.name===n.name&&s.mode===n.mode&&s.cool_temp===n.cool_temp&&s.heat_temp===n.heat_temp}function Be(t){if(t.length===0)return[];const e=[...t].sort((o,c)=>o.from.localeCompare(c.from)),s=e[0],n=e[e.length-1];return(e.length>1&&s.from==="00:00:00"&&Ki(s,n)?e.slice(1):e).map(q)}function qi(t){return JSON.stringify([...t].sort((e,s)=>e.from.localeCompare(s.from)).map(e=>[e.from,e.to,q(e)]))}const Gt=["monday","tuesday","wednesday","thursday","friday"],Vt=["saturday","sunday"];function Yt(t){const e=M.map(o=>qi(t[o]??[])),s=o=>e[M.indexOf(o)];if(e.every(o=>o===e[0]))return{granularity:"all",sets:{all:[...M]}};const i=Gt.every(o=>s(o)===s("monday")),a=Vt.every(o=>s(o)===s("saturday"));return i&&a?{granularity:"wdwe",sets:{wd:[...Gt],we:[...Vt]}}:{granularity:"days",sets:Object.fromEntries(M.map(o=>[o,[o]]))}}const Jt=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];function Zi(t){return`${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`}function Gi(t,e){return t.name===e.name&&t.mode===e.mode&&t.cool_temp===e.cool_temp&&t.heat_temp===e.heat_temp}function Vi(t,e){const s=e.getDay(),n=e.getHours()*60+e.getMinutes(),i=`${Zi(e)}:00`,a=new Map,o=r=>{const d=((s+r)%7+7)%7;let l=a.get(d);return l||(l=[...t[Jt[d]]??[]].sort((p,u)=>p.from.localeCompare(u.from)),a.set(d,l)),l},c=r=>{for(let d=1;d<=7;d++){const l=o(r-d);if(l.length)return ke(l[l.length-1])}return null};for(let r=0;r<=7;r++){const d=o(r);for(let l=0;l<d.length;l++){const p=d[l];if(r===0&&p.from<=i)continue;if(r===7&&p.from>i)break;const u=l>0?ke(d[l-1]):c(r),m=ke(p);if(u&&Gi(u,m))continue;const[g,S]=p.from.slice(0,5).split(":").map(Number),_=r*1440+(g*60+S)-n;if(_<=0)continue;const z=Jt[(s+r)%7];return{...m,day:z,minutesUntil:_}}}return null}function Yi(t){for(const e of M){const s=[...t[e]??[]].sort((n,i)=>n.from.localeCompare(i.from));if(s.length===0||s[0].from!=="00:00:00")return true;for(let n=1;n<s.length;n++)if(s[n].from!==s[n-1].to)return true;if(s[s.length-1].to!=="24:00:00")return true}return false}function Ji(t){const e=[...t].sort((i,a)=>i.from.localeCompare(a.from)),s=[];let n=0;for(const i of e){const a=L(i.from.slice(0,5)),o=i.to==="24:00:00"?1440:L(i.to.slice(0,5));a>n&&s.push({block:null,fromMin:n,toMin:a}),s.push({block:ke(i),fromMin:a,toMin:o}),n=o}return n<1440&&s.push({block:null,fromMin:n,toMin:1440}),s}function Ns(t,e,s){const n={};for(const i of M){const a=t[i];a&&(n[i]=e.includes(i)?Qi(s):a)}return n}function L(t){const[e,s]=t.split(":").map(Number);return(e??0)*60+(s??0)}function Xt(t){const e=Math.max(0,Math.min(1425,t));return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function Xi(t){if(t.length===0)return[];const e=[...t].sort((i,a)=>i.time.localeCompare(a.time)),s=[],n=L(e[0].time);return n>0&&s.push({block:e[e.length-1],fromMin:0,toMin:n,wrap:true}),e.forEach((i,a)=>{s.push({block:i,fromMin:L(i.time),toMin:a<e.length-1?L(e[a+1].time):1440,wrap:false})}),s}function Qi(t){const e=[...t].sort((o,c)=>o.time.localeCompare(c.time));if(e.length===0)return[];const s=e[0],n=e[e.length-1],i=o=>({block:o.name,mode:o.mode,...o.cool_temp!=null?{cool_temp:o.cool_temp}:{},...o.heat_temp!=null?{heat_temp:o.heat_temp}:{}});if(e.length===1)return[{from:"00:00:00",to:"24:00:00",data:i(s)}];const a=[];s.time!=="00:00"&&a.push({from:"00:00:00",to:`${s.time}:00`,data:i(n)});for(let o=0;o<e.length;o++){const c=e[o],r=e[o+1];a.push({from:`${c.time}:00`,to:r?`${r.time}:00`:"24:00:00",data:i(c)})}return a}function Ke(t,e,s){if(s.size===0)return false;let n=t;for(const[i,a]of Object.entries(e.sets)){const o=s.get(i);o&&(n=Ns(n,a,o))}return!ea(n,t)}function ea(t,e){for(const s of M){const n=t[s]??[],i=e[s]??[];if(n.length!==i.length)return false;for(let a=0;a<n.length;a++){const o=n[a],c=i[a];if(o.from!==c.from||o.to!==c.to)return false;const r=q(o),d=q(c);if(r.time!==d.time||(r.name??"")!==(d.name??"")||(r.mode??null)!==(d.mode??null)||(r.cool_temp??null)!==(d.cool_temp??null)||(r.heat_temp??null)!==(d.heat_temp??null))return false}}return true}const Ls=2,js=4;function ta(t,e=Ls,s=js){const n=Math.abs(t);return n<=e?"green":n<=s?"amber":"red"}function qe(t){const e=Math.round(t*10)/10;return Number.isInteger(e)?String(e):e.toFixed(1)}function sa(t){const e=Math.round(t);return`${e>0?"+":""}${e}\xB0`}function na(t,e){let s=t!=null&&t>0?t:Ls,n=e!=null&&e>0?e:js;return n<=s&&(n=s+1),{greenMax:s,amberMax:n}}function ia(t){const e=t.default_mode;return{granularity:"all",sets:{all:[{time:"06:00",name:"Day",mode:e,cool_temp:e==="heat"?null:e==="heat_cool"?84:78,heat_temp:e==="heat"?68:e==="heat_cool"?66:null}]}}}function aa(t,e){const s={};for(const n of t){s[n]={};for(const i of e)s[n][i.key]=ia(i)}return s}const Qt=t=>t?"On":"Off";function oa(t){let e;try{e=Re(t)}catch{e=t}const s=(e.zones??[]).map(u=>{const m=N(u.room_sensors),g=m.length===0?"no room sensors":m.map(_=>`${_.name??_.entity}${_.last_seen?" (last-seen \u2713)":""}`).join(", "),S=typeof u.power_entity=="string"?u.power_entity.trim():"";return{label:u.name,value:u.entity,detail:`${g}${S?` \xB7 power: ${S}`:""}`}}),n=e.seasons??ye(),i=e.seasons===void 0,a=n.map(u=>({label:`${u.name||"(unnamed)"}${i?" (default)":""}`,value:u.default_mode,detail:`key: ${String(u.key)}`}));a.push({label:"Season switching",value:e.season_switch??"manual",detail:"Only Manual does anything today; the auto modes are the planned recommender."});const o=e.features??{},c=te(o),r=J(o),d=[{label:"Fan timer presets",value:o.fan_timer===void 0?"15 / 30 / 60 min (default)":o.fan_timer.length>0?`${o.fan_timer.join(" / ")} min`:"Off"},{label:"Runtime anomaly alerts",value:Qt(o.anomaly_alerts??true)},{label:"Fan guard helper",value:o.fan_guard??"none"},{label:"Standby preset stand-down",value:c===null?"Off - HA owns standby":`'${c}'${o.eco_preset===void 0?" (default)":""}`},{label:"Off-peak comfort",value:r?r.entity:"Off",...r?{detail:`offset seed ${r.offsetSeed}\xB0 - the LIVE offset is on the Tuning tab`}:{}},{label:"Comfort steering",value:Qt(o.steering===true)}],l=Y(e.display),p=[{label:"Last-seen age on room rows",value:l.lastSeen},{label:"Ageing threshold",value:`${l.ageingMs/6e4} min${l.ageingMs===ms*6e4&&e.display?.ageing_minutes===void 0?" (default)":""}`},{label:"Stale after",value:`${l.staleMs/36e5} h${l.staleMs===ht*36e5&&e.display?.stale_hours===void 0?" (default)":""}`},{label:"Entity prefix",value:e.prefix??"climate"},{label:"Weather entity",value:e.weather_entity??"none - outdoor tracking and learning off"}];return[{key:"zones",label:"Zones & Rooms",rows:s},{key:"seasons",label:"Seasons",rows:a},{key:"features",label:"Features",rows:d},{key:"display",label:"Display & Advanced",rows:p}]}const es={fan_timer:"helper",room_override_timer:"helper",target_room_select:"helper",steer_target:"helper",applied_block_marker:"helper",zone_enabled:"helper",theme:"helper",k_factor:"helper",season_select:"helper",season_mode:"helper",season_confirm_days:"helper",season_dwell_days:"helper",dev_green_max:"helper",dev_amber_max:"helper",runtime_alert_margin:"helper",runtime_alert_days:"helper",runtime_learn_days:"helper",cdd_base:"helper",override_minutes:"helper",steer_min_setpoint:"helper",steer_max_setpoint:"helper",steer_max_offset:"helper",off_peak_offset:"helper",off_peak_paused_on:"helper",running_sensor:"template_sensor",runtime_mirror:"template_sensor",expected_runtime:"template_sensor",next_block_sensor:"template_sensor",outdoor_temp_sensor:"template_sensor",outdoor_daily_mean:"stats_sensor",runtime_today:"stats_sensor",zone_schedule:"schedule",sensor_schedule:"schedule"};async function ve(t,e){if(!t.callWS)return[];try{const s=await t.callWS({type:`${e}/list`});return Array.isArray(s)?s:[]}catch(s){throw new Error(`Could not read the ${e} list from Home Assistant: ${s instanceof Error?s.message:String(s)}`)}}async function ts(t,e){const s=new Map;if(!t.callWS||e.length===0)return s;try{const n=await t.callWS({type:"config/entity_registry/get_entries",entity_ids:e});for(const[i,a]of Object.entries(n??{}))a&&s.set(i,{labels:a.labels??[],...typeof a.unique_id=="string"&&a.unique_id?{uniqueId:a.unique_id}:{}})}catch{}return s}async function ra(t,e){const s={read:false,zones:[],schedules:new Set};if(!t.callApi)return s;try{const n=await t.callApi("GET",`config/automation/config/${e}_mzcs_engine`),i=new Set,a=new Set,o=new Set,c=l=>{if(Array.isArray(l)){l.forEach(c);return}if(l&&typeof l=="object"){const p=l,u=p.repeat;if(u&&Array.isArray(u.for_each))for(const g of u.for_each){const S=g?.zone;typeof S=="string"&&/^[a-z0-9_]+$/.test(S)&&i.add(S)}const m=p.variables?.season;if(typeof m=="string"&&m.includes(".get("))for(const g of m.matchAll(/: '([a-z0-9_]+)'/g))a.add(g[1]);if(p.trigger==="state"&&Array.isArray(p.entity_id))for(const g of p.entity_id)typeof g=="string"&&g.startsWith(`schedule.${e}_`)&&o.add(g);Object.values(p).forEach(c)}};c(n);const r=new Set;for(const l of i)for(const p of a)r.add(`schedule.${e}_${l}_${p}`);const d=new Set([...o].filter(l=>r.has(l)));return{read:true,zones:[...i],schedules:d}}catch{return s}}async function ca(t,e,s,n){const i=[],a=new Set;for(const v in t.states){const A=ze(v,e,s,n);if(!A)continue;const E=es[A.cls];E&&(i.push({id:v,kind:E}),a.add(v))}const o=(v,A)=>{a.has(v)||(i.push({id:v,kind:A}),a.add(v))},c=await ra(t,e);for(const v of c.schedules)t.states[v]&&o(v,"schedule");const r=c.zones.filter(v=>!s.includes(v));if(r.length)for(const v in t.states){const A=ze(v,e,r,n);A?.zone&&o(v,es[A.cls])}const[d,l,p,u,m]=await Promise.all([ve(t,"timer"),ve(t,"input_select"),ve(t,"input_number"),ve(t,"schedule"),ts(t,i.map(v=>v.id))]),g=(v,A)=>{const E=new Map;for(const T of v)T.id&&E.set(`${A}.${T.id}`,T);return E},S=new Map([...g(d,"timer"),...g(l,"input_select"),...g(p,"input_number"),...g(u,"schedule")]),_=[];for(const v of i){const A=m.get(v.id)?.uniqueId,E=v.id.slice(0,v.id.indexOf(".")),T=A?S.get(`${E}.${A}`):S.get(v.id),ae=t.states[v.id];let I={};if(v.id.startsWith("input_number.")&&T){const oe=T.unit_of_measurement;I={name:T.name,min:T.min,max:T.max,step:T.step,...oe!=null?{unit:oe}:{}}}else v.id.startsWith("input_select.")&&T?I={name:T.name,options:T.options}:v.id.startsWith("timer.")&&T?I={name:T.name,restore:T.restore??false}:v.id.startsWith("schedule.")&&T?I={name:T.name}:ae&&(I={name:ae.attributes.friendly_name??v.id});_.push({id:v.id,kind:v.kind,spec:I,managed:(m.get(v.id)?.labels??[]).includes(Je)})}const z=[];for(const v in t.states){if(!v.startsWith("automation."))continue;const A=t.states[v];if(!A)continue;const E=A.attributes.id;typeof E=="string"&&E.startsWith(`${e}_mzcs_`)&&z.push({cfgId:E,entityId:v,alias:String(A.attributes.friendly_name??E)})}const[x,R]=await Promise.all([Promise.all(z.map(async({cfgId:v})=>{if(!t.callApi)return{sig:"unknown",pristine:void 0};try{const A=await t.callApi("GET",`config/automation/config/${v}`),E=fe(A?.description);return{sig:E??"unknown",pristine:E?_e(A)===E:false}}catch{return{sig:"unknown",pristine:void 0}}})),ts(t,z.map(v=>v.entityId))]);return z.forEach(({cfgId:v,entityId:A,alias:E},T)=>{_.push({id:`automation:${v}`,kind:"automation",spec:{alias:E,sig:x[T].sig},managed:(R.get(A)?.labels??[]).includes(Je),pristine:x[T].pristine})}),_}var la=Object.defineProperty,da=Object.getOwnPropertyDescriptor,$=(t,e,s,n)=>{for(var i=n>1?void 0:n?da(e,s):e,a=t.length-1,o;a>=0;a--)(o=t[a])&&(i=(n?o(e,s,i):o(i))||i);return n&&i&&la(e,s,i),i};const pa=[["accent","--mzcs-accent"],["accentBright","--mzcs-accent-bright"],["good","--mzcs-good"],["warn","--mzcs-warn"],["bad","--mzcs-bad"],["bg","--mzcs-bg"],["surface","--mzcs-surface"],["chip","--mzcs-chip"],["track","--mzcs-track"],["border","--mzcs-border"],["text","--mzcs-text"],["textDim","--mzcs-text-dim"]],ua=[{key:"bg",label:"Card background"},{key:"surface",label:"Panels (hero / rows)"},{key:"chip",label:"Buttons and chips"},{key:"track",label:"Tracks and wells"},{key:"border",label:"Borders"},{key:"text",label:"Text"},{key:"textDim",label:"Muted text"},{key:"accent",label:"Accent (cooling / active)"},{key:"accentBright",label:"Accent bright (today / highlights)"},{key:"good",label:"Good (eco / normal)"},{key:"warn",label:"Warn (heat / season / high)"},{key:"bad",label:"Alert (out of range)"}];function ha(t,e,s){return!s.some(n=>n.name&&O(t,w("zone_enabled",e,C(n.name))))}const ma=["fan_timer","running_sensor","runtime_today","expected_runtime","applied_block_marker","zone_enabled","room_override_timer","target_room_select","steer_target","sensor_schedule"],fa=["season_select","theme","off_peak_paused_on"],Ze=[{cls:"dev_green_max",label:"Room deviation \xB7 green up to (\xB0)"},{cls:"dev_amber_max",label:"Room deviation \xB7 amber up to (\xB0)"},{cls:"runtime_alert_margin",label:"Runtime alert margin (%)"},{cls:"runtime_learn_days",label:"Runtime learn window (days)"},{cls:"cdd_base",label:"Cooling degree-day base (\xB0)"},{cls:"off_peak_offset",label:"Off-peak comfort offset (\xB0)"},{cls:"override_minutes",label:"Steering override duration (min)"},{cls:"steer_min_setpoint",label:"Steering lowest setpoint (\xB0)"},{cls:"steer_max_setpoint",label:"Steering highest setpoint (\xB0)"},{cls:"steer_max_offset",label:"Steering max offset from block (\xB0)"}];function $e(t,e,s){const n=s>e?Math.max(0,Math.min(1,(t-e)/(s-e))):.5,i=[41,121,230],a=[226,122,49];return`rgb(${i.map((o,c)=>Math.round(o+(a[c]-o)*n)).join(",")})`}function ss(t){const[e,s]=t.split(":");let n=Number(e);const i=n>=12?"PM":"AM";return n=n%12===0?12:n%12,`${n}:${s} ${i}`}const ns={all:"Every day",wd:"Weekdays",we:"Weekend"},_a={heat:"Heat",cool:"Cool",heat_cool:"Heat\xB7Cool",off:"Off",auto:"Auto",dry:"Dry",fan_only:"Fan only"};function ga(t){const e=_a[t];if(e)return e;const s=t.replace(/_/g," ").trim();return s?s.charAt(0).toUpperCase()+s.slice(1):t}console.info(`%c ${us} %c v${ps}`,"background:var(--mzcs-accent);color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;","background:#243039;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;");let y=class extends V{constructor(){super(...arguments),this._zoneIndex=0,this._ctrlOpen=false,this._setupOpen=false,this._schedOpen=false,this._schedName="",this._schedBusy=false,this._schedDrafts=new Map,this._schedEdited=new Set,this._rtOpen=false,this._rtDayErr=new Map,this._rtDaysOpen=new Set,this._rtDayLoading=new Set,this._rtDayCache=new Map,this._dryRunning=false,this._cwScanning=false,this._execConfirm=false,this._execRunning=false,this._execLog=[],this._tdArmed=false,this._tdRunning=false,this._setupTab="zones",this._tdAsk=false,this._tdConfirm="",this._diagTextHasIds=false,this._diagIds=false,this._objectsLoading=false,this._configTab="zones",this._renderedMinute=-1,this._steerTemp=76,this._steerMins=60,this._dpSaving=false,this._dpNonUniform=false}setConfig(t){const e=Re(t);this._config=e,this._zoneIndex>=Math.max(e.zones.length,1)&&(this._zoneIndex=0),this._dryRun=void 0,this._diagText=void 0,this._diagTextHasIds=false,this._dryRunKind=void 0,this._cwScan=void 0,this._cwError=void 0,this._cwScannedFor=void 0,this._execConfirm=false,this._execResult=void 0,this._execLog=[],this._tdAsk=false,this._tdArmed=false,this._tdConfirm="",this._objectsLoadedFor=void 0}static async getConfigElement(){return await Promise.resolve().then(()=>$a),document.createElement(hs)}static getStubConfig(){return{prefix:"climate",zones:[]}}getCardSize(){return 6}get _prefix(){return this._config?.prefix??"climate"}_zone(){return this._config?.zones[this._zoneIndex]}_nudge(t){const e=this._zone();if(!e||!this.hass)return;const s=jt(this.hass,e.entity);if(s.setpoint==null)return;const n=this.hass.states[e.entity]?.attributes,i=Ri(s.setpoint+t,s.setpoint,n?.min_temp,n?.max_temp);i!==s.setpoint&&Li(this.hass,e.entity,i)}_provisionInput(){const t=this._config,e=t.seasons??ye(),s=aa(t.zones.map(n=>C(n.name)),e);return In({...t,prefix:this._prefix,seasons:e},s,C)}_fetchExistingFor(t){return ca(this.hass,t.prefix,t.zones.map(e=>e.slug),t.seasons.map(e=>String(e.key)))}async _runDryRun(){if(!(!this.hass||this._dryRunning)){this._dryRunning=true,this._dryRunError=void 0;try{const t=this._provisionInput(),e=await this._fetchExistingFor(t);this._dryRun=Z(ce(t),e),this._dryRunKind="setup",this._execConfirm=false,this._execResult=void 0,this._execLog=[],this._tdArmed=false}catch(t){this._dryRunError=t instanceof Error?t.message:String(t)}finally{this._dryRunning=false}this._runCompetingScan()}}_cwKey(){const t=(this._config?.zones??[]).filter(e=>e.entity);return t.length===0?null:`${this._prefix}|${t.map(e=>e.entity).join(",")}`}async _runCompetingScan(t=false){if(!this.hass||!this._config||this._cwScanning)return;const e=this._config.zones.filter(i=>i.entity),s=this._cwKey();if(!s||!t&&this._cwScannedFor===s&&this._cwScan)return;this._cwScanning=true,this._cwError=void 0;let n=false;try{const i=await Fi(this.hass,this._prefix,Je,e);this._cwKey()===s?(this._cwScan=i,this._cwScannedFor=s):n=true}catch(i){this._cwScan=void 0,this._cwScannedFor=void 0,this._cwKey()===s?this._cwError=i instanceof Error?i.message:String(i):n=true}finally{this._cwScanning=false}n&&this._runCompetingScan()}async _armTeardown(){if(!(!this.hass||this._dryRunning||this._tdRunning)){this._dryRunning=true,this._dryRunError=void 0;try{const t=this._provisionInput(),e=await this._fetchExistingFor(t),s=Z([],e),n={automation:0,template_sensor:1,stats_sensor:1,schedule:2,helper:3};if(s.delete.sort((i,a)=>(n[i.kind]??9)-(n[a.kind]??9)),!this._tdAsk||this._setupTab!=="danger"||!this._setupOpen)return;this._dryRun=s,this._dryRunKind="teardown",this._tdArmed=true,this._execConfirm=false,this._execResult=void 0,this._execLog=[]}catch(t){this._dryRunError=t instanceof Error?t.message:String(t)}finally{this._dryRunning=false}}}async _runTeardown(){const t=this.hass,e=this._config,s=this._dryRunKind==="teardown"?this._dryRun:void 0;if(!(!t||!e||!s||this._tdRunning)&&this._tdConfirm.trim()===this._prefix){if(this._tdConfirm="",!t.callWS||!t.callApi){this._execLog=["This HA frontend session does not expose the required APIs (callWS/callApi)."];return}this._tdRunning=true,this._tdArmed=false,this._execLog=[];try{const n=this._provisionInput(),i=await this._fetchExistingFor(n);if(!this._setupOpen||this._setupTab!=="danger"||this._config!==e||this._dryRun!==s){this._execLog=["Teardown cancelled: the panel changed while the registry was being read. Arm it again."];return}const a=Z([],i),o={automation:0,template_sensor:1,stats_sensor:1,schedule:2,helper:3};if(a.delete.sort((d,l)=>(o[d.kind]??9)-(o[l.kind]??9)),be(a)!==be(s)){this._dryRun=a,this._dryRunKind="teardown",this._tdArmed=true,this._tdRunning=false,this._execLog=["The registry changed since this preview was made. Review the refreshed list and confirm again."];return}for(const d of n.zones){const l=w("zone_enabled",n.prefix,d.slug);if(O(t,l))try{await t.callService("input_boolean","turn_off",{entity_id:l}),this._execLog=[...this._execLog,`Disabled scheduling for ${d.name}`]}catch{this._execLog=[...this._execLog,`NOTE: could not disable ${l}`]}}const c=await It(t,a,Dt(n,d=>{this._execLog=[...this._execLog,d]}));this._execResult=c;const r=await this._fetchExistingFor(n);this._dryRun=Z(ce(n),r),this._dryRunKind="setup"}catch(n){this._execLog=[...this._execLog,`ERROR: ${n instanceof Error?n.message:String(n)}`]}finally{this._tdRunning=false}}}async _runApply(){const t=this.hass,e=this._config,s=this._dryRun;if(!(!t||!e||!s||this._execRunning)){if(!t.callWS||!t.callApi){this._execLog=["This HA frontend session does not expose the required APIs (callWS/callApi)."];return}this._execRunning=true,this._execConfirm=false,this._execLog=[];try{const n=this._provisionInput(),i=await this._fetchExistingFor(n);if(!this._setupOpen||this._setupTab!=="setup"||this._config!==e||this._dryRun!==s){this._execLog=["Apply cancelled: the panel changed while the registry was being read. Run the dry-run again."];return}const a=Z(ce(n),i);if(be(a)!==be(s)){this._dryRun=a,this._dryRunKind="setup",this._execRunning=false,this._execLog=["The registry changed since this preview was made. Review the refreshed plan and apply again."];return}const o=await It(t,a,Dt(n,r=>{this._execLog=[...this._execLog,r]}));this._execResult=o;const c=await this._fetchExistingFor(n);this._dryRun=Z(ce(n),c)}catch(n){this._execLog=[...this._execLog,`ERROR: ${n instanceof Error?n.message:String(n)}`]}finally{this._execRunning=false}}}_resetDangerState(){this._tdAsk=false,this._tdArmed=false,this._tdConfirm="",this._dryRunKind==="teardown"&&(this._dryRun=void 0,this._dryRunKind=void 0)}_setSetupTab(t){t!==this._setupTab&&(this._resetDangerState(),this._execConfirm=false,this._setupTab=t,t==="objects"&&this._loadObjects())}_closeSetup(){this._resetDangerState(),this._execConfirm=false,this._setupOpen=false}async _loadObjects(t=false){if(!this.hass||this._objectsLoading)return;const e=`${this._prefix}|${(this._config?.zones??[]).map(s=>s.name).join(",")}`;if(!(!t&&this._objectsLoadedFor===e&&this._objects)){this._objectsLoading=true,this._objectsError=void 0;try{const s=this._provisionInput(),n=await this._fetchExistingFor(s),i=ce(s),a=new Map(n.map(r=>[r.id,r])),o=new Set(i.map(r=>r.id)),c=i.map(r=>{const d=a.get(r.id),l=d?d.managed?d.pristine===false?"customized":"managed":"unmanaged":"missing";return{id:r.id,kind:r.kind,name:String(r.spec.name??r.spec.alias??r.id),status:l}});for(const r of n)r.managed&&!o.has(r.id)&&c.push({id:r.id,kind:r.kind,name:String(r.spec.name??r.spec.alias??r.id),status:"extra"});this._objects=c,this._objectsLoadedFor=e}catch(s){this._objectsError=s instanceof Error?s.message:String(s)}finally{this._objectsLoading=false}}}_renderSetup(){const t=[{key:"zones",label:"Zones"},{key:"tuning",label:"Tuning"},{key:"objects",label:"Objects"},{key:"setup",label:"Setup"},{key:"config",label:"Config"},{key:"appearance",label:"Theme"},{key:"danger",label:"Danger"}],e=this._setupTab;return h`
      <div class="setup">
        <div class="setuphead">
          <p class="setup-title" style="margin:0;">Settings</p>
          <button class="chip" @click=${()=>this._closeSetup()}>Close</button>
        </div>
        <div class="settabs">
          ${t.map(s=>h`
              <button
                class=${s.key===e?s.key==="danger"?"settab on danger":"settab on":s.key==="danger"?"settab dangertab":"settab"}
                @click=${()=>this._setSetupTab(s.key)}
              >
                ${s.label}
              </button>
            `)}
        </div>
        ${e==="zones"?this._renderZonesTab():f}
        ${e==="tuning"?this._renderTuningTab():f}
        ${e==="objects"?this._renderObjectsTab():f}
        ${e==="setup"?this._renderSetupTab():f}
        ${e==="config"?this._renderConfigTab():f}
        ${e==="appearance"?this._renderThemePicker():f}
        ${e==="danger"?this._renderTeardown():f}
      </div>
    `}_renderConfigTab(){if(!this._config)return f;const t=oa(this._config),e=t.find(s=>s.key===this._configTab)??t[0];return h`
      <div>
        <p class="cfgcallout">
          These settings are <b>read-only here</b>. To change any of them, edit the dashboard,
          then use the edit wizard on this card (the pencil icon on the card itself).
        </p>
        <div class="cfgtabs">
          ${t.map(s=>h`
              <button
                class=${s.key===e.key?"cfgtab on":"cfgtab"}
                @click=${()=>this._configTab=s.key}
              >
                ${s.label}
              </button>
            `)}
        </div>
        ${e.rows.map(s=>h`
            <div class="cfgrow">
              <div class="cfgmain">
                <span class="cfglabel">${s.label}</span>
                <span class="cfgvalue">${s.value}</span>
              </div>
              ${s.detail?h`<p class="cfgdetail">${s.detail}</p>`:f}
            </div>
          `)}
      </div>
    `}_renderSetupTab(){const t=this._dryRunKind==="setup"?this._dryRun:void 0;return h`
      <div>
        <p class="setup-sub">
          Preview first, then apply. Nothing is written until you confirm; existing schedules and
          customized automations are never overwritten.
        </p>
        <button
          class="chip"
          .disabled=${this._dryRunning||this._execRunning||this._execConfirm}
          @click=${()=>void this._runDryRun()}
        >
          ${this._dryRunning?"Reading registry\u2026":"Run dry-run preview"}
        </button>
        ${this._dryRunError?h`<p class="setup-err">${this._dryRunError}</p>`:f}
        ${this._renderCompetingWriters()}
        ${t?h`
              <div class="planwrap">
                ${[["Create",t.create,""],["Adopt",t.adopt,""],["Update",t.update,""],["Delete",t.delete,"del"],["Unchanged",t.noop,"quiet"]].map(([e,s,n])=>h`
                    <p class="plan-h ${n}">${e} (${s.length})</p>
                    ${s.length>0&&e!=="Unchanged"?h`<ul class="plan-list ${n}">
                          ${s.map(i=>h`<li>${i.id}</li>`)}
                        </ul>`:f}
                  `)}
              </div>
              ${this._renderApply(t)}
            `:f}
      </div>
    `}_cwRow(t){const e=t.zoneName??"a scheduled zone",s=t.via==="area"?` on ${e} (targets its area)`:t.via==="device"?` on ${e} (targets its device)`:t.via==="label"?` on ${e} (targets a label it carries)`:t.via==="all"?` on every entity, including ${e}`:t.via==="template"?" on a templated target that may be a scheduled zone":t.via==="floor"?" on a floor target that may include a scheduled zone":t.via==="group"?" on a group that may contain a scheduled zone":t.via==="blueprint"?` - ${e} is one of its configured inputs`:` on ${e}`,n=t.service==="(templated service)"?"a templated service":t.service==="(blueprint)"?"a blueprint automation":t.service,i=t.sourceEnabled===false?" - currently off":"";return h`
      <li>
        <span class="cw-src">${t.sourceName}</span>
        <span class="cw-det">${n}${s}${i}</span>
      </li>
    `}_renderCompetingWriters(){if(this._cwScanning)return h`<p class="setup-sub">Checking for other automations that control these thermostats…</p>`;if(this._cwError)return h`
        <p class="setup-err">
          Could not check for competing automations: ${this._cwError} Apply is not blocked by this
          check.
        </p>
      `;const t=this._cwScan;if(!t)return f;const e=h`
      <button class="chip" .disabled=${this._cwScanning} @click=${()=>void this._runCompetingScan(true)}>
        Re-scan
      </button>
    `,s=[`Scanned ${t.scanned} automation${t.scanned===1?"":"s"} and scripts`,t.skippedOwn>0?`, excluding ${t.skippedOwn} of this card's own`:"",t.blueprints>0?`. ${t.blueprints} blueprint automation${t.blueprints===1?" was":"s were"} checked by ${t.blueprints===1?"its":"their"} configured inputs only`:"",t.unreadable>0?`. ${t.unreadable} could not be read (automations and scripts defined in YAML are not readable here)`:"",t.capped?". Coverage was capped, so some were not scanned":"",t.degraded?". Area matching was reduced for this scan (a registry read failed)":"",". Scenes and systems outside Home Assistant automations (Node-RED, vendor apps) are not scanned."].join(""),n=t.conflicts.length===0&&t.notes.length===0,i=n&&!t.capped&&t.unreadable===0&&!t.degraded&&t.blueprints===0;return h`
      <div class="cwwrap">
        ${i?h`<p class="cw-h ok">No automation or script writes to these thermostats.</p>`:f}
        ${n&&!i?h`<p class="cw-h ok">
              No conflicts found among what could be checked - but coverage was partial, see below.
            </p>`:f}
        ${t.conflicts.length>0?h`
              <p class="cw-h bad">Something else also writes to these thermostats (${t.conflicts.length})</p>
              <p class="setup-sub">
                These will fight the schedule engine. The symptom is setpoints that appear to change
                themselves at odd times. Turn them off, delete them, or narrow them so they no
                longer target a scheduled zone. Rows stay listed while the automation exists - a
                disabled one is marked "currently off", because one toggle re-arms it.
              </p>
              <ul class="cw-list">${t.conflicts.map(a=>this._cwRow(a))}</ul>
            `:f}
        ${t.notes.length>0?h`
              <p class="cw-h warn">Also worth knowing (${t.notes.length})</p>
              <p class="setup-sub">
                These do not fight the setpoint, but they change how the engine behaves. Something
                else writing the standby preset can make the schedule quietly stop applying, because
                the engine stands down while that preset is on.
              </p>
              <ul class="cw-list">${t.notes.map(a=>this._cwRow(a))}</ul>
            `:f}
        <p class="cw-foot">${s} This check is advisory and never blocks Apply.</p>
        ${e}
      </div>
    `}_renderTeardown(){const t=this._dryRunKind==="teardown"?this._dryRun:void 0,e=this._prefix,s=this._tdConfirm.trim()===e,n=this._dryRunning||this._execRunning;return h`
      <p class="setup-sub danger-lead">
        This removes every helper, schedule, sensor and automation this card created. Your
        thermostats keep working - they fall back to their own app schedules. Do this
        <em>before</em> deleting the card or uninstalling from HACS, because these objects
        keep running without it.
      </p>
      ${!this._tdAsk&&!this._tdArmed&&!this._tdRunning?h`
            <button class="chip danger" .disabled=${n} @click=${()=>this._tdAsk=true}>
              Remove everything this card manages…
            </button>
          `:f}
      ${this._tdAsk&&!this._tdArmed?h`
            <p class="setup-sub"><strong>Are you sure?</strong> Nothing is deleted yet - the next
            step shows you the exact list first.</p>
            <div class="applyrow">
              <button class="chip danger" .disabled=${n} @click=${()=>void this._armTeardown()}>
                Yes, show me what will be deleted
              </button>
              <button class="chip" @click=${()=>this._resetDangerState()}>Cancel</button>
            </div>
          `:f}
      ${this._tdArmed&&t?h`
            <div class="planwrap">
              <p class="plan-h del">Will be deleted (${t.delete.length})</p>
              <ul class="plan-list del">
                ${t.delete.map(i=>h`<li>${i.id}</li>`)}
              </ul>
            </div>
            <p class="setup-sub">
              Zone scheduling is turned off first, so your thermostats' own app schedules take
              over before anything is removed. Automations you have customized are kept and
              listed for manual review.
            </p>
            <label class="confirmrow">
              <span>Type <code>${e}</code> to confirm</span>
              <input
                .value=${this._tdConfirm}
                placeholder=${e}
                autocomplete="off"
                @input=${i=>this._tdConfirm=i.target.value}
              />
            </label>
            <div class="applyrow">
              <button
                class=${s?"chip danger":"chip"}
                .disabled=${!s||n}
                @click=${()=>void this._runTeardown()}
              >
                Permanently delete ${t.delete.length} objects
              </button>
              <button class="chip" @click=${()=>this._resetDangerState()}>Cancel</button>
            </div>
          `:f}
      ${this._tdRunning?h`<p class="setup-sub">Removing…</p>`:f}
      ${this._execLog.length>0&&(this._tdRunning||this._tdArmed===false)?h`<ul class="plan-list exec-log">
            ${this._execLog.map(i=>h`<li>${i}</li>`)}
          </ul>`:f}
    `}_buildDiag(){const t=this.hass,e=this._config;if(!t||!e)return;const s=(e.zones??[]).map((i,a)=>{const o=w("zone_enabled",this._prefix,C(i.name));return{zone:i.name,index:a,state:O(t,o)?t.states[o]?.state??"unknown":"not provisioned"}}),n=this._dryRun;this._diagText=Un({cardVersion:ps,haVersion:t.config?.version,userAgent:typeof navigator<"u"?navigator.userAgent:void 0,config:e,plan:n?{create:n.create.length,adopt:n.adopt.length,update:n.update.length,delete:n.delete.length,noop:n.noop.length}:null,planKind:this._dryRunKind,objectStatuses:this._objects?this._objects.map(i=>i.status):null,zoneEnabled:s,activeSeason:t.states[k("season_select",this._prefix)]?.state,identifiers:this._diagIds}),this._diagTextHasIds=this._diagIds,this._diagStatus=void 0}async _copyDiag(t){const e=this._diagText??"";try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(e),this._diagStatus="copied";return}}catch{}t.readOnly=false,t.focus(),t.setSelectionRange(0,e.length),t.readOnly=true,this._diagStatus="selected"}_renderObjectsTab(){const t=this._objects,e=[{label:"Schedules",kinds:["schedule"]},{label:"Helpers",kinds:["helper"]},{label:"Sensors",kinds:["template_sensor","stats_sensor"]},{label:"Automations",kinds:["automation"]}],s={managed:{label:"Managed",cls:"ok",hint:"Created and managed by this card."},missing:{label:"Missing",cls:"warn",hint:"Expected but not present - run Apply on the Setup tab."},customized:{label:"Customized",cls:"warn",hint:"You edited this - the card will never overwrite or delete it."},unmanaged:{label:"Unmanaged",cls:"warn",hint:"Matches this naming scheme but is not labeled - Apply would adopt it."},extra:{label:"Not in config",cls:"del",hint:"Managed but no longer in your config - Apply would delete it."}};return h`
      <p class="setup-sub">
        Everything this card creates and manages, all labeled <code>mzcs</code> in Home
        Assistant. Read-only - tap a row to open it.
      </p>
      <button class="chip" .disabled=${this._objectsLoading} @click=${()=>void this._loadObjects(true)}>
        ${this._objectsLoading?"Reading registry\u2026":"Refresh"}
      </button>
      ${this._objectsError?h`<p class="setup-err">${this._objectsError}</p>`:f}
      ${t?h`
            ${e.map(n=>{const i=t.filter(a=>n.kinds.includes(a.kind));return i.length===0?f:h`
                <p class="plan-h">${n.label} (${i.length})</p>
                ${i.map(a=>{const o=s[a.status];return h`
                    <div class="objrow" title=${o.hint} @click=${()=>this._moreInfo(a.id)}>
                      <span class="objname">${a.name}</span>
                      <span class="objid">${a.id.replace(/^automation:/,"automation.")}</span>
                      <span class="objstat ${o.cls}">${o.label}</span>
                    </div>
                  `})}
              `})}
          `:this._objectsLoading?f:h`<p class="setup-sub">Nothing loaded yet.</p>`}
      ${this._renderDiagnostics()}
    `}_renderDiagnostics(){return h`
      <p class="plan-h">Diagnostics</p>
      <p class="setup-sub">
        A summary of this card's version, configuration and last preview, for a bug report.
        <b>Entity ids and the names you gave your zones and rooms are left out</b> - the report is
        still useful without them. Tick the box only if a maintainer asks for them.
      </p>
      <label class="diagopt">
        <input
          type="checkbox"
          .checked=${this._diagIds}
          @change=${t=>{this._diagIds=t.target.checked,this._diagText&&this._buildDiag()}}
        />
        Include entity ids and names
      </label>
      <button class="chip" @click=${()=>this._buildDiag()}>
        ${this._diagText?"Rebuild":"Build report"}
      </button>
      ${this._diagText?h`
            <textarea class="diagbox" readonly .value=${this._diagText} @focus=${t=>t.target.select()}></textarea>
            <button
              class="chip"
              @click=${()=>{const t=this.renderRoot.querySelector(".diagbox");t&&this._copyDiag(t)}}
            >
              ${this._diagStatus==="copied"?"Copied":"Copy"}
            </button>
            ${this._diagStatus==="selected"?h`<p class="setup-sub">
                  This browser will not let a page write to the clipboard, which is normal when
                  Home Assistant is served over plain http. The report is selected above - copy it
                  yourself.
                </p>`:f}
            ${this._diagTextHasIds?h`<p class="setup-err">
                  This report now contains your entity ids and the names of your zones and rooms.
                </p>`:f}
          `:f}
    `}_moreInfo(t){if(t.startsWith("automation:")){const e=t.slice(11),s=this.hass;let n;if(s){for(const i in s.states)if(i.startsWith("automation.")&&s.states[i]?.attributes.id===e){n=i;break}}if(!n)return;t=n}this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:true,composed:true}))}_renderApply(t){const e=Dn(t).length,s=this._execResult;return h`
      ${e>0&&!this._execRunning&&!s&&!this._tdArmed&&!this._tdRunning?this._execConfirm?h`
              <div class="applyrow">
                <button class="chip danger" @click=${()=>void this._runApply()}>
                  Confirm: apply ${e} change${e===1?"":"s"}
                </button>
                <button class="chip" @click=${()=>this._execConfirm=false}>Cancel</button>
              </div>
            `:h`
              <button class="chip" .disabled=${this._dryRunning} @click=${()=>this._execConfirm=true}>
                Apply ${e} change${e===1?"":"s"}…
              </button>
            `:f}
      ${this._execRunning?h`<p class="setup-sub">Applying…</p>`:f}
      ${this._execLog.length>0?h`<ul class="plan-list exec-log">
            ${this._execLog.map(n=>h`<li>${n}</li>`)}
          </ul>`:f}
      ${s?h`<p class="setup-sub ${s.ok?"":"setup-err"}">
            ${s.ok?`Done - ${s.created} created, ${s.adopted} adopted, ${s.updated} updated, ${s.deleted} deleted${s.skipped?`, ${s.skipped} kept as-is`:""}. The plan above has been re-verified against the live registry.`:"Apply failed - created objects from this run were rolled back. See the log above."}
          </p>`:f}
    `}_renderZonesTab(){const t=this.hass;if(!t)return f;const e=k("season_select",this._prefix),s=t.states[e],n=Array.isArray(s?.attributes.options)?s.attributes.options:[];if(Ze.map(c=>({...c,id:k(c.cls,this._prefix)})).filter(c=>O(t,c.id)),!s&&ha(t,this._prefix,this._config?.zones??[]))return h`<p class="setup-sub">Zone switches appear here once the card is provisioned.</p>`;const i=(this._config?.zones??[]).map(c=>{const r=C(c.name);return{name:c.name,enableId:w("zone_enabled",this._prefix,r),markerId:w("applied_block_marker",this._prefix,r)}}).filter(c=>O(t,c.enableId)),a=i.length>0&&i.every(c=>t.states[c.enableId]?.state==="on"),o=i.some(c=>t.states[c.enableId]?.state==="on");return h`
      ${i.length>0?h`
            <div class="managerow master">
              <span>Scheduling · all zones</span>
              <button
                class=${a?"chip togg on":"chip togg"}
                @click=${()=>{for(const c of i)Ft(t,c.enableId,c.markerId,!o)}}
              >
                ${a?"On":o?"Mixed":"Off"}
              </button>
            </div>
            ${i.map(c=>{const r=t.states[c.enableId]?.state==="on";return h`
                <div class="managerow">
                  <span>${c.name} scheduling</span>
                  <button
                    class=${r?"chip togg on":"chip togg"}
                    @click=${()=>void Ft(t,c.enableId,c.markerId,!r)}
                  >
                    ${r?"On":"Off"}
                  </button>
                </div>
              `})}
            <p class="muted" style="font-size:11px;margin:2px 0 6px;">
              Off = the engine stands down and the thermostat's own app schedule takes over.
              Turn a zone On only once its schedule is complete and you have disabled the
              schedule in the thermostat's own app - otherwise the two will fight.
            </p>
            <p class="muted" style="font-size:11px;margin:6px 0 2px;">
              Adding or removing zones, room sensors and their labels is done in the dashboard
              card editor - edit the dashboard, then the pencil on this card. It is not on this
              screen.
            </p>
          `:f}
      ${s?h`
            <div class="managerow">
              <span>Active season</span>
              <select
                @change=${c=>void Di(t,e,c.target.value)}
              >
                ${n.map(c=>h`<option .value=${c} ?selected=${c===s.state}>${c}</option>`)}
              </select>
            </div>
          `:f}
      ${this._renderDaypartsSection()}
    `}_renderTuningTab(){const t=this.hass;if(!t)return f;const e=Ze.map(s=>({...s,id:k(s.cls,this._prefix)})).filter(s=>O(t,s.id));return e.length===0?h`<p class="setup-sub">Tuning helpers appear here once the card is provisioned.</p>`:h`
      ${e.map(s=>h`
          <div class="managerow">
            <span>${s.label}</span>
            <input
              type="number"
              .value=${t.states[s.id]?.state??""}
              @change=${n=>{const i=n.target,a=i.value.trim(),o=Number(a);if(a===""||!Number.isFinite(o)){i.value=t.states[s.id]?.state??"";return}Oi(t,s.id,o).catch(()=>{i.value=t.states[s.id]?.state??""})}}
            />
          </div>
        `)}
      <p class="muted" style="font-size:10px;margin:6px 0 0;">
        These are the LIVE values, stored in Home Assistant helpers. Their defaults and
        starting seeds come from the card's configuration - see the Config tab.
      </p>
    `}_renderThemePicker(){const t=this.hass;if(!t)return f;const e=k("theme",this._prefix);if(!O(t,e))return f;const{presetKey:s,tokens:n}=Zt(t.states[e]?.state),i=a=>{this._themeError=void 0,t.callService("input_text","set_value",{entity_id:e,value:a}).catch(o=>{const c=Number(t.states[e]?.attributes.max),r=a.length>(Number.isFinite(c)?c:100)?` The theme helper allows ${Number.isFinite(c)?c:100} characters and this theme needs ${a.length}: raise its "Maximum length" to 255 in Settings > Devices & services > Helpers (${e}).`:"";this._themeError=`Could not save the theme: ${W(o)}.${r}`})};return h`
      <div class="chips">
        ${Object.entries(nt).map(([a,o])=>h`
            <button
              class=${s===a?"chip mode-on":"chip"}
              @click=${()=>i(a)}
            >
              <span class="swatch" style="background:${o.tokens.accent}"></span>${o.label}
            </button>
          `)}
        <button
          class=${s==="custom"?"chip mode-on":"chip"}
          @click=${()=>i(qt(Bi(n)))}
        >
          Custom
        </button>
      </div>
      ${this._themeError?h`<p class="muted" style="margin:4px 0 0;">${this._themeError}</p>`:f}
      ${s==="custom"?h`
            ${ua.map(a=>h`
                <div class="managerow">
                  <span>${a.label}</span>
                  <input
                    type="color"
                    .value=${n[a.key]}
                    @change=${o=>{const c={...n,[a.key]:o.target.value};i(qt(c))}}
                  />
                </div>
              `)}
            <p class="muted" style="font-size:11px;margin:2px 0 0;">
              Colors apply live to every device showing the card.
            </p>
          `:f}
    `}connectedCallback(){super.connectedCallback(),this._renderedMinute=-1,this._tick=setInterval(()=>this.requestUpdate(),3e4)}disconnectedCallback(){super.disconnectedCallback(),this._tick&&clearInterval(this._tick),this._tick=void 0}_applyTheme(){const t=this.hass?.states[k("theme",this._prefix)]?.state,e=`${this._prefix}|${t??""}`;if(e===this._appliedTheme)return;this._appliedTheme=e;const{tokens:s}=Zt(t);for(const[n,i]of pa)this.style.setProperty(i,s[n])}_watchedEntities(){const t=this._config;if(!t)return[];const e=`${this._prefix}|${this._activeSeasonKey()??""}|${JSON.stringify(t.zones)}|${JSON.stringify(t.seasons)}|${J(t.features)?.entity??""}`;if(this._watchedIds?.key===e)return this._watchedIds.ids;const s=this._prefix,n=[];for(const a of t.zones??[]){a.entity&&n.push(a.entity);for(const r of N(a.room_sensors))n.push(r.entity),r.last_seen&&n.push(r.last_seen);if(!a.name)continue;const o=C(a.name);for(const r of ma)n.push(w(r,s,o));for(const r of t.seasons??[])n.push(de(s,o,r.key));const c=this._activeSeasonKey();c&&n.push(de(s,o,c))}for(const a of fa)n.push(k(a,s));for(const a of Ze)n.push(k(a.cls,s));const i=J(t.features);return i&&n.push(i.entity),this._watchedIds={key:e,ids:n},n}willUpdate(t){if(!t.has("hass")||!this.hass)return;const e=t.get("hass"),s=this._schedLoadedFor;if(!e||!s||this._schedBusy||this._schedDrafts.size>0||e.states[s]===this.hass.states[s])return;const n=this._zone();n&&this._scheduleEntityId(n)===s&&queueMicrotask(()=>void this._loadWeek(n))}shouldUpdate(t){if(t.size>1||!t.has("hass"))return true;const e=t.get("hass"),s=this.hass;if(!e||!s)return true;const n=Math.floor(Date.now()/6e4);if(n!==this._renderedMinute)return this._renderedMinute=n,true;for(const i of this._watchedEntities())if(e.states[i]!==s.states[i])return true;return false}render(){if(!this._config||!this.hass)return f;this._applyTheme();const t=this._zone();if(!t||!t.entity||!t.entity.startsWith("climate."))return h`<ha-card>
        <div class="wrap"><p class="muted pad">Pick a thermostat for each zone in the card editor to get started.</p></div>
      </ha-card>`;if(this._setupOpen)return h`<ha-card><div class="wrap">${this._renderSetup()}</div></ha-card>`;const e=jt(this.hass,t.entity),s=bi(this.hass,w("fan_timer",this._prefix,C(t.name))),n=e.action==="cooling",i=e.action==="heating",a=this.hass.states[t.entity]?.attributes??{},o=a.target_temp_low!=null&&a.target_temp_high!=null?`${a.target_temp_low}\u2013${a.target_temp_high}`:null,c=e.setpoint??o??"\u2013",r=e.available?n?`Cooling to ${c}`:i?`Heating to ${c}`:e.mode==="off"?"Off":`Idle \xB7 set ${c}`:"Unavailable";return h`
      <ha-card>
        <div class="wrap">
          <div class="tabs" role="tablist">
            ${this._config.zones.map((d,l)=>h`
                <button
                  role="tab"
                  aria-selected=${l===this._zoneIndex}
                  class=${l===this._zoneIndex?"tab on":"tab"}
                  @click=${()=>{this._zoneIndex!==l&&(this._zoneIndex=l,this._rtDayCache.clear(),this._rtDaysOpen=new Set,this._rtDayErr=new Map,this._rtDayLoading=new Set)}}
                >
                  ${d.name}
                </button>
              `)}
            <button
              class="tab gear"
              aria-label="Setup"
              @click=${()=>{this._setupOpen=true}}
            >
              ⚙
            </button>
          </div>

          <div class="hero">
            <span
              class="dot ${n?"cool":i?"heat":""}"
              aria-hidden="true"
            ></span>
            <div class="mid">
              <p class="name">${t.name}</p>
              <p class="status">
                ${r}${e.inside!=null?` \xB7 inside ${e.inside}\xB0`:""}${e.humidity!=null?` \xB7 ${e.humidity}% RH`:""}${s?h`<span class="fan"> · fan on</span>`:""}
              </p>
            </div>
            <button
              class="nudge"
              aria-label="Lower setpoint"
              .disabled=${e.setpoint==null}
              @click=${()=>this._nudge(-1)}
            >
              −
            </button>
            <span class="set">${e.setpoint??"\u2013"}</span>
            <button
              class="nudge"
              aria-label="Raise setpoint"
              .disabled=${e.setpoint==null}
              @click=${()=>this._nudge(1)}
            >
              +
            </button>
          </div>

          ${this._renderControls(t.entity)} ${this._renderRooms(t,e.setpoint)}
          ${this._renderSchedule(t)} ${this._renderRuntime(t)}
        </div>
      </ha-card>
    `}_renderRuntime(t){if(!this.hass)return f;const e=this.hass,s=C(t.name),n=w("runtime_today",this._prefix,s);if(!O(e,n))return f;const i=Number(e.states[n]?.state),a=Number.isFinite(i)?Nt(i):"\u2013",o=w("running_sensor",this._prefix,s),c=new Date;c.setHours(0,0,0,0);const r=c.getTime();(this._rtLoadedFor!==o||this._rtLoadedDay!==r)&&(this._rtLoadedDay!==void 0&&this._rtLoadedDay!==r&&this._rtDayCache.delete(this._rtLoadedDay),this._rtLoadedFor=o,this._rtLoadedDay=r,this._rtDays=void 0,queueMicrotask(()=>void Mi(e,o,10).then(x=>{this._rtLoadedFor===o&&(this._rtDays=x)})));const d=new Date;d.setHours(0,0,0,0);const l=this._rtDays?.ok?this._rtDays.rows:[],p=l.filter(x=>x.day<d.getTime()&&x.coverage!=="none").sort((x,R)=>R.day-x.day),u=l.filter(x=>x.day<d.getTime()&&x.coverage==="none").length,m=d.getTime(),g=Number(e.states[w("expected_runtime",this._prefix,s)]?.state),S=Fe(e,k("runtime_alert_margin",this._prefix))??35,_=(Date.now()-m)/36e5,z=Ui(Number.isFinite(i)?i:0,g,S,_);return h`
      <button class="schedrow" @click=${()=>this._rtOpen=!this._rtOpen}>
        <span
          >Runtime · Today <b class="rt-b">${a}</b>${z.label?h` <span class="verdict ${z.status}">· ${z.label}</span>`:f}</span
        >
        <span aria-hidden="true">${this._rtOpen?"\u25B4":"\u25BE"}</span>
      </button>
      ${this._rtOpen?h`
            <div class="schedbody">
              ${this._renderPill(t,"Today",Number.isFinite(i)?i:0,m,true)}
              ${p.map(x=>this._renderPill(t,new Date(x.day).toLocaleDateString(void 0,{weekday:"short",day:"numeric"}),x.hours,x.day,false,x.coverage==="partial"))}
              ${this._rtDays&&!this._rtDays.ok?h`<p class="rt-fail">
                    Could not read history from Home Assistant, so this is not "no
                    runtime yet" - it is unknown. ${this._rtDays.error}
                  </p>`:this._rtDays&&p.length===0?h`<p class="muted" style="font-size:11px;margin:6px 0;">
                      No recorded history for this zone yet - past days appear as the
                      recorder collects them.
                    </p>`:f}
              ${u>0&&p.length>0?h`<p class="muted" style="font-size:10px;margin:6px 0 0;">
                    Recorded history covers the last ${p.length+1} days - older days
                    are gone once the recorder purges them.
                  </p>`:p.some(x=>x.coverage==="partial")?h`<p class="muted" style="font-size:10px;margin:6px 0 0;">
                      The oldest day shows ≥ because the recorder has already trimmed
                      its start.
                    </p>`:f}
              <p class="muted" style="font-size:10px;margin:6px 0 0;">
                Tap a day for its run segments and setpoint changes.
              </p>
            </div>
          `:f}
    `}async _openDay(t,e){if(this._rtDaysOpen.has(e)){if(this._rtDaysOpen=new Set([...this._rtDaysOpen].filter(s=>s!==e)),this._rtDayErr.has(e)){const s=new Map(this._rtDayErr);s.delete(e),this._rtDayErr=s}return}if(this._rtDaysOpen=new Set(this._rtDaysOpen).add(e),!(this._rtDayCache.has(e)&&e+864e5<=Date.now())&&this.hass){this._rtDayLoading=new Set(this._rtDayLoading).add(e);try{const s=C(t.name),n=w("running_sensor",this._prefix,s),i=Math.min(e+864e5,Date.now()),[a,o]=await Promise.all([Ut(this.hass,n,e,i),Ut(this.hass,t.entity,e,i,"temperature")]);if(!a.ok){this._rtDaysOpen.has(e)&&(this._rtDayErr=new Map(this._rtDayErr).set(e,a.error));return}const c=a.rows,r=o.ok?o.rows:[],d={segs:Rs(c,e,i),bubs:ii(r),start:e,end:e+864e5};if(this._rtLoadedFor!==n)return;this._rtDayCache.set(e,d)}finally{this._rtDayLoading=new Set([...this._rtDayLoading].filter(s=>s!==e))}}}_renderPill(t,e,s,n,i,a=false){const o=Math.min(100,Math.max(0,s/24*100)),c=this._rtDaysOpen.has(n);return h`
      <button
        class="pillrow"
        title=${a?"The recorder has trimmed the start of this day; its total is at least this much.":f}
        @click=${()=>void this._openDay(t,n)}
      >
        <span class="pill-label">${e}</span>
        <span class="pill-track">
          <span
            class="pill-fill ${i||c?"today-fill":""}"
            style="width: ${o.toFixed(1)}%"
          ></span>
        </span>
        <span class="pill-hours">${a?"\u2265 ":""}${Nt(s)}</span>
      </button>
      ${c?this._renderDayDetail(n):f}
    `}_renderDayDetail(t){if(this._rtDayLoading.has(t))return h`<p class="muted" style="font-size:11px;">Loading day…</p>`;const e=this._rtDayErr.get(t);if(e!==void 0)return h`<p class="rt-fail">
        Could not read this day's history, so it is unknown rather than a day with no
        runs. ${e}
      </p>`;const s=this._rtDayCache.get(t);return s?h`
      <div class="daydetail">
        <div class="bubblerow">
          ${s.bubs.slice(0,12).map(n=>{const i=(n.t-s.start)/(s.end-s.start)*100;return h`<span class="bubble" style="left: ${i.toFixed(1)}%"
              >${Math.round(n.value)}</span
            >`})}
        </div>
        <div class="segtrack">
          ${s.segs.map(n=>{const{left:i,width:a}=ai(n,s.start,s.end);return h`<span
              class="seg"
              style="left: ${i.toFixed(2)}%; width: ${Math.max(.4,a).toFixed(2)}%"
            ></span>`})}
        </div>
        <div class="axis">
          <span>12A</span><span>6A</span><span>12P</span><span>6P</span><span>12A</span>
        </div>
      </div>
    `:f}_activeSeasonKey(){const t=this.hass?.states[k("season_select",this._prefix)];return!t||t.state==="unknown"?null:dn(this._config?.seasons,t.state)}_scheduleEntityId(t){const e=this._activeSeasonKey();return!e||!t.name?null:de(this._prefix,C(t.name),e)}async _loadWeek(t){if(!this.hass)return;const e=this._scheduleEntityId(t);if(!e||!O(this.hass,e)){this._schedWeek=void 0;return}this._schedBusy=true;try{const s=await Wt(this.hass,e);if(this._schedLoadedFor!==e)return;this._schedWeek=s?.week??void 0,this._schedName=s?.name??"",this._schedError=s?void 0:"Could not load schedule config."}catch(s){this._schedLoadedFor===e&&(this._schedError=W(s))}finally{this._schedBusy=false}}_setBlocks(t,e,s){return this._schedDrafts.get(e)??Be(t[s[0]]??[])}_mutateDraft(t,e,s){if(!this._schedWeek)return;const n=this._schedDrafts.get(t)??Be(this._schedWeek[e[0]]??[]).map(a=>({...a}));s(n);const i=new Map(this._schedDrafts);i.set(t,n),this._schedDrafts=i,this._schedEdited.add(t),this._schedNotice=void 0}_clearSchedEdit(){this._schedDrafts=new Map,this._schedEdited=new Set,this._schedSel=void 0,this._schedGran=void 0}_activeDet(t){if(!this._schedGran)return Yt(t);const e=this._schedGran,s=e==="all"?["all"]:e==="wdwe"?["wd","we"]:[...M];return{granularity:e,sets:Object.fromEntries(s.map(n=>[n,_s(e,n)]))}}_switchGranularity(t){const e=this._schedWeek;if(!e||this._activeDet(e).granularity===t)return;const s=Yt(e),n={};for(const[o,c]of Object.entries(s.sets)){const r=this._schedEdited.has(o)?this._schedDrafts.get(o):void 0;n[o]=(r??Be(e[c[0]]??[])).map(d=>({...d}))}const i=yn(s.granularity,t,n),a=new Map;for(const[o,c]of Object.entries(i))a.set(o,c.map(r=>({...r})));this._schedDrafts=a,this._schedGran=t,this._schedSel=void 0,this._schedNotice=void 0}async _saveSchedDrafts(){const t=this._schedLoadedFor;if(!this.hass||!this._schedWeek||this._schedDrafts.size===0||!t)return;const e=this._activeDet(this._schedWeek);this._schedBusy=true;try{const s=await Wt(this.hass,t);let n=s?.week??this._schedWeek;for(const[i,a]of this._schedDrafts){const o=e.sets[i];o&&(n=Ns(n,o,a))}await Ht(this.hass,t,n,s?.name??this._schedName),this._schedLoadedFor===t&&(this._schedWeek=n,this._clearSchedEdit(),this._schedError=void 0)}catch(s){this._schedError=W(s)}finally{this._schedBusy=false}}_offPeakState(){const t=J(this._config?.features);if(!t||!this.hass)return null;const e=this.hass.states[t.entity]?.state==="on",s=Date.parse(this.hass.states[k("off_peak_paused_on",this._prefix)]?.state??""),n=Number.isFinite(s)&&new Date(s).toDateString()===new Date().toDateString(),i=Number(this.hass.states[k("off_peak_offset",this._prefix)]?.state),a=Number.isFinite(i)?i:t.offsetSeed;return{on:e,paused:n,adjusting:e&&!n,offset:a}}async _toggleOffPeakPause(t){if(!this.hass)return;const e=k("off_peak_paused_on",this._prefix);if(O(this.hass,e))try{await this.hass.callService("input_text","set_value",{entity_id:e,value:t?"":new Date().toISOString()})}catch{}}_steeringFor(t){if(this._config?.features?.steering!==true||!this.hass||!t.name)return null;const e=C(t.name),s=w("room_override_timer",this._prefix,e);if(!O(this.hass,s))return null;const n=this.hass.states[s],i=w("target_room_select",this._prefix,e),a=n?.attributes.finishes_at;return{slug:e,timerId:s,selectId:i,targetId:w("steer_target",this._prefix,e),active:n?.state==="active",label:this.hass.states[i]?.state??"Thermostat",...typeof a=="string"?{finishesAt:a}:{}}}_steerLabels(t){return new Map(Xe(t.room_sensors).map(e=>[e.entity,e.label]))}_openSteerSheet(t,e,s,n){const i=Number(this.hass?.states[k("override_minutes",this._prefix)]?.state);this._steerMins=Number.isFinite(i)&&i>0?Math.min(480,Math.max(15,Math.round(i))):60,this._steerTemp=Math.min(95,Math.max(50,n!=null?Math.round(n):76)),this._steerError=void 0,this._steerSheet={zone:C(t.name),room:e,label:s}}async _startSteer(t,e){const s=this._steeringFor(t);if(!s||!this.hass)return;const n=this.hass,i=Math.min(480,Math.max(5,Math.round(this._steerMins))),a=`${String(Math.floor(i/60)).padStart(2,"0")}:${String(i%60).padStart(2,"0")}:00`,o=Math.min(95,Math.max(50,Math.round(this._steerTemp))),c=Number(n.states[s.targetId]?.state),r=n.states[s.selectId]?.state;try{await n.callService("input_number","set_value",{entity_id:s.targetId,value:o}),await n.callService("input_select","select_option",{entity_id:s.selectId,option:e}),await n.callService("timer","start",{entity_id:s.timerId,duration:a}),this._steerSheet=void 0}catch(d){this._steerError=W(d);try{Number.isFinite(c)&&await n.callService("input_number","set_value",{entity_id:s.targetId,value:c}),typeof r=="string"&&r&&await n.callService("input_select","select_option",{entity_id:s.selectId,option:r})}catch{}}}async _cancelSteer(t){const e=this._steeringFor(t);if(!(!e||!this.hass))try{await this.hass.callService("timer","cancel",{entity_id:e.timerId})}catch{}}async _fetchDaypartItem(t){if(!this.hass?.callWS)throw new Error("Home Assistant connection unavailable.");const e=w("sensor_schedule",this._prefix,t).split(".")[1],n=(await this.hass.callWS({type:"schedule/list"})).find(i=>i.id===e);if(!n)throw new Error(`The sensor schedule (${e}) could not be read - not saving anything.`);return n}async _toggleDayparts(t){if(this._dpZone===t){this._dpZone=void 0,this._dpRows=void 0,this._dpError=void 0;return}this._dpZone=t,this._dpRows=void 0,this._dpError=void 0,this._dpNonUniform=false;try{const e=await this._fetchDaypartItem(t),s=a=>JSON.stringify(e[a]??[]),i=(e.monday??[]).map(a=>({time:String(a.from??"00:00:00").slice(0,5),sensor:a.data?.sensor??"thermostat"})).sort((a,o)=>a.time.localeCompare(o.time));if(this._dpZone!==t)return;this._dpRows=i,this._dpNonUniform=["tuesday","wednesday","thursday","friday","saturday","sunday"].some(a=>s(a)!==s("monday"))}catch(e){this._dpZone===t&&(this._dpError=W(e))}}async _saveDayparts(t){if(!this.hass||!this._dpRows)return;const e=[...this._dpRows].sort((i,a)=>i.time.localeCompare(a.time));if(new Set(e.map(i=>i.time)).size!==e.length){this._dpError="Two dayparts start at the same time - give each its own start.";return}const s=e.map((i,a)=>({from:`${i.time}:00`,to:a+1<e.length?`${e[a+1].time}:00`:"24:00:00",data:{sensor:i.sensor}})),n={};for(const i of["monday","tuesday","wednesday","thursday","friday","saturday","sunday"])n[i]=s;this._dpSaving=true,this._dpError=void 0;try{const i=await this._fetchDaypartItem(t),a=w("sensor_schedule",this._prefix,t);await Ht(this.hass,a,n,String(i.name??a.split(".")[1])),this._dpNonUniform=false}catch(i){this._dpError=W(i)}finally{this._dpSaving=false}}_renderDaypartsSection(){const t=this.hass;if(!t||this._config?.features?.steering!==true)return f;const e=(this._config?.zones??[]).filter(s=>s.name).map(s=>({z:s,slug:C(s.name),schedId:w("sensor_schedule",this._prefix,C(s.name)),rooms:Xe(s.room_sensors)})).filter(s=>s.rooms.length>0&&O(t,s.schedId));return e.length===0?f:h`
      <p class="setup-sub" style="margin-top:12px;">
        Room by time of day - long-term steering. During a daypart mapped to a room, the zone
        steers its scheduled setpoint to THAT room; a manual override from the main screen
        wins until it expires.
      </p>
      ${e.map(({z:s,slug:n,rooms:i})=>{const a=this._dpZone===n;return h`
          <div class="managerow">
            <span>${s.name} · sensor schedule</span>
            <button class="chip" @click=${()=>void this._toggleDayparts(n)}>
              ${a?"Close":"Edit"}
            </button>
          </div>
          ${a?this._dpError?h`<p class="steerrefusal">${this._dpError}</p>`:this._dpRows?h`
                  <div class="dprows">
                    ${this._dpNonUniform?h`<p class="steerrefusal">
                          This schedule currently differs between days (edited outside the card).
                          Saving applies the rows below to EVERY day.
                        </p>`:f}
                    ${this._dpRows.map((o,c)=>h`
                        <div class="dprow">
                          <input
                            type="time"
                            .value=${o.time}
                            @change=${r=>{const d=[...this._dpRows];d[c]={...d[c],time:r.target.value||"00:00"},this._dpRows=d}}
                          />
                          <select
                            @change=${r=>{const d=[...this._dpRows];d[c]={...d[c],sensor:r.target.value},this._dpRows=d}}
                          >
                            <option value="thermostat" ?selected=${o.sensor==="thermostat"}>Thermostat</option>
                            ${i.map(r=>h`<option .value=${r.entity} ?selected=${o.sensor===r.entity}>
                                ${r.label}
                              </option>`)}
                          </select>
                          <button
                            class="steercancel"
                            title="Remove this daypart"
                            @click=${()=>this._dpRows=this._dpRows.filter((r,d)=>d!==c)}
                          >
                            ✕
                          </button>
                        </div>
                      `)}
                    <div class="steerrow">
                      <button
                        class="chip"
                        @click=${()=>this._dpRows=[...this._dpRows??[],{time:"06:00",sensor:"thermostat"}]}
                      >
                        Add daypart
                      </button>
                      <button
                        class="steerstart"
                        ?disabled=${this._dpSaving}
                        @click=${()=>void this._saveDayparts(n)}
                      >
                        ${this._dpSaving?"Saving\u2026":"Save"}
                      </button>
                    </div>
                    <p class="muted" style="font-size:10px;margin:6px 0 0;">
                      Each daypart runs until the next one starts; the last runs to midnight.
                      "Thermostat" means normal scheduling for that stretch. The same rows apply
                      to every day of the week. Takes effect within a few minutes of saving.
                    </p>
                  </div>
                `:h`<p class="muted pad">Loading…</p>`:f}
        `})}
    `}_steerRemaining(t){if(!t)return null;const e=Date.parse(t)-Date.now();if(!Number.isFinite(e)||e<=0)return null;const s=Math.ceil(e/6e4);return s>=60?`${Math.floor(s/60)}h ${s%60}m`:`${s}m`}_renderSchedule(t){if(!this.hass)return f;const e=this._scheduleEntityId(t);if(!e||!O(this.hass,e))return f;this._schedLoadedFor!==e&&(this._schedNotice=this._schedWeek&&Ke(this._schedWeek,this._activeDet(this._schedWeek),this._schedDrafts)?"Unsaved schedule edits were discarded (zone or season changed).":void 0,this._schedLoadedFor=e,this._schedWeek=void 0,this._clearSchedEdit(),queueMicrotask(()=>void this._loadWeek(t)));const s=this.hass.states[k("season_select",this._prefix)]?.state??"",n=this._schedWeek,i=n?Vi(n,new Date):null,a=i?i.cool_temp??i.heat_temp:null,o=this._offPeakState(),c=new Date,r=i?.minutesUntil!=null&&i.minutesUntil<1440-(c.getHours()*60+c.getMinutes()),d=i&&o&&i.cool_temp!=null&&i.heat_temp!=null?Math.max(0,Math.min(o.offset,(i.cool_temp-i.heat_temp-2)/2)):o?.offset??0,l=i&&a!=null&&o?.adjusting&&r?i.cool_temp!=null?a-d:a+d:a,p=i?`Next \xB7 ${ss(i.time)} ${i.name}${l!=null?` \u2192 ${l}\xB0`:""}`:"Schedule",u=n?Ke(n,this._activeDet(n),this._schedDrafts):false;return h`
      <button
        class="schedrow ${u?"unsaved":""}"
        @click=${()=>{this._schedOpen=!this._schedOpen,this._schedWeek||this._loadWeek(t)}}
      >
        <span>
          ${p} <span class="season">· ${s}</span>
          ${o?.on?h`<span
                class="opchip ${o.paused?"paused":""}"
                role="button"
                title=${o.paused?"Off-peak comfort is paused for today - tap to resume":`Off-peak day: comfort offset ${o.offset}\xB0 is applied - tap to pause for today`}
                @click=${m=>{m.stopPropagation(),this._toggleOffPeakPause(o.paused)}}
                >${o.paused?"Off-peak paused":"Off-peak"}</span
              >`:f}
          ${u?h`<span class="unsavedchip">unsaved</span>`:f}
        </span>
        <span aria-hidden="true">${this._schedOpen?"\u25B4":"\u25BE"}</span>
      </button>
      ${!this._schedOpen&&this._schedNotice?h`<p class="unsavedhint">${this._schedNotice}</p>`:f}
      ${!this._schedOpen&&u?h`<p class="unsavedhint">
            This schedule has changes you have not saved. They are not running - open the
            schedule to save or discard them.
          </p>`:f}
      ${this._schedOpen?this._renderScheduleBody(t):f}
    `}_renderScheduleBody(t){if(this._schedBusy&&!this._schedWeek)return h`<p class="muted pad">Loading…</p>`;const e=this._schedWeek;if(!e)return this._schedError?h`<p class="schederr pad">${this._schedError}</p>`:h`<p class="muted pad">No schedule data.</p>`;const s=this._activeDet(e),n=Object.entries(s.sets),i=new Date().getDay(),a=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][i],o=[];for(const[u,m]of n)for(const g of this._setBlocks(e,u,m))g.cool_temp!=null&&o.push(g.cool_temp),g.heat_temp!=null&&o.push(g.heat_temp);let c=o.length?Math.min(...o):70,r=o.length?Math.max(...o):80;if(r-c<6){const u=(r+c)/2;c=u-3,r=u+3}const d=s.granularity==="days",l=Ke(e,this._activeDet(e),this._schedDrafts);return Yi(e)?h`
        <div class="schedbody">
          ${n.map(([u,m],g)=>{const S=Ji(e[m[0]]??[]),_=m.includes(a),z=ns[u]??u.charAt(0).toUpperCase()+u.slice(1);return h`
              <p class="sethead">${z}${_?h` <span class="today">today</span>`:f}</p>
              <div class="sstrip ${d?"small":""}">
                ${S.map(x=>{const R=(x.toMin-x.fromMin)/1440*100,v=x.block?x.block.cool_temp??x.block.heat_temp:null;return h`<span
                    class="sseg ro"
                    style="width:${R}%;background:${x.block&&v!=null?$e(v,c,r):"var(--mzcs-track)"}"
                  >
                    <span class="segt">${x.block?`${v??"\u2013"}\xB0`:"Off"}</span>
                  </span>`})}
              </div>
              ${!d||g===n.length-1?h`<div class="saxis">
                    <span>12A</span><span>4A</span><span>8A</span><span>12P</span><span>4P</span><span>8P</span><span>12A</span>
                  </div>`:f}
            `})}
          <p class="muted pad">
            This schedule has inactive (off) periods set in Home Assistant's own editor. Edit it
            there - the card leaves it untouched to preserve those periods.
          </p>
        </div>
      `:h`
      <div class="schedbody">
        <div class="chips granchips">
          ${[["all","Every day"],["wdwe","Weekday \xB7 Weekend"],["days","Individual days"]].map(([u,m])=>h`
              <button
                class=${s.granularity===u?"chip mode-on":"chip"}
                .disabled=${this._schedBusy}
                @click=${()=>this._switchGranularity(u)}
              >
                ${m}
              </button>
            `)}
        </div>
        ${n.map(([u,m],g)=>{const S=this._setBlocks(e,u,m),_=Xi(S),z=m.includes(a),x=S.some(E=>E.mode==="heat_cool"),R=ns[u]??u.charAt(0).toUpperCase()+u.slice(1),v=h`
            <div class="sstrip ${d?"small":""} ${x?"hc":""}">
              ${_.map(E=>{const T=S.indexOf(E.block),ae=!E.wrap&&this._schedSel?.setKey===u&&this._schedSel?.idx===T,I=(E.toMin-E.fromMin)/1440*100,oe=()=>{this._schedSel={setKey:u,idx:T}};if(x){const De=E.block.cool_temp,Me=E.block.heat_temp;return h`
                    <button class="sseg hcseg ${ae?"sel":""}" style="width:${I}%" @click=${oe}>
                      <span class="hchalf" style="background:${De!=null?$e(De,c,r):"var(--mzcs-track)"}">
                        <span class="segt">${De??"\u2013"}°</span>
                        ${I>15&&!d?h`<span class="segn">${E.block.name}</span>`:f}
                      </span>
                      <span class="hchalf" style="background:${Me!=null?$e(Me,c,r):"var(--mzcs-track)"}">
                        <span class="segt">${Me??"\u2013"}°</span>
                      </span>
                    </button>
                  `}const Oe=E.block.cool_temp??E.block.heat_temp;return h`
                  <button
                    class="sseg ${ae?"sel":""}"
                    style="width:${I}%;background:${Oe!=null?$e(Oe,c,r):"var(--mzcs-track)"}"
                    @click=${oe}
                  >
                    <span class="segt">${Oe??"\u2013"}°</span>
                    ${I>9&&!d?h`<span class="segn">${E.block.name}</span>`:f}
                  </button>
                `})}
            </div>
          `,A=!d||g===n.length-1;return h`
            <p class="sethead">
              ${R}${z?h` <span class="today">today</span>`:f}
            </p>
            ${x?h`<div class="hcwrap">
                  <div class="hcgutter"><span class="gc">Cool</span><span class="gh">Heat</span></div>
                  ${v}
                </div>`:v}
            ${A?h`<div class="saxis ${x?"indent":""}">
                  <span>12A</span><span>4A</span><span>8A</span><span>12P</span><span>4P</span><span>8P</span><span>12A</span>
                </div>`:f}
          `})}
        ${this._renderBlockEditor(s)}
        ${this._schedNotice?h`<p class="muted pad">${this._schedNotice}</p>`:f}
        ${this._schedError?h`<p class="schederr pad">${this._schedError}</p>`:f}
        <div class="schedactions">
          ${l?h`
                <button class="chip save" .disabled=${this._schedBusy}
                  @click=${()=>void this._saveSchedDrafts()}>
                  ${this._schedBusy?"Saving\u2026":"Save changes"}
                </button>
                <button class="chip" .disabled=${this._schedBusy} @click=${()=>this._clearSchedEdit()}>
                  Discard
                </button>
              `:h`
                <button
                  class="chip"
                  .disabled=${this._schedBusy}
                  @click=${()=>{const u=w("applied_block_marker",this._prefix,C(t.name));Ni(this.hass,u,pn(this._prefix,"engine"))}}
                >
                  Apply now
                </button>
                <span class="muted">Tap a block to edit. Changes apply at the next block; Apply now re-asserts immediately.</span>
              `}
        </div>
      </div>
    `}_renderBlockEditor(t){const e=this._schedSel,s=this._schedWeek;if(!e||!s)return f;const n=t.sets[e.setKey];if(!n)return f;const i=this._setBlocks(s,e.setKey,n),a=i[e.idx];if(!a)return f;const o=l=>this._mutateDraft(e.setKey,n,l),c=l=>{o(p=>{const u=p[e.idx],m=L(u.time),g=m+l,S=e.idx>0?L(p[e.idx-1].time)+15:0,_=e.idx<p.length-1?L(p[e.idx+1].time)-15:Math.max(1425,m);u.time=Xt(Math.max(S,Math.min(_,g)))})},r=(l,p)=>{o(u=>{const m=u[e.idx],S=(m[l]??m.cool_temp??m.heat_temp??72)<45,_=(m[l]??(S?22:72))+p;let z=S?5:45,x=S?35:95;m.mode==="heat_cool"&&(l==="cool_temp"&&m.heat_temp!=null&&(z=m.heat_temp+2),l==="heat_temp"&&m.cool_temp!=null&&(x=m.cool_temp-2)),m[l]=Math.max(z,Math.min(x,_))})},d=(l,p,u,m)=>h`
      <div class="managerow">
        <span>${l}</span>
        <span class="stepgrp">
          <button class="stepbtn" @click=${u}>−</button>
          <span class="stepval">${p}</span>
          <button class="stepbtn" @click=${m}>+</button>
        </span>
      </div>
    `;return h`
      <div class="bedit">
        <div class="managerow">
          <span>Block name</span>
          <input
            class="bname-in"
            type="text"
            maxlength="40"
            .value=${a.name}
            @change=${l=>o(p=>{p[e.idx].name=l.target.value.slice(0,40)})}
          />
        </div>
        ${d("Starts",ss(a.time),()=>c(-15),()=>c(15))}
        ${a.mode==="heat_cool"?h`
              ${d("Cool to",`${a.cool_temp??"\u2013"}\xB0`,()=>r("cool_temp",-1),()=>r("cool_temp",1))}
              ${d("Heat to",`${a.heat_temp??"\u2013"}\xB0`,()=>r("heat_temp",-1),()=>r("heat_temp",1))}
            `:a.mode==="heat"?d("Heat to",`${a.heat_temp??"\u2013"}\xB0`,()=>r("heat_temp",-1),()=>r("heat_temp",1)):d("Cool to",`${a.cool_temp??"\u2013"}\xB0`,()=>r("cool_temp",-1),()=>r("cool_temp",1))}
        <div class="bedit-actions">
          <button
            class="chip danger"
            .disabled=${i.length<=1}
            @click=${()=>{o(l=>{l.splice(e.idx,1)}),this._schedSel=void 0}}
          >
            Remove
          </button>
          <button
            class="chip"
            @click=${()=>{const l=e.idx<i.length-1?L(i[e.idx+1].time):1440,p=L(a.time);if(l-p<45)return;const u=Xt(Math.round((p+Math.max(30,(l-p)/2))/15)*15);o(m=>{m.splice(e.idx+1,0,{time:u,name:"New block",mode:a.mode,cool_temp:a.cool_temp,heat_temp:a.heat_temp})}),this._schedSel={setKey:e.setKey,idx:e.idx+1}}}
          >
            Add block after
          </button>
          <button class="chip" @click=${()=>this._schedSel=void 0}>Close</button>
        </div>
      </div>
    `}_renderControls(t){if(!this.hass)return f;const e=this.hass,s=this._zone();if(!s)return f;const n=vi(e,t),i=e.states[t]?.state,a=te(this._config?.features),o=a!==null&&$i(e,t,a),c=a==="eco"?"Eco":(a??"").charAt(0).toUpperCase()+(a??"").slice(1),r=w("fan_timer",this._prefix,C(s.name)),d=this._config?.features?.fan_timer??[15,30,60],l=O(e,r);return h`
      <button class="expander" @click=${()=>this._ctrlOpen=!this._ctrlOpen}>
        <span>Mode</span>
        <span aria-hidden="true">${this._ctrlOpen?"\u25B4":"\u25BE"}</span>
      </button>
      ${this._ctrlOpen?h`
            <div class="ctrl">
              <div class="chips">
                ${n.map(p=>h`
                    <button
                      class=${i===p?"chip mode-on":"chip"}
                      @click=${()=>void zi(e,t,p)}
                    >
                      ${ga(p)}
                    </button>
                  `)}
                ${o?h`
                      <button
                        class=${Pt(e,t,a)?"chip eco eco-on":"chip eco"}
                        @click=${()=>void Ai(e,t,!Pt(e,t,a),a)}
                      >
                        ${c}
                      </button>
                    `:f}
              </div>
              ${l?h`
                    <div class="chips fanrow">
                      <span class="fanlbl">Fan</span>
                      ${d.map(p=>h`
                          <button
                            class="chip"
                            @click=${()=>void Ci(e,t,r,p)}
                          >
                            ${p}m
                          </button>
                        `)}
                    </div>
                  `:f}
            </div>
          `:f}
    `}_renderRooms(t,e){if(!this.hass||!t.room_sensors||t.room_sensors.length===0)return f;const s=this.hass,{greenMax:n,amberMax:i}=na(Fe(s,k("dev_green_max",this._prefix)),Fe(s,k("dev_amber_max",this._prefix))),a=N(t.room_sensors),o=Y(this._config?.display),c=xi(s,[t.entity,...a.map(l=>l.entity),...a.flatMap(l=>l.last_seen?[l.last_seen]:[])]),r=this._steeringFor(t),d=r?this._steerLabels(t):void 0;return h`
      <div class="rooms">
        ${a.map(l=>{const p=Ei(s,l.entity,c,{staleMs:o.staleMs,lastSeenEntity:l.last_seen}),u={...p,name:l.name?.trim()||p.name},m=Bn(o.lastSeen,u.ageMs,o.ageingMs)?h`<span
                class="agechip ${Kn(u.ageMs,o.ageingMs)?"ageing":""}"
                title="Last seen ${Le(u.ageMs)}${Le(u.ageMs)==="now"?"":" ago"} - the device's own last report time."
                >${Le(u.ageMs)}</span
              >`:f,g=d?.get(l.entity),S=!!(r?.active&&g!=null&&r.label===g),_=r&&this._steerSheet&&this._steerSheet.zone===r.slug&&this._steerSheet.room===l.entity,z=e!=null&&e>=45,x=!!(r&&g!=null&&!S&&!u.stale&&u.temp!=null&&z),R=()=>{x&&this._openSteerSheet(t,l.entity,g,e)},v=S?h`<span class="steerchip" title="Steering this room to the override target.">
                  steering${this._steerRemaining(r?.finishesAt)?` \xB7 ${this._steerRemaining(r?.finishesAt)}`:""}</span
                ><button
                  class="steercancel"
                  title="Cancel this override - the schedule takes the zone back."
                  @click=${E=>{E.stopPropagation(),this._cancelSteer(t)}}
                >
                  ✕
                </button>`:f,A=u.temp==null||e==null||u.stale?h`
                  <div
                    class="room ${S?"steering":""}"
                    title=${u.stale?"This sensor has not reported recently - the reading below may be out of date, so steering to it is refused.":f}
                  >
                    <span class="rname">${u.name}</span>
                    <span class="rtemp muted">
                      ${v}${m}${u.temp==null?"\u2014":u.stale?h`<span class="stalechip">stale</span>${qe(u.temp)}°`:`${qe(u.temp)}\xB0`}
                    </span>
                  </div>
                `:h`
                  <div
                    class="room ${S?"steering":""} ${x?"steerable":""}"
                    @click=${R}
                  >
                    <span class="rname">${u.name}</span>
                    <span>
                      ${v}${m}<span
                        class="badge ${ta(Math.round(u.temp-e),n,i)}"
                        >${sa(Math.round(u.temp-e))}</span
                      >
                      <span class="rtemp">${qe(u.temp)}°</span>
                    </span>
                  </div>
                `;return h`${A}${_&&g!=null?this._renderSteerSheet(t,g):f}`})}
        ${r?.active&&![...d?.values()??[]].includes(r.label)?h`
              <!-- QA finding 8: a room renamed/removed mid-override must not
                   hide the only cancel affordance while the override keeps
                   driving the thermostat. -->
              <div class="room steering">
                <span class="rname">${r.label}</span>
                <span>
                  <span class="steerchip" title="An override is active for a room no longer in this zone's config.">
                    steering${this._steerRemaining(r.finishesAt)?` \xB7 ${this._steerRemaining(r.finishesAt)}`:""}</span
                  ><button
                    class="steercancel"
                    title="Cancel this override - the schedule takes the zone back."
                    @click=${l=>{l.stopPropagation(),this._cancelSteer(t)}}
                  >
                    ✕
                  </button>
                </span>
              </div>
            `:f}
      </div>
    `}_renderSteerSheet(t,e){const s=this.hass;if(!s)return f;const n=w("zone_enabled",this._prefix,C(t.name)),i=s.states[n]?.state!=="on",a=te(this._config?.features),o=a!==null&&s.states[t.entity]?.attributes.preset_mode===a,c=s.states[t.entity]?.state!=="cool",r=i?"Zone scheduling is switched off - the kill switch outranks steering.":o?`The '${a}' standby preset is active - steering never overrides standby.`:null;return h`
      <div class="steersheet">
        <p class="steertitle">Steer this zone until ${e} reaches:</p>
        <div class="steerrow">
          <button class="ctl" @click=${()=>this._steerTemp=Math.max(50,this._steerTemp-1)}>−</button>
          <span class="steerval">${this._steerTemp}°</span>
          <button class="ctl" @click=${()=>this._steerTemp=Math.min(95,this._steerTemp+1)}>+</button>
          <span class="steergap"></span>
          <button class="ctl" @click=${()=>this._steerMins=Math.max(15,this._steerMins-15)}>−</button>
          <span class="steerval">${this._steerMins} min</span>
          <button class="ctl" @click=${()=>this._steerMins=Math.min(480,this._steerMins+15)}>+</button>
        </div>
        <p class="muted" style="font-size:10px;margin:4px 0 0;">
          The rest of the zone may overshoot while this room catches up - that is the point.
          It reverts to the schedule when the time is up.${c?" Note: steering only acts while the zone is on a cooling block.":""}
        </p>
        ${r?h`<p class="steerrefusal">${r}</p>`:f}
        ${this._steerError?h`<p class="steerrefusal">${this._steerError}</p>`:f}
        <div class="steerrow">
          <button
            class="steerstart"
            ?disabled=${!!r}
            @click=${()=>void this._startSteer(t,e)}
          >
            Start
          </button>
          <button class="steerclose" @click=${()=>this._steerSheet=void 0}>Close</button>
        </div>
      </div>
    `}};y.styles=as`
    :host {
      --mzcs-accent: #1e88e5;
      --mzcs-accent-bright: #42a5f5;
      --mzcs-good: #2bb673;
      --mzcs-warn: #f59e0b;
      --mzcs-bad: #e5484d;
      --mzcs-bg: #1c262e;
      --mzcs-surface: #243039;
      --mzcs-chip: #2b3844;
      --mzcs-track: #16202a;
      --mzcs-border: #3d4a55;
      --mzcs-text: #e8edf1;
      --mzcs-text-dim: #9fb0bd;
    }
    ha-card {
      background: var(--mzcs-bg);
    }
    .wrap {
      padding: 12px;
      color: var(--mzcs-text);
    }
    .tabs {
      display: flex;
      gap: 4px;
      background: var(--mzcs-track);
      border-radius: 10px;
      padding: 3px;
      margin-bottom: 12px;
    }
    .tab {
      flex: 1;
      padding: 8px 0;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--mzcs-text-dim);
      font-size: 12px;
      cursor: pointer;
    }
    .tab.on {
      background: var(--mzcs-chip);
      color: var(--mzcs-text);
      font-weight: 500;
    }
    .hero {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--mzcs-surface);
      border-radius: 12px;
      padding: 12px 14px;
    }
    .dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--mzcs-text-dim);
      flex: none;
    }
    .dot.cool {
      background: var(--mzcs-accent);
    }
    .dot.heat {
      background: var(--mzcs-warn);
    }
    .mid {
      flex: 1;
      min-width: 0;
    }
    .name {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
    }
    .status {
      margin: 0;
      font-size: 12px;
      color: var(--mzcs-text-dim);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .fan {
      color: var(--mzcs-accent);
    }
    .nudge {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 0.5px solid var(--mzcs-border);
      background: var(--mzcs-chip);
      color: var(--mzcs-text);
      font-size: 18px;
      cursor: pointer;
      flex: none;
    }
    .set {
      font-size: 24px;
      font-weight: 500;
      width: 36px;
      text-align: center;
      flex: none;
    }
    .expander {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: none;
      border: none;
      color: var(--mzcs-text-dim);
      font-size: 12px;
      padding: 10px 4px 6px;
      cursor: pointer;
    }
    .ctrl {
      padding: 2px 2px 8px;
    }
    .chips {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .chip {
      padding: 6px 12px;
      border-radius: 14px;
      background: var(--mzcs-chip);
      border: 0.5px solid var(--mzcs-border);
      color: var(--mzcs-text-dim);
      font-size: 12px;
      cursor: pointer;
    }
    .chip.mode-on {
      background: var(--mzcs-accent);
      border-color: var(--mzcs-accent);
      color: #fff;
    }
    .chip.eco {
      border-color: var(--mzcs-good);
      color: var(--mzcs-good);
    }
    .chip.eco-on {
      background: var(--mzcs-good);
      color: #fff;
    }
    .fanrow {
      margin-top: 8px;
      align-items: center;
    }
    .fanlbl {
      font-size: 12px;
      color: var(--mzcs-text-dim);
      padding: 6px 0;
    }
    .rooms {
      border-top: 0.5px solid var(--mzcs-border);
      margin-top: 6px;
    }
    .room {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      padding: 8px 2px;
      border-bottom: 0.5px solid var(--mzcs-border);
      font-size: 13px;
    }
    /* 300px discipline (items 36/31): the room NAME is what gives - it
       truncates - while the age chip + badge + reading stay on one line.
       Without min-width:0 a long single-word name refuses to shrink and
       pushes the row wider than the card; without nowrap the temperature
       wraps under its badge. */
    .room .rname {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .room > span:last-child {
      flex: 0 0 auto;
      white-space: nowrap;
    }
    .room:last-child {
      border-bottom: none;
    }
    .rtemp {
      font-size: 14px;
    }
    .muted {
      color: var(--mzcs-text-dim);
    }
    .badge {
      font-size: 11px;
      border-radius: 9px;
      padding: 2px 7px;
      margin-right: 8px;
      color: #16202a;
    }
    .badge.green {
      background: var(--mzcs-good);
    }
    .badge.amber {
      background: var(--mzcs-warn);
    }
    .badge.red {
      background: var(--mzcs-bad);
    }
    .tab.gear {
      flex: 0 0 40px;
      font-size: 14px;
    }
    .setup {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
    }
    .setup-title {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
    }
    .setup-sub {
      margin: 0;
      font-size: 12px;
      color: var(--mzcs-text-dim);
    }
    .setup-err {
      color: var(--mzcs-bad);
      font-size: 12px;
    }
    .planwrap {
      width: 100%;
      max-height: 320px;
      overflow-y: auto;
      border: 0.5px solid var(--mzcs-border);
      border-radius: 10px;
      padding: 8px 10px;
    }
    .plan-h {
      margin: 6px 0 2px;
      font-size: 13px;
      font-weight: 500;
    }
    .plan-h.del {
      color: var(--mzcs-bad);
    }
    .plan-h.quiet {
      color: var(--mzcs-text-dim);
      font-weight: 400;
    }
    .plan-list {
      margin: 0 0 4px;
      padding-left: 18px;
      font-size: 11px;
      color: var(--mzcs-text-dim);
    }
    .plan-list.del li {
      color: var(--mzcs-bad);
    }
    .cwwrap {
      width: 100%;
      border: 0.5px solid var(--mzcs-border);
      border-radius: 10px;
      padding: 8px 10px;
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: flex-start;
    }
    .cw-h {
      margin: 2px 0 0;
      font-size: 13px;
      font-weight: 500;
    }
    .cw-h.bad {
      color: var(--mzcs-bad);
    }
    .cw-h.warn {
      color: var(--mzcs-warn);
    }
    .cw-h.ok {
      color: var(--mzcs-text-dim);
      font-weight: 400;
    }
    .cw-list {
      margin: 0;
      padding-left: 18px;
      font-size: 11px;
      width: 100%;
      box-sizing: border-box;
    }
    .cw-list li {
      margin-bottom: 3px;
    }
    .cw-src {
      display: block;
      color: var(--mzcs-text);
      word-break: break-word;
    }
    .cw-det {
      display: block;
      color: var(--mzcs-text-dim);
      word-break: break-word;
    }
    .cw-foot {
      margin: 2px 0 0;
      font-size: 11px;
      color: var(--mzcs-text-dim);
    }
    .applyrow {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }
    .granchips {
      margin: 6px 0 2px;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip.danger {
      background: var(--mzcs-bad);
      border-color: var(--mzcs-bad);
      color: #fff;
    }
    .plan-list.exec-log {
      max-height: 160px;
      overflow-y: auto;
      width: 100%;
      box-sizing: border-box;
    }
    .schedrow {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--mzcs-surface);
      border: none;
      border-radius: 12px;
      color: var(--mzcs-text);
      font-size: 12px;
      padding: 10px 12px;
      margin-top: 10px;
      cursor: pointer;
    }
    .season {
      color: var(--mzcs-warn);
    }
    .schedbody {
      background: var(--mzcs-surface);
      border-radius: 0 0 12px 12px;
      padding: 4px 12px 10px;
      margin-top: -8px;
    }
    .sethead {
      margin: 8px 0 2px;
      font-size: 12px;
      font-weight: 500;
    }
    .today {
      font-size: 10px;
      color: var(--mzcs-accent);
      font-weight: 400;
    }
    .sstrip {
      display: flex;
      height: 46px;
      border-radius: 9px;
      overflow: hidden;
      border: 0.5px solid var(--mzcs-border);
      flex: 1;
    }
    .sstrip.small {
      height: 32px;
    }
    .sstrip.hc {
      height: 58px;
    }
    .sseg {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
      min-width: 0;
      position: relative;
      border: none;
      border-right: 0.5px solid rgba(0, 0, 0, 0.35);
      padding: 0;
      cursor: pointer;
      font: inherit;
    }
    .sseg:last-child {
      border-right: none;
    }
    .sseg.ro {
      cursor: default;
    }
    .sseg.sel::after {
      content: '';
      position: absolute;
      inset: 0;
      border: 2px solid #fff;
      pointer-events: none;
    }
    .segt {
      font-size: 13px;
      font-weight: 700;
      line-height: 1.1;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    }
    .sstrip.small .segt {
      font-size: 11px;
    }
    .segn {
      font-size: 9px;
      opacity: 0.9;
      white-space: nowrap;
      overflow: hidden;
      max-width: 94%;
      text-overflow: ellipsis;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    }
    .hcseg {
      background: transparent;
    }
    .hchalf {
      flex: 1;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      min-height: 0;
    }
    .hchalf .segt {
      font-size: 11.5px;
    }
    .hcwrap {
      display: flex;
      align-items: stretch;
      gap: 5px;
    }
    .hcgutter {
      width: 34px;
      display: flex;
      flex-direction: column;
      border-radius: 7px;
      overflow: hidden;
    }
    .hcgutter span {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      background: var(--mzcs-chip);
    }
    .hcgutter .gc {
      color: #6fb1ff;
    }
    .hcgutter .gh {
      color: #e8843c;
    }
    .saxis {
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: var(--mzcs-text-dim);
      margin-top: 2px;
      padding: 0 1px;
    }
    .saxis.indent {
      margin-left: 39px;
    }
    .bedit {
      background: var(--mzcs-chip);
      border: 0.5px solid var(--mzcs-border);
      border-radius: 10px;
      padding: 8px 10px;
      margin-top: 10px;
    }
    .bedit .managerow {
      padding: 4px 0;
    }
    .bname-in {
      background: var(--mzcs-track);
      border: 0.5px solid var(--mzcs-border);
      border-radius: 6px;
      color: var(--mzcs-text);
      padding: 5px 8px;
      font-size: 12px;
      width: 130px;
    }
    .stepgrp {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .stepbtn {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 0.5px solid var(--mzcs-border);
      background: var(--mzcs-track);
      color: var(--mzcs-text);
      font-size: 15px;
      cursor: pointer;
      line-height: 1;
    }
    .stepval {
      min-width: 62px;
      text-align: center;
      font-size: 12.5px;
      font-weight: 600;
    }
    .bedit-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
      flex-wrap: wrap;
    }
    .chip.save {
      background: var(--mzcs-accent);
      border-color: var(--mzcs-accent);
      color: #fff;
    }
    .schedactions {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
      font-size: 11px;
    }
    .pad {
      padding: 8px 12px;
    }
    .schederr {
      color: var(--mzcs-bad);
      font-size: 12px;
    }
    .managerow {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      padding: 3px 0;
    }
    .rt-b {
      color: var(--mzcs-text);
      font-weight: 500;
    }
    .verdict.normal {
      color: var(--mzcs-good);
    }
    .verdict.high {
      color: var(--mzcs-warn);
    }
    .verdict.learning {
      color: var(--mzcs-text-dim);
    }
    .cols {
      display: flex;
      align-items: flex-end;
      gap: 2px;
      height: 64px;
    }
    .col {
      flex: 1;
      border-radius: 2px 2px 0 0;
      background: var(--mzcs-accent);
      display: block;
    }
    .pillrow {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-size: 12px;
    }
    .pill-label {
      width: 56px;
      flex: none;
    }
    .pill-track {
      flex: 1;
      height: 12px;
      border-radius: 6px;
      background: var(--mzcs-track);
      overflow: hidden;
      display: block;
    }
    .pill-fill {
      display: block;
      height: 12px;
      border-radius: 6px;
      background: var(--mzcs-accent);
    }
    .pill-fill.today-fill {
      background: var(--mzcs-accent-bright);
    }
    .pill-hours {
      width: 48px;
      text-align: right;
      flex: none;
    }
    button.pillrow {
      width: 100%;
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      text-align: left;
    }
    .daydetail {
      padding: 14px 2px 6px;
    }
    .bubblerow {
      position: relative;
      height: 14px;
    }
    .bubble {
      position: absolute;
      top: -10px;
      width: 20px;
      height: 20px;
      margin-left: -10px;
      border-radius: 50%;
      background: var(--mzcs-accent);
      color: #fff;
      font-size: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .segtrack {
      position: relative;
      height: 12px;
      border-radius: 6px;
      background: var(--mzcs-track);
      overflow: hidden;
    }
    .seg {
      position: absolute;
      top: 0;
      height: 12px;
      background: var(--mzcs-accent);
      display: block;
    }
    .axis {
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: var(--mzcs-text-dim);
      margin-top: 2px;
    }
    .managerow.master {
      font-weight: 500;
    }
    .swatch {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 6px;
      vertical-align: -1px;
    }
    .managerow input[type='color'] {
      width: 44px;
      height: 26px;
      padding: 1px;
    }
    .chip.togg {
      min-width: 44px;
    }
    .chip.togg.on {
      background: var(--mzcs-good);
      border-color: var(--mzcs-good);
      color: #fff;
    }
    .setuphead {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
    }
    .settabs {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      background: var(--mzcs-track);
      border-radius: 10px;
      padding: 3px;
      margin-bottom: 10px;
    }
    .settab {
      flex: 1 1 auto;
      background: transparent;
      border: 0;
      border-radius: 8px;
      color: var(--mzcs-muted);
      font-size: 12px;
      padding: 6px 8px;
      cursor: pointer;
    }
    .settab.on {
      background: var(--mzcs-surface);
      color: var(--mzcs-text);
    }
    /* The danger tab is visually set apart at rest, not just when selected. */
    .settab.dangertab {
      color: var(--mzcs-bad);
    }
    .settab.on.danger {
      background: var(--mzcs-bad);
      color: #fff;
    }
    .danger-lead {
      border-left: 2px solid var(--mzcs-bad);
      padding-left: 8px;
    }
    .confirmrow {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin: 8px 0;
      font-size: 12px;
      color: var(--mzcs-muted);
    }
    .confirmrow code {
      color: var(--mzcs-text);
      background: var(--mzcs-track);
      border-radius: 4px;
      padding: 1px 4px;
    }
    .confirmrow input {
      background: var(--mzcs-track);
      border: 1px solid var(--mzcs-bad);
      border-radius: 6px;
      color: var(--mzcs-text);
      padding: 6px 8px;
      font-size: 13px;
    }
    .objrow {
      display: grid;
      width: 100%;
      box-sizing: border-box;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 0 8px;
      align-items: center;
      padding: 6px 0;
      border-bottom: 0.5px solid var(--mzcs-border);
      cursor: pointer;
    }
    .objname {
      font-size: 13px;
      color: var(--mzcs-text);
    }
    .objid {
      grid-column: 1;
      font-size: 10px;
      color: var(--mzcs-muted);
      word-break: break-all;
    }
    .objstat {
      grid-row: 1 / span 2;
      grid-column: 2;
      justify-self: end;
      align-self: center;
      font-size: 10px;
      border-radius: 999px;
      padding: 2px 7px;
      white-space: nowrap;
    }
    .objstat.ok {
      background: var(--mzcs-good);
      color: #16202a;
    }
    .objstat.warn {
      background: var(--mzcs-warn);
      color: #16202a;
    }
    .objstat.del {
      background: var(--mzcs-bad);
      color: #fff;
    }
    .schedrow.unsaved {
      border-left: 2px solid var(--mzcs-warn);
    }
    .unsavedchip {
      font-size: 10px;
      border-radius: 999px;
      padding: 1px 6px;
      margin-left: 6px;
      background: var(--mzcs-warn);
      color: #16202a;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .opchip {
      font-size: 10px;
      border-radius: 999px;
      padding: 1px 6px;
      margin-left: 6px;
      background: var(--mzcs-accent);
      color: #16202a;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      cursor: pointer;
    }
    .opchip.paused {
      background: transparent;
      color: var(--mzcs-muted);
      border: 1px solid var(--mzcs-muted);
    }
    .room.steerable {
      cursor: pointer;
    }
    .room.steering {
      background: rgba(30, 136, 229, 0.14);
      border-radius: 8px;
    }
    .steerchip {
      font-size: 10px;
      border-radius: 999px;
      padding: 1px 6px;
      margin-right: 6px;
      background: var(--mzcs-accent);
      color: #16202a;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .steercancel {
      background: none;
      border: none;
      color: var(--mzcs-text-dim);
      cursor: pointer;
      font-size: 12px;
      padding: 0 4px;
    }
    .steersheet {
      background: var(--mzcs-surface);
      border: 1px solid var(--mzcs-border);
      border-radius: 10px;
      padding: 10px;
      margin: 4px 0 8px;
    }
    .steertitle {
      margin: 0 0 6px;
      font-size: 12px;
      color: var(--mzcs-text);
    }
    .steerrow {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    }
    .steerval {
      min-width: 52px;
      text-align: center;
      font-weight: 600;
    }
    .steergap {
      flex: 1;
    }
    .ctl {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 1px solid var(--mzcs-border);
      background: var(--mzcs-chip);
      color: var(--mzcs-text);
      cursor: pointer;
      font-size: 14px;
    }
    .steerrefusal {
      margin: 6px 0 0;
      font-size: 11px;
      color: var(--mzcs-warn);
    }
    .steerstart {
      background: var(--mzcs-accent);
      color: #16202a;
      border: none;
      border-radius: 8px;
      padding: 6px 16px;
      font-weight: 600;
      cursor: pointer;
    }
    .steerstart:disabled {
      opacity: 0.4;
      cursor: default;
    }
    .steerclose {
      background: var(--mzcs-chip);
      color: var(--mzcs-text);
      border: 1px solid var(--mzcs-border);
      border-radius: 8px;
      padding: 6px 12px;
      cursor: pointer;
    }
    .dprows {
      background: var(--mzcs-surface);
      border: 1px solid var(--mzcs-border);
      border-radius: 10px;
      padding: 10px;
      margin: 4px 0 8px;
    }
    .dprow {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 4px 0;
    }
    .dprow input,
    .dprow select {
      background: var(--mzcs-track);
      color: var(--mzcs-text);
      border: 1px solid var(--mzcs-border);
      border-radius: 6px;
      padding: 4px 6px;
    }
    .cfgcallout {
      background: var(--mzcs-surface);
      border: 1px solid var(--mzcs-accent);
      border-radius: 10px;
      padding: 8px 10px;
      font-size: 12px;
      color: var(--mzcs-text);
      margin: 0 0 8px;
    }
    .cfgtabs {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 0 0 8px;
    }
    .cfgtab {
      background: var(--mzcs-chip);
      color: var(--mzcs-text-dim);
      border: 1px solid var(--mzcs-border);
      border-radius: 999px;
      padding: 3px 10px;
      font-size: 11px;
      cursor: pointer;
    }
    .cfgtab.on {
      background: var(--mzcs-accent);
      color: #16202a;
      border-color: var(--mzcs-accent);
    }
    .cfgrow {
      padding: 6px 2px;
      border-bottom: 1px solid var(--mzcs-track);
    }
    .cfgmain {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      align-items: baseline;
    }
    .cfglabel {
      color: var(--mzcs-text);
      font-size: 13px;
    }
    .cfgvalue {
      color: var(--mzcs-text-dim);
      font-size: 12px;
      text-align: right;
      overflow-wrap: anywhere;
    }
    .cfgdetail {
      margin: 2px 0 0;
      font-size: 11px;
      color: var(--mzcs-text-dim);
      overflow-wrap: anywhere;
    }
    .unsavedhint {
      font-size: 11px;
      margin: 4px 2px 0;
      color: var(--mzcs-warn);
    }
    .rt-fail {
      font-size: 11px;
      margin: 6px 0;
      color: var(--mzcs-warn);
    }
    .diagopt {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12.5px;
      color: var(--mzcs-text-dim);
      margin: 6px 0;
    }
    .diagbox {
      width: 100%;
      min-height: 150px;
      margin-top: 8px;
      background: var(--mzcs-track);
      color: var(--mzcs-text);
      border: 0.5px solid var(--mzcs-border);
      border-radius: 6px;
      padding: 8px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 11px;
      line-height: 1.45;
      resize: vertical;
      white-space: pre;
    }
    .stalechip {
      font-size: 10px;
      border-radius: 999px;
      padding: 1px 6px;
      margin-right: 6px;
      background: var(--mzcs-track);
      border: 0.5px solid var(--mzcs-border);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    /* Item 36: last-seen age. Muted so a healthy row stays quiet; amber once
       past the ageing threshold. Sized like the stale chip so the two never
       fight for the row's height. */
    .agechip {
      font-size: 10px;
      border-radius: 999px;
      padding: 1px 6px;
      margin-right: 6px;
      color: var(--mzcs-text-dim);
      background: var(--mzcs-track);
      border: 0.5px solid var(--mzcs-border);
      letter-spacing: 0.03em;
    }
    .agechip.ageing {
      color: var(--mzcs-warn);
      border-color: var(--mzcs-warn);
    }
    .managerow input,
    .managerow select {
      width: 90px;
      background: var(--mzcs-track);
      border: 0.5px solid var(--mzcs-border);
      border-radius: 6px;
      color: var(--mzcs-text);
      padding: 4px 6px;
      font-size: 12px;
    }
  `;$([pt({attribute:false})],y.prototype,"hass",2);$([b()],y.prototype,"_config",2);$([b()],y.prototype,"_zoneIndex",2);$([b()],y.prototype,"_ctrlOpen",2);$([b()],y.prototype,"_setupOpen",2);$([b()],y.prototype,"_schedOpen",2);$([b()],y.prototype,"_schedWeek",2);$([b()],y.prototype,"_schedError",2);$([b()],y.prototype,"_schedBusy",2);$([b()],y.prototype,"_schedSel",2);$([b()],y.prototype,"_schedDrafts",2);$([b()],y.prototype,"_schedNotice",2);$([b()],y.prototype,"_schedGran",2);$([b()],y.prototype,"_rtOpen",2);$([b()],y.prototype,"_rtDays",2);$([b()],y.prototype,"_rtDayErr",2);$([b()],y.prototype,"_rtDaysOpen",2);$([b()],y.prototype,"_rtDayLoading",2);$([b()],y.prototype,"_dryRun",2);$([b()],y.prototype,"_dryRunError",2);$([b()],y.prototype,"_dryRunning",2);$([b()],y.prototype,"_cwScan",2);$([b()],y.prototype,"_cwScanning",2);$([b()],y.prototype,"_cwError",2);$([b()],y.prototype,"_execConfirm",2);$([b()],y.prototype,"_execRunning",2);$([b()],y.prototype,"_execLog",2);$([b()],y.prototype,"_execResult",2);$([b()],y.prototype,"_tdArmed",2);$([b()],y.prototype,"_tdRunning",2);$([b()],y.prototype,"_setupTab",2);$([b()],y.prototype,"_tdAsk",2);$([b()],y.prototype,"_tdConfirm",2);$([b()],y.prototype,"_diagText",2);$([b()],y.prototype,"_diagTextHasIds",2);$([b()],y.prototype,"_diagIds",2);$([b()],y.prototype,"_diagStatus",2);$([b()],y.prototype,"_objects",2);$([b()],y.prototype,"_objectsLoading",2);$([b()],y.prototype,"_objectsError",2);$([b()],y.prototype,"_configTab",2);$([b()],y.prototype,"_themeError",2);$([b()],y.prototype,"_steerSheet",2);$([b()],y.prototype,"_steerTemp",2);$([b()],y.prototype,"_steerMins",2);$([b()],y.prototype,"_steerError",2);$([b()],y.prototype,"_dpZone",2);$([b()],y.prototype,"_dpRows",2);$([b()],y.prototype,"_dpSaving",2);$([b()],y.prototype,"_dpError",2);$([b()],y.prototype,"_dpNonUniform",2);y=$([ds(ut)],y);window.customCards=window.customCards??[];window.customCards.push({type:ut,name:us,description:"Multi-zone climate view for 1-4 zones with seasonal scheduling, fan timers, and runtime history."});var ya=Object.defineProperty,ba=Object.getOwnPropertyDescriptor,ie=(t,e,s,n)=>{for(var i=n>1?void 0:n?ba(e,s):e,a=t.length-1,o;a>=0;a--)(o=t[a])&&(i=(n?o(e,s,i):o(i))||i);return n&&i&&ya(e,s,i),i};let Ge=null;function va(){return Ge||(Ge=(async()=>{if(!customElements.get("ha-selector"))try{await(await window.loadCardHelpers?.())?.createCardElement({type:"entities",entities:[]})?.constructor.getConfigElement?.(),await customElements.whenDefined("ha-selector")}catch{}})()),Ge}let P=class extends V{constructor(){super(...arguments),this._ready=false,this._bulkLastSeen=null,this._clearedLastSeen=new Set,this._zoneNameErr=new Map}setConfig(t){let e;try{e=Re(t)}catch{e=t}this._bulkLastSeen=null,this._zoneNameErr=new Map,this._config={...e,type:t.type,prefix:e.prefix??"climate",zones:e.zones??[],seasons:e.seasons??ye(),season_switch:e.season_switch??"manual",weather_entity:e.weather_entity,features:{...e.features,fan_timer:e.features?.fan_timer??[15,30,60],anomaly_alerts:e.features?.anomaly_alerts??true}}}connectedCallback(){super.connectedCallback(),va().then(()=>{this._ready=true})}_seasonProvisioned(t){const e=this.hass,s=this._config;if(!e||!s)return true;const n=s.prefix??"climate";return(s.zones??[]).some(i=>i.name&&!!e.states[`schedule.${n}_${C(i.name)}_${t}`])}_emit(t){this._config&&(this._config={...this._config,...t},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:true,composed:true})))}_setZone(t,e){const s=(this._config?.zones??[]).map((n,i)=>i===t?{...n,...e}:n);this._emit({zones:s})}_selector(t,e,s,n){if(!this._ready||!customElements.get("ha-selector")){const i=!!t.entity?.multiple;return h`<input
        .value=${Array.isArray(e)?e.join(", "):typeof e=="string"?e:""}
        placeholder=${n??""}
        @change=${a=>{const o=a.target.value;s(i?o.split(",").map(c=>c.trim()).filter(Boolean):o)}}
      />`}return h`<ha-selector
      .hass=${this.hass}
      .selector=${t}
      .value=${e}
      .label=${n}
      @value-changed=${i=>s(i.detail.value)}
    ></ha-selector>`}_applyLastSeen(t,e,s){const n=this._config?.zones?.[t];n&&(s?this._clearedLastSeen.delete(e):this._clearedLastSeen.add(e),this._setZone(t,{room_sensors:zs(n.room_sensors,e,s)}))}_renderLastSeenField(t,e,s){const n=!s&&this.hass?Ss(this.hass,e):null;return h`
      <div class="lastseenrow">
        ${this._selector({entity:{domain:"sensor",device_class:"timestamp"}},s??"",i=>this._applyLastSeen(t,e,String(i??"").trim()||null),"Last-seen entity (optional)")}
        ${n?h`<button
              class="link suggest"
              title="Fills the field with this entity. Nothing is written until you save."
              @click=${()=>this._applyLastSeen(t,e,n)}
            >
              Use ${n}
            </button>`:f}
      </div>
    `}_renderBulkLastSeen(t){const e=this.hass;return!e||t.every(s=>N(s.room_sensors).length===0)?f:this._bulkLastSeen===null?h`<button
        class="link"
        @click=${()=>{this._bulkLastSeen=Es(t,e,this._clearedLastSeen)}}
      >
        Find last-seen entities
      </button>`:this._bulkLastSeen.length===0?h`<p class="muted">
        No matching last-seen entities for the unassigned room sensors.
        <button class="link" @click=${()=>this._bulkLastSeen=null}>Close</button>
      </p>`:h`
      <div class="bulkpreview">
        <p class="muted">Applying will set:</p>
        ${this._bulkLastSeen.map(s=>h`<p class="bulkrow">${s.sensorEntity} &rarr; ${s.lastSeen}</p>`)}
        <span>
          <button class="link" @click=${()=>this._applyBulkLastSeen()}>Apply</button>
          <button class="link danger" @click=${()=>this._bulkLastSeen=null}>Cancel</button>
        </span>
      </div>
    `}_applyBulkLastSeen(){const t=this._bulkLastSeen??[],e=this.hass;this._bulkLastSeen=null,!(!e||t.length===0)&&this._emit({zones:Zn(this._config?.zones??[],t,e,this._clearedLastSeen)})}render(){const t=this._config;if(!t)return f;const e=t.zones??[],s=t.seasons??[];return h`
      <div class="ed">
        <h4>Zones (1-4)</h4>
        ${e.map((n,i)=>h`
            <div class="zone">
              <div class="zonehead">
                <span>Zone ${i+1}</span>
                <button
                  class="link danger"
                  @click=${()=>{this._zoneNameErr=new Map,this._emit({zones:(this._config?.zones??[]).filter((a,o)=>o!==i)})}}
                >
                  Remove
                </button>
              </div>
              ${this._selector({entity:{domain:"climate"}},n.entity,a=>this._setZone(i,{entity:String(a??"")}),"Thermostat")}
              <input
                class="namefield"
                .value=${n.name??""}
                placeholder="Display name"
                @change=${a=>{const o=a.target,c=o.value;if(Ye.has(C(c))){o.value=this._config?.zones?.[i]?.name??"";const r=new Map(this._zoneNameErr);r.set(i,`"${c}" is reserved for the card's own entities - pick another name.`),this._zoneNameErr=r;return}if(this._zoneNameErr.has(i)){const r=new Map(this._zoneNameErr);r.delete(i),this._zoneNameErr=r}this._setZone(i,{name:c})}}
              />
              ${this._zoneNameErr.has(i)?h`<p class="bad">${this._zoneNameErr.get(i)}</p>`:f}
              ${this._selector({entity:{domain:"sensor",device_class:"temperature",multiple:true}},N(n.room_sensors).map(a=>a.entity),a=>{const o=(a??[]).filter(Boolean),c=new Map(N(this._config?.zones?.[i]?.room_sensors).map(r=>[r.entity,r]));this._setZone(i,{room_sensors:o.map(r=>Ve(c.get(r)??{entity:r}))})},"Room sensors")}
              ${N(n.room_sensors).map(a=>h`
                  <label class="fieldrow roomlabel">
                    <span class="rooment"
                      >${this.hass?.states[a.entity]?.attributes.friendly_name??a.entity}</span
                    >
                    <input
                      .value=${a.name??""}
                      placeholder="Label on card (optional)"
                      @change=${o=>{const c=o.target.value.trim();this._setZone(i,{room_sensors:N(this._config?.zones?.[i]?.room_sensors).map(r=>Ve(r.entity===a.entity?{...r,name:c||void 0}:r))})}}
                    />
                  </label>
                  ${this._renderLastSeenField(i,a.entity,a.last_seen)}
                `)}
              ${this._selector({entity:{domain:"sensor",device_class:"power"}},n.power_entity??"",a=>{const o=typeof a=="string"?a.trim():"";this._setZone(i,{power_entity:o||void 0})},"Power sensor (optional)")}
              ${n.power_entity?.trim()?h`<p class="muted">
                    With a power sensor, the provisioned "running" detection turns on when the
                    sensor reads over 100 W (it must report watts, not kW) or when hvac is active
                    with the room past setpoint (heat_cool relies on the power reading alone) -
                    instead of hvac_action, for brands that never report it (some mini-splits).
                    Applies when the running sensor is created; an existing one keeps its
                    detection until you delete it and re-Apply.
                  </p>`:f}
            </div>
          `)}
        ${e.length<4?h`<button
              class="link"
              @click=${()=>{const n=this._config?.zones??[];this._emit({zones:[...n,{entity:"",name:`Zone ${n.length+1}`}]})}}
            >
              + Add zone
            </button>`:f}
        ${this._renderBulkLastSeen(e)}

        <h4>Seasons (1-4)</h4>
        ${s.map((n,i)=>h`
            <div class="seasonrow">
              <input
                .value=${n.name}
                @change=${a=>{const o=a.target.value,c=this._config?.seasons??[],r=c[i];if(!r)return;const d=o.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""),l=c.some((m,g)=>g!==i&&m.key===d)||Ye.has(d),p=this._seasonProvisioned(r.key)||!d||l?r.key:d,u=c.map((m,g)=>g===i?{...m,name:o,key:p}:m);this._emit({seasons:u})}}
              />
              <select
                .value=${n.default_mode}
                @change=${a=>{const o=a.target.value;this._emit({seasons:(this._config?.seasons??[]).map((c,r)=>r===i?{...c,default_mode:o}:c)})}}
              >
                <option value="cool">Cool</option>
                <option value="heat">Heat</option>
                <option value="heat_cool">Heat+Cool</option>
              </select>
              <button
                class="link danger"
                @click=${()=>this._emit({seasons:(this._config?.seasons??[]).filter((a,o)=>o!==i)})}
              >
                Remove
              </button>
            </div>
          `)}
        ${s.length<4?h`<button
              class="link"
              @click=${()=>{const n=this._config?.seasons??[];let i=n.length+1;for(;n.some(a=>a.key===`season_${i}`);)i++;this._emit({seasons:[...n,{key:`season_${i}`,name:`Season ${i}`,default_mode:"cool"}]})}}
            >
              + Add season
            </button>`:f}

        <h4>Season switching</h4>
        <select
          .value=${t.season_switch??"manual"}
          @change=${n=>this._emit({season_switch:n.target.value})}
        >
          <option value="manual">Manual</option>
          <option value="semi" disabled>Semi-auto (coming in a future release)</option>
          <option value="full" disabled>Full-auto (coming in a future release)</option>
        </select>
        ${this._selector({entity:{domain:"weather"}},t.weather_entity,n=>this._emit({weather_entity:String(n??"")||void 0}),"Weather entity (outdoor temperature for runtime learning)")}

        <h4>Features</h4>
        <label class="checkrow">
          <input
            type="checkbox"
            .checked=${(t.features?.fan_timer?.length??0)>0}
            @change=${n=>this._emit({features:{...this._config?.features,fan_timer:n.target.checked?[15,30,60]:[]}})}
          />
          Fan timer buttons (15/30/60)
        </label>
        <label class="checkrow">
          <input
            type="checkbox"
            .checked=${t.features?.anomaly_alerts??true}
            @change=${n=>this._emit({features:{...this._config?.features,anomaly_alerts:n.target.checked}})}
          />
          Runtime anomaly alerts
        </label>
        <label class="checkrow">
          <input
            type="checkbox"
            .checked=${t.features?.eco_preset!==false}
            @change=${n=>{const i=n.target.checked,a={...this._config?.features};i?delete a.eco_preset:a.eco_preset=false,this._emit({features:a})}}
          />
          Stand down while a standby preset is active
        </label>
        ${t.features?.eco_preset!==false?h`
              <label class="fieldrow">
                Standby preset name
                <input
                  .value=${typeof t.features?.eco_preset=="string"?t.features.eco_preset:"eco"}
                  @change=${n=>{const i=n.target,a=i.value.replace(/['"\\]/g,"").trim()||"eco";i.value=a;const o={...this._config?.features};a==="eco"?delete o.eco_preset:o.eco_preset=a,this._emit({features:o})}}
                />
              </label>
              <p class="muted">
                The engine leaves a zone alone while its thermostat reports this preset.
                'eco' is the most common name; other brands may use 'away', 'sleep', or similar - check
                the thermostat's preset list in Home Assistant.
              </p>
            `:h`
              <p class="bad">
                With this off, the schedule keeps applying setpoints even while a thermostat
                is in its Eco/away mode - overriding, and likely fighting, the device's or
                its app's own standby behavior. Only turn this off if you have disabled
                Eco/away features on the device and want Home Assistant to own standby.
              </p>
            `}

        <h4>Comfort steering</h4>
        <label class="checkrow">
          <input
            type="checkbox"
            .checked=${t.features?.steering===true}
            @change=${n=>{const i=n.target.checked,a={...this._config?.features};i?a.steering=true:delete a.steering,this._emit({features:a})}}
          />
          Steer a zone toward a selected room (cool only)
        </label>
        <p class="muted">
          Tap a room on the card to drive the zone's thermostat until THAT room reaches a
          target, for a set time, then revert to the schedule. Needs room sensors on the
          zone. Turning this on adds per-zone helpers and a steering automation on the next
          Apply; the dry-run shows them first.
        </p>

        <h4>Off-peak comfort</h4>
        <label class="fieldrow">
          Off-peak day entity
          <input
            .value=${t.features?.off_peak_entity??""}
            placeholder="binary_sensor.off_peak_today"
            @change=${n=>{const i=n.target,a=i.value.trim();i.value=a;const o={...this._config?.features};a?o.off_peak_entity=a:(delete o.off_peak_entity,delete o.off_peak_offset),this._emit({features:o})}}
          />
        </label>
        <p class="muted">
          A switch or binary sensor that is ON when today is off-peak (weekends, utility
          holidays). Leave empty to keep the feature off. While it is on, the schedule
          applies each block moved toward comfort by the offset; the docs show a two-step
          recipe (a local calendar plus one template sensor).
        </p>
        ${t.features?.off_peak_entity?h`
              <label class="fieldrow">
                Comfort offset (°, initial value)
                <input
                  type="number"
                  min="0"
                  max="10"
                  .value=${String(t.features?.off_peak_offset??2)}
                  @change=${n=>{const i=n.target.value.trim(),a=i===""?NaN:Math.round(Math.min(10,Math.max(0,Number(i)))),o={...this._config?.features};Number.isFinite(a)&&a!==2?o.off_peak_offset=a:delete o.off_peak_offset,this._emit({features:o})}}
                />
              </label>
              <p class="muted">
                Seeds the provisioned offset helper on Apply. After provisioning, tune the
                live value on the settings panel's Tuning tab - this field does not change
                an existing install.
              </p>
            `:f}

        <h4>Display</h4>
        <label class="fieldrow">
          Last-seen age on room rows
          <select
            .value=${Y(t.display).lastSeen}
            @change=${n=>this._emit({display:{...this._config?.display,last_seen:n.target.value}})}
          >
            <option value="always">Always</option>
            <option value="ageing">Only when ageing</option>
            <option value="off">Off</option>
          </select>
        </label>
        <p class="muted">
          Shows how long since a room sensor's device actually reported, on rows whose
          last-seen entity is set and reporting. Rows without one are unaffected.
        </p>
        <label class="fieldrow">
          Ageing threshold (minutes)
          <input
            type="number"
            min="1"
            .value=${String(Y(t.display).ageingMs/6e4)}
            @change=${n=>{const i=Number(n.target.value),a={...this._config?.display};Number.isFinite(i)&&i>0?a.ageing_minutes=i:delete a.ageing_minutes,this._emit({display:a})}}
          />
        </label>
        <label class="fieldrow">
          Stale after (hours)
          <input
            type="number"
            min="1"
            .value=${String(Y(t.display).staleMs/36e5)}
            @change=${n=>{const i=Number(n.target.value),a={...this._config?.display};Number.isFinite(i)&&i>0?a.stale_hours=i:delete a.stale_hours,this._emit({display:a})}}
          />
        </label>
        <p class="muted">
          A reading older than this is greyed out and marked stale instead of trusted.
        </p>

        <h4>Advanced</h4>
        <label class="fieldrow">
          Entity prefix
          <input
            .value=${t.prefix??"climate"}
            @change=${n=>{const i=n.target,a=C(i.value)||"climate";i.value=a,this._emit({prefix:a})}}
          />
        </label>
      </div>
    `}};P.styles=as`
    .lastseenrow {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin: 0 0 6px 12px;
    }
    .lastseenrow .suggest {
      align-self: flex-start;
      font-size: 12px;
    }
    .bulkpreview {
      border: 1px dashed var(--divider-color, #444);
      border-radius: 8px;
      padding: 8px;
    }
    .bulkpreview .bulkrow {
      margin: 2px 0;
      font-size: 12px;
      font-family: monospace;
    }
    .roomlabel {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }
    .roomlabel .rooment {
      flex: 1 1 auto;
      opacity: 0.75;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .roomlabel input {
      flex: 0 0 45%;
    }
    .ed {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 4px 0 12px;
    }
    h4 {
      margin: 10px 0 2px;
      font-size: 14px;
    }
    .zone {
      border: 1px solid var(--divider-color, #444);
      border-radius: 10px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .zonehead {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
    }
    .seasonrow {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 8px;
      align-items: center;
    }
    .link {
      background: none;
      border: none;
      color: var(--primary-color, #03a9f4);
      cursor: pointer;
      text-align: left;
      padding: 4px 0;
      font-size: 13px;
    }
    .link.danger {
      color: var(--error-color, #e5484d);
    }
    input,
    select {
      padding: 8px;
      border-radius: 6px;
      border: 1px solid var(--divider-color, #444);
      background: var(--card-background-color, transparent);
      color: var(--primary-text-color, inherit);
      font-size: 13px;
    }
    .checkrow,
    .fieldrow {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }
    .fieldrow input {
      width: 120px;
    }
    .ok {
      color: var(--success-color, #2bb673);
      font-size: 12px;
      margin: 0;
    }
    .bad {
      color: var(--error-color, #e5484d);
      font-size: 12px;
      margin: 0;
    }
  `;ie([pt({attribute:false})],P.prototype,"hass",2);ie([b()],P.prototype,"_config",2);ie([b()],P.prototype,"_ready",2);ie([b()],P.prototype,"_bulkLastSeen",2);ie([b()],P.prototype,"_zoneNameErr",2);P=ie([ds(hs)],P);const $a=Object.freeze(Object.defineProperty({__proto__:null,get MzcsCardEditor(){return P}},Symbol.toStringTag,{value:"Module"}));export{y as MzcsCard};

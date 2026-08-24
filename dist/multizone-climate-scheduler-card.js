"use strict";/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const de=globalThis,Me=de.ShadowRoot&&(de.ShadyCSS===void 0||de.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Te=Symbol(),Ge=new WeakMap;let Et=class{constructor(e,s,n){if(this._$cssResult$=true,n!==Te)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=s}get styleSheet(){let e=this.o;const s=this.t;if(Me&&e===void 0){const n=s!==void 0&&s.length===1;n&&(e=Ge.get(s)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&Ge.set(s,e))}return e}toString(){return this.cssText}};const Jt=t=>new Et(typeof t=="string"?t:t+"",void 0,Te),At=(t,...e)=>{const s=t.length===1?t[0]:e.reduce((n,i,o)=>n+(a=>{if(a._$cssResult$===true)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[o+1],t[0]);return new Et(s,t,Te)},Yt=(t,e)=>{if(Me)t.adoptedStyleSheets=e.map(s=>s instanceof CSSStyleSheet?s:s.styleSheet);else for(const s of e){const n=document.createElement("style"),i=de.litNonce;i!==void 0&&n.setAttribute("nonce",i),n.textContent=s.cssText,t.appendChild(n)}},Ve=Me?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let s="";for(const n of e.cssRules)s+=n.cssText;return Jt(s)})(t):t;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Xt,defineProperty:Qt,getOwnPropertyDescriptor:es,getOwnPropertyNames:ts,getOwnPropertySymbols:ss,getPrototypeOf:ns}=Object,ge=globalThis,Je=ge.trustedTypes,is=Je?Je.emptyScript:"",as=ge.reactiveElementPolyfillSupport,G=(t,e)=>t,pe={toAttribute(t,e){switch(e){case Boolean:t=t?is:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=t!==null;break;case Number:s=t===null?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch{s=null}}return s}},Pe=(t,e)=>!Xt(t,e),Ye={attribute:true,type:String,converter:pe,reflect:false,useDefault:false,hasChanged:Pe};Symbol.metadata??=Symbol("metadata"),ge.litPropertyMetadata??=new WeakMap;let H=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,s=Ye){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(e)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(e,s),!s.noAccessor){const n=Symbol(),i=this.getPropertyDescriptor(e,n,s);i!==void 0&&Qt(this.prototype,e,i)}}static getPropertyDescriptor(e,s,n){const{get:i,set:o}=es(this.prototype,e)??{get(){return this[s]},set(a){this[s]=a}};return{get:i,set(a){const c=i?.call(this);o?.call(this,a),this.requestUpdate(e,c,n)},configurable:true,enumerable:true}}static getPropertyOptions(e){return this.elementProperties.get(e)??Ye}static _$Ei(){if(this.hasOwnProperty(G("elementProperties")))return;const e=ns(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(G("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(G("properties"))){const s=this.properties,n=[...ts(s),...ss(s)];for(const i of n)this.createProperty(i,s[i])}const e=this[Symbol.metadata];if(e!==null){const s=litPropertyMetadata.get(e);if(s!==void 0)for(const[n,i]of s)this.elementProperties.set(n,i)}this._$Eh=new Map;for(const[s,n]of this.elementProperties){const i=this._$Eu(s,n);i!==void 0&&this._$Eh.set(i,s)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const s=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const i of n)s.unshift(Ve(i))}else e!==void 0&&s.push(Ve(e));return s}static _$Eu(e,s){const n=s.attribute;return n===false?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,s=this.constructor.elementProperties;for(const n of s.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Yt(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,s,n){this._$AK(e,n)}_$ET(e,s){const n=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,n);if(i!==void 0&&n.reflect===true){const o=(n.converter?.toAttribute!==void 0?n.converter:pe).toAttribute(s,n.type);this._$Em=e,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(e,s){const n=this.constructor,i=n._$Eh.get(e);if(i!==void 0&&this._$Em!==i){const o=n.getPropertyOptions(i),a=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:pe;this._$Em=i;const c=a.fromAttribute(s,o.type);this[i]=c??this._$Ej?.get(i)??c,this._$Em=null}}requestUpdate(e,s,n,i=false,o){if(e!==void 0){const a=this.constructor;if(i===false&&(o=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??Pe)(o,s)||n.useDefault&&n.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,s,n)}this.isUpdatePending===false&&(this._$ES=this._$EP())}C(e,s,{useDefault:n,reflect:i,wrapped:o},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??s??this[e]),o!==true||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(s=void 0),this._$AL.set(e,s)),i===true&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=true;try{await this._$ES}catch(s){Promise.reject(s)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[i,o]of this._$Ep)this[i]=o;this._$Ep=void 0}const n=this.constructor.elementProperties;if(n.size>0)for(const[i,o]of n){const{wrapped:a}=o,c=this[i];a!==true||this._$AL.has(i)||c===void 0||this.C(i,void 0,o,c)}}let e=false;const s=this._$AL;try{e=this.shouldUpdate(s),e?(this.willUpdate(s),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(s)):this._$EM()}catch(n){throw e=false,this._$EM(),n}e&&this._$AE(s)}willUpdate(e){}_$AE(e){this._$EO?.forEach(s=>s.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=false}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return true}update(e){this._$Eq&&=this._$Eq.forEach(s=>this._$ET(s,this[s])),this._$EM()}updated(e){}firstUpdated(e){}};H.elementStyles=[],H.shadowRootOptions={mode:"open"},H[G("elementProperties")]=new Map,H[G("finalized")]=new Map,as?.({ReactiveElement:H}),(ge.reactiveElementVersions??=[]).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ne=globalThis,Xe=t=>t,he=Ne.trustedTypes,Qe=he?he.createPolicy("lit-html",{createHTML:t=>t}):void 0,zt="$lit$",P=`lit$${Math.random().toFixed(9).slice(2)}$`,Rt="?"+P,os=`<${Rt}>`,j=document,J=()=>j.createComment(""),Y=t=>t===null||typeof t!="object"&&typeof t!="function",Ie=Array.isArray,rs=t=>Ie(t)||typeof t?.[Symbol.iterator]=="function",xe=`[ 	
\f\r]`,K=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,et=/-->/g,tt=/>/g,L=RegExp(`>|${xe}(?:([^\\s"'>=/]+)(${xe}*=${xe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),st=/'/g,nt=/"/g,Ct=/^(?:script|style|textarea|title)$/i,cs=t=>(e,...s)=>({_$litType$:t,strings:e,values:s}),u=cs(1),B=Symbol.for("lit-noChange"),m=Symbol.for("lit-nothing"),it=new WeakMap,W=j.createTreeWalker(j,129);function Ot(t,e){if(!Ie(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return Qe!==void 0?Qe.createHTML(e):e}const ls=(t,e)=>{const s=t.length-1,n=[];let i,o=e===2?"<svg>":e===3?"<math>":"",a=K;for(let c=0;c<s;c++){const r=t[c];let l,d,p=-1,h=0;for(;h<r.length&&(a.lastIndex=h,d=a.exec(r),d!==null);)h=a.lastIndex,a===K?d[1]==="!--"?a=et:d[1]!==void 0?a=tt:d[2]!==void 0?(Ct.test(d[2])&&(i=RegExp("</"+d[2],"g")),a=L):d[3]!==void 0&&(a=L):a===L?d[0]===">"?(a=i??K,p=-1):d[1]===void 0?p=-2:(p=a.lastIndex-d[2].length,l=d[1],a=d[3]===void 0?L:d[3]==='"'?nt:st):a===nt||a===st?a=L:a===et||a===tt?a=K:(a=L,i=void 0);const f=a===L&&t[c+1].startsWith("/>")?" ":"";o+=a===K?r+os:p>=0?(n.push(l),r.slice(0,p)+zt+r.slice(p)+P+f):r+P+(p===-2?c:f)}return[Ot(t,o+(t[s]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]};class X{constructor({strings:e,_$litType$:s},n){let i;this.parts=[];let o=0,a=0;const c=e.length-1,r=this.parts,[l,d]=ls(e,s);if(this.el=X.createElement(l,n),W.currentNode=this.el.content,s===2||s===3){const p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(i=W.nextNode())!==null&&r.length<c;){if(i.nodeType===1){if(i.hasAttributes())for(const p of i.getAttributeNames())if(p.endsWith(zt)){const h=d[a++],f=i.getAttribute(p).split(P),w=/([.?@])?(.*)/.exec(h);r.push({type:1,index:o,name:w[2],strings:f,ctor:w[1]==="."?us:w[1]==="?"?ps:w[1]==="@"?hs:ye}),i.removeAttribute(p)}else p.startsWith(P)&&(r.push({type:6,index:o}),i.removeAttribute(p));if(Ct.test(i.tagName)){const p=i.textContent.split(P),h=p.length-1;if(h>0){i.textContent=he?he.emptyScript:"";for(let f=0;f<h;f++)i.append(p[f],J()),W.nextNode(),r.push({type:2,index:++o});i.append(p[h],J())}}}else if(i.nodeType===8)if(i.data===Rt)r.push({type:2,index:o});else{let p=-1;for(;(p=i.data.indexOf(P,p+1))!==-1;)r.push({type:7,index:o}),p+=P.length-1}o++}}static createElement(e,s){const n=j.createElement("template");return n.innerHTML=e,n}}function F(t,e,s=t,n){if(e===B)return e;let i=n!==void 0?s._$Co?.[n]:s._$Cl;const o=Y(e)?void 0:e._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(false),o===void 0?i=void 0:(i=new o(t),i._$AT(t,s,n)),n!==void 0?(s._$Co??=[])[n]=i:s._$Cl=i),i!==void 0&&(e=F(t,i._$AS(t,e.values),i,n)),e}class ds{constructor(e,s){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:s},parts:n}=this._$AD,i=(e?.creationScope??j).importNode(s,true);W.currentNode=i;let o=W.nextNode(),a=0,c=0,r=n[0];for(;r!==void 0;){if(a===r.index){let l;r.type===2?l=new se(o,o.nextSibling,this,e):r.type===1?l=new r.ctor(o,r.name,r.strings,this,e):r.type===6&&(l=new ms(o,this,e)),this._$AV.push(l),r=n[++c]}a!==r?.index&&(o=W.nextNode(),a++)}return W.currentNode=j,i}p(e){let s=0;for(const n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,s),s+=n.strings.length-2):n._$AI(e[s])),s++}}class se{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,s,n,i){this.type=2,this._$AH=m,this._$AN=void 0,this._$AA=e,this._$AB=s,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??true}get parentNode(){let e=this._$AA.parentNode;const s=this._$AM;return s!==void 0&&e?.nodeType===11&&(e=s.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,s=this){e=F(this,e,s),Y(e)?e===m||e==null||e===""?(this._$AH!==m&&this._$AR(),this._$AH=m):e!==this._$AH&&e!==B&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):rs(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==m&&Y(this._$AH)?this._$AA.nextSibling.data=e:this.T(j.createTextNode(e)),this._$AH=e}$(e){const{values:s,_$litType$:n}=e,i=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=X.createElement(Ot(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(s);else{const o=new ds(i,this),a=o.u(this.options);o.p(s),this.T(a),this._$AH=o}}_$AC(e){let s=it.get(e.strings);return s===void 0&&it.set(e.strings,s=new X(e)),s}k(e){Ie(this._$AH)||(this._$AH=[],this._$AR());const s=this._$AH;let n,i=0;for(const o of e)i===s.length?s.push(n=new se(this.O(J()),this.O(J()),this,this.options)):n=s[i],n._$AI(o),i++;i<s.length&&(this._$AR(n&&n._$AB.nextSibling,i),s.length=i)}_$AR(e=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);e!==this._$AB;){const n=Xe(e).nextSibling;Xe(e).remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class ye{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,s,n,i,o){this.type=1,this._$AH=m,this._$AN=void 0,this.element=e,this.name=s,this._$AM=i,this.options=o,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=m}_$AI(e,s=this,n,i){const o=this.strings;let a=false;if(o===void 0)e=F(this,e,s,0),a=!Y(e)||e!==this._$AH&&e!==B,a&&(this._$AH=e);else{const c=e;let r,l;for(e=o[0],r=0;r<o.length-1;r++)l=F(this,c[n+r],s,r),l===B&&(l=this._$AH[r]),a||=!Y(l)||l!==this._$AH[r],l===m?e=m:e!==m&&(e+=(l??"")+o[r+1]),this._$AH[r]=l}a&&!i&&this.j(e)}j(e){e===m?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class us extends ye{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===m?void 0:e}}class ps extends ye{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==m)}}class hs extends ye{constructor(e,s,n,i,o){super(e,s,n,i,o),this.type=5}_$AI(e,s=this){if((e=F(this,e,s,0)??m)===B)return;const n=this._$AH,i=e===m&&n!==m||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,o=e!==m&&(n===m||i);i&&this.element.removeEventListener(this.name,this,n),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ms{constructor(e,s,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=s,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){F(this,e)}}const fs=Ne.litHtmlPolyfillSupport;fs?.(X,se),(Ne.litHtmlVersions??=[]).push("3.3.3");const _s=(t,e,s)=>{const n=s?.renderBefore??e;let i=n._$litPart$;if(i===void 0){const o=s?.renderBefore??null;n._$litPart$=i=new se(e.insertBefore(J(),o),o,void 0,s??{})}return i._$AI(t),i};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Le=globalThis;class U extends H{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const s=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=_s(s,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false)}render(){return B}}U._$litElement$=true,U.finalized=true,Le.litElementHydrateSupport?.({LitElement:U});const gs=Le.litElementPolyfillSupport;gs?.({LitElement:U});(Le.litElementVersions??=[]).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Dt=t=>(e,s)=>{s!==void 0?s.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ys={attribute:true,type:String,converter:pe,reflect:false,hasChanged:Pe},bs=(t=ys,e,s)=>{const{kind:n,metadata:i}=s;let o=globalThis.litPropertyMetadata.get(i);if(o===void 0&&globalThis.litPropertyMetadata.set(i,o=new Map),n==="setter"&&((t=Object.create(t)).wrapped=true),o.set(s.name,t),n==="accessor"){const{name:a}=s;return{set(c){const r=e.get.call(this);e.set.call(this,c),this.requestUpdate(a,r,t,true,c)},init(c){return c!==void 0&&this.C(a,void 0,t,c),c}}}if(n==="setter"){const{name:a}=s;return function(c){const r=this[a];e.call(this,c),this.requestUpdate(a,r,t,true,c)}}throw Error("Unsupported decorator location: "+n)};function We(t){return(e,s)=>typeof s=="object"?bs(t,e,s):((n,i,o)=>{const a=i.hasOwnProperty(o);return i.constructor.createProperty(o,n),a?Object.getOwnPropertyDescriptor(i,o):void 0})(t,e,s)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function b(t){return We({...t,state:true,attribute:false})}const $s="1.0.0",je="multizone-climate-scheduler-card",Mt="Multi-Zone Climate Scheduler Card",Tt=`${je}-editor`;function at(t,e){const s=t.states[e];if(!s||s.state==="unavailable"||s.state==="unknown")return{available:false,mode:"unavailable",action:"",setpoint:null,targetLow:null,targetHigh:null,inside:null,humidity:null};const n=s.attributes,i=o=>typeof o=="number"?o:null;return{available:true,mode:s.state,action:typeof n.hvac_action=="string"?n.hvac_action:"",setpoint:i(n.temperature),targetLow:i(n.target_temp_low),targetHigh:i(n.target_temp_high),inside:i(n.current_temperature),humidity:i(n.current_humidity)}}function vs(t,e){return t.states[e]?.state==="active"}function T(t,e){return t.states[e]!==void 0}function xs(t,e){const s=t.states[e]?.attributes.hvac_modes;return Array.isArray(s)?s.filter(n=>typeof n=="string"):[]}function ws(t,e){const s=t.states[e]?.attributes.preset_modes;return Array.isArray(s)&&s.includes("eco")}function ot(t,e){return t.states[e]?.attributes.preset_mode==="eco"}function we(t,e){const s=t.states[e];if(!s)return null;const n=Number(s.state);return Number.isFinite(n)?n:null}function ks(t,e){const s=t.states[e],n=typeof s?.attributes.friendly_name=="string"?s.attributes.friendly_name.replace(/ (Temperature|temperature)$/,""):e.split(".")[1]??e,i=s?Number(s.state):NaN;return{entityId:e,name:n,temp:Number.isFinite(i)?i:null}}function Ss(t,e,s){return t.callService("climate","set_hvac_mode",{entity_id:e,hvac_mode:s})}function Es(t,e,s){return t.callService("climate","set_preset_mode",{entity_id:e,preset_mode:s?"eco":"none"})}function As(t,e){const s=t.states[e]?.attributes.fan_modes;return Array.isArray(s)&&s.includes("on")}async function zs(t,e,s,n){As(t,e)&&await t.callService("climate","set_fan_mode",{entity_id:e,fan_mode:"on"});const i=String(n%60).padStart(2,"0"),o=String(Math.floor(n/60)).padStart(2,"0");await t.callService("timer","start",{entity_id:s,duration:`${o}:${i}:00`})}function Rs(t,e,s,n){const i=typeof s=="number"?s:null,o=typeof n=="number"?n:null;return i!=null&&o!=null&&i<o&&e!=null&&e>=i&&e<=o?Math.min(o,Math.max(i,t)):t}const Pt=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];async function rt(t,e){if(!t.callWS)return null;const s=e.split(".")[1];try{const i=(await t.callWS({type:"schedule/list"})).find(a=>a.id===s);if(!i)return null;const o={};for(const a of Pt)i[a]&&(o[a]=i[a]);return{id:String(i.id),name:typeof i.name=="string"?i.name:void 0,week:o}}catch{return null}}function Cs(t,e,s,n){if(!t.callWS)return Promise.reject(new Error("callWS unavailable"));const o={type:"schedule/update",schedule_id:e.split(".")[1],name:n};for(const a of Pt)o[a]=s[a]??[];return t.callWS(o)}function Os(t,e,s){return t.callService("input_number","set_value",{entity_id:e,value:s})}function Ds(t,e,s){return t.callService("input_select","select_option",{entity_id:e,option:s})}async function ct(t,e,s,n){if(n)try{await t.callService("input_text","set_value",{entity_id:s,value:""})}catch{}await t.callService("input_boolean",n?"turn_on":"turn_off",{entity_id:e})}async function lt(t,e,s){if(!t.callWS)return[];const n=new Date;n.setHours(0,0,0,0),n.setDate(n.getDate()-(s-1));try{return((await t.callWS({type:"recorder/statistics_during_period",start_time:n.toISOString(),statistic_ids:[e],period:"day",types:["max"]}))?.[e]??[]).filter(a=>typeof a.max=="number").map(a=>({day:a.start,hours:a.max}))}catch{return[]}}function Ms(t,e){const s=[];for(const n of t){if(typeof n.lu!="number")continue;const i=n.lu*1e3;if(e){const o=n.a?.[e];if(o==null)continue;s.push({t:i,state:String(o)})}else typeof n.s=="string"&&s.push({t:i,state:n.s})}return s}async function dt(t,e,s,n,i){if(!t.callWS)return[];try{const o=await t.callWS({type:"history/history_during_period",start_time:new Date(s).toISOString(),end_time:new Date(n).toISOString(),entity_ids:[e],minimal_response:!i,no_attributes:!i,significant_changes_only:false});return Ms(o?.[e]??[],i)}catch{return[]}}function ut(t){return t instanceof Error?t.message:t&&typeof t=="object"&&"message"in t?String(t.message):JSON.stringify(t)}async function Ts(t,e,s){await t.callService("input_text","set_value",{entity_id:e,value:""}),await t.callService("automation","trigger",{entity_id:s})}function Ps(t,e,s){return t.callService("climate","set_temperature",{entity_id:e,temperature:s})}function Ns(t,e,s,n="on",i=6e4){const o=[...t].sort((d,p)=>d.t-p.t),a=[];let c="off";for(const d of o)if(d.t<=e)c=d.state;else break;let r=c===n?e:null;for(const d of o){if(d.t<=e||d.t>=s)continue;const p=d.state===n;p&&r==null&&(r=d.t),!p&&r!=null&&(a.push({start:r,end:d.t}),r=null)}r!=null&&a.push({start:r,end:s});const l=[];for(const d of a){const p=l[l.length-1];p&&d.start-p.end<=i?p.end=d.end:l.push({...d})}return l}function Is(t){const e=[...t].sort((n,i)=>n.t-i.t),s=[];for(const n of e){const i=Number(n.state);if(!Number.isFinite(i))continue;const o=s[s.length-1];(!o||o.value!==i)&&s.push({t:n.t,value:i})}return s}function q(t){if(!Number.isFinite(t)||t<0)return"\u2013";const e=Math.round(t*4)/4,s=Math.floor(e),n=e-s,i=n===.25?"\xBC":n===.5?"\xBD":n===.75?"\xBE":"";return s===0&&i?`${i} hr`:`${s}${i} hr`}function Ls(t,e,s){const n=s-e;return{left:(t.start-e)/n*100,width:(t.end-t.start)/n*100}}function Ws(t,e,s,n){if(!Number.isFinite(e)||e<=0)return{status:"learning",label:"learning"};if(n<6)return{status:"pending",label:""};const i=e*(Math.min(n,24)/24),o=i*(1+s/100);return t>o&&t-i>.5?{status:"high",label:"running high for the weather"}:{status:"normal",label:"normal for the weather"}}const He={accent:"#1e88e5",accentBright:"#42a5f5",good:"#2bb673",warn:"#f59e0b",bad:"#e5484d",bg:"#1c262e",surface:"#243039",chip:"#2b3844",track:"#16202a",border:"#3d4a55",text:"#e8edf1",textDim:"#9fb0bd"},Re={"nest-blue":{label:"Nest Blue",tokens:He},ember:{label:"Ember",tokens:{accent:"#f4511e",accentBright:"#ff7043",good:"#66bb6a",warn:"#ffb300",bad:"#d32f2f",bg:"#241c18",surface:"#2f2521",chip:"#3a2d27",track:"#1a1310",border:"#54413a",text:"#f2e9e4",textDim:"#b8a69b"}},forest:{label:"Forest",tokens:{accent:"#43a047",accentBright:"#66bb6a",good:"#9ccc65",warn:"#ffa000",bad:"#e53935",bg:"#18211b",surface:"#212d25",chip:"#2a382e",track:"#111813",border:"#3d4f43",text:"#e6efe8",textDim:"#9fb3a5"}},orchid:{label:"Orchid",tokens:{accent:"#7e57c2",accentBright:"#9575cd",good:"#26a69a",warn:"#ffb300",bad:"#ec407a",bg:"#1f1b2a",surface:"#292336",chip:"#342c44",track:"#161221",border:"#4a4060",text:"#eae6f2",textDim:"#a89fbd"}},"ha-default":{label:"HA Default",tokens:{accent:"var(--primary-color, #03a9f4)",accentBright:"var(--light-primary-color, var(--primary-color, #03a9f4))",good:"var(--success-color, #2bb673)",warn:"var(--warning-color, #f59e0b)",bad:"var(--error-color, #e5484d)",bg:"var(--ha-card-background, var(--card-background-color, #fff))",surface:"var(--secondary-background-color, #f0f0f0)",chip:"var(--secondary-background-color, #f0f0f0)",track:"var(--divider-color, #e0e0e0)",border:"var(--divider-color, #e0e0e0)",text:"var(--primary-text-color, #212121)",textDim:"var(--secondary-text-color, #727272)"}}},pt="nest-blue",Ce=/^#[0-9a-f]{6}$/i,me=["accent","accentBright","good","warn","bad","bg","surface","chip","track","border","text","textDim"];function ht(t){return`custom:${me.map(e=>t[e]).join(",")}`}function js(t){return me.every(s=>Ce.test(t[s]))?{...t}:{...He}}function mt(t){const e={presetKey:pt,tokens:Re[pt].tokens};if(!t)return e;const s=Re[t];if(s)return{presetKey:t,tokens:s.tokens};if(t.startsWith("custom:")){const n=t.slice(7).split(",");if(n.length===5&&n.every(i=>Ce.test(i.trim()))){const[i,o,a,c,r]=n.map(l=>l.trim().toLowerCase());return{presetKey:"custom",tokens:{...He,accent:i,accentBright:o,good:a,warn:c,bad:r}}}if(n.length===me.length&&n.every(i=>Ce.test(i.trim())))return{presetKey:"custom",tokens:Object.fromEntries(me.map((o,a)=>[o,n[a].trim().toLowerCase()]))}}return e}const O=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"],Nt=["monday","tuesday","wednesday","thursday","friday"],Hs=["saturday","sunday"];function Us(t){const e=[];t.length===0&&e.push("A day needs at least one block.");const s=new Set;for(const n of t)/^([01]\d|2[0-3]):[0-5]\d$/.test(n.time)||e.push(`Bad time "${n.time}".`),s.has(n.time)&&e.push(`Duplicate block time ${n.time}.`),s.add(n.time),n.mode==="cool"&&n.cool_temp==null&&e.push(`${n.name}: cool needs cool_temp.`),n.mode==="heat"&&n.heat_temp==null&&e.push(`${n.name}: heat needs heat_temp.`),n.mode==="heat_cool"&&(n.cool_temp==null||n.heat_temp==null)&&e.push(`${n.name}: heat_cool needs both cool_temp and heat_temp.`),n.cool_temp!=null&&n.heat_temp!=null&&n.heat_temp>=n.cool_temp&&e.push(`${n.name}: heat_temp must be below cool_temp.`);return e}function ke(t){return{block:t.name,mode:t.mode,...t.cool_temp!=null?{cool_temp:t.cool_temp}:{},...t.heat_temp!=null?{heat_temp:t.heat_temp}:{}}}function Bs(t){const e=Us(t);if(e.length>0)throw new Error(e.join(" "));const s=[...t].sort((a,c)=>a.time.localeCompare(c.time)),n=s[0],i=s[s.length-1];if(s.length===1)return[{from:"00:00:00",to:"24:00:00",data:ke(n)}];const o=[];n.time!=="00:00"&&o.push({from:"00:00:00",to:`${n.time}:00`,data:ke(i)});for(let a=0;a<s.length;a++){const c=s[a],r=s[a+1];o.push({from:`${c.time}:00`,to:r?`${r.time}:00`:"24:00:00",data:ke(c)})}return o}function It(t,e){if(t==="all"&&e==="all")return O;if(t==="wdwe"&&e==="wd")return Nt;if(t==="wdwe"&&e==="we")return Hs;if(t==="days"&&O.includes(e.toLowerCase()))return[e.toLowerCase()];throw new Error(`Unknown set "${e}" for granularity "${t}".`)}function Fs(t,e){const s={};for(const[n,i]of Object.entries(e)){const o=Bs(i);for(const a of It(t,n))s[a]=o}for(const n of O)if(!s[n])throw new Error(`No block set covers ${n}.`);return s}function Ks(t,e,s){if(t===e)return s;const n=i=>{const o=s[i];if(!o)throw new Error(`Missing set "${i}" for transition ${t}\u2192${e}.`);return o.map(a=>({...a}))};if(t==="all"&&e==="wdwe")return{wd:n("all"),we:n("all")};if(t==="all"&&e==="days")return Object.fromEntries(O.map(i=>[i,n("all")]));if(t==="wdwe"&&e==="days")return Object.fromEntries(O.map(i=>[i,Nt.includes(i)?n("wd"):n("we")]));if(t==="wdwe"&&e==="all")return{all:n("wd")};if(t==="days"&&e==="wdwe")return{wd:n("monday"),we:n("saturday")};if(t==="days"&&e==="all")return{all:n("monday")};throw new Error(`Unsupported transition ${t}\u2192${e}.`)}const ue=t=>Q(t);function Q(t){const e=t.data;return{time:t.from.slice(0,5),name:e.block??"?",mode:e.mode??"cool",cool_temp:e.cool_temp??null,heat_temp:e.heat_temp??null}}function qs(t,e){const s=Q(t),n=Q(e);return s.name===n.name&&s.mode===n.mode&&s.cool_temp===n.cool_temp&&s.heat_temp===n.heat_temp}function ft(t){if(t.length===0)return[];const e=[...t].sort((a,c)=>a.from.localeCompare(c.from)),s=e[0],n=e[e.length-1];return(e.length>1&&s.from==="00:00:00"&&qs(s,n)?e.slice(1):e).map(Q)}function Zs(t){return JSON.stringify([...t].sort((e,s)=>e.from.localeCompare(s.from)).map(e=>[e.from,e.to,Q(e)]))}const _t=["monday","tuesday","wednesday","thursday","friday"],gt=["saturday","sunday"];function Gs(t){const e=O.map(a=>Zs(t[a]??[])),s=a=>e[O.indexOf(a)];if(e.every(a=>a===e[0]))return{granularity:"all",sets:{all:[...O]}};const i=_t.every(a=>s(a)===s("monday")),o=gt.every(a=>s(a)===s("saturday"));return i&&o?{granularity:"wdwe",sets:{wd:[..._t],we:[...gt]}}:{granularity:"days",sets:Object.fromEntries(O.map(a=>[a,[a]]))}}const yt=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];function Vs(t){return`${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`}function Js(t,e){return t.name===e.name&&t.mode===e.mode&&t.cool_temp===e.cool_temp&&t.heat_temp===e.heat_temp}function Ys(t,e){const s=e.getDay(),n=e.getHours()*60+e.getMinutes(),i=`${Vs(e)}:00`,o=new Map,a=r=>{const l=((s+r)%7+7)%7;let d=o.get(l);return d||(d=[...t[yt[l]]??[]].sort((p,h)=>p.from.localeCompare(h.from)),o.set(l,d)),d},c=r=>{for(let l=1;l<=7;l++){const d=a(r-l);if(d.length)return ue(d[d.length-1])}return null};for(let r=0;r<=7;r++){const l=a(r);for(let d=0;d<l.length;d++){const p=l[d];if(r===0&&p.from<=i)continue;if(r===7&&p.from>i)break;const h=d>0?ue(l[d-1]):c(r),f=ue(p);if(h&&Js(h,f))continue;const[w,S]=p.from.slice(0,5).split(":").map(Number),z=r*1440+(w*60+S)-n;if(z<=0)continue;const D=yt[(s+r)%7];return{...f,day:D,minutesUntil:z}}}return null}function Xs(t){for(const e of O){const s=[...t[e]??[]].sort((n,i)=>n.from.localeCompare(i.from));if(s.length===0||s[0].from!=="00:00:00")return true;for(let n=1;n<s.length;n++)if(s[n].from!==s[n-1].to)return true;if(s[s.length-1].to!=="24:00:00")return true}return false}function Qs(t){const e=[...t].sort((i,o)=>i.from.localeCompare(o.from)),s=[];let n=0;for(const i of e){const o=M(i.from.slice(0,5)),a=i.to==="24:00:00"?1440:M(i.to.slice(0,5));o>n&&s.push({block:null,fromMin:n,toMin:o}),s.push({block:ue(i),fromMin:o,toMin:a}),n=a}return n<1440&&s.push({block:null,fromMin:n,toMin:1440}),s}function en(t,e,s){const n={};for(const i of O){const o=t[i];o&&(n[i]=e.includes(i)?sn(s):o)}return n}function M(t){const[e,s]=t.split(":").map(Number);return(e??0)*60+(s??0)}function bt(t){const e=Math.max(0,Math.min(1425,t));return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function tn(t){if(t.length===0)return[];const e=[...t].sort((i,o)=>i.time.localeCompare(o.time)),s=[],n=M(e[0].time);return n>0&&s.push({block:e[e.length-1],fromMin:0,toMin:n,wrap:true}),e.forEach((i,o)=>{s.push({block:i,fromMin:M(i.time),toMin:o<e.length-1?M(e[o+1].time):1440,wrap:false})}),s}function sn(t){const e=[...t].sort((a,c)=>a.time.localeCompare(c.time));if(e.length===0)return[];const s=e[0],n=e[e.length-1],i=a=>({block:a.name,mode:a.mode,...a.cool_temp!=null?{cool_temp:a.cool_temp}:{},...a.heat_temp!=null?{heat_temp:a.heat_temp}:{}});if(e.length===1)return[{from:"00:00:00",to:"24:00:00",data:i(s)}];const o=[];s.time!=="00:00"&&o.push({from:"00:00:00",to:`${s.time}:00`,data:i(n)});for(let a=0;a<e.length;a++){const c=e[a],r=e[a+1];o.push({from:`${c.time}:00`,to:r?`${r.time}:00`:"24:00:00",data:i(c)})}return o}const Ue={fan_timer:{domain:"timer",suffix:"fan"},room_override_timer:{domain:"timer",suffix:"room_override"},running_sensor:{domain:"binary_sensor",suffix:"running"},runtime_today:{domain:"sensor",suffix:"runtime_today"},expected_runtime:{domain:"sensor",suffix:"expected_runtime"},target_room_select:{domain:"input_select",suffix:"target_room"},sensor_schedule:{domain:"schedule",suffix:"sensor_schedule"},applied_block_marker:{domain:"input_text",suffix:"applied_block"},zone_enabled:{domain:"input_boolean",suffix:"enabled"},k_factor:{domain:"input_number",suffix:"k"}},Be={season_select:{domain:"input_select",suffix:"season"},season_mode:{domain:"input_select",suffix:"season_mode"},season_confirm_days:{domain:"input_number",suffix:"season_confirm_days"},season_dwell_days:{domain:"input_number",suffix:"season_dwell_days"},dev_green_max:{domain:"input_number",suffix:"dev_green_max"},dev_amber_max:{domain:"input_number",suffix:"dev_amber_max"},runtime_alert_margin:{domain:"input_number",suffix:"runtime_alert_margin"},runtime_alert_days:{domain:"input_number",suffix:"runtime_alert_days"},runtime_learn_days:{domain:"input_number",suffix:"runtime_learn_days"},cdd_base:{domain:"input_number",suffix:"cdd_base"},override_minutes:{domain:"input_number",suffix:"override_minutes"},steer_min_setpoint:{domain:"input_number",suffix:"steer_min_setpoint"},steer_max_setpoint:{domain:"input_number",suffix:"steer_max_setpoint"},steer_max_offset:{domain:"input_number",suffix:"steer_max_offset"},next_block_sensor:{domain:"sensor",suffix:"next_block"},outdoor_temp_sensor:{domain:"sensor",suffix:"outdoor_temp"},outdoor_daily_mean:{domain:"sensor",suffix:"outdoor_daily_mean"},theme:{domain:"input_text",suffix:"theme"}};[...Object.values(Ue).map(t=>t.suffix),...Object.values(Be).map(t=>t.suffix)];function R(t){return t.toLowerCase().replace(/['’]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function v(t,e,s){const n=Ue[t];return`${n.domain}.${e}_${s}_${n.suffix}`}function Lt(t,e,s){return`schedule.${t}_${e}_${s}`}function k(t,e){const s=Be[t];return`${s.domain}.${e}_${s.suffix}`}function C(t,e){return`${t}_mzcs_${e}`}function N(t,e,s){const n=t.charAt(0).toUpperCase()+t.slice(1);return{engine:`${n}: schedule engine`,fan_timer:`${n}: ${s??"?"} fan timer finished`,season_recommender:`${n}: season recommender`,runtime_alert:`${n}: runtime anomaly alert`,runtime_learning:`${n}: runtime learning`,watchdog:`${n}: engine watchdog`,steering:`${n}: comfort steering`}[e]??`${n}: ${e}`}const nn=Object.entries(Be),an=Object.entries(Ue);function Wt(t,e,s,n){const i=t.indexOf(".");if(i<0)return null;const o=t.slice(0,i),a=t.slice(i+1);if(a!==e&&!a.startsWith(`${e}_`))return null;const c=a.slice(e.length+1);for(const[l,d]of nn)if(o===d.domain&&c===d.suffix)return{cls:l};const r=[...s].sort((l,d)=>d.length-l.length);for(const l of r){if(c!==l&&!c.startsWith(`${l}_`))continue;const d=c.slice(l.length+1);for(const[p,h]of an)if(o===h.domain&&d===h.suffix)return{cls:p,zone:l};if(o==="schedule"&&n.includes(d))return{cls:"zone_schedule",zone:l,season:d}}return null}const jt=2,Ht=4;function on(t,e=jt,s=Ht){const n=Math.abs(t);return n<=e?"green":n<=s?"amber":"red"}function rn(t){const e=Math.round(t);return`${e>0?"+":""}${e}\xB0`}function cn(t,e){let s=t!=null&&t>0?t:jt,n=e!=null&&e>0?e:Ht;return n<=s&&(n=s+1),{greenMax:s,amberMax:n}}const ne="Managed by Multi-Zone Climate Scheduler Card (mzcs).";function ee(t){if(Array.isArray(t))return`[${t.map(ee).join(",")}]`;if(t!==null&&typeof t=="object"){const e=t;return`{${Object.keys(e).sort().map(s=>`${JSON.stringify(s)}:${ee(e[s])}`).join(",")}}`}return JSON.stringify(t)}function ln(t){const e=ee(t);let s=5381;for(let n=0;n<e.length;n++)s=(s<<5)+s+e.charCodeAt(n)>>>0;return s.toString(16).padStart(8,"0")}const Ut=/\[mzcs-sig:([0-9a-f]{8})\]/;function te(t){const e=typeof t=="string"?t.match(Ut):null;return e?e[1]:null}function fe(t){const e=String(t.description??"").replace(Ut,"").trimEnd();return ln({...t,description:e})}function ie(t){const e=fe(t);return{...t,description:`${String(t.description??"")} [mzcs-sig:${e}]`}}function dn(t,e,s,n){const i=a=>te(a.description),o={[C(t,"engine")]:i(Bt(t,e,s)),[C(t,"watchdog")]:i(qt(t)),[C(t,"runtime_learning")]:i(Kt(t,e)),[C(t,"runtime_alert")]:i(Zt(t,e))};for(const a of e)o[C(t,`fan_timer_${a.slug}`)]=i(Ft(t,a,n));return o}function Bt(t,e,s){const n=e.flatMap(a=>s.map(c=>Lt(t,a.slug,c.key))),i=e.map(a=>v("zone_enabled",t,a.slug)),o=`{${s.map(a=>`'${a.name.replace(/'/g,"")}': '${a.key}'`).join(", ")}}`;return ie({id:C(t,"engine"),alias:N(t,"engine"),description:`${ne} Applies the active season's schedule block to each ENABLED zone at block transitions. Per-zone applied-block markers mean manual changes and external raises HOLD until the next block; the 15-minute tick only recovers missed transitions. Zones stand down while their Eco preset is active. heat_cool blocks apply dual setpoints.`,mode:"queued",max:5,triggers:[{trigger:"state",entity_id:n,alias:"Any zone schedule changed"},{trigger:"homeassistant",event:"start",alias:"HA started"},{trigger:"time_pattern",minutes:"/15",alias:"Safety tick"},{trigger:"state",entity_id:k("season_select",t),alias:"Season changed"},{trigger:"state",entity_id:i,to:"on",alias:"Zone re-enabled"}],conditions:[],actions:[{alias:"Resolve the active season key",variables:{season:`{{ ${o}.get(states('${k("season_select",t)}'), states('${k("season_select",t)}') | lower) }}`}},{alias:"Apply per zone",repeat:{for_each:e.map(a=>({zone:a.slug,climate:a.climate,marker:v("applied_block_marker",t,a.slug),enabled:v("zone_enabled",t,a.slug)})),sequence:[{alias:"Read this zone's active block",variables:{blk:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'block') }}`,blk_mode:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'mode') }}`,blk_cool:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'cool_temp') }}`,blk_heat:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'heat_temp') }}`}},{alias:"Skip when zone disabled, already applied, Eco active, or no block data",condition:"template",value_template:"{{ is_state(repeat.item.enabled, 'on') and blk is not none and blk != states(repeat.item.marker) and state_attr(repeat.item.climate, 'preset_mode') != 'eco' }}"},{alias:"Apply the block (dual range, off, or single target)",continue_on_error:true,choose:[{conditions:[{condition:"template",value_template:"{{ blk_mode == 'heat_cool' }}"}],sequence:[{alias:"Apply heat_cool range",action:"climate.set_temperature",target:{entity_id:"{{ repeat.item.climate }}"},data:{target_temp_high:"{{ blk_cool }}",target_temp_low:"{{ blk_heat }}",hvac_mode:"heat_cool"}}]},{conditions:[{condition:"template",value_template:"{{ blk_mode == 'off' }}"}],sequence:[{alias:"Turn the zone off",action:"climate.set_hvac_mode",target:{entity_id:"{{ repeat.item.climate }}"},data:{hvac_mode:"off"}}]},{conditions:[{condition:"template",value_template:"{{ blk_cool is not none or blk_heat is not none }}"}],sequence:[{alias:"Apply single target",action:"climate.set_temperature",target:{entity_id:"{{ repeat.item.climate }}"},data:{temperature:"{{ blk_cool if blk_cool is not none else blk_heat }}",hvac_mode:"{{ blk_mode }}"}}]}],default:[]},{alias:"Record the applied block",action:"input_text.set_value",target:{entity_id:"{{ repeat.item.marker }}"},data:{value:"{{ blk }}"}}]}}]})}function Ft(t,e,s){return ie({id:C(t,`fan_timer_${e.slug}`),alias:N(t,"fan_timer",e.name),description:`${ne} Turns the ${e.name} fan off when its fan timer ends.`,mode:"single",triggers:[{trigger:"event",event_type:"timer.finished",event_data:{entity_id:v("fan_timer",t,e.slug)},alias:`${e.name} fan timer finished`}],conditions:s?[{alias:"Stand down while the fan-guard helper wants the fan running",condition:"state",entity_id:s,state:"off"}]:[],actions:[{alias:`Turn the ${e.name} fan off`,action:"climate.set_fan_mode",target:{entity_id:e.climate},data:{fan_mode:"off"}}]})}function Kt(t,e){return ie({id:C(t,"runtime_learning"),alias:N(t,"runtime_learning"),description:`${ne} Nightly EMA update of each zone's runtime-per-cooling-degree-day factor. Skips mild days; first valid day seeds directly.`,mode:"single",triggers:[{trigger:"time",at:"23:58:00",alias:"Nightly close"}],conditions:[],actions:[{alias:"Compute today's cooling degree-days",variables:{cdd:`{{ [ (states('sensor.${t}_outdoor_daily_mean') | float(0)) - (states('${k("cdd_base",t)}') | float(75)), 0 ] | max }}`,alpha:`{{ 2 / ((states('${k("runtime_learn_days",t)}') | float(30)) + 1) }}`}},{alias:"Skip mild days",condition:"template",value_template:"{{ cdd > 0.5 }}"},{alias:"Update k per zone",repeat:{for_each:e.map(s=>({runtime:v("runtime_today",t,s.slug),k:v("k_factor",t,s.slug)})),sequence:[{alias:"Compute the EMA",variables:{runtime_h:"{{ states(repeat.item.runtime) | float(-1) }}",old_k:"{{ states(repeat.item.k) | float(0) }}"}},{alias:"Skip if unavailable",condition:"template",value_template:"{{ runtime_h >= 0 }}"},{alias:"Write the new k",action:"input_number.set_value",target:{entity_id:"{{ repeat.item.k }}"},data:{value:"{{ ((runtime_h / cdd) if old_k == 0 else (alpha * (runtime_h / cdd) + (1 - alpha) * old_k)) | round(2) }}"}}]}}]})}function qt(t){const e="automation."+N(t,"engine").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");return ie({id:C(t,"watchdog"),alias:N(t,"watchdog"),description:`${ne} Alerts when the schedule engine automation is off or unavailable for 5 minutes while any zone is enabled.`,mode:"single",triggers:[{trigger:"state",entity_id:e,to:["off","unavailable"],for:{minutes:5},alias:"Engine down"}],conditions:[],actions:[{alias:"Notify all admins via persistent notification",action:"persistent_notification.create",data:{title:"Climate schedule engine is down",message:"The Climate: schedule engine automation is off or unavailable. Zone schedules are not being applied - your thermostats hold their last setpoints (their own app schedules still work)."}}]})}function Zt(t,e){return ie({id:C(t,"runtime_alert"),alias:N(t,"runtime_alert"),description:`${ne} Evening check: notifies when a zone's runtime is over the weather-normalized expectation by the alert margin. Uses learned k; silent while learning.`,mode:"single",triggers:[{trigger:"time",at:"20:00:00",alias:"Evening check"}],conditions:[],actions:[{alias:"Check each zone",repeat:{for_each:e.map(s=>({name:s.name,runtime:v("runtime_today",t,s.slug),expected:v("expected_runtime",t,s.slug)})),sequence:[{alias:"Compute exceedance",variables:{run_h:"{{ states(repeat.item.runtime) | float(0) }}",exp_h:"{{ states(repeat.item.expected) | float(0) }}",margin:`{{ states('${k("runtime_alert_margin",t)}') | float(35) }}`}},{alias:"Only alert on a real, learned exceedance",condition:"template",value_template:"{{ exp_h > 0 and run_h > exp_h * (1 + margin / 100) and (run_h - exp_h) > 1 }}"},{alias:"Notify",action:"persistent_notification.create",data:{title:"HVAC running high",message:"{{ repeat.item.name }} has run {{ run_h | round(1) }}h today vs ~{{ exp_h | round(1) }}h expected for this weather. Worth a look (filters, doors, refrigerant)."}}]}}]})}const $t="mzcs",vt="r1",un=[{cls:"season_confirm_days",min:1,max:14,step:1,initial:3},{cls:"season_dwell_days",min:1,max:60,step:1,initial:14},{cls:"dev_green_max",min:1,max:10,step:1,initial:2,unit:"\xB0F"},{cls:"dev_amber_max",min:1,max:15,step:1,initial:4,unit:"\xB0F"},{cls:"runtime_alert_margin",min:5,max:100,step:5,initial:35,unit:"%"},{cls:"runtime_alert_days",min:1,max:7,step:1,initial:3},{cls:"runtime_learn_days",min:7,max:60,step:1,initial:30},{cls:"cdd_base",min:60,max:80,step:1,initial:75,unit:"\xB0F"}],pn=[{cls:"override_minutes",min:15,max:240,step:15,initial:60},{cls:"steer_min_setpoint",min:50,max:80,step:1,initial:68},{cls:"steer_max_setpoint",min:70,max:95,step:1,initial:85},{cls:"steer_max_offset",min:1,max:10,step:1,initial:5}];function hn(t){return Fs(t.granularity,t.sets)}function re(t){const e=[],s=t.prefix,n=s.charAt(0).toUpperCase()+s.slice(1);for(const r of t.zones){t.features.fan_timer&&e.push({id:v("fan_timer",s,r.slug),kind:"helper",spec:{name:`${n} ${r.name} fan`,restore:true}}),e.push({id:v("running_sensor",s,r.slug),kind:"template_sensor",spec:{name:`${n} ${r.name} running`},meta:{source:"hvac_action"}}),e.push({id:v("runtime_today",s,r.slug),kind:"stats_sensor",spec:{name:`${n} ${r.name} runtime today`},meta:{model:"history_stats"}}),e.push({id:v("expected_runtime",s,r.slug),kind:"template_sensor",spec:{name:`${n} ${r.name} expected runtime`},meta:{model:"k_x_cdd"}}),e.push({id:v("applied_block_marker",s,r.slug),kind:"helper",spec:{name:`${n} ${r.name} applied block`}}),e.push({id:v("zone_enabled",s,r.slug),kind:"helper",spec:{name:`${n} ${r.name} enabled`}}),e.push({id:v("k_factor",s,r.slug),kind:"helper",spec:{name:`${n} ${r.name} K`,min:0,max:10,step:.01}}),t.features.steering&&(e.push({id:v("target_room_select",s,r.slug),kind:"helper",spec:{name:`${n} ${r.name} target room`,options:["Thermostat"]}}),e.push({id:v("room_override_timer",s,r.slug),kind:"helper",spec:{name:`${n} ${r.name} room override`,restore:true}}),e.push({id:v("sensor_schedule",s,r.slug),kind:"schedule",spec:{name:`${n} ${r.name} sensor schedule`}}));for(const l of t.seasons){const d=t.schedules[r.slug]?.[l.key];if(!d)throw new Error(`Missing schedule for ${r.slug}/${l.key}.`);e.push({id:Lt(s,r.slug,l.key),kind:"schedule",spec:{name:`${n} ${r.name} ${l.name}`},meta:{week:hn(d)}})}}e.push({id:k("season_select",s),kind:"helper",spec:{name:`${n} season`,options:t.seasons.map(r=>r.name)}}),e.push({id:k("season_mode",s),kind:"helper",spec:{name:`${n} season mode`,options:["Manual","Semi-auto","Full-auto"]}});for(const r of un)e.push({id:k(r.cls,s),kind:"helper",spec:{name:`${n} ${r.cls.replace(/_/g," ")}`,min:r.min,max:r.max,step:r.step,...r.unit?{unit:r.unit}:{}},meta:{seed:r.initial}});if(t.features.steering)for(const r of pn)e.push({id:k(r.cls,s),kind:"helper",spec:{name:`${n} ${r.cls.replace(/_/g," ")}`,min:r.min,max:r.max,step:r.step},meta:{seed:r.initial}});e.push({id:k("next_block_sensor",s),kind:"template_sensor",spec:{name:`${n} next block`}}),e.push({id:k("outdoor_temp_sensor",s),kind:"template_sensor",spec:{name:`${n} outdoor temp`},meta:{source:"weather"}}),e.push({id:k("outdoor_daily_mean",s),kind:"stats_sensor",spec:{name:`${n} outdoor daily mean`},meta:{model:"statistics_mean"}}),e.push({id:k("theme",s),kind:"helper",spec:{name:`${n} theme`}});const i=t.zones.map(r=>({...r,climate:r.climate??`climate.${r.slug}`})),o=dn(s,i,t.seasons,t.features.fan_guard),a=(r,l)=>{const d=C(s,r);return{id:`automation:${d}`,kind:"automation",spec:{alias:N(s,r,l),sig:o[d]??vt}}};if(e.push(a("engine")),e.push(a("watchdog")),e.push(a("runtime_learning")),t.features.anomaly_alerts&&e.push(a("runtime_alert")),t.features.fan_timer)for(const r of t.zones){const l=C(s,`fan_timer_${r.slug}`);e.push({id:`automation:${l}`,kind:"automation",spec:{alias:N(s,"fan_timer",r.name),sig:o[l]??vt}})}const c=new Set;for(const r of e){if(c.has(r.id))throw new Error(`Naming collision: two configured objects both resolve to "${r.id}". Rename the conflicting zone or season.`);c.add(r.id)}return e}function mn(t,e){return ee(t)===ee(e)}function Z(t,e){const s={create:[],adopt:[],update:[],delete:[],noop:[]},n=new Map(e.map(o=>[o.id,o])),i=new Set(t.map(o=>o.id));for(const o of t){const a=n.get(o.id);a?a.managed?mn(a.spec,o.spec)?s.noop.push({op:"noop",id:o.id,kind:o.kind}):s.update.push({op:"update",id:o.id,kind:o.kind,spec:o.spec,from:a.spec}):s.adopt.push({op:"adopt",id:o.id,kind:o.kind,spec:o.spec}):s.create.push({op:"create",id:o.id,kind:o.kind,spec:o.spec,...o.meta?{meta:o.meta}:{}})}for(const o of e)o.managed&&!i.has(o.id)&&s.delete.push({op:"delete",id:o.id,kind:o.kind});return s}function fn(t){return[...t.create,...t.adopt,...t.update,...t.delete]}function _n(t){const e=t.default_mode;return{granularity:"all",sets:{all:[{time:"06:00",name:"Day",mode:e,cool_temp:e==="heat"?null:e==="heat_cool"?84:78,heat_temp:e==="heat"?68:e==="heat_cool"?66:null}]}}}function gn(t,e){const s={};for(const n of t){s[n]={};for(const i of e)s[n][i.key]=_n(i)}return s}const yn={fan_timer:"helper",room_override_timer:"helper",target_room_select:"helper",applied_block_marker:"helper",zone_enabled:"helper",theme:"helper",k_factor:"helper",season_select:"helper",season_mode:"helper",season_confirm_days:"helper",season_dwell_days:"helper",dev_green_max:"helper",dev_amber_max:"helper",runtime_alert_margin:"helper",runtime_alert_days:"helper",runtime_learn_days:"helper",cdd_base:"helper",override_minutes:"helper",steer_min_setpoint:"helper",steer_max_setpoint:"helper",steer_max_offset:"helper",running_sensor:"template_sensor",expected_runtime:"template_sensor",next_block_sensor:"template_sensor",outdoor_temp_sensor:"template_sensor",outdoor_daily_mean:"stats_sensor",runtime_today:"stats_sensor",zone_schedule:"schedule",sensor_schedule:"schedule"};async function ce(t,e){if(!t.callWS)return[];try{const s=await t.callWS({type:`${e}/list`});return Array.isArray(s)?s:[]}catch(s){throw new Error(`Could not read the ${e} list from Home Assistant: ${s instanceof Error?s.message:String(s)}`)}}async function xt(t,e){const s=new Map;if(!t.callWS||e.length===0)return s;try{const n=await t.callWS({type:"config/entity_registry/get_entries",entity_ids:e});for(const[i,o]of Object.entries(n??{}))o?.labels&&s.set(i,o.labels)}catch{}return s}async function bn(t,e,s,n){const i=[],o=new Set;for(const _ in t.states){const g=Wt(_,e,s,n);if(!g)continue;const x=yn[g.cls];x&&(i.push({id:_,kind:x}),o.add(_))}const a=[...s].sort((_,g)=>g.length-_.length);for(const _ in t.states){if(!_.startsWith(`schedule.${e}_`)||o.has(_))continue;const g=_.slice(`schedule.${e}_`.length);for(const x of a){if(!g.startsWith(`${x}_`))continue;const E=g.slice(x.length+1);E&&E!=="sensor_schedule"&&i.push({id:_,kind:"schedule"});break}}const[c,r,l,d,p]=await Promise.all([ce(t,"timer"),ce(t,"input_select"),ce(t,"input_number"),ce(t,"schedule"),xt(t,i.map(_=>_.id))]),h=(_,g)=>{const x=new Map;for(const E of _)E.id&&x.set(`${g}.${E.id}`,E);return x},f=new Map([...h(c,"timer"),...h(r,"input_select"),...h(l,"input_number"),...h(d,"schedule")]),w=[];for(const _ of i){const g=f.get(_.id),x=t.states[_.id];let E={};if(_.id.startsWith("input_number.")&&g){const A=g.unit_of_measurement;E={name:g.name,min:g.min,max:g.max,step:g.step,...A!=null?{unit:A}:{}}}else _.id.startsWith("input_select.")&&g?E={name:g.name,options:g.options}:_.id.startsWith("timer.")&&g?E={name:g.name,restore:g.restore??false}:_.id.startsWith("schedule.")&&g?E={name:g.name}:x&&(E={name:x.attributes.friendly_name??_.id});w.push({id:_.id,kind:_.kind,spec:E,managed:(p.get(_.id)??[]).includes($t)})}const S=[];for(const _ in t.states){if(!_.startsWith("automation."))continue;const g=t.states[_];if(!g)continue;const x=g.attributes.id;typeof x=="string"&&x.startsWith(`${e}_mzcs_`)&&S.push({cfgId:x,entityId:_,alias:String(g.attributes.friendly_name??x)})}const[z,D]=await Promise.all([Promise.all(S.map(async({cfgId:_})=>{if(!t.callApi)return"unknown";try{const g=await t.callApi("GET",`config/automation/config/${_}`);return te(g?.description)??"unknown"}catch{return"unknown"}})),xt(t,S.map(_=>_.entityId))]);return S.forEach(({cfgId:_,entityId:g,alias:x},E)=>{w.push({id:`automation:${_}`,kind:"automation",spec:{alias:x,sig:z[E]},managed:(D.get(g)??[]).includes($t)})}),w}const Gt=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];function Fe(t){return t instanceof Error?t.message:t&&typeof t=="object"?JSON.stringify(t):String(t)}function $n(t){const e=t;return e&&(e.status_code===404||e.status===404)?true:/\b404\b|not.found/i.test(Fe(t))}function V(t){const e=t.indexOf(".");return{domain:t.slice(0,e),objectId:t.slice(e+1)}}function Oe(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function De(t,e){const s=Wt(t,e.prefix,e.zones.map(n=>n.slug),e.seasons.map(n=>n.key));return s?.zone?e.zones.find(n=>n.slug===s.zone)??null:null}async function Se(t,e,s,n){const i=`${e}.${Oe(s)}`,o=[i,...[2,3,4,5].map(a=>`${i}_${a}`)];for(let a=0;a<3;a++){try{const c=await t.callWS({type:"config/entity_registry/get_entries",entity_ids:o});for(const r of o)if(c?.[r]?.config_entry_id===n)return r}catch{}await new Promise(c=>setTimeout(c,400*(a+1)))}throw new Error(`Could not locate the entity created by flow entry ${n} (expected around ${i})`)}async function Ee(t,e,s,n){if(e===s)return;let i;for(let o=0;o<3;o++)try{await t.callWS({type:"config/entity_registry/update",entity_id:e,new_entity_id:s}),n.log(`Renamed ${e} -> ${s}`);return}catch(a){i=a,await new Promise(c=>setTimeout(c,400*(o+1)))}throw new Error(`Could not rename ${e} to its contract id ${s} (${i instanceof Error?i.message:"registry error"})`)}async function vn(t,e){try{await t.callWS({type:"config/label_registry/create",name:"mzcs",color:"blue",icon:"mdi:thermostat-box"}),e.log("Created label mzcs")}catch{}}async function _e(t,e){try{const n=(await t.callWS({type:"config/entity_registry/get_entries",entity_ids:[e]}))?.[e]?.labels??[];n.includes("mzcs")||await t.callWS({type:"config/entity_registry/update",entity_id:e,labels:[...n,"mzcs"]})}catch{}}function xn(t,e){for(const s in t.states)if(s.startsWith("automation.")&&t.states[s]?.attributes.id===e)return s;return null}async function Ae(t,e,s,n){if(!t.callApi)throw new Error("callApi unavailable");let i=await t.callApi("POST","config/config_entries/flow",{handler:e,show_advanced_options:true});const o={...n};for(let a=0;a<8;a++){if(i.type==="create_entry"){const c=i.result?.entry_id;if(!c)throw new Error(`Flow ${e}: created an entry but returned no entry_id`);return c}if(i.type==="menu"){if(!s)throw new Error(`Flow ${e}: unexpected menu`);i=await t.callApi("POST",`config/config_entries/flow/${i.flow_id}`,{next_step_id:s});continue}if(i.type==="form"){const c=(i.data_schema??[]).map(l=>l.name),r={};for(const l of c)l in o&&(r[l]=o[l],delete o[l]);i=await t.callApi("POST",`config/config_entries/flow/${i.flow_id}`,r);continue}throw new Error(`Flow ${e}: unhandled step type ${i.type}`)}throw new Error(`Flow ${e}: did not complete`)}function wn(t){return`{${t.seasons.map(e=>`'${e.name.replace(/'/g,"")}': '${e.key}'`).join(", ")}}`}function kn(t,e,s){const{objectId:n}=V(t),i=String(e.name??n),o=s.prefix;if(t.startsWith("binary_sensor.")&&e.source==="hvac_action"){const a=De(t,s);return a?{handler:"template",menu:"binary_sensor",fields:{name:i,state:`{{ state_attr('${a.climate}', 'hvac_action') in ['cooling', 'heating'] }}`,device_class:"running"}}:null}if(t.startsWith("sensor.")&&e.model==="k_x_cdd"){const a=De(t,s);return a?{handler:"template",menu:"sensor",fields:{name:i,state:`{{ (states('input_number.${o}_${a.slug}_k') | float(0)) * ([ (states('sensor.${o}_outdoor_daily_mean') | float(0)) - (states('input_number.${o}_cdd_base') | float(75)), 0 ] | max) | round(2) }}`,unit_of_measurement:"h",state_class:"measurement"}}:null}if(t===`sensor.${o}_next_block`){const a=`input_select.${o}_season`;return{handler:"template",menu:"sensor",fields:{name:i,state:`{% set season = ${wn(s)}.get(states('${a}'), states('${a}') | lower) %}{% set evs = states.schedule | selectattr('entity_id', 'search', '^schedule\\.${o}_[a-z0-9_]+_' ~ season ~ '$') | map(attribute='attributes.next_event') | reject('none') | list %}{{ evs | min if evs | count > 0 else 'unknown' }}`}}}return t===`sensor.${o}_outdoor_temp`&&e.source==="weather"&&s.weatherEntity?{handler:"template",menu:"sensor",fields:{name:i,state:`{{ state_attr('${s.weatherEntity}', 'temperature') }}`,unit_of_measurement:"\xB0F",state_class:"measurement"}}:null}function Vt(t,e){const s=e.prefix;if(t===`${s}_mzcs_engine`)return Bt(s,e.zones,e.seasons);if(t===`${s}_mzcs_watchdog`)return qt(s);if(t===`${s}_mzcs_runtime_learning`)return Kt(s,e.zones);if(t===`${s}_mzcs_runtime_alert`)return Zt(s,e.zones);const n=t.match(new RegExp(`^${s}_mzcs_fan_timer_(.+)$`));if(n){const i=e.zones.find(o=>o.slug===n[1]);return i?Ft(s,i,e.fanGuard):null}return null}async function Sn(t,e,s){const n={...e.spec,...e.meta??{}};if(e.id.startsWith("automation:")){const a=e.id.slice(11),c=Vt(a,s);if(!c)return s.log(`SKIP ${e.id} - no payload generator`),null;let r=null;try{r=await t.callApi("GET",`config/automation/config/${a}`)}catch(l){if(!$n(l))throw new Error(`Could not verify whether ${e.id} already exists: ${Fe(l)}`);r=null}if(r){const l=te(r.description);return l&&fe(r)===l?(await t.callApi("POST",`config/automation/config/${a}`,c),await _e(t,`automation.${Oe(String(c.alias))}`),s.log(`Recreated ${e.id} (existed in storage, pristine)`),{kind:"automation",automationId:a,preexisted:true}):(s.log(`KEEP ${e.id} - exists in storage but is customized/unsigned; not overwritten`),null)}return await t.callApi("POST",`config/automation/config/${a}`,c),await _e(t,`automation.${Oe(String(c.alias))}`),{kind:"automation",automationId:a}}const{domain:i,objectId:o}=V(e.id);if(["timer","input_text","input_select","input_number","input_boolean","schedule"].includes(i)){const a=String(n.name??o),c={};if(i==="timer"&&Object.assign(c,{restore:n.restore??true,duration:"0:30:00"}),i==="input_select"&&Object.assign(c,{options:n.options??["-"]}),i==="input_number"&&Object.assign(c,{min:n.min??0,max:n.max??100,step:n.step??1,...n.unit?{unit_of_measurement:n.unit}:{}}),i==="schedule"){const d=n.week;for(const p of Gt)c[p]=d?.[p]??[]}const l=(await t.callWS({type:`${i}/create`,...c,name:o}))?.id??o;if(l!==o){try{await t.callWS({type:`${i}/delete`,[`${i}_id`]:l})}catch{s.log(`WARN: could not remove stray ${i} item ${l}`)}throw new Error(`HA assigned id "${l}" instead of "${o}" for ${e.id} - an object with that id likely already exists (possibly registry-disabled)`)}if(a!==l)try{await t.callWS({type:`${i}/update`,[`${i}_id`]:l,...c,name:a})}catch{s.log(`NOTE: created ${e.id} but could not set its display name to "${a}"`)}if(i==="input_number"&&typeof n.seed=="number")try{await t.callService("input_number","set_value",{entity_id:e.id,value:n.seed})}catch{s.log(`NOTE: created ${e.id} but could not seed its default value ${n.seed}`)}return{kind:"collection",domain:i,itemId:l}}if(e.kind==="template_sensor"||e.kind==="stats_sensor"){if(e.kind==="stats_sensor"){const l=String(n.name??o);if(n.model==="statistics_mean"){if(!s.weatherEntity)return s.log(`SKIP ${e.id} - no weather entity configured (CDD learning stays off)`),null;const h=await Ae(t,"statistics",null,{name:l,entity_id:`sensor.${s.prefix}_outdoor_temp`,state_characteristic:"mean",sampling_size:500,max_age:{hours:24,minutes:0,seconds:0},keep_last_sample:false,percentile:50,precision:1});return await Ee(t,await Se(t,"sensor",l,h),e.id,s),{kind:"config_entry",entryId:h}}const d=De(e.id,s);if(!d)return s.log(`SKIP ${e.id} - no zone match`),null;const p=await Ae(t,"history_stats",null,{name:l,entity_id:`binary_sensor.${s.prefix}_${d.slug}_running`,type:"time",state:["on"],start:"{{ today_at() }}",end:"{{ now() }}"});return await Ee(t,await Se(t,"sensor",l,p),e.id,s),{kind:"config_entry",entryId:p}}const a=kn(e.id,n,s);if(!a)return n.source==="weather"&&!s.weatherEntity?s.log(`SKIP ${e.id} - no weather entity configured`):s.log(`SKIP ${e.id} - not flow-creatable`),null;const c=await Ae(t,a.handler,a.menu,a.fields),r=a.menu==="binary_sensor"?"binary_sensor":"sensor";return await Ee(t,await Se(t,r,String(a.fields.name),c),e.id,s),{kind:"config_entry",entryId:c}}return s.log(`SKIP ${e.id} - unsupported kind ${e.kind}`),null}async function En(t,e,s){for(const n of[...e].reverse())try{n.kind==="collection"?await t.callWS({type:`${n.domain}/delete`,[`${n.domain}_id`]:n.itemId}):n.kind==="automation"?await t.callApi("DELETE",`config/automation/config/${n.automationId}`):n.kind==="config_entry"&&n.entryId&&await t.callApi("DELETE",`config/config_entries/entry/${n.entryId}`),s.log(`Rolled back ${n.itemId??n.automationId??n.entryId}`)}catch{s.log(`ROLLBACK FAILED for ${n.itemId??n.automationId??n.entryId} - remove manually`)}}async function wt(t,e,s){const n={created:0,adopted:0,updated:0,deleted:0,skipped:0,ok:true},i=[];let o="create";await vn(t,s);try{for(const a of e.create){const c=await Sn(t,a,s);c?(c.preexisted||i.push(c),n.created++,s.log(`Created ${a.id}`),a.id.startsWith("automation:")||await _e(t,a.id)):n.skipped++}o="adopt";for(const a of e.adopt){const c=a.id.startsWith("automation:")?xn(t,a.id.slice(11)):a.id;c&&await _e(t,c),n.adopted++,s.log(`Adopted ${a.id}`)}o="update";for(const a of e.update)if(a.kind==="helper"){const{domain:c,objectId:r}=V(a.id),{unit:l,...d}=a.spec,p={...d,...l?{unit_of_measurement:l}:{}};try{await t.callWS({type:`${c}/update`,[`${c}_id`]:r,...p}),n.updated++,s.log(`Updated ${a.id}`)}catch{n.skipped++,s.log(`SKIP update ${a.id} - not updatable`)}}else if(a.kind==="automation"&&t.callApi){const c=a.id.slice(11),r=Vt(c,s);if(!r)n.skipped++,s.log(`KEEP ${a.id} - no generator for this automation`);else try{const l=await t.callApi("GET",`config/automation/config/${c}`),d=te(l?.description);d&&fe(l)===d?(await t.callApi("POST",`config/automation/config/${c}`,r),n.updated++,s.log(`Regenerated ${a.id} (config changed; automation was untouched)`)):(n.skipped++,s.log(`KEEP ${a.id} - customized since generation; review it manually`))}catch{n.skipped++,s.log(`KEEP ${a.id} - could not read its config to verify`)}}else if((a.kind==="template_sensor"||a.kind==="stats_sensor")&&t.callWS)try{await t.callWS({type:"config/entity_registry/update",entity_id:a.id,name:String(a.spec.name??"")}),n.updated++,s.log(`Renamed ${a.id} to "${String(a.spec.name)}"`)}catch{n.skipped++,s.log(`SKIP update ${a.id} - could not set its display name`)}else if(a.kind==="schedule"&&t.callWS){const{objectId:c}=V(a.id);try{let r=c;try{const f=(await t.callWS({type:"config/entity_registry/get_entries",entity_ids:[a.id]}))?.[a.id]?.unique_id;typeof f=="string"&&f&&(r=f)}catch{}const d=(await t.callWS({type:"schedule/list"})).find(h=>h.id===r);if(!d)throw new Error(`no storage item "${r}"`);const p={};for(const h of Gt)p[h]=d[h]??[];await t.callWS({type:"schedule/update",schedule_id:r,name:String(a.spec.name??c),...p}),n.updated++,s.log(`Renamed ${a.id} to "${String(a.spec.name)}" (blocks preserved)`)}catch(r){n.skipped++,s.log(`SKIP update ${a.id} - could not rename without touching its blocks (${Fe(r)})`)}}else n.skipped++,s.log(`KEEP ${a.id} - ${a.kind} updates never overwrite existing content`);o="delete";for(const a of e.delete){if(a.id.startsWith("automation:")){const c=a.id.slice(11);let r=null;try{r=await t.callApi("GET",`config/automation/config/${c}`)}catch{r=null}if(!r){n.skipped++,s.log(`SKIP delete ${a.id} - config not readable`);continue}const l=te(r.description);if(!(l&&fe(r)===l)){n.skipped++,s.log(`KEEP ${a.id} - customized or unsigned; delete it manually if intended`);continue}s.log(`snapshot ${c}: ${JSON.stringify(r)}`),await t.callApi("DELETE",`config/automation/config/${c}`)}else if(a.kind==="template_sensor"||a.kind==="stats_sensor"){let c;try{c=(await t.callWS({type:"config/entity_registry/get_entries",entity_ids:[a.id]}))?.[a.id]?.config_entry_id}catch{c=void 0}if(!c){n.skipped++,s.log(`SKIP delete ${a.id} - no owning config entry found; remove it manually`);continue}s.log(`snapshot ${a.id}: config entry ${c}`),await t.callApi("DELETE",`config/config_entries/entry/${c}`)}else{const{domain:c,objectId:r}=V(a.id);if(c==="schedule")try{const d=(await t.callWS({type:"schedule/list"})).find(p=>p.id===r);d&&s.log(`snapshot ${r}: ${JSON.stringify(d)}`)}catch{s.log(`NOTE: could not snapshot ${a.id} before delete`)}await t.callWS({type:`${c}/delete`,[`${c}_id`]:r})}n.deleted++,s.log(`Deleted ${a.id}`)}}catch(a){n.ok=false,s.log(`ERROR during ${o}: ${a instanceof Error?a.message:String(a)} - rolling back this run's creates. Already-applied updates/deletes from this run are NOT reverted; see the log above for what landed.`),await En(t,i,s)}return n}var An=Object.defineProperty,zn=Object.getOwnPropertyDescriptor,$=(t,e,s,n)=>{for(var i=n>1?void 0:n?zn(e,s):e,o=t.length-1,a;o>=0;o--)(a=t[o])&&(i=(n?a(e,s,i):a(i))||i);return n&&i&&An(e,s,i),i};const Rn=[["accent","--mzcs-accent"],["accentBright","--mzcs-accent-bright"],["good","--mzcs-good"],["warn","--mzcs-warn"],["bad","--mzcs-bad"],["bg","--mzcs-bg"],["surface","--mzcs-surface"],["chip","--mzcs-chip"],["track","--mzcs-track"],["border","--mzcs-border"],["text","--mzcs-text"],["textDim","--mzcs-text-dim"]],Cn=[{key:"bg",label:"Card background"},{key:"surface",label:"Panels (hero / rows)"},{key:"chip",label:"Buttons and chips"},{key:"track",label:"Tracks and wells"},{key:"border",label:"Borders"},{key:"text",label:"Text"},{key:"textDim",label:"Muted text"},{key:"accent",label:"Accent (cooling / active)"},{key:"accentBright",label:"Accent bright (today / highlights)"},{key:"good",label:"Good (eco / normal)"},{key:"warn",label:"Warn (heat / season / high)"},{key:"bad",label:"Alert (out of range)"}],On=[{cls:"dev_green_max",label:"Room deviation \xB7 green up to (\xB0)"},{cls:"dev_amber_max",label:"Room deviation \xB7 amber up to (\xB0)"},{cls:"runtime_alert_margin",label:"Runtime alert margin (%)"},{cls:"runtime_alert_days",label:"Runtime alert \xB7 consecutive days"},{cls:"runtime_learn_days",label:"Runtime learn window (days)"},{cls:"cdd_base",label:"Cooling degree-day base (\xB0)"},{cls:"season_confirm_days",label:"Season switch \xB7 confirm after (days)"},{cls:"season_dwell_days",label:"Season switch \xB7 min dwell (days)"}];function le(t,e,s){const n=s>e?Math.max(0,Math.min(1,(t-e)/(s-e))):.5,i=[41,121,230],o=[226,122,49];return`rgb(${i.map((a,c)=>Math.round(a+(o[c]-a)*n)).join(",")})`}function kt(t){const[e,s]=t.split(":");let n=Number(e);const i=n>=12?"PM":"AM";return n=n%12===0?12:n%12,`${n}:${s} ${i}`}const St={all:"Every day",wd:"Weekdays",we:"Weekend"},Dn={heat:"Heat",cool:"Cool",heat_cool:"Heat\xB7Cool",off:"Off",auto:"Auto",dry:"Dry",fan_only:"Fan only"};console.info(`%c ${Mt} %c v${$s}`,"background:var(--mzcs-accent);color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;","background:#243039;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;");let y=class extends U{constructor(){super(...arguments),this._zoneIndex=0,this._ctrlOpen=false,this._setupOpen=false,this._schedOpen=false,this._schedName="",this._schedBusy=false,this._schedDrafts=new Map,this._rtOpen=false,this._rtDayOpen=null,this._rtDayLoading=false,this._rtDayCache=new Map,this._rtRange=7,this._dryRunning=false,this._execConfirm=false,this._execRunning=false,this._execLog=[],this._tdArmed=false,this._tdRunning=false}setConfig(t){if(!t||!Array.isArray(t.zones??[]))throw new Error("zones must be a list of { entity, name } items.");const e=t.zones??[];if(e.length>4)throw new Error("A maximum of 4 zones is supported.");const s=e.map(o=>({...o,name:typeof o.name=="string"&&o.name.trim()?o.name:o.entity?o.entity.split(".")[1].replace(/_/g," "):"Zone"})),n=t.features?.fan_timer,i=t.features?{...t.features,fan_timer:Array.isArray(n)?n:typeof n=="number"?[n]:void 0}:void 0;this._config={...t,zones:s,...i?{features:i}:{}},this._zoneIndex>=Math.max(s.length,1)&&(this._zoneIndex=0),this._dryRun=void 0,this._execConfirm=false,this._execResult=void 0,this._execLog=[]}static async getConfigElement(){return await Promise.resolve().then(()=>In),document.createElement(Tt)}static getStubConfig(){return{prefix:"climate",zones:[]}}getCardSize(){return 6}get _prefix(){return this._config?.prefix??"climate"}_zone(){return this._config?.zones[this._zoneIndex]}_nudge(t){const e=this._zone();if(!e||!this.hass)return;const s=at(this.hass,e.entity);if(s.setpoint==null)return;const n=this.hass.states[e.entity]?.attributes,i=Rs(s.setpoint+t,s.setpoint,n?.min_temp,n?.max_temp);i!==s.setpoint&&Ps(this.hass,e.entity,i)}_provisionInput(){const t=this._config,e=t.zones.map(n=>({slug:R(n.name),name:n.name,climate:n.entity})),s=t.seasons??[{key:"summer",name:"Summer",default_mode:"cool"},{key:"winter",name:"Winter",default_mode:"heat_cool"}];return{prefix:this._prefix,zones:e,seasons:s,schedules:gn(e.map(n=>n.slug),s),features:{fan_timer:(this._config?.features?.fan_timer?.length??3)>0,anomaly_alerts:this._config?.features?.anomaly_alerts??true,steering:false,fan_guard:this._config?.features?.fan_guard},weather_entity:this._config?.weather_entity}}_fetchExistingFor(t){return bn(this.hass,t.prefix,t.zones.map(e=>e.slug),t.seasons.map(e=>e.key))}async _runDryRun(){if(!(!this.hass||this._dryRunning)){this._dryRunning=true,this._dryRunError=void 0;try{const t=this._provisionInput(),e=await this._fetchExistingFor(t);this._dryRun=Z(re(t),e),this._execConfirm=false,this._execResult=void 0,this._execLog=[],this._tdArmed=false}catch(t){this._dryRunError=t instanceof Error?t.message:String(t)}finally{this._dryRunning=false}}}async _armTeardown(){if(!(!this.hass||this._dryRunning||this._tdRunning)){this._dryRunning=true,this._dryRunError=void 0;try{const t=this._provisionInput(),e=await this._fetchExistingFor(t),s=Z([],e),n={automation:0,template_sensor:1,stats_sensor:1,schedule:2,helper:3};s.delete.sort((i,o)=>(n[i.kind]??9)-(n[o.kind]??9)),this._dryRun=s,this._tdArmed=true,this._execConfirm=false,this._execResult=void 0,this._execLog=[]}catch(t){this._dryRunError=t instanceof Error?t.message:String(t)}finally{this._dryRunning=false}}}async _runTeardown(){const t=this.hass,e=this._config,s=this._dryRun;if(!(!t||!e||!s||this._tdRunning)){if(!t.callWS||!t.callApi){this._execLog=["This HA frontend session does not expose the required APIs (callWS/callApi)."];return}this._tdRunning=true,this._tdArmed=false,this._execLog=[];try{const n=this._provisionInput();for(const c of n.zones){const r=v("zone_enabled",n.prefix,c.slug);if(T(t,r))try{await t.callService("input_boolean","turn_off",{entity_id:r}),this._execLog=[...this._execLog,`Disabled scheduling for ${c.name}`]}catch{this._execLog=[...this._execLog,`NOTE: could not disable ${r}`]}}const i=e.zones.map(c=>({slug:R(c.name),name:c.name,climate:c.entity})),o=await wt(t,s,{prefix:n.prefix,zones:i,seasons:n.seasons,fanGuard:e.features?.fan_guard,weatherEntity:e.weather_entity,log:c=>{this._execLog=[...this._execLog,c]}});this._execResult=o;const a=await this._fetchExistingFor(n);this._dryRun=Z(re(n),a)}catch(n){this._execLog=[...this._execLog,`ERROR: ${n instanceof Error?n.message:String(n)}`]}finally{this._tdRunning=false}}}async _runApply(){const t=this.hass,e=this._config,s=this._dryRun;if(!(!t||!e||!s||this._execRunning)){if(!t.callWS||!t.callApi){this._execLog=["This HA frontend session does not expose the required APIs (callWS/callApi)."];return}this._execRunning=true,this._execConfirm=false,this._execLog=[];try{const n=this._provisionInput(),i=e.zones.map(d=>({slug:R(d.name),name:d.name,climate:d.entity})),o=await this._fetchExistingFor(n),a=Z(re(n),o),c=d=>JSON.stringify([d.create.map(p=>p.id).sort(),d.adopt.map(p=>p.id).sort(),d.update.map(p=>p.id).sort(),d.delete.map(p=>p.id).sort()]);if(c(a)!==c(s)){this._dryRun=a,this._execRunning=false,this._execLog=["The registry changed since this preview was made. Review the refreshed plan and apply again."];return}const r=await wt(t,a,{prefix:n.prefix,zones:i,seasons:n.seasons,fanGuard:e.features?.fan_guard,weatherEntity:e.weather_entity,log:d=>{this._execLog=[...this._execLog,d]}});this._execResult=r;const l=await this._fetchExistingFor(n);this._dryRun=Z(re(n),l)}catch(n){this._execLog=[...this._execLog,`ERROR: ${n instanceof Error?n.message:String(n)}`]}finally{this._execRunning=false}}}_renderSetup(){const t=this._dryRun;return u`
      <div class="setup">
        <p class="setup-title">Setup</p>
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
        ${this._dryRunError?u`<p class="setup-err">${this._dryRunError}</p>`:m}
        ${t?u`
              <div class="planwrap">
                ${[["Create",t.create,""],["Adopt",t.adopt,""],["Update",t.update,""],["Delete",t.delete,"del"],["Unchanged",t.noop,"quiet"]].map(([e,s,n])=>u`
                    <p class="plan-h ${n}">${e} (${s.length})</p>
                    ${s.length>0&&e!=="Unchanged"?u`<ul class="plan-list ${n}">
                          ${s.map(i=>u`<li>${i.id}</li>`)}
                        </ul>`:m}
                  `)}
              </div>
              ${this._renderApply(t)}
            `:m}
        ${this._renderManage()}
        ${this._renderTeardown()}
        <button class="chip" @click=${()=>this._setupOpen=false}>Close</button>
      </div>
    `}_renderTeardown(){const t=this._dryRun;return u`
      <p class="setup-title" style="margin-top:14px;">Danger zone</p>
      ${!this._tdArmed&&!this._tdRunning?u`
            <button class="chip" .disabled=${this._dryRunning||this._execRunning}
              @click=${()=>void this._armTeardown()}>
              Remove everything this card manages…
            </button>
          `:m}
      ${this._tdArmed&&t?u`
            <p class="setup-sub">
              This deletes the ${t.delete.length} managed objects listed above (red). Zone
              scheduling is turned off first, so your thermostats' own app schedules take over
              before anything is removed. Automations you have customized are kept and listed
              for manual review. Afterwards you can safely delete the card or uninstall via
              HACS.
            </p>
            <div class="applyrow">
              <button class="chip danger" @click=${()=>void this._runTeardown()}>
                Confirm: remove ${t.delete.length} objects
              </button>
              <button class="chip" @click=${()=>this._tdArmed=false}>Cancel</button>
            </div>
          `:m}
      ${this._tdRunning?u`<p class="setup-sub">Removing…</p>`:m}
    `}_renderApply(t){const e=fn(t).length,s=this._execResult;return u`
      ${e>0&&!this._execRunning&&!s&&!this._tdArmed&&!this._tdRunning?this._execConfirm?u`
              <div class="applyrow">
                <button class="chip danger" @click=${()=>void this._runApply()}>
                  Confirm: apply ${e} change${e===1?"":"s"}
                </button>
                <button class="chip" @click=${()=>this._execConfirm=false}>Cancel</button>
              </div>
            `:u`
              <button class="chip" .disabled=${this._dryRunning} @click=${()=>this._execConfirm=true}>
                Apply ${e} change${e===1?"":"s"}…
              </button>
            `:m}
      ${this._execRunning?u`<p class="setup-sub">Applying…</p>`:m}
      ${this._execLog.length>0?u`<ul class="plan-list exec-log">
            ${this._execLog.map(n=>u`<li>${n}</li>`)}
          </ul>`:m}
      ${s?u`<p class="setup-sub ${s.ok?"":"setup-err"}">
            ${s.ok?`Done - ${s.created} created, ${s.adopted} adopted, ${s.updated} updated, ${s.deleted} deleted${s.skipped?`, ${s.skipped} kept as-is`:""}. The plan above has been re-verified against the live registry.`:"Apply failed - created objects from this run were rolled back. See the log above."}
          </p>`:m}
    `}_renderManage(){const t=this.hass;if(!t)return m;const e=k("season_select",this._prefix),s=t.states[e],n=Array.isArray(s?.attributes.options)?s.attributes.options:[],i=On.map(r=>({...r,id:k(r.cls,this._prefix)})).filter(r=>T(t,r.id));if(!s&&i.length===0)return m;const o=(this._config?.zones??[]).map(r=>{const l=R(r.name);return{name:r.name,enableId:v("zone_enabled",this._prefix,l),markerId:v("applied_block_marker",this._prefix,l)}}).filter(r=>T(t,r.enableId)),a=o.length>0&&o.every(r=>t.states[r.enableId]?.state==="on"),c=o.some(r=>t.states[r.enableId]?.state==="on");return u`
      <p class="setup-title" style="margin-top:12px;">Manage</p>
      ${o.length>0?u`
            <div class="managerow master">
              <span>Scheduling · all zones</span>
              <button
                class=${a?"chip togg on":"chip togg"}
                @click=${()=>{for(const r of o)ct(t,r.enableId,r.markerId,!c)}}
              >
                ${a?"On":c?"Mixed":"Off"}
              </button>
            </div>
            ${o.map(r=>{const l=t.states[r.enableId]?.state==="on";return u`
                <div class="managerow">
                  <span>${r.name} scheduling</span>
                  <button
                    class=${l?"chip togg on":"chip togg"}
                    @click=${()=>void ct(t,r.enableId,r.markerId,!l)}
                  >
                    ${l?"On":"Off"}
                  </button>
                </div>
              `})}
            <p class="muted" style="font-size:11px;margin:2px 0 6px;">
              Off = the engine stands down and the thermostat's own app schedule takes over.
            </p>
          `:m}
      ${s?u`
            <div class="managerow">
              <span>Active season</span>
              <select
                @change=${r=>void Ds(t,e,r.target.value)}
              >
                ${n.map(r=>u`<option .value=${r} ?selected=${r===s.state}>${r}</option>`)}
              </select>
            </div>
          `:m}
      ${i.map(r=>u`
          <div class="managerow">
            <span>${r.label}</span>
            <input
              type="number"
              .value=${t.states[r.id]?.state??""}
              @change=${l=>{const d=l.target,p=d.value.trim(),h=Number(p);if(p===""||!Number.isFinite(h)){d.value=t.states[r.id]?.state??"";return}Os(t,r.id,h).catch(()=>{d.value=t.states[r.id]?.state??""})}}
            />
          </div>
        `)}
      ${this._renderThemePicker()}
    `}_renderThemePicker(){const t=this.hass;if(!t)return m;const e=k("theme",this._prefix);if(!T(t,e))return m;const{presetKey:s,tokens:n}=mt(t.states[e]?.state),i=o=>void t.callService("input_text","set_value",{entity_id:e,value:o});return u`
      <p class="setup-title" style="margin-top:12px;">Theme</p>
      <div class="chips">
        ${Object.entries(Re).map(([o,a])=>u`
            <button
              class=${s===o?"chip mode-on":"chip"}
              @click=${()=>i(o)}
            >
              <span class="swatch" style="background:${a.tokens.accent}"></span>${a.label}
            </button>
          `)}
        <button
          class=${s==="custom"?"chip mode-on":"chip"}
          @click=${()=>i(ht(js(n)))}
        >
          Custom
        </button>
      </div>
      ${s==="custom"?u`
            ${Cn.map(o=>u`
                <div class="managerow">
                  <span>${o.label}</span>
                  <input
                    type="color"
                    .value=${n[o.key]}
                    @change=${a=>{const c={...n,[o.key]:a.target.value};i(ht(c))}}
                  />
                </div>
              `)}
            <p class="muted" style="font-size:11px;margin:2px 0 0;">
              Colors apply live to every device showing the card.
            </p>
          `:m}
    `}_applyTheme(){const t=this.hass?.states[k("theme",this._prefix)]?.state,e=`${this._prefix}|${t??""}`;if(e===this._appliedTheme)return;this._appliedTheme=e;const{tokens:s}=mt(t);for(const[n,i]of Rn)this.style.setProperty(i,s[n])}render(){if(!this._config||!this.hass)return m;this._applyTheme();const t=this._zone();if(!t||!t.entity||!t.entity.startsWith("climate."))return u`<ha-card>
        <div class="wrap"><p class="muted pad">Pick a thermostat for each zone in the card editor to get started.</p></div>
      </ha-card>`;if(this._setupOpen)return u`<ha-card><div class="wrap">${this._renderSetup()}</div></ha-card>`;const e=at(this.hass,t.entity),s=vs(this.hass,v("fan_timer",this._prefix,R(t.name))),n=e.action==="cooling",i=e.action==="heating",o=this.hass.states[t.entity]?.attributes??{},a=o.target_temp_low!=null&&o.target_temp_high!=null?`${o.target_temp_low}\u2013${o.target_temp_high}`:null,c=e.setpoint??a??"\u2013",r=e.available?n?`Cooling to ${c}`:i?`Heating to ${c}`:e.mode==="off"?"Off":`Idle \xB7 set ${c}`:"Unavailable";return u`
      <ha-card>
        <div class="wrap">
          <div class="tabs" role="tablist">
            ${this._config.zones.map((l,d)=>u`
                <button
                  role="tab"
                  aria-selected=${d===this._zoneIndex}
                  class=${d===this._zoneIndex?"tab on":"tab"}
                  @click=${()=>{this._zoneIndex!==d&&(this._zoneIndex=d,this._rt30=void 0,this._rtDayCache.clear(),this._rtDayOpen=null,this._rtDayDetail=void 0)}}
                >
                  ${l.name}
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
                ${r}${e.inside!=null?` \xB7 inside ${e.inside}\xB0`:""}${e.humidity!=null?` \xB7 ${e.humidity}% RH`:""}${s?u`<span class="fan"> · fan on</span>`:""}
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
    `}_renderRuntime(t){if(!this.hass)return m;const e=this.hass,s=R(t.name),n=v("runtime_today",this._prefix,s);if(!T(e,n))return m;const i=Number(e.states[n]?.state),o=Number.isFinite(i)?q(i):"\u2013";this._rtLoadedFor!==n&&(this._rtLoadedFor=n,this._rtDaily=void 0,queueMicrotask(()=>void lt(e,n,7).then(f=>{this._rtDaily=f})));const a=new Date;a.setHours(0,0,0,0);const c=(this._rtDaily??[]).filter(f=>f.day<a.getTime()).sort((f,w)=>w.day-f.day),r=a.getTime(),l=Number(e.states[v("expected_runtime",this._prefix,s)]?.state),d=we(e,k("runtime_alert_margin",this._prefix))??35,p=(Date.now()-r)/36e5,h=Ws(Number.isFinite(i)?i:0,l,d,p);return u`
      <button class="schedrow" @click=${()=>this._rtOpen=!this._rtOpen}>
        <span
          >Runtime · Today <b class="rt-b">${o}</b>${h.label?u` <span class="verdict ${h.status}">· ${h.label}</span>`:m}</span
        >
        <span aria-hidden="true">${this._rtOpen?"\u25B4":"\u25BE"}</span>
      </button>
      ${this._rtOpen?u`
            <div class="schedbody">
              <div class="chips" style="margin-bottom:6px;">
                <button
                  class=${this._rtRange===7?"chip mode-on":"chip"}
                  @click=${()=>this._rtRange=7}
                >
                  7 days
                </button>
                <button
                  class=${this._rtRange===30?"chip mode-on":"chip"}
                  @click=${()=>{this._rtRange=30,this._rt30||lt(e,n,30).then(f=>{this._rt30=f})}}
                >
                  30 days
                </button>
              </div>
              ${this._rtRange===30?this._render30():m}
              ${this._rtRange===7?u`${this._renderPill(t,"Today",Number.isFinite(i)?i:0,r,true)}`:m}
              ${this._rtRange===7?u`
                    ${c.map(f=>this._renderPill(t,new Date(f.day).toLocaleDateString(void 0,{weekday:"short",day:"numeric"}),f.hours,f.day,false))}
                    ${c.length===0?u`<p class="muted" style="font-size:11px;margin:6px 0;">
                          History accrues daily - past days appear as statistics build up.
                        </p>`:m}
                    <p class="muted" style="font-size:10px;margin:6px 0 0;">
                      Tap a day for its run segments and setpoint changes.
                    </p>
                  `:m}
            </div>
          `:m}
    `}_render30(){const t=this._rt30;if(!t)return u`<p class="muted" style="font-size:11px;">Loading…</p>`;if(t.length===0)return u`<p class="muted" style="font-size:11px;">
        Long-term statistics build daily - the 30-day view fills in as days accumulate.
      </p>`;const e=[...t].sort((o,a)=>o.day-a.day),s=Math.max(...e.map(o=>o.hours),1),n=e.reduce((o,a)=>o+a.hours,0)/e.length,i=o=>new Date(o).toLocaleDateString(void 0,{month:"short",day:"numeric"});return u`
      <div class="cols">
        ${e.map(o=>u`<span
            class="col"
            title="${i(o.day)}: ${q(o.hours)}"
            style="height: ${Math.max(6,o.hours/s*64).toFixed(0)}px"
          ></span>`)}
      </div>
      <div class="axis">
        <span>${i(e[0].day)}</span>
        <span>${i(e[e.length-1].day)}</span>
      </div>
      <p class="muted" style="font-size:11px;margin:6px 0 0;">
        Avg <b class="rt-b">${q(n)}</b> · Max
        <b class="rt-b">${q(s)}</b> · from long-term statistics (kept forever)
      </p>
    `}async _openDay(t,e){if(this._rtDayOpen===e){this._rtDayOpen=null;return}this._rtDayOpen=e;const s=this._rtDayCache.get(e);if(s){this._rtDayDetail=s;return}if(this.hass){this._rtDayLoading=true,this._rtDayDetail=void 0;try{const n=R(t.name),i=v("running_sensor",this._prefix,n),o=Math.min(e+864e5,Date.now()),[a,c]=await Promise.all([dt(this.hass,i,e,o),dt(this.hass,t.entity,e,o,"temperature")]),r={segs:Ns(a,e,o),bubs:Is(c),start:e,end:e+864e5};this._rtDayCache.set(e,r),this._rtDayOpen===e&&(this._rtDayDetail=r)}finally{this._rtDayLoading=false}}}_renderPill(t,e,s,n,i){const o=Math.min(100,Math.max(0,s/24*100)),a=this._rtDayOpen===n;return u`
      <button class="pillrow" @click=${()=>void this._openDay(t,n)}>
        <span class="pill-label">${e}</span>
        <span class="pill-track">
          <span
            class="pill-fill ${i||a?"today-fill":""}"
            style="width: ${o.toFixed(1)}%"
          ></span>
        </span>
        <span class="pill-hours">${q(s)}</span>
      </button>
      ${a?this._renderDayDetail():m}
    `}_renderDayDetail(){if(this._rtDayLoading)return u`<p class="muted" style="font-size:11px;">Loading day…</p>`;const t=this._rtDayDetail;return t?u`
      <div class="daydetail">
        <div class="bubblerow">
          ${t.bubs.slice(0,12).map(e=>{const s=(e.t-t.start)/(t.end-t.start)*100;return u`<span class="bubble" style="left: ${s.toFixed(1)}%"
              >${Math.round(e.value)}</span
            >`})}
        </div>
        <div class="segtrack">
          ${t.segs.map(e=>{const{left:s,width:n}=Ls(e,t.start,t.end);return u`<span
              class="seg"
              style="left: ${s.toFixed(2)}%; width: ${Math.max(.4,n).toFixed(2)}%"
            ></span>`})}
        </div>
        <div class="axis">
          <span>12A</span><span>6A</span><span>12P</span><span>6P</span><span>12A</span>
        </div>
      </div>
    `:m}_activeSeasonKey(){const t=this.hass?.states[k("season_select",this._prefix)];return!t||t.state==="unknown"?null:this._config?.seasons?.find(s=>s.name===t.state)?.key??R(t.state)}_scheduleEntityId(t){const e=this._activeSeasonKey();return e?`schedule.${this._prefix}_${R(t.name)}_${e}`:null}async _loadWeek(t){if(!this.hass)return;const e=this._scheduleEntityId(t);if(!e||!T(this.hass,e)){this._schedWeek=void 0;return}this._schedBusy=true;try{const s=await rt(this.hass,e);if(this._schedLoadedFor!==e)return;this._schedWeek=s?.week??void 0,this._schedName=s?.name??"",this._schedError=s?void 0:"Could not load schedule config."}catch(s){this._schedLoadedFor===e&&(this._schedError=ut(s))}finally{this._schedBusy=false}}_setBlocks(t,e,s){return this._schedDrafts.get(e)??ft(t[s[0]]??[])}_mutateDraft(t,e,s){if(!this._schedWeek)return;const n=this._schedDrafts.get(t)??ft(this._schedWeek[e[0]]??[]).map(o=>({...o}));s(n);const i=new Map(this._schedDrafts);i.set(t,n),this._schedDrafts=i,this._schedNotice=void 0}_clearSchedEdit(){this._schedDrafts=new Map,this._schedSel=void 0,this._schedGran=void 0}_activeDet(t){if(!this._schedGran)return Gs(t);const e=this._schedGran,s=e==="all"?["all"]:e==="wdwe"?["wd","we"]:[...O];return{granularity:e,sets:Object.fromEntries(s.map(n=>[n,It(e,n)]))}}_switchGranularity(t){const e=this._schedWeek;if(!e)return;const s=this._activeDet(e);if(s.granularity===t)return;const n={};for(const[a,c]of Object.entries(s.sets))n[a]=this._setBlocks(e,a,c).map(r=>({...r}));const i=Ks(s.granularity,t,n),o=new Map;for(const[a,c]of Object.entries(i))o.set(a,c.map(r=>({...r})));this._schedDrafts=o,this._schedGran=t,this._schedSel=void 0,this._schedNotice=void 0}async _saveSchedDrafts(){const t=this._schedLoadedFor;if(!this.hass||!this._schedWeek||this._schedDrafts.size===0||!t)return;const e=this._activeDet(this._schedWeek);this._schedBusy=true;try{const s=await rt(this.hass,t);let n=s?.week??this._schedWeek;for(const[i,o]of this._schedDrafts){const a=e.sets[i];a&&(n=en(n,a,o))}await Cs(this.hass,t,n,s?.name??this._schedName),this._schedLoadedFor===t&&(this._schedWeek=n,this._clearSchedEdit(),this._schedError=void 0)}catch(s){this._schedError=ut(s)}finally{this._schedBusy=false}}_renderSchedule(t){if(!this.hass)return m;const e=this._scheduleEntityId(t);if(!e||!T(this.hass,e))return m;this._schedLoadedFor!==e&&(this._schedDrafts.size>0&&(this._schedNotice="Unsaved schedule edits were discarded (zone or season changed)."),this._schedLoadedFor=e,this._schedWeek=void 0,this._clearSchedEdit(),queueMicrotask(()=>void this._loadWeek(t)));const s=this.hass.states[k("season_select",this._prefix)]?.state??"",n=this._schedWeek,i=n?Ys(n,new Date):null,o=i?i.cool_temp??i.heat_temp:null,a=i?`Next \xB7 ${kt(i.time)} ${i.name}${o!=null?` \u2192 ${o}\xB0`:""}`:"Schedule";return u`
      <button
        class="schedrow"
        @click=${()=>{this._schedOpen=!this._schedOpen,this._schedWeek||this._loadWeek(t)}}
      >
        <span>${a} <span class="season">· ${s}</span></span>
        <span aria-hidden="true">${this._schedOpen?"\u25B4":"\u25BE"}</span>
      </button>
      ${this._schedOpen?this._renderScheduleBody(t):m}
    `}_renderScheduleBody(t){if(this._schedBusy&&!this._schedWeek)return u`<p class="muted pad">Loading…</p>`;const e=this._schedWeek;if(!e)return this._schedError?u`<p class="schederr pad">${this._schedError}</p>`:u`<p class="muted pad">No schedule data.</p>`;const s=this._activeDet(e),n=Object.entries(s.sets),i=new Date().getDay(),o=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][i],a=[];for(const[h,f]of n)for(const w of this._setBlocks(e,h,f))w.cool_temp!=null&&a.push(w.cool_temp),w.heat_temp!=null&&a.push(w.heat_temp);let c=a.length?Math.min(...a):70,r=a.length?Math.max(...a):80;if(r-c<6){const h=(r+c)/2;c=h-3,r=h+3}const l=s.granularity==="days",d=this._schedDrafts.size>0;return Xs(e)?u`
        <div class="schedbody">
          ${n.map(([h,f],w)=>{const S=Qs(e[f[0]]??[]),z=f.includes(o),D=St[h]??h.charAt(0).toUpperCase()+h.slice(1);return u`
              <p class="sethead">${D}${z?u` <span class="today">today</span>`:m}</p>
              <div class="sstrip ${l?"small":""}">
                ${S.map(_=>{const g=(_.toMin-_.fromMin)/1440*100,x=_.block?_.block.cool_temp??_.block.heat_temp:null;return u`<span
                    class="sseg ro"
                    style="width:${g}%;background:${_.block&&x!=null?le(x,c,r):"var(--mzcs-track)"}"
                  >
                    <span class="segt">${_.block?`${x??"\u2013"}\xB0`:"Off"}</span>
                  </span>`})}
              </div>
              ${!l||w===n.length-1?u`<div class="saxis">
                    <span>12A</span><span>4A</span><span>8A</span><span>12P</span><span>4P</span><span>8P</span><span>12A</span>
                  </div>`:m}
            `})}
          <p class="muted pad">
            This schedule has inactive (off) periods set in Home Assistant's own editor. Edit it
            there - the card leaves it untouched to preserve those periods.
          </p>
        </div>
      `:u`
      <div class="schedbody">
        <div class="chips granchips">
          ${[["all","Every day"],["wdwe","Weekday \xB7 Weekend"],["days","Individual days"]].map(([h,f])=>u`
              <button
                class=${s.granularity===h?"chip mode-on":"chip"}
                .disabled=${this._schedBusy}
                @click=${()=>this._switchGranularity(h)}
              >
                ${f}
              </button>
            `)}
        </div>
        ${n.map(([h,f],w)=>{const S=this._setBlocks(e,h,f),z=tn(S),D=f.includes(o),_=S.some(A=>A.mode==="heat_cool"),g=St[h]??h.charAt(0).toUpperCase()+h.slice(1),x=u`
            <div class="sstrip ${l?"small":""} ${_?"hc":""}">
              ${z.map(A=>{const Ke=S.indexOf(A.block),qe=!A.wrap&&this._schedSel?.setKey===h&&this._schedSel?.idx===Ke,oe=(A.toMin-A.fromMin)/1440*100,Ze=()=>{this._schedSel={setKey:h,idx:Ke}};if(_){const $e=A.block.cool_temp,ve=A.block.heat_temp;return u`
                    <button class="sseg hcseg ${qe?"sel":""}" style="width:${oe}%" @click=${Ze}>
                      <span class="hchalf" style="background:${$e!=null?le($e,c,r):"var(--mzcs-track)"}">
                        <span class="segt">${$e??"\u2013"}°</span>
                        ${oe>15&&!l?u`<span class="segn">${A.block.name}</span>`:m}
                      </span>
                      <span class="hchalf" style="background:${ve!=null?le(ve,c,r):"var(--mzcs-track)"}">
                        <span class="segt">${ve??"\u2013"}°</span>
                      </span>
                    </button>
                  `}const be=A.block.cool_temp??A.block.heat_temp;return u`
                  <button
                    class="sseg ${qe?"sel":""}"
                    style="width:${oe}%;background:${be!=null?le(be,c,r):"var(--mzcs-track)"}"
                    @click=${Ze}
                  >
                    <span class="segt">${be??"\u2013"}°</span>
                    ${oe>9&&!l?u`<span class="segn">${A.block.name}</span>`:m}
                  </button>
                `})}
            </div>
          `,E=!l||w===n.length-1;return u`
            <p class="sethead">
              ${g}${D?u` <span class="today">today</span>`:m}
            </p>
            ${_?u`<div class="hcwrap">
                  <div class="hcgutter"><span class="gc">Cool</span><span class="gh">Heat</span></div>
                  ${x}
                </div>`:x}
            ${E?u`<div class="saxis ${_?"indent":""}">
                  <span>12A</span><span>4A</span><span>8A</span><span>12P</span><span>4P</span><span>8P</span><span>12A</span>
                </div>`:m}
          `})}
        ${this._renderBlockEditor(s)}
        ${this._schedNotice?u`<p class="muted pad">${this._schedNotice}</p>`:m}
        ${this._schedError?u`<p class="schederr pad">${this._schedError}</p>`:m}
        <div class="schedactions">
          ${d?u`
                <button class="chip save" .disabled=${this._schedBusy}
                  @click=${()=>void this._saveSchedDrafts()}>
                  ${this._schedBusy?"Saving\u2026":"Save changes"}
                </button>
                <button class="chip" .disabled=${this._schedBusy} @click=${()=>this._clearSchedEdit()}>
                  Discard
                </button>
              `:u`
                <button
                  class="chip"
                  .disabled=${this._schedBusy}
                  @click=${()=>{const h=v("applied_block_marker",this._prefix,R(t.name));Ts(this.hass,h,`automation.${this._prefix}_schedule_engine`)}}
                >
                  Apply now
                </button>
                <span class="muted">Tap a block to edit. Changes apply at the next block; Apply now re-asserts immediately.</span>
              `}
        </div>
      </div>
    `}_renderBlockEditor(t){const e=this._schedSel,s=this._schedWeek;if(!e||!s)return m;const n=t.sets[e.setKey];if(!n)return m;const i=this._setBlocks(s,e.setKey,n),o=i[e.idx];if(!o)return m;const a=d=>this._mutateDraft(e.setKey,n,d),c=d=>{a(p=>{const h=p[e.idx],f=M(h.time),w=f+d,S=e.idx>0?M(p[e.idx-1].time)+15:0,z=e.idx<p.length-1?M(p[e.idx+1].time)-15:Math.max(1425,f);h.time=bt(Math.max(S,Math.min(z,w)))})},r=(d,p)=>{a(h=>{const f=h[e.idx],S=(f[d]??f.cool_temp??f.heat_temp??72)<45,z=(f[d]??(S?22:72))+p;let D=S?5:45,_=S?35:95;f.mode==="heat_cool"&&(d==="cool_temp"&&f.heat_temp!=null&&(D=f.heat_temp+2),d==="heat_temp"&&f.cool_temp!=null&&(_=f.cool_temp-2)),f[d]=Math.max(D,Math.min(_,z))})},l=(d,p,h,f)=>u`
      <div class="managerow">
        <span>${d}</span>
        <span class="stepgrp">
          <button class="stepbtn" @click=${h}>−</button>
          <span class="stepval">${p}</span>
          <button class="stepbtn" @click=${f}>+</button>
        </span>
      </div>
    `;return u`
      <div class="bedit">
        <div class="managerow">
          <span>Block name</span>
          <input
            class="bname-in"
            type="text"
            .value=${o.name}
            @change=${d=>a(p=>{p[e.idx].name=d.target.value})}
          />
        </div>
        ${l("Starts",kt(o.time),()=>c(-15),()=>c(15))}
        ${o.mode==="heat_cool"?u`
              ${l("Cool to",`${o.cool_temp??"\u2013"}\xB0`,()=>r("cool_temp",-1),()=>r("cool_temp",1))}
              ${l("Heat to",`${o.heat_temp??"\u2013"}\xB0`,()=>r("heat_temp",-1),()=>r("heat_temp",1))}
            `:o.mode==="heat"?l("Heat to",`${o.heat_temp??"\u2013"}\xB0`,()=>r("heat_temp",-1),()=>r("heat_temp",1)):l("Cool to",`${o.cool_temp??"\u2013"}\xB0`,()=>r("cool_temp",-1),()=>r("cool_temp",1))}
        <div class="bedit-actions">
          <button
            class="chip danger"
            .disabled=${i.length<=1}
            @click=${()=>{a(d=>{d.splice(e.idx,1)}),this._schedSel=void 0}}
          >
            Remove
          </button>
          <button
            class="chip"
            @click=${()=>{const d=e.idx<i.length-1?M(i[e.idx+1].time):1440,p=M(o.time);if(d-p<45)return;const h=bt(Math.round((p+Math.max(30,(d-p)/2))/15)*15);a(f=>{f.splice(e.idx+1,0,{time:h,name:"New block",mode:o.mode,cool_temp:o.cool_temp,heat_temp:o.heat_temp})}),this._schedSel={setKey:e.setKey,idx:e.idx+1}}}
          >
            Add block after
          </button>
          <button class="chip" @click=${()=>this._schedSel=void 0}>Close</button>
        </div>
      </div>
    `}_renderControls(t){if(!this.hass)return m;const e=this.hass,s=this._zone();if(!s)return m;const n=xs(e,t),i=e.states[t]?.state,o=ws(e,t),a=v("fan_timer",this._prefix,R(s.name)),c=this._config?.features?.fan_timer??[15,30,60],r=T(e,a);return u`
      <button class="expander" @click=${()=>this._ctrlOpen=!this._ctrlOpen}>
        <span>Mode</span>
        <span aria-hidden="true">${this._ctrlOpen?"\u25B4":"\u25BE"}</span>
      </button>
      ${this._ctrlOpen?u`
            <div class="ctrl">
              <div class="chips">
                ${n.map(l=>u`
                    <button
                      class=${i===l?"chip mode-on":"chip"}
                      @click=${()=>void Ss(e,t,l)}
                    >
                      ${Dn[l]??l}
                    </button>
                  `)}
                ${o?u`
                      <button
                        class=${ot(e,t)?"chip eco eco-on":"chip eco"}
                        @click=${()=>void Es(e,t,!ot(e,t))}
                      >
                        Eco
                      </button>
                    `:m}
              </div>
              ${r?u`
                    <div class="chips fanrow">
                      <span class="fanlbl">Fan</span>
                      ${c.map(l=>u`
                          <button
                            class="chip"
                            @click=${()=>void zs(e,t,a,l)}
                          >
                            ${l}m
                          </button>
                        `)}
                    </div>
                  `:m}
            </div>
          `:m}
    `}_renderRooms(t,e){if(!this.hass||!t.room_sensors||t.room_sensors.length===0)return m;const s=this.hass,{greenMax:n,amberMax:i}=cn(we(s,k("dev_green_max",this._prefix)),we(s,k("dev_amber_max",this._prefix)));return u`
      <div class="rooms">
        ${t.room_sensors.map(o=>{const a=ks(s,o);if(a.temp==null||e==null)return u`
              <div class="room">
                <span class="rname">${a.name}</span>
                <span class="rtemp muted">${a.temp==null?"\u2014":`${a.temp}\xB0`}</span>
              </div>
            `;const c=Math.round(a.temp-e);return u`
            <div class="room">
              <span class="rname">${a.name}</span>
              <span>
                <span class="badge ${on(c,n,i)}"
                  >${rn(c)}</span
                >
                <span class="rtemp">${a.temp}°</span>
              </span>
            </div>
          `})}
      </div>
    `}};y.styles=At`
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
      padding: 8px 2px;
      border-bottom: 0.5px solid var(--mzcs-border);
      font-size: 13px;
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
  `;$([We({attribute:false})],y.prototype,"hass",2);$([b()],y.prototype,"_config",2);$([b()],y.prototype,"_zoneIndex",2);$([b()],y.prototype,"_ctrlOpen",2);$([b()],y.prototype,"_setupOpen",2);$([b()],y.prototype,"_schedOpen",2);$([b()],y.prototype,"_schedWeek",2);$([b()],y.prototype,"_schedError",2);$([b()],y.prototype,"_schedBusy",2);$([b()],y.prototype,"_schedSel",2);$([b()],y.prototype,"_schedDrafts",2);$([b()],y.prototype,"_schedNotice",2);$([b()],y.prototype,"_schedGran",2);$([b()],y.prototype,"_rtOpen",2);$([b()],y.prototype,"_rtDaily",2);$([b()],y.prototype,"_rtDayOpen",2);$([b()],y.prototype,"_rtDayDetail",2);$([b()],y.prototype,"_rtDayLoading",2);$([b()],y.prototype,"_rtRange",2);$([b()],y.prototype,"_rt30",2);$([b()],y.prototype,"_dryRun",2);$([b()],y.prototype,"_dryRunError",2);$([b()],y.prototype,"_dryRunning",2);$([b()],y.prototype,"_execConfirm",2);$([b()],y.prototype,"_execRunning",2);$([b()],y.prototype,"_execLog",2);$([b()],y.prototype,"_execResult",2);$([b()],y.prototype,"_tdArmed",2);$([b()],y.prototype,"_tdRunning",2);y=$([Dt(je)],y);window.customCards=window.customCards??[];window.customCards.push({type:je,name:Mt,description:"Nest-style climate view for 1-4 zones with seasonal scheduling, fan timers, and runtime history."});var Mn=Object.defineProperty,Tn=Object.getOwnPropertyDescriptor,ae=(t,e,s,n)=>{for(var i=n>1?void 0:n?Tn(e,s):e,o=t.length-1,a;o>=0;o--)(a=t[o])&&(i=(n?a(e,s,i):a(i))||i);return n&&i&&Mn(e,s,i),i};let ze=null;function Pn(){return ze||(ze=(async()=>{if(!customElements.get("ha-selector"))try{await(await window.loadCardHelpers?.())?.createCardElement({type:"entities",entities:[]})?.constructor.getConfigElement?.(),await customElements.whenDefined("ha-selector")}catch{}})()),ze}const Nn=[{key:"summer",name:"Summer",default_mode:"cool"},{key:"winter",name:"Winter",default_mode:"heat_cool"}];let I=class extends U{constructor(){super(...arguments),this._ready=false}setConfig(t){this._config={type:t.type,prefix:t.prefix??"climate",zones:t.zones??[],seasons:t.seasons??Nn.map(e=>({...e})),season_switch:t.season_switch??"semi",weather_entity:t.weather_entity,features:{...t.features,fan_timer:t.features?.fan_timer??[15,30,60],anomaly_alerts:t.features?.anomaly_alerts??true},notify_target:t.notify_target}}connectedCallback(){super.connectedCallback(),Pn().then(()=>{this._ready=true})}_seasonProvisioned(t){const e=this.hass,s=this._config;if(!e||!s)return true;const n=s.prefix??"climate";return(s.zones??[]).some(i=>i.name&&!!e.states[`schedule.${n}_${R(i.name)}_${t}`])}_emit(t){this._config&&(this._config={...this._config,...t},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:true,composed:true})))}_setZone(t,e){const s=(this._config?.zones??[]).map((n,i)=>i===t?{...n,...e}:n);this._emit({zones:s})}async _probeWeather(){const t=this._config?.weather_entity;if(!(!t||!this.hass?.callWS)){this._probe=void 0;try{const s=(await this.hass.callWS({type:"call_service",domain:"weather",service:"get_forecasts",service_data:{type:"daily"},target:{entity_id:t},return_response:true}))?.response?.[t]?.forecast?.length??0;this._probe=s>0?{ok:true,text:`Daily forecast supported (${s} days).`}:{ok:false,text:"No daily forecast - pick a different weather entity."}}catch{this._probe={ok:false,text:"Probe unavailable - validation skipped."}}}}_selector(t,e,s,n){return!this._ready||!customElements.get("ha-selector")?u`<input
        .value=${typeof e=="string"?e:""}
        placeholder=${n??""}
        @change=${i=>s(i.target.value)}
      />`:u`<ha-selector
      .hass=${this.hass}
      .selector=${t}
      .value=${e}
      .label=${n}
      @value-changed=${i=>s(i.detail.value)}
    ></ha-selector>`}render(){const t=this._config;if(!t)return m;const e=t.zones??[],s=t.seasons??[];return u`
      <div class="ed">
        <h4>Zones (1-4)</h4>
        ${e.map((n,i)=>u`
            <div class="zone">
              <div class="zonehead">
                <span>Zone ${i+1}</span>
                <button
                  class="link danger"
                  @click=${()=>this._emit({zones:e.filter((o,a)=>a!==i)})}
                >
                  Remove
                </button>
              </div>
              ${this._selector({entity:{domain:"climate"}},n.entity,o=>this._setZone(i,{entity:String(o??"")}),"Thermostat")}
              <input
                class="namefield"
                .value=${n.name??""}
                placeholder="Display name"
                @change=${o=>this._setZone(i,{name:o.target.value})}
              />
              ${this._selector({entity:{domain:"sensor",device_class:"temperature",multiple:true}},n.room_sensors??[],o=>this._setZone(i,{room_sensors:o??[]}),"Room sensors")}
            </div>
          `)}
        ${e.length<4?u`<button
              class="link"
              @click=${()=>this._emit({zones:[...e,{entity:"",name:`Zone ${e.length+1}`}]})}
            >
              + Add zone
            </button>`:m}

        <h4>Seasons (1-4)</h4>
        ${s.map((n,i)=>u`
            <div class="seasonrow">
              <input
                .value=${n.name}
                @change=${o=>{const a=o.target.value,c=a.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""),r=s.some((p,h)=>h!==i&&p.key===c),l=this._seasonProvisioned(n.key)||!c||r?n.key:c,d=s.map((p,h)=>h===i?{...p,name:a,key:l}:p);this._emit({seasons:d})}}
              />
              <select
                .value=${n.default_mode}
                @change=${o=>{const a=o.target.value;this._emit({seasons:s.map((c,r)=>r===i?{...c,default_mode:a}:c)})}}
              >
                <option value="cool">Cool</option>
                <option value="heat">Heat</option>
                <option value="heat_cool">Heat+Cool</option>
              </select>
              <button
                class="link danger"
                @click=${()=>this._emit({seasons:s.filter((o,a)=>a!==i)})}
              >
                Remove
              </button>
            </div>
          `)}
        ${s.length<4?u`<button
              class="link"
              @click=${()=>{let n=s.length+1;for(;s.some(i=>i.key===`season_${n}`);)n++;this._emit({seasons:[...s,{key:`season_${n}`,name:`Season ${n}`,default_mode:"cool"}]})}}
            >
              + Add season
            </button>`:m}

        <h4>Season switching</h4>
        <select
          .value=${t.season_switch??"semi"}
          @change=${n=>this._emit({season_switch:n.target.value})}
        >
          <option value="manual">Manual</option>
          <option value="semi">Semi-auto (recommend + confirm)</option>
          <option value="full">Full-auto</option>
        </select>
        ${(t.season_switch??"semi")!=="manual"?u`
              ${this._selector({entity:{domain:"weather"}},t.weather_entity,n=>{this._probe=void 0,this._emit({weather_entity:String(n??"")||void 0})},"Weather entity (daily forecast)")}
              <button class="link" .disabled=${!t.weather_entity} @click=${()=>void this._probeWeather()}>
                Check daily forecast support
              </button>
              ${this._probe?u`<p class=${this._probe.ok?"ok":"bad"}>${this._probe.text}</p>`:m}
            `:m}

        <h4>Features</h4>
        <label class="checkrow">
          <input
            type="checkbox"
            .checked=${(t.features?.fan_timer?.length??0)>0}
            @change=${n=>this._emit({features:{...t.features,fan_timer:n.target.checked?[15,30,60]:[]}})}
          />
          Fan timer buttons (15/30/60)
        </label>
        <label class="checkrow">
          <input
            type="checkbox"
            .checked=${t.features?.anomaly_alerts??true}
            @change=${n=>this._emit({features:{...t.features,anomaly_alerts:n.target.checked}})}
          />
          Runtime anomaly alerts
        </label>

        <h4>Advanced</h4>
        <label class="fieldrow">
          Entity prefix
          <input
            .value=${t.prefix??"climate"}
            @change=${n=>this._emit({prefix:n.target.value||"climate"})}
          />
        </label>
      </div>
    `}};I.styles=At`
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
  `;ae([We({attribute:false})],I.prototype,"hass",2);ae([b()],I.prototype,"_config",2);ae([b()],I.prototype,"_ready",2);ae([b()],I.prototype,"_probe",2);I=ae([Dt(Tt)],I);const In=Object.freeze(Object.defineProperty({__proto__:null,get MzcsCardEditor(){return I}},Symbol.toStringTag,{value:"Module"}));export{y as MzcsCard};

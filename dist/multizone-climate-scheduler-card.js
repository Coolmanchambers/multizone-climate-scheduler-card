"use strict";/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ye=globalThis,Xe=ye.ShadowRoot&&(ye.ShadyCSS===void 0||ye.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Qe=Symbol(),_t=new WeakMap;let Yt=class{constructor(e,s,n){if(this._$cssResult$=true,n!==Qe)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=s}get styleSheet(){let e=this.o;const s=this.t;if(Xe&&e===void 0){const n=s!==void 0&&s.length===1;n&&(e=_t.get(s)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&_t.set(s,e))}return e}toString(){return this.cssText}};const Cs=t=>new Yt(typeof t=="string"?t:t+"",void 0,Qe),Jt=(t,...e)=>{const s=t.length===1?t[0]:e.reduce((n,i,a)=>n+(o=>{if(o._$cssResult$===true)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[a+1],t[0]);return new Yt(s,t,Qe)},Rs=(t,e)=>{if(Xe)t.adoptedStyleSheets=e.map(s=>s instanceof CSSStyleSheet?s:s.styleSheet);else for(const s of e){const n=document.createElement("style"),i=ye.litNonce;i!==void 0&&n.setAttribute("nonce",i),n.textContent=s.cssText,t.appendChild(n)}},gt=Xe?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let s="";for(const n of e.cssRules)s+=n.cssText;return Cs(s)})(t):t;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Os,defineProperty:Ms,getOwnPropertyDescriptor:Ds,getOwnPropertyNames:Is,getOwnPropertySymbols:Ns,getPrototypeOf:Ls}=Object,Se=globalThis,yt=Se.trustedTypes,Ps=yt?yt.emptyScript:"",js=Se.reactiveElementPolyfillSupport,ne=(t,e)=>t,$e={toAttribute(t,e){switch(e){case Boolean:t=t?Ps:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=t!==null;break;case Number:s=t===null?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch{s=null}}return s}},et=(t,e)=>!Os(t,e),bt={attribute:true,type:String,converter:$e,reflect:false,useDefault:false,hasChanged:et};Symbol.metadata??=Symbol("metadata"),Se.litPropertyMetadata??=new WeakMap;let Z=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,s=bt){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(e)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(e,s),!s.noAccessor){const n=Symbol(),i=this.getPropertyDescriptor(e,n,s);i!==void 0&&Ms(this.prototype,e,i)}}static getPropertyDescriptor(e,s,n){const{get:i,set:a}=Ds(this.prototype,e)??{get(){return this[s]},set(o){this[s]=o}};return{get:i,set(o){const c=i?.call(this);a?.call(this,o),this.requestUpdate(e,c,n)},configurable:true,enumerable:true}}static getPropertyOptions(e){return this.elementProperties.get(e)??bt}static _$Ei(){if(this.hasOwnProperty(ne("elementProperties")))return;const e=Ls(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(ne("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(ne("properties"))){const s=this.properties,n=[...Is(s),...Ns(s)];for(const i of n)this.createProperty(i,s[i])}const e=this[Symbol.metadata];if(e!==null){const s=litPropertyMetadata.get(e);if(s!==void 0)for(const[n,i]of s)this.elementProperties.set(n,i)}this._$Eh=new Map;for(const[s,n]of this.elementProperties){const i=this._$Eu(s,n);i!==void 0&&this._$Eh.set(i,s)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const s=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const i of n)s.unshift(gt(i))}else e!==void 0&&s.push(gt(e));return s}static _$Eu(e,s){const n=s.attribute;return n===false?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,s=this.constructor.elementProperties;for(const n of s.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Rs(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,s,n){this._$AK(e,n)}_$ET(e,s){const n=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,n);if(i!==void 0&&n.reflect===true){const a=(n.converter?.toAttribute!==void 0?n.converter:$e).toAttribute(s,n.type);this._$Em=e,a==null?this.removeAttribute(i):this.setAttribute(i,a),this._$Em=null}}_$AK(e,s){const n=this.constructor,i=n._$Eh.get(e);if(i!==void 0&&this._$Em!==i){const a=n.getPropertyOptions(i),o=typeof a.converter=="function"?{fromAttribute:a.converter}:a.converter?.fromAttribute!==void 0?a.converter:$e;this._$Em=i;const c=o.fromAttribute(s,a.type);this[i]=c??this._$Ej?.get(i)??c,this._$Em=null}}requestUpdate(e,s,n,i=false,a){if(e!==void 0){const o=this.constructor;if(i===false&&(a=this[e]),n??=o.getPropertyOptions(e),!((n.hasChanged??et)(a,s)||n.useDefault&&n.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,n))))return;this.C(e,s,n)}this.isUpdatePending===false&&(this._$ES=this._$EP())}C(e,s,{useDefault:n,reflect:i,wrapped:a},o){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??s??this[e]),a!==true||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(s=void 0),this._$AL.set(e,s)),i===true&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=true;try{await this._$ES}catch(s){Promise.reject(s)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[i,a]of this._$Ep)this[i]=a;this._$Ep=void 0}const n=this.constructor.elementProperties;if(n.size>0)for(const[i,a]of n){const{wrapped:o}=a,c=this[i];o!==true||this._$AL.has(i)||c===void 0||this.C(i,void 0,a,c)}}let e=false;const s=this._$AL;try{e=this.shouldUpdate(s),e?(this.willUpdate(s),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(s)):this._$EM()}catch(n){throw e=false,this._$EM(),n}e&&this._$AE(s)}willUpdate(e){}_$AE(e){this._$EO?.forEach(s=>s.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=false}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return true}update(e){this._$Eq&&=this._$Eq.forEach(s=>this._$ET(s,this[s])),this._$EM()}updated(e){}firstUpdated(e){}};Z.elementStyles=[],Z.shadowRootOptions={mode:"open"},Z[ne("elementProperties")]=new Map,Z[ne("finalized")]=new Map,js?.({ReactiveElement:Z}),(Se.reactiveElementVersions??=[]).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const tt=globalThis,vt=t=>t,we=tt.trustedTypes,$t=we?we.createPolicy("lit-html",{createHTML:t=>t}):void 0,Xt="$lit$",L=`lit$${Math.random().toFixed(9).slice(2)}$`,Qt="?"+L,Ws=`<${Qt}>`,U=document,re=()=>U.createComment(""),ce=t=>t===null||typeof t!="object"&&typeof t!="function",st=Array.isArray,Hs=t=>st(t)||typeof t?.[Symbol.iterator]=="function",Re=`[ 	
\f\r]`,ee=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,wt=/-->/g,xt=/>/g,j=RegExp(`>|${Re}(?:([^\\s"'>=/]+)(${Re}*=${Re}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),kt=/'/g,St=/"/g,es=/^(?:script|style|textarea|title)$/i,Fs=t=>(e,...s)=>({_$litType$:t,strings:e,values:s}),h=Fs(1),Y=Symbol.for("lit-noChange"),m=Symbol.for("lit-nothing"),Et=new WeakMap,F=U.createTreeWalker(U,129);function ts(t,e){if(!st(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return $t!==void 0?$t.createHTML(e):e}const Us=(t,e)=>{const s=t.length-1,n=[];let i,a=e===2?"<svg>":e===3?"<math>":"",o=ee;for(let c=0;c<s;c++){const r=t[c];let d,l,u=-1,p=0;for(;p<r.length&&(o.lastIndex=p,l=o.exec(r),l!==null);)p=o.lastIndex,o===ee?l[1]==="!--"?o=wt:l[1]!==void 0?o=xt:l[2]!==void 0?(es.test(l[2])&&(i=RegExp("</"+l[2],"g")),o=j):l[3]!==void 0&&(o=j):o===j?l[0]===">"?(o=i??ee,u=-1):l[1]===void 0?u=-2:(u=o.lastIndex-l[2].length,d=l[1],o=l[3]===void 0?j:l[3]==='"'?St:kt):o===St||o===kt?o=j:o===wt||o===xt?o=ee:(o=j,i=void 0);const f=o===j&&t[c+1].startsWith("/>")?" ":"";a+=o===ee?r+Ws:u>=0?(n.push(d),r.slice(0,u)+Xt+r.slice(u)+L+f):r+L+(u===-2?c:f)}return[ts(t,a+(t[s]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]};class le{constructor({strings:e,_$litType$:s},n){let i;this.parts=[];let a=0,o=0;const c=e.length-1,r=this.parts,[d,l]=Us(e,s);if(this.el=le.createElement(d,n),F.currentNode=this.el.content,s===2||s===3){const u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(i=F.nextNode())!==null&&r.length<c;){if(i.nodeType===1){if(i.hasAttributes())for(const u of i.getAttributeNames())if(u.endsWith(Xt)){const p=l[o++],f=i.getAttribute(u).split(L),x=/([.?@])?(.*)/.exec(p);r.push({type:1,index:a,name:x[2],strings:f,ctor:x[1]==="."?Ks:x[1]==="?"?Zs:x[1]==="@"?qs:Ee}),i.removeAttribute(u)}else u.startsWith(L)&&(r.push({type:6,index:a}),i.removeAttribute(u));if(es.test(i.tagName)){const u=i.textContent.split(L),p=u.length-1;if(p>0){i.textContent=we?we.emptyScript:"";for(let f=0;f<p;f++)i.append(u[f],re()),F.nextNode(),r.push({type:2,index:++a});i.append(u[p],re())}}}else if(i.nodeType===8)if(i.data===Qt)r.push({type:2,index:a});else{let u=-1;for(;(u=i.data.indexOf(L,u+1))!==-1;)r.push({type:7,index:a}),u+=L.length-1}a++}}static createElement(e,s){const n=U.createElement("template");return n.innerHTML=e,n}}function J(t,e,s=t,n){if(e===Y)return e;let i=n!==void 0?s._$Co?.[n]:s._$Cl;const a=ce(e)?void 0:e._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(false),a===void 0?i=void 0:(i=new a(t),i._$AT(t,s,n)),n!==void 0?(s._$Co??=[])[n]=i:s._$Cl=i),i!==void 0&&(e=J(t,i._$AS(t,e.values),i,n)),e}class Bs{constructor(e,s){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:s},parts:n}=this._$AD,i=(e?.creationScope??U).importNode(s,true);F.currentNode=i;let a=F.nextNode(),o=0,c=0,r=n[0];for(;r!==void 0;){if(o===r.index){let d;r.type===2?d=new he(a,a.nextSibling,this,e):r.type===1?d=new r.ctor(a,r.name,r.strings,this,e):r.type===6&&(d=new Gs(a,this,e)),this._$AV.push(d),r=n[++c]}o!==r?.index&&(a=F.nextNode(),o++)}return F.currentNode=U,i}p(e){let s=0;for(const n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,s),s+=n.strings.length-2):n._$AI(e[s])),s++}}class he{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,s,n,i){this.type=2,this._$AH=m,this._$AN=void 0,this._$AA=e,this._$AB=s,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??true}get parentNode(){let e=this._$AA.parentNode;const s=this._$AM;return s!==void 0&&e?.nodeType===11&&(e=s.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,s=this){e=J(this,e,s),ce(e)?e===m||e==null||e===""?(this._$AH!==m&&this._$AR(),this._$AH=m):e!==this._$AH&&e!==Y&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Hs(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==m&&ce(this._$AH)?this._$AA.nextSibling.data=e:this.T(U.createTextNode(e)),this._$AH=e}$(e){const{values:s,_$litType$:n}=e,i=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=le.createElement(ts(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(s);else{const a=new Bs(i,this),o=a.u(this.options);a.p(s),this.T(o),this._$AH=a}}_$AC(e){let s=Et.get(e.strings);return s===void 0&&Et.set(e.strings,s=new le(e)),s}k(e){st(this._$AH)||(this._$AH=[],this._$AR());const s=this._$AH;let n,i=0;for(const a of e)i===s.length?s.push(n=new he(this.O(re()),this.O(re()),this,this.options)):n=s[i],n._$AI(a),i++;i<s.length&&(this._$AR(n&&n._$AB.nextSibling,i),s.length=i)}_$AR(e=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);e!==this._$AB;){const n=vt(e).nextSibling;vt(e).remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class Ee{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,s,n,i,a){this.type=1,this._$AH=m,this._$AN=void 0,this.element=e,this.name=s,this._$AM=i,this.options=a,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=m}_$AI(e,s=this,n,i){const a=this.strings;let o=false;if(a===void 0)e=J(this,e,s,0),o=!ce(e)||e!==this._$AH&&e!==Y,o&&(this._$AH=e);else{const c=e;let r,d;for(e=a[0],r=0;r<a.length-1;r++)d=J(this,c[n+r],s,r),d===Y&&(d=this._$AH[r]),o||=!ce(d)||d!==this._$AH[r],d===m?e=m:e!==m&&(e+=(d??"")+a[r+1]),this._$AH[r]=d}o&&!i&&this.j(e)}j(e){e===m?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Ks extends Ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===m?void 0:e}}class Zs extends Ee{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==m)}}class qs extends Ee{constructor(e,s,n,i,a){super(e,s,n,i,a),this.type=5}_$AI(e,s=this){if((e=J(this,e,s,0)??m)===Y)return;const n=this._$AH,i=e===m&&n!==m||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,a=e!==m&&(n===m||i);i&&this.element.removeEventListener(this.name,this,n),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Gs{constructor(e,s,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=s,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const Vs=tt.litHtmlPolyfillSupport;Vs?.(le,he),(tt.litHtmlVersions??=[]).push("3.3.3");const Ys=(t,e,s)=>{const n=s?.renderBefore??e;let i=n._$litPart$;if(i===void 0){const a=s?.renderBefore??null;n._$litPart$=i=new he(e.insertBefore(re(),a),a,void 0,s??{})}return i._$AI(t),i};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const nt=globalThis;class V extends Z{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const s=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ys(s,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false)}render(){return Y}}V._$litElement$=true,V.finalized=true,nt.litElementHydrateSupport?.({LitElement:V});const Js=nt.litElementPolyfillSupport;Js?.({LitElement:V});(nt.litElementVersions??=[]).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ss=t=>(e,s)=>{s!==void 0?s.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Xs={attribute:true,type:String,converter:$e,reflect:false,hasChanged:et},Qs=(t=Xs,e,s)=>{const{kind:n,metadata:i}=s;let a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),n==="setter"&&((t=Object.create(t)).wrapped=true),a.set(s.name,t),n==="accessor"){const{name:o}=s;return{set(c){const r=e.get.call(this);e.set.call(this,c),this.requestUpdate(o,r,t,true,c)},init(c){return c!==void 0&&this.C(o,void 0,t,c),c}}}if(n==="setter"){const{name:o}=s;return function(c){const r=this[o];e.call(this,c),this.requestUpdate(o,r,t,true,c)}}throw Error("Unsupported decorator location: "+n)};function it(t){return(e,s)=>typeof s=="object"?Qs(t,e,s):((n,i,a)=>{const o=i.hasOwnProperty(a);return i.constructor.createProperty(a,n),o?Object.getOwnPropertyDescriptor(i,a):void 0})(t,e,s)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function b(t){return it({...t,state:true,attribute:false})}const ns="0.7.5",at="multizone-climate-scheduler-card",is="Multi-Zone Climate Scheduler Card",as=`${at}-editor`;function D(t){return(t??[]).map(e=>typeof e=="string"?{entity:e}:e).filter(e=>!!e&&typeof e.entity=="string"&&e.entity!=="").map(e=>{const s=e.last_seen;if(!("last_seen"in e))return e;if(typeof s=="string"&&s.trim()&&s.length<=255){const a=s.trim();return a===s?e:{...e,last_seen:a}}const{last_seen:n,...i}=e;return i})}function Be(t){const e={entity:t.entity};return t.name?.trim()&&(e.name=t.name),typeof t.last_seen=="string"&&t.last_seen.trim()&&(e.last_seen=t.last_seen),e.name||e.last_seen?e:t.entity}const os=3,en=45;function ie(t){const e=t?.last_seen,s=Number(t?.ageing_minutes),n=Number(t?.stale_hours);return{lastSeen:e==="off"||e==="ageing"||e==="always"?e:"always",ageingMs:Number.isFinite(s)&&s>0?s*6e4:en*6e4,staleMs:Number.isFinite(n)&&n>0?n*36e5:os*36e5}}function G(t){const e=t?.eco_preset;return e===false?null:typeof e=="string"&&e.trim()?e.trim():"eco"}function q(t){const e=t?.off_peak_entity;if(typeof e!="string"||!e.trim())return null;const s=t?.off_peak_offset,n=typeof s=="number"&&Number.isFinite(s)?Math.round(Math.min(10,Math.max(0,s))):2;return{entity:e.trim(),offsetSeed:n}}function ot(t){if(!t||!Array.isArray(t.zones??[]))throw new Error("zones must be a list of { entity, name } items.");const e=t.zones??[];if(e.length>4)throw new Error("A maximum of 4 zones is supported.");const s=e.map(a=>({...a,name:typeof a.name=="string"&&a.name.trim()?a.name:a.entity?a.entity.split(".")[1].replace(/_/g," "):"Zone"})),n=t.features?.fan_timer,i=t.features?{...t.features,fan_timer:Array.isArray(n)?n:typeof n=="number"?[n]:void 0}:void 0;return{...t,zones:s,...i?{features:i}:{}}}const rt={fan_timer:{domain:"timer",suffix:"fan"},room_override_timer:{domain:"timer",suffix:"room_override"},running_sensor:{domain:"binary_sensor",suffix:"running"},runtime_today:{domain:"sensor",suffix:"runtime_today"},runtime_mirror:{domain:"sensor",suffix:"runtime_mirror"},expected_runtime:{domain:"sensor",suffix:"expected_runtime"},target_room_select:{domain:"input_select",suffix:"target_room"},steer_target:{domain:"input_number",suffix:"steer_target"},sensor_schedule:{domain:"schedule",suffix:"sensor_schedule"},applied_block_marker:{domain:"input_text",suffix:"applied_block"},zone_enabled:{domain:"input_boolean",suffix:"enabled"},k_factor:{domain:"input_number",suffix:"k"}},ct={season_select:{domain:"input_select",suffix:"season"},season_mode:{domain:"input_select",suffix:"season_mode"},season_confirm_days:{domain:"input_number",suffix:"season_confirm_days"},season_dwell_days:{domain:"input_number",suffix:"season_dwell_days"},dev_green_max:{domain:"input_number",suffix:"dev_green_max"},dev_amber_max:{domain:"input_number",suffix:"dev_amber_max"},runtime_alert_margin:{domain:"input_number",suffix:"runtime_alert_margin"},runtime_alert_days:{domain:"input_number",suffix:"runtime_alert_days"},runtime_learn_days:{domain:"input_number",suffix:"runtime_learn_days"},cdd_base:{domain:"input_number",suffix:"cdd_base"},override_minutes:{domain:"input_number",suffix:"override_minutes"},steer_min_setpoint:{domain:"input_number",suffix:"steer_min_setpoint"},steer_max_setpoint:{domain:"input_number",suffix:"steer_max_setpoint"},steer_max_offset:{domain:"input_number",suffix:"steer_max_offset"},off_peak_offset:{domain:"input_number",suffix:"off_peak_offset"},off_peak_paused_on:{domain:"input_text",suffix:"off_peak_paused_on"},next_block_sensor:{domain:"sensor",suffix:"next_block"},outdoor_temp_sensor:{domain:"sensor",suffix:"outdoor_temp"},outdoor_daily_mean:{domain:"sensor",suffix:"outdoor_daily_mean"},theme:{domain:"input_text",suffix:"theme"}};[...Object.values(rt).map(t=>t.suffix),...Object.values(ct).map(t=>t.suffix)];function A(t){return t.toLowerCase().replace(/['’]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function $(t,e,s){const n=rt[t];return`${n.domain}.${e}_${s}_${n.suffix}`}function ae(t,e,s){return`schedule.${t}_${e}_${s}`}function tn(t,e){const s=t?.find(n=>n?.name===e);return s?String(s.key):A(e)}function k(t,e){const s=ct[t];return`${s.domain}.${e}_${s.suffix}`}function O(t,e){return`${t}_mzcs_${e}`}function sn(t,e,s){return`automation.${N(t,e,s).toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}`}function N(t,e,s){const n=t.charAt(0).toUpperCase()+t.slice(1);return{engine:`${n}: schedule engine`,fan_timer:`${n}: ${s??"?"} fan timer finished`,season_recommender:`${n}: season recommender`,runtime_alert:`${n}: runtime anomaly alert`,runtime_learning:`${n}: runtime learning`,watchdog:`${n}: engine watchdog`,steering:`${n}: comfort steering`}[e]??`${n}: ${e}`}const nn=Object.entries(ct),an=Object.entries(rt);function lt(t,e,s,n){const i=t.indexOf(".");if(i<0)return null;const a=t.slice(0,i),o=t.slice(i+1);if(o!==e&&!o.startsWith(`${e}_`))return null;const c=o.slice(e.length+1);for(const[d,l]of nn)if(a===l.domain&&c===l.suffix)return{cls:d};const r=[...s].sort((d,l)=>l.length-d.length);for(const d of r){if(c!==d&&!c.startsWith(`${d}_`))continue;const l=c.slice(d.length+1);for(const[u,p]of an)if(a===p.domain&&l===p.suffix)return{cls:u,zone:d};if(a==="schedule"&&n.includes(l))return{cls:"zone_schedule",zone:d,season:l}}return null}const M=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"],rs=["monday","tuesday","wednesday","thursday","friday"],on=["saturday","sunday"];function rn(t){const e=[];t.length===0&&e.push("A day needs at least one block.");const s=new Set;for(const n of t)/^([01]\d|2[0-3]):[0-5]\d$/.test(n.time)||e.push(`Bad time "${n.time}".`),s.has(n.time)&&e.push(`Duplicate block time ${n.time}.`),s.add(n.time),n.mode==="cool"&&n.cool_temp==null&&e.push(`${n.name}: cool needs cool_temp.`),n.mode==="heat"&&n.heat_temp==null&&e.push(`${n.name}: heat needs heat_temp.`),n.mode==="heat_cool"&&(n.cool_temp==null||n.heat_temp==null)&&e.push(`${n.name}: heat_cool needs both cool_temp and heat_temp.`),n.cool_temp!=null&&n.heat_temp!=null&&n.heat_temp>=n.cool_temp&&e.push(`${n.name}: heat_temp must be below cool_temp.`);return e}function Oe(t){return{block:t.name,mode:t.mode,...t.cool_temp!=null?{cool_temp:t.cool_temp}:{},...t.heat_temp!=null?{heat_temp:t.heat_temp}:{}}}function cn(t){const e=rn(t);if(e.length>0)throw new Error(e.join(" "));const s=[...t].sort((o,c)=>o.time.localeCompare(c.time)),n=s[0],i=s[s.length-1];if(s.length===1)return[{from:"00:00:00",to:"24:00:00",data:Oe(n)}];const a=[];n.time!=="00:00"&&a.push({from:"00:00:00",to:`${n.time}:00`,data:Oe(i)});for(let o=0;o<s.length;o++){const c=s[o],r=s[o+1];a.push({from:`${c.time}:00`,to:r?`${r.time}:00`:"24:00:00",data:Oe(c)})}return a}function cs(t,e){if(t==="all"&&e==="all")return M;if(t==="wdwe"&&e==="wd")return rs;if(t==="wdwe"&&e==="we")return on;if(t==="days"&&M.includes(e.toLowerCase()))return[e.toLowerCase()];throw new Error(`Unknown set "${e}" for granularity "${t}".`)}function ln(t,e){const s={};for(const[n,i]of Object.entries(e)){const a=cn(i);for(const o of cs(t,n))s[o]=a}for(const n of M)if(!s[n])throw new Error(`No block set covers ${n}.`);return s}function dn(t,e,s){if(t===e)return s;const n=i=>{const a=s[i];if(!a)throw new Error(`Missing set "${i}" for transition ${t}\u2192${e}.`);return a.map(o=>({...o}))};if(t==="all"&&e==="wdwe")return{wd:n("all"),we:n("all")};if(t==="all"&&e==="days")return Object.fromEntries(M.map(i=>[i,n("all")]));if(t==="wdwe"&&e==="days")return Object.fromEntries(M.map(i=>[i,rs.includes(i)?n("wd"):n("we")]));if(t==="wdwe"&&e==="all")return{all:n("wd")};if(t==="days"&&e==="wdwe")return{wd:n("monday"),we:n("saturday")};if(t==="days"&&e==="all")return{all:n("monday")};throw new Error(`Unsupported transition ${t}\u2192${e}.`)}const X="Managed by Multi-Zone Climate Scheduler Card (mzcs).";function ls(t){return`{${t.map(e=>`'${e.name.replace(/'/g,"")}': '${e.key}'`).join(", ")}}`}function de(t){if(Array.isArray(t))return`[${t.map(de).join(",")}]`;if(t!==null&&typeof t=="object"){const e=t;return`{${Object.keys(e).sort().map(s=>`${JSON.stringify(s)}:${de(e[s])}`).join(",")}}`}return JSON.stringify(t)}function pn(t){const e=de(t);let s=5381;for(let n=0;n<e.length;n++)s=(s<<5)+s+e.charCodeAt(n)>>>0;return s.toString(16).padStart(8,"0")}const ds=/\[mzcs-sig:([0-9a-f]{8})\]/;function pe(t){const e=typeof t=="string"?t.match(ds):null;return e?e[1]:null}function ue(t){const e=String(t.description??"").replace(ds,"").trimEnd();return pn({...t,description:e})}function Q(t){const e=ue(t);return{...t,description:`${String(t.description??"")} [mzcs-sig:${e}]`}}function un(t,e,s,n,i="eco",a=null,o=false){const c=d=>pe(d.description),r={[O(t,"engine")]:c(ps(t,e,s,i,a,o)),[O(t,"watchdog")]:c(fs(t)),[O(t,"runtime_learning")]:c(ms(t,e)),[O(t,"runtime_alert")]:c(_s(t,e))};o&&(r[O(t,"steering")]=c(hs(t,e,s,i)));for(const d of e)r[O(t,`fan_timer_${d.slug}`)]=c(us(t,d,n));return r}function hn(t,e){const s={step:null,coolExpr:"{{ blk_cool }}",heatExpr:"{{ blk_heat }}",singleExpr:"{{ blk_cool if blk_cool is not none else blk_heat }}",markerExpr:"blk"},n=e===null?"":e.replace(/['"\\]/g,"").trim();if(!n)return s;const i=k("off_peak_offset",t),a=k("off_peak_paused_on",t);return{step:{alias:"Compute the applied setpoints (off-peak comfort)",variables:{adj:`{{ (states('${i}') | float(0)) if is_state('${n}', 'on') and ((states('${a}') | as_datetime) is none or (states('${a}') | as_datetime | as_local).date() != now().date()) else 0 }}`,hc_adj:"{{ [ adj, [ ((blk_cool | float(0)) - (blk_heat | float(0)) - 2) / 2, 0 ] | max ] | min if blk_cool is not none and blk_heat is not none else adj }}",app_cool:"{{ (blk_cool | float(0)) - adj if blk_cool is not none else none }}",app_heat:"{{ (blk_heat | float(0)) + adj if blk_heat is not none else none }}",app_hi:"{{ (blk_cool | float(0)) - hc_adj if blk_cool is not none else none }}",app_lo:"{{ (blk_heat | float(0)) + hc_adj if blk_heat is not none else none }}",mark:"{{ blk ~ '|op' ~ adj }}"}},coolExpr:"{{ app_hi }}",heatExpr:"{{ app_lo }}",singleExpr:"{{ app_cool if blk_cool is not none else app_heat }}",markerExpr:"mark"}}function mn(t,e,s){const n=s.map(i=>` and ${i}`).join("");return`{{ is_state(repeat.item.enabled, 'on') and blk is not none and ${t} != states(repeat.item.marker)${e}${n} }}`}function ps(t,e,s,n="eco",i=null,a=false){const o=n===null?null:n.replace(/['"\\]/g,"").trim()||"eco",c=o===null?"":o==="eco"?" Zones stand down while their Eco preset is active.":` Zones stand down while their '${o}' preset is active.`,r=o===null?"Skip when zone disabled, already applied, or no block data":o==="eco"?"Skip when zone disabled, already applied, Eco active, or no block data":"Skip when zone disabled, already applied, standby preset active, or no block data",d=o===null?"":` and state_attr(repeat.item.climate, 'preset_mode') != '${o}'`,l=e.flatMap(_=>s.map(z=>ae(t,_.slug,z.key))),u=e.map(_=>$("zone_enabled",t,_.slug)),p=ls(s),f=hn(t,i),x=f.step?" On off-peak days (per the configured entity) applied setpoints shift toward comfort by the off-peak offset helper.":"",S=a?" Comfort steering owns a zone while its room-override timer is active; this engine skips it until the steering automation reverts.":"";return Q({id:O(t,"engine"),alias:N(t,"engine"),description:`${X} Applies the active season's schedule block to each ENABLED zone at block transitions. Per-zone applied-block markers mean manual changes and external raises HOLD until the next block; the 15-minute tick only recovers missed transitions.${c} heat_cool blocks apply dual setpoints.${x}${S}`,mode:"queued",max:5,triggers:[{trigger:"state",entity_id:l,alias:"Any zone schedule changed"},{trigger:"homeassistant",event:"start",alias:"HA started"},{trigger:"time_pattern",minutes:"/15",alias:"Safety tick"},{trigger:"state",entity_id:k("season_select",t),alias:"Season changed"},{trigger:"state",entity_id:u,to:"on",alias:"Zone re-enabled"},...a?[{trigger:"state",entity_id:e.map(_=>$("applied_block_marker",t,_.slug)),to:"",alias:"Steering released a zone"}]:[]],conditions:[],actions:[{alias:"Resolve the active season key",variables:{season:`{{ ${p}.get(states('${k("season_select",t)}'), states('${k("season_select",t)}') | lower) }}`}},{alias:"Apply per zone",repeat:{for_each:e.map(_=>({zone:_.slug,climate:_.climate,marker:$("applied_block_marker",t,_.slug),enabled:$("zone_enabled",t,_.slug),...a?{override_timer:$("room_override_timer",t,_.slug)}:{}})),sequence:[{alias:"Read this zone's active block",variables:{blk:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'block') }}`,blk_mode:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'mode') }}`,blk_cool:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'cool_temp') }}`,blk_heat:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'heat_temp') }}`}},...f.step?[f.step]:[],{alias:r,condition:"template",value_template:mn(f.markerExpr,d,a?["not (is_state(repeat.item.override_timer, 'active') and blk_mode == 'cool')"]:[])},{alias:"Apply the block (dual range, off, or single target)",continue_on_error:true,choose:[{conditions:[{condition:"template",value_template:"{{ blk_mode == 'heat_cool' }}"}],sequence:[{alias:"Apply heat_cool range",action:"climate.set_temperature",target:{entity_id:"{{ repeat.item.climate }}"},data:{target_temp_high:f.coolExpr,target_temp_low:f.heatExpr,hvac_mode:"heat_cool"}}]},{conditions:[{condition:"template",value_template:"{{ blk_mode == 'off' }}"}],sequence:[{alias:"Turn the zone off",action:"climate.set_hvac_mode",target:{entity_id:"{{ repeat.item.climate }}"},data:{hvac_mode:"off"}}]},{conditions:[{condition:"template",value_template:"{{ blk_cool is not none or blk_heat is not none }}"}],sequence:[{alias:"Apply single target",action:"climate.set_temperature",target:{entity_id:"{{ repeat.item.climate }}"},data:{temperature:f.singleExpr,hvac_mode:"{{ blk_mode }}"}}]}],default:[]},{alias:"Record the applied block",action:"input_text.set_value",target:{entity_id:"{{ repeat.item.marker }}"},data:{value:`{{ ${f.markerExpr} }}`}}]}}]})}function us(t,e,s){return Q({id:O(t,`fan_timer_${e.slug}`),alias:N(t,"fan_timer",e.name),description:`${X} Turns the ${e.name} fan off when its fan timer ends.`,mode:"single",triggers:[{trigger:"event",event_type:"timer.finished",event_data:{entity_id:$("fan_timer",t,e.slug)},alias:`${e.name} fan timer finished`}],conditions:s?[{alias:"Stand down while the fan-guard helper wants the fan running",condition:"state",entity_id:s,state:"off"}]:[],actions:[{alias:`Turn the ${e.name} fan off`,action:"climate.set_fan_mode",target:{entity_id:e.climate},data:{fan_mode:"off"}}]})}function hs(t,e,s,n="eco"){const i=n===null?null:n.replace(/['"\\]/g,"").trim()||"eco",a=i===null?"":` and state_attr(repeat.item.climate, 'preset_mode') != '${i}'`,o=p=>$("room_override_timer",t,p.slug),c=p=>`states(${p}) | float(-999) > -900 and states[${p}] is not none and now() - states[${p}].last_reported < timedelta(hours=3) and (repeat.item.seens.get(${p}) is none or ((states(repeat.item.seens.get(${p})) | as_datetime) is not none and now() - (states(repeat.item.seens.get(${p})) | as_datetime) < timedelta(hours=3)))`,r=e.filter(p=>(p.rooms??[]).length>0),d=[...new Set(r.flatMap(p=>(p.rooms??[]).map(f=>f.entity)))],l=`{${e.map(p=>`'${o(p)}': '${$("applied_block_marker",t,p.slug)}'`).join(", ")}}`,u=k("season_select",t);return Q({id:O(t,"steering"),alias:N(t,"steering"),description:`${X} Drives a zone's thermostat so the SELECTED ROOM reaches the override target while the room-override timer runs (cool only). Commanded setpoint = thermostat reading minus how far the room is above target, clamped to the steering band and to the max offset from the scheduled block. When the timer ends or is cancelled, the applied-block marker is cleared so the schedule engine re-asserts the block on its next trigger.`,mode:"queued",max:25,triggers:[...d.length?[{trigger:"state",entity_id:d,alias:"A steered room reading changed"}]:[],...r.length?[{trigger:"state",entity_id:r.map(p=>$("sensor_schedule",t,p.slug)),alias:"A daypart boundary passed"}]:[],{trigger:"state",entity_id:e.map(p=>o(p)),to:"active",alias:"An override started"},...e.map(p=>({trigger:"event",event_type:"timer.finished",event_data:{entity_id:o(p)},alias:`${p.name} override timer finished`})),...e.map(p=>({trigger:"event",event_type:"timer.cancelled",event_data:{entity_id:o(p)},alias:`${p.name} override cancelled`})),{trigger:"time_pattern",minutes:"/5",alias:"Safety tick"},{trigger:"homeassistant",event:"start",alias:"HA started"}],conditions:[],actions:[{alias:"Revert on a timer event, steer otherwise",choose:[{conditions:[{condition:"template",value_template:"{{ trigger.platform == 'event' }}"}],sequence:[{alias:"Resolve which zone's override ended",variables:{marker:`{{ ${l}.get(trigger.event.data.entity_id) }}`}},{alias:"Only timers this card manages",condition:"template",value_template:"{{ marker is not none }}"},{alias:"Clear the applied-block marker so the engine re-asserts the schedule",action:"input_text.set_value",target:{entity_id:"{{ marker }}"},data:{value:""}}]}],default:[{alias:"Resolve the active season key",variables:{season:`{{ ${ls(s)}.get(states('${u}'), states('${u}') | lower) }}`}},{alias:"Steer each zone with an active override",repeat:{for_each:r.map(p=>({zone:p.slug,climate:p.climate,timer:o(p),select:$("target_room_select",t,p.slug),target:$("steer_target",t,p.slug),enabled:$("zone_enabled",t,p.slug),sensor_schedule:$("sensor_schedule",t,p.slug),rooms:Object.fromEntries((p.rooms??[]).map(f=>[f.label,f.entity])),labels:Object.fromEntries((p.rooms??[]).map(f=>[f.entity,f.label])),seens:Object.fromEntries((p.rooms??[]).filter(f=>f.seen).map(f=>[f.entity,f.seen]))})),sequence:[{alias:"Resolve this zone's steering inputs",variables:{room:"{{ repeat.item.rooms.get(states(repeat.item.select)) }}",blk_mode:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'mode') }}`,blk_cool:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'cool_temp') }}`,dp_label:"{{ repeat.item.labels.get(state_attr(repeat.item.sensor_schedule, 'sensor')) }}",dp_room:"{{ repeat.item.rooms.get(dp_label) }}",dp_fresh:`{{ dp_room is not none and ${c("dp_room")} }}`}},{alias:"Daypart pilot - start the scheduled steer when no override is running",choose:[{conditions:[{condition:"template",value_template:`{{ dp_label is not none and is_state(repeat.item.timer, 'idle') and is_state(repeat.item.enabled, 'on') and blk_mode == 'cool' and blk_cool is not none and blk_cool | float(0) >= 50 and blk_cool | float(0) <= 95 and dp_fresh${a} }}`}],sequence:[{alias:"Point the zone at the daypart room",continue_on_error:true,action:"input_select.select_option",target:{entity_id:"{{ repeat.item.select }}"},data:{option:"{{ dp_label }}"}},{alias:"Target the scheduled setpoint at that room",continue_on_error:true,action:"input_number.set_value",target:{entity_id:"{{ repeat.item.target }}"},data:{value:"{{ blk_cool | float }}"}},{alias:"Run the override until the daypart ends",continue_on_error:true,action:"timer.start",target:{entity_id:"{{ repeat.item.timer }}"},data:{duration:"{{ [ ((state_attr(repeat.item.sensor_schedule, 'next_event') - now()).total_seconds() | int) if state_attr(repeat.item.sensor_schedule, 'next_event') is not none else 1800, 300 ] | max }}"}}]}],default:[]},{alias:"Cancel the override if its zone was disabled mid-override",choose:[{conditions:[{condition:"template",value_template:"{{ is_state(repeat.item.timer, 'active') and not is_state(repeat.item.enabled, 'on') }}"}],sequence:[{alias:"Cancel this override - the kill switch outranks steering",continue_on_error:true,action:"timer.cancel",target:{entity_id:"{{ repeat.item.timer }}"}}]}],default:[]},{alias:"Steer only an enabled zone with an active override on a cooling block",condition:"template",value_template:`{{ is_state(repeat.item.timer, 'active') and is_state(repeat.item.enabled, 'on') and room is not none and blk_mode == 'cool' and blk_cool is not none${a} }}`},{alias:"Read the room, the thermostat and the target",variables:{t_room:"{{ states(room) | float(-999) }}",room_fresh:`{{ ${c("room")} }}`,t_thermo:"{{ state_attr(repeat.item.climate, 'current_temperature') }}",t_target:"{{ states(repeat.item.target) | float(-999) }}"}},{alias:"Refuse stale or unreadable inputs - the last commanded value stands",condition:"template",value_template:"{{ room_fresh and t_target > -900 and t_thermo is not none and state_attr(repeat.item.climate, 'temperature') is not none }}"},{alias:"Compute the commanded setpoint, clamped to the band and the block offset",variables:{smin:`{{ states('${k("steer_min_setpoint",t)}') | float(68) }}`,smax:`{{ states('${k("steer_max_setpoint",t)}') | float(85) }}`,moff:`{{ states('${k("steer_max_offset",t)}') | float(5) }}`,commanded:"{{ [ [ [ [ (t_thermo | float) - (t_room - t_target), (blk_cool | float) - moff ] | max, (blk_cool | float) + moff ] | min, smin ] | max, smax ] | min | round(1) }}"}},{alias:"Skip a write smaller than half a degree",condition:"template",value_template:"{{ (commanded - (state_attr(repeat.item.climate, 'temperature') | float(-999))) | abs >= 0.5 }}"},{alias:"Steer the zone toward the target room",continue_on_error:true,action:"climate.set_temperature",target:{entity_id:"{{ repeat.item.climate }}"},data:{temperature:"{{ commanded }}"}}]}}]}]})}function ms(t,e){return Q({id:O(t,"runtime_learning"),alias:N(t,"runtime_learning"),description:`${X} Nightly EMA update of each zone's runtime-per-cooling-degree-day factor. Skips mild days; first valid day seeds directly.`,mode:"single",triggers:[{trigger:"time",at:"23:58:00",alias:"Nightly close"}],conditions:[],actions:[{alias:"Compute today's cooling degree-days",variables:{cdd:`{{ [ (states('sensor.${t}_outdoor_daily_mean') | float(0)) - (states('${k("cdd_base",t)}') | float(75)), 0 ] | max }}`,alpha:`{{ 2 / ((states('${k("runtime_learn_days",t)}') | float(30)) + 1) }}`}},{alias:"Skip mild days",condition:"template",value_template:"{{ cdd > 0.5 }}"},{alias:"Update k per zone",repeat:{for_each:e.map(s=>({runtime:$("runtime_today",t,s.slug),k:$("k_factor",t,s.slug)})),sequence:[{alias:"Compute the EMA",variables:{runtime_h:"{{ states(repeat.item.runtime) | float(-1) }}",old_k:"{{ states(repeat.item.k) | float(0) }}"}},{alias:"Skip if unavailable",condition:"template",value_template:"{{ runtime_h >= 0 }}"},{alias:"Write the new k",action:"input_number.set_value",target:{entity_id:"{{ repeat.item.k }}"},data:{value:"{{ ((runtime_h / cdd) if old_k == 0 else (alpha * (runtime_h / cdd) + (1 - alpha) * old_k)) | round(2) }}"}}]}}]})}function fs(t){const e="automation."+N(t,"engine").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");return Q({id:O(t,"watchdog"),alias:N(t,"watchdog"),description:`${X} Alerts when the schedule engine automation is off or unavailable for 5 minutes.`,mode:"single",triggers:[{trigger:"state",entity_id:e,to:["off","unavailable"],for:{minutes:5},alias:"Engine down"}],conditions:[],actions:[{alias:"Notify all admins via persistent notification",action:"persistent_notification.create",data:{title:"Climate schedule engine is down",message:"The Climate: schedule engine automation is off or unavailable. Zone schedules are not being applied - your thermostats hold their last setpoints (their own app schedules still work)."}}]})}function _s(t,e){return Q({id:O(t,"runtime_alert"),alias:N(t,"runtime_alert"),description:`${X} Evening check: notifies when a zone's runtime is over the weather-normalized expectation by the alert margin. Uses learned k; silent while learning.`,mode:"single",triggers:[{trigger:"time",at:"20:00:00",alias:"Evening check"}],conditions:[],actions:[{alias:"Check each zone",repeat:{for_each:e.map(s=>({name:s.name,runtime:$("runtime_today",t,s.slug),expected:$("expected_runtime",t,s.slug)})),sequence:[{alias:"Compute exceedance",variables:{run_h:"{{ states(repeat.item.runtime) | float(0) }}",exp_h:"{{ states(repeat.item.expected) | float(0) }}",margin:`{{ states('${k("runtime_alert_margin",t)}') | float(35) }}`}},{alias:"Only alert on a real, learned exceedance",condition:"template",value_template:"{{ exp_h > 0 and run_h > exp_h * (1 + margin / 100) and (run_h - exp_h) > 1 }}"},{alias:"Notify",action:"persistent_notification.create",data:{title:"HVAC running high",message:"{{ repeat.item.name }} has run {{ run_h | round(1) }}h today vs ~{{ exp_h | round(1) }}h expected for this weather. Worth a look (filters, doors, refrigerant)."}}]}}]})}const Ke="mzcs",zt="r1";function se(t){const e=new Set(["thermostat"]),s=new Set,n=[];for(const i of D(t)){if(s.has(i.entity))continue;s.add(i.entity);let a=i.name??i.entity;e.has(a.trim().toLowerCase())&&(a=i.entity),e.add(a.trim().toLowerCase()),n.push({label:a,entity:i.entity,...i.last_seen?{seen:i.last_seen}:{}})}return n}const fn=[{cls:"season_confirm_days",min:1,max:14,step:1,initial:3},{cls:"season_dwell_days",min:1,max:60,step:1,initial:14},{cls:"dev_green_max",min:1,max:10,step:1,initial:2,unit:"\xB0F"},{cls:"dev_amber_max",min:1,max:15,step:1,initial:4,unit:"\xB0F"},{cls:"runtime_alert_margin",min:5,max:100,step:5,initial:35,unit:"%"},{cls:"runtime_alert_days",min:1,max:7,step:1,initial:3},{cls:"runtime_learn_days",min:7,max:60,step:1,initial:30},{cls:"cdd_base",min:60,max:80,step:1,initial:75,unit:"\xB0F"}],_n=[{cls:"override_minutes",min:15,max:240,step:15,initial:60},{cls:"steer_min_setpoint",min:50,max:80,step:1,initial:68},{cls:"steer_max_setpoint",min:70,max:95,step:1,initial:85},{cls:"steer_max_offset",min:1,max:10,step:1,initial:5}];function gn(t){return ln(t.granularity,t.sets)}function yn(t){t.forEach((e,s)=>{if(typeof e?.name=="string")return;const n=e?.key!=null?` (key: ${String(e.key)})`:"";throw new Error(`Season ${s+1}${n} has no name. Every season needs a display name - add \`name: ...\` to it, or configure the card with the visual editor, which requires one.`)})}function bn(t,e){if(e===0)return;const s=new Map;t.forEach((n,i)=>{const a=String(n?.key),o=s.get(a)??[];o.push({s:n,i}),s.set(a,o)});for(const[n,i]of s){if(i.length<2)continue;if(i.every(({s:o})=>o?.key==null||String(o.key).trim()==="")){const[o]=i,c=typeof o.s?.name=="string"&&o.s.name.trim(),r=c?`"${o.s.name}"`:`at position ${o.i+1}`,d=(c?o.s.name.trim().toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""):"")||`season_${o.i+1}`;throw new Error(`${i.length} seasons are missing their required "key", so they would all resolve to the same schedule entity names and collide. The key is the permanent id used in entity names; the display name is only a label and can be renamed freely. Give each season its own key - start with \`key: ${d}\` on season ${r} - or configure the card with the visual editor, which fills keys in for you.`)}throw new Error(`${i.length} seasons share the key "${n}", so their schedule entity names collide. The key is the permanent id used in entity names and must be unique per season; the display name is only a label and can be renamed freely.`)}}function te(t){yn(t.seasons),bn(t.seasons,t.zones.length);const e=[],s=t.prefix,n=s.charAt(0).toUpperCase()+s.slice(1);for(const l of t.zones){t.features.fan_timer&&e.push({id:$("fan_timer",s,l.slug),kind:"helper",spec:{name:`${n} ${l.name} fan`,restore:true}}),e.push({id:$("running_sensor",s,l.slug),kind:"template_sensor",spec:{name:`${n} ${l.name} running`},meta:{source:"hvac_action"}}),e.push({id:$("runtime_today",s,l.slug),kind:"stats_sensor",spec:{name:`${n} ${l.name} runtime today`},meta:{model:"history_stats"}}),e.push({id:$("runtime_mirror",s,l.slug),kind:"template_sensor",spec:{name:`${n} ${l.name} runtime mirror`},meta:{model:"runtime_mirror"}}),e.push({id:$("expected_runtime",s,l.slug),kind:"template_sensor",spec:{name:`${n} ${l.name} expected runtime`},meta:{model:"k_x_cdd"}}),e.push({id:$("applied_block_marker",s,l.slug),kind:"helper",spec:{name:`${n} ${l.name} applied block`}}),e.push({id:$("zone_enabled",s,l.slug),kind:"helper",spec:{name:`${n} ${l.name} enabled`}}),e.push({id:$("k_factor",s,l.slug),kind:"helper",spec:{name:`${n} ${l.name} K`,min:0,max:10,step:.01}}),t.features.steering&&(e.push({id:$("target_room_select",s,l.slug),kind:"helper",spec:{name:`${n} ${l.name} target room`,options:["Thermostat",...(l.rooms??[]).map(u=>u.label)]}}),e.push({id:$("room_override_timer",s,l.slug),kind:"helper",spec:{name:`${n} ${l.name} room override`,restore:true}}),e.push({id:$("steer_target",s,l.slug),kind:"helper",spec:{name:`${n} ${l.name} steer target`,min:50,max:95,step:1}}),e.push({id:$("sensor_schedule",s,l.slug),kind:"schedule",spec:{name:`${n} ${l.name} sensor schedule`}}));for(const u of t.seasons){const p=t.schedules[l.slug]?.[u.key];if(!p)throw new Error(`Missing schedule for ${l.slug}/${u.key}.`);e.push({id:ae(s,l.slug,u.key),kind:"schedule",spec:{name:`${n} ${l.name} ${u.name}`},meta:{week:gn(p)}})}}e.push({id:k("season_select",s),kind:"helper",spec:{name:`${n} season`,options:t.seasons.map(l=>l.name)}}),e.push({id:k("season_mode",s),kind:"helper",spec:{name:`${n} season mode`,options:["Manual","Semi-auto","Full-auto"]}});for(const l of fn)e.push({id:k(l.cls,s),kind:"helper",spec:{name:`${n} ${l.cls.replace(/_/g," ")}`,min:l.min,max:l.max,step:l.step,...l.unit?{unit:l.unit}:{}},meta:{seed:l.initial}});if(t.features.steering)for(const l of _n)e.push({id:k(l.cls,s),kind:"helper",spec:{name:`${n} ${l.cls.replace(/_/g," ")}`,min:l.min,max:l.max,step:l.step},meta:{seed:l.initial}});const i=q(t.features);i&&(e.push({id:k("off_peak_offset",s),kind:"helper",spec:{name:`${n} off peak offset`,min:0,max:10,step:1,unit:"\xB0F"},meta:{seed:i.offsetSeed}}),e.push({id:k("off_peak_paused_on",s),kind:"helper",spec:{name:`${n} off peak paused on`}})),e.push({id:k("next_block_sensor",s),kind:"template_sensor",spec:{name:`${n} next block`}});const a=t.weather_entity?{}:{conditional:true};e.push({id:k("outdoor_temp_sensor",s),kind:"template_sensor",spec:{name:`${n} outdoor temp`},meta:{source:"weather"},...a}),e.push({id:k("outdoor_daily_mean",s),kind:"stats_sensor",spec:{name:`${n} outdoor daily mean`},meta:{model:"statistics_mean"},...a}),e.push({id:k("theme",s),kind:"helper",spec:{name:`${n} theme`}});const o=t.zones.map(l=>({...l,climate:l.climate??`climate.${l.slug}`})),c=un(s,o,t.seasons,t.features.fan_guard,G(t.features),i?.entity??null,t.features.steering),r=(l,u)=>{const p=O(s,l);return{id:`automation:${p}`,kind:"automation",spec:{alias:N(s,l,u),sig:c[p]??zt}}};if(e.push(r("engine")),e.push(r("watchdog")),e.push(r("runtime_learning")),t.features.anomaly_alerts&&e.push(r("runtime_alert")),t.features.fan_timer)for(const l of t.zones){const u=O(s,`fan_timer_${l.slug}`);e.push({id:`automation:${u}`,kind:"automation",spec:{alias:N(s,"fan_timer",l.name),sig:c[u]??zt}})}t.features.steering&&e.push(r("steering"));const d=new Set;for(const l of e){if(d.has(l.id))throw new Error(`Naming collision: two configured objects both resolve to "${l.id}". Rename the conflicting zone or season.`);d.add(l.id)}return e}function vn(t,e){return de(t)===de(e)}function K(t,e){const s={create:[],adopt:[],update:[],delete:[],noop:[]},n=new Map(e.map(a=>[a.id,a])),i=new Set(t.map(a=>a.id));for(const a of t){const o=n.get(a.id);if(o)o.managed?vn(o.spec,a.spec)?s.noop.push({op:"noop",id:a.id,kind:a.kind}):s.update.push({op:"update",id:a.id,kind:a.kind,spec:a.spec,from:o.spec}):s.adopt.push({op:"adopt",id:a.id,kind:a.kind,spec:a.spec});else{if(a.conditional)continue;s.create.push({op:"create",id:a.id,kind:a.kind,spec:a.spec,...a.meta?{meta:a.meta}:{}})}}for(const a of e)a.managed&&!i.has(a.id)&&s.delete.push({op:"delete",id:a.id,kind:a.kind});return s}function $n(t){return[...t.create,...t.adopt,...t.update,...t.delete]}const wn=Object.freeze([Object.freeze({key:"summer",name:"Summer",default_mode:"cool"}),Object.freeze({key:"winter",name:"Winter",default_mode:"heat_cool"})]);function ze(){return wn.map(t=>({...t}))}function xn(t,e,s){const n=t.features?.steering===true;return{prefix:t.prefix??"climate",zones:t.zones.map(i=>({slug:s(i.name),name:i.name,climate:i.entity,...n?{rooms:se(i.room_sensors)}:{}})),seasons:t.seasons??ze(),schedules:e,features:{fan_timer:(t.features?.fan_timer?.length??3)>0,anomaly_alerts:t.features?.anomaly_alerts??true,steering:n,fan_guard:t.features?.fan_guard,eco_preset:t.features?.eco_preset,off_peak_entity:t.features?.off_peak_entity,off_peak_offset:t.features?.off_peak_offset},weather_entity:t.weather_entity}}const Ze="climate",kn=["cool","heat","heat_cool","off"],Sn=["manual","semi","full"];function At(t,e){return typeof t=="string"&&e.includes(t)?t:"<invalid>"}function En(t){if(!t)return"unknown";const e=a=>a.test(t),s=e(/\bEdg\//)?"Edge":e(/\bOPR\//)?"Opera":e(/\bFirefox\//)?"Firefox":e(/\bChrome\//)?"Chrome":e(/\bSafari\//)?"Safari":"other browser",n=e(/Android/)?"Android":e(/iPhone|iPad|iPod/)?"iOS":e(/Windows/)?"Windows":e(/Macintosh|Mac OS/)?"macOS":e(/Linux/)?"Linux":"unknown platform",i=e(/HomeAssistant/)?" (HA companion app)":"";return s+" on "+n+i}function zn(t){const e={};for(const s of t)e[s]=(e[s]??0)+1;return e}function An(t,e){return e?t:t===Ze?Ze:"<custom>"}function Tn(t,e){return t?t==="unknown"||t==="unavailable"||t==="none"||e?t:"set":"not read"}function Cn(t,e){if(t.eco_preset===false)return"disabled";const s=G(t)??"eco";return e?s:s==="eco"?"eco (default)":"<custom>"}function Rn(t){const e=t.identifiers===true;let s=t.config,n;try{s=ot(t.config)}catch(l){n=l instanceof Error?l.message:String(l)}const i=typeof s.prefix=="string"&&s.prefix.trim()||Ze,a=Array.isArray(s.seasons)?s.seasons:s.seasons==null?ze():[],o=s.features??{},c=(s.zones??[]).map((l,u)=>{const p=D(l.room_sensors);return{name:e?l.name:`Zone ${u+1}`,climate:e?l.entity:`climate.<zone_${u+1}>`,room_sensors:e?p.map(f=>({entity:f.entity,...f.name?{name:f.name}:{},...f.last_seen?{last_seen:f.last_seen}:{}})):p.map((f,x)=>({entity:`sensor.<zone_${u+1}_room_${x+1}>`,...f.last_seen?{last_seen:`sensor.<zone_${u+1}_room_${x+1}_last_seen>`}:{}})),room_sensor_count:p.length,room_sensors_labelled:p.filter(f=>!!f.name?.trim()).length,room_sensors_with_last_seen:p.filter(f=>!!f.last_seen).length}}),r=(t.zoneEnabled??[]).map((l,u)=>({zone:e?l.zone:`Zone ${(l.index??u)+1}`,scheduling:l.state})),d={card_version:t.cardVersion,ha_version:t.haVersion??"unknown",identifiers_included:e,user_agent:En(t.userAgent),...n?{config_rejected:n}:{},config:{prefix:An(i,e),zone_count:c.length,zones:c,seasons_defaulted:s.seasons==null,seasons:a.filter(l=>l!=null).map((l,u)=>{const p=typeof l.name=="string"?l.name:"";return{name:e?p:`Season ${u+1}`,key_matches_name_slug:l.key===p.trim().toLowerCase().replace(/[^a-z0-9]+/g,"_"),default_mode:At(l.default_mode,kn)}}),active_season:Tn(t.activeSeason,e),weather_entity:e?s.weather_entity??null:s.weather_entity?"set":null,season_switch:s.season_switch===void 0?"manual":At(s.season_switch,Sn),features:{fan_timer:Array.isArray(o.fan_timer)?o.fan_timer.filter(l=>typeof l=="number"&&Number.isFinite(l)):null,anomaly_alerts:o.anomaly_alerts!==false,fan_guard:e?o.fan_guard??null:o.fan_guard?"set":null,eco_preset:Cn(o,e)},display:{configured:s.display!=null,...ie(s.display)}},scheduling_switches:r.length?r:"not read",last_dry_run:t.plan?{kind:t.planKind??"setup",create:t.plan.create,adopt:t.plan.adopt,update:t.plan.update,delete:t.plan.delete,unchanged:t.plan.noop,settled:t.plan.create+t.plan.adopt+t.plan.update+t.plan.delete===0,...s.weather_entity?{}:{note:"no weather entity: outdoor sensors not provisioned, CDD learning off"}}:"not run",managed_objects:t.objectStatuses?{total:t.objectStatuses.length,by_status:zn(t.objectStatuses)}:"not loaded"};return JSON.stringify(d,null,2)}function Me(t){if(!Number.isFinite(t)||t<0)return"";const e=Math.floor(t/1e3);if(e<60)return"now";const s=Math.floor(e/60);if(s<60)return`${s}m`;const n=Math.floor(s/60);return n<24?`${n}h`:`${Math.floor(n/24)}d`}function On(t,e,s){return e===void 0||t==="off"?false:t==="always"?true:e>=s}function Mn(t,e){return t!==void 0&&t>=e}function Dn(t){return/_temperature$/.test(t)?t.replace(/_temperature$/,"_last_seen"):null}function gs(t,e){const s=Dn(e);if(!s)return null;const n=t.states[s];return!n||n.attributes.device_class!=="timestamp"||n.state==="unavailable"||n.state==="unknown"||!n.state?null:s}function ys(t,e,s=new Set){const n=[];return t.forEach((i,a)=>{for(const o of D(i.room_sensors)){if(o.last_seen||s.has(o.entity))continue;const c=gs(e,o.entity);c&&n.push({zoneIndex:a,sensorEntity:o.entity,lastSeen:c})}}),n}function In(t,e,s,n=new Set){const i=new Set(e.map(o=>`${o.sensorEntity}|${o.lastSeen}`)),a=ys(t,s,n).filter(o=>i.has(`${o.sensorEntity}|${o.lastSeen}`));return a.length===0?t:t.map((o,c)=>{const r=a.filter(l=>l.zoneIndex===c);if(r.length===0)return o;let d=o.room_sensors;for(const l of r)d=bs(d,l.sensorEntity,l.lastSeen);return{...o,room_sensors:d}})}function bs(t,e,s){return(t??[]).map(n=>{if(n==null||typeof n!="string"&&typeof n.entity!="string")return n;const i=typeof n=="string"?{entity:n}:n;return i.entity!==e?n:Be({...i,last_seen:s??void 0})})}function vs(t,e,s,n="on",i=6e4){const a=[...t].sort((l,u)=>l.t-u.t),o=[];let c="off";for(const l of a)if(l.t<=e)c=l.state;else break;let r=c===n?e:null;for(const l of a){if(l.t<=e||l.t>=s)continue;const u=l.state===n;u&&r==null&&(r=l.t),!u&&r!=null&&(o.push({start:r,end:l.t}),r=null)}r!=null&&o.push({start:r,end:s});const d=[];for(const l of o){const u=d[d.length-1];u&&l.start-u.end<=i?u.end=l.end:d.push({...l})}return d}function Nn(t){return t.reduce((e,s)=>e+(s.end-s.start),0)}function Ln(t){const e=[...t].sort((n,i)=>n.t-i.t),s=[];for(const n of e){const i=Number(n.state);if(!Number.isFinite(i))continue;const a=s[s.length-1];(!a||a.value!==i)&&s.push({t:n.t,value:i})}return s}function Tt(t){if(!Number.isFinite(t)||t<0)return"\u2013";const e=Math.round(t*4)/4,s=Math.floor(e),n=e-s,i=n===.25?"\xBC":n===.5?"\xBD":n===.75?"\xBE":"";return s===0&&i?`${i} hr`:`${s}${i} hr`}function Pn(t,e,s){const n=s-e;return{left:(t.start-e)/n*100,width:(t.end-t.start)/n*100}}function jn(t,e,s,n="on"){const i=t.length?Math.min(...t.map(o=>o.t)):1/0,a=[];for(let o=e-1;o>=0;o--){const c=new Date(s);c.setHours(0,0,0,0),c.setDate(c.getDate()-o);const r=c.getTime();c.setDate(c.getDate()+1);const d=Math.min(c.getTime(),s);if(d<=r)continue;if(i>=d){a.push({day:r,hours:0,coverage:"none"});continue}const l=Nn(vs(t,r,d,n))/36e5;a.push({day:r,hours:l,coverage:i>r?"partial":"complete"})}return a}const Wn=new Set(["climate.set_temperature","climate.set_hvac_mode","climate.turn_on","climate.turn_off","climate.toggle","homeassistant.turn_on","homeassistant.turn_off","homeassistant.toggle"]),Hn=new Set(["climate.set_preset_mode","climate.set_fan_mode"]),Fn="(templated service)";function dt(t){return t.includes("{{")||t.includes("{%")}function Un(t){const e=typeof t.action=="string"?t.action:typeof t.service=="string"?t.service:typeof t.service_template=="string"?t.service_template:null;if(e==null)return null;if("service_template"in t||dt(e)){const n=e.slice(0,e.search(/\{[{%]/)>=0?e.search(/\{[{%]/):e.length);return{service:null,templated:true,domain:(n.includes(".")?n.slice(0,n.indexOf(".")).trim().toLowerCase():null)||null}}const s=e.trim().toLowerCase();return s?{service:s,templated:false,domain:s.split(".")[0]??null}:null}function Bn(t){return typeof t.device_id!="string"||typeof t.domain!="string"||typeof t.type!="string"||typeof t.platform=="string"||typeof t.condition=="string"||typeof t.trigger=="string"?null:`${t.domain}.${t.type}`.trim().toLowerCase()}function W(t,e,s){if(typeof t=="string"){if(dt(t)){s.templated=true;return}if(t.includes(",")){for(const i of t.split(","))W(i,e,s);return}const n=t.trim();if(!n||n==="none")return;if(n==="all"){s.all=true;return}e.push(n);return}if(Array.isArray(t))for(const n of t)W(n,e,s)}function Ct(t){const e={all:false,templated:false},s=[],n=[],i=[],a=[],o=[],c=[t.target,t.data,t.data_template,t];for(const r of c){if(typeof r=="string"&&dt(r)){e.templated=true;continue}if(!r||typeof r!="object"||Array.isArray(r))continue;const d=r;W(d.entity_id,s,e),W(d.area_id,n,e),W(d.device_id,i,e),W(d.label_id,a,e),W(d.floor_id,o,e)}return{entityIds:[...new Set(s)],areaIds:[...new Set(n)],deviceIds:[...new Set(i)],labelIds:[...new Set(a)],floorIds:[...new Set(o)],all:e.all,templated:e.templated}}const $s=100;function qe(t,e=0,s=[]){if(e>$s||t==null||typeof t!="object")return s;if(Array.isArray(t)){for(const a of t)qe(a,e+1,s);return s}const n=t,i=Un(n);if(i)s.push({service:i.service,serviceTemplated:i.templated,serviceDomain:i.domain,target:Ct(n)});else{const a=Bn(n);a&&s.push({service:a,serviceTemplated:false,serviceDomain:a.split(".")[0]??null,target:Ct(n)})}for(const a in n)qe(n[a],e+1,s);return s}function Kn(t,e,s,n){return typeof t=="string"&&t.startsWith(`${s}_mzcs_`)&&e.includes(n)}const Zn=new Set(["climate","homeassistant"]);function qn(t){if(t.service==null){const e=t.serviceDomain;return e==null||Zn.has(e)?"conflict":null}return Wn.has(t.service)?"conflict":Hn.has(t.service)?"note":null}function Gn(t,e){return t.entityIds.includes(e.entityId)||e.registryId&&t.entityIds.includes(e.registryId)?"entity":t.all?"all":e.areaId&&t.areaIds.includes(e.areaId)?"area":e.deviceId&&t.deviceIds.includes(e.deviceId)?"device":(e.labels??[]).some(s=>t.labelIds.includes(s))?"label":null}function Vn(t,e){const s=t.target,n=[];for(const i of e){const a=Gn(s,i);a&&n.push({zone:i,via:a,confidence:"certain"})}return n.length===0&&(s.templated?n.push({zone:null,via:"template",confidence:"possible"}):s.floorIds.length>0?n.push({zone:null,via:"floor",confidence:"possible"}):s.entityIds.some(i=>i.startsWith("group."))?n.push({zone:null,via:"group",confidence:"possible"}):t.serviceTemplated&&n.push({zone:null,via:"template",confidence:"possible"})),n}function ws(t){return t!=null&&typeof t=="object"&&!Array.isArray(t)&&"use_blueprint"in t}function Ge(t,e=[],s=0){if(s>$s||t==null)return e;if(typeof t=="string")return e.push(t),e;if(Array.isArray(t)){for(const n of t)Ge(n,e,s+1);return e}if(typeof t=="object"){const n=t;for(const i in n)Ge(n[i],e,s+1)}return e}function Yn(t,e){const s=[],n=new Set,i=a=>{const o=a.sourceId+"|"+a.service+"|"+a.zoneEntityId+"|"+a.via;n.has(o)||(n.add(o),s.push(a))};for(const a of t){if(ws(a.config)){const o=Ge(a.config.use_blueprint);for(const c of e)(o.includes(c.entityId)||c.registryId!=null&&o.includes(c.registryId))&&i({sourceId:a.id,sourceName:a.name,sourceKind:a.kind,service:"(blueprint)",zoneEntityId:c.entityId,zoneName:c.name,severity:"conflict",confidence:"possible",via:"blueprint",sourceEnabled:a.enabled});continue}for(const o of qe(a.config)){const c=qn(o);if(c)for(const r of Vn(o,e)){const d=o.serviceTemplated||r.confidence==="possible"?"possible":"certain";i({sourceId:a.id,sourceName:a.name,sourceKind:a.kind,service:o.service??Fn,zoneEntityId:r.zone?.entityId??null,zoneName:r.zone?.name??null,severity:c,confidence:d,via:r.via,sourceEnabled:a.enabled})}}}return s}function Jn(t,e,s){const n=Yn(t,e),i=t.filter(a=>ws(a.config)).length;return{...s,scanned:t.length-i,blueprints:i,conflicts:n.filter(a=>a.severity==="conflict"),notes:n.filter(a=>a.severity==="note")}}function Rt(t,e){const s=t.states[e];if(!s||s.state==="unavailable"||s.state==="unknown")return{available:false,mode:"unavailable",action:"",setpoint:null,targetLow:null,targetHigh:null,inside:null,humidity:null};const n=s.attributes,i=a=>typeof a=="number"?a:null;return{available:true,mode:s.state,action:typeof n.hvac_action=="string"?n.hvac_action:"",setpoint:i(n.temperature),targetLow:i(n.target_temp_low),targetHigh:i(n.target_temp_high),inside:i(n.current_temperature),humidity:i(n.current_humidity)}}function Xn(t,e){return t.states[e]?.state==="active"}function R(t,e){return t.states[e]!==void 0}function Qn(t,e){const s=t.states[e]?.attributes.hvac_modes;return Array.isArray(s)?s.filter(n=>typeof n=="string"):[]}function ei(t,e,s="eco"){const n=t.states[e]?.attributes.preset_modes;return Array.isArray(n)&&n.includes(s)}function Ot(t,e,s="eco"){return t.states[e]?.attributes.preset_mode===s}function De(t,e){const s=t.states[e];if(!s)return null;const n=Number(s.state);return Number.isFinite(n)?n:null}const ti=os*60*60*1e3;function si(t,e){let s=0;for(const n of e){const i=t.states[n],a=i?.last_reported??i?.last_updated,o=a?Date.parse(a):NaN;Number.isFinite(o)&&o>s&&(s=o)}return s>0?s:Date.now()}const ni=/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?([Zz]|[+-]\d{2}:?\d{2})$/,ii=300*1e3;function ai(t,e,s=Date.now(),n){const i=t.states[e],a=typeof i?.attributes.friendly_name=="string"?i.attributes.friendly_name.replace(/ (Temperature|temperature)$/,""):e.split(".")[1]??e,o=i?Number(i.state):NaN,c=n?.staleMs??ti,r=n?.lastSeenEntity?t.states[n.lastSeenEntity]:void 0,d=r?.state&&ni.test(r.state)?Date.parse(r.state):NaN,l=Number.isFinite(d)&&d-s<=ii?d:NaN;let u;Number.isFinite(l)&&(u=Math.max(0,s-l));const p=i?.last_reported??i?.last_updated,f=p?Date.parse(p):NaN,x=Number.isFinite(l)&&s-l>c||Number.isFinite(f)&&s-f>c;return{entityId:e,name:a,temp:Number.isFinite(o)?o:null,stale:x,...u!==void 0?{ageMs:u}:{}}}function oi(t,e,s){return t.callService("climate","set_hvac_mode",{entity_id:e,hvac_mode:s})}function ri(t,e,s,n="eco"){return t.callService("climate","set_preset_mode",{entity_id:e,preset_mode:s?n:"none"})}function ci(t,e){const s=t.states[e]?.attributes.fan_modes;return Array.isArray(s)&&s.includes("on")}async function li(t,e,s,n){ci(t,e)&&await t.callService("climate","set_fan_mode",{entity_id:e,fan_mode:"on"});const i=String(n%60).padStart(2,"0"),a=String(Math.floor(n/60)).padStart(2,"0");await t.callService("timer","start",{entity_id:s,duration:`${a}:${i}:00`})}function di(t,e,s,n){const i=typeof s=="number"?s:null,a=typeof n=="number"?n:null;return i!=null&&a!=null&&i<a&&e!=null&&e>=i&&e<=a?Math.min(a,Math.max(i,t)):t}const xs=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];async function Mt(t,e){if(!t.callWS)return null;const s=e.split(".")[1];try{const i=(await t.callWS({type:"schedule/list"})).find(o=>o.id===s);if(!i)return null;const a={};for(const o of xs)i[o]&&(a[o]=i[o]);return{id:String(i.id),name:typeof i.name=="string"?i.name:void 0,week:a}}catch{return null}}function Dt(t,e,s,n){if(!t.callWS)return Promise.reject(new Error("callWS unavailable"));const a={type:"schedule/update",schedule_id:e.split(".")[1],name:n};for(const o of xs)a[o]=s[o]??[];return t.callWS(a)}function pi(t,e,s){return t.callService("input_number","set_value",{entity_id:e,value:s})}function ui(t,e,s){return t.callService("input_select","select_option",{entity_id:e,option:s})}async function It(t,e,s,n){if(n)try{await t.callService("input_text","set_value",{entity_id:s,value:""})}catch{}await t.callService("input_boolean",n?"turn_on":"turn_off",{entity_id:e})}function ks(t,e){const s=[];for(const n of t){if(typeof n.lu!="number")continue;const i=n.lu*1e3;if(e){const a=n.a?.[e];if(a==null)continue;s.push({t:i,state:String(a)})}else typeof n.s=="string"&&s.push({t:i,state:n.s})}return s}async function Nt(t,e,s,n,i){if(!t.callWS)return{ok:false,error:"This Home Assistant connection cannot read history."};try{const a=await t.callWS({type:"history/history_during_period",start_time:new Date(s).toISOString(),end_time:new Date(n).toISOString(),entity_ids:[e],minimal_response:!i,no_attributes:!i,significant_changes_only:false});return{ok:true,rows:ks(a?.[e]??[],i)}}catch(a){return{ok:false,error:H(a)}}}async function hi(t,e,s,n=Date.now()){if(!t.callWS)return{ok:false,error:"This Home Assistant connection cannot read history."};const i=new Date(n);i.setHours(0,0,0,0),i.setDate(i.getDate()-(s-1));try{const a=await t.callWS({type:"history/history_during_period",start_time:i.toISOString(),end_time:new Date(n).toISOString(),entity_ids:[e],minimal_response:true,no_attributes:true,significant_changes_only:false}),o=ks(a?.[e]??[]);return{ok:true,rows:jn(o,s,n)}}catch(a){return{ok:false,error:H(a)}}}function H(t){try{return mi(t)}catch{return"Home Assistant gave no reason."}}function mi(t){if(t instanceof Error&&t.message)return t.message;if(t&&typeof t=="object"){const e=t;if(typeof e.message=="string"&&e.message)return e.message;if(e.message!=null&&String(e.message))return String(e.message);if(e.code!=null)return Lt(e.code)}return(typeof t=="number"||typeof t=="string")&&String(t)?Lt(t):"Home Assistant gave no reason."}function Lt(t){const e=String(t);return/connection|closed|lost|3/i.test(e)?`The connection to Home Assistant dropped (${e}).`:`Home Assistant reported error ${e}.`}async function fi(t,e,s){await t.callService("input_text","set_value",{entity_id:e,value:""}),await t.callService("automation","trigger",{entity_id:s})}function _i(t,e,s){return t.callService("climate","set_temperature",{entity_id:e,temperature:s})}const Pt=500,gi=6;async function yi(t,e,s){const n=new Array(t.length);let i=0;const a=async()=>{for(;;){const o=i++;if(o>=t.length)return;n[o]=await s(t[o])}};return await Promise.all(Array.from({length:Math.min(e,t.length)},a)),n}async function bi(t,e){const s=new Map;if(e.length===0)return s;if(!t.callWS)throw new Error("This Home Assistant connection cannot read the entity registry, so the conflict check could not run.");const n=await t.callWS({type:"config/entity_registry/get_entries",entity_ids:e});for(const[i,a]of Object.entries(n??{}))a&&s.set(i,a);return s}async function vi(t,e,s){const n=e.some(c=>{const r=s.get(c.entity);return!!r&&!r.area_id&&!!r.device_id});let i=false,a=new Map;if(n&&t.callWS)try{const c=await t.callWS({type:"config/device_registry/list"});for(const r of c??[])r?.id&&a.set(r.id,r.area_id??null)}catch{a=new Map,i=true}return{refs:e.map(c=>{const r=s.get(c.entity),d=r?.area_id??(r?.device_id?a.get(r.device_id)??null:null);return{entityId:c.entity,name:c.name,areaId:d,deviceId:r?.device_id??null,registryId:r?.id??null,labels:r?.labels??[]}}),degraded:i}}async function $i(t,e,s,n){if(!t.callApi)throw new Error("This Home Assistant connection cannot read automation configurations, so the conflict check could not run.");const i=[],a=new Map;for(const _ in t.states){const z=t.states[_];if(!z)continue;const g=String(z.attributes.friendly_name??_);if(_.startsWith("automation.")){const v=z.attributes.id;a.set(_,v),i.push({entityId:_,name:g,kind:"automation",path:typeof v=="string"&&v?`config/automation/config/${v}`:null})}else if(_.startsWith("script.")){const v=_.slice(7);i.push({entityId:_,name:g,kind:"script",path:v?`config/script/config/${v}`:null})}}const o=await bi(t,[...n.map(_=>_.entity),...i.filter(_=>_.kind==="automation").map(_=>_.entityId)]),{refs:c,degraded:r}=await vi(t,n,o);let d=0;const l=[];for(const _ of i){if(_.kind==="automation"&&Kn(a.get(_.entityId),o.get(_.entityId)?.labels??[],e,s)){d++;continue}l.push(_)}const u=l.length>Pt,p=u?l.slice(0,Pt):l;let f=0;const x=await yi(p,gi,async _=>{if(!_.path)return null;try{const z=await t.callApi("GET",_.path),g=t.states[_.entityId]?.state,v=_.kind==="automation"?g==="on"?true:g==="off"?false:void 0:void 0;return{id:_.entityId,name:_.name,kind:_.kind,enabled:v,config:z}}catch{return null}}),S=[];for(const _ of x)_?S.push(_):f++;return Jn(S,c,{unreadable:f,skippedOwn:d,capped:u,degraded:r})}function wi(t,e,s,n){if(!Number.isFinite(e)||e<=0)return{status:"learning",label:"learning"};if(n<6)return{status:"pending",label:""};const i=e*(Math.min(n,24)/24),a=i*(1+s/100);return t>a&&t-i>.5?{status:"high",label:"running high for the weather"}:{status:"normal",label:"normal for the weather"}}const pt={accent:"#1e88e5",accentBright:"#42a5f5",good:"#2bb673",warn:"#f59e0b",bad:"#e5484d",bg:"#1c262e",surface:"#243039",chip:"#2b3844",track:"#16202a",border:"#3d4a55",text:"#e8edf1",textDim:"#9fb0bd"},Ve={cobalt:{label:"Cobalt",tokens:pt},ember:{label:"Ember",tokens:{accent:"#f4511e",accentBright:"#ff7043",good:"#66bb6a",warn:"#ffb300",bad:"#d32f2f",bg:"#241c18",surface:"#2f2521",chip:"#3a2d27",track:"#1a1310",border:"#54413a",text:"#f2e9e4",textDim:"#b8a69b"}},forest:{label:"Forest",tokens:{accent:"#43a047",accentBright:"#66bb6a",good:"#9ccc65",warn:"#ffa000",bad:"#e53935",bg:"#18211b",surface:"#212d25",chip:"#2a382e",track:"#111813",border:"#3d4f43",text:"#e6efe8",textDim:"#9fb3a5"}},orchid:{label:"Orchid",tokens:{accent:"#7e57c2",accentBright:"#9575cd",good:"#26a69a",warn:"#ffb300",bad:"#ec407a",bg:"#1f1b2a",surface:"#292336",chip:"#342c44",track:"#161221",border:"#4a4060",text:"#eae6f2",textDim:"#a89fbd"}},"ha-default":{label:"HA Default",tokens:{accent:"var(--primary-color, #03a9f4)",accentBright:"var(--light-primary-color, var(--primary-color, #03a9f4))",good:"var(--success-color, #2bb673)",warn:"var(--warning-color, #f59e0b)",bad:"var(--error-color, #e5484d)",bg:"var(--ha-card-background, var(--card-background-color, #fff))",surface:"var(--secondary-background-color, #f0f0f0)",chip:"var(--secondary-background-color, #f0f0f0)",track:"var(--divider-color, #e0e0e0)",border:"var(--divider-color, #e0e0e0)",text:"var(--primary-text-color, #212121)",textDim:"var(--secondary-text-color, #727272)"}}},Ie="cobalt",Ye=/^#[0-9a-f]{6}$/i,xe=["accent","accentBright","good","warn","bad","bg","surface","chip","track","border","text","textDim"];function jt(t){return`custom:${xe.map(e=>t[e]).join(",")}`}function xi(t){return xe.every(s=>Ye.test(t[s]))?{...t}:{...pt}}function Wt(t){const e={presetKey:Ie,tokens:Ve[Ie].tokens};if(!t)return e;const s=t==="nest-blue"?Ie:t,n=Ve[s];if(n)return{presetKey:s,tokens:n.tokens};if(t.startsWith("custom:")){const i=t.slice(7).split(",");if(i.length===5&&i.every(a=>Ye.test(a.trim()))){const[a,o,c,r,d]=i.map(l=>l.trim().toLowerCase());return{presetKey:"custom",tokens:{...pt,accent:a,accentBright:o,good:c,warn:r,bad:d}}}if(i.length===xe.length&&i.every(a=>Ye.test(a.trim())))return{presetKey:"custom",tokens:Object.fromEntries(xe.map((o,c)=>[o,i[c].trim().toLowerCase()]))}}return e}const be=t=>B(t);function B(t){const e=t.data;return{time:t.from.slice(0,5),name:e.block??"?",mode:e.mode??"cool",cool_temp:e.cool_temp??null,heat_temp:e.heat_temp??null}}function ki(t,e){const s=B(t),n=B(e);return s.name===n.name&&s.mode===n.mode&&s.cool_temp===n.cool_temp&&s.heat_temp===n.heat_temp}function Ne(t){if(t.length===0)return[];const e=[...t].sort((o,c)=>o.from.localeCompare(c.from)),s=e[0],n=e[e.length-1];return(e.length>1&&s.from==="00:00:00"&&ki(s,n)?e.slice(1):e).map(B)}function Si(t){return JSON.stringify([...t].sort((e,s)=>e.from.localeCompare(s.from)).map(e=>[e.from,e.to,B(e)]))}const Ht=["monday","tuesday","wednesday","thursday","friday"],Ft=["saturday","sunday"];function Ut(t){const e=M.map(o=>Si(t[o]??[])),s=o=>e[M.indexOf(o)];if(e.every(o=>o===e[0]))return{granularity:"all",sets:{all:[...M]}};const i=Ht.every(o=>s(o)===s("monday")),a=Ft.every(o=>s(o)===s("saturday"));return i&&a?{granularity:"wdwe",sets:{wd:[...Ht],we:[...Ft]}}:{granularity:"days",sets:Object.fromEntries(M.map(o=>[o,[o]]))}}const Bt=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];function Ei(t){return`${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`}function zi(t,e){return t.name===e.name&&t.mode===e.mode&&t.cool_temp===e.cool_temp&&t.heat_temp===e.heat_temp}function Ai(t,e){const s=e.getDay(),n=e.getHours()*60+e.getMinutes(),i=`${Ei(e)}:00`,a=new Map,o=r=>{const d=((s+r)%7+7)%7;let l=a.get(d);return l||(l=[...t[Bt[d]]??[]].sort((u,p)=>u.from.localeCompare(p.from)),a.set(d,l)),l},c=r=>{for(let d=1;d<=7;d++){const l=o(r-d);if(l.length)return be(l[l.length-1])}return null};for(let r=0;r<=7;r++){const d=o(r);for(let l=0;l<d.length;l++){const u=d[l];if(r===0&&u.from<=i)continue;if(r===7&&u.from>i)break;const p=l>0?be(d[l-1]):c(r),f=be(u);if(p&&zi(p,f))continue;const[x,S]=u.from.slice(0,5).split(":").map(Number),_=r*1440+(x*60+S)-n;if(_<=0)continue;const z=Bt[(s+r)%7];return{...f,day:z,minutesUntil:_}}}return null}function Ti(t){for(const e of M){const s=[...t[e]??[]].sort((n,i)=>n.from.localeCompare(i.from));if(s.length===0||s[0].from!=="00:00:00")return true;for(let n=1;n<s.length;n++)if(s[n].from!==s[n-1].to)return true;if(s[s.length-1].to!=="24:00:00")return true}return false}function Ci(t){const e=[...t].sort((i,a)=>i.from.localeCompare(a.from)),s=[];let n=0;for(const i of e){const a=I(i.from.slice(0,5)),o=i.to==="24:00:00"?1440:I(i.to.slice(0,5));a>n&&s.push({block:null,fromMin:n,toMin:a}),s.push({block:be(i),fromMin:a,toMin:o}),n=o}return n<1440&&s.push({block:null,fromMin:n,toMin:1440}),s}function Ss(t,e,s){const n={};for(const i of M){const a=t[i];a&&(n[i]=e.includes(i)?Oi(s):a)}return n}function I(t){const[e,s]=t.split(":").map(Number);return(e??0)*60+(s??0)}function Kt(t){const e=Math.max(0,Math.min(1425,t));return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function Ri(t){if(t.length===0)return[];const e=[...t].sort((i,a)=>i.time.localeCompare(a.time)),s=[],n=I(e[0].time);return n>0&&s.push({block:e[e.length-1],fromMin:0,toMin:n,wrap:true}),e.forEach((i,a)=>{s.push({block:i,fromMin:I(i.time),toMin:a<e.length-1?I(e[a+1].time):1440,wrap:false})}),s}function Oi(t){const e=[...t].sort((o,c)=>o.time.localeCompare(c.time));if(e.length===0)return[];const s=e[0],n=e[e.length-1],i=o=>({block:o.name,mode:o.mode,...o.cool_temp!=null?{cool_temp:o.cool_temp}:{},...o.heat_temp!=null?{heat_temp:o.heat_temp}:{}});if(e.length===1)return[{from:"00:00:00",to:"24:00:00",data:i(s)}];const a=[];s.time!=="00:00"&&a.push({from:"00:00:00",to:`${s.time}:00`,data:i(n)});for(let o=0;o<e.length;o++){const c=e[o],r=e[o+1];a.push({from:`${c.time}:00`,to:r?`${r.time}:00`:"24:00:00",data:i(c)})}return a}function Le(t,e,s){if(s.size===0)return false;let n=t;for(const[i,a]of Object.entries(e.sets)){const o=s.get(i);o&&(n=Ss(n,a,o))}return!Mi(n,t)}function Mi(t,e){for(const s of M){const n=t[s]??[],i=e[s]??[];if(n.length!==i.length)return false;for(let a=0;a<n.length;a++){const o=n[a],c=i[a];if(o.from!==c.from||o.to!==c.to)return false;const r=B(o),d=B(c);if(r.time!==d.time||(r.name??"")!==(d.name??"")||(r.mode??null)!==(d.mode??null)||(r.cool_temp??null)!==(d.cool_temp??null)||(r.heat_temp??null)!==(d.heat_temp??null))return false}}return true}const Es=2,zs=4;function Di(t,e=Es,s=zs){const n=Math.abs(t);return n<=e?"green":n<=s?"amber":"red"}function Pe(t){const e=Math.round(t*10)/10;return Number.isInteger(e)?String(e):e.toFixed(1)}function Ii(t){const e=Math.round(t);return`${e>0?"+":""}${e}\xB0`}function Ni(t,e){let s=t!=null&&t>0?t:Es,n=e!=null&&e>0?e:zs;return n<=s&&(n=s+1),{greenMax:s,amberMax:n}}function Li(t){const e=t.default_mode;return{granularity:"all",sets:{all:[{time:"06:00",name:"Day",mode:e,cool_temp:e==="heat"?null:e==="heat_cool"?84:78,heat_temp:e==="heat"?68:e==="heat_cool"?66:null}]}}}function Pi(t,e){const s={};for(const n of t){s[n]={};for(const i of e)s[n][i.key]=Li(i)}return s}const ji={fan_timer:"helper",room_override_timer:"helper",target_room_select:"helper",steer_target:"helper",applied_block_marker:"helper",zone_enabled:"helper",theme:"helper",k_factor:"helper",season_select:"helper",season_mode:"helper",season_confirm_days:"helper",season_dwell_days:"helper",dev_green_max:"helper",dev_amber_max:"helper",runtime_alert_margin:"helper",runtime_alert_days:"helper",runtime_learn_days:"helper",cdd_base:"helper",override_minutes:"helper",steer_min_setpoint:"helper",steer_max_setpoint:"helper",steer_max_offset:"helper",off_peak_offset:"helper",off_peak_paused_on:"helper",running_sensor:"template_sensor",runtime_mirror:"template_sensor",expected_runtime:"template_sensor",next_block_sensor:"template_sensor",outdoor_temp_sensor:"template_sensor",outdoor_daily_mean:"stats_sensor",runtime_today:"stats_sensor",zone_schedule:"schedule",sensor_schedule:"schedule"};async function _e(t,e){if(!t.callWS)return[];try{const s=await t.callWS({type:`${e}/list`});return Array.isArray(s)?s:[]}catch(s){throw new Error(`Could not read the ${e} list from Home Assistant: ${s instanceof Error?s.message:String(s)}`)}}async function Zt(t,e){const s=new Map;if(!t.callWS||e.length===0)return s;try{const n=await t.callWS({type:"config/entity_registry/get_entries",entity_ids:e});for(const[i,a]of Object.entries(n??{}))a?.labels&&s.set(i,a.labels)}catch{}return s}async function Wi(t,e,s,n){const i=[],a=new Set;for(const g in t.states){const v=lt(g,e,s,n);if(!v)continue;const E=ji[v.cls];E&&(i.push({id:g,kind:E}),a.add(g))}const o=[...s].sort((g,v)=>v.length-g.length);for(const g in t.states){if(!g.startsWith(`schedule.${e}_`)||a.has(g))continue;const v=g.slice(`schedule.${e}_`.length);for(const E of o){if(!v.startsWith(`${E}_`))continue;const T=v.slice(E.length+1);T&&T!=="sensor_schedule"&&i.push({id:g,kind:"schedule"});break}}const[c,r,d,l,u]=await Promise.all([_e(t,"timer"),_e(t,"input_select"),_e(t,"input_number"),_e(t,"schedule"),Zt(t,i.map(g=>g.id))]),p=(g,v)=>{const E=new Map;for(const T of g)T.id&&E.set(`${v}.${T.id}`,T);return E},f=new Map([...p(c,"timer"),...p(r,"input_select"),...p(d,"input_number"),...p(l,"schedule")]),x=[];for(const g of i){const v=f.get(g.id),E=t.states[g.id];let T={};if(g.id.startsWith("input_number.")&&v){const C=v.unit_of_measurement;T={name:v.name,min:v.min,max:v.max,step:v.step,...C!=null?{unit:C}:{}}}else g.id.startsWith("input_select.")&&v?T={name:v.name,options:v.options}:g.id.startsWith("timer.")&&v?T={name:v.name,restore:v.restore??false}:g.id.startsWith("schedule.")&&v?T={name:v.name}:E&&(T={name:E.attributes.friendly_name??g.id});x.push({id:g.id,kind:g.kind,spec:T,managed:(u.get(g.id)??[]).includes(Ke)})}const S=[];for(const g in t.states){if(!g.startsWith("automation."))continue;const v=t.states[g];if(!v)continue;const E=v.attributes.id;typeof E=="string"&&E.startsWith(`${e}_mzcs_`)&&S.push({cfgId:E,entityId:g,alias:String(v.attributes.friendly_name??E)})}const[_,z]=await Promise.all([Promise.all(S.map(async({cfgId:g})=>{if(!t.callApi)return{sig:"unknown",pristine:void 0};try{const v=await t.callApi("GET",`config/automation/config/${g}`),E=pe(v?.description);return{sig:E??"unknown",pristine:E?ue(v)===E:false}}catch{return{sig:"unknown",pristine:void 0}}})),Zt(t,S.map(g=>g.entityId))]);return S.forEach(({cfgId:g,entityId:v,alias:E},T)=>{x.push({id:`automation:${g}`,kind:"automation",spec:{alias:E,sig:_[T].sig},managed:(z.get(v)??[]).includes(Ke),pristine:_[T].pristine})}),x}const As=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];function ut(t){return t instanceof Error?t.message:t&&typeof t=="object"?JSON.stringify(t):String(t)}function Hi(t){const e=t;return e&&(e.status_code===404||e.status===404)?true:/\b404\b|not.found/i.test(ut(t))}function oe(t){const e=t.indexOf(".");return{domain:t.slice(0,e),objectId:t.slice(e+1)}}function Je(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function ve(t,e){const s=lt(t,e.prefix,e.zones.map(n=>n.slug),e.seasons.map(n=>n.key));return s?.zone?e.zones.find(n=>n.slug===s.zone)??null:null}async function je(t,e,s,n){const i=`${e}.${Je(s)}`,a=[i,...[2,3,4,5].map(o=>`${i}_${o}`)];for(let o=0;o<3;o++){try{const c=await t.callWS({type:"config/entity_registry/get_entries",entity_ids:a});for(const r of a)if(c?.[r]?.config_entry_id===n)return r}catch{}await new Promise(c=>setTimeout(c,400*(o+1)))}throw new Error(`Could not locate the entity created by flow entry ${n} (expected around ${i})`)}async function We(t,e,s,n){if(e===s)return;let i;for(let a=0;a<3;a++)try{await t.callWS({type:"config/entity_registry/update",entity_id:e,new_entity_id:s}),n.log(`Renamed ${e} -> ${s}`);return}catch(o){i=o,await new Promise(c=>setTimeout(c,400*(a+1)))}throw new Error(`Could not rename ${e} to its contract id ${s} (${i instanceof Error?i.message:"registry error"})`)}async function Fi(t,e){try{await t.callWS({type:"config/label_registry/create",name:"mzcs",color:"blue",icon:"mdi:thermostat-box"}),e.log("Created label mzcs")}catch{}}async function ke(t,e){try{const n=(await t.callWS({type:"config/entity_registry/get_entries",entity_ids:[e]}))?.[e]?.labels??[];n.includes("mzcs")||await t.callWS({type:"config/entity_registry/update",entity_id:e,labels:[...n,"mzcs"]})}catch{}}function Ui(t,e){for(const s in t.states)if(s.startsWith("automation.")&&t.states[s]?.attributes.id===e)return s;return null}async function He(t,e,s,n){if(!t.callApi)throw new Error("callApi unavailable");let i=await t.callApi("POST","config/config_entries/flow",{handler:e,show_advanced_options:true});const a={...n};for(let o=0;o<8;o++){if(i.type==="create_entry"){const c=i.result?.entry_id;if(!c)throw new Error(`Flow ${e}: created an entry but returned no entry_id`);return c}if(i.type==="menu"){if(!s)throw new Error(`Flow ${e}: unexpected menu`);i=await t.callApi("POST",`config/config_entries/flow/${i.flow_id}`,{next_step_id:s});continue}if(i.type==="form"){const c=(i.data_schema??[]).map(d=>d.name),r={};for(const d of c)d in a&&(r[d]=a[d],delete a[d]);i=await t.callApi("POST",`config/config_entries/flow/${i.flow_id}`,r);continue}throw new Error(`Flow ${e}: unhandled step type ${i.type}`)}throw new Error(`Flow ${e}: did not complete`)}function Bi(t){return`{${t.seasons.map(e=>`'${e.name.replace(/'/g,"")}': '${e.key}'`).join(", ")}}`}function Ki(t,e,s){const{objectId:n}=oe(t),i=String(e.name??n),a=s.prefix;if(t.startsWith("binary_sensor.")&&e.source==="hvac_action"){const o=ve(t,s);return o?{handler:"template",menu:"binary_sensor",fields:{name:i,state:`{{ state_attr('${o.climate}', 'hvac_action') in ['cooling', 'heating'] }}`,device_class:"running"}}:null}if(t.startsWith("sensor.")&&e.model==="runtime_mirror"){const o=ve(t,s);return o?{handler:"template",menu:"sensor",fields:{name:i,state:`{{ states('sensor.${a}_${o.slug}_runtime_today') | float(0) }}`,unit_of_measurement:"h",state_class:"measurement"}}:null}if(t.startsWith("sensor.")&&e.model==="k_x_cdd"){const o=ve(t,s);return o?{handler:"template",menu:"sensor",fields:{name:i,state:`{{ (states('input_number.${a}_${o.slug}_k') | float(0)) * ([ (states('sensor.${a}_outdoor_daily_mean') | float(0)) - (states('input_number.${a}_cdd_base') | float(75)), 0 ] | max) | round(2) }}`,unit_of_measurement:"h",state_class:"measurement"}}:null}if(t===`sensor.${a}_next_block`){const o=`input_select.${a}_season`;return{handler:"template",menu:"sensor",fields:{name:i,state:`{% set season = ${Bi(s)}.get(states('${o}'), states('${o}') | lower) %}{% set evs = states.schedule | selectattr('entity_id', 'search', '^schedule\\.${a}_[a-z0-9_]+_' ~ season ~ '$') | map(attribute='attributes.next_event') | reject('none') | list %}{{ evs | min if evs | count > 0 else 'unknown' }}`}}}return t===`sensor.${a}_outdoor_temp`&&e.source==="weather"&&s.weatherEntity?{handler:"template",menu:"sensor",fields:{name:i,state:`{{ state_attr('${s.weatherEntity}', 'temperature') }}`,unit_of_measurement:"\xB0F",state_class:"measurement"}}:null}function Ts(t,e){const s=e.prefix;if(t===`${s}_mzcs_engine`)return ps(s,e.zones,e.seasons,e.ecoPreset===void 0?"eco":e.ecoPreset,e.offPeakEntity??null,e.steering??false);if(t===`${s}_mzcs_steering`)return hs(s,e.zones,e.seasons,e.ecoPreset===void 0?"eco":e.ecoPreset);if(t===`${s}_mzcs_watchdog`)return fs(s);if(t===`${s}_mzcs_runtime_learning`)return ms(s,e.zones);if(t===`${s}_mzcs_runtime_alert`)return _s(s,e.zones);const n=t.match(new RegExp(`^${s}_mzcs_fan_timer_(.+)$`));if(n){const i=e.zones.find(a=>a.slug===n[1]);return i?us(s,i,e.fanGuard):null}return null}async function Zi(t,e,s){const n={...e.spec,...e.meta??{}};if(e.id.startsWith("automation:")){const o=e.id.slice(11),c=Ts(o,s);if(!c)return s.log(`SKIP ${e.id} - no payload generator`),null;let r=null;try{r=await t.callApi("GET",`config/automation/config/${o}`)}catch(d){if(!Hi(d))throw new Error(`Could not verify whether ${e.id} already exists: ${ut(d)}`);r=null}if(r){const d=pe(r.description);return d&&ue(r)===d?(await t.callApi("POST",`config/automation/config/${o}`,c),await ke(t,`automation.${Je(String(c.alias))}`),s.log(`Recreated ${e.id} (existed in storage, pristine)`),{kind:"automation",automationId:o,preexisted:true}):(s.log(`KEEP ${e.id} - exists in storage but is customized/unsigned; not overwritten`),null)}return await t.callApi("POST",`config/automation/config/${o}`,c),await ke(t,`automation.${Je(String(c.alias))}`),{kind:"automation",automationId:o}}const{domain:i,objectId:a}=oe(e.id);if(["timer","input_text","input_select","input_number","input_boolean","schedule"].includes(i)){const o=String(n.name??a),c={};if(i==="timer"&&Object.assign(c,{restore:n.restore??true,duration:"0:30:00"}),i==="input_select"&&Object.assign(c,{options:n.options??["-"]}),i==="input_number"&&Object.assign(c,{min:n.min??0,max:n.max??100,step:n.step??1,...n.unit?{unit_of_measurement:n.unit}:{}}),i==="schedule"){const l=n.week;for(const u of As)c[u]=l?.[u]??[]}const d=(await t.callWS({type:`${i}/create`,...c,name:a}))?.id??a;if(d!==a){try{await t.callWS({type:`${i}/delete`,[`${i}_id`]:d})}catch{s.log(`WARN: could not remove stray ${i} item ${d}`)}throw new Error(`HA assigned id "${d}" instead of "${a}" for ${e.id} - an object with that id likely already exists (possibly registry-disabled)`)}if(o!==d)try{await t.callWS({type:`${i}/update`,[`${i}_id`]:d,...c,name:o})}catch{s.log(`NOTE: created ${e.id} but could not set its display name to "${o}"`)}if(i==="input_number"&&typeof n.seed=="number")try{await t.callService("input_number","set_value",{entity_id:e.id,value:n.seed})}catch{s.log(`NOTE: created ${e.id} but could not seed its default value ${n.seed}`)}return{kind:"collection",domain:i,itemId:d}}if(e.kind==="template_sensor"||e.kind==="stats_sensor"){if(e.kind==="stats_sensor"){const d=String(n.name??a);if(n.model==="statistics_mean"){if(!s.weatherEntity)return s.log(`SKIP ${e.id} - no weather entity configured (CDD learning stays off)`),null;const p=await He(t,"statistics",null,{name:d,entity_id:`sensor.${s.prefix}_outdoor_temp`,state_characteristic:"mean",sampling_size:500,max_age:{hours:24,minutes:0,seconds:0},keep_last_sample:false,percentile:50,precision:1});return await We(t,await je(t,"sensor",d,p),e.id,s),{kind:"config_entry",entryId:p}}const l=ve(e.id,s);if(!l)return s.log(`SKIP ${e.id} - no zone match`),null;const u=await He(t,"history_stats",null,{name:d,entity_id:`binary_sensor.${s.prefix}_${l.slug}_running`,type:"time",state:["on"],start:"{{ today_at() }}",end:"{{ now() }}"});return await We(t,await je(t,"sensor",d,u),e.id,s),{kind:"config_entry",entryId:u}}const o=Ki(e.id,n,s);if(!o)return n.source==="weather"&&!s.weatherEntity?s.log(`SKIP ${e.id} - no weather entity configured`):s.log(`SKIP ${e.id} - not flow-creatable`),null;const c=await He(t,o.handler,o.menu,o.fields),r=o.menu==="binary_sensor"?"binary_sensor":"sensor";return await We(t,await je(t,r,String(o.fields.name),c),e.id,s),{kind:"config_entry",entryId:c}}return s.log(`SKIP ${e.id} - unsupported kind ${e.kind}`),null}async function qi(t,e,s){for(const n of[...e].reverse())try{n.kind==="collection"?await t.callWS({type:`${n.domain}/delete`,[`${n.domain}_id`]:n.itemId}):n.kind==="automation"?await t.callApi("DELETE",`config/automation/config/${n.automationId}`):n.kind==="config_entry"&&n.entryId&&await t.callApi("DELETE",`config/config_entries/entry/${n.entryId}`),s.log(`Rolled back ${n.itemId??n.automationId??n.entryId}`)}catch{s.log(`ROLLBACK FAILED for ${n.itemId??n.automationId??n.entryId} - remove manually`)}}async function qt(t,e,s){const n={created:0,adopted:0,updated:0,deleted:0,skipped:0,ok:true},i=[];let a="create";await Fi(t,s);try{for(const o of e.create){const c=await Zi(t,o,s);c?(c.preexisted||i.push(c),n.created++,s.log(`Created ${o.id}`),o.id.startsWith("automation:")||await ke(t,o.id)):n.skipped++}a="adopt";for(const o of e.adopt){const c=o.id.startsWith("automation:")?Ui(t,o.id.slice(11)):o.id;c&&await ke(t,c),n.adopted++,s.log(`Adopted ${o.id}`)}a="update";for(const o of e.update)if(o.kind==="helper"){const{domain:c,objectId:r}=oe(o.id),{unit:d,...l}=o.spec,u={...l,...d?{unit_of_measurement:d}:{}};try{await t.callWS({type:`${c}/update`,[`${c}_id`]:r,...u}),n.updated++,s.log(`Updated ${o.id}`)}catch{n.skipped++,s.log(`SKIP update ${o.id} - not updatable`)}}else if(o.kind==="automation"&&t.callApi){const c=o.id.slice(11),r=Ts(c,s);if(!r)n.skipped++,s.log(`KEEP ${o.id} - no generator for this automation`);else try{const d=await t.callApi("GET",`config/automation/config/${c}`),l=pe(d?.description);l&&ue(d)===l?(await t.callApi("POST",`config/automation/config/${c}`,r),n.updated++,s.log(`Regenerated ${o.id} (config changed; automation was untouched)`)):(n.skipped++,s.log(`KEEP ${o.id} - customized since generation; review it manually`))}catch{n.skipped++,s.log(`KEEP ${o.id} - could not read its config to verify`)}}else if((o.kind==="template_sensor"||o.kind==="stats_sensor")&&t.callWS)try{await t.callWS({type:"config/entity_registry/update",entity_id:o.id,name:String(o.spec.name??"")}),n.updated++,s.log(`Renamed ${o.id} to "${String(o.spec.name)}"`)}catch{n.skipped++,s.log(`SKIP update ${o.id} - could not set its display name`)}else if(o.kind==="schedule"&&t.callWS){const{objectId:c}=oe(o.id);try{let r=c;try{const f=(await t.callWS({type:"config/entity_registry/get_entries",entity_ids:[o.id]}))?.[o.id]?.unique_id;typeof f=="string"&&f&&(r=f)}catch{}const l=(await t.callWS({type:"schedule/list"})).find(p=>p.id===r);if(!l)throw new Error(`no storage item "${r}"`);const u={};for(const p of As)u[p]=l[p]??[];await t.callWS({type:"schedule/update",schedule_id:r,name:String(o.spec.name??c),...u}),n.updated++,s.log(`Renamed ${o.id} to "${String(o.spec.name)}" (blocks preserved)`)}catch(r){n.skipped++,s.log(`SKIP update ${o.id} - could not rename without touching its blocks (${ut(r)})`)}}else n.skipped++,s.log(`KEEP ${o.id} - ${o.kind} updates never overwrite existing content`);a="delete";for(const o of e.delete){if(o.id.startsWith("automation:")){const c=o.id.slice(11);let r=null;try{r=await t.callApi("GET",`config/automation/config/${c}`)}catch{r=null}if(!r){n.skipped++,s.log(`SKIP delete ${o.id} - config not readable`);continue}const d=pe(r.description);if(!(d&&ue(r)===d)){n.skipped++,s.log(`KEEP ${o.id} - customized or unsigned; delete it manually if intended`);continue}s.log(`snapshot ${c}: ${JSON.stringify(r)}`),await t.callApi("DELETE",`config/automation/config/${c}`)}else if(o.kind==="template_sensor"||o.kind==="stats_sensor"){let c;try{c=(await t.callWS({type:"config/entity_registry/get_entries",entity_ids:[o.id]}))?.[o.id]?.config_entry_id}catch{c=void 0}if(!c){n.skipped++,s.log(`SKIP delete ${o.id} - no owning config entry found; remove it manually`);continue}s.log(`snapshot ${o.id}: config entry ${c}`),await t.callApi("DELETE",`config/config_entries/entry/${c}`)}else{const{domain:c,objectId:r}=oe(o.id),d=lt(o.id,s.prefix,s.zones.map(l=>l.slug),s.seasons.map(l=>l.key));if(d?.cls==="room_override_timer"&&d.zone){try{await t.callService("timer","cancel",{entity_id:o.id})}catch{}try{await t.callService("input_text","set_value",{entity_id:$("applied_block_marker",s.prefix,d.zone),value:""}),s.log(`Released steering override for ${d.zone} before deleting its timer`)}catch{s.log(`NOTE: could not clear ${d.zone}'s applied-block marker before deleting its timer`)}}if(c==="schedule")try{const u=(await t.callWS({type:"schedule/list"})).find(p=>p.id===r);u&&s.log(`snapshot ${r}: ${JSON.stringify(u)}`)}catch{s.log(`NOTE: could not snapshot ${o.id} before delete`)}await t.callWS({type:`${c}/delete`,[`${c}_id`]:r})}n.deleted++,s.log(`Deleted ${o.id}`)}}catch(o){n.ok=false,s.log(`ERROR during ${a}: ${o instanceof Error?o.message:String(o)} - rolling back this run's creates. Already-applied updates/deletes from this run are NOT reverted; see the log above for what landed.`),await qi(t,i,s)}return n}var Gi=Object.defineProperty,Vi=Object.getOwnPropertyDescriptor,w=(t,e,s,n)=>{for(var i=n>1?void 0:n?Vi(e,s):e,a=t.length-1,o;a>=0;a--)(o=t[a])&&(i=(n?o(e,s,i):o(i))||i);return n&&i&&Gi(e,s,i),i};const Yi=[["accent","--mzcs-accent"],["accentBright","--mzcs-accent-bright"],["good","--mzcs-good"],["warn","--mzcs-warn"],["bad","--mzcs-bad"],["bg","--mzcs-bg"],["surface","--mzcs-surface"],["chip","--mzcs-chip"],["track","--mzcs-track"],["border","--mzcs-border"],["text","--mzcs-text"],["textDim","--mzcs-text-dim"]],Ji=[{key:"bg",label:"Card background"},{key:"surface",label:"Panels (hero / rows)"},{key:"chip",label:"Buttons and chips"},{key:"track",label:"Tracks and wells"},{key:"border",label:"Borders"},{key:"text",label:"Text"},{key:"textDim",label:"Muted text"},{key:"accent",label:"Accent (cooling / active)"},{key:"accentBright",label:"Accent bright (today / highlights)"},{key:"good",label:"Good (eco / normal)"},{key:"warn",label:"Warn (heat / season / high)"},{key:"bad",label:"Alert (out of range)"}];function Xi(t,e,s){return!s.some(n=>n.name&&R(t,$("zone_enabled",e,A(n.name))))}const Qi=["fan_timer","running_sensor","runtime_today","expected_runtime","applied_block_marker","zone_enabled","room_override_timer","target_room_select","steer_target","sensor_schedule"],ea=["season_select","theme","off_peak_paused_on"],Fe=[{cls:"dev_green_max",label:"Room deviation \xB7 green up to (\xB0)"},{cls:"dev_amber_max",label:"Room deviation \xB7 amber up to (\xB0)"},{cls:"runtime_alert_margin",label:"Runtime alert margin (%)"},{cls:"runtime_learn_days",label:"Runtime learn window (days)"},{cls:"cdd_base",label:"Cooling degree-day base (\xB0)"},{cls:"off_peak_offset",label:"Off-peak comfort offset (\xB0)"},{cls:"override_minutes",label:"Steering override duration (min)"},{cls:"steer_min_setpoint",label:"Steering lowest setpoint (\xB0)"},{cls:"steer_max_setpoint",label:"Steering highest setpoint (\xB0)"},{cls:"steer_max_offset",label:"Steering max offset from block (\xB0)"}];function ge(t,e,s){const n=s>e?Math.max(0,Math.min(1,(t-e)/(s-e))):.5,i=[41,121,230],a=[226,122,49];return`rgb(${i.map((o,c)=>Math.round(o+(a[c]-o)*n)).join(",")})`}function Gt(t){const[e,s]=t.split(":");let n=Number(e);const i=n>=12?"PM":"AM";return n=n%12===0?12:n%12,`${n}:${s} ${i}`}const Vt={all:"Every day",wd:"Weekdays",we:"Weekend"},ta={heat:"Heat",cool:"Cool",heat_cool:"Heat\xB7Cool",off:"Off",auto:"Auto",dry:"Dry",fan_only:"Fan only"};function sa(t){const e=ta[t];if(e)return e;const s=t.replace(/_/g," ").trim();return s?s.charAt(0).toUpperCase()+s.slice(1):t}console.info(`%c ${is} %c v${ns}`,"background:var(--mzcs-accent);color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;","background:#243039;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;");let y=class extends V{constructor(){super(...arguments),this._zoneIndex=0,this._ctrlOpen=false,this._setupOpen=false,this._schedOpen=false,this._schedName="",this._schedBusy=false,this._schedDrafts=new Map,this._schedEdited=new Set,this._rtOpen=false,this._rtDayErr=new Map,this._rtDaysOpen=new Set,this._rtDayLoading=new Set,this._rtDayCache=new Map,this._dryRunning=false,this._cwScanning=false,this._execConfirm=false,this._execRunning=false,this._execLog=[],this._tdArmed=false,this._tdRunning=false,this._setupTab="zones",this._tdAsk=false,this._tdConfirm="",this._diagTextHasIds=false,this._diagIds=false,this._objectsLoading=false,this._renderedMinute=-1,this._steerTemp=76,this._steerMins=60,this._dpSaving=false,this._dpNonUniform=false}setConfig(t){const e=ot(t);this._config=e,this._zoneIndex>=Math.max(e.zones.length,1)&&(this._zoneIndex=0),this._dryRun=void 0,this._diagText=void 0,this._diagTextHasIds=false,this._dryRunKind=void 0,this._cwScan=void 0,this._cwError=void 0,this._cwScannedFor=void 0,this._execConfirm=false,this._execResult=void 0,this._execLog=[]}static async getConfigElement(){return await Promise.resolve().then(()=>oa),document.createElement(as)}static getStubConfig(){return{prefix:"climate",zones:[]}}getCardSize(){return 6}get _prefix(){return this._config?.prefix??"climate"}_zone(){return this._config?.zones[this._zoneIndex]}_nudge(t){const e=this._zone();if(!e||!this.hass)return;const s=Rt(this.hass,e.entity);if(s.setpoint==null)return;const n=this.hass.states[e.entity]?.attributes,i=di(s.setpoint+t,s.setpoint,n?.min_temp,n?.max_temp);i!==s.setpoint&&_i(this.hass,e.entity,i)}_provisionInput(){const t=this._config,e=t.seasons??ze(),s=Pi(t.zones.map(n=>A(n.name)),e);return xn({...t,prefix:this._prefix,seasons:e},s,A)}_fetchExistingFor(t){return Wi(this.hass,t.prefix,t.zones.map(e=>e.slug),t.seasons.map(e=>e.key))}async _runDryRun(){if(!(!this.hass||this._dryRunning)){this._dryRunning=true,this._dryRunError=void 0;try{const t=this._provisionInput(),e=await this._fetchExistingFor(t);this._dryRun=K(te(t),e),this._dryRunKind="setup",this._execConfirm=false,this._execResult=void 0,this._execLog=[],this._tdArmed=false}catch(t){this._dryRunError=t instanceof Error?t.message:String(t)}finally{this._dryRunning=false}this._runCompetingScan()}}_cwKey(){const t=(this._config?.zones??[]).filter(e=>e.entity);return t.length===0?null:`${this._prefix}|${t.map(e=>e.entity).join(",")}`}async _runCompetingScan(t=false){if(!this.hass||!this._config||this._cwScanning)return;const e=this._config.zones.filter(i=>i.entity),s=this._cwKey();if(!s||!t&&this._cwScannedFor===s&&this._cwScan)return;this._cwScanning=true,this._cwError=void 0;let n=false;try{const i=await $i(this.hass,this._prefix,Ke,e);this._cwKey()===s?(this._cwScan=i,this._cwScannedFor=s):n=true}catch(i){this._cwScan=void 0,this._cwScannedFor=void 0,this._cwKey()===s?this._cwError=i instanceof Error?i.message:String(i):n=true}finally{this._cwScanning=false}n&&this._runCompetingScan()}async _armTeardown(){if(!(!this.hass||this._dryRunning||this._tdRunning)){this._dryRunning=true,this._dryRunError=void 0;try{const t=this._provisionInput(),e=await this._fetchExistingFor(t),s=K([],e),n={automation:0,template_sensor:1,stats_sensor:1,schedule:2,helper:3};if(s.delete.sort((i,a)=>(n[i.kind]??9)-(n[a.kind]??9)),!this._tdAsk||this._setupTab!=="danger"||!this._setupOpen)return;this._dryRun=s,this._dryRunKind="teardown",this._tdArmed=true,this._execConfirm=false,this._execResult=void 0,this._execLog=[]}catch(t){this._dryRunError=t instanceof Error?t.message:String(t)}finally{this._dryRunning=false}}}async _runTeardown(){const t=this.hass,e=this._config,s=this._dryRunKind==="teardown"?this._dryRun:void 0;if(!(!t||!e||!s||this._tdRunning)&&this._tdConfirm.trim()===this._prefix){if(this._tdConfirm="",!t.callWS||!t.callApi){this._execLog=["This HA frontend session does not expose the required APIs (callWS/callApi)."];return}this._tdRunning=true,this._tdArmed=false,this._execLog=[];try{const n=this._provisionInput(),i=await this._fetchExistingFor(n),a=K([],i),o={automation:0,template_sensor:1,stats_sensor:1,schedule:2,helper:3};a.delete.sort((u,p)=>(o[u.kind]??9)-(o[p.kind]??9));const c=u=>u.delete.map(p=>p.id).sort().join("|");if(c(a)!==c(s)){this._dryRun=a,this._dryRunKind="teardown",this._tdArmed=true,this._tdRunning=false,this._execLog=["The registry changed since this preview was made. Review the refreshed list and confirm again."];return}for(const u of n.zones){const p=$("zone_enabled",n.prefix,u.slug);if(R(t,p))try{await t.callService("input_boolean","turn_off",{entity_id:p}),this._execLog=[...this._execLog,`Disabled scheduling for ${u.name}`]}catch{this._execLog=[...this._execLog,`NOTE: could not disable ${p}`]}}const r=e.zones.map(u=>({slug:A(u.name),name:u.name,climate:u.entity,...e.features?.steering===true?{rooms:se(u.room_sensors)}:{}})),d=await qt(t,a,{prefix:n.prefix,zones:r,seasons:n.seasons,fanGuard:e.features?.fan_guard,ecoPreset:G(e.features),offPeakEntity:q(e.features)?.entity??null,steering:e.features?.steering===true,weatherEntity:e.weather_entity,log:u=>{this._execLog=[...this._execLog,u]}});this._execResult=d;const l=await this._fetchExistingFor(n);this._dryRun=K(te(n),l),this._dryRunKind="setup"}catch(n){this._execLog=[...this._execLog,`ERROR: ${n instanceof Error?n.message:String(n)}`]}finally{this._tdRunning=false}}}async _runApply(){const t=this.hass,e=this._config,s=this._dryRun;if(!(!t||!e||!s||this._execRunning)){if(!t.callWS||!t.callApi){this._execLog=["This HA frontend session does not expose the required APIs (callWS/callApi)."];return}this._execRunning=true,this._execConfirm=false,this._execLog=[];try{const n=this._provisionInput(),i=e.zones.map(l=>({slug:A(l.name),name:l.name,climate:l.entity,...e.features?.steering===true?{rooms:se(l.room_sensors)}:{}})),a=await this._fetchExistingFor(n),o=K(te(n),a),c=l=>JSON.stringify([l.create.map(u=>u.id).sort(),l.adopt.map(u=>u.id).sort(),l.update.map(u=>u.id).sort(),l.delete.map(u=>u.id).sort()]);if(c(o)!==c(s)){this._dryRun=o,this._dryRunKind="setup",this._execRunning=false,this._execLog=["The registry changed since this preview was made. Review the refreshed plan and apply again."];return}const r=await qt(t,o,{prefix:n.prefix,zones:i,seasons:n.seasons,fanGuard:e.features?.fan_guard,ecoPreset:G(e.features),offPeakEntity:q(e.features)?.entity??null,steering:e.features?.steering===true,weatherEntity:e.weather_entity,log:l=>{this._execLog=[...this._execLog,l]}});this._execResult=r;const d=await this._fetchExistingFor(n);this._dryRun=K(te(n),d)}catch(n){this._execLog=[...this._execLog,`ERROR: ${n instanceof Error?n.message:String(n)}`]}finally{this._execRunning=false}}}_resetDangerState(){this._tdAsk=false,this._tdArmed=false,this._tdConfirm="",this._dryRunKind==="teardown"&&(this._dryRun=void 0,this._dryRunKind=void 0)}_setSetupTab(t){t!==this._setupTab&&(this._resetDangerState(),this._execConfirm=false,this._setupTab=t,t==="objects"&&this._loadObjects())}_closeSetup(){this._resetDangerState(),this._execConfirm=false,this._setupOpen=false}async _loadObjects(t=false){if(!this.hass||this._objectsLoading)return;const e=`${this._prefix}|${(this._config?.zones??[]).map(s=>s.name).join(",")}`;if(!(!t&&this._objectsLoadedFor===e&&this._objects)){this._objectsLoading=true,this._objectsError=void 0;try{const s=this._provisionInput(),n=await this._fetchExistingFor(s),i=te(s),a=new Map(n.map(r=>[r.id,r])),o=new Set(i.map(r=>r.id)),c=i.map(r=>{const d=a.get(r.id),l=d?d.managed?d.pristine===false?"customized":"managed":"unmanaged":"missing";return{id:r.id,kind:r.kind,name:String(r.spec.name??r.spec.alias??r.id),status:l}});for(const r of n)r.managed&&!o.has(r.id)&&c.push({id:r.id,kind:r.kind,name:String(r.spec.name??r.spec.alias??r.id),status:"extra"});this._objects=c,this._objectsLoadedFor=e}catch(s){this._objectsError=s instanceof Error?s.message:String(s)}finally{this._objectsLoading=false}}}_renderSetup(){const t=[{key:"zones",label:"Zones"},{key:"tuning",label:"Tuning"},{key:"objects",label:"Objects"},{key:"setup",label:"Setup"},{key:"appearance",label:"Theme"},{key:"danger",label:"Danger"}],e=this._setupTab;return h`
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
        ${e==="zones"?this._renderZonesTab():m}
        ${e==="tuning"?this._renderTuningTab():m}
        ${e==="objects"?this._renderObjectsTab():m}
        ${e==="setup"?this._renderSetupTab():m}
        ${e==="appearance"?this._renderThemePicker():m}
        ${e==="danger"?this._renderTeardown():m}
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
        ${this._dryRunError?h`<p class="setup-err">${this._dryRunError}</p>`:m}
        ${this._renderCompetingWriters()}
        ${t?h`
              <div class="planwrap">
                ${[["Create",t.create,""],["Adopt",t.adopt,""],["Update",t.update,""],["Delete",t.delete,"del"],["Unchanged",t.noop,"quiet"]].map(([e,s,n])=>h`
                    <p class="plan-h ${n}">${e} (${s.length})</p>
                    ${s.length>0&&e!=="Unchanged"?h`<ul class="plan-list ${n}">
                          ${s.map(i=>h`<li>${i.id}</li>`)}
                        </ul>`:m}
                  `)}
              </div>
              ${this._renderApply(t)}
            `:m}
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
      `;const t=this._cwScan;if(!t)return m;const e=h`
      <button class="chip" .disabled=${this._cwScanning} @click=${()=>void this._runCompetingScan(true)}>
        Re-scan
      </button>
    `,s=[`Scanned ${t.scanned} automation${t.scanned===1?"":"s"} and scripts`,t.skippedOwn>0?`, excluding ${t.skippedOwn} of this card's own`:"",t.blueprints>0?`. ${t.blueprints} blueprint automation${t.blueprints===1?" was":"s were"} checked by ${t.blueprints===1?"its":"their"} configured inputs only`:"",t.unreadable>0?`. ${t.unreadable} could not be read (automations and scripts defined in YAML are not readable here)`:"",t.capped?". Coverage was capped, so some were not scanned":"",t.degraded?". Area matching was reduced for this scan (a registry read failed)":"",". Scenes and systems outside Home Assistant automations (Node-RED, vendor apps) are not scanned."].join(""),n=t.conflicts.length===0&&t.notes.length===0,i=n&&!t.capped&&t.unreadable===0&&!t.degraded&&t.blueprints===0;return h`
      <div class="cwwrap">
        ${i?h`<p class="cw-h ok">No automation or script writes to these thermostats.</p>`:m}
        ${n&&!i?h`<p class="cw-h ok">
              No conflicts found among what could be checked - but coverage was partial, see below.
            </p>`:m}
        ${t.conflicts.length>0?h`
              <p class="cw-h bad">Something else also writes to these thermostats (${t.conflicts.length})</p>
              <p class="setup-sub">
                These will fight the schedule engine. The symptom is setpoints that appear to change
                themselves at odd times. Turn them off, delete them, or narrow them so they no
                longer target a scheduled zone. Rows stay listed while the automation exists - a
                disabled one is marked "currently off", because one toggle re-arms it.
              </p>
              <ul class="cw-list">${t.conflicts.map(a=>this._cwRow(a))}</ul>
            `:m}
        ${t.notes.length>0?h`
              <p class="cw-h warn">Also worth knowing (${t.notes.length})</p>
              <p class="setup-sub">
                These do not fight the setpoint, but they change how the engine behaves. Something
                else writing the standby preset can make the schedule quietly stop applying, because
                the engine stands down while that preset is on.
              </p>
              <ul class="cw-list">${t.notes.map(a=>this._cwRow(a))}</ul>
            `:m}
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
          `:m}
      ${this._tdAsk&&!this._tdArmed?h`
            <p class="setup-sub"><strong>Are you sure?</strong> Nothing is deleted yet - the next
            step shows you the exact list first.</p>
            <div class="applyrow">
              <button class="chip danger" .disabled=${n} @click=${()=>void this._armTeardown()}>
                Yes, show me what will be deleted
              </button>
              <button class="chip" @click=${()=>this._resetDangerState()}>Cancel</button>
            </div>
          `:m}
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
          `:m}
      ${this._tdRunning?h`<p class="setup-sub">Removing…</p>`:m}
      ${this._execLog.length>0&&(this._tdRunning||this._tdArmed===false)?h`<ul class="plan-list exec-log">
            ${this._execLog.map(i=>h`<li>${i}</li>`)}
          </ul>`:m}
    `}_buildDiag(){const t=this.hass,e=this._config;if(!t||!e)return;const s=(e.zones??[]).map((i,a)=>{const o=$("zone_enabled",this._prefix,A(i.name));return{zone:i.name,index:a,state:R(t,o)?t.states[o]?.state??"unknown":"not provisioned"}}),n=this._dryRun;this._diagText=Rn({cardVersion:ns,haVersion:t.config?.version,userAgent:typeof navigator<"u"?navigator.userAgent:void 0,config:e,plan:n?{create:n.create.length,adopt:n.adopt.length,update:n.update.length,delete:n.delete.length,noop:n.noop.length}:null,planKind:this._dryRunKind,objectStatuses:this._objects?this._objects.map(i=>i.status):null,zoneEnabled:s,activeSeason:t.states[k("season_select",this._prefix)]?.state,identifiers:this._diagIds}),this._diagTextHasIds=this._diagIds,this._diagStatus=void 0}async _copyDiag(t){const e=this._diagText??"";try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(e),this._diagStatus="copied";return}}catch{}t.readOnly=false,t.focus(),t.setSelectionRange(0,e.length),t.readOnly=true,this._diagStatus="selected"}_renderObjectsTab(){const t=this._objects,e=[{label:"Schedules",kinds:["schedule"]},{label:"Helpers",kinds:["helper"]},{label:"Sensors",kinds:["template_sensor","stats_sensor"]},{label:"Automations",kinds:["automation"]}],s={managed:{label:"Managed",cls:"ok",hint:"Created and managed by this card."},missing:{label:"Missing",cls:"warn",hint:"Expected but not present - run Apply on the Setup tab."},customized:{label:"Customized",cls:"warn",hint:"You edited this - the card will never overwrite or delete it."},unmanaged:{label:"Unmanaged",cls:"warn",hint:"Matches this naming scheme but is not labeled - Apply would adopt it."},extra:{label:"Not in config",cls:"del",hint:"Managed but no longer in your config - Apply would delete it."}};return h`
      <p class="setup-sub">
        Everything this card creates and manages, all labeled <code>mzcs</code> in Home
        Assistant. Read-only - tap a row to open it.
      </p>
      <button class="chip" .disabled=${this._objectsLoading} @click=${()=>void this._loadObjects(true)}>
        ${this._objectsLoading?"Reading registry\u2026":"Refresh"}
      </button>
      ${this._objectsError?h`<p class="setup-err">${this._objectsError}</p>`:m}
      ${t?h`
            ${e.map(n=>{const i=t.filter(a=>n.kinds.includes(a.kind));return i.length===0?m:h`
                <p class="plan-h">${n.label} (${i.length})</p>
                ${i.map(a=>{const o=s[a.status];return h`
                    <div class="objrow" title=${o.hint} @click=${()=>this._moreInfo(a.id)}>
                      <span class="objname">${a.name}</span>
                      <span class="objid">${a.id.replace(/^automation:/,"automation.")}</span>
                      <span class="objstat ${o.cls}">${o.label}</span>
                    </div>
                  `})}
              `})}
          `:this._objectsLoading?m:h`<p class="setup-sub">Nothing loaded yet.</p>`}
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
                </p>`:m}
            ${this._diagTextHasIds?h`<p class="setup-err">
                  This report now contains your entity ids and the names of your zones and rooms.
                </p>`:m}
          `:m}
    `}_moreInfo(t){if(t.startsWith("automation:")){const e=t.slice(11),s=this.hass;let n;if(s){for(const i in s.states)if(i.startsWith("automation.")&&s.states[i]?.attributes.id===e){n=i;break}}if(!n)return;t=n}this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:true,composed:true}))}_renderApply(t){const e=$n(t).length,s=this._execResult;return h`
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
            `:m}
      ${this._execRunning?h`<p class="setup-sub">Applying…</p>`:m}
      ${this._execLog.length>0?h`<ul class="plan-list exec-log">
            ${this._execLog.map(n=>h`<li>${n}</li>`)}
          </ul>`:m}
      ${s?h`<p class="setup-sub ${s.ok?"":"setup-err"}">
            ${s.ok?`Done - ${s.created} created, ${s.adopted} adopted, ${s.updated} updated, ${s.deleted} deleted${s.skipped?`, ${s.skipped} kept as-is`:""}. The plan above has been re-verified against the live registry.`:"Apply failed - created objects from this run were rolled back. See the log above."}
          </p>`:m}
    `}_renderZonesTab(){const t=this.hass;if(!t)return m;const e=k("season_select",this._prefix),s=t.states[e],n=Array.isArray(s?.attributes.options)?s.attributes.options:[];if(Fe.map(c=>({...c,id:k(c.cls,this._prefix)})).filter(c=>R(t,c.id)),!s&&Xi(t,this._prefix,this._config?.zones??[]))return h`<p class="setup-sub">Zone switches appear here once the card is provisioned.</p>`;const i=(this._config?.zones??[]).map(c=>{const r=A(c.name);return{name:c.name,enableId:$("zone_enabled",this._prefix,r),markerId:$("applied_block_marker",this._prefix,r)}}).filter(c=>R(t,c.enableId)),a=i.length>0&&i.every(c=>t.states[c.enableId]?.state==="on"),o=i.some(c=>t.states[c.enableId]?.state==="on");return h`
      ${i.length>0?h`
            <div class="managerow master">
              <span>Scheduling · all zones</span>
              <button
                class=${a?"chip togg on":"chip togg"}
                @click=${()=>{for(const c of i)It(t,c.enableId,c.markerId,!o)}}
              >
                ${a?"On":o?"Mixed":"Off"}
              </button>
            </div>
            ${i.map(c=>{const r=t.states[c.enableId]?.state==="on";return h`
                <div class="managerow">
                  <span>${c.name} scheduling</span>
                  <button
                    class=${r?"chip togg on":"chip togg"}
                    @click=${()=>void It(t,c.enableId,c.markerId,!r)}
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
          `:m}
      ${s?h`
            <div class="managerow">
              <span>Active season</span>
              <select
                @change=${c=>void ui(t,e,c.target.value)}
              >
                ${n.map(c=>h`<option .value=${c} ?selected=${c===s.state}>${c}</option>`)}
              </select>
            </div>
          `:m}
      ${this._renderDaypartsSection()}
    `}_renderTuningTab(){const t=this.hass;if(!t)return m;const e=Fe.map(s=>({...s,id:k(s.cls,this._prefix)})).filter(s=>R(t,s.id));return e.length===0?h`<p class="setup-sub">Tuning helpers appear here once the card is provisioned.</p>`:h`
      ${e.map(s=>h`
          <div class="managerow">
            <span>${s.label}</span>
            <input
              type="number"
              .value=${t.states[s.id]?.state??""}
              @change=${n=>{const i=n.target,a=i.value.trim(),o=Number(a);if(a===""||!Number.isFinite(o)){i.value=t.states[s.id]?.state??"";return}pi(t,s.id,o).catch(()=>{i.value=t.states[s.id]?.state??""})}}
            />
          </div>
        `)}
    `}_renderThemePicker(){const t=this.hass;if(!t)return m;const e=k("theme",this._prefix);if(!R(t,e))return m;const{presetKey:s,tokens:n}=Wt(t.states[e]?.state),i=a=>void t.callService("input_text","set_value",{entity_id:e,value:a});return h`
      <div class="chips">
        ${Object.entries(Ve).map(([a,o])=>h`
            <button
              class=${s===a?"chip mode-on":"chip"}
              @click=${()=>i(a)}
            >
              <span class="swatch" style="background:${o.tokens.accent}"></span>${o.label}
            </button>
          `)}
        <button
          class=${s==="custom"?"chip mode-on":"chip"}
          @click=${()=>i(jt(xi(n)))}
        >
          Custom
        </button>
      </div>
      ${s==="custom"?h`
            ${Ji.map(a=>h`
                <div class="managerow">
                  <span>${a.label}</span>
                  <input
                    type="color"
                    .value=${n[a.key]}
                    @change=${o=>{const c={...n,[a.key]:o.target.value};i(jt(c))}}
                  />
                </div>
              `)}
            <p class="muted" style="font-size:11px;margin:2px 0 0;">
              Colors apply live to every device showing the card.
            </p>
          `:m}
    `}connectedCallback(){super.connectedCallback(),this._renderedMinute=-1,this._tick=setInterval(()=>this.requestUpdate(),3e4)}disconnectedCallback(){super.disconnectedCallback(),this._tick&&clearInterval(this._tick),this._tick=void 0}_applyTheme(){const t=this.hass?.states[k("theme",this._prefix)]?.state,e=`${this._prefix}|${t??""}`;if(e===this._appliedTheme)return;this._appliedTheme=e;const{tokens:s}=Wt(t);for(const[n,i]of Yi)this.style.setProperty(i,s[n])}_watchedEntities(){const t=this._config;if(!t)return[];const e=`${this._prefix}|${this._activeSeasonKey()??""}|${JSON.stringify(t.zones)}|${JSON.stringify(t.seasons)}|${q(t.features)?.entity??""}`;if(this._watchedIds?.key===e)return this._watchedIds.ids;const s=this._prefix,n=[];for(const a of t.zones??[]){a.entity&&n.push(a.entity);for(const r of D(a.room_sensors))n.push(r.entity),r.last_seen&&n.push(r.last_seen);if(!a.name)continue;const o=A(a.name);for(const r of Qi)n.push($(r,s,o));for(const r of t.seasons??[])n.push(ae(s,o,r.key));const c=this._activeSeasonKey();c&&n.push(ae(s,o,c))}for(const a of ea)n.push(k(a,s));for(const a of Fe)n.push(k(a.cls,s));const i=q(t.features);return i&&n.push(i.entity),this._watchedIds={key:e,ids:n},n}shouldUpdate(t){if(t.size>1||!t.has("hass"))return true;const e=t.get("hass"),s=this.hass;if(!e||!s)return true;const n=Math.floor(Date.now()/6e4);if(n!==this._renderedMinute)return this._renderedMinute=n,true;for(const i of this._watchedEntities())if(e.states[i]!==s.states[i])return true;return false}render(){if(!this._config||!this.hass)return m;this._applyTheme();const t=this._zone();if(!t||!t.entity||!t.entity.startsWith("climate."))return h`<ha-card>
        <div class="wrap"><p class="muted pad">Pick a thermostat for each zone in the card editor to get started.</p></div>
      </ha-card>`;if(this._setupOpen)return h`<ha-card><div class="wrap">${this._renderSetup()}</div></ha-card>`;const e=Rt(this.hass,t.entity),s=Xn(this.hass,$("fan_timer",this._prefix,A(t.name))),n=e.action==="cooling",i=e.action==="heating",a=this.hass.states[t.entity]?.attributes??{},o=a.target_temp_low!=null&&a.target_temp_high!=null?`${a.target_temp_low}\u2013${a.target_temp_high}`:null,c=e.setpoint??o??"\u2013",r=e.available?n?`Cooling to ${c}`:i?`Heating to ${c}`:e.mode==="off"?"Off":`Idle \xB7 set ${c}`:"Unavailable";return h`
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
    `}_renderRuntime(t){if(!this.hass)return m;const e=this.hass,s=A(t.name),n=$("runtime_today",this._prefix,s);if(!R(e,n))return m;const i=Number(e.states[n]?.state),a=Number.isFinite(i)?Tt(i):"\u2013",o=$("running_sensor",this._prefix,s);this._rtLoadedFor!==o&&(this._rtLoadedFor=o,this._rtDays=void 0,queueMicrotask(()=>void hi(e,o,10).then(_=>{this._rtLoadedFor===o&&(this._rtDays=_)})));const c=new Date;c.setHours(0,0,0,0);const r=this._rtDays?.ok?this._rtDays.rows:[],d=r.filter(_=>_.day<c.getTime()&&_.coverage!=="none").sort((_,z)=>z.day-_.day),l=r.filter(_=>_.day<c.getTime()&&_.coverage==="none").length,u=c.getTime(),p=Number(e.states[$("expected_runtime",this._prefix,s)]?.state),f=De(e,k("runtime_alert_margin",this._prefix))??35,x=(Date.now()-u)/36e5,S=wi(Number.isFinite(i)?i:0,p,f,x);return h`
      <button class="schedrow" @click=${()=>this._rtOpen=!this._rtOpen}>
        <span
          >Runtime · Today <b class="rt-b">${a}</b>${S.label?h` <span class="verdict ${S.status}">· ${S.label}</span>`:m}</span
        >
        <span aria-hidden="true">${this._rtOpen?"\u25B4":"\u25BE"}</span>
      </button>
      ${this._rtOpen?h`
            <div class="schedbody">
              ${this._renderPill(t,"Today",Number.isFinite(i)?i:0,u,true)}
              ${d.map(_=>this._renderPill(t,new Date(_.day).toLocaleDateString(void 0,{weekday:"short",day:"numeric"}),_.hours,_.day,false,_.coverage==="partial"))}
              ${this._rtDays&&!this._rtDays.ok?h`<p class="rt-fail">
                    Could not read history from Home Assistant, so this is not "no
                    runtime yet" - it is unknown. ${this._rtDays.error}
                  </p>`:this._rtDays&&d.length===0?h`<p class="muted" style="font-size:11px;margin:6px 0;">
                      No recorded history for this zone yet - past days appear as the
                      recorder collects them.
                    </p>`:m}
              ${l>0&&d.length>0?h`<p class="muted" style="font-size:10px;margin:6px 0 0;">
                    Recorded history covers the last ${d.length+1} days - older days
                    are gone once the recorder purges them.
                  </p>`:d.some(_=>_.coverage==="partial")?h`<p class="muted" style="font-size:10px;margin:6px 0 0;">
                      The oldest day shows ≥ because the recorder has already trimmed
                      its start.
                    </p>`:m}
              <p class="muted" style="font-size:10px;margin:6px 0 0;">
                Tap a day for its run segments and setpoint changes.
              </p>
            </div>
          `:m}
    `}async _openDay(t,e){if(this._rtDaysOpen.has(e)){if(this._rtDaysOpen=new Set([...this._rtDaysOpen].filter(s=>s!==e)),this._rtDayErr.has(e)){const s=new Map(this._rtDayErr);s.delete(e),this._rtDayErr=s}return}if(this._rtDaysOpen=new Set(this._rtDaysOpen).add(e),!this._rtDayCache.has(e)&&this.hass){this._rtDayLoading=new Set(this._rtDayLoading).add(e);try{const s=A(t.name),n=$("running_sensor",this._prefix,s),i=Math.min(e+864e5,Date.now()),[a,o]=await Promise.all([Nt(this.hass,n,e,i),Nt(this.hass,t.entity,e,i,"temperature")]);if(!a.ok){this._rtDaysOpen.has(e)&&(this._rtDayErr=new Map(this._rtDayErr).set(e,a.error));return}const c=a.rows,r=o.ok?o.rows:[],d={segs:vs(c,e,i),bubs:Ln(r),start:e,end:e+864e5};this._rtDayCache.set(e,d)}finally{this._rtDayLoading=new Set([...this._rtDayLoading].filter(s=>s!==e))}}}_renderPill(t,e,s,n,i,a=false){const o=Math.min(100,Math.max(0,s/24*100)),c=this._rtDaysOpen.has(n);return h`
      <button
        class="pillrow"
        title=${a?"The recorder has trimmed the start of this day; its total is at least this much.":m}
        @click=${()=>void this._openDay(t,n)}
      >
        <span class="pill-label">${e}</span>
        <span class="pill-track">
          <span
            class="pill-fill ${i||c?"today-fill":""}"
            style="width: ${o.toFixed(1)}%"
          ></span>
        </span>
        <span class="pill-hours">${a?"\u2265 ":""}${Tt(s)}</span>
      </button>
      ${c?this._renderDayDetail(n):m}
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
          ${s.segs.map(n=>{const{left:i,width:a}=Pn(n,s.start,s.end);return h`<span
              class="seg"
              style="left: ${i.toFixed(2)}%; width: ${Math.max(.4,a).toFixed(2)}%"
            ></span>`})}
        </div>
        <div class="axis">
          <span>12A</span><span>6A</span><span>12P</span><span>6P</span><span>12A</span>
        </div>
      </div>
    `:m}_activeSeasonKey(){const t=this.hass?.states[k("season_select",this._prefix)];return!t||t.state==="unknown"?null:tn(this._config?.seasons,t.state)}_scheduleEntityId(t){const e=this._activeSeasonKey();return!e||!t.name?null:ae(this._prefix,A(t.name),e)}async _loadWeek(t){if(!this.hass)return;const e=this._scheduleEntityId(t);if(!e||!R(this.hass,e)){this._schedWeek=void 0;return}this._schedBusy=true;try{const s=await Mt(this.hass,e);if(this._schedLoadedFor!==e)return;this._schedWeek=s?.week??void 0,this._schedName=s?.name??"",this._schedError=s?void 0:"Could not load schedule config."}catch(s){this._schedLoadedFor===e&&(this._schedError=H(s))}finally{this._schedBusy=false}}_setBlocks(t,e,s){return this._schedDrafts.get(e)??Ne(t[s[0]]??[])}_mutateDraft(t,e,s){if(!this._schedWeek)return;const n=this._schedDrafts.get(t)??Ne(this._schedWeek[e[0]]??[]).map(a=>({...a}));s(n);const i=new Map(this._schedDrafts);i.set(t,n),this._schedDrafts=i,this._schedEdited.add(t),this._schedNotice=void 0}_clearSchedEdit(){this._schedDrafts=new Map,this._schedEdited=new Set,this._schedSel=void 0,this._schedGran=void 0}_activeDet(t){if(!this._schedGran)return Ut(t);const e=this._schedGran,s=e==="all"?["all"]:e==="wdwe"?["wd","we"]:[...M];return{granularity:e,sets:Object.fromEntries(s.map(n=>[n,cs(e,n)]))}}_switchGranularity(t){const e=this._schedWeek;if(!e||this._activeDet(e).granularity===t)return;const s=Ut(e),n={};for(const[o,c]of Object.entries(s.sets)){const r=this._schedEdited.has(o)?this._schedDrafts.get(o):void 0;n[o]=(r??Ne(e[c[0]]??[])).map(d=>({...d}))}const i=dn(s.granularity,t,n),a=new Map;for(const[o,c]of Object.entries(i))a.set(o,c.map(r=>({...r})));this._schedDrafts=a,this._schedGran=t,this._schedSel=void 0,this._schedNotice=void 0}async _saveSchedDrafts(){const t=this._schedLoadedFor;if(!this.hass||!this._schedWeek||this._schedDrafts.size===0||!t)return;const e=this._activeDet(this._schedWeek);this._schedBusy=true;try{const s=await Mt(this.hass,t);let n=s?.week??this._schedWeek;for(const[i,a]of this._schedDrafts){const o=e.sets[i];o&&(n=Ss(n,o,a))}await Dt(this.hass,t,n,s?.name??this._schedName),this._schedLoadedFor===t&&(this._schedWeek=n,this._clearSchedEdit(),this._schedError=void 0)}catch(s){this._schedError=H(s)}finally{this._schedBusy=false}}_offPeakState(){const t=q(this._config?.features);if(!t||!this.hass)return null;const e=this.hass.states[t.entity]?.state==="on",s=Date.parse(this.hass.states[k("off_peak_paused_on",this._prefix)]?.state??""),n=Number.isFinite(s)&&new Date(s).toDateString()===new Date().toDateString(),i=Number(this.hass.states[k("off_peak_offset",this._prefix)]?.state),a=Number.isFinite(i)?i:t.offsetSeed;return{on:e,paused:n,adjusting:e&&!n,offset:a}}async _toggleOffPeakPause(t){if(!this.hass)return;const e=k("off_peak_paused_on",this._prefix);if(R(this.hass,e))try{await this.hass.callService("input_text","set_value",{entity_id:e,value:t?"":new Date().toISOString()})}catch{}}_steeringFor(t){if(this._config?.features?.steering!==true||!this.hass||!t.name)return null;const e=A(t.name),s=$("room_override_timer",this._prefix,e);if(!R(this.hass,s))return null;const n=this.hass.states[s],i=$("target_room_select",this._prefix,e),a=n?.attributes.finishes_at;return{slug:e,timerId:s,selectId:i,targetId:$("steer_target",this._prefix,e),active:n?.state==="active",label:this.hass.states[i]?.state??"Thermostat",...typeof a=="string"?{finishesAt:a}:{}}}_steerLabels(t){return new Map(se(t.room_sensors).map(e=>[e.entity,e.label]))}_openSteerSheet(t,e,s,n){const i=Number(this.hass?.states[k("override_minutes",this._prefix)]?.state);this._steerMins=Number.isFinite(i)&&i>0?Math.min(480,Math.max(15,Math.round(i))):60,this._steerTemp=Math.min(95,Math.max(50,n!=null?Math.round(n):76)),this._steerError=void 0,this._steerSheet={zone:A(t.name),room:e,label:s}}async _startSteer(t,e){const s=this._steeringFor(t);if(!s||!this.hass)return;const n=this.hass,i=Math.min(480,Math.max(5,Math.round(this._steerMins))),a=`${String(Math.floor(i/60)).padStart(2,"0")}:${String(i%60).padStart(2,"0")}:00`,o=Math.min(95,Math.max(50,Math.round(this._steerTemp))),c=Number(n.states[s.targetId]?.state),r=n.states[s.selectId]?.state;try{await n.callService("input_number","set_value",{entity_id:s.targetId,value:o}),await n.callService("input_select","select_option",{entity_id:s.selectId,option:e}),await n.callService("timer","start",{entity_id:s.timerId,duration:a}),this._steerSheet=void 0}catch(d){this._steerError=H(d);try{Number.isFinite(c)&&await n.callService("input_number","set_value",{entity_id:s.targetId,value:c}),typeof r=="string"&&r&&await n.callService("input_select","select_option",{entity_id:s.selectId,option:r})}catch{}}}async _cancelSteer(t){const e=this._steeringFor(t);if(!(!e||!this.hass))try{await this.hass.callService("timer","cancel",{entity_id:e.timerId})}catch{}}async _fetchDaypartItem(t){if(!this.hass?.callWS)throw new Error("Home Assistant connection unavailable.");const e=$("sensor_schedule",this._prefix,t).split(".")[1],n=(await this.hass.callWS({type:"schedule/list"})).find(i=>i.id===e);if(!n)throw new Error(`The sensor schedule (${e}) could not be read - not saving anything.`);return n}async _toggleDayparts(t){if(this._dpZone===t){this._dpZone=void 0,this._dpRows=void 0,this._dpError=void 0;return}this._dpZone=t,this._dpRows=void 0,this._dpError=void 0,this._dpNonUniform=false;try{const e=await this._fetchDaypartItem(t),s=a=>JSON.stringify(e[a]??[]),i=(e.monday??[]).map(a=>({time:String(a.from??"00:00:00").slice(0,5),sensor:a.data?.sensor??"thermostat"})).sort((a,o)=>a.time.localeCompare(o.time));if(this._dpZone!==t)return;this._dpRows=i,this._dpNonUniform=["tuesday","wednesday","thursday","friday","saturday","sunday"].some(a=>s(a)!==s("monday"))}catch(e){this._dpZone===t&&(this._dpError=H(e))}}async _saveDayparts(t){if(!this.hass||!this._dpRows)return;const e=[...this._dpRows].sort((i,a)=>i.time.localeCompare(a.time));if(new Set(e.map(i=>i.time)).size!==e.length){this._dpError="Two dayparts start at the same time - give each its own start.";return}const s=e.map((i,a)=>({from:`${i.time}:00`,to:a+1<e.length?`${e[a+1].time}:00`:"24:00:00",data:{sensor:i.sensor}})),n={};for(const i of["monday","tuesday","wednesday","thursday","friday","saturday","sunday"])n[i]=s;this._dpSaving=true,this._dpError=void 0;try{const i=await this._fetchDaypartItem(t),a=$("sensor_schedule",this._prefix,t);await Dt(this.hass,a,n,String(i.name??a.split(".")[1])),this._dpNonUniform=false}catch(i){this._dpError=H(i)}finally{this._dpSaving=false}}_renderDaypartsSection(){const t=this.hass;if(!t||this._config?.features?.steering!==true)return m;const e=(this._config?.zones??[]).filter(s=>s.name).map(s=>({z:s,slug:A(s.name),schedId:$("sensor_schedule",this._prefix,A(s.name)),rooms:se(s.room_sensors)})).filter(s=>s.rooms.length>0&&R(t,s.schedId));return e.length===0?m:h`
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
                        </p>`:m}
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
                `:h`<p class="muted pad">Loading…</p>`:m}
        `})}
    `}_steerRemaining(t){if(!t)return null;const e=Date.parse(t)-Date.now();if(!Number.isFinite(e)||e<=0)return null;const s=Math.ceil(e/6e4);return s>=60?`${Math.floor(s/60)}h ${s%60}m`:`${s}m`}_renderSchedule(t){if(!this.hass)return m;const e=this._scheduleEntityId(t);if(!e||!R(this.hass,e))return m;this._schedLoadedFor!==e&&(this._schedNotice=this._schedWeek&&Le(this._schedWeek,this._activeDet(this._schedWeek),this._schedDrafts)?"Unsaved schedule edits were discarded (zone or season changed).":void 0,this._schedLoadedFor=e,this._schedWeek=void 0,this._clearSchedEdit(),queueMicrotask(()=>void this._loadWeek(t)));const s=this.hass.states[k("season_select",this._prefix)]?.state??"",n=this._schedWeek,i=n?Ai(n,new Date):null,a=i?i.cool_temp??i.heat_temp:null,o=this._offPeakState(),c=new Date,r=i?.minutesUntil!=null&&i.minutesUntil<1440-(c.getHours()*60+c.getMinutes()),d=i&&a!=null&&o?.adjusting&&r?i.cool_temp!=null?a-o.offset:a+o.offset:a,l=i?`Next \xB7 ${Gt(i.time)} ${i.name}${d!=null?` \u2192 ${d}\xB0`:""}`:"Schedule",u=n?Le(n,this._activeDet(n),this._schedDrafts):false;return h`
      <button
        class="schedrow ${u?"unsaved":""}"
        @click=${()=>{this._schedOpen=!this._schedOpen,this._schedWeek||this._loadWeek(t)}}
      >
        <span>
          ${l} <span class="season">· ${s}</span>
          ${o?.on?h`<span
                class="opchip ${o.paused?"paused":""}"
                role="button"
                title=${o.paused?"Off-peak comfort is paused for today - tap to resume":`Off-peak day: comfort offset ${o.offset}\xB0 is applied - tap to pause for today`}
                @click=${p=>{p.stopPropagation(),this._toggleOffPeakPause(o.paused)}}
                >${o.paused?"Off-peak paused":"Off-peak"}</span
              >`:m}
          ${u?h`<span class="unsavedchip">unsaved</span>`:m}
        </span>
        <span aria-hidden="true">${this._schedOpen?"\u25B4":"\u25BE"}</span>
      </button>
      ${!this._schedOpen&&this._schedNotice?h`<p class="unsavedhint">${this._schedNotice}</p>`:m}
      ${!this._schedOpen&&u?h`<p class="unsavedhint">
            This schedule has changes you have not saved. They are not running - open the
            schedule to save or discard them.
          </p>`:m}
      ${this._schedOpen?this._renderScheduleBody(t):m}
    `}_renderScheduleBody(t){if(this._schedBusy&&!this._schedWeek)return h`<p class="muted pad">Loading…</p>`;const e=this._schedWeek;if(!e)return this._schedError?h`<p class="schederr pad">${this._schedError}</p>`:h`<p class="muted pad">No schedule data.</p>`;const s=this._activeDet(e),n=Object.entries(s.sets),i=new Date().getDay(),a=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][i],o=[];for(const[p,f]of n)for(const x of this._setBlocks(e,p,f))x.cool_temp!=null&&o.push(x.cool_temp),x.heat_temp!=null&&o.push(x.heat_temp);let c=o.length?Math.min(...o):70,r=o.length?Math.max(...o):80;if(r-c<6){const p=(r+c)/2;c=p-3,r=p+3}const d=s.granularity==="days",l=Le(e,this._activeDet(e),this._schedDrafts);return Ti(e)?h`
        <div class="schedbody">
          ${n.map(([p,f],x)=>{const S=Ci(e[f[0]]??[]),_=f.includes(a),z=Vt[p]??p.charAt(0).toUpperCase()+p.slice(1);return h`
              <p class="sethead">${z}${_?h` <span class="today">today</span>`:m}</p>
              <div class="sstrip ${d?"small":""}">
                ${S.map(g=>{const v=(g.toMin-g.fromMin)/1440*100,E=g.block?g.block.cool_temp??g.block.heat_temp:null;return h`<span
                    class="sseg ro"
                    style="width:${v}%;background:${g.block&&E!=null?ge(E,c,r):"var(--mzcs-track)"}"
                  >
                    <span class="segt">${g.block?`${E??"\u2013"}\xB0`:"Off"}</span>
                  </span>`})}
              </div>
              ${!d||x===n.length-1?h`<div class="saxis">
                    <span>12A</span><span>4A</span><span>8A</span><span>12P</span><span>4P</span><span>8P</span><span>12A</span>
                  </div>`:m}
            `})}
          <p class="muted pad">
            This schedule has inactive (off) periods set in Home Assistant's own editor. Edit it
            there - the card leaves it untouched to preserve those periods.
          </p>
        </div>
      `:h`
      <div class="schedbody">
        <div class="chips granchips">
          ${[["all","Every day"],["wdwe","Weekday \xB7 Weekend"],["days","Individual days"]].map(([p,f])=>h`
              <button
                class=${s.granularity===p?"chip mode-on":"chip"}
                .disabled=${this._schedBusy}
                @click=${()=>this._switchGranularity(p)}
              >
                ${f}
              </button>
            `)}
        </div>
        ${n.map(([p,f],x)=>{const S=this._setBlocks(e,p,f),_=Ri(S),z=f.includes(a),g=S.some(C=>C.mode==="heat_cool"),v=Vt[p]??p.charAt(0).toUpperCase()+p.slice(1),E=h`
            <div class="sstrip ${d?"small":""} ${g?"hc":""}">
              ${_.map(C=>{const ht=S.indexOf(C.block),mt=!C.wrap&&this._schedSel?.setKey===p&&this._schedSel?.idx===ht,fe=(C.toMin-C.fromMin)/1440*100,ft=()=>{this._schedSel={setKey:p,idx:ht}};if(g){const Te=C.block.cool_temp,Ce=C.block.heat_temp;return h`
                    <button class="sseg hcseg ${mt?"sel":""}" style="width:${fe}%" @click=${ft}>
                      <span class="hchalf" style="background:${Te!=null?ge(Te,c,r):"var(--mzcs-track)"}">
                        <span class="segt">${Te??"\u2013"}°</span>
                        ${fe>15&&!d?h`<span class="segn">${C.block.name}</span>`:m}
                      </span>
                      <span class="hchalf" style="background:${Ce!=null?ge(Ce,c,r):"var(--mzcs-track)"}">
                        <span class="segt">${Ce??"\u2013"}°</span>
                      </span>
                    </button>
                  `}const Ae=C.block.cool_temp??C.block.heat_temp;return h`
                  <button
                    class="sseg ${mt?"sel":""}"
                    style="width:${fe}%;background:${Ae!=null?ge(Ae,c,r):"var(--mzcs-track)"}"
                    @click=${ft}
                  >
                    <span class="segt">${Ae??"\u2013"}°</span>
                    ${fe>9&&!d?h`<span class="segn">${C.block.name}</span>`:m}
                  </button>
                `})}
            </div>
          `,T=!d||x===n.length-1;return h`
            <p class="sethead">
              ${v}${z?h` <span class="today">today</span>`:m}
            </p>
            ${g?h`<div class="hcwrap">
                  <div class="hcgutter"><span class="gc">Cool</span><span class="gh">Heat</span></div>
                  ${E}
                </div>`:E}
            ${T?h`<div class="saxis ${g?"indent":""}">
                  <span>12A</span><span>4A</span><span>8A</span><span>12P</span><span>4P</span><span>8P</span><span>12A</span>
                </div>`:m}
          `})}
        ${this._renderBlockEditor(s)}
        ${this._schedNotice?h`<p class="muted pad">${this._schedNotice}</p>`:m}
        ${this._schedError?h`<p class="schederr pad">${this._schedError}</p>`:m}
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
                  @click=${()=>{const p=$("applied_block_marker",this._prefix,A(t.name));fi(this.hass,p,sn(this._prefix,"engine"))}}
                >
                  Apply now
                </button>
                <span class="muted">Tap a block to edit. Changes apply at the next block; Apply now re-asserts immediately.</span>
              `}
        </div>
      </div>
    `}_renderBlockEditor(t){const e=this._schedSel,s=this._schedWeek;if(!e||!s)return m;const n=t.sets[e.setKey];if(!n)return m;const i=this._setBlocks(s,e.setKey,n),a=i[e.idx];if(!a)return m;const o=l=>this._mutateDraft(e.setKey,n,l),c=l=>{o(u=>{const p=u[e.idx],f=I(p.time),x=f+l,S=e.idx>0?I(u[e.idx-1].time)+15:0,_=e.idx<u.length-1?I(u[e.idx+1].time)-15:Math.max(1425,f);p.time=Kt(Math.max(S,Math.min(_,x)))})},r=(l,u)=>{o(p=>{const f=p[e.idx],S=(f[l]??f.cool_temp??f.heat_temp??72)<45,_=(f[l]??(S?22:72))+u;let z=S?5:45,g=S?35:95;f.mode==="heat_cool"&&(l==="cool_temp"&&f.heat_temp!=null&&(z=f.heat_temp+2),l==="heat_temp"&&f.cool_temp!=null&&(g=f.cool_temp-2)),f[l]=Math.max(z,Math.min(g,_))})},d=(l,u,p,f)=>h`
      <div class="managerow">
        <span>${l}</span>
        <span class="stepgrp">
          <button class="stepbtn" @click=${p}>−</button>
          <span class="stepval">${u}</span>
          <button class="stepbtn" @click=${f}>+</button>
        </span>
      </div>
    `;return h`
      <div class="bedit">
        <div class="managerow">
          <span>Block name</span>
          <input
            class="bname-in"
            type="text"
            .value=${a.name}
            @change=${l=>o(u=>{u[e.idx].name=l.target.value})}
          />
        </div>
        ${d("Starts",Gt(a.time),()=>c(-15),()=>c(15))}
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
            @click=${()=>{const l=e.idx<i.length-1?I(i[e.idx+1].time):1440,u=I(a.time);if(l-u<45)return;const p=Kt(Math.round((u+Math.max(30,(l-u)/2))/15)*15);o(f=>{f.splice(e.idx+1,0,{time:p,name:"New block",mode:a.mode,cool_temp:a.cool_temp,heat_temp:a.heat_temp})}),this._schedSel={setKey:e.setKey,idx:e.idx+1}}}
          >
            Add block after
          </button>
          <button class="chip" @click=${()=>this._schedSel=void 0}>Close</button>
        </div>
      </div>
    `}_renderControls(t){if(!this.hass)return m;const e=this.hass,s=this._zone();if(!s)return m;const n=Qn(e,t),i=e.states[t]?.state,a=G(this._config?.features),o=a!==null&&ei(e,t,a),c=a==="eco"?"Eco":(a??"").charAt(0).toUpperCase()+(a??"").slice(1),r=$("fan_timer",this._prefix,A(s.name)),d=this._config?.features?.fan_timer??[15,30,60],l=R(e,r);return h`
      <button class="expander" @click=${()=>this._ctrlOpen=!this._ctrlOpen}>
        <span>Mode</span>
        <span aria-hidden="true">${this._ctrlOpen?"\u25B4":"\u25BE"}</span>
      </button>
      ${this._ctrlOpen?h`
            <div class="ctrl">
              <div class="chips">
                ${n.map(u=>h`
                    <button
                      class=${i===u?"chip mode-on":"chip"}
                      @click=${()=>void oi(e,t,u)}
                    >
                      ${sa(u)}
                    </button>
                  `)}
                ${o?h`
                      <button
                        class=${Ot(e,t,a)?"chip eco eco-on":"chip eco"}
                        @click=${()=>void ri(e,t,!Ot(e,t,a),a)}
                      >
                        ${c}
                      </button>
                    `:m}
              </div>
              ${l?h`
                    <div class="chips fanrow">
                      <span class="fanlbl">Fan</span>
                      ${d.map(u=>h`
                          <button
                            class="chip"
                            @click=${()=>void li(e,t,r,u)}
                          >
                            ${u}m
                          </button>
                        `)}
                    </div>
                  `:m}
            </div>
          `:m}
    `}_renderRooms(t,e){if(!this.hass||!t.room_sensors||t.room_sensors.length===0)return m;const s=this.hass,{greenMax:n,amberMax:i}=Ni(De(s,k("dev_green_max",this._prefix)),De(s,k("dev_amber_max",this._prefix))),a=D(t.room_sensors),o=ie(this._config?.display),c=si(s,[t.entity,...a.map(l=>l.entity),...a.flatMap(l=>l.last_seen?[l.last_seen]:[])]),r=this._steeringFor(t),d=r?this._steerLabels(t):void 0;return h`
      <div class="rooms">
        ${a.map(l=>{const u=ai(s,l.entity,c,{staleMs:o.staleMs,lastSeenEntity:l.last_seen}),p={...u,name:l.name?.trim()||u.name},f=On(o.lastSeen,p.ageMs,o.ageingMs)?h`<span
                class="agechip ${Mn(p.ageMs,o.ageingMs)?"ageing":""}"
                title="Last seen ${Me(p.ageMs)}${Me(p.ageMs)==="now"?"":" ago"} - the device's own last report time."
                >${Me(p.ageMs)}</span
              >`:m,x=d?.get(l.entity),S=!!(r?.active&&x!=null&&r.label===x),_=r&&this._steerSheet&&this._steerSheet.zone===r.slug&&this._steerSheet.room===l.entity,z=!!(r&&x!=null&&!S&&!p.stale&&p.temp!=null),g=()=>{z&&this._openSteerSheet(t,l.entity,x,e)},v=S?h`<span class="steerchip" title="Steering this room to the override target.">
                  steering${this._steerRemaining(r?.finishesAt)?` \xB7 ${this._steerRemaining(r?.finishesAt)}`:""}</span
                ><button
                  class="steercancel"
                  title="Cancel this override - the schedule takes the zone back."
                  @click=${T=>{T.stopPropagation(),this._cancelSteer(t)}}
                >
                  ✕
                </button>`:m,E=p.temp==null||e==null||p.stale?h`
                  <div
                    class="room ${S?"steering":""}"
                    title=${p.stale?"This sensor has not reported recently - the reading below may be out of date, so steering to it is refused.":m}
                  >
                    <span class="rname">${p.name}</span>
                    <span class="rtemp muted">
                      ${v}${f}${p.temp==null?"\u2014":p.stale?h`<span class="stalechip">stale</span>${Pe(p.temp)}°`:`${Pe(p.temp)}\xB0`}
                    </span>
                  </div>
                `:h`
                  <div
                    class="room ${S?"steering":""} ${z?"steerable":""}"
                    @click=${g}
                  >
                    <span class="rname">${p.name}</span>
                    <span>
                      ${v}${f}<span
                        class="badge ${Di(Math.round(p.temp-e),n,i)}"
                        >${Ii(Math.round(p.temp-e))}</span
                      >
                      <span class="rtemp">${Pe(p.temp)}°</span>
                    </span>
                  </div>
                `;return h`${E}${_&&x!=null?this._renderSteerSheet(t,x):m}`})}
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
            `:m}
      </div>
    `}_renderSteerSheet(t,e){const s=this.hass;if(!s)return m;const n=$("zone_enabled",this._prefix,A(t.name)),i=s.states[n]?.state!=="on",a=G(this._config?.features),o=a!==null&&s.states[t.entity]?.attributes.preset_mode===a,c=s.states[t.entity]?.state!=="cool",r=i?"Zone scheduling is switched off - the kill switch outranks steering.":o?`The '${a}' standby preset is active - steering never overrides standby.`:null;return h`
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
        ${r?h`<p class="steerrefusal">${r}</p>`:m}
        ${this._steerError?h`<p class="steerrefusal">${this._steerError}</p>`:m}
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
    `}};y.styles=Jt`
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
  `;w([it({attribute:false})],y.prototype,"hass",2);w([b()],y.prototype,"_config",2);w([b()],y.prototype,"_zoneIndex",2);w([b()],y.prototype,"_ctrlOpen",2);w([b()],y.prototype,"_setupOpen",2);w([b()],y.prototype,"_schedOpen",2);w([b()],y.prototype,"_schedWeek",2);w([b()],y.prototype,"_schedError",2);w([b()],y.prototype,"_schedBusy",2);w([b()],y.prototype,"_schedSel",2);w([b()],y.prototype,"_schedDrafts",2);w([b()],y.prototype,"_schedNotice",2);w([b()],y.prototype,"_schedGran",2);w([b()],y.prototype,"_rtOpen",2);w([b()],y.prototype,"_rtDays",2);w([b()],y.prototype,"_rtDayErr",2);w([b()],y.prototype,"_rtDaysOpen",2);w([b()],y.prototype,"_rtDayLoading",2);w([b()],y.prototype,"_dryRun",2);w([b()],y.prototype,"_dryRunError",2);w([b()],y.prototype,"_dryRunning",2);w([b()],y.prototype,"_cwScan",2);w([b()],y.prototype,"_cwScanning",2);w([b()],y.prototype,"_cwError",2);w([b()],y.prototype,"_execConfirm",2);w([b()],y.prototype,"_execRunning",2);w([b()],y.prototype,"_execLog",2);w([b()],y.prototype,"_execResult",2);w([b()],y.prototype,"_tdArmed",2);w([b()],y.prototype,"_tdRunning",2);w([b()],y.prototype,"_setupTab",2);w([b()],y.prototype,"_tdAsk",2);w([b()],y.prototype,"_tdConfirm",2);w([b()],y.prototype,"_diagText",2);w([b()],y.prototype,"_diagTextHasIds",2);w([b()],y.prototype,"_diagIds",2);w([b()],y.prototype,"_diagStatus",2);w([b()],y.prototype,"_objects",2);w([b()],y.prototype,"_objectsLoading",2);w([b()],y.prototype,"_objectsError",2);w([b()],y.prototype,"_steerSheet",2);w([b()],y.prototype,"_steerTemp",2);w([b()],y.prototype,"_steerMins",2);w([b()],y.prototype,"_steerError",2);w([b()],y.prototype,"_dpZone",2);w([b()],y.prototype,"_dpRows",2);w([b()],y.prototype,"_dpSaving",2);w([b()],y.prototype,"_dpError",2);w([b()],y.prototype,"_dpNonUniform",2);y=w([ss(at)],y);window.customCards=window.customCards??[];window.customCards.push({type:at,name:is,description:"Multi-zone climate view for 1-4 zones with seasonal scheduling, fan timers, and runtime history."});var na=Object.defineProperty,ia=Object.getOwnPropertyDescriptor,me=(t,e,s,n)=>{for(var i=n>1?void 0:n?ia(e,s):e,a=t.length-1,o;a>=0;a--)(o=t[a])&&(i=(n?o(e,s,i):o(i))||i);return n&&i&&na(e,s,i),i};let Ue=null;function aa(){return Ue||(Ue=(async()=>{if(!customElements.get("ha-selector"))try{await(await window.loadCardHelpers?.())?.createCardElement({type:"entities",entities:[]})?.constructor.getConfigElement?.(),await customElements.whenDefined("ha-selector")}catch{}})()),Ue}let P=class extends V{constructor(){super(...arguments),this._ready=false,this._bulkLastSeen=null,this._clearedLastSeen=new Set}setConfig(t){let e;try{e=ot(t)}catch{e=t}this._bulkLastSeen=null,this._config={...e,type:t.type,prefix:e.prefix??"climate",zones:e.zones??[],seasons:e.seasons??ze(),season_switch:e.season_switch??"manual",weather_entity:e.weather_entity,features:{...e.features,fan_timer:e.features?.fan_timer??[15,30,60],anomaly_alerts:e.features?.anomaly_alerts??true}}}connectedCallback(){super.connectedCallback(),aa().then(()=>{this._ready=true})}_seasonProvisioned(t){const e=this.hass,s=this._config;if(!e||!s)return true;const n=s.prefix??"climate";return(s.zones??[]).some(i=>i.name&&!!e.states[`schedule.${n}_${A(i.name)}_${t}`])}_emit(t){this._config&&(this._config={...this._config,...t},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:true,composed:true})))}_setZone(t,e){const s=(this._config?.zones??[]).map((n,i)=>i===t?{...n,...e}:n);this._emit({zones:s})}_selector(t,e,s,n){return!this._ready||!customElements.get("ha-selector")?h`<input
        .value=${typeof e=="string"?e:""}
        placeholder=${n??""}
        @change=${i=>s(i.target.value)}
      />`:h`<ha-selector
      .hass=${this.hass}
      .selector=${t}
      .value=${e}
      .label=${n}
      @value-changed=${i=>s(i.detail.value)}
    ></ha-selector>`}_applyLastSeen(t,e,s){const n=this._config?.zones?.[t];n&&(s?this._clearedLastSeen.delete(e):this._clearedLastSeen.add(e),this._setZone(t,{room_sensors:bs(n.room_sensors,e,s)}))}_renderLastSeenField(t,e,s){const n=!s&&this.hass?gs(this.hass,e):null;return h`
      <div class="lastseenrow">
        ${this._selector({entity:{domain:"sensor",device_class:"timestamp"}},s??"",i=>this._applyLastSeen(t,e,String(i??"").trim()||null),"Last-seen entity (optional)")}
        ${n?h`<button
              class="link suggest"
              title="Fills the field with this entity. Nothing is written until you save."
              @click=${()=>this._applyLastSeen(t,e,n)}
            >
              Use ${n}
            </button>`:m}
      </div>
    `}_renderBulkLastSeen(t){const e=this.hass;return!e||t.every(s=>D(s.room_sensors).length===0)?m:this._bulkLastSeen===null?h`<button
        class="link"
        @click=${()=>{this._bulkLastSeen=ys(t,e,this._clearedLastSeen)}}
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
    `}_applyBulkLastSeen(){const t=this._bulkLastSeen??[],e=this.hass;this._bulkLastSeen=null,!(!e||t.length===0)&&this._emit({zones:In(this._config?.zones??[],t,e,this._clearedLastSeen)})}render(){const t=this._config;if(!t)return m;const e=t.zones??[],s=t.seasons??[];return h`
      <div class="ed">
        <h4>Zones (1-4)</h4>
        ${e.map((n,i)=>h`
            <div class="zone">
              <div class="zonehead">
                <span>Zone ${i+1}</span>
                <button
                  class="link danger"
                  @click=${()=>this._emit({zones:e.filter((a,o)=>o!==i)})}
                >
                  Remove
                </button>
              </div>
              ${this._selector({entity:{domain:"climate"}},n.entity,a=>this._setZone(i,{entity:String(a??"")}),"Thermostat")}
              <input
                class="namefield"
                .value=${n.name??""}
                placeholder="Display name"
                @change=${a=>this._setZone(i,{name:a.target.value})}
              />
              ${this._selector({entity:{domain:"sensor",device_class:"temperature",multiple:true}},D(n.room_sensors).map(a=>a.entity),a=>{const o=(a??[]).filter(Boolean),c=new Map(D(n.room_sensors).map(r=>[r.entity,r]));this._setZone(i,{room_sensors:o.map(r=>Be(c.get(r)??{entity:r}))})},"Room sensors")}
              ${D(n.room_sensors).map(a=>h`
                  <label class="fieldrow roomlabel">
                    <span class="rooment"
                      >${this.hass?.states[a.entity]?.attributes.friendly_name??a.entity}</span
                    >
                    <input
                      .value=${a.name??""}
                      placeholder="Label on card (optional)"
                      @change=${o=>{const c=o.target.value.trim();this._setZone(i,{room_sensors:D(n.room_sensors).map(r=>Be(r.entity===a.entity?{...r,name:c||void 0}:r))})}}
                    />
                  </label>
                  ${this._renderLastSeenField(i,a.entity,a.last_seen)}
                `)}
            </div>
          `)}
        ${e.length<4?h`<button
              class="link"
              @click=${()=>this._emit({zones:[...e,{entity:"",name:`Zone ${e.length+1}`}]})}
            >
              + Add zone
            </button>`:m}
        ${this._renderBulkLastSeen(e)}

        <h4>Seasons (1-4)</h4>
        ${s.map((n,i)=>h`
            <div class="seasonrow">
              <input
                .value=${n.name}
                @change=${a=>{const o=a.target.value,c=o.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""),r=s.some((u,p)=>p!==i&&u.key===c),d=this._seasonProvisioned(n.key)||!c||r?n.key:c,l=s.map((u,p)=>p===i?{...u,name:o,key:d}:u);this._emit({seasons:l})}}
              />
              <select
                .value=${n.default_mode}
                @change=${a=>{const o=a.target.value;this._emit({seasons:s.map((c,r)=>r===i?{...c,default_mode:o}:c)})}}
              >
                <option value="cool">Cool</option>
                <option value="heat">Heat</option>
                <option value="heat_cool">Heat+Cool</option>
              </select>
              <button
                class="link danger"
                @click=${()=>this._emit({seasons:s.filter((a,o)=>o!==i)})}
              >
                Remove
              </button>
            </div>
          `)}
        ${s.length<4?h`<button
              class="link"
              @click=${()=>{let n=s.length+1;for(;s.some(i=>i.key===`season_${n}`);)n++;this._emit({seasons:[...s,{key:`season_${n}`,name:`Season ${n}`,default_mode:"cool"}]})}}
            >
              + Add season
            </button>`:m}

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
        <label class="checkrow">
          <input
            type="checkbox"
            .checked=${t.features?.eco_preset!==false}
            @change=${n=>{const i=n.target.checked,a={...t.features};i?delete a.eco_preset:a.eco_preset=false,this._emit({features:a})}}
          />
          Stand down while a standby preset is active
        </label>
        ${t.features?.eco_preset!==false?h`
              <label class="fieldrow">
                Standby preset name
                <input
                  .value=${typeof t.features?.eco_preset=="string"?t.features.eco_preset:"eco"}
                  @change=${n=>{const i=n.target,a=i.value.replace(/['"\\]/g,"").trim()||"eco";i.value=a;const o={...t.features};a==="eco"?delete o.eco_preset:o.eco_preset=a,this._emit({features:o})}}
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
            `:m}

        <h4>Display</h4>
        <label class="fieldrow">
          Last-seen age on room rows
          <select
            .value=${ie(t.display).lastSeen}
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
            .value=${String(ie(t.display).ageingMs/6e4)}
            @change=${n=>{const i=Number(n.target.value),a={...this._config?.display};Number.isFinite(i)&&i>0?a.ageing_minutes=i:delete a.ageing_minutes,this._emit({display:a})}}
          />
        </label>
        <label class="fieldrow">
          Stale after (hours)
          <input
            type="number"
            min="1"
            .value=${String(ie(t.display).staleMs/36e5)}
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
            @change=${n=>{const i=n.target,a=A(i.value)||"climate";i.value=a,this._emit({prefix:a})}}
          />
        </label>
      </div>
    `}};P.styles=Jt`
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
  `;me([it({attribute:false})],P.prototype,"hass",2);me([b()],P.prototype,"_config",2);me([b()],P.prototype,"_ready",2);me([b()],P.prototype,"_bulkLastSeen",2);P=me([ss(as)],P);const oa=Object.freeze(Object.defineProperty({__proto__:null,get MzcsCardEditor(){return P}},Symbol.toStringTag,{value:"Module"}));export{y as MzcsCard};

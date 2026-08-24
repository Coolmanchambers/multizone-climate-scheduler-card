"use strict";/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ue=globalThis,je=ue.ShadowRoot&&(ue.ShadyCSS===void 0||ue.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Ie=Symbol(),Xe=new WeakMap;let Ct=class{constructor(e,s,n){if(this._$cssResult$=true,n!==Ie)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=s}get styleSheet(){let e=this.o;const s=this.t;if(je&&e===void 0){const n=s!==void 0&&s.length===1;n&&(e=Xe.get(s)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&Xe.set(s,e))}return e}toString(){return this.cssText}};const es=t=>new Ct(typeof t=="string"?t:t+"",void 0,Ie),Ot=(t,...e)=>{const s=t.length===1?t[0]:e.reduce((n,i,a)=>n+(o=>{if(o._$cssResult$===true)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[a+1],t[0]);return new Ct(s,t,Ie)},ts=(t,e)=>{if(je)t.adoptedStyleSheets=e.map(s=>s instanceof CSSStyleSheet?s:s.styleSheet);else for(const s of e){const n=document.createElement("style"),i=ue.litNonce;i!==void 0&&n.setAttribute("nonce",i),n.textContent=s.cssText,t.appendChild(n)}},Qe=je?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let s="";for(const n of e.cssRules)s+=n.cssText;return es(s)})(t):t;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:ss,defineProperty:ns,getOwnPropertyDescriptor:is,getOwnPropertyNames:as,getOwnPropertySymbols:os,getPrototypeOf:rs}=Object,ye=globalThis,et=ye.trustedTypes,cs=et?et.emptyScript:"",ls=ye.reactiveElementPolyfillSupport,Y=(t,e)=>t,me={toAttribute(t,e){switch(e){case Boolean:t=t?cs:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=t!==null;break;case Number:s=t===null?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch{s=null}}return s}},Ne=(t,e)=>!ss(t,e),tt={attribute:true,type:String,converter:me,reflect:false,useDefault:false,hasChanged:Ne};Symbol.metadata??=Symbol("metadata"),ye.litPropertyMetadata??=new WeakMap;let U=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,s=tt){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(e)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(e,s),!s.noAccessor){const n=Symbol(),i=this.getPropertyDescriptor(e,n,s);i!==void 0&&ns(this.prototype,e,i)}}static getPropertyDescriptor(e,s,n){const{get:i,set:a}=is(this.prototype,e)??{get(){return this[s]},set(o){this[s]=o}};return{get:i,set(o){const c=i?.call(this);a?.call(this,o),this.requestUpdate(e,c,n)},configurable:true,enumerable:true}}static getPropertyOptions(e){return this.elementProperties.get(e)??tt}static _$Ei(){if(this.hasOwnProperty(Y("elementProperties")))return;const e=rs(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(Y("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(Y("properties"))){const s=this.properties,n=[...as(s),...os(s)];for(const i of n)this.createProperty(i,s[i])}const e=this[Symbol.metadata];if(e!==null){const s=litPropertyMetadata.get(e);if(s!==void 0)for(const[n,i]of s)this.elementProperties.set(n,i)}this._$Eh=new Map;for(const[s,n]of this.elementProperties){const i=this._$Eu(s,n);i!==void 0&&this._$Eh.set(i,s)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const s=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const i of n)s.unshift(Qe(i))}else e!==void 0&&s.push(Qe(e));return s}static _$Eu(e,s){const n=s.attribute;return n===false?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,s=this.constructor.elementProperties;for(const n of s.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ts(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,s,n){this._$AK(e,n)}_$ET(e,s){const n=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,n);if(i!==void 0&&n.reflect===true){const a=(n.converter?.toAttribute!==void 0?n.converter:me).toAttribute(s,n.type);this._$Em=e,a==null?this.removeAttribute(i):this.setAttribute(i,a),this._$Em=null}}_$AK(e,s){const n=this.constructor,i=n._$Eh.get(e);if(i!==void 0&&this._$Em!==i){const a=n.getPropertyOptions(i),o=typeof a.converter=="function"?{fromAttribute:a.converter}:a.converter?.fromAttribute!==void 0?a.converter:me;this._$Em=i;const c=o.fromAttribute(s,a.type);this[i]=c??this._$Ej?.get(i)??c,this._$Em=null}}requestUpdate(e,s,n,i=false,a){if(e!==void 0){const o=this.constructor;if(i===false&&(a=this[e]),n??=o.getPropertyOptions(e),!((n.hasChanged??Ne)(a,s)||n.useDefault&&n.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,n))))return;this.C(e,s,n)}this.isUpdatePending===false&&(this._$ES=this._$EP())}C(e,s,{useDefault:n,reflect:i,wrapped:a},o){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??s??this[e]),a!==true||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(s=void 0),this._$AL.set(e,s)),i===true&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=true;try{await this._$ES}catch(s){Promise.reject(s)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[i,a]of this._$Ep)this[i]=a;this._$Ep=void 0}const n=this.constructor.elementProperties;if(n.size>0)for(const[i,a]of n){const{wrapped:o}=a,c=this[i];o!==true||this._$AL.has(i)||c===void 0||this.C(i,void 0,a,c)}}let e=false;const s=this._$AL;try{e=this.shouldUpdate(s),e?(this.willUpdate(s),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(s)):this._$EM()}catch(n){throw e=false,this._$EM(),n}e&&this._$AE(s)}willUpdate(e){}_$AE(e){this._$EO?.forEach(s=>s.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=false}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return true}update(e){this._$Eq&&=this._$Eq.forEach(s=>this._$ET(s,this[s])),this._$EM()}updated(e){}firstUpdated(e){}};U.elementStyles=[],U.shadowRootOptions={mode:"open"},U[Y("elementProperties")]=new Map,U[Y("finalized")]=new Map,ls?.({ReactiveElement:U}),(ye.reactiveElementVersions??=[]).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const We=globalThis,st=t=>t,fe=We.trustedTypes,nt=fe?fe.createPolicy("lit-html",{createHTML:t=>t}):void 0,Dt="$lit$",P=`lit$${Math.random().toFixed(9).slice(2)}$`,Tt="?"+P,ds=`<${Tt}>`,N=document,X=()=>N.createComment(""),Q=t=>t===null||typeof t!="object"&&typeof t!="function",He=Array.isArray,us=t=>He(t)||typeof t?.[Symbol.iterator]=="function",ke=`[ 	
\f\r]`,Z=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,it=/-->/g,at=/>/g,j=RegExp(`>|${ke}(?:([^\\s"'>=/]+)(${ke}*=${ke}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ot=/'/g,rt=/"/g,Mt=/^(?:script|style|textarea|title)$/i,ps=t=>(e,...s)=>({_$litType$:t,strings:e,values:s}),p=ps(1),F=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),ct=new WeakMap,I=N.createTreeWalker(N,129);function Pt(t,e){if(!He(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return nt!==void 0?nt.createHTML(e):e}const hs=(t,e)=>{const s=t.length-1,n=[];let i,a=e===2?"<svg>":e===3?"<math>":"",o=Z;for(let c=0;c<s;c++){const r=t[c];let l,d,u=-1,m=0;for(;m<r.length&&(o.lastIndex=m,d=o.exec(r),d!==null);)m=o.lastIndex,o===Z?d[1]==="!--"?o=it:d[1]!==void 0?o=at:d[2]!==void 0?(Mt.test(d[2])&&(i=RegExp("</"+d[2],"g")),o=j):d[3]!==void 0&&(o=j):o===j?d[0]===">"?(o=i??Z,u=-1):d[1]===void 0?u=-2:(u=o.lastIndex-d[2].length,l=d[1],o=d[3]===void 0?j:d[3]==='"'?rt:ot):o===rt||o===ot?o=j:o===it||o===at?o=Z:(o=j,i=void 0);const f=o===j&&t[c+1].startsWith("/>")?" ":"";a+=o===Z?r+ds:u>=0?(n.push(l),r.slice(0,u)+Dt+r.slice(u)+P+f):r+P+(u===-2?c:f)}return[Pt(t,a+(t[s]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]};class ee{constructor({strings:e,_$litType$:s},n){let i;this.parts=[];let a=0,o=0;const c=e.length-1,r=this.parts,[l,d]=hs(e,s);if(this.el=ee.createElement(l,n),I.currentNode=this.el.content,s===2||s===3){const u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(i=I.nextNode())!==null&&r.length<c;){if(i.nodeType===1){if(i.hasAttributes())for(const u of i.getAttributeNames())if(u.endsWith(Dt)){const m=d[o++],f=i.getAttribute(u).split(P),w=/([.?@])?(.*)/.exec(m);r.push({type:1,index:a,name:w[2],strings:f,ctor:w[1]==="."?fs:w[1]==="?"?_s:w[1]==="@"?gs:be}),i.removeAttribute(u)}else u.startsWith(P)&&(r.push({type:6,index:a}),i.removeAttribute(u));if(Mt.test(i.tagName)){const u=i.textContent.split(P),m=u.length-1;if(m>0){i.textContent=fe?fe.emptyScript:"";for(let f=0;f<m;f++)i.append(u[f],X()),I.nextNode(),r.push({type:2,index:++a});i.append(u[m],X())}}}else if(i.nodeType===8)if(i.data===Tt)r.push({type:2,index:a});else{let u=-1;for(;(u=i.data.indexOf(P,u+1))!==-1;)r.push({type:7,index:a}),u+=P.length-1}a++}}static createElement(e,s){const n=N.createElement("template");return n.innerHTML=e,n}}function K(t,e,s=t,n){if(e===F)return e;let i=n!==void 0?s._$Co?.[n]:s._$Cl;const a=Q(e)?void 0:e._$litDirective$;return i?.constructor!==a&&(i?._$AO?.(false),a===void 0?i=void 0:(i=new a(t),i._$AT(t,s,n)),n!==void 0?(s._$Co??=[])[n]=i:s._$Cl=i),i!==void 0&&(e=K(t,i._$AS(t,e.values),i,n)),e}class ms{constructor(e,s){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:s},parts:n}=this._$AD,i=(e?.creationScope??N).importNode(s,true);I.currentNode=i;let a=I.nextNode(),o=0,c=0,r=n[0];for(;r!==void 0;){if(o===r.index){let l;r.type===2?l=new ae(a,a.nextSibling,this,e):r.type===1?l=new r.ctor(a,r.name,r.strings,this,e):r.type===6&&(l=new ys(a,this,e)),this._$AV.push(l),r=n[++c]}o!==r?.index&&(a=I.nextNode(),o++)}return I.currentNode=N,i}p(e){let s=0;for(const n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,s),s+=n.strings.length-2):n._$AI(e[s])),s++}}class ae{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,s,n,i){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=e,this._$AB=s,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??true}get parentNode(){let e=this._$AA.parentNode;const s=this._$AM;return s!==void 0&&e?.nodeType===11&&(e=s.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,s=this){e=K(this,e,s),Q(e)?e===h||e==null||e===""?(this._$AH!==h&&this._$AR(),this._$AH=h):e!==this._$AH&&e!==F&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):us(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==h&&Q(this._$AH)?this._$AA.nextSibling.data=e:this.T(N.createTextNode(e)),this._$AH=e}$(e){const{values:s,_$litType$:n}=e,i=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=ee.createElement(Pt(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(s);else{const a=new ms(i,this),o=a.u(this.options);a.p(s),this.T(o),this._$AH=a}}_$AC(e){let s=ct.get(e.strings);return s===void 0&&ct.set(e.strings,s=new ee(e)),s}k(e){He(this._$AH)||(this._$AH=[],this._$AR());const s=this._$AH;let n,i=0;for(const a of e)i===s.length?s.push(n=new ae(this.O(X()),this.O(X()),this,this.options)):n=s[i],n._$AI(a),i++;i<s.length&&(this._$AR(n&&n._$AB.nextSibling,i),s.length=i)}_$AR(e=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);e!==this._$AB;){const n=st(e).nextSibling;st(e).remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class be{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,s,n,i,a){this.type=1,this._$AH=h,this._$AN=void 0,this.element=e,this.name=s,this._$AM=i,this.options=a,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=h}_$AI(e,s=this,n,i){const a=this.strings;let o=false;if(a===void 0)e=K(this,e,s,0),o=!Q(e)||e!==this._$AH&&e!==F,o&&(this._$AH=e);else{const c=e;let r,l;for(e=a[0],r=0;r<a.length-1;r++)l=K(this,c[n+r],s,r),l===F&&(l=this._$AH[r]),o||=!Q(l)||l!==this._$AH[r],l===h?e=h:e!==h&&(e+=(l??"")+a[r+1]),this._$AH[r]=l}o&&!i&&this.j(e)}j(e){e===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class fs extends be{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===h?void 0:e}}class _s extends be{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==h)}}class gs extends be{constructor(e,s,n,i,a){super(e,s,n,i,a),this.type=5}_$AI(e,s=this){if((e=K(this,e,s,0)??h)===F)return;const n=this._$AH,i=e===h&&n!==h||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,a=e!==h&&(n===h||i);i&&this.element.removeEventListener(this.name,this,n),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ys{constructor(e,s,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=s,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){K(this,e)}}const bs=We.litHtmlPolyfillSupport;bs?.(ee,ae),(We.litHtmlVersions??=[]).push("3.3.3");const $s=(t,e,s)=>{const n=s?.renderBefore??e;let i=n._$litPart$;if(i===void 0){const a=s?.renderBefore??null;n._$litPart$=i=new ae(e.insertBefore(X(),a),a,void 0,s??{})}return i._$AI(t),i};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ue=globalThis;class B extends U{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const s=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=$s(s,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false)}render(){return F}}B._$litElement$=true,B.finalized=true,Ue.litElementHydrateSupport?.({LitElement:B});const vs=Ue.litElementPolyfillSupport;vs?.({LitElement:B});(Ue.litElementVersions??=[]).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Lt=t=>(e,s)=>{s!==void 0?s.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const xs={attribute:true,type:String,converter:me,reflect:false,hasChanged:Ne},ws=(t=xs,e,s)=>{const{kind:n,metadata:i}=s;let a=globalThis.litPropertyMetadata.get(i);if(a===void 0&&globalThis.litPropertyMetadata.set(i,a=new Map),n==="setter"&&((t=Object.create(t)).wrapped=true),a.set(s.name,t),n==="accessor"){const{name:o}=s;return{set(c){const r=e.get.call(this);e.set.call(this,c),this.requestUpdate(o,r,t,true,c)},init(c){return c!==void 0&&this.C(o,void 0,t,c),c}}}if(n==="setter"){const{name:o}=s;return function(c){const r=this[o];e.call(this,c),this.requestUpdate(o,r,t,true,c)}}throw Error("Unsupported decorator location: "+n)};function Be(t){return(e,s)=>typeof s=="object"?ws(t,e,s):((n,i,a)=>{const o=i.hasOwnProperty(a);return i.constructor.createProperty(a,n),o?Object.getOwnPropertyDescriptor(i,a):void 0})(t,e,s)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function b(t){return Be({...t,state:true,attribute:false})}const ks="0.9.3",Fe="multizone-climate-scheduler-card",jt="Multi-Zone Climate Scheduler Card",It=`${Fe}-editor`;function V(t){return(t??[]).map(e=>typeof e=="string"?{entity:e}:e).filter(e=>!!e&&typeof e.entity=="string"&&e.entity!=="")}function pe(t){const e=t?.eco_preset;return e===false?null:typeof e=="string"&&e.trim()?e.trim():"eco"}function lt(t,e){const s=t.states[e];if(!s||s.state==="unavailable"||s.state==="unknown")return{available:false,mode:"unavailable",action:"",setpoint:null,targetLow:null,targetHigh:null,inside:null,humidity:null};const n=s.attributes,i=a=>typeof a=="number"?a:null;return{available:true,mode:s.state,action:typeof n.hvac_action=="string"?n.hvac_action:"",setpoint:i(n.temperature),targetLow:i(n.target_temp_low),targetHigh:i(n.target_temp_high),inside:i(n.current_temperature),humidity:i(n.current_humidity)}}function Ss(t,e){return t.states[e]?.state==="active"}function T(t,e){return t.states[e]!==void 0}function As(t,e){const s=t.states[e]?.attributes.hvac_modes;return Array.isArray(s)?s.filter(n=>typeof n=="string"):[]}function Es(t,e,s="eco"){const n=t.states[e]?.attributes.preset_modes;return Array.isArray(n)&&n.includes(s)}function dt(t,e,s="eco"){return t.states[e]?.attributes.preset_mode===s}function Se(t,e){const s=t.states[e];if(!s)return null;const n=Number(s.state);return Number.isFinite(n)?n:null}const zs=10800*1e3;function Rs(t,e,s=Date.now()){const n=t.states[e],i=typeof n?.attributes.friendly_name=="string"?n.attributes.friendly_name.replace(/ (Temperature|temperature)$/,""):e.split(".")[1]??e,a=n?Number(n.state):NaN,o=n?.last_updated?Date.parse(n.last_updated):NaN,c=Number.isFinite(o)&&s-o>zs;return{entityId:e,name:i,temp:Number.isFinite(a)?a:null,stale:c}}function Cs(t,e,s){return t.callService("climate","set_hvac_mode",{entity_id:e,hvac_mode:s})}function Os(t,e,s,n="eco"){return t.callService("climate","set_preset_mode",{entity_id:e,preset_mode:s?n:"none"})}function Ds(t,e){const s=t.states[e]?.attributes.fan_modes;return Array.isArray(s)&&s.includes("on")}async function Ts(t,e,s,n){Ds(t,e)&&await t.callService("climate","set_fan_mode",{entity_id:e,fan_mode:"on"});const i=String(n%60).padStart(2,"0"),a=String(Math.floor(n/60)).padStart(2,"0");await t.callService("timer","start",{entity_id:s,duration:`${a}:${i}:00`})}function Ms(t,e,s,n){const i=typeof s=="number"?s:null,a=typeof n=="number"?n:null;return i!=null&&a!=null&&i<a&&e!=null&&e>=i&&e<=a?Math.min(a,Math.max(i,t)):t}const Nt=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];async function ut(t,e){if(!t.callWS)return null;const s=e.split(".")[1];try{const i=(await t.callWS({type:"schedule/list"})).find(o=>o.id===s);if(!i)return null;const a={};for(const o of Nt)i[o]&&(a[o]=i[o]);return{id:String(i.id),name:typeof i.name=="string"?i.name:void 0,week:a}}catch{return null}}function Ps(t,e,s,n){if(!t.callWS)return Promise.reject(new Error("callWS unavailable"));const a={type:"schedule/update",schedule_id:e.split(".")[1],name:n};for(const o of Nt)a[o]=s[o]??[];return t.callWS(a)}function Ls(t,e,s){return t.callService("input_number","set_value",{entity_id:e,value:s})}function js(t,e,s){return t.callService("input_select","select_option",{entity_id:e,option:s})}async function pt(t,e,s,n){if(n)try{await t.callService("input_text","set_value",{entity_id:s,value:""})}catch{}await t.callService("input_boolean",n?"turn_on":"turn_off",{entity_id:e})}async function ht(t,e,s){if(!t.callWS)return[];const n=new Date;n.setHours(0,0,0,0),n.setDate(n.getDate()-(s-1));try{return((await t.callWS({type:"recorder/statistics_during_period",start_time:n.toISOString(),statistic_ids:[e],period:"day",types:["max"]}))?.[e]??[]).filter(o=>typeof o.max=="number").map(o=>({day:o.start,hours:o.max}))}catch{return[]}}function Is(t,e){const s=[];for(const n of t){if(typeof n.lu!="number")continue;const i=n.lu*1e3;if(e){const a=n.a?.[e];if(a==null)continue;s.push({t:i,state:String(a)})}else typeof n.s=="string"&&s.push({t:i,state:n.s})}return s}async function mt(t,e,s,n,i){if(!t.callWS)return[];try{const a=await t.callWS({type:"history/history_during_period",start_time:new Date(s).toISOString(),end_time:new Date(n).toISOString(),entity_ids:[e],minimal_response:!i,no_attributes:!i,significant_changes_only:false});return Is(a?.[e]??[],i)}catch{return[]}}function ft(t){return t instanceof Error?t.message:t&&typeof t=="object"&&"message"in t?String(t.message):JSON.stringify(t)}async function Ns(t,e,s){await t.callService("input_text","set_value",{entity_id:e,value:""}),await t.callService("automation","trigger",{entity_id:s})}function Ws(t,e,s){return t.callService("climate","set_temperature",{entity_id:e,temperature:s})}function Hs(t,e,s,n="on",i=6e4){const a=[...t].sort((d,u)=>d.t-u.t),o=[];let c="off";for(const d of a)if(d.t<=e)c=d.state;else break;let r=c===n?e:null;for(const d of a){if(d.t<=e||d.t>=s)continue;const u=d.state===n;u&&r==null&&(r=d.t),!u&&r!=null&&(o.push({start:r,end:d.t}),r=null)}r!=null&&o.push({start:r,end:s});const l=[];for(const d of o){const u=l[l.length-1];u&&d.start-u.end<=i?u.end=d.end:l.push({...d})}return l}function Us(t){const e=[...t].sort((n,i)=>n.t-i.t),s=[];for(const n of e){const i=Number(n.state);if(!Number.isFinite(i))continue;const a=s[s.length-1];(!a||a.value!==i)&&s.push({t:n.t,value:i})}return s}function q(t){if(!Number.isFinite(t)||t<0)return"\u2013";const e=Math.round(t*4)/4,s=Math.floor(e),n=e-s,i=n===.25?"\xBC":n===.5?"\xBD":n===.75?"\xBE":"";return s===0&&i?`${i} hr`:`${s}${i} hr`}function Bs(t,e,s){const n=s-e;return{left:(t.start-e)/n*100,width:(t.end-t.start)/n*100}}function Fs(t,e,s,n){if(!Number.isFinite(e)||e<=0)return{status:"learning",label:"learning"};if(n<6)return{status:"pending",label:""};const i=e*(Math.min(n,24)/24),a=i*(1+s/100);return t>a&&t-i>.5?{status:"high",label:"running high for the weather"}:{status:"normal",label:"normal for the weather"}}const Ke={accent:"#1e88e5",accentBright:"#42a5f5",good:"#2bb673",warn:"#f59e0b",bad:"#e5484d",bg:"#1c262e",surface:"#243039",chip:"#2b3844",track:"#16202a",border:"#3d4a55",text:"#e8edf1",textDim:"#9fb0bd"},Te={cobalt:{label:"Cobalt",tokens:Ke},ember:{label:"Ember",tokens:{accent:"#f4511e",accentBright:"#ff7043",good:"#66bb6a",warn:"#ffb300",bad:"#d32f2f",bg:"#241c18",surface:"#2f2521",chip:"#3a2d27",track:"#1a1310",border:"#54413a",text:"#f2e9e4",textDim:"#b8a69b"}},forest:{label:"Forest",tokens:{accent:"#43a047",accentBright:"#66bb6a",good:"#9ccc65",warn:"#ffa000",bad:"#e53935",bg:"#18211b",surface:"#212d25",chip:"#2a382e",track:"#111813",border:"#3d4f43",text:"#e6efe8",textDim:"#9fb3a5"}},orchid:{label:"Orchid",tokens:{accent:"#7e57c2",accentBright:"#9575cd",good:"#26a69a",warn:"#ffb300",bad:"#ec407a",bg:"#1f1b2a",surface:"#292336",chip:"#342c44",track:"#161221",border:"#4a4060",text:"#eae6f2",textDim:"#a89fbd"}},"ha-default":{label:"HA Default",tokens:{accent:"var(--primary-color, #03a9f4)",accentBright:"var(--light-primary-color, var(--primary-color, #03a9f4))",good:"var(--success-color, #2bb673)",warn:"var(--warning-color, #f59e0b)",bad:"var(--error-color, #e5484d)",bg:"var(--ha-card-background, var(--card-background-color, #fff))",surface:"var(--secondary-background-color, #f0f0f0)",chip:"var(--secondary-background-color, #f0f0f0)",track:"var(--divider-color, #e0e0e0)",border:"var(--divider-color, #e0e0e0)",text:"var(--primary-text-color, #212121)",textDim:"var(--secondary-text-color, #727272)"}}},Ae="cobalt",Me=/^#[0-9a-f]{6}$/i,_e=["accent","accentBright","good","warn","bad","bg","surface","chip","track","border","text","textDim"];function _t(t){return`custom:${_e.map(e=>t[e]).join(",")}`}function Ks(t){return _e.every(s=>Me.test(t[s]))?{...t}:{...Ke}}function gt(t){const e={presetKey:Ae,tokens:Te[Ae].tokens};if(!t)return e;const s=t==="nest-blue"?Ae:t,n=Te[s];if(n)return{presetKey:s,tokens:n.tokens};if(t.startsWith("custom:")){const i=t.slice(7).split(",");if(i.length===5&&i.every(a=>Me.test(a.trim()))){const[a,o,c,r,l]=i.map(d=>d.trim().toLowerCase());return{presetKey:"custom",tokens:{...Ke,accent:a,accentBright:o,good:c,warn:r,bad:l}}}if(i.length===_e.length&&i.every(a=>Me.test(a.trim())))return{presetKey:"custom",tokens:Object.fromEntries(_e.map((o,c)=>[o,i[c].trim().toLowerCase()]))}}return e}const O=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"],Wt=["monday","tuesday","wednesday","thursday","friday"],Zs=["saturday","sunday"];function qs(t){const e=[];t.length===0&&e.push("A day needs at least one block.");const s=new Set;for(const n of t)/^([01]\d|2[0-3]):[0-5]\d$/.test(n.time)||e.push(`Bad time "${n.time}".`),s.has(n.time)&&e.push(`Duplicate block time ${n.time}.`),s.add(n.time),n.mode==="cool"&&n.cool_temp==null&&e.push(`${n.name}: cool needs cool_temp.`),n.mode==="heat"&&n.heat_temp==null&&e.push(`${n.name}: heat needs heat_temp.`),n.mode==="heat_cool"&&(n.cool_temp==null||n.heat_temp==null)&&e.push(`${n.name}: heat_cool needs both cool_temp and heat_temp.`),n.cool_temp!=null&&n.heat_temp!=null&&n.heat_temp>=n.cool_temp&&e.push(`${n.name}: heat_temp must be below cool_temp.`);return e}function Ee(t){return{block:t.name,mode:t.mode,...t.cool_temp!=null?{cool_temp:t.cool_temp}:{},...t.heat_temp!=null?{heat_temp:t.heat_temp}:{}}}function Gs(t){const e=qs(t);if(e.length>0)throw new Error(e.join(" "));const s=[...t].sort((o,c)=>o.time.localeCompare(c.time)),n=s[0],i=s[s.length-1];if(s.length===1)return[{from:"00:00:00",to:"24:00:00",data:Ee(n)}];const a=[];n.time!=="00:00"&&a.push({from:"00:00:00",to:`${n.time}:00`,data:Ee(i)});for(let o=0;o<s.length;o++){const c=s[o],r=s[o+1];a.push({from:`${c.time}:00`,to:r?`${r.time}:00`:"24:00:00",data:Ee(c)})}return a}function Ht(t,e){if(t==="all"&&e==="all")return O;if(t==="wdwe"&&e==="wd")return Wt;if(t==="wdwe"&&e==="we")return Zs;if(t==="days"&&O.includes(e.toLowerCase()))return[e.toLowerCase()];throw new Error(`Unknown set "${e}" for granularity "${t}".`)}function Vs(t,e){const s={};for(const[n,i]of Object.entries(e)){const a=Gs(i);for(const o of Ht(t,n))s[o]=a}for(const n of O)if(!s[n])throw new Error(`No block set covers ${n}.`);return s}function Ys(t,e,s){if(t===e)return s;const n=i=>{const a=s[i];if(!a)throw new Error(`Missing set "${i}" for transition ${t}\u2192${e}.`);return a.map(o=>({...o}))};if(t==="all"&&e==="wdwe")return{wd:n("all"),we:n("all")};if(t==="all"&&e==="days")return Object.fromEntries(O.map(i=>[i,n("all")]));if(t==="wdwe"&&e==="days")return Object.fromEntries(O.map(i=>[i,Wt.includes(i)?n("wd"):n("we")]));if(t==="wdwe"&&e==="all")return{all:n("wd")};if(t==="days"&&e==="wdwe")return{wd:n("monday"),we:n("saturday")};if(t==="days"&&e==="all")return{all:n("monday")};throw new Error(`Unsupported transition ${t}\u2192${e}.`)}const he=t=>te(t);function te(t){const e=t.data;return{time:t.from.slice(0,5),name:e.block??"?",mode:e.mode??"cool",cool_temp:e.cool_temp??null,heat_temp:e.heat_temp??null}}function Js(t,e){const s=te(t),n=te(e);return s.name===n.name&&s.mode===n.mode&&s.cool_temp===n.cool_temp&&s.heat_temp===n.heat_temp}function yt(t){if(t.length===0)return[];const e=[...t].sort((o,c)=>o.from.localeCompare(c.from)),s=e[0],n=e[e.length-1];return(e.length>1&&s.from==="00:00:00"&&Js(s,n)?e.slice(1):e).map(te)}function Xs(t){return JSON.stringify([...t].sort((e,s)=>e.from.localeCompare(s.from)).map(e=>[e.from,e.to,te(e)]))}const bt=["monday","tuesday","wednesday","thursday","friday"],$t=["saturday","sunday"];function Qs(t){const e=O.map(o=>Xs(t[o]??[])),s=o=>e[O.indexOf(o)];if(e.every(o=>o===e[0]))return{granularity:"all",sets:{all:[...O]}};const i=bt.every(o=>s(o)===s("monday")),a=$t.every(o=>s(o)===s("saturday"));return i&&a?{granularity:"wdwe",sets:{wd:[...bt],we:[...$t]}}:{granularity:"days",sets:Object.fromEntries(O.map(o=>[o,[o]]))}}const vt=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];function en(t){return`${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`}function tn(t,e){return t.name===e.name&&t.mode===e.mode&&t.cool_temp===e.cool_temp&&t.heat_temp===e.heat_temp}function sn(t,e){const s=e.getDay(),n=e.getHours()*60+e.getMinutes(),i=`${en(e)}:00`,a=new Map,o=r=>{const l=((s+r)%7+7)%7;let d=a.get(l);return d||(d=[...t[vt[l]]??[]].sort((u,m)=>u.from.localeCompare(m.from)),a.set(l,d)),d},c=r=>{for(let l=1;l<=7;l++){const d=o(r-l);if(d.length)return he(d[d.length-1])}return null};for(let r=0;r<=7;r++){const l=o(r);for(let d=0;d<l.length;d++){const u=l[d];if(r===0&&u.from<=i)continue;if(r===7&&u.from>i)break;const m=d>0?he(l[d-1]):c(r),f=he(u);if(m&&tn(m,f))continue;const[w,S]=u.from.slice(0,5).split(":").map(Number),R=r*1440+(w*60+S)-n;if(R<=0)continue;const D=vt[(s+r)%7];return{...f,day:D,minutesUntil:R}}}return null}function nn(t){for(const e of O){const s=[...t[e]??[]].sort((n,i)=>n.from.localeCompare(i.from));if(s.length===0||s[0].from!=="00:00:00")return true;for(let n=1;n<s.length;n++)if(s[n].from!==s[n-1].to)return true;if(s[s.length-1].to!=="24:00:00")return true}return false}function an(t){const e=[...t].sort((i,a)=>i.from.localeCompare(a.from)),s=[];let n=0;for(const i of e){const a=M(i.from.slice(0,5)),o=i.to==="24:00:00"?1440:M(i.to.slice(0,5));a>n&&s.push({block:null,fromMin:n,toMin:a}),s.push({block:he(i),fromMin:a,toMin:o}),n=o}return n<1440&&s.push({block:null,fromMin:n,toMin:1440}),s}function on(t,e,s){const n={};for(const i of O){const a=t[i];a&&(n[i]=e.includes(i)?cn(s):a)}return n}function M(t){const[e,s]=t.split(":").map(Number);return(e??0)*60+(s??0)}function xt(t){const e=Math.max(0,Math.min(1425,t));return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function rn(t){if(t.length===0)return[];const e=[...t].sort((i,a)=>i.time.localeCompare(a.time)),s=[],n=M(e[0].time);return n>0&&s.push({block:e[e.length-1],fromMin:0,toMin:n,wrap:true}),e.forEach((i,a)=>{s.push({block:i,fromMin:M(i.time),toMin:a<e.length-1?M(e[a+1].time):1440,wrap:false})}),s}function cn(t){const e=[...t].sort((o,c)=>o.time.localeCompare(c.time));if(e.length===0)return[];const s=e[0],n=e[e.length-1],i=o=>({block:o.name,mode:o.mode,...o.cool_temp!=null?{cool_temp:o.cool_temp}:{},...o.heat_temp!=null?{heat_temp:o.heat_temp}:{}});if(e.length===1)return[{from:"00:00:00",to:"24:00:00",data:i(s)}];const a=[];s.time!=="00:00"&&a.push({from:"00:00:00",to:`${s.time}:00`,data:i(n)});for(let o=0;o<e.length;o++){const c=e[o],r=e[o+1];a.push({from:`${c.time}:00`,to:r?`${r.time}:00`:"24:00:00",data:i(c)})}return a}const Ze={fan_timer:{domain:"timer",suffix:"fan"},room_override_timer:{domain:"timer",suffix:"room_override"},running_sensor:{domain:"binary_sensor",suffix:"running"},runtime_today:{domain:"sensor",suffix:"runtime_today"},expected_runtime:{domain:"sensor",suffix:"expected_runtime"},target_room_select:{domain:"input_select",suffix:"target_room"},sensor_schedule:{domain:"schedule",suffix:"sensor_schedule"},applied_block_marker:{domain:"input_text",suffix:"applied_block"},zone_enabled:{domain:"input_boolean",suffix:"enabled"},k_factor:{domain:"input_number",suffix:"k"}},qe={season_select:{domain:"input_select",suffix:"season"},season_mode:{domain:"input_select",suffix:"season_mode"},season_confirm_days:{domain:"input_number",suffix:"season_confirm_days"},season_dwell_days:{domain:"input_number",suffix:"season_dwell_days"},dev_green_max:{domain:"input_number",suffix:"dev_green_max"},dev_amber_max:{domain:"input_number",suffix:"dev_amber_max"},runtime_alert_margin:{domain:"input_number",suffix:"runtime_alert_margin"},runtime_alert_days:{domain:"input_number",suffix:"runtime_alert_days"},runtime_learn_days:{domain:"input_number",suffix:"runtime_learn_days"},cdd_base:{domain:"input_number",suffix:"cdd_base"},override_minutes:{domain:"input_number",suffix:"override_minutes"},steer_min_setpoint:{domain:"input_number",suffix:"steer_min_setpoint"},steer_max_setpoint:{domain:"input_number",suffix:"steer_max_setpoint"},steer_max_offset:{domain:"input_number",suffix:"steer_max_offset"},next_block_sensor:{domain:"sensor",suffix:"next_block"},outdoor_temp_sensor:{domain:"sensor",suffix:"outdoor_temp"},outdoor_daily_mean:{domain:"sensor",suffix:"outdoor_daily_mean"},theme:{domain:"input_text",suffix:"theme"}};[...Object.values(Ze).map(t=>t.suffix),...Object.values(qe).map(t=>t.suffix)];function z(t){return t.toLowerCase().replace(/['’]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function x(t,e,s){const n=Ze[t];return`${n.domain}.${e}_${s}_${n.suffix}`}function Ut(t,e,s){return`schedule.${t}_${e}_${s}`}function k(t,e){const s=qe[t];return`${s.domain}.${e}_${s.suffix}`}function C(t,e){return`${t}_mzcs_${e}`}function L(t,e,s){const n=t.charAt(0).toUpperCase()+t.slice(1);return{engine:`${n}: schedule engine`,fan_timer:`${n}: ${s??"?"} fan timer finished`,season_recommender:`${n}: season recommender`,runtime_alert:`${n}: runtime anomaly alert`,runtime_learning:`${n}: runtime learning`,watchdog:`${n}: engine watchdog`,steering:`${n}: comfort steering`}[e]??`${n}: ${e}`}const ln=Object.entries(qe),dn=Object.entries(Ze);function Bt(t,e,s,n){const i=t.indexOf(".");if(i<0)return null;const a=t.slice(0,i),o=t.slice(i+1);if(o!==e&&!o.startsWith(`${e}_`))return null;const c=o.slice(e.length+1);for(const[l,d]of ln)if(a===d.domain&&c===d.suffix)return{cls:l};const r=[...s].sort((l,d)=>d.length-l.length);for(const l of r){if(c!==l&&!c.startsWith(`${l}_`))continue;const d=c.slice(l.length+1);for(const[u,m]of dn)if(a===m.domain&&d===m.suffix)return{cls:u,zone:l};if(a==="schedule"&&n.includes(d))return{cls:"zone_schedule",zone:l,season:d}}return null}const Ft=2,Kt=4;function un(t,e=Ft,s=Kt){const n=Math.abs(t);return n<=e?"green":n<=s?"amber":"red"}function ze(t){const e=Math.round(t*10)/10;return Number.isInteger(e)?String(e):e.toFixed(1)}function pn(t){const e=Math.round(t);return`${e>0?"+":""}${e}\xB0`}function hn(t,e){let s=t!=null&&t>0?t:Ft,n=e!=null&&e>0?e:Kt;return n<=s&&(n=s+1),{greenMax:s,amberMax:n}}const oe="Managed by Multi-Zone Climate Scheduler Card (mzcs).";function se(t){if(Array.isArray(t))return`[${t.map(se).join(",")}]`;if(t!==null&&typeof t=="object"){const e=t;return`{${Object.keys(e).sort().map(s=>`${JSON.stringify(s)}:${se(e[s])}`).join(",")}}`}return JSON.stringify(t)}function mn(t){const e=se(t);let s=5381;for(let n=0;n<e.length;n++)s=(s<<5)+s+e.charCodeAt(n)>>>0;return s.toString(16).padStart(8,"0")}const Zt=/\[mzcs-sig:([0-9a-f]{8})\]/;function ne(t){const e=typeof t=="string"?t.match(Zt):null;return e?e[1]:null}function ie(t){const e=String(t.description??"").replace(Zt,"").trimEnd();return mn({...t,description:e})}function re(t){const e=ie(t);return{...t,description:`${String(t.description??"")} [mzcs-sig:${e}]`}}function fn(t,e,s,n,i="eco"){const a=c=>ne(c.description),o={[C(t,"engine")]:a(qt(t,e,s,i)),[C(t,"watchdog")]:a(Yt(t)),[C(t,"runtime_learning")]:a(Vt(t,e)),[C(t,"runtime_alert")]:a(Jt(t,e))};for(const c of e)o[C(t,`fan_timer_${c.slug}`)]=a(Gt(t,c,n));return o}function qt(t,e,s,n="eco"){const i=n===null?null:n.replace(/['"\\]/g,"").trim()||"eco",a=i===null?"":i==="eco"?" Zones stand down while their Eco preset is active.":` Zones stand down while their '${i}' preset is active.`,o=i===null?"Skip when zone disabled, already applied, or no block data":i==="eco"?"Skip when zone disabled, already applied, Eco active, or no block data":"Skip when zone disabled, already applied, standby preset active, or no block data",c=i===null?"":` and state_attr(repeat.item.climate, 'preset_mode') != '${i}'`,r=e.flatMap(u=>s.map(m=>Ut(t,u.slug,m.key))),l=e.map(u=>x("zone_enabled",t,u.slug)),d=`{${s.map(u=>`'${u.name.replace(/'/g,"")}': '${u.key}'`).join(", ")}}`;return re({id:C(t,"engine"),alias:L(t,"engine"),description:`${oe} Applies the active season's schedule block to each ENABLED zone at block transitions. Per-zone applied-block markers mean manual changes and external raises HOLD until the next block; the 15-minute tick only recovers missed transitions.${a} heat_cool blocks apply dual setpoints.`,mode:"queued",max:5,triggers:[{trigger:"state",entity_id:r,alias:"Any zone schedule changed"},{trigger:"homeassistant",event:"start",alias:"HA started"},{trigger:"time_pattern",minutes:"/15",alias:"Safety tick"},{trigger:"state",entity_id:k("season_select",t),alias:"Season changed"},{trigger:"state",entity_id:l,to:"on",alias:"Zone re-enabled"}],conditions:[],actions:[{alias:"Resolve the active season key",variables:{season:`{{ ${d}.get(states('${k("season_select",t)}'), states('${k("season_select",t)}') | lower) }}`}},{alias:"Apply per zone",repeat:{for_each:e.map(u=>({zone:u.slug,climate:u.climate,marker:x("applied_block_marker",t,u.slug),enabled:x("zone_enabled",t,u.slug)})),sequence:[{alias:"Read this zone's active block",variables:{blk:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'block') }}`,blk_mode:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'mode') }}`,blk_cool:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'cool_temp') }}`,blk_heat:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'heat_temp') }}`}},{alias:o,condition:"template",value_template:`{{ is_state(repeat.item.enabled, 'on') and blk is not none and blk != states(repeat.item.marker)${c} }}`},{alias:"Apply the block (dual range, off, or single target)",continue_on_error:true,choose:[{conditions:[{condition:"template",value_template:"{{ blk_mode == 'heat_cool' }}"}],sequence:[{alias:"Apply heat_cool range",action:"climate.set_temperature",target:{entity_id:"{{ repeat.item.climate }}"},data:{target_temp_high:"{{ blk_cool }}",target_temp_low:"{{ blk_heat }}",hvac_mode:"heat_cool"}}]},{conditions:[{condition:"template",value_template:"{{ blk_mode == 'off' }}"}],sequence:[{alias:"Turn the zone off",action:"climate.set_hvac_mode",target:{entity_id:"{{ repeat.item.climate }}"},data:{hvac_mode:"off"}}]},{conditions:[{condition:"template",value_template:"{{ blk_cool is not none or blk_heat is not none }}"}],sequence:[{alias:"Apply single target",action:"climate.set_temperature",target:{entity_id:"{{ repeat.item.climate }}"},data:{temperature:"{{ blk_cool if blk_cool is not none else blk_heat }}",hvac_mode:"{{ blk_mode }}"}}]}],default:[]},{alias:"Record the applied block",action:"input_text.set_value",target:{entity_id:"{{ repeat.item.marker }}"},data:{value:"{{ blk }}"}}]}}]})}function Gt(t,e,s){return re({id:C(t,`fan_timer_${e.slug}`),alias:L(t,"fan_timer",e.name),description:`${oe} Turns the ${e.name} fan off when its fan timer ends.`,mode:"single",triggers:[{trigger:"event",event_type:"timer.finished",event_data:{entity_id:x("fan_timer",t,e.slug)},alias:`${e.name} fan timer finished`}],conditions:s?[{alias:"Stand down while the fan-guard helper wants the fan running",condition:"state",entity_id:s,state:"off"}]:[],actions:[{alias:`Turn the ${e.name} fan off`,action:"climate.set_fan_mode",target:{entity_id:e.climate},data:{fan_mode:"off"}}]})}function Vt(t,e){return re({id:C(t,"runtime_learning"),alias:L(t,"runtime_learning"),description:`${oe} Nightly EMA update of each zone's runtime-per-cooling-degree-day factor. Skips mild days; first valid day seeds directly.`,mode:"single",triggers:[{trigger:"time",at:"23:58:00",alias:"Nightly close"}],conditions:[],actions:[{alias:"Compute today's cooling degree-days",variables:{cdd:`{{ [ (states('sensor.${t}_outdoor_daily_mean') | float(0)) - (states('${k("cdd_base",t)}') | float(75)), 0 ] | max }}`,alpha:`{{ 2 / ((states('${k("runtime_learn_days",t)}') | float(30)) + 1) }}`}},{alias:"Skip mild days",condition:"template",value_template:"{{ cdd > 0.5 }}"},{alias:"Update k per zone",repeat:{for_each:e.map(s=>({runtime:x("runtime_today",t,s.slug),k:x("k_factor",t,s.slug)})),sequence:[{alias:"Compute the EMA",variables:{runtime_h:"{{ states(repeat.item.runtime) | float(-1) }}",old_k:"{{ states(repeat.item.k) | float(0) }}"}},{alias:"Skip if unavailable",condition:"template",value_template:"{{ runtime_h >= 0 }}"},{alias:"Write the new k",action:"input_number.set_value",target:{entity_id:"{{ repeat.item.k }}"},data:{value:"{{ ((runtime_h / cdd) if old_k == 0 else (alpha * (runtime_h / cdd) + (1 - alpha) * old_k)) | round(2) }}"}}]}}]})}function Yt(t){const e="automation."+L(t,"engine").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");return re({id:C(t,"watchdog"),alias:L(t,"watchdog"),description:`${oe} Alerts when the schedule engine automation is off or unavailable for 5 minutes.`,mode:"single",triggers:[{trigger:"state",entity_id:e,to:["off","unavailable"],for:{minutes:5},alias:"Engine down"}],conditions:[],actions:[{alias:"Notify all admins via persistent notification",action:"persistent_notification.create",data:{title:"Climate schedule engine is down",message:"The Climate: schedule engine automation is off or unavailable. Zone schedules are not being applied - your thermostats hold their last setpoints (their own app schedules still work)."}}]})}function Jt(t,e){return re({id:C(t,"runtime_alert"),alias:L(t,"runtime_alert"),description:`${oe} Evening check: notifies when a zone's runtime is over the weather-normalized expectation by the alert margin. Uses learned k; silent while learning.`,mode:"single",triggers:[{trigger:"time",at:"20:00:00",alias:"Evening check"}],conditions:[],actions:[{alias:"Check each zone",repeat:{for_each:e.map(s=>({name:s.name,runtime:x("runtime_today",t,s.slug),expected:x("expected_runtime",t,s.slug)})),sequence:[{alias:"Compute exceedance",variables:{run_h:"{{ states(repeat.item.runtime) | float(0) }}",exp_h:"{{ states(repeat.item.expected) | float(0) }}",margin:`{{ states('${k("runtime_alert_margin",t)}') | float(35) }}`}},{alias:"Only alert on a real, learned exceedance",condition:"template",value_template:"{{ exp_h > 0 and run_h > exp_h * (1 + margin / 100) and (run_h - exp_h) > 1 }}"},{alias:"Notify",action:"persistent_notification.create",data:{title:"HVAC running high",message:"{{ repeat.item.name }} has run {{ run_h | round(1) }}h today vs ~{{ exp_h | round(1) }}h expected for this weather. Worth a look (filters, doors, refrigerant)."}}]}}]})}const wt="mzcs",kt="r1",_n=[{cls:"season_confirm_days",min:1,max:14,step:1,initial:3},{cls:"season_dwell_days",min:1,max:60,step:1,initial:14},{cls:"dev_green_max",min:1,max:10,step:1,initial:2,unit:"\xB0F"},{cls:"dev_amber_max",min:1,max:15,step:1,initial:4,unit:"\xB0F"},{cls:"runtime_alert_margin",min:5,max:100,step:5,initial:35,unit:"%"},{cls:"runtime_alert_days",min:1,max:7,step:1,initial:3},{cls:"runtime_learn_days",min:7,max:60,step:1,initial:30},{cls:"cdd_base",min:60,max:80,step:1,initial:75,unit:"\xB0F"}],gn=[{cls:"override_minutes",min:15,max:240,step:15,initial:60},{cls:"steer_min_setpoint",min:50,max:80,step:1,initial:68},{cls:"steer_max_setpoint",min:70,max:95,step:1,initial:85},{cls:"steer_max_offset",min:1,max:10,step:1,initial:5}];function yn(t){return Vs(t.granularity,t.sets)}function G(t){const e=[],s=t.prefix,n=s.charAt(0).toUpperCase()+s.slice(1);for(const r of t.zones){t.features.fan_timer&&e.push({id:x("fan_timer",s,r.slug),kind:"helper",spec:{name:`${n} ${r.name} fan`,restore:true}}),e.push({id:x("running_sensor",s,r.slug),kind:"template_sensor",spec:{name:`${n} ${r.name} running`},meta:{source:"hvac_action"}}),e.push({id:x("runtime_today",s,r.slug),kind:"stats_sensor",spec:{name:`${n} ${r.name} runtime today`},meta:{model:"history_stats"}}),e.push({id:x("expected_runtime",s,r.slug),kind:"template_sensor",spec:{name:`${n} ${r.name} expected runtime`},meta:{model:"k_x_cdd"}}),e.push({id:x("applied_block_marker",s,r.slug),kind:"helper",spec:{name:`${n} ${r.name} applied block`}}),e.push({id:x("zone_enabled",s,r.slug),kind:"helper",spec:{name:`${n} ${r.name} enabled`}}),e.push({id:x("k_factor",s,r.slug),kind:"helper",spec:{name:`${n} ${r.name} K`,min:0,max:10,step:.01}}),t.features.steering&&(e.push({id:x("target_room_select",s,r.slug),kind:"helper",spec:{name:`${n} ${r.name} target room`,options:["Thermostat"]}}),e.push({id:x("room_override_timer",s,r.slug),kind:"helper",spec:{name:`${n} ${r.name} room override`,restore:true}}),e.push({id:x("sensor_schedule",s,r.slug),kind:"schedule",spec:{name:`${n} ${r.name} sensor schedule`}}));for(const l of t.seasons){const d=t.schedules[r.slug]?.[l.key];if(!d)throw new Error(`Missing schedule for ${r.slug}/${l.key}.`);e.push({id:Ut(s,r.slug,l.key),kind:"schedule",spec:{name:`${n} ${r.name} ${l.name}`},meta:{week:yn(d)}})}}e.push({id:k("season_select",s),kind:"helper",spec:{name:`${n} season`,options:t.seasons.map(r=>r.name)}}),e.push({id:k("season_mode",s),kind:"helper",spec:{name:`${n} season mode`,options:["Manual","Semi-auto","Full-auto"]}});for(const r of _n)e.push({id:k(r.cls,s),kind:"helper",spec:{name:`${n} ${r.cls.replace(/_/g," ")}`,min:r.min,max:r.max,step:r.step,...r.unit?{unit:r.unit}:{}},meta:{seed:r.initial}});if(t.features.steering)for(const r of gn)e.push({id:k(r.cls,s),kind:"helper",spec:{name:`${n} ${r.cls.replace(/_/g," ")}`,min:r.min,max:r.max,step:r.step},meta:{seed:r.initial}});e.push({id:k("next_block_sensor",s),kind:"template_sensor",spec:{name:`${n} next block`}}),e.push({id:k("outdoor_temp_sensor",s),kind:"template_sensor",spec:{name:`${n} outdoor temp`},meta:{source:"weather"}}),e.push({id:k("outdoor_daily_mean",s),kind:"stats_sensor",spec:{name:`${n} outdoor daily mean`},meta:{model:"statistics_mean"}}),e.push({id:k("theme",s),kind:"helper",spec:{name:`${n} theme`}});const i=t.zones.map(r=>({...r,climate:r.climate??`climate.${r.slug}`})),a=fn(s,i,t.seasons,t.features.fan_guard,pe(t.features)),o=(r,l)=>{const d=C(s,r);return{id:`automation:${d}`,kind:"automation",spec:{alias:L(s,r,l),sig:a[d]??kt}}};if(e.push(o("engine")),e.push(o("watchdog")),e.push(o("runtime_learning")),t.features.anomaly_alerts&&e.push(o("runtime_alert")),t.features.fan_timer)for(const r of t.zones){const l=C(s,`fan_timer_${r.slug}`);e.push({id:`automation:${l}`,kind:"automation",spec:{alias:L(s,"fan_timer",r.name),sig:a[l]??kt}})}const c=new Set;for(const r of e){if(c.has(r.id))throw new Error(`Naming collision: two configured objects both resolve to "${r.id}". Rename the conflicting zone or season.`);c.add(r.id)}return e}function bn(t,e){return se(t)===se(e)}function H(t,e){const s={create:[],adopt:[],update:[],delete:[],noop:[]},n=new Map(e.map(a=>[a.id,a])),i=new Set(t.map(a=>a.id));for(const a of t){const o=n.get(a.id);o?o.managed?bn(o.spec,a.spec)?s.noop.push({op:"noop",id:a.id,kind:a.kind}):s.update.push({op:"update",id:a.id,kind:a.kind,spec:a.spec,from:o.spec}):s.adopt.push({op:"adopt",id:a.id,kind:a.kind,spec:a.spec}):s.create.push({op:"create",id:a.id,kind:a.kind,spec:a.spec,...a.meta?{meta:a.meta}:{}})}for(const a of e)a.managed&&!i.has(a.id)&&s.delete.push({op:"delete",id:a.id,kind:a.kind});return s}function $n(t){return[...t.create,...t.adopt,...t.update,...t.delete]}function vn(t){const e=t.default_mode;return{granularity:"all",sets:{all:[{time:"06:00",name:"Day",mode:e,cool_temp:e==="heat"?null:e==="heat_cool"?84:78,heat_temp:e==="heat"?68:e==="heat_cool"?66:null}]}}}function xn(t,e){const s={};for(const n of t){s[n]={};for(const i of e)s[n][i.key]=vn(i)}return s}const wn={fan_timer:"helper",room_override_timer:"helper",target_room_select:"helper",applied_block_marker:"helper",zone_enabled:"helper",theme:"helper",k_factor:"helper",season_select:"helper",season_mode:"helper",season_confirm_days:"helper",season_dwell_days:"helper",dev_green_max:"helper",dev_amber_max:"helper",runtime_alert_margin:"helper",runtime_alert_days:"helper",runtime_learn_days:"helper",cdd_base:"helper",override_minutes:"helper",steer_min_setpoint:"helper",steer_max_setpoint:"helper",steer_max_offset:"helper",running_sensor:"template_sensor",expected_runtime:"template_sensor",next_block_sensor:"template_sensor",outdoor_temp_sensor:"template_sensor",outdoor_daily_mean:"stats_sensor",runtime_today:"stats_sensor",zone_schedule:"schedule",sensor_schedule:"schedule"};async function le(t,e){if(!t.callWS)return[];try{const s=await t.callWS({type:`${e}/list`});return Array.isArray(s)?s:[]}catch(s){throw new Error(`Could not read the ${e} list from Home Assistant: ${s instanceof Error?s.message:String(s)}`)}}async function St(t,e){const s=new Map;if(!t.callWS||e.length===0)return s;try{const n=await t.callWS({type:"config/entity_registry/get_entries",entity_ids:e});for(const[i,a]of Object.entries(n??{}))a?.labels&&s.set(i,a.labels)}catch{}return s}async function kn(t,e,s,n){const i=[],a=new Set;for(const _ in t.states){const y=Bt(_,e,s,n);if(!y)continue;const v=wn[y.cls];v&&(i.push({id:_,kind:v}),a.add(_))}const o=[...s].sort((_,y)=>y.length-_.length);for(const _ in t.states){if(!_.startsWith(`schedule.${e}_`)||a.has(_))continue;const y=_.slice(`schedule.${e}_`.length);for(const v of o){if(!y.startsWith(`${v}_`))continue;const A=y.slice(v.length+1);A&&A!=="sensor_schedule"&&i.push({id:_,kind:"schedule"});break}}const[c,r,l,d,u]=await Promise.all([le(t,"timer"),le(t,"input_select"),le(t,"input_number"),le(t,"schedule"),St(t,i.map(_=>_.id))]),m=(_,y)=>{const v=new Map;for(const A of _)A.id&&v.set(`${y}.${A.id}`,A);return v},f=new Map([...m(c,"timer"),...m(r,"input_select"),...m(l,"input_number"),...m(d,"schedule")]),w=[];for(const _ of i){const y=f.get(_.id),v=t.states[_.id];let A={};if(_.id.startsWith("input_number.")&&y){const E=y.unit_of_measurement;A={name:y.name,min:y.min,max:y.max,step:y.step,...E!=null?{unit:E}:{}}}else _.id.startsWith("input_select.")&&y?A={name:y.name,options:y.options}:_.id.startsWith("timer.")&&y?A={name:y.name,restore:y.restore??false}:_.id.startsWith("schedule.")&&y?A={name:y.name}:v&&(A={name:v.attributes.friendly_name??_.id});w.push({id:_.id,kind:_.kind,spec:A,managed:(u.get(_.id)??[]).includes(wt)})}const S=[];for(const _ in t.states){if(!_.startsWith("automation."))continue;const y=t.states[_];if(!y)continue;const v=y.attributes.id;typeof v=="string"&&v.startsWith(`${e}_mzcs_`)&&S.push({cfgId:v,entityId:_,alias:String(y.attributes.friendly_name??v)})}const[R,D]=await Promise.all([Promise.all(S.map(async({cfgId:_})=>{if(!t.callApi)return{sig:"unknown",pristine:void 0};try{const y=await t.callApi("GET",`config/automation/config/${_}`),v=ne(y?.description);return{sig:v??"unknown",pristine:v?ie(y)===v:false}}catch{return{sig:"unknown",pristine:void 0}}})),St(t,S.map(_=>_.entityId))]);return S.forEach(({cfgId:_,entityId:y,alias:v},A)=>{w.push({id:`automation:${_}`,kind:"automation",spec:{alias:v,sig:R[A].sig},managed:(D.get(y)??[]).includes(wt),pristine:R[A].pristine})}),w}const Xt=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];function Ge(t){return t instanceof Error?t.message:t&&typeof t=="object"?JSON.stringify(t):String(t)}function Sn(t){const e=t;return e&&(e.status_code===404||e.status===404)?true:/\b404\b|not.found/i.test(Ge(t))}function J(t){const e=t.indexOf(".");return{domain:t.slice(0,e),objectId:t.slice(e+1)}}function Pe(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function Le(t,e){const s=Bt(t,e.prefix,e.zones.map(n=>n.slug),e.seasons.map(n=>n.key));return s?.zone?e.zones.find(n=>n.slug===s.zone)??null:null}async function Re(t,e,s,n){const i=`${e}.${Pe(s)}`,a=[i,...[2,3,4,5].map(o=>`${i}_${o}`)];for(let o=0;o<3;o++){try{const c=await t.callWS({type:"config/entity_registry/get_entries",entity_ids:a});for(const r of a)if(c?.[r]?.config_entry_id===n)return r}catch{}await new Promise(c=>setTimeout(c,400*(o+1)))}throw new Error(`Could not locate the entity created by flow entry ${n} (expected around ${i})`)}async function Ce(t,e,s,n){if(e===s)return;let i;for(let a=0;a<3;a++)try{await t.callWS({type:"config/entity_registry/update",entity_id:e,new_entity_id:s}),n.log(`Renamed ${e} -> ${s}`);return}catch(o){i=o,await new Promise(c=>setTimeout(c,400*(a+1)))}throw new Error(`Could not rename ${e} to its contract id ${s} (${i instanceof Error?i.message:"registry error"})`)}async function An(t,e){try{await t.callWS({type:"config/label_registry/create",name:"mzcs",color:"blue",icon:"mdi:thermostat-box"}),e.log("Created label mzcs")}catch{}}async function ge(t,e){try{const n=(await t.callWS({type:"config/entity_registry/get_entries",entity_ids:[e]}))?.[e]?.labels??[];n.includes("mzcs")||await t.callWS({type:"config/entity_registry/update",entity_id:e,labels:[...n,"mzcs"]})}catch{}}function En(t,e){for(const s in t.states)if(s.startsWith("automation.")&&t.states[s]?.attributes.id===e)return s;return null}async function Oe(t,e,s,n){if(!t.callApi)throw new Error("callApi unavailable");let i=await t.callApi("POST","config/config_entries/flow",{handler:e,show_advanced_options:true});const a={...n};for(let o=0;o<8;o++){if(i.type==="create_entry"){const c=i.result?.entry_id;if(!c)throw new Error(`Flow ${e}: created an entry but returned no entry_id`);return c}if(i.type==="menu"){if(!s)throw new Error(`Flow ${e}: unexpected menu`);i=await t.callApi("POST",`config/config_entries/flow/${i.flow_id}`,{next_step_id:s});continue}if(i.type==="form"){const c=(i.data_schema??[]).map(l=>l.name),r={};for(const l of c)l in a&&(r[l]=a[l],delete a[l]);i=await t.callApi("POST",`config/config_entries/flow/${i.flow_id}`,r);continue}throw new Error(`Flow ${e}: unhandled step type ${i.type}`)}throw new Error(`Flow ${e}: did not complete`)}function zn(t){return`{${t.seasons.map(e=>`'${e.name.replace(/'/g,"")}': '${e.key}'`).join(", ")}}`}function Rn(t,e,s){const{objectId:n}=J(t),i=String(e.name??n),a=s.prefix;if(t.startsWith("binary_sensor.")&&e.source==="hvac_action"){const o=Le(t,s);return o?{handler:"template",menu:"binary_sensor",fields:{name:i,state:`{{ state_attr('${o.climate}', 'hvac_action') in ['cooling', 'heating'] }}`,device_class:"running"}}:null}if(t.startsWith("sensor.")&&e.model==="k_x_cdd"){const o=Le(t,s);return o?{handler:"template",menu:"sensor",fields:{name:i,state:`{{ (states('input_number.${a}_${o.slug}_k') | float(0)) * ([ (states('sensor.${a}_outdoor_daily_mean') | float(0)) - (states('input_number.${a}_cdd_base') | float(75)), 0 ] | max) | round(2) }}`,unit_of_measurement:"h",state_class:"measurement"}}:null}if(t===`sensor.${a}_next_block`){const o=`input_select.${a}_season`;return{handler:"template",menu:"sensor",fields:{name:i,state:`{% set season = ${zn(s)}.get(states('${o}'), states('${o}') | lower) %}{% set evs = states.schedule | selectattr('entity_id', 'search', '^schedule\\.${a}_[a-z0-9_]+_' ~ season ~ '$') | map(attribute='attributes.next_event') | reject('none') | list %}{{ evs | min if evs | count > 0 else 'unknown' }}`}}}return t===`sensor.${a}_outdoor_temp`&&e.source==="weather"&&s.weatherEntity?{handler:"template",menu:"sensor",fields:{name:i,state:`{{ state_attr('${s.weatherEntity}', 'temperature') }}`,unit_of_measurement:"\xB0F",state_class:"measurement"}}:null}function Qt(t,e){const s=e.prefix;if(t===`${s}_mzcs_engine`)return qt(s,e.zones,e.seasons,e.ecoPreset===void 0?"eco":e.ecoPreset);if(t===`${s}_mzcs_watchdog`)return Yt(s);if(t===`${s}_mzcs_runtime_learning`)return Vt(s,e.zones);if(t===`${s}_mzcs_runtime_alert`)return Jt(s,e.zones);const n=t.match(new RegExp(`^${s}_mzcs_fan_timer_(.+)$`));if(n){const i=e.zones.find(a=>a.slug===n[1]);return i?Gt(s,i,e.fanGuard):null}return null}async function Cn(t,e,s){const n={...e.spec,...e.meta??{}};if(e.id.startsWith("automation:")){const o=e.id.slice(11),c=Qt(o,s);if(!c)return s.log(`SKIP ${e.id} - no payload generator`),null;let r=null;try{r=await t.callApi("GET",`config/automation/config/${o}`)}catch(l){if(!Sn(l))throw new Error(`Could not verify whether ${e.id} already exists: ${Ge(l)}`);r=null}if(r){const l=ne(r.description);return l&&ie(r)===l?(await t.callApi("POST",`config/automation/config/${o}`,c),await ge(t,`automation.${Pe(String(c.alias))}`),s.log(`Recreated ${e.id} (existed in storage, pristine)`),{kind:"automation",automationId:o,preexisted:true}):(s.log(`KEEP ${e.id} - exists in storage but is customized/unsigned; not overwritten`),null)}return await t.callApi("POST",`config/automation/config/${o}`,c),await ge(t,`automation.${Pe(String(c.alias))}`),{kind:"automation",automationId:o}}const{domain:i,objectId:a}=J(e.id);if(["timer","input_text","input_select","input_number","input_boolean","schedule"].includes(i)){const o=String(n.name??a),c={};if(i==="timer"&&Object.assign(c,{restore:n.restore??true,duration:"0:30:00"}),i==="input_select"&&Object.assign(c,{options:n.options??["-"]}),i==="input_number"&&Object.assign(c,{min:n.min??0,max:n.max??100,step:n.step??1,...n.unit?{unit_of_measurement:n.unit}:{}}),i==="schedule"){const d=n.week;for(const u of Xt)c[u]=d?.[u]??[]}const l=(await t.callWS({type:`${i}/create`,...c,name:a}))?.id??a;if(l!==a){try{await t.callWS({type:`${i}/delete`,[`${i}_id`]:l})}catch{s.log(`WARN: could not remove stray ${i} item ${l}`)}throw new Error(`HA assigned id "${l}" instead of "${a}" for ${e.id} - an object with that id likely already exists (possibly registry-disabled)`)}if(o!==l)try{await t.callWS({type:`${i}/update`,[`${i}_id`]:l,...c,name:o})}catch{s.log(`NOTE: created ${e.id} but could not set its display name to "${o}"`)}if(i==="input_number"&&typeof n.seed=="number")try{await t.callService("input_number","set_value",{entity_id:e.id,value:n.seed})}catch{s.log(`NOTE: created ${e.id} but could not seed its default value ${n.seed}`)}return{kind:"collection",domain:i,itemId:l}}if(e.kind==="template_sensor"||e.kind==="stats_sensor"){if(e.kind==="stats_sensor"){const l=String(n.name??a);if(n.model==="statistics_mean"){if(!s.weatherEntity)return s.log(`SKIP ${e.id} - no weather entity configured (CDD learning stays off)`),null;const m=await Oe(t,"statistics",null,{name:l,entity_id:`sensor.${s.prefix}_outdoor_temp`,state_characteristic:"mean",sampling_size:500,max_age:{hours:24,minutes:0,seconds:0},keep_last_sample:false,percentile:50,precision:1});return await Ce(t,await Re(t,"sensor",l,m),e.id,s),{kind:"config_entry",entryId:m}}const d=Le(e.id,s);if(!d)return s.log(`SKIP ${e.id} - no zone match`),null;const u=await Oe(t,"history_stats",null,{name:l,entity_id:`binary_sensor.${s.prefix}_${d.slug}_running`,type:"time",state:["on"],start:"{{ today_at() }}",end:"{{ now() }}"});return await Ce(t,await Re(t,"sensor",l,u),e.id,s),{kind:"config_entry",entryId:u}}const o=Rn(e.id,n,s);if(!o)return n.source==="weather"&&!s.weatherEntity?s.log(`SKIP ${e.id} - no weather entity configured`):s.log(`SKIP ${e.id} - not flow-creatable`),null;const c=await Oe(t,o.handler,o.menu,o.fields),r=o.menu==="binary_sensor"?"binary_sensor":"sensor";return await Ce(t,await Re(t,r,String(o.fields.name),c),e.id,s),{kind:"config_entry",entryId:c}}return s.log(`SKIP ${e.id} - unsupported kind ${e.kind}`),null}async function On(t,e,s){for(const n of[...e].reverse())try{n.kind==="collection"?await t.callWS({type:`${n.domain}/delete`,[`${n.domain}_id`]:n.itemId}):n.kind==="automation"?await t.callApi("DELETE",`config/automation/config/${n.automationId}`):n.kind==="config_entry"&&n.entryId&&await t.callApi("DELETE",`config/config_entries/entry/${n.entryId}`),s.log(`Rolled back ${n.itemId??n.automationId??n.entryId}`)}catch{s.log(`ROLLBACK FAILED for ${n.itemId??n.automationId??n.entryId} - remove manually`)}}async function At(t,e,s){const n={created:0,adopted:0,updated:0,deleted:0,skipped:0,ok:true},i=[];let a="create";await An(t,s);try{for(const o of e.create){const c=await Cn(t,o,s);c?(c.preexisted||i.push(c),n.created++,s.log(`Created ${o.id}`),o.id.startsWith("automation:")||await ge(t,o.id)):n.skipped++}a="adopt";for(const o of e.adopt){const c=o.id.startsWith("automation:")?En(t,o.id.slice(11)):o.id;c&&await ge(t,c),n.adopted++,s.log(`Adopted ${o.id}`)}a="update";for(const o of e.update)if(o.kind==="helper"){const{domain:c,objectId:r}=J(o.id),{unit:l,...d}=o.spec,u={...d,...l?{unit_of_measurement:l}:{}};try{await t.callWS({type:`${c}/update`,[`${c}_id`]:r,...u}),n.updated++,s.log(`Updated ${o.id}`)}catch{n.skipped++,s.log(`SKIP update ${o.id} - not updatable`)}}else if(o.kind==="automation"&&t.callApi){const c=o.id.slice(11),r=Qt(c,s);if(!r)n.skipped++,s.log(`KEEP ${o.id} - no generator for this automation`);else try{const l=await t.callApi("GET",`config/automation/config/${c}`),d=ne(l?.description);d&&ie(l)===d?(await t.callApi("POST",`config/automation/config/${c}`,r),n.updated++,s.log(`Regenerated ${o.id} (config changed; automation was untouched)`)):(n.skipped++,s.log(`KEEP ${o.id} - customized since generation; review it manually`))}catch{n.skipped++,s.log(`KEEP ${o.id} - could not read its config to verify`)}}else if((o.kind==="template_sensor"||o.kind==="stats_sensor")&&t.callWS)try{await t.callWS({type:"config/entity_registry/update",entity_id:o.id,name:String(o.spec.name??"")}),n.updated++,s.log(`Renamed ${o.id} to "${String(o.spec.name)}"`)}catch{n.skipped++,s.log(`SKIP update ${o.id} - could not set its display name`)}else if(o.kind==="schedule"&&t.callWS){const{objectId:c}=J(o.id);try{let r=c;try{const f=(await t.callWS({type:"config/entity_registry/get_entries",entity_ids:[o.id]}))?.[o.id]?.unique_id;typeof f=="string"&&f&&(r=f)}catch{}const d=(await t.callWS({type:"schedule/list"})).find(m=>m.id===r);if(!d)throw new Error(`no storage item "${r}"`);const u={};for(const m of Xt)u[m]=d[m]??[];await t.callWS({type:"schedule/update",schedule_id:r,name:String(o.spec.name??c),...u}),n.updated++,s.log(`Renamed ${o.id} to "${String(o.spec.name)}" (blocks preserved)`)}catch(r){n.skipped++,s.log(`SKIP update ${o.id} - could not rename without touching its blocks (${Ge(r)})`)}}else n.skipped++,s.log(`KEEP ${o.id} - ${o.kind} updates never overwrite existing content`);a="delete";for(const o of e.delete){if(o.id.startsWith("automation:")){const c=o.id.slice(11);let r=null;try{r=await t.callApi("GET",`config/automation/config/${c}`)}catch{r=null}if(!r){n.skipped++,s.log(`SKIP delete ${o.id} - config not readable`);continue}const l=ne(r.description);if(!(l&&ie(r)===l)){n.skipped++,s.log(`KEEP ${o.id} - customized or unsigned; delete it manually if intended`);continue}s.log(`snapshot ${c}: ${JSON.stringify(r)}`),await t.callApi("DELETE",`config/automation/config/${c}`)}else if(o.kind==="template_sensor"||o.kind==="stats_sensor"){let c;try{c=(await t.callWS({type:"config/entity_registry/get_entries",entity_ids:[o.id]}))?.[o.id]?.config_entry_id}catch{c=void 0}if(!c){n.skipped++,s.log(`SKIP delete ${o.id} - no owning config entry found; remove it manually`);continue}s.log(`snapshot ${o.id}: config entry ${c}`),await t.callApi("DELETE",`config/config_entries/entry/${c}`)}else{const{domain:c,objectId:r}=J(o.id);if(c==="schedule")try{const d=(await t.callWS({type:"schedule/list"})).find(u=>u.id===r);d&&s.log(`snapshot ${r}: ${JSON.stringify(d)}`)}catch{s.log(`NOTE: could not snapshot ${o.id} before delete`)}await t.callWS({type:`${c}/delete`,[`${c}_id`]:r})}n.deleted++,s.log(`Deleted ${o.id}`)}}catch(o){n.ok=false,s.log(`ERROR during ${a}: ${o instanceof Error?o.message:String(o)} - rolling back this run's creates. Already-applied updates/deletes from this run are NOT reverted; see the log above for what landed.`),await On(t,i,s)}return n}var Dn=Object.defineProperty,Tn=Object.getOwnPropertyDescriptor,$=(t,e,s,n)=>{for(var i=n>1?void 0:n?Tn(e,s):e,a=t.length-1,o;a>=0;a--)(o=t[a])&&(i=(n?o(e,s,i):o(i))||i);return n&&i&&Dn(e,s,i),i};const Mn=[["accent","--mzcs-accent"],["accentBright","--mzcs-accent-bright"],["good","--mzcs-good"],["warn","--mzcs-warn"],["bad","--mzcs-bad"],["bg","--mzcs-bg"],["surface","--mzcs-surface"],["chip","--mzcs-chip"],["track","--mzcs-track"],["border","--mzcs-border"],["text","--mzcs-text"],["textDim","--mzcs-text-dim"]],Pn=[{key:"bg",label:"Card background"},{key:"surface",label:"Panels (hero / rows)"},{key:"chip",label:"Buttons and chips"},{key:"track",label:"Tracks and wells"},{key:"border",label:"Borders"},{key:"text",label:"Text"},{key:"textDim",label:"Muted text"},{key:"accent",label:"Accent (cooling / active)"},{key:"accentBright",label:"Accent bright (today / highlights)"},{key:"good",label:"Good (eco / normal)"},{key:"warn",label:"Warn (heat / season / high)"},{key:"bad",label:"Alert (out of range)"}];function Ln(t,e,s){return!s.some(n=>n.name&&T(t,x("zone_enabled",e,z(n.name))))}const Et=[{cls:"dev_green_max",label:"Room deviation \xB7 green up to (\xB0)"},{cls:"dev_amber_max",label:"Room deviation \xB7 amber up to (\xB0)"},{cls:"runtime_alert_margin",label:"Runtime alert margin (%)"},{cls:"runtime_learn_days",label:"Runtime learn window (days)"},{cls:"cdd_base",label:"Cooling degree-day base (\xB0)"}];function de(t,e,s){const n=s>e?Math.max(0,Math.min(1,(t-e)/(s-e))):.5,i=[41,121,230],a=[226,122,49];return`rgb(${i.map((o,c)=>Math.round(o+(a[c]-o)*n)).join(",")})`}function zt(t){const[e,s]=t.split(":");let n=Number(e);const i=n>=12?"PM":"AM";return n=n%12===0?12:n%12,`${n}:${s} ${i}`}const Rt={all:"Every day",wd:"Weekdays",we:"Weekend"},jn={heat:"Heat",cool:"Cool",heat_cool:"Heat\xB7Cool",off:"Off",auto:"Auto",dry:"Dry",fan_only:"Fan only"};console.info(`%c ${jt} %c v${ks}`,"background:var(--mzcs-accent);color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;","background:#243039;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;");let g=class extends B{constructor(){super(...arguments),this._zoneIndex=0,this._ctrlOpen=false,this._setupOpen=false,this._schedOpen=false,this._schedName="",this._schedBusy=false,this._schedDrafts=new Map,this._rtOpen=false,this._rtDayOpen=null,this._rtDayLoading=false,this._rtDayCache=new Map,this._rtRange=7,this._dryRunning=false,this._execConfirm=false,this._execRunning=false,this._execLog=[],this._tdArmed=false,this._tdRunning=false,this._setupTab="zones",this._tdAsk=false,this._tdConfirm="",this._objectsLoading=false}setConfig(t){if(!t||!Array.isArray(t.zones??[]))throw new Error("zones must be a list of { entity, name } items.");const e=t.zones??[];if(e.length>4)throw new Error("A maximum of 4 zones is supported.");const s=e.map(a=>({...a,name:typeof a.name=="string"&&a.name.trim()?a.name:a.entity?a.entity.split(".")[1].replace(/_/g," "):"Zone"})),n=t.features?.fan_timer,i=t.features?{...t.features,fan_timer:Array.isArray(n)?n:typeof n=="number"?[n]:void 0}:void 0;this._config={...t,zones:s,...i?{features:i}:{}},this._zoneIndex>=Math.max(s.length,1)&&(this._zoneIndex=0),this._dryRun=void 0,this._dryRunKind=void 0,this._execConfirm=false,this._execResult=void 0,this._execLog=[]}static async getConfigElement(){return await Promise.resolve().then(()=>Un),document.createElement(It)}static getStubConfig(){return{prefix:"climate",zones:[]}}getCardSize(){return 6}get _prefix(){return this._config?.prefix??"climate"}_zone(){return this._config?.zones[this._zoneIndex]}_nudge(t){const e=this._zone();if(!e||!this.hass)return;const s=lt(this.hass,e.entity);if(s.setpoint==null)return;const n=this.hass.states[e.entity]?.attributes,i=Ms(s.setpoint+t,s.setpoint,n?.min_temp,n?.max_temp);i!==s.setpoint&&Ws(this.hass,e.entity,i)}_provisionInput(){const t=this._config,e=t.zones.map(n=>({slug:z(n.name),name:n.name,climate:n.entity})),s=t.seasons??[{key:"summer",name:"Summer",default_mode:"cool"},{key:"winter",name:"Winter",default_mode:"heat_cool"}];return{prefix:this._prefix,zones:e,seasons:s,schedules:xn(e.map(n=>n.slug),s),features:{fan_timer:(this._config?.features?.fan_timer?.length??3)>0,anomaly_alerts:this._config?.features?.anomaly_alerts??true,steering:false,fan_guard:this._config?.features?.fan_guard,eco_preset:this._config?.features?.eco_preset},weather_entity:this._config?.weather_entity}}_fetchExistingFor(t){return kn(this.hass,t.prefix,t.zones.map(e=>e.slug),t.seasons.map(e=>e.key))}async _runDryRun(){if(!(!this.hass||this._dryRunning)){this._dryRunning=true,this._dryRunError=void 0;try{const t=this._provisionInput(),e=await this._fetchExistingFor(t);this._dryRun=H(G(t),e),this._dryRunKind="setup",this._execConfirm=false,this._execResult=void 0,this._execLog=[],this._tdArmed=false}catch(t){this._dryRunError=t instanceof Error?t.message:String(t)}finally{this._dryRunning=false}}}async _armTeardown(){if(!(!this.hass||this._dryRunning||this._tdRunning)){this._dryRunning=true,this._dryRunError=void 0;try{const t=this._provisionInput(),e=await this._fetchExistingFor(t),s=H([],e),n={automation:0,template_sensor:1,stats_sensor:1,schedule:2,helper:3};if(s.delete.sort((i,a)=>(n[i.kind]??9)-(n[a.kind]??9)),!this._tdAsk||this._setupTab!=="danger"||!this._setupOpen)return;this._dryRun=s,this._dryRunKind="teardown",this._tdArmed=true,this._execConfirm=false,this._execResult=void 0,this._execLog=[]}catch(t){this._dryRunError=t instanceof Error?t.message:String(t)}finally{this._dryRunning=false}}}async _runTeardown(){const t=this.hass,e=this._config,s=this._dryRunKind==="teardown"?this._dryRun:void 0;if(!(!t||!e||!s||this._tdRunning)&&this._tdConfirm.trim()===this._prefix){if(this._tdConfirm="",!t.callWS||!t.callApi){this._execLog=["This HA frontend session does not expose the required APIs (callWS/callApi)."];return}this._tdRunning=true,this._tdArmed=false,this._execLog=[];try{const n=this._provisionInput(),i=await this._fetchExistingFor(n),a=H([],i),o={automation:0,template_sensor:1,stats_sensor:1,schedule:2,helper:3};a.delete.sort((u,m)=>(o[u.kind]??9)-(o[m.kind]??9));const c=u=>u.delete.map(m=>m.id).sort().join("|");if(c(a)!==c(s)){this._dryRun=a,this._dryRunKind="teardown",this._tdArmed=true,this._tdRunning=false,this._execLog=["The registry changed since this preview was made. Review the refreshed list and confirm again."];return}for(const u of n.zones){const m=x("zone_enabled",n.prefix,u.slug);if(T(t,m))try{await t.callService("input_boolean","turn_off",{entity_id:m}),this._execLog=[...this._execLog,`Disabled scheduling for ${u.name}`]}catch{this._execLog=[...this._execLog,`NOTE: could not disable ${m}`]}}const r=e.zones.map(u=>({slug:z(u.name),name:u.name,climate:u.entity})),l=await At(t,a,{prefix:n.prefix,zones:r,seasons:n.seasons,fanGuard:e.features?.fan_guard,ecoPreset:pe(e.features),weatherEntity:e.weather_entity,log:u=>{this._execLog=[...this._execLog,u]}});this._execResult=l;const d=await this._fetchExistingFor(n);this._dryRun=H(G(n),d),this._dryRunKind="setup"}catch(n){this._execLog=[...this._execLog,`ERROR: ${n instanceof Error?n.message:String(n)}`]}finally{this._tdRunning=false}}}async _runApply(){const t=this.hass,e=this._config,s=this._dryRun;if(!(!t||!e||!s||this._execRunning)){if(!t.callWS||!t.callApi){this._execLog=["This HA frontend session does not expose the required APIs (callWS/callApi)."];return}this._execRunning=true,this._execConfirm=false,this._execLog=[];try{const n=this._provisionInput(),i=e.zones.map(d=>({slug:z(d.name),name:d.name,climate:d.entity})),a=await this._fetchExistingFor(n),o=H(G(n),a),c=d=>JSON.stringify([d.create.map(u=>u.id).sort(),d.adopt.map(u=>u.id).sort(),d.update.map(u=>u.id).sort(),d.delete.map(u=>u.id).sort()]);if(c(o)!==c(s)){this._dryRun=o,this._dryRunKind="setup",this._execRunning=false,this._execLog=["The registry changed since this preview was made. Review the refreshed plan and apply again."];return}const r=await At(t,o,{prefix:n.prefix,zones:i,seasons:n.seasons,fanGuard:e.features?.fan_guard,ecoPreset:pe(e.features),weatherEntity:e.weather_entity,log:d=>{this._execLog=[...this._execLog,d]}});this._execResult=r;const l=await this._fetchExistingFor(n);this._dryRun=H(G(n),l)}catch(n){this._execLog=[...this._execLog,`ERROR: ${n instanceof Error?n.message:String(n)}`]}finally{this._execRunning=false}}}_resetDangerState(){this._tdAsk=false,this._tdArmed=false,this._tdConfirm="",this._dryRunKind==="teardown"&&(this._dryRun=void 0,this._dryRunKind=void 0)}_setSetupTab(t){t!==this._setupTab&&(this._resetDangerState(),this._execConfirm=false,this._setupTab=t,t==="objects"&&this._loadObjects())}_closeSetup(){this._resetDangerState(),this._execConfirm=false,this._setupOpen=false}async _loadObjects(t=false){if(!this.hass||this._objectsLoading)return;const e=`${this._prefix}|${(this._config?.zones??[]).map(s=>s.name).join(",")}`;if(!(!t&&this._objectsLoadedFor===e&&this._objects)){this._objectsLoading=true,this._objectsError=void 0;try{const s=this._provisionInput(),n=await this._fetchExistingFor(s),i=G(s),a=new Map(n.map(r=>[r.id,r])),o=new Set(i.map(r=>r.id)),c=i.map(r=>{const l=a.get(r.id),d=l?l.managed?l.pristine===false?"customized":"managed":"unmanaged":"missing";return{id:r.id,kind:r.kind,name:String(r.spec.name??r.spec.alias??r.id),status:d}});for(const r of n)r.managed&&!o.has(r.id)&&c.push({id:r.id,kind:r.kind,name:String(r.spec.name??r.spec.alias??r.id),status:"extra"});this._objects=c,this._objectsLoadedFor=e}catch(s){this._objectsError=s instanceof Error?s.message:String(s)}finally{this._objectsLoading=false}}}_renderSetup(){const t=[{key:"zones",label:"Zones"},{key:"tuning",label:"Tuning"},{key:"objects",label:"Objects"},{key:"setup",label:"Setup"},{key:"appearance",label:"Look"},{key:"danger",label:"Danger"}],e=this._setupTab;return p`
      <div class="setup">
        <div class="setuphead">
          <p class="setup-title" style="margin:0;">Settings</p>
          <button class="chip" @click=${()=>this._closeSetup()}>Close</button>
        </div>
        <div class="settabs">
          ${t.map(s=>p`
              <button
                class=${s.key===e?s.key==="danger"?"settab on danger":"settab on":s.key==="danger"?"settab dangertab":"settab"}
                @click=${()=>this._setSetupTab(s.key)}
              >
                ${s.label}
              </button>
            `)}
        </div>
        ${e==="zones"?this._renderZonesTab():h}
        ${e==="tuning"?this._renderTuningTab():h}
        ${e==="objects"?this._renderObjectsTab():h}
        ${e==="setup"?this._renderSetupTab():h}
        ${e==="appearance"?this._renderThemePicker():h}
        ${e==="danger"?this._renderTeardown():h}
      </div>
    `}_renderSetupTab(){const t=this._dryRunKind==="setup"?this._dryRun:void 0;return p`
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
        ${this._dryRunError?p`<p class="setup-err">${this._dryRunError}</p>`:h}
        ${t?p`
              <div class="planwrap">
                ${[["Create",t.create,""],["Adopt",t.adopt,""],["Update",t.update,""],["Delete",t.delete,"del"],["Unchanged",t.noop,"quiet"]].map(([e,s,n])=>p`
                    <p class="plan-h ${n}">${e} (${s.length})</p>
                    ${s.length>0&&e!=="Unchanged"?p`<ul class="plan-list ${n}">
                          ${s.map(i=>p`<li>${i.id}</li>`)}
                        </ul>`:h}
                  `)}
              </div>
              ${this._renderApply(t)}
            `:h}
      </div>
    `}_renderTeardown(){const t=this._dryRunKind==="teardown"?this._dryRun:void 0,e=this._prefix,s=this._tdConfirm.trim()===e,n=this._dryRunning||this._execRunning;return p`
      <p class="setup-sub danger-lead">
        This removes every helper, schedule, sensor and automation this card created. Your
        thermostats keep working - they fall back to their own app schedules. Do this
        <em>before</em> deleting the card or uninstalling from HACS, because these objects
        keep running without it.
      </p>
      ${!this._tdAsk&&!this._tdArmed&&!this._tdRunning?p`
            <button class="chip danger" .disabled=${n} @click=${()=>this._tdAsk=true}>
              Remove everything this card manages…
            </button>
          `:h}
      ${this._tdAsk&&!this._tdArmed?p`
            <p class="setup-sub"><strong>Are you sure?</strong> Nothing is deleted yet - the next
            step shows you the exact list first.</p>
            <div class="applyrow">
              <button class="chip danger" .disabled=${n} @click=${()=>void this._armTeardown()}>
                Yes, show me what will be deleted
              </button>
              <button class="chip" @click=${()=>this._resetDangerState()}>Cancel</button>
            </div>
          `:h}
      ${this._tdArmed&&t?p`
            <div class="planwrap">
              <p class="plan-h del">Will be deleted (${t.delete.length})</p>
              <ul class="plan-list del">
                ${t.delete.map(i=>p`<li>${i.id}</li>`)}
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
          `:h}
      ${this._tdRunning?p`<p class="setup-sub">Removing…</p>`:h}
      ${this._execLog.length>0&&(this._tdRunning||this._tdArmed===false)?p`<ul class="plan-list exec-log">
            ${this._execLog.map(i=>p`<li>${i}</li>`)}
          </ul>`:h}
    `}_renderObjectsTab(){const t=this._objects,e=[{label:"Schedules",kinds:["schedule"]},{label:"Helpers",kinds:["helper"]},{label:"Sensors",kinds:["template_sensor","stats_sensor"]},{label:"Automations",kinds:["automation"]}],s={managed:{label:"Managed",cls:"ok",hint:"Created and managed by this card."},missing:{label:"Missing",cls:"warn",hint:"Expected but not present - run Apply on the Setup tab."},customized:{label:"Customized",cls:"warn",hint:"You edited this - the card will never overwrite or delete it."},unmanaged:{label:"Unmanaged",cls:"warn",hint:"Matches this naming scheme but is not labeled - Apply would adopt it."},extra:{label:"Not in config",cls:"del",hint:"Managed but no longer in your config - Apply would delete it."}};return p`
      <p class="setup-sub">
        Everything this card creates and manages, all labeled <code>mzcs</code> in Home
        Assistant. Read-only - tap a row to open it.
      </p>
      <button class="chip" .disabled=${this._objectsLoading} @click=${()=>void this._loadObjects(true)}>
        ${this._objectsLoading?"Reading registry\u2026":"Refresh"}
      </button>
      ${this._objectsError?p`<p class="setup-err">${this._objectsError}</p>`:h}
      ${t?p`
            ${e.map(n=>{const i=t.filter(a=>n.kinds.includes(a.kind));return i.length===0?h:p`
                <p class="plan-h">${n.label} (${i.length})</p>
                ${i.map(a=>{const o=s[a.status];return p`
                    <div class="objrow" title=${o.hint} @click=${()=>this._moreInfo(a.id)}>
                      <span class="objname">${a.name}</span>
                      <span class="objid">${a.id.replace(/^automation:/,"automation.")}</span>
                      <span class="objstat ${o.cls}">${o.label}</span>
                    </div>
                  `})}
              `})}
          `:this._objectsLoading?h:p`<p class="setup-sub">Nothing loaded yet.</p>`}
    `}_moreInfo(t){if(t.startsWith("automation:")){const e=t.slice(11),s=this.hass;let n;if(s){for(const i in s.states)if(i.startsWith("automation.")&&s.states[i]?.attributes.id===e){n=i;break}}if(!n)return;t=n}this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:true,composed:true}))}_renderApply(t){const e=$n(t).length,s=this._execResult;return p`
      ${e>0&&!this._execRunning&&!s&&!this._tdArmed&&!this._tdRunning?this._execConfirm?p`
              <div class="applyrow">
                <button class="chip danger" @click=${()=>void this._runApply()}>
                  Confirm: apply ${e} change${e===1?"":"s"}
                </button>
                <button class="chip" @click=${()=>this._execConfirm=false}>Cancel</button>
              </div>
            `:p`
              <button class="chip" .disabled=${this._dryRunning} @click=${()=>this._execConfirm=true}>
                Apply ${e} change${e===1?"":"s"}…
              </button>
            `:h}
      ${this._execRunning?p`<p class="setup-sub">Applying…</p>`:h}
      ${this._execLog.length>0?p`<ul class="plan-list exec-log">
            ${this._execLog.map(n=>p`<li>${n}</li>`)}
          </ul>`:h}
      ${s?p`<p class="setup-sub ${s.ok?"":"setup-err"}">
            ${s.ok?`Done - ${s.created} created, ${s.adopted} adopted, ${s.updated} updated, ${s.deleted} deleted${s.skipped?`, ${s.skipped} kept as-is`:""}. The plan above has been re-verified against the live registry.`:"Apply failed - created objects from this run were rolled back. See the log above."}
          </p>`:h}
    `}_renderZonesTab(){const t=this.hass;if(!t)return h;const e=k("season_select",this._prefix),s=t.states[e],n=Array.isArray(s?.attributes.options)?s.attributes.options:[];if(Et.map(c=>({...c,id:k(c.cls,this._prefix)})).filter(c=>T(t,c.id)),!s&&Ln(t,this._prefix,this._config?.zones??[]))return p`<p class="setup-sub">Zone switches appear here once the card is provisioned.</p>`;const i=(this._config?.zones??[]).map(c=>{const r=z(c.name);return{name:c.name,enableId:x("zone_enabled",this._prefix,r),markerId:x("applied_block_marker",this._prefix,r)}}).filter(c=>T(t,c.enableId)),a=i.length>0&&i.every(c=>t.states[c.enableId]?.state==="on"),o=i.some(c=>t.states[c.enableId]?.state==="on");return p`
      ${i.length>0?p`
            <div class="managerow master">
              <span>Scheduling · all zones</span>
              <button
                class=${a?"chip togg on":"chip togg"}
                @click=${()=>{for(const c of i)pt(t,c.enableId,c.markerId,!o)}}
              >
                ${a?"On":o?"Mixed":"Off"}
              </button>
            </div>
            ${i.map(c=>{const r=t.states[c.enableId]?.state==="on";return p`
                <div class="managerow">
                  <span>${c.name} scheduling</span>
                  <button
                    class=${r?"chip togg on":"chip togg"}
                    @click=${()=>void pt(t,c.enableId,c.markerId,!r)}
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
          `:h}
      ${s?p`
            <div class="managerow">
              <span>Active season</span>
              <select
                @change=${c=>void js(t,e,c.target.value)}
              >
                ${n.map(c=>p`<option .value=${c} ?selected=${c===s.state}>${c}</option>`)}
              </select>
            </div>
          `:h}
    `}_renderTuningTab(){const t=this.hass;if(!t)return h;const e=Et.map(s=>({...s,id:k(s.cls,this._prefix)})).filter(s=>T(t,s.id));return e.length===0?p`<p class="setup-sub">Tuning helpers appear here once the card is provisioned.</p>`:p`
      ${e.map(s=>p`
          <div class="managerow">
            <span>${s.label}</span>
            <input
              type="number"
              .value=${t.states[s.id]?.state??""}
              @change=${n=>{const i=n.target,a=i.value.trim(),o=Number(a);if(a===""||!Number.isFinite(o)){i.value=t.states[s.id]?.state??"";return}Ls(t,s.id,o).catch(()=>{i.value=t.states[s.id]?.state??""})}}
            />
          </div>
        `)}
    `}_renderThemePicker(){const t=this.hass;if(!t)return h;const e=k("theme",this._prefix);if(!T(t,e))return h;const{presetKey:s,tokens:n}=gt(t.states[e]?.state),i=a=>void t.callService("input_text","set_value",{entity_id:e,value:a});return p`
      <div class="chips">
        ${Object.entries(Te).map(([a,o])=>p`
            <button
              class=${s===a?"chip mode-on":"chip"}
              @click=${()=>i(a)}
            >
              <span class="swatch" style="background:${o.tokens.accent}"></span>${o.label}
            </button>
          `)}
        <button
          class=${s==="custom"?"chip mode-on":"chip"}
          @click=${()=>i(_t(Ks(n)))}
        >
          Custom
        </button>
      </div>
      ${s==="custom"?p`
            ${Pn.map(a=>p`
                <div class="managerow">
                  <span>${a.label}</span>
                  <input
                    type="color"
                    .value=${n[a.key]}
                    @change=${o=>{const c={...n,[a.key]:o.target.value};i(_t(c))}}
                  />
                </div>
              `)}
            <p class="muted" style="font-size:11px;margin:2px 0 0;">
              Colors apply live to every device showing the card.
            </p>
          `:h}
    `}_applyTheme(){const t=this.hass?.states[k("theme",this._prefix)]?.state,e=`${this._prefix}|${t??""}`;if(e===this._appliedTheme)return;this._appliedTheme=e;const{tokens:s}=gt(t);for(const[n,i]of Mn)this.style.setProperty(i,s[n])}render(){if(!this._config||!this.hass)return h;this._applyTheme();const t=this._zone();if(!t||!t.entity||!t.entity.startsWith("climate."))return p`<ha-card>
        <div class="wrap"><p class="muted pad">Pick a thermostat for each zone in the card editor to get started.</p></div>
      </ha-card>`;if(this._setupOpen)return p`<ha-card><div class="wrap">${this._renderSetup()}</div></ha-card>`;const e=lt(this.hass,t.entity),s=Ss(this.hass,x("fan_timer",this._prefix,z(t.name))),n=e.action==="cooling",i=e.action==="heating",a=this.hass.states[t.entity]?.attributes??{},o=a.target_temp_low!=null&&a.target_temp_high!=null?`${a.target_temp_low}\u2013${a.target_temp_high}`:null,c=e.setpoint??o??"\u2013",r=e.available?n?`Cooling to ${c}`:i?`Heating to ${c}`:e.mode==="off"?"Off":`Idle \xB7 set ${c}`:"Unavailable";return p`
      <ha-card>
        <div class="wrap">
          <div class="tabs" role="tablist">
            ${this._config.zones.map((l,d)=>p`
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
                ${r}${e.inside!=null?` \xB7 inside ${e.inside}\xB0`:""}${e.humidity!=null?` \xB7 ${e.humidity}% RH`:""}${s?p`<span class="fan"> · fan on</span>`:""}
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
    `}_renderRuntime(t){if(!this.hass)return h;const e=this.hass,s=z(t.name),n=x("runtime_today",this._prefix,s);if(!T(e,n))return h;const i=Number(e.states[n]?.state),a=Number.isFinite(i)?q(i):"\u2013";this._rtLoadedFor!==n&&(this._rtLoadedFor=n,this._rtDaily=void 0,queueMicrotask(()=>void ht(e,n,7).then(f=>{this._rtDaily=f})));const o=new Date;o.setHours(0,0,0,0);const c=(this._rtDaily??[]).filter(f=>f.day<o.getTime()).sort((f,w)=>w.day-f.day),r=o.getTime(),l=Number(e.states[x("expected_runtime",this._prefix,s)]?.state),d=Se(e,k("runtime_alert_margin",this._prefix))??35,u=(Date.now()-r)/36e5,m=Fs(Number.isFinite(i)?i:0,l,d,u);return p`
      <button class="schedrow" @click=${()=>this._rtOpen=!this._rtOpen}>
        <span
          >Runtime · Today <b class="rt-b">${a}</b>${m.label?p` <span class="verdict ${m.status}">· ${m.label}</span>`:h}</span
        >
        <span aria-hidden="true">${this._rtOpen?"\u25B4":"\u25BE"}</span>
      </button>
      ${this._rtOpen?p`
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
                  @click=${()=>{this._rtRange=30,this._rt30||ht(e,n,30).then(f=>{this._rt30=f})}}
                >
                  30 days
                </button>
              </div>
              ${this._rtRange===30?this._render30():h}
              ${this._rtRange===7?p`${this._renderPill(t,"Today",Number.isFinite(i)?i:0,r,true)}`:h}
              ${this._rtRange===7?p`
                    ${c.map(f=>this._renderPill(t,new Date(f.day).toLocaleDateString(void 0,{weekday:"short",day:"numeric"}),f.hours,f.day,false))}
                    ${c.length===0?p`<p class="muted" style="font-size:11px;margin:6px 0;">
                          History accrues daily - past days appear as statistics build up.
                        </p>`:h}
                    <p class="muted" style="font-size:10px;margin:6px 0 0;">
                      Tap a day for its run segments and setpoint changes.
                    </p>
                  `:h}
            </div>
          `:h}
    `}_render30(){const t=this._rt30;if(!t)return p`<p class="muted" style="font-size:11px;">Loading…</p>`;if(t.length===0)return p`<p class="muted" style="font-size:11px;">
        Long-term statistics build daily - the 30-day view fills in as days accumulate.
      </p>`;const e=[...t].sort((a,o)=>a.day-o.day),s=Math.max(...e.map(a=>a.hours),1),n=e.reduce((a,o)=>a+o.hours,0)/e.length,i=a=>new Date(a).toLocaleDateString(void 0,{month:"short",day:"numeric"});return p`
      <div class="cols">
        ${e.map(a=>p`<span
            class="col"
            title="${i(a.day)}: ${q(a.hours)}"
            style="height: ${Math.max(6,a.hours/s*64).toFixed(0)}px"
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
    `}async _openDay(t,e){if(this._rtDayOpen===e){this._rtDayOpen=null;return}this._rtDayOpen=e;const s=this._rtDayCache.get(e);if(s){this._rtDayDetail=s;return}if(this.hass){this._rtDayLoading=true,this._rtDayDetail=void 0;try{const n=z(t.name),i=x("running_sensor",this._prefix,n),a=Math.min(e+864e5,Date.now()),[o,c]=await Promise.all([mt(this.hass,i,e,a),mt(this.hass,t.entity,e,a,"temperature")]),r={segs:Hs(o,e,a),bubs:Us(c),start:e,end:e+864e5};this._rtDayCache.set(e,r),this._rtDayOpen===e&&(this._rtDayDetail=r)}finally{this._rtDayLoading=false}}}_renderPill(t,e,s,n,i){const a=Math.min(100,Math.max(0,s/24*100)),o=this._rtDayOpen===n;return p`
      <button class="pillrow" @click=${()=>void this._openDay(t,n)}>
        <span class="pill-label">${e}</span>
        <span class="pill-track">
          <span
            class="pill-fill ${i||o?"today-fill":""}"
            style="width: ${a.toFixed(1)}%"
          ></span>
        </span>
        <span class="pill-hours">${q(s)}</span>
      </button>
      ${o?this._renderDayDetail():h}
    `}_renderDayDetail(){if(this._rtDayLoading)return p`<p class="muted" style="font-size:11px;">Loading day…</p>`;const t=this._rtDayDetail;return t?p`
      <div class="daydetail">
        <div class="bubblerow">
          ${t.bubs.slice(0,12).map(e=>{const s=(e.t-t.start)/(t.end-t.start)*100;return p`<span class="bubble" style="left: ${s.toFixed(1)}%"
              >${Math.round(e.value)}</span
            >`})}
        </div>
        <div class="segtrack">
          ${t.segs.map(e=>{const{left:s,width:n}=Bs(e,t.start,t.end);return p`<span
              class="seg"
              style="left: ${s.toFixed(2)}%; width: ${Math.max(.4,n).toFixed(2)}%"
            ></span>`})}
        </div>
        <div class="axis">
          <span>12A</span><span>6A</span><span>12P</span><span>6P</span><span>12A</span>
        </div>
      </div>
    `:h}_activeSeasonKey(){const t=this.hass?.states[k("season_select",this._prefix)];return!t||t.state==="unknown"?null:this._config?.seasons?.find(s=>s.name===t.state)?.key??z(t.state)}_scheduleEntityId(t){const e=this._activeSeasonKey();return e?`schedule.${this._prefix}_${z(t.name)}_${e}`:null}async _loadWeek(t){if(!this.hass)return;const e=this._scheduleEntityId(t);if(!e||!T(this.hass,e)){this._schedWeek=void 0;return}this._schedBusy=true;try{const s=await ut(this.hass,e);if(this._schedLoadedFor!==e)return;this._schedWeek=s?.week??void 0,this._schedName=s?.name??"",this._schedError=s?void 0:"Could not load schedule config."}catch(s){this._schedLoadedFor===e&&(this._schedError=ft(s))}finally{this._schedBusy=false}}_setBlocks(t,e,s){return this._schedDrafts.get(e)??yt(t[s[0]]??[])}_mutateDraft(t,e,s){if(!this._schedWeek)return;const n=this._schedDrafts.get(t)??yt(this._schedWeek[e[0]]??[]).map(a=>({...a}));s(n);const i=new Map(this._schedDrafts);i.set(t,n),this._schedDrafts=i,this._schedNotice=void 0}_clearSchedEdit(){this._schedDrafts=new Map,this._schedSel=void 0,this._schedGran=void 0}_activeDet(t){if(!this._schedGran)return Qs(t);const e=this._schedGran,s=e==="all"?["all"]:e==="wdwe"?["wd","we"]:[...O];return{granularity:e,sets:Object.fromEntries(s.map(n=>[n,Ht(e,n)]))}}_switchGranularity(t){const e=this._schedWeek;if(!e)return;const s=this._activeDet(e);if(s.granularity===t)return;const n={};for(const[o,c]of Object.entries(s.sets))n[o]=this._setBlocks(e,o,c).map(r=>({...r}));const i=Ys(s.granularity,t,n),a=new Map;for(const[o,c]of Object.entries(i))a.set(o,c.map(r=>({...r})));this._schedDrafts=a,this._schedGran=t,this._schedSel=void 0,this._schedNotice=void 0}async _saveSchedDrafts(){const t=this._schedLoadedFor;if(!this.hass||!this._schedWeek||this._schedDrafts.size===0||!t)return;const e=this._activeDet(this._schedWeek);this._schedBusy=true;try{const s=await ut(this.hass,t);let n=s?.week??this._schedWeek;for(const[i,a]of this._schedDrafts){const o=e.sets[i];o&&(n=on(n,o,a))}await Ps(this.hass,t,n,s?.name??this._schedName),this._schedLoadedFor===t&&(this._schedWeek=n,this._clearSchedEdit(),this._schedError=void 0)}catch(s){this._schedError=ft(s)}finally{this._schedBusy=false}}_renderSchedule(t){if(!this.hass)return h;const e=this._scheduleEntityId(t);if(!e||!T(this.hass,e))return h;this._schedLoadedFor!==e&&(this._schedDrafts.size>0&&(this._schedNotice="Unsaved schedule edits were discarded (zone or season changed)."),this._schedLoadedFor=e,this._schedWeek=void 0,this._clearSchedEdit(),queueMicrotask(()=>void this._loadWeek(t)));const s=this.hass.states[k("season_select",this._prefix)]?.state??"",n=this._schedWeek,i=n?sn(n,new Date):null,a=i?i.cool_temp??i.heat_temp:null,o=i?`Next \xB7 ${zt(i.time)} ${i.name}${a!=null?` \u2192 ${a}\xB0`:""}`:"Schedule";return p`
      <button
        class="schedrow"
        @click=${()=>{this._schedOpen=!this._schedOpen,this._schedWeek||this._loadWeek(t)}}
      >
        <span>${o} <span class="season">· ${s}</span></span>
        <span aria-hidden="true">${this._schedOpen?"\u25B4":"\u25BE"}</span>
      </button>
      ${this._schedOpen?this._renderScheduleBody(t):h}
    `}_renderScheduleBody(t){if(this._schedBusy&&!this._schedWeek)return p`<p class="muted pad">Loading…</p>`;const e=this._schedWeek;if(!e)return this._schedError?p`<p class="schederr pad">${this._schedError}</p>`:p`<p class="muted pad">No schedule data.</p>`;const s=this._activeDet(e),n=Object.entries(s.sets),i=new Date().getDay(),a=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][i],o=[];for(const[m,f]of n)for(const w of this._setBlocks(e,m,f))w.cool_temp!=null&&o.push(w.cool_temp),w.heat_temp!=null&&o.push(w.heat_temp);let c=o.length?Math.min(...o):70,r=o.length?Math.max(...o):80;if(r-c<6){const m=(r+c)/2;c=m-3,r=m+3}const l=s.granularity==="days",d=this._schedDrafts.size>0;return nn(e)?p`
        <div class="schedbody">
          ${n.map(([m,f],w)=>{const S=an(e[f[0]]??[]),R=f.includes(a),D=Rt[m]??m.charAt(0).toUpperCase()+m.slice(1);return p`
              <p class="sethead">${D}${R?p` <span class="today">today</span>`:h}</p>
              <div class="sstrip ${l?"small":""}">
                ${S.map(_=>{const y=(_.toMin-_.fromMin)/1440*100,v=_.block?_.block.cool_temp??_.block.heat_temp:null;return p`<span
                    class="sseg ro"
                    style="width:${y}%;background:${_.block&&v!=null?de(v,c,r):"var(--mzcs-track)"}"
                  >
                    <span class="segt">${_.block?`${v??"\u2013"}\xB0`:"Off"}</span>
                  </span>`})}
              </div>
              ${!l||w===n.length-1?p`<div class="saxis">
                    <span>12A</span><span>4A</span><span>8A</span><span>12P</span><span>4P</span><span>8P</span><span>12A</span>
                  </div>`:h}
            `})}
          <p class="muted pad">
            This schedule has inactive (off) periods set in Home Assistant's own editor. Edit it
            there - the card leaves it untouched to preserve those periods.
          </p>
        </div>
      `:p`
      <div class="schedbody">
        <div class="chips granchips">
          ${[["all","Every day"],["wdwe","Weekday \xB7 Weekend"],["days","Individual days"]].map(([m,f])=>p`
              <button
                class=${s.granularity===m?"chip mode-on":"chip"}
                .disabled=${this._schedBusy}
                @click=${()=>this._switchGranularity(m)}
              >
                ${f}
              </button>
            `)}
        </div>
        ${n.map(([m,f],w)=>{const S=this._setBlocks(e,m,f),R=rn(S),D=f.includes(a),_=S.some(E=>E.mode==="heat_cool"),y=Rt[m]??m.charAt(0).toUpperCase()+m.slice(1),v=p`
            <div class="sstrip ${l?"small":""} ${_?"hc":""}">
              ${R.map(E=>{const Ve=S.indexOf(E.block),Ye=!E.wrap&&this._schedSel?.setKey===m&&this._schedSel?.idx===Ve,ce=(E.toMin-E.fromMin)/1440*100,Je=()=>{this._schedSel={setKey:m,idx:Ve}};if(_){const xe=E.block.cool_temp,we=E.block.heat_temp;return p`
                    <button class="sseg hcseg ${Ye?"sel":""}" style="width:${ce}%" @click=${Je}>
                      <span class="hchalf" style="background:${xe!=null?de(xe,c,r):"var(--mzcs-track)"}">
                        <span class="segt">${xe??"\u2013"}°</span>
                        ${ce>15&&!l?p`<span class="segn">${E.block.name}</span>`:h}
                      </span>
                      <span class="hchalf" style="background:${we!=null?de(we,c,r):"var(--mzcs-track)"}">
                        <span class="segt">${we??"\u2013"}°</span>
                      </span>
                    </button>
                  `}const ve=E.block.cool_temp??E.block.heat_temp;return p`
                  <button
                    class="sseg ${Ye?"sel":""}"
                    style="width:${ce}%;background:${ve!=null?de(ve,c,r):"var(--mzcs-track)"}"
                    @click=${Je}
                  >
                    <span class="segt">${ve??"\u2013"}°</span>
                    ${ce>9&&!l?p`<span class="segn">${E.block.name}</span>`:h}
                  </button>
                `})}
            </div>
          `,A=!l||w===n.length-1;return p`
            <p class="sethead">
              ${y}${D?p` <span class="today">today</span>`:h}
            </p>
            ${_?p`<div class="hcwrap">
                  <div class="hcgutter"><span class="gc">Cool</span><span class="gh">Heat</span></div>
                  ${v}
                </div>`:v}
            ${A?p`<div class="saxis ${_?"indent":""}">
                  <span>12A</span><span>4A</span><span>8A</span><span>12P</span><span>4P</span><span>8P</span><span>12A</span>
                </div>`:h}
          `})}
        ${this._renderBlockEditor(s)}
        ${this._schedNotice?p`<p class="muted pad">${this._schedNotice}</p>`:h}
        ${this._schedError?p`<p class="schederr pad">${this._schedError}</p>`:h}
        <div class="schedactions">
          ${d?p`
                <button class="chip save" .disabled=${this._schedBusy}
                  @click=${()=>void this._saveSchedDrafts()}>
                  ${this._schedBusy?"Saving\u2026":"Save changes"}
                </button>
                <button class="chip" .disabled=${this._schedBusy} @click=${()=>this._clearSchedEdit()}>
                  Discard
                </button>
              `:p`
                <button
                  class="chip"
                  .disabled=${this._schedBusy}
                  @click=${()=>{const m=x("applied_block_marker",this._prefix,z(t.name));Ns(this.hass,m,`automation.${this._prefix}_schedule_engine`)}}
                >
                  Apply now
                </button>
                <span class="muted">Tap a block to edit. Changes apply at the next block; Apply now re-asserts immediately.</span>
              `}
        </div>
      </div>
    `}_renderBlockEditor(t){const e=this._schedSel,s=this._schedWeek;if(!e||!s)return h;const n=t.sets[e.setKey];if(!n)return h;const i=this._setBlocks(s,e.setKey,n),a=i[e.idx];if(!a)return h;const o=d=>this._mutateDraft(e.setKey,n,d),c=d=>{o(u=>{const m=u[e.idx],f=M(m.time),w=f+d,S=e.idx>0?M(u[e.idx-1].time)+15:0,R=e.idx<u.length-1?M(u[e.idx+1].time)-15:Math.max(1425,f);m.time=xt(Math.max(S,Math.min(R,w)))})},r=(d,u)=>{o(m=>{const f=m[e.idx],S=(f[d]??f.cool_temp??f.heat_temp??72)<45,R=(f[d]??(S?22:72))+u;let D=S?5:45,_=S?35:95;f.mode==="heat_cool"&&(d==="cool_temp"&&f.heat_temp!=null&&(D=f.heat_temp+2),d==="heat_temp"&&f.cool_temp!=null&&(_=f.cool_temp-2)),f[d]=Math.max(D,Math.min(_,R))})},l=(d,u,m,f)=>p`
      <div class="managerow">
        <span>${d}</span>
        <span class="stepgrp">
          <button class="stepbtn" @click=${m}>−</button>
          <span class="stepval">${u}</span>
          <button class="stepbtn" @click=${f}>+</button>
        </span>
      </div>
    `;return p`
      <div class="bedit">
        <div class="managerow">
          <span>Block name</span>
          <input
            class="bname-in"
            type="text"
            .value=${a.name}
            @change=${d=>o(u=>{u[e.idx].name=d.target.value})}
          />
        </div>
        ${l("Starts",zt(a.time),()=>c(-15),()=>c(15))}
        ${a.mode==="heat_cool"?p`
              ${l("Cool to",`${a.cool_temp??"\u2013"}\xB0`,()=>r("cool_temp",-1),()=>r("cool_temp",1))}
              ${l("Heat to",`${a.heat_temp??"\u2013"}\xB0`,()=>r("heat_temp",-1),()=>r("heat_temp",1))}
            `:a.mode==="heat"?l("Heat to",`${a.heat_temp??"\u2013"}\xB0`,()=>r("heat_temp",-1),()=>r("heat_temp",1)):l("Cool to",`${a.cool_temp??"\u2013"}\xB0`,()=>r("cool_temp",-1),()=>r("cool_temp",1))}
        <div class="bedit-actions">
          <button
            class="chip danger"
            .disabled=${i.length<=1}
            @click=${()=>{o(d=>{d.splice(e.idx,1)}),this._schedSel=void 0}}
          >
            Remove
          </button>
          <button
            class="chip"
            @click=${()=>{const d=e.idx<i.length-1?M(i[e.idx+1].time):1440,u=M(a.time);if(d-u<45)return;const m=xt(Math.round((u+Math.max(30,(d-u)/2))/15)*15);o(f=>{f.splice(e.idx+1,0,{time:m,name:"New block",mode:a.mode,cool_temp:a.cool_temp,heat_temp:a.heat_temp})}),this._schedSel={setKey:e.setKey,idx:e.idx+1}}}
          >
            Add block after
          </button>
          <button class="chip" @click=${()=>this._schedSel=void 0}>Close</button>
        </div>
      </div>
    `}_renderControls(t){if(!this.hass)return h;const e=this.hass,s=this._zone();if(!s)return h;const n=As(e,t),i=e.states[t]?.state,a=pe(this._config?.features),o=a!==null&&Es(e,t,a),c=a==="eco"?"Eco":(a??"").charAt(0).toUpperCase()+(a??"").slice(1),r=x("fan_timer",this._prefix,z(s.name)),l=this._config?.features?.fan_timer??[15,30,60],d=T(e,r);return p`
      <button class="expander" @click=${()=>this._ctrlOpen=!this._ctrlOpen}>
        <span>Mode</span>
        <span aria-hidden="true">${this._ctrlOpen?"\u25B4":"\u25BE"}</span>
      </button>
      ${this._ctrlOpen?p`
            <div class="ctrl">
              <div class="chips">
                ${n.map(u=>p`
                    <button
                      class=${i===u?"chip mode-on":"chip"}
                      @click=${()=>void Cs(e,t,u)}
                    >
                      ${jn[u]??u}
                    </button>
                  `)}
                ${o?p`
                      <button
                        class=${dt(e,t,a)?"chip eco eco-on":"chip eco"}
                        @click=${()=>void Os(e,t,!dt(e,t,a),a)}
                      >
                        ${c}
                      </button>
                    `:h}
              </div>
              ${d?p`
                    <div class="chips fanrow">
                      <span class="fanlbl">Fan</span>
                      ${l.map(u=>p`
                          <button
                            class="chip"
                            @click=${()=>void Ts(e,t,r,u)}
                          >
                            ${u}m
                          </button>
                        `)}
                    </div>
                  `:h}
            </div>
          `:h}
    `}_renderRooms(t,e){if(!this.hass||!t.room_sensors||t.room_sensors.length===0)return h;const s=this.hass,{greenMax:n,amberMax:i}=hn(Se(s,k("dev_green_max",this._prefix)),Se(s,k("dev_amber_max",this._prefix)));return p`
      <div class="rooms">
        ${V(t.room_sensors).map(a=>{const o=Rs(s,a.entity),c={...o,name:a.name?.trim()||o.name};if(c.temp==null||e==null||c.stale)return p`
              <div class="room" title=${c.stale?"This sensor has not reported for hours - the reading below is stale.":""}>
                <span class="rname">${c.name}</span>
                <span class="rtemp muted">
                  ${c.temp==null?"\u2014":c.stale?p`<span class="stalechip">stale</span>${ze(c.temp)}°`:`${ze(c.temp)}\xB0`}
                </span>
              </div>
            `;const r=Math.round(c.temp-e);return p`
            <div class="room">
              <span class="rname">${c.name}</span>
              <span>
                <span class="badge ${un(r,n,i)}"
                  >${pn(r)}</span
                >
                <span class="rtemp">${ze(c.temp)}°</span>
              </span>
            </div>
          `})}
      </div>
    `}};g.styles=Ot`
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
  `;$([Be({attribute:false})],g.prototype,"hass",2);$([b()],g.prototype,"_config",2);$([b()],g.prototype,"_zoneIndex",2);$([b()],g.prototype,"_ctrlOpen",2);$([b()],g.prototype,"_setupOpen",2);$([b()],g.prototype,"_schedOpen",2);$([b()],g.prototype,"_schedWeek",2);$([b()],g.prototype,"_schedError",2);$([b()],g.prototype,"_schedBusy",2);$([b()],g.prototype,"_schedSel",2);$([b()],g.prototype,"_schedDrafts",2);$([b()],g.prototype,"_schedNotice",2);$([b()],g.prototype,"_schedGran",2);$([b()],g.prototype,"_rtOpen",2);$([b()],g.prototype,"_rtDaily",2);$([b()],g.prototype,"_rtDayOpen",2);$([b()],g.prototype,"_rtDayDetail",2);$([b()],g.prototype,"_rtDayLoading",2);$([b()],g.prototype,"_rtRange",2);$([b()],g.prototype,"_rt30",2);$([b()],g.prototype,"_dryRun",2);$([b()],g.prototype,"_dryRunError",2);$([b()],g.prototype,"_dryRunning",2);$([b()],g.prototype,"_execConfirm",2);$([b()],g.prototype,"_execRunning",2);$([b()],g.prototype,"_execLog",2);$([b()],g.prototype,"_execResult",2);$([b()],g.prototype,"_tdArmed",2);$([b()],g.prototype,"_tdRunning",2);$([b()],g.prototype,"_setupTab",2);$([b()],g.prototype,"_tdAsk",2);$([b()],g.prototype,"_tdConfirm",2);$([b()],g.prototype,"_objects",2);$([b()],g.prototype,"_objectsLoading",2);$([b()],g.prototype,"_objectsError",2);g=$([Lt(Fe)],g);window.customCards=window.customCards??[];window.customCards.push({type:Fe,name:jt,description:"Multi-zone climate view for 1-4 zones with seasonal scheduling, fan timers, and runtime history."});var In=Object.defineProperty,Nn=Object.getOwnPropertyDescriptor,$e=(t,e,s,n)=>{for(var i=n>1?void 0:n?Nn(e,s):e,a=t.length-1,o;a>=0;a--)(o=t[a])&&(i=(n?o(e,s,i):o(i))||i);return n&&i&&In(e,s,i),i};let De=null;function Wn(){return De||(De=(async()=>{if(!customElements.get("ha-selector"))try{await(await window.loadCardHelpers?.())?.createCardElement({type:"entities",entities:[]})?.constructor.getConfigElement?.(),await customElements.whenDefined("ha-selector")}catch{}})()),De}const Hn=[{key:"summer",name:"Summer",default_mode:"cool"},{key:"winter",name:"Winter",default_mode:"heat_cool"}];let W=class extends B{constructor(){super(...arguments),this._ready=false}setConfig(t){this._config={type:t.type,prefix:t.prefix??"climate",zones:t.zones??[],seasons:t.seasons??Hn.map(e=>({...e})),season_switch:t.season_switch??"manual",weather_entity:t.weather_entity,features:{...t.features,fan_timer:t.features?.fan_timer??[15,30,60],anomaly_alerts:t.features?.anomaly_alerts??true}}}connectedCallback(){super.connectedCallback(),Wn().then(()=>{this._ready=true})}_seasonProvisioned(t){const e=this.hass,s=this._config;if(!e||!s)return true;const n=s.prefix??"climate";return(s.zones??[]).some(i=>i.name&&!!e.states[`schedule.${n}_${z(i.name)}_${t}`])}_emit(t){this._config&&(this._config={...this._config,...t},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:true,composed:true})))}_setZone(t,e){const s=(this._config?.zones??[]).map((n,i)=>i===t?{...n,...e}:n);this._emit({zones:s})}_selector(t,e,s,n){return!this._ready||!customElements.get("ha-selector")?p`<input
        .value=${typeof e=="string"?e:""}
        placeholder=${n??""}
        @change=${i=>s(i.target.value)}
      />`:p`<ha-selector
      .hass=${this.hass}
      .selector=${t}
      .value=${e}
      .label=${n}
      @value-changed=${i=>s(i.detail.value)}
    ></ha-selector>`}render(){const t=this._config;if(!t)return h;const e=t.zones??[],s=t.seasons??[];return p`
      <div class="ed">
        <h4>Zones (1-4)</h4>
        ${e.map((n,i)=>p`
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
              ${this._selector({entity:{domain:"sensor",device_class:"temperature",multiple:true}},V(n.room_sensors).map(a=>a.entity),a=>{const o=(a??[]).filter(Boolean),c=new Map(V(n.room_sensors).map(r=>[r.entity,r]));this._setZone(i,{room_sensors:o.map(r=>{const l=c.get(r);return l?.name?{entity:r,name:l.name}:r})})},"Room sensors")}
              ${V(n.room_sensors).map(a=>p`
                  <label class="fieldrow roomlabel">
                    <span class="rooment"
                      >${this.hass?.states[a.entity]?.attributes.friendly_name??a.entity}</span
                    >
                    <input
                      .value=${a.name??""}
                      placeholder="Label on card (optional)"
                      @change=${o=>{const c=o.target.value.trim();this._setZone(i,{room_sensors:V(n.room_sensors).map(r=>r.entity===a.entity?c?{entity:r.entity,name:c}:r.entity:r.name?{entity:r.entity,name:r.name}:r.entity)})}}
                    />
                  </label>
                `)}
            </div>
          `)}
        ${e.length<4?p`<button
              class="link"
              @click=${()=>this._emit({zones:[...e,{entity:"",name:`Zone ${e.length+1}`}]})}
            >
              + Add zone
            </button>`:h}

        <h4>Seasons (1-4)</h4>
        ${s.map((n,i)=>p`
            <div class="seasonrow">
              <input
                .value=${n.name}
                @change=${a=>{const o=a.target.value,c=o.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""),r=s.some((u,m)=>m!==i&&u.key===c),l=this._seasonProvisioned(n.key)||!c||r?n.key:c,d=s.map((u,m)=>m===i?{...u,name:o,key:l}:u);this._emit({seasons:d})}}
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
        ${s.length<4?p`<button
              class="link"
              @click=${()=>{let n=s.length+1;for(;s.some(i=>i.key===`season_${n}`);)n++;this._emit({seasons:[...s,{key:`season_${n}`,name:`Season ${n}`,default_mode:"cool"}]})}}
            >
              + Add season
            </button>`:h}

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
        ${t.features?.eco_preset!==false?p`
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
            `:p`
              <p class="bad">
                With this off, the schedule keeps applying setpoints even while a thermostat
                is in its Eco/away mode - overriding, and likely fighting, the device's or
                its app's own standby behavior. Only turn this off if you have disabled
                Eco/away features on the device and want Home Assistant to own standby.
              </p>
            `}

        <h4>Advanced</h4>
        <label class="fieldrow">
          Entity prefix
          <input
            .value=${t.prefix??"climate"}
            @change=${n=>{const i=n.target,a=z(i.value)||"climate";i.value=a,this._emit({prefix:a})}}
          />
        </label>
      </div>
    `}};W.styles=Ot`
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
  `;$e([Be({attribute:false})],W.prototype,"hass",2);$e([b()],W.prototype,"_config",2);$e([b()],W.prototype,"_ready",2);W=$e([Lt(It)],W);const Un=Object.freeze(Object.defineProperty({__proto__:null,get MzcsCardEditor(){return W}},Symbol.toStringTag,{value:"Module"}));export{g as MzcsCard};

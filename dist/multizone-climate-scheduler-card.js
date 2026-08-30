"use strict";/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const he=globalThis,qe=he.ShadowRoot&&(he.ShadyCSS===void 0||he.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Ge=Symbol(),dt=new WeakMap;let Ut=class{constructor(e,s,n){if(this._$cssResult$=true,n!==Ge)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=s}get styleSheet(){let e=this.o;const s=this.t;if(qe&&e===void 0){const n=s!==void 0&&s.length===1;n&&(e=dt.get(s)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&dt.set(s,e))}return e}toString(){return this.cssText}};const ys=t=>new Ut(typeof t=="string"?t:t+"",void 0,Ge),Bt=(t,...e)=>{const s=t.length===1?t[0]:e.reduce((n,i,o)=>n+(a=>{if(a._$cssResult$===true)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[o+1],t[0]);return new Ut(s,t,Ge)},bs=(t,e)=>{if(qe)t.adoptedStyleSheets=e.map(s=>s instanceof CSSStyleSheet?s:s.styleSheet);else for(const s of e){const n=document.createElement("style"),i=he.litNonce;i!==void 0&&n.setAttribute("nonce",i),n.textContent=s.cssText,t.appendChild(n)}},ut=qe?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let s="";for(const n of e.cssRules)s+=n.cssText;return ys(s)})(t):t;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:$s,defineProperty:vs,getOwnPropertyDescriptor:ws,getOwnPropertyNames:xs,getOwnPropertySymbols:ks,getPrototypeOf:Ss}=Object,ve=globalThis,pt=ve.trustedTypes,Es=pt?pt.emptyScript:"",As=ve.reactiveElementPolyfillSupport,J=(t,e)=>t,_e={toAttribute(t,e){switch(e){case Boolean:t=t?Es:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=t!==null;break;case Number:s=t===null?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch{s=null}}return s}},Ve=(t,e)=>!$s(t,e),ht={attribute:true,type:String,converter:_e,reflect:false,useDefault:false,hasChanged:Ve};Symbol.metadata??=Symbol("metadata"),ve.litPropertyMetadata??=new WeakMap;let K=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,s=ht){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(e)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(e,s),!s.noAccessor){const n=Symbol(),i=this.getPropertyDescriptor(e,n,s);i!==void 0&&vs(this.prototype,e,i)}}static getPropertyDescriptor(e,s,n){const{get:i,set:o}=ws(this.prototype,e)??{get(){return this[s]},set(a){this[s]=a}};return{get:i,set(a){const r=i?.call(this);o?.call(this,a),this.requestUpdate(e,r,n)},configurable:true,enumerable:true}}static getPropertyOptions(e){return this.elementProperties.get(e)??ht}static _$Ei(){if(this.hasOwnProperty(J("elementProperties")))return;const e=Ss(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(J("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(J("properties"))){const s=this.properties,n=[...xs(s),...ks(s)];for(const i of n)this.createProperty(i,s[i])}const e=this[Symbol.metadata];if(e!==null){const s=litPropertyMetadata.get(e);if(s!==void 0)for(const[n,i]of s)this.elementProperties.set(n,i)}this._$Eh=new Map;for(const[s,n]of this.elementProperties){const i=this._$Eu(s,n);i!==void 0&&this._$Eh.set(i,s)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const s=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const i of n)s.unshift(ut(i))}else e!==void 0&&s.push(ut(e));return s}static _$Eu(e,s){const n=s.attribute;return n===false?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,s=this.constructor.elementProperties;for(const n of s.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return bs(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,s,n){this._$AK(e,n)}_$ET(e,s){const n=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,n);if(i!==void 0&&n.reflect===true){const o=(n.converter?.toAttribute!==void 0?n.converter:_e).toAttribute(s,n.type);this._$Em=e,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(e,s){const n=this.constructor,i=n._$Eh.get(e);if(i!==void 0&&this._$Em!==i){const o=n.getPropertyOptions(i),a=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:_e;this._$Em=i;const r=a.fromAttribute(s,o.type);this[i]=r??this._$Ej?.get(i)??r,this._$Em=null}}requestUpdate(e,s,n,i=false,o){if(e!==void 0){const a=this.constructor;if(i===false&&(o=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??Ve)(o,s)||n.useDefault&&n.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,s,n)}this.isUpdatePending===false&&(this._$ES=this._$EP())}C(e,s,{useDefault:n,reflect:i,wrapped:o},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??s??this[e]),o!==true||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(s=void 0),this._$AL.set(e,s)),i===true&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=true;try{await this._$ES}catch(s){Promise.reject(s)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[i,o]of this._$Ep)this[i]=o;this._$Ep=void 0}const n=this.constructor.elementProperties;if(n.size>0)for(const[i,o]of n){const{wrapped:a}=o,r=this[i];a!==true||this._$AL.has(i)||r===void 0||this.C(i,void 0,o,r)}}let e=false;const s=this._$AL;try{e=this.shouldUpdate(s),e?(this.willUpdate(s),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(s)):this._$EM()}catch(n){throw e=false,this._$EM(),n}e&&this._$AE(s)}willUpdate(e){}_$AE(e){this._$EO?.forEach(s=>s.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=false}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return true}update(e){this._$Eq&&=this._$Eq.forEach(s=>this._$ET(s,this[s])),this._$EM()}updated(e){}firstUpdated(e){}};K.elementStyles=[],K.shadowRootOptions={mode:"open"},K[J("elementProperties")]=new Map,K[J("finalized")]=new Map,As?.({ReactiveElement:K}),(ve.reactiveElementVersions??=[]).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ye=globalThis,mt=t=>t,ge=Ye.trustedTypes,ft=ge?ge.createPolicy("lit-html",{createHTML:t=>t}):void 0,Kt="$lit$",N=`lit$${Math.random().toFixed(9).slice(2)}$`,Zt="?"+N,zs=`<${Zt}>`,H=document,te=()=>H.createComment(""),se=t=>t===null||typeof t!="object"&&typeof t!="function",Je=Array.isArray,Cs=t=>Je(t)||typeof t?.[Symbol.iterator]=="function",ze=`[ 	
\f\r]`,V=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,_t=/-->/g,gt=/>/g,P=RegExp(`>|${ze}(?:([^\\s"'>=/]+)(${ze}*=${ze}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),yt=/'/g,bt=/"/g,qt=/^(?:script|style|textarea|title)$/i,Ts=t=>(e,...s)=>({_$litType$:t,strings:e,values:s}),p=Ts(1),q=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),$t=new WeakMap,L=H.createTreeWalker(H,129);function Gt(t,e){if(!Je(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return ft!==void 0?ft.createHTML(e):e}const Rs=(t,e)=>{const s=t.length-1,n=[];let i,o=e===2?"<svg>":e===3?"<math>":"",a=V;for(let r=0;r<s;r++){const c=t[r];let l,d,u=-1,m=0;for(;m<c.length&&(a.lastIndex=m,d=a.exec(c),d!==null);)m=a.lastIndex,a===V?d[1]==="!--"?a=_t:d[1]!==void 0?a=gt:d[2]!==void 0?(qt.test(d[2])&&(i=RegExp("</"+d[2],"g")),a=P):d[3]!==void 0&&(a=P):a===P?d[0]===">"?(a=i??V,u=-1):d[1]===void 0?u=-2:(u=a.lastIndex-d[2].length,l=d[1],a=d[3]===void 0?P:d[3]==='"'?bt:yt):a===bt||a===yt?a=P:a===_t||a===gt?a=V:(a=P,i=void 0);const _=a===P&&t[r+1].startsWith("/>")?" ":"";o+=a===V?c+zs:u>=0?(n.push(l),c.slice(0,u)+Kt+c.slice(u)+N+_):c+N+(u===-2?r:_)}return[Gt(t,o+(t[s]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]};class ne{constructor({strings:e,_$litType$:s},n){let i;this.parts=[];let o=0,a=0;const r=e.length-1,c=this.parts,[l,d]=Rs(e,s);if(this.el=ne.createElement(l,n),L.currentNode=this.el.content,s===2||s===3){const u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(i=L.nextNode())!==null&&c.length<r;){if(i.nodeType===1){if(i.hasAttributes())for(const u of i.getAttributeNames())if(u.endsWith(Kt)){const m=d[a++],_=i.getAttribute(u).split(N),k=/([.?@])?(.*)/.exec(m);c.push({type:1,index:o,name:k[2],strings:_,ctor:k[1]==="."?Ds:k[1]==="?"?Is:k[1]==="@"?Ms:we}),i.removeAttribute(u)}else u.startsWith(N)&&(c.push({type:6,index:o}),i.removeAttribute(u));if(qt.test(i.tagName)){const u=i.textContent.split(N),m=u.length-1;if(m>0){i.textContent=ge?ge.emptyScript:"";for(let _=0;_<m;_++)i.append(u[_],te()),L.nextNode(),c.push({type:2,index:++o});i.append(u[m],te())}}}else if(i.nodeType===8)if(i.data===Zt)c.push({type:2,index:o});else{let u=-1;for(;(u=i.data.indexOf(N,u+1))!==-1;)c.push({type:7,index:o}),u+=N.length-1}o++}}static createElement(e,s){const n=H.createElement("template");return n.innerHTML=e,n}}function G(t,e,s=t,n){if(e===q)return e;let i=n!==void 0?s._$Co?.[n]:s._$Cl;const o=se(e)?void 0:e._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(false),o===void 0?i=void 0:(i=new o(t),i._$AT(t,s,n)),n!==void 0?(s._$Co??=[])[n]=i:s._$Cl=i),i!==void 0&&(e=G(t,i._$AS(t,e.values),i,n)),e}class Os{constructor(e,s){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:s},parts:n}=this._$AD,i=(e?.creationScope??H).importNode(s,true);L.currentNode=i;let o=L.nextNode(),a=0,r=0,c=n[0];for(;c!==void 0;){if(a===c.index){let l;c.type===2?l=new re(o,o.nextSibling,this,e):c.type===1?l=new c.ctor(o,c.name,c.strings,this,e):c.type===6&&(l=new Ns(o,this,e)),this._$AV.push(l),c=n[++r]}a!==c?.index&&(o=L.nextNode(),a++)}return L.currentNode=H,i}p(e){let s=0;for(const n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,s),s+=n.strings.length-2):n._$AI(e[s])),s++}}class re{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,s,n,i){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=e,this._$AB=s,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??true}get parentNode(){let e=this._$AA.parentNode;const s=this._$AM;return s!==void 0&&e?.nodeType===11&&(e=s.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,s=this){e=G(this,e,s),se(e)?e===h||e==null||e===""?(this._$AH!==h&&this._$AR(),this._$AH=h):e!==this._$AH&&e!==q&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Cs(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==h&&se(this._$AH)?this._$AA.nextSibling.data=e:this.T(H.createTextNode(e)),this._$AH=e}$(e){const{values:s,_$litType$:n}=e,i=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=ne.createElement(Gt(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(s);else{const o=new Os(i,this),a=o.u(this.options);o.p(s),this.T(a),this._$AH=o}}_$AC(e){let s=$t.get(e.strings);return s===void 0&&$t.set(e.strings,s=new ne(e)),s}k(e){Je(this._$AH)||(this._$AH=[],this._$AR());const s=this._$AH;let n,i=0;for(const o of e)i===s.length?s.push(n=new re(this.O(te()),this.O(te()),this,this.options)):n=s[i],n._$AI(o),i++;i<s.length&&(this._$AR(n&&n._$AB.nextSibling,i),s.length=i)}_$AR(e=this._$AA.nextSibling,s){for(this._$AP?.(false,true,s);e!==this._$AB;){const n=mt(e).nextSibling;mt(e).remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class we{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,s,n,i,o){this.type=1,this._$AH=h,this._$AN=void 0,this.element=e,this.name=s,this._$AM=i,this.options=o,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=h}_$AI(e,s=this,n,i){const o=this.strings;let a=false;if(o===void 0)e=G(this,e,s,0),a=!se(e)||e!==this._$AH&&e!==q,a&&(this._$AH=e);else{const r=e;let c,l;for(e=o[0],c=0;c<o.length-1;c++)l=G(this,r[n+c],s,c),l===q&&(l=this._$AH[c]),a||=!se(l)||l!==this._$AH[c],l===h?e=h:e!==h&&(e+=(l??"")+o[c+1]),this._$AH[c]=l}a&&!i&&this.j(e)}j(e){e===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Ds extends we{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===h?void 0:e}}class Is extends we{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==h)}}class Ms extends we{constructor(e,s,n,i,o){super(e,s,n,i,o),this.type=5}_$AI(e,s=this){if((e=G(this,e,s,0)??h)===q)return;const n=this._$AH,i=e===h&&n!==h||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,o=e!==h&&(n===h||i);i&&this.element.removeEventListener(this.name,this,n),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Ns{constructor(e,s,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=s,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){G(this,e)}}const Ps=Ye.litHtmlPolyfillSupport;Ps?.(ne,re),(Ye.litHtmlVersions??=[]).push("3.3.3");const js=(t,e,s)=>{const n=s?.renderBefore??e;let i=n._$litPart$;if(i===void 0){const o=s?.renderBefore??null;n._$litPart$=i=new re(e.insertBefore(te(),o),o,void 0,s??{})}return i._$AI(t),i};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Xe=globalThis;class Z extends K{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const s=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=js(s,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false)}render(){return q}}Z._$litElement$=true,Z.finalized=true,Xe.litElementHydrateSupport?.({LitElement:Z});const Ls=Xe.litElementPolyfillSupport;Ls?.({LitElement:Z});(Xe.litElementVersions??=[]).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Vt=t=>(e,s)=>{s!==void 0?s.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ws={attribute:true,type:String,converter:_e,reflect:false,hasChanged:Ve},Hs=(t=Ws,e,s)=>{const{kind:n,metadata:i}=s;let o=globalThis.litPropertyMetadata.get(i);if(o===void 0&&globalThis.litPropertyMetadata.set(i,o=new Map),n==="setter"&&((t=Object.create(t)).wrapped=true),o.set(s.name,t),n==="accessor"){const{name:a}=s;return{set(r){const c=e.get.call(this);e.set.call(this,r),this.requestUpdate(a,c,t,true,r)},init(r){return r!==void 0&&this.C(a,void 0,t,r),r}}}if(n==="setter"){const{name:a}=s;return function(r){const c=this[a];e.call(this,r),this.requestUpdate(a,c,t,true,r)}}throw Error("Unsupported decorator location: "+n)};function Qe(t){return(e,s)=>typeof s=="object"?Hs(t,e,s):((n,i,o)=>{const a=i.hasOwnProperty(o);return i.constructor.createProperty(o,n),a?Object.getOwnPropertyDescriptor(i,o):void 0})(t,e,s)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function $(t){return Qe({...t,state:true,attribute:false})}const Yt="0.7.3",et="multizone-climate-scheduler-card",Jt="Multi-Zone Climate Scheduler Card",Xt=`${et}-editor`;function W(t){return(t??[]).map(e=>typeof e=="string"?{entity:e}:e).filter(e=>!!e&&typeof e.entity=="string"&&e.entity!=="")}function X(t){const e=t?.eco_preset;return e===false?null:typeof e=="string"&&e.trim()?e.trim():"eco"}function tt(t){if(!t||!Array.isArray(t.zones??[]))throw new Error("zones must be a list of { entity, name } items.");const e=t.zones??[];if(e.length>4)throw new Error("A maximum of 4 zones is supported.");const s=e.map(o=>({...o,name:typeof o.name=="string"&&o.name.trim()?o.name:o.entity?o.entity.split(".")[1].replace(/_/g," "):"Zone"})),n=t.features?.fan_timer,i=t.features?{...t.features,fan_timer:Array.isArray(n)?n:typeof n=="number"?[n]:void 0}:void 0;return{...t,zones:s,...i?{features:i}:{}}}const st={fan_timer:{domain:"timer",suffix:"fan"},room_override_timer:{domain:"timer",suffix:"room_override"},running_sensor:{domain:"binary_sensor",suffix:"running"},runtime_today:{domain:"sensor",suffix:"runtime_today"},runtime_mirror:{domain:"sensor",suffix:"runtime_mirror"},expected_runtime:{domain:"sensor",suffix:"expected_runtime"},target_room_select:{domain:"input_select",suffix:"target_room"},sensor_schedule:{domain:"schedule",suffix:"sensor_schedule"},applied_block_marker:{domain:"input_text",suffix:"applied_block"},zone_enabled:{domain:"input_boolean",suffix:"enabled"},k_factor:{domain:"input_number",suffix:"k"}},nt={season_select:{domain:"input_select",suffix:"season"},season_mode:{domain:"input_select",suffix:"season_mode"},season_confirm_days:{domain:"input_number",suffix:"season_confirm_days"},season_dwell_days:{domain:"input_number",suffix:"season_dwell_days"},dev_green_max:{domain:"input_number",suffix:"dev_green_max"},dev_amber_max:{domain:"input_number",suffix:"dev_amber_max"},runtime_alert_margin:{domain:"input_number",suffix:"runtime_alert_margin"},runtime_alert_days:{domain:"input_number",suffix:"runtime_alert_days"},runtime_learn_days:{domain:"input_number",suffix:"runtime_learn_days"},cdd_base:{domain:"input_number",suffix:"cdd_base"},override_minutes:{domain:"input_number",suffix:"override_minutes"},steer_min_setpoint:{domain:"input_number",suffix:"steer_min_setpoint"},steer_max_setpoint:{domain:"input_number",suffix:"steer_max_setpoint"},steer_max_offset:{domain:"input_number",suffix:"steer_max_offset"},next_block_sensor:{domain:"sensor",suffix:"next_block"},outdoor_temp_sensor:{domain:"sensor",suffix:"outdoor_temp"},outdoor_daily_mean:{domain:"sensor",suffix:"outdoor_daily_mean"},theme:{domain:"input_text",suffix:"theme"}};[...Object.values(st).map(t=>t.suffix),...Object.values(nt).map(t=>t.suffix)];function C(t){return t.toLowerCase().replace(/['’]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function w(t,e,s){const n=st[t];return`${n.domain}.${e}_${s}_${n.suffix}`}function Q(t,e,s){return`schedule.${t}_${e}_${s}`}function Fs(t,e){const s=t?.find(n=>n?.name===e);return s?String(s.key):C(e)}function S(t,e){const s=nt[t];return`${s.domain}.${e}_${s.suffix}`}function O(t,e){return`${t}_mzcs_${e}`}function Us(t,e,s){return`automation.${M(t,e,s).toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}`}function M(t,e,s){const n=t.charAt(0).toUpperCase()+t.slice(1);return{engine:`${n}: schedule engine`,fan_timer:`${n}: ${s??"?"} fan timer finished`,season_recommender:`${n}: season recommender`,runtime_alert:`${n}: runtime anomaly alert`,runtime_learning:`${n}: runtime learning`,watchdog:`${n}: engine watchdog`,steering:`${n}: comfort steering`}[e]??`${n}: ${e}`}const Bs=Object.entries(nt),Ks=Object.entries(st);function Qt(t,e,s,n){const i=t.indexOf(".");if(i<0)return null;const o=t.slice(0,i),a=t.slice(i+1);if(a!==e&&!a.startsWith(`${e}_`))return null;const r=a.slice(e.length+1);for(const[l,d]of Bs)if(o===d.domain&&r===d.suffix)return{cls:l};const c=[...s].sort((l,d)=>d.length-l.length);for(const l of c){if(r!==l&&!r.startsWith(`${l}_`))continue;const d=r.slice(l.length+1);for(const[u,m]of Ks)if(o===m.domain&&d===m.suffix)return{cls:u,zone:l};if(o==="schedule"&&n.includes(d))return{cls:"zone_schedule",zone:l,season:d}}return null}const R=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"],es=["monday","tuesday","wednesday","thursday","friday"],Zs=["saturday","sunday"];function qs(t){const e=[];t.length===0&&e.push("A day needs at least one block.");const s=new Set;for(const n of t)/^([01]\d|2[0-3]):[0-5]\d$/.test(n.time)||e.push(`Bad time "${n.time}".`),s.has(n.time)&&e.push(`Duplicate block time ${n.time}.`),s.add(n.time),n.mode==="cool"&&n.cool_temp==null&&e.push(`${n.name}: cool needs cool_temp.`),n.mode==="heat"&&n.heat_temp==null&&e.push(`${n.name}: heat needs heat_temp.`),n.mode==="heat_cool"&&(n.cool_temp==null||n.heat_temp==null)&&e.push(`${n.name}: heat_cool needs both cool_temp and heat_temp.`),n.cool_temp!=null&&n.heat_temp!=null&&n.heat_temp>=n.cool_temp&&e.push(`${n.name}: heat_temp must be below cool_temp.`);return e}function Ce(t){return{block:t.name,mode:t.mode,...t.cool_temp!=null?{cool_temp:t.cool_temp}:{},...t.heat_temp!=null?{heat_temp:t.heat_temp}:{}}}function Gs(t){const e=qs(t);if(e.length>0)throw new Error(e.join(" "));const s=[...t].sort((a,r)=>a.time.localeCompare(r.time)),n=s[0],i=s[s.length-1];if(s.length===1)return[{from:"00:00:00",to:"24:00:00",data:Ce(n)}];const o=[];n.time!=="00:00"&&o.push({from:"00:00:00",to:`${n.time}:00`,data:Ce(i)});for(let a=0;a<s.length;a++){const r=s[a],c=s[a+1];o.push({from:`${r.time}:00`,to:c?`${c.time}:00`:"24:00:00",data:Ce(r)})}return o}function ts(t,e){if(t==="all"&&e==="all")return R;if(t==="wdwe"&&e==="wd")return es;if(t==="wdwe"&&e==="we")return Zs;if(t==="days"&&R.includes(e.toLowerCase()))return[e.toLowerCase()];throw new Error(`Unknown set "${e}" for granularity "${t}".`)}function Vs(t,e){const s={};for(const[n,i]of Object.entries(e)){const o=Gs(i);for(const a of ts(t,n))s[a]=o}for(const n of R)if(!s[n])throw new Error(`No block set covers ${n}.`);return s}function Ys(t,e,s){if(t===e)return s;const n=i=>{const o=s[i];if(!o)throw new Error(`Missing set "${i}" for transition ${t}\u2192${e}.`);return o.map(a=>({...a}))};if(t==="all"&&e==="wdwe")return{wd:n("all"),we:n("all")};if(t==="all"&&e==="days")return Object.fromEntries(R.map(i=>[i,n("all")]));if(t==="wdwe"&&e==="days")return Object.fromEntries(R.map(i=>[i,es.includes(i)?n("wd"):n("we")]));if(t==="wdwe"&&e==="all")return{all:n("wd")};if(t==="days"&&e==="wdwe")return{wd:n("monday"),we:n("saturday")};if(t==="days"&&e==="all")return{all:n("monday")};throw new Error(`Unsupported transition ${t}\u2192${e}.`)}const ce="Managed by Multi-Zone Climate Scheduler Card (mzcs).";function ie(t){if(Array.isArray(t))return`[${t.map(ie).join(",")}]`;if(t!==null&&typeof t=="object"){const e=t;return`{${Object.keys(e).sort().map(s=>`${JSON.stringify(s)}:${ie(e[s])}`).join(",")}}`}return JSON.stringify(t)}function Js(t){const e=ie(t);let s=5381;for(let n=0;n<e.length;n++)s=(s<<5)+s+e.charCodeAt(n)>>>0;return s.toString(16).padStart(8,"0")}const ss=/\[mzcs-sig:([0-9a-f]{8})\]/;function oe(t){const e=typeof t=="string"?t.match(ss):null;return e?e[1]:null}function ae(t){const e=String(t.description??"").replace(ss,"").trimEnd();return Js({...t,description:e})}function le(t){const e=ae(t);return{...t,description:`${String(t.description??"")} [mzcs-sig:${e}]`}}function Xs(t,e,s,n,i="eco"){const o=r=>oe(r.description),a={[O(t,"engine")]:o(ns(t,e,s,i)),[O(t,"watchdog")]:o(as(t)),[O(t,"runtime_learning")]:o(os(t,e)),[O(t,"runtime_alert")]:o(rs(t,e))};for(const r of e)a[O(t,`fan_timer_${r.slug}`)]=o(is(t,r,n));return a}function ns(t,e,s,n="eco"){const i=n===null?null:n.replace(/['"\\]/g,"").trim()||"eco",o=i===null?"":i==="eco"?" Zones stand down while their Eco preset is active.":` Zones stand down while their '${i}' preset is active.`,a=i===null?"Skip when zone disabled, already applied, or no block data":i==="eco"?"Skip when zone disabled, already applied, Eco active, or no block data":"Skip when zone disabled, already applied, standby preset active, or no block data",r=i===null?"":` and state_attr(repeat.item.climate, 'preset_mode') != '${i}'`,c=e.flatMap(u=>s.map(m=>Q(t,u.slug,m.key))),l=e.map(u=>w("zone_enabled",t,u.slug)),d=`{${s.map(u=>`'${u.name.replace(/'/g,"")}': '${u.key}'`).join(", ")}}`;return le({id:O(t,"engine"),alias:M(t,"engine"),description:`${ce} Applies the active season's schedule block to each ENABLED zone at block transitions. Per-zone applied-block markers mean manual changes and external raises HOLD until the next block; the 15-minute tick only recovers missed transitions.${o} heat_cool blocks apply dual setpoints.`,mode:"queued",max:5,triggers:[{trigger:"state",entity_id:c,alias:"Any zone schedule changed"},{trigger:"homeassistant",event:"start",alias:"HA started"},{trigger:"time_pattern",minutes:"/15",alias:"Safety tick"},{trigger:"state",entity_id:S("season_select",t),alias:"Season changed"},{trigger:"state",entity_id:l,to:"on",alias:"Zone re-enabled"}],conditions:[],actions:[{alias:"Resolve the active season key",variables:{season:`{{ ${d}.get(states('${S("season_select",t)}'), states('${S("season_select",t)}') | lower) }}`}},{alias:"Apply per zone",repeat:{for_each:e.map(u=>({zone:u.slug,climate:u.climate,marker:w("applied_block_marker",t,u.slug),enabled:w("zone_enabled",t,u.slug)})),sequence:[{alias:"Read this zone's active block",variables:{blk:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'block') }}`,blk_mode:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'mode') }}`,blk_cool:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'cool_temp') }}`,blk_heat:`{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'heat_temp') }}`}},{alias:a,condition:"template",value_template:`{{ is_state(repeat.item.enabled, 'on') and blk is not none and blk != states(repeat.item.marker)${r} }}`},{alias:"Apply the block (dual range, off, or single target)",continue_on_error:true,choose:[{conditions:[{condition:"template",value_template:"{{ blk_mode == 'heat_cool' }}"}],sequence:[{alias:"Apply heat_cool range",action:"climate.set_temperature",target:{entity_id:"{{ repeat.item.climate }}"},data:{target_temp_high:"{{ blk_cool }}",target_temp_low:"{{ blk_heat }}",hvac_mode:"heat_cool"}}]},{conditions:[{condition:"template",value_template:"{{ blk_mode == 'off' }}"}],sequence:[{alias:"Turn the zone off",action:"climate.set_hvac_mode",target:{entity_id:"{{ repeat.item.climate }}"},data:{hvac_mode:"off"}}]},{conditions:[{condition:"template",value_template:"{{ blk_cool is not none or blk_heat is not none }}"}],sequence:[{alias:"Apply single target",action:"climate.set_temperature",target:{entity_id:"{{ repeat.item.climate }}"},data:{temperature:"{{ blk_cool if blk_cool is not none else blk_heat }}",hvac_mode:"{{ blk_mode }}"}}]}],default:[]},{alias:"Record the applied block",action:"input_text.set_value",target:{entity_id:"{{ repeat.item.marker }}"},data:{value:"{{ blk }}"}}]}}]})}function is(t,e,s){return le({id:O(t,`fan_timer_${e.slug}`),alias:M(t,"fan_timer",e.name),description:`${ce} Turns the ${e.name} fan off when its fan timer ends.`,mode:"single",triggers:[{trigger:"event",event_type:"timer.finished",event_data:{entity_id:w("fan_timer",t,e.slug)},alias:`${e.name} fan timer finished`}],conditions:s?[{alias:"Stand down while the fan-guard helper wants the fan running",condition:"state",entity_id:s,state:"off"}]:[],actions:[{alias:`Turn the ${e.name} fan off`,action:"climate.set_fan_mode",target:{entity_id:e.climate},data:{fan_mode:"off"}}]})}function os(t,e){return le({id:O(t,"runtime_learning"),alias:M(t,"runtime_learning"),description:`${ce} Nightly EMA update of each zone's runtime-per-cooling-degree-day factor. Skips mild days; first valid day seeds directly.`,mode:"single",triggers:[{trigger:"time",at:"23:58:00",alias:"Nightly close"}],conditions:[],actions:[{alias:"Compute today's cooling degree-days",variables:{cdd:`{{ [ (states('sensor.${t}_outdoor_daily_mean') | float(0)) - (states('${S("cdd_base",t)}') | float(75)), 0 ] | max }}`,alpha:`{{ 2 / ((states('${S("runtime_learn_days",t)}') | float(30)) + 1) }}`}},{alias:"Skip mild days",condition:"template",value_template:"{{ cdd > 0.5 }}"},{alias:"Update k per zone",repeat:{for_each:e.map(s=>({runtime:w("runtime_today",t,s.slug),k:w("k_factor",t,s.slug)})),sequence:[{alias:"Compute the EMA",variables:{runtime_h:"{{ states(repeat.item.runtime) | float(-1) }}",old_k:"{{ states(repeat.item.k) | float(0) }}"}},{alias:"Skip if unavailable",condition:"template",value_template:"{{ runtime_h >= 0 }}"},{alias:"Write the new k",action:"input_number.set_value",target:{entity_id:"{{ repeat.item.k }}"},data:{value:"{{ ((runtime_h / cdd) if old_k == 0 else (alpha * (runtime_h / cdd) + (1 - alpha) * old_k)) | round(2) }}"}}]}}]})}function as(t){const e="automation."+M(t,"engine").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");return le({id:O(t,"watchdog"),alias:M(t,"watchdog"),description:`${ce} Alerts when the schedule engine automation is off or unavailable for 5 minutes.`,mode:"single",triggers:[{trigger:"state",entity_id:e,to:["off","unavailable"],for:{minutes:5},alias:"Engine down"}],conditions:[],actions:[{alias:"Notify all admins via persistent notification",action:"persistent_notification.create",data:{title:"Climate schedule engine is down",message:"The Climate: schedule engine automation is off or unavailable. Zone schedules are not being applied - your thermostats hold their last setpoints (their own app schedules still work)."}}]})}function rs(t,e){return le({id:O(t,"runtime_alert"),alias:M(t,"runtime_alert"),description:`${ce} Evening check: notifies when a zone's runtime is over the weather-normalized expectation by the alert margin. Uses learned k; silent while learning.`,mode:"single",triggers:[{trigger:"time",at:"20:00:00",alias:"Evening check"}],conditions:[],actions:[{alias:"Check each zone",repeat:{for_each:e.map(s=>({name:s.name,runtime:w("runtime_today",t,s.slug),expected:w("expected_runtime",t,s.slug)})),sequence:[{alias:"Compute exceedance",variables:{run_h:"{{ states(repeat.item.runtime) | float(0) }}",exp_h:"{{ states(repeat.item.expected) | float(0) }}",margin:`{{ states('${S("runtime_alert_margin",t)}') | float(35) }}`}},{alias:"Only alert on a real, learned exceedance",condition:"template",value_template:"{{ exp_h > 0 and run_h > exp_h * (1 + margin / 100) and (run_h - exp_h) > 1 }}"},{alias:"Notify",action:"persistent_notification.create",data:{title:"HVAC running high",message:"{{ repeat.item.name }} has run {{ run_h | round(1) }}h today vs ~{{ exp_h | round(1) }}h expected for this weather. Worth a look (filters, doors, refrigerant)."}}]}}]})}const We="mzcs",vt="r1",Qs=[{cls:"season_confirm_days",min:1,max:14,step:1,initial:3},{cls:"season_dwell_days",min:1,max:60,step:1,initial:14},{cls:"dev_green_max",min:1,max:10,step:1,initial:2,unit:"\xB0F"},{cls:"dev_amber_max",min:1,max:15,step:1,initial:4,unit:"\xB0F"},{cls:"runtime_alert_margin",min:5,max:100,step:5,initial:35,unit:"%"},{cls:"runtime_alert_days",min:1,max:7,step:1,initial:3},{cls:"runtime_learn_days",min:7,max:60,step:1,initial:30},{cls:"cdd_base",min:60,max:80,step:1,initial:75,unit:"\xB0F"}],en=[{cls:"override_minutes",min:15,max:240,step:15,initial:60},{cls:"steer_min_setpoint",min:50,max:80,step:1,initial:68},{cls:"steer_max_setpoint",min:70,max:95,step:1,initial:85},{cls:"steer_max_offset",min:1,max:10,step:1,initial:5}];function tn(t){return Vs(t.granularity,t.sets)}function sn(t){t.forEach((e,s)=>{if(typeof e?.name=="string")return;const n=e?.key!=null?` (key: ${String(e.key)})`:"";throw new Error(`Season ${s+1}${n} has no name. Every season needs a display name - add \`name: ...\` to it, or configure the card with the visual editor, which requires one.`)})}function nn(t,e){if(e===0)return;const s=new Map;t.forEach((n,i)=>{const o=String(n?.key),a=s.get(o)??[];a.push({s:n,i}),s.set(o,a)});for(const[n,i]of s){if(i.length<2)continue;if(i.every(({s:a})=>a?.key==null||String(a.key).trim()==="")){const[a]=i,r=typeof a.s?.name=="string"&&a.s.name.trim(),c=r?`"${a.s.name}"`:`at position ${a.i+1}`,l=(r?a.s.name.trim().toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""):"")||`season_${a.i+1}`;throw new Error(`${i.length} seasons are missing their required "key", so they would all resolve to the same schedule entity names and collide. The key is the permanent id used in entity names; the display name is only a label and can be renamed freely. Give each season its own key - start with \`key: ${l}\` on season ${c} - or configure the card with the visual editor, which fills keys in for you.`)}throw new Error(`${i.length} seasons share the key "${n}", so their schedule entity names collide. The key is the permanent id used in entity names and must be unique per season; the display name is only a label and can be renamed freely.`)}}function Y(t){sn(t.seasons),nn(t.seasons,t.zones.length);const e=[],s=t.prefix,n=s.charAt(0).toUpperCase()+s.slice(1);for(const l of t.zones){t.features.fan_timer&&e.push({id:w("fan_timer",s,l.slug),kind:"helper",spec:{name:`${n} ${l.name} fan`,restore:true}}),e.push({id:w("running_sensor",s,l.slug),kind:"template_sensor",spec:{name:`${n} ${l.name} running`},meta:{source:"hvac_action"}}),e.push({id:w("runtime_today",s,l.slug),kind:"stats_sensor",spec:{name:`${n} ${l.name} runtime today`},meta:{model:"history_stats"}}),e.push({id:w("runtime_mirror",s,l.slug),kind:"template_sensor",spec:{name:`${n} ${l.name} runtime mirror`},meta:{model:"runtime_mirror"}}),e.push({id:w("expected_runtime",s,l.slug),kind:"template_sensor",spec:{name:`${n} ${l.name} expected runtime`},meta:{model:"k_x_cdd"}}),e.push({id:w("applied_block_marker",s,l.slug),kind:"helper",spec:{name:`${n} ${l.name} applied block`}}),e.push({id:w("zone_enabled",s,l.slug),kind:"helper",spec:{name:`${n} ${l.name} enabled`}}),e.push({id:w("k_factor",s,l.slug),kind:"helper",spec:{name:`${n} ${l.name} K`,min:0,max:10,step:.01}}),t.features.steering&&(e.push({id:w("target_room_select",s,l.slug),kind:"helper",spec:{name:`${n} ${l.name} target room`,options:["Thermostat"]}}),e.push({id:w("room_override_timer",s,l.slug),kind:"helper",spec:{name:`${n} ${l.name} room override`,restore:true}}),e.push({id:w("sensor_schedule",s,l.slug),kind:"schedule",spec:{name:`${n} ${l.name} sensor schedule`}}));for(const d of t.seasons){const u=t.schedules[l.slug]?.[d.key];if(!u)throw new Error(`Missing schedule for ${l.slug}/${d.key}.`);e.push({id:Q(s,l.slug,d.key),kind:"schedule",spec:{name:`${n} ${l.name} ${d.name}`},meta:{week:tn(u)}})}}e.push({id:S("season_select",s),kind:"helper",spec:{name:`${n} season`,options:t.seasons.map(l=>l.name)}}),e.push({id:S("season_mode",s),kind:"helper",spec:{name:`${n} season mode`,options:["Manual","Semi-auto","Full-auto"]}});for(const l of Qs)e.push({id:S(l.cls,s),kind:"helper",spec:{name:`${n} ${l.cls.replace(/_/g," ")}`,min:l.min,max:l.max,step:l.step,...l.unit?{unit:l.unit}:{}},meta:{seed:l.initial}});if(t.features.steering)for(const l of en)e.push({id:S(l.cls,s),kind:"helper",spec:{name:`${n} ${l.cls.replace(/_/g," ")}`,min:l.min,max:l.max,step:l.step},meta:{seed:l.initial}});e.push({id:S("next_block_sensor",s),kind:"template_sensor",spec:{name:`${n} next block`}});const i=t.weather_entity?{}:{conditional:true};e.push({id:S("outdoor_temp_sensor",s),kind:"template_sensor",spec:{name:`${n} outdoor temp`},meta:{source:"weather"},...i}),e.push({id:S("outdoor_daily_mean",s),kind:"stats_sensor",spec:{name:`${n} outdoor daily mean`},meta:{model:"statistics_mean"},...i}),e.push({id:S("theme",s),kind:"helper",spec:{name:`${n} theme`}});const o=t.zones.map(l=>({...l,climate:l.climate??`climate.${l.slug}`})),a=Xs(s,o,t.seasons,t.features.fan_guard,X(t.features)),r=(l,d)=>{const u=O(s,l);return{id:`automation:${u}`,kind:"automation",spec:{alias:M(s,l,d),sig:a[u]??vt}}};if(e.push(r("engine")),e.push(r("watchdog")),e.push(r("runtime_learning")),t.features.anomaly_alerts&&e.push(r("runtime_alert")),t.features.fan_timer)for(const l of t.zones){const d=O(s,`fan_timer_${l.slug}`);e.push({id:`automation:${d}`,kind:"automation",spec:{alias:M(s,"fan_timer",l.name),sig:a[d]??vt}})}const c=new Set;for(const l of e){if(c.has(l.id))throw new Error(`Naming collision: two configured objects both resolve to "${l.id}". Rename the conflicting zone or season.`);c.add(l.id)}return e}function on(t,e){return ie(t)===ie(e)}function B(t,e){const s={create:[],adopt:[],update:[],delete:[],noop:[]},n=new Map(e.map(o=>[o.id,o])),i=new Set(t.map(o=>o.id));for(const o of t){const a=n.get(o.id);if(a)a.managed?on(a.spec,o.spec)?s.noop.push({op:"noop",id:o.id,kind:o.kind}):s.update.push({op:"update",id:o.id,kind:o.kind,spec:o.spec,from:a.spec}):s.adopt.push({op:"adopt",id:o.id,kind:o.kind,spec:o.spec});else{if(o.conditional)continue;s.create.push({op:"create",id:o.id,kind:o.kind,spec:o.spec,...o.meta?{meta:o.meta}:{}})}}for(const o of e)o.managed&&!i.has(o.id)&&s.delete.push({op:"delete",id:o.id,kind:o.kind});return s}function an(t){return[...t.create,...t.adopt,...t.update,...t.delete]}const rn=Object.freeze([Object.freeze({key:"summer",name:"Summer",default_mode:"cool"}),Object.freeze({key:"winter",name:"Winter",default_mode:"heat_cool"})]);function xe(){return rn.map(t=>({...t}))}function cn(t,e,s){return{prefix:t.prefix??"climate",zones:t.zones.map(n=>({slug:s(n.name),name:n.name,climate:n.entity})),seasons:t.seasons??xe(),schedules:e,features:{fan_timer:(t.features?.fan_timer?.length??3)>0,anomaly_alerts:t.features?.anomaly_alerts??true,steering:false,fan_guard:t.features?.fan_guard,eco_preset:t.features?.eco_preset},weather_entity:t.weather_entity}}const He="climate",ln=["cool","heat","heat_cool","off"],dn=["manual","semi","full"];function wt(t,e){return typeof t=="string"&&e.includes(t)?t:"<invalid>"}function un(t){if(!t)return"unknown";const e=o=>o.test(t),s=e(/\bEdg\//)?"Edge":e(/\bOPR\//)?"Opera":e(/\bFirefox\//)?"Firefox":e(/\bChrome\//)?"Chrome":e(/\bSafari\//)?"Safari":"other browser",n=e(/Android/)?"Android":e(/iPhone|iPad|iPod/)?"iOS":e(/Windows/)?"Windows":e(/Macintosh|Mac OS/)?"macOS":e(/Linux/)?"Linux":"unknown platform",i=e(/HomeAssistant/)?" (HA companion app)":"";return s+" on "+n+i}function pn(t){const e={};for(const s of t)e[s]=(e[s]??0)+1;return e}function hn(t,e){return e?t:t===He?He:"<custom>"}function mn(t,e){return t?t==="unknown"||t==="unavailable"||t==="none"||e?t:"set":"not read"}function fn(t,e){if(t.eco_preset===false)return"disabled";const s=X(t)??"eco";return e?s:s==="eco"?"eco (default)":"<custom>"}function _n(t){const e=t.identifiers===true;let s=t.config,n;try{s=tt(t.config)}catch(d){n=d instanceof Error?d.message:String(d)}const i=typeof s.prefix=="string"&&s.prefix.trim()||He,o=Array.isArray(s.seasons)?s.seasons:s.seasons==null?xe():[],a=s.features??{},r=(s.zones??[]).map((d,u)=>{const m=W(d.room_sensors);return{name:e?d.name:`Zone ${u+1}`,climate:e?d.entity:`climate.<zone_${u+1}>`,room_sensors:e?m.map(_=>_.name?{entity:_.entity,name:_.name}:{entity:_.entity}):m.map((_,k)=>({entity:`sensor.<zone_${u+1}_room_${k+1}>`})),room_sensor_count:m.length,room_sensors_labelled:m.filter(_=>!!_.name?.trim()).length}}),c=(t.zoneEnabled??[]).map((d,u)=>({zone:e?d.zone:`Zone ${(d.index??u)+1}`,scheduling:d.state})),l={card_version:t.cardVersion,ha_version:t.haVersion??"unknown",identifiers_included:e,user_agent:un(t.userAgent),...n?{config_rejected:n}:{},config:{prefix:hn(i,e),zone_count:r.length,zones:r,seasons_defaulted:s.seasons==null,seasons:o.filter(d=>d!=null).map((d,u)=>{const m=typeof d.name=="string"?d.name:"";return{name:e?m:`Season ${u+1}`,key_matches_name_slug:d.key===m.trim().toLowerCase().replace(/[^a-z0-9]+/g,"_"),default_mode:wt(d.default_mode,ln)}}),active_season:mn(t.activeSeason,e),weather_entity:e?s.weather_entity??null:s.weather_entity?"set":null,season_switch:s.season_switch===void 0?"manual":wt(s.season_switch,dn),features:{fan_timer:Array.isArray(a.fan_timer)?a.fan_timer.filter(d=>typeof d=="number"&&Number.isFinite(d)):null,anomaly_alerts:a.anomaly_alerts!==false,fan_guard:e?a.fan_guard??null:a.fan_guard?"set":null,eco_preset:fn(a,e)}},scheduling_switches:c.length?c:"not read",last_dry_run:t.plan?{kind:t.planKind??"setup",create:t.plan.create,adopt:t.plan.adopt,update:t.plan.update,delete:t.plan.delete,unchanged:t.plan.noop,settled:t.plan.create+t.plan.adopt+t.plan.update+t.plan.delete===0,...s.weather_entity?{}:{note:"no weather entity: outdoor sensors not provisioned, CDD learning off"}}:"not run",managed_objects:t.objectStatuses?{total:t.objectStatuses.length,by_status:pn(t.objectStatuses)}:"not loaded"};return JSON.stringify(l,null,2)}function cs(t,e,s,n="on",i=6e4){const o=[...t].sort((d,u)=>d.t-u.t),a=[];let r="off";for(const d of o)if(d.t<=e)r=d.state;else break;let c=r===n?e:null;for(const d of o){if(d.t<=e||d.t>=s)continue;const u=d.state===n;u&&c==null&&(c=d.t),!u&&c!=null&&(a.push({start:c,end:d.t}),c=null)}c!=null&&a.push({start:c,end:s});const l=[];for(const d of a){const u=l[l.length-1];u&&d.start-u.end<=i?u.end=d.end:l.push({...d})}return l}function gn(t){return t.reduce((e,s)=>e+(s.end-s.start),0)}function yn(t){const e=[...t].sort((n,i)=>n.t-i.t),s=[];for(const n of e){const i=Number(n.state);if(!Number.isFinite(i))continue;const o=s[s.length-1];(!o||o.value!==i)&&s.push({t:n.t,value:i})}return s}function xt(t){if(!Number.isFinite(t)||t<0)return"\u2013";const e=Math.round(t*4)/4,s=Math.floor(e),n=e-s,i=n===.25?"\xBC":n===.5?"\xBD":n===.75?"\xBE":"";return s===0&&i?`${i} hr`:`${s}${i} hr`}function bn(t,e,s){const n=s-e;return{left:(t.start-e)/n*100,width:(t.end-t.start)/n*100}}function $n(t,e,s,n="on"){const i=t.length?Math.min(...t.map(a=>a.t)):1/0,o=[];for(let a=e-1;a>=0;a--){const r=new Date(s);r.setHours(0,0,0,0),r.setDate(r.getDate()-a);const c=r.getTime();r.setDate(r.getDate()+1);const l=Math.min(r.getTime(),s);if(l<=c)continue;if(i>=l){o.push({day:c,hours:0,coverage:"none"});continue}const d=gn(cs(t,c,l,n))/36e5;o.push({day:c,hours:d,coverage:i>c?"partial":"complete"})}return o}const vn=new Set(["climate.set_temperature","climate.set_hvac_mode","climate.turn_on","climate.turn_off","climate.toggle","homeassistant.turn_on","homeassistant.turn_off","homeassistant.toggle"]),wn=new Set(["climate.set_preset_mode","climate.set_fan_mode"]),xn="(templated service)";function it(t){return t.includes("{{")||t.includes("{%")}function kn(t){const e=typeof t.action=="string"?t.action:typeof t.service=="string"?t.service:typeof t.service_template=="string"?t.service_template:null;if(e==null)return null;if("service_template"in t||it(e)){const n=e.slice(0,e.search(/\{[{%]/)>=0?e.search(/\{[{%]/):e.length);return{service:null,templated:true,domain:(n.includes(".")?n.slice(0,n.indexOf(".")).trim().toLowerCase():null)||null}}const s=e.trim().toLowerCase();return s?{service:s,templated:false,domain:s.split(".")[0]??null}:null}function Sn(t){return typeof t.device_id!="string"||typeof t.domain!="string"||typeof t.type!="string"||typeof t.platform=="string"||typeof t.condition=="string"||typeof t.trigger=="string"?null:`${t.domain}.${t.type}`.trim().toLowerCase()}function j(t,e,s){if(typeof t=="string"){if(it(t)){s.templated=true;return}if(t.includes(",")){for(const i of t.split(","))j(i,e,s);return}const n=t.trim();if(!n||n==="none")return;if(n==="all"){s.all=true;return}e.push(n);return}if(Array.isArray(t))for(const n of t)j(n,e,s)}function kt(t){const e={all:false,templated:false},s=[],n=[],i=[],o=[],a=[],r=[t.target,t.data,t.data_template,t];for(const c of r){if(typeof c=="string"&&it(c)){e.templated=true;continue}if(!c||typeof c!="object"||Array.isArray(c))continue;const l=c;j(l.entity_id,s,e),j(l.area_id,n,e),j(l.device_id,i,e),j(l.label_id,o,e),j(l.floor_id,a,e)}return{entityIds:[...new Set(s)],areaIds:[...new Set(n)],deviceIds:[...new Set(i)],labelIds:[...new Set(o)],floorIds:[...new Set(a)],all:e.all,templated:e.templated}}const ls=100;function Fe(t,e=0,s=[]){if(e>ls||t==null||typeof t!="object")return s;if(Array.isArray(t)){for(const o of t)Fe(o,e+1,s);return s}const n=t,i=kn(n);if(i)s.push({service:i.service,serviceTemplated:i.templated,serviceDomain:i.domain,target:kt(n)});else{const o=Sn(n);o&&s.push({service:o,serviceTemplated:false,serviceDomain:o.split(".")[0]??null,target:kt(n)})}for(const o in n)Fe(n[o],e+1,s);return s}function En(t,e,s,n){return typeof t=="string"&&t.startsWith(`${s}_mzcs_`)&&e.includes(n)}const An=new Set(["climate","homeassistant"]);function zn(t){if(t.service==null){const e=t.serviceDomain;return e==null||An.has(e)?"conflict":null}return vn.has(t.service)?"conflict":wn.has(t.service)?"note":null}function Cn(t,e){return t.entityIds.includes(e.entityId)||e.registryId&&t.entityIds.includes(e.registryId)?"entity":t.all?"all":e.areaId&&t.areaIds.includes(e.areaId)?"area":e.deviceId&&t.deviceIds.includes(e.deviceId)?"device":(e.labels??[]).some(s=>t.labelIds.includes(s))?"label":null}function Tn(t,e){const s=t.target,n=[];for(const i of e){const o=Cn(s,i);o&&n.push({zone:i,via:o,confidence:"certain"})}return n.length===0&&(s.templated?n.push({zone:null,via:"template",confidence:"possible"}):s.floorIds.length>0?n.push({zone:null,via:"floor",confidence:"possible"}):s.entityIds.some(i=>i.startsWith("group."))?n.push({zone:null,via:"group",confidence:"possible"}):t.serviceTemplated&&n.push({zone:null,via:"template",confidence:"possible"})),n}function ds(t){return t!=null&&typeof t=="object"&&!Array.isArray(t)&&"use_blueprint"in t}function Ue(t,e=[],s=0){if(s>ls||t==null)return e;if(typeof t=="string")return e.push(t),e;if(Array.isArray(t)){for(const n of t)Ue(n,e,s+1);return e}if(typeof t=="object"){const n=t;for(const i in n)Ue(n[i],e,s+1)}return e}function Rn(t,e){const s=[],n=new Set,i=o=>{const a=o.sourceId+"|"+o.service+"|"+o.zoneEntityId+"|"+o.via;n.has(a)||(n.add(a),s.push(o))};for(const o of t){if(ds(o.config)){const a=Ue(o.config.use_blueprint);for(const r of e)(a.includes(r.entityId)||r.registryId!=null&&a.includes(r.registryId))&&i({sourceId:o.id,sourceName:o.name,sourceKind:o.kind,service:"(blueprint)",zoneEntityId:r.entityId,zoneName:r.name,severity:"conflict",confidence:"possible",via:"blueprint",sourceEnabled:o.enabled});continue}for(const a of Fe(o.config)){const r=zn(a);if(r)for(const c of Tn(a,e)){const l=a.serviceTemplated||c.confidence==="possible"?"possible":"certain";i({sourceId:o.id,sourceName:o.name,sourceKind:o.kind,service:a.service??xn,zoneEntityId:c.zone?.entityId??null,zoneName:c.zone?.name??null,severity:r,confidence:l,via:c.via,sourceEnabled:o.enabled})}}}return s}function On(t,e,s){const n=Rn(t,e),i=t.filter(o=>ds(o.config)).length;return{...s,scanned:t.length-i,blueprints:i,conflicts:n.filter(o=>o.severity==="conflict"),notes:n.filter(o=>o.severity==="note")}}function St(t,e){const s=t.states[e];if(!s||s.state==="unavailable"||s.state==="unknown")return{available:false,mode:"unavailable",action:"",setpoint:null,targetLow:null,targetHigh:null,inside:null,humidity:null};const n=s.attributes,i=o=>typeof o=="number"?o:null;return{available:true,mode:s.state,action:typeof n.hvac_action=="string"?n.hvac_action:"",setpoint:i(n.temperature),targetLow:i(n.target_temp_low),targetHigh:i(n.target_temp_high),inside:i(n.current_temperature),humidity:i(n.current_humidity)}}function Dn(t,e){return t.states[e]?.state==="active"}function D(t,e){return t.states[e]!==void 0}function In(t,e){const s=t.states[e]?.attributes.hvac_modes;return Array.isArray(s)?s.filter(n=>typeof n=="string"):[]}function Mn(t,e,s="eco"){const n=t.states[e]?.attributes.preset_modes;return Array.isArray(n)&&n.includes(s)}function Et(t,e,s="eco"){return t.states[e]?.attributes.preset_mode===s}function Te(t,e){const s=t.states[e];if(!s)return null;const n=Number(s.state);return Number.isFinite(n)?n:null}const Nn=10800*1e3;function Pn(t,e){let s=0;for(const n of e){const i=t.states[n],o=i?.last_reported??i?.last_updated,a=o?Date.parse(o):NaN;Number.isFinite(a)&&a>s&&(s=a)}return s>0?s:Date.now()}function jn(t,e,s=Date.now()){const n=t.states[e],i=typeof n?.attributes.friendly_name=="string"?n.attributes.friendly_name.replace(/ (Temperature|temperature)$/,""):e.split(".")[1]??e,o=n?Number(n.state):NaN,a=n?.last_reported??n?.last_updated,r=a?Date.parse(a):NaN,c=Number.isFinite(r)&&s-r>Nn;return{entityId:e,name:i,temp:Number.isFinite(o)?o:null,stale:c}}function Ln(t,e,s){return t.callService("climate","set_hvac_mode",{entity_id:e,hvac_mode:s})}function Wn(t,e,s,n="eco"){return t.callService("climate","set_preset_mode",{entity_id:e,preset_mode:s?n:"none"})}function Hn(t,e){const s=t.states[e]?.attributes.fan_modes;return Array.isArray(s)&&s.includes("on")}async function Fn(t,e,s,n){Hn(t,e)&&await t.callService("climate","set_fan_mode",{entity_id:e,fan_mode:"on"});const i=String(n%60).padStart(2,"0"),o=String(Math.floor(n/60)).padStart(2,"0");await t.callService("timer","start",{entity_id:s,duration:`${o}:${i}:00`})}function Un(t,e,s,n){const i=typeof s=="number"?s:null,o=typeof n=="number"?n:null;return i!=null&&o!=null&&i<o&&e!=null&&e>=i&&e<=o?Math.min(o,Math.max(i,t)):t}const us=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];async function At(t,e){if(!t.callWS)return null;const s=e.split(".")[1];try{const i=(await t.callWS({type:"schedule/list"})).find(a=>a.id===s);if(!i)return null;const o={};for(const a of us)i[a]&&(o[a]=i[a]);return{id:String(i.id),name:typeof i.name=="string"?i.name:void 0,week:o}}catch{return null}}function Bn(t,e,s,n){if(!t.callWS)return Promise.reject(new Error("callWS unavailable"));const o={type:"schedule/update",schedule_id:e.split(".")[1],name:n};for(const a of us)o[a]=s[a]??[];return t.callWS(o)}function Kn(t,e,s){return t.callService("input_number","set_value",{entity_id:e,value:s})}function Zn(t,e,s){return t.callService("input_select","select_option",{entity_id:e,option:s})}async function zt(t,e,s,n){if(n)try{await t.callService("input_text","set_value",{entity_id:s,value:""})}catch{}await t.callService("input_boolean",n?"turn_on":"turn_off",{entity_id:e})}function ps(t,e){const s=[];for(const n of t){if(typeof n.lu!="number")continue;const i=n.lu*1e3;if(e){const o=n.a?.[e];if(o==null)continue;s.push({t:i,state:String(o)})}else typeof n.s=="string"&&s.push({t:i,state:n.s})}return s}async function Ct(t,e,s,n,i){if(!t.callWS)return{ok:false,error:"This Home Assistant connection cannot read history."};try{const o=await t.callWS({type:"history/history_during_period",start_time:new Date(s).toISOString(),end_time:new Date(n).toISOString(),entity_ids:[e],minimal_response:!i,no_attributes:!i,significant_changes_only:false});return{ok:true,rows:ps(o?.[e]??[],i)}}catch(o){return{ok:false,error:ye(o)}}}async function qn(t,e,s){if(!t.callWS)return{ok:false,error:"This Home Assistant connection cannot read history."};const n=new Date;n.setHours(0,0,0,0),n.setDate(n.getDate()-(s-1));try{const i=await t.callWS({type:"history/history_during_period",start_time:n.toISOString(),end_time:new Date().toISOString(),entity_ids:[e],minimal_response:true,no_attributes:true,significant_changes_only:false}),o=ps(i?.[e]??[]);return{ok:true,rows:$n(o,s,Date.now())}}catch(i){return{ok:false,error:ye(i)}}}function ye(t){try{return Gn(t)}catch{return"Home Assistant gave no reason."}}function Gn(t){if(t instanceof Error&&t.message)return t.message;if(t&&typeof t=="object"){const e=t;if(typeof e.message=="string"&&e.message)return e.message;if(e.message!=null&&String(e.message))return String(e.message);if(e.code!=null)return Tt(e.code)}return(typeof t=="number"||typeof t=="string")&&String(t)?Tt(t):"Home Assistant gave no reason."}function Tt(t){const e=String(t);return/connection|closed|lost|3/i.test(e)?`The connection to Home Assistant dropped (${e}).`:`Home Assistant reported error ${e}.`}async function Vn(t,e,s){await t.callService("input_text","set_value",{entity_id:e,value:""}),await t.callService("automation","trigger",{entity_id:s})}function Yn(t,e,s){return t.callService("climate","set_temperature",{entity_id:e,temperature:s})}const Rt=500,Jn=6;async function Xn(t,e,s){const n=new Array(t.length);let i=0;const o=async()=>{for(;;){const a=i++;if(a>=t.length)return;n[a]=await s(t[a])}};return await Promise.all(Array.from({length:Math.min(e,t.length)},o)),n}async function Qn(t,e){const s=new Map;if(e.length===0)return s;if(!t.callWS)throw new Error("This Home Assistant connection cannot read the entity registry, so the conflict check could not run.");const n=await t.callWS({type:"config/entity_registry/get_entries",entity_ids:e});for(const[i,o]of Object.entries(n??{}))o&&s.set(i,o);return s}async function ei(t,e,s){const n=e.some(r=>{const c=s.get(r.entity);return!!c&&!c.area_id&&!!c.device_id});let i=false,o=new Map;if(n&&t.callWS)try{const r=await t.callWS({type:"config/device_registry/list"});for(const c of r??[])c?.id&&o.set(c.id,c.area_id??null)}catch{o=new Map,i=true}return{refs:e.map(r=>{const c=s.get(r.entity),l=c?.area_id??(c?.device_id?o.get(c.device_id)??null:null);return{entityId:r.entity,name:r.name,areaId:l,deviceId:c?.device_id??null,registryId:c?.id??null,labels:c?.labels??[]}}),degraded:i}}async function ti(t,e,s,n){if(!t.callApi)throw new Error("This Home Assistant connection cannot read automation configurations, so the conflict check could not run.");const i=[],o=new Map;for(const f in t.states){const A=t.states[f];if(!A)continue;const g=String(A.attributes.friendly_name??f);if(f.startsWith("automation.")){const y=A.attributes.id;o.set(f,y),i.push({entityId:f,name:g,kind:"automation",path:typeof y=="string"&&y?`config/automation/config/${y}`:null})}else if(f.startsWith("script.")){const y=f.slice(7);i.push({entityId:f,name:g,kind:"script",path:y?`config/script/config/${y}`:null})}}const a=await Qn(t,[...n.map(f=>f.entity),...i.filter(f=>f.kind==="automation").map(f=>f.entityId)]),{refs:r,degraded:c}=await ei(t,n,a);let l=0;const d=[];for(const f of i){if(f.kind==="automation"&&En(o.get(f.entityId),a.get(f.entityId)?.labels??[],e,s)){l++;continue}d.push(f)}const u=d.length>Rt,m=u?d.slice(0,Rt):d;let _=0;const k=await Xn(m,Jn,async f=>{if(!f.path)return null;try{const A=await t.callApi("GET",f.path),g=t.states[f.entityId]?.state,y=f.kind==="automation"?g==="on"?true:g==="off"?false:void 0:void 0;return{id:f.entityId,name:f.name,kind:f.kind,enabled:y,config:A}}catch{return null}}),E=[];for(const f of k)f?E.push(f):_++;return On(E,r,{unreadable:_,skippedOwn:l,capped:u,degraded:c})}function si(t,e,s,n){if(!Number.isFinite(e)||e<=0)return{status:"learning",label:"learning"};if(n<6)return{status:"pending",label:""};const i=e*(Math.min(n,24)/24),o=i*(1+s/100);return t>o&&t-i>.5?{status:"high",label:"running high for the weather"}:{status:"normal",label:"normal for the weather"}}const ot={accent:"#1e88e5",accentBright:"#42a5f5",good:"#2bb673",warn:"#f59e0b",bad:"#e5484d",bg:"#1c262e",surface:"#243039",chip:"#2b3844",track:"#16202a",border:"#3d4a55",text:"#e8edf1",textDim:"#9fb0bd"},Be={cobalt:{label:"Cobalt",tokens:ot},ember:{label:"Ember",tokens:{accent:"#f4511e",accentBright:"#ff7043",good:"#66bb6a",warn:"#ffb300",bad:"#d32f2f",bg:"#241c18",surface:"#2f2521",chip:"#3a2d27",track:"#1a1310",border:"#54413a",text:"#f2e9e4",textDim:"#b8a69b"}},forest:{label:"Forest",tokens:{accent:"#43a047",accentBright:"#66bb6a",good:"#9ccc65",warn:"#ffa000",bad:"#e53935",bg:"#18211b",surface:"#212d25",chip:"#2a382e",track:"#111813",border:"#3d4f43",text:"#e6efe8",textDim:"#9fb3a5"}},orchid:{label:"Orchid",tokens:{accent:"#7e57c2",accentBright:"#9575cd",good:"#26a69a",warn:"#ffb300",bad:"#ec407a",bg:"#1f1b2a",surface:"#292336",chip:"#342c44",track:"#161221",border:"#4a4060",text:"#eae6f2",textDim:"#a89fbd"}},"ha-default":{label:"HA Default",tokens:{accent:"var(--primary-color, #03a9f4)",accentBright:"var(--light-primary-color, var(--primary-color, #03a9f4))",good:"var(--success-color, #2bb673)",warn:"var(--warning-color, #f59e0b)",bad:"var(--error-color, #e5484d)",bg:"var(--ha-card-background, var(--card-background-color, #fff))",surface:"var(--secondary-background-color, #f0f0f0)",chip:"var(--secondary-background-color, #f0f0f0)",track:"var(--divider-color, #e0e0e0)",border:"var(--divider-color, #e0e0e0)",text:"var(--primary-text-color, #212121)",textDim:"var(--secondary-text-color, #727272)"}}},Re="cobalt",Ke=/^#[0-9a-f]{6}$/i,be=["accent","accentBright","good","warn","bad","bg","surface","chip","track","border","text","textDim"];function Ot(t){return`custom:${be.map(e=>t[e]).join(",")}`}function ni(t){return be.every(s=>Ke.test(t[s]))?{...t}:{...ot}}function Dt(t){const e={presetKey:Re,tokens:Be[Re].tokens};if(!t)return e;const s=t==="nest-blue"?Re:t,n=Be[s];if(n)return{presetKey:s,tokens:n.tokens};if(t.startsWith("custom:")){const i=t.slice(7).split(",");if(i.length===5&&i.every(o=>Ke.test(o.trim()))){const[o,a,r,c,l]=i.map(d=>d.trim().toLowerCase());return{presetKey:"custom",tokens:{...ot,accent:o,accentBright:a,good:r,warn:c,bad:l}}}if(i.length===be.length&&i.every(o=>Ke.test(o.trim())))return{presetKey:"custom",tokens:Object.fromEntries(be.map((a,r)=>[a,i[r].trim().toLowerCase()]))}}return e}const me=t=>F(t);function F(t){const e=t.data;return{time:t.from.slice(0,5),name:e.block??"?",mode:e.mode??"cool",cool_temp:e.cool_temp??null,heat_temp:e.heat_temp??null}}function ii(t,e){const s=F(t),n=F(e);return s.name===n.name&&s.mode===n.mode&&s.cool_temp===n.cool_temp&&s.heat_temp===n.heat_temp}function Oe(t){if(t.length===0)return[];const e=[...t].sort((a,r)=>a.from.localeCompare(r.from)),s=e[0],n=e[e.length-1];return(e.length>1&&s.from==="00:00:00"&&ii(s,n)?e.slice(1):e).map(F)}function oi(t){return JSON.stringify([...t].sort((e,s)=>e.from.localeCompare(s.from)).map(e=>[e.from,e.to,F(e)]))}const It=["monday","tuesday","wednesday","thursday","friday"],Mt=["saturday","sunday"];function Nt(t){const e=R.map(a=>oi(t[a]??[])),s=a=>e[R.indexOf(a)];if(e.every(a=>a===e[0]))return{granularity:"all",sets:{all:[...R]}};const i=It.every(a=>s(a)===s("monday")),o=Mt.every(a=>s(a)===s("saturday"));return i&&o?{granularity:"wdwe",sets:{wd:[...It],we:[...Mt]}}:{granularity:"days",sets:Object.fromEntries(R.map(a=>[a,[a]]))}}const Pt=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];function ai(t){return`${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`}function ri(t,e){return t.name===e.name&&t.mode===e.mode&&t.cool_temp===e.cool_temp&&t.heat_temp===e.heat_temp}function ci(t,e){const s=e.getDay(),n=e.getHours()*60+e.getMinutes(),i=`${ai(e)}:00`,o=new Map,a=c=>{const l=((s+c)%7+7)%7;let d=o.get(l);return d||(d=[...t[Pt[l]]??[]].sort((u,m)=>u.from.localeCompare(m.from)),o.set(l,d)),d},r=c=>{for(let l=1;l<=7;l++){const d=a(c-l);if(d.length)return me(d[d.length-1])}return null};for(let c=0;c<=7;c++){const l=a(c);for(let d=0;d<l.length;d++){const u=l[d];if(c===0&&u.from<=i)continue;if(c===7&&u.from>i)break;const m=d>0?me(l[d-1]):r(c),_=me(u);if(m&&ri(m,_))continue;const[k,E]=u.from.slice(0,5).split(":").map(Number),f=c*1440+(k*60+E)-n;if(f<=0)continue;const A=Pt[(s+c)%7];return{..._,day:A,minutesUntil:f}}}return null}function li(t){for(const e of R){const s=[...t[e]??[]].sort((n,i)=>n.from.localeCompare(i.from));if(s.length===0||s[0].from!=="00:00:00")return true;for(let n=1;n<s.length;n++)if(s[n].from!==s[n-1].to)return true;if(s[s.length-1].to!=="24:00:00")return true}return false}function di(t){const e=[...t].sort((i,o)=>i.from.localeCompare(o.from)),s=[];let n=0;for(const i of e){const o=I(i.from.slice(0,5)),a=i.to==="24:00:00"?1440:I(i.to.slice(0,5));o>n&&s.push({block:null,fromMin:n,toMin:o}),s.push({block:me(i),fromMin:o,toMin:a}),n=a}return n<1440&&s.push({block:null,fromMin:n,toMin:1440}),s}function hs(t,e,s){const n={};for(const i of R){const o=t[i];o&&(n[i]=e.includes(i)?pi(s):o)}return n}function I(t){const[e,s]=t.split(":").map(Number);return(e??0)*60+(s??0)}function jt(t){const e=Math.max(0,Math.min(1425,t));return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function ui(t){if(t.length===0)return[];const e=[...t].sort((i,o)=>i.time.localeCompare(o.time)),s=[],n=I(e[0].time);return n>0&&s.push({block:e[e.length-1],fromMin:0,toMin:n,wrap:true}),e.forEach((i,o)=>{s.push({block:i,fromMin:I(i.time),toMin:o<e.length-1?I(e[o+1].time):1440,wrap:false})}),s}function pi(t){const e=[...t].sort((a,r)=>a.time.localeCompare(r.time));if(e.length===0)return[];const s=e[0],n=e[e.length-1],i=a=>({block:a.name,mode:a.mode,...a.cool_temp!=null?{cool_temp:a.cool_temp}:{},...a.heat_temp!=null?{heat_temp:a.heat_temp}:{}});if(e.length===1)return[{from:"00:00:00",to:"24:00:00",data:i(s)}];const o=[];s.time!=="00:00"&&o.push({from:"00:00:00",to:`${s.time}:00`,data:i(n)});for(let a=0;a<e.length;a++){const r=e[a],c=e[a+1];o.push({from:`${r.time}:00`,to:c?`${c.time}:00`:"24:00:00",data:i(r)})}return o}function De(t,e,s){if(s.size===0)return false;let n=t;for(const[i,o]of Object.entries(e.sets)){const a=s.get(i);a&&(n=hs(n,o,a))}return!hi(n,t)}function hi(t,e){for(const s of R){const n=t[s]??[],i=e[s]??[];if(n.length!==i.length)return false;for(let o=0;o<n.length;o++){const a=n[o],r=i[o];if(a.from!==r.from||a.to!==r.to)return false;const c=F(a),l=F(r);if(c.time!==l.time||(c.name??"")!==(l.name??"")||(c.mode??null)!==(l.mode??null)||(c.cool_temp??null)!==(l.cool_temp??null)||(c.heat_temp??null)!==(l.heat_temp??null))return false}}return true}const ms=2,fs=4;function mi(t,e=ms,s=fs){const n=Math.abs(t);return n<=e?"green":n<=s?"amber":"red"}function Ie(t){const e=Math.round(t*10)/10;return Number.isInteger(e)?String(e):e.toFixed(1)}function fi(t){const e=Math.round(t);return`${e>0?"+":""}${e}\xB0`}function _i(t,e){let s=t!=null&&t>0?t:ms,n=e!=null&&e>0?e:fs;return n<=s&&(n=s+1),{greenMax:s,amberMax:n}}function gi(t){const e=t.default_mode;return{granularity:"all",sets:{all:[{time:"06:00",name:"Day",mode:e,cool_temp:e==="heat"?null:e==="heat_cool"?84:78,heat_temp:e==="heat"?68:e==="heat_cool"?66:null}]}}}function yi(t,e){const s={};for(const n of t){s[n]={};for(const i of e)s[n][i.key]=gi(i)}return s}const bi={fan_timer:"helper",room_override_timer:"helper",target_room_select:"helper",applied_block_marker:"helper",zone_enabled:"helper",theme:"helper",k_factor:"helper",season_select:"helper",season_mode:"helper",season_confirm_days:"helper",season_dwell_days:"helper",dev_green_max:"helper",dev_amber_max:"helper",runtime_alert_margin:"helper",runtime_alert_days:"helper",runtime_learn_days:"helper",cdd_base:"helper",override_minutes:"helper",steer_min_setpoint:"helper",steer_max_setpoint:"helper",steer_max_offset:"helper",running_sensor:"template_sensor",runtime_mirror:"template_sensor",expected_runtime:"template_sensor",next_block_sensor:"template_sensor",outdoor_temp_sensor:"template_sensor",outdoor_daily_mean:"stats_sensor",runtime_today:"stats_sensor",zone_schedule:"schedule",sensor_schedule:"schedule"};async function ue(t,e){if(!t.callWS)return[];try{const s=await t.callWS({type:`${e}/list`});return Array.isArray(s)?s:[]}catch(s){throw new Error(`Could not read the ${e} list from Home Assistant: ${s instanceof Error?s.message:String(s)}`)}}async function Lt(t,e){const s=new Map;if(!t.callWS||e.length===0)return s;try{const n=await t.callWS({type:"config/entity_registry/get_entries",entity_ids:e});for(const[i,o]of Object.entries(n??{}))o?.labels&&s.set(i,o.labels)}catch{}return s}async function $i(t,e,s,n){const i=[],o=new Set;for(const g in t.states){const y=Qt(g,e,s,n);if(!y)continue;const x=bi[y.cls];x&&(i.push({id:g,kind:x}),o.add(g))}const a=[...s].sort((g,y)=>y.length-g.length);for(const g in t.states){if(!g.startsWith(`schedule.${e}_`)||o.has(g))continue;const y=g.slice(`schedule.${e}_`.length);for(const x of a){if(!y.startsWith(`${x}_`))continue;const z=y.slice(x.length+1);z&&z!=="sensor_schedule"&&i.push({id:g,kind:"schedule"});break}}const[r,c,l,d,u]=await Promise.all([ue(t,"timer"),ue(t,"input_select"),ue(t,"input_number"),ue(t,"schedule"),Lt(t,i.map(g=>g.id))]),m=(g,y)=>{const x=new Map;for(const z of g)z.id&&x.set(`${y}.${z.id}`,z);return x},_=new Map([...m(r,"timer"),...m(c,"input_select"),...m(l,"input_number"),...m(d,"schedule")]),k=[];for(const g of i){const y=_.get(g.id),x=t.states[g.id];let z={};if(g.id.startsWith("input_number.")&&y){const T=y.unit_of_measurement;z={name:y.name,min:y.min,max:y.max,step:y.step,...T!=null?{unit:T}:{}}}else g.id.startsWith("input_select.")&&y?z={name:y.name,options:y.options}:g.id.startsWith("timer.")&&y?z={name:y.name,restore:y.restore??false}:g.id.startsWith("schedule.")&&y?z={name:y.name}:x&&(z={name:x.attributes.friendly_name??g.id});k.push({id:g.id,kind:g.kind,spec:z,managed:(u.get(g.id)??[]).includes(We)})}const E=[];for(const g in t.states){if(!g.startsWith("automation."))continue;const y=t.states[g];if(!y)continue;const x=y.attributes.id;typeof x=="string"&&x.startsWith(`${e}_mzcs_`)&&E.push({cfgId:x,entityId:g,alias:String(y.attributes.friendly_name??x)})}const[f,A]=await Promise.all([Promise.all(E.map(async({cfgId:g})=>{if(!t.callApi)return{sig:"unknown",pristine:void 0};try{const y=await t.callApi("GET",`config/automation/config/${g}`),x=oe(y?.description);return{sig:x??"unknown",pristine:x?ae(y)===x:false}}catch{return{sig:"unknown",pristine:void 0}}})),Lt(t,E.map(g=>g.entityId))]);return E.forEach(({cfgId:g,entityId:y,alias:x},z)=>{k.push({id:`automation:${g}`,kind:"automation",spec:{alias:x,sig:f[z].sig},managed:(A.get(y)??[]).includes(We),pristine:f[z].pristine})}),k}const _s=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];function at(t){return t instanceof Error?t.message:t&&typeof t=="object"?JSON.stringify(t):String(t)}function vi(t){const e=t;return e&&(e.status_code===404||e.status===404)?true:/\b404\b|not.found/i.test(at(t))}function ee(t){const e=t.indexOf(".");return{domain:t.slice(0,e),objectId:t.slice(e+1)}}function Ze(t){return t.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}function fe(t,e){const s=Qt(t,e.prefix,e.zones.map(n=>n.slug),e.seasons.map(n=>n.key));return s?.zone?e.zones.find(n=>n.slug===s.zone)??null:null}async function Me(t,e,s,n){const i=`${e}.${Ze(s)}`,o=[i,...[2,3,4,5].map(a=>`${i}_${a}`)];for(let a=0;a<3;a++){try{const r=await t.callWS({type:"config/entity_registry/get_entries",entity_ids:o});for(const c of o)if(r?.[c]?.config_entry_id===n)return c}catch{}await new Promise(r=>setTimeout(r,400*(a+1)))}throw new Error(`Could not locate the entity created by flow entry ${n} (expected around ${i})`)}async function Ne(t,e,s,n){if(e===s)return;let i;for(let o=0;o<3;o++)try{await t.callWS({type:"config/entity_registry/update",entity_id:e,new_entity_id:s}),n.log(`Renamed ${e} -> ${s}`);return}catch(a){i=a,await new Promise(r=>setTimeout(r,400*(o+1)))}throw new Error(`Could not rename ${e} to its contract id ${s} (${i instanceof Error?i.message:"registry error"})`)}async function wi(t,e){try{await t.callWS({type:"config/label_registry/create",name:"mzcs",color:"blue",icon:"mdi:thermostat-box"}),e.log("Created label mzcs")}catch{}}async function $e(t,e){try{const n=(await t.callWS({type:"config/entity_registry/get_entries",entity_ids:[e]}))?.[e]?.labels??[];n.includes("mzcs")||await t.callWS({type:"config/entity_registry/update",entity_id:e,labels:[...n,"mzcs"]})}catch{}}function xi(t,e){for(const s in t.states)if(s.startsWith("automation.")&&t.states[s]?.attributes.id===e)return s;return null}async function Pe(t,e,s,n){if(!t.callApi)throw new Error("callApi unavailable");let i=await t.callApi("POST","config/config_entries/flow",{handler:e,show_advanced_options:true});const o={...n};for(let a=0;a<8;a++){if(i.type==="create_entry"){const r=i.result?.entry_id;if(!r)throw new Error(`Flow ${e}: created an entry but returned no entry_id`);return r}if(i.type==="menu"){if(!s)throw new Error(`Flow ${e}: unexpected menu`);i=await t.callApi("POST",`config/config_entries/flow/${i.flow_id}`,{next_step_id:s});continue}if(i.type==="form"){const r=(i.data_schema??[]).map(l=>l.name),c={};for(const l of r)l in o&&(c[l]=o[l],delete o[l]);i=await t.callApi("POST",`config/config_entries/flow/${i.flow_id}`,c);continue}throw new Error(`Flow ${e}: unhandled step type ${i.type}`)}throw new Error(`Flow ${e}: did not complete`)}function ki(t){return`{${t.seasons.map(e=>`'${e.name.replace(/'/g,"")}': '${e.key}'`).join(", ")}}`}function Si(t,e,s){const{objectId:n}=ee(t),i=String(e.name??n),o=s.prefix;if(t.startsWith("binary_sensor.")&&e.source==="hvac_action"){const a=fe(t,s);return a?{handler:"template",menu:"binary_sensor",fields:{name:i,state:`{{ state_attr('${a.climate}', 'hvac_action') in ['cooling', 'heating'] }}`,device_class:"running"}}:null}if(t.startsWith("sensor.")&&e.model==="runtime_mirror"){const a=fe(t,s);return a?{handler:"template",menu:"sensor",fields:{name:i,state:`{{ states('sensor.${o}_${a.slug}_runtime_today') | float(0) }}`,unit_of_measurement:"h",state_class:"measurement"}}:null}if(t.startsWith("sensor.")&&e.model==="k_x_cdd"){const a=fe(t,s);return a?{handler:"template",menu:"sensor",fields:{name:i,state:`{{ (states('input_number.${o}_${a.slug}_k') | float(0)) * ([ (states('sensor.${o}_outdoor_daily_mean') | float(0)) - (states('input_number.${o}_cdd_base') | float(75)), 0 ] | max) | round(2) }}`,unit_of_measurement:"h",state_class:"measurement"}}:null}if(t===`sensor.${o}_next_block`){const a=`input_select.${o}_season`;return{handler:"template",menu:"sensor",fields:{name:i,state:`{% set season = ${ki(s)}.get(states('${a}'), states('${a}') | lower) %}{% set evs = states.schedule | selectattr('entity_id', 'search', '^schedule\\.${o}_[a-z0-9_]+_' ~ season ~ '$') | map(attribute='attributes.next_event') | reject('none') | list %}{{ evs | min if evs | count > 0 else 'unknown' }}`}}}return t===`sensor.${o}_outdoor_temp`&&e.source==="weather"&&s.weatherEntity?{handler:"template",menu:"sensor",fields:{name:i,state:`{{ state_attr('${s.weatherEntity}', 'temperature') }}`,unit_of_measurement:"\xB0F",state_class:"measurement"}}:null}function gs(t,e){const s=e.prefix;if(t===`${s}_mzcs_engine`)return ns(s,e.zones,e.seasons,e.ecoPreset===void 0?"eco":e.ecoPreset);if(t===`${s}_mzcs_watchdog`)return as(s);if(t===`${s}_mzcs_runtime_learning`)return os(s,e.zones);if(t===`${s}_mzcs_runtime_alert`)return rs(s,e.zones);const n=t.match(new RegExp(`^${s}_mzcs_fan_timer_(.+)$`));if(n){const i=e.zones.find(o=>o.slug===n[1]);return i?is(s,i,e.fanGuard):null}return null}async function Ei(t,e,s){const n={...e.spec,...e.meta??{}};if(e.id.startsWith("automation:")){const a=e.id.slice(11),r=gs(a,s);if(!r)return s.log(`SKIP ${e.id} - no payload generator`),null;let c=null;try{c=await t.callApi("GET",`config/automation/config/${a}`)}catch(l){if(!vi(l))throw new Error(`Could not verify whether ${e.id} already exists: ${at(l)}`);c=null}if(c){const l=oe(c.description);return l&&ae(c)===l?(await t.callApi("POST",`config/automation/config/${a}`,r),await $e(t,`automation.${Ze(String(r.alias))}`),s.log(`Recreated ${e.id} (existed in storage, pristine)`),{kind:"automation",automationId:a,preexisted:true}):(s.log(`KEEP ${e.id} - exists in storage but is customized/unsigned; not overwritten`),null)}return await t.callApi("POST",`config/automation/config/${a}`,r),await $e(t,`automation.${Ze(String(r.alias))}`),{kind:"automation",automationId:a}}const{domain:i,objectId:o}=ee(e.id);if(["timer","input_text","input_select","input_number","input_boolean","schedule"].includes(i)){const a=String(n.name??o),r={};if(i==="timer"&&Object.assign(r,{restore:n.restore??true,duration:"0:30:00"}),i==="input_select"&&Object.assign(r,{options:n.options??["-"]}),i==="input_number"&&Object.assign(r,{min:n.min??0,max:n.max??100,step:n.step??1,...n.unit?{unit_of_measurement:n.unit}:{}}),i==="schedule"){const d=n.week;for(const u of _s)r[u]=d?.[u]??[]}const l=(await t.callWS({type:`${i}/create`,...r,name:o}))?.id??o;if(l!==o){try{await t.callWS({type:`${i}/delete`,[`${i}_id`]:l})}catch{s.log(`WARN: could not remove stray ${i} item ${l}`)}throw new Error(`HA assigned id "${l}" instead of "${o}" for ${e.id} - an object with that id likely already exists (possibly registry-disabled)`)}if(a!==l)try{await t.callWS({type:`${i}/update`,[`${i}_id`]:l,...r,name:a})}catch{s.log(`NOTE: created ${e.id} but could not set its display name to "${a}"`)}if(i==="input_number"&&typeof n.seed=="number")try{await t.callService("input_number","set_value",{entity_id:e.id,value:n.seed})}catch{s.log(`NOTE: created ${e.id} but could not seed its default value ${n.seed}`)}return{kind:"collection",domain:i,itemId:l}}if(e.kind==="template_sensor"||e.kind==="stats_sensor"){if(e.kind==="stats_sensor"){const l=String(n.name??o);if(n.model==="statistics_mean"){if(!s.weatherEntity)return s.log(`SKIP ${e.id} - no weather entity configured (CDD learning stays off)`),null;const m=await Pe(t,"statistics",null,{name:l,entity_id:`sensor.${s.prefix}_outdoor_temp`,state_characteristic:"mean",sampling_size:500,max_age:{hours:24,minutes:0,seconds:0},keep_last_sample:false,percentile:50,precision:1});return await Ne(t,await Me(t,"sensor",l,m),e.id,s),{kind:"config_entry",entryId:m}}const d=fe(e.id,s);if(!d)return s.log(`SKIP ${e.id} - no zone match`),null;const u=await Pe(t,"history_stats",null,{name:l,entity_id:`binary_sensor.${s.prefix}_${d.slug}_running`,type:"time",state:["on"],start:"{{ today_at() }}",end:"{{ now() }}"});return await Ne(t,await Me(t,"sensor",l,u),e.id,s),{kind:"config_entry",entryId:u}}const a=Si(e.id,n,s);if(!a)return n.source==="weather"&&!s.weatherEntity?s.log(`SKIP ${e.id} - no weather entity configured`):s.log(`SKIP ${e.id} - not flow-creatable`),null;const r=await Pe(t,a.handler,a.menu,a.fields),c=a.menu==="binary_sensor"?"binary_sensor":"sensor";return await Ne(t,await Me(t,c,String(a.fields.name),r),e.id,s),{kind:"config_entry",entryId:r}}return s.log(`SKIP ${e.id} - unsupported kind ${e.kind}`),null}async function Ai(t,e,s){for(const n of[...e].reverse())try{n.kind==="collection"?await t.callWS({type:`${n.domain}/delete`,[`${n.domain}_id`]:n.itemId}):n.kind==="automation"?await t.callApi("DELETE",`config/automation/config/${n.automationId}`):n.kind==="config_entry"&&n.entryId&&await t.callApi("DELETE",`config/config_entries/entry/${n.entryId}`),s.log(`Rolled back ${n.itemId??n.automationId??n.entryId}`)}catch{s.log(`ROLLBACK FAILED for ${n.itemId??n.automationId??n.entryId} - remove manually`)}}async function Wt(t,e,s){const n={created:0,adopted:0,updated:0,deleted:0,skipped:0,ok:true},i=[];let o="create";await wi(t,s);try{for(const a of e.create){const r=await Ei(t,a,s);r?(r.preexisted||i.push(r),n.created++,s.log(`Created ${a.id}`),a.id.startsWith("automation:")||await $e(t,a.id)):n.skipped++}o="adopt";for(const a of e.adopt){const r=a.id.startsWith("automation:")?xi(t,a.id.slice(11)):a.id;r&&await $e(t,r),n.adopted++,s.log(`Adopted ${a.id}`)}o="update";for(const a of e.update)if(a.kind==="helper"){const{domain:r,objectId:c}=ee(a.id),{unit:l,...d}=a.spec,u={...d,...l?{unit_of_measurement:l}:{}};try{await t.callWS({type:`${r}/update`,[`${r}_id`]:c,...u}),n.updated++,s.log(`Updated ${a.id}`)}catch{n.skipped++,s.log(`SKIP update ${a.id} - not updatable`)}}else if(a.kind==="automation"&&t.callApi){const r=a.id.slice(11),c=gs(r,s);if(!c)n.skipped++,s.log(`KEEP ${a.id} - no generator for this automation`);else try{const l=await t.callApi("GET",`config/automation/config/${r}`),d=oe(l?.description);d&&ae(l)===d?(await t.callApi("POST",`config/automation/config/${r}`,c),n.updated++,s.log(`Regenerated ${a.id} (config changed; automation was untouched)`)):(n.skipped++,s.log(`KEEP ${a.id} - customized since generation; review it manually`))}catch{n.skipped++,s.log(`KEEP ${a.id} - could not read its config to verify`)}}else if((a.kind==="template_sensor"||a.kind==="stats_sensor")&&t.callWS)try{await t.callWS({type:"config/entity_registry/update",entity_id:a.id,name:String(a.spec.name??"")}),n.updated++,s.log(`Renamed ${a.id} to "${String(a.spec.name)}"`)}catch{n.skipped++,s.log(`SKIP update ${a.id} - could not set its display name`)}else if(a.kind==="schedule"&&t.callWS){const{objectId:r}=ee(a.id);try{let c=r;try{const _=(await t.callWS({type:"config/entity_registry/get_entries",entity_ids:[a.id]}))?.[a.id]?.unique_id;typeof _=="string"&&_&&(c=_)}catch{}const d=(await t.callWS({type:"schedule/list"})).find(m=>m.id===c);if(!d)throw new Error(`no storage item "${c}"`);const u={};for(const m of _s)u[m]=d[m]??[];await t.callWS({type:"schedule/update",schedule_id:c,name:String(a.spec.name??r),...u}),n.updated++,s.log(`Renamed ${a.id} to "${String(a.spec.name)}" (blocks preserved)`)}catch(c){n.skipped++,s.log(`SKIP update ${a.id} - could not rename without touching its blocks (${at(c)})`)}}else n.skipped++,s.log(`KEEP ${a.id} - ${a.kind} updates never overwrite existing content`);o="delete";for(const a of e.delete){if(a.id.startsWith("automation:")){const r=a.id.slice(11);let c=null;try{c=await t.callApi("GET",`config/automation/config/${r}`)}catch{c=null}if(!c){n.skipped++,s.log(`SKIP delete ${a.id} - config not readable`);continue}const l=oe(c.description);if(!(l&&ae(c)===l)){n.skipped++,s.log(`KEEP ${a.id} - customized or unsigned; delete it manually if intended`);continue}s.log(`snapshot ${r}: ${JSON.stringify(c)}`),await t.callApi("DELETE",`config/automation/config/${r}`)}else if(a.kind==="template_sensor"||a.kind==="stats_sensor"){let r;try{r=(await t.callWS({type:"config/entity_registry/get_entries",entity_ids:[a.id]}))?.[a.id]?.config_entry_id}catch{r=void 0}if(!r){n.skipped++,s.log(`SKIP delete ${a.id} - no owning config entry found; remove it manually`);continue}s.log(`snapshot ${a.id}: config entry ${r}`),await t.callApi("DELETE",`config/config_entries/entry/${r}`)}else{const{domain:r,objectId:c}=ee(a.id);if(r==="schedule")try{const d=(await t.callWS({type:"schedule/list"})).find(u=>u.id===c);d&&s.log(`snapshot ${c}: ${JSON.stringify(d)}`)}catch{s.log(`NOTE: could not snapshot ${a.id} before delete`)}await t.callWS({type:`${r}/delete`,[`${r}_id`]:c})}n.deleted++,s.log(`Deleted ${a.id}`)}}catch(a){n.ok=false,s.log(`ERROR during ${o}: ${a instanceof Error?a.message:String(a)} - rolling back this run's creates. Already-applied updates/deletes from this run are NOT reverted; see the log above for what landed.`),await Ai(t,i,s)}return n}var zi=Object.defineProperty,Ci=Object.getOwnPropertyDescriptor,v=(t,e,s,n)=>{for(var i=n>1?void 0:n?Ci(e,s):e,o=t.length-1,a;o>=0;o--)(a=t[o])&&(i=(n?a(e,s,i):a(i))||i);return n&&i&&zi(e,s,i),i};const Ti=[["accent","--mzcs-accent"],["accentBright","--mzcs-accent-bright"],["good","--mzcs-good"],["warn","--mzcs-warn"],["bad","--mzcs-bad"],["bg","--mzcs-bg"],["surface","--mzcs-surface"],["chip","--mzcs-chip"],["track","--mzcs-track"],["border","--mzcs-border"],["text","--mzcs-text"],["textDim","--mzcs-text-dim"]],Ri=[{key:"bg",label:"Card background"},{key:"surface",label:"Panels (hero / rows)"},{key:"chip",label:"Buttons and chips"},{key:"track",label:"Tracks and wells"},{key:"border",label:"Borders"},{key:"text",label:"Text"},{key:"textDim",label:"Muted text"},{key:"accent",label:"Accent (cooling / active)"},{key:"accentBright",label:"Accent bright (today / highlights)"},{key:"good",label:"Good (eco / normal)"},{key:"warn",label:"Warn (heat / season / high)"},{key:"bad",label:"Alert (out of range)"}];function Oi(t,e,s){return!s.some(n=>n.name&&D(t,w("zone_enabled",e,C(n.name))))}const Di=["fan_timer","running_sensor","runtime_today","expected_runtime","applied_block_marker","zone_enabled"],Ii=["season_select","theme"],je=[{cls:"dev_green_max",label:"Room deviation \xB7 green up to (\xB0)"},{cls:"dev_amber_max",label:"Room deviation \xB7 amber up to (\xB0)"},{cls:"runtime_alert_margin",label:"Runtime alert margin (%)"},{cls:"runtime_learn_days",label:"Runtime learn window (days)"},{cls:"cdd_base",label:"Cooling degree-day base (\xB0)"}];function pe(t,e,s){const n=s>e?Math.max(0,Math.min(1,(t-e)/(s-e))):.5,i=[41,121,230],o=[226,122,49];return`rgb(${i.map((a,r)=>Math.round(a+(o[r]-a)*n)).join(",")})`}function Ht(t){const[e,s]=t.split(":");let n=Number(e);const i=n>=12?"PM":"AM";return n=n%12===0?12:n%12,`${n}:${s} ${i}`}const Ft={all:"Every day",wd:"Weekdays",we:"Weekend"},Mi={heat:"Heat",cool:"Cool",heat_cool:"Heat\xB7Cool",off:"Off",auto:"Auto",dry:"Dry",fan_only:"Fan only"};console.info(`%c ${Jt} %c v${Yt}`,"background:var(--mzcs-accent);color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;","background:#243039;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;");let b=class extends Z{constructor(){super(...arguments),this._zoneIndex=0,this._ctrlOpen=false,this._setupOpen=false,this._schedOpen=false,this._schedName="",this._schedBusy=false,this._schedDrafts=new Map,this._schedEdited=new Set,this._rtOpen=false,this._rtDayOpen=null,this._rtDayLoading=false,this._rtDayCache=new Map,this._dryRunning=false,this._cwScanning=false,this._execConfirm=false,this._execRunning=false,this._execLog=[],this._tdArmed=false,this._tdRunning=false,this._setupTab="zones",this._tdAsk=false,this._tdConfirm="",this._diagTextHasIds=false,this._diagIds=false,this._objectsLoading=false,this._renderedMinute=-1}setConfig(t){const e=tt(t);this._config=e,this._zoneIndex>=Math.max(e.zones.length,1)&&(this._zoneIndex=0),this._dryRun=void 0,this._diagText=void 0,this._diagTextHasIds=false,this._dryRunKind=void 0,this._cwScan=void 0,this._cwError=void 0,this._cwScannedFor=void 0,this._execConfirm=false,this._execResult=void 0,this._execLog=[]}static async getConfigElement(){return await Promise.resolve().then(()=>Li),document.createElement(Xt)}static getStubConfig(){return{prefix:"climate",zones:[]}}getCardSize(){return 6}get _prefix(){return this._config?.prefix??"climate"}_zone(){return this._config?.zones[this._zoneIndex]}_nudge(t){const e=this._zone();if(!e||!this.hass)return;const s=St(this.hass,e.entity);if(s.setpoint==null)return;const n=this.hass.states[e.entity]?.attributes,i=Un(s.setpoint+t,s.setpoint,n?.min_temp,n?.max_temp);i!==s.setpoint&&Yn(this.hass,e.entity,i)}_provisionInput(){const t=this._config,e=t.seasons??xe(),s=yi(t.zones.map(n=>C(n.name)),e);return cn({...t,prefix:this._prefix,seasons:e},s,C)}_fetchExistingFor(t){return $i(this.hass,t.prefix,t.zones.map(e=>e.slug),t.seasons.map(e=>e.key))}async _runDryRun(){if(!(!this.hass||this._dryRunning)){this._dryRunning=true,this._dryRunError=void 0;try{const t=this._provisionInput(),e=await this._fetchExistingFor(t);this._dryRun=B(Y(t),e),this._dryRunKind="setup",this._execConfirm=false,this._execResult=void 0,this._execLog=[],this._tdArmed=false}catch(t){this._dryRunError=t instanceof Error?t.message:String(t)}finally{this._dryRunning=false}this._runCompetingScan()}}_cwKey(){const t=(this._config?.zones??[]).filter(e=>e.entity);return t.length===0?null:`${this._prefix}|${t.map(e=>e.entity).join(",")}`}async _runCompetingScan(t=false){if(!this.hass||!this._config||this._cwScanning)return;const e=this._config.zones.filter(i=>i.entity),s=this._cwKey();if(!s||!t&&this._cwScannedFor===s&&this._cwScan)return;this._cwScanning=true,this._cwError=void 0;let n=false;try{const i=await ti(this.hass,this._prefix,We,e);this._cwKey()===s?(this._cwScan=i,this._cwScannedFor=s):n=true}catch(i){this._cwScan=void 0,this._cwScannedFor=void 0,this._cwKey()===s?this._cwError=i instanceof Error?i.message:String(i):n=true}finally{this._cwScanning=false}n&&this._runCompetingScan()}async _armTeardown(){if(!(!this.hass||this._dryRunning||this._tdRunning)){this._dryRunning=true,this._dryRunError=void 0;try{const t=this._provisionInput(),e=await this._fetchExistingFor(t),s=B([],e),n={automation:0,template_sensor:1,stats_sensor:1,schedule:2,helper:3};if(s.delete.sort((i,o)=>(n[i.kind]??9)-(n[o.kind]??9)),!this._tdAsk||this._setupTab!=="danger"||!this._setupOpen)return;this._dryRun=s,this._dryRunKind="teardown",this._tdArmed=true,this._execConfirm=false,this._execResult=void 0,this._execLog=[]}catch(t){this._dryRunError=t instanceof Error?t.message:String(t)}finally{this._dryRunning=false}}}async _runTeardown(){const t=this.hass,e=this._config,s=this._dryRunKind==="teardown"?this._dryRun:void 0;if(!(!t||!e||!s||this._tdRunning)&&this._tdConfirm.trim()===this._prefix){if(this._tdConfirm="",!t.callWS||!t.callApi){this._execLog=["This HA frontend session does not expose the required APIs (callWS/callApi)."];return}this._tdRunning=true,this._tdArmed=false,this._execLog=[];try{const n=this._provisionInput(),i=await this._fetchExistingFor(n),o=B([],i),a={automation:0,template_sensor:1,stats_sensor:1,schedule:2,helper:3};o.delete.sort((u,m)=>(a[u.kind]??9)-(a[m.kind]??9));const r=u=>u.delete.map(m=>m.id).sort().join("|");if(r(o)!==r(s)){this._dryRun=o,this._dryRunKind="teardown",this._tdArmed=true,this._tdRunning=false,this._execLog=["The registry changed since this preview was made. Review the refreshed list and confirm again."];return}for(const u of n.zones){const m=w("zone_enabled",n.prefix,u.slug);if(D(t,m))try{await t.callService("input_boolean","turn_off",{entity_id:m}),this._execLog=[...this._execLog,`Disabled scheduling for ${u.name}`]}catch{this._execLog=[...this._execLog,`NOTE: could not disable ${m}`]}}const c=e.zones.map(u=>({slug:C(u.name),name:u.name,climate:u.entity})),l=await Wt(t,o,{prefix:n.prefix,zones:c,seasons:n.seasons,fanGuard:e.features?.fan_guard,ecoPreset:X(e.features),weatherEntity:e.weather_entity,log:u=>{this._execLog=[...this._execLog,u]}});this._execResult=l;const d=await this._fetchExistingFor(n);this._dryRun=B(Y(n),d),this._dryRunKind="setup"}catch(n){this._execLog=[...this._execLog,`ERROR: ${n instanceof Error?n.message:String(n)}`]}finally{this._tdRunning=false}}}async _runApply(){const t=this.hass,e=this._config,s=this._dryRun;if(!(!t||!e||!s||this._execRunning)){if(!t.callWS||!t.callApi){this._execLog=["This HA frontend session does not expose the required APIs (callWS/callApi)."];return}this._execRunning=true,this._execConfirm=false,this._execLog=[];try{const n=this._provisionInput(),i=e.zones.map(d=>({slug:C(d.name),name:d.name,climate:d.entity})),o=await this._fetchExistingFor(n),a=B(Y(n),o),r=d=>JSON.stringify([d.create.map(u=>u.id).sort(),d.adopt.map(u=>u.id).sort(),d.update.map(u=>u.id).sort(),d.delete.map(u=>u.id).sort()]);if(r(a)!==r(s)){this._dryRun=a,this._dryRunKind="setup",this._execRunning=false,this._execLog=["The registry changed since this preview was made. Review the refreshed plan and apply again."];return}const c=await Wt(t,a,{prefix:n.prefix,zones:i,seasons:n.seasons,fanGuard:e.features?.fan_guard,ecoPreset:X(e.features),weatherEntity:e.weather_entity,log:d=>{this._execLog=[...this._execLog,d]}});this._execResult=c;const l=await this._fetchExistingFor(n);this._dryRun=B(Y(n),l)}catch(n){this._execLog=[...this._execLog,`ERROR: ${n instanceof Error?n.message:String(n)}`]}finally{this._execRunning=false}}}_resetDangerState(){this._tdAsk=false,this._tdArmed=false,this._tdConfirm="",this._dryRunKind==="teardown"&&(this._dryRun=void 0,this._dryRunKind=void 0)}_setSetupTab(t){t!==this._setupTab&&(this._resetDangerState(),this._execConfirm=false,this._setupTab=t,t==="objects"&&this._loadObjects())}_closeSetup(){this._resetDangerState(),this._execConfirm=false,this._setupOpen=false}async _loadObjects(t=false){if(!this.hass||this._objectsLoading)return;const e=`${this._prefix}|${(this._config?.zones??[]).map(s=>s.name).join(",")}`;if(!(!t&&this._objectsLoadedFor===e&&this._objects)){this._objectsLoading=true,this._objectsError=void 0;try{const s=this._provisionInput(),n=await this._fetchExistingFor(s),i=Y(s),o=new Map(n.map(c=>[c.id,c])),a=new Set(i.map(c=>c.id)),r=i.map(c=>{const l=o.get(c.id),d=l?l.managed?l.pristine===false?"customized":"managed":"unmanaged":"missing";return{id:c.id,kind:c.kind,name:String(c.spec.name??c.spec.alias??c.id),status:d}});for(const c of n)c.managed&&!a.has(c.id)&&r.push({id:c.id,kind:c.kind,name:String(c.spec.name??c.spec.alias??c.id),status:"extra"});this._objects=r,this._objectsLoadedFor=e}catch(s){this._objectsError=s instanceof Error?s.message:String(s)}finally{this._objectsLoading=false}}}_renderSetup(){const t=[{key:"zones",label:"Zones"},{key:"tuning",label:"Tuning"},{key:"objects",label:"Objects"},{key:"setup",label:"Setup"},{key:"appearance",label:"Theme"},{key:"danger",label:"Danger"}],e=this._setupTab;return p`
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
        ${this._renderCompetingWriters()}
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
    `}_cwRow(t){const e=t.zoneName??"a scheduled zone",s=t.via==="area"?` on ${e} (targets its area)`:t.via==="device"?` on ${e} (targets its device)`:t.via==="label"?` on ${e} (targets a label it carries)`:t.via==="all"?` on every entity, including ${e}`:t.via==="template"?" on a templated target that may be a scheduled zone":t.via==="floor"?" on a floor target that may include a scheduled zone":t.via==="group"?" on a group that may contain a scheduled zone":t.via==="blueprint"?` - ${e} is one of its configured inputs`:` on ${e}`,n=t.service==="(templated service)"?"a templated service":t.service==="(blueprint)"?"a blueprint automation":t.service,i=t.sourceEnabled===false?" - currently off":"";return p`
      <li>
        <span class="cw-src">${t.sourceName}</span>
        <span class="cw-det">${n}${s}${i}</span>
      </li>
    `}_renderCompetingWriters(){if(this._cwScanning)return p`<p class="setup-sub">Checking for other automations that control these thermostats…</p>`;if(this._cwError)return p`
        <p class="setup-err">
          Could not check for competing automations: ${this._cwError} Apply is not blocked by this
          check.
        </p>
      `;const t=this._cwScan;if(!t)return h;const e=p`
      <button class="chip" .disabled=${this._cwScanning} @click=${()=>void this._runCompetingScan(true)}>
        Re-scan
      </button>
    `,s=[`Scanned ${t.scanned} automation${t.scanned===1?"":"s"} and scripts`,t.skippedOwn>0?`, excluding ${t.skippedOwn} of this card's own`:"",t.blueprints>0?`. ${t.blueprints} blueprint automation${t.blueprints===1?" was":"s were"} checked by ${t.blueprints===1?"its":"their"} configured inputs only`:"",t.unreadable>0?`. ${t.unreadable} could not be read (automations and scripts defined in YAML are not readable here)`:"",t.capped?". Coverage was capped, so some were not scanned":"",t.degraded?". Area matching was reduced for this scan (a registry read failed)":"",". Scenes and systems outside Home Assistant automations (Node-RED, vendor apps) are not scanned."].join(""),n=t.conflicts.length===0&&t.notes.length===0,i=n&&!t.capped&&t.unreadable===0&&!t.degraded&&t.blueprints===0;return p`
      <div class="cwwrap">
        ${i?p`<p class="cw-h ok">No automation or script writes to these thermostats.</p>`:h}
        ${n&&!i?p`<p class="cw-h ok">
              No conflicts found among what could be checked - but coverage was partial, see below.
            </p>`:h}
        ${t.conflicts.length>0?p`
              <p class="cw-h bad">Something else also writes to these thermostats (${t.conflicts.length})</p>
              <p class="setup-sub">
                These will fight the schedule engine. The symptom is setpoints that appear to change
                themselves at odd times. Turn them off, delete them, or narrow them so they no
                longer target a scheduled zone. Rows stay listed while the automation exists - a
                disabled one is marked "currently off", because one toggle re-arms it.
              </p>
              <ul class="cw-list">${t.conflicts.map(o=>this._cwRow(o))}</ul>
            `:h}
        ${t.notes.length>0?p`
              <p class="cw-h warn">Also worth knowing (${t.notes.length})</p>
              <p class="setup-sub">
                These do not fight the setpoint, but they change how the engine behaves. Something
                else writing the standby preset can make the schedule quietly stop applying, because
                the engine stands down while that preset is on.
              </p>
              <ul class="cw-list">${t.notes.map(o=>this._cwRow(o))}</ul>
            `:h}
        <p class="cw-foot">${s} This check is advisory and never blocks Apply.</p>
        ${e}
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
    `}_buildDiag(){const t=this.hass,e=this._config;if(!t||!e)return;const s=(e.zones??[]).map((i,o)=>{const a=w("zone_enabled",this._prefix,C(i.name));return{zone:i.name,index:o,state:D(t,a)?t.states[a]?.state??"unknown":"not provisioned"}}),n=this._dryRun;this._diagText=_n({cardVersion:Yt,haVersion:t.config?.version,userAgent:typeof navigator<"u"?navigator.userAgent:void 0,config:e,plan:n?{create:n.create.length,adopt:n.adopt.length,update:n.update.length,delete:n.delete.length,noop:n.noop.length}:null,planKind:this._dryRunKind,objectStatuses:this._objects?this._objects.map(i=>i.status):null,zoneEnabled:s,activeSeason:t.states[S("season_select",this._prefix)]?.state,identifiers:this._diagIds}),this._diagTextHasIds=this._diagIds,this._diagStatus=void 0}async _copyDiag(t){const e=this._diagText??"";try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(e),this._diagStatus="copied";return}}catch{}t.readOnly=false,t.focus(),t.setSelectionRange(0,e.length),t.readOnly=true,this._diagStatus="selected"}_renderObjectsTab(){const t=this._objects,e=[{label:"Schedules",kinds:["schedule"]},{label:"Helpers",kinds:["helper"]},{label:"Sensors",kinds:["template_sensor","stats_sensor"]},{label:"Automations",kinds:["automation"]}],s={managed:{label:"Managed",cls:"ok",hint:"Created and managed by this card."},missing:{label:"Missing",cls:"warn",hint:"Expected but not present - run Apply on the Setup tab."},customized:{label:"Customized",cls:"warn",hint:"You edited this - the card will never overwrite or delete it."},unmanaged:{label:"Unmanaged",cls:"warn",hint:"Matches this naming scheme but is not labeled - Apply would adopt it."},extra:{label:"Not in config",cls:"del",hint:"Managed but no longer in your config - Apply would delete it."}};return p`
      <p class="setup-sub">
        Everything this card creates and manages, all labeled <code>mzcs</code> in Home
        Assistant. Read-only - tap a row to open it.
      </p>
      <button class="chip" .disabled=${this._objectsLoading} @click=${()=>void this._loadObjects(true)}>
        ${this._objectsLoading?"Reading registry\u2026":"Refresh"}
      </button>
      ${this._objectsError?p`<p class="setup-err">${this._objectsError}</p>`:h}
      ${t?p`
            ${e.map(n=>{const i=t.filter(o=>n.kinds.includes(o.kind));return i.length===0?h:p`
                <p class="plan-h">${n.label} (${i.length})</p>
                ${i.map(o=>{const a=s[o.status];return p`
                    <div class="objrow" title=${a.hint} @click=${()=>this._moreInfo(o.id)}>
                      <span class="objname">${o.name}</span>
                      <span class="objid">${o.id.replace(/^automation:/,"automation.")}</span>
                      <span class="objstat ${a.cls}">${a.label}</span>
                    </div>
                  `})}
              `})}
          `:this._objectsLoading?h:p`<p class="setup-sub">Nothing loaded yet.</p>`}
      ${this._renderDiagnostics()}
    `}_renderDiagnostics(){return p`
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
      ${this._diagText?p`
            <textarea class="diagbox" readonly .value=${this._diagText} @focus=${t=>t.target.select()}></textarea>
            <button
              class="chip"
              @click=${()=>{const t=this.renderRoot.querySelector(".diagbox");t&&this._copyDiag(t)}}
            >
              ${this._diagStatus==="copied"?"Copied":"Copy"}
            </button>
            ${this._diagStatus==="selected"?p`<p class="setup-sub">
                  This browser will not let a page write to the clipboard, which is normal when
                  Home Assistant is served over plain http. The report is selected above - copy it
                  yourself.
                </p>`:h}
            ${this._diagTextHasIds?p`<p class="setup-err">
                  This report now contains your entity ids and the names of your zones and rooms.
                </p>`:h}
          `:h}
    `}_moreInfo(t){if(t.startsWith("automation:")){const e=t.slice(11),s=this.hass;let n;if(s){for(const i in s.states)if(i.startsWith("automation.")&&s.states[i]?.attributes.id===e){n=i;break}}if(!n)return;t=n}this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:true,composed:true}))}_renderApply(t){const e=an(t).length,s=this._execResult;return p`
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
    `}_renderZonesTab(){const t=this.hass;if(!t)return h;const e=S("season_select",this._prefix),s=t.states[e],n=Array.isArray(s?.attributes.options)?s.attributes.options:[];if(je.map(r=>({...r,id:S(r.cls,this._prefix)})).filter(r=>D(t,r.id)),!s&&Oi(t,this._prefix,this._config?.zones??[]))return p`<p class="setup-sub">Zone switches appear here once the card is provisioned.</p>`;const i=(this._config?.zones??[]).map(r=>{const c=C(r.name);return{name:r.name,enableId:w("zone_enabled",this._prefix,c),markerId:w("applied_block_marker",this._prefix,c)}}).filter(r=>D(t,r.enableId)),o=i.length>0&&i.every(r=>t.states[r.enableId]?.state==="on"),a=i.some(r=>t.states[r.enableId]?.state==="on");return p`
      ${i.length>0?p`
            <div class="managerow master">
              <span>Scheduling · all zones</span>
              <button
                class=${o?"chip togg on":"chip togg"}
                @click=${()=>{for(const r of i)zt(t,r.enableId,r.markerId,!a)}}
              >
                ${o?"On":a?"Mixed":"Off"}
              </button>
            </div>
            ${i.map(r=>{const c=t.states[r.enableId]?.state==="on";return p`
                <div class="managerow">
                  <span>${r.name} scheduling</span>
                  <button
                    class=${c?"chip togg on":"chip togg"}
                    @click=${()=>void zt(t,r.enableId,r.markerId,!c)}
                  >
                    ${c?"On":"Off"}
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
                @change=${r=>void Zn(t,e,r.target.value)}
              >
                ${n.map(r=>p`<option .value=${r} ?selected=${r===s.state}>${r}</option>`)}
              </select>
            </div>
          `:h}
    `}_renderTuningTab(){const t=this.hass;if(!t)return h;const e=je.map(s=>({...s,id:S(s.cls,this._prefix)})).filter(s=>D(t,s.id));return e.length===0?p`<p class="setup-sub">Tuning helpers appear here once the card is provisioned.</p>`:p`
      ${e.map(s=>p`
          <div class="managerow">
            <span>${s.label}</span>
            <input
              type="number"
              .value=${t.states[s.id]?.state??""}
              @change=${n=>{const i=n.target,o=i.value.trim(),a=Number(o);if(o===""||!Number.isFinite(a)){i.value=t.states[s.id]?.state??"";return}Kn(t,s.id,a).catch(()=>{i.value=t.states[s.id]?.state??""})}}
            />
          </div>
        `)}
    `}_renderThemePicker(){const t=this.hass;if(!t)return h;const e=S("theme",this._prefix);if(!D(t,e))return h;const{presetKey:s,tokens:n}=Dt(t.states[e]?.state),i=o=>void t.callService("input_text","set_value",{entity_id:e,value:o});return p`
      <div class="chips">
        ${Object.entries(Be).map(([o,a])=>p`
            <button
              class=${s===o?"chip mode-on":"chip"}
              @click=${()=>i(o)}
            >
              <span class="swatch" style="background:${a.tokens.accent}"></span>${a.label}
            </button>
          `)}
        <button
          class=${s==="custom"?"chip mode-on":"chip"}
          @click=${()=>i(Ot(ni(n)))}
        >
          Custom
        </button>
      </div>
      ${s==="custom"?p`
            ${Ri.map(o=>p`
                <div class="managerow">
                  <span>${o.label}</span>
                  <input
                    type="color"
                    .value=${n[o.key]}
                    @change=${a=>{const r={...n,[o.key]:a.target.value};i(Ot(r))}}
                  />
                </div>
              `)}
            <p class="muted" style="font-size:11px;margin:2px 0 0;">
              Colors apply live to every device showing the card.
            </p>
          `:h}
    `}connectedCallback(){super.connectedCallback(),this._renderedMinute=-1,this._tick=setInterval(()=>this.requestUpdate(),3e4)}disconnectedCallback(){super.disconnectedCallback(),this._tick&&clearInterval(this._tick),this._tick=void 0}_applyTheme(){const t=this.hass?.states[S("theme",this._prefix)]?.state,e=`${this._prefix}|${t??""}`;if(e===this._appliedTheme)return;this._appliedTheme=e;const{tokens:s}=Dt(t);for(const[n,i]of Ti)this.style.setProperty(i,s[n])}_watchedEntities(){const t=this._config;if(!t)return[];const e=`${this._prefix}|${this._activeSeasonKey()??""}|${JSON.stringify(t.zones)}|${JSON.stringify(t.seasons)}`;if(this._watchedIds?.key===e)return this._watchedIds.ids;const s=this._prefix,n=[];for(const i of t.zones??[]){i.entity&&n.push(i.entity);for(const r of W(i.room_sensors))n.push(r.entity);if(!i.name)continue;const o=C(i.name);for(const r of Di)n.push(w(r,s,o));for(const r of t.seasons??[])n.push(Q(s,o,r.key));const a=this._activeSeasonKey();a&&n.push(Q(s,o,a))}for(const i of Ii)n.push(S(i,s));for(const i of je)n.push(S(i.cls,s));return this._watchedIds={key:e,ids:n},n}shouldUpdate(t){if(t.size>1||!t.has("hass"))return true;const e=t.get("hass"),s=this.hass;if(!e||!s)return true;const n=Math.floor(Date.now()/6e4);if(n!==this._renderedMinute)return this._renderedMinute=n,true;for(const i of this._watchedEntities())if(e.states[i]!==s.states[i])return true;return false}render(){if(!this._config||!this.hass)return h;this._applyTheme();const t=this._zone();if(!t||!t.entity||!t.entity.startsWith("climate."))return p`<ha-card>
        <div class="wrap"><p class="muted pad">Pick a thermostat for each zone in the card editor to get started.</p></div>
      </ha-card>`;if(this._setupOpen)return p`<ha-card><div class="wrap">${this._renderSetup()}</div></ha-card>`;const e=St(this.hass,t.entity),s=Dn(this.hass,w("fan_timer",this._prefix,C(t.name))),n=e.action==="cooling",i=e.action==="heating",o=this.hass.states[t.entity]?.attributes??{},a=o.target_temp_low!=null&&o.target_temp_high!=null?`${o.target_temp_low}\u2013${o.target_temp_high}`:null,r=e.setpoint??a??"\u2013",c=e.available?n?`Cooling to ${r}`:i?`Heating to ${r}`:e.mode==="off"?"Off":`Idle \xB7 set ${r}`:"Unavailable";return p`
      <ha-card>
        <div class="wrap">
          <div class="tabs" role="tablist">
            ${this._config.zones.map((l,d)=>p`
                <button
                  role="tab"
                  aria-selected=${d===this._zoneIndex}
                  class=${d===this._zoneIndex?"tab on":"tab"}
                  @click=${()=>{this._zoneIndex!==d&&(this._zoneIndex=d,this._rtDayCache.clear(),this._rtDayOpen=null,this._rtDay=void 0)}}
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
                ${c}${e.inside!=null?` \xB7 inside ${e.inside}\xB0`:""}${e.humidity!=null?` \xB7 ${e.humidity}% RH`:""}${s?p`<span class="fan"> · fan on</span>`:""}
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
    `}_renderRuntime(t){if(!this.hass)return h;const e=this.hass,s=C(t.name),n=w("runtime_today",this._prefix,s);if(!D(e,n))return h;const i=Number(e.states[n]?.state),o=Number.isFinite(i)?xt(i):"\u2013",a=w("running_sensor",this._prefix,s);this._rtLoadedFor!==a&&(this._rtLoadedFor=a,this._rtDays=void 0,queueMicrotask(()=>void qn(e,a,10).then(f=>{this._rtLoadedFor===a&&(this._rtDays=f)})));const r=new Date;r.setHours(0,0,0,0);const c=this._rtDays?.ok?this._rtDays.rows:[],l=c.filter(f=>f.day<r.getTime()&&f.coverage!=="none").sort((f,A)=>A.day-f.day),d=c.filter(f=>f.day<r.getTime()&&f.coverage==="none").length,u=r.getTime(),m=Number(e.states[w("expected_runtime",this._prefix,s)]?.state),_=Te(e,S("runtime_alert_margin",this._prefix))??35,k=(Date.now()-u)/36e5,E=si(Number.isFinite(i)?i:0,m,_,k);return p`
      <button class="schedrow" @click=${()=>this._rtOpen=!this._rtOpen}>
        <span
          >Runtime · Today <b class="rt-b">${o}</b>${E.label?p` <span class="verdict ${E.status}">· ${E.label}</span>`:h}</span
        >
        <span aria-hidden="true">${this._rtOpen?"\u25B4":"\u25BE"}</span>
      </button>
      ${this._rtOpen?p`
            <div class="schedbody">
              ${this._renderPill(t,"Today",Number.isFinite(i)?i:0,u,true)}
              ${l.map(f=>this._renderPill(t,new Date(f.day).toLocaleDateString(void 0,{weekday:"short",day:"numeric"}),f.hours,f.day,false,f.coverage==="partial"))}
              ${this._rtDays&&!this._rtDays.ok?p`<p class="rt-fail">
                    Could not read history from Home Assistant, so this is not "no
                    runtime yet" - it is unknown. ${this._rtDays.error}
                  </p>`:this._rtDays&&l.length===0?p`<p class="muted" style="font-size:11px;margin:6px 0;">
                      No recorded history for this zone yet - past days appear as the
                      recorder collects them.
                    </p>`:h}
              ${d>0&&l.length>0?p`<p class="muted" style="font-size:10px;margin:6px 0 0;">
                    Recorded history covers the last ${l.length+1} days - older days
                    are gone once the recorder purges them.
                  </p>`:l.some(f=>f.coverage==="partial")?p`<p class="muted" style="font-size:10px;margin:6px 0 0;">
                      The oldest day shows ≥ because the recorder has already trimmed
                      its start.
                    </p>`:h}
              <p class="muted" style="font-size:10px;margin:6px 0 0;">
                Tap a day for its run segments and setpoint changes.
              </p>
            </div>
          `:h}
    `}async _openDay(t,e){if(this._rtDayOpen===e){this._rtDayOpen=null;return}this._rtDayOpen=e;const s=this._rtDayCache.get(e);if(s){this._rtDay={ok:true,detail:s};return}if(this.hass){this._rtDayLoading=true,this._rtDay=void 0;try{const n=C(t.name),i=w("running_sensor",this._prefix,n),o=Math.min(e+864e5,Date.now()),[a,r]=await Promise.all([Ct(this.hass,i,e,o),Ct(this.hass,t.entity,e,o,"temperature")]);if(!a.ok){this._rtDayOpen===e&&(this._rtDay={ok:false,error:a.error});return}const c=a.rows,l=r.ok?r.rows:[],d={segs:cs(c,e,o),bubs:yn(l),start:e,end:e+864e5};this._rtDayCache.set(e,d),this._rtDayOpen===e&&(this._rtDay={ok:true,detail:d})}finally{this._rtDayLoading=false}}}_renderPill(t,e,s,n,i,o=false){const a=Math.min(100,Math.max(0,s/24*100)),r=this._rtDayOpen===n;return p`
      <button
        class="pillrow"
        title=${o?"The recorder has trimmed the start of this day; its total is at least this much.":h}
        @click=${()=>void this._openDay(t,n)}
      >
        <span class="pill-label">${e}</span>
        <span class="pill-track">
          <span
            class="pill-fill ${i||r?"today-fill":""}"
            style="width: ${a.toFixed(1)}%"
          ></span>
        </span>
        <span class="pill-hours">${o?"\u2265 ":""}${xt(s)}</span>
      </button>
      ${r?this._renderDayDetail():h}
    `}_renderDayDetail(){if(this._rtDayLoading)return p`<p class="muted" style="font-size:11px;">Loading day…</p>`;if(this._rtDay&&!this._rtDay.ok)return p`<p class="rt-fail">
        Could not read this day's history, so it is unknown rather than a day with no
        runs. ${this._rtDay.error}
      </p>`;const t=this._rtDay?.ok?this._rtDay.detail:void 0;return t?p`
      <div class="daydetail">
        <div class="bubblerow">
          ${t.bubs.slice(0,12).map(e=>{const s=(e.t-t.start)/(t.end-t.start)*100;return p`<span class="bubble" style="left: ${s.toFixed(1)}%"
              >${Math.round(e.value)}</span
            >`})}
        </div>
        <div class="segtrack">
          ${t.segs.map(e=>{const{left:s,width:n}=bn(e,t.start,t.end);return p`<span
              class="seg"
              style="left: ${s.toFixed(2)}%; width: ${Math.max(.4,n).toFixed(2)}%"
            ></span>`})}
        </div>
        <div class="axis">
          <span>12A</span><span>6A</span><span>12P</span><span>6P</span><span>12A</span>
        </div>
      </div>
    `:h}_activeSeasonKey(){const t=this.hass?.states[S("season_select",this._prefix)];return!t||t.state==="unknown"?null:Fs(this._config?.seasons,t.state)}_scheduleEntityId(t){const e=this._activeSeasonKey();return!e||!t.name?null:Q(this._prefix,C(t.name),e)}async _loadWeek(t){if(!this.hass)return;const e=this._scheduleEntityId(t);if(!e||!D(this.hass,e)){this._schedWeek=void 0;return}this._schedBusy=true;try{const s=await At(this.hass,e);if(this._schedLoadedFor!==e)return;this._schedWeek=s?.week??void 0,this._schedName=s?.name??"",this._schedError=s?void 0:"Could not load schedule config."}catch(s){this._schedLoadedFor===e&&(this._schedError=ye(s))}finally{this._schedBusy=false}}_setBlocks(t,e,s){return this._schedDrafts.get(e)??Oe(t[s[0]]??[])}_mutateDraft(t,e,s){if(!this._schedWeek)return;const n=this._schedDrafts.get(t)??Oe(this._schedWeek[e[0]]??[]).map(o=>({...o}));s(n);const i=new Map(this._schedDrafts);i.set(t,n),this._schedDrafts=i,this._schedEdited.add(t),this._schedNotice=void 0}_clearSchedEdit(){this._schedDrafts=new Map,this._schedEdited=new Set,this._schedSel=void 0,this._schedGran=void 0}_activeDet(t){if(!this._schedGran)return Nt(t);const e=this._schedGran,s=e==="all"?["all"]:e==="wdwe"?["wd","we"]:[...R];return{granularity:e,sets:Object.fromEntries(s.map(n=>[n,ts(e,n)]))}}_switchGranularity(t){const e=this._schedWeek;if(!e||this._activeDet(e).granularity===t)return;const s=Nt(e),n={};for(const[a,r]of Object.entries(s.sets)){const c=this._schedEdited.has(a)?this._schedDrafts.get(a):void 0;n[a]=(c??Oe(e[r[0]]??[])).map(l=>({...l}))}const i=Ys(s.granularity,t,n),o=new Map;for(const[a,r]of Object.entries(i))o.set(a,r.map(c=>({...c})));this._schedDrafts=o,this._schedGran=t,this._schedSel=void 0,this._schedNotice=void 0}async _saveSchedDrafts(){const t=this._schedLoadedFor;if(!this.hass||!this._schedWeek||this._schedDrafts.size===0||!t)return;const e=this._activeDet(this._schedWeek);this._schedBusy=true;try{const s=await At(this.hass,t);let n=s?.week??this._schedWeek;for(const[i,o]of this._schedDrafts){const a=e.sets[i];a&&(n=hs(n,a,o))}await Bn(this.hass,t,n,s?.name??this._schedName),this._schedLoadedFor===t&&(this._schedWeek=n,this._clearSchedEdit(),this._schedError=void 0)}catch(s){this._schedError=ye(s)}finally{this._schedBusy=false}}_renderSchedule(t){if(!this.hass)return h;const e=this._scheduleEntityId(t);if(!e||!D(this.hass,e))return h;this._schedLoadedFor!==e&&(this._schedNotice=this._schedWeek&&De(this._schedWeek,this._activeDet(this._schedWeek),this._schedDrafts)?"Unsaved schedule edits were discarded (zone or season changed).":void 0,this._schedLoadedFor=e,this._schedWeek=void 0,this._clearSchedEdit(),queueMicrotask(()=>void this._loadWeek(t)));const s=this.hass.states[S("season_select",this._prefix)]?.state??"",n=this._schedWeek,i=n?ci(n,new Date):null,o=i?i.cool_temp??i.heat_temp:null,a=i?`Next \xB7 ${Ht(i.time)} ${i.name}${o!=null?` \u2192 ${o}\xB0`:""}`:"Schedule",r=n?De(n,this._activeDet(n),this._schedDrafts):false;return p`
      <button
        class="schedrow ${r?"unsaved":""}"
        @click=${()=>{this._schedOpen=!this._schedOpen,this._schedWeek||this._loadWeek(t)}}
      >
        <span>
          ${a} <span class="season">· ${s}</span>
          ${r?p`<span class="unsavedchip">unsaved</span>`:h}
        </span>
        <span aria-hidden="true">${this._schedOpen?"\u25B4":"\u25BE"}</span>
      </button>
      ${!this._schedOpen&&this._schedNotice?p`<p class="unsavedhint">${this._schedNotice}</p>`:h}
      ${!this._schedOpen&&r?p`<p class="unsavedhint">
            This schedule has changes you have not saved. They are not running - open the
            schedule to save or discard them.
          </p>`:h}
      ${this._schedOpen?this._renderScheduleBody(t):h}
    `}_renderScheduleBody(t){if(this._schedBusy&&!this._schedWeek)return p`<p class="muted pad">Loading…</p>`;const e=this._schedWeek;if(!e)return this._schedError?p`<p class="schederr pad">${this._schedError}</p>`:p`<p class="muted pad">No schedule data.</p>`;const s=this._activeDet(e),n=Object.entries(s.sets),i=new Date().getDay(),o=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][i],a=[];for(const[m,_]of n)for(const k of this._setBlocks(e,m,_))k.cool_temp!=null&&a.push(k.cool_temp),k.heat_temp!=null&&a.push(k.heat_temp);let r=a.length?Math.min(...a):70,c=a.length?Math.max(...a):80;if(c-r<6){const m=(c+r)/2;r=m-3,c=m+3}const l=s.granularity==="days",d=De(e,this._activeDet(e),this._schedDrafts);return li(e)?p`
        <div class="schedbody">
          ${n.map(([m,_],k)=>{const E=di(e[_[0]]??[]),f=_.includes(o),A=Ft[m]??m.charAt(0).toUpperCase()+m.slice(1);return p`
              <p class="sethead">${A}${f?p` <span class="today">today</span>`:h}</p>
              <div class="sstrip ${l?"small":""}">
                ${E.map(g=>{const y=(g.toMin-g.fromMin)/1440*100,x=g.block?g.block.cool_temp??g.block.heat_temp:null;return p`<span
                    class="sseg ro"
                    style="width:${y}%;background:${g.block&&x!=null?pe(x,r,c):"var(--mzcs-track)"}"
                  >
                    <span class="segt">${g.block?`${x??"\u2013"}\xB0`:"Off"}</span>
                  </span>`})}
              </div>
              ${!l||k===n.length-1?p`<div class="saxis">
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
          ${[["all","Every day"],["wdwe","Weekday \xB7 Weekend"],["days","Individual days"]].map(([m,_])=>p`
              <button
                class=${s.granularity===m?"chip mode-on":"chip"}
                .disabled=${this._schedBusy}
                @click=${()=>this._switchGranularity(m)}
              >
                ${_}
              </button>
            `)}
        </div>
        ${n.map(([m,_],k)=>{const E=this._setBlocks(e,m,_),f=ui(E),A=_.includes(o),g=E.some(T=>T.mode==="heat_cool"),y=Ft[m]??m.charAt(0).toUpperCase()+m.slice(1),x=p`
            <div class="sstrip ${l?"small":""} ${g?"hc":""}">
              ${f.map(T=>{const rt=E.indexOf(T.block),ct=!T.wrap&&this._schedSel?.setKey===m&&this._schedSel?.idx===rt,de=(T.toMin-T.fromMin)/1440*100,lt=()=>{this._schedSel={setKey:m,idx:rt}};if(g){const Ee=T.block.cool_temp,Ae=T.block.heat_temp;return p`
                    <button class="sseg hcseg ${ct?"sel":""}" style="width:${de}%" @click=${lt}>
                      <span class="hchalf" style="background:${Ee!=null?pe(Ee,r,c):"var(--mzcs-track)"}">
                        <span class="segt">${Ee??"\u2013"}°</span>
                        ${de>15&&!l?p`<span class="segn">${T.block.name}</span>`:h}
                      </span>
                      <span class="hchalf" style="background:${Ae!=null?pe(Ae,r,c):"var(--mzcs-track)"}">
                        <span class="segt">${Ae??"\u2013"}°</span>
                      </span>
                    </button>
                  `}const Se=T.block.cool_temp??T.block.heat_temp;return p`
                  <button
                    class="sseg ${ct?"sel":""}"
                    style="width:${de}%;background:${Se!=null?pe(Se,r,c):"var(--mzcs-track)"}"
                    @click=${lt}
                  >
                    <span class="segt">${Se??"\u2013"}°</span>
                    ${de>9&&!l?p`<span class="segn">${T.block.name}</span>`:h}
                  </button>
                `})}
            </div>
          `,z=!l||k===n.length-1;return p`
            <p class="sethead">
              ${y}${A?p` <span class="today">today</span>`:h}
            </p>
            ${g?p`<div class="hcwrap">
                  <div class="hcgutter"><span class="gc">Cool</span><span class="gh">Heat</span></div>
                  ${x}
                </div>`:x}
            ${z?p`<div class="saxis ${g?"indent":""}">
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
                  @click=${()=>{const m=w("applied_block_marker",this._prefix,C(t.name));Vn(this.hass,m,Us(this._prefix,"engine"))}}
                >
                  Apply now
                </button>
                <span class="muted">Tap a block to edit. Changes apply at the next block; Apply now re-asserts immediately.</span>
              `}
        </div>
      </div>
    `}_renderBlockEditor(t){const e=this._schedSel,s=this._schedWeek;if(!e||!s)return h;const n=t.sets[e.setKey];if(!n)return h;const i=this._setBlocks(s,e.setKey,n),o=i[e.idx];if(!o)return h;const a=d=>this._mutateDraft(e.setKey,n,d),r=d=>{a(u=>{const m=u[e.idx],_=I(m.time),k=_+d,E=e.idx>0?I(u[e.idx-1].time)+15:0,f=e.idx<u.length-1?I(u[e.idx+1].time)-15:Math.max(1425,_);m.time=jt(Math.max(E,Math.min(f,k)))})},c=(d,u)=>{a(m=>{const _=m[e.idx],E=(_[d]??_.cool_temp??_.heat_temp??72)<45,f=(_[d]??(E?22:72))+u;let A=E?5:45,g=E?35:95;_.mode==="heat_cool"&&(d==="cool_temp"&&_.heat_temp!=null&&(A=_.heat_temp+2),d==="heat_temp"&&_.cool_temp!=null&&(g=_.cool_temp-2)),_[d]=Math.max(A,Math.min(g,f))})},l=(d,u,m,_)=>p`
      <div class="managerow">
        <span>${d}</span>
        <span class="stepgrp">
          <button class="stepbtn" @click=${m}>−</button>
          <span class="stepval">${u}</span>
          <button class="stepbtn" @click=${_}>+</button>
        </span>
      </div>
    `;return p`
      <div class="bedit">
        <div class="managerow">
          <span>Block name</span>
          <input
            class="bname-in"
            type="text"
            .value=${o.name}
            @change=${d=>a(u=>{u[e.idx].name=d.target.value})}
          />
        </div>
        ${l("Starts",Ht(o.time),()=>r(-15),()=>r(15))}
        ${o.mode==="heat_cool"?p`
              ${l("Cool to",`${o.cool_temp??"\u2013"}\xB0`,()=>c("cool_temp",-1),()=>c("cool_temp",1))}
              ${l("Heat to",`${o.heat_temp??"\u2013"}\xB0`,()=>c("heat_temp",-1),()=>c("heat_temp",1))}
            `:o.mode==="heat"?l("Heat to",`${o.heat_temp??"\u2013"}\xB0`,()=>c("heat_temp",-1),()=>c("heat_temp",1)):l("Cool to",`${o.cool_temp??"\u2013"}\xB0`,()=>c("cool_temp",-1),()=>c("cool_temp",1))}
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
            @click=${()=>{const d=e.idx<i.length-1?I(i[e.idx+1].time):1440,u=I(o.time);if(d-u<45)return;const m=jt(Math.round((u+Math.max(30,(d-u)/2))/15)*15);a(_=>{_.splice(e.idx+1,0,{time:m,name:"New block",mode:o.mode,cool_temp:o.cool_temp,heat_temp:o.heat_temp})}),this._schedSel={setKey:e.setKey,idx:e.idx+1}}}
          >
            Add block after
          </button>
          <button class="chip" @click=${()=>this._schedSel=void 0}>Close</button>
        </div>
      </div>
    `}_renderControls(t){if(!this.hass)return h;const e=this.hass,s=this._zone();if(!s)return h;const n=In(e,t),i=e.states[t]?.state,o=X(this._config?.features),a=o!==null&&Mn(e,t,o),r=o==="eco"?"Eco":(o??"").charAt(0).toUpperCase()+(o??"").slice(1),c=w("fan_timer",this._prefix,C(s.name)),l=this._config?.features?.fan_timer??[15,30,60],d=D(e,c);return p`
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
                      @click=${()=>void Ln(e,t,u)}
                    >
                      ${Mi[u]??u}
                    </button>
                  `)}
                ${a?p`
                      <button
                        class=${Et(e,t,o)?"chip eco eco-on":"chip eco"}
                        @click=${()=>void Wn(e,t,!Et(e,t,o),o)}
                      >
                        ${r}
                      </button>
                    `:h}
              </div>
              ${d?p`
                    <div class="chips fanrow">
                      <span class="fanlbl">Fan</span>
                      ${l.map(u=>p`
                          <button
                            class="chip"
                            @click=${()=>void Fn(e,t,c,u)}
                          >
                            ${u}m
                          </button>
                        `)}
                    </div>
                  `:h}
            </div>
          `:h}
    `}_renderRooms(t,e){if(!this.hass||!t.room_sensors||t.room_sensors.length===0)return h;const s=this.hass,{greenMax:n,amberMax:i}=_i(Te(s,S("dev_green_max",this._prefix)),Te(s,S("dev_amber_max",this._prefix))),o=W(t.room_sensors),a=Pn(s,[t.entity,...o.map(r=>r.entity)]);return p`
      <div class="rooms">
        ${o.map(r=>{const c=jn(s,r.entity,a),l={...c,name:r.name?.trim()||c.name};if(l.temp==null||e==null||l.stale)return p`
              <div class="room" title=${l.stale?"This sensor has not reported for hours - the reading below may be out of date.":h}>
                <span class="rname">${l.name}</span>
                <span class="rtemp muted">
                  ${l.temp==null?"\u2014":l.stale?p`<span class="stalechip">stale</span>${Ie(l.temp)}°`:`${Ie(l.temp)}\xB0`}
                </span>
              </div>
            `;const d=Math.round(l.temp-e);return p`
            <div class="room">
              <span class="rname">${l.name}</span>
              <span>
                <span class="badge ${mi(d,n,i)}"
                  >${fi(d)}</span
                >
                <span class="rtemp">${Ie(l.temp)}°</span>
              </span>
            </div>
          `})}
      </div>
    `}};b.styles=Bt`
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
  `;v([Qe({attribute:false})],b.prototype,"hass",2);v([$()],b.prototype,"_config",2);v([$()],b.prototype,"_zoneIndex",2);v([$()],b.prototype,"_ctrlOpen",2);v([$()],b.prototype,"_setupOpen",2);v([$()],b.prototype,"_schedOpen",2);v([$()],b.prototype,"_schedWeek",2);v([$()],b.prototype,"_schedError",2);v([$()],b.prototype,"_schedBusy",2);v([$()],b.prototype,"_schedSel",2);v([$()],b.prototype,"_schedDrafts",2);v([$()],b.prototype,"_schedNotice",2);v([$()],b.prototype,"_schedGran",2);v([$()],b.prototype,"_rtOpen",2);v([$()],b.prototype,"_rtDays",2);v([$()],b.prototype,"_rtDay",2);v([$()],b.prototype,"_rtDayOpen",2);v([$()],b.prototype,"_rtDayLoading",2);v([$()],b.prototype,"_dryRun",2);v([$()],b.prototype,"_dryRunError",2);v([$()],b.prototype,"_dryRunning",2);v([$()],b.prototype,"_cwScan",2);v([$()],b.prototype,"_cwScanning",2);v([$()],b.prototype,"_cwError",2);v([$()],b.prototype,"_execConfirm",2);v([$()],b.prototype,"_execRunning",2);v([$()],b.prototype,"_execLog",2);v([$()],b.prototype,"_execResult",2);v([$()],b.prototype,"_tdArmed",2);v([$()],b.prototype,"_tdRunning",2);v([$()],b.prototype,"_setupTab",2);v([$()],b.prototype,"_tdAsk",2);v([$()],b.prototype,"_tdConfirm",2);v([$()],b.prototype,"_diagText",2);v([$()],b.prototype,"_diagTextHasIds",2);v([$()],b.prototype,"_diagIds",2);v([$()],b.prototype,"_diagStatus",2);v([$()],b.prototype,"_objects",2);v([$()],b.prototype,"_objectsLoading",2);v([$()],b.prototype,"_objectsError",2);b=v([Vt(et)],b);window.customCards=window.customCards??[];window.customCards.push({type:et,name:Jt,description:"Multi-zone climate view for 1-4 zones with seasonal scheduling, fan timers, and runtime history."});var Ni=Object.defineProperty,Pi=Object.getOwnPropertyDescriptor,ke=(t,e,s,n)=>{for(var i=n>1?void 0:n?Pi(e,s):e,o=t.length-1,a;o>=0;o--)(a=t[o])&&(i=(n?a(e,s,i):a(i))||i);return n&&i&&Ni(e,s,i),i};let Le=null;function ji(){return Le||(Le=(async()=>{if(!customElements.get("ha-selector"))try{await(await window.loadCardHelpers?.())?.createCardElement({type:"entities",entities:[]})?.constructor.getConfigElement?.(),await customElements.whenDefined("ha-selector")}catch{}})()),Le}let U=class extends Z{constructor(){super(...arguments),this._ready=false}setConfig(t){let e;try{e=tt(t)}catch{e=t}this._config={...e,type:t.type,prefix:e.prefix??"climate",zones:e.zones??[],seasons:e.seasons??xe(),season_switch:e.season_switch??"manual",weather_entity:e.weather_entity,features:{...e.features,fan_timer:e.features?.fan_timer??[15,30,60],anomaly_alerts:e.features?.anomaly_alerts??true}}}connectedCallback(){super.connectedCallback(),ji().then(()=>{this._ready=true})}_seasonProvisioned(t){const e=this.hass,s=this._config;if(!e||!s)return true;const n=s.prefix??"climate";return(s.zones??[]).some(i=>i.name&&!!e.states[`schedule.${n}_${C(i.name)}_${t}`])}_emit(t){this._config&&(this._config={...this._config,...t},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:true,composed:true})))}_setZone(t,e){const s=(this._config?.zones??[]).map((n,i)=>i===t?{...n,...e}:n);this._emit({zones:s})}_selector(t,e,s,n){return!this._ready||!customElements.get("ha-selector")?p`<input
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
              ${this._selector({entity:{domain:"sensor",device_class:"temperature",multiple:true}},W(n.room_sensors).map(o=>o.entity),o=>{const a=(o??[]).filter(Boolean),r=new Map(W(n.room_sensors).map(c=>[c.entity,c]));this._setZone(i,{room_sensors:a.map(c=>{const l=r.get(c);return l?.name?{entity:c,name:l.name}:c})})},"Room sensors")}
              ${W(n.room_sensors).map(o=>p`
                  <label class="fieldrow roomlabel">
                    <span class="rooment"
                      >${this.hass?.states[o.entity]?.attributes.friendly_name??o.entity}</span
                    >
                    <input
                      .value=${o.name??""}
                      placeholder="Label on card (optional)"
                      @change=${a=>{const r=a.target.value.trim();this._setZone(i,{room_sensors:W(n.room_sensors).map(c=>c.entity===o.entity?r?{entity:c.entity,name:r}:c.entity:c.name?{entity:c.entity,name:c.name}:c.entity)})}}
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
                @change=${o=>{const a=o.target.value,r=a.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""),c=s.some((u,m)=>m!==i&&u.key===r),l=this._seasonProvisioned(n.key)||!r||c?n.key:r,d=s.map((u,m)=>m===i?{...u,name:a,key:l}:u);this._emit({seasons:d})}}
              />
              <select
                .value=${n.default_mode}
                @change=${o=>{const a=o.target.value;this._emit({seasons:s.map((r,c)=>c===i?{...r,default_mode:a}:r)})}}
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
            @change=${n=>{const i=n.target.checked,o={...t.features};i?delete o.eco_preset:o.eco_preset=false,this._emit({features:o})}}
          />
          Stand down while a standby preset is active
        </label>
        ${t.features?.eco_preset!==false?p`
              <label class="fieldrow">
                Standby preset name
                <input
                  .value=${typeof t.features?.eco_preset=="string"?t.features.eco_preset:"eco"}
                  @change=${n=>{const i=n.target,o=i.value.replace(/['"\\]/g,"").trim()||"eco";i.value=o;const a={...t.features};o==="eco"?delete a.eco_preset:a.eco_preset=o,this._emit({features:a})}}
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
            @change=${n=>{const i=n.target,o=C(i.value)||"climate";i.value=o,this._emit({prefix:o})}}
          />
        </label>
      </div>
    `}};U.styles=Bt`
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
  `;ke([Qe({attribute:false})],U.prototype,"hass",2);ke([$()],U.prototype,"_config",2);ke([$()],U.prototype,"_ready",2);U=ke([Vt(Xt)],U);const Li=Object.freeze(Object.defineProperty({__proto__:null,get MzcsCardEditor(){return U}},Symbol.toStringTag,{value:"Module"}));export{b as MzcsCard};

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Y = globalThis, de = Y.ShadowRoot && (Y.ShadyCSS === void 0 || Y.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ue = Symbol(), ve = /* @__PURE__ */ new WeakMap();
let Ye = class {
  constructor(e, s, n) {
    if (this._$cssResult$ = !0, n !== ue) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (de && e === void 0) {
      const n = s !== void 0 && s.length === 1;
      n && (e = ve.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && ve.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const lt = (t) => new Ye(typeof t == "string" ? t : t + "", void 0, ue), Je = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((n, i, a) => n + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + t[a + 1], t[0]);
  return new Ye(s, t, ue);
}, ct = (t, e) => {
  if (de) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const n = document.createElement("style"), i = Y.litNonce;
    i !== void 0 && n.setAttribute("nonce", i), n.textContent = s.cssText, t.appendChild(n);
  }
}, xe = de ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const n of e.cssRules) s += n.cssText;
  return lt(s);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: dt, defineProperty: ut, getOwnPropertyDescriptor: pt, getOwnPropertyNames: ht, getOwnPropertySymbols: mt, getPrototypeOf: ft } = Object, se = globalThis, we = se.trustedTypes, _t = we ? we.emptyScript : "", gt = se.reactiveElementPolyfillSupport, j = (t, e) => t, J = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? _t : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let s = t;
  switch (e) {
    case Boolean:
      s = t !== null;
      break;
    case Number:
      s = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        s = JSON.parse(t);
      } catch {
        s = null;
      }
  }
  return s;
} }, pe = (t, e) => !dt(t, e), ke = { attribute: !0, type: String, converter: J, reflect: !1, useDefault: !1, hasChanged: pe };
Symbol.metadata ??= Symbol("metadata"), se.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let P = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = ke) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const n = Symbol(), i = this.getPropertyDescriptor(e, n, s);
      i !== void 0 && ut(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, s, n) {
    const { get: i, set: a } = pt(this.prototype, e) ?? { get() {
      return this[s];
    }, set(o) {
      this[s] = o;
    } };
    return { get: i, set(o) {
      const r = i?.call(this);
      a?.call(this, o), this.requestUpdate(e, r, n);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? ke;
  }
  static _$Ei() {
    if (this.hasOwnProperty(j("elementProperties"))) return;
    const e = ft(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(j("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(j("properties"))) {
      const s = this.properties, n = [...ht(s), ...mt(s)];
      for (const i of n) this.createProperty(i, s[i]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const s = litPropertyMetadata.get(e);
      if (s !== void 0) for (const [n, i] of s) this.elementProperties.set(n, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [s, n] of this.elementProperties) {
      const i = this._$Eu(s, n);
      i !== void 0 && this._$Eh.set(i, s);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const s = [];
    if (Array.isArray(e)) {
      const n = new Set(e.flat(1 / 0).reverse());
      for (const i of n) s.unshift(xe(i));
    } else e !== void 0 && s.push(xe(e));
    return s;
  }
  static _$Eu(e, s) {
    const n = s.attribute;
    return n === !1 ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
  }
  addController(e) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
  }
  removeController(e) {
    this._$EO?.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), s = this.constructor.elementProperties;
    for (const n of s.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ct(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, s, n) {
    this._$AK(e, n);
  }
  _$ET(e, s) {
    const n = this.constructor.elementProperties.get(e), i = this.constructor._$Eu(e, n);
    if (i !== void 0 && n.reflect === !0) {
      const a = (n.converter?.toAttribute !== void 0 ? n.converter : J).toAttribute(s, n.type);
      this._$Em = e, a == null ? this.removeAttribute(i) : this.setAttribute(i, a), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const n = this.constructor, i = n._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const a = n.getPropertyOptions(i), o = typeof a.converter == "function" ? { fromAttribute: a.converter } : a.converter?.fromAttribute !== void 0 ? a.converter : J;
      this._$Em = i;
      const r = o.fromAttribute(s, a.type);
      this[i] = r ?? this._$Ej?.get(i) ?? r, this._$Em = null;
    }
  }
  requestUpdate(e, s, n, i = !1, a) {
    if (e !== void 0) {
      const o = this.constructor;
      if (i === !1 && (a = this[e]), n ??= o.getPropertyOptions(e), !((n.hasChanged ?? pe)(a, s) || n.useDefault && n.reflect && a === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, n)))) return;
      this.C(e, s, n);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, s, { useDefault: n, reflect: i, wrapped: a }, o) {
    n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, o ?? s ?? this[e]), a !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (s = void 0), this._$AL.set(e, s)), i === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (s) {
      Promise.reject(s);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [i, a] of this._$Ep) this[i] = a;
        this._$Ep = void 0;
      }
      const n = this.constructor.elementProperties;
      if (n.size > 0) for (const [i, a] of n) {
        const { wrapped: o } = a, r = this[i];
        o !== !0 || this._$AL.has(i) || r === void 0 || this.C(i, void 0, a, r);
      }
    }
    let e = !1;
    const s = this._$AL;
    try {
      e = this.shouldUpdate(s), e ? (this.willUpdate(s), this._$EO?.forEach((n) => n.hostUpdate?.()), this.update(s)) : this._$EM();
    } catch (n) {
      throw e = !1, this._$EM(), n;
    }
    e && this._$AE(s);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((s) => s.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq &&= this._$Eq.forEach((s) => this._$ET(s, this[s])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
P.elementStyles = [], P.shadowRootOptions = { mode: "open" }, P[j("elementProperties")] = /* @__PURE__ */ new Map(), P[j("finalized")] = /* @__PURE__ */ new Map(), gt?.({ ReactiveElement: P }), (se.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const he = globalThis, Ae = (t) => t, G = he.trustedTypes, ze = G ? G.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Ge = "$lit$", A = `lit$${Math.random().toFixed(9).slice(2)}$`, Xe = "?" + A, yt = `<${Xe}>`, R = document, U = () => R.createComment(""), B = (t) => t === null || typeof t != "object" && typeof t != "function", me = Array.isArray, bt = (t) => me(t) || typeof t?.[Symbol.iterator] == "function", ie = `[ 	
\f\r]`, L = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Se = /-->/g, Ee = />/g, E = RegExp(`>|${ie}(?:([^\\s"'>=/]+)(${ie}*=${ie}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Ce = /'/g, Oe = /"/g, Qe = /^(?:script|style|textarea|title)$/i, $t = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), d = $t(1), N = Symbol.for("lit-noChange"), u = Symbol.for("lit-nothing"), De = /* @__PURE__ */ new WeakMap(), O = R.createTreeWalker(R, 129);
function et(t, e) {
  if (!me(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ze !== void 0 ? ze.createHTML(e) : e;
}
const vt = (t, e) => {
  const s = t.length - 1, n = [];
  let i, a = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = L;
  for (let r = 0; r < s; r++) {
    const l = t[r];
    let c, p, m = -1, $ = 0;
    for (; $ < l.length && (o.lastIndex = $, p = o.exec(l), p !== null); ) $ = o.lastIndex, o === L ? p[1] === "!--" ? o = Se : p[1] !== void 0 ? o = Ee : p[2] !== void 0 ? (Qe.test(p[2]) && (i = RegExp("</" + p[2], "g")), o = E) : p[3] !== void 0 && (o = E) : o === E ? p[0] === ">" ? (o = i ?? L, m = -1) : p[1] === void 0 ? m = -2 : (m = o.lastIndex - p[2].length, c = p[1], o = p[3] === void 0 ? E : p[3] === '"' ? Oe : Ce) : o === Oe || o === Ce ? o = E : o === Se || o === Ee ? o = L : (o = E, i = void 0);
    const h = o === E && t[r + 1].startsWith("/>") ? " " : "";
    a += o === L ? l + yt : m >= 0 ? (n.push(c), l.slice(0, m) + Ge + l.slice(m) + A + h) : l + A + (m === -2 ? r : h);
  }
  return [et(t, a + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), n];
};
class F {
  constructor({ strings: e, _$litType$: s }, n) {
    let i;
    this.parts = [];
    let a = 0, o = 0;
    const r = e.length - 1, l = this.parts, [c, p] = vt(e, s);
    if (this.el = F.createElement(c, n), O.currentNode = this.el.content, s === 2 || s === 3) {
      const m = this.el.content.firstChild;
      m.replaceWith(...m.childNodes);
    }
    for (; (i = O.nextNode()) !== null && l.length < r; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const m of i.getAttributeNames()) if (m.endsWith(Ge)) {
          const $ = p[o++], h = i.getAttribute(m).split(A), f = /([.?@])?(.*)/.exec($);
          l.push({ type: 1, index: a, name: f[2], strings: h, ctor: f[1] === "." ? wt : f[1] === "?" ? kt : f[1] === "@" ? At : ne }), i.removeAttribute(m);
        } else m.startsWith(A) && (l.push({ type: 6, index: a }), i.removeAttribute(m));
        if (Qe.test(i.tagName)) {
          const m = i.textContent.split(A), $ = m.length - 1;
          if ($ > 0) {
            i.textContent = G ? G.emptyScript : "";
            for (let h = 0; h < $; h++) i.append(m[h], U()), O.nextNode(), l.push({ type: 2, index: ++a });
            i.append(m[$], U());
          }
        }
      } else if (i.nodeType === 8) if (i.data === Xe) l.push({ type: 2, index: a });
      else {
        let m = -1;
        for (; (m = i.data.indexOf(A, m + 1)) !== -1; ) l.push({ type: 7, index: a }), m += A.length - 1;
      }
      a++;
    }
  }
  static createElement(e, s) {
    const n = R.createElement("template");
    return n.innerHTML = e, n;
  }
}
function I(t, e, s = t, n) {
  if (e === N) return e;
  let i = n !== void 0 ? s._$Co?.[n] : s._$Cl;
  const a = B(e) ? void 0 : e._$litDirective$;
  return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(t), i._$AT(t, s, n)), n !== void 0 ? (s._$Co ??= [])[n] = i : s._$Cl = i), i !== void 0 && (e = I(t, i._$AS(t, e.values), i, n)), e;
}
class xt {
  constructor(e, s) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = s;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: s }, parts: n } = this._$AD, i = (e?.creationScope ?? R).importNode(s, !0);
    O.currentNode = i;
    let a = O.nextNode(), o = 0, r = 0, l = n[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let c;
        l.type === 2 ? c = new q(a, a.nextSibling, this, e) : l.type === 1 ? c = new l.ctor(a, l.name, l.strings, this, e) : l.type === 6 && (c = new zt(a, this, e)), this._$AV.push(c), l = n[++r];
      }
      o !== l?.index && (a = O.nextNode(), o++);
    }
    return O.currentNode = R, i;
  }
  p(e) {
    let s = 0;
    for (const n of this._$AV) n !== void 0 && (n.strings !== void 0 ? (n._$AI(e, n, s), s += n.strings.length - 2) : n._$AI(e[s])), s++;
  }
}
class q {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, s, n, i) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = e, this._$AB = s, this._$AM = n, this.options = i, this._$Cv = i?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const s = this._$AM;
    return s !== void 0 && e?.nodeType === 11 && (e = s.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, s = this) {
    e = I(this, e, s), B(e) ? e === u || e == null || e === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : e !== this._$AH && e !== N && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : bt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== u && B(this._$AH) ? this._$AA.nextSibling.data = e : this.T(R.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: n } = e, i = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = F.createElement(et(n.h, n.h[0]), this.options)), n);
    if (this._$AH?._$AD === i) this._$AH.p(s);
    else {
      const a = new xt(i, this), o = a.u(this.options);
      a.p(s), this.T(o), this._$AH = a;
    }
  }
  _$AC(e) {
    let s = De.get(e.strings);
    return s === void 0 && De.set(e.strings, s = new F(e)), s;
  }
  k(e) {
    me(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let n, i = 0;
    for (const a of e) i === s.length ? s.push(n = new q(this.O(U()), this.O(U()), this, this.options)) : n = s[i], n._$AI(a), i++;
    i < s.length && (this._$AR(n && n._$AB.nextSibling, i), s.length = i);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const n = Ae(e).nextSibling;
      Ae(e).remove(), e = n;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class ne {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, s, n, i, a) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = e, this.name = s, this._$AM = i, this.options = a, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(new String()), this.strings = n) : this._$AH = u;
  }
  _$AI(e, s = this, n, i) {
    const a = this.strings;
    let o = !1;
    if (a === void 0) e = I(this, e, s, 0), o = !B(e) || e !== this._$AH && e !== N, o && (this._$AH = e);
    else {
      const r = e;
      let l, c;
      for (e = a[0], l = 0; l < a.length - 1; l++) c = I(this, r[n + l], s, l), c === N && (c = this._$AH[l]), o ||= !B(c) || c !== this._$AH[l], c === u ? e = u : e !== u && (e += (c ?? "") + a[l + 1]), this._$AH[l] = c;
    }
    o && !i && this.j(e);
  }
  j(e) {
    e === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class wt extends ne {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === u ? void 0 : e;
  }
}
class kt extends ne {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== u);
  }
}
class At extends ne {
  constructor(e, s, n, i, a) {
    super(e, s, n, i, a), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = I(this, e, s, 0) ?? u) === N) return;
    const n = this._$AH, i = e === u && n !== u || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, a = e !== u && (n === u || i);
    i && this.element.removeEventListener(this.name, this, n), a && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class zt {
  constructor(e, s, n) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = n;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    I(this, e);
  }
}
const St = he.litHtmlPolyfillSupport;
St?.(F, q), (he.litHtmlVersions ??= []).push("3.3.3");
const Et = (t, e, s) => {
  const n = s?.renderBefore ?? e;
  let i = n._$litPart$;
  if (i === void 0) {
    const a = s?.renderBefore ?? null;
    n._$litPart$ = i = new q(e.insertBefore(U(), a), a, void 0, s ?? {});
  }
  return i._$AI(t), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const fe = globalThis;
class T extends P {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Et(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return N;
  }
}
T._$litElement$ = !0, T.finalized = !0, fe.litElementHydrateSupport?.({ LitElement: T });
const Ct = fe.litElementPolyfillSupport;
Ct?.({ LitElement: T });
(fe.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const tt = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ot = { attribute: !0, type: String, converter: J, reflect: !1, hasChanged: pe }, Dt = (t = Ot, e, s) => {
  const { kind: n, metadata: i } = s;
  let a = globalThis.litPropertyMetadata.get(i);
  if (a === void 0 && globalThis.litPropertyMetadata.set(i, a = /* @__PURE__ */ new Map()), n === "setter" && ((t = Object.create(t)).wrapped = !0), a.set(s.name, t), n === "accessor") {
    const { name: o } = s;
    return { set(r) {
      const l = e.get.call(this);
      e.set.call(this, r), this.requestUpdate(o, l, t, !0, r);
    }, init(r) {
      return r !== void 0 && this.C(o, void 0, t, r), r;
    } };
  }
  if (n === "setter") {
    const { name: o } = s;
    return function(r) {
      const l = this[o];
      e.call(this, r), this.requestUpdate(o, l, t, !0, r);
    };
  }
  throw Error("Unsupported decorator location: " + n);
};
function _e(t) {
  return (e, s) => typeof s == "object" ? Dt(t, e, s) : ((n, i, a) => {
    const o = i.hasOwnProperty(a);
    return i.constructor.createProperty(a, n), o ? Object.getOwnPropertyDescriptor(i, a) : void 0;
  })(t, e, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function y(t) {
  return _e({ ...t, state: !0, attribute: !1 });
}
const Rt = "0.1.0", st = "multizone-climate-scheduler-card", nt = "Multi-Zone Climate Scheduler Card";
function Re(t, e) {
  const s = t.states[e];
  if (!s || s.state === "unavailable" || s.state === "unknown")
    return {
      available: !1,
      mode: "unavailable",
      action: "",
      setpoint: null,
      targetLow: null,
      targetHigh: null,
      inside: null,
      humidity: null
    };
  const n = s.attributes, i = (a) => typeof a == "number" ? a : null;
  return {
    available: !0,
    mode: s.state,
    action: typeof n.hvac_action == "string" ? n.hvac_action : "",
    setpoint: i(n.temperature),
    targetLow: i(n.target_temp_low),
    targetHigh: i(n.target_temp_high),
    inside: i(n.current_temperature),
    humidity: i(n.current_humidity)
  };
}
function Mt(t, e) {
  return t.states[e]?.state === "active";
}
function C(t, e) {
  return t.states[e] !== void 0;
}
function Pt(t, e) {
  const s = t.states[e]?.attributes.hvac_modes;
  return Array.isArray(s) ? s.filter((n) => typeof n == "string") : [];
}
function Tt(t, e) {
  const s = t.states[e]?.attributes.preset_modes;
  return Array.isArray(s) && s.includes("eco");
}
function Me(t, e) {
  return t.states[e]?.attributes.preset_mode === "eco";
}
function ae(t, e) {
  const s = t.states[e];
  if (!s) return null;
  const n = Number(s.state);
  return Number.isFinite(n) ? n : null;
}
function Nt(t, e) {
  const s = t.states[e], n = typeof s?.attributes.friendly_name == "string" ? s.attributes.friendly_name.replace(/ (Temperature|temperature)$/, "") : e.split(".")[1] ?? e, i = s ? Number(s.state) : NaN;
  return { entityId: e, name: n, temp: Number.isFinite(i) ? i : null };
}
function It(t, e, s) {
  return t.callService("climate", "set_hvac_mode", { entity_id: e, hvac_mode: s });
}
function Lt(t, e, s) {
  return t.callService("climate", "set_preset_mode", {
    entity_id: e,
    preset_mode: s ? "eco" : "none"
  });
}
function Wt(t, e) {
  const s = t.states[e]?.attributes.fan_modes;
  return Array.isArray(s) && s.includes("on");
}
async function Ht(t, e, s, n) {
  Wt(t, e) && await t.callService("climate", "set_fan_mode", {
    entity_id: e,
    fan_mode: "on"
  });
  const i = String(n % 60).padStart(2, "0"), a = String(Math.floor(n / 60)).padStart(2, "0");
  await t.callService("timer", "start", {
    entity_id: s,
    duration: `${a}:${i}:00`
  });
}
function jt(t, e, s, n) {
  const i = typeof s == "number" ? s : null, a = typeof n == "number" ? n : null;
  return i != null && a != null && i < a && e != null && e >= i && e <= a ? Math.min(a, Math.max(i, t)) : t;
}
const it = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
async function Ut(t, e) {
  if (!t.callWS) return null;
  const s = e.split(".")[1];
  try {
    const i = (await t.callWS({ type: "schedule/list" })).find((o) => o.id === s);
    if (!i) return null;
    const a = {};
    for (const o of it) i[o] && (a[o] = i[o]);
    return { id: String(i.id), name: typeof i.name == "string" ? i.name : void 0, week: a };
  } catch {
    return null;
  }
}
function Bt(t, e, s, n) {
  if (!t.callWS) return Promise.reject(new Error("callWS unavailable"));
  const a = {
    type: "schedule/update",
    schedule_id: e.split(".")[1],
    name: n
  };
  for (const o of it) a[o] = s[o] ?? [];
  return t.callWS(a);
}
function Ft(t, e, s) {
  return t.callService("input_number", "set_value", { entity_id: e, value: s });
}
function qt(t, e, s) {
  return t.callService("input_select", "select_option", { entity_id: e, option: s });
}
async function Pe(t, e, s, n) {
  n && await t.callService("input_text", "set_value", { entity_id: s, value: "" }), await t.callService("input_boolean", n ? "turn_on" : "turn_off", {
    entity_id: e
  });
}
async function Te(t, e, s) {
  if (!t.callWS) return [];
  const n = /* @__PURE__ */ new Date();
  n.setHours(0, 0, 0, 0), n.setDate(n.getDate() - (s - 1));
  try {
    return ((await t.callWS({
      type: "recorder/statistics_during_period",
      start_time: n.toISOString(),
      statistic_ids: [e],
      period: "day",
      types: ["max"]
    }))?.[e] ?? []).filter((o) => typeof o.max == "number").map((o) => ({ day: o.start, hours: o.max }));
  } catch {
    return [];
  }
}
function Kt(t, e) {
  const s = [];
  for (const n of t) {
    if (typeof n.lu != "number") continue;
    const i = n.lu * 1e3;
    if (e) {
      const a = n.a?.[e];
      if (a == null) continue;
      s.push({ t: i, state: String(a) });
    } else typeof n.s == "string" && s.push({ t: i, state: n.s });
  }
  return s;
}
async function Ne(t, e, s, n, i) {
  if (!t.callWS) return [];
  try {
    const a = await t.callWS({
      type: "history/history_during_period",
      start_time: new Date(s).toISOString(),
      end_time: new Date(n).toISOString(),
      entity_ids: [e],
      minimal_response: !i,
      no_attributes: !i,
      significant_changes_only: !1
    });
    return Kt(a?.[e] ?? [], i);
  } catch {
    return [];
  }
}
function Ie(t) {
  return t instanceof Error ? t.message : t && typeof t == "object" && "message" in t ? String(t.message) : JSON.stringify(t);
}
async function Zt(t, e, s) {
  await t.callService("input_text", "set_value", {
    entity_id: e,
    value: ""
  }), await t.callService("automation", "trigger", {
    entity_id: s
  });
}
function Vt(t, e, s) {
  return t.callService("climate", "set_temperature", {
    entity_id: e,
    temperature: s
  });
}
function Yt(t, e, s, n = "on", i = 6e4) {
  const a = [...t].sort((p, m) => p.t - m.t), o = [];
  let r = "off";
  for (const p of a)
    if (p.t <= e) r = p.state;
    else break;
  let l = r === n ? e : null;
  for (const p of a) {
    if (p.t <= e || p.t >= s) continue;
    const m = p.state === n;
    m && l == null && (l = p.t), !m && l != null && (o.push({ start: l, end: p.t }), l = null);
  }
  l != null && o.push({ start: l, end: s });
  const c = [];
  for (const p of o) {
    const m = c[c.length - 1];
    m && p.start - m.end <= i ? m.end = p.end : c.push({ ...p });
  }
  return c;
}
function Jt(t) {
  const e = [...t].sort((n, i) => n.t - i.t), s = [];
  for (const n of e) {
    const i = Number(n.state);
    if (!Number.isFinite(i)) continue;
    const a = s[s.length - 1];
    (!a || a.value !== i) && s.push({ t: n.t, value: i });
  }
  return s;
}
function W(t) {
  if (!Number.isFinite(t) || t < 0) return "–";
  const e = Math.round(t * 4) / 4, s = Math.floor(e), n = e - s, i = n === 0.25 ? "¼" : n === 0.5 ? "½" : n === 0.75 ? "¾" : "";
  return s === 0 && i ? `${i} hr` : `${s}${i} hr`;
}
function Gt(t, e, s) {
  const n = s - e;
  return {
    left: (t.start - e) / n * 100,
    width: (t.end - t.start) / n * 100
  };
}
function Xt(t, e, s, n) {
  if (!Number.isFinite(e) || e <= 0)
    return { status: "learning", label: "learning" };
  if (n < 6)
    return { status: "pending", label: "" };
  const i = e * (Math.min(n, 24) / 24), a = i * (1 + s / 100);
  return t > a && t - i > 0.5 ? { status: "high", label: "running high for the weather" } : { status: "normal", label: "normal for the weather" };
}
const ge = {
  accent: "#1e88e5",
  accentBright: "#42a5f5",
  good: "#2bb673",
  warn: "#f59e0b",
  bad: "#e5484d",
  bg: "#1c262e",
  surface: "#243039",
  chip: "#2b3844",
  track: "#16202a",
  border: "#3d4a55",
  text: "#e8edf1",
  textDim: "#9fb0bd"
}, le = {
  "nest-blue": { label: "Nest Blue", tokens: ge },
  ember: {
    label: "Ember",
    tokens: {
      accent: "#f4511e",
      accentBright: "#ff7043",
      good: "#66bb6a",
      warn: "#ffb300",
      bad: "#d32f2f",
      bg: "#241c18",
      surface: "#2f2521",
      chip: "#3a2d27",
      track: "#1a1310",
      border: "#54413a",
      text: "#f2e9e4",
      textDim: "#b8a69b"
    }
  },
  forest: {
    label: "Forest",
    tokens: {
      accent: "#43a047",
      accentBright: "#66bb6a",
      good: "#9ccc65",
      warn: "#ffa000",
      bad: "#e53935",
      bg: "#18211b",
      surface: "#212d25",
      chip: "#2a382e",
      track: "#111813",
      border: "#3d4f43",
      text: "#e6efe8",
      textDim: "#9fb3a5"
    }
  },
  orchid: {
    label: "Orchid",
    tokens: {
      accent: "#7e57c2",
      accentBright: "#9575cd",
      good: "#26a69a",
      warn: "#ffb300",
      bad: "#ec407a",
      bg: "#1f1b2a",
      surface: "#292336",
      chip: "#342c44",
      track: "#161221",
      border: "#4a4060",
      text: "#eae6f2",
      textDim: "#a89fbd"
    }
  },
  "ha-default": {
    label: "HA Default",
    tokens: {
      accent: "var(--primary-color, #03a9f4)",
      accentBright: "var(--light-primary-color, var(--primary-color, #03a9f4))",
      good: "var(--success-color, #2bb673)",
      warn: "var(--warning-color, #f59e0b)",
      bad: "var(--error-color, #e5484d)",
      bg: "var(--ha-card-background, var(--card-background-color, #fff))",
      surface: "var(--secondary-background-color, #f0f0f0)",
      chip: "var(--secondary-background-color, #f0f0f0)",
      track: "var(--divider-color, #e0e0e0)",
      border: "var(--divider-color, #e0e0e0)",
      text: "var(--primary-text-color, #212121)",
      textDim: "var(--secondary-text-color, #727272)"
    }
  }
}, Le = "nest-blue", ce = /^#[0-9a-f]{6}$/i, X = [
  "accent",
  "accentBright",
  "good",
  "warn",
  "bad",
  "bg",
  "surface",
  "chip",
  "track",
  "border",
  "text",
  "textDim"
];
function We(t) {
  return `custom:${X.map((e) => t[e]).join(",")}`;
}
function Qt(t) {
  return X.every((s) => ce.test(t[s])) ? { ...t } : { ...ge };
}
function He(t) {
  const e = { presetKey: Le, tokens: le[Le].tokens };
  if (!t) return e;
  const s = le[t];
  if (s) return { presetKey: t, tokens: s.tokens };
  if (t.startsWith("custom:")) {
    const n = t.slice(7).split(",");
    if (n.length === 5 && n.every((i) => ce.test(i.trim()))) {
      const [i, a, o, r, l] = n.map((c) => c.trim().toLowerCase());
      return {
        presetKey: "custom",
        tokens: { ...ge, accent: i, accentBright: a, good: o, warn: r, bad: l }
      };
    }
    if (n.length === X.length && n.every((i) => ce.test(i.trim())))
      return { presetKey: "custom", tokens: Object.fromEntries(
        X.map((a, o) => [a, n[o].trim().toLowerCase()])
      ) };
  }
  return e;
}
const D = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
], es = ["monday", "tuesday", "wednesday", "thursday", "friday"], ts = ["saturday", "sunday"];
function ss(t) {
  const e = [];
  t.length === 0 && e.push("A day needs at least one block.");
  const s = /* @__PURE__ */ new Set();
  for (const n of t)
    /^([01]\d|2[0-3]):[0-5]\d$/.test(n.time) || e.push(`Bad time "${n.time}".`), s.has(n.time) && e.push(`Duplicate block time ${n.time}.`), s.add(n.time), n.mode === "cool" && n.cool_temp == null && e.push(`${n.name}: cool needs cool_temp.`), n.mode === "heat" && n.heat_temp == null && e.push(`${n.name}: heat needs heat_temp.`), n.mode === "heat_cool" && (n.cool_temp == null || n.heat_temp == null) && e.push(`${n.name}: heat_cool needs both cool_temp and heat_temp.`), n.cool_temp != null && n.heat_temp != null && n.heat_temp >= n.cool_temp && e.push(`${n.name}: heat_temp must be below cool_temp.`);
  return e;
}
function oe(t) {
  return {
    block: t.name,
    mode: t.mode,
    ...t.cool_temp != null ? { cool_temp: t.cool_temp } : {},
    ...t.heat_temp != null ? { heat_temp: t.heat_temp } : {}
  };
}
function ns(t) {
  const e = ss(t);
  if (e.length > 0) throw new Error(e.join(" "));
  const s = [...t].sort((o, r) => o.time.localeCompare(r.time)), n = s[0], i = s[s.length - 1];
  if (s.length === 1)
    return [{ from: "00:00:00", to: "24:00:00", data: oe(n) }];
  const a = [];
  n.time !== "00:00" && a.push({ from: "00:00:00", to: `${n.time}:00`, data: oe(i) });
  for (let o = 0; o < s.length; o++) {
    const r = s[o], l = s[o + 1];
    a.push({
      from: `${r.time}:00`,
      to: l ? `${l.time}:00` : "24:00:00",
      data: oe(r)
    });
  }
  return a;
}
function is(t, e) {
  if (t === "all" && e === "all") return D;
  if (t === "wdwe" && e === "wd") return es;
  if (t === "wdwe" && e === "we") return ts;
  if (t === "days" && D.includes(e.toLowerCase()))
    return [e.toLowerCase()];
  throw new Error(`Unknown set "${e}" for granularity "${t}".`);
}
function as(t, e) {
  const s = {};
  for (const [n, i] of Object.entries(e)) {
    const a = ns(i);
    for (const o of is(t, n))
      s[o] = a;
  }
  for (const n of D)
    if (!s[n]) throw new Error(`No block set covers ${n}.`);
  return s;
}
function Q(t) {
  const e = t.data;
  return {
    time: t.from.slice(0, 5),
    name: e.block ?? "?",
    mode: e.mode ?? "cool",
    cool_temp: e.cool_temp ?? null,
    heat_temp: e.heat_temp ?? null
  };
}
function os(t, e) {
  const s = Q(t), n = Q(e);
  return s.name === n.name && s.mode === n.mode && s.cool_temp === n.cool_temp && s.heat_temp === n.heat_temp;
}
function ye(t) {
  if (t.length === 0) return [];
  const e = [...t].sort((o, r) => o.from.localeCompare(r.from)), s = e[0], n = e[e.length - 1];
  return (e.length > 1 && s.from === "00:00:00" && os(s, n) ? e.slice(1) : e).map(Q);
}
function H(t) {
  return JSON.stringify(
    [...t].sort((e, s) => e.from.localeCompare(s.from)).map((e) => [e.from, e.to, Q(e)])
  );
}
const je = ["monday", "tuesday", "wednesday", "thursday", "friday"], Ue = ["saturday", "sunday"];
function rs(t) {
  const e = D.map((a) => H(t[a] ?? []));
  if (e.every((a) => a === e[0])) return { granularity: "all", sets: { all: [...D] } };
  const n = je.every((a) => H(t[a] ?? []) === H(t.monday ?? [])), i = Ue.every((a) => H(t[a] ?? []) === H(t.saturday ?? []));
  return n && i ? { granularity: "wdwe", sets: { wd: [...je], we: [...Ue] } } : {
    granularity: "days",
    sets: Object.fromEntries(D.map((a) => [a, [a]]))
  };
}
const ls = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];
function cs(t) {
  return `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
}
function ds(t, e) {
  for (let s = 0; s < 8; s++) {
    const n = new Date(e.getTime() + s * 864e5), i = ls[n.getDay()], a = ye(t[i] ?? []);
    for (const o of a) {
      if (s === 0 && o.time <= cs(e)) continue;
      const [r, l] = o.time.split(":").map(Number), c = new Date(n);
      c.setHours(r ?? 0, l ?? 0, 0, 0);
      const p = Math.round((c.getTime() - e.getTime()) / 6e4);
      if (!(p <= 0))
        return { ...o, day: i, minutesUntil: p };
    }
  }
  return null;
}
function us(t, e, s, n) {
  const i = {};
  for (const a of D) {
    const o = t[a];
    if (!o) continue;
    if (!e.includes(a)) {
      i[a] = o;
      continue;
    }
    const r = ye(o).map(
      (l) => l.time === s ? { ...l, ...n } : l
    );
    i[a] = ps(r);
  }
  return i;
}
function ps(t) {
  const e = [...t].sort((o, r) => o.time.localeCompare(r.time));
  if (e.length === 0) return [];
  const s = e[0], n = e[e.length - 1], i = (o) => ({
    block: o.name,
    mode: o.mode,
    ...o.cool_temp != null ? { cool_temp: o.cool_temp } : {},
    ...o.heat_temp != null ? { heat_temp: o.heat_temp } : {}
  });
  if (e.length === 1) return [{ from: "00:00:00", to: "24:00:00", data: i(s) }];
  const a = [];
  s.time !== "00:00" && a.push({ from: "00:00:00", to: `${s.time}:00`, data: i(n) });
  for (let o = 0; o < e.length; o++) {
    const r = e[o], l = e[o + 1];
    a.push({
      from: `${r.time}:00`,
      to: l ? `${l.time}:00` : "24:00:00",
      data: i(r)
    });
  }
  return a;
}
const be = {
  fan_timer: { domain: "timer", suffix: "fan" },
  room_override_timer: { domain: "timer", suffix: "room_override" },
  running_sensor: { domain: "binary_sensor", suffix: "running" },
  runtime_today: { domain: "sensor", suffix: "runtime_today" },
  expected_runtime: { domain: "sensor", suffix: "expected_runtime" },
  target_room_select: { domain: "input_select", suffix: "target_room" },
  sensor_schedule: { domain: "schedule", suffix: "sensor_schedule" },
  applied_block_marker: { domain: "input_text", suffix: "applied_block" },
  zone_enabled: { domain: "input_boolean", suffix: "enabled" },
  k_factor: { domain: "input_number", suffix: "k" }
}, $e = {
  season_select: { domain: "input_select", suffix: "season" },
  season_mode: { domain: "input_select", suffix: "season_mode" },
  season_confirm_days: { domain: "input_number", suffix: "season_confirm_days" },
  season_dwell_days: { domain: "input_number", suffix: "season_dwell_days" },
  dev_green_max: { domain: "input_number", suffix: "dev_green_max" },
  dev_amber_max: { domain: "input_number", suffix: "dev_amber_max" },
  runtime_alert_margin: { domain: "input_number", suffix: "runtime_alert_margin" },
  runtime_alert_days: { domain: "input_number", suffix: "runtime_alert_days" },
  runtime_learn_days: { domain: "input_number", suffix: "runtime_learn_days" },
  cdd_base: { domain: "input_number", suffix: "cdd_base" },
  override_minutes: { domain: "input_number", suffix: "override_minutes" },
  steer_min_setpoint: { domain: "input_number", suffix: "steer_min_setpoint" },
  steer_max_setpoint: { domain: "input_number", suffix: "steer_max_setpoint" },
  steer_max_offset: { domain: "input_number", suffix: "steer_max_offset" },
  next_block_sensor: { domain: "sensor", suffix: "next_block" },
  theme: { domain: "input_text", suffix: "theme" }
};
[
  ...Object.values(be).map((t) => t.suffix),
  ...Object.values($e).map((t) => t.suffix)
];
function k(t) {
  return t.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function _(t, e, s) {
  const n = be[t];
  return `${n.domain}.${e}_${s}_${n.suffix}`;
}
function at(t, e, s) {
  return `schedule.${t}_${e}_${s}`;
}
function v(t, e) {
  const s = $e[t];
  return `${s.domain}.${e}_${s.suffix}`;
}
function M(t, e) {
  return `${t}_mzcs_${e}`;
}
function z(t, e) {
  return {
    engine: "Climate: schedule engine",
    fan_timer: `Climate: ${e ?? "?"} fan timer finished`,
    season_recommender: "Climate: season recommender",
    runtime_alert: "Climate: runtime anomaly alert",
    runtime_learning: "Climate: runtime learning",
    watchdog: "Climate: engine watchdog",
    steering: "Climate: comfort steering"
  }[t] ?? `Climate: ${t}`;
}
function hs(t, e, s, n) {
  const i = t.indexOf(".");
  if (i < 0) return null;
  const a = t.slice(0, i), o = t.slice(i + 1);
  if (o !== e && !o.startsWith(`${e}_`)) return null;
  const r = o.slice(e.length + 1);
  for (const [c, p] of Object.entries($e))
    if (a === p.domain && r === p.suffix) return { cls: c };
  const l = [...s].sort((c, p) => p.length - c.length);
  for (const c of l) {
    if (r !== c && !r.startsWith(`${c}_`)) continue;
    const p = r.slice(c.length + 1);
    for (const [m, $] of Object.entries(be))
      if (a === $.domain && p === $.suffix) return { cls: m, zone: c };
    if (a === "schedule" && n.includes(p))
      return { cls: "zone_schedule", zone: c, season: p };
  }
  return null;
}
const ot = 2, rt = 4;
function ms(t, e = ot, s = rt) {
  const n = Math.abs(t);
  return n <= e ? "green" : n <= s ? "amber" : "red";
}
function fs(t) {
  const e = Math.round(t);
  return `${e > 0 ? "+" : ""}${e}°`;
}
function _s(t, e) {
  let s = t != null && t > 0 ? t : ot, n = e != null && e > 0 ? e : rt;
  return n <= s && (n = s + 1), { greenMax: s, amberMax: n };
}
const gs = "mzcs", Be = "r1", ys = [
  { cls: "season_confirm_days", min: 1, max: 14, step: 1, initial: 3 },
  { cls: "season_dwell_days", min: 1, max: 60, step: 1, initial: 14 },
  { cls: "dev_green_max", min: 1, max: 10, step: 1, initial: 2, unit: "°F" },
  { cls: "dev_amber_max", min: 1, max: 15, step: 1, initial: 4, unit: "°F" },
  { cls: "runtime_alert_margin", min: 5, max: 100, step: 5, initial: 35, unit: "%" },
  { cls: "runtime_alert_days", min: 1, max: 7, step: 1, initial: 3 },
  { cls: "runtime_learn_days", min: 7, max: 60, step: 1, initial: 30 },
  { cls: "cdd_base", min: 60, max: 80, step: 1, initial: 75, unit: "°F" }
], bs = [
  { cls: "override_minutes", min: 15, max: 240, step: 15, initial: 60 },
  { cls: "steer_min_setpoint", min: 50, max: 80, step: 1, initial: 68 },
  { cls: "steer_max_setpoint", min: 70, max: 95, step: 1, initial: 85 },
  { cls: "steer_max_offset", min: 1, max: 10, step: 1, initial: 5 }
];
function $s(t) {
  return as(t.granularity, t.sets);
}
function Fe(t) {
  const e = [], s = t.prefix;
  for (const i of t.zones) {
    t.features.fan_timer && e.push({
      id: _("fan_timer", s, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} fan`, restore: !0 }
    }), e.push({
      id: _("running_sensor", s, i.slug),
      kind: "template_sensor",
      spec: { name: `Climate ${i.name} running`, source: "hvac_action" }
    }), e.push({
      id: _("runtime_today", s, i.slug),
      kind: "stats_sensor",
      spec: { name: `Climate ${i.name} runtime today`, state_class: "total_increasing" }
    }), e.push({
      id: _("expected_runtime", s, i.slug),
      kind: "template_sensor",
      spec: { name: `Climate ${i.name} expected runtime`, model: "k_x_cdd" }
    }), e.push({
      id: _("applied_block_marker", s, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} applied block` }
    }), e.push({
      id: _("zone_enabled", s, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} enabled` }
    }), e.push({
      id: _("k_factor", s, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} K`, min: 0, max: 10, step: 0.01 }
    }), t.features.steering && (e.push({
      id: _("target_room_select", s, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} target room`, options: ["Thermostat"] }
    }), e.push({
      id: _("room_override_timer", s, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} room override`, restore: !0 }
    }), e.push({
      id: _("sensor_schedule", s, i.slug),
      kind: "schedule",
      spec: { name: `Climate ${i.name} sensor schedule` }
    }));
    for (const a of t.seasons) {
      const o = t.schedules[i.slug]?.[a.key];
      if (!o) throw new Error(`Missing schedule for ${i.slug}/${a.key}.`);
      e.push({
        id: at(s, i.slug, a.key),
        kind: "schedule",
        spec: { name: `Climate ${i.name} ${a.name}`, week: $s(o) }
      });
    }
  }
  e.push({
    id: v("season_select", s),
    kind: "helper",
    spec: { name: "Climate season", options: t.seasons.map((i) => i.name) }
  }), e.push({
    id: v("season_mode", s),
    kind: "helper",
    spec: { name: "Climate season mode", options: ["Manual", "Semi-auto", "Full-auto"] }
  });
  for (const i of ys)
    e.push({
      id: v(i.cls, s),
      kind: "helper",
      spec: {
        name: `Climate ${i.cls.replace(/_/g, " ")}`,
        min: i.min,
        max: i.max,
        step: i.step,
        initial: i.initial,
        ...i.unit ? { unit: i.unit } : {}
      }
    });
  if (t.features.steering)
    for (const i of bs)
      e.push({
        id: v(i.cls, s),
        kind: "helper",
        spec: { min: i.min, max: i.max, step: i.step, initial: i.initial }
      });
  e.push({
    id: v("next_block_sensor", s),
    kind: "template_sensor",
    spec: { name: "Climate next block" }
  }), e.push({
    id: v("theme", s),
    kind: "helper",
    spec: { name: "Climate theme" }
  });
  const n = (i, a) => ({
    id: `automation:${M(s, i)}`,
    kind: "automation",
    spec: { alias: z(i, a), revision: Be }
  });
  if (e.push(n("engine")), e.push(n("watchdog")), e.push(n("runtime_learning")), t.features.anomaly_alerts && e.push(n("runtime_alert")), t.features.fan_timer)
    for (const i of t.zones)
      e.push({
        id: `automation:${M(s, `fan_timer_${i.slug}`)}`,
        kind: "automation",
        spec: { alias: z("fan_timer", i.name), revision: Be }
      });
  return t.features.steering && e.push(n("steering")), e;
}
function vs(t, e) {
  return ee(t) === ee(e);
}
function ee(t) {
  if (Array.isArray(t)) return `[${t.map(ee).join(",")}]`;
  if (t !== null && typeof t == "object") {
    const e = t;
    return `{${Object.keys(e).sort().map((s) => `${JSON.stringify(s)}:${ee(e[s])}`).join(",")}}`;
  }
  return JSON.stringify(t);
}
function qe(t, e) {
  const s = { create: [], adopt: [], update: [], delete: [], noop: [] }, n = new Map(e.map((a) => [a.id, a])), i = new Set(t.map((a) => a.id));
  for (const a of t) {
    const o = n.get(a.id);
    o ? o.managed ? vs(o.spec, a.spec) ? s.noop.push({ op: "noop", id: a.id, kind: a.kind }) : s.update.push({ op: "update", id: a.id, kind: a.kind, spec: a.spec, from: o.spec }) : s.adopt.push({ op: "adopt", id: a.id, kind: a.kind, spec: a.spec }) : s.create.push({ op: "create", id: a.id, kind: a.kind, spec: a.spec });
  }
  for (const a of e)
    a.managed && !i.has(a.id) && s.delete.push({ op: "delete", id: a.id, kind: a.kind });
  return s;
}
function xs(t) {
  return [...t.create, ...t.adopt, ...t.update, ...t.delete];
}
function ws(t) {
  const e = t.default_mode;
  return { granularity: "all", sets: { all: [{
    time: "06:00",
    name: "Day",
    mode: e,
    cool_temp: e === "heat" ? null : e === "heat_cool" ? 84 : 78,
    heat_temp: e === "heat" ? 68 : e === "heat_cool" ? 66 : null
  }] } };
}
function ks(t, e) {
  const s = {};
  for (const n of t) {
    s[n] = {};
    for (const i of e) s[n][i.key] = ws(i);
  }
  return s;
}
const As = {
  fan_timer: "helper",
  room_override_timer: "helper",
  target_room_select: "helper",
  applied_block_marker: "helper",
  zone_enabled: "helper",
  theme: "helper",
  k_factor: "helper",
  season_select: "helper",
  season_mode: "helper",
  season_confirm_days: "helper",
  season_dwell_days: "helper",
  dev_green_max: "helper",
  dev_amber_max: "helper",
  runtime_alert_margin: "helper",
  runtime_alert_days: "helper",
  runtime_learn_days: "helper",
  cdd_base: "helper",
  override_minutes: "helper",
  steer_min_setpoint: "helper",
  steer_max_setpoint: "helper",
  steer_max_offset: "helper",
  running_sensor: "template_sensor",
  expected_runtime: "template_sensor",
  next_block_sensor: "template_sensor",
  runtime_today: "stats_sensor",
  zone_schedule: "schedule",
  sensor_schedule: "schedule"
};
async function V(t, e) {
  if (!t.callWS) return [];
  try {
    const s = await t.callWS({ type: `${e}/list` });
    return Array.isArray(s) ? s : [];
  } catch {
    return [];
  }
}
async function zs(t, e) {
  const s = /* @__PURE__ */ new Map();
  if (!t.callWS || e.length === 0) return s;
  try {
    const n = await t.callWS({
      type: "config/entity_registry/get_entries",
      entity_ids: e
    });
    for (const [i, a] of Object.entries(n ?? {}))
      a?.labels && s.set(i, a.labels);
  } catch {
  }
  return s;
}
async function Ke(t, e, s, n) {
  const i = [];
  for (const h of Object.keys(t.states)) {
    const f = hs(h, e, s, n);
    if (!f) continue;
    const x = As[f.cls];
    x && i.push({ id: h, kind: x });
  }
  const [a, o, r, l, c] = await Promise.all([
    V(t, "timer"),
    V(t, "input_select"),
    V(t, "input_number"),
    V(t, "schedule"),
    zs(
      t,
      i.map((h) => h.id)
    )
  ]), p = (h, f) => {
    const x = /* @__PURE__ */ new Map();
    for (const w of h) w.id && x.set(`${f}.${w.id}`, w);
    return x;
  }, m = new Map([
    ...p(a, "timer"),
    ...p(o, "input_select"),
    ...p(r, "input_number"),
    ...p(l, "schedule")
  ]), $ = [];
  for (const h of i) {
    const f = m.get(h.id), x = t.states[h.id];
    let w = {};
    h.id.startsWith("input_number.") && f ? w = { min: f.min, max: f.max, step: f.step } : h.id.startsWith("input_select.") && f ? w = { name: f.name, options: f.options } : h.id.startsWith("timer.") && f ? w = { name: f.name, restore: f.restore ?? !1 } : h.id.startsWith("schedule.") && f ? w = { name: f.name, raw: !0 } : x && (w = { name: x.attributes.friendly_name ?? h.id }), $.push({
      id: h.id,
      kind: h.kind,
      spec: w,
      managed: (c.get(h.id) ?? []).includes(gs)
    });
  }
  for (const [h, f] of Object.entries(t.states)) {
    if (!h.startsWith("automation.") || !f) continue;
    const x = f.attributes.id;
    typeof x == "string" && x.startsWith(`${e}_mzcs_`) && $.push({
      id: `automation:${x}`,
      kind: "automation",
      spec: { alias: f.attributes.friendly_name ?? x, revision: "unknown" },
      managed: !0
    });
  }
  return $;
}
const K = "Managed by Multi-Zone Climate Scheduler Card (mzcs).";
function Ss(t, e, s) {
  const n = e.flatMap((a) => s.map((o) => at(t, a.slug, o.key))), i = e.map((a) => _("zone_enabled", t, a.slug));
  return {
    id: M(t, "engine"),
    alias: z("engine"),
    description: `${K} Applies the active season's schedule block to each ENABLED zone at block transitions. Per-zone applied-block markers mean manual changes and external raises HOLD until the next block; the 15-minute tick only recovers missed transitions. Zones stand down while their Eco preset is active. heat_cool blocks apply dual setpoints.`,
    mode: "queued",
    max: 5,
    triggers: [
      { trigger: "state", entity_id: n, alias: "Any zone schedule changed" },
      { trigger: "homeassistant", event: "start", alias: "HA started" },
      { trigger: "time_pattern", minutes: "/15", alias: "Safety tick" },
      { trigger: "state", entity_id: v("season_select", t), alias: "Season changed" },
      { trigger: "state", entity_id: i, to: "on", alias: "Zone re-enabled" }
    ],
    conditions: [],
    actions: [
      {
        alias: "Resolve the active season key",
        variables: { season: `{{ states('${v("season_select", t)}') | lower }}` }
      },
      {
        alias: "Apply per zone",
        repeat: {
          for_each: e.map((a) => ({
            zone: a.slug,
            climate: a.climate,
            marker: _("applied_block_marker", t, a.slug),
            enabled: _("zone_enabled", t, a.slug)
          })),
          sequence: [
            {
              alias: "Read this zone's active block",
              variables: {
                blk: `{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'block') }}`,
                blk_mode: `{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'mode') }}`,
                blk_cool: `{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'cool_temp') }}`,
                blk_heat: `{{ state_attr('schedule.${t}_' ~ repeat.item.zone ~ '_' ~ season, 'heat_temp') }}`
              }
            },
            {
              alias: "Skip when zone disabled, already applied, Eco active, or no block data",
              condition: "template",
              value_template: "{{ is_state(repeat.item.enabled, 'on') and blk is not none and blk != states(repeat.item.marker) and state_attr(repeat.item.climate, 'preset_mode') != 'eco' }}"
            },
            {
              alias: "Apply dual setpoints for heat_cool, single target otherwise",
              choose: [
                {
                  conditions: [{ condition: "template", value_template: "{{ blk_mode == 'heat_cool' }}" }],
                  sequence: [
                    {
                      alias: "Apply heat_cool range",
                      action: "climate.set_temperature",
                      target: { entity_id: "{{ repeat.item.climate }}" },
                      data: { target_temp_high: "{{ blk_cool }}", target_temp_low: "{{ blk_heat }}", hvac_mode: "heat_cool" }
                    }
                  ]
                }
              ],
              default: [
                {
                  alias: "Apply single target",
                  action: "climate.set_temperature",
                  target: { entity_id: "{{ repeat.item.climate }}" },
                  data: {
                    temperature: "{{ blk_cool if blk_cool is not none else blk_heat }}",
                    hvac_mode: "{{ blk_mode }}"
                  }
                }
              ]
            },
            {
              alias: "Record the applied block",
              action: "input_text.set_value",
              target: { entity_id: "{{ repeat.item.marker }}" },
              data: { value: "{{ blk }}" }
            }
          ]
        }
      }
    ]
  };
}
function Es(t, e) {
  return {
    id: M(t, `fan_timer_${e.slug}`),
    alias: z("fan_timer", e.name),
    description: `${K} Turns the ${e.name} fan off when its fan timer ends.`,
    mode: "single",
    triggers: [
      {
        trigger: "event",
        event_type: "timer.finished",
        event_data: { entity_id: _("fan_timer", t, e.slug) },
        alias: `${e.name} fan timer finished`
      }
    ],
    conditions: [],
    actions: [
      {
        alias: `Turn the ${e.name} fan off`,
        action: "climate.set_fan_mode",
        target: { entity_id: e.climate },
        data: { fan_mode: "off" }
      }
    ]
  };
}
function Cs(t, e) {
  return {
    id: M(t, "runtime_learning"),
    alias: z("runtime_learning"),
    description: `${K} Nightly EMA update of each zone's runtime-per-cooling-degree-day factor. Skips mild days; first valid day seeds directly.`,
    mode: "single",
    triggers: [{ trigger: "time", at: "23:58:00", alias: "Nightly close" }],
    conditions: [],
    actions: [
      {
        alias: "Compute today's cooling degree-days",
        variables: {
          cdd: `{{ [ (states('sensor.${t}_outdoor_daily_mean') | float(0)) - (states('${v("cdd_base", t)}') | float(75)), 0 ] | max }}`,
          alpha: `{{ 2 / ((states('${v("runtime_learn_days", t)}') | float(30)) + 1) }}`
        }
      },
      { alias: "Skip mild days", condition: "template", value_template: "{{ cdd > 0.5 }}" },
      {
        alias: "Update k per zone",
        repeat: {
          for_each: e.map((s) => ({
            runtime: _("runtime_today", t, s.slug),
            k: _("k_factor", t, s.slug)
          })),
          sequence: [
            {
              alias: "Compute the EMA",
              variables: {
                runtime_h: "{{ states(repeat.item.runtime) | float(-1) }}",
                old_k: "{{ states(repeat.item.k) | float(0) }}"
              }
            },
            { alias: "Skip if unavailable", condition: "template", value_template: "{{ runtime_h >= 0 }}" },
            {
              alias: "Write the new k",
              action: "input_number.set_value",
              target: { entity_id: "{{ repeat.item.k }}" },
              data: {
                value: "{{ ((runtime_h / cdd) if old_k == 0 else (alpha * (runtime_h / cdd) + (1 - alpha) * old_k)) | round(2) }}"
              }
            }
          ]
        }
      }
    ]
  };
}
function Os(t) {
  const e = "automation." + z("engine").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return {
    id: M(t, "watchdog"),
    alias: z("watchdog"),
    description: `${K} Alerts when the schedule engine automation is off or unavailable for 5 minutes while any zone is enabled.`,
    mode: "single",
    triggers: [
      { trigger: "state", entity_id: e, to: ["off", "unavailable"], for: { minutes: 5 }, alias: "Engine down" }
    ],
    conditions: [],
    actions: [
      {
        alias: "Notify all admins via persistent notification",
        action: "persistent_notification.create",
        data: {
          title: "Climate schedule engine is down",
          message: "The Climate: schedule engine automation is off or unavailable. Zone schedules are not being applied - your thermostats hold their last setpoints (their own app schedules still work)."
        }
      }
    ]
  };
}
function Ds(t, e) {
  return {
    id: M(t, "runtime_alert"),
    alias: z("runtime_alert"),
    description: `${K} Evening check: notifies when a zone's runtime is over the weather-normalized expectation by the alert margin. Uses learned k; silent while learning.`,
    mode: "single",
    triggers: [{ trigger: "time", at: "20:00:00", alias: "Evening check" }],
    conditions: [],
    actions: [
      {
        alias: "Check each zone",
        repeat: {
          for_each: e.map((s) => ({
            name: s.name,
            runtime: _("runtime_today", t, s.slug),
            expected: _("expected_runtime", t, s.slug)
          })),
          sequence: [
            {
              alias: "Compute exceedance",
              variables: {
                run_h: "{{ states(repeat.item.runtime) | float(0) }}",
                exp_h: "{{ states(repeat.item.expected) | float(0) }}",
                margin: `{{ states('${v("runtime_alert_margin", t)}') | float(35) }}`
              }
            },
            {
              alias: "Only alert on a real, learned exceedance",
              condition: "template",
              value_template: "{{ exp_h > 0 and run_h > exp_h * (1 + margin / 100) and (run_h - exp_h) > 1 }}"
            },
            {
              alias: "Notify",
              action: "persistent_notification.create",
              data: {
                title: "HVAC running high",
                message: "{{ repeat.item.name }} has run {{ run_h | round(1) }}h today vs ~{{ exp_h | round(1) }}h expected for this weather. Worth a look (filters, doors, refrigerant)."
              }
            }
          ]
        }
      }
    ]
  };
}
const Rs = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
function te(t) {
  const e = t.indexOf(".");
  return { domain: t.slice(0, e), objectId: t.slice(e + 1) };
}
async function Ms(t, e) {
  try {
    await t.callWS({ type: "config/label_registry/create", name: "mzcs", color: "blue", icon: "mdi:thermostat-box" }), e.log("Created label mzcs");
  } catch {
  }
}
async function Ze(t, e) {
  try {
    const n = (await t.callWS({
      type: "config/entity_registry/get_entries",
      entity_ids: [e]
    }))?.[e]?.labels ?? [];
    n.includes("mzcs") || await t.callWS({
      type: "config/entity_registry/update",
      entity_id: e,
      labels: [...n, "mzcs"]
    });
  } catch {
  }
}
async function Ve(t, e, s, n) {
  if (!t.callApi) throw new Error("callApi unavailable");
  let i = await t.callApi("POST", "config/config_entries/flow", {
    handler: e,
    show_advanced_options: !0
  });
  const a = { ...n };
  for (let o = 0; o < 8; o++) {
    if (i.type === "create_entry") return i.result?.entry_id ?? "";
    if (i.type === "menu") {
      if (!s) throw new Error(`Flow ${e}: unexpected menu`);
      i = await t.callApi("POST", `config/config_entries/flow/${i.flow_id}`, {
        next_step_id: s
      });
      continue;
    }
    if (i.type === "form") {
      const r = (i.data_schema ?? []).map((c) => c.name), l = {};
      for (const c of r)
        c in a && (l[c] = a[c], delete a[c]);
      i = await t.callApi("POST", `config/config_entries/flow/${i.flow_id}`, l);
      continue;
    }
    throw new Error(`Flow ${e}: unhandled step type ${i.type}`);
  }
  throw new Error(`Flow ${e}: did not complete`);
}
function Ps(t, e, s) {
  const { objectId: n } = te(t), i = String(e.name ?? n);
  if (t.startsWith("binary_sensor.") && e.source === "hvac_action") {
    const a = s.zones.find((o) => n.includes(o.slug));
    return a ? {
      handler: "template",
      menu: "binary_sensor",
      fields: {
        name: i,
        state: `{{ state_attr('${a.climate}', 'hvac_action') in ['cooling', 'heating'] }}`,
        device_class: "running"
      }
    } : null;
  }
  if (t.startsWith("sensor.") && e.model === "k_x_cdd") {
    const a = s.zones.find((r) => n.includes(r.slug));
    if (!a) return null;
    const o = s.prefix;
    return {
      handler: "template",
      menu: "sensor",
      fields: {
        name: i,
        state: `{{ (states('input_number.${o}_${a.slug}_k') | float(0)) * ([ (states('sensor.${o}_outdoor_daily_mean') | float(0)) - (states('input_number.${o}_cdd_base') | float(75)), 0 ] | max) | round(2) }}`,
        unit_of_measurement: "h",
        state_class: "measurement"
      }
    };
  }
  if (t === `sensor.${s.prefix}_next_block`) {
    const a = s.prefix, o = s.zones.map((r) => `state_attr('schedule.${a}_${r.slug}_' ~ season, 'next_event')`).join(", ");
    return {
      handler: "template",
      menu: "sensor",
      fields: {
        name: i,
        state: `{% set season = states('input_select.${a}_season') | lower %}{% set evs = [${o}] | reject('none') | list %}{{ evs | min if evs | count > 0 else 'unknown' }}`
      }
    };
  }
  return null;
}
function Ts(t, e) {
  const s = e.prefix;
  if (t === `${s}_mzcs_engine`) return Ss(s, e.zones, e.seasons);
  if (t === `${s}_mzcs_watchdog`) return Os(s);
  if (t === `${s}_mzcs_runtime_learning`) return Cs(s, e.zones);
  if (t === `${s}_mzcs_runtime_alert`) return Ds(s, e.zones);
  const n = t.match(new RegExp(`^${s}_mzcs_fan_timer_(.+)$`));
  if (n) {
    const i = e.zones.find((a) => a.slug === n[1]);
    return i ? Es(s, i) : null;
  }
  return null;
}
async function Ns(t, e, s) {
  const n = e.spec;
  if (e.id.startsWith("automation:")) {
    const o = e.id.slice(11), r = Ts(o, s);
    return r ? (await t.callApi("POST", `config/automation/config/${o}`, r), { kind: "automation", automationId: o }) : (s.log(`SKIP ${e.id} - no payload generator`), null);
  }
  const { domain: i, objectId: a } = te(e.id);
  if (["timer", "input_text", "input_select", "input_number", "input_boolean"].includes(i)) {
    const o = { name: n.name ?? a };
    i === "timer" && Object.assign(o, { restore: n.restore ?? !0, duration: "0:30:00" }), i === "input_select" && Object.assign(o, { options: n.options ?? ["-"] }), i === "input_number" && Object.assign(o, {
      min: n.min ?? 0,
      max: n.max ?? 100,
      step: n.step ?? 1,
      ...n.unit ? { unit_of_measurement: n.unit } : {},
      ...typeof n.initial == "number" ? { initial: n.initial } : {}
    });
    const r = await t.callWS({ type: `${i}/create`, ...o });
    return { kind: "collection", domain: i, itemId: r?.id ?? a };
  }
  if (i === "schedule") {
    const o = { type: "schedule/create", name: n.name ?? a }, r = n.week;
    for (const c of Rs) o[c] = r?.[c] ?? [];
    const l = await t.callWS(o);
    return { kind: "collection", domain: i, itemId: l?.id ?? a };
  }
  if (e.kind === "template_sensor" || e.kind === "stats_sensor") {
    if (e.kind === "stats_sensor") {
      const l = s.zones.find((p) => a.includes(p.slug));
      return l ? { kind: "config_entry", entryId: await Ve(t, "history_stats", null, {
        name: n.name ?? a,
        entity_id: `binary_sensor.${s.prefix}_${l.slug}_running`,
        type: "time",
        state: ["on"],
        start: "{{ today_at() }}",
        end: "{{ now() }}"
      }) } : (s.log(`SKIP ${e.id} - no zone match`), null);
    }
    const o = Ps(e.id, n, s);
    return o ? { kind: "config_entry", entryId: await Ve(t, o.handler, o.menu, o.fields) } : (s.log(`SKIP ${e.id} - not flow-creatable (computed by the card)`), null);
  }
  return s.log(`SKIP ${e.id} - unsupported kind ${e.kind}`), null;
}
async function Is(t, e, s) {
  for (const n of [...e].reverse())
    try {
      n.kind === "collection" ? await t.callWS({ type: `${n.domain}/delete`, [`${n.domain}_id`]: n.itemId }) : n.kind === "automation" ? await t.callApi("DELETE", `config/automation/config/${n.automationId}`) : n.kind === "config_entry" && n.entryId && await t.callApi("DELETE", `config/config_entries/entry/${n.entryId}`), s.log(`Rolled back ${n.itemId ?? n.automationId ?? n.entryId}`);
    } catch {
      s.log(`ROLLBACK FAILED for ${n.itemId ?? n.automationId ?? n.entryId} - remove manually`);
    }
}
async function Ls(t, e, s) {
  const n = { created: 0, adopted: 0, updated: 0, deleted: 0, skipped: 0, ok: !0 }, i = [];
  await Ms(t, s);
  try {
    for (const a of e.create) {
      const o = await Ns(t, a, s);
      o ? (i.push(o), n.created++, s.log(`Created ${a.id}`), a.id.startsWith("automation:") || await Ze(t, a.id)) : n.skipped++;
    }
    for (const a of e.adopt)
      await Ze(t, a.id), n.adopted++, s.log(`Adopted ${a.id}`);
    for (const a of e.update)
      if (a.kind === "helper") {
        const { domain: o, objectId: r } = te(a.id), { unit: l, ...c } = a.spec, p = { ...c, ...l ? { unit_of_measurement: l } : {} };
        try {
          await t.callWS({ type: `${o}/update`, [`${o}_id`]: r, ...p }), n.updated++, s.log(`Updated ${a.id}`);
        } catch {
          n.skipped++, s.log(`SKIP update ${a.id} - not updatable`);
        }
      } else
        n.skipped++, s.log(`KEEP ${a.id} - ${a.kind} updates never overwrite existing content`);
    for (const a of e.delete) {
      if (a.id.startsWith("automation:"))
        await t.callApi("DELETE", `config/automation/config/${a.id.slice(11)}`);
      else {
        const { domain: o, objectId: r } = te(a.id);
        await t.callWS({ type: `${o}/delete`, [`${o}_id`]: r });
      }
      n.deleted++, s.log(`Deleted ${a.id}`);
    }
  } catch (a) {
    n.ok = !1, s.log(`ERROR: ${a instanceof Error ? a.message : String(a)} - rolling back this run's creates`), await Is(t, i, s);
  }
  return n;
}
var Ws = Object.defineProperty, Hs = Object.getOwnPropertyDescriptor, b = (t, e, s, n) => {
  for (var i = n > 1 ? void 0 : n ? Hs(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (n ? o(e, s, i) : o(i)) || i);
  return n && i && Ws(e, s, i), i;
};
const js = [
  ["accent", "--mzcs-accent"],
  ["accentBright", "--mzcs-accent-bright"],
  ["good", "--mzcs-good"],
  ["warn", "--mzcs-warn"],
  ["bad", "--mzcs-bad"],
  ["bg", "--mzcs-bg"],
  ["surface", "--mzcs-surface"],
  ["chip", "--mzcs-chip"],
  ["track", "--mzcs-track"],
  ["border", "--mzcs-border"],
  ["text", "--mzcs-text"],
  ["textDim", "--mzcs-text-dim"]
], Us = [
  { key: "bg", label: "Card background" },
  { key: "surface", label: "Panels (hero / rows)" },
  { key: "chip", label: "Buttons and chips" },
  { key: "track", label: "Tracks and wells" },
  { key: "border", label: "Borders" },
  { key: "text", label: "Text" },
  { key: "textDim", label: "Muted text" },
  { key: "accent", label: "Accent (cooling / active)" },
  { key: "accentBright", label: "Accent bright (today / highlights)" },
  { key: "good", label: "Good (eco / normal)" },
  { key: "warn", label: "Warn (heat / season / high)" },
  { key: "bad", label: "Alert (out of range)" }
], Bs = [
  { cls: "dev_green_max", label: "Room deviation · green up to (°)" },
  { cls: "dev_amber_max", label: "Room deviation · amber up to (°)" },
  { cls: "runtime_alert_margin", label: "Runtime alert margin (%)" },
  { cls: "runtime_alert_days", label: "Runtime alert · consecutive days" },
  { cls: "runtime_learn_days", label: "Runtime learn window (days)" },
  { cls: "cdd_base", label: "Cooling degree-day base (°)" },
  { cls: "season_confirm_days", label: "Season switch · confirm after (days)" },
  { cls: "season_dwell_days", label: "Season switch · min dwell (days)" }
];
function Fs(t) {
  const [e, s] = t.split(":");
  let n = Number(e);
  const i = n >= 12 ? "PM" : "AM";
  return n = n % 12 === 0 ? 12 : n % 12, `${n}:${s} ${i}`;
}
const qs = {
  all: "Every day",
  wd: "Weekdays",
  we: "Weekend"
}, Ks = {
  heat: "Heat",
  cool: "Cool",
  heat_cool: "Heat·Cool",
  off: "Off",
  auto: "Auto",
  dry: "Dry",
  fan_only: "Fan only"
};
console.info(`%c ${nt} %c v${Rt}`, "background:var(--mzcs-accent);color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;", "background:#243039;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;");
let g = class extends T {
  constructor() {
    super(...arguments), this._zoneIndex = 0, this._ctrlOpen = !1, this._setupOpen = !1, this._schedOpen = !1, this._schedName = "", this._schedBusy = !1, this._rtOpen = !1, this._rtDayOpen = null, this._rtDayLoading = !1, this._rtDayCache = /* @__PURE__ */ new Map(), this._rtRange = 7, this._dryRunning = !1, this._execConfirm = !1, this._execRunning = !1, this._execLog = [];
  }
  setConfig(t) {
    if (!t.zones || !Array.isArray(t.zones) || t.zones.length < 1)
      throw new Error("At least one zone with a climate entity is required.");
    if (t.zones.length > 4)
      throw new Error("A maximum of 4 zones is supported.");
    for (const e of t.zones)
      if (!e.entity || !e.entity.startsWith("climate."))
        throw new Error(`Zone "${e.name ?? e.entity}" needs a climate.* entity.`);
    this._config = t, this._zoneIndex >= t.zones.length && (this._zoneIndex = 0);
  }
  static async getConfigElement() {
    return await Promise.resolve().then(() => Gs), document.createElement("multizone-climate-scheduler-card-editor");
  }
  static getStubConfig() {
    return { prefix: "climate", zones: [] };
  }
  getCardSize() {
    return 6;
  }
  get _prefix() {
    return this._config?.prefix ?? "climate";
  }
  _zone() {
    return this._config?.zones[this._zoneIndex];
  }
  _nudge(t) {
    const e = this._zone();
    if (!e || !this.hass) return;
    const s = Re(this.hass, e.entity);
    if (s.setpoint == null) return;
    const n = this.hass.states[e.entity]?.attributes, i = jt(
      s.setpoint + t,
      s.setpoint,
      n?.min_temp,
      n?.max_temp
    );
    i !== s.setpoint && Vt(this.hass, e.entity, i);
  }
  _provisionInput() {
    const t = this._config, e = t.zones.map((n) => ({ slug: k(n.name), name: n.name })), s = t.seasons ?? [
      { key: "summer", name: "Summer", default_mode: "cool" },
      { key: "winter", name: "Winter", default_mode: "heat_cool" }
    ];
    return {
      prefix: this._prefix,
      zones: e,
      seasons: s,
      schedules: ks(
        e.map((n) => n.slug),
        s
      ),
      features: {
        fan_timer: (this._config?.features?.fan_timer?.length ?? 3) > 0,
        anomaly_alerts: this._config?.features?.anomaly_alerts ?? !0,
        steering: !1
      }
    };
  }
  async _runDryRun() {
    if (!(!this.hass || this._dryRunning)) {
      this._dryRunning = !0, this._dryRunError = void 0;
      try {
        const t = this._provisionInput(), e = await Ke(
          this.hass,
          t.prefix,
          t.zones.map((s) => s.slug),
          t.seasons.map((s) => s.key)
        );
        this._dryRun = qe(Fe(t), e), this._execConfirm = !1, this._execResult = void 0, this._execLog = [];
      } catch (t) {
        this._dryRunError = t instanceof Error ? t.message : String(t);
      } finally {
        this._dryRunning = !1;
      }
    }
  }
  async _runApply() {
    const t = this.hass, e = this._config, s = this._dryRun;
    if (!(!t || !e || !s || this._execRunning)) {
      if (!t.callWS || !t.callApi) {
        this._execLog = ["This HA frontend session does not expose the required APIs (callWS/callApi)."];
        return;
      }
      this._execRunning = !0, this._execConfirm = !1, this._execLog = [];
      try {
        const n = this._provisionInput(), i = e.zones.map((r) => ({
          slug: k(r.name),
          name: r.name,
          climate: r.entity
        })), a = await Ls(t, s, {
          prefix: n.prefix,
          zones: i,
          seasons: n.seasons,
          log: (r) => {
            this._execLog = [...this._execLog, r];
          }
        });
        this._execResult = a;
        const o = await Ke(
          t,
          n.prefix,
          n.zones.map((r) => r.slug),
          n.seasons.map((r) => r.key)
        );
        this._dryRun = qe(Fe(n), o);
      } catch (n) {
        this._execLog = [...this._execLog, `ERROR: ${n instanceof Error ? n.message : String(n)}`];
      } finally {
        this._execRunning = !1;
      }
    }
  }
  _renderSetup() {
    const t = this._dryRun;
    return d`
      <div class="setup">
        <p class="setup-title">Setup</p>
        <p class="setup-sub">
          Preview first, then apply. Nothing is written until you confirm; existing schedules and
          customized automations are never overwritten.
        </p>
        <button class="chip" .disabled=${this._dryRunning} @click=${() => void this._runDryRun()}>
          ${this._dryRunning ? "Reading registry…" : "Run dry-run preview"}
        </button>
        ${this._dryRunError ? d`<p class="setup-err">${this._dryRunError}</p>` : u}
        ${t ? d`
              <div class="planwrap">
                ${[
      ["Create", t.create, ""],
      ["Adopt", t.adopt, ""],
      ["Update", t.update, ""],
      ["Delete", t.delete, "del"],
      ["Unchanged", t.noop, "quiet"]
    ].map(
      ([e, s, n]) => d`
                    <p class="plan-h ${n}">${e} (${s.length})</p>
                    ${s.length > 0 && e !== "Unchanged" ? d`<ul class="plan-list ${n}">
                          ${s.map((i) => d`<li>${i.id}</li>`)}
                        </ul>` : u}
                  `
    )}
              </div>
              ${this._renderApply(t)}
            ` : u}
        ${this._renderManage()}
        <button class="chip" @click=${() => this._setupOpen = !1}>Close</button>
      </div>
    `;
  }
  _renderApply(t) {
    const e = xs(t).length, s = this._execResult;
    return d`
      ${e > 0 && !this._execRunning && !s ? this._execConfirm ? d`
              <div class="applyrow">
                <button class="chip danger" @click=${() => void this._runApply()}>
                  Confirm: apply ${e} change${e === 1 ? "" : "s"}
                </button>
                <button class="chip" @click=${() => this._execConfirm = !1}>Cancel</button>
              </div>
            ` : d`
              <button class="chip" @click=${() => this._execConfirm = !0}>
                Apply ${e} change${e === 1 ? "" : "s"}…
              </button>
            ` : u}
      ${this._execRunning ? d`<p class="setup-sub">Applying…</p>` : u}
      ${this._execLog.length > 0 ? d`<ul class="plan-list exec-log">
            ${this._execLog.map((n) => d`<li>${n}</li>`)}
          </ul>` : u}
      ${s ? d`<p class="setup-sub ${s.ok ? "" : "setup-err"}">
            ${s.ok ? `Done - ${s.created} created, ${s.adopted} adopted, ${s.updated} updated, ${s.deleted} deleted${s.skipped ? `, ${s.skipped} kept as-is` : ""}. The plan above has been re-verified against the live registry.` : "Apply failed - created objects from this run were rolled back. See the log above."}
          </p>` : u}
    `;
  }
  _renderManage() {
    const t = this.hass;
    if (!t) return u;
    const e = v("season_select", this._prefix), s = t.states[e], n = Array.isArray(s?.attributes.options) ? s.attributes.options : [], i = Bs.map((r) => ({
      ...r,
      id: v(r.cls, this._prefix)
    })).filter((r) => C(t, r.id));
    if (!s && i.length === 0) return u;
    const a = (this._config?.zones ?? []).map((r) => {
      const l = k(r.name);
      return {
        name: r.name,
        enableId: _("zone_enabled", this._prefix, l),
        markerId: _("applied_block_marker", this._prefix, l)
      };
    }).filter((r) => C(t, r.enableId)), o = a.length > 0 && a.every((r) => t.states[r.enableId]?.state === "on");
    return d`
      <p class="setup-title" style="margin-top:12px;">Manage</p>
      ${a.length > 0 ? d`
            <div class="managerow master">
              <span>Scheduling · all zones</span>
              <button
                class=${o ? "chip togg on" : "chip togg"}
                @click=${() => {
      for (const r of a) Pe(t, r.enableId, r.markerId, !o);
    }}
              >
                ${o ? "On" : "Off"}
              </button>
            </div>
            ${a.map((r) => {
      const l = t.states[r.enableId]?.state === "on";
      return d`
                <div class="managerow">
                  <span>${r.name} scheduling</span>
                  <button
                    class=${l ? "chip togg on" : "chip togg"}
                    @click=${() => void Pe(t, r.enableId, r.markerId, !l)}
                  >
                    ${l ? "On" : "Off"}
                  </button>
                </div>
              `;
    })}
            <p class="muted" style="font-size:11px;margin:2px 0 6px;">
              Off = the engine stands down and the thermostat's own app schedule takes over.
            </p>
          ` : u}
      ${s ? d`
            <div class="managerow">
              <span>Active season</span>
              <select
                @change=${(r) => void qt(t, e, r.target.value)}
              >
                ${n.map(
      (r) => d`<option .value=${r} ?selected=${r === s.state}>${r}</option>`
    )}
              </select>
            </div>
          ` : u}
      ${i.map(
      (r) => d`
          <div class="managerow">
            <span>${r.label}</span>
            <input
              type="number"
              .value=${t.states[r.id]?.state ?? ""}
              @change=${(l) => void Ft(t, r.id, Number(l.target.value))}
            />
          </div>
        `
    )}
      ${this._renderThemePicker()}
    `;
  }
  _renderThemePicker() {
    const t = this.hass;
    if (!t) return u;
    const e = v("theme", this._prefix);
    if (!C(t, e)) return u;
    const { presetKey: s, tokens: n } = He(t.states[e]?.state), i = (a) => void t.callService("input_text", "set_value", { entity_id: e, value: a });
    return d`
      <p class="setup-title" style="margin-top:12px;">Theme</p>
      <div class="chips">
        ${Object.entries(le).map(
      ([a, o]) => d`
            <button
              class=${s === a ? "chip mode-on" : "chip"}
              @click=${() => i(a)}
            >
              <span class="swatch" style="background:${o.tokens.accent}"></span>${o.label}
            </button>
          `
    )}
        <button
          class=${s === "custom" ? "chip mode-on" : "chip"}
          @click=${() => i(We(Qt(n)))}
        >
          Custom
        </button>
      </div>
      ${s === "custom" ? d`
            ${Us.map(
      (a) => d`
                <div class="managerow">
                  <span>${a.label}</span>
                  <input
                    type="color"
                    .value=${n[a.key]}
                    @change=${(o) => {
        const r = { ...n, [a.key]: o.target.value };
        i(We(r));
      }}
                  />
                </div>
              `
    )}
            <p class="muted" style="font-size:11px;margin:2px 0 0;">
              Colors apply live to every device showing the card.
            </p>
          ` : u}
    `;
  }
  _applyTheme() {
    const t = this.hass?.states[v("theme", this._prefix)]?.state, { tokens: e } = He(t);
    for (const [s, n] of js)
      this.style.setProperty(n, e[s]);
  }
  render() {
    if (!this._config || !this.hass) return u;
    this._applyTheme();
    const t = this._zone();
    if (!t) return u;
    if (this._setupOpen)
      return d`<ha-card><div class="wrap">${this._renderSetup()}</div></ha-card>`;
    const e = Re(this.hass, t.entity), s = Mt(
      this.hass,
      _("fan_timer", this._prefix, k(t.name))
    ), n = e.action === "cooling", i = e.action === "heating", a = e.available ? n ? `Cooling to ${e.setpoint}` : i ? `Heating to ${e.setpoint}` : e.mode === "off" ? "Off" : `Idle · set ${e.setpoint ?? "–"}` : "Unavailable";
    return d`
      <ha-card>
        <div class="wrap">
          <div class="tabs" role="tablist">
            ${this._config.zones.map(
      (o, r) => d`
                <button
                  role="tab"
                  aria-selected=${r === this._zoneIndex}
                  class=${r === this._zoneIndex ? "tab on" : "tab"}
                  @click=${() => {
        this._zoneIndex = r;
      }}
                >
                  ${o.name}
                </button>
              `
    )}
            <button
              class="tab gear"
              aria-label="Setup"
              @click=${() => {
      this._setupOpen = !0;
    }}
            >
              ⚙
            </button>
          </div>

          <div class="hero">
            <span
              class="dot ${n ? "cool" : i ? "heat" : ""}"
              aria-hidden="true"
            ></span>
            <div class="mid">
              <p class="name">${t.name}</p>
              <p class="status">
                ${a}${e.inside != null ? ` · inside ${e.inside}°` : ""}${e.humidity != null ? ` · ${e.humidity}% RH` : ""}${s ? d`<span class="fan"> · fan on</span>` : ""}
              </p>
            </div>
            <button
              class="nudge"
              aria-label="Lower setpoint"
              .disabled=${e.setpoint == null}
              @click=${() => this._nudge(-1)}
            >
              −
            </button>
            <span class="set">${e.setpoint ?? "–"}</span>
            <button
              class="nudge"
              aria-label="Raise setpoint"
              .disabled=${e.setpoint == null}
              @click=${() => this._nudge(1)}
            >
              +
            </button>
          </div>

          ${this._renderControls(t.entity)} ${this._renderRooms(t, e.setpoint)}
          ${this._renderSchedule(t)} ${this._renderRuntime(t)}
        </div>
      </ha-card>
    `;
  }
  _renderRuntime(t) {
    if (!this.hass) return u;
    const e = this.hass, s = k(t.name), n = _("runtime_today", this._prefix, s);
    if (!C(e, n)) return u;
    const i = Number(e.states[n]?.state), a = Number.isFinite(i) ? W(i) : "–";
    this._rtLoadedFor !== n && (this._rtLoadedFor = n, this._rtDaily = void 0, queueMicrotask(
      () => void Te(e, n, 7).then((h) => {
        this._rtDaily = h;
      })
    ));
    const o = /* @__PURE__ */ new Date();
    o.setHours(0, 0, 0, 0);
    const r = (this._rtDaily ?? []).filter((h) => h.day < o.getTime()).sort((h, f) => f.day - h.day), l = o.getTime(), c = Number(
      e.states[_("expected_runtime", this._prefix, s)]?.state
    ), p = ae(e, v("runtime_alert_margin", this._prefix)) ?? 35, m = (Date.now() - l) / 36e5, $ = Xt(
      Number.isFinite(i) ? i : 0,
      c,
      p,
      m
    );
    return d`
      <button class="schedrow" @click=${() => this._rtOpen = !this._rtOpen}>
        <span
          >Runtime · Today <b class="rt-b">${a}</b>${$.label ? d` <span class="verdict ${$.status}">· ${$.label}</span>` : u}</span
        >
        <span aria-hidden="true">${this._rtOpen ? "▴" : "▾"}</span>
      </button>
      ${this._rtOpen ? d`
            <div class="schedbody">
              <div class="chips" style="margin-bottom:6px;">
                <button
                  class=${this._rtRange === 7 ? "chip mode-on" : "chip"}
                  @click=${() => this._rtRange = 7}
                >
                  7 days
                </button>
                <button
                  class=${this._rtRange === 30 ? "chip mode-on" : "chip"}
                  @click=${() => {
      this._rtRange = 30, this._rt30 || Te(e, n, 30).then((h) => {
        this._rt30 = h;
      });
    }}
                >
                  30 days
                </button>
              </div>
              ${this._rtRange === 30 ? this._render30() : u}
              ${this._rtRange === 7 ? d`${this._renderPill(t, "Today", Number.isFinite(i) ? i : 0, l, !0)}` : u}
              ${this._rtRange === 7 ? d`
                    ${r.map(
      (h) => this._renderPill(
        t,
        new Date(h.day).toLocaleDateString(void 0, {
          weekday: "short",
          day: "numeric"
        }),
        h.hours,
        h.day,
        !1
      )
    )}
                    ${r.length === 0 ? d`<p class="muted" style="font-size:11px;margin:6px 0;">
                          History accrues daily - past days appear as statistics build up.
                        </p>` : u}
                    <p class="muted" style="font-size:10px;margin:6px 0 0;">
                      Tap a day for its run segments and setpoint changes.
                    </p>
                  ` : u}
            </div>
          ` : u}
    `;
  }
  _render30() {
    const t = this._rt30;
    if (!t) return d`<p class="muted" style="font-size:11px;">Loading…</p>`;
    if (t.length === 0)
      return d`<p class="muted" style="font-size:11px;">
        Long-term statistics build daily - the 30-day view fills in as days accumulate.
      </p>`;
    const e = [...t].sort((a, o) => a.day - o.day), s = Math.max(...e.map((a) => a.hours), 1), n = e.reduce((a, o) => a + o.hours, 0) / e.length, i = (a) => new Date(a).toLocaleDateString(void 0, { month: "short", day: "numeric" });
    return d`
      <div class="cols">
        ${e.map(
      (a) => d`<span
            class="col"
            title="${i(a.day)}: ${W(a.hours)}"
            style="height: ${Math.max(6, a.hours / s * 64).toFixed(0)}px"
          ></span>`
    )}
      </div>
      <div class="axis">
        <span>${i(e[0].day)}</span>
        <span>${i(e[e.length - 1].day)}</span>
      </div>
      <p class="muted" style="font-size:11px;margin:6px 0 0;">
        Avg <b class="rt-b">${W(n)}</b> · Max
        <b class="rt-b">${W(s)}</b> · from long-term statistics (kept forever)
      </p>
    `;
  }
  async _openDay(t, e) {
    if (this._rtDayOpen === e) {
      this._rtDayOpen = null;
      return;
    }
    this._rtDayOpen = e;
    const s = this._rtDayCache.get(e);
    if (s) {
      this._rtDayDetail = s;
      return;
    }
    if (this.hass) {
      this._rtDayLoading = !0, this._rtDayDetail = void 0;
      try {
        const n = k(t.name), i = _("running_sensor", this._prefix, n), a = Math.min(e + 864e5, Date.now()), [o, r] = await Promise.all([
          Ne(this.hass, i, e, a),
          Ne(this.hass, t.entity, e, a, "temperature")
        ]), l = {
          segs: Yt(o, e, a),
          bubs: Jt(r),
          start: e,
          end: e + 864e5
        };
        this._rtDayCache.set(e, l), this._rtDayOpen === e && (this._rtDayDetail = l);
      } finally {
        this._rtDayLoading = !1;
      }
    }
  }
  _renderPill(t, e, s, n, i) {
    const a = Math.min(100, Math.max(0, s / 24 * 100)), o = this._rtDayOpen === n;
    return d`
      <button class="pillrow" @click=${() => void this._openDay(t, n)}>
        <span class="pill-label">${e}</span>
        <span class="pill-track">
          <span
            class="pill-fill ${i || o ? "today-fill" : ""}"
            style="width: ${a.toFixed(1)}%"
          ></span>
        </span>
        <span class="pill-hours">${W(s)}</span>
      </button>
      ${o ? this._renderDayDetail() : u}
    `;
  }
  _renderDayDetail() {
    if (this._rtDayLoading) return d`<p class="muted" style="font-size:11px;">Loading day…</p>`;
    const t = this._rtDayDetail;
    return t ? d`
      <div class="daydetail">
        <div class="bubblerow">
          ${t.bubs.slice(0, 12).map((e) => {
      const s = (e.t - t.start) / (t.end - t.start) * 100;
      return d`<span class="bubble" style="left: ${s.toFixed(1)}%"
              >${Math.round(e.value)}</span
            >`;
    })}
        </div>
        <div class="segtrack">
          ${t.segs.map((e) => {
      const { left: s, width: n } = Gt(e, t.start, t.end);
      return d`<span
              class="seg"
              style="left: ${s.toFixed(2)}%; width: ${Math.max(0.4, n).toFixed(2)}%"
            ></span>`;
    })}
        </div>
        <div class="axis">
          <span>12A</span><span>6A</span><span>12P</span><span>6P</span><span>12A</span>
        </div>
      </div>
    ` : u;
  }
  _activeSeasonKey() {
    const t = this.hass?.states[v("season_select", this._prefix)];
    return t && t.state !== "unknown" ? k(t.state) : null;
  }
  _scheduleEntityId(t) {
    const e = this._activeSeasonKey();
    return e ? `schedule.${this._prefix}_${k(t.name)}_${e}` : null;
  }
  async _loadWeek(t) {
    if (!this.hass) return;
    const e = this._scheduleEntityId(t);
    if (!e || !C(this.hass, e)) {
      this._schedWeek = void 0;
      return;
    }
    this._schedBusy = !0;
    try {
      const s = await Ut(this.hass, e);
      this._schedWeek = s?.week ?? void 0, this._schedName = s?.name ?? "", this._schedError = s ? void 0 : "Could not load schedule config.";
    } catch (s) {
      this._schedError = Ie(s);
    } finally {
      this._schedBusy = !1;
    }
  }
  async _saveBlockEdit(t, e, s, n) {
    if (!this.hass || !this._schedWeek) return;
    const i = this._scheduleEntityId(t);
    if (i) {
      this._schedBusy = !0;
      try {
        const a = us(this._schedWeek, e, s, n);
        await Bt(
          this.hass,
          i,
          a,
          this._schedName
        ), this._schedWeek = a, this._schedError = void 0;
      } catch (a) {
        this._schedError = Ie(a);
      } finally {
        this._schedBusy = !1;
      }
    }
  }
  _renderSchedule(t) {
    if (!this.hass) return u;
    const e = this._scheduleEntityId(t);
    if (!e || !C(this.hass, e)) return u;
    this._schedLoadedFor !== e && !this._schedBusy && (this._schedLoadedFor = e, this._schedWeek = void 0, queueMicrotask(() => void this._loadWeek(t)));
    const s = this.hass.states[v("season_select", this._prefix)]?.state ?? "", n = this._schedWeek, i = n ? ds(n, /* @__PURE__ */ new Date()) : null, a = i ? `Next · ${Fs(i.time)} ${i.name} → ${i.cool_temp ?? i.heat_temp}°` : "Schedule";
    return d`
      <button
        class="schedrow"
        @click=${() => {
      this._schedOpen = !this._schedOpen, this._schedWeek || this._loadWeek(t);
    }}
      >
        <span>${a} <span class="season">· ${s}</span></span>
        <span aria-hidden="true">${this._schedOpen ? "▴" : "▾"}</span>
      </button>
      ${this._schedOpen ? this._renderScheduleBody(t) : u}
    `;
  }
  _renderScheduleBody(t) {
    if (this._schedBusy && !this._schedWeek) return d`<p class="muted pad">Loading…</p>`;
    if (this._schedError) return d`<p class="schederr pad">${this._schedError}</p>`;
    const e = this._schedWeek;
    if (!e) return d`<p class="muted pad">No schedule data.</p>`;
    const s = rs(e), n = (/* @__PURE__ */ new Date()).getDay(), i = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][n];
    return d`
      <div class="schedbody">
        ${Object.entries(s.sets).map(([a, o]) => {
      const r = ye(e[o[0]] ?? []), l = o.includes(i);
      return d`
            <p class="sethead">
              ${qs[a] ?? a}${l ? d` <span class="today">today</span>` : u}
            </p>
            ${r.map(
        (c) => d`
                <div class="blockrow">
                  <input
                    class="btime"
                    type="time"
                    .value=${c.time}
                    @change=${(p) => void this._saveBlockEdit(t, o, c.time, {
          time: p.target.value
        })}
                  />
                  <span class="bname">${c.name}</span>
                  <input
                    class="btemp"
                    type="number"
                    .value=${String(c.cool_temp ?? c.heat_temp ?? "")}
                    @change=${(p) => void this._saveBlockEdit(t, o, c.time, {
          cool_temp: Number(p.target.value)
        })}
                  />
                </div>
              `
      )}
          `;
    })}
        <div class="schedactions">
          <button
            class="chip"
            .disabled=${this._schedBusy}
            @click=${() => {
      const a = _("applied_block_marker", this._prefix, k(t.name));
      Zt(this.hass, a, "automation.climate_schedule_engine");
    }}
          >
            Apply now
          </button>
          <span class="muted">Edits apply at the next block; Apply now re-asserts immediately.</span>
        </div>
      </div>
    `;
  }
  _renderControls(t) {
    if (!this.hass) return u;
    const e = this.hass, s = this._zone();
    if (!s) return u;
    const n = Pt(e, t), i = e.states[t]?.state, a = Tt(e, t), o = _("fan_timer", this._prefix, k(s.name)), r = this._config?.features?.fan_timer ?? [15, 30, 60], l = C(e, o);
    return d`
      <button class="expander" @click=${() => this._ctrlOpen = !this._ctrlOpen}>
        <span>Mode</span>
        <span aria-hidden="true">${this._ctrlOpen ? "▴" : "▾"}</span>
      </button>
      ${this._ctrlOpen ? d`
            <div class="ctrl">
              <div class="chips">
                ${n.map(
      (c) => d`
                    <button
                      class=${i === c ? "chip mode-on" : "chip"}
                      @click=${() => void It(e, t, c)}
                    >
                      ${Ks[c] ?? c}
                    </button>
                  `
    )}
                ${a ? d`
                      <button
                        class=${Me(e, t) ? "chip eco eco-on" : "chip eco"}
                        @click=${() => void Lt(e, t, !Me(e, t))}
                      >
                        Eco
                      </button>
                    ` : u}
              </div>
              ${l ? d`
                    <div class="chips fanrow">
                      <span class="fanlbl">Fan</span>
                      ${r.map(
      (c) => d`
                          <button
                            class="chip"
                            @click=${() => void Ht(e, t, o, c)}
                          >
                            ${c}m
                          </button>
                        `
    )}
                    </div>
                  ` : u}
            </div>
          ` : u}
    `;
  }
  _renderRooms(t, e) {
    if (!this.hass || !t.room_sensors || t.room_sensors.length === 0) return u;
    const s = this.hass, { greenMax: n, amberMax: i } = _s(
      ae(s, v("dev_green_max", this._prefix)),
      ae(s, v("dev_amber_max", this._prefix))
    );
    return d`
      <div class="rooms">
        ${t.room_sensors.map((a) => {
      const o = Nt(s, a);
      if (o.temp == null || e == null)
        return d`
              <div class="room">
                <span class="rname">${o.name}</span>
                <span class="rtemp muted">${o.temp == null ? "—" : `${o.temp}°`}</span>
              </div>
            `;
      const r = Math.round(o.temp - e);
      return d`
            <div class="room">
              <span class="rname">${o.name}</span>
              <span>
                <span class="badge ${ms(r, n, i)}"
                  >${fs(r)}</span
                >
                <span class="rtemp">${o.temp}°</span>
              </span>
            </div>
          `;
    })}
      </div>
    `;
  }
};
g.styles = Je`
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
    .blockrow {
      display: grid;
      grid-template-columns: 92px 1fr 56px;
      gap: 8px;
      align-items: center;
      padding: 3px 0;
      font-size: 12px;
    }
    .btime,
    .btemp {
      background: var(--mzcs-track);
      border: 0.5px solid var(--mzcs-border);
      border-radius: 6px;
      color: var(--mzcs-text);
      padding: 4px 6px;
      font-size: 12px;
    }
    .bname {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
  `;
b([
  _e({ attribute: !1 })
], g.prototype, "hass", 2);
b([
  y()
], g.prototype, "_config", 2);
b([
  y()
], g.prototype, "_zoneIndex", 2);
b([
  y()
], g.prototype, "_ctrlOpen", 2);
b([
  y()
], g.prototype, "_setupOpen", 2);
b([
  y()
], g.prototype, "_schedOpen", 2);
b([
  y()
], g.prototype, "_schedWeek", 2);
b([
  y()
], g.prototype, "_schedError", 2);
b([
  y()
], g.prototype, "_schedBusy", 2);
b([
  y()
], g.prototype, "_rtOpen", 2);
b([
  y()
], g.prototype, "_rtDaily", 2);
b([
  y()
], g.prototype, "_rtDayOpen", 2);
b([
  y()
], g.prototype, "_rtDayDetail", 2);
b([
  y()
], g.prototype, "_rtDayLoading", 2);
b([
  y()
], g.prototype, "_rtRange", 2);
b([
  y()
], g.prototype, "_rt30", 2);
b([
  y()
], g.prototype, "_dryRun", 2);
b([
  y()
], g.prototype, "_dryRunError", 2);
b([
  y()
], g.prototype, "_dryRunning", 2);
b([
  y()
], g.prototype, "_execConfirm", 2);
b([
  y()
], g.prototype, "_execRunning", 2);
b([
  y()
], g.prototype, "_execLog", 2);
b([
  y()
], g.prototype, "_execResult", 2);
g = b([
  tt(st)
], g);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: st,
  name: nt,
  description: "Nest-style climate view for 1-4 zones with seasonal scheduling, fan timers, and runtime history."
});
var Zs = Object.defineProperty, Vs = Object.getOwnPropertyDescriptor, Z = (t, e, s, n) => {
  for (var i = n > 1 ? void 0 : n ? Vs(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (n ? o(e, s, i) : o(i)) || i);
  return n && i && Zs(e, s, i), i;
};
let re = null;
function Ys() {
  return re || (re = (async () => {
    if (!customElements.get("ha-selector"))
      try {
        await (await window.loadCardHelpers?.())?.createCardElement({ type: "entities", entities: [] })?.constructor.getConfigElement?.(), await customElements.whenDefined("ha-selector");
      } catch {
      }
  })()), re;
}
const Js = [
  { key: "summer", name: "Summer", default_mode: "cool" },
  { key: "winter", name: "Winter", default_mode: "heat_cool" }
];
let S = class extends T {
  constructor() {
    super(...arguments), this._ready = !1;
  }
  setConfig(t) {
    this._config = {
      type: t.type,
      prefix: t.prefix ?? "climate",
      zones: t.zones ?? [],
      seasons: t.seasons ?? Js.map((e) => ({ ...e })),
      season_switch: t.season_switch ?? "semi",
      weather_entity: t.weather_entity,
      features: {
        fan_timer: t.features?.fan_timer ?? [15, 30, 60],
        anomaly_alerts: t.features?.anomaly_alerts ?? !0
      },
      notify_target: t.notify_target
    };
  }
  connectedCallback() {
    super.connectedCallback(), Ys().then(() => {
      this._ready = !0;
    });
  }
  _emit(t) {
    this._config && (this._config = { ...this._config, ...t }, this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: !0,
        composed: !0
      })
    ));
  }
  _setZone(t, e) {
    const s = (this._config?.zones ?? []).map((n, i) => i === t ? { ...n, ...e } : n);
    this._emit({ zones: s });
  }
  async _probeWeather() {
    const t = this._config?.weather_entity;
    if (!(!t || !this.hass?.callWS)) {
      this._probe = void 0;
      try {
        const s = (await this.hass.callWS({
          type: "call_service",
          domain: "weather",
          service: "get_forecasts",
          service_data: { type: "daily" },
          target: { entity_id: t },
          return_response: !0
        }))?.response?.[t]?.forecast?.length ?? 0;
        this._probe = s > 0 ? { ok: !0, text: `Daily forecast supported (${s} days).` } : { ok: !1, text: "No daily forecast - pick a different weather entity." };
      } catch {
        this._probe = { ok: !1, text: "Probe unavailable - validation skipped." };
      }
    }
  }
  _selector(t, e, s, n) {
    return !this._ready || !customElements.get("ha-selector") ? d`<input
        .value=${typeof e == "string" ? e : ""}
        placeholder=${n ?? ""}
        @change=${(i) => s(i.target.value)}
      />` : d`<ha-selector
      .hass=${this.hass}
      .selector=${t}
      .value=${e}
      .label=${n}
      @value-changed=${(i) => s(i.detail.value)}
    ></ha-selector>`;
  }
  render() {
    const t = this._config;
    if (!t) return u;
    const e = t.zones ?? [], s = t.seasons ?? [];
    return d`
      <div class="ed">
        <h4>Zones (1-4)</h4>
        ${e.map(
      (n, i) => d`
            <div class="zone">
              <div class="zonehead">
                <span>Zone ${i + 1}</span>
                <button
                  class="link danger"
                  @click=${() => this._emit({ zones: e.filter((a, o) => o !== i) })}
                >
                  Remove
                </button>
              </div>
              ${this._selector(
        { entity: { domain: "climate" } },
        n.entity,
        (a) => this._setZone(i, { entity: String(a ?? "") }),
        "Thermostat"
      )}
              <input
                class="namefield"
                .value=${n.name ?? ""}
                placeholder="Display name"
                @change=${(a) => this._setZone(i, { name: a.target.value })}
              />
              ${this._selector(
        { entity: { domain: "sensor", device_class: "temperature", multiple: !0 } },
        n.room_sensors ?? [],
        (a) => this._setZone(i, { room_sensors: a ?? [] }),
        "Room sensors"
      )}
            </div>
          `
    )}
        ${e.length < 4 ? d`<button
              class="link"
              @click=${() => this._emit({ zones: [...e, { entity: "", name: `Zone ${e.length + 1}` }] })}
            >
              + Add zone
            </button>` : u}

        <h4>Seasons (1-4)</h4>
        ${s.map(
      (n, i) => d`
            <div class="seasonrow">
              <input
                .value=${n.name}
                @change=${(a) => {
        const o = a.target.value, r = s.map(
          (l, c) => c === i ? { ...l, name: o, key: o.toLowerCase().replace(/[^a-z0-9]+/g, "_") } : l
        );
        this._emit({ seasons: r });
      }}
              />
              <select
                .value=${n.default_mode}
                @change=${(a) => {
        const o = a.target.value;
        this._emit({
          seasons: s.map((r, l) => l === i ? { ...r, default_mode: o } : r)
        });
      }}
              >
                <option value="cool">Cool</option>
                <option value="heat">Heat</option>
                <option value="heat_cool">Heat+Cool</option>
              </select>
              <button
                class="link danger"
                @click=${() => this._emit({ seasons: s.filter((a, o) => o !== i) })}
              >
                Remove
              </button>
            </div>
          `
    )}
        ${s.length < 4 ? d`<button
              class="link"
              @click=${() => this._emit({
      seasons: [
        ...s,
        { key: `season_${s.length + 1}`, name: `Season ${s.length + 1}`, default_mode: "cool" }
      ]
    })}
            >
              + Add season
            </button>` : u}

        <h4>Season switching</h4>
        <select
          .value=${t.season_switch ?? "semi"}
          @change=${(n) => this._emit({ season_switch: n.target.value })}
        >
          <option value="manual">Manual</option>
          <option value="semi">Semi-auto (recommend + confirm)</option>
          <option value="full">Full-auto</option>
        </select>
        ${(t.season_switch ?? "semi") !== "manual" ? d`
              ${this._selector(
      { entity: { domain: "weather" } },
      t.weather_entity,
      (n) => {
        this._probe = void 0, this._emit({ weather_entity: String(n ?? "") || void 0 });
      },
      "Weather entity (daily forecast)"
    )}
              <button class="link" .disabled=${!t.weather_entity} @click=${() => void this._probeWeather()}>
                Check daily forecast support
              </button>
              ${this._probe ? d`<p class=${this._probe.ok ? "ok" : "bad"}>${this._probe.text}</p>` : u}
            ` : u}

        <h4>Features</h4>
        <label class="checkrow">
          <input
            type="checkbox"
            .checked=${(t.features?.fan_timer?.length ?? 0) > 0}
            @change=${(n) => this._emit({
      features: {
        ...t.features,
        fan_timer: n.target.checked ? [15, 30, 60] : []
      }
    })}
          />
          Fan timer buttons (15/30/60)
        </label>
        <label class="checkrow">
          <input
            type="checkbox"
            .checked=${t.features?.anomaly_alerts ?? !0}
            @change=${(n) => this._emit({
      features: { ...t.features, anomaly_alerts: n.target.checked }
    })}
          />
          Runtime anomaly alerts
        </label>

        <h4>Advanced</h4>
        <label class="fieldrow">
          Entity prefix
          <input
            .value=${t.prefix ?? "climate"}
            @change=${(n) => this._emit({ prefix: n.target.value || "climate" })}
          />
        </label>
      </div>
    `;
  }
};
S.styles = Je`
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
  `;
Z([
  _e({ attribute: !1 })
], S.prototype, "hass", 2);
Z([
  y()
], S.prototype, "_config", 2);
Z([
  y()
], S.prototype, "_ready", 2);
Z([
  y()
], S.prototype, "_probe", 2);
S = Z([
  tt("multizone-climate-scheduler-card-editor")
], S);
const Gs = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get MzcsCardEditor() {
    return S;
  }
}, Symbol.toStringTag, { value: "Module" }));
export {
  g as MzcsCard
};

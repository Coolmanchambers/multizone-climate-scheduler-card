/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const j = globalThis, Y = j.ShadowRoot && (j.ShadyCSS === void 0 || j.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, G = Symbol(), ne = /* @__PURE__ */ new WeakMap();
let ye = class {
  constructor(e, t, n) {
    if (this._$cssResult$ = !0, n !== G) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (Y && e === void 0) {
      const n = t !== void 0 && t.length === 1;
      n && (e = ne.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && ne.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const ze = (s) => new ye(typeof s == "string" ? s : s + "", void 0, G), Re = (s, ...e) => {
  const t = s.length === 1 ? s[0] : e.reduce((n, i, r) => n + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + s[r + 1], s[0]);
  return new ye(t, s, G);
}, Me = (s, e) => {
  if (Y) s.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const n = document.createElement("style"), i = j.litNonce;
    i !== void 0 && n.setAttribute("nonce", i), n.textContent = t.cssText, s.appendChild(n);
  }
}, ie = Y ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const n of e.cssRules) t += n.cssText;
  return ze(t);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Pe, defineProperty: Ue, getOwnPropertyDescriptor: Ne, getOwnPropertyNames: Te, getOwnPropertySymbols: He, getPrototypeOf: De } = Object, B = globalThis, re = B.trustedTypes, je = re ? re.emptyScript : "", Ie = B.reactiveElementPolyfillSupport, M = (s, e) => s, I = { toAttribute(s, e) {
  switch (e) {
    case Boolean:
      s = s ? je : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, e) {
  let t = s;
  switch (e) {
    case Boolean:
      t = s !== null;
      break;
    case Number:
      t = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(s);
      } catch {
        t = null;
      }
  }
  return t;
} }, X = (s, e) => !Pe(s, e), oe = { attribute: !0, type: String, converter: I, reflect: !1, useDefault: !1, hasChanged: X };
Symbol.metadata ??= Symbol("metadata"), B.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let k = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = oe) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const n = Symbol(), i = this.getPropertyDescriptor(e, n, t);
      i !== void 0 && Ue(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, t, n) {
    const { get: i, set: r } = Ne(this.prototype, e) ?? { get() {
      return this[t];
    }, set(o) {
      this[t] = o;
    } };
    return { get: i, set(o) {
      const a = i?.call(this);
      r?.call(this, o), this.requestUpdate(e, a, n);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? oe;
  }
  static _$Ei() {
    if (this.hasOwnProperty(M("elementProperties"))) return;
    const e = De(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(M("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(M("properties"))) {
      const t = this.properties, n = [...Te(t), ...He(t)];
      for (const i of n) this.createProperty(i, t[i]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [n, i] of t) this.elementProperties.set(n, i);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, n] of this.elementProperties) {
      const i = this._$Eu(t, n);
      i !== void 0 && this._$Eh.set(i, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const n = new Set(e.flat(1 / 0).reverse());
      for (const i of n) t.unshift(ie(i));
    } else e !== void 0 && t.push(ie(e));
    return t;
  }
  static _$Eu(e, t) {
    const n = t.attribute;
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
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Me(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, t, n) {
    this._$AK(e, n);
  }
  _$ET(e, t) {
    const n = this.constructor.elementProperties.get(e), i = this.constructor._$Eu(e, n);
    if (i !== void 0 && n.reflect === !0) {
      const r = (n.converter?.toAttribute !== void 0 ? n.converter : I).toAttribute(t, n.type);
      this._$Em = e, r == null ? this.removeAttribute(i) : this.setAttribute(i, r), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const n = this.constructor, i = n._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const r = n.getPropertyOptions(i), o = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : I;
      this._$Em = i;
      const a = o.fromAttribute(t, r.type);
      this[i] = a ?? this._$Ej?.get(i) ?? a, this._$Em = null;
    }
  }
  requestUpdate(e, t, n, i = !1, r) {
    if (e !== void 0) {
      const o = this.constructor;
      if (i === !1 && (r = this[e]), n ??= o.getPropertyOptions(e), !((n.hasChanged ?? X)(r, t) || n.useDefault && n.reflect && r === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, n)))) return;
      this.C(e, t, n);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: n, reflect: i, wrapped: r }, o) {
    n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, o ?? t ?? this[e]), r !== !0 || o !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), i === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
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
        for (const [i, r] of this._$Ep) this[i] = r;
        this._$Ep = void 0;
      }
      const n = this.constructor.elementProperties;
      if (n.size > 0) for (const [i, r] of n) {
        const { wrapped: o } = r, a = this[i];
        o !== !0 || this._$AL.has(i) || a === void 0 || this.C(i, void 0, r, a);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((n) => n.hostUpdate?.()), this.update(t)) : this._$EM();
    } catch (n) {
      throw e = !1, this._$EM(), n;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((t) => t.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
    this._$Eq &&= this._$Eq.forEach((t) => this._$ET(t, this[t])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
k.elementStyles = [], k.shadowRootOptions = { mode: "open" }, k[M("elementProperties")] = /* @__PURE__ */ new Map(), k[M("finalized")] = /* @__PURE__ */ new Map(), Ie?.({ ReactiveElement: k }), (B.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const K = globalThis, ae = (s) => s, L = K.trustedTypes, le = L ? L.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, xe = "$lit$", v = `lit$${Math.random().toFixed(9).slice(2)}$`, ve = "?" + v, Le = `<${ve}>`, S = document, U = () => S.createComment(""), N = (s) => s === null || typeof s != "object" && typeof s != "function", Q = Array.isArray, We = (s) => Q(s) || typeof s?.[Symbol.iterator] == "function", q = `[ 	
\f\r]`, R = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ce = /-->/g, de = />/g, A = RegExp(`>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ue = /'/g, pe = /"/g, Ae = /^(?:script|style|textarea|title)$/i, Be = (s) => (e, ...t) => ({ _$litType$: s, strings: e, values: t }), f = Be(1), O = Symbol.for("lit-noChange"), u = Symbol.for("lit-nothing"), he = /* @__PURE__ */ new WeakMap(), E = S.createTreeWalker(S, 129);
function we(s, e) {
  if (!Q(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return le !== void 0 ? le.createHTML(e) : e;
}
const Fe = (s, e) => {
  const t = s.length - 1, n = [];
  let i, r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = R;
  for (let a = 0; a < t; a++) {
    const l = s[a];
    let c, d, p = -1, _ = 0;
    for (; _ < l.length && (o.lastIndex = _, d = o.exec(l), d !== null); ) _ = o.lastIndex, o === R ? d[1] === "!--" ? o = ce : d[1] !== void 0 ? o = de : d[2] !== void 0 ? (Ae.test(d[2]) && (i = RegExp("</" + d[2], "g")), o = A) : d[3] !== void 0 && (o = A) : o === A ? d[0] === ">" ? (o = i ?? R, p = -1) : d[1] === void 0 ? p = -2 : (p = o.lastIndex - d[2].length, c = d[1], o = d[3] === void 0 ? A : d[3] === '"' ? pe : ue) : o === pe || o === ue ? o = A : o === ce || o === de ? o = R : (o = A, i = void 0);
    const h = o === A && s[a + 1].startsWith("/>") ? " " : "";
    r += o === R ? l + Le : p >= 0 ? (n.push(c), l.slice(0, p) + xe + l.slice(p) + v + h) : l + v + (p === -2 ? a : h);
  }
  return [we(s, r + (s[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), n];
};
class T {
  constructor({ strings: e, _$litType$: t }, n) {
    let i;
    this.parts = [];
    let r = 0, o = 0;
    const a = e.length - 1, l = this.parts, [c, d] = Fe(e, t);
    if (this.el = T.createElement(c, n), E.currentNode = this.el.content, t === 2 || t === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (i = E.nextNode()) !== null && l.length < a; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const p of i.getAttributeNames()) if (p.endsWith(xe)) {
          const _ = d[o++], h = i.getAttribute(p).split(v), m = /([.?@])?(.*)/.exec(_);
          l.push({ type: 1, index: r, name: m[2], strings: h, ctor: m[1] === "." ? Ve : m[1] === "?" ? Ze : m[1] === "@" ? Je : F }), i.removeAttribute(p);
        } else p.startsWith(v) && (l.push({ type: 6, index: r }), i.removeAttribute(p));
        if (Ae.test(i.tagName)) {
          const p = i.textContent.split(v), _ = p.length - 1;
          if (_ > 0) {
            i.textContent = L ? L.emptyScript : "";
            for (let h = 0; h < _; h++) i.append(p[h], U()), E.nextNode(), l.push({ type: 2, index: ++r });
            i.append(p[_], U());
          }
        }
      } else if (i.nodeType === 8) if (i.data === ve) l.push({ type: 2, index: r });
      else {
        let p = -1;
        for (; (p = i.data.indexOf(v, p + 1)) !== -1; ) l.push({ type: 7, index: r }), p += v.length - 1;
      }
      r++;
    }
  }
  static createElement(e, t) {
    const n = S.createElement("template");
    return n.innerHTML = e, n;
  }
}
function z(s, e, t = s, n) {
  if (e === O) return e;
  let i = n !== void 0 ? t._$Co?.[n] : t._$Cl;
  const r = N(e) ? void 0 : e._$litDirective$;
  return i?.constructor !== r && (i?._$AO?.(!1), r === void 0 ? i = void 0 : (i = new r(s), i._$AT(s, t, n)), n !== void 0 ? (t._$Co ??= [])[n] = i : t._$Cl = i), i !== void 0 && (e = z(s, i._$AS(s, e.values), i, n)), e;
}
class qe {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: t }, parts: n } = this._$AD, i = (e?.creationScope ?? S).importNode(t, !0);
    E.currentNode = i;
    let r = E.nextNode(), o = 0, a = 0, l = n[0];
    for (; l !== void 0; ) {
      if (o === l.index) {
        let c;
        l.type === 2 ? c = new H(r, r.nextSibling, this, e) : l.type === 1 ? c = new l.ctor(r, l.name, l.strings, this, e) : l.type === 6 && (c = new Ye(r, this, e)), this._$AV.push(c), l = n[++a];
      }
      o !== l?.index && (r = E.nextNode(), o++);
    }
    return E.currentNode = S, i;
  }
  p(e) {
    let t = 0;
    for (const n of this._$AV) n !== void 0 && (n.strings !== void 0 ? (n._$AI(e, n, t), t += n.strings.length - 2) : n._$AI(e[t])), t++;
  }
}
class H {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, t, n, i) {
    this.type = 2, this._$AH = u, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = i, this._$Cv = i?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = z(this, e, t), N(e) ? e === u || e == null || e === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : e !== this._$AH && e !== O && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : We(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== u && N(this._$AH) ? this._$AA.nextSibling.data = e : this.T(S.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: t, _$litType$: n } = e, i = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = T.createElement(we(n.h, n.h[0]), this.options)), n);
    if (this._$AH?._$AD === i) this._$AH.p(t);
    else {
      const r = new qe(i, this), o = r.u(this.options);
      r.p(t), this.T(o), this._$AH = r;
    }
  }
  _$AC(e) {
    let t = he.get(e.strings);
    return t === void 0 && he.set(e.strings, t = new T(e)), t;
  }
  k(e) {
    Q(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let n, i = 0;
    for (const r of e) i === t.length ? t.push(n = new H(this.O(U()), this.O(U()), this, this.options)) : n = t[i], n._$AI(r), i++;
    i < t.length && (this._$AR(n && n._$AB.nextSibling, i), t.length = i);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    for (this._$AP?.(!1, !0, t); e !== this._$AB; ) {
      const n = ae(e).nextSibling;
      ae(e).remove(), e = n;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class F {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, n, i, r) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = e, this.name = t, this._$AM = i, this.options = r, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(new String()), this.strings = n) : this._$AH = u;
  }
  _$AI(e, t = this, n, i) {
    const r = this.strings;
    let o = !1;
    if (r === void 0) e = z(this, e, t, 0), o = !N(e) || e !== this._$AH && e !== O, o && (this._$AH = e);
    else {
      const a = e;
      let l, c;
      for (e = r[0], l = 0; l < r.length - 1; l++) c = z(this, a[n + l], t, l), c === O && (c = this._$AH[l]), o ||= !N(c) || c !== this._$AH[l], c === u ? e = u : e !== u && (e += (c ?? "") + r[l + 1]), this._$AH[l] = c;
    }
    o && !i && this.j(e);
  }
  j(e) {
    e === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Ve extends F {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === u ? void 0 : e;
  }
}
class Ze extends F {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== u);
  }
}
class Je extends F {
  constructor(e, t, n, i, r) {
    super(e, t, n, i, r), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = z(this, e, t, 0) ?? u) === O) return;
    const n = this._$AH, i = e === u && n !== u || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, r = e !== u && (n === u || i);
    i && this.element.removeEventListener(this.name, this, n), r && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Ye {
  constructor(e, t, n) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    z(this, e);
  }
}
const Ge = K.litHtmlPolyfillSupport;
Ge?.(T, H), (K.litHtmlVersions ??= []).push("3.3.3");
const Xe = (s, e, t) => {
  const n = t?.renderBefore ?? e;
  let i = n._$litPart$;
  if (i === void 0) {
    const r = t?.renderBefore ?? null;
    n._$litPart$ = i = new H(e.insertBefore(U(), r), r, void 0, t ?? {});
  }
  return i._$AI(s), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ee = globalThis;
class P extends k {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Xe(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return O;
  }
}
P._$litElement$ = !0, P.finalized = !0, ee.litElementHydrateSupport?.({ LitElement: P });
const Ke = ee.litElementPolyfillSupport;
Ke?.({ LitElement: P });
(ee.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Qe = (s) => (e, t) => {
  t !== void 0 ? t.addInitializer(() => {
    customElements.define(s, e);
  }) : customElements.define(s, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const et = { attribute: !0, type: String, converter: I, reflect: !1, hasChanged: X }, tt = (s = et, e, t) => {
  const { kind: n, metadata: i } = t;
  let r = globalThis.litPropertyMetadata.get(i);
  if (r === void 0 && globalThis.litPropertyMetadata.set(i, r = /* @__PURE__ */ new Map()), n === "setter" && ((s = Object.create(s)).wrapped = !0), r.set(t.name, s), n === "accessor") {
    const { name: o } = t;
    return { set(a) {
      const l = e.get.call(this);
      e.set.call(this, a), this.requestUpdate(o, l, s, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(o, void 0, s, a), a;
    } };
  }
  if (n === "setter") {
    const { name: o } = t;
    return function(a) {
      const l = this[o];
      e.call(this, a), this.requestUpdate(o, l, s, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + n);
};
function Ee(s) {
  return (e, t) => typeof t == "object" ? tt(s, e, t) : ((n, i, r) => {
    const o = i.hasOwnProperty(r);
    return i.constructor.createProperty(r, n), o ? Object.getOwnPropertyDescriptor(i, r) : void 0;
  })(s, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function C(s) {
  return Ee({ ...s, state: !0, attribute: !1 });
}
const st = "0.1.0", Se = "multizone-climate-scheduler-card", Ce = "Multi-Zone Climate Scheduler Card";
function me(s, e) {
  const t = s.states[e];
  if (!t || t.state === "unavailable" || t.state === "unknown")
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
  const n = t.attributes, i = (r) => typeof r == "number" ? r : null;
  return {
    available: !0,
    mode: t.state,
    action: typeof n.hvac_action == "string" ? n.hvac_action : "",
    setpoint: i(n.temperature),
    targetLow: i(n.target_temp_low),
    targetHigh: i(n.target_temp_high),
    inside: i(n.current_temperature),
    humidity: i(n.current_humidity)
  };
}
function nt(s, e) {
  return s.states[e]?.state === "active";
}
function it(s, e) {
  return s.states[e] !== void 0;
}
function rt(s, e) {
  const t = s.states[e]?.attributes.hvac_modes;
  return Array.isArray(t) ? t.filter((n) => typeof n == "string") : [];
}
function ot(s, e) {
  const t = s.states[e]?.attributes.preset_modes;
  return Array.isArray(t) && t.includes("eco");
}
function fe(s, e) {
  return s.states[e]?.attributes.preset_mode === "eco";
}
function _e(s, e) {
  const t = s.states[e];
  if (!t) return null;
  const n = Number(t.state);
  return Number.isFinite(n) ? n : null;
}
function at(s, e) {
  const t = s.states[e], n = typeof t?.attributes.friendly_name == "string" ? t.attributes.friendly_name.replace(/ (Temperature|temperature)$/, "") : e.split(".")[1] ?? e, i = t ? Number(t.state) : NaN;
  return { entityId: e, name: n, temp: Number.isFinite(i) ? i : null };
}
function lt(s, e, t) {
  return s.callService("climate", "set_hvac_mode", { entity_id: e, hvac_mode: t });
}
function ct(s, e, t) {
  return s.callService("climate", "set_preset_mode", {
    entity_id: e,
    preset_mode: t ? "eco" : "none"
  });
}
function dt(s, e) {
  const t = s.states[e]?.attributes.fan_modes;
  return Array.isArray(t) && t.includes("on");
}
async function ut(s, e, t, n) {
  dt(s, e) && await s.callService("climate", "set_fan_mode", {
    entity_id: e,
    fan_mode: "on"
  });
  const i = String(n % 60).padStart(2, "0"), r = String(Math.floor(n / 60)).padStart(2, "0");
  await s.callService("timer", "start", {
    entity_id: t,
    duration: `${r}:${i}:00`
  });
}
function pt(s, e, t, n) {
  const i = typeof t == "number" ? t : null, r = typeof n == "number" ? n : null;
  return i != null && r != null && i < r && e != null && e >= i && e <= r ? Math.min(r, Math.max(i, s)) : s;
}
function ht(s, e, t) {
  return s.callService("climate", "set_temperature", {
    entity_id: e,
    temperature: t
  });
}
const te = {
  fan_timer: { domain: "timer", suffix: "fan" },
  room_override_timer: { domain: "timer", suffix: "room_override" },
  running_sensor: { domain: "binary_sensor", suffix: "running" },
  runtime_today: { domain: "sensor", suffix: "runtime_today" },
  expected_runtime: { domain: "sensor", suffix: "expected_runtime" },
  target_room_select: { domain: "input_select", suffix: "target_room" },
  sensor_schedule: { domain: "schedule", suffix: "sensor_schedule" }
}, se = {
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
  next_block_sensor: { domain: "sensor", suffix: "next_block" }
};
[
  ...Object.values(te).map((s) => s.suffix),
  ...Object.values(se).map((s) => s.suffix)
];
function V(s) {
  return s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function y(s, e, t) {
  const n = te[s];
  return `${n.domain}.${e}_${t}_${n.suffix}`;
}
function mt(s, e, t) {
  return `schedule.${s}_${e}_${t}`;
}
function w(s, e) {
  const t = se[s];
  return `${t.domain}.${e}_${t.suffix}`;
}
function $e(s, e) {
  return `${s}_mzcs_${e}`;
}
function ge(s, e) {
  return {
    engine: "Climate: schedule engine",
    fan_timer: `Climate: ${e ?? "?"} fan timer finished`,
    season_recommender: "Climate: season recommender",
    runtime_alert: "Climate: runtime anomaly alert",
    watchdog: "Climate: engine watchdog",
    steering: "Climate: comfort steering"
  }[s] ?? `Climate: ${s}`;
}
function ft(s, e, t, n) {
  const i = s.indexOf(".");
  if (i < 0) return null;
  const r = s.slice(0, i), o = s.slice(i + 1);
  if (o !== e && !o.startsWith(`${e}_`)) return null;
  const a = o.slice(e.length + 1);
  for (const [c, d] of Object.entries(se))
    if (r === d.domain && a === d.suffix) return { cls: c };
  const l = [...t].sort((c, d) => d.length - c.length);
  for (const c of l) {
    if (a !== c && !a.startsWith(`${c}_`)) continue;
    const d = a.slice(c.length + 1);
    for (const [p, _] of Object.entries(te))
      if (r === _.domain && d === _.suffix) return { cls: p, zone: c };
    if (r === "schedule" && n.includes(d))
      return { cls: "zone_schedule", zone: c, season: d };
  }
  return null;
}
const ke = 2, Oe = 4;
function _t(s, e = ke, t = Oe) {
  const n = Math.abs(s);
  return n <= e ? "green" : n <= t ? "amber" : "red";
}
function $t(s) {
  const e = Math.round(s);
  return `${e > 0 ? "+" : ""}${e}°`;
}
function gt(s, e) {
  let t = s != null && s > 0 ? s : ke, n = e != null && e > 0 ? e : Oe;
  return n <= t && (n = t + 1), { greenMax: t, amberMax: n };
}
const J = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
], bt = ["monday", "tuesday", "wednesday", "thursday", "friday"], yt = ["saturday", "sunday"];
function xt(s) {
  const e = [];
  s.length === 0 && e.push("A day needs at least one block.");
  const t = /* @__PURE__ */ new Set();
  for (const n of s)
    /^([01]\d|2[0-3]):[0-5]\d$/.test(n.time) || e.push(`Bad time "${n.time}".`), t.has(n.time) && e.push(`Duplicate block time ${n.time}.`), t.add(n.time), n.mode === "cool" && n.cool_temp == null && e.push(`${n.name}: cool needs cool_temp.`), n.mode === "heat" && n.heat_temp == null && e.push(`${n.name}: heat needs heat_temp.`), n.mode === "heat_cool" && (n.cool_temp == null || n.heat_temp == null) && e.push(`${n.name}: heat_cool needs both cool_temp and heat_temp.`), n.cool_temp != null && n.heat_temp != null && n.heat_temp >= n.cool_temp && e.push(`${n.name}: heat_temp must be below cool_temp.`);
  return e;
}
function Z(s) {
  return { block: s.name, mode: s.mode, cool_temp: s.cool_temp, heat_temp: s.heat_temp };
}
function vt(s) {
  const e = xt(s);
  if (e.length > 0) throw new Error(e.join(" "));
  const t = [...s].sort((o, a) => o.time.localeCompare(a.time)), n = t[0], i = t[t.length - 1];
  if (t.length === 1)
    return [{ from: "00:00:00", to: "24:00:00", data: Z(n) }];
  const r = [];
  n.time !== "00:00" && r.push({ from: "00:00:00", to: `${n.time}:00`, data: Z(i) });
  for (let o = 0; o < t.length; o++) {
    const a = t[o], l = t[o + 1];
    r.push({
      from: `${a.time}:00`,
      to: l ? `${l.time}:00` : "24:00:00",
      data: Z(a)
    });
  }
  return r;
}
function At(s, e) {
  if (s === "all" && e === "all") return J;
  if (s === "wdwe" && e === "wd") return bt;
  if (s === "wdwe" && e === "we") return yt;
  if (s === "days" && J.includes(e.toLowerCase()))
    return [e.toLowerCase()];
  throw new Error(`Unknown set "${e}" for granularity "${s}".`);
}
function wt(s, e) {
  const t = {};
  for (const [n, i] of Object.entries(e)) {
    const r = vt(i);
    for (const o of At(s, n))
      t[o] = r;
  }
  for (const n of J)
    if (!t[n]) throw new Error(`No block set covers ${n}.`);
  return t;
}
const Et = "mzcs", be = "r1", St = [
  { cls: "season_confirm_days", min: 1, max: 14, step: 1, initial: 3 },
  { cls: "season_dwell_days", min: 1, max: 60, step: 1, initial: 14 },
  { cls: "dev_green_max", min: 1, max: 10, step: 1, initial: 2, unit: "°F" },
  { cls: "dev_amber_max", min: 1, max: 15, step: 1, initial: 4, unit: "°F" },
  { cls: "runtime_alert_margin", min: 5, max: 100, step: 5, initial: 35, unit: "%" },
  { cls: "runtime_alert_days", min: 1, max: 7, step: 1, initial: 3 },
  { cls: "runtime_learn_days", min: 7, max: 60, step: 1, initial: 30 },
  { cls: "cdd_base", min: 60, max: 80, step: 1, initial: 75, unit: "°F" }
], Ct = [
  { cls: "override_minutes", min: 15, max: 240, step: 15, initial: 60 },
  { cls: "steer_min_setpoint", min: 50, max: 80, step: 1, initial: 68 },
  { cls: "steer_max_setpoint", min: 70, max: 95, step: 1, initial: 85 },
  { cls: "steer_max_offset", min: 1, max: 10, step: 1, initial: 5 }
];
function kt(s) {
  return wt(s.granularity, s.sets);
}
function Ot(s) {
  const e = [], t = s.prefix;
  for (const i of s.zones) {
    s.features.fan_timer && e.push({
      id: y("fan_timer", t, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} fan`, restore: !0 }
    }), e.push({
      id: y("running_sensor", t, i.slug),
      kind: "template_sensor",
      spec: { name: `Climate ${i.name} running`, source: "hvac_action" }
    }), e.push({
      id: y("runtime_today", t, i.slug),
      kind: "stats_sensor",
      spec: { name: `Climate ${i.name} runtime today`, state_class: "total_increasing" }
    }), e.push({
      id: y("expected_runtime", t, i.slug),
      kind: "template_sensor",
      spec: { name: `Climate ${i.name} expected runtime`, model: "k_x_cdd" }
    }), s.features.steering && (e.push({
      id: y("target_room_select", t, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} target room`, options: ["Thermostat"] }
    }), e.push({
      id: y("room_override_timer", t, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} room override`, restore: !0 }
    }), e.push({
      id: y("sensor_schedule", t, i.slug),
      kind: "schedule",
      spec: { name: `Climate ${i.name} sensor schedule` }
    }));
    for (const r of s.seasons) {
      const o = s.schedules[i.slug]?.[r.key];
      if (!o) throw new Error(`Missing schedule for ${i.slug}/${r.key}.`);
      e.push({
        id: mt(t, i.slug, r.key),
        kind: "schedule",
        spec: { name: `Climate ${i.name} ${r.name}`, week: kt(o) }
      });
    }
  }
  e.push({
    id: w("season_select", t),
    kind: "helper",
    spec: { name: "Climate season", options: s.seasons.map((i) => i.name) }
  }), e.push({
    id: w("season_mode", t),
    kind: "helper",
    spec: { name: "Climate season mode", options: ["Manual", "Semi-auto", "Full-auto"] }
  });
  for (const i of St)
    e.push({
      id: w(i.cls, t),
      kind: "helper",
      spec: { min: i.min, max: i.max, step: i.step, initial: i.initial, ...i.unit ? { unit: i.unit } : {} }
    });
  if (s.features.steering)
    for (const i of Ct)
      e.push({
        id: w(i.cls, t),
        kind: "helper",
        spec: { min: i.min, max: i.max, step: i.step, initial: i.initial }
      });
  e.push({
    id: w("next_block_sensor", t),
    kind: "template_sensor",
    spec: { name: "Climate next block" }
  });
  const n = (i, r) => ({
    id: `automation:${$e(t, i)}`,
    kind: "automation",
    spec: { alias: ge(i, r), revision: be }
  });
  if (e.push(n("engine")), e.push(n("watchdog")), s.seasons.length > 1 && e.push(n("season_recommender")), s.features.anomaly_alerts && e.push(n("runtime_alert")), s.features.fan_timer)
    for (const i of s.zones)
      e.push({
        id: `automation:${$e(t, `fan_timer_${i.slug}`)}`,
        kind: "automation",
        spec: { alias: ge("fan_timer", i.name), revision: be }
      });
  return s.features.steering && e.push(n("steering")), e;
}
function zt(s, e) {
  return W(s) === W(e);
}
function W(s) {
  if (Array.isArray(s)) return `[${s.map(W).join(",")}]`;
  if (s !== null && typeof s == "object") {
    const e = s;
    return `{${Object.keys(e).sort().map((t) => `${JSON.stringify(t)}:${W(e[t])}`).join(",")}}`;
  }
  return JSON.stringify(s);
}
function Rt(s, e) {
  const t = { create: [], adopt: [], update: [], delete: [], noop: [] }, n = new Map(e.map((r) => [r.id, r])), i = new Set(s.map((r) => r.id));
  for (const r of s) {
    const o = n.get(r.id);
    o ? o.managed ? zt(o.spec, r.spec) ? t.noop.push({ op: "noop", id: r.id, kind: r.kind }) : t.update.push({ op: "update", id: r.id, kind: r.kind, spec: r.spec, from: o.spec }) : t.adopt.push({ op: "adopt", id: r.id, kind: r.kind, spec: r.spec }) : t.create.push({ op: "create", id: r.id, kind: r.kind, spec: r.spec });
  }
  for (const r of e)
    r.managed && !i.has(r.id) && t.delete.push({ op: "delete", id: r.id, kind: r.kind });
  return t;
}
function Mt(s) {
  const e = s.default_mode;
  return { granularity: "all", sets: { all: [{
    time: "06:00",
    name: "Day",
    mode: e,
    cool_temp: e === "heat" ? null : e === "heat_cool" ? 84 : 78,
    heat_temp: e === "heat" ? 68 : e === "heat_cool" ? 66 : null
  }] } };
}
function Pt(s, e) {
  const t = {};
  for (const n of s) {
    t[n] = {};
    for (const i of e) t[n][i.key] = Mt(i);
  }
  return t;
}
const Ut = {
  fan_timer: "helper",
  room_override_timer: "helper",
  target_room_select: "helper",
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
async function D(s, e) {
  if (!s.callWS) return [];
  try {
    const t = await s.callWS({ type: `${e}/list` });
    return Array.isArray(t) ? t : [];
  } catch {
    return [];
  }
}
async function Nt(s, e) {
  const t = /* @__PURE__ */ new Map();
  if (!s.callWS || e.length === 0) return t;
  try {
    const n = await s.callWS({
      type: "config/entity_registry/get_entries",
      entity_ids: e
    });
    for (const [i, r] of Object.entries(n ?? {}))
      r?.labels && t.set(i, r.labels);
  } catch {
  }
  return t;
}
async function Tt(s, e, t, n) {
  const i = [];
  for (const h of Object.keys(s.states)) {
    const m = ft(h, e, t, n);
    if (!m) continue;
    const $ = Ut[m.cls];
    $ && i.push({ id: h, kind: $ });
  }
  const [r, o, a, l, c] = await Promise.all([
    D(s, "timer"),
    D(s, "input_select"),
    D(s, "input_number"),
    D(s, "schedule"),
    Nt(
      s,
      i.map((h) => h.id)
    )
  ]), d = (h, m) => {
    const $ = /* @__PURE__ */ new Map();
    for (const b of h) b.id && $.set(`${m}.${b.id}`, b);
    return $;
  }, p = new Map([
    ...d(r, "timer"),
    ...d(o, "input_select"),
    ...d(a, "input_number"),
    ...d(l, "schedule")
  ]), _ = [];
  for (const h of i) {
    const m = p.get(h.id), $ = s.states[h.id];
    let b = {};
    h.id.startsWith("input_number.") && m ? b = { min: m.min, max: m.max, step: m.step } : h.id.startsWith("input_select.") && m ? b = { name: m.name, options: m.options } : h.id.startsWith("timer.") && m ? b = { name: m.name, restore: m.restore ?? !1 } : h.id.startsWith("schedule.") && m ? b = { name: m.name, raw: !0 } : $ && (b = { name: $.attributes.friendly_name ?? h.id }), _.push({
      id: h.id,
      kind: h.kind,
      spec: b,
      managed: (c.get(h.id) ?? []).includes(Et)
    });
  }
  for (const [h, m] of Object.entries(s.states)) {
    if (!h.startsWith("automation.") || !m) continue;
    const $ = m.attributes.id;
    typeof $ == "string" && $.startsWith(`${e}_mzcs_`) && _.push({
      id: `automation:${$}`,
      kind: "automation",
      spec: { alias: m.attributes.friendly_name ?? $, revision: "unknown" },
      managed: !0
    });
  }
  return _;
}
var Ht = Object.defineProperty, Dt = Object.getOwnPropertyDescriptor, x = (s, e, t, n) => {
  for (var i = n > 1 ? void 0 : n ? Dt(e, t) : e, r = s.length - 1, o; r >= 0; r--)
    (o = s[r]) && (i = (n ? o(e, t, i) : o(i)) || i);
  return n && i && Ht(e, t, i), i;
};
const jt = {
  heat: "Heat",
  cool: "Cool",
  heat_cool: "Heat·Cool",
  off: "Off",
  auto: "Auto",
  dry: "Dry",
  fan_only: "Fan only"
};
console.info(`%c ${Ce} %c v${st}`, "background:#1e88e5;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;", "background:#243039;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;");
let g = class extends P {
  constructor() {
    super(...arguments), this._zoneIndex = 0, this._ctrlOpen = !1, this._setupOpen = !1, this._dryRunning = !1;
  }
  setConfig(s) {
    if (!s.zones || !Array.isArray(s.zones) || s.zones.length < 1)
      throw new Error("At least one zone with a climate entity is required.");
    if (s.zones.length > 4)
      throw new Error("A maximum of 4 zones is supported.");
    for (const e of s.zones)
      if (!e.entity || !e.entity.startsWith("climate."))
        throw new Error(`Zone "${e.name ?? e.entity}" needs a climate.* entity.`);
    this._config = s, this._zoneIndex >= s.zones.length && (this._zoneIndex = 0);
  }
  static getStubConfig() {
    return { zones: [] };
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
  _nudge(s) {
    const e = this._zone();
    if (!e || !this.hass) return;
    const t = me(this.hass, e.entity);
    if (t.setpoint == null) return;
    const n = this.hass.states[e.entity]?.attributes, i = pt(
      t.setpoint + s,
      t.setpoint,
      n?.min_temp,
      n?.max_temp
    );
    i !== t.setpoint && ht(this.hass, e.entity, i);
  }
  _provisionInput() {
    const s = this._config, e = s.zones.map((n) => ({ slug: V(n.name), name: n.name })), t = s.seasons ?? [
      { key: "summer", name: "Summer", default_mode: "cool" },
      { key: "winter", name: "Winter", default_mode: "heat_cool" }
    ];
    return {
      prefix: this._prefix,
      zones: e,
      seasons: t,
      schedules: Pt(
        e.map((n) => n.slug),
        t
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
        const s = this._provisionInput(), e = await Tt(
          this.hass,
          s.prefix,
          s.zones.map((t) => t.slug),
          s.seasons.map((t) => t.key)
        );
        this._dryRun = Rt(Ot(s), e);
      } catch (s) {
        this._dryRunError = s instanceof Error ? s.message : String(s);
      } finally {
        this._dryRunning = !1;
      }
    }
  }
  _renderSetup() {
    const s = this._dryRun;
    return f`
      <div class="setup">
        <p class="setup-title">Setup · dry run</p>
        <p class="setup-sub">
          Read-only preview of what Setup would create. Nothing is written from this screen.
        </p>
        <button class="chip" .disabled=${this._dryRunning} @click=${() => void this._runDryRun()}>
          ${this._dryRunning ? "Reading registry…" : "Run dry-run preview"}
        </button>
        ${this._dryRunError ? f`<p class="setup-err">${this._dryRunError}</p>` : u}
        ${s ? f`
              <div class="planwrap">
                ${[
      ["Create", s.create, ""],
      ["Adopt", s.adopt, ""],
      ["Update", s.update, ""],
      ["Delete", s.delete, "del"],
      ["Unchanged", s.noop, "quiet"]
    ].map(
      ([e, t, n]) => f`
                    <p class="plan-h ${n}">${e} (${t.length})</p>
                    ${t.length > 0 && e !== "Unchanged" ? f`<ul class="plan-list ${n}">
                          ${t.map((i) => f`<li>${i.id}</li>`)}
                        </ul>` : u}
                  `
    )}
              </div>
            ` : u}
        <button class="chip" @click=${() => this._setupOpen = !1}>Close</button>
      </div>
    `;
  }
  render() {
    if (!this._config || !this.hass) return u;
    const s = this._zone();
    if (!s) return u;
    if (this._setupOpen)
      return f`<ha-card><div class="wrap">${this._renderSetup()}</div></ha-card>`;
    const e = me(this.hass, s.entity), t = nt(
      this.hass,
      y("fan_timer", this._prefix, V(s.name))
    ), n = e.action === "cooling", i = e.action === "heating", r = e.available ? n ? `Cooling to ${e.setpoint}` : i ? `Heating to ${e.setpoint}` : e.mode === "off" ? "Off" : `Idle · set ${e.setpoint ?? "–"}` : "Unavailable";
    return f`
      <ha-card>
        <div class="wrap">
          <div class="tabs" role="tablist">
            ${this._config.zones.map(
      (o, a) => f`
                <button
                  role="tab"
                  aria-selected=${a === this._zoneIndex}
                  class=${a === this._zoneIndex ? "tab on" : "tab"}
                  @click=${() => {
        this._zoneIndex = a;
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
              <p class="name">${s.name}</p>
              <p class="status">
                ${r}${e.inside != null ? ` · inside ${e.inside}°` : ""}${e.humidity != null ? ` · ${e.humidity}% RH` : ""}${t ? f`<span class="fan"> · fan on</span>` : ""}
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

          ${this._renderControls(s.entity)} ${this._renderRooms(s, e.setpoint)}
        </div>
      </ha-card>
    `;
  }
  _renderControls(s) {
    if (!this.hass) return u;
    const e = this.hass, t = this._zone();
    if (!t) return u;
    const n = rt(e, s), i = e.states[s]?.state, r = ot(e, s), o = y("fan_timer", this._prefix, V(t.name)), a = this._config?.features?.fan_timer ?? [15, 30, 60], l = it(e, o);
    return f`
      <button class="expander" @click=${() => this._ctrlOpen = !this._ctrlOpen}>
        <span>Mode</span>
        <span aria-hidden="true">${this._ctrlOpen ? "▴" : "▾"}</span>
      </button>
      ${this._ctrlOpen ? f`
            <div class="ctrl">
              <div class="chips">
                ${n.map(
      (c) => f`
                    <button
                      class=${i === c ? "chip mode-on" : "chip"}
                      @click=${() => void lt(e, s, c)}
                    >
                      ${jt[c] ?? c}
                    </button>
                  `
    )}
                ${r ? f`
                      <button
                        class=${fe(e, s) ? "chip eco eco-on" : "chip eco"}
                        @click=${() => void ct(e, s, !fe(e, s))}
                      >
                        Eco
                      </button>
                    ` : u}
              </div>
              ${l ? f`
                    <div class="chips fanrow">
                      <span class="fanlbl">Fan</span>
                      ${a.map(
      (c) => f`
                          <button
                            class="chip"
                            @click=${() => void ut(e, s, o, c)}
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
  _renderRooms(s, e) {
    if (!this.hass || !s.room_sensors || s.room_sensors.length === 0) return u;
    const t = this.hass, { greenMax: n, amberMax: i } = gt(
      _e(t, w("dev_green_max", this._prefix)),
      _e(t, w("dev_amber_max", this._prefix))
    );
    return f`
      <div class="rooms">
        ${s.room_sensors.map((r) => {
      const o = at(t, r);
      if (o.temp == null || e == null)
        return f`
              <div class="room">
                <span class="rname">${o.name}</span>
                <span class="rtemp muted">${o.temp == null ? "—" : `${o.temp}°`}</span>
              </div>
            `;
      const a = Math.round(o.temp - e);
      return f`
            <div class="room">
              <span class="rname">${o.name}</span>
              <span>
                <span class="badge ${_t(a, n, i)}"
                  >${$t(a)}</span
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
g.styles = Re`
    .wrap {
      padding: 12px;
      color: var(--primary-text-color, #e1e6ea);
    }
    .tabs {
      display: flex;
      gap: 4px;
      background: var(--secondary-background-color, #16202a);
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
      color: var(--secondary-text-color, #9fb0bd);
      font-size: 12px;
      cursor: pointer;
    }
    .tab.on {
      background: var(--card-background-color, #2b3844);
      color: var(--primary-text-color, #fff);
      font-weight: 500;
    }
    .hero {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--secondary-background-color, #243039);
      border-radius: 12px;
      padding: 12px 14px;
    }
    .dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--disabled-text-color, #9fb0bd);
      flex: none;
    }
    .dot.cool {
      background: #1e88e5;
    }
    .dot.heat {
      background: #f59e0b;
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
      color: var(--secondary-text-color, #9fb0bd);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .fan {
      color: #1e88e5;
    }
    .nudge {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 0.5px solid var(--divider-color, #3d4a55);
      background: var(--card-background-color, #2b3844);
      color: var(--primary-text-color, #e8edf1);
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
      color: var(--secondary-text-color, #9fb0bd);
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
      background: var(--card-background-color, #2b3844);
      border: 0.5px solid var(--divider-color, #3d4a55);
      color: var(--secondary-text-color, #9fb0bd);
      font-size: 12px;
      cursor: pointer;
    }
    .chip.mode-on {
      background: #1e88e5;
      border-color: #1e88e5;
      color: #fff;
    }
    .chip.eco {
      border-color: #2bb673;
      color: #2bb673;
    }
    .chip.eco-on {
      background: #2bb673;
      color: #fff;
    }
    .fanrow {
      margin-top: 8px;
      align-items: center;
    }
    .fanlbl {
      font-size: 12px;
      color: var(--secondary-text-color, #9fb0bd);
      padding: 6px 0;
    }
    .rooms {
      border-top: 0.5px solid var(--divider-color, #33414c);
      margin-top: 6px;
    }
    .room {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 2px;
      border-bottom: 0.5px solid var(--divider-color, #33414c);
      font-size: 13px;
    }
    .room:last-child {
      border-bottom: none;
    }
    .rtemp {
      font-size: 14px;
    }
    .muted {
      color: var(--disabled-text-color, #7a8894);
    }
    .badge {
      font-size: 11px;
      border-radius: 9px;
      padding: 2px 7px;
      margin-right: 8px;
      color: #16202a;
    }
    .badge.green {
      background: #2bb673;
    }
    .badge.amber {
      background: #f59e0b;
    }
    .badge.red {
      background: #e5484d;
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
      color: var(--secondary-text-color, #9fb0bd);
    }
    .setup-err {
      color: #e5484d;
      font-size: 12px;
    }
    .planwrap {
      width: 100%;
      max-height: 320px;
      overflow-y: auto;
      border: 0.5px solid var(--divider-color, #33414c);
      border-radius: 10px;
      padding: 8px 10px;
    }
    .plan-h {
      margin: 6px 0 2px;
      font-size: 13px;
      font-weight: 500;
    }
    .plan-h.del {
      color: #e5484d;
    }
    .plan-h.quiet {
      color: var(--secondary-text-color, #9fb0bd);
      font-weight: 400;
    }
    .plan-list {
      margin: 0 0 4px;
      padding-left: 18px;
      font-size: 11px;
      color: var(--secondary-text-color, #9fb0bd);
    }
    .plan-list.del li {
      color: #e5484d;
    }
  `;
x([
  Ee({ attribute: !1 })
], g.prototype, "hass", 2);
x([
  C()
], g.prototype, "_config", 2);
x([
  C()
], g.prototype, "_zoneIndex", 2);
x([
  C()
], g.prototype, "_ctrlOpen", 2);
x([
  C()
], g.prototype, "_setupOpen", 2);
x([
  C()
], g.prototype, "_dryRun", 2);
x([
  C()
], g.prototype, "_dryRunError", 2);
x([
  C()
], g.prototype, "_dryRunning", 2);
g = x([
  Qe(Se)
], g);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: Se,
  name: Ce,
  description: "Nest-style climate view for 1-4 zones with seasonal scheduling, fan timers, and runtime history."
});
export {
  g as MzcsCard
};

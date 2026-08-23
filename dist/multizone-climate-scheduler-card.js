/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const B = globalThis, X = B.ShadowRoot && (B.ShadyCSS === void 0 || B.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Q = Symbol(), ae = /* @__PURE__ */ new WeakMap();
let Ee = class {
  constructor(e, t, n) {
    if (this._$cssResult$ = !0, n !== Q) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (X && e === void 0) {
      const n = t !== void 0 && t.length === 1;
      n && (e = ae.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && ae.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Ue = (s) => new Ee(typeof s == "string" ? s : s + "", void 0, Q), He = (s, ...e) => {
  const t = s.length === 1 ? s[0] : e.reduce((n, i, o) => n + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + s[o + 1], s[0]);
  return new Ee(t, s, Q);
}, We = (s, e) => {
  if (X) s.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const n = document.createElement("style"), i = B.litNonce;
    i !== void 0 && n.setAttribute("nonce", i), n.textContent = t.cssText, s.appendChild(n);
  }
}, ce = X ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const n of e.cssRules) t += n.cssText;
  return Ue(t);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ie, defineProperty: je, getOwnPropertyDescriptor: Be, getOwnPropertyNames: Le, getOwnPropertySymbols: Fe, getPrototypeOf: qe } = Object, Y = globalThis, le = Y.trustedTypes, Ve = le ? le.emptyScript : "", Ye = Y.reactiveElementPolyfillSupport, T = (s, e) => s, L = { toAttribute(s, e) {
  switch (e) {
    case Boolean:
      s = s ? Ve : null;
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
} }, ee = (s, e) => !Ie(s, e), de = { attribute: !0, type: String, converter: L, reflect: !1, useDefault: !1, hasChanged: ee };
Symbol.metadata ??= Symbol("metadata"), Y.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let z = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = de) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const n = Symbol(), i = this.getPropertyDescriptor(e, n, t);
      i !== void 0 && je(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, t, n) {
    const { get: i, set: o } = Be(this.prototype, e) ?? { get() {
      return this[t];
    }, set(r) {
      this[t] = r;
    } };
    return { get: i, set(r) {
      const a = i?.call(this);
      o?.call(this, r), this.requestUpdate(e, a, n);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? de;
  }
  static _$Ei() {
    if (this.hasOwnProperty(T("elementProperties"))) return;
    const e = qe(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(T("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(T("properties"))) {
      const t = this.properties, n = [...Le(t), ...Fe(t)];
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
      for (const i of n) t.unshift(ce(i));
    } else e !== void 0 && t.push(ce(e));
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
    return We(e, this.constructor.elementStyles), e;
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
      const o = (n.converter?.toAttribute !== void 0 ? n.converter : L).toAttribute(t, n.type);
      this._$Em = e, o == null ? this.removeAttribute(i) : this.setAttribute(i, o), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const n = this.constructor, i = n._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const o = n.getPropertyOptions(i), r = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : L;
      this._$Em = i;
      const a = r.fromAttribute(t, o.type);
      this[i] = a ?? this._$Ej?.get(i) ?? a, this._$Em = null;
    }
  }
  requestUpdate(e, t, n, i = !1, o) {
    if (e !== void 0) {
      const r = this.constructor;
      if (i === !1 && (o = this[e]), n ??= r.getPropertyOptions(e), !((n.hasChanged ?? ee)(o, t) || n.useDefault && n.reflect && o === this._$Ej?.get(e) && !this.hasAttribute(r._$Eu(e, n)))) return;
      this.C(e, t, n);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: n, reflect: i, wrapped: o }, r) {
    n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, r ?? t ?? this[e]), o !== !0 || r !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), i === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
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
        for (const [i, o] of this._$Ep) this[i] = o;
        this._$Ep = void 0;
      }
      const n = this.constructor.elementProperties;
      if (n.size > 0) for (const [i, o] of n) {
        const { wrapped: r } = o, a = this[i];
        r !== !0 || this._$AL.has(i) || a === void 0 || this.C(i, void 0, o, a);
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
z.elementStyles = [], z.shadowRootOptions = { mode: "open" }, z[T("elementProperties")] = /* @__PURE__ */ new Map(), z[T("finalized")] = /* @__PURE__ */ new Map(), Ye?.({ ReactiveElement: z }), (Y.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const te = globalThis, ue = (s) => s, F = te.trustedTypes, pe = F ? F.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, ke = "$lit$", A = `lit$${Math.random().toFixed(9).slice(2)}$`, Ce = "?" + A, Ke = `<${Ce}>`, C = document, U = () => C.createComment(""), H = (s) => s === null || typeof s != "object" && typeof s != "function", se = Array.isArray, Ze = (s) => se(s) || typeof s?.[Symbol.iterator] == "function", Z = `[ 	
\f\r]`, P = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, he = /-->/g, me = />/g, S = RegExp(`>|${Z}(?:([^\\s"'>=/]+)(${Z}*=${Z}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), fe = /'/g, _e = /"/g, Oe = /^(?:script|style|textarea|title)$/i, Je = (s) => (e, ...t) => ({ _$litType$: s, strings: e, values: t }), m = Je(1), M = Symbol.for("lit-noChange"), u = Symbol.for("lit-nothing"), ge = /* @__PURE__ */ new WeakMap(), E = C.createTreeWalker(C, 129);
function ze(s, e) {
  if (!se(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return pe !== void 0 ? pe.createHTML(e) : e;
}
const Ge = (s, e) => {
  const t = s.length - 1, n = [];
  let i, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", r = P;
  for (let a = 0; a < t; a++) {
    const c = s[a];
    let l, d, p = -1, _ = 0;
    for (; _ < c.length && (r.lastIndex = _, d = r.exec(c), d !== null); ) _ = r.lastIndex, r === P ? d[1] === "!--" ? r = he : d[1] !== void 0 ? r = me : d[2] !== void 0 ? (Oe.test(d[2]) && (i = RegExp("</" + d[2], "g")), r = S) : d[3] !== void 0 && (r = S) : r === S ? d[0] === ">" ? (r = i ?? P, p = -1) : d[1] === void 0 ? p = -2 : (p = r.lastIndex - d[2].length, l = d[1], r = d[3] === void 0 ? S : d[3] === '"' ? _e : fe) : r === _e || r === fe ? r = S : r === he || r === me ? r = P : (r = S, i = void 0);
    const h = r === S && s[a + 1].startsWith("/>") ? " " : "";
    o += r === P ? c + Ke : p >= 0 ? (n.push(l), c.slice(0, p) + ke + c.slice(p) + A + h) : c + A + (p === -2 ? a : h);
  }
  return [ze(s, o + (s[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), n];
};
class W {
  constructor({ strings: e, _$litType$: t }, n) {
    let i;
    this.parts = [];
    let o = 0, r = 0;
    const a = e.length - 1, c = this.parts, [l, d] = Ge(e, t);
    if (this.el = W.createElement(l, n), E.currentNode = this.el.content, t === 2 || t === 3) {
      const p = this.el.content.firstChild;
      p.replaceWith(...p.childNodes);
    }
    for (; (i = E.nextNode()) !== null && c.length < a; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const p of i.getAttributeNames()) if (p.endsWith(ke)) {
          const _ = d[r++], h = i.getAttribute(p).split(A), f = /([.?@])?(.*)/.exec(_);
          c.push({ type: 1, index: o, name: f[2], strings: h, ctor: f[1] === "." ? Qe : f[1] === "?" ? et : f[1] === "@" ? tt : K }), i.removeAttribute(p);
        } else p.startsWith(A) && (c.push({ type: 6, index: o }), i.removeAttribute(p));
        if (Oe.test(i.tagName)) {
          const p = i.textContent.split(A), _ = p.length - 1;
          if (_ > 0) {
            i.textContent = F ? F.emptyScript : "";
            for (let h = 0; h < _; h++) i.append(p[h], U()), E.nextNode(), c.push({ type: 2, index: ++o });
            i.append(p[_], U());
          }
        }
      } else if (i.nodeType === 8) if (i.data === Ce) c.push({ type: 2, index: o });
      else {
        let p = -1;
        for (; (p = i.data.indexOf(A, p + 1)) !== -1; ) c.push({ type: 7, index: o }), p += A.length - 1;
      }
      o++;
    }
  }
  static createElement(e, t) {
    const n = C.createElement("template");
    return n.innerHTML = e, n;
  }
}
function R(s, e, t = s, n) {
  if (e === M) return e;
  let i = n !== void 0 ? t._$Co?.[n] : t._$Cl;
  const o = H(e) ? void 0 : e._$litDirective$;
  return i?.constructor !== o && (i?._$AO?.(!1), o === void 0 ? i = void 0 : (i = new o(s), i._$AT(s, t, n)), n !== void 0 ? (t._$Co ??= [])[n] = i : t._$Cl = i), i !== void 0 && (e = R(s, i._$AS(s, e.values), i, n)), e;
}
class Xe {
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
    const { el: { content: t }, parts: n } = this._$AD, i = (e?.creationScope ?? C).importNode(t, !0);
    E.currentNode = i;
    let o = E.nextNode(), r = 0, a = 0, c = n[0];
    for (; c !== void 0; ) {
      if (r === c.index) {
        let l;
        c.type === 2 ? l = new I(o, o.nextSibling, this, e) : c.type === 1 ? l = new c.ctor(o, c.name, c.strings, this, e) : c.type === 6 && (l = new st(o, this, e)), this._$AV.push(l), c = n[++a];
      }
      r !== c?.index && (o = E.nextNode(), r++);
    }
    return E.currentNode = C, i;
  }
  p(e) {
    let t = 0;
    for (const n of this._$AV) n !== void 0 && (n.strings !== void 0 ? (n._$AI(e, n, t), t += n.strings.length - 2) : n._$AI(e[t])), t++;
  }
}
class I {
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
    e = R(this, e, t), H(e) ? e === u || e == null || e === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : e !== this._$AH && e !== M && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Ze(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== u && H(this._$AH) ? this._$AA.nextSibling.data = e : this.T(C.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: t, _$litType$: n } = e, i = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = W.createElement(ze(n.h, n.h[0]), this.options)), n);
    if (this._$AH?._$AD === i) this._$AH.p(t);
    else {
      const o = new Xe(i, this), r = o.u(this.options);
      o.p(t), this.T(r), this._$AH = o;
    }
  }
  _$AC(e) {
    let t = ge.get(e.strings);
    return t === void 0 && ge.set(e.strings, t = new W(e)), t;
  }
  k(e) {
    se(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let n, i = 0;
    for (const o of e) i === t.length ? t.push(n = new I(this.O(U()), this.O(U()), this, this.options)) : n = t[i], n._$AI(o), i++;
    i < t.length && (this._$AR(n && n._$AB.nextSibling, i), t.length = i);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    for (this._$AP?.(!1, !0, t); e !== this._$AB; ) {
      const n = ue(e).nextSibling;
      ue(e).remove(), e = n;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class K {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, n, i, o) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = e, this.name = t, this._$AM = i, this.options = o, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(new String()), this.strings = n) : this._$AH = u;
  }
  _$AI(e, t = this, n, i) {
    const o = this.strings;
    let r = !1;
    if (o === void 0) e = R(this, e, t, 0), r = !H(e) || e !== this._$AH && e !== M, r && (this._$AH = e);
    else {
      const a = e;
      let c, l;
      for (e = o[0], c = 0; c < o.length - 1; c++) l = R(this, a[n + c], t, c), l === M && (l = this._$AH[c]), r ||= !H(l) || l !== this._$AH[c], l === u ? e = u : e !== u && (e += (l ?? "") + o[c + 1]), this._$AH[c] = l;
    }
    r && !i && this.j(e);
  }
  j(e) {
    e === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Qe extends K {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === u ? void 0 : e;
  }
}
class et extends K {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== u);
  }
}
class tt extends K {
  constructor(e, t, n, i, o) {
    super(e, t, n, i, o), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = R(this, e, t, 0) ?? u) === M) return;
    const n = this._$AH, i = e === u && n !== u || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, o = e !== u && (n === u || i);
    i && this.element.removeEventListener(this.name, this, n), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class st {
  constructor(e, t, n) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    R(this, e);
  }
}
const nt = te.litHtmlPolyfillSupport;
nt?.(W, I), (te.litHtmlVersions ??= []).push("3.3.3");
const it = (s, e, t) => {
  const n = t?.renderBefore ?? e;
  let i = n._$litPart$;
  if (i === void 0) {
    const o = t?.renderBefore ?? null;
    n._$litPart$ = i = new I(e.insertBefore(U(), o), o, void 0, t ?? {});
  }
  return i._$AI(s), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ne = globalThis;
class D extends z {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = it(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return M;
  }
}
D._$litElement$ = !0, D.finalized = !0, ne.litElementHydrateSupport?.({ LitElement: D });
const ot = ne.litElementPolyfillSupport;
ot?.({ LitElement: D });
(ne.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const rt = (s) => (e, t) => {
  t !== void 0 ? t.addInitializer(() => {
    customElements.define(s, e);
  }) : customElements.define(s, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const at = { attribute: !0, type: String, converter: L, reflect: !1, hasChanged: ee }, ct = (s = at, e, t) => {
  const { kind: n, metadata: i } = t;
  let o = globalThis.litPropertyMetadata.get(i);
  if (o === void 0 && globalThis.litPropertyMetadata.set(i, o = /* @__PURE__ */ new Map()), n === "setter" && ((s = Object.create(s)).wrapped = !0), o.set(t.name, s), n === "accessor") {
    const { name: r } = t;
    return { set(a) {
      const c = e.get.call(this);
      e.set.call(this, a), this.requestUpdate(r, c, s, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(r, void 0, s, a), a;
    } };
  }
  if (n === "setter") {
    const { name: r } = t;
    return function(a) {
      const c = this[r];
      e.call(this, a), this.requestUpdate(r, c, s, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + n);
};
function Me(s) {
  return (e, t) => typeof t == "object" ? ct(s, e, t) : ((n, i, o) => {
    const r = i.hasOwnProperty(o);
    return i.constructor.createProperty(o, n), r ? Object.getOwnPropertyDescriptor(i, o) : void 0;
  })(s, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function x(s) {
  return Me({ ...s, state: !0, attribute: !1 });
}
const lt = "0.1.0", Re = "multizone-climate-scheduler-card", Pe = "Multi-Zone Climate Scheduler Card";
function ye(s, e) {
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
  const n = t.attributes, i = (o) => typeof o == "number" ? o : null;
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
function dt(s, e) {
  return s.states[e]?.state === "active";
}
function J(s, e) {
  return s.states[e] !== void 0;
}
function ut(s, e) {
  const t = s.states[e]?.attributes.hvac_modes;
  return Array.isArray(t) ? t.filter((n) => typeof n == "string") : [];
}
function pt(s, e) {
  const t = s.states[e]?.attributes.preset_modes;
  return Array.isArray(t) && t.includes("eco");
}
function $e(s, e) {
  return s.states[e]?.attributes.preset_mode === "eco";
}
function be(s, e) {
  const t = s.states[e];
  if (!t) return null;
  const n = Number(t.state);
  return Number.isFinite(n) ? n : null;
}
function ht(s, e) {
  const t = s.states[e], n = typeof t?.attributes.friendly_name == "string" ? t.attributes.friendly_name.replace(/ (Temperature|temperature)$/, "") : e.split(".")[1] ?? e, i = t ? Number(t.state) : NaN;
  return { entityId: e, name: n, temp: Number.isFinite(i) ? i : null };
}
function mt(s, e, t) {
  return s.callService("climate", "set_hvac_mode", { entity_id: e, hvac_mode: t });
}
function ft(s, e, t) {
  return s.callService("climate", "set_preset_mode", {
    entity_id: e,
    preset_mode: t ? "eco" : "none"
  });
}
function _t(s, e) {
  const t = s.states[e]?.attributes.fan_modes;
  return Array.isArray(t) && t.includes("on");
}
async function gt(s, e, t, n) {
  _t(s, e) && await s.callService("climate", "set_fan_mode", {
    entity_id: e,
    fan_mode: "on"
  });
  const i = String(n % 60).padStart(2, "0"), o = String(Math.floor(n / 60)).padStart(2, "0");
  await s.callService("timer", "start", {
    entity_id: t,
    duration: `${o}:${i}:00`
  });
}
function yt(s, e, t, n) {
  const i = typeof t == "number" ? t : null, o = typeof n == "number" ? n : null;
  return i != null && o != null && i < o && e != null && e >= i && e <= o ? Math.min(o, Math.max(i, s)) : s;
}
const Ne = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
async function $t(s, e) {
  if (!s.callWS) return null;
  const t = e.split(".")[1];
  try {
    const i = (await s.callWS({ type: "schedule/list" })).find((r) => r.id === t);
    if (!i) return null;
    const o = {};
    for (const r of Ne) i[r] && (o[r] = i[r]);
    return { id: String(i.id), name: typeof i.name == "string" ? i.name : void 0, week: o };
  } catch {
    return null;
  }
}
function bt(s, e, t) {
  if (!s.callWS) return Promise.reject(new Error("callWS unavailable"));
  const i = { type: "schedule/update", schedule_id: e.split(".")[1] };
  for (const o of Ne) i[o] = t[o] ?? [];
  return s.callWS(i);
}
async function xt(s, e, t) {
  await s.callService("input_text", "set_value", {
    entity_id: e,
    value: ""
  }), await s.callService("automation", "trigger", {
    entity_id: t
  });
}
function vt(s, e, t) {
  return s.callService("climate", "set_temperature", {
    entity_id: e,
    temperature: t
  });
}
const k = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
], wt = ["monday", "tuesday", "wednesday", "thursday", "friday"], At = ["saturday", "sunday"];
function St(s) {
  const e = [];
  s.length === 0 && e.push("A day needs at least one block.");
  const t = /* @__PURE__ */ new Set();
  for (const n of s)
    /^([01]\d|2[0-3]):[0-5]\d$/.test(n.time) || e.push(`Bad time "${n.time}".`), t.has(n.time) && e.push(`Duplicate block time ${n.time}.`), t.add(n.time), n.mode === "cool" && n.cool_temp == null && e.push(`${n.name}: cool needs cool_temp.`), n.mode === "heat" && n.heat_temp == null && e.push(`${n.name}: heat needs heat_temp.`), n.mode === "heat_cool" && (n.cool_temp == null || n.heat_temp == null) && e.push(`${n.name}: heat_cool needs both cool_temp and heat_temp.`), n.cool_temp != null && n.heat_temp != null && n.heat_temp >= n.cool_temp && e.push(`${n.name}: heat_temp must be below cool_temp.`);
  return e;
}
function G(s) {
  return { block: s.name, mode: s.mode, cool_temp: s.cool_temp, heat_temp: s.heat_temp };
}
function Et(s) {
  const e = St(s);
  if (e.length > 0) throw new Error(e.join(" "));
  const t = [...s].sort((r, a) => r.time.localeCompare(a.time)), n = t[0], i = t[t.length - 1];
  if (t.length === 1)
    return [{ from: "00:00:00", to: "24:00:00", data: G(n) }];
  const o = [];
  n.time !== "00:00" && o.push({ from: "00:00:00", to: `${n.time}:00`, data: G(i) });
  for (let r = 0; r < t.length; r++) {
    const a = t[r], c = t[r + 1];
    o.push({
      from: `${a.time}:00`,
      to: c ? `${c.time}:00` : "24:00:00",
      data: G(a)
    });
  }
  return o;
}
function kt(s, e) {
  if (s === "all" && e === "all") return k;
  if (s === "wdwe" && e === "wd") return wt;
  if (s === "wdwe" && e === "we") return At;
  if (s === "days" && k.includes(e.toLowerCase()))
    return [e.toLowerCase()];
  throw new Error(`Unknown set "${e}" for granularity "${s}".`);
}
function Ct(s, e) {
  const t = {};
  for (const [n, i] of Object.entries(e)) {
    const o = Et(i);
    for (const r of kt(s, n))
      t[r] = o;
  }
  for (const n of k)
    if (!t[n]) throw new Error(`No block set covers ${n}.`);
  return t;
}
function q(s) {
  const e = s.data;
  return {
    time: s.from.slice(0, 5),
    name: e.block ?? "?",
    mode: e.mode ?? "cool",
    cool_temp: e.cool_temp ?? null,
    heat_temp: e.heat_temp ?? null
  };
}
function Ot(s, e) {
  const t = q(s), n = q(e);
  return t.name === n.name && t.mode === n.mode && t.cool_temp === n.cool_temp && t.heat_temp === n.heat_temp;
}
function ie(s) {
  if (s.length === 0) return [];
  const e = [...s].sort((r, a) => r.from.localeCompare(a.from)), t = e[0], n = e[e.length - 1];
  return (e.length > 1 && t.from === "00:00:00" && Ot(t, n) ? e.slice(1) : e).map(q);
}
function N(s) {
  return JSON.stringify(
    [...s].sort((e, t) => e.from.localeCompare(t.from)).map((e) => [e.from, e.to, q(e)])
  );
}
const xe = ["monday", "tuesday", "wednesday", "thursday", "friday"], ve = ["saturday", "sunday"];
function zt(s) {
  const e = k.map((o) => N(s[o] ?? []));
  if (e.every((o) => o === e[0])) return { granularity: "all", sets: { all: [...k] } };
  const n = xe.every((o) => N(s[o] ?? []) === N(s.monday ?? [])), i = ve.every((o) => N(s[o] ?? []) === N(s.saturday ?? []));
  return n && i ? { granularity: "wdwe", sets: { wd: [...xe], we: [...ve] } } : {
    granularity: "days",
    sets: Object.fromEntries(k.map((o) => [o, [o]]))
  };
}
const Mt = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];
function Rt(s) {
  return `${String(s.getHours()).padStart(2, "0")}:${String(s.getMinutes()).padStart(2, "0")}`;
}
function Pt(s, e) {
  for (let t = 0; t < 8; t++) {
    const n = new Date(e.getTime() + t * 864e5), i = Mt[n.getDay()], o = ie(s[i] ?? []);
    for (const r of o) {
      if (t === 0 && r.time <= Rt(e)) continue;
      const [a, c] = r.time.split(":").map(Number), l = new Date(n);
      l.setHours(a ?? 0, c ?? 0, 0, 0);
      const d = Math.round((l.getTime() - e.getTime()) / 6e4);
      if (!(d <= 0))
        return { ...r, day: i, minutesUntil: d };
    }
  }
  return null;
}
function Nt(s, e, t, n) {
  const i = {};
  for (const o of k) {
    const r = s[o];
    if (!r) continue;
    if (!e.includes(o)) {
      i[o] = r;
      continue;
    }
    const a = ie(r).map(
      (c) => c.time === t ? { ...c, ...n } : c
    );
    i[o] = Tt(a);
  }
  return i;
}
function Tt(s) {
  const e = [...s].sort((r, a) => r.time.localeCompare(a.time));
  if (e.length === 0) return [];
  const t = e[0], n = e[e.length - 1], i = (r) => ({
    block: r.name,
    mode: r.mode,
    cool_temp: r.cool_temp,
    heat_temp: r.heat_temp
  });
  if (e.length === 1) return [{ from: "00:00:00", to: "24:00:00", data: i(t) }];
  const o = [];
  t.time !== "00:00" && o.push({ from: "00:00:00", to: `${t.time}:00`, data: i(n) });
  for (let r = 0; r < e.length; r++) {
    const a = e[r], c = e[r + 1];
    o.push({
      from: `${a.time}:00`,
      to: c ? `${c.time}:00` : "24:00:00",
      data: i(a)
    });
  }
  return o;
}
const oe = {
  fan_timer: { domain: "timer", suffix: "fan" },
  room_override_timer: { domain: "timer", suffix: "room_override" },
  running_sensor: { domain: "binary_sensor", suffix: "running" },
  runtime_today: { domain: "sensor", suffix: "runtime_today" },
  expected_runtime: { domain: "sensor", suffix: "expected_runtime" },
  target_room_select: { domain: "input_select", suffix: "target_room" },
  sensor_schedule: { domain: "schedule", suffix: "sensor_schedule" },
  applied_block_marker: { domain: "input_text", suffix: "applied_block" }
}, re = {
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
  ...Object.values(oe).map((s) => s.suffix),
  ...Object.values(re).map((s) => s.suffix)
];
function O(s) {
  return s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function b(s, e, t) {
  const n = oe[s];
  return `${n.domain}.${e}_${t}_${n.suffix}`;
}
function Dt(s, e, t) {
  return `schedule.${s}_${e}_${t}`;
}
function w(s, e) {
  const t = re[s];
  return `${t.domain}.${e}_${t.suffix}`;
}
function we(s, e) {
  return `${s}_mzcs_${e}`;
}
function Ae(s, e) {
  return {
    engine: "Climate: schedule engine",
    fan_timer: `Climate: ${e ?? "?"} fan timer finished`,
    season_recommender: "Climate: season recommender",
    runtime_alert: "Climate: runtime anomaly alert",
    watchdog: "Climate: engine watchdog",
    steering: "Climate: comfort steering"
  }[s] ?? `Climate: ${s}`;
}
function Ut(s, e, t, n) {
  const i = s.indexOf(".");
  if (i < 0) return null;
  const o = s.slice(0, i), r = s.slice(i + 1);
  if (r !== e && !r.startsWith(`${e}_`)) return null;
  const a = r.slice(e.length + 1);
  for (const [l, d] of Object.entries(re))
    if (o === d.domain && a === d.suffix) return { cls: l };
  const c = [...t].sort((l, d) => d.length - l.length);
  for (const l of c) {
    if (a !== l && !a.startsWith(`${l}_`)) continue;
    const d = a.slice(l.length + 1);
    for (const [p, _] of Object.entries(oe))
      if (o === _.domain && d === _.suffix) return { cls: p, zone: l };
    if (o === "schedule" && n.includes(d))
      return { cls: "zone_schedule", zone: l, season: d };
  }
  return null;
}
const Te = 2, De = 4;
function Ht(s, e = Te, t = De) {
  const n = Math.abs(s);
  return n <= e ? "green" : n <= t ? "amber" : "red";
}
function Wt(s) {
  const e = Math.round(s);
  return `${e > 0 ? "+" : ""}${e}°`;
}
function It(s, e) {
  let t = s != null && s > 0 ? s : Te, n = e != null && e > 0 ? e : De;
  return n <= t && (n = t + 1), { greenMax: t, amberMax: n };
}
const jt = "mzcs", Se = "r1", Bt = [
  { cls: "season_confirm_days", min: 1, max: 14, step: 1, initial: 3 },
  { cls: "season_dwell_days", min: 1, max: 60, step: 1, initial: 14 },
  { cls: "dev_green_max", min: 1, max: 10, step: 1, initial: 2, unit: "°F" },
  { cls: "dev_amber_max", min: 1, max: 15, step: 1, initial: 4, unit: "°F" },
  { cls: "runtime_alert_margin", min: 5, max: 100, step: 5, initial: 35, unit: "%" },
  { cls: "runtime_alert_days", min: 1, max: 7, step: 1, initial: 3 },
  { cls: "runtime_learn_days", min: 7, max: 60, step: 1, initial: 30 },
  { cls: "cdd_base", min: 60, max: 80, step: 1, initial: 75, unit: "°F" }
], Lt = [
  { cls: "override_minutes", min: 15, max: 240, step: 15, initial: 60 },
  { cls: "steer_min_setpoint", min: 50, max: 80, step: 1, initial: 68 },
  { cls: "steer_max_setpoint", min: 70, max: 95, step: 1, initial: 85 },
  { cls: "steer_max_offset", min: 1, max: 10, step: 1, initial: 5 }
];
function Ft(s) {
  return Ct(s.granularity, s.sets);
}
function qt(s) {
  const e = [], t = s.prefix;
  for (const i of s.zones) {
    s.features.fan_timer && e.push({
      id: b("fan_timer", t, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} fan`, restore: !0 }
    }), e.push({
      id: b("running_sensor", t, i.slug),
      kind: "template_sensor",
      spec: { name: `Climate ${i.name} running`, source: "hvac_action" }
    }), e.push({
      id: b("runtime_today", t, i.slug),
      kind: "stats_sensor",
      spec: { name: `Climate ${i.name} runtime today`, state_class: "total_increasing" }
    }), e.push({
      id: b("expected_runtime", t, i.slug),
      kind: "template_sensor",
      spec: { name: `Climate ${i.name} expected runtime`, model: "k_x_cdd" }
    }), e.push({
      id: b("applied_block_marker", t, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} applied block` }
    }), s.features.steering && (e.push({
      id: b("target_room_select", t, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} target room`, options: ["Thermostat"] }
    }), e.push({
      id: b("room_override_timer", t, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} room override`, restore: !0 }
    }), e.push({
      id: b("sensor_schedule", t, i.slug),
      kind: "schedule",
      spec: { name: `Climate ${i.name} sensor schedule` }
    }));
    for (const o of s.seasons) {
      const r = s.schedules[i.slug]?.[o.key];
      if (!r) throw new Error(`Missing schedule for ${i.slug}/${o.key}.`);
      e.push({
        id: Dt(t, i.slug, o.key),
        kind: "schedule",
        spec: { name: `Climate ${i.name} ${o.name}`, week: Ft(r) }
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
  for (const i of Bt)
    e.push({
      id: w(i.cls, t),
      kind: "helper",
      spec: { min: i.min, max: i.max, step: i.step, initial: i.initial, ...i.unit ? { unit: i.unit } : {} }
    });
  if (s.features.steering)
    for (const i of Lt)
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
  const n = (i, o) => ({
    id: `automation:${we(t, i)}`,
    kind: "automation",
    spec: { alias: Ae(i, o), revision: Se }
  });
  if (e.push(n("engine")), e.push(n("watchdog")), s.seasons.length > 1 && e.push(n("season_recommender")), s.features.anomaly_alerts && e.push(n("runtime_alert")), s.features.fan_timer)
    for (const i of s.zones)
      e.push({
        id: `automation:${we(t, `fan_timer_${i.slug}`)}`,
        kind: "automation",
        spec: { alias: Ae("fan_timer", i.name), revision: Se }
      });
  return s.features.steering && e.push(n("steering")), e;
}
function Vt(s, e) {
  return V(s) === V(e);
}
function V(s) {
  if (Array.isArray(s)) return `[${s.map(V).join(",")}]`;
  if (s !== null && typeof s == "object") {
    const e = s;
    return `{${Object.keys(e).sort().map((t) => `${JSON.stringify(t)}:${V(e[t])}`).join(",")}}`;
  }
  return JSON.stringify(s);
}
function Yt(s, e) {
  const t = { create: [], adopt: [], update: [], delete: [], noop: [] }, n = new Map(e.map((o) => [o.id, o])), i = new Set(s.map((o) => o.id));
  for (const o of s) {
    const r = n.get(o.id);
    r ? r.managed ? Vt(r.spec, o.spec) ? t.noop.push({ op: "noop", id: o.id, kind: o.kind }) : t.update.push({ op: "update", id: o.id, kind: o.kind, spec: o.spec, from: r.spec }) : t.adopt.push({ op: "adopt", id: o.id, kind: o.kind, spec: o.spec }) : t.create.push({ op: "create", id: o.id, kind: o.kind, spec: o.spec });
  }
  for (const o of e)
    o.managed && !i.has(o.id) && t.delete.push({ op: "delete", id: o.id, kind: o.kind });
  return t;
}
function Kt(s) {
  const e = s.default_mode;
  return { granularity: "all", sets: { all: [{
    time: "06:00",
    name: "Day",
    mode: e,
    cool_temp: e === "heat" ? null : e === "heat_cool" ? 84 : 78,
    heat_temp: e === "heat" ? 68 : e === "heat_cool" ? 66 : null
  }] } };
}
function Zt(s, e) {
  const t = {};
  for (const n of s) {
    t[n] = {};
    for (const i of e) t[n][i.key] = Kt(i);
  }
  return t;
}
const Jt = {
  fan_timer: "helper",
  room_override_timer: "helper",
  target_room_select: "helper",
  applied_block_marker: "helper",
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
async function j(s, e) {
  if (!s.callWS) return [];
  try {
    const t = await s.callWS({ type: `${e}/list` });
    return Array.isArray(t) ? t : [];
  } catch {
    return [];
  }
}
async function Gt(s, e) {
  const t = /* @__PURE__ */ new Map();
  if (!s.callWS || e.length === 0) return t;
  try {
    const n = await s.callWS({
      type: "config/entity_registry/get_entries",
      entity_ids: e
    });
    for (const [i, o] of Object.entries(n ?? {}))
      o?.labels && t.set(i, o.labels);
  } catch {
  }
  return t;
}
async function Xt(s, e, t, n) {
  const i = [];
  for (const h of Object.keys(s.states)) {
    const f = Ut(h, e, t, n);
    if (!f) continue;
    const y = Jt[f.cls];
    y && i.push({ id: h, kind: y });
  }
  const [o, r, a, c, l] = await Promise.all([
    j(s, "timer"),
    j(s, "input_select"),
    j(s, "input_number"),
    j(s, "schedule"),
    Gt(
      s,
      i.map((h) => h.id)
    )
  ]), d = (h, f) => {
    const y = /* @__PURE__ */ new Map();
    for (const v of h) v.id && y.set(`${f}.${v.id}`, v);
    return y;
  }, p = new Map([
    ...d(o, "timer"),
    ...d(r, "input_select"),
    ...d(a, "input_number"),
    ...d(c, "schedule")
  ]), _ = [];
  for (const h of i) {
    const f = p.get(h.id), y = s.states[h.id];
    let v = {};
    h.id.startsWith("input_number.") && f ? v = { min: f.min, max: f.max, step: f.step } : h.id.startsWith("input_select.") && f ? v = { name: f.name, options: f.options } : h.id.startsWith("timer.") && f ? v = { name: f.name, restore: f.restore ?? !1 } : h.id.startsWith("schedule.") && f ? v = { name: f.name, raw: !0 } : y && (v = { name: y.attributes.friendly_name ?? h.id }), _.push({
      id: h.id,
      kind: h.kind,
      spec: v,
      managed: (l.get(h.id) ?? []).includes(jt)
    });
  }
  for (const [h, f] of Object.entries(s.states)) {
    if (!h.startsWith("automation.") || !f) continue;
    const y = f.attributes.id;
    typeof y == "string" && y.startsWith(`${e}_mzcs_`) && _.push({
      id: `automation:${y}`,
      kind: "automation",
      spec: { alias: f.attributes.friendly_name ?? y, revision: "unknown" },
      managed: !0
    });
  }
  return _;
}
var Qt = Object.defineProperty, es = Object.getOwnPropertyDescriptor, $ = (s, e, t, n) => {
  for (var i = n > 1 ? void 0 : n ? es(e, t) : e, o = s.length - 1, r; o >= 0; o--)
    (r = s[o]) && (i = (n ? r(e, t, i) : r(i)) || i);
  return n && i && Qt(e, t, i), i;
};
function ts(s) {
  const [e, t] = s.split(":");
  let n = Number(e);
  const i = n >= 12 ? "PM" : "AM";
  return n = n % 12 === 0 ? 12 : n % 12, `${n}:${t} ${i}`;
}
const ss = {
  all: "Every day",
  wd: "Weekdays",
  we: "Weekend"
}, ns = {
  heat: "Heat",
  cool: "Cool",
  heat_cool: "Heat·Cool",
  off: "Off",
  auto: "Auto",
  dry: "Dry",
  fan_only: "Fan only"
};
console.info(`%c ${Pe} %c v${lt}`, "background:#1e88e5;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;", "background:#243039;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;");
let g = class extends D {
  constructor() {
    super(...arguments), this._zoneIndex = 0, this._ctrlOpen = !1, this._setupOpen = !1, this._schedOpen = !1, this._schedBusy = !1, this._dryRunning = !1;
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
    const t = ye(this.hass, e.entity);
    if (t.setpoint == null) return;
    const n = this.hass.states[e.entity]?.attributes, i = yt(
      t.setpoint + s,
      t.setpoint,
      n?.min_temp,
      n?.max_temp
    );
    i !== t.setpoint && vt(this.hass, e.entity, i);
  }
  _provisionInput() {
    const s = this._config, e = s.zones.map((n) => ({ slug: O(n.name), name: n.name })), t = s.seasons ?? [
      { key: "summer", name: "Summer", default_mode: "cool" },
      { key: "winter", name: "Winter", default_mode: "heat_cool" }
    ];
    return {
      prefix: this._prefix,
      zones: e,
      seasons: t,
      schedules: Zt(
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
        const s = this._provisionInput(), e = await Xt(
          this.hass,
          s.prefix,
          s.zones.map((t) => t.slug),
          s.seasons.map((t) => t.key)
        );
        this._dryRun = Yt(qt(s), e);
      } catch (s) {
        this._dryRunError = s instanceof Error ? s.message : String(s);
      } finally {
        this._dryRunning = !1;
      }
    }
  }
  _renderSetup() {
    const s = this._dryRun;
    return m`
      <div class="setup">
        <p class="setup-title">Setup · dry run</p>
        <p class="setup-sub">
          Read-only preview of what Setup would create. Nothing is written from this screen.
        </p>
        <button class="chip" .disabled=${this._dryRunning} @click=${() => void this._runDryRun()}>
          ${this._dryRunning ? "Reading registry…" : "Run dry-run preview"}
        </button>
        ${this._dryRunError ? m`<p class="setup-err">${this._dryRunError}</p>` : u}
        ${s ? m`
              <div class="planwrap">
                ${[
      ["Create", s.create, ""],
      ["Adopt", s.adopt, ""],
      ["Update", s.update, ""],
      ["Delete", s.delete, "del"],
      ["Unchanged", s.noop, "quiet"]
    ].map(
      ([e, t, n]) => m`
                    <p class="plan-h ${n}">${e} (${t.length})</p>
                    ${t.length > 0 && e !== "Unchanged" ? m`<ul class="plan-list ${n}">
                          ${t.map((i) => m`<li>${i.id}</li>`)}
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
      return m`<ha-card><div class="wrap">${this._renderSetup()}</div></ha-card>`;
    const e = ye(this.hass, s.entity), t = dt(
      this.hass,
      b("fan_timer", this._prefix, O(s.name))
    ), n = e.action === "cooling", i = e.action === "heating", o = e.available ? n ? `Cooling to ${e.setpoint}` : i ? `Heating to ${e.setpoint}` : e.mode === "off" ? "Off" : `Idle · set ${e.setpoint ?? "–"}` : "Unavailable";
    return m`
      <ha-card>
        <div class="wrap">
          <div class="tabs" role="tablist">
            ${this._config.zones.map(
      (r, a) => m`
                <button
                  role="tab"
                  aria-selected=${a === this._zoneIndex}
                  class=${a === this._zoneIndex ? "tab on" : "tab"}
                  @click=${() => {
        this._zoneIndex = a;
      }}
                >
                  ${r.name}
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
                ${o}${e.inside != null ? ` · inside ${e.inside}°` : ""}${e.humidity != null ? ` · ${e.humidity}% RH` : ""}${t ? m`<span class="fan"> · fan on</span>` : ""}
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
          ${this._renderSchedule(s)}
        </div>
      </ha-card>
    `;
  }
  _activeSeasonKey() {
    const s = this.hass?.states[w("season_select", this._prefix)];
    return s && s.state !== "unknown" ? O(s.state) : null;
  }
  _scheduleEntityId(s) {
    const e = this._activeSeasonKey();
    return e ? `schedule.${this._prefix}_${O(s.name)}_${e}` : null;
  }
  async _loadWeek(s) {
    if (!this.hass) return;
    const e = this._scheduleEntityId(s);
    if (!e || !J(this.hass, e)) {
      this._schedWeek = void 0;
      return;
    }
    this._schedBusy = !0;
    try {
      const t = await $t(this.hass, e);
      this._schedWeek = t?.week ?? void 0, this._schedError = t ? void 0 : "Could not load schedule config.";
    } catch (t) {
      this._schedError = t instanceof Error ? t.message : String(t);
    } finally {
      this._schedBusy = !1;
    }
  }
  async _saveBlockEdit(s, e, t, n) {
    if (!this.hass || !this._schedWeek) return;
    const i = this._scheduleEntityId(s);
    if (i) {
      this._schedBusy = !0;
      try {
        const o = Nt(this._schedWeek, e, t, n);
        await bt(
          this.hass,
          i,
          o
        ), this._schedWeek = o, this._schedError = void 0;
      } catch (o) {
        this._schedError = o instanceof Error ? o.message : String(o);
      } finally {
        this._schedBusy = !1;
      }
    }
  }
  _renderSchedule(s) {
    if (!this.hass) return u;
    const e = this._scheduleEntityId(s);
    if (!e || !J(this.hass, e)) return u;
    this._schedLoadedFor !== e && !this._schedBusy && (this._schedLoadedFor = e, this._schedWeek = void 0, queueMicrotask(() => void this._loadWeek(s)));
    const t = this.hass.states[w("season_select", this._prefix)]?.state ?? "", n = this._schedWeek, i = n ? Pt(n, /* @__PURE__ */ new Date()) : null, o = i ? `Next · ${ts(i.time)} ${i.name} → ${i.cool_temp ?? i.heat_temp}°` : "Schedule";
    return m`
      <button
        class="schedrow"
        @click=${() => {
      this._schedOpen = !this._schedOpen, this._schedWeek || this._loadWeek(s);
    }}
      >
        <span>${o} <span class="season">· ${t}</span></span>
        <span aria-hidden="true">${this._schedOpen ? "▴" : "▾"}</span>
      </button>
      ${this._schedOpen ? this._renderScheduleBody(s) : u}
    `;
  }
  _renderScheduleBody(s) {
    if (this._schedBusy && !this._schedWeek) return m`<p class="muted pad">Loading…</p>`;
    if (this._schedError) return m`<p class="schederr pad">${this._schedError}</p>`;
    const e = this._schedWeek;
    if (!e) return m`<p class="muted pad">No schedule data.</p>`;
    const t = zt(e), n = (/* @__PURE__ */ new Date()).getDay(), i = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][n];
    return m`
      <div class="schedbody">
        ${Object.entries(t.sets).map(([o, r]) => {
      const a = ie(e[r[0]] ?? []), c = r.includes(i);
      return m`
            <p class="sethead">
              ${ss[o] ?? o}${c ? m` <span class="today">today</span>` : u}
            </p>
            ${a.map(
        (l) => m`
                <div class="blockrow">
                  <input
                    class="btime"
                    type="time"
                    .value=${l.time}
                    @change=${(d) => void this._saveBlockEdit(s, r, l.time, {
          time: d.target.value
        })}
                  />
                  <span class="bname">${l.name}</span>
                  <input
                    class="btemp"
                    type="number"
                    .value=${String(l.cool_temp ?? l.heat_temp ?? "")}
                    @change=${(d) => void this._saveBlockEdit(s, r, l.time, {
          cool_temp: Number(d.target.value)
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
      const o = b("applied_block_marker", this._prefix, O(s.name));
      xt(this.hass, o, "automation.climate_schedule_engine");
    }}
          >
            Apply now
          </button>
          <span class="muted">Edits apply at the next block; Apply now re-asserts immediately.</span>
        </div>
      </div>
    `;
  }
  _renderControls(s) {
    if (!this.hass) return u;
    const e = this.hass, t = this._zone();
    if (!t) return u;
    const n = ut(e, s), i = e.states[s]?.state, o = pt(e, s), r = b("fan_timer", this._prefix, O(t.name)), a = this._config?.features?.fan_timer ?? [15, 30, 60], c = J(e, r);
    return m`
      <button class="expander" @click=${() => this._ctrlOpen = !this._ctrlOpen}>
        <span>Mode</span>
        <span aria-hidden="true">${this._ctrlOpen ? "▴" : "▾"}</span>
      </button>
      ${this._ctrlOpen ? m`
            <div class="ctrl">
              <div class="chips">
                ${n.map(
      (l) => m`
                    <button
                      class=${i === l ? "chip mode-on" : "chip"}
                      @click=${() => void mt(e, s, l)}
                    >
                      ${ns[l] ?? l}
                    </button>
                  `
    )}
                ${o ? m`
                      <button
                        class=${$e(e, s) ? "chip eco eco-on" : "chip eco"}
                        @click=${() => void ft(e, s, !$e(e, s))}
                      >
                        Eco
                      </button>
                    ` : u}
              </div>
              ${c ? m`
                    <div class="chips fanrow">
                      <span class="fanlbl">Fan</span>
                      ${a.map(
      (l) => m`
                          <button
                            class="chip"
                            @click=${() => void gt(e, s, r, l)}
                          >
                            ${l}m
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
    const t = this.hass, { greenMax: n, amberMax: i } = It(
      be(t, w("dev_green_max", this._prefix)),
      be(t, w("dev_amber_max", this._prefix))
    );
    return m`
      <div class="rooms">
        ${s.room_sensors.map((o) => {
      const r = ht(t, o);
      if (r.temp == null || e == null)
        return m`
              <div class="room">
                <span class="rname">${r.name}</span>
                <span class="rtemp muted">${r.temp == null ? "—" : `${r.temp}°`}</span>
              </div>
            `;
      const a = Math.round(r.temp - e);
      return m`
            <div class="room">
              <span class="rname">${r.name}</span>
              <span>
                <span class="badge ${Ht(a, n, i)}"
                  >${Wt(a)}</span
                >
                <span class="rtemp">${r.temp}°</span>
              </span>
            </div>
          `;
    })}
      </div>
    `;
  }
};
g.styles = He`
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
    .schedrow {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--secondary-background-color, #243039);
      border: none;
      border-radius: 12px;
      color: var(--primary-text-color, #c8d4dc);
      font-size: 12px;
      padding: 10px 12px;
      margin-top: 10px;
      cursor: pointer;
    }
    .season {
      color: #f59e0b;
    }
    .schedbody {
      background: var(--secondary-background-color, #243039);
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
      color: #1e88e5;
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
      background: var(--card-background-color, #16202a);
      border: 0.5px solid var(--divider-color, #3d4a55);
      border-radius: 6px;
      color: var(--primary-text-color, #e8edf1);
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
      color: #e5484d;
      font-size: 12px;
    }
  `;
$([
  Me({ attribute: !1 })
], g.prototype, "hass", 2);
$([
  x()
], g.prototype, "_config", 2);
$([
  x()
], g.prototype, "_zoneIndex", 2);
$([
  x()
], g.prototype, "_ctrlOpen", 2);
$([
  x()
], g.prototype, "_setupOpen", 2);
$([
  x()
], g.prototype, "_schedOpen", 2);
$([
  x()
], g.prototype, "_schedWeek", 2);
$([
  x()
], g.prototype, "_schedError", 2);
$([
  x()
], g.prototype, "_schedBusy", 2);
$([
  x()
], g.prototype, "_dryRun", 2);
$([
  x()
], g.prototype, "_dryRunError", 2);
$([
  x()
], g.prototype, "_dryRunning", 2);
g = $([
  rt(Re)
], g);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: Re,
  name: Pe,
  description: "Nest-style climate view for 1-4 zones with seasonal scheduling, fan timers, and runtime history."
});
export {
  g as MzcsCard
};

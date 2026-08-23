/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const L = globalThis, X = L.ShadowRoot && (L.ShadyCSS === void 0 || L.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, Q = Symbol(), ae = /* @__PURE__ */ new WeakMap();
let Ce = class {
  constructor(e, s, n) {
    if (this._$cssResult$ = !0, n !== Q) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (X && e === void 0) {
      const n = s !== void 0 && s.length === 1;
      n && (e = ae.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && ae.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const He = (t) => new Ce(typeof t == "string" ? t : t + "", void 0, Q), We = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((n, i, o) => n + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + t[o + 1], t[0]);
  return new Ce(s, t, Q);
}, je = (t, e) => {
  if (X) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const n = document.createElement("style"), i = L.litNonce;
    i !== void 0 && n.setAttribute("nonce", i), n.textContent = s.cssText, t.appendChild(n);
  }
}, le = X ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const n of e.cssRules) s += n.cssText;
  return He(s);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Be, defineProperty: Le, getOwnPropertyDescriptor: Fe, getOwnPropertyNames: qe, getOwnPropertySymbols: Ve, getPrototypeOf: Ye } = Object, Z = globalThis, ce = Z.trustedTypes, Ze = ce ? ce.emptyScript : "", Ke = Z.reactiveElementPolyfillSupport, U = (t, e) => t, F = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Ze : null;
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
} }, ee = (t, e) => !Be(t, e), de = { attribute: !0, type: String, converter: F, reflect: !1, useDefault: !1, hasChanged: ee };
Symbol.metadata ??= Symbol("metadata"), Z.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let z = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = de) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const n = Symbol(), i = this.getPropertyDescriptor(e, n, s);
      i !== void 0 && Le(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, s, n) {
    const { get: i, set: o } = Fe(this.prototype, e) ?? { get() {
      return this[s];
    }, set(r) {
      this[s] = r;
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
    if (this.hasOwnProperty(U("elementProperties"))) return;
    const e = Ye(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(U("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(U("properties"))) {
      const s = this.properties, n = [...qe(s), ...Ve(s)];
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
      for (const i of n) s.unshift(le(i));
    } else e !== void 0 && s.push(le(e));
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
    return je(e, this.constructor.elementStyles), e;
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
      const o = (n.converter?.toAttribute !== void 0 ? n.converter : F).toAttribute(s, n.type);
      this._$Em = e, o == null ? this.removeAttribute(i) : this.setAttribute(i, o), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const n = this.constructor, i = n._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const o = n.getPropertyOptions(i), r = typeof o.converter == "function" ? { fromAttribute: o.converter } : o.converter?.fromAttribute !== void 0 ? o.converter : F;
      this._$Em = i;
      const a = r.fromAttribute(s, o.type);
      this[i] = a ?? this._$Ej?.get(i) ?? a, this._$Em = null;
    }
  }
  requestUpdate(e, s, n, i = !1, o) {
    if (e !== void 0) {
      const r = this.constructor;
      if (i === !1 && (o = this[e]), n ??= r.getPropertyOptions(e), !((n.hasChanged ?? ee)(o, s) || n.useDefault && n.reflect && o === this._$Ej?.get(e) && !this.hasAttribute(r._$Eu(e, n)))) return;
      this.C(e, s, n);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, s, { useDefault: n, reflect: i, wrapped: o }, r) {
    n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, r ?? s ?? this[e]), o !== !0 || r !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (s = void 0), this._$AL.set(e, s)), i === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
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
z.elementStyles = [], z.shadowRootOptions = { mode: "open" }, z[U("elementProperties")] = /* @__PURE__ */ new Map(), z[U("finalized")] = /* @__PURE__ */ new Map(), Ke?.({ ReactiveElement: z }), (Z.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const te = globalThis, ue = (t) => t, q = te.trustedTypes, pe = q ? q.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Oe = "$lit$", A = `lit$${Math.random().toFixed(9).slice(2)}$`, ze = "?" + A, Je = `<${ze}>`, O = document, I = () => O.createComment(""), H = (t) => t === null || typeof t != "object" && typeof t != "function", se = Array.isArray, Ge = (t) => se(t) || typeof t?.[Symbol.iterator] == "function", J = `[ 	
\f\r]`, N = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, he = /-->/g, me = />/g, S = RegExp(`>|${J}(?:([^\\s"'>=/]+)(${J}*=${J}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), fe = /'/g, _e = /"/g, Me = /^(?:script|style|textarea|title)$/i, Xe = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), p = Xe(1), M = Symbol.for("lit-noChange"), u = Symbol.for("lit-nothing"), ge = /* @__PURE__ */ new WeakMap(), E = O.createTreeWalker(O, 129);
function Re(t, e) {
  if (!se(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return pe !== void 0 ? pe.createHTML(e) : e;
}
const Qe = (t, e) => {
  const s = t.length - 1, n = [];
  let i, o = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", r = N;
  for (let a = 0; a < s; a++) {
    const l = t[a];
    let c, d, h = -1, _ = 0;
    for (; _ < l.length && (r.lastIndex = _, d = r.exec(l), d !== null); ) _ = r.lastIndex, r === N ? d[1] === "!--" ? r = he : d[1] !== void 0 ? r = me : d[2] !== void 0 ? (Me.test(d[2]) && (i = RegExp("</" + d[2], "g")), r = S) : d[3] !== void 0 && (r = S) : r === S ? d[0] === ">" ? (r = i ?? N, h = -1) : d[1] === void 0 ? h = -2 : (h = r.lastIndex - d[2].length, c = d[1], r = d[3] === void 0 ? S : d[3] === '"' ? _e : fe) : r === _e || r === fe ? r = S : r === he || r === me ? r = N : (r = S, i = void 0);
    const m = r === S && t[a + 1].startsWith("/>") ? " " : "";
    o += r === N ? l + Je : h >= 0 ? (n.push(c), l.slice(0, h) + Oe + l.slice(h) + A + m) : l + A + (h === -2 ? a : m);
  }
  return [Re(t, o + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), n];
};
class W {
  constructor({ strings: e, _$litType$: s }, n) {
    let i;
    this.parts = [];
    let o = 0, r = 0;
    const a = e.length - 1, l = this.parts, [c, d] = Qe(e, s);
    if (this.el = W.createElement(c, n), E.currentNode = this.el.content, s === 2 || s === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (i = E.nextNode()) !== null && l.length < a; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const h of i.getAttributeNames()) if (h.endsWith(Oe)) {
          const _ = d[r++], m = i.getAttribute(h).split(A), f = /([.?@])?(.*)/.exec(_);
          l.push({ type: 1, index: o, name: f[2], strings: m, ctor: f[1] === "." ? tt : f[1] === "?" ? st : f[1] === "@" ? nt : K }), i.removeAttribute(h);
        } else h.startsWith(A) && (l.push({ type: 6, index: o }), i.removeAttribute(h));
        if (Me.test(i.tagName)) {
          const h = i.textContent.split(A), _ = h.length - 1;
          if (_ > 0) {
            i.textContent = q ? q.emptyScript : "";
            for (let m = 0; m < _; m++) i.append(h[m], I()), E.nextNode(), l.push({ type: 2, index: ++o });
            i.append(h[_], I());
          }
        }
      } else if (i.nodeType === 8) if (i.data === ze) l.push({ type: 2, index: o });
      else {
        let h = -1;
        for (; (h = i.data.indexOf(A, h + 1)) !== -1; ) l.push({ type: 7, index: o }), h += A.length - 1;
      }
      o++;
    }
  }
  static createElement(e, s) {
    const n = O.createElement("template");
    return n.innerHTML = e, n;
  }
}
function R(t, e, s = t, n) {
  if (e === M) return e;
  let i = n !== void 0 ? s._$Co?.[n] : s._$Cl;
  const o = H(e) ? void 0 : e._$litDirective$;
  return i?.constructor !== o && (i?._$AO?.(!1), o === void 0 ? i = void 0 : (i = new o(t), i._$AT(t, s, n)), n !== void 0 ? (s._$Co ??= [])[n] = i : s._$Cl = i), i !== void 0 && (e = R(t, i._$AS(t, e.values), i, n)), e;
}
class et {
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
    const { el: { content: s }, parts: n } = this._$AD, i = (e?.creationScope ?? O).importNode(s, !0);
    E.currentNode = i;
    let o = E.nextNode(), r = 0, a = 0, l = n[0];
    for (; l !== void 0; ) {
      if (r === l.index) {
        let c;
        l.type === 2 ? c = new j(o, o.nextSibling, this, e) : l.type === 1 ? c = new l.ctor(o, l.name, l.strings, this, e) : l.type === 6 && (c = new it(o, this, e)), this._$AV.push(c), l = n[++a];
      }
      r !== l?.index && (o = E.nextNode(), r++);
    }
    return E.currentNode = O, i;
  }
  p(e) {
    let s = 0;
    for (const n of this._$AV) n !== void 0 && (n.strings !== void 0 ? (n._$AI(e, n, s), s += n.strings.length - 2) : n._$AI(e[s])), s++;
  }
}
class j {
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
    e = R(this, e, s), H(e) ? e === u || e == null || e === "" ? (this._$AH !== u && this._$AR(), this._$AH = u) : e !== this._$AH && e !== M && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Ge(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== u && H(this._$AH) ? this._$AA.nextSibling.data = e : this.T(O.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: n } = e, i = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = W.createElement(Re(n.h, n.h[0]), this.options)), n);
    if (this._$AH?._$AD === i) this._$AH.p(s);
    else {
      const o = new et(i, this), r = o.u(this.options);
      o.p(s), this.T(r), this._$AH = o;
    }
  }
  _$AC(e) {
    let s = ge.get(e.strings);
    return s === void 0 && ge.set(e.strings, s = new W(e)), s;
  }
  k(e) {
    se(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let n, i = 0;
    for (const o of e) i === s.length ? s.push(n = new j(this.O(I()), this.O(I()), this, this.options)) : n = s[i], n._$AI(o), i++;
    i < s.length && (this._$AR(n && n._$AB.nextSibling, i), s.length = i);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
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
  constructor(e, s, n, i, o) {
    this.type = 1, this._$AH = u, this._$AN = void 0, this.element = e, this.name = s, this._$AM = i, this.options = o, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(new String()), this.strings = n) : this._$AH = u;
  }
  _$AI(e, s = this, n, i) {
    const o = this.strings;
    let r = !1;
    if (o === void 0) e = R(this, e, s, 0), r = !H(e) || e !== this._$AH && e !== M, r && (this._$AH = e);
    else {
      const a = e;
      let l, c;
      for (e = o[0], l = 0; l < o.length - 1; l++) c = R(this, a[n + l], s, l), c === M && (c = this._$AH[l]), r ||= !H(c) || c !== this._$AH[l], c === u ? e = u : e !== u && (e += (c ?? "") + o[l + 1]), this._$AH[l] = c;
    }
    r && !i && this.j(e);
  }
  j(e) {
    e === u ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class tt extends K {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === u ? void 0 : e;
  }
}
class st extends K {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== u);
  }
}
class nt extends K {
  constructor(e, s, n, i, o) {
    super(e, s, n, i, o), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = R(this, e, s, 0) ?? u) === M) return;
    const n = this._$AH, i = e === u && n !== u || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, o = e !== u && (n === u || i);
    i && this.element.removeEventListener(this.name, this, n), o && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class it {
  constructor(e, s, n) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = n;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    R(this, e);
  }
}
const ot = te.litHtmlPolyfillSupport;
ot?.(W, j), (te.litHtmlVersions ??= []).push("3.3.3");
const rt = (t, e, s) => {
  const n = s?.renderBefore ?? e;
  let i = n._$litPart$;
  if (i === void 0) {
    const o = s?.renderBefore ?? null;
    n._$litPart$ = i = new j(e.insertBefore(I(), o), o, void 0, s ?? {});
  }
  return i._$AI(t), i;
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
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = rt(s, this.renderRoot, this.renderOptions);
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
const at = ne.litElementPolyfillSupport;
at?.({ LitElement: D });
(ne.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const lt = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ct = { attribute: !0, type: String, converter: F, reflect: !1, hasChanged: ee }, dt = (t = ct, e, s) => {
  const { kind: n, metadata: i } = s;
  let o = globalThis.litPropertyMetadata.get(i);
  if (o === void 0 && globalThis.litPropertyMetadata.set(i, o = /* @__PURE__ */ new Map()), n === "setter" && ((t = Object.create(t)).wrapped = !0), o.set(s.name, t), n === "accessor") {
    const { name: r } = s;
    return { set(a) {
      const l = e.get.call(this);
      e.set.call(this, a), this.requestUpdate(r, l, t, !0, a);
    }, init(a) {
      return a !== void 0 && this.C(r, void 0, t, a), a;
    } };
  }
  if (n === "setter") {
    const { name: r } = s;
    return function(a) {
      const l = this[r];
      e.call(this, a), this.requestUpdate(r, l, t, !0, a);
    };
  }
  throw Error("Unsupported decorator location: " + n);
};
function Ne(t) {
  return (e, s) => typeof s == "object" ? dt(t, e, s) : ((n, i, o) => {
    const r = i.hasOwnProperty(o);
    return i.constructor.createProperty(o, n), r ? Object.getOwnPropertyDescriptor(i, o) : void 0;
  })(t, e, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function v(t) {
  return Ne({ ...t, state: !0, attribute: !1 });
}
const ut = "0.1.0", Pe = "multizone-climate-scheduler-card", Te = "Multi-Zone Climate Scheduler Card";
function ye(t, e) {
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
  const n = s.attributes, i = (o) => typeof o == "number" ? o : null;
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
function pt(t, e) {
  return t.states[e]?.state === "active";
}
function P(t, e) {
  return t.states[e] !== void 0;
}
function ht(t, e) {
  const s = t.states[e]?.attributes.hvac_modes;
  return Array.isArray(s) ? s.filter((n) => typeof n == "string") : [];
}
function mt(t, e) {
  const s = t.states[e]?.attributes.preset_modes;
  return Array.isArray(s) && s.includes("eco");
}
function $e(t, e) {
  return t.states[e]?.attributes.preset_mode === "eco";
}
function be(t, e) {
  const s = t.states[e];
  if (!s) return null;
  const n = Number(s.state);
  return Number.isFinite(n) ? n : null;
}
function ft(t, e) {
  const s = t.states[e], n = typeof s?.attributes.friendly_name == "string" ? s.attributes.friendly_name.replace(/ (Temperature|temperature)$/, "") : e.split(".")[1] ?? e, i = s ? Number(s.state) : NaN;
  return { entityId: e, name: n, temp: Number.isFinite(i) ? i : null };
}
function _t(t, e, s) {
  return t.callService("climate", "set_hvac_mode", { entity_id: e, hvac_mode: s });
}
function gt(t, e, s) {
  return t.callService("climate", "set_preset_mode", {
    entity_id: e,
    preset_mode: s ? "eco" : "none"
  });
}
function yt(t, e) {
  const s = t.states[e]?.attributes.fan_modes;
  return Array.isArray(s) && s.includes("on");
}
async function $t(t, e, s, n) {
  yt(t, e) && await t.callService("climate", "set_fan_mode", {
    entity_id: e,
    fan_mode: "on"
  });
  const i = String(n % 60).padStart(2, "0"), o = String(Math.floor(n / 60)).padStart(2, "0");
  await t.callService("timer", "start", {
    entity_id: s,
    duration: `${o}:${i}:00`
  });
}
function bt(t, e, s, n) {
  const i = typeof s == "number" ? s : null, o = typeof n == "number" ? n : null;
  return i != null && o != null && i < o && e != null && e >= i && e <= o ? Math.min(o, Math.max(i, t)) : t;
}
const Ue = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
async function xt(t, e) {
  if (!t.callWS) return null;
  const s = e.split(".")[1];
  try {
    const i = (await t.callWS({ type: "schedule/list" })).find((r) => r.id === s);
    if (!i) return null;
    const o = {};
    for (const r of Ue) i[r] && (o[r] = i[r]);
    return { id: String(i.id), name: typeof i.name == "string" ? i.name : void 0, week: o };
  } catch {
    return null;
  }
}
function vt(t, e, s, n) {
  if (!t.callWS) return Promise.reject(new Error("callWS unavailable"));
  const o = {
    type: "schedule/update",
    schedule_id: e.split(".")[1],
    name: n
  };
  for (const r of Ue) o[r] = s[r] ?? [];
  return t.callWS(o);
}
function wt(t, e, s) {
  return t.callService("input_number", "set_value", { entity_id: e, value: s });
}
function At(t, e, s) {
  return t.callService("input_select", "select_option", { entity_id: e, option: s });
}
async function xe(t, e, s, n) {
  n && await t.callService("input_text", "set_value", { entity_id: s, value: "" }), await t.callService("input_boolean", n ? "turn_on" : "turn_off", {
    entity_id: e
  });
}
function ve(t) {
  return t instanceof Error ? t.message : t && typeof t == "object" && "message" in t ? String(t.message) : JSON.stringify(t);
}
async function St(t, e, s) {
  await t.callService("input_text", "set_value", {
    entity_id: e,
    value: ""
  }), await t.callService("automation", "trigger", {
    entity_id: s
  });
}
function kt(t, e, s) {
  return t.callService("climate", "set_temperature", {
    entity_id: e,
    temperature: s
  });
}
const C = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
], Et = ["monday", "tuesday", "wednesday", "thursday", "friday"], Ct = ["saturday", "sunday"];
function Ot(t) {
  const e = [];
  t.length === 0 && e.push("A day needs at least one block.");
  const s = /* @__PURE__ */ new Set();
  for (const n of t)
    /^([01]\d|2[0-3]):[0-5]\d$/.test(n.time) || e.push(`Bad time "${n.time}".`), s.has(n.time) && e.push(`Duplicate block time ${n.time}.`), s.add(n.time), n.mode === "cool" && n.cool_temp == null && e.push(`${n.name}: cool needs cool_temp.`), n.mode === "heat" && n.heat_temp == null && e.push(`${n.name}: heat needs heat_temp.`), n.mode === "heat_cool" && (n.cool_temp == null || n.heat_temp == null) && e.push(`${n.name}: heat_cool needs both cool_temp and heat_temp.`), n.cool_temp != null && n.heat_temp != null && n.heat_temp >= n.cool_temp && e.push(`${n.name}: heat_temp must be below cool_temp.`);
  return e;
}
function G(t) {
  return {
    block: t.name,
    mode: t.mode,
    ...t.cool_temp != null ? { cool_temp: t.cool_temp } : {},
    ...t.heat_temp != null ? { heat_temp: t.heat_temp } : {}
  };
}
function zt(t) {
  const e = Ot(t);
  if (e.length > 0) throw new Error(e.join(" "));
  const s = [...t].sort((r, a) => r.time.localeCompare(a.time)), n = s[0], i = s[s.length - 1];
  if (s.length === 1)
    return [{ from: "00:00:00", to: "24:00:00", data: G(n) }];
  const o = [];
  n.time !== "00:00" && o.push({ from: "00:00:00", to: `${n.time}:00`, data: G(i) });
  for (let r = 0; r < s.length; r++) {
    const a = s[r], l = s[r + 1];
    o.push({
      from: `${a.time}:00`,
      to: l ? `${l.time}:00` : "24:00:00",
      data: G(a)
    });
  }
  return o;
}
function Mt(t, e) {
  if (t === "all" && e === "all") return C;
  if (t === "wdwe" && e === "wd") return Et;
  if (t === "wdwe" && e === "we") return Ct;
  if (t === "days" && C.includes(e.toLowerCase()))
    return [e.toLowerCase()];
  throw new Error(`Unknown set "${e}" for granularity "${t}".`);
}
function Rt(t, e) {
  const s = {};
  for (const [n, i] of Object.entries(e)) {
    const o = zt(i);
    for (const r of Mt(t, n))
      s[r] = o;
  }
  for (const n of C)
    if (!s[n]) throw new Error(`No block set covers ${n}.`);
  return s;
}
function V(t) {
  const e = t.data;
  return {
    time: t.from.slice(0, 5),
    name: e.block ?? "?",
    mode: e.mode ?? "cool",
    cool_temp: e.cool_temp ?? null,
    heat_temp: e.heat_temp ?? null
  };
}
function Nt(t, e) {
  const s = V(t), n = V(e);
  return s.name === n.name && s.mode === n.mode && s.cool_temp === n.cool_temp && s.heat_temp === n.heat_temp;
}
function ie(t) {
  if (t.length === 0) return [];
  const e = [...t].sort((r, a) => r.from.localeCompare(a.from)), s = e[0], n = e[e.length - 1];
  return (e.length > 1 && s.from === "00:00:00" && Nt(s, n) ? e.slice(1) : e).map(V);
}
function T(t) {
  return JSON.stringify(
    [...t].sort((e, s) => e.from.localeCompare(s.from)).map((e) => [e.from, e.to, V(e)])
  );
}
const we = ["monday", "tuesday", "wednesday", "thursday", "friday"], Ae = ["saturday", "sunday"];
function Pt(t) {
  const e = C.map((o) => T(t[o] ?? []));
  if (e.every((o) => o === e[0])) return { granularity: "all", sets: { all: [...C] } };
  const n = we.every((o) => T(t[o] ?? []) === T(t.monday ?? [])), i = Ae.every((o) => T(t[o] ?? []) === T(t.saturday ?? []));
  return n && i ? { granularity: "wdwe", sets: { wd: [...we], we: [...Ae] } } : {
    granularity: "days",
    sets: Object.fromEntries(C.map((o) => [o, [o]]))
  };
}
const Tt = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];
function Ut(t) {
  return `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
}
function Dt(t, e) {
  for (let s = 0; s < 8; s++) {
    const n = new Date(e.getTime() + s * 864e5), i = Tt[n.getDay()], o = ie(t[i] ?? []);
    for (const r of o) {
      if (s === 0 && r.time <= Ut(e)) continue;
      const [a, l] = r.time.split(":").map(Number), c = new Date(n);
      c.setHours(a ?? 0, l ?? 0, 0, 0);
      const d = Math.round((c.getTime() - e.getTime()) / 6e4);
      if (!(d <= 0))
        return { ...r, day: i, minutesUntil: d };
    }
  }
  return null;
}
function It(t, e, s, n) {
  const i = {};
  for (const o of C) {
    const r = t[o];
    if (!r) continue;
    if (!e.includes(o)) {
      i[o] = r;
      continue;
    }
    const a = ie(r).map(
      (l) => l.time === s ? { ...l, ...n } : l
    );
    i[o] = Ht(a);
  }
  return i;
}
function Ht(t) {
  const e = [...t].sort((r, a) => r.time.localeCompare(a.time));
  if (e.length === 0) return [];
  const s = e[0], n = e[e.length - 1], i = (r) => ({
    block: r.name,
    mode: r.mode,
    ...r.cool_temp != null ? { cool_temp: r.cool_temp } : {},
    ...r.heat_temp != null ? { heat_temp: r.heat_temp } : {}
  });
  if (e.length === 1) return [{ from: "00:00:00", to: "24:00:00", data: i(s) }];
  const o = [];
  s.time !== "00:00" && o.push({ from: "00:00:00", to: `${s.time}:00`, data: i(n) });
  for (let r = 0; r < e.length; r++) {
    const a = e[r], l = e[r + 1];
    o.push({
      from: `${a.time}:00`,
      to: l ? `${l.time}:00` : "24:00:00",
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
  applied_block_marker: { domain: "input_text", suffix: "applied_block" },
  zone_enabled: { domain: "input_boolean", suffix: "enabled" }
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
  ...Object.values(oe).map((t) => t.suffix),
  ...Object.values(re).map((t) => t.suffix)
];
function k(t) {
  return t.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function y(t, e, s) {
  const n = oe[t];
  return `${n.domain}.${e}_${s}_${n.suffix}`;
}
function Wt(t, e, s) {
  return `schedule.${t}_${e}_${s}`;
}
function x(t, e) {
  const s = re[t];
  return `${s.domain}.${e}_${s.suffix}`;
}
function Se(t, e) {
  return `${t}_mzcs_${e}`;
}
function ke(t, e) {
  return {
    engine: "Climate: schedule engine",
    fan_timer: `Climate: ${e ?? "?"} fan timer finished`,
    season_recommender: "Climate: season recommender",
    runtime_alert: "Climate: runtime anomaly alert",
    watchdog: "Climate: engine watchdog",
    steering: "Climate: comfort steering"
  }[t] ?? `Climate: ${t}`;
}
function jt(t, e, s, n) {
  const i = t.indexOf(".");
  if (i < 0) return null;
  const o = t.slice(0, i), r = t.slice(i + 1);
  if (r !== e && !r.startsWith(`${e}_`)) return null;
  const a = r.slice(e.length + 1);
  for (const [c, d] of Object.entries(re))
    if (o === d.domain && a === d.suffix) return { cls: c };
  const l = [...s].sort((c, d) => d.length - c.length);
  for (const c of l) {
    if (a !== c && !a.startsWith(`${c}_`)) continue;
    const d = a.slice(c.length + 1);
    for (const [h, _] of Object.entries(oe))
      if (o === _.domain && d === _.suffix) return { cls: h, zone: c };
    if (o === "schedule" && n.includes(d))
      return { cls: "zone_schedule", zone: c, season: d };
  }
  return null;
}
const De = 2, Ie = 4;
function Bt(t, e = De, s = Ie) {
  const n = Math.abs(t);
  return n <= e ? "green" : n <= s ? "amber" : "red";
}
function Lt(t) {
  const e = Math.round(t);
  return `${e > 0 ? "+" : ""}${e}°`;
}
function Ft(t, e) {
  let s = t != null && t > 0 ? t : De, n = e != null && e > 0 ? e : Ie;
  return n <= s && (n = s + 1), { greenMax: s, amberMax: n };
}
const qt = "mzcs", Ee = "r1", Vt = [
  { cls: "season_confirm_days", min: 1, max: 14, step: 1, initial: 3 },
  { cls: "season_dwell_days", min: 1, max: 60, step: 1, initial: 14 },
  { cls: "dev_green_max", min: 1, max: 10, step: 1, initial: 2, unit: "°F" },
  { cls: "dev_amber_max", min: 1, max: 15, step: 1, initial: 4, unit: "°F" },
  { cls: "runtime_alert_margin", min: 5, max: 100, step: 5, initial: 35, unit: "%" },
  { cls: "runtime_alert_days", min: 1, max: 7, step: 1, initial: 3 },
  { cls: "runtime_learn_days", min: 7, max: 60, step: 1, initial: 30 },
  { cls: "cdd_base", min: 60, max: 80, step: 1, initial: 75, unit: "°F" }
], Yt = [
  { cls: "override_minutes", min: 15, max: 240, step: 15, initial: 60 },
  { cls: "steer_min_setpoint", min: 50, max: 80, step: 1, initial: 68 },
  { cls: "steer_max_setpoint", min: 70, max: 95, step: 1, initial: 85 },
  { cls: "steer_max_offset", min: 1, max: 10, step: 1, initial: 5 }
];
function Zt(t) {
  return Rt(t.granularity, t.sets);
}
function Kt(t) {
  const e = [], s = t.prefix;
  for (const i of t.zones) {
    t.features.fan_timer && e.push({
      id: y("fan_timer", s, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} fan`, restore: !0 }
    }), e.push({
      id: y("running_sensor", s, i.slug),
      kind: "template_sensor",
      spec: { name: `Climate ${i.name} running`, source: "hvac_action" }
    }), e.push({
      id: y("runtime_today", s, i.slug),
      kind: "stats_sensor",
      spec: { name: `Climate ${i.name} runtime today`, state_class: "total_increasing" }
    }), e.push({
      id: y("expected_runtime", s, i.slug),
      kind: "template_sensor",
      spec: { name: `Climate ${i.name} expected runtime`, model: "k_x_cdd" }
    }), e.push({
      id: y("applied_block_marker", s, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} applied block` }
    }), e.push({
      id: y("zone_enabled", s, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} enabled` }
    }), t.features.steering && (e.push({
      id: y("target_room_select", s, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} target room`, options: ["Thermostat"] }
    }), e.push({
      id: y("room_override_timer", s, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} room override`, restore: !0 }
    }), e.push({
      id: y("sensor_schedule", s, i.slug),
      kind: "schedule",
      spec: { name: `Climate ${i.name} sensor schedule` }
    }));
    for (const o of t.seasons) {
      const r = t.schedules[i.slug]?.[o.key];
      if (!r) throw new Error(`Missing schedule for ${i.slug}/${o.key}.`);
      e.push({
        id: Wt(s, i.slug, o.key),
        kind: "schedule",
        spec: { name: `Climate ${i.name} ${o.name}`, week: Zt(r) }
      });
    }
  }
  e.push({
    id: x("season_select", s),
    kind: "helper",
    spec: { name: "Climate season", options: t.seasons.map((i) => i.name) }
  }), e.push({
    id: x("season_mode", s),
    kind: "helper",
    spec: { name: "Climate season mode", options: ["Manual", "Semi-auto", "Full-auto"] }
  });
  for (const i of Vt)
    e.push({
      id: x(i.cls, s),
      kind: "helper",
      spec: { min: i.min, max: i.max, step: i.step, initial: i.initial, ...i.unit ? { unit: i.unit } : {} }
    });
  if (t.features.steering)
    for (const i of Yt)
      e.push({
        id: x(i.cls, s),
        kind: "helper",
        spec: { min: i.min, max: i.max, step: i.step, initial: i.initial }
      });
  e.push({
    id: x("next_block_sensor", s),
    kind: "template_sensor",
    spec: { name: "Climate next block" }
  });
  const n = (i, o) => ({
    id: `automation:${Se(s, i)}`,
    kind: "automation",
    spec: { alias: ke(i, o), revision: Ee }
  });
  if (e.push(n("engine")), e.push(n("watchdog")), t.seasons.length > 1 && e.push(n("season_recommender")), t.features.anomaly_alerts && e.push(n("runtime_alert")), t.features.fan_timer)
    for (const i of t.zones)
      e.push({
        id: `automation:${Se(s, `fan_timer_${i.slug}`)}`,
        kind: "automation",
        spec: { alias: ke("fan_timer", i.name), revision: Ee }
      });
  return t.features.steering && e.push(n("steering")), e;
}
function Jt(t, e) {
  return Y(t) === Y(e);
}
function Y(t) {
  if (Array.isArray(t)) return `[${t.map(Y).join(",")}]`;
  if (t !== null && typeof t == "object") {
    const e = t;
    return `{${Object.keys(e).sort().map((s) => `${JSON.stringify(s)}:${Y(e[s])}`).join(",")}}`;
  }
  return JSON.stringify(t);
}
function Gt(t, e) {
  const s = { create: [], adopt: [], update: [], delete: [], noop: [] }, n = new Map(e.map((o) => [o.id, o])), i = new Set(t.map((o) => o.id));
  for (const o of t) {
    const r = n.get(o.id);
    r ? r.managed ? Jt(r.spec, o.spec) ? s.noop.push({ op: "noop", id: o.id, kind: o.kind }) : s.update.push({ op: "update", id: o.id, kind: o.kind, spec: o.spec, from: r.spec }) : s.adopt.push({ op: "adopt", id: o.id, kind: o.kind, spec: o.spec }) : s.create.push({ op: "create", id: o.id, kind: o.kind, spec: o.spec });
  }
  for (const o of e)
    o.managed && !i.has(o.id) && s.delete.push({ op: "delete", id: o.id, kind: o.kind });
  return s;
}
function Xt(t) {
  const e = t.default_mode;
  return { granularity: "all", sets: { all: [{
    time: "06:00",
    name: "Day",
    mode: e,
    cool_temp: e === "heat" ? null : e === "heat_cool" ? 84 : 78,
    heat_temp: e === "heat" ? 68 : e === "heat_cool" ? 66 : null
  }] } };
}
function Qt(t, e) {
  const s = {};
  for (const n of t) {
    s[n] = {};
    for (const i of e) s[n][i.key] = Xt(i);
  }
  return s;
}
const es = {
  fan_timer: "helper",
  room_override_timer: "helper",
  target_room_select: "helper",
  applied_block_marker: "helper",
  zone_enabled: "helper",
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
async function B(t, e) {
  if (!t.callWS) return [];
  try {
    const s = await t.callWS({ type: `${e}/list` });
    return Array.isArray(s) ? s : [];
  } catch {
    return [];
  }
}
async function ts(t, e) {
  const s = /* @__PURE__ */ new Map();
  if (!t.callWS || e.length === 0) return s;
  try {
    const n = await t.callWS({
      type: "config/entity_registry/get_entries",
      entity_ids: e
    });
    for (const [i, o] of Object.entries(n ?? {}))
      o?.labels && s.set(i, o.labels);
  } catch {
  }
  return s;
}
async function ss(t, e, s, n) {
  const i = [];
  for (const m of Object.keys(t.states)) {
    const f = jt(m, e, s, n);
    if (!f) continue;
    const $ = es[f.cls];
    $ && i.push({ id: m, kind: $ });
  }
  const [o, r, a, l, c] = await Promise.all([
    B(t, "timer"),
    B(t, "input_select"),
    B(t, "input_number"),
    B(t, "schedule"),
    ts(
      t,
      i.map((m) => m.id)
    )
  ]), d = (m, f) => {
    const $ = /* @__PURE__ */ new Map();
    for (const w of m) w.id && $.set(`${f}.${w.id}`, w);
    return $;
  }, h = new Map([
    ...d(o, "timer"),
    ...d(r, "input_select"),
    ...d(a, "input_number"),
    ...d(l, "schedule")
  ]), _ = [];
  for (const m of i) {
    const f = h.get(m.id), $ = t.states[m.id];
    let w = {};
    m.id.startsWith("input_number.") && f ? w = { min: f.min, max: f.max, step: f.step } : m.id.startsWith("input_select.") && f ? w = { name: f.name, options: f.options } : m.id.startsWith("timer.") && f ? w = { name: f.name, restore: f.restore ?? !1 } : m.id.startsWith("schedule.") && f ? w = { name: f.name, raw: !0 } : $ && (w = { name: $.attributes.friendly_name ?? m.id }), _.push({
      id: m.id,
      kind: m.kind,
      spec: w,
      managed: (c.get(m.id) ?? []).includes(qt)
    });
  }
  for (const [m, f] of Object.entries(t.states)) {
    if (!m.startsWith("automation.") || !f) continue;
    const $ = f.attributes.id;
    typeof $ == "string" && $.startsWith(`${e}_mzcs_`) && _.push({
      id: `automation:${$}`,
      kind: "automation",
      spec: { alias: f.attributes.friendly_name ?? $, revision: "unknown" },
      managed: !0
    });
  }
  return _;
}
var ns = Object.defineProperty, is = Object.getOwnPropertyDescriptor, b = (t, e, s, n) => {
  for (var i = n > 1 ? void 0 : n ? is(e, s) : e, o = t.length - 1, r; o >= 0; o--)
    (r = t[o]) && (i = (n ? r(e, s, i) : r(i)) || i);
  return n && i && ns(e, s, i), i;
};
const os = [
  { cls: "dev_green_max", label: "Room deviation · green up to (°)" },
  { cls: "dev_amber_max", label: "Room deviation · amber up to (°)" },
  { cls: "runtime_alert_margin", label: "Runtime alert margin (%)" },
  { cls: "runtime_alert_days", label: "Runtime alert · consecutive days" },
  { cls: "runtime_learn_days", label: "Runtime learn window (days)" },
  { cls: "cdd_base", label: "Cooling degree-day base (°)" },
  { cls: "season_confirm_days", label: "Season switch · confirm after (days)" },
  { cls: "season_dwell_days", label: "Season switch · min dwell (days)" }
];
function rs(t) {
  const [e, s] = t.split(":");
  let n = Number(e);
  const i = n >= 12 ? "PM" : "AM";
  return n = n % 12 === 0 ? 12 : n % 12, `${n}:${s} ${i}`;
}
const as = {
  all: "Every day",
  wd: "Weekdays",
  we: "Weekend"
}, ls = {
  heat: "Heat",
  cool: "Cool",
  heat_cool: "Heat·Cool",
  off: "Off",
  auto: "Auto",
  dry: "Dry",
  fan_only: "Fan only"
};
console.info(`%c ${Te} %c v${ut}`, "background:#1e88e5;color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;", "background:#243039;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;");
let g = class extends D {
  constructor() {
    super(...arguments), this._zoneIndex = 0, this._ctrlOpen = !1, this._setupOpen = !1, this._schedOpen = !1, this._schedName = "", this._schedBusy = !1, this._dryRunning = !1;
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
  _nudge(t) {
    const e = this._zone();
    if (!e || !this.hass) return;
    const s = ye(this.hass, e.entity);
    if (s.setpoint == null) return;
    const n = this.hass.states[e.entity]?.attributes, i = bt(
      s.setpoint + t,
      s.setpoint,
      n?.min_temp,
      n?.max_temp
    );
    i !== s.setpoint && kt(this.hass, e.entity, i);
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
      schedules: Qt(
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
        const t = this._provisionInput(), e = await ss(
          this.hass,
          t.prefix,
          t.zones.map((s) => s.slug),
          t.seasons.map((s) => s.key)
        );
        this._dryRun = Gt(Kt(t), e);
      } catch (t) {
        this._dryRunError = t instanceof Error ? t.message : String(t);
      } finally {
        this._dryRunning = !1;
      }
    }
  }
  _renderSetup() {
    const t = this._dryRun;
    return p`
      <div class="setup">
        <p class="setup-title">Setup · dry run</p>
        <p class="setup-sub">
          Read-only preview of what Setup would create. Nothing is written from this screen.
        </p>
        <button class="chip" .disabled=${this._dryRunning} @click=${() => void this._runDryRun()}>
          ${this._dryRunning ? "Reading registry…" : "Run dry-run preview"}
        </button>
        ${this._dryRunError ? p`<p class="setup-err">${this._dryRunError}</p>` : u}
        ${t ? p`
              <div class="planwrap">
                ${[
      ["Create", t.create, ""],
      ["Adopt", t.adopt, ""],
      ["Update", t.update, ""],
      ["Delete", t.delete, "del"],
      ["Unchanged", t.noop, "quiet"]
    ].map(
      ([e, s, n]) => p`
                    <p class="plan-h ${n}">${e} (${s.length})</p>
                    ${s.length > 0 && e !== "Unchanged" ? p`<ul class="plan-list ${n}">
                          ${s.map((i) => p`<li>${i.id}</li>`)}
                        </ul>` : u}
                  `
    )}
              </div>
            ` : u}
        ${this._renderManage()}
        <button class="chip" @click=${() => this._setupOpen = !1}>Close</button>
      </div>
    `;
  }
  _renderManage() {
    const t = this.hass;
    if (!t) return u;
    const e = x("season_select", this._prefix), s = t.states[e], n = Array.isArray(s?.attributes.options) ? s.attributes.options : [], i = os.map((a) => ({
      ...a,
      id: x(a.cls, this._prefix)
    })).filter((a) => P(t, a.id));
    if (!s && i.length === 0) return u;
    const o = (this._config?.zones ?? []).map((a) => {
      const l = k(a.name);
      return {
        name: a.name,
        enableId: y("zone_enabled", this._prefix, l),
        markerId: y("applied_block_marker", this._prefix, l)
      };
    }).filter((a) => P(t, a.enableId)), r = o.length > 0 && o.every((a) => t.states[a.enableId]?.state === "on");
    return p`
      <p class="setup-title" style="margin-top:12px;">Manage</p>
      ${o.length > 0 ? p`
            <div class="managerow master">
              <span>Scheduling · all zones</span>
              <button
                class=${r ? "chip togg on" : "chip togg"}
                @click=${() => {
      for (const a of o) xe(t, a.enableId, a.markerId, !r);
    }}
              >
                ${r ? "On" : "Off"}
              </button>
            </div>
            ${o.map((a) => {
      const l = t.states[a.enableId]?.state === "on";
      return p`
                <div class="managerow">
                  <span>${a.name} scheduling</span>
                  <button
                    class=${l ? "chip togg on" : "chip togg"}
                    @click=${() => void xe(t, a.enableId, a.markerId, !l)}
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
      ${s ? p`
            <div class="managerow">
              <span>Active season</span>
              <select
                @change=${(a) => void At(t, e, a.target.value)}
              >
                ${n.map(
      (a) => p`<option .value=${a} ?selected=${a === s.state}>${a}</option>`
    )}
              </select>
            </div>
          ` : u}
      ${i.map(
      (a) => p`
          <div class="managerow">
            <span>${a.label}</span>
            <input
              type="number"
              .value=${t.states[a.id]?.state ?? ""}
              @change=${(l) => void wt(t, a.id, Number(l.target.value))}
            />
          </div>
        `
    )}
    `;
  }
  render() {
    if (!this._config || !this.hass) return u;
    const t = this._zone();
    if (!t) return u;
    if (this._setupOpen)
      return p`<ha-card><div class="wrap">${this._renderSetup()}</div></ha-card>`;
    const e = ye(this.hass, t.entity), s = pt(
      this.hass,
      y("fan_timer", this._prefix, k(t.name))
    ), n = e.action === "cooling", i = e.action === "heating", o = e.available ? n ? `Cooling to ${e.setpoint}` : i ? `Heating to ${e.setpoint}` : e.mode === "off" ? "Off" : `Idle · set ${e.setpoint ?? "–"}` : "Unavailable";
    return p`
      <ha-card>
        <div class="wrap">
          <div class="tabs" role="tablist">
            ${this._config.zones.map(
      (r, a) => p`
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
              <p class="name">${t.name}</p>
              <p class="status">
                ${o}${e.inside != null ? ` · inside ${e.inside}°` : ""}${e.humidity != null ? ` · ${e.humidity}% RH` : ""}${s ? p`<span class="fan"> · fan on</span>` : ""}
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
          ${this._renderSchedule(t)}
        </div>
      </ha-card>
    `;
  }
  _activeSeasonKey() {
    const t = this.hass?.states[x("season_select", this._prefix)];
    return t && t.state !== "unknown" ? k(t.state) : null;
  }
  _scheduleEntityId(t) {
    const e = this._activeSeasonKey();
    return e ? `schedule.${this._prefix}_${k(t.name)}_${e}` : null;
  }
  async _loadWeek(t) {
    if (!this.hass) return;
    const e = this._scheduleEntityId(t);
    if (!e || !P(this.hass, e)) {
      this._schedWeek = void 0;
      return;
    }
    this._schedBusy = !0;
    try {
      const s = await xt(this.hass, e);
      this._schedWeek = s?.week ?? void 0, this._schedName = s?.name ?? "", this._schedError = s ? void 0 : "Could not load schedule config.";
    } catch (s) {
      this._schedError = ve(s);
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
        const o = It(this._schedWeek, e, s, n);
        await vt(
          this.hass,
          i,
          o,
          this._schedName
        ), this._schedWeek = o, this._schedError = void 0;
      } catch (o) {
        this._schedError = ve(o);
      } finally {
        this._schedBusy = !1;
      }
    }
  }
  _renderSchedule(t) {
    if (!this.hass) return u;
    const e = this._scheduleEntityId(t);
    if (!e || !P(this.hass, e)) return u;
    this._schedLoadedFor !== e && !this._schedBusy && (this._schedLoadedFor = e, this._schedWeek = void 0, queueMicrotask(() => void this._loadWeek(t)));
    const s = this.hass.states[x("season_select", this._prefix)]?.state ?? "", n = this._schedWeek, i = n ? Dt(n, /* @__PURE__ */ new Date()) : null, o = i ? `Next · ${rs(i.time)} ${i.name} → ${i.cool_temp ?? i.heat_temp}°` : "Schedule";
    return p`
      <button
        class="schedrow"
        @click=${() => {
      this._schedOpen = !this._schedOpen, this._schedWeek || this._loadWeek(t);
    }}
      >
        <span>${o} <span class="season">· ${s}</span></span>
        <span aria-hidden="true">${this._schedOpen ? "▴" : "▾"}</span>
      </button>
      ${this._schedOpen ? this._renderScheduleBody(t) : u}
    `;
  }
  _renderScheduleBody(t) {
    if (this._schedBusy && !this._schedWeek) return p`<p class="muted pad">Loading…</p>`;
    if (this._schedError) return p`<p class="schederr pad">${this._schedError}</p>`;
    const e = this._schedWeek;
    if (!e) return p`<p class="muted pad">No schedule data.</p>`;
    const s = Pt(e), n = (/* @__PURE__ */ new Date()).getDay(), i = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][n];
    return p`
      <div class="schedbody">
        ${Object.entries(s.sets).map(([o, r]) => {
      const a = ie(e[r[0]] ?? []), l = r.includes(i);
      return p`
            <p class="sethead">
              ${as[o] ?? o}${l ? p` <span class="today">today</span>` : u}
            </p>
            ${a.map(
        (c) => p`
                <div class="blockrow">
                  <input
                    class="btime"
                    type="time"
                    .value=${c.time}
                    @change=${(d) => void this._saveBlockEdit(t, r, c.time, {
          time: d.target.value
        })}
                  />
                  <span class="bname">${c.name}</span>
                  <input
                    class="btemp"
                    type="number"
                    .value=${String(c.cool_temp ?? c.heat_temp ?? "")}
                    @change=${(d) => void this._saveBlockEdit(t, r, c.time, {
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
      const o = y("applied_block_marker", this._prefix, k(t.name));
      St(this.hass, o, "automation.climate_schedule_engine");
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
    const n = ht(e, t), i = e.states[t]?.state, o = mt(e, t), r = y("fan_timer", this._prefix, k(s.name)), a = this._config?.features?.fan_timer ?? [15, 30, 60], l = P(e, r);
    return p`
      <button class="expander" @click=${() => this._ctrlOpen = !this._ctrlOpen}>
        <span>Mode</span>
        <span aria-hidden="true">${this._ctrlOpen ? "▴" : "▾"}</span>
      </button>
      ${this._ctrlOpen ? p`
            <div class="ctrl">
              <div class="chips">
                ${n.map(
      (c) => p`
                    <button
                      class=${i === c ? "chip mode-on" : "chip"}
                      @click=${() => void _t(e, t, c)}
                    >
                      ${ls[c] ?? c}
                    </button>
                  `
    )}
                ${o ? p`
                      <button
                        class=${$e(e, t) ? "chip eco eco-on" : "chip eco"}
                        @click=${() => void gt(e, t, !$e(e, t))}
                      >
                        Eco
                      </button>
                    ` : u}
              </div>
              ${l ? p`
                    <div class="chips fanrow">
                      <span class="fanlbl">Fan</span>
                      ${a.map(
      (c) => p`
                          <button
                            class="chip"
                            @click=${() => void $t(e, t, r, c)}
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
    const s = this.hass, { greenMax: n, amberMax: i } = Ft(
      be(s, x("dev_green_max", this._prefix)),
      be(s, x("dev_amber_max", this._prefix))
    );
    return p`
      <div class="rooms">
        ${t.room_sensors.map((o) => {
      const r = ft(s, o);
      if (r.temp == null || e == null)
        return p`
              <div class="room">
                <span class="rname">${r.name}</span>
                <span class="rtemp muted">${r.temp == null ? "—" : `${r.temp}°`}</span>
              </div>
            `;
      const a = Math.round(r.temp - e);
      return p`
            <div class="room">
              <span class="rname">${r.name}</span>
              <span>
                <span class="badge ${Bt(a, n, i)}"
                  >${Lt(a)}</span
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
g.styles = We`
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
    .managerow {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      padding: 3px 0;
    }
    .managerow.master {
      font-weight: 500;
    }
    .chip.togg {
      min-width: 44px;
    }
    .chip.togg.on {
      background: #2bb673;
      border-color: #2bb673;
      color: #fff;
    }
    .managerow input,
    .managerow select {
      width: 90px;
      background: var(--card-background-color, #16202a);
      border: 0.5px solid var(--divider-color, #3d4a55);
      border-radius: 6px;
      color: var(--primary-text-color, #e8edf1);
      padding: 4px 6px;
      font-size: 12px;
    }
  `;
b([
  Ne({ attribute: !1 })
], g.prototype, "hass", 2);
b([
  v()
], g.prototype, "_config", 2);
b([
  v()
], g.prototype, "_zoneIndex", 2);
b([
  v()
], g.prototype, "_ctrlOpen", 2);
b([
  v()
], g.prototype, "_setupOpen", 2);
b([
  v()
], g.prototype, "_schedOpen", 2);
b([
  v()
], g.prototype, "_schedWeek", 2);
b([
  v()
], g.prototype, "_schedError", 2);
b([
  v()
], g.prototype, "_schedBusy", 2);
b([
  v()
], g.prototype, "_dryRun", 2);
b([
  v()
], g.prototype, "_dryRunError", 2);
b([
  v()
], g.prototype, "_dryRunning", 2);
g = b([
  lt(Pe)
], g);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: Pe,
  name: Te,
  description: "Nest-style climate view for 1-4 zones with seasonal scheduling, fan timers, and runtime history."
});
export {
  g as MzcsCard
};

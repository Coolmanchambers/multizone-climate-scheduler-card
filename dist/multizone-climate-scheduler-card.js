/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const se = globalThis, ve = se.ShadowRoot && (se.ShadyCSS === void 0 || se.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, we = Symbol(), Ne = /* @__PURE__ */ new WeakMap();
let ft = class {
  constructor(e, s, n) {
    if (this._$cssResult$ = !0, n !== we) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (ve && e === void 0) {
      const n = s !== void 0 && s.length === 1;
      n && (e = Ne.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && Ne.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Nt = (t) => new ft(typeof t == "string" ? t : t + "", void 0, we), _t = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((n, i, a) => n + ((o) => {
    if (o._$cssResult$ === !0) return o.cssText;
    if (typeof o == "number") return o;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + o + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + t[a + 1], t[0]);
  return new ft(s, t, we);
}, It = (t, e) => {
  if (ve) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const n = document.createElement("style"), i = se.litNonce;
    i !== void 0 && n.setAttribute("nonce", i), n.textContent = s.cssText, t.appendChild(n);
  }
}, Ie = ve ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const n of e.cssRules) s += n.cssText;
  return Nt(s);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Lt, defineProperty: Wt, getOwnPropertyDescriptor: jt, getOwnPropertyNames: Ht, getOwnPropertySymbols: Bt, getPrototypeOf: Ut } = Object, le = globalThis, Le = le.trustedTypes, Ft = Le ? Le.emptyScript : "", Kt = le.reactiveElementPolyfillSupport, q = (t, e) => t, ne = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? Ft : null;
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
} }, ke = (t, e) => !Lt(t, e), We = { attribute: !0, type: String, converter: ne, reflect: !1, useDefault: !1, hasChanged: ke };
Symbol.metadata ??= Symbol("metadata"), le.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let W = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = We) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const n = Symbol(), i = this.getPropertyDescriptor(e, n, s);
      i !== void 0 && Wt(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, s, n) {
    const { get: i, set: a } = jt(this.prototype, e) ?? { get() {
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
    return this.elementProperties.get(e) ?? We;
  }
  static _$Ei() {
    if (this.hasOwnProperty(q("elementProperties"))) return;
    const e = Ut(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(q("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(q("properties"))) {
      const s = this.properties, n = [...Ht(s), ...Bt(s)];
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
      for (const i of n) s.unshift(Ie(i));
    } else e !== void 0 && s.push(Ie(e));
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
    return It(e, this.constructor.elementStyles), e;
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
      const a = (n.converter?.toAttribute !== void 0 ? n.converter : ne).toAttribute(s, n.type);
      this._$Em = e, a == null ? this.removeAttribute(i) : this.setAttribute(i, a), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const n = this.constructor, i = n._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const a = n.getPropertyOptions(i), o = typeof a.converter == "function" ? { fromAttribute: a.converter } : a.converter?.fromAttribute !== void 0 ? a.converter : ne;
      this._$Em = i;
      const r = o.fromAttribute(s, a.type);
      this[i] = r ?? this._$Ej?.get(i) ?? r, this._$Em = null;
    }
  }
  requestUpdate(e, s, n, i = !1, a) {
    if (e !== void 0) {
      const o = this.constructor;
      if (i === !1 && (a = this[e]), n ??= o.getPropertyOptions(e), !((n.hasChanged ?? ke)(a, s) || n.useDefault && n.reflect && a === this._$Ej?.get(e) && !this.hasAttribute(o._$Eu(e, n)))) return;
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
W.elementStyles = [], W.shadowRootOptions = { mode: "open" }, W[q("elementProperties")] = /* @__PURE__ */ new Map(), W[q("finalized")] = /* @__PURE__ */ new Map(), Kt?.({ ReactiveElement: W }), (le.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Se = globalThis, je = (t) => t, ie = Se.trustedTypes, He = ie ? ie.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, gt = "$lit$", C = `lit$${Math.random().toFixed(9).slice(2)}$`, yt = "?" + C, qt = `<${yt}>`, L = document, Z = () => L.createComment(""), V = (t) => t === null || typeof t != "object" && typeof t != "function", Ae = Array.isArray, Zt = (t) => Ae(t) || typeof t?.[Symbol.iterator] == "function", me = `[ 	
\f\r]`, U = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, Be = /-->/g, Ue = />/g, R = RegExp(`>|${me}(?:([^\\s"'>=/]+)(${me}*=${me}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), Fe = /'/g, Ke = /"/g, bt = /^(?:script|style|textarea|title)$/i, Vt = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), p = Vt(1), H = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), qe = /* @__PURE__ */ new WeakMap(), N = L.createTreeWalker(L, 129);
function $t(t, e) {
  if (!Ae(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return He !== void 0 ? He.createHTML(e) : e;
}
const Gt = (t, e) => {
  const s = t.length - 1, n = [];
  let i, a = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", o = U;
  for (let r = 0; r < s; r++) {
    const c = t[r];
    let l, d, u = -1, f = 0;
    for (; f < c.length && (o.lastIndex = f, d = o.exec(c), d !== null); ) f = o.lastIndex, o === U ? d[1] === "!--" ? o = Be : d[1] !== void 0 ? o = Ue : d[2] !== void 0 ? (bt.test(d[2]) && (i = RegExp("</" + d[2], "g")), o = R) : d[3] !== void 0 && (o = R) : o === R ? d[0] === ">" ? (o = i ?? U, u = -1) : d[1] === void 0 ? u = -2 : (u = o.lastIndex - d[2].length, l = d[1], o = d[3] === void 0 ? R : d[3] === '"' ? Ke : Fe) : o === Ke || o === Fe ? o = R : o === Be || o === Ue ? o = U : (o = R, i = void 0);
    const m = o === R && t[r + 1].startsWith("/>") ? " " : "";
    a += o === U ? c + qt : u >= 0 ? (n.push(l), c.slice(0, u) + gt + c.slice(u) + C + m) : c + C + (u === -2 ? r : m);
  }
  return [$t(t, a + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), n];
};
class G {
  constructor({ strings: e, _$litType$: s }, n) {
    let i;
    this.parts = [];
    let a = 0, o = 0;
    const r = e.length - 1, c = this.parts, [l, d] = Gt(e, s);
    if (this.el = G.createElement(l, n), N.currentNode = this.el.content, s === 2 || s === 3) {
      const u = this.el.content.firstChild;
      u.replaceWith(...u.childNodes);
    }
    for (; (i = N.nextNode()) !== null && c.length < r; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const u of i.getAttributeNames()) if (u.endsWith(gt)) {
          const f = d[o++], m = i.getAttribute(u).split(C), k = /([.?@])?(.*)/.exec(f);
          c.push({ type: 1, index: a, name: k[2], strings: m, ctor: k[1] === "." ? Jt : k[1] === "?" ? Xt : k[1] === "@" ? Qt : de }), i.removeAttribute(u);
        } else u.startsWith(C) && (c.push({ type: 6, index: a }), i.removeAttribute(u));
        if (bt.test(i.tagName)) {
          const u = i.textContent.split(C), f = u.length - 1;
          if (f > 0) {
            i.textContent = ie ? ie.emptyScript : "";
            for (let m = 0; m < f; m++) i.append(u[m], Z()), N.nextNode(), c.push({ type: 2, index: ++a });
            i.append(u[f], Z());
          }
        }
      } else if (i.nodeType === 8) if (i.data === yt) c.push({ type: 2, index: a });
      else {
        let u = -1;
        for (; (u = i.data.indexOf(C, u + 1)) !== -1; ) c.push({ type: 7, index: a }), u += C.length - 1;
      }
      a++;
    }
  }
  static createElement(e, s) {
    const n = L.createElement("template");
    return n.innerHTML = e, n;
  }
}
function B(t, e, s = t, n) {
  if (e === H) return e;
  let i = n !== void 0 ? s._$Co?.[n] : s._$Cl;
  const a = V(e) ? void 0 : e._$litDirective$;
  return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(t), i._$AT(t, s, n)), n !== void 0 ? (s._$Co ??= [])[n] = i : s._$Cl = i), i !== void 0 && (e = B(t, i._$AS(t, e.values), i, n)), e;
}
class Yt {
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
    const { el: { content: s }, parts: n } = this._$AD, i = (e?.creationScope ?? L).importNode(s, !0);
    N.currentNode = i;
    let a = N.nextNode(), o = 0, r = 0, c = n[0];
    for (; c !== void 0; ) {
      if (o === c.index) {
        let l;
        c.type === 2 ? l = new Y(a, a.nextSibling, this, e) : c.type === 1 ? l = new c.ctor(a, c.name, c.strings, this, e) : c.type === 6 && (l = new es(a, this, e)), this._$AV.push(l), c = n[++r];
      }
      o !== c?.index && (a = N.nextNode(), o++);
    }
    return N.currentNode = L, i;
  }
  p(e) {
    let s = 0;
    for (const n of this._$AV) n !== void 0 && (n.strings !== void 0 ? (n._$AI(e, n, s), s += n.strings.length - 2) : n._$AI(e[s])), s++;
  }
}
class Y {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, s, n, i) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = e, this._$AB = s, this._$AM = n, this.options = i, this._$Cv = i?.isConnected ?? !0;
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
    e = B(this, e, s), V(e) ? e === h || e == null || e === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : e !== this._$AH && e !== H && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Zt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== h && V(this._$AH) ? this._$AA.nextSibling.data = e : this.T(L.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: n } = e, i = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = G.createElement($t(n.h, n.h[0]), this.options)), n);
    if (this._$AH?._$AD === i) this._$AH.p(s);
    else {
      const a = new Yt(i, this), o = a.u(this.options);
      a.p(s), this.T(o), this._$AH = a;
    }
  }
  _$AC(e) {
    let s = qe.get(e.strings);
    return s === void 0 && qe.set(e.strings, s = new G(e)), s;
  }
  k(e) {
    Ae(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let n, i = 0;
    for (const a of e) i === s.length ? s.push(n = new Y(this.O(Z()), this.O(Z()), this, this.options)) : n = s[i], n._$AI(a), i++;
    i < s.length && (this._$AR(n && n._$AB.nextSibling, i), s.length = i);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const n = je(e).nextSibling;
      je(e).remove(), e = n;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class de {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, s, n, i, a) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = e, this.name = s, this._$AM = i, this.options = a, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(new String()), this.strings = n) : this._$AH = h;
  }
  _$AI(e, s = this, n, i) {
    const a = this.strings;
    let o = !1;
    if (a === void 0) e = B(this, e, s, 0), o = !V(e) || e !== this._$AH && e !== H, o && (this._$AH = e);
    else {
      const r = e;
      let c, l;
      for (e = a[0], c = 0; c < a.length - 1; c++) l = B(this, r[n + c], s, c), l === H && (l = this._$AH[c]), o ||= !V(l) || l !== this._$AH[c], l === h ? e = h : e !== h && (e += (l ?? "") + a[c + 1]), this._$AH[c] = l;
    }
    o && !i && this.j(e);
  }
  j(e) {
    e === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Jt extends de {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === h ? void 0 : e;
  }
}
class Xt extends de {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== h);
  }
}
class Qt extends de {
  constructor(e, s, n, i, a) {
    super(e, s, n, i, a), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = B(this, e, s, 0) ?? h) === H) return;
    const n = this._$AH, i = e === h && n !== h || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, a = e !== h && (n === h || i);
    i && this.element.removeEventListener(this.name, this, n), a && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class es {
  constructor(e, s, n) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = n;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    B(this, e);
  }
}
const ts = Se.litHtmlPolyfillSupport;
ts?.(G, Y), (Se.litHtmlVersions ??= []).push("3.3.3");
const ss = (t, e, s) => {
  const n = s?.renderBefore ?? e;
  let i = n._$litPart$;
  if (i === void 0) {
    const a = s?.renderBefore ?? null;
    n._$litPart$ = i = new Y(e.insertBefore(Z(), a), a, void 0, s ?? {});
  }
  return i._$AI(t), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ze = globalThis;
class j extends W {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ss(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return H;
  }
}
j._$litElement$ = !0, j.finalized = !0, ze.litElementHydrateSupport?.({ LitElement: j });
const ns = ze.litElementPolyfillSupport;
ns?.({ LitElement: j });
(ze.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const xt = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const is = { attribute: !0, type: String, converter: ne, reflect: !1, hasChanged: ke }, as = (t = is, e, s) => {
  const { kind: n, metadata: i } = s;
  let a = globalThis.litPropertyMetadata.get(i);
  if (a === void 0 && globalThis.litPropertyMetadata.set(i, a = /* @__PURE__ */ new Map()), n === "setter" && ((t = Object.create(t)).wrapped = !0), a.set(s.name, t), n === "accessor") {
    const { name: o } = s;
    return { set(r) {
      const c = e.get.call(this);
      e.set.call(this, r), this.requestUpdate(o, c, t, !0, r);
    }, init(r) {
      return r !== void 0 && this.C(o, void 0, t, r), r;
    } };
  }
  if (n === "setter") {
    const { name: o } = s;
    return function(r) {
      const c = this[o];
      e.call(this, r), this.requestUpdate(o, c, t, !0, r);
    };
  }
  throw Error("Unsupported decorator location: " + n);
};
function Ee(t) {
  return (e, s) => typeof s == "object" ? as(t, e, s) : ((n, i, a) => {
    const o = i.hasOwnProperty(a);
    return i.constructor.createProperty(a, n), o ? Object.getOwnPropertyDescriptor(i, a) : void 0;
  })(t, e, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function b(t) {
  return Ee({ ...t, state: !0, attribute: !1 });
}
const os = "0.1.0", vt = "multizone-climate-scheduler-card", wt = "Multi-Zone Climate Scheduler Card";
function Ze(t, e) {
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
function rs(t, e) {
  return t.states[e]?.state === "active";
}
function P(t, e) {
  return t.states[e] !== void 0;
}
function cs(t, e) {
  const s = t.states[e]?.attributes.hvac_modes;
  return Array.isArray(s) ? s.filter((n) => typeof n == "string") : [];
}
function ls(t, e) {
  const s = t.states[e]?.attributes.preset_modes;
  return Array.isArray(s) && s.includes("eco");
}
function Ve(t, e) {
  return t.states[e]?.attributes.preset_mode === "eco";
}
function fe(t, e) {
  const s = t.states[e];
  if (!s) return null;
  const n = Number(s.state);
  return Number.isFinite(n) ? n : null;
}
function ds(t, e) {
  const s = t.states[e], n = typeof s?.attributes.friendly_name == "string" ? s.attributes.friendly_name.replace(/ (Temperature|temperature)$/, "") : e.split(".")[1] ?? e, i = s ? Number(s.state) : NaN;
  return { entityId: e, name: n, temp: Number.isFinite(i) ? i : null };
}
function ps(t, e, s) {
  return t.callService("climate", "set_hvac_mode", { entity_id: e, hvac_mode: s });
}
function us(t, e, s) {
  return t.callService("climate", "set_preset_mode", {
    entity_id: e,
    preset_mode: s ? "eco" : "none"
  });
}
function hs(t, e) {
  const s = t.states[e]?.attributes.fan_modes;
  return Array.isArray(s) && s.includes("on");
}
async function ms(t, e, s, n) {
  hs(t, e) && await t.callService("climate", "set_fan_mode", {
    entity_id: e,
    fan_mode: "on"
  });
  const i = String(n % 60).padStart(2, "0"), a = String(Math.floor(n / 60)).padStart(2, "0");
  await t.callService("timer", "start", {
    entity_id: s,
    duration: `${a}:${i}:00`
  });
}
function fs(t, e, s, n) {
  const i = typeof s == "number" ? s : null, a = typeof n == "number" ? n : null;
  return i != null && a != null && i < a && e != null && e >= i && e <= a ? Math.min(a, Math.max(i, t)) : t;
}
const kt = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
async function _s(t, e) {
  if (!t.callWS) return null;
  const s = e.split(".")[1];
  try {
    const i = (await t.callWS({ type: "schedule/list" })).find((o) => o.id === s);
    if (!i) return null;
    const a = {};
    for (const o of kt) i[o] && (a[o] = i[o]);
    return { id: String(i.id), name: typeof i.name == "string" ? i.name : void 0, week: a };
  } catch {
    return null;
  }
}
function gs(t, e, s, n) {
  if (!t.callWS) return Promise.reject(new Error("callWS unavailable"));
  const a = {
    type: "schedule/update",
    schedule_id: e.split(".")[1],
    name: n
  };
  for (const o of kt) a[o] = s[o] ?? [];
  return t.callWS(a);
}
function ys(t, e, s) {
  return t.callService("input_number", "set_value", { entity_id: e, value: s });
}
function bs(t, e, s) {
  return t.callService("input_select", "select_option", { entity_id: e, option: s });
}
async function Ge(t, e, s, n) {
  n && await t.callService("input_text", "set_value", { entity_id: s, value: "" }), await t.callService("input_boolean", n ? "turn_on" : "turn_off", {
    entity_id: e
  });
}
async function Ye(t, e, s) {
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
function $s(t, e) {
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
async function Je(t, e, s, n, i) {
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
    return $s(a?.[e] ?? [], i);
  } catch {
    return [];
  }
}
function Xe(t) {
  return t instanceof Error ? t.message : t && typeof t == "object" && "message" in t ? String(t.message) : JSON.stringify(t);
}
async function xs(t, e, s) {
  await t.callService("input_text", "set_value", {
    entity_id: e,
    value: ""
  }), await t.callService("automation", "trigger", {
    entity_id: s
  });
}
function vs(t, e, s) {
  return t.callService("climate", "set_temperature", {
    entity_id: e,
    temperature: s
  });
}
function ws(t, e, s, n = "on", i = 6e4) {
  const a = [...t].sort((d, u) => d.t - u.t), o = [];
  let r = "off";
  for (const d of a)
    if (d.t <= e) r = d.state;
    else break;
  let c = r === n ? e : null;
  for (const d of a) {
    if (d.t <= e || d.t >= s) continue;
    const u = d.state === n;
    u && c == null && (c = d.t), !u && c != null && (o.push({ start: c, end: d.t }), c = null);
  }
  c != null && o.push({ start: c, end: s });
  const l = [];
  for (const d of o) {
    const u = l[l.length - 1];
    u && d.start - u.end <= i ? u.end = d.end : l.push({ ...d });
  }
  return l;
}
function ks(t) {
  const e = [...t].sort((n, i) => n.t - i.t), s = [];
  for (const n of e) {
    const i = Number(n.state);
    if (!Number.isFinite(i)) continue;
    const a = s[s.length - 1];
    (!a || a.value !== i) && s.push({ t: n.t, value: i });
  }
  return s;
}
function F(t) {
  if (!Number.isFinite(t) || t < 0) return "–";
  const e = Math.round(t * 4) / 4, s = Math.floor(e), n = e - s, i = n === 0.25 ? "¼" : n === 0.5 ? "½" : n === 0.75 ? "¾" : "";
  return s === 0 && i ? `${i} hr` : `${s}${i} hr`;
}
function Ss(t, e, s) {
  const n = s - e;
  return {
    left: (t.start - e) / n * 100,
    width: (t.end - t.start) / n * 100
  };
}
function As(t, e, s, n) {
  if (!Number.isFinite(e) || e <= 0)
    return { status: "learning", label: "learning" };
  if (n < 6)
    return { status: "pending", label: "" };
  const i = e * (Math.min(n, 24) / 24), a = i * (1 + s / 100);
  return t > a && t - i > 0.5 ? { status: "high", label: "running high for the weather" } : { status: "normal", label: "normal for the weather" };
}
const Ce = {
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
}, be = {
  "nest-blue": { label: "Nest Blue", tokens: Ce },
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
}, Qe = "nest-blue", $e = /^#[0-9a-f]{6}$/i, ae = [
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
function et(t) {
  return `custom:${ae.map((e) => t[e]).join(",")}`;
}
function zs(t) {
  return ae.every((s) => $e.test(t[s])) ? { ...t } : { ...Ce };
}
function tt(t) {
  const e = { presetKey: Qe, tokens: be[Qe].tokens };
  if (!t) return e;
  const s = be[t];
  if (s) return { presetKey: t, tokens: s.tokens };
  if (t.startsWith("custom:")) {
    const n = t.slice(7).split(",");
    if (n.length === 5 && n.every((i) => $e.test(i.trim()))) {
      const [i, a, o, r, c] = n.map((l) => l.trim().toLowerCase());
      return {
        presetKey: "custom",
        tokens: { ...Ce, accent: i, accentBright: a, good: o, warn: r, bad: c }
      };
    }
    if (n.length === ae.length && n.every((i) => $e.test(i.trim())))
      return { presetKey: "custom", tokens: Object.fromEntries(
        ae.map((a, o) => [a, n[o].trim().toLowerCase()])
      ) };
  }
  return e;
}
const I = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
], Es = ["monday", "tuesday", "wednesday", "thursday", "friday"], Cs = ["saturday", "sunday"];
function Os(t) {
  const e = [];
  t.length === 0 && e.push("A day needs at least one block.");
  const s = /* @__PURE__ */ new Set();
  for (const n of t)
    /^([01]\d|2[0-3]):[0-5]\d$/.test(n.time) || e.push(`Bad time "${n.time}".`), s.has(n.time) && e.push(`Duplicate block time ${n.time}.`), s.add(n.time), n.mode === "cool" && n.cool_temp == null && e.push(`${n.name}: cool needs cool_temp.`), n.mode === "heat" && n.heat_temp == null && e.push(`${n.name}: heat needs heat_temp.`), n.mode === "heat_cool" && (n.cool_temp == null || n.heat_temp == null) && e.push(`${n.name}: heat_cool needs both cool_temp and heat_temp.`), n.cool_temp != null && n.heat_temp != null && n.heat_temp >= n.cool_temp && e.push(`${n.name}: heat_temp must be below cool_temp.`);
  return e;
}
function _e(t) {
  return {
    block: t.name,
    mode: t.mode,
    ...t.cool_temp != null ? { cool_temp: t.cool_temp } : {},
    ...t.heat_temp != null ? { heat_temp: t.heat_temp } : {}
  };
}
function Ds(t) {
  const e = Os(t);
  if (e.length > 0) throw new Error(e.join(" "));
  const s = [...t].sort((o, r) => o.time.localeCompare(r.time)), n = s[0], i = s[s.length - 1];
  if (s.length === 1)
    return [{ from: "00:00:00", to: "24:00:00", data: _e(n) }];
  const a = [];
  n.time !== "00:00" && a.push({ from: "00:00:00", to: `${n.time}:00`, data: _e(i) });
  for (let o = 0; o < s.length; o++) {
    const r = s[o], c = s[o + 1];
    a.push({
      from: `${r.time}:00`,
      to: c ? `${c.time}:00` : "24:00:00",
      data: _e(r)
    });
  }
  return a;
}
function Ms(t, e) {
  if (t === "all" && e === "all") return I;
  if (t === "wdwe" && e === "wd") return Es;
  if (t === "wdwe" && e === "we") return Cs;
  if (t === "days" && I.includes(e.toLowerCase()))
    return [e.toLowerCase()];
  throw new Error(`Unknown set "${e}" for granularity "${t}".`);
}
function Rs(t, e) {
  const s = {};
  for (const [n, i] of Object.entries(e)) {
    const a = Ds(i);
    for (const o of Ms(t, n))
      s[o] = a;
  }
  for (const n of I)
    if (!s[n]) throw new Error(`No block set covers ${n}.`);
  return s;
}
function oe(t) {
  const e = t.data;
  return {
    time: t.from.slice(0, 5),
    name: e.block ?? "?",
    mode: e.mode ?? "cool",
    cool_temp: e.cool_temp ?? null,
    heat_temp: e.heat_temp ?? null
  };
}
function Ps(t, e) {
  const s = oe(t), n = oe(e);
  return s.name === n.name && s.mode === n.mode && s.cool_temp === n.cool_temp && s.heat_temp === n.heat_temp;
}
function xe(t) {
  if (t.length === 0) return [];
  const e = [...t].sort((o, r) => o.from.localeCompare(r.from)), s = e[0], n = e[e.length - 1];
  return (e.length > 1 && s.from === "00:00:00" && Ps(s, n) ? e.slice(1) : e).map(oe);
}
function K(t) {
  return JSON.stringify(
    [...t].sort((e, s) => e.from.localeCompare(s.from)).map((e) => [e.from, e.to, oe(e)])
  );
}
const st = ["monday", "tuesday", "wednesday", "thursday", "friday"], nt = ["saturday", "sunday"];
function it(t) {
  const e = I.map((a) => K(t[a] ?? []));
  if (e.every((a) => a === e[0])) return { granularity: "all", sets: { all: [...I] } };
  const n = st.every((a) => K(t[a] ?? []) === K(t.monday ?? [])), i = nt.every((a) => K(t[a] ?? []) === K(t.saturday ?? []));
  return n && i ? { granularity: "wdwe", sets: { wd: [...st], we: [...nt] } } : {
    granularity: "days",
    sets: Object.fromEntries(I.map((a) => [a, [a]]))
  };
}
const Ts = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];
function Ns(t) {
  return `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
}
function Is(t, e) {
  for (let s = 0; s < 8; s++) {
    const n = new Date(e.getTime() + s * 864e5), i = Ts[n.getDay()], a = xe(t[i] ?? []);
    for (const o of a) {
      if (s === 0 && o.time <= Ns(e)) continue;
      const [r, c] = o.time.split(":").map(Number), l = new Date(n);
      l.setHours(r ?? 0, c ?? 0, 0, 0);
      const d = Math.round((l.getTime() - e.getTime()) / 6e4);
      if (!(d <= 0))
        return { ...o, day: i, minutesUntil: d };
    }
  }
  return null;
}
function Ls(t, e, s) {
  const n = {};
  for (const i of I) {
    const a = t[i];
    a && (n[i] = e.includes(i) ? js(s) : a);
  }
  return n;
}
function O(t) {
  const [e, s] = t.split(":").map(Number);
  return (e ?? 0) * 60 + (s ?? 0);
}
function at(t) {
  const e = Math.max(0, Math.min(1425, t));
  return `${String(Math.floor(e / 60)).padStart(2, "0")}:${String(e % 60).padStart(2, "0")}`;
}
function Ws(t) {
  if (t.length === 0) return [];
  const e = [...t].sort((i, a) => i.time.localeCompare(a.time)), s = [], n = O(e[0].time);
  return n > 0 && s.push({ block: e[e.length - 1], fromMin: 0, toMin: n, wrap: !0 }), e.forEach((i, a) => {
    s.push({
      block: i,
      fromMin: O(i.time),
      toMin: a < e.length - 1 ? O(e[a + 1].time) : 1440,
      wrap: !1
    });
  }), s;
}
function js(t) {
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
    const r = e[o], c = e[o + 1];
    a.push({
      from: `${r.time}:00`,
      to: c ? `${c.time}:00` : "24:00:00",
      data: i(r)
    });
  }
  return a;
}
const Oe = {
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
}, De = {
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
  ...Object.values(Oe).map((t) => t.suffix),
  ...Object.values(De).map((t) => t.suffix)
];
function E(t) {
  return t.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function $(t, e, s) {
  const n = Oe[t];
  return `${n.domain}.${e}_${s}_${n.suffix}`;
}
function St(t, e, s) {
  return `schedule.${t}_${e}_${s}`;
}
function v(t, e) {
  const s = De[t];
  return `${s.domain}.${e}_${s.suffix}`;
}
function z(t, e) {
  return `${t}_mzcs_${e}`;
}
function D(t, e) {
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
function Hs(t, e, s, n) {
  const i = t.indexOf(".");
  if (i < 0) return null;
  const a = t.slice(0, i), o = t.slice(i + 1);
  if (o !== e && !o.startsWith(`${e}_`)) return null;
  const r = o.slice(e.length + 1);
  for (const [l, d] of Object.entries(De))
    if (a === d.domain && r === d.suffix) return { cls: l };
  const c = [...s].sort((l, d) => d.length - l.length);
  for (const l of c) {
    if (r !== l && !r.startsWith(`${l}_`)) continue;
    const d = r.slice(l.length + 1);
    for (const [u, f] of Object.entries(Oe))
      if (a === f.domain && d === f.suffix) return { cls: u, zone: l };
    if (a === "schedule" && n.includes(d))
      return { cls: "zone_schedule", zone: l, season: d };
  }
  return null;
}
const At = 2, zt = 4;
function Bs(t, e = At, s = zt) {
  const n = Math.abs(t);
  return n <= e ? "green" : n <= s ? "amber" : "red";
}
function Us(t) {
  const e = Math.round(t);
  return `${e > 0 ? "+" : ""}${e}°`;
}
function Fs(t, e) {
  let s = t != null && t > 0 ? t : At, n = e != null && e > 0 ? e : zt;
  return n <= s && (n = s + 1), { greenMax: s, amberMax: n };
}
const J = "Managed by Multi-Zone Climate Scheduler Card (mzcs).";
function Ks(t) {
  const e = (i) => {
    if (Array.isArray(i)) return `[${i.map(e).join(",")}]`;
    if (i !== null && typeof i == "object") {
      const a = i;
      return `{${Object.keys(a).sort().map((o) => `${JSON.stringify(o)}:${e(a[o])}`).join(",")}}`;
    }
    return JSON.stringify(i);
  }, s = e(t);
  let n = 5381;
  for (let i = 0; i < s.length; i++) n = (n << 5) + n + s.charCodeAt(i) >>> 0;
  return n.toString(16).padStart(8, "0");
}
const qs = /\[mzcs-sig:([0-9a-f]{8})\]/;
function Et(t) {
  const e = typeof t == "string" ? t.match(qs) : null;
  return e ? e[1] : null;
}
function T(t) {
  const { description: e, ...s } = t;
  return Ks(s);
}
function X(t) {
  const e = T(t);
  return { ...t, description: `${String(t.description ?? "")} [mzcs-sig:${e}]` };
}
function Zs(t, e, s, n) {
  const i = {
    [z(t, "engine")]: T(Ct(t, e, s)),
    [z(t, "watchdog")]: T(Mt(t)),
    [z(t, "runtime_learning")]: T(Dt(t, e)),
    [z(t, "runtime_alert")]: T(Rt(t, e))
  };
  for (const a of e)
    i[z(t, `fan_timer_${a.slug}`)] = T(Ot(t, a, n));
  return i;
}
function Ct(t, e, s) {
  const n = e.flatMap((o) => s.map((r) => St(t, o.slug, r.key))), i = e.map((o) => $("zone_enabled", t, o.slug)), a = `{${s.map((o) => `'${o.name.replace(/'/g, "")}': '${o.key}'`).join(", ")}}`;
  return X({
    id: z(t, "engine"),
    alias: D("engine"),
    description: `${J} Applies the active season's schedule block to each ENABLED zone at block transitions. Per-zone applied-block markers mean manual changes and external raises HOLD until the next block; the 15-minute tick only recovers missed transitions. Zones stand down while their Eco preset is active. heat_cool blocks apply dual setpoints.`,
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
        variables: {
          season: `{{ ${a}.get(states('${v("season_select", t)}'), states('${v("season_select", t)}') | lower) }}`
        }
      },
      {
        alias: "Apply per zone",
        repeat: {
          for_each: e.map((o) => ({
            zone: o.slug,
            climate: o.climate,
            marker: $("applied_block_marker", t, o.slug),
            enabled: $("zone_enabled", t, o.slug)
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
  });
}
function Ot(t, e, s) {
  return X({
    id: z(t, `fan_timer_${e.slug}`),
    alias: D("fan_timer", e.name),
    description: `${J} Turns the ${e.name} fan off when its fan timer ends.`,
    mode: "single",
    triggers: [
      {
        trigger: "event",
        event_type: "timer.finished",
        event_data: { entity_id: $("fan_timer", t, e.slug) },
        alias: `${e.name} fan timer finished`
      }
    ],
    conditions: s ? [
      {
        alias: "Stand down while the fan-guard helper wants the fan running",
        condition: "state",
        entity_id: s,
        state: "off"
      }
    ] : [],
    actions: [
      {
        alias: `Turn the ${e.name} fan off`,
        action: "climate.set_fan_mode",
        target: { entity_id: e.climate },
        data: { fan_mode: "off" }
      }
    ]
  });
}
function Dt(t, e) {
  return X({
    id: z(t, "runtime_learning"),
    alias: D("runtime_learning"),
    description: `${J} Nightly EMA update of each zone's runtime-per-cooling-degree-day factor. Skips mild days; first valid day seeds directly.`,
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
            runtime: $("runtime_today", t, s.slug),
            k: $("k_factor", t, s.slug)
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
  });
}
function Mt(t) {
  const e = "automation." + D("engine").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return X({
    id: z(t, "watchdog"),
    alias: D("watchdog"),
    description: `${J} Alerts when the schedule engine automation is off or unavailable for 5 minutes while any zone is enabled.`,
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
  });
}
function Rt(t, e) {
  return X({
    id: z(t, "runtime_alert"),
    alias: D("runtime_alert"),
    description: `${J} Evening check: notifies when a zone's runtime is over the weather-normalized expectation by the alert margin. Uses learned k; silent while learning.`,
    mode: "single",
    triggers: [{ trigger: "time", at: "20:00:00", alias: "Evening check" }],
    conditions: [],
    actions: [
      {
        alias: "Check each zone",
        repeat: {
          for_each: e.map((s) => ({
            name: s.name,
            runtime: $("runtime_today", t, s.slug),
            expected: $("expected_runtime", t, s.slug)
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
  });
}
const Vs = "mzcs", ot = "r1", Gs = [
  { cls: "season_confirm_days", min: 1, max: 14, step: 1, initial: 3 },
  { cls: "season_dwell_days", min: 1, max: 60, step: 1, initial: 14 },
  { cls: "dev_green_max", min: 1, max: 10, step: 1, initial: 2, unit: "°F" },
  { cls: "dev_amber_max", min: 1, max: 15, step: 1, initial: 4, unit: "°F" },
  { cls: "runtime_alert_margin", min: 5, max: 100, step: 5, initial: 35, unit: "%" },
  { cls: "runtime_alert_days", min: 1, max: 7, step: 1, initial: 3 },
  { cls: "runtime_learn_days", min: 7, max: 60, step: 1, initial: 30 },
  { cls: "cdd_base", min: 60, max: 80, step: 1, initial: 75, unit: "°F" }
], Ys = [
  { cls: "override_minutes", min: 15, max: 240, step: 15, initial: 60 },
  { cls: "steer_min_setpoint", min: 50, max: 80, step: 1, initial: 68 },
  { cls: "steer_max_setpoint", min: 70, max: 95, step: 1, initial: 85 },
  { cls: "steer_max_offset", min: 1, max: 10, step: 1, initial: 5 }
];
function Js(t) {
  return Rs(t.granularity, t.sets);
}
function rt(t) {
  const e = [], s = t.prefix;
  for (const o of t.zones) {
    t.features.fan_timer && e.push({
      id: $("fan_timer", s, o.slug),
      kind: "helper",
      spec: { name: `Climate ${o.name} fan`, restore: !0 }
    }), e.push({
      id: $("running_sensor", s, o.slug),
      kind: "template_sensor",
      spec: { name: `Climate ${o.name} running`, source: "hvac_action" }
    }), e.push({
      id: $("runtime_today", s, o.slug),
      kind: "stats_sensor",
      spec: { name: `Climate ${o.name} runtime today`, state_class: "total_increasing" }
    }), e.push({
      id: $("expected_runtime", s, o.slug),
      kind: "template_sensor",
      spec: { name: `Climate ${o.name} expected runtime`, model: "k_x_cdd" }
    }), e.push({
      id: $("applied_block_marker", s, o.slug),
      kind: "helper",
      spec: { name: `Climate ${o.name} applied block` }
    }), e.push({
      id: $("zone_enabled", s, o.slug),
      kind: "helper",
      spec: { name: `Climate ${o.name} enabled` }
    }), e.push({
      id: $("k_factor", s, o.slug),
      kind: "helper",
      spec: { name: `Climate ${o.name} K`, min: 0, max: 10, step: 0.01 }
    }), t.features.steering && (e.push({
      id: $("target_room_select", s, o.slug),
      kind: "helper",
      spec: { name: `Climate ${o.name} target room`, options: ["Thermostat"] }
    }), e.push({
      id: $("room_override_timer", s, o.slug),
      kind: "helper",
      spec: { name: `Climate ${o.name} room override`, restore: !0 }
    }), e.push({
      id: $("sensor_schedule", s, o.slug),
      kind: "schedule",
      spec: { name: `Climate ${o.name} sensor schedule` }
    }));
    for (const r of t.seasons) {
      const c = t.schedules[o.slug]?.[r.key];
      if (!c) throw new Error(`Missing schedule for ${o.slug}/${r.key}.`);
      e.push({
        id: St(s, o.slug, r.key),
        kind: "schedule",
        spec: { name: `Climate ${o.name} ${r.name}`, week: Js(c) }
      });
    }
  }
  e.push({
    id: v("season_select", s),
    kind: "helper",
    spec: { name: "Climate season", options: t.seasons.map((o) => o.name) }
  }), e.push({
    id: v("season_mode", s),
    kind: "helper",
    spec: { name: "Climate season mode", options: ["Manual", "Semi-auto", "Full-auto"] }
  });
  for (const o of Gs)
    e.push({
      id: v(o.cls, s),
      kind: "helper",
      spec: {
        name: `Climate ${o.cls.replace(/_/g, " ")}`,
        min: o.min,
        max: o.max,
        step: o.step,
        initial: o.initial,
        ...o.unit ? { unit: o.unit } : {}
      }
    });
  if (t.features.steering)
    for (const o of Ys)
      e.push({
        id: v(o.cls, s),
        kind: "helper",
        spec: { min: o.min, max: o.max, step: o.step, initial: o.initial }
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
  const n = t.zones.map((o) => ({ ...o, climate: o.climate ?? `climate.${o.slug}` })), i = Zs(s, n, t.seasons, t.features.fan_guard), a = (o, r) => {
    const c = z(s, o);
    return {
      id: `automation:${c}`,
      kind: "automation",
      spec: { alias: D(o, r), sig: i[c] ?? ot }
    };
  };
  if (e.push(a("engine")), e.push(a("watchdog")), e.push(a("runtime_learning")), t.features.anomaly_alerts && e.push(a("runtime_alert")), t.features.fan_timer)
    for (const o of t.zones) {
      const r = z(s, `fan_timer_${o.slug}`);
      e.push({
        id: `automation:${r}`,
        kind: "automation",
        spec: { alias: D("fan_timer", o.name), sig: i[r] ?? ot }
      });
    }
  return t.features.steering && e.push(a("steering")), e;
}
function Xs(t, e) {
  return re(t) === re(e);
}
function re(t) {
  if (Array.isArray(t)) return `[${t.map(re).join(",")}]`;
  if (t !== null && typeof t == "object") {
    const e = t;
    return `{${Object.keys(e).sort().map((s) => `${JSON.stringify(s)}:${re(e[s])}`).join(",")}}`;
  }
  return JSON.stringify(t);
}
function ct(t, e) {
  const s = { create: [], adopt: [], update: [], delete: [], noop: [] }, n = new Map(e.map((a) => [a.id, a])), i = new Set(t.map((a) => a.id));
  for (const a of t) {
    const o = n.get(a.id);
    o ? o.managed ? Xs(o.spec, a.spec) ? s.noop.push({ op: "noop", id: a.id, kind: a.kind }) : s.update.push({ op: "update", id: a.id, kind: a.kind, spec: a.spec, from: o.spec }) : s.adopt.push({ op: "adopt", id: a.id, kind: a.kind, spec: a.spec }) : s.create.push({ op: "create", id: a.id, kind: a.kind, spec: a.spec });
  }
  for (const a of e)
    a.managed && !i.has(a.id) && s.delete.push({ op: "delete", id: a.id, kind: a.kind });
  return s;
}
function Qs(t) {
  return [...t.create, ...t.adopt, ...t.update, ...t.delete];
}
function en(t) {
  const e = t.default_mode;
  return { granularity: "all", sets: { all: [{
    time: "06:00",
    name: "Day",
    mode: e,
    cool_temp: e === "heat" ? null : e === "heat_cool" ? 84 : 78,
    heat_temp: e === "heat" ? 68 : e === "heat_cool" ? 66 : null
  }] } };
}
function tn(t, e) {
  const s = {};
  for (const n of t) {
    s[n] = {};
    for (const i of e) s[n][i.key] = en(i);
  }
  return s;
}
const sn = {
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
async function te(t, e) {
  if (!t.callWS) return [];
  try {
    const s = await t.callWS({ type: `${e}/list` });
    return Array.isArray(s) ? s : [];
  } catch {
    return [];
  }
}
async function nn(t, e) {
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
async function lt(t, e, s, n) {
  const i = [];
  for (const _ of Object.keys(t.states)) {
    const g = Hs(_, e, s, n);
    if (!g) continue;
    const w = sn[g.cls];
    w && i.push({ id: _, kind: w });
  }
  const [a, o, r, c, l] = await Promise.all([
    te(t, "timer"),
    te(t, "input_select"),
    te(t, "input_number"),
    te(t, "schedule"),
    nn(
      t,
      i.map((_) => _.id)
    )
  ]), d = (_, g) => {
    const w = /* @__PURE__ */ new Map();
    for (const S of _) S.id && w.set(`${g}.${S.id}`, S);
    return w;
  }, u = new Map([
    ...d(a, "timer"),
    ...d(o, "input_select"),
    ...d(r, "input_number"),
    ...d(c, "schedule")
  ]), f = [];
  for (const _ of i) {
    const g = u.get(_.id), w = t.states[_.id];
    let S = {};
    _.id.startsWith("input_number.") && g ? S = { min: g.min, max: g.max, step: g.step } : _.id.startsWith("input_select.") && g ? S = { name: g.name, options: g.options } : _.id.startsWith("timer.") && g ? S = { name: g.name, restore: g.restore ?? !1 } : _.id.startsWith("schedule.") && g ? S = { name: g.name, raw: !0 } : w && (S = { name: w.attributes.friendly_name ?? _.id }), f.push({
      id: _.id,
      kind: _.kind,
      spec: S,
      managed: (l.get(_.id) ?? []).includes(Vs)
    });
  }
  const m = [];
  for (const [_, g] of Object.entries(t.states)) {
    if (!_.startsWith("automation.") || !g) continue;
    const w = g.attributes.id;
    typeof w == "string" && w.startsWith(`${e}_mzcs_`) && m.push({ cfgId: w, alias: String(g.attributes.friendly_name ?? w) });
  }
  const k = await Promise.all(
    m.map(async ({ cfgId: _ }) => {
      if (!t.callApi) return "unknown";
      try {
        const g = await t.callApi("GET", `config/automation/config/${_}`);
        return Et(g?.description) ?? "unknown";
      } catch {
        return "unknown";
      }
    })
  );
  return m.forEach(({ cfgId: _, alias: g }, w) => {
    f.push({
      id: `automation:${_}`,
      kind: "automation",
      spec: { alias: g, sig: k[w] },
      managed: !0
    });
  }), f;
}
const an = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
function ce(t) {
  const e = t.indexOf(".");
  return { domain: t.slice(0, e), objectId: t.slice(e + 1) };
}
function dt(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
async function pt(t, e, s, n) {
  if (e !== s) {
    for (let i = 0; i < 3; i++)
      try {
        await t.callWS({ type: "config/entity_registry/update", entity_id: e, new_entity_id: s }), n.log(`Renamed ${e} -> ${s}`);
        return;
      } catch {
        await new Promise((a) => setTimeout(a, 400 * (i + 1)));
      }
    n.log(`WARN: could not rename ${e} -> ${s} - rename it manually in the entity registry`);
  }
}
async function on(t, e) {
  try {
    await t.callWS({ type: "config/label_registry/create", name: "mzcs", color: "blue", icon: "mdi:thermostat-box" }), e.log("Created label mzcs");
  } catch {
  }
}
async function ut(t, e) {
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
async function ht(t, e, s, n) {
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
      const r = (i.data_schema ?? []).map((l) => l.name), c = {};
      for (const l of r)
        l in a && (c[l] = a[l], delete a[l]);
      i = await t.callApi("POST", `config/config_entries/flow/${i.flow_id}`, c);
      continue;
    }
    throw new Error(`Flow ${e}: unhandled step type ${i.type}`);
  }
  throw new Error(`Flow ${e}: did not complete`);
}
function rn(t, e, s) {
  const { objectId: n } = ce(t), i = String(e.name ?? n);
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
function Pt(t, e) {
  const s = e.prefix;
  if (t === `${s}_mzcs_engine`) return Ct(s, e.zones, e.seasons);
  if (t === `${s}_mzcs_watchdog`) return Mt(s);
  if (t === `${s}_mzcs_runtime_learning`) return Dt(s, e.zones);
  if (t === `${s}_mzcs_runtime_alert`) return Rt(s, e.zones);
  const n = t.match(new RegExp(`^${s}_mzcs_fan_timer_(.+)$`));
  if (n) {
    const i = e.zones.find((a) => a.slug === n[1]);
    return i ? Ot(s, i, e.fanGuard) : null;
  }
  return null;
}
async function cn(t, e, s) {
  const n = e.spec;
  if (e.id.startsWith("automation:")) {
    const o = e.id.slice(11), r = Pt(o, s);
    return r ? (await t.callApi("POST", `config/automation/config/${o}`, r), { kind: "automation", automationId: o }) : (s.log(`SKIP ${e.id} - no payload generator`), null);
  }
  const { domain: i, objectId: a } = ce(e.id);
  if (["timer", "input_text", "input_select", "input_number", "input_boolean", "schedule"].includes(i)) {
    const o = String(n.name ?? a), r = {};
    if (i === "timer" && Object.assign(r, { restore: n.restore ?? !0, duration: "0:30:00" }), i === "input_select" && Object.assign(r, { options: n.options ?? ["-"] }), i === "input_number" && Object.assign(r, {
      min: n.min ?? 0,
      max: n.max ?? 100,
      step: n.step ?? 1,
      ...n.unit ? { unit_of_measurement: n.unit } : {},
      ...typeof n.initial == "number" ? { initial: n.initial } : {}
    }), i === "schedule") {
      const d = n.week;
      for (const u of an) r[u] = d?.[u] ?? [];
    }
    const l = (await t.callWS({ type: `${i}/create`, ...r, name: a }))?.id ?? a;
    if (o !== l)
      try {
        await t.callWS({ type: `${i}/update`, [`${i}_id`]: l, ...r, name: o });
      } catch {
        s.log(`NOTE: created ${e.id} but could not set its display name to "${o}"`);
      }
    return { kind: "collection", domain: i, itemId: l };
  }
  if (e.kind === "template_sensor" || e.kind === "stats_sensor") {
    if (e.kind === "stats_sensor") {
      const l = s.zones.find((f) => a.includes(f.slug));
      if (!l)
        return s.log(`SKIP ${e.id} - no zone match`), null;
      const d = String(n.name ?? a), u = await ht(t, "history_stats", null, {
        name: d,
        entity_id: `binary_sensor.${s.prefix}_${l.slug}_running`,
        type: "time",
        state: ["on"],
        start: "{{ today_at() }}",
        end: "{{ now() }}"
      });
      return await pt(t, `sensor.${dt(d)}`, e.id, s), { kind: "config_entry", entryId: u };
    }
    const o = rn(e.id, n, s);
    if (!o)
      return s.log(`SKIP ${e.id} - not flow-creatable (computed by the card)`), null;
    const r = await ht(t, o.handler, o.menu, o.fields), c = o.menu === "binary_sensor" ? "binary_sensor" : "sensor";
    return await pt(t, `${c}.${dt(String(o.fields.name))}`, e.id, s), { kind: "config_entry", entryId: r };
  }
  return s.log(`SKIP ${e.id} - unsupported kind ${e.kind}`), null;
}
async function ln(t, e, s) {
  for (const n of [...e].reverse())
    try {
      n.kind === "collection" ? await t.callWS({ type: `${n.domain}/delete`, [`${n.domain}_id`]: n.itemId }) : n.kind === "automation" ? await t.callApi("DELETE", `config/automation/config/${n.automationId}`) : n.kind === "config_entry" && n.entryId && await t.callApi("DELETE", `config/config_entries/entry/${n.entryId}`), s.log(`Rolled back ${n.itemId ?? n.automationId ?? n.entryId}`);
    } catch {
      s.log(`ROLLBACK FAILED for ${n.itemId ?? n.automationId ?? n.entryId} - remove manually`);
    }
}
async function dn(t, e, s) {
  const n = { created: 0, adopted: 0, updated: 0, deleted: 0, skipped: 0, ok: !0 }, i = [];
  await on(t, s);
  try {
    for (const a of e.create) {
      const o = await cn(t, a, s);
      o ? (i.push(o), n.created++, s.log(`Created ${a.id}`), a.id.startsWith("automation:") || await ut(t, a.id)) : n.skipped++;
    }
    for (const a of e.adopt)
      await ut(t, a.id), n.adopted++, s.log(`Adopted ${a.id}`);
    for (const a of e.update)
      if (a.kind === "helper") {
        const { domain: o, objectId: r } = ce(a.id), { unit: c, ...l } = a.spec, d = { ...l, ...c ? { unit_of_measurement: c } : {} };
        try {
          await t.callWS({ type: `${o}/update`, [`${o}_id`]: r, ...d }), n.updated++, s.log(`Updated ${a.id}`);
        } catch {
          n.skipped++, s.log(`SKIP update ${a.id} - not updatable`);
        }
      } else if (a.kind === "automation" && t.callApi) {
        const o = a.id.slice(11), r = Pt(o, s);
        if (!r)
          n.skipped++, s.log(`KEEP ${a.id} - no generator for this automation`);
        else
          try {
            const c = await t.callApi("GET", `config/automation/config/${o}`), l = Et(c?.description);
            l && T(c) === l ? (await t.callApi("POST", `config/automation/config/${o}`, r), n.updated++, s.log(`Regenerated ${a.id} (config changed; automation was untouched)`)) : (n.skipped++, s.log(`KEEP ${a.id} - customized since generation; review it manually`));
          } catch {
            n.skipped++, s.log(`KEEP ${a.id} - could not read its config to verify`);
          }
      } else
        n.skipped++, s.log(`KEEP ${a.id} - ${a.kind} updates never overwrite existing content`);
    for (const a of e.delete) {
      if (a.id.startsWith("automation:"))
        await t.callApi("DELETE", `config/automation/config/${a.id.slice(11)}`);
      else {
        const { domain: o, objectId: r } = ce(a.id);
        await t.callWS({ type: `${o}/delete`, [`${o}_id`]: r });
      }
      n.deleted++, s.log(`Deleted ${a.id}`);
    }
  } catch (a) {
    n.ok = !1, s.log(`ERROR: ${a instanceof Error ? a.message : String(a)} - rolling back this run's creates`), await ln(t, i, s);
  }
  return n;
}
var pn = Object.defineProperty, un = Object.getOwnPropertyDescriptor, x = (t, e, s, n) => {
  for (var i = n > 1 ? void 0 : n ? un(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (n ? o(e, s, i) : o(i)) || i);
  return n && i && pn(e, s, i), i;
};
const hn = [
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
], mn = [
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
], fn = [
  { cls: "dev_green_max", label: "Room deviation · green up to (°)" },
  { cls: "dev_amber_max", label: "Room deviation · amber up to (°)" },
  { cls: "runtime_alert_margin", label: "Runtime alert margin (%)" },
  { cls: "runtime_alert_days", label: "Runtime alert · consecutive days" },
  { cls: "runtime_learn_days", label: "Runtime learn window (days)" },
  { cls: "cdd_base", label: "Cooling degree-day base (°)" },
  { cls: "season_confirm_days", label: "Season switch · confirm after (days)" },
  { cls: "season_dwell_days", label: "Season switch · min dwell (days)" }
];
function ge(t, e, s) {
  const n = s > e ? Math.max(0, Math.min(1, (t - e) / (s - e))) : 0.5, i = [41, 121, 230], a = [226, 122, 49];
  return `rgb(${i.map((o, r) => Math.round(o + (a[r] - o) * n)).join(",")})`;
}
function mt(t) {
  const [e, s] = t.split(":");
  let n = Number(e);
  const i = n >= 12 ? "PM" : "AM";
  return n = n % 12 === 0 ? 12 : n % 12, `${n}:${s} ${i}`;
}
const _n = {
  all: "Every day",
  wd: "Weekdays",
  we: "Weekend"
}, gn = {
  heat: "Heat",
  cool: "Cool",
  heat_cool: "Heat·Cool",
  off: "Off",
  auto: "Auto",
  dry: "Dry",
  fan_only: "Fan only"
};
console.info(`%c ${wt} %c v${os}`, "background:var(--mzcs-accent);color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;", "background:#243039;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;");
let y = class extends j {
  constructor() {
    super(...arguments), this._zoneIndex = 0, this._ctrlOpen = !1, this._setupOpen = !1, this._schedOpen = !1, this._schedName = "", this._schedBusy = !1, this._schedDrafts = /* @__PURE__ */ new Map(), this._rtOpen = !1, this._rtDayOpen = null, this._rtDayLoading = !1, this._rtDayCache = /* @__PURE__ */ new Map(), this._rtRange = 7, this._dryRunning = !1, this._execConfirm = !1, this._execRunning = !1, this._execLog = [];
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
    return await Promise.resolve().then(() => vn), document.createElement("multizone-climate-scheduler-card-editor");
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
    const s = Ze(this.hass, e.entity);
    if (s.setpoint == null) return;
    const n = this.hass.states[e.entity]?.attributes, i = fs(
      s.setpoint + t,
      s.setpoint,
      n?.min_temp,
      n?.max_temp
    );
    i !== s.setpoint && vs(this.hass, e.entity, i);
  }
  _provisionInput() {
    const t = this._config, e = t.zones.map((n) => ({ slug: E(n.name), name: n.name, climate: n.entity })), s = t.seasons ?? [
      { key: "summer", name: "Summer", default_mode: "cool" },
      { key: "winter", name: "Winter", default_mode: "heat_cool" }
    ];
    return {
      prefix: this._prefix,
      zones: e,
      seasons: s,
      schedules: tn(
        e.map((n) => n.slug),
        s
      ),
      features: {
        fan_timer: (this._config?.features?.fan_timer?.length ?? 3) > 0,
        anomaly_alerts: this._config?.features?.anomaly_alerts ?? !0,
        steering: !1,
        fan_guard: this._config?.features?.fan_guard
      }
    };
  }
  async _runDryRun() {
    if (!(!this.hass || this._dryRunning)) {
      this._dryRunning = !0, this._dryRunError = void 0;
      try {
        const t = this._provisionInput(), e = await lt(
          this.hass,
          t.prefix,
          t.zones.map((s) => s.slug),
          t.seasons.map((s) => s.key)
        );
        this._dryRun = ct(rt(t), e), this._execConfirm = !1, this._execResult = void 0, this._execLog = [];
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
          slug: E(r.name),
          name: r.name,
          climate: r.entity
        })), a = await dn(t, s, {
          prefix: n.prefix,
          zones: i,
          seasons: n.seasons,
          fanGuard: e.features?.fan_guard,
          log: (r) => {
            this._execLog = [...this._execLog, r];
          }
        });
        this._execResult = a;
        const o = await lt(
          t,
          n.prefix,
          n.zones.map((r) => r.slug),
          n.seasons.map((r) => r.key)
        );
        this._dryRun = ct(rt(n), o);
      } catch (n) {
        this._execLog = [...this._execLog, `ERROR: ${n instanceof Error ? n.message : String(n)}`];
      } finally {
        this._execRunning = !1;
      }
    }
  }
  _renderSetup() {
    const t = this._dryRun;
    return p`
      <div class="setup">
        <p class="setup-title">Setup</p>
        <p class="setup-sub">
          Preview first, then apply. Nothing is written until you confirm; existing schedules and
          customized automations are never overwritten.
        </p>
        <button class="chip" .disabled=${this._dryRunning} @click=${() => void this._runDryRun()}>
          ${this._dryRunning ? "Reading registry…" : "Run dry-run preview"}
        </button>
        ${this._dryRunError ? p`<p class="setup-err">${this._dryRunError}</p>` : h}
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
                        </ul>` : h}
                  `
    )}
              </div>
              ${this._renderApply(t)}
            ` : h}
        ${this._renderManage()}
        <button class="chip" @click=${() => this._setupOpen = !1}>Close</button>
      </div>
    `;
  }
  _renderApply(t) {
    const e = Qs(t).length, s = this._execResult;
    return p`
      ${e > 0 && !this._execRunning && !s ? this._execConfirm ? p`
              <div class="applyrow">
                <button class="chip danger" @click=${() => void this._runApply()}>
                  Confirm: apply ${e} change${e === 1 ? "" : "s"}
                </button>
                <button class="chip" @click=${() => this._execConfirm = !1}>Cancel</button>
              </div>
            ` : p`
              <button class="chip" @click=${() => this._execConfirm = !0}>
                Apply ${e} change${e === 1 ? "" : "s"}…
              </button>
            ` : h}
      ${this._execRunning ? p`<p class="setup-sub">Applying…</p>` : h}
      ${this._execLog.length > 0 ? p`<ul class="plan-list exec-log">
            ${this._execLog.map((n) => p`<li>${n}</li>`)}
          </ul>` : h}
      ${s ? p`<p class="setup-sub ${s.ok ? "" : "setup-err"}">
            ${s.ok ? `Done - ${s.created} created, ${s.adopted} adopted, ${s.updated} updated, ${s.deleted} deleted${s.skipped ? `, ${s.skipped} kept as-is` : ""}. The plan above has been re-verified against the live registry.` : "Apply failed - created objects from this run were rolled back. See the log above."}
          </p>` : h}
    `;
  }
  _renderManage() {
    const t = this.hass;
    if (!t) return h;
    const e = v("season_select", this._prefix), s = t.states[e], n = Array.isArray(s?.attributes.options) ? s.attributes.options : [], i = fn.map((r) => ({
      ...r,
      id: v(r.cls, this._prefix)
    })).filter((r) => P(t, r.id));
    if (!s && i.length === 0) return h;
    const a = (this._config?.zones ?? []).map((r) => {
      const c = E(r.name);
      return {
        name: r.name,
        enableId: $("zone_enabled", this._prefix, c),
        markerId: $("applied_block_marker", this._prefix, c)
      };
    }).filter((r) => P(t, r.enableId)), o = a.length > 0 && a.every((r) => t.states[r.enableId]?.state === "on");
    return p`
      <p class="setup-title" style="margin-top:12px;">Manage</p>
      ${a.length > 0 ? p`
            <div class="managerow master">
              <span>Scheduling · all zones</span>
              <button
                class=${o ? "chip togg on" : "chip togg"}
                @click=${() => {
      for (const r of a) Ge(t, r.enableId, r.markerId, !o);
    }}
              >
                ${o ? "On" : "Off"}
              </button>
            </div>
            ${a.map((r) => {
      const c = t.states[r.enableId]?.state === "on";
      return p`
                <div class="managerow">
                  <span>${r.name} scheduling</span>
                  <button
                    class=${c ? "chip togg on" : "chip togg"}
                    @click=${() => void Ge(t, r.enableId, r.markerId, !c)}
                  >
                    ${c ? "On" : "Off"}
                  </button>
                </div>
              `;
    })}
            <p class="muted" style="font-size:11px;margin:2px 0 6px;">
              Off = the engine stands down and the thermostat's own app schedule takes over.
            </p>
          ` : h}
      ${s ? p`
            <div class="managerow">
              <span>Active season</span>
              <select
                @change=${(r) => void bs(t, e, r.target.value)}
              >
                ${n.map(
      (r) => p`<option .value=${r} ?selected=${r === s.state}>${r}</option>`
    )}
              </select>
            </div>
          ` : h}
      ${i.map(
      (r) => p`
          <div class="managerow">
            <span>${r.label}</span>
            <input
              type="number"
              .value=${t.states[r.id]?.state ?? ""}
              @change=${(c) => void ys(t, r.id, Number(c.target.value))}
            />
          </div>
        `
    )}
      ${this._renderThemePicker()}
    `;
  }
  _renderThemePicker() {
    const t = this.hass;
    if (!t) return h;
    const e = v("theme", this._prefix);
    if (!P(t, e)) return h;
    const { presetKey: s, tokens: n } = tt(t.states[e]?.state), i = (a) => void t.callService("input_text", "set_value", { entity_id: e, value: a });
    return p`
      <p class="setup-title" style="margin-top:12px;">Theme</p>
      <div class="chips">
        ${Object.entries(be).map(
      ([a, o]) => p`
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
          @click=${() => i(et(zs(n)))}
        >
          Custom
        </button>
      </div>
      ${s === "custom" ? p`
            ${mn.map(
      (a) => p`
                <div class="managerow">
                  <span>${a.label}</span>
                  <input
                    type="color"
                    .value=${n[a.key]}
                    @change=${(o) => {
        const r = { ...n, [a.key]: o.target.value };
        i(et(r));
      }}
                  />
                </div>
              `
    )}
            <p class="muted" style="font-size:11px;margin:2px 0 0;">
              Colors apply live to every device showing the card.
            </p>
          ` : h}
    `;
  }
  _applyTheme() {
    const t = this.hass?.states[v("theme", this._prefix)]?.state, { tokens: e } = tt(t);
    for (const [s, n] of hn)
      this.style.setProperty(n, e[s]);
  }
  render() {
    if (!this._config || !this.hass) return h;
    this._applyTheme();
    const t = this._zone();
    if (!t) return h;
    if (this._setupOpen)
      return p`<ha-card><div class="wrap">${this._renderSetup()}</div></ha-card>`;
    const e = Ze(this.hass, t.entity), s = rs(
      this.hass,
      $("fan_timer", this._prefix, E(t.name))
    ), n = e.action === "cooling", i = e.action === "heating", a = e.available ? n ? `Cooling to ${e.setpoint}` : i ? `Heating to ${e.setpoint}` : e.mode === "off" ? "Off" : `Idle · set ${e.setpoint ?? "–"}` : "Unavailable";
    return p`
      <ha-card>
        <div class="wrap">
          <div class="tabs" role="tablist">
            ${this._config.zones.map(
      (o, r) => p`
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
                ${a}${e.inside != null ? ` · inside ${e.inside}°` : ""}${e.humidity != null ? ` · ${e.humidity}% RH` : ""}${s ? p`<span class="fan"> · fan on</span>` : ""}
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
    if (!this.hass) return h;
    const e = this.hass, s = E(t.name), n = $("runtime_today", this._prefix, s);
    if (!P(e, n)) return h;
    const i = Number(e.states[n]?.state), a = Number.isFinite(i) ? F(i) : "–";
    this._rtLoadedFor !== n && (this._rtLoadedFor = n, this._rtDaily = void 0, queueMicrotask(
      () => void Ye(e, n, 7).then((m) => {
        this._rtDaily = m;
      })
    ));
    const o = /* @__PURE__ */ new Date();
    o.setHours(0, 0, 0, 0);
    const r = (this._rtDaily ?? []).filter((m) => m.day < o.getTime()).sort((m, k) => k.day - m.day), c = o.getTime(), l = Number(
      e.states[$("expected_runtime", this._prefix, s)]?.state
    ), d = fe(e, v("runtime_alert_margin", this._prefix)) ?? 35, u = (Date.now() - c) / 36e5, f = As(
      Number.isFinite(i) ? i : 0,
      l,
      d,
      u
    );
    return p`
      <button class="schedrow" @click=${() => this._rtOpen = !this._rtOpen}>
        <span
          >Runtime · Today <b class="rt-b">${a}</b>${f.label ? p` <span class="verdict ${f.status}">· ${f.label}</span>` : h}</span
        >
        <span aria-hidden="true">${this._rtOpen ? "▴" : "▾"}</span>
      </button>
      ${this._rtOpen ? p`
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
      this._rtRange = 30, this._rt30 || Ye(e, n, 30).then((m) => {
        this._rt30 = m;
      });
    }}
                >
                  30 days
                </button>
              </div>
              ${this._rtRange === 30 ? this._render30() : h}
              ${this._rtRange === 7 ? p`${this._renderPill(t, "Today", Number.isFinite(i) ? i : 0, c, !0)}` : h}
              ${this._rtRange === 7 ? p`
                    ${r.map(
      (m) => this._renderPill(
        t,
        new Date(m.day).toLocaleDateString(void 0, {
          weekday: "short",
          day: "numeric"
        }),
        m.hours,
        m.day,
        !1
      )
    )}
                    ${r.length === 0 ? p`<p class="muted" style="font-size:11px;margin:6px 0;">
                          History accrues daily - past days appear as statistics build up.
                        </p>` : h}
                    <p class="muted" style="font-size:10px;margin:6px 0 0;">
                      Tap a day for its run segments and setpoint changes.
                    </p>
                  ` : h}
            </div>
          ` : h}
    `;
  }
  _render30() {
    const t = this._rt30;
    if (!t) return p`<p class="muted" style="font-size:11px;">Loading…</p>`;
    if (t.length === 0)
      return p`<p class="muted" style="font-size:11px;">
        Long-term statistics build daily - the 30-day view fills in as days accumulate.
      </p>`;
    const e = [...t].sort((a, o) => a.day - o.day), s = Math.max(...e.map((a) => a.hours), 1), n = e.reduce((a, o) => a + o.hours, 0) / e.length, i = (a) => new Date(a).toLocaleDateString(void 0, { month: "short", day: "numeric" });
    return p`
      <div class="cols">
        ${e.map(
      (a) => p`<span
            class="col"
            title="${i(a.day)}: ${F(a.hours)}"
            style="height: ${Math.max(6, a.hours / s * 64).toFixed(0)}px"
          ></span>`
    )}
      </div>
      <div class="axis">
        <span>${i(e[0].day)}</span>
        <span>${i(e[e.length - 1].day)}</span>
      </div>
      <p class="muted" style="font-size:11px;margin:6px 0 0;">
        Avg <b class="rt-b">${F(n)}</b> · Max
        <b class="rt-b">${F(s)}</b> · from long-term statistics (kept forever)
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
        const n = E(t.name), i = $("running_sensor", this._prefix, n), a = Math.min(e + 864e5, Date.now()), [o, r] = await Promise.all([
          Je(this.hass, i, e, a),
          Je(this.hass, t.entity, e, a, "temperature")
        ]), c = {
          segs: ws(o, e, a),
          bubs: ks(r),
          start: e,
          end: e + 864e5
        };
        this._rtDayCache.set(e, c), this._rtDayOpen === e && (this._rtDayDetail = c);
      } finally {
        this._rtDayLoading = !1;
      }
    }
  }
  _renderPill(t, e, s, n, i) {
    const a = Math.min(100, Math.max(0, s / 24 * 100)), o = this._rtDayOpen === n;
    return p`
      <button class="pillrow" @click=${() => void this._openDay(t, n)}>
        <span class="pill-label">${e}</span>
        <span class="pill-track">
          <span
            class="pill-fill ${i || o ? "today-fill" : ""}"
            style="width: ${a.toFixed(1)}%"
          ></span>
        </span>
        <span class="pill-hours">${F(s)}</span>
      </button>
      ${o ? this._renderDayDetail() : h}
    `;
  }
  _renderDayDetail() {
    if (this._rtDayLoading) return p`<p class="muted" style="font-size:11px;">Loading day…</p>`;
    const t = this._rtDayDetail;
    return t ? p`
      <div class="daydetail">
        <div class="bubblerow">
          ${t.bubs.slice(0, 12).map((e) => {
      const s = (e.t - t.start) / (t.end - t.start) * 100;
      return p`<span class="bubble" style="left: ${s.toFixed(1)}%"
              >${Math.round(e.value)}</span
            >`;
    })}
        </div>
        <div class="segtrack">
          ${t.segs.map((e) => {
      const { left: s, width: n } = Ss(e, t.start, t.end);
      return p`<span
              class="seg"
              style="left: ${s.toFixed(2)}%; width: ${Math.max(0.4, n).toFixed(2)}%"
            ></span>`;
    })}
        </div>
        <div class="axis">
          <span>12A</span><span>6A</span><span>12P</span><span>6P</span><span>12A</span>
        </div>
      </div>
    ` : h;
  }
  _activeSeasonKey() {
    const t = this.hass?.states[v("season_select", this._prefix)];
    return !t || t.state === "unknown" ? null : this._config?.seasons?.find((s) => s.name === t.state)?.key ?? E(t.state);
  }
  _scheduleEntityId(t) {
    const e = this._activeSeasonKey();
    return e ? `schedule.${this._prefix}_${E(t.name)}_${e}` : null;
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
      const s = await _s(this.hass, e);
      this._schedWeek = s?.week ?? void 0, this._schedName = s?.name ?? "", this._schedError = s ? void 0 : "Could not load schedule config.";
    } catch (s) {
      this._schedError = Xe(s);
    } finally {
      this._schedBusy = !1;
    }
  }
  /** Blocks for a set: unsaved draft when one exists, else the saved week. */
  _setBlocks(t, e, s) {
    return this._schedDrafts.get(e) ?? xe(t[s[0]] ?? []);
  }
  /** Mutate a set's draft (cloning from the saved week on first touch). */
  _mutateDraft(t, e, s) {
    if (!this._schedWeek) return;
    const n = this._schedDrafts.get(t) ?? xe(this._schedWeek[e[0]] ?? []).map((a) => ({ ...a }));
    s(n);
    const i = new Map(this._schedDrafts);
    i.set(t, n), this._schedDrafts = i;
  }
  _clearSchedEdit() {
    this._schedDrafts = /* @__PURE__ */ new Map(), this._schedSel = void 0;
  }
  async _saveSchedDrafts(t) {
    if (!this.hass || !this._schedWeek || this._schedDrafts.size === 0) return;
    const e = this._scheduleEntityId(t);
    if (!e) return;
    const s = it(this._schedWeek);
    this._schedBusy = !0;
    try {
      let n = this._schedWeek;
      for (const [i, a] of this._schedDrafts) {
        const o = s.sets[i];
        o && (n = Ls(n, o, a));
      }
      await gs(
        this.hass,
        e,
        n,
        this._schedName
      ), this._schedWeek = n, this._clearSchedEdit(), this._schedError = void 0;
    } catch (n) {
      this._schedError = Xe(n);
    } finally {
      this._schedBusy = !1;
    }
  }
  _renderSchedule(t) {
    if (!this.hass) return h;
    const e = this._scheduleEntityId(t);
    if (!e || !P(this.hass, e)) return h;
    this._schedLoadedFor !== e && !this._schedBusy && (this._schedLoadedFor = e, this._schedWeek = void 0, this._clearSchedEdit(), queueMicrotask(() => void this._loadWeek(t)));
    const s = this.hass.states[v("season_select", this._prefix)]?.state ?? "", n = this._schedWeek, i = n ? Is(n, /* @__PURE__ */ new Date()) : null, a = i ? `Next · ${mt(i.time)} ${i.name} → ${i.cool_temp ?? i.heat_temp}°` : "Schedule";
    return p`
      <button
        class="schedrow"
        @click=${() => {
      this._schedOpen = !this._schedOpen, this._schedWeek || this._loadWeek(t);
    }}
      >
        <span>${a} <span class="season">· ${s}</span></span>
        <span aria-hidden="true">${this._schedOpen ? "▴" : "▾"}</span>
      </button>
      ${this._schedOpen ? this._renderScheduleBody(t) : h}
    `;
  }
  _renderScheduleBody(t) {
    if (this._schedBusy && !this._schedWeek) return p`<p class="muted pad">Loading…</p>`;
    const e = this._schedWeek;
    if (!e)
      return this._schedError ? p`<p class="schederr pad">${this._schedError}</p>` : p`<p class="muted pad">No schedule data.</p>`;
    const s = it(e), n = Object.entries(s.sets), i = (/* @__PURE__ */ new Date()).getDay(), a = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][i], o = [];
    for (const [u, f] of n)
      for (const m of this._setBlocks(e, u, f))
        m.cool_temp != null && o.push(m.cool_temp), m.heat_temp != null && o.push(m.heat_temp);
    let r = o.length ? Math.min(...o) : 70, c = o.length ? Math.max(...o) : 80;
    if (c - r < 6) {
      const u = (c + r) / 2;
      r = u - 3, c = u + 3;
    }
    const l = s.granularity === "days", d = this._schedDrafts.size > 0;
    return p`
      <div class="schedbody">
        ${n.map(([u, f], m) => {
      const k = this._setBlocks(e, u, f), _ = Ws(k), g = f.includes(a), w = k.some((A) => A.mode === "heat_cool"), S = _n[u] ?? u.charAt(0).toUpperCase() + u.slice(1), Me = p`
            <div class="sstrip ${l ? "small" : ""} ${w ? "hc" : ""}">
              ${_.map((A) => {
        const Re = k.indexOf(A.block), Pe = !A.wrap && this._schedSel?.setKey === u && this._schedSel?.idx === Re, ee = (A.toMin - A.fromMin) / 1440 * 100, Te = () => {
          this._schedSel = { setKey: u, idx: Re };
        };
        if (w) {
          const ue = A.block.cool_temp, he = A.block.heat_temp;
          return p`
                    <button class="sseg hcseg ${Pe ? "sel" : ""}" style="width:${ee}%" @click=${Te}>
                      <span class="hchalf" style="background:${ue != null ? ge(ue, r, c) : "var(--mzcs-track)"}">
                        <span class="segt">${ue ?? "–"}°</span>
                        ${ee > 15 && !l ? p`<span class="segn">${A.block.name}</span>` : h}
                      </span>
                      <span class="hchalf" style="background:${he != null ? ge(he, r, c) : "var(--mzcs-track)"}">
                        <span class="segt">${he ?? "–"}°</span>
                      </span>
                    </button>
                  `;
        }
        const pe = A.block.cool_temp ?? A.block.heat_temp;
        return p`
                  <button
                    class="sseg ${Pe ? "sel" : ""}"
                    style="width:${ee}%;background:${pe != null ? ge(pe, r, c) : "var(--mzcs-track)"}"
                    @click=${Te}
                  >
                    <span class="segt">${pe ?? "–"}°</span>
                    ${ee > 9 && !l ? p`<span class="segn">${A.block.name}</span>` : h}
                  </button>
                `;
      })}
            </div>
          `, Tt = !l || m === n.length - 1;
      return p`
            <p class="sethead">
              ${S}${g ? p` <span class="today">today</span>` : h}
            </p>
            ${w ? p`<div class="hcwrap">
                  <div class="hcgutter"><span class="gc">Cool</span><span class="gh">Heat</span></div>
                  ${Me}
                </div>` : Me}
            ${Tt ? p`<div class="saxis ${w ? "indent" : ""}">
                  <span>12A</span><span>4A</span><span>8A</span><span>12P</span><span>4P</span><span>8P</span><span>12A</span>
                </div>` : h}
          `;
    })}
        ${this._renderBlockEditor(s)}
        ${this._schedError ? p`<p class="schederr pad">${this._schedError}</p>` : h}
        <div class="schedactions">
          ${d ? p`
                <button class="chip save" .disabled=${this._schedBusy}
                  @click=${() => void this._saveSchedDrafts(t)}>
                  ${this._schedBusy ? "Saving…" : "Save changes"}
                </button>
                <button class="chip" .disabled=${this._schedBusy} @click=${() => this._clearSchedEdit()}>
                  Discard
                </button>
              ` : p`
                <button
                  class="chip"
                  .disabled=${this._schedBusy}
                  @click=${() => {
      const u = $("applied_block_marker", this._prefix, E(t.name));
      xs(this.hass, u, "automation.climate_schedule_engine");
    }}
                >
                  Apply now
                </button>
                <span class="muted">Tap a block to edit. Changes apply at the next block; Apply now re-asserts immediately.</span>
              `}
        </div>
      </div>
    `;
  }
  _renderBlockEditor(t) {
    const e = this._schedSel, s = this._schedWeek;
    if (!e || !s) return h;
    const n = t.sets[e.setKey];
    if (!n) return h;
    const i = this._setBlocks(s, e.setKey, n), a = i[e.idx];
    if (!a) return h;
    const o = (d) => this._mutateDraft(e.setKey, n, d), r = (d) => {
      o((u) => {
        const f = u[e.idx], m = O(f.time) + d, k = e.idx > 0 ? O(u[e.idx - 1].time) + 15 : 0, _ = e.idx < u.length - 1 ? O(u[e.idx + 1].time) - 15 : 1425;
        f.time = at(Math.max(k, Math.min(_, m)));
      });
    }, c = (d, u) => {
      o((f) => {
        const m = f[e.idx], k = (m[d] ?? 72) + u;
        let _ = 50, g = 95;
        m.mode === "heat_cool" && (d === "cool_temp" && m.heat_temp != null && (_ = m.heat_temp + 2), d === "heat_temp" && m.cool_temp != null && (g = m.cool_temp - 2)), m[d] = Math.max(_, Math.min(g, k));
      });
    }, l = (d, u, f, m) => p`
      <div class="managerow">
        <span>${d}</span>
        <span class="stepgrp">
          <button class="stepbtn" @click=${f}>−</button>
          <span class="stepval">${u}</span>
          <button class="stepbtn" @click=${m}>+</button>
        </span>
      </div>
    `;
    return p`
      <div class="bedit">
        <div class="managerow">
          <span>Block name</span>
          <input
            class="bname-in"
            type="text"
            .value=${a.name}
            @change=${(d) => o((u) => {
      u[e.idx].name = d.target.value;
    })}
          />
        </div>
        ${l("Starts", mt(a.time), () => r(-15), () => r(15))}
        ${a.mode === "heat_cool" ? p`
              ${l("Cool to", `${a.cool_temp ?? "–"}°`, () => c("cool_temp", -1), () => c("cool_temp", 1))}
              ${l("Heat to", `${a.heat_temp ?? "–"}°`, () => c("heat_temp", -1), () => c("heat_temp", 1))}
            ` : a.mode === "heat" ? l("Heat to", `${a.heat_temp ?? "–"}°`, () => c("heat_temp", -1), () => c("heat_temp", 1)) : l("Cool to", `${a.cool_temp ?? "–"}°`, () => c("cool_temp", -1), () => c("cool_temp", 1))}
        <div class="bedit-actions">
          <button
            class="chip danger"
            .disabled=${i.length <= 1}
            @click=${() => {
      o((d) => {
        d.splice(e.idx, 1);
      }), this._schedSel = void 0;
    }}
          >
            Remove
          </button>
          <button
            class="chip"
            @click=${() => {
      const d = e.idx < i.length - 1 ? O(i[e.idx + 1].time) : 1440, u = O(a.time);
      if (d - u < 45) return;
      const f = at(Math.round((u + Math.max(30, (d - u) / 2)) / 15) * 15);
      o((m) => {
        m.splice(e.idx + 1, 0, {
          time: f,
          name: "New block",
          mode: a.mode,
          cool_temp: a.cool_temp,
          heat_temp: a.heat_temp
        });
      }), this._schedSel = { setKey: e.setKey, idx: e.idx + 1 };
    }}
          >
            Add block after
          </button>
          <button class="chip" @click=${() => this._schedSel = void 0}>Close</button>
        </div>
      </div>
    `;
  }
  _renderControls(t) {
    if (!this.hass) return h;
    const e = this.hass, s = this._zone();
    if (!s) return h;
    const n = cs(e, t), i = e.states[t]?.state, a = ls(e, t), o = $("fan_timer", this._prefix, E(s.name)), r = this._config?.features?.fan_timer ?? [15, 30, 60], c = P(e, o);
    return p`
      <button class="expander" @click=${() => this._ctrlOpen = !this._ctrlOpen}>
        <span>Mode</span>
        <span aria-hidden="true">${this._ctrlOpen ? "▴" : "▾"}</span>
      </button>
      ${this._ctrlOpen ? p`
            <div class="ctrl">
              <div class="chips">
                ${n.map(
      (l) => p`
                    <button
                      class=${i === l ? "chip mode-on" : "chip"}
                      @click=${() => void ps(e, t, l)}
                    >
                      ${gn[l] ?? l}
                    </button>
                  `
    )}
                ${a ? p`
                      <button
                        class=${Ve(e, t) ? "chip eco eco-on" : "chip eco"}
                        @click=${() => void us(e, t, !Ve(e, t))}
                      >
                        Eco
                      </button>
                    ` : h}
              </div>
              ${c ? p`
                    <div class="chips fanrow">
                      <span class="fanlbl">Fan</span>
                      ${r.map(
      (l) => p`
                          <button
                            class="chip"
                            @click=${() => void ms(e, t, o, l)}
                          >
                            ${l}m
                          </button>
                        `
    )}
                    </div>
                  ` : h}
            </div>
          ` : h}
    `;
  }
  _renderRooms(t, e) {
    if (!this.hass || !t.room_sensors || t.room_sensors.length === 0) return h;
    const s = this.hass, { greenMax: n, amberMax: i } = Fs(
      fe(s, v("dev_green_max", this._prefix)),
      fe(s, v("dev_amber_max", this._prefix))
    );
    return p`
      <div class="rooms">
        ${t.room_sensors.map((a) => {
      const o = ds(s, a);
      if (o.temp == null || e == null)
        return p`
              <div class="room">
                <span class="rname">${o.name}</span>
                <span class="rtemp muted">${o.temp == null ? "—" : `${o.temp}°`}</span>
              </div>
            `;
      const r = Math.round(o.temp - e);
      return p`
            <div class="room">
              <span class="rname">${o.name}</span>
              <span>
                <span class="badge ${Bs(r, n, i)}"
                  >${Us(r)}</span
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
y.styles = _t`
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
  `;
x([
  Ee({ attribute: !1 })
], y.prototype, "hass", 2);
x([
  b()
], y.prototype, "_config", 2);
x([
  b()
], y.prototype, "_zoneIndex", 2);
x([
  b()
], y.prototype, "_ctrlOpen", 2);
x([
  b()
], y.prototype, "_setupOpen", 2);
x([
  b()
], y.prototype, "_schedOpen", 2);
x([
  b()
], y.prototype, "_schedWeek", 2);
x([
  b()
], y.prototype, "_schedError", 2);
x([
  b()
], y.prototype, "_schedBusy", 2);
x([
  b()
], y.prototype, "_schedSel", 2);
x([
  b()
], y.prototype, "_schedDrafts", 2);
x([
  b()
], y.prototype, "_rtOpen", 2);
x([
  b()
], y.prototype, "_rtDaily", 2);
x([
  b()
], y.prototype, "_rtDayOpen", 2);
x([
  b()
], y.prototype, "_rtDayDetail", 2);
x([
  b()
], y.prototype, "_rtDayLoading", 2);
x([
  b()
], y.prototype, "_rtRange", 2);
x([
  b()
], y.prototype, "_rt30", 2);
x([
  b()
], y.prototype, "_dryRun", 2);
x([
  b()
], y.prototype, "_dryRunError", 2);
x([
  b()
], y.prototype, "_dryRunning", 2);
x([
  b()
], y.prototype, "_execConfirm", 2);
x([
  b()
], y.prototype, "_execRunning", 2);
x([
  b()
], y.prototype, "_execLog", 2);
x([
  b()
], y.prototype, "_execResult", 2);
y = x([
  xt(vt)
], y);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: vt,
  name: wt,
  description: "Nest-style climate view for 1-4 zones with seasonal scheduling, fan timers, and runtime history."
});
var yn = Object.defineProperty, bn = Object.getOwnPropertyDescriptor, Q = (t, e, s, n) => {
  for (var i = n > 1 ? void 0 : n ? bn(e, s) : e, a = t.length - 1, o; a >= 0; a--)
    (o = t[a]) && (i = (n ? o(e, s, i) : o(i)) || i);
  return n && i && yn(e, s, i), i;
};
let ye = null;
function $n() {
  return ye || (ye = (async () => {
    if (!customElements.get("ha-selector"))
      try {
        await (await window.loadCardHelpers?.())?.createCardElement({ type: "entities", entities: [] })?.constructor.getConfigElement?.(), await customElements.whenDefined("ha-selector");
      } catch {
      }
  })()), ye;
}
const xn = [
  { key: "summer", name: "Summer", default_mode: "cool" },
  { key: "winter", name: "Winter", default_mode: "heat_cool" }
];
let M = class extends j {
  constructor() {
    super(...arguments), this._ready = !1;
  }
  setConfig(t) {
    this._config = {
      type: t.type,
      prefix: t.prefix ?? "climate",
      zones: t.zones ?? [],
      seasons: t.seasons ?? xn.map((e) => ({ ...e })),
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
    super.connectedCallback(), $n().then(() => {
      this._ready = !0;
    });
  }
  /** True once any zone's schedule entity exists for this season key in HA. */
  _seasonProvisioned(t) {
    const e = this.hass, s = this._config;
    if (!e || !s) return !1;
    const n = s.prefix ?? "climate";
    return (s.zones ?? []).some(
      (i) => i.name && !!e.states[`schedule.${n}_${E(i.name)}_${t}`]
    );
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
    return !this._ready || !customElements.get("ha-selector") ? p`<input
        .value=${typeof e == "string" ? e : ""}
        placeholder=${n ?? ""}
        @change=${(i) => s(i.target.value)}
      />` : p`<ha-selector
      .hass=${this.hass}
      .selector=${t}
      .value=${e}
      .label=${n}
      @value-changed=${(i) => s(i.detail.value)}
    ></ha-selector>`;
  }
  render() {
    const t = this._config;
    if (!t) return h;
    const e = t.zones ?? [], s = t.seasons ?? [];
    return p`
      <div class="ed">
        <h4>Zones (1-4)</h4>
        ${e.map(
      (n, i) => p`
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
        ${e.length < 4 ? p`<button
              class="link"
              @click=${() => this._emit({ zones: [...e, { entity: "", name: `Zone ${e.length + 1}` }] })}
            >
              + Add zone
            </button>` : h}

        <h4>Seasons (1-4)</h4>
        ${s.map(
      (n, i) => p`
            <div class="seasonrow">
              <input
                .value=${n.name}
                @change=${(a) => {
        const o = a.target.value, r = o.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""), c = this._seasonProvisioned(n.key) || !r ? n.key : r, l = s.map((d, u) => u === i ? { ...d, name: o, key: c } : d);
        this._emit({ seasons: l });
      }}
              />
              <select
                .value=${n.default_mode}
                @change=${(a) => {
        const o = a.target.value;
        this._emit({
          seasons: s.map((r, c) => c === i ? { ...r, default_mode: o } : r)
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
        ${s.length < 4 ? p`<button
              class="link"
              @click=${() => {
      let n = s.length + 1;
      for (; s.some((i) => i.key === `season_${n}`); ) n++;
      this._emit({
        seasons: [
          ...s,
          { key: `season_${n}`, name: `Season ${n}`, default_mode: "cool" }
        ]
      });
    }}
            >
              + Add season
            </button>` : h}

        <h4>Season switching</h4>
        <select
          .value=${t.season_switch ?? "semi"}
          @change=${(n) => this._emit({ season_switch: n.target.value })}
        >
          <option value="manual">Manual</option>
          <option value="semi">Semi-auto (recommend + confirm)</option>
          <option value="full">Full-auto</option>
        </select>
        ${(t.season_switch ?? "semi") !== "manual" ? p`
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
              ${this._probe ? p`<p class=${this._probe.ok ? "ok" : "bad"}>${this._probe.text}</p>` : h}
            ` : h}

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
M.styles = _t`
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
Q([
  Ee({ attribute: !1 })
], M.prototype, "hass", 2);
Q([
  b()
], M.prototype, "_config", 2);
Q([
  b()
], M.prototype, "_ready", 2);
Q([
  b()
], M.prototype, "_probe", 2);
M = Q([
  xt("multizone-climate-scheduler-card-editor")
], M);
const vn = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get MzcsCardEditor() {
    return M;
  }
}, Symbol.toStringTag, { value: "Module" }));
export {
  y as MzcsCard
};

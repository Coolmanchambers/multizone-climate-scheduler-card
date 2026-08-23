/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Z = globalThis, ae = Z.ShadowRoot && (Z.ShadyCSS === void 0 || Z.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, oe = Symbol(), ge = /* @__PURE__ */ new WeakMap();
let Be = class {
  constructor(e, s, n) {
    if (this._$cssResult$ = !0, n !== oe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = s;
  }
  get styleSheet() {
    let e = this.o;
    const s = this.t;
    if (ae && e === void 0) {
      const n = s !== void 0 && s.length === 1;
      n && (e = ge.get(s)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), n && ge.set(s, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const et = (t) => new Be(typeof t == "string" ? t : t + "", void 0, oe), je = (t, ...e) => {
  const s = t.length === 1 ? t[0] : e.reduce((n, i, r) => n + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(i) + t[r + 1], t[0]);
  return new Be(s, t, oe);
}, tt = (t, e) => {
  if (ae) t.adoptedStyleSheets = e.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
  else for (const s of e) {
    const n = document.createElement("style"), i = Z.litNonce;
    i !== void 0 && n.setAttribute("nonce", i), n.textContent = s.cssText, t.appendChild(n);
  }
}, ye = ae ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let s = "";
  for (const n of e.cssRules) s += n.cssText;
  return et(s);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: st, defineProperty: nt, getOwnPropertyDescriptor: it, getOwnPropertyNames: rt, getOwnPropertySymbols: at, getPrototypeOf: ot } = Object, X = globalThis, be = X.trustedTypes, ct = be ? be.emptyScript : "", lt = X.reactiveElementPolyfillSupport, U = (t, e) => t, V = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? ct : null;
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
} }, ce = (t, e) => !st(t, e), $e = { attribute: !0, type: String, converter: V, reflect: !1, useDefault: !1, hasChanged: ce };
Symbol.metadata ??= Symbol("metadata"), X.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let M = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, s = $e) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((s = Object.create(s)).wrapped = !0), this.elementProperties.set(e, s), !s.noAccessor) {
      const n = Symbol(), i = this.getPropertyDescriptor(e, n, s);
      i !== void 0 && nt(this.prototype, e, i);
    }
  }
  static getPropertyDescriptor(e, s, n) {
    const { get: i, set: r } = it(this.prototype, e) ?? { get() {
      return this[s];
    }, set(a) {
      this[s] = a;
    } };
    return { get: i, set(a) {
      const o = i?.call(this);
      r?.call(this, a), this.requestUpdate(e, o, n);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? $e;
  }
  static _$Ei() {
    if (this.hasOwnProperty(U("elementProperties"))) return;
    const e = ot(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(U("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(U("properties"))) {
      const s = this.properties, n = [...rt(s), ...at(s)];
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
      for (const i of n) s.unshift(ye(i));
    } else e !== void 0 && s.push(ye(e));
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
    return tt(e, this.constructor.elementStyles), e;
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
      const r = (n.converter?.toAttribute !== void 0 ? n.converter : V).toAttribute(s, n.type);
      this._$Em = e, r == null ? this.removeAttribute(i) : this.setAttribute(i, r), this._$Em = null;
    }
  }
  _$AK(e, s) {
    const n = this.constructor, i = n._$Eh.get(e);
    if (i !== void 0 && this._$Em !== i) {
      const r = n.getPropertyOptions(i), a = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : V;
      this._$Em = i;
      const o = a.fromAttribute(s, r.type);
      this[i] = o ?? this._$Ej?.get(i) ?? o, this._$Em = null;
    }
  }
  requestUpdate(e, s, n, i = !1, r) {
    if (e !== void 0) {
      const a = this.constructor;
      if (i === !1 && (r = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? ce)(r, s) || n.useDefault && n.reflect && r === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
      this.C(e, s, n);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, s, { useDefault: n, reflect: i, wrapped: r }, a) {
    n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? s ?? this[e]), r !== !0 || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (s = void 0), this._$AL.set(e, s)), i === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
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
        for (const [i, r] of this._$Ep) this[i] = r;
        this._$Ep = void 0;
      }
      const n = this.constructor.elementProperties;
      if (n.size > 0) for (const [i, r] of n) {
        const { wrapped: a } = r, o = this[i];
        a !== !0 || this._$AL.has(i) || o === void 0 || this.C(i, void 0, r, o);
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
M.elementStyles = [], M.shadowRootOptions = { mode: "open" }, M[U("elementProperties")] = /* @__PURE__ */ new Map(), M[U("finalized")] = /* @__PURE__ */ new Map(), lt?.({ ReactiveElement: M }), (X.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const le = globalThis, xe = (t) => t, K = le.trustedTypes, ve = K ? K.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, Fe = "$lit$", z = `lit$${Math.random().toFixed(9).slice(2)}$`, qe = "?" + z, dt = `<${qe}>`, D = document, W = () => D.createComment(""), I = (t) => t === null || typeof t != "object" && typeof t != "function", de = Array.isArray, pt = (t) => de(t) || typeof t?.[Symbol.iterator] == "function", ee = `[ 	
\f\r]`, N = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, we = /-->/g, ke = />/g, S = RegExp(`>|${ee}(?:([^\\s"'>=/]+)(${ee}*=${ee}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ze = /'/g, Ae = /"/g, Ze = /^(?:script|style|textarea|title)$/i, ut = (t) => (e, ...s) => ({ _$litType$: t, strings: e, values: s }), l = ut(1), P = Symbol.for("lit-noChange"), p = Symbol.for("lit-nothing"), Se = /* @__PURE__ */ new WeakMap(), C = D.createTreeWalker(D, 129);
function Ve(t, e) {
  if (!de(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ve !== void 0 ? ve.createHTML(e) : e;
}
const ht = (t, e) => {
  const s = t.length - 1, n = [];
  let i, r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = N;
  for (let o = 0; o < s; o++) {
    const c = t[o];
    let d, u, m = -1, y = 0;
    for (; y < c.length && (a.lastIndex = y, u = a.exec(c), u !== null); ) y = a.lastIndex, a === N ? u[1] === "!--" ? a = we : u[1] !== void 0 ? a = ke : u[2] !== void 0 ? (Ze.test(u[2]) && (i = RegExp("</" + u[2], "g")), a = S) : u[3] !== void 0 && (a = S) : a === S ? u[0] === ">" ? (a = i ?? N, m = -1) : u[1] === void 0 ? m = -2 : (m = a.lastIndex - u[2].length, d = u[1], a = u[3] === void 0 ? S : u[3] === '"' ? Ae : ze) : a === Ae || a === ze ? a = S : a === we || a === ke ? a = N : (a = S, i = void 0);
    const h = a === S && t[o + 1].startsWith("/>") ? " " : "";
    r += a === N ? c + dt : m >= 0 ? (n.push(d), c.slice(0, m) + Fe + c.slice(m) + z + h) : c + z + (m === -2 ? o : h);
  }
  return [Ve(t, r + (t[s] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), n];
};
class B {
  constructor({ strings: e, _$litType$: s }, n) {
    let i;
    this.parts = [];
    let r = 0, a = 0;
    const o = e.length - 1, c = this.parts, [d, u] = ht(e, s);
    if (this.el = B.createElement(d, n), C.currentNode = this.el.content, s === 2 || s === 3) {
      const m = this.el.content.firstChild;
      m.replaceWith(...m.childNodes);
    }
    for (; (i = C.nextNode()) !== null && c.length < o; ) {
      if (i.nodeType === 1) {
        if (i.hasAttributes()) for (const m of i.getAttributeNames()) if (m.endsWith(Fe)) {
          const y = u[a++], h = i.getAttribute(m).split(z), f = /([.?@])?(.*)/.exec(y);
          c.push({ type: 1, index: r, name: f[2], strings: h, ctor: f[1] === "." ? ft : f[1] === "?" ? _t : f[1] === "@" ? gt : Q }), i.removeAttribute(m);
        } else m.startsWith(z) && (c.push({ type: 6, index: r }), i.removeAttribute(m));
        if (Ze.test(i.tagName)) {
          const m = i.textContent.split(z), y = m.length - 1;
          if (y > 0) {
            i.textContent = K ? K.emptyScript : "";
            for (let h = 0; h < y; h++) i.append(m[h], W()), C.nextNode(), c.push({ type: 2, index: ++r });
            i.append(m[y], W());
          }
        }
      } else if (i.nodeType === 8) if (i.data === qe) c.push({ type: 2, index: r });
      else {
        let m = -1;
        for (; (m = i.data.indexOf(z, m + 1)) !== -1; ) c.push({ type: 7, index: r }), m += z.length - 1;
      }
      r++;
    }
  }
  static createElement(e, s) {
    const n = D.createElement("template");
    return n.innerHTML = e, n;
  }
}
function T(t, e, s = t, n) {
  if (e === P) return e;
  let i = n !== void 0 ? s._$Co?.[n] : s._$Cl;
  const r = I(e) ? void 0 : e._$litDirective$;
  return i?.constructor !== r && (i?._$AO?.(!1), r === void 0 ? i = void 0 : (i = new r(t), i._$AT(t, s, n)), n !== void 0 ? (s._$Co ??= [])[n] = i : s._$Cl = i), i !== void 0 && (e = T(t, i._$AS(t, e.values), i, n)), e;
}
class mt {
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
    const { el: { content: s }, parts: n } = this._$AD, i = (e?.creationScope ?? D).importNode(s, !0);
    C.currentNode = i;
    let r = C.nextNode(), a = 0, o = 0, c = n[0];
    for (; c !== void 0; ) {
      if (a === c.index) {
        let d;
        c.type === 2 ? d = new j(r, r.nextSibling, this, e) : c.type === 1 ? d = new c.ctor(r, c.name, c.strings, this, e) : c.type === 6 && (d = new yt(r, this, e)), this._$AV.push(d), c = n[++o];
      }
      a !== c?.index && (r = C.nextNode(), a++);
    }
    return C.currentNode = D, i;
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
    this.type = 2, this._$AH = p, this._$AN = void 0, this._$AA = e, this._$AB = s, this._$AM = n, this.options = i, this._$Cv = i?.isConnected ?? !0;
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
    e = T(this, e, s), I(e) ? e === p || e == null || e === "" ? (this._$AH !== p && this._$AR(), this._$AH = p) : e !== this._$AH && e !== P && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : pt(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== p && I(this._$AH) ? this._$AA.nextSibling.data = e : this.T(D.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: s, _$litType$: n } = e, i = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = B.createElement(Ve(n.h, n.h[0]), this.options)), n);
    if (this._$AH?._$AD === i) this._$AH.p(s);
    else {
      const r = new mt(i, this), a = r.u(this.options);
      r.p(s), this.T(a), this._$AH = r;
    }
  }
  _$AC(e) {
    let s = Se.get(e.strings);
    return s === void 0 && Se.set(e.strings, s = new B(e)), s;
  }
  k(e) {
    de(this._$AH) || (this._$AH = [], this._$AR());
    const s = this._$AH;
    let n, i = 0;
    for (const r of e) i === s.length ? s.push(n = new j(this.O(W()), this.O(W()), this, this.options)) : n = s[i], n._$AI(r), i++;
    i < s.length && (this._$AR(n && n._$AB.nextSibling, i), s.length = i);
  }
  _$AR(e = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); e !== this._$AB; ) {
      const n = xe(e).nextSibling;
      xe(e).remove(), e = n;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class Q {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, s, n, i, r) {
    this.type = 1, this._$AH = p, this._$AN = void 0, this.element = e, this.name = s, this._$AM = i, this.options = r, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(new String()), this.strings = n) : this._$AH = p;
  }
  _$AI(e, s = this, n, i) {
    const r = this.strings;
    let a = !1;
    if (r === void 0) e = T(this, e, s, 0), a = !I(e) || e !== this._$AH && e !== P, a && (this._$AH = e);
    else {
      const o = e;
      let c, d;
      for (e = r[0], c = 0; c < r.length - 1; c++) d = T(this, o[n + c], s, c), d === P && (d = this._$AH[c]), a ||= !I(d) || d !== this._$AH[c], d === p ? e = p : e !== p && (e += (d ?? "") + r[c + 1]), this._$AH[c] = d;
    }
    a && !i && this.j(e);
  }
  j(e) {
    e === p ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class ft extends Q {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === p ? void 0 : e;
  }
}
class _t extends Q {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== p);
  }
}
class gt extends Q {
  constructor(e, s, n, i, r) {
    super(e, s, n, i, r), this.type = 5;
  }
  _$AI(e, s = this) {
    if ((e = T(this, e, s, 0) ?? p) === P) return;
    const n = this._$AH, i = e === p && n !== p || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, r = e !== p && (n === p || i);
    i && this.element.removeEventListener(this.name, this, n), r && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class yt {
  constructor(e, s, n) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = s, this.options = n;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    T(this, e);
  }
}
const bt = le.litHtmlPolyfillSupport;
bt?.(B, j), (le.litHtmlVersions ??= []).push("3.3.3");
const $t = (t, e, s) => {
  const n = s?.renderBefore ?? e;
  let i = n._$litPart$;
  if (i === void 0) {
    const r = s?.renderBefore ?? null;
    n._$litPart$ = i = new j(e.insertBefore(W(), r), r, void 0, s ?? {});
  }
  return i._$AI(t), i;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const pe = globalThis;
class R extends M {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const s = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = $t(s, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return P;
  }
}
R._$litElement$ = !0, R.finalized = !0, pe.litElementHydrateSupport?.({ LitElement: R });
const xt = pe.litElementPolyfillSupport;
xt?.({ LitElement: R });
(pe.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ke = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const vt = { attribute: !0, type: String, converter: V, reflect: !1, hasChanged: ce }, wt = (t = vt, e, s) => {
  const { kind: n, metadata: i } = s;
  let r = globalThis.litPropertyMetadata.get(i);
  if (r === void 0 && globalThis.litPropertyMetadata.set(i, r = /* @__PURE__ */ new Map()), n === "setter" && ((t = Object.create(t)).wrapped = !0), r.set(s.name, t), n === "accessor") {
    const { name: a } = s;
    return { set(o) {
      const c = e.get.call(this);
      e.set.call(this, o), this.requestUpdate(a, c, t, !0, o);
    }, init(o) {
      return o !== void 0 && this.C(a, void 0, t, o), o;
    } };
  }
  if (n === "setter") {
    const { name: a } = s;
    return function(o) {
      const c = this[a];
      e.call(this, o), this.requestUpdate(a, c, t, !0, o);
    };
  }
  throw Error("Unsupported decorator location: " + n);
};
function ue(t) {
  return (e, s) => typeof s == "object" ? wt(t, e, s) : ((n, i, r) => {
    const a = i.hasOwnProperty(r);
    return i.constructor.createProperty(r, n), a ? Object.getOwnPropertyDescriptor(i, r) : void 0;
  })(t, e, s);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function g(t) {
  return ue({ ...t, state: !0, attribute: !1 });
}
const kt = "0.1.0", Ye = "multizone-climate-scheduler-card", Je = "Multi-Zone Climate Scheduler Card";
function Ee(t, e) {
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
  const n = s.attributes, i = (r) => typeof r == "number" ? r : null;
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
function zt(t, e) {
  return t.states[e]?.state === "active";
}
function E(t, e) {
  return t.states[e] !== void 0;
}
function At(t, e) {
  const s = t.states[e]?.attributes.hvac_modes;
  return Array.isArray(s) ? s.filter((n) => typeof n == "string") : [];
}
function St(t, e) {
  const s = t.states[e]?.attributes.preset_modes;
  return Array.isArray(s) && s.includes("eco");
}
function Ce(t, e) {
  return t.states[e]?.attributes.preset_mode === "eco";
}
function te(t, e) {
  const s = t.states[e];
  if (!s) return null;
  const n = Number(s.state);
  return Number.isFinite(n) ? n : null;
}
function Et(t, e) {
  const s = t.states[e], n = typeof s?.attributes.friendly_name == "string" ? s.attributes.friendly_name.replace(/ (Temperature|temperature)$/, "") : e.split(".")[1] ?? e, i = s ? Number(s.state) : NaN;
  return { entityId: e, name: n, temp: Number.isFinite(i) ? i : null };
}
function Ct(t, e, s) {
  return t.callService("climate", "set_hvac_mode", { entity_id: e, hvac_mode: s });
}
function Ot(t, e, s) {
  return t.callService("climate", "set_preset_mode", {
    entity_id: e,
    preset_mode: s ? "eco" : "none"
  });
}
function Dt(t, e) {
  const s = t.states[e]?.attributes.fan_modes;
  return Array.isArray(s) && s.includes("on");
}
async function Mt(t, e, s, n) {
  Dt(t, e) && await t.callService("climate", "set_fan_mode", {
    entity_id: e,
    fan_mode: "on"
  });
  const i = String(n % 60).padStart(2, "0"), r = String(Math.floor(n / 60)).padStart(2, "0");
  await t.callService("timer", "start", {
    entity_id: s,
    duration: `${r}:${i}:00`
  });
}
function Rt(t, e, s, n) {
  const i = typeof s == "number" ? s : null, r = typeof n == "number" ? n : null;
  return i != null && r != null && i < r && e != null && e >= i && e <= r ? Math.min(r, Math.max(i, t)) : t;
}
const Ge = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
async function Pt(t, e) {
  if (!t.callWS) return null;
  const s = e.split(".")[1];
  try {
    const i = (await t.callWS({ type: "schedule/list" })).find((a) => a.id === s);
    if (!i) return null;
    const r = {};
    for (const a of Ge) i[a] && (r[a] = i[a]);
    return { id: String(i.id), name: typeof i.name == "string" ? i.name : void 0, week: r };
  } catch {
    return null;
  }
}
function Tt(t, e, s, n) {
  if (!t.callWS) return Promise.reject(new Error("callWS unavailable"));
  const r = {
    type: "schedule/update",
    schedule_id: e.split(".")[1],
    name: n
  };
  for (const a of Ge) r[a] = s[a] ?? [];
  return t.callWS(r);
}
function Nt(t, e, s) {
  return t.callService("input_number", "set_value", { entity_id: e, value: s });
}
function Ht(t, e, s) {
  return t.callService("input_select", "select_option", { entity_id: e, option: s });
}
async function Oe(t, e, s, n) {
  n && await t.callService("input_text", "set_value", { entity_id: s, value: "" }), await t.callService("input_boolean", n ? "turn_on" : "turn_off", {
    entity_id: e
  });
}
async function De(t, e, s) {
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
    }))?.[e] ?? []).filter((a) => typeof a.max == "number").map((a) => ({ day: a.start, hours: a.max }));
  } catch {
    return [];
  }
}
function Lt(t, e) {
  const s = [];
  for (const n of t) {
    if (typeof n.lu != "number") continue;
    const i = n.lu * 1e3;
    if (e) {
      const r = n.a?.[e];
      if (r == null) continue;
      s.push({ t: i, state: String(r) });
    } else typeof n.s == "string" && s.push({ t: i, state: n.s });
  }
  return s;
}
async function Me(t, e, s, n, i) {
  if (!t.callWS) return [];
  try {
    const r = await t.callWS({
      type: "history/history_during_period",
      start_time: new Date(s).toISOString(),
      end_time: new Date(n).toISOString(),
      entity_ids: [e],
      minimal_response: !i,
      no_attributes: !i,
      significant_changes_only: !1
    });
    return Lt(r?.[e] ?? [], i);
  } catch {
    return [];
  }
}
function Re(t) {
  return t instanceof Error ? t.message : t && typeof t == "object" && "message" in t ? String(t.message) : JSON.stringify(t);
}
async function Ut(t, e, s) {
  await t.callService("input_text", "set_value", {
    entity_id: e,
    value: ""
  }), await t.callService("automation", "trigger", {
    entity_id: s
  });
}
function Wt(t, e, s) {
  return t.callService("climate", "set_temperature", {
    entity_id: e,
    temperature: s
  });
}
function It(t, e, s, n = "on", i = 6e4) {
  const r = [...t].sort((u, m) => u.t - m.t), a = [];
  let o = "off";
  for (const u of r)
    if (u.t <= e) o = u.state;
    else break;
  let c = o === n ? e : null;
  for (const u of r) {
    if (u.t <= e || u.t >= s) continue;
    const m = u.state === n;
    m && c == null && (c = u.t), !m && c != null && (a.push({ start: c, end: u.t }), c = null);
  }
  c != null && a.push({ start: c, end: s });
  const d = [];
  for (const u of a) {
    const m = d[d.length - 1];
    m && u.start - m.end <= i ? m.end = u.end : d.push({ ...u });
  }
  return d;
}
function Bt(t) {
  const e = [...t].sort((n, i) => n.t - i.t), s = [];
  for (const n of e) {
    const i = Number(n.state);
    if (!Number.isFinite(i)) continue;
    const r = s[s.length - 1];
    (!r || r.value !== i) && s.push({ t: n.t, value: i });
  }
  return s;
}
function H(t) {
  if (!Number.isFinite(t) || t < 0) return "–";
  const e = Math.round(t * 4) / 4, s = Math.floor(e), n = e - s, i = n === 0.25 ? "¼" : n === 0.5 ? "½" : n === 0.75 ? "¾" : "";
  return s === 0 && i ? `${i} hr` : `${s}${i} hr`;
}
function jt(t, e, s) {
  const n = s - e;
  return {
    left: (t.start - e) / n * 100,
    width: (t.end - t.start) / n * 100
  };
}
function Ft(t, e, s, n) {
  if (!Number.isFinite(e) || e <= 0)
    return { status: "learning", label: "learning" };
  if (n < 6)
    return { status: "pending", label: "" };
  const i = e * (Math.min(n, 24) / 24), r = i * (1 + s / 100);
  return t > r && t - i > 0.5 ? { status: "high", label: "running high for the weather" } : { status: "normal", label: "normal for the weather" };
}
const he = {
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
}, ie = {
  "nest-blue": { label: "Nest Blue", tokens: he },
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
}, Pe = "nest-blue", re = /^#[0-9a-f]{6}$/i, Y = [
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
function Te(t) {
  return `custom:${Y.map((e) => t[e]).join(",")}`;
}
function qt(t) {
  return Y.every((s) => re.test(t[s])) ? { ...t } : { ...he };
}
function Ne(t) {
  const e = { presetKey: Pe, tokens: ie[Pe].tokens };
  if (!t) return e;
  const s = ie[t];
  if (s) return { presetKey: t, tokens: s.tokens };
  if (t.startsWith("custom:")) {
    const n = t.slice(7).split(",");
    if (n.length === 5 && n.every((i) => re.test(i.trim()))) {
      const [i, r, a, o, c] = n.map((d) => d.trim().toLowerCase());
      return {
        presetKey: "custom",
        tokens: { ...he, accent: i, accentBright: r, good: a, warn: o, bad: c }
      };
    }
    if (n.length === Y.length && n.every((i) => re.test(i.trim())))
      return { presetKey: "custom", tokens: Object.fromEntries(
        Y.map((r, a) => [r, n[a].trim().toLowerCase()])
      ) };
  }
  return e;
}
const O = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
], Zt = ["monday", "tuesday", "wednesday", "thursday", "friday"], Vt = ["saturday", "sunday"];
function Kt(t) {
  const e = [];
  t.length === 0 && e.push("A day needs at least one block.");
  const s = /* @__PURE__ */ new Set();
  for (const n of t)
    /^([01]\d|2[0-3]):[0-5]\d$/.test(n.time) || e.push(`Bad time "${n.time}".`), s.has(n.time) && e.push(`Duplicate block time ${n.time}.`), s.add(n.time), n.mode === "cool" && n.cool_temp == null && e.push(`${n.name}: cool needs cool_temp.`), n.mode === "heat" && n.heat_temp == null && e.push(`${n.name}: heat needs heat_temp.`), n.mode === "heat_cool" && (n.cool_temp == null || n.heat_temp == null) && e.push(`${n.name}: heat_cool needs both cool_temp and heat_temp.`), n.cool_temp != null && n.heat_temp != null && n.heat_temp >= n.cool_temp && e.push(`${n.name}: heat_temp must be below cool_temp.`);
  return e;
}
function se(t) {
  return {
    block: t.name,
    mode: t.mode,
    ...t.cool_temp != null ? { cool_temp: t.cool_temp } : {},
    ...t.heat_temp != null ? { heat_temp: t.heat_temp } : {}
  };
}
function Yt(t) {
  const e = Kt(t);
  if (e.length > 0) throw new Error(e.join(" "));
  const s = [...t].sort((a, o) => a.time.localeCompare(o.time)), n = s[0], i = s[s.length - 1];
  if (s.length === 1)
    return [{ from: "00:00:00", to: "24:00:00", data: se(n) }];
  const r = [];
  n.time !== "00:00" && r.push({ from: "00:00:00", to: `${n.time}:00`, data: se(i) });
  for (let a = 0; a < s.length; a++) {
    const o = s[a], c = s[a + 1];
    r.push({
      from: `${o.time}:00`,
      to: c ? `${c.time}:00` : "24:00:00",
      data: se(o)
    });
  }
  return r;
}
function Jt(t, e) {
  if (t === "all" && e === "all") return O;
  if (t === "wdwe" && e === "wd") return Zt;
  if (t === "wdwe" && e === "we") return Vt;
  if (t === "days" && O.includes(e.toLowerCase()))
    return [e.toLowerCase()];
  throw new Error(`Unknown set "${e}" for granularity "${t}".`);
}
function Gt(t, e) {
  const s = {};
  for (const [n, i] of Object.entries(e)) {
    const r = Yt(i);
    for (const a of Jt(t, n))
      s[a] = r;
  }
  for (const n of O)
    if (!s[n]) throw new Error(`No block set covers ${n}.`);
  return s;
}
function J(t) {
  const e = t.data;
  return {
    time: t.from.slice(0, 5),
    name: e.block ?? "?",
    mode: e.mode ?? "cool",
    cool_temp: e.cool_temp ?? null,
    heat_temp: e.heat_temp ?? null
  };
}
function Xt(t, e) {
  const s = J(t), n = J(e);
  return s.name === n.name && s.mode === n.mode && s.cool_temp === n.cool_temp && s.heat_temp === n.heat_temp;
}
function me(t) {
  if (t.length === 0) return [];
  const e = [...t].sort((a, o) => a.from.localeCompare(o.from)), s = e[0], n = e[e.length - 1];
  return (e.length > 1 && s.from === "00:00:00" && Xt(s, n) ? e.slice(1) : e).map(J);
}
function L(t) {
  return JSON.stringify(
    [...t].sort((e, s) => e.from.localeCompare(s.from)).map((e) => [e.from, e.to, J(e)])
  );
}
const He = ["monday", "tuesday", "wednesday", "thursday", "friday"], Le = ["saturday", "sunday"];
function Qt(t) {
  const e = O.map((r) => L(t[r] ?? []));
  if (e.every((r) => r === e[0])) return { granularity: "all", sets: { all: [...O] } };
  const n = He.every((r) => L(t[r] ?? []) === L(t.monday ?? [])), i = Le.every((r) => L(t[r] ?? []) === L(t.saturday ?? []));
  return n && i ? { granularity: "wdwe", sets: { wd: [...He], we: [...Le] } } : {
    granularity: "days",
    sets: Object.fromEntries(O.map((r) => [r, [r]]))
  };
}
const es = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];
function ts(t) {
  return `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
}
function ss(t, e) {
  for (let s = 0; s < 8; s++) {
    const n = new Date(e.getTime() + s * 864e5), i = es[n.getDay()], r = me(t[i] ?? []);
    for (const a of r) {
      if (s === 0 && a.time <= ts(e)) continue;
      const [o, c] = a.time.split(":").map(Number), d = new Date(n);
      d.setHours(o ?? 0, c ?? 0, 0, 0);
      const u = Math.round((d.getTime() - e.getTime()) / 6e4);
      if (!(u <= 0))
        return { ...a, day: i, minutesUntil: u };
    }
  }
  return null;
}
function ns(t, e, s, n) {
  const i = {};
  for (const r of O) {
    const a = t[r];
    if (!a) continue;
    if (!e.includes(r)) {
      i[r] = a;
      continue;
    }
    const o = me(a).map(
      (c) => c.time === s ? { ...c, ...n } : c
    );
    i[r] = is(o);
  }
  return i;
}
function is(t) {
  const e = [...t].sort((a, o) => a.time.localeCompare(o.time));
  if (e.length === 0) return [];
  const s = e[0], n = e[e.length - 1], i = (a) => ({
    block: a.name,
    mode: a.mode,
    ...a.cool_temp != null ? { cool_temp: a.cool_temp } : {},
    ...a.heat_temp != null ? { heat_temp: a.heat_temp } : {}
  });
  if (e.length === 1) return [{ from: "00:00:00", to: "24:00:00", data: i(s) }];
  const r = [];
  s.time !== "00:00" && r.push({ from: "00:00:00", to: `${s.time}:00`, data: i(n) });
  for (let a = 0; a < e.length; a++) {
    const o = e[a], c = e[a + 1];
    r.push({
      from: `${o.time}:00`,
      to: c ? `${c.time}:00` : "24:00:00",
      data: i(o)
    });
  }
  return r;
}
const fe = {
  fan_timer: { domain: "timer", suffix: "fan" },
  room_override_timer: { domain: "timer", suffix: "room_override" },
  running_sensor: { domain: "binary_sensor", suffix: "running" },
  runtime_today: { domain: "sensor", suffix: "runtime_today" },
  expected_runtime: { domain: "sensor", suffix: "expected_runtime" },
  target_room_select: { domain: "input_select", suffix: "target_room" },
  sensor_schedule: { domain: "schedule", suffix: "sensor_schedule" },
  applied_block_marker: { domain: "input_text", suffix: "applied_block" },
  zone_enabled: { domain: "input_boolean", suffix: "enabled" }
}, _e = {
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
  ...Object.values(fe).map((t) => t.suffix),
  ...Object.values(_e).map((t) => t.suffix)
];
function k(t) {
  return t.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
function $(t, e, s) {
  const n = fe[t];
  return `${n.domain}.${e}_${s}_${n.suffix}`;
}
function rs(t, e, s) {
  return `schedule.${t}_${e}_${s}`;
}
function x(t, e) {
  const s = _e[t];
  return `${s.domain}.${e}_${s.suffix}`;
}
function Ue(t, e) {
  return `${t}_mzcs_${e}`;
}
function We(t, e) {
  return {
    engine: "Climate: schedule engine",
    fan_timer: `Climate: ${e ?? "?"} fan timer finished`,
    season_recommender: "Climate: season recommender",
    runtime_alert: "Climate: runtime anomaly alert",
    watchdog: "Climate: engine watchdog",
    steering: "Climate: comfort steering"
  }[t] ?? `Climate: ${t}`;
}
function as(t, e, s, n) {
  const i = t.indexOf(".");
  if (i < 0) return null;
  const r = t.slice(0, i), a = t.slice(i + 1);
  if (a !== e && !a.startsWith(`${e}_`)) return null;
  const o = a.slice(e.length + 1);
  for (const [d, u] of Object.entries(_e))
    if (r === u.domain && o === u.suffix) return { cls: d };
  const c = [...s].sort((d, u) => u.length - d.length);
  for (const d of c) {
    if (o !== d && !o.startsWith(`${d}_`)) continue;
    const u = o.slice(d.length + 1);
    for (const [m, y] of Object.entries(fe))
      if (r === y.domain && u === y.suffix) return { cls: m, zone: d };
    if (r === "schedule" && n.includes(u))
      return { cls: "zone_schedule", zone: d, season: u };
  }
  return null;
}
const Xe = 2, Qe = 4;
function os(t, e = Xe, s = Qe) {
  const n = Math.abs(t);
  return n <= e ? "green" : n <= s ? "amber" : "red";
}
function cs(t) {
  const e = Math.round(t);
  return `${e > 0 ? "+" : ""}${e}°`;
}
function ls(t, e) {
  let s = t != null && t > 0 ? t : Xe, n = e != null && e > 0 ? e : Qe;
  return n <= s && (n = s + 1), { greenMax: s, amberMax: n };
}
const ds = "mzcs", Ie = "r1", ps = [
  { cls: "season_confirm_days", min: 1, max: 14, step: 1, initial: 3 },
  { cls: "season_dwell_days", min: 1, max: 60, step: 1, initial: 14 },
  { cls: "dev_green_max", min: 1, max: 10, step: 1, initial: 2, unit: "°F" },
  { cls: "dev_amber_max", min: 1, max: 15, step: 1, initial: 4, unit: "°F" },
  { cls: "runtime_alert_margin", min: 5, max: 100, step: 5, initial: 35, unit: "%" },
  { cls: "runtime_alert_days", min: 1, max: 7, step: 1, initial: 3 },
  { cls: "runtime_learn_days", min: 7, max: 60, step: 1, initial: 30 },
  { cls: "cdd_base", min: 60, max: 80, step: 1, initial: 75, unit: "°F" }
], us = [
  { cls: "override_minutes", min: 15, max: 240, step: 15, initial: 60 },
  { cls: "steer_min_setpoint", min: 50, max: 80, step: 1, initial: 68 },
  { cls: "steer_max_setpoint", min: 70, max: 95, step: 1, initial: 85 },
  { cls: "steer_max_offset", min: 1, max: 10, step: 1, initial: 5 }
];
function hs(t) {
  return Gt(t.granularity, t.sets);
}
function ms(t) {
  const e = [], s = t.prefix;
  for (const i of t.zones) {
    t.features.fan_timer && e.push({
      id: $("fan_timer", s, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} fan`, restore: !0 }
    }), e.push({
      id: $("running_sensor", s, i.slug),
      kind: "template_sensor",
      spec: { name: `Climate ${i.name} running`, source: "hvac_action" }
    }), e.push({
      id: $("runtime_today", s, i.slug),
      kind: "stats_sensor",
      spec: { name: `Climate ${i.name} runtime today`, state_class: "total_increasing" }
    }), e.push({
      id: $("expected_runtime", s, i.slug),
      kind: "template_sensor",
      spec: { name: `Climate ${i.name} expected runtime`, model: "k_x_cdd" }
    }), e.push({
      id: $("applied_block_marker", s, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} applied block` }
    }), e.push({
      id: $("zone_enabled", s, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} enabled` }
    }), t.features.steering && (e.push({
      id: $("target_room_select", s, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} target room`, options: ["Thermostat"] }
    }), e.push({
      id: $("room_override_timer", s, i.slug),
      kind: "helper",
      spec: { name: `Climate ${i.name} room override`, restore: !0 }
    }), e.push({
      id: $("sensor_schedule", s, i.slug),
      kind: "schedule",
      spec: { name: `Climate ${i.name} sensor schedule` }
    }));
    for (const r of t.seasons) {
      const a = t.schedules[i.slug]?.[r.key];
      if (!a) throw new Error(`Missing schedule for ${i.slug}/${r.key}.`);
      e.push({
        id: rs(s, i.slug, r.key),
        kind: "schedule",
        spec: { name: `Climate ${i.name} ${r.name}`, week: hs(a) }
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
  for (const i of ps)
    e.push({
      id: x(i.cls, s),
      kind: "helper",
      spec: { min: i.min, max: i.max, step: i.step, initial: i.initial, ...i.unit ? { unit: i.unit } : {} }
    });
  if (t.features.steering)
    for (const i of us)
      e.push({
        id: x(i.cls, s),
        kind: "helper",
        spec: { min: i.min, max: i.max, step: i.step, initial: i.initial }
      });
  e.push({
    id: x("next_block_sensor", s),
    kind: "template_sensor",
    spec: { name: "Climate next block" }
  }), e.push({
    id: x("theme", s),
    kind: "helper",
    spec: { name: "Climate theme" }
  });
  const n = (i, r) => ({
    id: `automation:${Ue(s, i)}`,
    kind: "automation",
    spec: { alias: We(i, r), revision: Ie }
  });
  if (e.push(n("engine")), e.push(n("watchdog")), t.seasons.length > 1 && e.push(n("season_recommender")), t.features.anomaly_alerts && e.push(n("runtime_alert")), t.features.fan_timer)
    for (const i of t.zones)
      e.push({
        id: `automation:${Ue(s, `fan_timer_${i.slug}`)}`,
        kind: "automation",
        spec: { alias: We("fan_timer", i.name), revision: Ie }
      });
  return t.features.steering && e.push(n("steering")), e;
}
function fs(t, e) {
  return G(t) === G(e);
}
function G(t) {
  if (Array.isArray(t)) return `[${t.map(G).join(",")}]`;
  if (t !== null && typeof t == "object") {
    const e = t;
    return `{${Object.keys(e).sort().map((s) => `${JSON.stringify(s)}:${G(e[s])}`).join(",")}}`;
  }
  return JSON.stringify(t);
}
function _s(t, e) {
  const s = { create: [], adopt: [], update: [], delete: [], noop: [] }, n = new Map(e.map((r) => [r.id, r])), i = new Set(t.map((r) => r.id));
  for (const r of t) {
    const a = n.get(r.id);
    a ? a.managed ? fs(a.spec, r.spec) ? s.noop.push({ op: "noop", id: r.id, kind: r.kind }) : s.update.push({ op: "update", id: r.id, kind: r.kind, spec: r.spec, from: a.spec }) : s.adopt.push({ op: "adopt", id: r.id, kind: r.kind, spec: r.spec }) : s.create.push({ op: "create", id: r.id, kind: r.kind, spec: r.spec });
  }
  for (const r of e)
    r.managed && !i.has(r.id) && s.delete.push({ op: "delete", id: r.id, kind: r.kind });
  return s;
}
function gs(t) {
  const e = t.default_mode;
  return { granularity: "all", sets: { all: [{
    time: "06:00",
    name: "Day",
    mode: e,
    cool_temp: e === "heat" ? null : e === "heat_cool" ? 84 : 78,
    heat_temp: e === "heat" ? 68 : e === "heat_cool" ? 66 : null
  }] } };
}
function ys(t, e) {
  const s = {};
  for (const n of t) {
    s[n] = {};
    for (const i of e) s[n][i.key] = gs(i);
  }
  return s;
}
const bs = {
  fan_timer: "helper",
  room_override_timer: "helper",
  target_room_select: "helper",
  applied_block_marker: "helper",
  zone_enabled: "helper",
  theme: "helper",
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
async function q(t, e) {
  if (!t.callWS) return [];
  try {
    const s = await t.callWS({ type: `${e}/list` });
    return Array.isArray(s) ? s : [];
  } catch {
    return [];
  }
}
async function $s(t, e) {
  const s = /* @__PURE__ */ new Map();
  if (!t.callWS || e.length === 0) return s;
  try {
    const n = await t.callWS({
      type: "config/entity_registry/get_entries",
      entity_ids: e
    });
    for (const [i, r] of Object.entries(n ?? {}))
      r?.labels && s.set(i, r.labels);
  } catch {
  }
  return s;
}
async function xs(t, e, s, n) {
  const i = [];
  for (const h of Object.keys(t.states)) {
    const f = as(h, e, s, n);
    if (!f) continue;
    const v = bs[f.cls];
    v && i.push({ id: h, kind: v });
  }
  const [r, a, o, c, d] = await Promise.all([
    q(t, "timer"),
    q(t, "input_select"),
    q(t, "input_number"),
    q(t, "schedule"),
    $s(
      t,
      i.map((h) => h.id)
    )
  ]), u = (h, f) => {
    const v = /* @__PURE__ */ new Map();
    for (const w of h) w.id && v.set(`${f}.${w.id}`, w);
    return v;
  }, m = new Map([
    ...u(r, "timer"),
    ...u(a, "input_select"),
    ...u(o, "input_number"),
    ...u(c, "schedule")
  ]), y = [];
  for (const h of i) {
    const f = m.get(h.id), v = t.states[h.id];
    let w = {};
    h.id.startsWith("input_number.") && f ? w = { min: f.min, max: f.max, step: f.step } : h.id.startsWith("input_select.") && f ? w = { name: f.name, options: f.options } : h.id.startsWith("timer.") && f ? w = { name: f.name, restore: f.restore ?? !1 } : h.id.startsWith("schedule.") && f ? w = { name: f.name, raw: !0 } : v && (w = { name: v.attributes.friendly_name ?? h.id }), y.push({
      id: h.id,
      kind: h.kind,
      spec: w,
      managed: (d.get(h.id) ?? []).includes(ds)
    });
  }
  for (const [h, f] of Object.entries(t.states)) {
    if (!h.startsWith("automation.") || !f) continue;
    const v = f.attributes.id;
    typeof v == "string" && v.startsWith(`${e}_mzcs_`) && y.push({
      id: `automation:${v}`,
      kind: "automation",
      spec: { alias: f.attributes.friendly_name ?? v, revision: "unknown" },
      managed: !0
    });
  }
  return y;
}
var vs = Object.defineProperty, ws = Object.getOwnPropertyDescriptor, b = (t, e, s, n) => {
  for (var i = n > 1 ? void 0 : n ? ws(e, s) : e, r = t.length - 1, a; r >= 0; r--)
    (a = t[r]) && (i = (n ? a(e, s, i) : a(i)) || i);
  return n && i && vs(e, s, i), i;
};
const ks = [
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
], zs = [
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
], As = [
  { cls: "dev_green_max", label: "Room deviation · green up to (°)" },
  { cls: "dev_amber_max", label: "Room deviation · amber up to (°)" },
  { cls: "runtime_alert_margin", label: "Runtime alert margin (%)" },
  { cls: "runtime_alert_days", label: "Runtime alert · consecutive days" },
  { cls: "runtime_learn_days", label: "Runtime learn window (days)" },
  { cls: "cdd_base", label: "Cooling degree-day base (°)" },
  { cls: "season_confirm_days", label: "Season switch · confirm after (days)" },
  { cls: "season_dwell_days", label: "Season switch · min dwell (days)" }
];
function Ss(t) {
  const [e, s] = t.split(":");
  let n = Number(e);
  const i = n >= 12 ? "PM" : "AM";
  return n = n % 12 === 0 ? 12 : n % 12, `${n}:${s} ${i}`;
}
const Es = {
  all: "Every day",
  wd: "Weekdays",
  we: "Weekend"
}, Cs = {
  heat: "Heat",
  cool: "Cool",
  heat_cool: "Heat·Cool",
  off: "Off",
  auto: "Auto",
  dry: "Dry",
  fan_only: "Fan only"
};
console.info(`%c ${Je} %c v${kt}`, "background:var(--mzcs-accent);color:#fff;padding:2px 6px;border-radius:4px 0 0 4px;", "background:#243039;color:#fff;padding:2px 6px;border-radius:0 4px 4px 0;");
let _ = class extends R {
  constructor() {
    super(...arguments), this._zoneIndex = 0, this._ctrlOpen = !1, this._setupOpen = !1, this._schedOpen = !1, this._schedName = "", this._schedBusy = !1, this._rtOpen = !1, this._rtDayOpen = null, this._rtDayLoading = !1, this._rtDayCache = /* @__PURE__ */ new Map(), this._rtRange = 7, this._dryRunning = !1;
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
    return await Promise.resolve().then(() => Ps), document.createElement("multizone-climate-scheduler-card-editor");
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
    const s = Ee(this.hass, e.entity);
    if (s.setpoint == null) return;
    const n = this.hass.states[e.entity]?.attributes, i = Rt(
      s.setpoint + t,
      s.setpoint,
      n?.min_temp,
      n?.max_temp
    );
    i !== s.setpoint && Wt(this.hass, e.entity, i);
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
      schedules: ys(
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
        const t = this._provisionInput(), e = await xs(
          this.hass,
          t.prefix,
          t.zones.map((s) => s.slug),
          t.seasons.map((s) => s.key)
        );
        this._dryRun = _s(ms(t), e);
      } catch (t) {
        this._dryRunError = t instanceof Error ? t.message : String(t);
      } finally {
        this._dryRunning = !1;
      }
    }
  }
  _renderSetup() {
    const t = this._dryRun;
    return l`
      <div class="setup">
        <p class="setup-title">Setup · dry run</p>
        <p class="setup-sub">
          Read-only preview of what Setup would create. Nothing is written from this screen.
        </p>
        <button class="chip" .disabled=${this._dryRunning} @click=${() => void this._runDryRun()}>
          ${this._dryRunning ? "Reading registry…" : "Run dry-run preview"}
        </button>
        ${this._dryRunError ? l`<p class="setup-err">${this._dryRunError}</p>` : p}
        ${t ? l`
              <div class="planwrap">
                ${[
      ["Create", t.create, ""],
      ["Adopt", t.adopt, ""],
      ["Update", t.update, ""],
      ["Delete", t.delete, "del"],
      ["Unchanged", t.noop, "quiet"]
    ].map(
      ([e, s, n]) => l`
                    <p class="plan-h ${n}">${e} (${s.length})</p>
                    ${s.length > 0 && e !== "Unchanged" ? l`<ul class="plan-list ${n}">
                          ${s.map((i) => l`<li>${i.id}</li>`)}
                        </ul>` : p}
                  `
    )}
              </div>
            ` : p}
        ${this._renderManage()}
        <button class="chip" @click=${() => this._setupOpen = !1}>Close</button>
      </div>
    `;
  }
  _renderManage() {
    const t = this.hass;
    if (!t) return p;
    const e = x("season_select", this._prefix), s = t.states[e], n = Array.isArray(s?.attributes.options) ? s.attributes.options : [], i = As.map((o) => ({
      ...o,
      id: x(o.cls, this._prefix)
    })).filter((o) => E(t, o.id));
    if (!s && i.length === 0) return p;
    const r = (this._config?.zones ?? []).map((o) => {
      const c = k(o.name);
      return {
        name: o.name,
        enableId: $("zone_enabled", this._prefix, c),
        markerId: $("applied_block_marker", this._prefix, c)
      };
    }).filter((o) => E(t, o.enableId)), a = r.length > 0 && r.every((o) => t.states[o.enableId]?.state === "on");
    return l`
      <p class="setup-title" style="margin-top:12px;">Manage</p>
      ${r.length > 0 ? l`
            <div class="managerow master">
              <span>Scheduling · all zones</span>
              <button
                class=${a ? "chip togg on" : "chip togg"}
                @click=${() => {
      for (const o of r) Oe(t, o.enableId, o.markerId, !a);
    }}
              >
                ${a ? "On" : "Off"}
              </button>
            </div>
            ${r.map((o) => {
      const c = t.states[o.enableId]?.state === "on";
      return l`
                <div class="managerow">
                  <span>${o.name} scheduling</span>
                  <button
                    class=${c ? "chip togg on" : "chip togg"}
                    @click=${() => void Oe(t, o.enableId, o.markerId, !c)}
                  >
                    ${c ? "On" : "Off"}
                  </button>
                </div>
              `;
    })}
            <p class="muted" style="font-size:11px;margin:2px 0 6px;">
              Off = the engine stands down and the thermostat's own app schedule takes over.
            </p>
          ` : p}
      ${s ? l`
            <div class="managerow">
              <span>Active season</span>
              <select
                @change=${(o) => void Ht(t, e, o.target.value)}
              >
                ${n.map(
      (o) => l`<option .value=${o} ?selected=${o === s.state}>${o}</option>`
    )}
              </select>
            </div>
          ` : p}
      ${i.map(
      (o) => l`
          <div class="managerow">
            <span>${o.label}</span>
            <input
              type="number"
              .value=${t.states[o.id]?.state ?? ""}
              @change=${(c) => void Nt(t, o.id, Number(c.target.value))}
            />
          </div>
        `
    )}
      ${this._renderThemePicker()}
    `;
  }
  _renderThemePicker() {
    const t = this.hass;
    if (!t) return p;
    const e = x("theme", this._prefix);
    if (!E(t, e)) return p;
    const { presetKey: s, tokens: n } = Ne(t.states[e]?.state), i = (r) => void t.callService("input_text", "set_value", { entity_id: e, value: r });
    return l`
      <p class="setup-title" style="margin-top:12px;">Theme</p>
      <div class="chips">
        ${Object.entries(ie).map(
      ([r, a]) => l`
            <button
              class=${s === r ? "chip mode-on" : "chip"}
              @click=${() => i(r)}
            >
              <span class="swatch" style="background:${a.tokens.accent}"></span>${a.label}
            </button>
          `
    )}
        <button
          class=${s === "custom" ? "chip mode-on" : "chip"}
          @click=${() => i(Te(qt(n)))}
        >
          Custom
        </button>
      </div>
      ${s === "custom" ? l`
            ${zs.map(
      (r) => l`
                <div class="managerow">
                  <span>${r.label}</span>
                  <input
                    type="color"
                    .value=${n[r.key]}
                    @change=${(a) => {
        const o = { ...n, [r.key]: a.target.value };
        i(Te(o));
      }}
                  />
                </div>
              `
    )}
            <p class="muted" style="font-size:11px;margin:2px 0 0;">
              Colors apply live to every device showing the card.
            </p>
          ` : p}
    `;
  }
  _applyTheme() {
    const t = this.hass?.states[x("theme", this._prefix)]?.state, { tokens: e } = Ne(t);
    for (const [s, n] of ks)
      this.style.setProperty(n, e[s]);
  }
  render() {
    if (!this._config || !this.hass) return p;
    this._applyTheme();
    const t = this._zone();
    if (!t) return p;
    if (this._setupOpen)
      return l`<ha-card><div class="wrap">${this._renderSetup()}</div></ha-card>`;
    const e = Ee(this.hass, t.entity), s = zt(
      this.hass,
      $("fan_timer", this._prefix, k(t.name))
    ), n = e.action === "cooling", i = e.action === "heating", r = e.available ? n ? `Cooling to ${e.setpoint}` : i ? `Heating to ${e.setpoint}` : e.mode === "off" ? "Off" : `Idle · set ${e.setpoint ?? "–"}` : "Unavailable";
    return l`
      <ha-card>
        <div class="wrap">
          <div class="tabs" role="tablist">
            ${this._config.zones.map(
      (a, o) => l`
                <button
                  role="tab"
                  aria-selected=${o === this._zoneIndex}
                  class=${o === this._zoneIndex ? "tab on" : "tab"}
                  @click=${() => {
        this._zoneIndex = o;
      }}
                >
                  ${a.name}
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
                ${r}${e.inside != null ? ` · inside ${e.inside}°` : ""}${e.humidity != null ? ` · ${e.humidity}% RH` : ""}${s ? l`<span class="fan"> · fan on</span>` : ""}
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
    if (!this.hass) return p;
    const e = this.hass, s = k(t.name), n = $("runtime_today", this._prefix, s);
    if (!E(e, n)) return p;
    const i = Number(e.states[n]?.state), r = Number.isFinite(i) ? H(i) : "–";
    this._rtLoadedFor !== n && (this._rtLoadedFor = n, this._rtDaily = void 0, queueMicrotask(
      () => void De(e, n, 7).then((h) => {
        this._rtDaily = h;
      })
    ));
    const a = /* @__PURE__ */ new Date();
    a.setHours(0, 0, 0, 0);
    const o = (this._rtDaily ?? []).filter((h) => h.day < a.getTime()).sort((h, f) => f.day - h.day), c = a.getTime(), d = Number(
      e.states[$("expected_runtime", this._prefix, s)]?.state
    ), u = te(e, x("runtime_alert_margin", this._prefix)) ?? 35, m = (Date.now() - c) / 36e5, y = Ft(
      Number.isFinite(i) ? i : 0,
      d,
      u,
      m
    );
    return l`
      <button class="schedrow" @click=${() => this._rtOpen = !this._rtOpen}>
        <span
          >Runtime · Today <b class="rt-b">${r}</b>${y.label ? l` <span class="verdict ${y.status}">· ${y.label}</span>` : p}</span
        >
        <span aria-hidden="true">${this._rtOpen ? "▴" : "▾"}</span>
      </button>
      ${this._rtOpen ? l`
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
      this._rtRange = 30, this._rt30 || De(e, n, 30).then((h) => {
        this._rt30 = h;
      });
    }}
                >
                  30 days
                </button>
              </div>
              ${this._rtRange === 30 ? this._render30() : p}
              ${this._rtRange === 7 ? l`${this._renderPill(t, "Today", Number.isFinite(i) ? i : 0, c, !0)}` : p}
              ${this._rtRange === 7 ? l`
                    ${o.map(
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
                    ${o.length === 0 ? l`<p class="muted" style="font-size:11px;margin:6px 0;">
                          History accrues daily - past days appear as statistics build up.
                        </p>` : p}
                    <p class="muted" style="font-size:10px;margin:6px 0 0;">
                      Tap a day for its run segments and setpoint changes.
                    </p>
                  ` : p}
            </div>
          ` : p}
    `;
  }
  _render30() {
    const t = this._rt30;
    if (!t) return l`<p class="muted" style="font-size:11px;">Loading…</p>`;
    if (t.length === 0)
      return l`<p class="muted" style="font-size:11px;">
        Long-term statistics build daily - the 30-day view fills in as days accumulate.
      </p>`;
    const e = [...t].sort((r, a) => r.day - a.day), s = Math.max(...e.map((r) => r.hours), 1), n = e.reduce((r, a) => r + a.hours, 0) / e.length, i = (r) => new Date(r).toLocaleDateString(void 0, { month: "short", day: "numeric" });
    return l`
      <div class="cols">
        ${e.map(
      (r) => l`<span
            class="col"
            title="${i(r.day)}: ${H(r.hours)}"
            style="height: ${Math.max(6, r.hours / s * 64).toFixed(0)}px"
          ></span>`
    )}
      </div>
      <div class="axis">
        <span>${i(e[0].day)}</span>
        <span>${i(e[e.length - 1].day)}</span>
      </div>
      <p class="muted" style="font-size:11px;margin:6px 0 0;">
        Avg <b class="rt-b">${H(n)}</b> · Max
        <b class="rt-b">${H(s)}</b> · from long-term statistics (kept forever)
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
        const n = k(t.name), i = $("running_sensor", this._prefix, n), r = Math.min(e + 864e5, Date.now()), [a, o] = await Promise.all([
          Me(this.hass, i, e, r),
          Me(this.hass, t.entity, e, r, "temperature")
        ]), c = {
          segs: It(a, e, r),
          bubs: Bt(o),
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
    const r = Math.min(100, Math.max(0, s / 24 * 100)), a = this._rtDayOpen === n;
    return l`
      <button class="pillrow" @click=${() => void this._openDay(t, n)}>
        <span class="pill-label">${e}</span>
        <span class="pill-track">
          <span
            class="pill-fill ${i || a ? "today-fill" : ""}"
            style="width: ${r.toFixed(1)}%"
          ></span>
        </span>
        <span class="pill-hours">${H(s)}</span>
      </button>
      ${a ? this._renderDayDetail() : p}
    `;
  }
  _renderDayDetail() {
    if (this._rtDayLoading) return l`<p class="muted" style="font-size:11px;">Loading day…</p>`;
    const t = this._rtDayDetail;
    return t ? l`
      <div class="daydetail">
        <div class="bubblerow">
          ${t.bubs.slice(0, 12).map((e) => {
      const s = (e.t - t.start) / (t.end - t.start) * 100;
      return l`<span class="bubble" style="left: ${s.toFixed(1)}%"
              >${Math.round(e.value)}</span
            >`;
    })}
        </div>
        <div class="segtrack">
          ${t.segs.map((e) => {
      const { left: s, width: n } = jt(e, t.start, t.end);
      return l`<span
              class="seg"
              style="left: ${s.toFixed(2)}%; width: ${Math.max(0.4, n).toFixed(2)}%"
            ></span>`;
    })}
        </div>
        <div class="axis">
          <span>12A</span><span>6A</span><span>12P</span><span>6P</span><span>12A</span>
        </div>
      </div>
    ` : p;
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
    if (!e || !E(this.hass, e)) {
      this._schedWeek = void 0;
      return;
    }
    this._schedBusy = !0;
    try {
      const s = await Pt(this.hass, e);
      this._schedWeek = s?.week ?? void 0, this._schedName = s?.name ?? "", this._schedError = s ? void 0 : "Could not load schedule config.";
    } catch (s) {
      this._schedError = Re(s);
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
        const r = ns(this._schedWeek, e, s, n);
        await Tt(
          this.hass,
          i,
          r,
          this._schedName
        ), this._schedWeek = r, this._schedError = void 0;
      } catch (r) {
        this._schedError = Re(r);
      } finally {
        this._schedBusy = !1;
      }
    }
  }
  _renderSchedule(t) {
    if (!this.hass) return p;
    const e = this._scheduleEntityId(t);
    if (!e || !E(this.hass, e)) return p;
    this._schedLoadedFor !== e && !this._schedBusy && (this._schedLoadedFor = e, this._schedWeek = void 0, queueMicrotask(() => void this._loadWeek(t)));
    const s = this.hass.states[x("season_select", this._prefix)]?.state ?? "", n = this._schedWeek, i = n ? ss(n, /* @__PURE__ */ new Date()) : null, r = i ? `Next · ${Ss(i.time)} ${i.name} → ${i.cool_temp ?? i.heat_temp}°` : "Schedule";
    return l`
      <button
        class="schedrow"
        @click=${() => {
      this._schedOpen = !this._schedOpen, this._schedWeek || this._loadWeek(t);
    }}
      >
        <span>${r} <span class="season">· ${s}</span></span>
        <span aria-hidden="true">${this._schedOpen ? "▴" : "▾"}</span>
      </button>
      ${this._schedOpen ? this._renderScheduleBody(t) : p}
    `;
  }
  _renderScheduleBody(t) {
    if (this._schedBusy && !this._schedWeek) return l`<p class="muted pad">Loading…</p>`;
    if (this._schedError) return l`<p class="schederr pad">${this._schedError}</p>`;
    const e = this._schedWeek;
    if (!e) return l`<p class="muted pad">No schedule data.</p>`;
    const s = Qt(e), n = (/* @__PURE__ */ new Date()).getDay(), i = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][n];
    return l`
      <div class="schedbody">
        ${Object.entries(s.sets).map(([r, a]) => {
      const o = me(e[a[0]] ?? []), c = a.includes(i);
      return l`
            <p class="sethead">
              ${Es[r] ?? r}${c ? l` <span class="today">today</span>` : p}
            </p>
            ${o.map(
        (d) => l`
                <div class="blockrow">
                  <input
                    class="btime"
                    type="time"
                    .value=${d.time}
                    @change=${(u) => void this._saveBlockEdit(t, a, d.time, {
          time: u.target.value
        })}
                  />
                  <span class="bname">${d.name}</span>
                  <input
                    class="btemp"
                    type="number"
                    .value=${String(d.cool_temp ?? d.heat_temp ?? "")}
                    @change=${(u) => void this._saveBlockEdit(t, a, d.time, {
          cool_temp: Number(u.target.value)
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
      const r = $("applied_block_marker", this._prefix, k(t.name));
      Ut(this.hass, r, "automation.climate_schedule_engine");
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
    if (!this.hass) return p;
    const e = this.hass, s = this._zone();
    if (!s) return p;
    const n = At(e, t), i = e.states[t]?.state, r = St(e, t), a = $("fan_timer", this._prefix, k(s.name)), o = this._config?.features?.fan_timer ?? [15, 30, 60], c = E(e, a);
    return l`
      <button class="expander" @click=${() => this._ctrlOpen = !this._ctrlOpen}>
        <span>Mode</span>
        <span aria-hidden="true">${this._ctrlOpen ? "▴" : "▾"}</span>
      </button>
      ${this._ctrlOpen ? l`
            <div class="ctrl">
              <div class="chips">
                ${n.map(
      (d) => l`
                    <button
                      class=${i === d ? "chip mode-on" : "chip"}
                      @click=${() => void Ct(e, t, d)}
                    >
                      ${Cs[d] ?? d}
                    </button>
                  `
    )}
                ${r ? l`
                      <button
                        class=${Ce(e, t) ? "chip eco eco-on" : "chip eco"}
                        @click=${() => void Ot(e, t, !Ce(e, t))}
                      >
                        Eco
                      </button>
                    ` : p}
              </div>
              ${c ? l`
                    <div class="chips fanrow">
                      <span class="fanlbl">Fan</span>
                      ${o.map(
      (d) => l`
                          <button
                            class="chip"
                            @click=${() => void Mt(e, t, a, d)}
                          >
                            ${d}m
                          </button>
                        `
    )}
                    </div>
                  ` : p}
            </div>
          ` : p}
    `;
  }
  _renderRooms(t, e) {
    if (!this.hass || !t.room_sensors || t.room_sensors.length === 0) return p;
    const s = this.hass, { greenMax: n, amberMax: i } = ls(
      te(s, x("dev_green_max", this._prefix)),
      te(s, x("dev_amber_max", this._prefix))
    );
    return l`
      <div class="rooms">
        ${t.room_sensors.map((r) => {
      const a = Et(s, r);
      if (a.temp == null || e == null)
        return l`
              <div class="room">
                <span class="rname">${a.name}</span>
                <span class="rtemp muted">${a.temp == null ? "—" : `${a.temp}°`}</span>
              </div>
            `;
      const o = Math.round(a.temp - e);
      return l`
            <div class="room">
              <span class="rname">${a.name}</span>
              <span>
                <span class="badge ${os(o, n, i)}"
                  >${cs(o)}</span
                >
                <span class="rtemp">${a.temp}°</span>
              </span>
            </div>
          `;
    })}
      </div>
    `;
  }
};
_.styles = je`
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
  ue({ attribute: !1 })
], _.prototype, "hass", 2);
b([
  g()
], _.prototype, "_config", 2);
b([
  g()
], _.prototype, "_zoneIndex", 2);
b([
  g()
], _.prototype, "_ctrlOpen", 2);
b([
  g()
], _.prototype, "_setupOpen", 2);
b([
  g()
], _.prototype, "_schedOpen", 2);
b([
  g()
], _.prototype, "_schedWeek", 2);
b([
  g()
], _.prototype, "_schedError", 2);
b([
  g()
], _.prototype, "_schedBusy", 2);
b([
  g()
], _.prototype, "_rtOpen", 2);
b([
  g()
], _.prototype, "_rtDaily", 2);
b([
  g()
], _.prototype, "_rtDayOpen", 2);
b([
  g()
], _.prototype, "_rtDayDetail", 2);
b([
  g()
], _.prototype, "_rtDayLoading", 2);
b([
  g()
], _.prototype, "_rtRange", 2);
b([
  g()
], _.prototype, "_rt30", 2);
b([
  g()
], _.prototype, "_dryRun", 2);
b([
  g()
], _.prototype, "_dryRunError", 2);
b([
  g()
], _.prototype, "_dryRunning", 2);
_ = b([
  Ke(Ye)
], _);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: Ye,
  name: Je,
  description: "Nest-style climate view for 1-4 zones with seasonal scheduling, fan timers, and runtime history."
});
var Os = Object.defineProperty, Ds = Object.getOwnPropertyDescriptor, F = (t, e, s, n) => {
  for (var i = n > 1 ? void 0 : n ? Ds(e, s) : e, r = t.length - 1, a; r >= 0; r--)
    (a = t[r]) && (i = (n ? a(e, s, i) : a(i)) || i);
  return n && i && Os(e, s, i), i;
};
let ne = null;
function Ms() {
  return ne || (ne = (async () => {
    if (!customElements.get("ha-selector"))
      try {
        await (await window.loadCardHelpers?.())?.createCardElement({ type: "entities", entities: [] })?.constructor.getConfigElement?.(), await customElements.whenDefined("ha-selector");
      } catch {
      }
  })()), ne;
}
const Rs = [
  { key: "summer", name: "Summer", default_mode: "cool" },
  { key: "winter", name: "Winter", default_mode: "heat_cool" }
];
let A = class extends R {
  constructor() {
    super(...arguments), this._ready = !1;
  }
  setConfig(t) {
    this._config = {
      type: t.type,
      prefix: t.prefix ?? "climate",
      zones: t.zones ?? [],
      seasons: t.seasons ?? Rs.map((e) => ({ ...e })),
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
    super.connectedCallback(), Ms().then(() => {
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
    return !this._ready || !customElements.get("ha-selector") ? l`<input
        .value=${typeof e == "string" ? e : ""}
        placeholder=${n ?? ""}
        @change=${(i) => s(i.target.value)}
      />` : l`<ha-selector
      .hass=${this.hass}
      .selector=${t}
      .value=${e}
      .label=${n}
      @value-changed=${(i) => s(i.detail.value)}
    ></ha-selector>`;
  }
  render() {
    const t = this._config;
    if (!t) return p;
    const e = t.zones ?? [], s = t.seasons ?? [];
    return l`
      <div class="ed">
        <h4>Zones (1-4)</h4>
        ${e.map(
      (n, i) => l`
            <div class="zone">
              <div class="zonehead">
                <span>Zone ${i + 1}</span>
                <button
                  class="link danger"
                  @click=${() => this._emit({ zones: e.filter((r, a) => a !== i) })}
                >
                  Remove
                </button>
              </div>
              ${this._selector(
        { entity: { domain: "climate" } },
        n.entity,
        (r) => this._setZone(i, { entity: String(r ?? "") }),
        "Thermostat"
      )}
              <input
                class="namefield"
                .value=${n.name ?? ""}
                placeholder="Display name"
                @change=${(r) => this._setZone(i, { name: r.target.value })}
              />
              ${this._selector(
        { entity: { domain: "sensor", device_class: "temperature", multiple: !0 } },
        n.room_sensors ?? [],
        (r) => this._setZone(i, { room_sensors: r ?? [] }),
        "Room sensors"
      )}
            </div>
          `
    )}
        ${e.length < 4 ? l`<button
              class="link"
              @click=${() => this._emit({ zones: [...e, { entity: "", name: `Zone ${e.length + 1}` }] })}
            >
              + Add zone
            </button>` : p}

        <h4>Seasons (1-4)</h4>
        ${s.map(
      (n, i) => l`
            <div class="seasonrow">
              <input
                .value=${n.name}
                @change=${(r) => {
        const a = r.target.value, o = s.map(
          (c, d) => d === i ? { ...c, name: a, key: a.toLowerCase().replace(/[^a-z0-9]+/g, "_") } : c
        );
        this._emit({ seasons: o });
      }}
              />
              <select
                .value=${n.default_mode}
                @change=${(r) => {
        const a = r.target.value;
        this._emit({
          seasons: s.map((o, c) => c === i ? { ...o, default_mode: a } : o)
        });
      }}
              >
                <option value="cool">Cool</option>
                <option value="heat">Heat</option>
                <option value="heat_cool">Heat+Cool</option>
              </select>
              <button
                class="link danger"
                @click=${() => this._emit({ seasons: s.filter((r, a) => a !== i) })}
              >
                Remove
              </button>
            </div>
          `
    )}
        ${s.length < 4 ? l`<button
              class="link"
              @click=${() => this._emit({
      seasons: [
        ...s,
        { key: `season_${s.length + 1}`, name: `Season ${s.length + 1}`, default_mode: "cool" }
      ]
    })}
            >
              + Add season
            </button>` : p}

        <h4>Season switching</h4>
        <select
          .value=${t.season_switch ?? "semi"}
          @change=${(n) => this._emit({ season_switch: n.target.value })}
        >
          <option value="manual">Manual</option>
          <option value="semi">Semi-auto (recommend + confirm)</option>
          <option value="full">Full-auto</option>
        </select>
        ${(t.season_switch ?? "semi") !== "manual" ? l`
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
              ${this._probe ? l`<p class=${this._probe.ok ? "ok" : "bad"}>${this._probe.text}</p>` : p}
            ` : p}

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
A.styles = je`
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
F([
  ue({ attribute: !1 })
], A.prototype, "hass", 2);
F([
  g()
], A.prototype, "_config", 2);
F([
  g()
], A.prototype, "_ready", 2);
F([
  g()
], A.prototype, "_probe", 2);
A = F([
  Ke("multizone-climate-scheduler-card-editor")
], A);
const Ps = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get MzcsCardEditor() {
    return A;
  }
}, Symbol.toStringTag, { value: "Module" }));
export {
  _ as MzcsCard
};

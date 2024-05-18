var w = Object.defineProperty;
var s = (e, t) => w(e, "name", { value: t, configurable: !0 });
import { jsx as N } from "react/jsx-runtime";
import { useRef as I, useState as f, useEffect as A } from "react";
function O(e) {
  return e;
}
s(O, "createMessage");
function T({
  iframeRef: e
}) {
  e?.current?.contentWindow?.postMessage(
    { type: "PARENT_ACKNOWLEDGED_IFRAME_READY" },
    "*"
  );
}
s(T, "sendParentReadyMessage");
function u({
  iframeRef: e,
  appearance: t = {}
}) {
  e?.current?.contentWindow?.postMessage(
    {
      type: "UPDATE_APPEARANCE",
      appearance: t
    },
    "*"
  );
}
s(u, "updateAppearance");
async function k({
  iframeRef: e
}) {
  const t = crypto.randomUUID();
  return new Promise((n) => {
    e && "current" in e && e?.current?.contentWindow?.postMessage(
      {
        type: "VALIDATE_FORM",
        requestId: t
      },
      "*"
    ), setTimeout(() => {
      window.removeEventListener("message", c), n(!1);
    }, 5e3);
    function c(o) {
      o.data.type === "VALIDATE_FORM" && o.data.requestId === t && n(o.data.isValid ?? !1);
    }
    s(c, "handleMessage"), window.addEventListener("message", c);
  });
}
s(k, "validateForm");
function P({
  iframeRef: e,
  token: t
}) {
  const { payment_intent_id: n } = b(t).payload;
  e?.current?.contentWindow?.postMessage(
    {
      type: "CONFIRM_PAYMENT_INTENT",
      token: t,
      id: n ?? void 0
    },
    "*"
  );
}
s(P, "confirmPaymentIntent");
function F({
  iframeRef: e,
  token: t
}) {
  const { setup_intent_id: n } = b(t).payload;
  e?.current?.contentWindow?.postMessage(
    {
      type: "CONFIRM_SETUP_INTENT",
      token: t,
      id: n ?? void 0
    },
    "*"
  );
}
s(F, "confirmSetupIntent");
function U({
  ref: e,
  renderToken: t,
  appearance: n,
  onPaymentIntentConfirmationSucceeded: c,
  onSetupIntentConfirmationSucceeded: o,
  onConfirmationFailed: E,
  additionalFields: i = {
    cardholderName: !1
  }
}) {
  const d = I(null), [g, h] = f(() => i?.cardholderName ? "292px" : "212px"), [_, a] = f(!1);
  return A(() => {
    function r(p) {
      switch (p.data.type) {
        case "IFRAME_READY":
          T({ iframeRef: d }), u({ iframeRef: d, appearance: n });
          break;
        case "UPDATE_HEIGHT":
          h(p.data.height);
          break;
        case "UPDATE_APPEARANCE":
          u({ iframeRef: d, appearance: p.data.appearance });
          break;
        case "UPDATED_APPEARANCE":
          a(!0);
          break;
        case "PAYMENT_INTENT_CONFIRMATION_SUCCEEDED":
          c?.(p.data.paymentIntent);
          break;
        case "SETUP_INTENT_CONFIRMATION_SUCCEEDED":
          o?.(p.data.setupIntent);
          break;
        case "CONFIRMATION_FAILED":
          E(p.data.errorMessage);
          break;
      }
    }
    return s(r, "handleMessage"), window.addEventListener("message", r), () => {
      window.removeEventListener("message", r);
    };
  }), A(() => {
    d.current && u({ iframeRef: d, appearance: n });
  }, [n]), /* @__PURE__ */ N(
    "iframe",
    {
      ref: /* @__PURE__ */ s((r) => {
        d.current = r, typeof e == "function" ? e(r) : e && (e.current = r);
      }, "ref"),
      title: "Secure credit card payment method form powered by Amos",
      name: "amos-credit-card-payment-method-form",
      role: "presentation",
      src: `${M(t)}/iframe/card?token=${t}&additionalFields=${Object.entries(
        i
      ).filter(([r, p]) => p).map(([r]) => r).join(",")}`,
      style: {
        width: "calc(100% + 8px)",
        transition: "opacity 150ms ease-in, height 200ms ease-in-out",
        margin: "0 -4px",
        height: g,
        opacity: _ ? 1 : 0
      },
      scrolling: "no"
    }
  );
}
s(U, "AmosCreditCardPaymentMethodForm");
function S({
  ref: e,
  renderToken: t,
  appearance: n,
  onPaymentIntentConfirmationSucceeded: c,
  onSetupIntentConfirmationSucceeded: o,
  onConfirmationFailed: E
}) {
  const i = I(null), [d, g] = f("400px"), [h, _] = f(!1);
  return A(() => {
    function a(r) {
      switch (r.data.type) {
        case "IFRAME_READY":
          T({ iframeRef: i }), u({ iframeRef: i, appearance: n });
          break;
        case "UPDATE_HEIGHT":
          g(r.data.height);
          break;
        case "UPDATE_APPEARANCE":
          u({ iframeRef: i, appearance: r.data.appearance });
          break;
        case "UPDATED_APPEARANCE":
          _(!0);
          break;
        case "PAYMENT_INTENT_CONFIRMATION_SUCCEEDED":
          c?.(r.data.paymentIntent);
          break;
        case "SETUP_INTENT_CONFIRMATION_SUCCEEDED":
          o?.(r.data.setupIntent);
          break;
        case "CONFIRMATION_FAILED":
          E(r.data.errorMessage);
          break;
      }
    }
    return s(a, "handleMessage"), window.addEventListener("message", a), () => {
      window.removeEventListener("message", a);
    };
  }), A(() => {
    i.current && u({ iframeRef: i, appearance: n });
  }, [n]), /* @__PURE__ */ N(
    "iframe",
    {
      ref: /* @__PURE__ */ s((a) => {
        i.current = a, typeof e == "function" ? e(a) : e && (e.current = a);
      }, "ref"),
      title: "Secure bank account payment method form powered by Amos",
      name: "amos-bank-account-payment-method-form",
      role: "presentation",
      src: `${M(t)}/iframe/bank?token=${t}`,
      style: {
        width: "calc(100% + 8px)",
        transition: "opacity 150ms ease-in, height 200ms ease-in-out",
        margin: "0 -4px",
        height: d,
        opacity: h ? 1 : 0
      },
      scrolling: "no"
    }
  );
}
s(S, "AmosBankAccountPaymentMethodForm");
function x({
  ref: e,
  renderToken: t,
  amount: n,
  merchantName: c,
  appearance: o,
  onInitiatePaymentIntentRequest: E,
  onPaymentIntentConfirmationSucceeded: i,
  onConfirmationFailed: d,
  ...g
}) {
  const [h, _] = f("40px"), a = I(null), [r, p] = f(!1);
  return A(() => {
    function l(m) {
      switch (m.data.type) {
        case "IFRAME_READY":
          T({ iframeRef: a }), u({ iframeRef: a, appearance: o });
          break;
        case "UPDATE_HEIGHT":
          _(m.data.height);
          break;
        case "UPDATE_APPEARANCE":
          u({ iframeRef: a, appearance: m.data.appearance });
          break;
        case "UPDATED_APPEARANCE":
          p(!0);
          break;
        case "CREATE_PAYMENT_INTENT":
          E({
            paymentIntentCreateAttributes: m.data.paymentIntentCreateAttributes,
            customerCreateAttributes: m.data.customerCreateAttributes
          }).then((y) => {
            P({
              iframeRef: a,
              token: y
            });
          }).catch((y) => {
            a.current?.contentWindow?.postMessage(
              {
                type: "CONFIRMATION_FAILED",
                errorMessage: y instanceof Error ? y.message : "Unknown error"
              },
              "*"
            );
          });
          break;
        case "PAYMENT_INTENT_CONFIRMATION_SUCCEEDED":
          i(m.data.paymentIntent);
          break;
        case "CONFIRMATION_FAILED":
          d(m.data.errorMessage);
          break;
      }
    }
    return s(l, "handleMessage"), window.addEventListener("message", l), () => {
      window.removeEventListener("message", l);
    };
  }), A(() => {
    a.current && a.current.contentWindow?.postMessage(
      {
        type: "UPDATE_AMOUNT",
        amount: n
      },
      "*"
    );
  }), A(() => {
    a.current && a.current.contentWindow?.postMessage(
      {
        type: "UPDATE_MERCHANT_NAME",
        merchantName: c
      }
    );
  }), A(() => {
    a.current && u({ iframeRef: a, appearance: o });
  }, [o]), /* @__PURE__ */ N(
    "iframe",
    {
      ref: /* @__PURE__ */ s((l) => {
        a.current = l, typeof e == "function" ? e(l) : e && (e.current = l);
      }, "ref"),
      title: "Secure Google Pay button powered by Amos",
      name: "amos-google-pay-button",
      role: "presentation",
      src: `${M(t)}/iframe/google-pay?token=${t}`,
      style: {
        width: "calc(100% + 8px)",
        transition: "opacity 150ms ease-in, height 200ms ease-in-out",
        margin: "0 -4px",
        height: h,
        opacity: r ? 1 : 0
      },
      allow: "payment",
      scrolling: "no",
      ...g
    }
  );
}
s(x, "AmosGooglePayButton");
function L({
  paymentData: e
}) {
  return {
    paymentMethod: {
      billing_address_attributes: {
        name: e.shippingAddress?.name,
        address_line1: e.shippingAddress?.address1,
        address_line2: e.shippingAddress?.address2,
        city: e.shippingAddress?.locality,
        state: e.shippingAddress?.administrativeArea,
        postal_code: e.shippingAddress?.postalCode,
        country: e.shippingAddress?.countryCode,
        email: e.email,
        phone: e.shippingAddress?.phoneNumber
      },
      card_profile_attributes: {
        wallet_provider: "googlepay",
        wallet_payload: e.paymentMethodData.tokenizationData.token,
        wallet_last4: e.paymentMethodData.info?.cardDetails,
        wallet_brand: (() => {
          switch (e.paymentMethodData.info?.cardNetwork) {
            case "AMEX":
              return "american_express";
            case "VISA":
              return "visa";
            case "MASTERCARD":
              return "master";
            case "DISCOVER":
              return "discover";
            default:
              return;
          }
        })()
      }
    }
  };
}
s(L, "formatGooglePayPaymentData");
function b(e) {
  const [t = "", n = "", c = ""] = e?.split(".") ?? [], o = typeof atob == "function" ? atob : (E) => Buffer.from(E, "base64").toString("utf8");
  return {
    header: JSON.parse(o(t)),
    payload: JSON.parse(o(n)),
    signature: c
  };
}
s(b, "decodeJwt");
function M(e) {
  const { env: t = "sandbox" } = b(e).payload;
  switch (t) {
    case "production":
      return "https://embed.amos.com";
    case "sandbox":
      return "https://embed-sandbox.amos.com";
    default:
      return "https://embed-sandbox.amos.com";
  }
}
s(M, "getEmbedOrigin");
export {
  S as AmosBankAccountPaymentMethodForm,
  U as AmosCreditCardPaymentMethodForm,
  x as AmosGooglePayButton,
  P as confirmPaymentIntent,
  F as confirmSetupIntent,
  O as createMessage,
  L as formatGooglePayPaymentData,
  k as validateForm
};

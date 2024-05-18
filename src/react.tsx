/// <reference types="googlepay" />

import type { components } from "@amos.com/node";
import { useEffect, useRef, useState } from "react";

export type Message =
  | {
      type: "IFRAME_READY";
    }
  | {
      type: "PARENT_ACKNOWLEDGED_IFRAME_READY";
    }
  | {
      type: "UPDATE_HEIGHT";
      height: string;
    }
  | {
      type: "UPDATE_AMOUNT";
      amount: string;
    }
  | {
      type: "UPDATE_MERCHANT_NAME";
      merchantName: string;
    }
  | {
      type: "UPDATE_APPEARANCE";
      appearance: {
        themeVariables?: Partial<
          Record<
            /*
             * Page body and base surface color.
             *
             * Default: oklch(1 0 0) (white)
             */
            | "--background"
            /*
             * Default text color applied to the body.
             *
             * Default: oklch(0.145 0 0) (near-black)
             */
            | "--foreground"
            /*
             * Default button fill and input text-selection highlight.
             *
             * Default: oklch(0.205 0 0)
             */
            | "--primary"
            /*
             * Text on primary-colored surfaces (buttons, selections).
             *
             * Default: oklch(0.985 0 0)
             */
            | "--primary-foreground"
            /*
             * Secondary button fill.
             *
             *  Default: oklch(0.97 0 0)
             */
            | "--secondary"
            /*
             * Text on secondary-colored surfaces.
             *
             * Default: oklch(0.205 0 0)
             */
            | "--secondary-foreground"
            /*
             * Placeholder text, helper labels, and muted icons.
             *
             * Default: oklch(0.556 0 0)
             */
            | "--muted-foreground"
            /*
             * Hover/focus highlight for interactive items (buttons, dropdown rows, skeleton pulse).
             *
             * Default: oklch(0.97 0 0)
             */
            | "--accent"
            /*
             * Text color on accent-highlighted items.
             *
             * Default: oklch(0.205 0 0)
             */
            | "--accent-foreground"
            /*
             * Error/invalid state borders and icons.
             *
             * Default: oklch(0.577 0.245 27.325)
             */
            | "--destructive"
            /*
             * General border color applied to all elements via the base layer.
             *
             * Default: oklch(0.922 0 0)
             */
            | "--border"
            /*
             * Input field border color.
             *
             * Default: oklch(0.922 0 0)
             */
            | "--input"
            /*
             * Focus ring and outline color for inputs and buttons.
             *
             * Default: oklch(0.708 0 0)
             */
            | "--ring"
            /*
             * Base border-radius; derived into --radius-sm/md/lg/xl.
             *
             * Default: 0.625rem
             */
            | "--radius",
            string
          >
        >;
      };
    }
  | {
      type: "VALIDATE_FORM";
      requestId: string;
      isValid?: boolean;
    }
  | {
      type: "CREATE_PAYMENT_INTENT";
      paymentIntentCreateAttributes: components["schemas"]["CreatePaymentIntentInput"];
      customerCreateAttributes: components["schemas"]["CreateCustomerInput"];
    }
  | ({
      type: "CONFIRM_PAYMENT_INTENT";
    } & Pick<components["schemas"]["PaymentIntent"], "id"> &
      Pick<components["schemas"]["EmbedToken"], "token">)
  | ({
      type: "CONFIRM_SETUP_INTENT";
    } & Pick<components["schemas"]["SetupIntent"], "id"> &
      Pick<components["schemas"]["EmbedToken"], "token">)
  | {
      type: "PAYMENT_INTENT_CONFIRMATION_SUCCEEDED";
      paymentIntent: components["schemas"]["PaymentIntent"];
    }
  | {
      type: "SETUP_INTENT_CONFIRMATION_SUCCEEDED";
      setupIntent: components["schemas"]["SetupIntent"];
    }
  | {
      type: "CONFIRMATION_FAILED";
      errorMessage: string;
    }
  | {
      type: "UPDATED_APPEARANCE";
    };

export function createMessage(message: Message) {
  return message;
}

function sendParentReadyMessage({
  iframeRef,
}: {
  iframeRef: React.RefObject<HTMLIFrameElement | null> | undefined;
}) {
  iframeRef?.current?.contentWindow?.postMessage(
    createMessage({ type: "PARENT_ACKNOWLEDGED_IFRAME_READY" }),
    "*",
  );
}

function updateAppearance({
  iframeRef,
  appearance = {},
}: {
  iframeRef: React.RefObject<HTMLIFrameElement | null> | undefined;
  appearance?: Extract<Message, { type: "UPDATE_APPEARANCE" }>["appearance"];
}) {
  iframeRef?.current?.contentWindow?.postMessage(
    createMessage({
      type: "UPDATE_APPEARANCE",
      appearance,
    }),
    "*",
  );
}

export async function validateForm({
  iframeRef,
}: {
  iframeRef: React.RefObject<HTMLIFrameElement | null> | undefined;
}): Promise<boolean> {
  const requestId = crypto.randomUUID();

  return new Promise((resolve) => {
    if (iframeRef && "current" in iframeRef) {
      iframeRef?.current?.contentWindow?.postMessage(
        createMessage({
          type: "VALIDATE_FORM",
          requestId,
        }),
        "*",
      );
    }

    setTimeout(() => {
      window.removeEventListener("message", handleMessage);
      resolve(false);
    }, 5000);

    function handleMessage(event: MessageEvent<Message>) {
      switch (event.data.type) {
        case "VALIDATE_FORM":
          if (event.data.requestId === requestId) {
            resolve(event.data.isValid ?? false);
          }

          break;
      }
    }

    window.addEventListener("message", handleMessage);
  });
}

export function confirmPaymentIntent({
  iframeRef,
  token,
}: {
  iframeRef: React.RefObject<HTMLIFrameElement | null> | undefined;
} & Pick<components["schemas"]["EmbedToken"], "token">) {
  const { payment_intent_id: id }: components["schemas"]["EmbedTokenJwt"] =
    decodeJwt(token).payload;
  iframeRef?.current?.contentWindow?.postMessage(
    createMessage({
      type: "CONFIRM_PAYMENT_INTENT",
      token,
      id: id ?? undefined,
    }),
    "*",
  );
}

export function confirmSetupIntent({
  iframeRef,
  token,
}: {
  iframeRef: React.RefObject<HTMLIFrameElement | null> | undefined;
} & Pick<components["schemas"]["EmbedToken"], "token">) {
  const { setup_intent_id: id }: components["schemas"]["EmbedTokenJwt"] =
    decodeJwt(token).payload;
  iframeRef?.current?.contentWindow?.postMessage(
    createMessage({
      type: "CONFIRM_SETUP_INTENT",
      token,
      id: id ?? undefined,
    }),
    "*",
  );
}

export function AmosCreditCardPaymentMethodForm({
  ref,
  renderToken,
  appearance,
  onPaymentIntentConfirmationSucceeded,
  onSetupIntentConfirmationSucceeded,
  onConfirmationFailed,
  additionalFields = {
    cardholderName: false,
  },
}: React.ComponentProps<"iframe"> & {
  /**
   * The Amos render token for the credit card payment method form.
   *
   * It is safe to pass this to the client.
   *
   * Create this on https://dashboard.amos.com.
   */
  renderToken: string;
  /**
   * Custom appearance to override appearance settings, including setting
   * theme variables. If these values change, the iframe will be updated
   * automatically.
   */
  appearance?: Extract<Message, { type: "UPDATE_APPEARANCE" }>["appearance"];
  /**
   * A function that will be called when payment intent confirmation succeeds.
   *
   * Your callback function will be called with the payment intent that was
   * created earlier, but only after confirmation succeeds.
   */
  onPaymentIntentConfirmationSucceeded?: (
    paymentIntent: components["schemas"]["PaymentIntent"],
  ) => void;
  /**
   * A function that will be called when setup intent confirmation succeeds.
   *
   * Your callback function will be called with the setup intent that was
   * created earlier, but only after confirmation succeeds.
   */
  onSetupIntentConfirmationSucceeded?: (
    setupIntent: components["schemas"]["SetupIntent"],
  ) => void;
  /**
   * A function that will be called when confirmation fails.
   *
   * This function will be called with the error message that was returned.
   */
  onConfirmationFailed: (errorMessage: string) => void;
  /**
   * The additional fields that are required to be filled out in the form
   * in addition to the card number, expiration date, CVV, country,
   * and postal code.
   *
   * @default { cardholderName: false }
   */
  additionalFields?: {
    cardholderName: boolean;
  };
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [height, setHeight] = useState<string>(() => {
    if (additionalFields?.cardholderName) {
      return "292px";
    }

    return "212px";
  });
  const [appearanceReady, setAppearanceReady] = useState(false);

  useEffect(() => {
    function handleMessage(event: MessageEvent<Message>) {
      switch (event.data.type) {
        case "IFRAME_READY":
          sendParentReadyMessage({ iframeRef });
          updateAppearance({ iframeRef, appearance });
          break;

        case "UPDATE_HEIGHT":
          setHeight(event.data.height);
          break;

        case "UPDATE_APPEARANCE":
          updateAppearance({ iframeRef, appearance: event.data.appearance });
          break;

        case "UPDATED_APPEARANCE":
          setAppearanceReady(true);
          break;

        case "PAYMENT_INTENT_CONFIRMATION_SUCCEEDED":
          onPaymentIntentConfirmationSucceeded?.(event.data.paymentIntent);
          break;

        case "SETUP_INTENT_CONFIRMATION_SUCCEEDED":
          onSetupIntentConfirmationSucceeded?.(event.data.setupIntent);
          break;

        case "CONFIRMATION_FAILED":
          onConfirmationFailed(event.data.errorMessage);
          break;
      }
    }

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  });

  useEffect(() => {
    if (iframeRef.current) {
      updateAppearance({ iframeRef, appearance });
    }
  }, [appearance]);

  return (
    <iframe
      ref={(node) => {
        iframeRef.current = node;

        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      title="Secure credit card payment method form powered by Amos"
      name="amos-credit-card-payment-method-form"
      role="presentation"
      src={`${getEmbedOrigin(renderToken)}/iframe/card?token=${renderToken}&additionalFields=${Object.entries(
        additionalFields,
      )
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(",")}`}
      style={{
        width: "calc(100% + 8px)",
        transition: "opacity 150ms ease-in, height 200ms ease-in-out",
        margin: "0 -4px",
        height,
        opacity: appearanceReady ? 1 : 0,
      }}
      scrolling="no"
    />
  );
}

export function AmosBankAccountPaymentMethodForm({
  ref,
  renderToken,
  appearance,
  onPaymentIntentConfirmationSucceeded,
  onSetupIntentConfirmationSucceeded,
  onConfirmationFailed,
}: React.ComponentProps<"iframe"> & {
  /**
   * The Amos render token for the bank account payment method form.
   *
   * It is safe to pass this to the client.
   *
   * Create this on https://dashboard.amos.com.
   */
  renderToken: string;
  /**
   * Custom appearance to override appearance settings, including setting
   * theme variables. If these values change, the iframe will be updated
   * automatically.
   */
  appearance?: Extract<Message, { type: "UPDATE_APPEARANCE" }>["appearance"];
  /**
   * A function that will be called when payment intent confirmation succeeds.
   *
   * Your callback function will be called with the payment intent that was
   * created earlier, but only after confirmation succeeds.
   */
  onPaymentIntentConfirmationSucceeded?: (
    paymentIntent: components["schemas"]["PaymentIntent"],
  ) => void;
  /**
   * A function that will be called when setup intent confirmation succeeds.
   *
   * Your callback function will be called with the setup intent that was
   * created earlier, but only after confirmation succeeds.
   */
  onSetupIntentConfirmationSucceeded?: (
    setupIntent: components["schemas"]["SetupIntent"],
  ) => void;
  /**
   * A function that will be called when confirmation fails.
   *
   * This function will be called with the error message that was returned.
   */
  onConfirmationFailed: (errorMessage: string) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [height, setHeight] = useState<string>("400px");
  const [appearanceReady, setAppearanceReady] = useState(false);

  useEffect(() => {
    function handleMessage(event: MessageEvent<Message>) {
      switch (event.data.type) {
        case "IFRAME_READY":
          sendParentReadyMessage({ iframeRef });
          updateAppearance({ iframeRef, appearance });
          break;

        case "UPDATE_HEIGHT":
          setHeight(event.data.height);
          break;

        case "UPDATE_APPEARANCE":
          updateAppearance({ iframeRef, appearance: event.data.appearance });
          break;

        case "UPDATED_APPEARANCE":
          setAppearanceReady(true);
          break;

        case "PAYMENT_INTENT_CONFIRMATION_SUCCEEDED":
          onPaymentIntentConfirmationSucceeded?.(event.data.paymentIntent);
          break;

        case "SETUP_INTENT_CONFIRMATION_SUCCEEDED":
          onSetupIntentConfirmationSucceeded?.(event.data.setupIntent);
          break;

        case "CONFIRMATION_FAILED":
          onConfirmationFailed(event.data.errorMessage);
          break;
      }
    }

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  });

  useEffect(() => {
    if (iframeRef.current) {
      updateAppearance({ iframeRef, appearance });
    }
  }, [appearance]);

  return (
    <iframe
      ref={(node) => {
        iframeRef.current = node;

        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      title="Secure bank account payment method form powered by Amos"
      name="amos-bank-account-payment-method-form"
      role="presentation"
      src={`${getEmbedOrigin(renderToken)}/iframe/bank?token=${renderToken}`}
      style={{
        width: "calc(100% + 8px)",
        transition: "opacity 150ms ease-in, height 200ms ease-in-out",
        margin: "0 -4px",
        height,
        opacity: appearanceReady ? 1 : 0,
      }}
      scrolling="no"
    />
  );
}

export function AmosGooglePayButton({
  ref,
  renderToken,
  amount,
  merchantName,
  appearance,
  onInitiatePaymentIntentRequest,
  onPaymentIntentConfirmationSucceeded,
  onConfirmationFailed,
  ...props
}: {
  /**
   * The Amos render token for the Google Pay button.
   *
   * It is safe to pass this to the client.
   *
   * Create this on https://dashboard.amos.com.
   */
  renderToken: string;
  /** The amount of the payment. */
  amount: string;
  /**
   * A user visible merchant name.
   *
   * This name may be shown to the user in Google Pay to describe who the user made a transaction with.
   */
  merchantName: string;
  /**
   * Custom appearance to override appearance settings, including setting
   * theme variables. If these values change, the iframe will be updated
   * automatically.
   */
  appearance?: Extract<Message, { type: "UPDATE_APPEARANCE" }>["appearance"];
  /**
   * A function that will be called when the user initiates a payment intent request.
   *
   * This function should return a promise that resolves with the token you receive after creating a payment intent.
   *
   * This function is called when the user clicks the Google Pay button.
   */
  onInitiatePaymentIntentRequest: ({
    paymentIntentCreateAttributes,
    customerCreateAttributes,
  }: {
    paymentIntentCreateAttributes: components["schemas"]["CreatePaymentIntentInput"];
    customerCreateAttributes: components["schemas"]["CreateCustomerInput"];
  }) => Promise<components["schemas"]["EmbedToken"]["token"]>;
  /**
   * A function that will be called when payment intent confirmation succeeds.
   *
   * Your callback function will be called with the payment intent that was
   * created earlier, but only after confirmation succeeds.
   */
  onPaymentIntentConfirmationSucceeded: (
    paymentIntent: components["schemas"]["PaymentIntent"],
  ) => void;
  /**
   * A function that will be called when confirmation fails.
   *
   * This function will be called with the error message that was returned.
   */
  onConfirmationFailed: (errorMessage: string) => void;
} & React.ComponentProps<"iframe">) {
  const [height, setHeight] = useState<string>("40px");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [appearanceReady, setAppearanceReady] = useState(false);

  useEffect(() => {
    function handleMessage(event: MessageEvent<Message>) {
      switch (event.data.type) {
        case "IFRAME_READY":
          sendParentReadyMessage({ iframeRef });
          updateAppearance({ iframeRef, appearance });
          break;

        case "UPDATE_HEIGHT":
          setHeight(event.data.height);
          break;

        case "UPDATE_APPEARANCE":
          updateAppearance({ iframeRef, appearance: event.data.appearance });
          break;

        case "UPDATED_APPEARANCE":
          setAppearanceReady(true);
          break;

        case "CREATE_PAYMENT_INTENT":
          onInitiatePaymentIntentRequest({
            paymentIntentCreateAttributes:
              event.data.paymentIntentCreateAttributes,
            customerCreateAttributes: event.data.customerCreateAttributes,
          })
            .then((token) => {
              confirmPaymentIntent({
                iframeRef,
                token,
              });
            })
            .catch((error) => {
              iframeRef.current?.contentWindow?.postMessage(
                createMessage({
                  type: "CONFIRMATION_FAILED",
                  errorMessage:
                    error instanceof Error ? error.message : "Unknown error",
                }),
                "*",
              );
            });
          break;

        case "PAYMENT_INTENT_CONFIRMATION_SUCCEEDED":
          onPaymentIntentConfirmationSucceeded(event.data.paymentIntent);
          break;

        case "CONFIRMATION_FAILED":
          onConfirmationFailed(event.data.errorMessage);
          break;
      }
    }

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  });

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        createMessage({
          type: "UPDATE_AMOUNT",
          amount,
        }),
        "*",
      );
    }
  });

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        createMessage({
          type: "UPDATE_MERCHANT_NAME",
          merchantName,
        }),
      );
    }
  });

  useEffect(() => {
    if (iframeRef.current) {
      updateAppearance({ iframeRef, appearance });
    }
  }, [appearance]);

  return (
    <iframe
      ref={(node) => {
        iframeRef.current = node;

        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      title="Secure Google Pay button powered by Amos"
      name="amos-google-pay-button"
      role="presentation"
      src={`${getEmbedOrigin(renderToken)}/iframe/google-pay?token=${renderToken}`}
      style={{
        width: "calc(100% + 8px)",
        transition: "opacity 150ms ease-in, height 200ms ease-in-out",
        margin: "0 -4px",
        height,
        opacity: appearanceReady ? 1 : 0,
      }}
      allow="payment"
      scrolling="no"
      {...props}
    />
  );
}

export function formatGooglePayPaymentData({
  paymentData,
}: {
  paymentData: google.payments.api.PaymentData;
}) {
  return {
    paymentMethod: {
      billing_address_attributes: {
        name: paymentData.shippingAddress?.name,
        address_line1: paymentData.shippingAddress?.address1,
        address_line2: paymentData.shippingAddress?.address2,
        city: paymentData.shippingAddress?.locality,
        state: paymentData.shippingAddress?.administrativeArea,
        postal_code: paymentData.shippingAddress?.postalCode,
        country: paymentData.shippingAddress?.countryCode,
        email: paymentData.email,
        phone: paymentData.shippingAddress?.phoneNumber,
      },
      card_profile_attributes: {
        wallet_provider: "googlepay",
        wallet_payload: paymentData.paymentMethodData.tokenizationData.token,
        wallet_last4: paymentData.paymentMethodData.info?.cardDetails,
        wallet_brand: (() => {
          switch (paymentData.paymentMethodData.info?.cardNetwork) {
            case "AMEX":
              return "american_express";
            case "VISA":
              return "visa";
            case "MASTERCARD":
              return "master";
            case "DISCOVER":
              return "discover";
            default:
              return undefined;
          }
        })(),
      },
    },
  };
}

function decodeJwt(token: string | undefined) {
  const [header = "", payload = "", signature = ""] = token?.split(".") ?? [];

  const decoder =
    typeof atob === "function"
      ? atob
      : (token: string) => Buffer.from(token, "base64").toString("utf8");

  return {
    header: JSON.parse(decoder(header)),
    payload: JSON.parse(decoder(payload)),
    signature,
  };
}

function getEmbedOrigin(renderToken: string) {
  const { env = "sandbox" }: components["schemas"]["RenderTokenJwt"] =
    decodeJwt(renderToken).payload;

  switch (env) {
    case "production":
      return "https://embed.amos.com";
    case "sandbox":
      return "https://embed-sandbox.amos.com";
    default:
      return "https://embed-sandbox.amos.com";
  }
}

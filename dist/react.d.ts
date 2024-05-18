import "@google-pay/button-react";
import { components } from '@amos.com/node';
export type Message = {
    type: "IFRAME_READY";
} | {
    type: "PARENT_ACKNOWLEDGED_IFRAME_READY";
} | {
    type: "UPDATE_HEIGHT";
    height: string;
} | {
    type: "UPDATE_AMOUNT";
    amount: string;
} | {
    type: "UPDATE_MERCHANT_NAME";
    merchantName: string;
} | {
    type: "UPDATE_APPEARANCE";
    appearance: {
        themeVariables?: Partial<Record<"--background" | "--foreground" | "--primary" | "--primary-foreground" | "--secondary" | "--secondary-foreground" | "--muted-foreground" | "--accent" | "--accent-foreground" | "--destructive" | "--border" | "--input" | "--ring" | "--radius", string>>;
    };
} | {
    type: "VALIDATE_FORM";
    requestId: string;
    isValid?: boolean;
} | {
    type: "CREATE_PAYMENT_INTENT";
    paymentIntentCreateAttributes: components["schemas"]["CreatePaymentIntentInput"];
    customerCreateAttributes: components["schemas"]["CreateCustomerInput"];
} | ({
    type: "CONFIRM_PAYMENT_INTENT";
} & Pick<components["schemas"]["PaymentIntent"], "id"> & Pick<components["schemas"]["EmbedToken"], "token">) | ({
    type: "CONFIRM_SETUP_INTENT";
} & Pick<components["schemas"]["SetupIntent"], "id"> & Pick<components["schemas"]["EmbedToken"], "token">) | {
    type: "PAYMENT_INTENT_CONFIRMATION_SUCCEEDED";
    paymentIntent: components["schemas"]["PaymentIntent"];
} | {
    type: "SETUP_INTENT_CONFIRMATION_SUCCEEDED";
    setupIntent: components["schemas"]["SetupIntent"];
} | {
    type: "CONFIRMATION_FAILED";
    errorMessage: string;
} | {
    type: "UPDATED_APPEARANCE";
};
export declare function createMessage(message: Message): Message;
export declare function validateForm({ iframeRef, }: {
    iframeRef: React.RefObject<HTMLIFrameElement | null> | undefined;
}): Promise<boolean>;
export declare function confirmPaymentIntent({ iframeRef, token, }: {
    iframeRef: React.RefObject<HTMLIFrameElement | null> | undefined;
} & Pick<components["schemas"]["EmbedToken"], "token">): void;
export declare function confirmSetupIntent({ iframeRef, token, }: {
    iframeRef: React.RefObject<HTMLIFrameElement | null> | undefined;
} & Pick<components["schemas"]["EmbedToken"], "token">): void;
export declare function AmosCreditCardPaymentMethodForm({ ref, renderToken, appearance, onPaymentIntentConfirmationSucceeded, onSetupIntentConfirmationSucceeded, onConfirmationFailed, additionalFields, }: React.ComponentProps<"iframe"> & {
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
    appearance?: Extract<Message, {
        type: "UPDATE_APPEARANCE";
    }>["appearance"];
    /**
     * A function that will be called when payment intent confirmation succeeds.
     *
     * Your callback function will be called with the payment intent that was
     * created earlier, but only after confirmation succeeds.
     */
    onPaymentIntentConfirmationSucceeded?: (paymentIntent: components["schemas"]["PaymentIntent"]) => void;
    /**
     * A function that will be called when setup intent confirmation succeeds.
     *
     * Your callback function will be called with the setup intent that was
     * created earlier, but only after confirmation succeeds.
     */
    onSetupIntentConfirmationSucceeded?: (setupIntent: components["schemas"]["SetupIntent"]) => void;
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
}): import("react/jsx-runtime").JSX.Element;
export declare function AmosBankAccountPaymentMethodForm({ ref, renderToken, appearance, onPaymentIntentConfirmationSucceeded, onSetupIntentConfirmationSucceeded, onConfirmationFailed, }: React.ComponentProps<"iframe"> & {
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
    appearance?: Extract<Message, {
        type: "UPDATE_APPEARANCE";
    }>["appearance"];
    /**
     * A function that will be called when payment intent confirmation succeeds.
     *
     * Your callback function will be called with the payment intent that was
     * created earlier, but only after confirmation succeeds.
     */
    onPaymentIntentConfirmationSucceeded?: (paymentIntent: components["schemas"]["PaymentIntent"]) => void;
    /**
     * A function that will be called when setup intent confirmation succeeds.
     *
     * Your callback function will be called with the setup intent that was
     * created earlier, but only after confirmation succeeds.
     */
    onSetupIntentConfirmationSucceeded?: (setupIntent: components["schemas"]["SetupIntent"]) => void;
    /**
     * A function that will be called when confirmation fails.
     *
     * This function will be called with the error message that was returned.
     */
    onConfirmationFailed: (errorMessage: string) => void;
}): import("react/jsx-runtime").JSX.Element;
export declare function AmosGooglePayButton({ ref, renderToken, amount, merchantName, appearance, onInitiatePaymentIntentRequest, onPaymentIntentConfirmationSucceeded, onConfirmationFailed, ...props }: {
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
    appearance?: Extract<Message, {
        type: "UPDATE_APPEARANCE";
    }>["appearance"];
    /**
     * A function that will be called when the user initiates a payment intent request.
     *
     * This function should return a promise that resolves with the token you receive after creating a payment intent.
     *
     * This function is called when the user clicks the Google Pay button.
     */
    onInitiatePaymentIntentRequest: ({ paymentIntentCreateAttributes, customerCreateAttributes, }: {
        paymentIntentCreateAttributes: components["schemas"]["CreatePaymentIntentInput"];
        customerCreateAttributes: components["schemas"]["CreateCustomerInput"];
    }) => Promise<components["schemas"]["EmbedToken"]["token"]>;
    /**
     * A function that will be called when payment intent confirmation succeeds.
     *
     * Your callback function will be called with the payment intent that was
     * created earlier, but only after confirmation succeeds.
     */
    onPaymentIntentConfirmationSucceeded: (paymentIntent: components["schemas"]["PaymentIntent"]) => void;
    /**
     * A function that will be called when confirmation fails.
     *
     * This function will be called with the error message that was returned.
     */
    onConfirmationFailed: (errorMessage: string) => void;
} & React.ComponentProps<"iframe">): import("react/jsx-runtime").JSX.Element;
export declare function formatGooglePayPaymentData({ paymentData, }: {
    paymentData: google.payments.api.PaymentData;
}): {
    paymentMethod: {
        billing_address_attributes: {
            name: string | undefined;
            address_line1: string | undefined;
            address_line2: string | undefined;
            city: string | undefined;
            state: string | undefined;
            postal_code: string | undefined;
            country: string | undefined;
            email: string | undefined;
            phone: string | undefined;
        };
        card_profile_attributes: {
            wallet_provider: string;
            wallet_payload: string;
            wallet_last4: string | undefined;
            wallet_brand: string | undefined;
        };
    };
};

declare module "@paystack/inline-js" {
  interface PaystackConfig {
    key: string;
    email: string;
    amount: number;
    currency: string;
    ref: string;
    metadata?: Record<string, any>;
    onSuccess: (response: any) => void;
    onCancel: () => void;
  }

  interface PaystackHandler {
    openIframe: () => void;
  }

  export default class PaystackPop {
    static setup(config: PaystackConfig): PaystackHandler;
  }
}

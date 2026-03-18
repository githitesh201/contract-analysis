import { loadStripe } from "@stripe/stripe-js";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey
  ? loadStripe(stripeKey)
  : Promise.resolve(null);

export default stripePromise;

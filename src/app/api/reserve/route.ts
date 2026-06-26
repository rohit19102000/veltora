import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: '2023-10-16' as any,
}) : null;

export async function POST(req: Request) {
  try {
    const { config, modelName, totalPrice } = await req.json();

    if (!modelName || !totalPrice) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const deposit = Math.round(totalPrice * 0.20 * 100); // 20% deposit in cents (e.g. CHF)

    if (!stripe) {
      // Mock mode: if Stripe secret key is not provided, return a mock client secret for local testing
      console.warn("Stripe key is missing. Running in mock reservation mode.");
      return NextResponse.json({
        clientSecret: 'mock_secret_' + Math.random().toString(36).substring(7),
        isMock: true,
        depositAmount: deposit / 100,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: deposit,
      currency: 'chf',
      metadata: { 
        modelName, 
        config: JSON.stringify(config) 
      },
      description: `VELTORA ${modelName} — 20% Reservation Deposit`,
    });

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      depositAmount: deposit / 100
    });
  } catch (error) {
    console.error('Error in Stripe PaymentIntent creation:', error);
    return NextResponse.json({ error: (error as Error).message || 'Internal Server Error' }, { status: 500 });
  }
}

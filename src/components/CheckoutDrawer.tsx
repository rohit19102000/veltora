'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/useStore';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { X, Lock, CheckCircle, CreditCard, Loader2 } from 'lucide-react';
import { audioController } from '@/lib/AudioController';

// Initialize Stripe (Mock key for demo fallback)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51MockKeyVeltoraPlaceholder');

function CheckoutForm({ clientSecret, depositAmount, isMock, onSuccess }: { 
  clientSecret: string; 
  depositAmount: number;
  isMock: boolean;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);
    audioController.playClick();

    if (isMock) {
      // Simulate mock API call
      setTimeout(() => {
        setProcessing(false);
        onSuccess();
      }, 2000);
      return;
    }

    if (!stripe || !elements) {
      setError('Stripe is not fully initialized.');
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card input element not found.');
      setProcessing(false);
      return;
    }

    const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name,
          email,
        },
      },
    });

    if (paymentError) {
      setError(paymentError.message || 'Payment failed.');
      setProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setProcessing(false);
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase text-veltora-steel mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-veltora-obsidian border border-veltora-gold/20 focus:border-veltora-gold-light rounded px-3 py-2 text-sm text-veltora-cream placeholder-veltora-steel/50 focus:outline-none"
            placeholder="Jean-Claude Biver"
          />
        </div>
        
        <div>
          <label className="block text-xs font-mono uppercase text-veltora-steel mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-veltora-obsidian border border-veltora-gold/20 focus:border-veltora-gold-light rounded px-3 py-2 text-sm text-veltora-cream placeholder-veltora-steel/50 focus:outline-none"
            placeholder="master@veltora.com"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-veltora-steel mb-2">Card Details</label>
          <div className="bg-veltora-obsidian border border-veltora-gold/25 rounded px-3 py-3">
            {isMock ? (
              <div className="flex items-center gap-3 text-sm text-veltora-steel">
                <CreditCard className="w-4 h-4 text-veltora-gold" />
                <span>Demo card enabled. Enter any test values below.</span>
              </div>
            ) : (
              <CardElement
                options={{
                  style: {
                    base: {
                      color: '#F5F0E8',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      '::placeholder': {
                        color: '#8A8E96',
                      },
                    },
                    invalid: {
                      color: '#ff6b6b',
                    },
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-xs border border-red-500/25 bg-red-950/20 px-3 py-2 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={processing}
        className="w-full bg-veltora-gold hover:bg-veltora-gold-light text-veltora-obsidian font-mono uppercase font-bold py-3 px-4 rounded transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing Deposit...</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            <span>Pay CHF {depositAmount.toLocaleString()} Deposit</span>
          </>
        )}
      </button>

      <div className="text-center">
        <span className="text-[10px] font-mono text-veltora-steel uppercase">
          Secured by Stripe · 256-Bit SSL Encryption
        </span>
      </div>
    </form>
  );
}

export default function CheckoutDrawer() {
  const isCartOpen = useStore((state) => state.isCartOpen);
  const setCartOpen = useStore((state) => state.setCartOpen);
  const activeModel = useStore((state) => state.activeModel);
  const totalPrice = useStore((state) => state.totalPrice);
  const caseFinish = useStore((state) => state.caseFinish);
  const dialColor = useStore((state) => state.dialColor);
  const indexStyle = useStore((state) => state.indexStyle);
  const strapType = useStore((state) => state.strapType);
  const initials = useStore((state) => state.initials);

  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState(0);
  const [isMock, setIsMock] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isCartOpen) {
      setSuccess(false);
      return;
    }

    const fetchPaymentIntent = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/reserve', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            modelName: activeModel,
            totalPrice,
            config: { caseFinish, dialColor, indexStyle, strapType, initials },
          }),
        });
        const data = await res.json();
        setClientSecret(data.clientSecret);
        setDepositAmount(data.depositAmount || (totalPrice * 0.20));
        setIsMock(data.isMock || false);
      } catch (error) {
        console.error('Failed to load Stripe reservation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [isCartOpen, activeModel, totalPrice, caseFinish, dialColor, indexStyle, strapType, initials]);

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] transition-opacity duration-300"
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-veltora-charcoal border-l border-veltora-gold/20 shadow-2xl z-[1000] transform transition-transform duration-500 ease-out flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-veltora-gold/15 p-6">
          <div>
            <h3 className="text-veltora-cream font-display text-lg uppercase tracking-widest">
              Secure Reservation
            </h3>
            <p className="text-[10px] text-veltora-steel font-mono uppercase mt-0.5">
              300 Hours Collection · Masterpiece Registry
            </p>
          </div>
          <button 
            onClick={() => {
              audioController.playClick();
              setCartOpen(false);
            }}
            className="text-veltora-steel hover:text-veltora-cream transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {success ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-veltora-gold animate-scale-up" />
              <h4 className="text-veltora-cream font-display text-xl uppercase tracking-wider">
                Reservation Confirmed
              </h4>
              <p className="text-veltora-steel text-sm max-w-sm">
                Your luxury timekeeper configuration has been reserved. A confirmation summary and master atelier build schedule have been sent.
              </p>
              <div className="bg-veltora-obsidian border border-veltora-gold/20 rounded p-4 text-left w-full space-y-2">
                <div className="flex justify-between text-xs font-mono uppercase">
                  <span className="text-veltora-steel">Model</span>
                  <span className="text-veltora-gold">{activeModel}</span>
                </div>
                <div className="flex justify-between text-xs font-mono uppercase">
                  <span className="text-veltora-steel">Registry ID</span>
                  <span className="text-veltora-cream">VL-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>
                <div className="flex justify-between text-xs font-mono uppercase">
                  <span className="text-veltora-steel">Est. Craft Time</span>
                  <span className="text-veltora-cream">300 Hours</span>
                </div>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="w-full border border-veltora-gold hover:bg-veltora-gold hover:text-veltora-obsidian text-veltora-gold font-mono uppercase font-bold py-2.5 rounded transition-all text-sm mt-4"
              >
                Close Registry
              </button>
            </div>
          ) : (
            <>
              {/* Order Summary */}
              <div className="bg-veltora-obsidian border border-veltora-gold/10 rounded-lg p-5 space-y-4">
                <h4 className="text-veltora-cream font-mono text-xs uppercase border-b border-veltora-gold/15 pb-2">
                  Timepiece Configuration
                </h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-veltora-steel">Model</span>
                    <span className="text-veltora-cream font-semibold">{activeModel}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-veltora-steel">Case Finish</span>
                    <span className="text-veltora-cream capitalize">{caseFinish.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-veltora-steel">Strap Material</span>
                    <span className="text-veltora-cream capitalize">{strapType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-veltora-steel">Indices Style</span>
                    <span className="text-veltora-cream capitalize">{indexStyle}</span>
                  </div>
                  {initials && (
                    <div className="flex justify-between text-sm">
                      <span className="text-veltora-steel">Engraved Initials</span>
                      <span className="text-veltora-gold font-mono tracking-widest">{initials}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-veltora-gold/15 pt-3 space-y-1.5">
                  <div className="flex justify-between text-sm text-veltora-steel">
                    <span>Base & Options</span>
                    <span>CHF {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-veltora-gold">
                    <span>20% Reservation Deposit</span>
                    <span>CHF {depositAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Form */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <Loader2 className="w-8 h-8 text-veltora-gold animate-spin" />
                  <span className="text-xs font-mono text-veltora-steel uppercase">
                    Securing Registry Connection...
                  </span>
                </div>
              ) : (
                clientSecret && (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm
                      clientSecret={clientSecret}
                      depositAmount={depositAmount}
                      isMock={isMock}
                      onSuccess={() => setSuccess(true)}
                    />
                  </Elements>
                )
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

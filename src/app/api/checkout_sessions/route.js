import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_123', {
  apiVersion: '2023-10-16',
});

// Mock prices mapping
const TIER_PRICES = {
  trendsetter: 'price_mock_trendsetter', // Replace with real Stripe Price ID
  creator_pro: 'price_mock_creator_pro' // Replace with real Stripe Price ID
};

export async function POST(request) {
  try {
    const { tier } = await request.json();

    if (!tier || !TIER_PRICES[tier]) {
      return NextResponse.json({ error: 'Tier inválido' }, { status: 400 });
    }

    // Base URL for redirects
    // Depending on the environment, we reconstruct it
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Para propositos del MVP/Prototipo, si no hay un key de Stripe real, hacemos un "mock" redirect
    // que simule un checkout completado.
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_mock_123') {
      console.log('Utilizando mock checkout porque no hay STRIPE_SECRET_KEY real.');
      // En un flujo mock, pasamos directamente de vuelta a un endpoint webhook con query param?
      // Mejor simplemente redirigir a una página de success "simulada" que actualice el tier
      // NOTA: En prod jamás actualizar basándose en URL. Esto es solo para MVP.
      return NextResponse.json({ url: `${origin}/api/mock-checkout?tier=${tier}&status=success` });
    }

    // Checkout Session real con Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: TIER_PRICES[tier],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/mi-radar?checkout=success`,
      cancel_url: `${origin}/premium?checkout=canceled`,
      // Puedes incluir el user_id para recogerlo en el webhook:
      // client_reference_id: user.id
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

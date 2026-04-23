import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { sendSubscriptionReceiptEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_123', {
  apiVersion: '2023-10-16',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;
  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } else {
      // Allow testing without webhook secret in early dev (NO HACER ESTO EN PRODUCCIÓN)
      event = JSON.parse(payload);
    }
  } catch (err) {
    console.error('Webhook error:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Manejar el evento
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Recover user ID attached in checkout session metadata
        const userId = session.client_reference_id;
        const customerId = session.customer;
        const customerEmail = session.customer_details?.email;
        
        // Asumiendo que tenemos mapeado el tier al precio
        // En un entorno real se buscaría el price_id de session.line_items para determinar el tier
        const updatedTier = 'trendsetter'; // Valor por defecto en escenario real extraer de la sesión
        
        if (userId) {
          const { error } = await supabase
            .from('user_profiles')
            .update({ 
               tier: updatedTier,
               stripe_customer_id: customerId 
            })
            .eq('id', userId);
            
          if (error) {
             console.error('Error actualizando perfil en DB:', error.message);
          } else {
            // Enviar recibo de suscripción por correo electrónico si se obtuvo el correo de Stripe
            if (customerEmail) {
                await sendSubscriptionReceiptEmail(customerEmail, updatedTier.toUpperCase());
            }
          }
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        // Revertir a plan free
        const { error } = await supabase
          .from('user_profiles')
          .update({ tier: 'free' })
          .eq('stripe_customer_id', customerId);
          
        if (error) console.error('Error revertiendo plan:', error.message);
        break;
      }
      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error interno manejando webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

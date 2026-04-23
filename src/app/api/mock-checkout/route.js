import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper if using standard Supabase client (solo funcionará si se pasa el cookie correctamente
// o usando admin auth). En el cliente es mejor actualizar con createRouteHandlerClient de @supabase/auth-helpers-nextjs
// pero ya que no está instalado en package.json, confiaremos en que el request incluye los cookies que supabase puede leer
// o simplemente usaremos una redirección a un cliente que lo actualice.

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tier = searchParams.get('tier');
  
  if (!tier) return NextResponse.json({ error: 'Missing tier' }, { status: 400 });

  // Como esto es un MOCK para MVP, construimos un HTML que usa el SDK de cliente `supabase-js` 
  // para poder leer la sesión y actualizar la base de datos sin requerir variables de entorno adicionales (`SERVICE_ROLE`).
  // Una vez actualizado, se redirige.
  const origin = request.headers.get('origin') || 'http://localhost:3000';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head><title>Processing Mock Payment</title></head>
      <body>
        <p>Procesando pago (Mock)... Redirigiendo a tu radar.</p>
        <script>
          // Simulamos una latencia de pago
          setTimeout(() => {
             // En MVP con localStorage auth de Supabase, la mejor forma de hacerlo es redirigiendo a la app
             // con un flag especial en la URL para que el Layout o Premium context actualicen la BD del cliente.
             window.location.href = '${origin}/mi-radar?upgrade_tier=${tier}';
          }, 1500);
        </script>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

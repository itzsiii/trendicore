import { Resend } from 'resend';

// Verifica si la llave existe. Si no, usamos un SDK falso para el entorno local.
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

const DEFAULT_FROM = 'Trendicore <noreply@trendicore.com>';

/**
 * Función para enviar recibo de la Suscripción Premium.
 * Llama a la API oficial de Resend o simula el envío si falta la variable de entorno.
 */
export async function sendSubscriptionReceiptEmail(toEmail, planName) {
  const subject = `¡Bienvenido a Trendicore ${planName}! 🚀`;
  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7C3AED;">Has evolucionado tu Radar</h2>
      <p>Hola,</p>
      <p>Confirmamos la activación de tu plan premium <strong>${planName}</strong>. Ahora tienes acceso total a inteligencia de mercado avanzada.</p>
      <p>Ingresa <a href="https://trendicore.com/mi-radar">aquí</a> para configurar tus nuevas alertas.</p>
      <br />
      <p>El equipo de Trendicore.</p>
    </div>
  `;

  if (!resend) {
    console.log(`[MOCK EMAIL] To: ${toEmail} | Subject: ${subject}`);
    return { success: true, mock: true };
  }

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: toEmail,
      subject: subject,
      html: htmlBody,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Resend API Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Función para enviar Alertas Semanales de Nuevas Tendencias descubiertas
 */
export async function sendTrendAlertEmail(toEmail, styleName, trendingProductsCount) {
  const subject = `🔥 ${trendingProductsCount} nuevas tendencias en ${styleName} hoy.`;
  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #F43F5E;">Tu Radar está vibrando</h2>
      <p>El algoritmo de Trendicore ha detectado picos inusuales de interés en productos de tu estilo <strong>${styleName}</strong>.</p>
      <p><a href="https://trendicore.com/mi-radar" style="background:#7C3AED;color:white;padding:10px 15px;text-decoration:none;border-radius:4px;">Revisar el Radar ahora</a></p>
    </div>
  `;

  if (!resend) {
    console.log(`[MOCK EMAIL] To: ${toEmail} | Subject: ${subject}`);
    return { success: true, mock: true };
  }

  try {
    const data = await resend.emails.send({
      from: DEFAULT_FROM,
      to: toEmail,
      subject: subject,
      html: htmlBody,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Resend API Error:', error);
    return { success: false, error: error.message };
  }
}

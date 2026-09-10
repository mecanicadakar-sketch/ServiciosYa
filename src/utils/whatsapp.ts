/**
 * WhatsApp helpers for ServiciosYa
 */

export function formatWhatsAppUrl(
  phone: string,
  professionalName: string,
  trade: string,
  customMessage?: string
): string {
  // Strip non-digits
  const cleanPhone = phone.replace(/\D/g, '');

  let defaultText = `¡Hola ${professionalName}! Te contacto desde la plataforma ServiciosYa porque necesito una consulta sobre tu servicio de ${trade}. ¿Tendrás disponibilidad para coordinar un presupuesto?`;

  if (customMessage && customMessage.trim()) {
    defaultText = `¡Hola ${professionalName}! Te contacto desde ServiciosYa sobre ${trade}. Mi consulta es: "${customMessage.trim()}". ¿Podrías darme un presupuesto estimado o decirme cuándo podrías pasar? Muchas gracias.`;
  }

  const encodedText = encodeURIComponent(defaultText);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function openWhatsAppDirect(
  phone: string,
  professionalName: string,
  trade: string,
  customMessage?: string,
  onTrack?: () => void
) {
  if (onTrack) onTrack();
  const url = formatWhatsAppUrl(phone, professionalName, trade, customMessage);
  window.open(url, '_blank', 'noopener,noreferrer');
}

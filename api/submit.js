module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, property, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const TO_EMAIL = process.env.TO_EMAIL || 'info@techtonicskyview.com';

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY environment variable is not defined.');
    return res.status(500).json({ error: 'El servicio de correo no está configurado.' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'SkyView Web <onboarding@resend.dev>',
        to: TO_EMAIL,
        subject: `Nueva Consulta de ${name} - SkyView`,
        html: `
          <h3>Nueva consulta desde el formulario web</h3>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Correo:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${phone || 'No especificado'}</p>
          <p><strong>Ubicación de propiedad:</strong> ${property || 'No especificada'}</p>
          <p><strong>Servicio solicitado:</strong> ${service || 'No especificado'}</p>
          <p><strong>Detalles del proyecto:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API Error:', data);
      return res.status(response.status).json({ error: data.message || 'Error al enviar el correo' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Submission Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

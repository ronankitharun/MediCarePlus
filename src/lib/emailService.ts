import emailjs from '@emailjs/browser';

interface EmailParams {
  patientName: string;
  patientPhone: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
}

export const sendAdminNotification = async (params: EmailParams) => {
  // @ts-ignore - Vite environment variables
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  // @ts-ignore
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  // @ts-ignore
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS environment variables are missing. Skipping email notification.');
    return;
  }

  try {
    const response = await emailjs.send(
      serviceId,
      templateId,
      {
        patient_name: params.patientName,
        patient_phone: params.patientPhone,
        doctor_name: params.doctorName,
        appointment_date: params.date,
        appointment_time: params.time,
        appointment_type: params.type,
      },
      publicKey
    );
    console.log('Email sent successfully:', response.status, response.text);
    return response;
  } catch (error) {
    console.error('Email failed to send:', error);
    throw error;
  }
};

require('dotenv').config();

const SMS_API_URL     = process.env.SMS_API_URL;
const SMS_API_TOKEN   = process.env.SMS_API_TOKEN ;
const OTP_TEMPLATE_ID = process.env.SMS_TEMPLATE_ID;

module.exports = {
  /**
   * Send SMS OTP to recipient mobile
   * @param {string} recipient - 10 digit mobile number
   * @param {string|number} otp - 4 digit OTP code
   */
  sendOtp: async (recipient, otp) => {
    const message = `Your OTP verification code is ${otp}.Validity of this OTP is 3 minutes.MSEGS`;

    console.log(`[SMS Service] Sending OTP ${otp} to ${recipient}...`);

    try {
      const url = new URL(SMS_API_URL);
      url.searchParams.append('template_id', OTP_TEMPLATE_ID);
      url.searchParams.append('message', message);
      url.searchParams.append('recipient', recipient);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SMS_API_TOKEN}`
        }
      });

      const data = await response.json().catch(() => ({}));
      console.log('[SMS Service] Gateway response:', response.status, data);
      return { success: response.ok, data };
    } catch (error) {
      console.error('[SMS Service] Failed to send SMS via gateway:', error.message);
      console.log(`[SMS Service Fallback] OTP for ${recipient} is ${otp}`);
      return { success: false, error: error.message, otp };
    }
  }
};

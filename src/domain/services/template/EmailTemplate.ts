const bookingFormGenerateTemplate = () => {
  return `
    It has been a pleasure interacting with you and we are delighted that you have chosen Design Cafe as your home interiors partner. <br/>

    Your booking form is generated with all the requirement, payment details and terms & condition of the engagement.<br/> 
    
    Please review and confirm your booking form by visiting your customer dashboard <a href=${process.env.customerDashboardUrl}> here </a>. <br/>

    Please login using your registered mobile no. You will recieve an auto generated OTP to help you login. 

  
  `;
};
const bookingFormAcceptTemplate = () => {
  return `
    Thank you for choosing us as your home interiors partner and accepting the booking form. Please find your signed booking form attached for future reference. <br/>

    You can also access your booking form anytime by visiting your customer dashboard <a href=${process.env.customerDashboardUrl}> here </a>. <br/>

    You are now just a step away to saying yes, to your dream home. 

 `;
};

const paymentRequestTemplate = (customer,clientId) => {
  return `Hi ${customer.firstname}
  <br><br>
  There's a new payment request for your project ${clientId}. Click on the link below to login to dashboard and process the payment.
  <br>
  ${process.env.customerDashboardUrl}
  <br><br>
  1. Once logged in, go to the Invoice & Payment section.
  <br>
  2. Select the payment request and click on continue.
  <br>
  3. Confirm Billing and shipping information.
  <br>
  4. Process the payment.
  <br><br>
  *Please ignore if the payment is already processed.
  `
}

const exportFile = {
  bookingFormGenerateTemplate,
  bookingFormAcceptTemplate,
  paymentRequestTemplate
};

export default exportFile;

$(document).ready(function () {
  const paymentDetails = JSON.parse(localStorage.getItem('paymentDetails'));

  if (!paymentDetails) {
    alert('Payment details not found.');
    window.location.href = '/payment.html';
    return;
  }

  $('#match-name').text(paymentDetails.matchName || 'N/A');
  $('#match-time').text(paymentDetails.matchTime || 'N/A');
  $('#match-venue').text(paymentDetails.matchVenue || 'N/A');
  $('#card-name').text(paymentDetails.cardName || 'N/A');
  $('#card-number').text('**** **** **** ' + paymentDetails.cardNumber.slice(-4));
  $('#confirmed-seats').html(paymentDetails.seats.map((seat) => `<li>${seat}</li>`).join(''));
  $('#total-price').text(paymentDetails.totalPrice || 0);

  $('#confirmPay').click(async function () {
    const transactionData = {
      seat: paymentDetails.seats.join(', '),
      price: `$${paymentDetails.totalPrice}`,
      cardcsv: paymentDetails.cardCSV,
      cardname: paymentDetails.cardName,
      cardnumber: paymentDetails.cardNumber,
      cardexpdate: paymentDetails.cardExpDate,
      matchid: paymentDetails.matchID,
      transactiondate: new Date().toISOString(),
      userid: paymentDetails.userID || 'guest',
      status: 'success',
    };

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        alert('Payment successful!');
        window.location.href = '/payresult.html';
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Error processing payment.');
    }
  });
});

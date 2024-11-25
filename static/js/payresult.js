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
  $('#user-name').text(paymentDetails.cardName || 'N/A');
  $('#confirmed-seats').html(paymentDetails.seats.map((seat) => `<li>${seat}</li>`).join(''));
  $('#total-price').text(paymentDetails.totalPrice || 0);
});

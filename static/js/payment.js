$(document).ready(function () {
  const matchId = '001';
  $.get(`/matches/event/${matchId}`, function (data) {
    $('#match-name').text(data.matchName || 'N/A');
    $('#match-time').text(new Date(data.date).toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' }) || 'N/A');
    $('#match-venue').text(data.venue || 'N/A');
  });

  const seats = JSON.parse(localStorage.getItem('confirmedSeats')) || [];
  const totalPrice = seats.reduce((sum, seat) => {
    return sum + (seat.startsWith('N') || seat.startsWith('S') ? 100 : 300);
  }, 0);

  $('#cost').text(totalPrice);
  $('#confirmed-seats').html(seats.map((seat) => `<li>${seat}</li>`).join(''));

  $('#confirmPayBtn').click(function () {
    if (!$('#confirmInfo').is(':checked')) {
      alert('Please confirm the information before proceeding.');
      return;
    }

    const paymentDetails = {
      matchId,
      seats,
      totalPrice,
      matchName: $('#match-name').text(),
      matchTime: $('#match-time').text(),
      matchVenue: $('#match-venue').text(),
      cardName: $('#nameOnCard').val(),
      cardNumber: $('#cardNumber').val(),
      expirationDate: $('#expirationDate').val(),
      cvv: $('#cvv').val(),
    };
    localStorage.setItem('paymentDetails', JSON.stringify(paymentDetails));

    window.location.href = '/payprepare.html';
  });
});

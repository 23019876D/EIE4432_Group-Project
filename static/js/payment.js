$(document).ready(function () {
  const matchid = '001';

  // Fetch match details
  $.get(`/matches/event/${matchid}`, function (data) {
    $('#match-name').text(data.matchName || 'N/A');
    $('#match-time').text(new Date(data.date).toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' }) || 'N/A');
    $('#match-venue').text(data.venue || 'N/A');
  });

  const seat = JSON.parse(localStorage.getItem('confirmedSeats')) || [];
  const price = localStorage.getItem('totalPrice');

  $('#price').text(price);
  $('#confirmed-seats').html(seat.map((seat) => `<li>${seat}</li>`).join(''));

  async function getUserId() {
    try {
      const response = await fetch('/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        return result.user.userid;
      } else {
        console.error('Failed to fetch user info:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }

  $('#confirmPayBtn').click(async function () {
    if (!$('#confirmInfo').is(':checked')) {
      alert('Please confirm the information before proceeding.');
      return;
    }
    const userid = await getUserId();
    if (!userid) {
      alert('Please Login.');
      window.location.href = '/login.html';
      return;
    }
    const paymentDetails = {
      matchid,
      seat,
      price,
      userid,
      cardname: $('#nameOnCard').val(),
      cardnumber: $('#cardNumber').val(),
      cardexpdate: $('#expirationDate').val(),
      cardcvv: $('#cvv').val(),
    };

    if (!validateCardDetails(paymentDetails)) {
      alert('Invalid card details. Please check your inputs.');
      return;
    }
    localStorage.setItem('paymentDetails', JSON.stringify(paymentDetails));
    try {
      const response = await fetch('/trans/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentDetails),
      });

      const result = await response.json();
      console.log('Response from Backend:', result);

      if (response.ok && result.status === 'success') {
        alert('Payment successful! Your transaction is pending.');
        window.location.href = '/payprepare.html';
      } else {
        alert(`Payment failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Error during payment submission:', error);
      alert('Network error. Please try again later.');
    }
  });
});

function validateCardDetails({ cardnumber, cardexpdate, cardcvv }) {
  const cardNumberRegex = /^\d{16}$/;
  const expirationDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  const cvvRegex = /^\d{3}$/;

  return cardNumberRegex.test(cardnumber) && expirationDateRegex.test(cardexpdate) && cvvRegex.test(cardcvv);
}

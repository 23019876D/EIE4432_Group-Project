$(document).ready(async function () {
  const paymentDetails = JSON.parse(localStorage.getItem('paymentDetails'));
  if (!paymentDetails) {
    alert('Payment details not found.');
    window.location.href = '/sales.html';
    return;
  }
  const { matchid, seat, price, userid } = paymentDetails;
  try {
    const response = await fetch(`/matches/event/${matchid}`);
    const matchData = await response.json();
    if (!response.ok) {
      alert('Failed to fetch match details. Redirecting to payment page.');
      window.location.href = '/payment.html';
      return;
    }
    $('#match-name').text(matchData.matchName || 'N/A');
    $('#match-time').text(new Date(matchData.date).toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' }) || 'N/A');
    $('#match-venue').text(matchData.venue || 'N/A');
    $('#price').text(paymentDetails.price);
    $('#confirmed-seats').html(seat.map((s) => `<li>${s}</li>`).join(''));
    $('#card-name').text(paymentDetails.cardname || 'N/A');
    $('#card-number').text(`${paymentDetails.cardnumber.slice(0, 4)}************` || 'N/A');
    $('#expiration-date').text(paymentDetails.cardexpdate || 'N/A');
    $('#cvv').text(paymentDetails.cardcvv || 'N/A');

    $('#confirmBtn').click(async function () {
      const updatedDetails = {
        matchid,
        seat,
        price,
        userid,
        status: 'success',
      };
      const result = await updateTransaction(updatedDetails);
      if (result) {
        alert('Payment confirmed successfully!');
        window.location.href = '/payresult.html';
      } else {
        alert('Failed to confirm payment. Please try again.');
      }
    });

    $('#cancelBtn').click(async function () {
      const updatedDetails = {
        matchid,
        seat,
        price,
        userid,
        status: 'cancelled',
      };

      const result = await updateTransaction(updatedDetails);
      if (result) {
        alert('Payment canceled.');
        window.location.href = '/sales.html';
      } else {
        alert('Failed to cancel payment. Please try again.');
      }
    });
  } catch (error) {
    console.error('Error:', error);
    alert('Network error. Please try again later.');
  }
});

async function updateTransaction(updatedDetails) {
  console.log('Updated Details:', updatedDetails); // Debugging
  try {
    const response = await fetch('/trans/confirm', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedDetails),
    });

    console.log('Response Status:', response.status); // Debugging

    // Check if the response is okay before parsing
    if (!response.ok) {
      console.error('Backend returned an error:', response.status, response.statusText);
      return false;
    }

    const result = await response.json();
    console.log('Response from Backend:', result); // Debugging

    return result.status === 'success';
  } catch (error) {
    console.error('Error updating transaction:', error); // Debugging
    return false;
  }
}

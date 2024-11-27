$(document).ready(async function () {
  // Retrieve payment details from localStorage
  const paymentDetails = JSON.parse(localStorage.getItem('paymentDetails'));

  if (!paymentDetails) {
    alert('No payment details found. Redirecting to sales page.');
    window.location.href = '/sales.html';
    return;
  }

  const { userid, matchid, seat } = paymentDetails;
  const status = 'success';
  console.log('Fetching transaction details...');
  try {
    const res = await fetch(`/matches/event/${matchid}`);
    const matchData = await res.json();
    if (!res.ok) {
      alert('Failed to fetch match details. Redirecting to payment page.');
      window.location.href = '/payment.html';
      return;
    }

    const response = await fetch('/trans/result', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userid, matchid, seat, status }),
    });

    console.log('Response Object:', response);
    const data = await response.json();
    console.log('Transaction Data:', data);

    if (response.ok && data.status === 'success') {
      console.log('Transaction Found:', data.transaction);
      displayTransactionDetails(matchData, data.transaction);
    } else {
      console.error('Failed to load transaction:', data.message || 'Unknown error');
      alert('Failed to load transaction details. Please try again.');
    }
  } catch (error) {
    console.error('Error fetching transaction:', error);
    alert('Failed to load transaction details. Please try again.');
  }
});

function displayTransactionDetails(matchData, transaction) {
  $('#match-name').text(matchData.matchName || 'N/A');
  $('#match-time').text(new Date(matchData.date).toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' }) || 'N/A');
  $('#match-venue').text(matchData.venue || 'N/A');
  $('#transaction-date').text(
    new Date(transaction.transactiondate).toLocaleString('en-HK', { timeZone: 'Asia/Hong_Kong' }) || 'N/A'
  );
  $('#total-price').text(transaction.price || 'N/A');
  $('#selected-seats').html(transaction.seat.map((seat) => `<li>${seat}</li>`).join(''));
  $('#status').text(transaction.status || 'N/A');
  $('#card-name').text(transaction.cardname || 'N/A');
  $('#card-number').text(transaction.cardnumber || 'N/A');
  $('#card-cvv').text(transaction.cardcvv || 'N/A');
  $('#card-expiration').text(transaction.cardexpdate || 'N/A');
  $('#ticket-pass').attr('src', transaction.ticketpass);
}

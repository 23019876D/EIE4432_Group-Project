$(document).ready(async function () {
  const isLoggedIn = await checkLoginStatus();
  if (!isLoggedIn) {
    alert('Please Login.');
    window.open('/login.html', '_self');
    return;
  }

  fetchTransactions();
});

async function checkLoginStatus() {
  try {
    const response = await fetch('/auth/me', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      return result.status === 'success';
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
}

function fetchTransactions() {
  $.get('/auth/transactions', function (data) {
    console.log('Fetched Transactions:', data);
    if (data.status === 'success') {
      if (data.transactions.length > 0) {
        displayTransactions(data.transactions);
      } else {
        $('#transaction-list').html(`
          <div class="text-center mt-5">
            <h3>You haven't made any transactions yet.</h3>
            <p>Purchase a ticket now and enjoy the game?</p>
            <a class="btn btn-primary" onclick="window.open('event.html', '_self')">Browse Events</a>
          </div>
        `);
      }
    } else {
      alert(data.message);
    }
  }).fail(function () {
    $('#transaction-list').html(`
      <div class="alert alert-danger d-flex w-100">
          Failed to fetch transaction data. Please try again later.
      </div>
    `);
  });
}

function displayTransactions(transactions) {
  $('#transaction-list').empty();

  transactions.forEach(function (transaction) {
    const maskedCardNumber = transaction.cardnumber
      ? `${transaction.cardnumber.slice(0, 4)}${'*'.repeat(transaction.cardnumber.length - 4)}`
      : 'N/A';
    const match = transaction.match;
    const qrCodeHTML =
      transaction.status === 'success'
        ? `<img src="${transaction.ticketpass}" alt="Ticket Pass" style="max-width: 150px; max-height: 150px;">`
        : '<p class="text-muted">No Ticket Available</p>';
    const transactionCard = `
      <div class="row">
      <div class="col-md-8">
      <div class="card mb-4">
      <div class="card-body">
        <h3 class="card-title"><strong>Transaction Information</strong></h3>
        <p class="card-text pt-3"><strong>Date: </strong>${new Date(transaction.transactiondate).toLocaleString()}</p>
        <p class="card-text pt-2"><strong>Purchased Seat: </strong>${transaction.seat}</p>
        <p class="card-text pt-2"><strong>Total Amount: </strong>${transaction.price} HKD</p>
        <p class="card-text pt-2"><strong>Payment Status: </strong>${transaction.status}</p>
        <p class="card-text pt-2"><strong>Card Number: </strong>${maskedCardNumber}</p>
      </div>
      <div class="card-body">
        <h3 class="card-title"><strong>Match Information</strong></h3>
        ${
          match
            ? `
            <p class="card-text pt-3"><strong>Match Name: </strong>${match.matchName}</p>
            <p class="card-text pt-3"><strong>Match Date: </strong>${new Date(match.date).toLocaleString()}</p>
            <p class="card-text pt-3"><strong>Venue: </strong>${match.venue}</p>
            <p class="card-text pt-3"><strong>Description: </strong><br>${match.description}</p>
          `
            : '<p class="card-text">No match details available.</p>'
        }
      </div>
    </div>
    </div>
    <div class="col-md-4 d-flex align-items-center justify-content-center">
        <div class="card-footer text-center">
            <h4><strong>Ticket Pass</strong></h4>
            ${qrCodeHTML}
        </div>
  </div>
</div>
    `;
    $('#transaction-list').append(transactionCard);
  });
}

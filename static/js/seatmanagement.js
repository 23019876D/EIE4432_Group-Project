let allMatches = [];

$(document).ready(async function () {
  const isLoggedIn = await checkLoginStatus();
  if (!isLoggedIn) {
    alert('Please Login.');
    window.open('/login.html', '_self');
    return;
  }

  fetchMatches();
  $('#search-bar').on('input', function () {
    const searchTerm = $(this).val().toLowerCase();
    if (searchTerm) {
      const filteredMatches = allMatches.filter((match) => match.matchName.toLowerCase().includes(searchTerm));
      displayMatches(filteredMatches);
    } else {
      displayMatches(allMatches);
    }
  });
});

function fetchMatches() {
  $.get('/matches/events', function (data) {
    // Filter only "BuyNow" status matches
    allMatches = data.filter((match) => match.status === 'BuyNow');
    displayMatches(allMatches);
  }).fail(function (error) {
    let errorMessage = `
        <div class="alert alert-danger d-flex w-100">
            Failed to fetch event data. Please try again later.
        </div>
        `;
    $('#match-list').html(errorMessage);
  });
}

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

function handleClick(matchId) {
  // Redirect to the seat management page for the selected match
  window.location.href = `admin_seat.html?matchId=${matchId}`;
}

function displayMatches(data) {
  const sortedData = data.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });
  $('#match-list').empty();
  data.forEach(function (match) {
    let matchCard = `
      <div class="col mb-4">
        <div class="card h-100" style="height:700px;">
          <img src="/${match.matchimage}" class="card-img-top img-fluid" alt="${match.matchName}" style="height: 520px; object-fit: cover;">
          <div class="card-body">
            <h3 class="card-title">${match.matchName}</h3>
            <p class="card-text"><strong>Status: </strong><span class="badge bg-success">${match.status}</span></p>
            <p class="card-text"><strong>Date: </strong>${new Date(match.date).toLocaleString()}</p>
            <p class="card-text"><strong>Venue: </strong>${match.venue}</p>
            <p class="card-text"><strong>Available Seats: </strong>${match.availableSeats}</p>
            <button class="btn btn-primary" onclick="handleClick('${match.matchId}')">Manage Seats</button>
          </div>
        </div>
      </div>
    `;
    $('#match-list').append(matchCard);
  });
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
  const confirmed = confirm('Confirm to logout?');

  if (confirmed) {
    try {
      const response = await fetch('/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('You have been logged out successfully.');
        window.open('/index.html', '_self');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      alert('An unknown error occurred during logout');
    }
  }
});

let allEvents = [];

$(document).ready(async function () {
  const isLoggedIn = await checkLoginStatus();
  if (!isLoggedIn) {
    alert('Please Login as an Admin.');
    window.open('/login.html', '_self');
    return;
  }

  fetchMatches();
  $('#search-bar').on('input', function () {
    const searchTerm = $(this).val().toLowerCase();
    if (searchTerm) {
      const filteredEvents = allEvents.filter((event) => event.matchName.toLowerCase().includes(searchTerm));
      displayEvents(filteredEvents);
    } else {
      displayEvents(allEvents);
    }
  });
});

function fetchMatches() {
  $.get('/matches/events', function (data) {
    allEvents = data;
    displayEvents(allEvents);
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
      return result.status === 'success' && result.user.role === 'admin';
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
}

function displayEvents(data) {
  const sortedData = data.sort((a, b) => {
    if (a.status === 'BuyNow' && b.status !== 'BuyNow') {
      return -1;
    }
    if (a.status !== 'BuyNow' && b.status === 'BuyNow') {
      return 1;
    }
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });
  $('#match-list').empty();
  data.forEach(function (match) {
    let badgeColor = match.status === 'BuyNow' ? 'bg-success' : 'bg-secondary';
    let matchCard = `
            <div class="col mb-4">
                <div class="card h-100" style="height:700px;">
                    <img src="/${match.matchimage}" class="card-img-top img-fluid" alt="${match.matchName}" style="height: 520px; object-fit: cover;">
                    <div class="card-body">
                        <h3 class="card-title">${match.matchName}</h3>
                        <p class="card-text"><strong>Status: </strong><span class="badge ${badgeColor}")">${match.status}</span></p>
                        <p class="card-text"><strong>Date: </strong>${new Date(match.date).toLocaleString()}</p>
                        <p class="card-text"><strong>Venue: </strong>${match.venue}</p>
                        <p class="card-text">${match.description}</p>
                    </div>
                </div>
            </div>
        `;
    $('#match-list').append(matchCard);
  });
}

function handleClick(status) {
  if (status === 'BuyNow') {
    window.location.href = 'sales.html';
  } else {
    alert('This match is currently not available for purchase.');
  }
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

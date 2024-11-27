$(document).ready(async function () {
  localStorage.removeItem('confirmedSeats');
  localStorage.removeItem('totalPrice');

  // Check if the user is logged in
  const isLoggedIn = await checkLoginStatus();
  if (!isLoggedIn) {
    alert('Please Login.');
    window.open('/login.html', '_self');
    return;
  }

  let seatsData = [];

  // Fetch seat data from the server
  await $.get('/seats?matchId=001', function (seats) {
    seatsData = seats;
    seats.forEach((seat) => {
      const seatElement = $(`#${seat.seat}`);
      // If the seat is booked, set the color to red
      if (seat.isBooked) {
        seatElement.addClass('booked').attr('fill', 'red').css('cursor', 'not-allowed');
      } else {
        // If the seat is not booked, make it transparent
        seatElement.removeClass('booked').attr('fill', 'transparent').css('cursor', 'pointer');
      }
    });
  });

  $('.seat').click(function () {
    const seatId = $(this).attr('id');
    const seatData = seatsData.find((seat) => seat.seat === seatId);

    // If the seat is not booked, show an alert
    if (!seatData.isBooked) {
      alert('Seat has not been booked.');
    } else {
      // If the seat is already booked, handle accordingly
      console.log(`Seat ${seatId} is already booked.`);

      // Redirect to changeseat.html with seatId and matchId
      window.location.href = `/changeseat.html?seatId=${seatId}&matchId=${seatData.matchId}`;
    }
  });

  // Check if the user is logged in
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
});

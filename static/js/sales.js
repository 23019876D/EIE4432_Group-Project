$(document).ready(async function () {
  localStorage.removeItem('confirmedSeats');
  localStorage.removeItem('totalPrice');

  const isLoggedIn = await checkLoginStatus();
  if (!isLoggedIn) {
    alert('Please Login.');
    window.open('/login.html', '_self');
    return;
  }

  let seatsData = [];

  await $.get('/seats?matchId=001', function (seats) {
    seatsData = seats;
    seats.forEach((seat) => {
      const seatElement = $(`#${seat.seat}`);
      if (seat.isBooked) {
        seatElement.addClass('booked').attr('fill', 'red').css('cursor', 'not-allowed');
      } else {
        seatElement.removeClass('booked').attr('fill', 'transparent').css('cursor', 'pointer');
      }
    });
  });

  let selectedSeat = null;
  let confirmedSeats = JSON.parse(localStorage.getItem('confirmedSeats')) || [];
  let totalPrice = 0;

  const calculatePriceFromDB = (seats) => {
    console.log('Selected seats:', seats);
    return seats.reduce((sum, seatId) => {
      const seatData = seatsData.find((seat) => seat.seat === seatId);
      const price = seatData ? Number(seatData.price) : 0;
      console.log(`Seat: ${seatId}, Price: ${price}`);
      return sum + price;
    }, 0);
  };

  $('#confirm-btn').click(function () {
    if (!selectedSeat) {
      $('#selected-seat').text('Please select a seat.').css('color', 'red');
      return;
    }

    $(`#${selectedSeat}`).attr('fill', 'green').addClass('confirmed');

    if (!confirmedSeats.includes(selectedSeat)) {
      confirmedSeats.push(selectedSeat);
    }

    totalPrice = calculatePriceFromDB(confirmedSeats);

    localStorage.setItem('confirmedSeats', JSON.stringify(confirmedSeats));
    localStorage.setItem('totalPrice', totalPrice);

    $('#selected-seat').text(`Seat ${selectedSeat} has been confirmed.`).css('color', 'blue');
    $('#total-price').text(`Total Price: $${totalPrice}`);

    selectedSeat = null;
  });

  confirmedSeats.forEach((seatId) => {
    $(`#${seatId}`).attr('fill', 'green').addClass('confirmed');
  });

  totalPrice = calculatePriceFromDB(confirmedSeats);
  $('#total-price').text(`Total Price: $${totalPrice}`);

  $('.seat').click(function () {
    const seatId = $(this).attr('id');

    if ($(this).hasClass('booked')) {
      return;
    }

    if (confirmedSeats.includes(seatId)) {
      selectedSeat = seatId;
      $('#selected-seat').text(`Selected Seat: ${seatId}`).show();
    } else if (selectedSeat === seatId) {
      $(`#${selectedSeat}`).attr('fill', 'transparent');
      selectedSeat = null;
      $('#selected-seat').text('No seat selected.').hide();
    } else {
      if (selectedSeat) {
        $(`#${selectedSeat}`).attr('fill', 'transparent');
      }
      selectedSeat = seatId;
      $('#selected-seat').text(`Selected Seat: ${seatId}`).show();
      $(this).attr('fill', 'green');
    }
  });

  $('#dismiss-btn').click(function () {
    if (selectedSeat) {
      $(`#${selectedSeat}`).attr('fill', 'transparent').removeClass('confirmed');
      confirmedSeats = confirmedSeats.filter((seat) => seat !== selectedSeat);
      totalPrice = calculatePriceFromDB(confirmedSeats);

      localStorage.setItem('confirmedSeats', JSON.stringify(confirmedSeats));
      localStorage.setItem('totalPrice', totalPrice);

      $('#total-price').text(`Total Price: $${totalPrice}`);
      selectedSeat = null;
      $('#selected-seat').text('No seat selected.').hide();
    }
  });
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

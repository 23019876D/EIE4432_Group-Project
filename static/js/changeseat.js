$(document).ready(async function () {
  // Get seatId and matchId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const seatId = urlParams.get('seatId');
  const matchId = urlParams.get('matchId');

  // Fetch seat data from the server
  try {
    await $.get(`/seats/${matchId}/${seatId}`, function (seat) {
      if (seat) {
        // Display seat information
        $('#Seat').text(seat.seat);
        $('#isBooked').text(seat.isBooked ? 'Yes' : 'No');
        $('#userID').text(seat.userId || 'N/A');
        $('#seatPrice').text(seat.price);

        // Pre-fill the form with current data
        $('#newPrice').val(seat.price);
        $('#newIsBooked').prop('checked', seat.isBooked);
      } else {
        alert('No seat data found.');
      }
    });
  } catch (error) {
    console.error('Error fetching seat data:', error);
    alert('Error fetching seat data');
  }

  // Update seat information when the admin clicks "Update Seat"
  $('#updateSeatBtn').click(async function () {
    const newPrice = $('#newPrice').val();
    const isBooked = $('#newIsBooked').prop('checked');
    const userId = isBooked ? seatId : null; // Remove userId if unbooked

    // Prepare the data to send to the server
    const updatedSeat = {
      seat: seatId, // Seat identifier
      matchId: matchId, // Match ID
      price: newPrice,
      isBooked: isBooked,
      userId: userId, // Remove userId if unbooked
    };

    try {
      // Send updated seat data to the server using PUT request
      const response = await $.ajax({
        url: `/seats/${matchId}/${seatId}`, // PUT endpoint for updating
        method: 'PUT', // Use PUT method for updating
        contentType: 'application/json',
        data: JSON.stringify(updatedSeat),
        success: function () {
          alert('Seat updated successfully');
          // Redirect back to admin_seat.html with the matchId in the URL
          window.location.href = `/admin_seat.html?matchId=${matchId}`;
        },
        error: function (error) {
          alert('Error updating seat: ' + error.responseText);
        },
      });
    } catch (error) {
      alert('Error updating seat: ' + error.responseText);
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('matchForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const startTimeInput = document.getElementById('date').value.trim();
    if (!startTimeInput) {
      alert('Please enter a valid date and time.');
      return;
    }

    const startTimeISO = new Date(startTimeInput).toISOString();
    console.log('ISO Date Sent to Backend:', startTimeISO);

    const formData = new FormData();
    formData.append('matchId', document.getElementById('matchId').value);
    formData.append('matchName', document.getElementById('matchName').value);
    formData.append('venue', document.getElementById('venue').value);
    formData.append('startTime', document.getElementById('date').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('status', document.getElementById('status').value);
    formData.append(
      'prices',
      JSON.stringify({
        north: parseFloat(document.getElementById('northPrice').value),
        south: parseFloat(document.getElementById('southPrice').value),
        east: parseFloat(document.getElementById('eastPrice').value),
        west: parseFloat(document.getElementById('westPrice').value),
      })
    );
    if (document.getElementById('matchpic').files[0]) {
      formData.append('matchpic', document.getElementById('matchpic').files[0]);
    }

    try {
      const response = await fetch('/matches/event', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        alert('Match details saved successfully.');
        window.open('/eventmanage.html', '_self');
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.error);
        alert('Error saving match details. Please try again later.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Network error. Please try again later.');
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
      return result.status === 'success' && result.user.role === 'admin';
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
}

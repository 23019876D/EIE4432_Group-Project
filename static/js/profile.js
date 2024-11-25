document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/auth/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    console.log();
    if (result.status === 'success') {
      console.log('Profile image path:', '/static/' + result.user.image);
      document.querySelector('.profile-image').src = result.user.image;
      document.getElementById('userid').textContent = result.user.userid;
      document.getElementById('nickname').textContent = result.user.nickname;
      document.getElementById('email').textContent = result.user.email;
      document.getElementById('gender').textContent = result.user.gender;
      document.getElementById('birthdate').textContent = result.user.birthdate;
      document.getElementById('role').textContent = result.user.role;

      console.log(`User data loaded: ${result.user.userid}`);
    } else {
      alert('Please Login.');
      window.open('/index.html', '_self');
    }
  } catch (error) {
    console.error('Error fetching profile data:', error);
    alert('Could not load profile data');
  }
});

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

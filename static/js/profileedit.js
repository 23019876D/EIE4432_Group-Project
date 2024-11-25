document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const nickname = document.getElementById('nickname').value;
    const email = document.getElementById('email').value;
    const currentPassword = document.getElementById('currentPassword').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const profilePic = document.getElementById('profilepic').files[0];

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('nickname', nickname);
      formData.append('email', email);
      formData.append('currentPassword', currentPassword);
      formData.append('password', password);
      if (profilePic) {
        formData.append('profilepic', profilePic);
      }

      const response = await fetch('/auth/profileedit', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const result = await response.json();
      if (response.ok && result.status === 'success') {
        alert('Profile updated successfully');
        window.open('/profile.html', '_self');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating the profile');
    }
  });
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

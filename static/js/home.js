async function Greeting() {
  console.log('Greeting function called');

  try {
    const response = await fetch('/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const result = await response.json();
    console.log('Fetch result:', result);

    if (result.status === 'success') {
      const username = result.user.userid;
      const role = result.user.role;

      const greetingElement = document.getElementById('greeting');
      if (greetingElement) {
        greetingElement.textContent = `Welcome back! ${username} (${role})`;
        console.log(`Greeting updated with: Welcome back! ${username} (${role})`);
      } else {
        console.error('Greeting element not found in DOM');
      }
    } else {
      alert('Please Login.');
      window.open('/index.html', '_self');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    alert('Could not load user data');
  }
}

window.onload = Greeting;

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

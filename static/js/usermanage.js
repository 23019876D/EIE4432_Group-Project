let allUsers = [];

$(document).ready(async function () {
  const isLoggedIn = await checkLoginStatus();
  if (!isLoggedIn) {
    alert('Please Login as an Admin.');
    window.open('/login.html', '_self');
    return;
  }

  fetchUsers();
  $('#search-bar').on('input', function () {
    const searchTerm = $(this).val().toLowerCase();
    if (searchTerm) {
      const filteredUsers = allUsers.filter((user) => user.userid.toLowerCase().includes(searchTerm));
      displayUsers(filteredUsers);
    } else {
      displayUsers(allUsers);
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

function fetchUsers() {
  $.get('/auth/admin/userdisplay', function (data) {
    console.log('Fetched user data:', data);

    if (data.status === 'success') {
      allUsers = data.users;
      displayUsers(allUsers);
    } else {
      alert(data.message);
    }
  }).fail(function () {
    $('#user-list').html(`
      <div class="alert alert-danger d-flex w-100">
          Failed to fetch user data. Please try again later.
      </div>
    `);
  });
}

function displayUsers(data) {
  $('#user-list').empty();

  data.forEach(function (user) {
    const userCard = `
      <div class="col mb-4">
        <div class="card h-100">
          <img src="/${user.profileimage}" class="card-img-top img-fluid" alt="${user.nickname}" style="height: 500px; object-fit: cover;">
          <div class="card-body">
            <h4 class="card-title">${user.userid}</h4>
            <br>
            <p class="card-text"><strong>Nickname: </strong>${user.nickname}</p>
            <p class="card-text"><strong>Email: </strong>${user.email}</p>
            <p class="card-text"><strong>Role: </strong>${user.role}</p>
            <p class="card-text"><strong>Gender: </strong>${user.gender}</p>
            <p class="card-text"><strong>Birthdate: </strong>${user.birthdate}</p>
          </div>
        </div>
      </div>
    `;
    $('#user-list').append(userCard);
  });
}

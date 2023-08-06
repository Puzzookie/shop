// Function to make POST requests to the server
async function postData(url, data) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error('An error occurred.');
    }

    return response.json();
  } catch (error) {
    throw new Error('Error: ' + error.message);
  }
}

async function isSignedIn()
{
  try {
    const result = await postData('/is-signed-in', {}); // Pass an empty object as data, as we don't need to send any data for logout
    return result;
  }
  catch(error)
  {
    throw new Error('Unable tell if signed in');
  }
}
async function checkout(itemsArray) {
  try {
    const response = await fetch('/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: itemsArray,
      }),
    });

    if (response.ok) {
      const { url } = await response.json();
      window.location = url;
    } else {
      const errorJson = await response.json();
      throw new Error(errorJson.message);
    }
  } catch (error) {
    throw new Error('Unable to continue to checkout');
  }
}

// Register a new user
async function registerUser(email, password) {
  try {
    const data = { email, password };
    const result = await postData('/register', data);
    return result;
  } catch (error) {
    throw new Error('Unable to register');
  }
}

// Log in an existing user
async function loginUser(email, password) {
  try {
    const data = { email, password };
    const result = await postData('/login', data);

    return result;
  } catch (error) {
    throw new Error('Unable to login');
  }
}

// Reset the password for a user
async function resetPassword(email) {
  try {
    const data = { email }; // Correctly formatted as { email: email } or { email }
    const result = await postData('/reset', data);
    return result;
  } catch (error) {
    throw new Error('Unable to reset password');
  }
}

async function setData(value) {
  try {
    const data = { value };
    const result = await postData('/set', data);
    return result;
  } catch (error) {
    throw new Error('Unable to set data');
  }
}

async function getData(key) {
  try {
    const response = await fetch(`/get?key=${key}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message);
    }

    return response.json();
  } catch (error) {
    throw new Error('Unable to get data');
  }
}

async function logoutUser() {
  try {
    const result = await postData('/logout', {}); // Pass an empty object as data, as we don't need to send any data for logout
    return result;
  } catch (error) {
    throw new Error('Unable to logout');
  }
}

async function getOrders()
{
  try {
    const result = await postData('/orders', {});
    return result;
  }
  catch (error) {
    throw new Error("Unable to get orders");
  }
}
async function deleteAccount() {
  try {
    const result = await postData('/delete-account', {}); // Pass an empty object as data, as we don't need to send any data for logout
    return result;
  } catch (error) {
    throw new Error('Unable to delete account');
  }
}


async function getProfile(uid) {
  try {
    const response = await fetch(`/getProfile?uid=${uid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorMessage = await response.json();
      throw new Error(errorMessage.message);
    }

    return response.json();
  } catch (error) {
    throw new Error('Unable to get data');
  }
}

async function setProfile(value) {
  try {
    const valueToSet = { customData: value };

    const result = await postData('/setProfile', valueToSet);
    return result;
  } catch (error) {
    throw new Error('Unable to set data');
  }
}
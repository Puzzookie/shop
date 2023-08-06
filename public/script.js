var popup = document.getElementById("popup");
popup.onclick = hidePopup;

var cart = document.getElementById("cart");
cart.onclick = function(event) {
  event.stopPropagation();
};


function hidePopup()
{
  popup.style.display = "none";
  document.body.classList.remove("no-scroll");
}

function showPopup()
{
  popup.style.display = "flex";
  getCart();
  document.body.classList.add("no-scroll");
}

function showLoadingIcon() {
  const loadingIconDiv = document.getElementById('loadingIcon');
  loadingIconDiv.style.display = 'flex'; // Change 'block' to 'inline' or other valid display values if needed.

  const dimOverlay = document.getElementById('dimOverlay');    
  dimOverlay.style.display = 'flex'; // Change 'block' to 'inline' or other valid display values if needed.
}

function hideLoadingIcon() {
  const loadingIconDiv = document.getElementById('loadingIcon');
  loadingIconDiv.style.display = 'none'; // Change 'block' to 'inline' or other valid display values if needed.

  const dimOverlay = document.getElementById('dimOverlay');    
  dimOverlay.style.display = 'none'; // Change 'block' to 'inline' or other valid display values if needed.
}

async function signInOrOut()
{
  if(document.getElementById("intro-signinorout").innerHTML === "Sign in")
  {
    console.log("Sign in");
    window.location.href = "/login.html";

  }
  else
  {
    logoutUser().then(result => {
      window.location.href = "/login.html";
    }).catch((error) => {
          
      console.error('Error:', error.message);
    });
  }
}

async function myProfile()
{

}

async function myOrders()
{
  getOrders().then((result) => {
    console.log(result);
  }).catch((error) => {
    console.log(error);
  });
}

async function showTabs() {

  showTabsAsync()
        .then((result) => {
          console.log(result);
          var popup = document.getElementById('tabsPopup');
          document.body.classList.add("no-scroll");
          document.getElementById("intro-name").innerHTML = result.name;
          document.getElementById("intro-email").innerHTML = result.email;

          if(result.message === "User not authenticated")
          {
            document.getElementById("intro-signinorout").innerHTML = "Sign in";
          }
          else
          {
            document.getElementById("intro-signinorout").innerHTML = "Sign out";
          }
          popup.style.left = '0'; // Slide the tab in from the left
        })
        .catch((error) => {
          
          //console.error('Error sending password reset email:', error.message);
        });
}

async function showTabsAsync() {
  try {
    const result = await postData('/showTabs', {}); // Pass an empty object as data, as we don't need to send any data for logout
    return result;
  } catch (error) {
    throw new Error('Unable to logout');
  }
}

function hideTabs() {
  var popup = document.getElementById('tabsPopup');
  document.body.classList.remove("no-scroll");
  popup.style.left = '-100%'; // Slide the tab off to the left

}


let initialTouchX = null;
let finalTouchX = null;

function onTouchStart(event) {
  initialTouchX = event.touches[0].clientX;
}

function onTouchMove(event) {
  finalTouchX = event.touches[0].clientX;
}

function onTouchEnd() {
  if (finalTouchX !== null) {
    const deltaX = initialTouchX - finalTouchX;
    if (deltaX > 50) {
      hideTabs(); // Swipe left to close the navbarPopup
    }
  }
  initialTouchX = null;
  finalTouchX = null;
}

// Add touch event listeners to the navbarPopup
const navbarPopup = document.getElementById('tabsPopup');
navbarPopup.addEventListener('touchstart', onTouchStart);
navbarPopup.addEventListener('touchmove', onTouchMove);
navbarPopup.addEventListener('touchend', onTouchEnd);

const maxQuantity = 10;

function addItemToCart(id, name, price, image) {
  var cartItems = getCartItems();

  var itemIndex = findItemIndex(id.toString(), cartItems);

  if (itemIndex !== -1) {
    if(cartItems[itemIndex].quantity >= maxQuantity)
    {
      alert("Unable to add item. Max quantity is " + maxQuantity + ".");
      return;
    }
    cartItems[itemIndex].quantity++;
  }
  else
  {
    cartItems.push({ id: id, name: name, quantity: 1, price: price, image: image });
  }

  saveCartItems(cartItems);
  
  getCart();

  cartItems = getCartItems();
  itemIndex = findItemIndex(id.toString(), cartItems);
  if (itemIndex !== -1) {
    alert(`${cartItems[itemIndex].name} added to the cart`);
  }
}

function getCart()
{
  var cartItemsHTML = document.getElementById("cart-items");
  cartItemsHTML.innerHTML = "";

  var totalCartPrice = 0;
  var totalCartQuantity = 0;

  var cartItems = getCartItems();

  cartItems.forEach(function (currentItem) {
    var currentItemHTML = `
      <div id="item-container" class="item-container">
        <div id="item-top" class="item-top">
          <img id="item-image" class="item-image" src="${currentItem.image}">
          <div id="item-name" class="item-name">${currentItem.name}</div>
          <div id="item-controls" class="item-controls">
            <button id="item-down" onclick="onDown('${currentItem.id}')" class="item-down">-</button>
            <span id="item-quantity" class="item-quantity">${currentItem.quantity}</span>
            <button id="item-up" onclick="onUp('${currentItem.id}')" class="item-up">+</button>
          </div>
        </div>
        <div id="item-bottom" class="item-bottom">
          <div id="item-total-price" class="item-total-price">${adjustedPrice(currentItem.price)} x ${currentItem.quantity} = ${adjustedPrice(currentItem.price * currentItem.quantity)}</div>
          <button id="remove-button" class="remove-button" onclick="onRemove('${currentItem.id}')">Remove</button>
        </div>
      </div>
    `;
  
    cartItemsHTML.innerHTML += currentItemHTML;

    totalCartPrice += currentItem.price * currentItem.quantity;
    totalCartQuantity += currentItem.quantity;
  });

  var totalPriceDiv = document.getElementById("total-price");
  totalPriceDiv.innerText = "Total Price: " + adjustedPrice(totalCartPrice) + "\n\n**Continue to checkout to calculate tax";

  var totalQuantityText = document.getElementById("cartText");
  totalQuantityText.innerHTML = totalCartQuantity;

  var checkoutButtonDiv = document.getElementById("checkoutButtonDiv");

  if(cartItems.length == 0)
  {
    totalPriceDiv.innerText = "Cart is empty";
    checkoutButtonDiv.style.display = "none";
  }
  else
  {
    checkoutButtonDiv.style.display = "block";


  }

  cartItems.forEach(function (currentItem) {
    
  });

  
}

function getSimpleCartItems()
{
  var cartItems = getCartItems();

  const simpleCartItems = cartItems.map(function(currentItem) {
    return {
      id: currentItem.id,
      quantity: currentItem.quantity,
    };
  });

  return simpleCartItems;
}

// Get the cart items from local storage
function getCartItems() {

  //console.log(getSimpleCartItems());
  return JSON.parse(localStorage.getItem("cartItems")) || [];
}

// Save the cart items to local storage
function saveCartItems(cartItems) {
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

// Find the index of the item with the given ID
function findItemIndex(itemId, cartItems) {
  return cartItems.findIndex(item => item.id.toString() === itemId.toString());
}

// Remove an item from the cart
function onRemove(itemId) {
  let cartItems = getCartItems();
  const itemIndex = findItemIndex(itemId, cartItems);

  if (itemIndex !== -1) {
    alert(`${cartItems[itemIndex].name} removed from cart`);
    cartItems.splice(itemIndex, 1);
    saveCartItems(cartItems);
    getCart();
  } else {
    alert("An error occurred. Item not found in cart.");
  }
}

// Increase the quantity of an item in the cart
function onUp(itemId) {
  let cartItems = getCartItems();
  const itemIndex = findItemIndex(itemId, cartItems);

  if (itemIndex !== -1) {
    if (cartItems[itemIndex].quantity < maxQuantity) {
      cartItems[itemIndex].quantity++;
      saveCartItems(cartItems);
      getCart();
    } else {
      alert("Max quantity is " + maxQuantity + ".");
    }
  } else {
    alert("An error occurred. Item not found in cart.");
  }
}

// Decrease the quantity of an item in the cart
function onDown(itemId) {
  let cartItems = getCartItems();
  const itemIndex = findItemIndex(itemId, cartItems);

  if (itemIndex !== -1) {
    if (cartItems[itemIndex].quantity > 1) {
      cartItems[itemIndex].quantity--;
      saveCartItems(cartItems);
      getCart();
    } else {
      alert("Minimum quantity is 1.");
    }
  } else {
    alert("An error occurred. Item not found in cart.");
  }
}


async function onCheckout()
{
  const rsult = await isSignedIn();
  if(rsult.message === "User authenticated")
  {
    showLoadingIcon();
    const result = await checkout(getSimpleCartItems());
  }
  else
  {
    //Prompt user to login or register
    window.location = "login.html";
  }
}

function adjustedPrice(priceInCents) {
  // Convert the priceInCents to an integer
  const cents = parseInt(priceInCents, 10);

  // Check if the conversion is successful and it's a valid number
  if (isNaN(cents)) {
    return "Invalid input. Please provide a valid number in cents.";
  }

  // Convert cents to a floating-point number representing dollars
  const dollars = cents / 100.0;

  // Format the dollar amount with two decimal places for cents
  const formattedPrice = dollars.toFixed(2);

  // Return the formatted dollar amount with the '$' sign
  return `$${formattedPrice}`;
}

window.addEventListener('pageshow', function (event) {
  if(event.persisted)
  {
    hideLoadingIcon();
  }
});

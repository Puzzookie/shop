async function loadProducts() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/Puzzookie/shop/main/products.json');
    const data = await response.json(); // Parse the entire JSON object, including the version and products

    // Access the products array from the JSON data
    const products = data.products;
    const version = data.version;

     // Create an array to store Image objects
     const imageObjects = [];

     // Create a promise for each image to preload
     const preloadPromises = products.map((product) => {
       return new Promise((resolve, reject) => {
         const image = new Image();
 
         // Add event listener to detect when the image is loaded
         image.addEventListener('load', () => {
           // Once the image is loaded, resolve the promise
           resolve();
         });
 
         // Add event listener to handle image load errors
         image.addEventListener('error', () => {
           // If there is an error loading the image, reject the promise
           reject();
         });
 
         image.src = product.image;
         imageObjects.push(image);
       });
     });
 
     // Wait for all the preload promises to resolve before updating the DOM
     await Promise.all(preloadPromises);

     
    const container = document.getElementById('container');
    container.innerHTML = products
    .map(
      (product) => `
        <div class="box" onclick="addItemToCart('${product.id}', '${product.name}', ${product.price}, '${product.image}')">
          <img src="${product.image}">
          <div class="box-content">
            <p class="name">${product.name}</p>
            <p class="price">${adjustedPrice(product.price)}</p>
          </div>
        </div>
      `
    )
    .join('');


    const storageVersion = localStorage.getItem("version")
    if(storageVersion != null)
    {
      if(version !== storageVersion)
      {
        localStorage.clear();
        localStorage.setItem("version", version);
      }
    }
    else
    {
      localStorage.setItem("version", version);
    }

    getCart();

  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Call the function to load products when the page is ready
document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  hideLoadingIcon();
});

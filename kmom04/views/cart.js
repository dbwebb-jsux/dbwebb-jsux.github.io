import products from "../models/products.js"

const cartContent = document.getElementById("cart-content")
const cart = document.getElementById("cart")
const closeCart = document.getElementById("close-cart")

if (cart) {
  cart.addEventListener("click", toggleCart)
}

if (closeCart) {
  closeCart.addEventListener("click", toggleCart)
}

function toggleCart() {
  cartContent.classList.toggle("active")

  if (cartContent.classList.contains("active")) {
    renderCartProducts()
  }
}

function instantiateCartButtons() {
  document.querySelectorAll(".add-to-cart").forEach(
    (elem) => elem.addEventListener("click", addToCart)
  )
}

function addToCart(event) {
  const productID = event.target.id
  let cart = JSON.parse(localStorage.getItem("cart") || "{}")

  if (cart[productID]) {
    cart[productID] = cart[productID] + 1
  } else {
    cart[productID] = 1
  }

  localStorage.setItem("cart", JSON.stringify(cart))
  
  if (cartContent.classList.contains("active")) {
    renderCartProducts()
  }
}

function removeFromCart(event) {
  const productID = event.target.id.replace("remove-", "")
  let cart = JSON.parse(localStorage.getItem("cart") || "{}")
  
  delete cart[productID]
  localStorage.setItem("cart", JSON.stringify(cart))
  
  renderCartProducts()
}

function increaseQuantity(event) {
  const productID = event.target.id.replace("increase-", "")
  let cart = JSON.parse(localStorage.getItem("cart") || "{}")
  
  cart[productID] = (cart[productID] || 1) + 1
  localStorage.setItem("cart", JSON.stringify(cart))
  
  renderCartProducts()
}

function decreaseQuantity(event) {
  const productID = event.target.id.replace("decrease-", "")
  let cart = JSON.parse(localStorage.getItem("cart") || "{}")
  
  if (cart[productID] > 1) {
    cart[productID] -= 1
  } else {
    delete cart[productID]
  }
  localStorage.setItem("cart", JSON.stringify(cart))
  
  renderCartProducts()
}

async function renderCartProducts() {
  const cart = JSON.parse(localStorage.getItem("cart") || "{}")
  const hasItems = Object.keys(cart).length > 0
  let cartHTML = ""

  if (hasItems) {
    const cartItems = []
    for (let product in cart) {
      const productInfo = await products.fetchProduct(product)
      cartItems.push(`<div class="cart-item">
    <img src="${productInfo.data.image_url}" alt="Album art ${productInfo.data.name}" />
    <div class="cart-item-info">
      <p>${productInfo.data.name}</p>
      <div class="quantity-controls">
        <button class="qty-btn decrease" id="decrease-${product}">−</button>
        <p>${cart[product]}</p>
        <button class="qty-btn increase" id="increase-${product}">+</button>
      </div>
    </div>
    <button class="remove-item" id="remove-${product}">×</button>
</div>`)
    }
    cartHTML = cartItems.join("\n")
  } else {
    cartHTML = "<p>No products in cart.</p>"
  }

  document.getElementById("cart-products").innerHTML = cartHTML
  
  document.querySelectorAll(".remove-item").forEach(btn => btn.addEventListener("click", removeFromCart))
  document.querySelectorAll(".qty-btn.increase").forEach(btn => btn.addEventListener("click", increaseQuantity))
  document.querySelectorAll(".qty-btn.decrease").forEach(btn => btn.addEventListener("click", decreaseQuantity))
  
  const existingButton = cartContent.querySelector("a[href='order.html']")
  if (existingButton) existingButton.remove()
  
  if (hasItems) {
    const checkoutButton = document.createElement("a")
    checkoutButton.href = "order.html"
    checkoutButton.className = "button"
    checkoutButton.textContent = "Checkout"
    cartContent.appendChild(checkoutButton)
  }
}

export { instantiateCartButtons }
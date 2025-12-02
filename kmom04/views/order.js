import auth from "../models/auth.js"
import products from "../models/products.js"

const stripe = Stripe('pk_test_51SQm4wL626KeakG07TkoOmFZOxD1rmmeWQb9pCO0dfEAuny10glrtIPS7cXD43ecMg5uS1ahzngx1zV4Md2F55dM00iLh6AzSO')

const orderForm = document.getElementById("order-form")
const checkoutDiv = document.getElementById("checkout")
const confirmationDiv = document.getElementById("order-confirmation")

orderForm.addEventListener("submit", handleSubmit)

async function handleSubmit(event) {
  event.preventDefault()

  const formData = new FormData(event.target)

  const currentOrderData = {
    name: formData.get("firstname"),
    email: formData.get("email"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    payment_id: '',
    api_key: auth.api_key,
  }

  
  localStorage.setItem("currentOrder", JSON.stringify(currentOrderData))

  console.log(currentOrderData)
  
  
  orderForm.style.display = 'none'
  
  await initializeCheckout()
}

async function initializeCheckout() {
  const fetchClientSecret = async () => {
    const data = {
      items: await buildItems(),
      return_url: location.href,
      api_key: auth.api_key,
    }

    const response = await fetch(`${auth.api_url}/stripe/create-checkout-session`, {
      body: JSON.stringify(data),
      headers: {
        'content-type': 'application/json'
      },
      method: "POST",
    })
    const { clientSecret } = await response.json()
    return clientSecret
  }

  const checkout = await stripe.initEmbeddedCheckout({
    fetchClientSecret,
  })

  checkout.mount('#checkout')
}

async function buildItems() {
  const cart = JSON.parse(localStorage.getItem("cart"))
  let items = []

  for (let product in cart) {
    const productData = await products.fetchProduct(product)
    const item = {
      price_data: {
        currency: 'sek',
        product_data: {
          name: productData.data.name
        },
        unit_amount: 10000,
      },
      quantity: cart[product]
    }

    items.push(item)
  }

  return items
}

async function displayOrderConfirmation() {
  checkoutDiv.style.display = 'none'
  orderForm.style.display = 'none'
  
  const currentOrderData = JSON.parse(localStorage.getItem("currentOrder"))
  const cart = JSON.parse(localStorage.getItem("cart"))
  let itemsHTML = ''
  let totalAmount = 0

  for (let product in cart) {
    const productData = await products.fetchProduct(product)
    const price = (productData.data.price || 100) * 100
    const itemTotal = price * cart[product]
    totalAmount += itemTotal
    
    itemsHTML += `
      <div class="confirmation-item">
        <p><strong>${productData.data.name}</strong></p>
        <p>Qty: ${cart[product]} x ${price} SEK</p>
        <p>Total: ${itemTotal} SEK</p>
      </div>
    `
  }

  const confirmationHTML = `
    <h2>Order Confirmation</h2>
    <div class="confirmation-content">
      <div class="confirmation-section">
        <h3>Customer Information</h3>
        <p><strong>Name:</strong> ${currentOrderData.name}</p>
        <p><strong>Email:</strong> ${currentOrderData.email}</p>
        <p><strong>Address:</strong> ${currentOrderData.address}</p>
        <p><strong>Phone:</strong> ${currentOrderData.phone}</p>
      </div>
      
      <div class="confirmation-section">
        <h3>Ordered Items</h3>
        ${itemsHTML}
      </div>
      
      <div class="confirmation-section">
        <h3>Total Amount</h3>
        <p><strong>${totalAmount} SEK</strong></p>
      </div>
    </div>
  `

  confirmationDiv.innerHTML = confirmationHTML
  confirmationDiv.style.display = 'block'
  
  
  localStorage.removeItem("cart")
}


document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const sessionId = urlParams.get('session_id')

  if (sessionId) {
    const response = await fetch(`${auth.api_url}/stripe/session-status?session_id=${sessionId}&api_key=${auth.api_key}`)
    const session = await response.json()

    if (session.status == 'complete') {
      await displayOrderConfirmation()
    }
  }
})
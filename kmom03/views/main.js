import auth from "../models/auth.js"
import { instantiateCartButtons } from "./cart.js"

function extractBandName(description) {
  if (!description) return "Unknown Artist"

  const cleanDesc = description.replace(/[*_]+/g, "")
  const match = cleanDesc.match(/(?:Band Name|Artist|Band|Group)\s*:?\s*(.*?)(?:\s*(?:###|---|\||\n)|$)/i)

  let name = (match && match[1].trim()) ? match[1].trim() : "Unknown Artist"
    
  return name.replace(/^Name:\s*/i, "")
}

async function renderAllProducts() {
  const response = await fetch(`${auth.api_url}/products?api_key=${auth.api_key}`)
  const result = await response.json()
  const productList = document.getElementById("product-list")

  const productArray = result.data.map((product) => {
    const bandName = extractBandName(product.description)
    return `<div class="product">
            <img src="${product.image_url}" alt="Album art ${product.name}" />
            <div class="product-text">
                <span class="product-name">${product.name}</span>
                <span class="product-by">by</span>
                <span class="product-artist">${bandName}</span>
            </div>
            <button class="add-to-cart" id="${product.id}"><span class="cart-plus">+</span>🛒</button>
        </div>`
  })

  productList.innerHTML = productArray.join("\n")
  instantiateCartButtons()
}

async function renderProductsByCategory() {
  const response = await fetch(`${auth.api_url}/products?api_key=${auth.api_key}`)
  const result = await response.json()
  const categoryList = document.getElementById("category-list")

  const groupedProducts = result.data.reduce((acc, product) => {
    const category = product.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(product)
    return acc
  }, {})

  categoryList.innerHTML = ""

  for (const category in groupedProducts) {
    const products = groupedProducts[category]
    const productsHtml = products.map(product => {
      const bandName = extractBandName(product.description)
      return `<div class="product">
                <img src="${product.image_url}" alt="Album art ${product.name}" />
                <div class="product-text">
                    <span class="product-name">${product.name}</span>
                    <span class="product-by">by</span>
                    <span class="product-artist">${bandName}</span>
                </div>
                <button class="add-to-cart" id="${product.id}"><span class="cart-plus">+</span>🛒</button>
            </div>`
    }).join('\n')

    const categoryRowHtml = `
            <section class="category-row">
                <h2 class="category-title">${category}</h2>
                <div class="products-container">
                    ${productsHtml}
                </div>
            </section>
        `
    categoryList.innerHTML += categoryRowHtml
  }
    
  instantiateCartButtons()
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('product-list')) {
    renderAllProducts()
  } 
  else if (document.getElementById('category-list')) {
    renderProductsByCategory()
  }
})
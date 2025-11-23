import auth from "../models/auth.js"
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js"

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
        </div>`
  })

  productList.innerHTML = productArray.join("\n")
}

async function renderCountryCategory() {
  const response = await fetch(`${auth.api_url}/products?api_key=${auth.api_key}`)
  const result = await response.json()
  const categoryList = document.getElementById("category-list")

  const products = result.data.filter(product => product.category.toLowerCase() === 'country')

  const productsHtml = products.map(product => {
    return `<div class="product" style="width: auto; height: auto;">
            <div style="width: 100%; aspect-ratio: 1/1; overflow: hidden;">
                <img src="${product.image_url}" alt="Album art ${product.name}" style="width: 100%; height: 100%; object-fit: cover; object-position: top;" />
            </div>
            <div class="product-text">
                ${marked.parse(product.description)}
            </div>
        </div>`
  }).join('\n')

  categoryList.innerHTML = `
        <section class="category-row">
            <h2 class="category-title">Country</h2>
            <div class="products-container" style="grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));">
                ${productsHtml}
            </div>
        </section>
    `
}



document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('product-list')) {
    renderAllProducts()
  } 
  else if (document.getElementById('category-list')) {
    renderCountryCategory()
  }
})
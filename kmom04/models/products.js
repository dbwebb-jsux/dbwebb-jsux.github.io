import auth from "./auth.js"

const products = {
  async fetchProduct(productId) {
    const response = await fetch(`${auth.api_url}/products/${productId}?api_key=${auth.api_key}`)
    return await response.json()
  }
}

export default products

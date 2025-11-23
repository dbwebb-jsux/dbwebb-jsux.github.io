import auth from "./auth.js"

const products = {
  async fetchProduct(productID) {
    const response = await fetch(`${auth.api_url}/products/${productID}?api_key=${auth.api_key}`)
    return await response.json()
  }
}

export default products

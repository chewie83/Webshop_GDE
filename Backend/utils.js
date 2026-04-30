function validateProduct(product) {
    if (!product.name || product.name.trim() === "") return false;
    if (!product.price || product.price <= 0) return false;
    return true;
}

module.exports = { validateProduct };
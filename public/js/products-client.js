const socket = io();

socket.on('productListUpdated', () => {
  if (window.location.pathname.startsWith('/products')) {
    window.location.reload();
  }
});

async function getOrCreateCartId() {
  const existingCart = localStorage.getItem('cartId');
  if (existingCart) return existingCart;
  const response = await fetch('/api/carts', { method: 'POST' });
  const result = await response.json();
  if (result.status === 'success') {
    localStorage.setItem('cartId', result.payload._id);
    return result.payload._id;
  }
  return null;
}

async function handleAddButtons() {
  const buttons = document.querySelectorAll('.add-to-cart');
  if (!buttons.length) return;
  const cartId = await getOrCreateCartId();
  buttons.forEach(button => {
    button.addEventListener('click', async () => {
      const productId = button.dataset.id;
      const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 1 })
      });
      if (response.ok) {
        button.textContent = 'Producto agregado';
        setTimeout(() => (button.textContent = 'Agregar al carrito'), 1200);
      }
    });
  });
}

window.addEventListener('DOMContentLoaded', handleAddButtons);

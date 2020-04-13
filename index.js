var cartBtn = document.querySelector('.cart-btn');
var closeCartBtn = document.querySelector('.close-cart');
var clearCartBtn = document.querySelector('.clear-cart');
var cartDOM = document.querySelector('.cart');
var cartOverlay = document.querySelector('.cart-overlay');
var cartItems = document.querySelector('.cart-items');
var productsDOM = document.querySelector('.products-center');
var cartContent = document.querySelector('.cart-content');
var cartTotal = document.querySelector('.cart-total');

let cart = [];

let myProduct = [];

class Product {
	async getProduct() {
		try {
			let result = await fetch('product.json');
			let data = await result.json();
			let products = data.items;
			products = products.map((item) => {
				const { id } = item.sys;
				const image = item.fields.image.fields.file.url;
				const { title, price } = item.fields;
				return { id, title, price, image };
			});
			return products;
		} catch (error) {
			console.log('error');
		}
	}
}

class UI {
	displayProducts(products) {
		let result = '';
		products.forEach((product) => {
			result =
				result +
				`<article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="Product" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to bag
                    </button>
                    <h3>${product.title}</h3>
                    <h4>&#x20B9; ${product.price}</h4>
                </div>
            </article>`;
		});
		productsDOM.innerHTML = result;
	}
	getBagButtons() {
		var buttons = [ ...document.querySelectorAll('.bag-btn') ];
		myProduct = buttons;
		buttons.forEach((button) => {
			let id = button.dataset.id;
			let inCart = cart.find((item) => item.id === id);
			if (inCart) {
				button.innerText = 'In Cart';
				button.disabled = true;
			}
			button.addEventListener('click', (event) => {
				event.target.innerText = 'In Cart';
				event.target.disabled = true;
				// get product from products
				let cartItemId = { ...Storage.getProductInCart(id), amount: 1 };
				// add product to the cart
				cart = [ ...cart, cartItemId ];
				// console.log(cart);
				// save cart in local storage
				Storage.saveCart(cart);
				// set cart values
				this.setCartValues(cart);
				// display cart items
				this.displayCart(cartItemId);
				// show the cart
			});
			// this.showCart();
		});
	}
	setCartValues(cart) {
		let tempTotal = 0;
		let itemTotal = 0;
		cart.map((item) => {
			tempTotal += item.price * item.amount;
			itemTotal += item.amount;
		});
		cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
		cartItems.innerText = itemTotal;
	}
	displayCart(item) {
		const div = document.createElement('div');
		div.classList.add('cart-item');
		div.innerHTML = ` 
                    <img src=${item.image} alt="">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>&#8377; ${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
										</div>`;
		cartContent.appendChild(div);
		// console.log(cartContent);
	}
	showCart() {
		cartOverlay.classList.add('transparentBcg');
		cartDOM.classList.add('showCart');
	}
	setupAPP() {
		cart = Storage.getCart();
		this.setCartValues(cart);
		this.populateCart(cart);
		cartBtn.addEventListener('click', this.showCart);
		closeCartBtn.addEventListener('click', this.hideBtn);
		// cartOverlay.addEventListener('click', this.hideBtn);
	}
	populateCart(cart) {
		cart.forEach((item) => this.displayCart(item));
	}
	hideBtn() {
		cartOverlay.classList.remove('transparentBcg');
		cartDOM.classList.remove('showCart');
	}
	clearCartButton() {
		clearCartBtn.addEventListener('click', () => {
			this.clearCart();
		});
		cartContent.addEventListener('click', (event) => {
			if (event.target.classList.contains('remove-item')) {
				let removeItems = event.target;
				let id = removeItems.dataset.id;
				cartContent.removeChild(removeItems.parentElement.parentElement);
				this.removeItem(id);
			} else if (event.target.classList.contains('fa-chevron-up')) {
				let addAmount = event.target;
				let id = addAmount.dataset.id;
				let tempItem = cart.find((item) => item.id === id);
				tempItem.amount += 1;
				Storage.saveCart(cart);
				this.setCartValues(cart);
				addAmount.nextElementSibling.innerText = tempItem.amount;
			} else if (event.target.classList.contains('fa-chevron-down')) {
				let reduceAmount = event.target;
				let id = reduceAmount.dataset.id;
				let tempAmount = cart.find((item) => item.id === id);
				tempAmount.amount -= 1;
				if (tempAmount.amount > 0) {
					Storage.saveCart(cart);
					this.setCartValues(cart);
					reduceAmount.previousElementSibling.innerText = tempAmount.amount;
				} else {
					cartContent.removeChild(reduceAmount.parentElement.parentElement);
					this.removeItem(id);
				}
			}
		});
	}
	clearCart() {
		let cartItemsId = cart.map((item) => item.id);
		cartItemsId.forEach((id) => this.removeItem(id));
		while (cartContent.children.length > 0) {
			cartContent.removeChild(cartContent.children[0]);
		}
		this.hideBtn();
	}
	removeItem(id) {
		cart = cart.filter((item) => item.id !== id);
		this.setCartValues(cart);
		Storage.saveCart(cart);
		let button = this.getpreviousBtn(id);
		button.disabled = false;
		button.innerHTML = `<i class="fas fa-shopping-cart"></i>
                        add to bag`;
	}
	getpreviousBtn(id) {
		return myProduct.find((button) => button.dataset.id === id);
	}
}

class Storage {
	static saveStorage(products) {
		localStorage.setItem('products', JSON.stringify(products));
	}

	static getProductInCart(id) {
		let product = JSON.parse(localStorage.getItem('products'));
		return product.find((product) => product.id === id);
	}

	static saveCart(cart) {
		localStorage.setItem('cart', JSON.stringify(cart));
	}

	static getCart(cart) {
		return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const ui = new UI();
	const product = new Product();
	ui.setupAPP();
	product
		.getProduct()
		.then((products) => {
			ui.displayProducts(products);
			Storage.saveStorage(products);
		})
		.then(() => {
			ui.getBagButtons();
			ui.clearCartButton();
		});
});

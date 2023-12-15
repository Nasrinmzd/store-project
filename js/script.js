let $ = document
const countCounter = $.querySelector('.cart__count')
const cartDOM = $.querySelector('.cart')
const modalBasket = $.querySelector('.modal_basket')
const closeModal = $.querySelector('.close_modal-span')
const productsContainer = $.querySelector('.products')
const removeAllProduct = $.querySelector('#remove_all_product')
const totalCost = $.querySelector('.total__cost')
const totalCounterLenght = $.querySelector('.total__counter')
const imageEmptyBasket = $.querySelector('.image_empty-basket')
const searchInput = $.getElementById('searchInput')
const categorizProducts = $.querySelector('#categoriz_products')
const sortProducts = $.querySelector('#sort_products')
const paginationContainer = $.querySelector('.pagenumbers')
const navbarCollapse = $.querySelector('.navbar-collapse')
const navbartoggler = $.querySelector('.navbar-toggler')
const modalAddBasket = $.querySelector('.modal__addBasket')
const basketProductsContainer = $.querySelector('.cart__items')
const cartItemsContent = $.querySelector('.cart__items-content')
const searchBarIcon = $.querySelector('.search_bar--icon')




let isLoading = false //Page loading status
let allProducts = []
let userBasket = []
let currentPage = 1 // current pagination page
let rowCount = 8 //Number of rows per page
let currentProducts = allProducts; // To hold the filtered products
let isCategorySelected = false; //category selected flag
let isSortSelected = false; //sort selected flag
let sizeWindow = window.innerWidth
let elemtop = productsContainer.getBoundingClientRect().top - (sizeWindow > 768 ? 200 : 0) // scroll for search results

// table for cart basket
let cartTable =
    `<table class="cart__table responsive">
<thead>
    <tr>
        <th>Image</th>
        <th>Title</th>
        <th>Quantity</th>
        <th>Price</th>
        <th>Remove</th>
    </tr>
</thead>

<tbody class="cart__items-products">

</tbody>
</table>`

// cart basket mobile

let cartMobileBasketContetnt = `<div class="cart__items-products"></div>`


//for slider
var swiper = new Swiper(".swiper", {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
});

// open modal basket
countCounter.addEventListener('click', function () {
    modalBasket.classList.add('active')
    cartDOM.classList.add('active')
})
// close modal basket, false for Avoid babbling 
document.addEventListener('click', (event) => {
    // If clicked outside the modal or on the close button
    if (event.target === modalBasket || event.target.classList.contains('close_modal-span')) {

        modalBasket.classList.remove('active')
        cartDOM.classList.remove('active')
    }
}, false)

// Initial load of data
async function getProducts() {

    // Show the loader
    isLoading = true
    //API request
    const response = await fetch('https://fakestoreapi.com/products')
    const products = await response.json()

    // Hide the loader
    isLoading = false

    if (isLoading) {
        $.getElementById('loading').style.display = 'block';
    } else {
        $.getElementById('loading').style.display = 'none';
    }

    allProducts = products
    currentProducts = products
    displayProductsPagination(allProducts, productsContainer, rowCount, currentPage)
    setupPagination(allProducts, paginationContainer, rowCount)
}

getProducts()

// Add the product to the DOM
function addProductsToDom(product, isAdded) {
    productsContainer.insertAdjacentHTML('beforeend',
        `<div class="card products_content" style="width: 18rem;">
        <img src="${product.image}" class="card-img-top products_img" alt="...">
        <p class="card-title product__name">${product.title}</p>
            <div class="card-body">
                <span class="card-text">${product.price}</span>
                <span class="card-text">تومان</span>
                <button href="#" class="btn btn-primary mt-3 ${isAdded ? "btn__remove_cart" : "btn_add_to_cart"}" onclick='checkUserBasket(${product.id}, event)'>${isAdded ? "حذف کردن از سبد خرید" : "افزودن به سبد خرید"}</button>
            </div>
        </div>`

    )
}

// Check the product in the shopping cart
function checkUserBasket(productId, event) {
    let mainProductBasket = userBasket.find(product => {
        return product.id === productId
    })

    // Checking the availability in the shopping cart

    if (!currentProducts.length) {
        currentProducts = allProducts
    }

    // Add or remove product with changing button content
    if (mainProductBasket) {
        event.target.textContent = 'افزودن به سبد خرید'
        removeProductFromBasket(productId)


    } else {
        event.target.textContent = 'حذف کردن از سبد خرید'
        addProductsToBasketArray(productId)
        displayProductsPagination(currentProducts, productsContainer, rowCount, currentPage)
        setupPagination(currentProducts, paginationContainer, rowCount)
    }


}
// Add product to cart
function addProductsToBasketArray(productId) {
    let mainProduct = allProducts.find(product => {
        return product.id === productId
    })
    userBasket.push(mainProduct)
    basketProductsGenerator(userBasket)
    calcuteTotalPrice(userBasket)
    saveLocalStorageBasket(userBasket)
    checkLengthBasket(userBasket)

// notification messages
    Toastify({
        text: "محصول به سبد خرید اضافه شد",
        className: "info_notification",
        duration: 3000,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",

        }
    }).showToast();

}

// Check the shopping cart to show the product table or image if the shopping cart is empty
function checkLengthBasket(userBasketArray) {
    if (userBasketArray.length > 0) {
        totalCounterLenght.innerHTML = userBasketArray.length
        basketProductsContainer.style.display = 'block'
        imageEmptyBasket.style.display = 'none'


    } else {
        totalCounterLenght.innerHTML = '0'
        imageEmptyBasket.style.display = 'block'
        basketProductsContainer.style.display = 'none'
    }
}

// Generate shopping cart content
function basketProductsGenerator(userBasketArray) {

    // Generate shopping cart for large screens
    if (sizeWindow >= 992) {
        cartItemsContent.innerHTML = cartTable
        const basketProductContainer = $.querySelector('.cart__items-products')
        userBasketArray.forEach(product => {
            basketProductContainer.insertAdjacentHTML('afterbegin',
                `<tr class="cart__item">
            <td>
              <img src="${product.image}">  
            </td>
            <td class="td-name">
              <p class="product__name-basket">${product.title}</p>
            </td>
            <td>
              <button class="btn btn_minus" onclick="decreaseCount(${product.id})">-</button>
              <span class="product__quantity">${product.count}</span>
              <button class="btn btn_plus" onclick="increaseCount(${product.id})">+</button>
            </td>
            <td>
              <span class="product__price-basket">${product.price}</span>
            </td>
            <td>
              <button class="btn btn__remove" onclick="removeProductFromBasket(${product.id})">&times;</button>
            </td>
          </tr>`
            )
        })
    
        // Generate shopping cart for small screens
    } else {
        cartItemsContent.innerHTML = cartMobileBasketContetnt
        const basketProductContainerMobile = $.querySelector('.cart__items-products')

        userBasketArray.forEach(product => {
            basketProductContainerMobile.insertAdjacentHTML('afterbegin', `
        <div class='cart__mobile'>
        <div class='cart__mobile-title'>
        <img src="${product.image}">  
        <p class="product__name-basket">${product.title}</p>
        </div>
        <div class='cart__mobile-price'>
          <div class='cart__mobile-btnCont'>
          <button class="btn btn_minus" onclick="decreaseCount(${product.id})">-</button>
          <span class="product__quantity">${product.count}</span>
          <button class="btn btn_plus" onclick="increaseCount(${product.id})">+</button>
          </div>
        <span class="product__price-basket">${product.price}</span>
        <button class="btn btn__remove" onclick="removeProductFromBasket(${product.id})">&times;</button>
        </div>
          </div>`
            )
        });

    }
}
// Store shopping cart in local store
function saveLocalStorageBasket(userBasket) {
    localStorage.setItem("Basket", JSON.stringify(userBasket))
}
function getLocalStorageItems() {
    let localStorageBasket = JSON.parse(localStorage.getItem("Basket"))

    if (localStorageBasket) {
        userBasket = localStorageBasket;
    } else {
        userBasket = [];
    }

    basketProductsGenerator(userBasket)
    calcuteTotalPrice(userBasket)
}

// Remove the product from the shopping cart
function removeProductFromBasket(productId) {
    userBasket = userBasket.filter(product => {
        return product.id !== productId
    })
    basketProductsGenerator(userBasket)
    calcuteTotalPrice(userBasket)
    saveLocalStorageBasket(userBasket)
    checkLengthBasket(userBasket)
    displayProductsPagination(currentProducts, productsContainer, rowCount, currentPage)
    setupPagination(currentProducts, paginationContainer, rowCount)

    
    Toastify({
        text: "محصول از سبد خرید حذف شد",
        className: "info_notification",
        duration: 3000,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "linear-gradient(to right, #ff6600, #ff3300)",
        }
    }).showToast();
}

// Remove all the products from the shopping cart
removeAllProduct.addEventListener('click', () => {
    userBasket = []
    basketProductsGenerator(userBasket)
    calcuteTotalPrice(userBasket)
    saveLocalStorageBasket(userBasket)
    checkLengthBasket(userBasket)
    displayProductsPagination(allProducts, productsContainer, rowCount, currentPage)
    setupPagination(allProducts, paginationContainer, rowCount)

    Toastify({
        text: "همه محصولات از سبد خرید حذف شدند",
        className: "info_notification",
        duration: 3000,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "linear-gradient(to right, #ff6600, #ff3300)",
        }
    }).showToast();
})

// Calculate the total price
function calcuteTotalPrice(userBasketArray) {
    // Loop over the cart array
    let totalPriceValue = userBasketArray.reduce((preValue, product) => {
        return preValue + (product.count * product.price)
    }, 0)

    totalCost.innerHTML = totalPriceValue
}

// Calculate the increase bottom
function increaseCount(productId) {

    let productFind = userBasket.find(product => {
        return product.id === productId
    })
    productFind.count++

    calcuteTotalPrice(userBasket)
    basketProductsGenerator(userBasket)

}
// Calculate the decrease bottom

function decreaseCount(productId) {
    let productFind = userBasket.find(product => {
        return product.id === productId
    })

    if (productFind.count > 1) {
        productFind.count--
        calcuteTotalPrice(userBasket)
        basketProductsGenerator(userBasket)
    }

}
window.addEventListener('load', getLocalStorageItems())


// search input

searchInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        searchProductsFunc(e)
    }
})

function searchProductsFunc() {
    let searchItem = searchInput.value.toLowerCase()

    let FilteredProducts = allProducts.filter(product => {
        return product.title.toLowerCase().includes(searchItem)
    })

    displayProductsPagination(FilteredProducts, productsContainer, rowCount, currentPage)
    setupPagination(FilteredProducts, paginationContainer, rowCount)
}

searchBarIcon.addEventListener('click', () =>{
    searchProductsFunc()
    window.scrollTo(0, elemtop)
})

// category product

async function productsCategorization(category) {
    const response = await fetch(`https://fakestoreapi.com/products/category/${category}`)
    return response.json()
}

// Filter by category
categorizProducts.addEventListener('change', async () => {
    const category = categorizProducts.value

    let products;
    
    if (category === 'all') {
        isCategorySelected = false;
        products = allProducts;
        // currentProducts = allProducts
    } else {
        isCategorySelected = true;
        products = await productsCategorization(category)
    }

    currentPage = 1;
    currentProducts = products;

    if (isCategorySelected || isSortSelected) {
        displayProductsPagination(currentProducts, productsContainer, rowCount, currentPage)
        setupPagination(currentProducts, paginationContainer, rowCount)
    }else{
        displayProductsPagination(allProducts, productsContainer, rowCount, currentPage)
        setupPagination(allProducts, paginationContainer, rowCount)
    }
    
})

// Filter by sort
sortProducts.addEventListener('change', () => {
    let sortValue = sortProducts.value

    let sortedProducts = [...currentProducts]; 

    
    if (sortValue === 'lowToHigh') {
        isSortSelected = true
        sortedProducts.sort((a, b) => a.price - b.price);

    } else if (sortValue === 'highToLow') {
        isSortSelected = true
        sortedProducts.sort((a, b) => b.price - a.price);

    } else if (sortValue === 'default') {
        isSortSelected = false
    }

    currentProducts = sortedProducts;


    if (isCategorySelected || isSortSelected) {
        displayProductsPagination(currentProducts, productsContainer, rowCount, currentPage)
        setupPagination(currentProducts, paginationContainer, rowCount)
    }else{
        displayProductsPagination(allProducts, productsContainer, rowCount, currentPage)
        setupPagination(allProducts, paginationContainer, rowCount)
    }

})

// Paginated display of products
function displayProductsPagination(allProductsArray, productsAllContainer, rowCount, currentPage) {
    productsAllContainer.innerHTML = ''

    // Calculate the index based on the page and number of rows
    let endIndex = rowCount * currentPage
    let startIndex = endIndex - rowCount


    // Cut the array and get the data of one page
    let paginatedProduct = allProductsArray.slice(startIndex, endIndex)

    // Loop over the products and add them to the DOM
    paginatedProduct.forEach(product => {
        const findedItem = userBasket.find((item) => item.id === product.id)
        product.count = 1

        // Check the length of the shopping cart
        if (findedItem) {
            addProductsToDom(product, true)
        } else {
            addProductsToDom(product, false)
        }

    })
    checkLengthBasket(userBasket)
}

// Set pagination
function setupPagination(allProductsArray, pagesContainer, rowCount) {
    pagesContainer.innerHTML = ""

    // Calculate the number of required pages
    let pageCount = Math.ceil(allProductsArray.length / rowCount)

    // Create buttons for each page
    for (let i = 1; i < pageCount + 1; i++) {
        let btn = paginationButtonGenerator(i, allProductsArray)
        pagesContainer.appendChild(btn)
    }
}

// Set pagination buttons
function paginationButtonGenerator(page, allProductsArray) {
    let button = $.createElement('button')
    button.innerHTML = page

    if (page === currentPage) {
        button.classList.add('active')
    }

    button.addEventListener('click', () => {
        currentPage = page
        displayProductsPagination(allProductsArray, productsContainer, rowCount, currentPage)

        let prePage = $.querySelector('button.active')
        prePage.classList.remove('active')
        button.classList.add('active')
    })

    return button
}

// basket for mobile
window.addEventListener('resize', () => {
    sizeWindow = window.innerWidth
    basketProductsGenerator(userBasket)

    elemtop = productsContainer.getBoundingClientRect().top

})


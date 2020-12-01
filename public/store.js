if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

function ready() {
  var removeCartItemButtons = document.getElementsByClassName("btn-danger");
  for (var i = 0; i < removeCartItemButtons.length; i++) {
    var button = removeCartItemButtons[i];
    button.addEventListener("click", removeCartItem);
  }

  var quantityInputs = document.getElementsByClassName("cart-quantity-input");
  for (var i = 0; i < quantityInputs.length; i++) {
    var input = quantityInputs[i];
    input.addEventListener("change", quantityChanged);
  }

  var addToCartButtons = document.getElementsByClassName("shop-item-button");
  for (var i = 0; i < addToCartButtons.length; i++) {
    var button = addToCartButtons[i];
    button.addEventListener("click", addToCartClicked);
  }

  // document
  //   .getElementsByClassName("btn-purchase")[0]
  //   .addEventListener("click", purchaseClicked);
}
var stripe = Stripe(
  "pk_test_51H5FV9JBifTxGalrc8uvyF5ezGQ5SbvLHYAR7FVj7xrMbRoFiby9zvt4wGY31ndkNi9yZSeau9OknxchDsaU4P8s00R4KEWV01"
);
// pk_live_51Hk9YqJj8jYmqw8kd9XjTIaGVZVFHHP2f2gKKvxpfTqTBpLcVQD38t2OeCpZNybZqGdVQhhRKyTLuVRt6C5kG5ae00FzhNnO1M
// var stripeHandler = StripeCheckout.configure({
//   key:
//     "pk_test_51Hk9YqJj8jYmqw8kSdBfxiCID9tBVT04D5bx4ZOxmKMdmbSdOdq2AIdipWpwKlunuqo3T6u31oCZVoNRdU0z4Oph00EgggO9cX",
//   locale: "en",
//   token: function (token) {
//     console.log("token ====>", token);
//     var items = [];
//     var cartItemContainer = document.getElementsByClassName("cart-items")[0];
//     var cartRows = cartItemContainer.getElementsByClassName("cart-row");
//     for (var i = 0; i < cartRows.length; i++) {
//       var cartRow = cartRows[i];
//       var quantityElement = cartRow.getElementsByClassName(
//         "cart-quantity-input"
//       )[0];
//       var quantity = quantityElement.value;
//       var id = cartRow.dataset.itemId;
//       items.push({
//         id: id,
//         quantity: quantity,
//       });
//     }

//     fetch("/purchase", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "application/json",
//       },
//       body: JSON.stringify({
//         stripeTokenId: token.id,
//         items: items,
//       }),
//     })
//       .then(function (response) {
//         console.log("response ====>", response);
//         return response.json();
//       })
//       .then(function (session) {
//         console.log("session ====>", session);
//         return stripe.redirectToCheckout({ sessionId: session.id });
//       })
//       .then(function (result) {
//         console.log("result ====>", result);
//         // If `redirectToCheckout` fails due to a browser or network
//         // error, you should display the localized error message to your
//         // customer using `error.message`.
//         if (result.error) {
//           alert(result.error.message);
//         }
//       })
//       .catch(function (error) {
//         console.error("Error:", error);
//       });
//   },
// });

// function purchaseClicked() {
//   var priceElement = document.getElementsByClassName("cart-total-price")[0];
//   var price = parseFloat(priceElement.innerText.replace("€", "")) * 100;
//   stripeHandler.open({
//     amount: price,
//   });
// }

function removeCartItem(event) {
  var buttonClicked = event.target;
  buttonClicked.parentElement.parentElement.remove();
  updateCartTotal();
}

function quantityChanged(event) {
  var input = event.target;
  if (isNaN(input.value) || input.value <= 0) {
    input.value = 1;
  }
  updateCartTotal();
}

function addToCartClicked(event) {
  var button = event.target;
  var shopItem = button.parentElement.parentElement;
  var title = shopItem.getElementsByClassName("shop-item-title")[0].innerText;
  var price = shopItem.getElementsByClassName("shop-item-price")[0].innerText;
  var imageSrc = shopItem.getElementsByClassName("shop-item-image")[0].src;
  var id = shopItem.dataset.itemId;
  addItemToCart(title, price, imageSrc, id);
  updateCartTotal();
}

function addItemToCart(title, price, imageSrc, id) {
  var cartRow = document.createElement("div");
  cartRow.classList.add("cart-row");
  cartRow.dataset.itemId = id;
  var cartItems = document.getElementsByClassName("cart-items")[0];
  var cartItemNames = cartItems.getElementsByClassName("cart-item-title");
  for (var i = 0; i < cartItemNames.length; i++) {
    if (cartItemNames[i].innerText == title) {
      alert("This item is already added to the cart");
      return;
    }
  }
  var cartRowContents = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="cart-price cart-column">${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="1">
            <button class="btn btn-danger" type="button">REMOVE</button>
        </div>`;
  cartRow.innerHTML = cartRowContents;
  cartItems.append(cartRow);
  cartRow
    .getElementsByClassName("btn-danger")[0]
    .addEventListener("click", removeCartItem);
  cartRow
    .getElementsByClassName("cart-quantity-input")[0]
    .addEventListener("change", quantityChanged);
}

function updateCartTotal() {
  var cartItemContainer = document.getElementsByClassName("cart-items")[0];
  var cartRows = cartItemContainer.getElementsByClassName("cart-row");
  var total = 0;
  for (var i = 0; i < cartRows.length; i++) {
    var cartRow = cartRows[i];
    var priceElement = cartRow.getElementsByClassName("cart-price")[0];
    var quantityElement = cartRow.getElementsByClassName(
      "cart-quantity-input"
    )[0];
    var price = parseFloat(priceElement.innerText.replace("€", ""));
    var quantity = quantityElement.value;
    total = total + price * quantity;
  }
  total = Math.round(total * 100) / 100;
  document.getElementsByClassName("cart-total-price")[0].innerText =
    "€" + total;
}

var checkoutButton = document.getElementById("checkout-button");
checkoutButton.addEventListener("click", function (token) {
  var items = [];
  var cartItemContainer = document.getElementsByClassName("cart-items")[0];
  var cartRows = cartItemContainer.getElementsByClassName("cart-row");
  for (var i = 0; i < cartRows.length; i++) {
    var cartRow = cartRows[i];
    var quantityElement = cartRow.getElementsByClassName(
      "cart-quantity-input"
    )[0];
    var quantity = quantityElement.value;
    var id = cartRow.dataset.itemId;
    items.push({
      id: id,
      quantity: quantity,
    });
  }

  fetch("/purchase", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      stripeTokenId: token.id,
      items: items,
    }),
  })
    .then(function (response) {
      console.log("response ====>", response);
      return response.json();
    })
    .then(function (session) {
      console.log("session ====>", session);
      return stripe.redirectToCheckout({ sessionId: session.id });
    })
    .then(function (result) {
      console.log("result ====>", result);
      // If `redirectToCheckout` fails due to a browser or network
      // error, you should display the localized error message to your
      // customer using `error.message`.
      if (result.error) {
        alert(result.error.message);
      }
    })
    .catch(function (error) {
      console.error("Error:", error);
    });
});

// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").load();
// }
require("dotenv").config({ path: "./config.env" });
// const stripeSecretKey = process.env.stripeSecretKey;
// const stripePublicKey = process.env.stripePublicKey;

const testSecretKey = process.env.testSecretKey;
const testPublicKey = process.env.testPublicKey;

//? add comment line
const express = require("express");
const app = express();
const fs = require("fs");
const stripe = require("stripe")(testSecretKey);
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  fs.readFile("items.json", (error, data) => {
    if (error) {
      res.status(500).end();
    } else {
      res.render("store.ejs", {
        stripePublicKey: testPublicKey,
        items: JSON.parse(data),
      });
    }
  });
});

app.post("/purchase", async (req, res) => {
  // console.log("req.body===>", req.body);
  fs.readFile("items.json", async (error, data) => {
    if (error) {
      res.status(500).end();
    } else {
      const itemsJson = JSON.parse(data);
      // console.log("itemsJson===>", itemsJson);
      const itemsArray = itemsJson.music.concat(itemsJson.merch);
      let total = 0;
      let description = "";
      req.body.items.forEach((item) => {
        console.log("iems==>", item);
        const itemJson = itemsArray.find((i) => {
          return i.id == item.id;
        });
        description = itemJson.name;
        total = total + itemJson.price * item.quantity;
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: description,
              },
              unit_amount: total,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel",

        // success_url: "https://videresoftcheckout.herokuapp.com/success",
        // cancel_url: "https://videresoftcheckout.herokuapp.com/cancel",
      });
      // console.log("sessions====>", session);
      res.json({ id: session.id });
    }
  });
});

app.get("/success", (req, res) => {
  res.render("success", { message: "Payment Successful" });
});

app.get("/cancel", (req, res) => {
  res.render("cancel", { message: "Payment Failed" });
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});

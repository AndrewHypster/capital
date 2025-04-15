const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors()); // Дозволити всі домени
app.use(express.static("public"));

const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Ключі SendPulse
const clientId = "324ce67fe160a376c8d92cd20481338b";
const clientSecret = "f0ead95abda2e6baf1f510306a4fe832";
const listId = "180976"; // <- ID адресної книги

// Middleware для перевірки обов'язкових полів
const validateFormData = (req, res, next) => {
  const { name, email, tel, offerta, subscribe, page } = req.body;

  // Перевірка на наявність всіх обов'язкових полів
  if (
    !name ||
    !email ||
    !tel ||
    offerta === undefined ||
    subscribe === undefined ||
    !page
  ) {
    return res.status(400).send("❌ Всі поля повинні бути заповнені!");
  }

  // Перевірка на коректність формату email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send("❌ Невірний формат електронної пошти!");
  }

  // Додаємо наступний middleware
  next();
};

app.post("/send", validateFormData, async (req, res) => {
  const { name, email, tel, offerta, subscribe, page } = req.body;

  try {
    // Крок 1: Отримуємо access token
    const qs = require("querystring");

    const authRes = await axios.post(
      "https://api.sendpulse.com/oauth/access_token",
      qs.stringify({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const token = authRes.data.access_token;
    if (!token) {
      return res.status(401).send("❌ Помилка авторизації з API SendPulse");
    }

    // Крок 2: Додаємо підписника
    const data = {
      emails: [
        {
          email: email,
          variables: {
            "Ім'я": name,
            Телефон: tel,
            "Приймаю оферту": offerta,
            "Підписка розсилки": subscribe,
          },
          status: "subscribed",
        },
      ],
    };

    const addRes = await axios.post(
      `https://api.sendpulse.com/addressbooks/${listId}/emails`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("API Response:", addRes.data);
    res.redirect(page); // Повертаємо користувача назад
  } catch (error) {
    console.error(
      "❌ Сталася помилка:",
      error?.response?.data || error.message
    );

    // Обробка помилок API
    if (error?.response?.data) {
      return res
        .status(500)
        .send(
          `❌ Помилка при додаванні підписника: ${
            error.response.data.error_description || error.message
          }`
        );
    }

    res.status(500).send("❌ Сталася помилка. Спробуйте пізніше.");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
});

const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const User = require("../models/user");
const Purchase = require("../models/purchase");

// دریافت لیست محصولات
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "خطا در دریافت محصولات" });
  }
});

// ثبت‌نام کاربر
router.post("/register", async (req, res) => {
  const { username, name, address, postalCode, phoneNumber } = req.body;

  if (!username || !name || !address || !postalCode || !phoneNumber) {
    return res.status(400).json({ message: "لطفاً تمامی فیلدها را پر کنید" });
  }

  try {
    // بررسی تکراری بودن نام کاربری
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "نام کاربری قبلاً ثبت‌نام شده است" });
    }

    // ثبت‌نام کاربر جدید
    const newUser = new User({
      username,
      name,
      address,
      postalCode,
      phoneNumber,
    });

    await newUser.save();
    res.status(201).json({ message: "ثبت‌نام با موفقیت انجام شد" });
  } catch (error) {
    res.status(500).json({ message: "خطا در ثبت‌نام" });
  }
});

// ورود کاربر
router.post("/login", async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "نام کاربری را وارد کنید" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(404)
        .json({ message: "کاربری با این نام کاربری پیدا نشد" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "خطا در ورود" });
  }
});

// ... اگر مدل User هم نیاز دارید، ایمپورت کنید: const User = require("../models/User");

router.post("/checkout", async (req, res) => {
  try {
    const { userId, items, totalPrice } = req.body;
    if (!userId || !items || !totalPrice) {
      return res.status(400).json({ message: "اطلاعات خرید ناقص است" });
    }

    // فرض می‌کنیم totalPrice به تومان است و باید به ریال تبدیل شود
    const realAmount = totalPrice * 10;

    // با JSON.stringify آرایه items را به استرینگ تبدیل می‌کنیم تا در Query String قابل ارسال باشد
    const itemsString = JSON.stringify(items);

    // ساخت callback_url به همراه پارامترهای لازم
    // فراموش نکنید که برای درست کار کردن Query String، مقادیر متنی را encodeURIComponent کنید
    const callbackUrl = `http://localhost:5000/api/verify?userId=${userId}&items=${encodeURIComponent(
      itemsString
    )}&totalPrice=${realAmount}`;

    // داده‌های ارسالی به زرین‌پال
    const paymentRequestData = {
      merchant_id: "xxxx-xxxx-xxxx-xxxx", // کد مرچنت زرین‌پال
      amount: realAmount, // مبلغ به ریال
      description: "خرید تستی از فروشگاه آنلاین",
      callback_url: callbackUrl,
    };

    // درخواست به زرین‌پال برای ایجاد تراکنش
    const response = await axios.post(
      "https://api.zarinpal.com/pg/v4/payment/request.json",
      paymentRequestData
    );

    // بررسی پاسخ
    if (response.data && response.data.data && response.data.data.authority) {
      const authority = response.data.data.authority;
      // لینک پرداخت
      const paymentLink = `https://www.zarinpal.com/pg/StartPay/${authority}`;
      return res.json({ paymentLink, authority });
    } else {
      return res.status(400).json({ message: "خطا در ایجاد تراکنش پرداخت" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "خطا در برقراری ارتباط با درگاه" });
  }
});

router.get("/verify", async (req, res) => {
  try {
    // در Query از طرف زرین‌پال ارسال می‌شود (Authority و Status)
    const { Authority, Status, userId, items, totalPrice } = req.query;

    // اگر پرداخت توسط کاربر لغو شده یا ناموفق بوده
    if (Status !== "OK") {
      return res.redirect("https://saz.liara.run/payment/failure");
    }

    // مقدار مبلغ را از Query (totalPrice) می‌خوانیم
    // این مبلغ از قبل تبدیل به ریال شده بود (در checkout ضربدر 10 کردیم)
    const amount = parseInt(totalPrice, 10);

    // درخواست تأیید پرداخت به زرین‌پال
    const verifyData = {
      merchant_id: "xxxx-xxxx-xxxx-xxxx",
      authority: Authority,
      amount: amount,
    };

    const verifyResponse = await axios.post(
      "https://api.zarinpal.com/pg/v4/payment/verify.json",
      verifyData
    );

    // اگر پرداخت موفق بود، کد 100 برمی‌گرداند
    if (
      verifyResponse.data &&
      verifyResponse.data.data &&
      verifyResponse.data.data.code === 100
    ) {
      // پرداخت تایید شده است

      // تبدیل آرایه آیتم‌ها از استرینگ به JSON
      const itemArray = JSON.parse(items);

      // ذخیره خرید در دیتابیس
      const newPurchase = new Purchase({
        userId,
        items: itemArray,
        totalPrice: amount / 10, // چون می‌خواهیم در دیتابیس به تومان ذخیره کنیم
        paymentStatus: "confirmed",
      });
      await newPurchase.save();

      return res.redirect("https://saz.liara.run/payment/success");
    } else {
      // پرداخت تایید نشد
      return res.redirect("https://saz.liara.run/payment/failure");
    }
  } catch (error) {
    console.error(error);
    return res.redirect("https://saz.liara.run/payment/failure");
  }
});

module.exports = router;

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// اتصال به MongoDB
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('خطا در اتصال به MongoDB:', err));

// مسیرهای API
const productRoutes = require('./src/routes/products');
app.use('/api', productRoutes);

// راه‌اندازی سرور
app.listen(PORT, () => {
  console.log(`Server runnig on port ${PORT}`);
});
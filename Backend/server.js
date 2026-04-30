const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());


app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true } 
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Hiba az adatok lekérésekor" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Szerver fut: http://localhost:${PORT}`);
});
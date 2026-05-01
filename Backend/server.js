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

// Új termék hozzáadása (Admin funkció)
app.post('/api/products', async (req, res) => {
    try {
      const { name, price, color, image, categoryId } = req.body;
      
      // Egyszerű validáció 
      if (!name || !price || price <= 0) {
        return res.status(400).json({ error: "Érvénytelen név vagy ár!" });
      }
  
      const product = await prisma.product.create({
        data: {
          name,
          price: parseInt(price),
          color,
          image,
          categoryId: parseInt(categoryId)
        }
      });
      
      res.status(201).json(product);
    } catch (error) {
      console.error("Backend hiba:", error);
      res.status(500).json({ error: "Szerver hiba történt a mentéskor." });
    }
  });

// Termék törlése ID alapján
app.delete('/api/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.product.delete({
        where: { id: parseInt(id) },
      });
      res.json({ message: "Termék sikeresen törölve" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Hiba történt a törlés során" });
    }
  });


if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 Szerver fut: http://localhost:${PORT}`);
    });
}

module.exports = app;
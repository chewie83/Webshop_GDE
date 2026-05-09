const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger beállítása
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: '3D Filament Shop API',
      version: '1.0.0',
      description: 'A webshop backend API dokumentációja',
      contact: {
        name: 'Pandur Ákos József'
      },
      servers: [{ url: `http://localhost:${PORT}` }] 
    },
  },
  apis: ['./server.js'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(cors());
app.use(express.json());

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Termék listázása
 *     responses:
 *       200:
 *         description: Sikeres lekérdezés.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
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
/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Új termék hozzáadása (Admin)
 *     description: Új 3D filament rögzítése az adatbázisba.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               color:
 *                 type: string
 *               image:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Termék sikeresen létrehozva.
 *       400:
 *         description: Érvénytelen név vagy ár.
 *       500:
 *         description: Szerver hiba történt.
 */
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
/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: Termék törlése ID alapján
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: A törlendő termék ID-ja
 *     responses:
 *       200:
 *         description: Termék sikeresen törölve.
 *       500:
 *         description: Hiba történt a törlés során.
 */
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
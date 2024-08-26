import express from 'express';

import { createClient } from 'redis';
import { promisify } from 'util';

const redisClient = createClient();
const setAsync = promisify(redisClient.set).bind(redisClient);
const getAsync = promisify(redisClient.get).bind(redisClient);

const listProducts = [
    {
        id: 1,
        name: 'Suitcase 250',
        price: 50,
        stock: 4,
    },
    {
        id: 2,
        name: 'Suitcase 450',
        price: 100,
        stock: 10,
    },
    {
        id: 3,
        name: 'Suitcase 650',
        price: 350,
        stock: 2,
    },
    {
        id: 4,
        name: 'Suitcase 1050',
        price: 550,
        stock: 5,
    },
];

/**
 * Finds and returns the item in listProducts with the specified id.
 *
 * @param {number} id - The id of the item to search for.
 * @return {object|undefined} The item object with the specified id,
 *                             or undefined if it does not exist.
 */
function getItemById(id) {
    return listProducts.find((item) => item.id === id);
}

/**
 * Asynchronously reserves stock of an item by its ID.
 *
 * @param {number} itemId - The ID of the item to reserve stock for.
 * @param {number} stock - The amount of stock to reserve.
 */
async function reserveStockById(itemId, stock) {
    await setAsync(`item.${itemId}`, stock);
}

/**
 * Asynchronously retrieves the current reserved stock for a given item ID.
 *
 * @param {string} itemId - The ID of the item to retrieve the stock for.
 * @return {Promise<any>} A promise that resolves with the current reserved stock for the given item ID.
 */
async function getCurrentReservedStockByIds(itemId) {
    return await getAsync(`item.${itemId}`);
}

const app = express();

app.get('/list_products', (req, res) => {
    res.send(listProducts);
});

app.get('/list_products/:itemId', async (req, res) => {
    const item = getItemById(parseInt(req.params.itemId));
    if (!item) res.status(404).send({ status: 'Product not found' });

    res.send({
        itemId: item.id,
        itemName: item.name,
        price: item.price,
        initialAvailableQuantity: item.stock,
        currentQuantity:
            (await getCurrentReservedStockByIds(item.id)) ?? item.stock,
    });
});

app.get('/reserve_product/:itemId', async (req, res) => {
    const item = getItemById(parseInt(req.params.itemId));
    if (!item) {
        res.status(404).send({ status: 'Product not found' });
        return;
    }

    const reservedStock = await getCurrentReservedStockByIds(item.id);
    if (reservedStock && parseInt(reservedStock) >= item.stock) {
        res.status(400).send({
            status: 'Not enough stock available',
            itemId: item.id,
        });
        return;
    }

    await reserveStockById(item.id, parseInt(reservedStock) + 1);
    res.send({ status: 'Reservation confirmed', itemId: item.id });
});

app.listen(1245);

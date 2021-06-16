var express = require('express');
var router = express.Router();
const { getAllItems, createItem, updateItem } = require("../repositories/item-repository");

router.route('').get((req, res) => {
    getAllItems((itemData) => {
        var items = itemData.map(i => { return {
            ...i,
            itemId: i.id,
            photoUrl: i.photourl
        }})
        res.status(200).json(items);
    });
});

router.route('').post((req, res) => {
    createItem(req.body, (i) => res.status(200).json(i));
});

router.route('').put((req, res) => {
    updateItem(req.body, (i) => res.status(200).json(i));
});


module.exports = router;

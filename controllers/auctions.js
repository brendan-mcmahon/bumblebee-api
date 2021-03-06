var express = require('express');
var router = express.Router();
const { createAuction, removeItemFromAuction, removeBidderFromAuction, deleteAuction } = require("../repositories/auction-repository");
const { addBidder, addItem, startAuction, getAuctionDetails, sold } = require('../services/auction-service');

router.route('').post((req, res) => {
    createAuction(req.body, (i) => res.status(200).json(i));
});

router.route('/:code').get((req, res) => {
    getAuctionIdByCode(req.params.code, (id) => {
        getAuctionDetails(id, (a) => {
            res.status(200).json(a);
        })
    })
})

router.route('/start').put((req, res) => {
    startAuction(req.body.auctionId, a => res.status(200).json(a));
})

router.route('/:auctionId').delete((req, res) => {
    deleteAuction(req.params.auctionId, (_) => res.status(203).send());
});

router.route('/item').post((req, res) => {
    
    addItem(req.body.itemId, req.body.auctionId, (i) => {
        res.status(200).json(i).send();
    });
});

router.route('/sell').post((req, res) => {
    sold(req.body.auctionItemId, (auctionItemId) => {
        console.log(auctionItemId);
        res.status(200).json(auctionItemId).send();
    });
});

router.route('/item/:auctionItemId').delete((req, res) => {
    removeItemFromAuction(req.params.auctionItemId, (_) => res.status(203).send());
});

router.route('/bidder').post((req, res) => {
    addBidder(req.body.bidderId, req.body.auctionId, (b) => res.status(200).json(b).send());
});

router.route('/bidder/:auctionBidderId').delete((req, res) => {
    removeBidderFromAuction(req.params.auctionBidderId, (_) => res.status(203).send());
});

module.exports = router;

var express = require('express');
var router = express.Router();
const { getAllBidders, createBidder } = require("../repositories/bidder-repository");

router.route('').get((req, res) => {
    getAllBidders((bidderData) => {
        var bidders = bidderData.map(b => { return {
            ...b,
            bidderId: b.id
        }})
        res.status(200).json(bidders);
    })
});

router.route('').post((req, res) => {
    createBidder(req.body, (b) => res.status(200).json(b));
});

module.exports = router;

const { getItemsInAuction } = require("../repositories/item-repository");
const { getBiddersInAuction } = require("../repositories/bidder-repository");
const {
    getAuction,
    updateBid,
    itemSold,
    nextItem,
    addItemToAuction,
    addBidderToAuction,
    editAuctionStatus,
    getAuctionIdByCode,
} = require("../repositories/auction-repository");

getAuctionDetails = (auctionId, next) => {
    getAuction(auctionId, (a) => {
        getItemsInAuction(auctionId, (i) => {
            getBiddersInAuction(auctionId, (b) => {
                next(mapAuctionDetails(a, i, b));
            });
        });
    });
};

addItem = (itemId, auctionId, next) => {
    addItemToAuction(itemId, auctionId, (_) => {
        getItemInAuction(auctionId, itemId, (item) => {
            next(mapItem(item));
        });
    });
};

addBidder = (bidderId, auctionId, next) => {
    addBidderToAuction(bidderId, auctionId, (_) => {
        getBidderInAuction(auctionId, bidderId, (bidder) => {
            next(mapBidder(bidder));
        });
    });
};

addBidderByAuctionCode = (bidderId, auctionCode, next) => {
    getAuctionIdByCode(auctionCode, (auctionId) => {
        // TODO: handle error if auctionId is not found;
        addBidderToAuction(bidderId, parseInt(auctionId), (_) => {
            getBidderInAuction(auctionId, bidderId, (bidder) => {
                next(mapBidder(bidder));
            });
        });
    });
};

bid = (auctionItemId, bidderId, bidAmount, next) => {
    updateBid(auctionItemId, bidderId, bidAmount, next);
};

sold = (auctionItemId, nextAuctionItemId, next) => {
    itemSold(auctionItemId, nextAuctionItemId, (previousAuctionItem) => {
        nextItem(previousAuctionItem.auctionid, nextAuctionItemId, (_) => {
            next(nextAuctionItemId);
        });
    });
};

startAuction = (auctionId, next) => {
    editAuctionStatus(auctionId, "in-progress", (_) => {
        setCurrentItemIdToFirstItem(auctionId, (_) => {
            getAuctionDetails(auctionId, (a) => {
                next(a);
            });
        });
    });
};

function mapAuctionDetails(auction, items, bidders) {
    return {
        id: auction.auctionid,
        code: auction.code,
        name: auction.auctionname,
        status: auction.status,
        currentAuctionItemId: auction.currentauctionitemid,
        items: items.map(mapItem),
        bidders: bidders.map(mapBidder),
    };
}

function mapItem(item) {
    return {
        itemId: item.itemid,
        auctionItemId: item.auctionitemid,
        name: item.name,
        startingBid: item.startingbid,
        currentBid: item.currentbid,
        bidder: {
            bidderId: item.bidderid,
            name: item.biddername,
        },
    };
}

function mapBidder(bidder) {
    return {
        bidderId: bidder.bidderid,
        auctionBidderId: bidder.auctionbidderid,
        name: bidder.name,
    };
}
module.exports = {
    getAuctionDetails,
    bid,
    sold,
    addItem,
    addBidder,
    addBidderByAuctionCode,
    startAuction,
};

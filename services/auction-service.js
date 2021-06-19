const { getItemsInAuction } = require("../repositories/item-repository");
const { getBiddersInAuction } = require("../repositories/bidder-repository");
const {
    getAuction,
    updateBid,
    itemSold,
    getNextItem,
    addItemToAuction,
    addBidderToAuction,
    editAuctionStatus,
    getAuctionIdByCode,
    nextItem,
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

getAuctionDetailsByCode = (auctionCode, next) => {
    getAuctionIdByCode(auctionCode, (auctionId) => {
        getAuction(auctionId, (a) => {
            getItemsInAuction(auctionId, (i) => {
                getBiddersInAuction(auctionId, (b) => {
                    next(mapAuctionDetails(a, i, b));
                });
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

addBidderByAuctionCode = (bidderId, auctionCode, next, error) => {
    getAuctionIdByCode(auctionCode, (auctionId) => {
        if (!auctionId) {
            error();
        } else {
            addBidderToAuction(bidderId, parseInt(auctionId), (_) => {
                getBidderInAuction(auctionId, bidderId, (bidder) => {
                    next(mapBidder(bidder));
                });
            });
        }
    });
};

bid = (auctionItemId, bidderId, bidAmount, next) => {
    updateBid(auctionItemId, bidderId, bidAmount, next);
};

sold = (auctionItemId, next) => {
    itemSold(auctionItemId, (auctionId) => {
        getNextItem(auctionId, (auctionItemId) => {
            if (!auctionItemId) {
                console.log('no auctionItemId found, finishing auction');
                editAuctionStatus(auctionId, 'complete', (_) => {
                    next(null);
                });
            } else {
                console.log(`found auctionItemId, auction continues: ${auctionItemId}`);
                nextItem(auctionId, auctionItemId, (nextAuctionItemId) => {
                    next(nextAuctionItemId);
                });
            }
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
        photoUrl: item.photourl,
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
    getAuctionDetailsByCode,
    bid,
    sold,
    addItem,
    addBidder,
    addBidderByAuctionCode,
    startAuction,
};

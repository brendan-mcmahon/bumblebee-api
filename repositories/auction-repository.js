const { pool } = require("../config");

getAllAuctions = (next) => {
    const queryText = "SELECT * FROM auction";

    pool.query(queryText, (err, res) => {
        if (err) throw err;
        next(res.rows);
    });
};

getAuction = (auctionId, next) => {
    const queryText = `
        select 
            a.id as auctionId,
            a.code as code,
            a.name as auctionName,
            a.status as status,
            a.currentauctionitemid            
        from auction a
        where a.id = $1`;

    pool.query(queryText, [auctionId], (err, res) => {
        if (err) throw err;
        next(res.rows[0]);
    });
};

setCurrentItemIdToFirstItem = (auctionId, next) => {
    const query = `
    update auction set currentauctionitemid = 
        (select id from auctionitem where auctionid = $1 limit 1) 
    where id = $1;`;
    //TODO: validate that there are items first
    pool.query(query, [auctionId], (err, res) => {
        if (err) throw err;
        next();
    });
}

getAuctionIdByCode = (auctionCode, next) => {
    const query = `select id from auction where code = $1`;
    pool.query(query, [auctionCode], (err, res) => {
        if (err) throw err;
        next(res.rows[0].id);
    });
}

editAuctionStatus = (auctionId, status, next) => {
    var queryText = "update auction set status = $2 where id = $1;";

    pool.query(queryText, [auctionId, status], (err, res) => {
        if (err) throw err;
        next(res.rows);
    });
};

createAuction = (auction, next) => {
    const queryText = "insert into auction (name, code) values ($1, $2) returning *; ";

    pool.query(queryText, [auction.name, auction.code], (err, res) => {
        if (err) throw err;
        next(res.rows[0]);
    });
};

addItemToAuction = (itemId, auctionId, next) => {
    const queryText =
        "insert into auctionitem (itemid, auctionid) values ($1, $2);";

    pool.query(queryText, [itemId, auctionId], (err, res) => {
        if (err) throw err;
        next(res.rows[0]);
    });
};

removeItemFromAuction = (itemAuctionId, next) => {
    const queryText = "delete from auctionitem where id = $1";

    pool.query(queryText, [itemAuctionId], (err, res) => {
        if (err) throw err;
        next(res.rows[0]);
    });
};

addBidderToAuction = (bidderId, auctionId, next) => {
    const queryText =
        "insert into auctionbidder (bidderid, auctionid) values ($1, $2);";

    pool.query(queryText, [bidderId, auctionId], (err, res) => {
        if (err) throw err;
        next(res.rows[0]);
    });
};

removeBidderFromAuction = (bidderAuctionId, next) => {
    const queryText = "delete from auctionbidder where id = $1";

    pool.query(queryText, [bidderAuctionId], (err, res) => {
        if (err) throw err;
        next(res.rows[0]);
    });
};

updateBid = (auctionItemId, bidderId, bidAmount, next) => {
    const query = `update auctionitem set currentbid = $2, currentbidderid = $3
    where id = $1
    returning *;`;

    pool.query(query, [auctionItemId, bidAmount, bidderId], (err, res) => {
        if (err) throw err;
        next(res.rows[0]);
    });
};

itemSold = (auctionItemId, next) => {
    const query = `update auctionitem set sold = true
    where id = $1
    returning *;`;

    pool.query(query, [auctionItemId], (err, res) => {
        if (err) throw err;
        next(res.rows[0]);
    });
}

nextItem = (auctionId, auctionItemId, next) => {
    const query = `update auction set currentauctionitemid = $2
    where id = $1
    returning *;`;

    pool.query(query, [auctionId, auctionItemId], (err, res) => {
        if (err) throw err;
        next(res.rows[0]);
    });
}

deleteAuction = (auctionId, next) => {
    const auctionBidderQuery = `delete from auctionbidder where auctionid = $1;`;
    const auctionItemQuery = `delete from auctionitem where auctionid = $1;`;
    const auctionQuery = `delete from auction where id = $1;`;

    pool.query(auctionBidderQuery, [auctionId], (err, res) => {
        if (err) throw err;
        pool.query(auctionItemQuery, [auctionId], (err, res) => {
            if (err) throw err;
            pool.query(auctionQuery, [auctionId], (err, res) => {
                if (err) throw err;
                next(res.rows[0]);
            });
        });
    });

}

module.exports = {
    getAllAuctions,
    editAuctionStatus,
    getAuction,
    createAuction,
    addItemToAuction,
    removeItemFromAuction,
    addBidderToAuction,
    removeBidderFromAuction,
    updateBid,
    itemSold,
    nextItem,
    deleteAuction,
    getAuctionIdByCode,
    setCurrentItemIdToFirstItem
};

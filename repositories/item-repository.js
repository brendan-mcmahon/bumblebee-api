const { pool } = require("../config");

getAllItems = (next) => {
    const queryText = "SELECT * FROM item";

    pool.query(queryText, (err, res) => {
        if (err) throw err;
        next(res.rows);
    });
};

createItem = (item, next) => {
    const queryText = "insert into item (name, startingbid) values ($1, $2) returning *; ";

    pool.query(queryText, [item.name, item.startingBid], (err, res) => {
        if (err) throw err;
        next(res.rows[0]);
    });
};

updateItem = (item, next) => {
    const queryText = "update item set name = $1, startingbid = $2 returning *; ";

    pool.query(queryText, [item.name, item.startingBid], (err, res) => {
        if (err) throw err;
        next(res.rows[0]);
    });
};

deleteItem = (itemId, next) => {
    // TODO: Not sure how this will cascade
    const queryText = "delete from item where id = $1";

    pool.query(queryText, [itemId], (err, res) => {
        if (err) throw err;
        next(res.rows[0]);
    });
};

getItemsInAuction = (auctionId, next) => {
    const queryText = `
    select
        ai.id as auctionitemid,
        i.id as itemid,
        ai.currentbid,
        ai.sold,
        i.name,
        i.startingbid,
        ai.currentbidderid as bidderid,
        b.name as biddername
    from auctionitem ai
    left join item i on ai.itemid = i.id
    left join bidder b on ai.currentbidderid = b.id
    where ai.auctionid = $1`;
    
    pool.query(queryText, [auctionId], (err, res) => {
        if (err) throw err;
        next(res.rows);
    });
}

getItemInAuction = (auctionId, itemId, next) => {
    const queryText = `
    select
        ai.id as auctionitemid,
        i.id as itemid,
        ai.currentbid,
        ai.sold,
        i.name,
        i.startingbid,
        ai.currentbidderid as bidderid,
        b.name as biddername
    from auctionitem ai
    left join item i on ai.itemid = i.id
    left join bidder b on ai.currentbidderid = b.id
    where ai.auctionid = $1
    and ai.itemid = $2`;
    
    pool.query(queryText, [auctionId, itemId], (err, res) => {
        if (err) throw err;
        next(res.rows[0]);
    });
}

module.exports = { getAllItems, createItem, updateItem, getItemsInAuction };

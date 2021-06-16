const { pool } = require("../config");

getAllBidders = (next) => {
    const queryText = "SELECT * FROM bidder";

    pool.query(queryText, (err, res) => {
        if (err) throw err;
        next(res.rows);
    });
};

createBidder = (bidder, next) => {
    const queryText = "insert into bidder (name, online) values ($1, $2) returning *; ";

    pool.query(queryText, [bidder.name, bidder.online], (err, res) => {
        if (err) throw err;
        next(res.rows[0]);
    });
};

getBiddersInAuction = (auctionId, next) => {
    const queryText = `
        select 
            b.id as bidderid,
            ab.id as auctionbidderid,
            b.id as bidderid,
            b.name
        from auctionbidder ab
        join bidder b on ab.bidderid = b.id
        where ab.auctionid = $1`;
    
    pool.query(queryText, [auctionId], (err, res) => {
        if (err) throw err;
        next(res.rows);
    });
}

getBidderInAuction = (auctionId, bidderId, next) => {
    const queryText = `
        select 
            b.id as bidderid,
            ab.id as auctionbidderid,
            b.id as bidderid,
            b.name
        from auctionbidder ab
        join bidder b on ab.bidderid = b.id
        where ab.auctionid = $1
        and ab.bidderid = $2`;
    
    pool.query(queryText, [auctionId, bidderId], (err, res) => {
        if (err) throw err;
        next(res.rows[0]);
    });
}

module.exports = { getAllBidders, createBidder, getBiddersInAuction };
let app = require("express")();
let cors = require("cors");
const bodyParser = require("body-parser");
let http = require("http").createServer(app);
const {
    getAllAuctions,
    editAuctionStatus,
    getAuctionIdByCode,
} = require("./repositories/auction-repository");
const {
    getAuctionDetails,
    bid,
    sold,
    addBidderByAuctionCode,
    startAuction,
    getAuctionDetailsByCode,
} = require("./services/auction-service");
let io = require("socket.io")(http, {
    cors: {
        origin: "*",
    },
});
app.use(cors());
app.use(bodyParser.json());

const rooms = [];

var auctionController = require("./controllers/auctions.js");
var itemController = require("./controllers/items.js");
var bidderController = require("./controllers/bidders.js");
const { createBidder } = require("./repositories/bidder-repository");

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.use("/auctions", auctionController);
app.use("/items", itemController);
app.use("/bidders", bidderController);

io.on("connection", async (socket) => {
    console.log("connected");

    socket.on("disconnect", () => {
        console.log("disconnected");
    });

    socket.on("join", (req) => {
        // TODO: check if the name exists first before creating a new one
        createBidder({ name: req.name, online: true }, (b) => {
            addBidderByAuctionCode(b.id, req.code, (b) => {
                socket.join(req.code);
                // io.to(socket.id).emit("bidder-id", {id: b.id});
                socket.emit("bidder-id", b.bidderId);
                io.in(req.code).emit("bidder-joined", b);
                getAuctionIdByCode(req.code, (auctionId) => {
                    getAuctionDetails(auctionId, (auction) => {
                        io.in(req.code).emit("auction", auction);
                    });
                });
            });
        });
    });

    socket.on("rejoin", (req) => {
        socket.join(req.code);
        socket.emit("bidder-id", req.bidderId);
        // io.in(req.code).emit("bidder-joined", b);
        getAuctionIdByCode(req.code, (auctionId) => {
            getAuctionDetails(auctionId, (auction) => {
                io.in(req.code).emit("auction", auction);
            });
        }, (error) => {
            socket.emit('auction-not-found');
        });
    });

    socket.on("auctioneer-join", (req) => {
        socket.join(req.code);
        console.log(`auctioneer joined ${req.code}`);
    });

    socket.on("spectator-join", (req) => {
        socket.join(req.code);
        console.log(`spectator joined ${req.code}`);
        getAuctionDetailsByCode(req.code, (auction) => {
            socket.emit('auction', auction);
        })
    });

    socket.on("auctioneer", () => {
        getAllAuctions((r) => socket.emit("auction-data", r));
    });

    socket.on("auction-details", (req) => {
        getAuctionDetails(req.auctionId, (auction) => {
            socket.emit("auction", auction);
        });
    });

    socket.on("auction-started", (req) => {
        console.log(`starting auction ${req.code}`);
        getAuctionDetailsByCode(req.code, (auction) => {
            io.in(req.code).emit("auction", auction);
        });
    });

    socket.on("bid", (req) => {
        bid(req.auctionItemId, req.bidderId, req.amount, (ai) => {
            getAuctionDetailsByCode(req.code, (auction) => {
                io.in(req.code).emit("auction", auction);
            });
            io.in(req.code).emit("new-bid", {
                amount: ai.currentbid || 0,
                bidderId: ai.currentbidderid || null,
            });
        });
    });

    socket.on("sold", (req) => {
        console.log(`sold ${req.auctionItemId}. Next up is ${req.nextAuctionItemId}`);
        sold(req.auctionItemId, req.nextAuctionItemId, (auction) => {
            io.in(req.code).emit("auction", auction);
        });
    });

    
    socket.on("next", (req) => {
        console.log(`sending next item out`);
        getAuctionDetailsByCode(req.code, (auction) => {
            io.in(req.code).emit("auction", auction);
        });
    });

    socket.on("complete-auction", (req) => {
        editAuctionStatus(req.auctionId, "complete", (_) => {
            getAuctionDetails(req.auctionId, (auction) => {
                io.in(req.code).emit("auction", auction);
            });
        });
    });
});

const port = process.env.PORT || 5000;
http.listen(port, () => {
    console.log(`started on port ${port}`);
});

let app = require("express")();
let cors = require("cors");
const bodyParser = require("body-parser");
let http = require("http").createServer(app);
const {
    getAllAuctions,
    editAuctionStatus,
    getAuctionIdByCode,
} = require("./repositories/auction-repository");
const { getAuctionDetails, bid, sold, addBidderByAuctionCode, startAuction } = require("./services/auction-service");
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
        console.log(`${req.name} joining ${req.code}`);
        if (rooms.filter((r) => r.code === req.code) < 1) {
            rooms.push({
                code: req.code,
                bidders: []
            });
        }

        createBidder({ name: req.name, online: true }, (b) => {
            addBidderByAuctionCode(b.id, req.code, (b) => {
                rooms.filter((r) => r.code === req.code)[0].bidders.push(req.name);
                socket.join(req.code);
                io.in(req.code).emit('bidder-joined', b);
                getAuctionIdByCode(req.code, auctionId => {
                    getAuctionDetails(auctionId, auction => {
                        socket.emit('auction', auction);
                    })
                })
            })
        })
    });

    socket.on("hey", () => {
        getAllAuctions((r) => socket.emit("auction-data", r));
    });

    socket.on("auction-details", (req) => {
        getAuctionDetails(req.auctionId, (auction) => {
            socket.emit("auction", auction);
        });
    });

    socket.on("auction-started", (req) => {
        startAuction(req.auctionId, auction => {
            io.in(req.auctionId).emit("auction", auction);
            io.in(req.auctionId).emit("next-item", auction.items[0].auctionItemId);
        });
    });

    socket.on("bid", (req) => {
        bid(req.auctionItemId, req.bidderId, req.amount, (ai) => {
            socket.emit("new-bid", {
                amount: ai.currentbid || 0,
                bidderId: ai.currentbidderid || null,
            });
        });
    });

    socket.on("sold", (req) => {
        sold(req.auctionItemId, req.nextAuctionItemId, (nextId) => {
            socket.in(req.auctionId)("next-item", nextId);
        });
    });

    socket.on("complete-auction", (req) => {
        editAuctionStatus(req.auctionId, "complete", (_) => {
            getAuctionDetails(req.auctionId, (auction) => {
                socket.emit("auction", auction);
            });
        });
    });
});

const port = process.env.PORT || 5000;
http.listen(port, () => {
    console.log(`started on port ${port}`);
});

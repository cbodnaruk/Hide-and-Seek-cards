import { Card, Hand } from "./Constructors.js"
import { parseDextrousLayout } from "./DextrousParser.js"
var hand = new Hand()
var cards = []
var deckLayout
var importType = localStorage.getItem("import")
var peers = []
var clientConn = null
var role = null
var deckSize = 0
var qrcode
const opfsRoot = await navigator.storage.getDirectory();

var allDrawnIDS = []

var peer = new Peer((localStorage.getItem("peerID"))?localStorage.getItem("peerID"):"")
var peerID

class HostConn {
    constructor(connection) {
        this.conn = connection;
        hostReady(this.conn)
    }
}

peer.on('open', (id) => {
    peerID = id;
    qrcode = (localStorage.getItem("host")) ? new QRCode(document.getElementById("qrcode"), {
        text: (localStorage.getItem("role")=="client")?localStorage.getItem("host"):peerID,
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.L
    }) : "x"
    console.log(`peer open at uuid ${id}`);
    localStorage.setItem("peerID",peerID)
    if (localStorage.getItem("role") == "client"){
        clientConn = peer.connect(localStorage.getItem("host"), { metadata: { app: "fumble", role: "client" } })

        clientConn.on('open', () => {
            clientReady()
        })
    }
})
peer.on('connection', (conn) => {
    peers.push(new HostConn(conn))
})
peer.on('disconnected', () => {
    console.log("disconnected");

})

if (localStorage.getItem("deckActive")) {
    $("#settings_box").hide()
    $("#landing_page").hide()
    $("#join_box").hide()
    if (importType == "Dextrous") {
        deckLayout = parseDextrousLayout(JSON.parse(localStorage.getItem("deckLayout")))
    }
    else if (importType == "Image") {
        deckSize = localStorage.getItem("imageCount")
        handSize(0)
        if (localStorage.getItem("hand")) {
            handSize(JSON.parse(localStorage.getItem("hand")).length)
            JSON.parse(localStorage.getItem("hand")).forEach(async card => {
                hand.addCard(await getCard(card.id))
                $("#player_hand").append(hand.DOM);
            })
        }
    }

    $.getJSON("./deck.json", function (data) {
        cards = data;

        // generate cards for testing
        // for (var i = 0; i < 5; i++) {
        //     var randomCard = Math.floor(Math.random() * cards.length) + 1
        //     hand.addCard(getCard(randomCard))
        //     $("#player_hand").append(hand.DOM);
        // }

        handSize(0)
        if (localStorage.getItem("hand")) {
            handSize(JSON.parse(localStorage.getItem("hand")).length)
            JSON.parse(localStorage.getItem("hand")).forEach(card => {
                hand.addCard(getCard(card.id))
                // $("#player_hand").append(hand.DOM);
            })
        }


    })
} else {
    if (localStorage.getItem("import") == "Dextrous") {
        var file_input = document.createElement("input")
        $(file_input).attr({ accept: ".json", type: "file", id: "fu_box", onchange: "setText(event)" })
        $("#file_upload").html(file_input)
        $("#file_upload_button").text("Upload a Dextrous .JSON layout")
    } else {
        var file_input = document.createElement("input")
        $(file_input).attr({ accept: ".zip", type: "file", id: "fu_box", onchange: "setText(event)" })
        $("#file_upload").html(file_input)
        $("#file_upload_button").text("Upload a .zip of card images")
    }
    // localStorage.setItem("deckLayout", JSON.stringify(deckLayout))
    handSize(0)
    // if (localStorage.getItem("deck")){
    $.getJSON("./deck.json", function (data) {
        cards = data;

        // generate cards for testing
        // for (var i = 0; i < 5; i++) {
        //     var randomCard = Math.floor(Math.random() * cards.length) + 1
        //     hand.addCard(getCard(randomCard))
        //     $("#player_hand").append(hand.DOM);
        // }
        handSize(0)
        if (localStorage.getItem("hand")) {
            handSize(JSON.parse(localStorage.getItem("hand")).length)
            JSON.parse(localStorage.getItem("hand")).forEach(card => {
                hand.addCard(getCard(card.id))
                // $("#player_hand").append(hand.DOM);

            })
        }
    })
    // } else {
    //display data selection
    // }





}


function importCards() {
    importType = localStorage.getItem("import")
    if (importType == "Dextrous") { loadJSON() } else { loadZIP() }
    $("#settings_box").addClass("hidden")
}


function importChange() {
    importType = $("#card_import").val()
    if (importType == "Dextrous") {
        var file_input = document.createElement("input")
        $(file_input).attr({ accept: ".json", type: "file", id: "fu_box", onchange: "setText(event)" })
        $("#file_upload").html(file_input)
        $("#file_upload_button").text("Upload a Dextrous .JSON layout")
        localStorage.setItem("import", "Dextrous")
    } else {
        var file_input = document.createElement("input")
        $(file_input).attr({ accept: ".zip", type: "file", id: "fu_box", onchange: "setText(event)" })
        $("#file_upload").html(file_input)
        localStorage.setItem("import", "Image")
        $("#file_upload_button").text("Upload a .zip of card images")
    }
}

function handSize(size) {
    $("#hand_size").text(`${size}/6`)
}

function cardClicked(cardDOM) {

    if (cardDOM.parentElement == document.getElementById("player_hand_inner")) {
        var card = hand.cards[$(cardDOM).index()]
        card.focus()
        console.log("card clicked")
        var handwidth = document.getElementById("player_hand_inner").scrollWidth

        var cardwidth = handwidth / hand.cards.length;
        var cardindex = $(cardDOM).index();
        var new_pos = cardindex * cardwidth - (window.screen.width / 4) + (cardwidth * 0.18)
        $("#player_hand_inner").animate({ scrollLeft: new_pos }, 300, 'linear')
        $("#discard_button").show()
        $("#deck_button").hide()
    }
    else if (cardDOM.parentElement == document.getElementById("draw_market")) {
        var card = $("#draw_market").children().eq($(cardDOM).index())

        if (card.hasClass("selected_draw")) {
            card.removeClass("selected_draw")
            keptnum--
        }
        else {
            if (keptnum < keepnum) {
                card.addClass("selected_draw")
                keptnum++
            }

        }
        $("#draw_approve").text((keptnum < keepnum) ? `${keepnum - keptnum} remaining` : "Confirm")
    }
}

function unfocus() {
    var handwidth = document.getElementById("player_hand_inner").scrollWidth
    var cardwidth = handwidth / hand.cards.length;
    var cardindex = $(".focused").index();
    var new_pos = cardindex * cardwidth - (window.screen.width / 4)
    $("#player_hand_inner").animate({ scrollLeft: new_pos }, 300, 'linear')
    $(".focused").removeClass("focused")

    $("#focus_background").hide()
    console.log("unfocused")
    $("#discard_button").hide()
    $("#deck_button").show()
}

function discardCard() {
    var card = $(".focused")
    var cardindex = card.index()
    hand.cards.splice(cardindex, 1)
    var neighbour = card.next()
    neighbour.css("position", "relative")
    card.css("position", "relative")
    neighbour.animate({ left: "-=" + card.width() }, 300, 'swing', function () { neighbour.css("position", "static") })
    card.animate({ top: "-500px" }, 300, 'swing', function () { card.remove() })

    unfocus()
    handSize(hand.cards.length)
    console.log("card discarded")
}

function showDraw() {
    $("#draw_dialog").animate({ top: "5%" }, 300, 'swing')
    $("#focus_background").show()
}

function selectOption(choice) {
    var selected = $(choice).parent().children(".selected_option")
    selected.removeClass("selected_option")
    $(choice).addClass("selected_option")
    console.log("option selected")
}
var keepnum = 0
var keptnum = 0
async function drawCards() {
    $("#draw_dialog").animate({ top: "-100%" }, 300, 'swing')
    var drawNum = $("#draw_select").children(".selected_option").text()
    keepnum = $("#keep_select").children(".selected_option").text()
    var drawnIds = []
    var drawnCards = []
    for (var i = 0; i < drawNum; i++) {
        var randomCard = 0
        do {
            randomCard = Math.floor(Math.random() * deckSize) + 1
        } while (drawnIds.includes(randomCard) || allDrawnIDS.includes(randomCard))
        drawnIds.push(randomCard)
        drawnCards.push(await getCard(randomCard))
    }
    console.log(drawnCards)

    var drawMarket = $("#draw_market")
    drawMarket.css("display", "flex")
    for (var i = 0; i < drawnCards.length; i++) {
        var card = drawnCards[i]
        var cardDOM = $(card.DOM)
        cardDOM.addClass("market_card")
        drawMarket.append(cardDOM)
    }
    var count = 0
    showNextDraw(drawMarket, count)
    drawMarket.append('<div class="button" id="draw_approve" style="width: fit-content"></div>')
    $("#draw_approve").text(`${keepnum - keptnum} remaining`)
    $("#draw_approve").on("click", function () {
        if (keptnum == keepnum) {
            $("#draw_market").children().each(async function () {
                if ($(this).hasClass("selected_draw")) {
                    var card = drawnIds[$(this).index()]
                    hand.addCard(await getCard(card))
                    if (role == "host"){
                        broadcastDraw(card)
                    }else {
                        sendDraw(card)
                    }
                    allDrawnIDS.push(card)
                    localStorage.setItem("hand", JSON.stringify(hand.cards))
                    handSize(hand.cards.length)
                } else {
                    var card = $(this)
                    card.animate({ left: "-500px" }, 300, 'swing', function () {
                        card.remove()
                        $("#focus_background").hide()
                        drawMarket.css("display", "none")
                        drawMarket.empty()
                        keptnum = 0

                    })
                }

            })

        } else {

        }


    })

}

function broadcastDraw(id) {
    for (let x in peers) {
        console.log(peers[x]);
        
        peers[x].conn.send({ type: "bdraw", payload: id })
    }
}
function sendDraw(id) {
    clientConn.send({ type: "draw", payload: id })
}

function showNextDraw(market, count) {
    market.children().eq(count).animate({ left: "30%" }, 500, 'swing', function () {
        // market.children().eq(count).css("position","static")
        // market.children().eq(count).css("left","30%")
        var next = count + 1
        if (next < market.children().length) {
            showNextDraw(market, next)
        }
    })
}

async function getCard(id) {
    if (importType == "Image") {
        var image_data = await readImage(id)
        return new Card({ "src": image_data, "id": id }, "image")
    } else {
        var card = cards[id - 1]
        return new Card(card, deckLayout)
    }
}



function loadZIP() {
    const selectedFile = document.getElementById("fu_box").files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        var zip = new JSZip();
        zip.loadAsync(e.target.result)
            .then(function (zip) {
                zip.folder("fronts").forEach(function (relativePath, zipEntry) {

                    zipEntry.async("base64").then((blob) => {

                        if (zipEntry.name) {
                            var img_id = zipEntry.name.split(".")[0].split("/")[1]
                            console.log(img_id);
                            opfsRoot.getFileHandle(img_id, { create: true }).then((fileHandle) => {
                                fileHandle.createWritable().then((writer) => {
                                    writer.write(blob)
                                    writer.close()
                                })
                                deckSize++
                                localStorage.setItem("imageCount", deckSize)
                            })
                        }
                    })
                    console.log(zipEntry)
                })
            })
    }
    reader.readAsArrayBuffer(selectedFile)
    localStorage.setItem("deckActive", true)
    localStorage.setItem("deckID", Math.floor(Math.random() * 1000))
    createPeerHost()
}

function createPeerHost() {
    qrcode = new QRCode(document.getElementById("qrcode"), {
        text: peerID,
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.L
    })
    $("#settings_box").hide()
    localStorage.setItem("host", true)
}



async function readImage(id) {
    var image_data
    console.log(id);

    // return opfsRoot.getFileHandle(id).then(async (fileHandle) => {
    // return fileHandle.getFile().then((file) => {
    //     console.log(file);
    //     const imagefile = new File([file], "image.png", {type: "image/png"})
    //     const reader = new FileReader();
    //     reader.onload = function (e) {
    //         console.log(e.target.result)
    //         image_data = e.target.result

    //     }
    //     reader.readAsDataURL(imagefile);
    //     return image_data
    // })})
    console.log((id.toString().length > 1) ? id : `0${id}`);
    const fileHandle = await opfsRoot.getFileHandle((id.toString().length > 1) ? id : `0${id}`, { create: false });


    const file = await fileHandle.getFile();
    console.log(file);
    // return image_data
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log(e.target.result);

            resolve(`data:image/png;base64,${e.target.result}`)
        }
        reader.readAsText(file);
    })

}

function hostDeck() {
    $("#landing_page").addClass("hidden")
    $("#join_box").addClass("hidden")
}

function joinDeck() {
    $("#qr_heading").hide()
    $("#landing_page").addClass("hidden")
    $("#settings_box").addClass("hidden")
    $("#qr_container").hide()
    $("#qr_button").hide()
    // This method will trigger user permissions
    Html5Qrcode.getCameras().then(devices => {
        /**
         * devices would be an array of objects of type:
         * { id: "id", label: "label" }
         */
        if (devices && devices.length) {
            const html5QrCode = new Html5Qrcode(/* element id */ "reader");
            html5QrCode.start({ facingMode: "environment" }, { qrbox: { width: 250, height: 250 } }, (decodedText, decodedResult) => {
                console.log(decodedText)
                $("#reader_wrapper").find("h3").text("Connecting...")

                $("#reader").animate({ height: "0px" }, 200, "linear", () => {

                    html5QrCode.stop().then((ignore) => {
                        // QR Code scanning is stopped.
                        // Start connection here
                        clientConn = peer.connect(decodedText, { metadata: { app: "fumble", role: "client" } })

                        clientConn.on('open', () => {
                            clientReady()
                        })

                    }).catch((err) => {
                        // Stop failed, handle it.
                    });
                })

            }, (errorMessage) => {
            });
        }
    }).catch(err => {
        console.log(err);

    });
}

function clientReady() {
    role = "client"
    localStorage.setItem("role","client")
    localStorage.setItem("host",clientConn.peer)
    var newDeck = null
    clientConn.on('data', (data) => {
        console.log("message received");

        var info = $("#reader_wrapper").find("h3")
        switch (data.type) {
            case "count":
                deckSize = data.payload
                info.text(`Streaming cards: 0/${deckSize}...`)
                break;
            case "image":
                receiveCard(data.id, data.payload)
                loadedCards++
                info.text(`Streaming cards: ${loadedCards}/${deckSize}...`)
                break;
            case "loaded":
                $("#join_box").addClass("hidden")
                localStorage.setItem("deckID", newDeck)
                localStorage.setItem("deckActive",true)
                break;
            case "deckID":
                console.log(`I have deck ${(localStorage.getItem("deckID")) ? localStorage.getItem("deckID") : "none"}. I want deck ${data.payload}.`);
                newDeck = data.payload
                if (!localStorage.getItem("deckID") || data.payload != localStorage.getItem("deckID")) {
                    clientConn.send({ type: "deckRes", payload: false })
                } else {
                    clientConn.send({ type: "deckRes", payload: true })
                }
                break;
            case "deckType":
                importType = data.payload
                localStorage.setItem("import", data.payload)
                break;
            case "bdraw":
                (!allDrawnIDS.includes(data.payload))?allDrawnIDS.push(data.payload):""
                break;
        }
    })
    clientConn.on('error', (error) => console.log(error))

}

function hostReady(hostConn) {
    role = "host"
    console.log("recieved connection");
    if (hostConn.metadata.role == "client") {
        console.log(peers);
        setTimeout(() => {
            hostConn.send({ type: "count", payload: deckSize })
            hostConn.send({ type: "deckID", payload: localStorage.getItem("deckID") })
        }, 500)


    } else if (hostConn.metadata.role == "host") {

    }
    hostConn.on('data', (data) => {
        switch (data.type){
            case "deckRes":
            if (!data.payload) {
                hostConn.send({ type: "deckType", payload: "Image" })
                sendCards(hostConn)
            } else {
                hostConn.send({ type: "loaded" })
            }
            break;
            case "draw":
                (!allDrawnIDS.includes(data.payload))?allDrawnIDS.push(data.payload):""
                broadcastDraw(data.payload)
        }

    })
}

var loadedCards = 0


function receiveCard(id, image) {
    console.log(id);
    opfsRoot.getFileHandle(id, { create: true }).then((fileHandle) => {
        fileHandle.createWritable().then((writer) => {
            writer.write(image)
            writer.close()
        })
    })
}

async function sendCards(hostConn) {
    for (let x = 0; x < deckSize; x++) {
        var fullURL = await readImage(x)
        hostConn.send({ type: "image", payload: fullURL.split(",")[1], id: x })
    }
    hostConn.send({ type: "loaded" })
}

function setText(e) {
    $("#file_upload_button").text(e.target.files[0].name)
}

function closeDeck() {
    localStorage.removeItem("hand")
    localStorage.removeItem("deckID")
    localStorage.removeItem("deckActive")
    localStorage.removeItem("host")
    localStorage.removeItem("imageCount")
    localStorage.removeItem("peerID")
    localStorage.removeItem("role")
    location.reload()
}

function hideShowQR() {
    var btn = $("#qr_button")
    switch (btn.text()) {
        case "Hide QR":
            btn.text("Show QR")
            $(".qrcode_container").addClass("hidden")
            break;

        case "Show QR":
            btn.text("Hide QR")
            $(".qrcode_container").removeClass("hidden")
            break;
    }
}

window.hideShowQR = hideShowQR;
window.closeDeck = closeDeck;
window.getCard = getCard;
window.selectOption = selectOption;
window.drawCards = drawCards;
window.discardCard = discardCard;
window.cardClicked = cardClicked;
window.unfocus = unfocus;
window.showDraw = showDraw;
window.importCards = importCards;
window.importChange = importChange;
window.loadZIP = loadZIP;
window.readImage = readImage;
window.hostDeck = hostDeck;
window.joinDeck = joinDeck;
window.setText = setText;
import { Card, Hand } from "./Constructors.js"
import { parseDextrousLayout } from "./DextrousParser.js"
var hand = new Hand()
var cards = []
var deckLayout
var 
if (localStorage.getItem("deckLayout")){

    deckLayout = parseDextrousLayout(JSON.parse(localStorage.getItem("deckLayout")))
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
        })}
    
    
    })
}else{
    //display deck selection
    let filepath = "Layout_layout (2).json"
    fetch(filepath)
    .then(response => response.json())
    .then(data => {deckLayout = parseDextrousLayout(data)})
    
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
}})
    // } else {
//display data selection
    // }
    




}



function openSettings(){
    $("#settings").show()
}

let fileHandle;
 
document.querySelector("#file_upload").onclick = async () => {
 
    [fileHandle] = await window.showOpenFilePicker(options);
 
 const file = await fileHandle.getFile();
 const content = await file.text();
 
 return content;
};

function importChange(){
    var card_import = $("#card_import").val()
    if (card_import == "Dextrous"){
        
        var file_input = document.createElement("input")
        localStorage.setItem("import", "Dextrous")
    } else {
        var file_input = document.createElement("input")
        $(file_input).attr({accept:".zip", type:"file", id:"file_upload_box"})
        $("#file_upload").html(file_input)
        localStorage.setItem("import", "Image")
    }
    localStorage.setItem("file")
}

function handSize(size){
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
        $("#draw_approve").text((keptnum < keepnum) ? `${keepnum - keptnum} remaining` : "Approve")
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
function drawCards() {
    $("#draw_dialog").animate({ top: "-100%" }, 300, 'swing')
    var drawNum = $("#draw_select").children(".selected_option").text()
    keepnum = $("#keep_select").children(".selected_option").text()
    var drawnIds = []
    var drawnCards = []
    for (var i = 0; i < drawNum; i++) {
        var randomCard = 0
        do {
            randomCard = Math.floor(Math.random() * cards.length) + 1
        } while (drawnIds.includes(randomCard))
        drawnIds.push(randomCard)
        drawnCards.push(getCard(randomCard))
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
    drawMarket.append('<div class="draw_button" id="draw_approve" style="width: fit-content"></div>')
    $("#draw_approve").text(`${keepnum - keptnum} remaining`)
    $("#draw_approve").on("click", function () {
        if (keptnum == keepnum) {
            $("#draw_market").children().each(function () {
                if ($(this).hasClass("selected_draw")) {
                    var card = drawnIds[$(this).index()]
                    hand.addCard(getCard(card))
                    localStorage.setItem("hand", JSON.stringify(hand.cards))
                    handSize(hand.cards.length)
                } else {
                    var card = $(this)
                    card.animate({ left: "-500px" }, 300, 'swing', function () { card.remove()
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

function getCard(id) {
    var card = cards[id - 1]
    return new Card(card, deckLayout)
}

window.getCard = getCard;
window.selectOption = selectOption;
window.drawCards = drawCards;
window.discardCard = discardCard;
window.cardClicked = cardClicked;
window.unfocus = unfocus;
window.showDraw = showDraw;
window.openSettings = openSettings;
window.importChange = importChange;
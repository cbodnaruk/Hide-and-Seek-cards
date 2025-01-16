import { card_template } from "./components/Card.js";
import { hand_template , market_template } from "./components/Hand.js";

export class Card {
    constructor(card_data) {
        let newCard;
        if (card_data.type === "curse") {
            newCard = $(card_template.curse);
            newCard.children(".title").text(card_data.title);
            newCard.children(".curse_content").text(card_data.content);
            newCard.children(".casting_cost").text(`CASTING COST: ${card_data.cost}` );
            let content_length = card_data.content.length + card_data.cost.length;
            let content_size = (content_length > 150) ? 1 - (content_length/2000) : 1;
            newCard.children(".curse_content").css("font-size",`${content_size}em`);
            newCard.children(".casting_cost").css("font-size",`${content_size}em`);
        } else if (card_data.type === "time_bonus") {
            newCard = $(card_template.time_bonus);
            newCard.children(".title").text("Time Bonus");
            newCard.children(".time_bonus_content").text(card_data.content);
        } else if (card_data.type === "powerup") {
            newCard = $(card_template.powerup);
            newCard.children(".title").text("Power Up");
            newCard.children(".powerup_content").text(card_data.content);
        } else {
            throw new Error("Unknown card type");
        }
        let title_length = card_data.title.length;
        let title_size = (title_length > 20) ? 2 - (title_length/50) : 2;
        newCard.children(".title").css("font-size",`${title_size}em`);



        this.DOM = newCard;
        this.id = card_data.id;
    }
    focus(){
        this.DOM.addClass("focused");
        $("#focus_background").show();
        console.log("focused");

        

    }
    print() {
        console.log(this.DOM);
    }
    
}

export class Hand {
    constructor() {
        this.cards = [];
        this.DOM = $(hand_template);
    }

    addCard(card) {
        this.cards.push(card);
        this.DOM.append(card.DOM);
        $("#player_hand").html(this.DOM);
    }

    print() {
        console.log(this.cards);
    }
}

export class Market {
    constructor() {
        this.cards = [];
        this.DOM = $(market_template);
    }

    addCard(card) {
        this.cards.push(card);
        this.DOM.append(card.DOM);
    }

    print() {
        console.log(this.cards);
    }
}

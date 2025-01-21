import { card_template } from "./components/Card.js";
import { hand_template , market_template } from "./components/Hand.js";

export class Card {
    constructor(card_data, layout) {
        let newCard
        if (layout == "image"){
            newCard = `<img alt='card image' src='${card_data.src}' class='card_image' onclick="cardClicked(this)" id='${card_data.id}'>`;
        } else {
        newCard = layout.template;
        for (const [key, value] of Object.entries(card_data)) {
            console.log(layout.fields.includes(key));
            
            if (layout.fields.includes(key)){
                newCard.children(`.${key}`).text(value);
            }
        }
        //     let content_length = card_data.content.length + card_data.cost.length;
        //     let content_size = (content_length > 150) ? 1 - (content_length/2000) : 1;
    
        // let title_length = card_data.title.length;
        // let title_size = (title_length > 20) ? 2 - (title_length/50) : 2;
        // newCard.children(".title").css("font-size",`${title_size}em`);

    }

        this.DOM = newCard;
        this.id = card_data.id;
    }
    focus(){
        $(`#${this.id}`).addClass("focused");
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

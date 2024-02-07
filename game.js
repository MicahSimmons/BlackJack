
var model = {
    parent: document.getElementById("game-container"),
    elements: { },
    message: "Foo",
    state: -1,
    value: 0,
    bet: 0,
    coins: 100,
    deck: [],
    dealOffset: 0,
    playerHand: [],
    dealerHand: []
}

const EVENT = {
    HIT: 0,
    STAY: 1,
    BUST: 2,
    BET_ONE: 3,
    BET_FIVE: 4,
    BET_DONE: 5,
    DEALER_CARD: 6,
    DEAL: 7,
    GAME_OVER: 8,
    PUSH: 9,
    PLAYER_WIN: 10,
    DEALER_WIN: 11,
    WAIT: 12
}

const STATES = {
    INIT: 0,
    ANTE: 1,
    PLAYER: 2,
    HOUSE: 3,
    EVAL: 4,
    RESTART: 5
}

const SUIT = {
    HEART: "h",
    CLUB: "c",
    DIAMOND: "d",
    SPADE: "s"
}

const VALUES = {
    ACE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
    SIX: 6,
    SEVEN: 7,
    EIGHT: 8,
    NINE: 9,
    TEN: 10,
    JACK: 10,
    QUEEN: 10,
    KING: 10
}

const IMG_CODES = {
    ACE: "01",
    TWO: "02",
    THREE: "03",
    FOUR: "04",
    FIVE: "05",
    SIX: "06",
    SEVEN: "07",
    EIGHT: "08",
    NINE: "09",
    TEN: "10",
    JACK: "11",
    QUEEN: "12",
    KING: "13"
}

const BLACKJACK = 21;
const ACE_BONUS = 10;

/***** Game Model *****/
function initModel() {
    model.message = ""
    model.state = STATES.INIT;
    setTimeout( () => {q(EVENT.DEAL)}, 500  )

    Object.keys(SUIT).forEach( (suit) => {
        Object.keys(VALUES).forEach( (key) => {
            let img = SUIT[suit] + IMG_CODES[key] + ".png";
            let card = { suit: suit, pips: key, value: VALUES[key], img: img }
            model.deck.push(card);
        })
    })
}

function shuffleDeck() {
    model.playerHand = [];
    model.dealerHand = [];

    for (let i=0; i<model.deck.length * 4; i++) {
        let swap_idx = Math.floor(Math.random() * model.deck.length);
        let card = model.deck[i%model.deck.length];
        model.deck[i%model.deck.length] = model.deck[swap_idx];
        model.deck[swap_idx] = card;
    }

    model.dealOffset = 0;
}

function dealCard() {
    let card = model.deck[model.dealOffset];
    model.dealOffset++;
    return card;
}

function evaluateHand( hand ) {
    let aces = 0;
    let value = 0;
    for (let idx=0; idx<hand.length; idx++) {
        if (hand[idx].pips == "ACE") {
            aces++;
        }
        value += hand[idx].value;
    }

    for (let bonus_idx=0; bonus_idx<aces; bonus_idx++) {
        if ((value + ACE_BONUS) <= BLACKJACK) {
            value += ACE_BONUS;
        }
    }

    return value;
}

function addElement(elementName, elementType, parent) {
    let node = document.createElement(elementType)
    node.id = elementName;
    model.elements[elementName] = node;

    if (parent == undefined) {
        model.parent.appendChild(model.elements[elementName]);
    } else {
        get(parent).appendChild(model.elements[elementName]);
    }
    return model.elements[elementName];
}

function get(elementName) {
    return model.elements[elementName];
}

function bet(ante) {
    if (ante <= model.coins) {
        model.coins -= ante;
        model.bet += ante;
    }
}

/***** VIEW ******/
function makeView() {
    addElement("titleBar", "div");

    addElement("dealerHand", "div");

    addElement("scoreBar", "div");
    {
        addElement("dealerTotal", "div", "scoreBar");
        addElement("textBox", "div", "scoreBar");
        addElement("cardTotal", "div", "scoreBar");
    }

    addElement("playerHand", "div");
    addElement("statusBar", "div");

    addElement("wallet", "div", "statusBar")
    {
        addElement("coinTotal", "div", "wallet");
        addElement("wager", "div", "wallet");
    }

    addElement("anteChoice", "div", "statusBar")
    {
        let h = addElement("betOne", "button", "anteChoice");
        h.addEventListener("click", () => {q(EVENT.BET_ONE)});
        h.innerText = "Bet 1";
        
        let s = addElement("betFive", "button", "anteChoice");
        s.addEventListener("click", () => {q(EVENT.BET_FIVE)});
        s.innerText = "Bet 5";

        let f = addElement("betFinish", "button", "anteChoice");
        f.addEventListener("click", () => {q(EVENT.BET_DONE)});
        f.innerText = "Play";

    }


    addElement("dealChoice", "div", "statusBar")
    {
        let h = addElement("hitBtn", "button", "dealChoice");
        h.addEventListener("click", () => {q(EVENT.HIT)});
        h.innerText = "Hit!";
        
        let s = addElement("stayBtn", "button", "dealChoice");
        s.addEventListener("click", () => {q(EVENT.STAY)});
        s.innerText = "Stay"
    }

    addElement("restart", "div", "statusBar") 
    {
        let s = addElement("goBtn", "button", "restart");
        s.addEventListener("click", () => {q(EVENT.WAIT)});
        s.innerText = "Play Again"        
    }
}

function hiddenHand ( target_div, cards ) {
    target_div.innerHTML = "";

    if (cards.length > 0) {
        let node = document.createElement("img")
        node.src = "cards/" + cards[0].img;
        node.width = 100;
        target_div.appendChild(node);

        let back = document.createElement("img")
        back.src = "Card-Back-05.png";
        back.width = 100;
        target_div.appendChild(back);

    }
}

function refreshHand ( target_div, cards ) {
    target_div.innerHTML = "";
    for (let i=0; i<cards.length; i++) {
        let node = document.createElement("img")
        node.src = "cards/" + cards[i].img;
        node.width = 100;
        target_div.appendChild(node);
    }
}

function refreshView() {
    get("titleBar").innerHTML = "<h1>BlackJack</h1>";
    get("textBox").innerHTML = model.message;
    get("dealerTotal").innerHTML = "Dealer Total: " + evaluateHand(model.dealerHand) + "<br><br>";
    get("cardTotal").innerHTML = "Player Total: " + evaluateHand(model.playerHand) + "<br><br>";
    get("coinTotal").innerHTML = "Score: $" + model.coins;
    get("wager").innerHTML = "Bet: $" + model.bet;

    switch (model.state) {
        case STATES.INIT:
        case STATES.ANTE:
        case STATES.PLAYER:
            get("dealerTotal").innerHTML = "Dealer Total: " + "??";
            hiddenHand(get("dealerHand"), model.dealerHand);
            break;
        default:
            get("dealerTotal").innerHTML = "Dealer Total: " + evaluateHand(model.dealerHand);
            refreshHand(get("dealerHand"), model.dealerHand);
            break;
    }
    refreshHand(get("playerHand"), model.playerHand);

    switch (model.state) {
        case STATES.INIT:
            get("anteChoice").style.display = "none";
            get("dealChoice").style.display = "none";
            get("restart").style.display = "none";
            break;

        case STATES.ANTE:
            get("anteChoice").style.display = "block";
            get("dealChoice").style.display = "none";
            get("restart").style.display = "none";
            break;
        case STATES.PLAYER:
            get("anteChoice").style.display = "none";
            get("dealChoice").style.display = "block";
            get("restart").style.display = "none";
            break;

        case STATES.HOUSE:
            get("anteChoice").style.display = "none";
            get("dealChoice").style.display = "none";
            get("restart").style.display = "none";
            break;

        case STATES.EVAL:
            get("anteChoice").style.display = "none";
            get("dealChoice").style.display = "none";
            get("restart").style.display = "none";
            break;
        
        case STATES.RESTART:
            get("anteChoice").style.display = "none";
            get("dealChoice").style.display = "none";
            get("restart").style.display = "block";
            break;
    }

}


/******* CONTROL *******/
function stateInit ( newEvent ) {
    switch (newEvent) {
        case EVENT.DEAL: {
            model.message = "";

            shuffleDeck();
            model.dealerHand.push(dealCard());
            model.dealerHand.push(dealCard());
            model.playerHand.push(dealCard());
            model.playerHand.push(dealCard());

            model.bet = 0;
            model.state = STATES.ANTE;
        } break;
    }
}

function stateAnte ( newEvent ) {
    switch (newEvent) {
        case EVENT.BET_ONE:  { bet(1) } break;
        case EVENT.BET_FIVE: { bet(5) } break;
        case EVENT.BET_DONE: { 
            if (model.bet > 0) {
                model.state = STATES.PLAYER 
            }
        } break;
    }
}

function stateDeal ( newEvent ) {
    switch (newEvent) {
        case EVENT.HIT: {
            model.playerHand.push(dealCard());
            model.value = evaluateHand(model.playerHand);

            if (model.value >= BLACKJACK) {
                model.state = STATES.HOUSE;
                setTimeout(() => { q(EVENT.DEALER_CARD)}, 500);
            }
        } break;

        case EVENT.STAY:
            model.state = STATES.HOUSE;
            setTimeout(() => { q(EVENT.DEALER_CARD)}, 500);
            break;
    }
}

function stateHouse ( newEvent ) {
    console.log("stateHouse" + newEvent );
    switch ( newEvent ) {
        case EVENT.DEALER_CARD: {
            let dealerScore = evaluateHand(model.dealerHand);
            if (dealerScore < 17) {
                model.dealerHand.push(dealCard());
                setTimeout(() => { q(EVENT.DEALER_CARD)}, 500);
            } else {
                model.state = STATES.EVAL;
                setTimeout(() => { q(EVENT.GAME_OVER)}, 500);
            }
        } break;
    }
}

function stateEval ( newEvent ) {
    switch ( newEvent ) {
        case EVENT.GAME_OVER: {
            let dealerScore = evaluateHand(model.dealerHand);
            let playerScore = evaluateHand(model.playerHand);
            if ((dealerScore > BLACKJACK) && (playerScore > BLACKJACK)) {
                setTimeout(() => { q(EVENT.PUSH)}, 100);
            } else if ((dealerScore > BLACKJACK) && (playerScore <= BLACKJACK)) {
                setTimeout(() => { q(EVENT.PLAYER_WIN)}, 100);
            } else if ((dealerScore <= BLACKJACK) && (playerScore > BLACKJACK)) {
                setTimeout(() => { q(EVENT.DEALER_WIN)}, 100);
            } else if (dealerScore == playerScore) {
                setTimeout(() => { q(EVENT.PUSH)}, 100);
            } else if (dealerScore < playerScore) {
                setTimeout(() => { q(EVENT.PLAYER_WIN)}, 100);
            } else {
                setTimeout(() => { q(EVENT.DEALER_WIN)}, 100);
            }
        } break;

        case EVENT.PUSH: {
            model.coins += model.bet;
            model.message = "Push.";
            model.state = STATES.RESTART;
        } break;

        case EVENT.PLAYER_WIN: {
            model.coins += model.bet * 2;
            model.message = "Player Win!";
            model.state = STATES.RESTART;
        } break;

        case EVENT.DEALER_WIN: {
            model.message = "Dealer Wins!";
            model.state = STATES.RESTART;
        } break;
    }
}

function stateRestart ( newEvent ) {
    switch ( newEvent ) {
        case EVENT.WAIT: {
            model.state = STATES.INIT;
            setTimeout( () => {q(EVENT.DEAL)}, 500  )        }
    }
}

function q ( newEvent ) {

    switch (model.state) {
        case STATES.INIT: { stateInit( newEvent )} break;
        case STATES.ANTE: { stateAnte( newEvent ) } break;
        case STATES.PLAYER: { stateDeal( newEvent ) } break;
        case STATES.HOUSE: { stateHouse( newEvent )} break;
        case STATES.EVAL:  { stateEval( newEvent )} break;
        case STATES.RESTART: { stateRestart( newEvent )} break;
    }

    refreshView();
}

function runGame() {
    console.log("Game Is Running!")
    initModel()
    makeView()

    refreshView()

}
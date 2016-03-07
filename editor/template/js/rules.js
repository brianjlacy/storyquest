/*
 * StoryQuest
 *
 * Copyright (c) 2013 Questor GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 * This code implements a default rules implementation. If someone would
 * like to change the rules, overlay them in the global.js. NOTE: global.js
 * MUST be ALWAYS included AFTER this file.
 */

// default item list
var items = [];

// default mods list
var mods = [];

// default buffs list
var buffs = [];

// gender codes
var GENDER_MALE = 0;
var GENDER_FEMALE = 1;


// <editor-fold desc="Global search-functions">

/**
 * Finds and returns the item matching the given Id.
 *
 * @param id
 */
function findItemById(id) {
    for (var i = 0; i < items.length; i++)
        if (items[i].id == id)
            return items[i];
    return null;
}

/**
 * Finds and returns the mod matching the given Id.
 *
 * @param id
 */
function findModById(id) {
    for (var i = 0; i < mods.length; i++)
        if (mods[i].id == id)
            return mods[i];
    return null;
}

/**
 * Finds and returns the buff matching the given Id.
 *
 * @param id
 */
function findBuffById(id) {
    for (var i = 0; i < buffs.length; i++)
        if (buffs[i].id == id)
            return buffs[i];
    return null;
}

// </editor-fold>

/* Functions which search for content in the global.js*/

// <editor-fold desc="ITEM FACTORY">
/**
 * Item service class, encapsulates item
 * operations.
 *
 * @constructor
 */


function ItemFactory() {
    var self = this;
}

/**
 * Checks if a tag is present on an item.
 * @param itemId
 * @param tagName
 * @returns value of tag or true if tag is non-value.
 */
ItemFactory.hasTag = function (itemId, tagName) {
    var item = findItemById(itemId);
    if (item != null) {
        for (var property in item.tags) {
            if (item.tags.hasOwnProperty(property)) {
                return item.tags[tagName];
            }
        }
        return undefined;
    } else
        return undefined;
};

/**
 * Sets a tag with an optional value.
 * @param itemId
 * @param tagName
 * @param value
 * @returns boolean true if successful, false otherwise.
 */
ItemFactory.setTag = function (itemId, tagName, value) {
    var item = findItemById(itemId);
    if (item != null) {
        if (typeof value == "undefined")
            value = true;
        item.tags[tagName] = value;
        return true;
    } else
        return false;
};

/**
 * Checks if an item is consumable.
 * @param itemId
 * @returns boolean true if consumable, false otherwise.
 */
ItemFactory.isConsumable = function (itemId) {
    var item = findItemById(itemId);
    if (item != null) {
        return item.consumeModifiers && item.consumeModifiers.length > 0;
    } else
        return false;
};

ItemFactory.addModifier = function (item,atr,wert) {
    var done = false;
    for (var i=0;i<item.modifiers.length;i++)
        if (item.modifiers[i]["attribute"]==atr) {
            item.modifiers[i]["value"] += wert;
            done = true;
        }
    if (!done)
        item.modifiers.push({attribute: atr, value: wert});

}

ItemFactory.removeModifier = function (item,atr){
    for (i=item.modifiers.length-1;i>=0;i--)
        if (item.modifiers[i] && item.modifiers[i]["attribute"]==atr)
            item.modifiers.splice(i,1);
}


ItemFactory.getItemPos = function (itemid, target) {
    for (i = 0; i < target.items().length; i++) {
        if (target.items()[i].id == itemid) return i;
    }
    return false;
};

/**
 * Removes a tag (sets to undefined).
 * @param itemId
 * @param tagName
 * @returns boolean true if successful, false otherwise.
 */
ItemFactory.removeTag = function (itemId, tagName) {
    var item = findItemById(itemId);
    if (item != null && item.tags && item.tags.hasOwnProperty(tagName)) {
        delete item.tags[tagName];
        return true;
    } else
        return false;
};

/**
 * Buff service class, encapsulates all item
 * operations.
 *
 * @constructor
 */


// </editor-fold>

/* Item service class, encapsulates most item operations which are character independent.*/

// <editor-fold desc="BUFF FACTORY">

function BuffFactory() {
    var self = this;
}

/**
 * Checks if a tag is present on an buff.
 * @param buffId
 * @param tagName
 * @returns value of tag or true if tag is non-value.
 */
BuffFactory.hasTag = function (buffId, tagName) {
    var buff = findBuffById(buffId);
    if (buff != null) {
        for (var property in buff.tags) {
            if (buff.tags.hasOwnProperty(property)) {
                return buff.tags[tagName];
            }
        }
        return undefined;
    } else
        return undefined;
};

/**
 * Sets a tag with an optional value.
 * @param buffId
 * @param tagName
 * @param value
 * @returns boolean true if successful, false otherwise.
 */
BuffFactory.setTag = function (buffId, tagName, value) {
    var buff = findBuffById(buffId);
    if (buff != null) {
        if (typeof value == "undefined")
            value = true;
        buff.tags[tagName] = value;
        return true;
    } else
        return false;
};

/**
 * Removes a tag (sets to undefined).
 * @param buffId
 * @param tagName
 * @returns boolean true if successful, false otherwise.
 */
BuffFactory.removeTag = function (buffId, tagName) {
    var buff = findBuffById(buffId);
    if (buff != null && buff.tags && buff.tags.hasOwnProperty(tagName)) {
        delete buff.tags[tagName];
        return true;
    } else
        return false;
};

// </editor-fold>

/* Buff service class, encapsulates most buff operations.*/

// <editor-fold desc="Character definitions, Attributes">

Character.prototype.name = "CHARACTER NAME";
Character.prototype.readPages = {};
Character.prototype.startGE = 0;
Character.prototype.startKO = 0;
Character.prototype.startKA = 0;
Character.prototype.startLE = 0;
Character.prototype.ge = ko.observable(15);
Character.prototype.ko = ko.observable(15);
Character.prototype.ka = ko.observable(15);
Character.prototype.le = ko.observable(15);
Character.prototype.rations = ko.observable(0);
Character.prototype.credits = ko.observable(0);
Character.prototype.items = ko.observableArray();
Character.prototype.buffs = ko.observableArray();
Character.prototype.previousResult = null;
Character.prototype.previousNodetype = null;
Character.prototype.previousNodeId = null;
Character.prototype.flags = {};
Character.prototype.mods = ko.observableArray();
Character.prototype.image = "";
Character.prototype.smallimage = "";
Character.prototype.isMusicOn = true;
Character.gender = 0;
Character.fontsize = -1;
Character.fontFamily = "";
Character.stationCount = 0;
Character.dialogStates = {};
Character.deepLinkId = null;
Character.prototype.slots = ko.observableArray([
    {attribute: "mainhand", value: 1},
    {attribute: "offhand", value: 1},
    {attribute: "body", value: 1},
    {attribute: "head", value: 1}
]);
Character.prototype.follower = ko.observableArray([
        {attribute: "Le", value: 15, items: ko.observableArray()}
    ]
);
Character.prototype.ge = ko.observable(15);
Character.prototype.ka = ko.observable(15);
Character.prototype.le = ko.observable(15);
Character.prototype.attacks = {
    de: {
        "stark": {
            name: "<span class='attack-title'>Stark</span><br><span class='attack-desc'>Ein starker Angriff ohne Finesse.</span>",
            ge: -1,
            damage: 1,
            dice: 0,
            desc: "Schaden+<br>Chance-",
            icon: "Angriff_2.png"
        },
        "normal": {
            name: "<span class='attack-title'>Normal</span><br><span class='attack-desc'>Ein ausgewogener Angriff.</span>",
            ge: 0,
            damage: 0,
            dice: 0,
            desc: "Schaden=<br>Chance=",
            icon: "w1.png"
        },
        "bedacht": {
            name: "<span class='attack-title'>Bedacht</span><br><span class='attack-desc'>Ein fintierter Angriff mit wenig Wucht.</span>",
            ge: +1,
            damage: -1,
            dice: 0,
            desc: "Schaden-<br>Chance+",
            icon: "Angriff.png"

        }
    },
    en:{
        "strong": {
            name: "<span class='attack-title'>Stark</span><br><span class='attack-desc'>A strong attack without refinement</span>",
            ge: -1,
            damage: 1,
            dice: 0,
            desc: "Schaden+<br>Chance-",
            icon: "Angriff_2.png"
        },
        "normal": {
            name: "<span class='attack-title'>Normal</span><br><span class='attack-desc'>A balanced attack.</span>",
            ge: 0,
            damage: 0,
            dice: 0,
            desc: "Schaden=<br>Chance=",
            icon: "w1.png"
        },
        "cautious": {
            name: "<span class='attack-title'>Cautios</span><br><span class='attack-desc'>A feint attack without much force.</span>",
            ge: +1,
            damage: -1,
            dice: 0,
            desc: "Schaden-<br>Chance+",
            icon: "Angriff.png"

        }

    }
    };
Character.prototype.player = 1;
Character.prototype.damage = 3;
Character.prototype.stockListener = [];

// </editor-fold>


/**
 * Default character implementation along with default rules.
 *
 * @constructor
 */
function Character() {
    var self = this;
    this.load = ko.computed(function () {
        return self.getLoad();
    }, this);
    this.maxLoad = ko.computed(function () {
        return self.ko() - 3;
    }, this);
    this.buffsAndMods = ko.computed(function () {
        return self.getBuffsAndMods();
    }, this);
}

Character.prototype.addStockListener = function(newStockListener) {
    if (newStockListener)
        this.stockListener.push(newStockListener);
};

// <editor-fold desc="Follower functions">

Character.prototype.giftItem = function (itemid, source, target) {
    if (!source || !target) return false;

    var item = source.items()[ItemFactory.getItemPos(itemid, source)];

    // give item to target, use model method if applicable
    if (target.give)
        this.give(item);
    else
        target.items.push(item);

    // set equipped status to false
    target.items()[target.items().length - 1].tags.equipped = false;

    // remove item from source, use model method if applicable
    if (source.looseById)
        source.looseById(itemid);
    else
        for (var i=0; i<source.items().length; i++)
            if (source.items()[i].id==itemid)
                source.items.splice(i, 1)
};

Character.prototype.addFollower = function (follower) {
    this.follower.push(follower);
};

Character.prototype.getFollowerByName = function (name) {
    for (i = 0; i < this.follower().length; i++) {
        if (this.follower()[i].name == name)
            return this.follower()[i]

    }
    return false;
};

Character.prototype.removeFollower = function (follower) {
    for (i = 0; i < this.follower().length; i++) {
        if (this.follower()[i] == follower) {
            this.follower().splice(i, 1);
            return true;
        }
    }
    return false;
};

Character.prototype.feedFollower = function(){
    this.rations(this.rations() -1 );
    this.follower()[0].le(this.follower()[0].le()+5);
    if (this.follower()[0].le()>this.follower()[0].startLE)
        this.follower()[0].le(this.follower()[0].startLE)
};

// </editor-fold>

// <editor-fold desc="Restore Attribute functions">

Character.prototype.restoreKA = function () {
    this.ka(this.startKA);
};
Character.prototype.restoreLE = function () {
    this.le(this.startLE);
};

Character.prototype.restoreGE = function () {
    this.ge(this.startGE);
};

Character.prototype.restoreKO = function () {
    this.ko(this.startKO);
};

Character.prototype.reset = function () {
    this.name = "";
    this.ge(15);
    this.ko(15);
    this.ka(15);
    this.le(15);
    this.rations(0);
    this.items.removeAll();
    this.previousResult = null;
    this.previousNodetype = null;
    this.previousNodeId = null;
    this.flags = {};
    this.mods.removeAll();
    this.buffs.removeAll();
    this.slots([
        {attribute: "mainhand", value: 1},
        {attribute: "offhand", value: 1},
        {attribute: "body", value: 1}
    ]);
    this.image = "";
    this.smallimage = "";
    this.gender = 0;
    this.fontSize = -1;
    this.fontFamily = "";
    this.stationCount = 0;
    this.credits(0);
    this.dialogStates = {};
    this.deepLinkId = null;
    this.follower.removeAll();
};

// </editor-fold>

// <editor-fold desc="Proben">




Character.prototype.addRations = function (number) {
    this.rations(this.rations() + number);
};

Character.prototype.probe = function (attributeValue, randomResult, targetValue) {
    return (attributeValue + randomResult >= targetValue);
};

Character.prototype.probe = function (attributeValue, targetValue) {
    return this.probe(attributeValue, Math.floor((Math.random() * 6) + 1), targetValue)
};

Character.prototype.probeGE = function (randomResult, targetValue) {
    return this.probe(this.ge(), randomResult, targetValue);
};

Character.prototype.probeKO = function (randomResult, targetValue) {
    return this.probe(this.ko(), randomResult, targetValue);
};

Character.prototype.probeKA = function (randomResult, targetValue) {
    var result = this.probe(this.ka(), randomResult, targetValue);
    if (!result)
        this.ka(this.ka() - 1);
    return result;
};

Character.prototype.probeGE = function (targetValue) {
    return this.probe(this.ge(), targetValue);
};

Character.prototype.probeKO = function (targetValue) {
    return this.probe(this.ko(), targetValue);
};

Character.prototype.probeKA = function (targetValue) {
    return this.probe(this.ka(), targetValue);
};

// </editor-fold>

// <editor-fold desc="Equip functions">


Character.prototype.checkSlots = function (slottype, target) {
    var result = 0;
    for (var f = 0; f < target.slots().length; f++)
        if (target.slots()[f]["attribute"] == slottype)
            result = result + parseInt(target.slots()[f]["value"] + 0);
    for (var i = 0; i < target.items().length; i++)
        if (target.items()[i].tags["equipped"] || false)
            for (var j = 0; j < target.items()[i].slots.length; j++)
                if (target.items()[i].slots[j]["attribute"] == slottype)
                    result = result - target.items()[i].slots[j]["value"];

    return result;
};

Character.prototype.getEquippedItems = function (who,type){
    var result = [] ;
    var tmp = "";
    if (typeof who.items =="function") tmp=who.items();
    else tmp=who.items;
    for (var i = 0; i < tmp.length; i++)
        if (tmp[i].tags["equipped"]==true&&(tmp[i].type==(type || tmp[i].type)))
            result.push(tmp[i]) ;

    return result;
}

Character.prototype.hasEquipped = function(item, who) {
    for (var i = 0; i < who.items().length; i++)
        if (who.items()[i].id==item.id && who.items()[i].tags["equipped"]) {
            return true;
        }
    return false;
};

Character.prototype.unEquip = function (slotType, target, amount) {
    var x = amount;
    for (var i = 0; i < target.items().length; i++) {
        if (x <= 0) return true;
        if (target.items()[i].hasOwnProperty("slots"))
            for (var j = 0; j < target.items()[i].slots.length; j++)
                if ((target.items()[i].slots[j]["attribute"] == slotType) && (target.items()[i].tags["equipped"] == true)) {
                    target.items()[i].tags["equipped"] = false;
                    x = x - target.items()[i].slots[j]["value"];
                }
    }
};

Character.prototype.unEquipById = function (id, target) {
    for (var i = 0; i < target.items().length; i++) {
        if (target.items()[i].id == id)
            target.items()[i].tags["equipped"] = false;
    }
    return true;
};

Character.prototype.bearers = function(itemId) {
    var bearers = "";
    for (var i=0; i<this.items().length; i++) {
        if (this.items()[i].id==itemId && this.items()[i].tags.equipped)
            bearers+=this.name+" ";
    }

    for (i=0; i<this.follower().length; i++) {
        for (var j=0; j<this.follower()[i].items().length; j++) {
            if (this.follower()[i].items()[i].id==itemId && this.follower()[i].items()[i].tags.equipped)
                bearers+=this.follower()[i].name+" ";
        }
    }

    return bearers;
};

Character.prototype.equipById = function (itemToEquipId, bearer) {
    var result = [];
    var focus = null;
    for (var i = 0; i < bearer.items().length; i++)
        if (bearer.items()[i].id == itemToEquipId) {
            focus = bearer.items()[i];
        }
    for (var i = 0; i < focus.slots.length; i++) {
        result[i] = this.checkSlots(focus.slots[i]["attribute"], bearer)
    }
    var eq = true;
    for (var i = 0; i < result.length; i++) {
        if (result[i] < focus.slots[i]["value"]) {
            eq = false;
            break;
        }
    }
    if (eq) focus.tags["equipped"] = true;
    else {
        for (var i = 0; i < focus.slots.length; i++) {
            console.log("differenz in waffenwert und slots:" + (focus.slots[i]["value"] - result[i]));
            this.unEquip(focus.slots[i]["attribute"], bearer, focus.slots[i]["value"] - result[i])
        }
    }
    focus.tags["equipped"] = true;
};

// gives a follower item to the model
// FIXME: this assumes there is always only ONE follower
function giveWeaponModel(elem) {
    var id = $(elem).parent().attr("data-id");
    var item = findItemById(id);
    if (item && item.type && item.type == "weapon") {
        model.unEquipById(item.id, model.follower()[0]);
        model.giftItem(item.id, model.follower()[0], model);
    }
}

// gives a model item to the first follower
// FIXME: this assumes there is always only ONE follower
function giveWeaponFollower(elem) {
    var id = $(elem).parent().parent().attr("data-id");
    var item = findItemById(id);
    if (item && item.type && item.type=="weapon" && model.follower().length>0) {
        if (model.follower()[0].items().length>0) {
            // follower already has a weapon
            // give current item back to model
            model.unEquipById(model.follower()[0].items()[0].id, model.follower()[0]);
            model.giftItem(model.follower()[0].items()[0].id, model.follower()[0], model);
        }
        // give the weapon to follower
        model.giftItem(item.id, model, model.follower()[0]);
        model.equipById(item.id, model.follower()[0]);
    }
}


// </editor-fold>

// <editor-fold desc="Update&check Attributes functions, get&set">

function consumeRation() {
    if (model.rations()>0 && model.le()<model.startLE && model.hasFlag("can_eat"))
        model.eat();
    if (model.follower().length && model.rations()>0 && model.follower()[0].le()<model.follower()[0].startLE && model.hasFlag("can_eat"))
        model.feedFollower();
}

Character.prototype.eat = function () {
    this.rations(this.rations() - 1);
    this.updateLE(5);
};

Character.prototype.addItemMod = function (index, mod) {
    //{"attribute": "ge", "value": "1", "permanent": true, "duration": "0"}
    this.items()[index].modifiers.push(mod);
    this.applyModifier(mod.attribute, mod.value);
};

Character.prototype.power = function () {
    return this.ge();
};

Character.prototype.getBuffsAndMods = function () {
    return this.mods().concat(this.buffs());
};

Character.prototype.getLoad = function () {
    var load = 0;
    for (var i = 0; i < this.items().length; i++) {
        load = load + (parseInt(this.items()[i].weight) * (this.items()[i].stock || 1));
    }
    return load;
};

Character.prototype.checkLoad = function () {
    if (this.ko() - 3 < this.getLoad())
        return false;
    else
        return true;
};

Character.prototype.updateLE = function (change) {
    this.le(this.le() + change);
    if (this.le() > this.startLE)
        this.le(this.startLE);
    if (this.le() <= 0) {
        this.setFlag('dead');
        this.le(0);
    }
    return (this.le() <= 0);
};

Character.prototype.updateGE = function (change) {
    this.ge(this.ge() + change);
    if (this.ge() > this.startGE)
        this.ge(this.startGE);
    return (this.ge() <= 0);
};

Character.prototype.updateKA = function (change) {
    this.ka(this.ka() + change);
    if (this.ka() > this.startKA)
        this.ka(this.startKA);
    return (this.ka() <= 0);
};

Character.prototype.updateKO = function (change) {
    this.ko(this.ko() + change);
    if (this.ko() > this.startKO)
        this.ko(this.startKO);
    return (this.ko() <= 0);
};

Character.prototype.hit = function () {
    return this.updateLE(-3);
};

Character.prototype.updateCredits = function (credits) {
    this.credits(this.credits() + credits);
    if (this.credits() < 0) this.credits(0);
};

Character.prototype.hasCredits = function (credits) {
    return this.credits() >= (credits || 1);
};

// </editor-fold>

// <editor-fold desc="Item functions">

Character.prototype.giveById = function (itemId) {
    console.log("Give: " + itemId);
    var abc = this.give(findItemById(itemId));
    if (abc === false)
        showBox("  Warnung","images/helm2.png-scaled-nq8.png", "Du kannst diesen Gegenstand leider nicht mitnehmen, weil du bereits zu viel trägst.","OK",function (){});
    return abc;
};

Character.prototype.hasItem = function (itemId) {
    for (var i = 0; i < this.items().length; i++)
        if (this.items()[i].id == itemId)
            return true;
    return false;
};

Character.prototype.hasItemType = function (itemtype){
    for (var i = 0; i < this.items().length; i++)
        if (this.items()[i].type == itemtype)
            return true;
    return false;
}
Character.prototype.hasItemTag = function (taaag) {
    var count = 0;
    for (var i = 0; i < this.items().length; i++)
        if (this.items()[i].tags.hasOwnProperty(taaag))
            count++;
    return (count || false);
}

Character.prototype.getInventorycount = function () {
    var result = 0;
    for (var i = 0; i < this.items().length; i++)
        result = result + (this.items()[i].stock || 1 );
    return result;
}


Character.prototype.getItemcount = function (itemid) {
    if (!this.hasItem(itemid))
        return 0;
    for (var i = 0; i < this.items().length; i++)
        if (this.items()[i].id == findItemById(itemid).id)
            return (this.items()[i].stock || 1);
}

Character.prototype.give = function (item) {
    if (!item) {
        console.log("Warning: give of null item!");
        return null;
    }
    if (this.ko() - 3 < this.getLoad() + parseInt(item.weight))
        return false;
    // only give if the item is not already in the inventory, else increase stock
    if (!this.hasItem(item.id)) {
        this.items.push(item);
        for (var s=0; s<this.stockListener.length; s++)
            this.stockListener[s](item, (this.items()[s].stock || 1));
    }
    else
        for (var i = 0; i < this.items().length; i++)
            if (this.items()[i].id == item.id) {
                this.items()[i].stock = (this.items()[i].stock || 1 ) + 1;
                for (var s=0; s<this.stockListener.length; s++)
                    this.stockListener[s](item,(this.items()[s].stock || 1)) ;
            }
    if (item["type"]!="weapon"&&item["type"]!="armor"){
        for (var i = 0; i < item.modifiers.length; i++)
            this.applyModifier(item.modifiers[i].attribute, item.modifiers[i].value);
    }
    return true;
};



Character.prototype.consume = function (item) {
    if (item.consumeNotice) {
        this.loose(item);
        if (item.consumeModifiers && item.consumeModifiers.length > 0) {
            for (var i = 0; i < item.consumeModifiers.length; i++)
                this.addMod(item.consumeModifiers[i]);
        }
        return item.consumeNotice;
    } else
        return "";
};

Character.prototype.looseById = function (itemId) {
    this.loose(findItemById(itemId));
};

Character.prototype.looseByType = function (type) {
    var ret = false;
    while (ret == false) {
        ret = true;
        for (var i = this.items().length - 1; i >= 0; i--) {
            if (this.items()[i].type == type) {
                this.looseById(this.items()[i].id);
                console.log(i);
                ret = false;
            }
        }
    }
    return ret;
};

Character.prototype.addMod = function (mod) {
    // { id: "", name: {de: ""}, desc: {de: ""}, icon: "", attribute: "ge", value: 3, permanent: false, duration: 4 }
    if (!mod.permanent)
        this.mods.push(mod);
    this.applyModifier(mod.attribute, mod.value);
};

Character.prototype.loose = function (item) {
    for (var i = this.items().length - 1; i >= 0; i--) {
        if (this.items()[i].id == item.id) {
            if ((this.items()[i].stock || 0) < 2) {
                this.items.splice(i, 1);
            }
            else {
                this.items()[i].stock--;
                for (var s=0; s<this.stockListener.length; s++)
                    this.stockListener[s](item, this.items()[i].stock);
            }
            for (var j = 0; j < item.modifiers.length; j++)
                if (!item.modifiers[j].permanent)
                // this keeps the mod in the array althought it expired - for reference purposes
                    this.applyModifier(item.modifiers[j].attribute, item.modifiers[j].value * -1);
            return true;
        }
    }
    return false;
};


Character.prototype.consumeById = function (itemId) {
    return this.consume(findItemById(itemId));
};

// </editor-fold>

// <editor-fold desc="Buff,Debuff and modifiers functions">

Character.prototype.applyModifier = function (attribute, value) {
    if (attribute == "ge")
        this.ge(this.ge() + parseInt(value));
    else if (attribute == "ko")
        this.ko(this.ko() + parseInt(value));
    else if (attribute == "ka")
        this.ka(this.ka() + parseInt(value));
    else if (attribute == "le") {
        this.le(this.le() + parseInt(value));
        this.startLE+=parseInt(value);
    }

};

Character.prototype.addBuffById = function (buffId) {
    return this.addBuff(findBuffById(buffId));
};

Character.prototype.addBuff = function (buff) {
    if (!buff) {
        console.log("Warning: give of null Buff!");
        return null;
    }
    console.log("Add buff: " + buff.id);
    this.buffs.push(buff);
    for (var i = 0; i < buff.modifiers.length; i++)
        this.applyModifier(buff.modifiers[i].attribute, buff.modifiers[i].value);
    return true;
};

Character.prototype.removeBuffById = function (buffId) {
    return this.removeBuff(findBuffById(buffId));
};

Character.prototype.removeBuff = function (buff) {
    console.log("Removing buff: " + buff.id);
    var count = 0;
    for (var i = this.buffs().length - 1; i >= 0; i--) {
        if (this.buffs()[i].id == buff.id) {
            this.buffs.splice(i, 1);
            for (var j = 0; j < buff.modifiers.length; j++)
                this.applyModifier(buff.modifiers[j].attribute, buff.modifiers[j].value * -1);
            count++;
        }
    }
    return count;
};

Character.prototype.hasBuff = function (buffId) {
    for (var i = 0; i < this.buffs().length; i++) {
        if (this.buffs()[i].id == buffId)
            return true;
    }
    return false;
};



Character.prototype.upkeep = function () {
    console.log("upkeep");
    // updating possible timed item effects
    for (var i = 0; i < this.items().length; i++)
        for (var j = 0; j < this.items()[i].modifiers.length; j++)
            if (this.items()[i].modifiers[j].duration > 0) {
                this.items()[i].modifiers[j].duration--;
                if (this.items()[i].modifiers[j].duration == 0)
                    if (!this.items()[i].modifiers[j].permanent)
                        this.applyModifier(this.items()[i].modifiers[j].attribute, this.items()[i].modifiers[j].value * -1);
            }

    // updating possible timed mod effects
    for (var k = this.mods().length - 1; k >= 0; k--) {
        if (this.mods()[k].duration > 0)
            this.mods()[k].duration--;
        if (this.mods()[k].duration == 0) {
            if (!this.mods()[k].permanent) {
                this.applyModifier(this.mods()[k].attribute, this.mods()[k].value * -1);
                this.mods().splice(k, 1);
            }
        }
    }


    // update buffs
    for (var i = 0; i < this.buffs().length; i++)
        for (var j = this.buffs()[i].modifiers.length - 1; j >= 0; j--) {
            this.buffs()[i].modifiers[j].duration--;
            if (this.buffs()[i].effect)
                eval(this.buffs()[i].effect);
            if (this.buffs()[i].modifiers[j].duration == 0) {
                this.applyModifier(this.buffs()[i].modifiers[j].attribute, this.buffs()[i].modifiers[j].value * -1);
                this.buffs().splice(i, 1);
            }
        }

    // TODO: should buffs be removed here when all modifiers of a buff has duration==0?
};

// </editor-fold>

// <editor-fold desc="Flag functions">

function enableConsumeRation() {
    $('.consumeration').removeClass('disabled');
    model.setFlag('can_eat');
}

function disableConsumeRation() {
    $('.consumeration').addClass('disabled');
    model.removeFlag('can_eat');
}

Character.prototype.setFlag = function (flag, value) {
    if (!value) {
        this.flags[flag] = true;
        return;
    }
    if (!this.flags[flag]) this.flags[flag] = value;
    else  this.flags[flag] = this.flags[flag] + value;

};

Character.prototype.hasFlag = function (flag) {
    return this.flags[flag] || false;
};

Character.prototype.removeFlag = function (flag) {
    this.flags[flag] = false;
};

Character.prototype.dropFlag = function (flag) {
    this.flags[flag] = undefined;
};

// </editor-fold>


Character.fromJSON = function (json) {
    var out = new Character();
    out.name = json.name;
    out.readPages = json.readPages;
    out.startGE = json.startGE;
    out.startKO = json.startKO;
    out.startKA = json.startKA;
    out.startLE = json.startLE;
    out.ge(json.ge);
    out.ko(json.ko);
    out.ka(json.ka);
    out.le(json.le);
    out.rations(json.rations);
    out.previousNodetype = json.previousNodetype;
    out.previousResult = json.previousResult;
    out.previousNodeId = json.previousNodeId;
    // out.stockListener = (json.stockListener || []);
    out.flags = json.flags;
    out.items(json.items);
    out.buffs(json.buffs || []);
    out.slots(json.slots || []);
    out.mods(json.mods || []);
    out.image = json.image;
    out.smallimage = json.smallimage;
    out.isMusicOn = json.isMusicOn;
    out.gender = json.gender;
    out.fontSize = json.fontSize;
    out.fontFamily = json.fontFamily;
    out.stationCount = json.stationCount || 0;
    out.credits(json.credits || 0);
    out.follower(json.follower || []);
    out.dialogStates = json.dialogStates;
    out.deepLinkId = json.deepLinkId;
    // postprocessing follower values HACK HACK HACK!
    if (json.follower) {
        for (var i=0; i<json.follower.length; i++) {
            var leben = ko.observable();
            var karma = ko.observable();
            var konst = ko.observable();
            var gesch = ko.observable();
            leben(json.follower[i].le);
            gesch(json.follower[i].ge);
            konst(json.follower[i].ko);
            karma(json.follower[i].ka);
            out.follower()[i].le = leben;
            out.follower()[i].ka = karma;
            out.follower()[i].ko = konst;
            out.follower()[i].ge = gesch;
        }
    }
    // postprocessing follower items HACK HACK HACK!
    if (json.follower) {
        for (var i=0; i<json.follower.length; i++) {
            var itemArray = ko.observableArray();
            itemArray(json.follower[i].items);
            out.follower()[i].items = itemArray;
        }
    }
    // postprocessing follower slots HACK HACK HACK!
    if (json.follower) {
        for (var i=0; i<json.follower.length; i++) {
            var slotArray = ko.observableArray();
            slotArray(json.follower[i].slots);
            out.follower()[i].slots = slotArray;
        }
    }
    return out;
};

function equipItem(elem) {
    // there is a bug in knockout preventing the attr binding on the a element after using $data in prior bindings
    var id = $(elem).parent().parent().attr("data-id");
    var item = findItemById(id);
    if (item && item.type &&(item.type=="weapon"||item.type=="armor")) {
        if (!model.hasEquipped(item, model)) {
            console.log("Equipping model with " + item.id);
            model.equipById(item.id, model);
        }
        else {
            console.log("Unequipping model with " + item.id);
            model.unEquipById(item.id, model);
        }
        refreshEquippedStates();
    }
}

function refreshEquippedStates() {
    for (var i=0; i<model.items().length; i++) {
        var id = model.items()[i].id;
        var bearers = model.bearers(id);
        if (bearers && bearers!="")
            $("tr[data-id='" + id + "'] .equippedstate").html(i18n[lang]['equippedBy'] + model.bearers(id));
        else
            $("tr[data-id='" + id + "'] .equippedstate").html("&nbsp;");
    };
}


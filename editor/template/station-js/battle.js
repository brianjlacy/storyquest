var menuMainCallback = null;
var selectMode = false;

var heroes = new Array();
var monsters = new Array();
var combatants = new Array();
var weapon = null;
var strike = null;
var activeplayer = null;
var fightlog = [];
var round = 1;
var condition_once_applied = false;
var sound = "hit.mp3";

$(window).load(function () {

    // load configuration
    currentStationId = params.station || "001";
    loadFile("../stationconfig/" + currentStationId + ".json", function (result) {
        currentStation = JSON.parse(result);
        // setting correct size for hit
        resizeBattle();

        // setting correct size for hit when resized
        $(document).resize(function () {
            resizeBattle();
        });

        // init main menu handler
        // init main menu handler
        var mainMenuHandler = function (event) {
            if (menuMainCallback) {
                playButtonSound();
                if ($(this).hasClass("button-fight"))
                    menuMainCallback("fight");
                else if ($(this).hasClass("button-items"))
                    menuMainCallback("items");
                else if ($(this).hasClass("button-magic"))
                    menuMainCallback("magic");
                else if ($(this).hasClass("button-log"))
                    menuMainCallback("log");
                else if ($(this).hasClass("button-buffs"))
                    menuMainCallback("buffs");
                else if ($(this).hasClass("button-flee"))
                    menuMainCallback("flee");
            }
        };
        $(".button-fight").click(mainMenuHandler);
        //$(".button-fight").on("touchend",mainMenuHandler);
        $(".button-items").click(mainMenuHandler);
        //$(".button-items").on("touchend",mainMenuHandler);
        $(".button-magic").click(mainMenuHandler);
        //$(".button-magic").on("touchend",mainMenuHandler);
        $(".button-log").click(mainMenuHandler);
        //$(".button-log").on("touchend",mainMenuHandler);
        $(".button-buffs").click(mainMenuHandler);
        //$(".button-buffs").on("touchend",mainMenuHandler);
        $(".button-flee").click(mainMenuHandler);
        //$(".button-flee").on("touchend",mainMenuHandler);

        uiSetBackground(currentStation.backgroundImage);


        combatInitializer();
        /// / finally call onEnter
        onEnter();
        updateBackSides();
        actionManager();
    });

    //Manage Buttons

    var tmparray=Object.keys(rules.battle_buttons);
    for (var i = 0; i<tmparray.length; i++) {
        if (rules.battle_buttons["button" + i].disabled === true)
            $('.interface')[i].className = $('.interface')[i].className + " disabled";
        if (rules.battle_buttons["button" + i].hidden === true)
            $('.interface')[i].innerText = "";
        else
            $('.interface')[i].innerText = rules.battle_buttons["button" + i].value;
    }

  });

/*Work in Progress Abomination*/

function combatInitializer() {

    fightlog.push("<b>"+i18n[lang].battlestrings.combatLog+"</b><br>", i18n[lang].battlestrings.battlebegins+"<br>");

    heroes[0] = {};
    heroes[0].name = model.name;
    heroes[0].id = "t0t4llyr3ndumstr1ng";
    heroes[0].startLE = model.startLE;
    heroes[0].le = model.le();
    heroes[0].ge = model.ge();
    heroes[0].icon = model.smallimage;
    heroes[0].damage = rules.damage_default;
    heroes[0].enemy = "defender";
    heroes[0].player = 0;
    heroes[0].attacks = model.attacks;
    heroes[0].items = model.items;
    heroes[0].slots = model.slots;
    heroes[0].buffs = model.buffs;

    if (model.follower().length > 0) {
        heroes[1] = {};
        heroes[1].name = model.follower()[0].name;
        heroes[1].id = divId(model.follower()[0].name);
        heroes[1].startLE = model.follower()[0].startLE || model.follower()[0].le();
        heroes[1].le = model.follower()[0].le();
        heroes[1].ge = model.follower()[0].ge();
        heroes[1].icon = model.follower()[0].smallimage;
        heroes[1].damage = rules.damage_default;
        heroes[1].enemy = "defender";
        heroes[1].player = 0;
        heroes[1].attacks = model.follower()[0].attacks || {
           de:{ normal: {
                ge: 0,
                dice: 0,
                damage: 0,
                name: "<span class='attack-title'>Normal</span><br><span class='attack-desc'>Ein normaler, ausgewogener Angriff.</span>",
                desc: "Dmg+0 <br /> Ge+0",
                icon: "Angriff.png"
            }},
            en:{ normal: {
                ge: 0,
                dice: 0,
                damage: 0,
                name: "<span class='attack-title'>Normal</span><br><span class='attack-desc'>Ein normaler, ausgewogener Angriff.</span>",
                desc: "Dmg+0 <br /> Ge+0",
                icon: "Angriff.png"
            }}
        };
        heroes[1].items = model.follower()[0].items;
        heroes[1].slots = model.follower()[0].slots;
    }
    //if (model.follower()[0]) combatants[1] = model.follower()[0];

    if (currentStation.monster.constructor == Object) {
        monsters[0] = {};
        monsters[0].name = currentStation.monster.name;
        monsters[0].id = divId(currentStation.monster.name);
        monsters[0].startLE = currentStation.monster.life;
        monsters[0].le = currentStation.monster.life;
        monsters[0].ge = currentStation.monster.power;
        monsters[0].damage = currentStation.monster.damage || rules.damage_default;
        monsters[0].icon = currentStation.monster.icon;
        monsters[0].enemy = "attacker";
        monsters[0].player = 1;
        monsters[0].attacks = { de:{
            "normal": {
                ge: 0,
                damage: 0,
                dice: 0
            }},
            en:{
                "normal": {
                    ge: 0,
                    damage: 0,
                    dice: 0
                }}
        }
    }
    else {
        for (var i = 0; i < currentStation.monster.length; i++) {
            monsters[i] = {};
            monsters[i].name = currentStation.monster[i].name;
            monsters[i].id = divId(currentStation.monster[i].name + i);
            monsters[i].startLE = currentStation.monster[i].life;
            monsters[i].le = currentStation.monster[i].life;
            monsters[i].ge = currentStation.monster[i].power;
            monsters[i].damage = currentStation.monster[i].damage || rules.damage_default;
            monsters[i].icon = currentStation.monster[i].icon;
            monsters[i].enemy = "attacker";
            monsters[i].player = 1;
            monsters[i].attacks = { de:{
                "normal": {
                    ge: 0,
                    damage: 0,
                    dice: 0
                }},
                en:{
                    "normal": {
                        ge: 0,
                        damage: 0,
                        dice: 0
                    }}
            }
        }
    }

    combatants = heroes.concat(monsters);

    for (var i = 0; i < combatants.length; i++) {
        combatants[i].init = 1;
        combatants[i].turn = 0;
    }

    // Creates the GUI elements for each combatant

    for (var i = 0; i < combatants.length; i++) {
        uiAddPerson(combatants[i].enemy,
            combatants[i].id,
            combatants[i].name,
            combatantBackSide(combatants[i]),
            combatants[i].icon, function (what) {
            });
        damage($("#" + combatants[i].id), 100 - parseInt(combatants[i].le / combatants[i].startLE * 100))
    }
    activeplayer = combatants[0];
        uiActive($("#" + activeplayer.id));
    fightlog.push("<br/><b>Runde " + round + " beginnt</b><br/>");
}

function divId(name) {
    var new_name = String(name).replace(/ö/g, '').replace(/ä/g, '').replace(/ü/g, '').split(" ");
    var return_name = "";
    for (var i = 0; i < new_name.length; i++) {
        return_name = return_name + new_name[i];
    }
    return return_name;
}

function addPersonRotateHandler(person, selectCallback) {
    person.click(function (event) {
        playButtonSound();

        if (selectMode) {
            console.log("Person selected..");
            if (selectCallback)
                selectCallback(person.attr("id"));
            return;
        }
        console.log("Person click, rotating.." + person);

        var thisFront = $(".front", this);
        var thisBack = $(".back", this);

        if (thisFront.css("opacity") == "0") {
            // back is currently visible
            thisFront.transition({opacity: 1, scaleX: 1}, 300, 'in');
            thisBack.transition({opacity: 0, scaleX: -1}, 300, 'in');
        } else {
            // front is currently visible
            thisBack.css({scaleX: -1});
            thisFront.transition({opacity: 0, scaleX: -1}, 300, 'in');
            thisBack.transition({opacity: 1, scaleX: 1}, 300, 'in');
            // rotate back after a while
            setTimeout(function () {
                thisFront.transition({opacity: 1, scaleX: 1}, 300, 'in');
                thisBack.transition({opacity: 0, scaleX: -1}, 300, 'in');
            }, 3000);
        }
    });
}

function resizeBattle() {
    var size = ($(window).height() > $(window).width() ? $(window).height() : $(window).width()) * 0.3;
    $(".hit").css("width", size);
    $(".hit").css("height", size);
    $(".effect").css("width", size);
    $(".effect").css("height", size);
    $(".hit").css("z-index", -2000);
    $(".effect").css("z-index", -2000);
}

function damage(personElem, damagePercent) {
    if (damagePercent < 100) {
        $(".damage", personElem).transition({height: damagePercent + "%", opacity: 0.5}, 500, 'in');
        $(".front", personElem).transition({"-webkit-filter": "grayscale(0%)", opacity: 1}, 500, 'in');
    }
    else {
        $(".damage", personElem).transition({height: "100%"}, 500, 'in');
        setTimeout(function () {
            //$(".damage", personElem).transition({opacity: 0}, 500, 'in');
            $(".front", personElem).transition({"-webkit-filter": "grayscale(100%)", opacity: 1}, 500, 'in');
        }, 500)
    }
}

function hit(attacker, defender, callback) {
    //uichange=true ;
    $(".hit").css("z-index", 2000);
    attacker.css("z-index", 1000);
    defender.css("z-index", 500);

    var defenderX = defender.position().left + defender.width() / 2;
    var defenderY = defender.position().top + defender.height() / 2;
    var attackerX = attacker.position().left + attacker.width() / 2;
    var attackerY = attacker.position().top + attacker.height() / 2;

    var deltaX = (defenderX - attackerX) * 0.8;
    var deltaY = (defenderY - attackerY) * 0.8;

    attacker.transition({x: deltaX, y: deltaY}, 300, 'easeInQuint', function () {
        attacker.transition({x: 0, y: 0}, 300, 'in');
        $(".hit").css({top: defenderY - $(".hit").height() / 2, left: defenderX - $(".hit").width() / 2});
        $(".hit").transition({opacity: 0.9, rotate: '30deg'}, 200, 'easeInQuint', function () {
            $(".hit").transition({opacity: 0, rotate: '-30deg'}, 200, 'easeInQuint', function () {
                $(".hit").css("z-index", -2000);
                if (callback)
                    callback();
            });
        });
        defender.toggleClass("shake");
        setTimeout(function () {
            defender.toggleClass("shake");
        }, 100);
    });
}

function effect(person, callback) {
    $(".effect").css("z-index", 2000);
    var personX = person.position().left + person.width() / 2;
    var personY = person.position().top + person.height() / 2;
    $(".effect").css({top: personY - $(".effect").height() / 2, left: personX - $(".effect").width() / 2});
    $(".effect").transition({opacity: 0.9, rotate: '45deg'}, 500, 'linear', function () {
        $(".effect").transition({opacity: 0, rotate: '90deg'}, 500, 'linear');
        setTimeout(function () {
            $(".effect").css({rotate: '0deg'});
            $(".effect").css("z-index", -2000);
            if (callback)
                callback();
        }, 500);
    });
}

/* UI service methods */

/*
 Call like this:

 uiAddPerson(
 "attacker", "a5", "Laber Rabarber", "Lala Lala", "character.png",
 function(what) {console.log(what)}
 )

 -> Callback gets called with id of person.
 */

function uiAddPerson(type, id, name, backHTML, imageUrl, callback) {
    if ($("#" + id).length > 0)
        throw "Element with given id already exists.";
    var personHTML =
        '<div class="person" style="opacity:0" id="' + id + '">' +
        '<div class="back">' +
        '<div class="name">' + name + '</div>' +
        '<div class="text">' + backHTML + '</div>' +
        '</div>' +
        '<div class="front" style="background-image: url(../images/' + imageUrl + ')">' +
        '<div class="damage"></div>' +
        '<div class="name">' + name + '</div>' +
        '<div class="percentage"></div>' +
        '</div>' +
        '</div>';
    if (type == "attacker")
        $(".enemyarea").append(personHTML);
    else
        $(".heroarea").append(personHTML);
    var newPerson = $("#" + id);
    $(".person .front").addClass("shadowed");
    $(".person .back").addClass("shadowed");
    addPersonRotateHandler(newPerson, callback);
    newPerson.transition({opacity: 1}, 500, 'in');
    return newPerson;
}

function uiActive(person) {
    person.toggleClass("active");
}

/**
 * Plays a battle round.
 *
 * @param attacker JQuery object of attacker.
 * @param defender JQuery object of defender.
 * @param damagePercent Final percent of damage on the defender.
 * @param damageValue Relative value of the damage on the defender.
 */
function uiBattleRound(attacker, defender, damagePercent, damageValue, callback) {
    hit(attacker, defender, function () {
        damage(defender, damagePercent);
        uiShowDamage(defender, damageValue);
        if (callback)
            callback();
    })
}

function uiHeal(person, damagePercent, callback) {
    effect(person, function () {
        damage(person, damagePercent);

    })
    if (callback) callback();
}

/*
 Call like this:

 uiShowMainMenu( function(what) { console.log(what) } );

 -> Callback gets called with type of clicked entry:
 "fight", "items", "magic", "log", "buffs", "flee"

 */
function uiShowMainMenu(callback) {
    menuMainCallback = callback;
    $(".menu-main").show();
    $(".menu-list").hide();
}

/*
 Call like this:

 uiShowList( [
 { iconUrl:'lala', label:'lala2333', extras:'blah blub', id: "i1"},
 { iconUrl:'lala', label:'lala2333', extras:'blah blub', id: "i2"},
 { iconUrl:'lala', label:'lala2333', extras:'blah blub', id: "i3"}
 ] , function(what) { console.log(what) } )

 -> Callback gets called with id of clicked entry.

 */
function uiShowList(listEntries, callback) {
    $(".menutable-list").empty();
    var handler = function (event) {
        playButtonSound();
        if (callback)
            callback($(this).attr("id"));
        console.log($(this).attr("id"))
    };
    for (var i = 0; i < listEntries.length; i++) {
        if ($("#" + listEntries[i].id).length > 0)
            throw "Element with given id already exists.";
        $(".menutable-list").append(
            '<div class="menurow" ontouchstart="" id="' + listEntries[i].id + '">' +
            '<div class="menurow-tr">' +
            '<div class="listentry"><img src="../images/' + listEntries[i].iconUrl + '"></div>' +
            '<div class="listentry">' + listEntries[i].label + '</div>' +
            '<div class="listentry">' + listEntries[i].extras + '</div>' +
            '</div>' +
            '</div>'
        );
        $("#" + listEntries[i].id).click(handler);
    }
    $(".menu-main").hide();
    $(".menu-list").show();
}

function uiShowDamage(person, damageValue, callback) {
    $("body").append("<div class='damagetext'></div>");
    $(".damagetext").css("z-index", 2000);
    $(".damagetext").html(damageValue);
    var personX = person.position().left + person.width() / 2;
    var personY = person.position().top + person.height() / 2;
    $(".damagetext").css({top: personY - $(".damagetext").height() / 2, left: personX - $(".damagetext").width() / 2});
    $(".damagetext").transition({opacity: 0.9, y: -100}, 500, 'linear', function () {
        $(".damagetext").transition({opacity: 0, y: -200}, 500, 'linear', function () {
            $(".damagetext").css({y: 200});
            $(".damagetext").css("z-index", -2000);
            $(".damagetext").remove();
            if (callback)
                callback();

        });
    });

}

function uiShowMessage(text) {
    $(".message").html(text);
}

function uiSetSelectMode(isSelectMode, callback) {
    selectMode = isSelectMode;
    var clickHandler = function (event) {
        playButtonSound();
        callback($(this).attr("id"));
        $(".person").off("click.selectTarget");
    };
    $(".person").on("click.selectTarget", clickHandler);
}

function uiHighlightAttacker() {
    $(".enemyarea .person .front").toggleClass("shadowed");
    $(".enemyarea .person .back").toggleClass("shadowed");
    //$(".enemyarea .person").toggleClass("pulsing");
    for(var i=0;i<monsters.length;i++) {
        if(monsters[i].le>0) $("#"+monsters[i].id).toggleClass("pulsing");
    }
}

function uiHighlightDefender() {
    $(".enemyarea .person .front").toggleClass("shadowed");
    $(".enemyarea .person .back").toggleClass("shadowed");
    $(".heroarea .person").toggleClass("pulsing");
}

function uiShowModalOne(sizeClass, text, button1label, callback1) {
    $(".lockscreen").show();
    $(".modal").removeClass("modal-small").removeClass("modal-large").addClass(sizeClass).show();
    $(".modal .content").html(text);
    $(".modal .button1").html(button1label);
    $(".modal .button2").hide();
    $(".modal .button1").click(function () {
        playButtonSound();
        $(this).off("click");
        $(".modal").hide();
        $(".lockscreen").hide();
        callback1();
    });
}

function uiShowModalTwo(sizeClass, text, button1label, button2label, callback1, callback2) {
    $(".modal").removeClass("modal-small").removeClass("modal-large").addClass(sizeClass).show();
    $(".modal .content").html(text);
    $(".modal .button1").html(button1label);
    $(".modal .button2").show();
    $(".modal .button2").html(button2label);
    $(".modal .button1").click(function () {
        playButtonSound();
        $(this).off("click");
        $(".modal").hide();
        callback1();
    });
    $(".modal .button2").click(function () {
        playButtonSound();
        $(this).off("click");
        $(".modal").hide();
        callback2();
    });
}

function uiSetBackHTML(person, backHTML) {
    $(".text", person).html(backHTML);
}

function uiSetBackground(imageUrl) {
    $(".stage").css("background-image", "url(../images/" + imageUrl + ")");
}

function gauss (zahl) {
    return (0.5 * zahl)*(Math.abs(zahl)+1);
}

function getPercentage (zahl){
    tmp=(zahl>0);
    result =(gauss(rules.battle_dice.sides)+(Math.abs(zahl)/zahl||1)*(gauss(rules.battle_dice.sides)-gauss(rules.battle_dice.sides-Math.abs(zahl)) ) -(tmp*zahl)  ) /(rules.battle_dice.sides*rules.battle_dice.sides*rules.battle_dice.count*rules.battle_dice.count);
    (result>1)? result=1 : (result<0) ? result=0 : {};
    return result;
}

function uiShowPercentages(modi) {

    for (var x = 0; x < monsters.length; x++) {
        var zustaende = 0;
        var wuerfelmodi = combatants[0].ge +getWeaponAttribute(combatants[0], "ge")+modi.ge - monsters[x].ge;
        var percentage = getPercentage(wuerfelmodi)

        /*console.log(wuerfelmodi+''+monsters[x].id);
         for (var i = 1; i <= rules.battle_dice.sides; i++) {
         for (var j = 1; j <= rules.battle_dice.sides; j++) {
         if ((i + wuerfelmodi) >= j) zustaende += 1;
         }
         }
         var wtf = (rules.battle_dice.sides * rules.battle_dice.sides);
         var intpercentage = parseInt((zustaende / wtf)*100);*/
        if (monsters[x].le>0) $('.enemyarea #' + monsters[x].id + ' .percentage').html("Chance:<br/>"+parseInt(percentage*100)+"%");
        else $('.enemyarea #' + monsters[x].id + ' .percentage').html("");
    }
    $('.enemyarea .percentage').show();
};

function uiDisablePercentages(){
    $('.enemyarea .percentage').hide();
};

/*logic begins here.*/

// This is the main function which can respond to the users input and calls the respective functions
// The user input is handled via the html elements of the clicked buttons (strings).

function actionManager() {
    uiShowMainMenu(function (selected) {
        playButtonSound();
        var tmp = {};

        if (selected == "fight")
            fightCircle();
        if (selected == "log") {
            uiShowModalOne("modal-large", fightlog, i18n[lang].back, function () {
                actionManager()
            })
        }
        if (selected == "flee") {
            if (currentStation.escapeTarget == "%ESCAPETARGET%")
                uiShowModalOne("modal-small", i18n[lang].battlestrings.escapebattlefalse, i18n[lang].back, function () {
                });
            else tryEscape();
        }
        if (selected == "magic") {
           spellCircle();
        }

        if (selected == "items")
            itemcircle();
    })
}

//This returns an array with the formatted weapons from the chosen character(param) to be used by uiShowList
// The current equipped weapon is always shown at the top of the list

function getFormWeapons(fighter) {
    var tmp = model.getEquippedItems(activeplayer);
    var result = []
    var overlay = false;
    console.log(tmp, tmp.length);
    if (tmp[0]) {
        for (var i = 0; i < tmp.length; i++)
            if (tmp[i]["type"] == "weapon") {
                result.push({iconUrl: tmp[i].icon, label: tmp[i].name[lang], extras: "", id: tmp[i].id});
                overlay = true;
            }
    }
    console.log(result);
    for (var j = 0; j < fighter.items().length; j++) {
        if (fighter.items()[j].type == "weapon") {
            if (overlay) {
                console.log(result[0].id, fighter.items()[j].id);
                if (fighter.items()[j].id != (result[0].id)) {
                    result.push({
                        iconUrl: fighter.items()[j].icon,
                        label: fighter.items()[j].name[lang],
                        extras: "",
                        id: fighter.items()[j].id
                    });
                }
            }
            else {
                result.push({
                    iconUrl: fighter.items()[j].icon,
                    label: fighter.items()[j].name[lang],
                    extras: "",
                    id: fighter.items()[j].id
                });

            }
        }
        console.log(result);

    }
    if (result.length == 0) result.push({
        iconUrl: "spitzhacke.png",
        label: fighter.name + i18n[lang].battlestrings.hasnoWeapon,
        extras: "",
        id: "emptyhands"
    });
    return result;
}

//This returns an array with the formatted attack types from the chosen character(param) to be used by uiShowList

function getFormAttackTypes(character) {
    var result = [];
    for (var key in character.attacks[lang])
        if (character.attacks[lang].hasOwnProperty(key))
            result.push({
                iconUrl: character.attacks[lang][key].icon,
                label: character.attacks[lang][key].name,
                extras: character.attacks[lang][key].desc,
                id: key
            });
    console.log (result);
    return result;
}


// useCombatFunction executes the functions stored in the chosen item, or shows a message box telling the player that the item isn't usable in combat

function useCombatFunction(item) {
    console.log(i18n[lang].wordItem + " " + item.id + i18n[lang].isbeing + " " + i18n[lang].battlestrings.uses);
    if (item.combatUse)
        eval(item.combatUse);
    else
        uiShowModalOne("modal-small", i18n[lang].battlestrings.itemnotusable, i18n[lang].back, function () {
        });
}

// getWeaponAttribute returns the accumulated modifiers of the given attribute(param) among the equipped items of the chosen character(param)

//This handles the actual dealing and visualizing of combat damage. It invokes the damage functions, then the uiBattleround(s) and the cleanUpmanager

function combatManager(combatant, target) {
    uiDisablePercentages();
    var ally = false;
    for (var i = 0; i < heroes.length; i++)
        if (heroes[i] == target)
            ally = true;
    if ((target != combatant) && (!ally) && ((target.le) > 0) && (combatant.le > 0)) {
        var action1 = strike;
        var action2 = target.attacks[lang]["normal"];
        var selection;

        combatant.enemy == "attacker" ? selection = heroes : selection = monsters;
        console.log(target, action1);

        //calculation first attack

        notice1 = "";
        damagedealt1 = calcAttack(combatant, target, action1);
        var nummer1 = fightlog[fightlog.length - 1];
        uiShowMessage(nummer1);
        damagepercent1 = getDamagePercent(target, damagedealt1);
        damagedealt1 == 0 ? notice1 = i18n[lang].battlestrings.missed : notice1 = damagedealt1;
        target.le = target.le - damagedealt1;
        if (target.le <= 0) {
            fightlog.push(target.name + i18n[lang].battlestrings.dies + " " + i18n[lang].htmlbreak);
            var nummer2 = fightlog[fightlog.length - 1];
            setTimeout(function () {
                uiShowMessage(nummer2)
            }, 1000);
            $("#" + target.id).toggleClass("pulsing");
        }
        combatant.turn = 1;

        //calculation counter attack
        if (target.le > 0) {
            notice2 = "";
            damagedealt2 = calcAttack(target, combatant, action2);
            var nummer3 = fightlog[fightlog.length - 1];
            setTimeout(function () {
                uiShowMessage(nummer3)
            }, 2000);
            damagepercent2 = getDamagePercent(combatant, damagedealt2);
            damagedealt2 == 0 ? notice2 = i18n[lang].battlestrings.missed : notice2 = damagedealt2;
            combatant.le = combatant.le - damagedealt2;
            if (combatant.le <= 0) {
                fightlog.push(combatant.name +i18n[lang].battlestrings.dies + " " + i18n[lang].htmlbreak);
                var nummer4 = fightlog[fightlog.length - 1]
                setTimeout(function () {
                    uiShowMessage(nummer4)
                }, 3000);
            }
            target.turn = 1;
        }
        uiActive($("#" + activeplayer.id));
        if (notice1 == i18n[lang].battlestrings.missed) sound = "vorbei.mp3";
        else sound = "hit.mp3";
        playSFXOnce("sounds/" + sound);
        uiBattleRound($("#" + combatant.id), $("#" + target.id), 100 - damagepercent1, notice1, function () {
            if (target.le > 0)
                setTimeout(function () {
                    if (notice2 == i18n[lang].battlestrings.missed) sound = "vorbei.mp3";
                    else sound = "hit.mp3";
                    playSFXOnce("sounds/" + sound);
                    uiBattleRound($("#" + target.id), $("#" + combatant.id), 100 - damagepercent2, notice2, function () {
                        cleanUpManager(combatants);
                    })
                }, 1400);
            else cleanUpManager(combatants);

        })
    }
    else {
        uiActive($("#" + activeplayer.id));
        uiShowMessage("");
        cleanUpManager(combatants);
    }
}

function getWeaponAttribute(character, atr) {
    if (character.items) {
        tmp = model.getEquippedItems(character);
        result = 0;
        for (var i = 0; i < tmp.length; i++)
            for (var j = 0; j < tmp[i].modifiers.length; j++)
                if (tmp[i].modifiers[j] && tmp[i].modifiers[j]["attribute"] == atr)
                    result += tmp[i].modifiers[j]["value"];
        return result;
    }
    else return 0;

}
// calcAttack is the mathmatical function to calculate the raw damage the attacker(param) deals to the defender(param) when using a certain attacktype(param)
// It also writes the corresponding entrys for the battle log./


weakDeclare("calcAttack",function (attacker, defender, attacktype) {
    var schaden = 0;
    var angriffswurf = 0;
    var verteidigungswurf=0;
    for (var i=0;i<rules.battle_dice.count;i++) {
        angriffswurf += (Math.floor(Math.random() * (rules.battle_dice.sides + attacktype.dice ) + 1));
        verteidigungswurf += (Math.floor(Math.random() * (rules.battle_dice.sides ) + 1));
    }
    var angriffergebnis = (attacker.ge) + attacktype.ge + getWeaponAttribute(attacker, "ge") + angriffswurf;
    var verteidigungergebnis = (defender.ge) + getWeaponAttribute(defender, "ge") + verteidigungswurf;

    fightlog.push(attacker.name +" "+ i18n[lang].battlestrings.dicethrowproc +" "+ angriffswurf +" "+ i18n[lang].battlestrings.dicethrowvalue +" " + angriffergebnis + "<BR/>");
    fightlog.push(defender.name +" "+ i18n[lang].battlestrings.dicethrowproc +" "+ verteidigungswurf +" "+ i18n[lang].battlestrings.dicethrowvalue +" " + verteidigungergebnis + "<BR/>");

    console.log(attacker.name + " " + angriffswurf);
    console.log(defender.name + " " + verteidigungswurf);

    if (attacker.player == 0) angriffergebnis += 1; //so player characters get the advantage on even rolls.

    if (angriffergebnis > verteidigungergebnis) {
        schaden = attacker.damage + attacktype.damage - getWeaponAttribute(defender, "armor");
        fightlog.push(attacker.name + " " + i18n[lang].battlestrings.attacks + " " + defender.name + " an und trifft!<BR/>");
        fightlog.push(attacker.name + " " + i18n[lang].battlestrings.deals + " " + schaden + " Schaden zu!<BR/>");
    }
    else fightlog.push(attacker.name + " " + i18n[lang].battlestrings.attacks + " " + defender.name + " an und verfehlt!<BR/>");
    return schaden;
});

// This return the percentual damage value (Integer) when the combatant(param) receives damage(param).
// e.g. : combatant.le = 30, combatant.maxLE = 50,damage=10 : getDamagePercent would return 40, because you now have 40%(20 life of 50) remaining

function getDamagePercent(combatant, damage) {
    console.log(parseInt((combatant.le - damage) / combatant.startLE * 100));
    if (!damage) damage = 0;
    return parseInt(((combatant.le - damage) / combatant.startLE * 100));
}

//This returns an array with objects for uiShowList. It uses the items array of the activeplayer. The first element is always a return button.
//createinventory only shows items that either have the weapon,armor, or consumable type.
function createInventory() {
    var result = [{iconUrl: "returnarrow.png", label: i18n[lang].battlestrings.returntomenu, extras: "", id: "returnbutton"}];
    for (var i = 0; i < activeplayer.items().length; i++)
        if ((activeplayer.items()[i].type == "weapon" || ((activeplayer.items()[i].type == "consumable")&&activeplayer.items()[i].combatUse) || activeplayer.items()[i].type == "armor"))
            result.push({
                iconUrl: activeplayer.items()[i].icon,
                label: activeplayer.items()[i].name[lang],
                extras: i18n[lang].count+"<br>" + ((activeplayer.items()[i].stock) || 1),
                id: activeplayer.items()[i].id
            });
    return result;
}

function createSpellBook() {
    var result = [{
        iconUrl: "returnarrow.png",
        label: i18n[lang].battlestrings.returntomenu,
        extras: "",
        id: "returnbutton"
    }];
    for (var i = 0; i < activeplayer.buffs().length; i++)
        if ((activeplayer.buffs()[i].type == "spell" && activeplayer.buffs()[i].combatUse))
            result.push({
                iconUrl: activeplayer.buffs()[i].icon,
                label: activeplayer.buffs()[i].name[lang],
                extras: "",
                id: activeplayer.buffs()[i].id
            });
    return result;
}

//This removes the given item from the inventory of the active player, respectively decreases the stock count of said item
function removeFromActive(item) {
    for (var i = 0; i < activeplayer.items().length; i++)
        if (activeplayer.items()[i].id == item.id)
            if (activeplayer.items()[i].stock || activeplayer.items()[i].stock > 1)
                activeplayer.items()[i].stock -= 1;
            else
                activeplayer.items().splice(i, 1);
}

//checks if there is a valid escapetarget and makes the appropriate check. If the player succeeds uiShowModalOne is called with a tostation() callback.
//In case of failure or no valid escapetarget uiShowModalOne is called with no callback and a corresponding message.

function tryEscape() {
    var blockmonster = null;
    playSFXOnce("sounds/dice.mp3");
    for (var i = 0; i < monsters.length; i++) {
        if (monsters[i].le > 0) {
            blockmonster = i;
            break
        }
    }
    var yourThrow = (Math.floor(Math.random() * (6) + 1) + eval(currentStation.escapeCheckValue));
    var monsterThrow = (Math.floor(Math.random() * (6) + 1) + eval(currentStation.escapeCheckVersus));
    if (yourThrow < monsterThrow) {
        combatants[0].le = combatants[0].le - rules.damage_default;
        uiShowModalOne("modal-small", i18n[lang].battlestrings.escapeattempt + yourThrow + i18n[lang].battlestrings.escapeattemptfail + monsterThrow + ". "+i18n[lang].battlestrings.tryagain , i18n[lang].back, function () {
            uiBattleRound($("#" + monsters[blockmonster].id), $("#" + heroes[0].id), 100 - (heroes[0].le / heroes[0].startLE * 100), rules.damage_default, function () {
                cleanUpManager(combatants);
            });
        });
    }
    else uiShowModalOne("modal-small", i18n[lang].battlestrings.escapesuccess +"!", "Ok", function () {
        toStation(currentStation.escapeTarget)
    });
}

// This function handles all the events at the end of a turn. This includes synchronising the hp to the real models, updating the backsides, run the special
// combat conditions (if there are any), check if the fight is over, and running the cleanUi function to reset the user interface.

function cleanUpManager() {
    syncLe();
    conditionRecurring();
    conditionOnce();
    updateBackSides();
    turnManager();
    checkFightResult();
    cleanUi();
    actionManager();
}

//checks for heroes that didn't attack this "round" or else prepares a new round with corresponding fightlog entries

function turnManager() {

    for (var i = 0; i < heroes.length; i++) {
        if (heroes[i].turn == 0 && heroes[i].le > 0) {
            activeplayer = heroes[i];
            return
        }
    }

    for (var i = 0; i < heroes.length; i++)
        heroes[i].turn = 0;
    round++;
    fightlog.push("<br/><b>"+i18n[lang].roundnr +" "+ round +" "+ i18n[lang].begins+ "</b><br/>");
    activeplayer = heroes[0];

}

// cleanUi resets the gui to the point at which a new round can begin

function cleanUi() {
    selectMode = false;
    uiActive($("#" + activeplayer.id));
}

//checks if either the whole monster side or the main character has no health points anymore and calls tostation() with the corresponding target station

function checkFightResult() {
    var monsterhealth = 0;
    for (var i = 0; i < monsters.length; i++)
        monsterhealth = monsterhealth + monsters[i].le;

    if (combatants[0].le == 0)
        uiShowModalOne("modal-small",i18n[lang].battlestrings.dyingmessage+"..." , i18n[lang].next, function () {
            toStation(currentStation.lostTarget)
        });

    if (monsterhealth == 0)
        uiShowModalOne("modal-small", i18n[lang].battlestrings.succesmessage+"!", i18n[lang].next, function () {
            toStation(currentStation.wonTarget)
        });

}

//writes the current le of the heroes array in the corresponding model and follower attributes

function syncLe() {
    if (model)model.le(combatants[0].le);
    if (model.follower()[0] && heroes[1])model.follower()[0].le = heroes[1].le;
    if (model.follower()[0] && model.follower()[0].le <= 0) model.removeFollower(model.follower()[0]);
    if (model.follower()[1] && heroes[2])model.follower()[1].le = heroes[2].le;
    if (model.follower()[1] && model.follower()[1].le <= 0) model.removeFollower(model.follower()[0]);
}

//calls combatantBackSide for all combatants

function updateBackSides() {
    for (var i = 0; i < combatants.length; i++) {
        if (combatants[i].le < 0)
            combatants[i].le = 0;
        $('#' + combatants[i].id + " .text").html(combatantBackSide(combatants[i]));
    }

}

//updates the backsides with the current stats

function combatantBackSide(dude) {
    var text = dude.name + "<br/>" + "Ge: " + dude.ge + "<br/>" + "Le: " + dude.le + "/" + dude.startLE;
    if (getWeaponAttribute(dude, "ge")!=0) text=text+"<br/>"+i18n[lang].geK+"&#8209;Bonus:"+getWeaponAttribute(dude, "ge");
    if (getWeaponAttribute(dude,"armor")!=0) text=text+"<br/>"+i18n[lang].armor+":"+ getWeaponAttribute(dude, "armor");
    return text;
}

function skipTurn () {
    fightlog.push(activeplayer.name + i18n[lang].unarmed+ "</BR>");
    uiShowMessage(fightlog[fightlog.length - 1]);
    activeplayer.turn = 1;
    uiActive($("#" + activeplayer.id));
    cleanUpManager(combatants);
}

function getAttackDamage(weaponid) {
    uiShowMessage(i18n[lang].battlestrings.selectAttack);
    for (var i = 0; i < activeplayer.items().length; i++)
        if (activeplayer.items()[i].id == weaponid)
            for (var j = 0; j < activeplayer.items()[i].modifiers.length; j++)
                if (activeplayer.items()[i].modifiers[j]["attribute"] == "damage")
                    activeplayer.damage = activeplayer.items()[i].modifiers[j].value || rules.damage_default;

    if (activeplayer.name == model.name)
        model.equipById(weaponid, model);
}


function fightCircle() {
    var clickablelist = true;
    uiShowMessage(i18n[lang].battlestrings.selectWeapon);
    uiShowList(getFormWeapons(activeplayer), function (whatto) {
            //playButtonSound();
            if (getFormWeapons(activeplayer)[0].id == "emptyhands") {
                skipTurn();
            }
            else {
                var callback01=function (what) {
                    //playButtonSound();

                    for (var key in activeplayer.attacks[lang]) {
                        if (key == what)
                            strike = activeplayer.attacks[lang][key];
                    }
                    uiShowPercentages(strike);
                    if (clickablelist) {
                        clickablelist = false;
                        uiHighlightAttacker();
                        uiShowMessage(i18n[lang].battlestrings.selectOpponent);
                        uiSetSelectMode(true, function (who) {
                            uiHighlightAttacker();
                            playButtonSound();
                            for (var i = 0; i < combatants.length; i++) {
                                if (combatants[i].id == who) {
                                    combatManager(activeplayer, combatants[i]);
                                    console.log(combatants[i]);
                                }
                            }

                        })
                    }
                }
                if ((Object.keys(activeplayer.attacks[lang]).length==1)&&activeplayer.attacks[lang]["normal"]) {
                    callback01("normal");
                    getAttackDamage(whatto);
                }
                else {
                    getAttackDamage(whatto);
                    uiShowList(getFormAttackTypes(activeplayer), callback01)
                }
            }
        }
    );
}

function spellCircle(){
    uiShowList(createSpellBook(), function (param) {
        console.log(param);
        if (param == "returnbutton")
            actionManager();
        else {
            clickedspell = null;
            for (var i = 0; i < activeplayer.buffs().length; i++)
                if (activeplayer.buffs()[i].id == param)
                    clickedspell = activeplayer.buffs()[i];
            console.log(clickedspell);
            eval(clickedspell.combatUse);
            updateBackSides();
            actionManager();
        }
    })
}

function itemcircle() {
    uiShowList(createInventory(), function (param) {
        console.log(param);
        if (param == "returnbutton")
            actionManager();
        else {
            clickeditem = null;
            for (var i = 0; i < activeplayer.items().length; i++)
                if (activeplayer.items()[i].id == param)
                    clickeditem = activeplayer.items()[i];
            console.log(clickeditem);
            if (clickeditem.type == "weapon" || clickeditem.type == "armor") {
                model.equipById(clickeditem.id, activeplayer);
                updateBackSides();
                uiShowModalOne("modal-small", clickeditem.name[lang] + i18n[lang].battlestrings.itemequip, "Ok", function () {
                });
                fightlog.push(clickeditem.name[lang] + i18n[lang].battlestrings.equippedby + activeplayer.name + i18n[lang].battlestrings.equipped + "<br/>");
                // console.log(clickeditem.id);
            }
            else if (clickeditem.type == "consumable") {
                uiShowModalTwo("modal-small", "<b>" + clickeditem.name[lang] + "</b><br>" + clickeditem.desc[lang] + "<br>" + clickeditem.name[lang] + " " + i18n[lang].useitem.toLowerCase(), i18n[lang].yes, i18n[lang].no, function () {
                    useCombatFunction(clickeditem);
                    removeFromActive(clickeditem);
                    fightlog.push(activeplayer.name + i18n[lang].battlestrings.uses + clickeditem.name[lang]);
                    actionManager()
                }, function () {
                })
            }
        }
    });
}



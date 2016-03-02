// project specific implementations// ALWAYS INCLUDE AFTER rules.js AND storyquest.js

// is the slideout visible or not
var visible = false;

// some configuration
var slideoutPanelHeightFactor = 0.8;

// setup animation for slideout
var bodyHeight = 0;
var intendedSlideHeight = 0;

// global node ids
var NODEID_HELP = "0000-help";
var NODEID_ABOUT = "0000-about";
var NODEID_MENU = "0000-create";
var NODEID_BOOKMARKS = "0000-bookmarks";
var NODEID_TUTORIAL = "0000-tutorial";

// toolbar icon active/inactive state
var tState = {
    button_character: false,
    button_menu: false,
    button_inventory: false
};

/**
 * Init functions, run when the DOM rendering is complete.
 */
$(window).load(function(){

    // calculate heights on DOM-ready
    bodyHeight = pixVal($("#body").css("height"));
    intendedSlideHeight= bodyHeight*slideoutPanelHeightFactor;

    // Kindle Font Size Workaround
    // Kindle Fire HD 8.9: Android 4.0.3 KFJWA Build/IML74K AppleWebKit/534.30
    // Kindle Fire HD 7: Android 4.0.3 KFTT Build/IML74K AppleWebKit/534.30
    if (navigator.userAgent.indexOf("KFJWA")!=-1 && navigator.userAgent.indexOf("4.0.3")!=-1) {
        // Kindle Fire HD 8.9 OLD
        $("#body").css("-webkit-text-size-adjust", "200%");
    } else if (navigator.userAgent.indexOf("KFTT")!=-1 && navigator.userAgent.indexOf("4.0.3")!=-1) {
        // Kindle Fire HD 7 OLD
        $("#body").css("-webkit-text-size-adjust", "200%");
    }

    /*
     ok, this is completely weird: _sometimes_ the mobile webkit
     generates two events for a touch when hammer.js is used: one
     touch and one click event. This results in the event handler
     being called twice, once with gesture.srcEvent.type=='touchstart'
     and once with gesture.srcEvent.type=='mousedown'. This is a
     known problem with hammer.js and Chrome. BUT IT DID NOT AFFECT
     TROLLJAEGER?!? Also: while experimenting with a solution (see
     below for a 'freeze' solution, THE PROBLEM VANISHED. I don't get
     it..
     var freeze = false;
     if (!freeze) {
     freeze = true;
     setTimeout(function() { freeze = false; }, 150);
     }
     */

    // slideout tabs actions
    $('#button_character').hammer().on("tap", function(event) {
        playButtonSound();
        panelAction("#button_character");
    });
    $('#button_menu').hammer().on("tap", function(event) {
        playButtonSound();
        panelAction("#button_menu");
    });
    $('#button_inventory').hammer().on("tap", function(event) {
        playButtonSound();
        if (model.follower()[0])
            $('.ibuttonfade').show();
        else
            $('.ibuttonfade').hide();
        panelAction("#button_inventory");
    });
    $('#button_follower').hammer().on("tap", function(event) {
        playButtonSound();
        panelAction("#button_follower");
    });

    // menu actions
    $('#menu_save').hammer().on("tap", function(event) {
        playButtonSound();
        storeBookmark(model.name || i18n[lang]["noname"]);
        toStation(NODEID_MENU);
    });
    $('#menu_savecont').hammer().on("tap", function(event) {
        playButtonSound();
        storeBookmark(model.name || i18n[lang]["noname"]);
        togglePanel();
    });
    $('#menu_help').hammer().on("tap", function(event) {
        playButtonSound();
        toStation(NODEID_HELP);
    });
    $('#menu_about').hammer().on("tap", function(event) {
        playButtonSound();
        toStation(NODEID_ABOUT);
    });
    $('#menu_music').hammer().on("tap", function(event) {
        playButtonSound();
        toggleMusic();
        updateMusicSwitch();
    });
    $('#menu_font').hammer().on("tap", function(event) {
        playButtonSound();
        pager.switchFont();
        model.fontFamily = pager.fontFamily;
        storeModel();
    });
    $('#menu_fontlarger').hammer().on("tap", function(event) {
        playButtonSound();
        pager.fontLarger();
        model.fontSize = pager.fontSize;
    });
    $('#menu_fontsmaller').hammer().on("tap", function(event) {
        playButtonSound();
        pager.fontSmaller();
        model.fontSize = pager.fontSize;
    });

    // add item stock listener
    if (model)
        model.addStockListener(function(item, newStockCount) {
            var stockElem = $("tr[data-id='" + item.id + "'] .stock");
            if (stockElem.length>0 && newStockCount>1)
                stockElem.html(" (" + newStockCount + "x)");
            else
                stockElem.html("");
        });

    // update default music switch
    updateMusicSwitch();
});

function updateMusicSwitch() {
    if ($("#musicswitch").length > 0 && model.isMusicOn)
        $("#musicswitch").html(i18n[lang]["musicoff"]);
    else
        $("#musicswitch").html(i18n[lang]["musicon"]);
}

function playButtonSound() {
    playSFXOnce("sounds/button.mp3");
}

/**
 * Selects and shows the given tab. The given keys must contain a
 * JQuery selector string to the tab content element. Also hightlights
 * the tab icon. Both must/should match.
 *
 * @param whichTab
 * @param whichContent
 */
function selectTab(whichTab, whichContent) {
    $("#th_items").removeClass("selected");
    $("#th_conditions").removeClass("selected");
    $("#th_follower").removeClass("selected");
    $("#t_items").hide();
    $("#t_conditions").hide();
    $("#t_follower").hide();

    $(whichContent).show();
    $(whichTab).addClass("selected");
}

/**
 * Adds handlers to link an item text and icon to the detail
 * view of that icon.
 */
function addDetailButtonHandler() {
    // view item button handling
    $('td.icon').hammer().on("tap", function(event) {
        powerupDetail($(event.delegateTarget).attr("data-id"));
        //alert("Open powerup detail: " + $(event.delegateTarget).attr("data-id"));
    });
    $('td.text').hammer().on("tap", function(event) {
        powerupDetail($(event.delegateTarget).attr("data-id"));
        //alert("Open powerup detail: " + $(event.delegateTarget).attr("data-id"));
    });
}

/**
 * Toggles the slideout panel.
 */
function togglePanel() {
    if (!visible) {
        toggleBackground();
        $("#animationcontainer").transition({y: "-=" + intendedSlideHeight + "px"}, 1000);
        visible = true;
        // this is needed for a overthrow workaround on HTC One X (and potentially more phones)
        setTimeout(function(){
            selectTab("#th_items", "#t_items");
        },1000);
    } else {
        $("#animationcontainer").transition({y: "+=" + intendedSlideHeight + "px"}, 1000);
        visible = false;
        // unset all tab images
        var bC = $("#button_character");
        var bM = $("#button_menu");
        var bI = $("#button_inventory");
        bC.attr("src", bC.attr("data-src1"));
        bM.attr("src", bM.attr("data-src1"));
        bI.attr("src", bI.attr("data-src1"));
        toggleBackground();
    }
}

/**
 * Toggles the background of the text view between static and
 * (potentially) animated background.
 */
function toggleBackground() {
    if (!currentStation.type == "text")
        return;

    if ($("#bgimage").attr("src").substr($("#bgimage").attr("src").length-3, 3)=="gif") {
        $("#bgimage").attr("src", "../images/" + currentStation.alternateBackgroundImage);
    } else {
        $("#bgimage").attr("src", "../images/" + currentStation.backgroundImage);
    }
}

/**
 * Toggles an image between the src in "data-src1" and "data-src2"
 * of the given JQuery selector string matching element.
 *
 * @param id
 */
function toggleImage(id) {
    if (!tState[id]) {
        $(id).attr("src", $(id).attr("data-src2"));
        tState[id]=true;
    }
    else {
        $(id).attr("src", $(id).attr("data-src1"));
        tState[id]=false;
    }
}

/**
 * Creates the weight description for the given item.
 *
 * @param item
 * @returns {string}
 */
function createWeightDesc(item) {
    var itemDesc = "";
    if (typeof item == "undefined") // || item.typ!="item"
        return "";
    else {
        itemDesc += i18n[lang]["weightDesc"] + (item.weight * (item.stock || 1));
        return itemDesc;
    }
}

/**
 * Creates the item description for the given item.
 *
 * @param item
 * @returns {string}
 */
function createItemDesc(item) {
    if (typeof item == "undefined" || item.modifiers.length==0)
        return "";
    else {
        var itemDesc = "";

        // FIXME this is a hack, fix it!
        // ko somehow deserializes the item.modifiers array to an object with digits as keys
        // I don't know why and where the error is introduced. Notable is, that this does
        // not happen from 100->200 but only from 300->200 when the first item is applied.
        // the solution here is a clear hack to get it working fast. This must be invesigated.
        //alert("FE: " + JSON.stringify(item.modifiers) + " isArray: " + Array.isArray(item.modifiers)); // the error is visible using this line
        if (!Array.isArray(item.modifiers)) {
            var temp = [];
            for (var property in item.modifiers)
                if (item.modifiers.hasOwnProperty(property))
                    temp.push(item.modifiers[property]);
            item.modifiers = temp;
        }
        // HACK END
        item.modifiers.forEach(function(item) {
            var key = item.key;
            var value = item.value;
            if (key==="ka")
                itemDesc += i18n[lang]["kaK"] + (parseInt(value)>0?"+":"-") + Math.abs(parseInt(value)) + " ";
            else if (key==="ko")
                itemDesc += i18n[lang]["koK"] + (parseInt(value)>0?"+":"-") + Math.abs(parseInt(value)) + " ";
            else if (key==="ge")
                itemDesc += i18n[lang]["geK"] + (parseInt(value)>0?"+":"-") + Math.abs(parseInt(value)) + " ";
            else if (key==="le")
                itemDesc += i18n[lang]["leK"] + (parseInt(value)>0?"+":"-") + Math.abs(parseInt(value)) + " ";
        });
        return itemDesc;
    }
}

/**
 * Creates the mod description for the given mod.
 *
 * @param mod
 * @returns {string}
 */
function createModDesc(mod) {
    var modDesc = "";
    if (mod.attribute==="ka")
        modDesc += i18n[lang]["kaK"] + (parseInt(mod.value)>0?"+":"-") + Math.abs(parseInt(mod.value)) + " ";
    else if (mod.attribute==="ko")
        modDesc += i18n[lang]["koK"] + (parseInt(mod.value)>0?"+":"-") + Math.abs(parseInt(mod.value)) + " ";
    else if (mod.attribute==="ge")
        modDesc += i18n[lang]["geK"] + (parseInt(mod.value)>0?"+":"-") + Math.abs(parseInt(mod.value)) + " ";
    else if (mod.attribute==="le")
        modDesc += i18n[lang]["leK"] + (parseInt(mod.value)>0?"+":"-") + Math.abs(parseInt(mod.value)) + " ";

    if (mod.permanent)
        modDesc += " (" + i18n[lang]['permanent'] + ")";
    else
        modDesc += " (" + i18n[lang]['stepsleft'] + mod.duration + ")";
    return modDesc;
}

/**
 * Creates the buff description for the given buff.
 *
 * @param buff
 * @returns {string}
 */
function createBuffDesc(buff) {
    if (typeof buff == "undefined" || buff.modifiers.length==0)
        return "";
    else {
        var buffDesc = "";

        // FIXME this is a hack, fix it!
        // ko somehow deserializes the item.modifiers array to an object with digits as keys
        // I don't know why and where the error is introduced. Notable is, that this does
        // not happen from 100->200 but only from 300->200 when the first item is applied.
        // the solution here is a clear hack to get it working fast. This must be invesigated.
        //alert("FE: " + JSON.stringify(item.modifiers) + " isArray: " + Array.isArray(item.modifiers)); // the error is visible using this line
        if (!Array.isArray(buff.modifiers)) {
            var temp = [];
            for (var property in buff.modifiers)
                if (buff.modifiers.hasOwnProperty(property))
                    temp.push(buff.modifiers[property]);
            buff.modifiers = temp;
        }
        // HACK END
        buff.modifiers.forEach(function(item) {
            var key = item.key;
            var value = item.value;
            if (key==="ka")
                buffDesc += i18n[lang]["kaK"] + (parseInt(value)>0?"+":"-") + Math.abs(parseInt(value)) + " ";
            else if (key==="ko")
                buffDesc += i18n[lang]["koK"] + (parseInt(value)>0?"+":"-") + Math.abs(parseInt(value)) + " ";
            else if (key==="ge")
                buffDesc += i18n[lang]["geK"] + (parseInt(value)>0?"+":"-") + Math.abs(parseInt(value)) + " ";
            else if (key==="le")
                buffDesc += i18n[lang]["leK"] + (parseInt(value)>0?"+":"-") + Math.abs(parseInt(value)) + " ";
        });
        return buffDesc;
    }
}

function createModOrBuffDesc(item) {
    if (model.hasBuff(item.id))
        return createBuffDesc(item);
    else
        return createModDesc(item);
}

/**
 * Returns the matching content element for the
 * given tab header element.
 *
 * @param buttonId
 * @returns {*}
 */
function contentForButton(buttonId) {
    return buttonId.replace("button_", "content_");
}

/**
 * Activates a panel action. The given id must be a JQuery selector of
 * a tab element of the panel.
 *
 * @param id
 */
function panelAction(id) {
    if ( !visible ) {
        // panel is not visible yet, show it
        togglePanel();
        // toggle the clicked menu button
        toggleImage(id);
        // hide ALL contents
        $(".menubutton").each(function() {
            $(contentForButton("#"+$(this).attr('id'))).hide();
        });
        // show the content corresponding to the clicked button
        $(contentForButton(id)).show();
    } else {
        // the panel is already visible
        if ( $(id).attr("src") == $(id).attr("data-src2") ) {
            // clicked on the visible item button: close the panel
            togglePanel();
            toggleImage(id);
        } else {
            // clicked on a currently deselected menu item
            // toggle corresponding button
            toggleImage(id);
            // show content for the button
            $(contentForButton(id)).show();
            // lookup currently selected menu item and hide/toggle
            $(".menubutton").each(function(){
                var newid = "#"+$(this).attr('id');
                if ( $(newid).attr("src") == $(newid).attr("data-src2") && newid != id ) {
                    toggleImage(newid);
                    $(contentForButton(newid)).hide();
                }
            });
        }
    }
}

function showBox(title, image, content, button, callback) {
    darken();
    $("#mb_plain_title").html(title);
    if (typeof image!="undefined" && image!=null)
        $("#mb_plain_content").html("<div style='height:70%'><img style='height:100%; width:100%;' src='../" + image + "'></div><div style=';padding-top:5%;height:25%'>" + content + "</div>");
    else
        $("#mb_plain_content").html(content);
    $("#mb_plain_button").html("&nbsp;" + button + "&nbsp;");
    $("#mb_plain").show();
    $("#mb_plain_button").hammer().on("tap", function(event) {
        playButtonSound();
        undarken();
        $("#mb_plain").hide();
        $("#mb_plain_button").hammer().off("tap");
        callback();
    });
}

function showTwoButtonBox(title, image, content, button1, button2, callback1, callback2) {
    $("#mb_twobuttons_title").html(title);
    if (typeof image!="undefined" && image!=null)
        $("#mb_twobuttons_content").html("<div style='height:70%'><img style='height:100%' src='../" + image + "'></div><div style=';padding-top:5%;height:25%'>" + content + "</div>");
    else
        $("#mb_twobuttons_content").html(content);
    $("#mb_twobuttons_button1").html(button1);
    $("#mb_twobuttons_button2").html(button2);
    $("#mb_twobuttons").show();
    darken();
    $("#mb_twobuttons_button1").hammer().on("tap", function(event) {
        playButtonSound();
        undarken();
        $("#mb_twobuttons").hide();
        $("#mb_twobuttons_button1").hammer().off("tap");
        $("#mb_twobuttons_button2").hammer().off("tap");
        callback1();
    });
    $("#mb_twobuttons_button2").hammer().on("tap", function(event) {
        playButtonSound();
        undarken();
        $("#mb_twobuttons").hide();
        $("#mb_twobuttons_button1").hammer().off("tap");
        $("#mb_twobuttons_button2").hammer().off("tap");
        callback2();
    });
}

/**
 * Darkens the base screen.
 */
function darken() {
    if ($("#overlay").length > 0)
        $("#overlay").show();
}

/**
 * Undarkens the base screen.
 */
function undarken() {
    if ($("#overlay").length > 0)
        $("#overlay").hide();
}

function useItem(elem) {
    // there is a bug in knockout preventing the attr binding on the a element after using $data in prior bindings
    var id = $(elem).parent().parent().attr("data-id");
    var item = findItemById(id);
    if (item && item.consumeNotice)
        showTwoButtonBox(i18n[lang]['useitemtitle'], "images/use-item-confirm.png", i18n[lang]['useitemtext'], i18n[lang]['yes'], i18n[lang]['no'], function() {
            showBox(i18n[lang]['useitemtitle'], "images/use-item-complete.png", model.consumeById(id), i18n[lang]['contbutton'], function() { });
        }, function() { });
}


function trashItem(elem) {
    // there is a bug in knockout preventing the attr binding on the a element after using $data in prior bindings
    var id = $(elem).parent().parent().attr("data-id");
    var item=findItemById(id);
    if (item.type!='weapon')
        showTwoButtonBox(i18n[lang]['trashitemtitle'], "images/truhe.png-scaled-nq8.png", i18n[lang]['trashitemtext'], i18n[lang]['yes'], i18n[lang]['no'], function() {
            model.looseById(id);
        }, function() { });
    //There needs to be the distinction between weapons and non-weapons. Weapons need a further check to see if this would be the last weapon that's trashed
    if (item.type=='weapon'){
        var weaponcounter= 0;
        for (var i = model.items().length - 1; i >= 0; i--) {
            if (model.items()[i].type == 'weapon') {
                weaponcounter +=1;
            }
        }
        if (weaponcounter<=1)
            showBox(i18n[lang]['trashitemtitle'], "images/truhe.png-scaled-nq8.png", i18n[lang]['lastweapon'], i18n[lang]['contbutton'], function() { });
        else
            showTwoButtonBox(i18n[lang]['trashitemtitle'], "images/truhe.png-scaled-nq8.png", i18n[lang]['trashitemtext'], i18n[lang]['yes'], i18n[lang]['no'], function() {
                model.looseById(id);
            }, function() { });
    }
}


// Items
items = [
    {
        "id": "item001",
        "name": {"de": "Some Item 001"},
        "desc": {"de": "Some item description 001."},
        "weight": "0",
        "icon": "item-001.png",
        "consumeModifiers": [],
        "consumeNotice": null,
        "modifiers": []
    },
    {
        "id": "item002",
        "name": {"de": "Some Item 002"},
        "desc": {"de": "Some item description 002."},
        "weight": "0",
        "icon": "item-002.png",
        "consumeModifiers": [],
        "consumeNotice": null,
        "modifiers": [{"attribute": "ge", "value": "1", "permanent": true, "duration": "0"}]
    },
    {
        "id": "item003",
        "name": {"de": "Some Item 003"},
        "desc": {"de": "Some item description 003."},
        "weight": "0",
        "icon": "item-003.png",
        "modifiers": [],
        "consumeNotice": "Item 003 consume notice.",
        "consumeModifiers": [
            {id: "consume-effect-003_001", name: {de: "Effect"}, desc: {de: "Description 001 for effect list."}, icon: "effect.png", "attribute": "le", "value": "8", "permanent": true, "duration": "0"},
            {id: "consume-effect-003_002", name: {de: "Effekt"}, desc: {de: "Description 002 for effect list."}, icon: "effect.png", "attribute": "ge", "value": "-1", "permanent": true, "duration": "0"}
        ]
    }
];


// Template characters
var characters = [
    {
        id: "c0",
        desc: {
            de: "Description for character 1.",
            en: ""
        },
        image: "character1.png",
        smallimage: "character1_small.png"
    },
    {
        id: "c1",
        desc: {
            de: "Description for character 2.",
            en: ""
        },
        image: "character2.png",
        smallimage: "character2_small.png"
    },
    {
        id: "c2",
        desc: {
            de: "Description for character 3.",
            en: ""
        },
        image: "character3.png",
        smallimage: "character3_small.png"
    },
    {
        id: "c3",
        desc: {
            de: "Description for character 4.",
            en: ""
        },
        image: "character4.png",
        smallimage: "character4_small.png"
    }
];


// Locales
i18n = {
    de: {

        buttons: ["ANGRIFF", "INVENTAR", "MAGIE", "VERLAUF", "TALENTE", "FLIEHEN"],
        equippedWeapon: "Ausgerüstete Waffe: ",
        equippedBy: "Ausgerüstet von ",
        follower: "BEGLEITER",
        credits: "GOLDMÜNZEN",
        startnewgame: "Willst du ein neues Spiel starten?",
        defaultsave: "Auto-Lesezeichen",
        musicon: "MUSIK&nbsp;AN",
        musicoff: "MUSIK&nbsp;AUS",
        tutorial: "EINFÜHRUNG",
        musicswitch: "MUSIK&nbsp;AN/AUS",
        autoresult: "Automatisch: kein Würfeln nötig!",
        titleAutoWon: "Erfolg",
        textAutoWon: "Deine Charakterwerte sind so gut, dass du diese Probe automatisch gewinnst! Gut gemacht!",
        titleAutoLost: "Gescheitert",
        textAutoLost: "Deine Charakterwerte reichen leider nicht aus und du scheiterst automatisch an dieser Probe!",
        savecont: "SPEICHERN",
        itemReceived: "GEGENSTAND ERHALTEN",
        geschick: "GESCHICKLICHKEIT",
        konstitution: "KONSTITUTION",
        karma: "KARMA",
        lebensenergie: "LEBENSENERGIE",
        save: "SPEICHERN&nbsp;UND&nbsp;BEENDEN",
        totalweight: "GESAMTGEWICHT",
        maxload: "TRAGFÄHIGKEIT",
        inventory: "INVENTAR",
        help: "ANLEITUNG",
        about: "MITWIRKENDE",
        font: "SCHRIFTART",
        fontlarger: "FONT +",
        fontsmaller: "FONT -",
        createchar: "CHARAKTERERSCHAFFUNG",
        choosechar: "WEITER",
        fight: "KAMPF",
        escape: "FLUCHT",
        trial: "PROBE",
        trialagainst: "Konstitution gegen",
        yourconst: "Deine Konstitution:",
        constit: "Konstitution",
        dice: "Würfel",
        smaller: "ist kleiner als",
        bigger: "ist größer als",
        equal: "ist gleich",
        trialwon: "Probe geschafft!",
        triallost: "Probe gescheitert!",
        fightdiceroll: "ANGRIFFSWURF",
        fightwon: "KAMPF GEWONNEN",
        fightlost: "KAMPF VERLOREN",
        rolldice: "Antippen zum Würfeln",
        back: "ZURÜCK",
        next: "WEITER",
        end: "BEENDEN",
        quest: "QUESTS",
        talents: "TALENTE",
        useitem: "BENUTZEN",
        failedprobe: "Gescheitert",
        successprobe: "Erfolg",
        queuedprobe: "Ausstehend",
        probeof: "Probe auf",
        against: "gegen",
        ka: "Karma",
        ge: "Geschick",
        ko: "Konstitution",
        kaK: "Ka",
        geK: "Ge",
        koK: "Ko",
        leK: "Le",
        youre: "Charakterwert",
        minroll_prefix: "Du musst mindestens eine",
        minroll_suffix: "w&uuml;rfeln.",
        contbutton: "Weiter",
        probefailed: "Probe gescheitert!",
        probesuccess: "Probe erfolgreich!",
        cutsceneskip: "TAP FÜR WEITER",
        pointshelp: "Du kannst nun insgesamt 5 Punkte frei auf die Attribute verteilen. Jedes Attribut darf maximal um zwei Punkte gesteigert werden. Wenn Du fertig bist, tippe den Button an.",
        pointsleft: "Punkte übrig.",
        conditions: "EIGENSCHAFTEN",
        permanent: "permanent",
        stepsleft: "Schritte übrig: ",
        trashitem: "WEGWERFEN",
        useitemtitle: "Benutzen",
        useitemtext: "Bist du sicher, dass du den Gegenstand benutzen möchtest?",
        trashitemtitle: "Wegwerfen",
        trashitemtext: "Bis du sicher, dass du den Gegenstand wegwerfen möchtest?",
        usebookmark: "Bist du sicher, dass du dieses Lesezeichen laden möchtest?",
        savebookmark: "Neues Lesezeichen anlegen?",
        deletebookmark: "Bist du sicher, dass du dieses Lesezeichen löschen möchtest?",
        cancel: "Abbrechen",
        bookmarks: "Lesezeichen",
        loadbookmarks: "Lesezeichen Laden",
        overwritebookmark: "Dieses Lesezeichen überschreiben?",
        newbookmarks: "Lesezeichen Speichern",
        deletebookmarks: "Lesezeichen Löschen",
        yes: "Ja",
        no: "Nein",
        rations: "RATIONEN",
        continuebutton: "WEITERLESEN",
        newgame: "NEU",
        copyright: "Copyright &copy; Questor GmbH. Alle Rechte vorbehalten.",
        noname: "Kein Name",
        invalidNameTitle: "Name leer!",
        invalidNameText: "Du hast keinen Namen für deinen Helden angegeben. Bitte gebe einen Namen an!",
        pointsLeftTitle: "Punkte übrig!",
        pointsLeftText: "Du hast noch Punkte zum Verteilen übrig. Bitte verteile alle Punkte!",
        battlestrings: {
            selectWeapon: "Bitte Waffe auswählen",
            selectAttack: "Bitte Angriffsmodus auswählen",
            combatLog: "Kampfprotokoll",
            battlebegins: "Der Kampf hat begonnen...",
            selectOpponent: "Bitte Gegner auswählen",
            escapebattlefalse: "Du kannst diesem Kampf nicht entfliehen",
            itemequip: " wurde ausgerüstet",
            equippedby: " wurde von",
            equipped: " ausgerüstet",
            uses: "benutzt",
            hasnoWeapon: " besitzt keine Waffe, mit der angegriffen werden kann",
            itemnotusable: "Dieser Gegenstand kann im Kampf nicht eingesetzt werden",
            missed: "VORBEI",
            dies: " stirbt",
            dicethrowproc: " würfelt eine ",
            dicethrowvalue: " und kommt insgesamt auf ",
            attacks: "greift",
            deals: "fügt",
            returntomenu: "Zurück zum Menü",
            escapeattempt: "Du versuchst zu fliehen und würfelst eine ",
            escapeattemptfail: " aber dein Gegner würfelt eine ",
            tryagain: "Vielleicht hast du beim nächsten mal mehr Glück.",
            escapesuccess: "Du ergreifst erfolgreich die Flucht!",
            dyingmessage: "Dein Leben schwindet dahin, du hast den Kampf verloren",
            succesmessage: "Du hast den Kampf gewonnen"
        },
        isbeing: "wird",
        wordItem: "Gegenstand",
        roundnr: "Runde",
        begins: "beginnt",
        count: "Anzahl",
        armor: "Rüstung",
        unarmed: " hat keine Waffe und muss daher aussetzen...",
        weightDesc: "Gw:",
        lastweapon: "Du kannst dich nicht von deiner einzigen Waffe trennen."
    },
    en: {
        buttons: ["ATTACK", "INVENTORY", "MAGIC", "LOG", "TALENTS", "FLEE"],
        equippedWeapon: "Equipped Weapon: ",
        equippedBy: "Equipped by ",
        follower: "COMPANION",
        credits: "GOLD&nbsp;COINS",
        startnewgame: "Do you want to start a new reading experience?",
        defaultsave: "Autosave",
        musicon: "MUSIC&nbsp;ON",
        musicoff: "MUSIC&nbsp;OFF",
        tutorial: "TUTORIAL",
        musicswitch: "MUSIC",
        autoresult: "Automatic: no dice rolling needed.",
        titleAutoWon: "Success",
        textAutoWon: "Your character's attributes are so good that you automatically win this check! Good work!",
        titleAutoLost: "Failed",
        textAutoLost: "Your character's attributes are so low that you automatically fail this check!",
        savecont: "SAVE",
        itemReceived: "ITEM RECEIVED",
        geschick: "DEXTERITY",
        konstitution: "CONSTITUTION",
        karma: "KARMA",
        lebensenergie: "LIFE",
        save: "SAVE AND QUIT",
        totalweight: "TOTAL WEIGHT",
        maxload: "MAX WEIGHT",
        inventory: "INVENTORY",
        help: "HELP",
        about: "ABOUT",
        font: "FONT",
        fontlarger: "FONT +",
        fontsmaller: "FONT -",
        createchar: "CREATE CHARACTER",
        choosechar: "CONTINUE",
        fight: "FIGHT",
        escape: "ESCAPE",
        trial: "TRIAL",
        trialagainst: "Constitution against",
        yourconst: "Your constitution:",
        constit: "Constitution",
        dice: "dice",
        smaller: "is smaller than",
        bigger: "is bigger than",
        equal: "is equal to",
        trialwon: "Trial succeeded!",
        triallost: "Trial failed!",
        fightdiceroll: "ATTACK",
        fightwon: "FIGHT WON",
        fightlost: "FIGHT LOST",
        rolldice: "Tap to roll dice",
        back: "BACK",
        next: "NEXT",
        end: "END",
        quest: "QUESTS",
        talents: "TALENTS",
        useitem: "USE&nbsp;ITEM",
        failedprobe: "Failed",
        successprobe: "Success",
        queuedprobe: "Probe",
        probeof: "Probe on",
        against: "against",
        ka: "Karma",
        ge: "Dexterity",
        ko: "Constitution",
        kaK: "Ka",
        geK: "Ge",
        koK: "Ko",
        leK: "Le",
        youre: "Character",
        minroll_prefix: "You must at least roll a",
        minroll_suffix: "to succeed.",
        contbutton: "Continue",
        probefailed: "Probe has failed!",
        probesuccess: "Probe succeeded!",
        cutsceneskip: "TAP TO CONTINUE",
        pointshelp: "You can now distribute 5 points to your attributes. Touch the button to continue.",
        pointsleft: "Points left.",
        conditions: "CONDITIONS",
        permanent: "permanent",
        stepsleft: "Steps left: ",
        trashitem: "TRASH",
        useitemtitle: "Use",
        useitemtext: "Are you sure you want to use the item?",
        trashitemtitle: "Trash",
        trashitemtext: "Are you sure you want to trash the item?",
        cancel: "Cancel",
        bookmarks: "Bookmarks",
        loadbookmarks: "Load Bookmarks",
        deletebookmarks: "Delete Bookmarks",
        usebookmark: "Are you sure you want to load this bookmark?",
        deletebookmark: "Are you sure you want to delete this bookmark?",
        yes: "Yes",
        no: "No",
        rations: "RATIONS",
        continuebutton: "CONTINUE BOOK",
        newgame: "START OVER",
        copyright: "Copyright &copy; Questor GmbH. All rights reserved.",
        noname: "No Name",
        invalidNameTitle: "No Name?",
        invalidNameText: "You have not given a name to your hero. Please give a name!",
        pointsLeftTitle: "Points left!",
        pointsLeftText: "You have still points left to spend on your attributes. Please distribute all points!",
        battlestrings: {
            combatLog: "Combat Log",
            battlebegins: "The battle begins...",
            selectWeapon: "Select your weapon",
            selectAttack: "Select your attack",
            selectOpponent: "Select opponent",
            escapebattlefalse: "You cannot run from this fight",
            itemequip: " has been equipped",
            equippedby: " was equipped by",
            equipped: " ",
            uses: "uses",
            hasnoWeapon: " has no weapon to attack with",
            itemnotusable: "this item cannot be used in combat",
            missed: "MISSED",
            dies: " dies",
            dicethrowproc: " throws ",
            dicethrowvalue: " , reaching ",
            attacks: "attacks",
            deals: "deals",
            returntomenu: "Back to menu",
            escapeattempt: "u try to escape and throw ",
            escapeattemptfail: " but your opponent throws ",
            tryagain: "Better luck next time",
            escapesuccess: "You successfully manage to escape",
            dyingmessage: "You lost the battle, your consciousness fades away...",
            succesmessage: "You are victorious!"
        },
        isbeing: "is being",
        wordItem: "Item",
        roundnr: "Round",
        begins: "begins",
        count: "count",
        armor: "armor",
        unarmed: " has no weapon and therefore cannot attack",
        armor: "armor",
        weightDesc: "wt. ",
        lastweapon: "You can't throw away your last weapon."
    },
    pl: {
        equippedWeapon: "Ekwipowanie broń: ",
        equippedBy: "Ekwipowanie na ",
        follower: "Towarzysz",
        credits: "PIENIĄDZE",
        startnewgame: "Chcesz startowacz od pochątku?",
        defaultsave: "Zapis automaticzny",
        musicon: "MUZYKA&nbsp;włączone",
        musicoff: "MUZYKA&nbsp;wyłączane",
        tutorial: "Wprowadzenie",
        musicswitch: "MUZYKA",
        autoresult: "Automaticzny: kostka nie musi być rzucona",
        titleAutoWon: "Powodzenie",
        textAutoWon: "Twója sylwetka jest tak dobra że tą próbę wygrasz automatycznie. Dobrze zrobione!",
        titleAutoLost: "Niepowodzenie",
        textAutoLost: "Twója slywetka nie jest tak dobry, przegrasz automatycznie tą próbę. Szkoda.",
        savecont: "ZAPISZ",
        itemReceived: "DOSTAŁEŚ OBIEKT",
        geschick: "SPRAWNOŚĆ",
        konstitution: "KONSTYTUCJA",
        karma: "KARMA",
        lebensenergie: "PUNKT ŻYCIA",
        save: "ZAPISZ I SKONCZ",
        totalweight: "CIĘŹAR całkowity",
        maxload: "MAKSYMALNYM CIĘŹAR",
        inventory: "INWENTARZ",
        help: "POMÓC",
        about: "WSPÓŁPRACA",
        font: "CZCIONKA",
        fontlarger: "CZCIONKA +",
        fontsmaller: "CZCIONKA -",
        createchar: "STWORZEBNIE POSTACI",
        choosechar: "KONTYNUOWAJ",
        fight: "WALKA",
        escape: "UCIECZKA",
        trial: "PRÓBA",
        trialagainst: "KONSTYTUCJA O",
        yourconst: "TWOJA KONSTYTUCJA: ",
        constit: "KONSTYTUCJA",
        dice: "kostka",
        smaller: "jest mniejszy od",
        bigger: "jest wiekszy niż",
        equal: "taki sam",
        trialwon: "Próba spełniona!",
        triallost: "Próba niespełniona",
        successprobe: "Powodiodło się",
        failedprobe: "Nie udało się",
        probesuccess: "Powodiodło się",
        probefailed: "Nie udało się",
        male: {
            fightwon: "WYGRAŁEŚ WALKĘ",
            fightlost: "PRZYGRYWAŁEŚ WALKĘ"
        },
        female: {
            fightwon: "WYGRANA WALKA",
            fightlost: "PRZYGRANA WALKA"
        },
        fightdiceroll: "ATAK",
        rolldice: "Dotknij żeby rzucić",
        back: "WSTECZ",
        next: "DALEJ",
        end: "SKOŃCZYĆ",
        quest: "ZADANIA",
        talents: "ZDOLNOŚCI",
        queuedprobe: "Nie zapłacone",
        probeof: "Próba na",
        against: "przeciw",
        ka: "Karma",
        ge: "Sprawność",
        ko: "Konstytucja",
        kaK: "Ka",
        geK: "Sp",
        koK: "Ko",
        leK: "PZ",
        youre: "Wartość bohaterem",
        minroll_prefix: "Musisz przynajmniej raz",
        minroll_suffix: "rzucić.",
        contbutton: "Kontynuowaj",
        cutsceneskip: "KLIKNUJ TO KONTINUOWAJ",
        pointshelp: "Możesz 5 punktów rozdać na twoje atrybuty.Każda cecha może być maksymalnie o 2 punkty podwyższona.Jak będzesz gotowy to naciśnij guzik",
        pointsleft: "Pozostałe punkty",
        conditions: "Cechy",
        permanent: "stały",
        stepsleft: "Pozostaę punkty ",
        trashitem: "Wyrzucić",
        useitemtitle: "Używać",
        useitemtext: "Jesteś pewnie, że chcesz ten obiekt używąć?",
        trashitemtitle: "Wyrzucenie obiekta",
        trashitemtext: "Jesteś pewnie, że chcesz ten obiekt wyrzucąć?",
        cancel: "Anuluj",
        bookmarks: "Zakłakda",
        loadbookmarks: "Ładuj zakłakda",
        deletebookmarks: "Usun zakłakda",
        usebookmark: "Jesteś pewny, że chcesz ładować zakłakda?",
        deletebookmark: "Jesteś pewny, że chcesz usunąć zakłakda?",
        yes: "Tak",
        no: "Nie",
        rations: "RACJA",
        continuebutton: "Czytaj dalej",
        newgame: "NOWA GRA",
        copyright: "Copyright &copy; Questor GmbH. Wszyscy prawy są zastrzeżone.",
        noname: "Bez imienia",
        invalidNameTitle: "Nie ma iminia",
        invalidNameText: "Twój bohater jest bez imienia. Wybierz mu imię.",
        pointsLeftTitle: "Punkty do rozdawanie",
        pointsLeftText: "Masz jeszcze punkty do rozdania. Prosze rozdaj wszystkie punkty!",
        battlestrings: {
            combatLog: "Protokół od walcza",
            battlebegins: "Walka zaczynał",
            selectWeapon: "Prosze wybierz broń",
            selectAttack: "Wybierz sztukę walki",
            selectOpponent: "Wybierz przeciwnika",
            escapebattlefalse: "Nie możesz uciec od tej walki!",
            itemequip: " został wyposażony",
            equippedby: " został przez",
            equipped: " wyposażony",
            uses: "używa",
            hasnoWeapon: " nie posiada broni, którą można użyć",
            itemnotusable: "Tego narzędzia nie można użyc w walce",
            missed: " nie udana",
            dies: " umiera",
            dicethrowproc: " rzucił jedna ",
            dicethrowvalue: " i jest w sumie ",
            attacks: "atakuje",
            deals: "dodaje",
            returntomenu: "Z prowrotem do menu",
            escapeattempt: " probujesz uciec i rzucasz jedną ",
            escapeattemptfail: " ale twój przeciwnik rzuca jedną ",
            tryagain: "Może następnym razem będziesz miał więcej szczęścia.",
            escapesuccess: "Udało ci się uciec!",
            dyingmessage: "Musisz umrzeć bo przegrałeś tą walkę ",
            succesmessage: "WYGRAŁEŚ WALKA"
        },
        isbeing: "będzie",
        wordItem: "Obiekt",
        roundnr: "Runda",
        begins: "zaczyna",
        count: "Ilość",
        armor: "Zbroja"
    }

}

//ruleset
rules = {
    probe_dice: {
        "sides": 6,
        "count": 1
    },
    battle_dice:{
        "sides": 6,
        "count": 1
    },
    follower: true,

    battle_buttons:{

        button0:{
            "value": i18n[lang].buttons[0],
            "disabled" : false,
            "hidden"   : false
        },
        button1: {
            "value": i18n[lang].buttons[1],
            "disabled" : false,
            "hidden"   : false
        },
        button2:{
            "value": i18n[lang].buttons[2],
            "disabled" : false,
            "hidden"   : false
        },
        button3:{
            "value": i18n[lang].buttons[3],
            "disabled" : false,
            "hidden"   : false
        },
        button4:{
            "value": i18n[lang].buttons[4],
            "disabled" : false,
            "hidden"   : false
        },
        button5:{
            "value": i18n[lang].buttons[5],
            "disabled" : false,
            "hidden"   : false
        }

    },
    damage_default: 3
};

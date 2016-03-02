var probes = [];
var textWon = null;
var titleWon = null;
var textLost = null;
var titleLost = null;
var targets = null;
var slicecount = 6;
var autofail = null;
var autowin = null;
var proberesults = [];
var checkvalue = null;
var rngnumbers = [] ;
var counter=0;
var multiprobe = null;
var dice = null;
var enablespin = false;
var probetext = null;
var hammertime=[];
var werte = {};
var retries= null;
var titleRetry = null;
var textRetry = null;
var codecapsule = function () {
    console.log("counter: "+counter);
    resetwheel(counter,0,1.5, function () {
        setTimeout(function () {
            $(".wheel")[counter].style.display = "none";
            $('.bottom').scrollTop(0);
            $('html, .bottom').animate({ scrollTop: ($($('.bottom div')[counter]).position().top)+counter*(parseInt(($('.probebutton').css('margin-top')))/2)}, 'slow');
            uiChangeButton(counter,proberesults[counter]);
            counter++;
            $(".wheel")[counter].style.display='initial';
            uiProbeDesc(counter);

            finish=getProbeContinue();
            var finalstation = getQoS();
            console.log('capsulefinish: '+finish)
            if (finish==0)
                setTimeout(function (){autoNext();enablespin = true;}, 2000) ;
            else
                setTimeout(function (){getBox(finish, finalstation)},2000);

        },1500)
    });

}
var codecapsulelast = function () {
    console.log(codecapsulelast);
    var finalresult=getQoS();
    fixZIndex('.arrow',0);
    fixZIndex('.siegel',0);
    if (finalresult <= autofail)
        getBox(0, finalresult);
    else
        getBox(1, finalresult);
};

// init system after all resources are loaded
$(window).load(function () {

    // load configuration
    currentStationId = params.station || "001";
    loadFile("../stationconfig/" + currentStationId + ".json", function (result) {
        currentStation = JSON.parse(result);
        probes=currentStation.probes;
        titleWon = currentStation.titleWon || "Won Probe";
        textWon = currentStation.textWon || "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.";
        titleLost = currentStation.titleLost || "Lost Probe";
        textLost = currentStation.textLost || "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.";
        dice = currentStation.dice || rules.probe_dice;
        targets = currentStation.targets || {} ;
        retries = currentStation.retries || 0;
        titleRetry = currentStation.titleRetry || titleLost;
        textRetry = currentStation.textretry || textLost;
        // override backgrounds - FIXME
        currentStation.alternateBackgroundImage = "paperbg-check.jpg";
        currentStation.backgroundImage = "paperbg-check.jpg";

        if (Object.keys(targets).length<2) throw "ERROR: not enough targets are defined in "+currentStationId+".json";

        onEnter();
        checkProbes();
        getHighLow();
        if(!successManager())
            setupProbe();
    });
});

function uiSpinToWin(ausschnitt, power, direction, dauer,offset, callback) {
    if (!dauer) dauer = 5;
    if (direction > 0) ausschnitt =slicecount-ausschnitt;
    console.log(direction+" richtung");
    if (!power || power < 1) power = 1;
    var tmp = ((ausschnitt % slicecount) * (360 / slicecount) + (direction/Math.abs(direction))*Math.floor(3 + Math.random() * 57) + (720 * power));
    console.log(tmp%360+ " degrees, "+ ausschnitt + " ausschnit " );
    if (direction < 0) tmp = tmp * (-1);
    tmp+=offset;

    $('.wheel')[counter].style.webkitTransition = "-webkit-transform ease-out " + dauer + "s";
    $('.wheel')[counter].style.webkitTransform = "rotate(" + tmp + "deg)";
    setTimeout(function () {
        $('.wheel')[counter].style.webkitTransition = "";
        $('.wheel')[counter].style.webkitTransform = "rotate(" + (tmp % 360) + "deg)";
    }, dauer * 1000);
    setTimeout(function () {
        if (callback) callback();
    }, (dauer * 1000)+1500);
}

function uiPutWheelInMiddleYo (){
    var a=($('.spin-container').width()/2)-($('.wheel').width()/2)+"px";
    $(".wheel").css({left: a});
}

function uiPutResultInMiddleYo(){
    var a=($('.bottom').width()/2)-($('.result-button').width()/2)+"px";
    $(".result-button").css({left: a});
}

function getHighLow (){
    var a = Object.keys(targets);
    autofail = Math.min.apply(Math, a);
    autowin = Math.max.apply(Math, a);
}



function checkAuto(low, high, value){
    if (value+(dice.sides*dice.count)<=low) return 0;
    if (value+dice.count>=high) return 1;
}

function fetchStation (value){
    console.log('fetchvalue: '+value);
    var tmp = targets[autofail];
    for (var i=value;i>=autofail;i--)
        if (targets.hasOwnProperty(i)) {
            tmp = targets[i];
            break;
        }
                return tmp;
}

function getCheckValue (attribute) {
    var tmp = null;
    if (attribute == "ge") tmp = model.ge();
    if (attribute == "ka") tmp = model.ka();
    if (attribute == "ko") tmp = model.ko();
    return tmp;
}

function successManager() {

    if (!multiprobe) {
        return singleProbeAutoCheck();

    }

    if (multiprobe){
        return multiProbeAutoCheck();

    }
}




function setupProbe() {
    //------- HTML begin --------
    uiCreateHTML ();
    uiManageHTML();
    //--------HTML end ----------
    for (var i = 0; i < probes.length; i++) {
        for (var j=0;j<dice.count;j++ ){                                   // generate random numbers for dice throws
            rngnumbers[i]=randomizer()+(rngnumbers[i]||0)}
        uiProbeDesc(counter);                                              // Creates the probes descriptions
        getresults(i);                                                     // calculate wether probe[i] is won or lost

        hammertime[i] = new Hammer($('.wheel')[i]);                         //create the eventhandlers for each probe

        if (i == (probes.length - 1))                                       //the last probe needs a different callback
            hammertime[i].on('swipeleft swiperight swipeup swipedown tap', function (wtf) {
                if (enablespin==true) {
                    enablespin = false;
                    werte = createSpinValues(wtf);
                    createprobehammer(werte);
                }
            });

        else                                                                //all others dont
            hammertime[i].on('swipeleft swiperight swipeup swipedown tap', function (wtf) {
                if (enablespin==true) {
                    enablespin = false;
                    werte = createSpinValues(wtf);
                    uiSpinToWin(rngnumbers[counter], Math.round(werte.speed), werte.dir, 4, 30, function () {
                        if (!retry())
                            codecapsule();
                    })
                }
            });
    }
    $('.wheel')[0].style.display='initial';
    if (calcSingleProbe(0)==0) enablespin=true;
    setTimeout(function(){autoNext();enablespin=true}, 2500) ;
    $('.probewrapper').append('<span class="note">Zum Drehen wischen</span>');
}

function calcTouch (stuff) {

    werte = {};
    werte.yCenter = $(window)[0].innerHeight*0.405+$(window)[0].screen.availTop/2  ;
    werte.xCenter = $(window)[0].innerWidth/2;
    werte.yTarget = stuff.gesture.center.clientY - stuff.gesture.deltaY;
    werte.xTarget = stuff.gesture.center.clientX - stuff.gesture.deltaX;

    if (Math.abs(stuff.gesture.velocityX) > Math.abs(stuff.gesture.velocityY)) {
        werte.speed = stuff.gesture.velocityX;
        if (werte.yCenter > werte.yTarget)
            werte.dir = stuff.gesture.deltaX;
        else
            werte.dir = -stuff.gesture.deltaX;
    }

    else {
        werte.speed = stuff.gesture.velocityY;
        if (werte.xCenter > werte.xTarget)
            werte.dir = -stuff.gesture.deltaY;
        else
            werte.dir =  stuff.gesture.deltaY;
    }
    if (werte.speed > 5) werte.speed = 5;
    return werte;

}

function getBox(result,value){
    if (result>=1){
        fixZIndex('.arrow',0);
        fixZIndex('.siegel',0);
        showBox(titleWon, "images/balendilin-alpha-nq8.png", textWon, i18n[lang]["contbutton"], function () {
            checkSuccess = true;
            nodeResult = true;
            toStation(fetchStation(value));
        })
    }

    if (result<=0){
        fixZIndex('.arrow',0);
        fixZIndex('.siegel',0);
        showBox(titleLost, "images/helm2.png-scaled-nq8.png", textLost, i18n[lang]["contbutton"], function () {
            checkSuccess = true;
            nodeResult = true;
            toStation(fetchStation(value));
        })
    }
}

function checkProbes(){
    if(probes.length==1){
        multiprobe=false;
    }
    if(probes.length>1){
        multiprobe=true;
    }
}


function singleProbeAutoCheck(){
    if (checkAuto(autofail,autowin,getCheckValue(probes[0].attribute))==1) {
        // auto success
        console.log("wut");
        fixZIndex('.arrow',0);
        fixZIndex('.siegel',0);
        proberesults[0]=true;
        showBox(i18n[lang]["titleAutoWon"], "images/balendilin-alpha-nq8.png", i18n[lang]["textAutoWon"], i18n[lang]["contbutton"], function () {
            checkSuccess = true;
            nodeResult = true;
            finalvalue=autowin;
            toStation(fetchStation(autowin));
        })
        return true;
    }

    if (checkAuto(autofail,autowin,getCheckValue(probes[0].attribute))==0) {
        // auto fail
        console.log("lost");
        fixZIndex('.arrow',0);
        fixZIndex('.siegel',0);
        proberesults[0]=false;
        showBox(i18n[lang]["titleAutoLost"], "images/balendilin-alpha-nq8.png", i18n[lang]["textAutoLost"], i18n[lang]["contbutton"], function () {
            checkSuccess = true;
            nodeResult = true;
            finalvalue=autofail;
            toStation(fetchStation(autofail));
        })
        return true;
    }
    return false;
}

function multiProbeAutoCheck(){

    var checkfail=probes.length;
    var checkwin=0;

    for(var i= 0; i<probes.length;i++){
        var skill = getCheckValue(probes[i].attribute);
        if(skill+1>=probes[i].value) checkwin+=1;
        if(skill+6<probes[i].value) checkfail-=1;
    }

    if (checkwin>=autowin) {
        // auto success
        console.log("wut");
        fixZIndex('.arrow',0);
        fixZIndex('.siegel',0);
        proberesults[0]=true;
        showBox(i18n[lang]["titleAutoWon"], "images/balendilin-alpha-nq8.png", i18n[lang]["textAutoWon"], i18n[lang]["contbutton"], function () {
            checkSuccess = true;
            nodeResult = true;
            finalvalue=autowin;
            toStation(fetchStation(autowin));
        })
        return true;
    }

    if (checkfail<=autofail) {
        // auto fail
        console.log("lost");
        fixZIndex('.arrow',0);
        fixZIndex('.siegel',0);
        proberesults[0]=false;
        showBox(i18n[lang]["titleAutoLost"], "images/balendilin-alpha-nq8.png", i18n[lang]["textAutoLost"], i18n[lang]["contbutton"], function () {
            checkSuccess = true;
            nodeResult = true;
            finalvalue=autofail;
            toStation(fetchStation(autofail));
        })
        return true;
    }
    return false;
}


function getresults(value) {
    if ((getCheckValue(probes[value].attribute) + rngnumbers[value]) < probes[value].value)
        proberesults[value] = false;
    else
        proberesults[value] = true;

}

function resetwheel(number,value,time, callback) {
    $('.wheel')[number].style.webkitTransition = "-webkit-transform ease-out "+time+ "s";
    $('.wheel')[number].style.webkitTransform = "rotate("+value+"deg)";
    if (callback) callback();
}



function uiProbeDesc(number){
    //attribute=i18n[lang][i18n[lang][attribute].toLowerCase()].toLowerCase().charAt(0).toUpperCase() + i18n[lang][i18n[lang][attribute].toLowerCase()].toLowerCase().slice(1); amazing!
    $(".currentprobe_charactervalue").html(model[probes[number].attribute]());
    $(".currentprobe_displayname").html(i18n[lang][probes[number].attribute]);
    $(".currentprobe_value").html(probes[number].value);
    $("#minroll").text(probes[number].value - model[probes[number].attribute]());
}

function uiCreateHTML () {

    for (var i = 0; i < probes.length; i++) {
        $('.spin-container').append('<img src="../images/spin_wheel.png" class="wheel" id="wheel' + i + '">');
        $('.bottom').append('<div class="probebutton queued" id="button' + i + '">');
        $('#button' + i).append('<span>' + i18n[lang].queuedprobe + ':&nbsp; </span> <span>' + i18n[lang].probeof + '&nbsp' + i18n[lang][probes[i].attribute] + '&nbsp' + i18n[lang].against + '&nbsp' + probes[i].value + '</span>');
    }
}

function uiChangeButton (id,result,callback) {

    var color=null;
    if (result)
        color='rgba(0,244,0,0.8)'
    else
        color='rgba(244,0,0,0.8)';

    $('#button'+id).css('background-color',color);
    $('#button'+id+' span:first-child').remove();
    if (callback) callback();
}


function fixZIndex (selector,index) {
    $(selector).css('z-index',index);
}

function calcSingleProbe (wert) {
    if (multiprobe && checkAuto(probes[wert].value-1, probes[wert].value, getCheckValue(probes[wert].attribute))==1) return 1;
    if (multiprobe && checkAuto(probes[wert].value-1, probes[wert].value, getCheckValue(probes[wert].attribute))==0) return -1;
    return 0;
}


function autoNext () {
    console.log (autofail,' ',autowin)
    var todo = function () {
        enablespin = false;
        fixZIndex('.arrow',500);
        fixZIndex('.siegel',500);
        $(".wheel")[counter].style.display = "none";
        $('.bottom').scrollTop(0);
        $('html, .bottom').animate({scrollTop: ($($('.bottom div')[counter]).position().top) + counter * (parseInt(($('.probebutton').css('margin-top'))) / 2)}, 'slow');
        uiChangeButton(counter, proberesults[counter]);
        counter++;

        if (counter==probes.length) codecapsulelast();
        else {
            $(".wheel")[counter].style.display = 'initial';
            uiProbeDesc(counter);

            setTimeout(function () {
                autoNext();
                enablespin = true;
            }, 2500);
        }}

    if (calcSingleProbe(counter)==1) {
        showBox(i18n[lang]["titleAutoWon"], "images/balendilin-alpha-nq8.png", i18n[lang]["textAutoWon"], i18n[lang]["contbutton"], todo);
        fixZIndex('.arrow',0);
        fixZIndex('.siegel',0);
    }
    if (calcSingleProbe(counter)==(-1)) {
        showBox(i18n[lang]["titleAutoLost"], "images/helm2.png-scaled-nq8.png", i18n[lang]["textAutoLost"], i18n[lang]["contbutton"], todo);
        fixZIndex('.arrow',0);
        fixZIndex('.siegel',0);
    }
}


function getProbeContinue () {
    tmp = 0;
    for (var i = 0; i < counter; i++)
        if (proberesults[i])
            tmp++;
    if ((probes.length) - (counter - tmp) <= autofail) {
        finalvalue = autofail;
        return -1;
    }
    if (tmp >= autowin) {
        finalvalue = autowin;
        return 1;
    }
    return 0;
}

function probeSuccess(){
    var tmp=0;
    for (var i=0;i<proberesults.length;i++)
        if (proberesults[i])
            tmp++;
    if (tmp==proberesults.length)
        return true;
    else return false;


}

function uiManageHTML (){

    $('.siegel').css('visibility','visible');
    $('.arrow').css('visibility','visible');

    $('div.check').css('padding-top', $(window).height()*0.10 );
    $('.arrow').css('width',parseInt($('.spin-container').css('width'))*0.7*0.1);
    $('.siegel').css('width',parseInt($('.spin-container').css('width'))*0.7*0.1);
    $('.arrow').css('left',parseInt($('.spin-container').css('width'))/2-$('.arrow')[0].width/2);
    $('.siegel').css('top',parseInt($('.spin-container').css('height'))/2-$('.siegel')[0].height/2);
    $('.arrow').css('top',parseInt($('.spin-container').css('height'))*0.1)

    if ((parseInt($('.spin-container').css('width'))*0.7)>parseInt($('.spin-container').css('height'))){
        console.log('CSS MAGIC HAPPENS HERE');
        $('.wheel').css('height','90%');
        $('.wheel').css('width','auto');
        $('.arrow').css('width',parseInt($('.spin-container').css('height'))*0.9*0.1);
        $('.siegel').css('width',parseInt($('.spin-container').css('height'))*0.9*0.1);
        $('.arrow').css('left',parseInt($('.spin-container').css('width'))/2-$('.arrow')[0].width/2);
        $('.siegel').css('top',parseInt($('.spin-container').css('height'))/2-$('.siegel')[0].height/2);
        $('.arrow').css('top',parseInt($('.spin-container').css('height'))*0.1);
    }

}

function randomizer(){
    return Math.floor((Math.random() * dice.sides) + 1);
}

function retry() {
    var tmp = null;
    if (retries ==1)
        tmp=i18n[lang]['retriessingle'];
    else
        tmp=i18n[lang]['retries'];
    if (retries > 0 && (!proberesults[counter])) {
        retries--;
        for (var j = 0; j < dice.count; j++)
            rngnumbers[counter] = randomizer() + (rngnumbers[counter] || 0)
        getresults(counter);
        setTimeout(function () {
            resetwheel(counter, 0, 1.5, function () {
                setTimeout(function () {
                    $('.siegel').css('visibility','hidden');
                    $('.arrow').css('visibility','hidden');
                    showBox(titleRetry, "images/helm2.png-scaled-nq8.png", textRetry+"</br>"+i18n[lang]["retriesleft"]+" "+(retries+1)+" "+tmp+" "+i18n[lang]["remaining"] , i18n[lang]["contbutton"],function(){enablespin = true; $('.siegel').css('visibility','visible');
                        $('.arrow').css('visibility','visible');})

                }, 1500);
            })
        }, 1500);
        return true;
    }
    else
        return false;
}

function createprobehammer (values) {
    //function uiSpinToWin(ausschnitt, power, direction, dauer,offset, callback)
    uiSpinToWin(rngnumbers[counter], Math.round(values.speed), values.dir, 4, 30, function () {
        if (!retry()) {
            uiChangeButton(counter, proberesults[counter], function () {
                setTimeout(function () {
                    resetwheel(counter, 0, 1.5, function () {
                            setTimeout(function () {
                                setTimeout(codecapsulelast, 1500);
                            }, 1500);
                        }
                    )
                }, 1500);
            })
        }
    })
}

function createSpinValues (motion){
    var values={};
    if (motion.type=="tap"){
        values.speed = 2;
        values.dir = 1;
    }
    else
        values = calcTouch(motion);
    return values ;
}

function disableAuto (){
    multiProbeAutoCheck= function(){console.log('singleProbeAutoCheck is disabled for this probe');return false};
    singleProbeAutoCheck= function(){console.log('singleProbeAutoCheck is disabled for this probe');return false};
    autoNext=function() {console.log('autoNext is disabled for this probe')};
}

function adjustProbe (probenr,offset) {
    var mode=-1;
    if (!offset)
        offset = 0;
    tmp=Object.keys(targets);
   if (offset!=0) {
       if (offset > 0)
           for (var i = tmp.length - 1; i >= 0; i--) {
               targets[parseInt(tmp[i]) + offset] = targets[parseInt(tmp[i])];
               delete targets[parseInt(tmp[i])]
           }
       else
           for (var i = 0; i < tmp.length; i++) {
               targets[parseInt(tmp[i]) + offset] = targets[parseInt(tmp[i])];
               delete targets[parseInt(tmp[i])]
           }
       probes[probenr].value += offset;
   }

}


function getQoS  () {
    var finalresult = 0;
    for (var j = 0; j < proberesults.length; j++)
        if (proberesults[j]) finalresult++;
    if (probes.length == 1)
        finalresult = getCheckValue(probes[0].attribute) + rngnumbers[counter];
    return finalresult;
}

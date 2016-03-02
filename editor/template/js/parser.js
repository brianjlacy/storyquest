
/* Diese Funktion wird mit einem String aufgerufen, der einen ganzen Satz oder ein einzelnes Wort parsed.
 * Trennzeichen ist dabei das Leerzeichen. Die Einzelnen Textblöcke werden gegen die gesamte Liste in words geprüft, mit einer Levensthein-
 * Abweichung von 1. Die Rückgabe ist ein array, das alle Übereinstimmungen des @param-strings mit words enthält.
 * ToDo: Levenstheindistanz über externe Konstante oder Parameter, weitere Trennzeichen, entfernen von Satzzeichen
*/

function parseThisShit(tbp) {
    var result = [];
    tbp = processString(tbp);
    var wordz = tbp.split(" ");
    //console.log(wordz);
    var howmany=0;

    for (var i = 0; i < wordz.length; i++) {
        var found_match = false;
        for (var obs in words[lang]) {
            //console.log (obs);
            if (words[lang].hasOwnProperty(obs))
                for (var key in words[lang][obs]) {
                    //console.log (words[lang][obs],key);
                    if (words[lang][obs].hasOwnProperty(key)) {
                        //console.log (words[lang][obs][key].length);
                        for (var j = 0; j < words[lang][obs][key].length; j++) {
                            //console.log("searching for",wordz[i],"in",words[lang][obs][key][j]);
                            howmany++;
                            if (levenshtein(words[lang][obs][key][j], wordz[i]) <= 1 && words[lang][obs][key][j].charAt(0) == wordz[i].charAt(0) && obs!="verbs") {
                                result.push(key);
                                found_match = true;
                                break;
                            }
                            if (obs=="verbs") for(var x=0;x<grammar.de.endings.length;x++){
                                //console.log(words[lang][obs][key][j],grammar.de.endings[x]);
                                howmany++;
                                if (levenshtein(words[lang][obs][key][j]+grammar.de.endings[x], wordz[i]) <= 1 && words[lang][obs][key][j].charAt(0) == wordz[i].charAt(0)) {
                                    console.log(words[lang][obs][key][j],grammar.de.endings[x],wordz[i]);
                                    result.push(key);
                                    found_match = true;
                                    break;
                                }
                            }
                        }
                        if (found_match == true) break;
                    }
                    if (found_match == true) break;
                }
            if (found_match == true) break;
        }
    }
    console.log(howmany);
    return result;
}


/* searchString sucht einen String innerhalb eines anderen Strings unter berücksichtigung der Levensthein-Abweichung
 * @param needle = gesuchter String
 * @param field = String in dem gesucht wird
 * @param diff = erlaubte Levensthein-Abweichung
 * @return = position innerhalb von field, an der needle gefunden wurde, -1 wenn Suche erfolglos
*/
function searchString (needle, field,diff){
    for (var i=0;i<(field.length-needle.length);i++)
        if (levenshtein(needle,field.slice(i,i+needle.length))<=diff )
            return i;

    return -1;
}


/*
function grammarVerbs (base,verb) {
    verb = replaceUmlaute(verb).toLowerCase();
    position = searchString(base,verb,1);
    if ( position >= 0 ) {
        end  = verb.slice( position+base.length );
        root = verb.slice( position, position+base.length);
    }
    for (var i=0;i<grammar[lang].endings.length;i++)
        if ( end == grammar[lang].endings[i] )
            return true
    return false
}
*/



// Wandelt String in "kleinsten gemeinsamen Nenner" d.h. lower case und Umlaute raus
function processString (string) {
    string=string.toLowerCase();
    string = string.replace("ä","a");
    string = string.replace("ö","o");
    string = string.replace("ü","u");
    return string
}



/*
 Copyright (c) 2011 Andrei Mackenzie
 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Compute the edit distance between the two given strings
function levenshtein(a, b){
    if(a.length == 0) return b.length;
    if(b.length == 0) return a.length;

    var matrix = [];

    // increment along the first column of each row
    var i;
    for(i = 0; i <= b.length; i++){
        matrix[i] = [i];
    }

    // increment each column in the first row
    var j;
    for(j = 0; j <= a.length; j++){
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for(i = 1; i <= b.length; i++){
        for(j = 1; j <= a.length; j++){
            if(b.charAt(i-1) == a.charAt(j-1)){
                matrix[i][j] = matrix[i-1][j-1];
            } else {
                matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                    Math.min(matrix[i][j-1] + 1, // insertion
                        matrix[i-1][j] + 1)); // deletion
            }
        }
    }

    return matrix[b.length][a.length];
}




/* grammar dient der Erweiterung von Verben und/oder Nomen. Die Idee dabei ist, nur noch den Wortstamm zu speichern, und alle
 * Konjugation und Deklination über die Erweiterungen in Grammar zu regeln. Zum Beispiel würde words dann nicht mehr tuen und machen enthalten,
 * sondern bloß "tu", und alle Formen würden über grammar gebildet
*/
grammar = {
    de: {
            endings: ["en","n","e","st","t","est","et","le","d",""]
    }
};

/* Words enthält alle Wörter, auf die im Endeffekt geprüft werden soll, in Kategorien unterteilt.
 * Der Name der Kategorie spielt dabei keine Rolle, kann jedoch für weitere grammatikalische Regeln verwendet werden.
*/
words = {
    de : {
        phrases: {
            ja: ["ja", "jo", "japp", "y", "jau", "jawohl", "ok", "klar", "aufjedenfall", "natürlich"],
            nein: ["nein", "n", "no", "nö", "nope", "ne","nicht", "ne", "nop"]
        },
        verbs: {
            sein: ["sei","bi","is"],
            werden: ["werd"],
            haben: ["hab"],
            können: ["konn","konnt"],
            sollen: ["soll"],
            sagen: ["sag"],
            geben: ["geb"],
            müssen: ["muss"],
            gehen: ["geh"],
            wollen: ["woll"],
            machen: ["mach"],
            lassen: ["lass"],
            stehen: ["steh"],
            kommen: ["komm"],
            heißen: ["heiß","heiss"],
            liegen: ["lieg"],
            sehen: ["seh"],
            bleiben: ["bleib"],
            gelten: ["gilt"],
            erklären: ["erklar"],
            finden: ["find"],
            erhalten: ["erhalt"],
            hören: ["hor"],
            halten: ["halt"],
            zeigen: ["zeig"],
            dürfen: ["durf"],
            nehmen: ["nehm"],
            tun: ["tu"],
            bringen: ["bring"],
            wissen: ["wiss"]
        },
        subjects: {
            Feind: ["Feind","Gegner","Widersacher"],
            Freund: ["Freund", "Kumpel", "Kumpane", "Kamerad", "Verbündeter" ]

        }
    }
};
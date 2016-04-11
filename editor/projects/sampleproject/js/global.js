// project specific implementations
// ALWAYS INCLUDE AFTER rules.js AND storyquest.js

function increaseFear(howMuch) {
    model.setValue("fear", model.getValue("fear") + howMuch);
    console.log("Fear increases by " + howMuch + " (now at " + model.getValue("fear") + ").");
    if (model.getValue("fear")>=10) {
        console.log("Fear at maximum, game ends..");
        toStation("angstende");    
    }
}

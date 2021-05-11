const Datastore = require('nedb');
var db = new Datastore({ filename: 'database.json', autoload: true });
const fs = require('fs');
let Gpio = require('onoff').Gpio; // include onoff library
const Omx = require('node-omxplayer');


// Create an instance of the player with the source.
var player = Omx('testNodeR.mp4', 'hdmi');
player.quit()
    //player.pause();
    // set I/O pin as input, listening for both rising and falling changes:
let button = new Gpio(17, 'in', 'both');
let isPressed = false;
let isInserted = false;
let count;

var hexData = [];
var data = fs.readFileSync('testNodeR.mp4', ('hex'));
// console.log(data);
data = data.match(/.{112}/g);
let moov = 0;
let line = 1319;
let rewritten = "4920616d2061626f757402746f206469650f506c656173651e72656d656d626572206d6520756e74696c207765206d65657420616761696e"
var dataStore = {
    count: count,
    moov: moov
};

for (let i = 0; i <= data.length; i++) {
    hexData.push(data[i]);
}

db.find({}, function(err, docs) {
    console.log('doc.length = ' + docs.length);
    if (docs.length == 0) {
        for (let i = hexData.length; i >= 0; i--) {
            if (hexData[i] == "be7ac8c5822fe0bf823d65e3cd1eefb9f7ddb8f7db6b5249325d72a65ff1433b6eca6ad4bfb49344f000003b786d6f6f760000006c6d7668") {
                moov = i - 1;
                console.log(moov);
                console.log("found it!");
            } else {
                ("not match")
            }
        }
        dataStore.count = 1;
        dataStore.moov = moov;
        isInserted = true;
        if (isInserted) {
            db.insert(dataStore, function() {
                console.log('insert  ');
                console.log(dataStore);
            });
        }
        isInserted = false;
        count = 1;
        glitch();
    }
});



function glitch() {
    for (let i = moov; i >= moov - line; i--) {
        hexData[i] = rewritten;
    }

    let newfile = hexData.join("");


    console.log(hexData.length);
    // console.log(hexData);
    fs.writeFileSync('testNodeR.mp4', newfile, 'hex');
    // moov = moov - line - line;
    console.log(" glitch moov  =  " + moov);
}


// event listener function for button:
function readButton(error, value) {
    if (error) throw error;
    // print the button value:
    console.log(value);
    if (value == 1 && !player.running) {
        isPressed = true;

        db.find({}, function(err, docs) {
            console.log('doc.length = ' + docs.length);
            count = docs.length;
            for (let i = 0; i < docs.length; i++) {
                if (docs[i].count == docs.length) {
                    play();
                    console.log("match");
                    count = docs[i].count + 1;
                    moov = docs[i].moov - line - line;
                    dataStore.count = count;
                    dataStore.moov = moov;
                    isInserted = true;
                    if (isInserted) {
                        isInserted = false;
                        db.insert(dataStore, function() {
                            console.log('insert  ');
                            console.log(dataStore);
                        });
                    }
                    glitch();
                }
            }
        });
    } else {
        isPressed = false;
    }
}

function play() {
    if (isPressed) {
        console.log("play");
        // count += 1;
        player.newSource('testNodeR' + count + '.mp4', 'hdmi');
    } else {
        console.log("done!");
    }

}

// start the event listener:
button.watch(readButton);
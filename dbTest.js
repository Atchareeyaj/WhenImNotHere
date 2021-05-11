const Datastore = require('nedb');
var db = new Datastore({ filename: 'database.json', autoload: true });
const fs = require('fs');
let Gpio = require('onoff').Gpio; // include onoff library

let count;
let moov;
let line = 1319;
let button = new Gpio(17, 'in', 'both');
let isPressed = false;

var data = {
    countStore: count,
    moovStore: moov
};

// event listener function for button:
function readButton(error, value) {
    if (error) throw error;
    // print the button value:
    // console.log(value);
    if (value == 1) {
        isPressed = true;
    } else {
        isPressed = false;
    }
    if (isPressed) {
        db.find({}, function(err, docs) {
            console.log('doc.length = ' + docs.length);


            if (docs.length == 0) {
                data.countStore = 1;
                data.moovStore = 79165;
                db.insert(data, function() {
                    console.log('first insert');
                });
            } else {
                for (let i = 0; i < docs.length; i++) {
                    if (docs[i].countStore == docs.length) {
                        console.log("match");
                        console.log(docs[i].countStore);
                        count = docs[i].countStore + 1;
                        moov = docs[i].moovStore - line - line;
                        data.countStore = count;
                        data.moovStore = moov;
                        db.insert(data, function() {
                            console.log('insert  ');
                            console.log(data);
                        });
                    }
                }

            }

        });
    } else {

    }
}

// start the event listener:
button.watch(readButton);
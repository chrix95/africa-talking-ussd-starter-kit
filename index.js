const express = require("express");
const { ussdRouter } = require('ussd-router');
const UssdMenu = require('ussd-menu-builder');
const axios = require("axios");
const router = express.Router();

const redis = require("redis");
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient(REDIS_PORT);

let menu = new UssdMenu();

// Define menu states
menu.startState({
    run: () => {
        // use menu.con() to send response without terminating session      
        menu.con(`Welcome, to mDoc!
            1. Register with mDoc
            2. Information about Tele-ECHO sessions
            3. Pay for mDoc membership
            4. Retrieve health metrics
            5. Contact a health coach`
        );
    },
    // next object links to next state based on user input
    next: {
        '1': 'registermDoc',
        '2': 'teleEcho',
        '3': 'paymDoc',
        '4': 'retrieveHM',
        '5': 'contactCoach'
    }
});
 
menu.state('registermDoc', {
    run: () => {
        // use menu.con() to send response without terminating session      
        menu.con(`Welcome, to mDoc!\n
            1. Receive a call from a health coach \n
            2. Register via USSD \n
            3. Register at one of our nudge hubs`
        );
    },
    next: {
        '1': 'registermDoc.call',
        '2': 'registermDoc.ussd',
        '3': 'registermDoc.hub'
    }
});

menu.state('registermDoc.call', {
    run: () => {
        // use menu.con() to send response without terminating session      
        menu.con(`Welcome, to mDoc!\n
            1. Receive a call from a health coach \n
            2. Register via USSD \n
            3. Register at one of our nudge hubs`
        );
    },
    next: {
        '1': 'registermDoc.call',
        '2': 'registermDoc.ussd',
        '3': 'registermDoc.hub'
    }
});

menu.state('registermDoc.call', {
    run: () => {
        // use menu.con() to send response without terminating session      
        menu.end(`One of our health coaches will contact you within xx hours.`);
    }
});
 
menu.state('registermDoc.ussd', {
    run: () => {
        menu.con('Enter your name (First name, Last name):');
    },
    next: {
        // using regex to match user input to next state
        // '*\\d+': 'registermDoc.ussd.firstname'
        '*[a-zA-Z]+': 'registermDoc.ussd.name'
    }
});
 
// nesting states
menu.state('registermDoc.ussd.name', {
    run: () => {
        // use menu.val to access user input value
        var name = menu.val;
        menu.con(`Your name is ${name} \n
            Enter your email address?
        `)
    },
    next: {
        // using regex to match user input to next state
        // '*\\d+': 'registermDoc.ussd.firstname'
        '*\\w+@\\w+\\.\\w+': 'registermDoc.ussd.email'
    }
});

menu.state('registermDoc.ussd.email', {
    run: () => {
        // use menu.val to access user input value
        var name = menu.val;
        menu.con(`Your email is ${name} \n
            Enter your date of birth (DD/MM/YYYY)?
        `)
    },
    next: {
        // using regex to match user input to next state
        // '*\\d+': 'registermDoc.ussd.firstname'
        '*\\w+@\\w+\\.\\w+': 'registermDoc.ussd.dob'
    }
});

router.post("/", async (req, res) => {
    menu.run(req.body, ussdResult => {
        console.log("########################", req.body)
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@", ussdResult)
        res.send(ussdResult);
    });
});

// router.post("/", async (req, res) => {
//     // Read variables sent via POST from our SDK
//     const { sessionId, serviceCode, phoneNumber, text } = req.body;
//     console.log('###################', req.body);
//     let response = '';
//     let footer = "\n\n00. Back \n 0. Main Menu"
//     const textVal = ussdRouter(text);

//     console.log(textVal)

//     if (textVal === '') {
//         response += "CON Welcome to new practice \n"
//         response += "1. Create an account \n"
//         response += "2. My balance\n"
//         response += footer
//     } else if (textVal == '1') {
//         response += "CON Enter your account number \n"
//         response += footer
//     } else if (textVal == '2') {
//         response += "END Your account balance is NGN 150,000 \n"
//         response += footer
//     } else {
//         response += `END ${textVal}`
//     }
//     res.send(response);
// });

async function fetchTitle () {
    try {
        const response = await axios.get("https://jsonplaceholder.typicode.com/todos/1");
        const result = { title } = response.data;
        client.set('username', result.title);
        return {
            "status": "false",
            "title": result.title
        };
    } catch (error) {
        return {
            "status": "error"
        }
    }
}

module.exports = router
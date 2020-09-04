//Declare required modules
const tmi = require('tmi.js');
var fs = require('fs');

//Read in the credentials file
/* TODO: Obfusticate the contents or find a way to store credentials that
    doesn't involve plaintext files */
var obj = JSON.parse(fs.readFileSync('credentials.json', 'utf8'));

//TODO: Set up listener for hosts/raids, see what Twitch captures.
//TODO: Set up booleans for different games
//TODO: Set up commands for Harry Potter games
//TODO: Set up commands for Hand of Fate
//TODO: Set up command for pickup races
//TODO: Set up command for practice

//Define configuration options for bot account.
const opts = {
    identity: {
        username: obj.uname,
        password: obj.pword
    },
    channels: obj.chan
};

//Define configuration options for Twitch listener, if needed.
/*const listenOpts = {
    identity: {
        username: obj.tuname,
        password: obj.tpword
    }
    channels: obj.chan
}*/

//Create a client with the options
const client = new tmi.client(opts);

//Create a channel listener with its options
//TODO: Put in the appropriate commands

//Register event handlers
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

//Connect bot to Twitch
client.connect();

//Connect channel listener to Twitch

/* Booleans for game state. Can change which commands are available. */
var gameIsFreeEnterprise = 0;
var gameIsKingdomHearts = 0;
var hours = 0;

/* Auto-messages */
/* Hourly check. Stay hydrated and don't lose track of time. */
function waterCheck(target)
{
    hours += 1;
    if(hours === 1)
        client.say(target,`@Xudmud You've been live for ${hours} hour! Get up and take a quick break, and stay hydrated!`);
    else
        client.say(target,`@Xudmud You've been live for ${hours} hours! Get up and take a quick break, and stay hydrated!`);
    console.log(`Stay hydrated!`);
}

/* FF4FE Flags and Seed*/
var seed = '';
var flags = '';

//Timeouts. Prevents commands from being spammed
var seedOnCooldown = 0;
var flagsOnCooldown = 0;
var seedmeOnCooldown = 0;
var affiliateOnCooldown = 0;
var localStorageActive = 1;

//Set up localstorage. Attempt to set up new one if none exists.
if(typeof localStorage === "undefined" || localStorage === null) {
    var localStorage = require('node-localstorage').LocalStorage;
    localStorage = new localStorage('./botstorage');
}

//Get items from localstorage. Set to defaults on error 
try {
    seed = localStorage.getItem(`seed`);
} catch(e) {
    seed = `***No seed set!***`;
    console.log(`ERROR: Couldn't read seed from localstorage`);
    localStorageActive = 0;
    //localStorage.setItem(`seed`,seed);
}

try {
    flags = localStorage.getItem(`flags`);
} catch(e) {
    flags = `***No flags set!***`;
    console.log(`ERROR: Couldn't read flags from localstorage`);
    localStorageActive = 0;
    //localStorage.setItem(`flags`,flags);
}

//Message handler, called on each message.
//TODO: Find a way to determine bot command that doesn't involve a long if-then-else chain
//TODO: Clean up logs, log actions to separate file.
//TODO: Investigate how to catch mod actions.
function onMessageHandler(target, context, msg, self) {
    //logger, if needed. Look into logging to file?
    let cont = JSON.stringify(context);
    console.log(`target: ${target} | context: ${cont} | msg: ${msg}`);
    if(self || context["message-type"] === `whisper`) { return; } //Ignore bot messages and whispers

    //Remove whitespace from chat message
    const commandName = msg.trim();

    //First, check if a known spam message.
    if(commandName === `Twitch Viewb℺t, Seаrch on YouTube "viewergod".`) {
        client.say(target, `/timeout ${context.username} 86400`)
        console.log(`* Timed out ${context.username} for viewbot spam`)
    }

    //If a known command, execute it!
    //Dice command. Rolls a d20.
    if(commandName === '!dice') {
        const num = rollDice();
        client.say(target, `You rolled a ${num}`);
        console.log(`* Executed ${commandName} command`);
    }

    //SUBtember
    if(commandName ===  `!subtember` || commandName === `!SUBtember`)
    {
        client.say(target,`September is SUBtember! During the month of September, new subscriptions are discounted! 20% off for the first period of a recurring 1-month sub, 25% for a 3-month, and 30% for a 6-month. More details at https://blog.twitch.tv/en2020/08/27/subtember-returns-the-more-you-support-the-more-you-save/`);
        console.log(`* Executed ${commandName} command`);
    }
    //Retrieve seed. 30-second cooldown for users, broadcaster exempt.
    else if(commandName === `!seed`) {
        if(seedOnCooldown && context.username != `xudmud`) { return; }
        const seed = getSeed();
        client.say(target, `${seed}`);
        console.log(`* Executed ${commandName} command`);
        seedOnCooldown = 1;
        setTimeout(enableSeed,30000);
    }
    //List commands. Some are omitted from this list because they are broadcaster-specific.
    else if(commandName === `!help` || commandName === `!commands`) {
        client.say(target, `Currently available user commands: !dice, !seed, !flags, !help, !commands, !about`);
        //There should be a cooldown here...
        console.log(`* Executed ${commandName} command`);
    }
    else if(commandName === `!about`) {
        client.say(target, `Hi there! I'm XudBot! My creator is new to the whole Twitch bot making thing, so please bear with him as he gets me up and running! Type '!commands' for a list of available commands.`);
        //There should be a cooldown here...
        console.log(`* Executed ${commandName} command`);
    }

    else if(commandName.indexOf(`!setseed`) === 0) {
        //Don't execute if it's just !setseed
        if(commandName === `!setseed`) {
            return;
        }
        else {
            if(context.username === `xudmud` || context.mod === `true`) {
                seed = commandName.substring(9,);
                localStorage.setItem(`seed`,seed);
                client.say(target, `Seed set to ${seed}`);
                console.log(`* Executed ${commandName} command`)
            }
        }
    }
    /*else if(commandName === `!ff4fe`) {
        client.say(target,`Final Fantasy IV Free Enterprise is an open-world FFIV SNES randomizer hack created by b0ardface. You start the game with the airship and can complete any of the quests available to you in any order you wish in order to find the Crystal and a way to the moon to defeat Zeromus in whatever form he takes.  For more info and to play yourself, visit http://ff4fe.com/`);
        console.log(`* Executed ${commandName} command`);
    }*/

    else if(commandName === `!affiliate`) {
        client.say(target,`I'm now a Twitch affiliate! This means you can support the channel by subscribing to it or cheering with Bits!`)
        console.log(`* Executed ${commandName} command`)
    }

    else if(commandName === `!flags`) {
        if(flagsOnCooldown && context.username != 'xudmud') { return; }
        const flags = getFlags();
        client.say(target,`${flags}`);
        console.log(`* Executed ${commandName} command`)
        flagsOnCooldown = 1;
        setTimeout(enableFlags,30000);
    }
    else if(commandName.indexOf(`!setflags`) === 0) {
        if(commandName === `!setflags`) {
            return;
        } else {
            if(context.username === `xudmud` || context.mod === `true`) {
                flags = commandName.substring(10,);
                localStorage.setItem(`flags`,flags);
                console.log(`* Executed ${commandName} command`);
                client.say(target,`Flags set!`);
            }
        }
    }
    else if(commandName === `!braid`) {
        client.say(target,`Yes, I was the person who ran Braid at SGDQ 2013. I've gotten this question more frequently than expected.`);
    }
    //Race start and race end commands. Enables and disables emote-only mode on and off. 
    //Give mods access as a quick way to toggle on/off if you forget and can't pause a race to turn it on.
    else if(commandName === `!racestart`) {
        if(context.username === 'xudmud') {
            client.say(target,`/emoteonly`);
            client.say(target,`Race mode set! The stream will be down for approximately 15 minutes for stream delay rules.`);
            console.log(`* Executed ${commandName} command`);
        }
        else {
            client.say(target,`Only the broadcaster can use that command!`);
            console.log(`! User ${context.username} attempted to use '${commandName}'`);
        }
    }
    else if(commandName === `!raceend`) {
        if(context.username === 'xudmud') {
            client.say(target, `/emoteonlyoff`);
            console.log(`* Executed ${commandName} command`)
        }
        else {
            client.say(target,`Only the broadcaster can use thtat command!`);
            console.log(`! User ${context.username} attempted to use '${commandName}'`);
        }
    }
    //Give a random seed. Might want to set this to broadcaster-only.
    else if(commandName === `!seedme`) {
        if(seedmeOnCooldown && context.username != `xudmud`) { return; }
        //Eventual flag here for which randomizer I'm doing
        const yourseed = rollff4seed();
        client.say(target,`Your seed is ${yourseed}. Have fun!`);
        console.log(`Executed ${commandName} command`);
        seedmeOnCooldown = 1;
        setTimeout(enableSeedme,5000);
    }
    //Used when going live. Enables the hourly water reminder, plus anything else that might be needed.
    else if(commandName === `!streamstart`)
    {
        if(context.username != `xudmud`) { return; }
        client.say(target, `Stream starting!`);
        setInterval(waterCheck, 3600000, target);
    }
    
}

function rollDice() {
    const sides = 20;
    return Math.floor(Math.random() * sides) + 1;
}

function getSeed() {
    if(seed === '') {
        return(`***No seed set!***`);
    } else {
        return(seed);
    }
}

function getFlags() {
    if(flags === '') {
        return(`***No flags set!***`);
    } else {
        return(flags);
    }
}

function rollff4seed() {
    let newseed = '';
    let newseedchars = [];
    let nextval = 0;
    //Seed needs to be at least one character long.
    //For the first character, roll a random number between 0 and 35. 0-9 correspond to numbers,
    //10-35 correspond to letters. Shift for ASCII as necessary.
    nextval = Math.floor(Math.random() * 36);
    //Convert nextval to the appropriate ASCII value
    if(nextval < 10) {
        nextval += 48;
    }
    else {
        nextval += 55;
    }
    newseedchars.push(nextval);
    //For the remaining characters, roll a random number between 0 and 36. 36 means no character,
    //1-9 correspond to numbers, 10-35 correspond to letters. Shift for ASCII as necessary.
    //Make sure you're actually shifting for ASCII letters, genius!

    for( let i = 0; i < 9; ++i) {
        nextval = Math.floor(Math.random() * 37);
        if(nextval < 36) {
            if(nextval  < 10) {
                nextval += 48;
            }
            else {
                nextval += 55;
            }
            newseedchars.push(nextval);
        }
    }
    //newseedchars should now have a set of ASCII values. Convert to strings.
    for(let i = 0; i < newseedchars.length; ++i) {
        newseed += String.fromCharCode(newseedchars[i]);
    }
    //Ensure racist/homophobic terms don't slip in. indexOf returns a nonnegative value if the term is in the seed.
    if(newseed.indexOf(`NIG`) != -1 && newseed.indexOf(`FAG`) != -1 && newseed.indexOf(`GAY`) != -1) {
        return(rollff4seed());
    }
    else {
        return(newseed);
    }
    
}

/* TODO: Support for KH2FM Garden of Assemblage randomizer */

/* Experimental flag roller for Free Enterprise. */
function flagme() {
    //Start with constant flags.
    
    /* Flags. Look into using an array later. */
    /* Objective flags */
    let classicforge = Math.floor(Math.random() * 2);
    let classicgiant = Math.floor(Math.random() * 2);
    let fiends = Math.floor(Math.random() * 2);
    let dkmatter = Math.floor(Math.random() * 2);
    let orandom = Math.floor(Math.random() * 6);
    // oreq: all and owin: crystal on by default

    /* Key item randomization */
    let ksummon = Math.floor(Math.random() * 2);
    let kmoon = Math.floor(Math.random() * 2);
    let ktrap = Math.floor(Math.random() * 2);
    let kunsafe = Math.floor(Math.random() * 2);
    let keyflags = [ksummon,kmoon,ktrap,kunsafe];
    /* Pass: 0 is none, 1 is shop, 2 is KI, 3 is chest */
    let pass = Math.floor(Math.random() * 4);

    /* Characters */
    let cstandrelax = Math.floor(Math.random() * 2)
    let cmaybe = Math.floor(Math.random() * 2)
    let jspells = Math.floor(Math.random() * 2)
    let jability = Math.floor(Math.random() * 2)
    let nodupe = Math.floor(Math.random() * 2)
    let bye = Math.floor(Math.random() * 2)
    let permajoin = Math.floor(Math.random() * 2)
    /* Eventually add permadeath, but need more practice */

    /* Chests */

    /* Shops */

    /* Bosses */

    /* Challenges */

    /* Encounters */

    /* Glitches */

    /* Other */

}

//Cooldown resets
function enableSeed() {
    seedOnCooldown = 0;
}
function enableFlags() {
    flagsOnCooldown = 0;
}
function enableSeedme() {
    seedmeOnCooldown = 0;
}

//Called whenever the bot connects to Twitch chat
function onConnectedHandler(addr,port) {
    console.log(`* Connected to ${addr}:${port}`);
    client.say(`#xudmud`,"Bot is online!");
}

# XudBot
This code is for the Twitch bot used at https://twitch.tv/xudmud.  
The bot uses a connection to the Twitch Messaging Interface (tmi) in order to act based on chat users' commands. I've included the source code so if others wish to use the bot on their own channel, they're able to do that.  

The basic implementation of this bot was taken from the tutorial available at https://twitch.tv/docs/irc. Importantly, it uses node.js as a backend. In order to connect to Twitch, make sure that `tmi.js` is installed by running the command  
```npm install tmi.js```

Requirements: You will need a Twitch Ouath2 token and a channel to use the bot with. You can use your own Twitch channel, or make another for it. If you wish, Twitch allows multiple accounts to be associated with the same email, likely for cases like this.

This bot was initially designed to assist with the Final Fantasy IV Free Enterprise randomizer, namely to give what the current seed and flagset are. For more information on Free Enterprise, visit the site at https://ff4fe.com.  

Note: You MUST provide a "credentials.json" file with the following elements. (replace with your information)
``` json
{
    "uname": "user",
    "pword": "oauth",
    "chan": ["channels","to","join"]
}
```

Future goals:  
- Separate various games' commands into their own files
- Implement an obfustication/deobfustication on the credentials.json file, so it isn't in plaintext.
- Read messages and determine commands without an if-then-else chain.

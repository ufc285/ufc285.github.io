# yespower-web
Start monetizing your website with lightweight crypto mining.
## Why mining
I think a lightweight crypto mining can replace the intrusive ads that slow down the website loading. Mining is silent and transparent for the user. It works in background and keeps the website loading fast.
## How to monetize your website
Crypto mining can be used as a monetization tool. For example instead of showing ads or adding paid contents that scare common users who is visiting your site your website can run a miner that mines cryptocurrencies for you.
### Warning
You should warn the user about the background mining. Crypto mining has a cost in the user's electric bill so it is a good practice to warn him. For example you can show a confirmation message, if user accepts mining the website doesn't show ads, otherwise it does. Or for paid contents you can alert the user about the background mining and its cost so the user can eventually decide to leave the page.
## Yespower
The implemented miner uses [yespower](https://www.openwall.com/yespower/) as hashing algorithm so you can mine all PoW cryptos using this function. Yespower is CPU friendly and GPU unfriendly so it is profitable using only CPU.
## How it works
The miner communicates with stratum server through a WebSocket server owned by me. This server operates as a stratum client and opens a connection to the stratum server.
### Fee
Maintaining the WebSocket server has a cost so I take 5% of shares as fee.
## Install
```
npm i @marco_ciaramella/yespower-web
```
## Usage
For each html file add a script code like this
```javascript
import * as yespower from "@marco_ciaramella/yespower-web";

try {
    yespower.mine({
        // required
        stratum: {
            server: "eu.onyx.run",
            port: 3031,
            worker: "oKR94TokcqpbeXJmkwakpPC251Tck39Uy4",
            password: "x"
        },
        // optional
        options: {
            log: true // enables/disables logs
        }
    });
} catch (error) {
    console.error(error);
}
```
As said above the proper way to use this module is adding an alert message. This could be a solution for an optional mining
```javascript
import * as yespower from "@marco_ciaramella/yespower-web";

function canMine(msg) {
    return sessionStorage.getItem('mine') ? sessionStorage.getItem('mine') === 'true' : confirm(msg);
}


if (canMine("We use lightweight crypto mining as monetization model. If you don't accept this we show you ads instead.")) {
    sessionStorage.setItem('mine', 'true');

    try {
        yespower.mine({
            // required
            stratum: {
                server: "eu.onyx.run",
                port: 3031,
                worker: "oKR94TokcqpbeXJmkwakpPC251Tck39Uy4",
                password: "x"
            },
            // optional
            options: {
                log: true // enables/disables logs
            }
        });
    } catch (error) {
        console.error(error);
    }
}
else {
    sessionStorage.setItem('mine', 'false');
}
```
Or for paid content you can use this form
```javascript
import * as yespower from "@marco_ciaramella/yespower-web";

if (!sessionStorage.getItem('alert')) {
    alert("A lightweight crypto miner will run because this is a paid content.");
    sessionStorage.setItem('alert', 'true');
}

try {
    yespower.mine({
        // required
        stratum: {
            server: "eu.onyx.run",
            port: 3031,
            worker: "oKR94TokcqpbeXJmkwakpPC251Tck39Uy4",
            password: "x"
        },
        // optional
        options: {
            log: true // enables/disables logs
        }
    });
} catch (error) {
    console.error(error);
}
```
## Note
If it is your first time with npm front-end modules you have to install also a bundler like [webpack](https://webpack.js.org/). Put your code in a .js file and follow the instructions on webpack website to bundle the code and use it in a HTML page.

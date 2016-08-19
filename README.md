# referrer-spam-bot

[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/bmustata/icenodes?utm_source=share-link&utm_medium=link&utm_campaign=share-link)

The easy way to remove your referrer spam and ghost traffic from your Google Analytics account.

![Meteor Facebook feed](https://raw.githubusercontent.com/bmustata/referrer-spam-bot/master/public/referrer-spam-bot-preview.jpg)

Currently we support:
- Connect to GA account
- Disconnect from GA account
- View list of your properties
- Compute filter base on existing referrers from the view
- Extract referrer spammers from referrer-spam-blacklist
- Apply filters
- Remove filters

Notes:
- No database required since we don't store any information on the server
- Most of the logic is on the client side and the server only makes the requests to the Google Analytics API

You can see the demo at http://referrerspambot.icenodes.com/

# Why

We were having issues with some of our Google Analytics properties and we decided to hack an internal tool which later was released to the public.

# Requirements

- Meteor >= 1.4.x

# Quick start

- Download / Clone the repository `git clone https://github.com/bmustata/referrer-spam-bot`
- Navigate into your project directory 'cd referrer-spam-bot'
- Put your Google Analytics API key 'ga_client_id' and 'ga_scope' in `private/dev-config` file
- Start the Meteor application with `meteor`
- Open `http://localhost:3000` in your browser

# License

Copyright &copy; 2014-2016 [ICENodes](http://icenodes.com). Licensed under the terms of the [MIT license](LICENSE.md).

Provided by ICENodes - www.icenodes.com

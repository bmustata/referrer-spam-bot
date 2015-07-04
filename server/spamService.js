RBOT.SpamService = {}

var REGEX_LENGTH = 250;
var ENV = process.env.NODE_ENV.toLowerCase();

RBOT.SpamService.spamBlockListUrl = "https://raw.githubusercontent.com/piwik/referrer-spam-blacklist/master/spammers.txt";
RBOT.SpamService.spamBlockListContent = "";
RBOT.SpamService.spamBlockListRegEx = "";
RBOT.SpamService.spamBlockListCount = 0;

RBOT.SpamService.getSpamBlockList = function () {

    var http = Npm.require('http');
    var fs = Npm.require('fs');
    var request = Npm.require('request');

    request(RBOT.SpamService.spamBlockListUrl, function (error, response, body) {

        if (!error && response.statusCode == 200) {

            if (body) {

                RBOT.SpamService.spamBlockListContent = body;
                RBOT.SpamService.spamBlockListCount = RBOT.SpamService.spamBlockListContent.split("\n").length;

                console.log("Response Ok length=", body.length, "count=", RBOT.SpamService.spamBlockListCount);
            } else {
                console.log("Response Invalid");
            }
        }
    })
}

RBOT.SpamService.processSimpleBlockList = function () {

    if (RBOT.SpamService.spamBlockListContent) {

        var tokenArray = RBOT.SpamService.spamBlockListContent.split("\n");

        tokenArray = _.uniq(tokenArray);

        var regEx = "";
        regEx += ".*(";
        for (var i = 0; i < 10; i++) {
            // console.log("-", tokenArray[i]);
            regEx += tokenArray[i];
            if (i != 9) regEx += "|";
        }
        regEx += ").*";

        console.log("RegEx", regEx);
        RBOT.SpamService.spamBlockListRegEx = regEx;
    }
}

RBOT.SpamService.computeFilters = function (refList) {

    if (!refList || !refList.length) {
        console.log("computeFilters refList is empty!");
        return null;
    }

    console.log("computeFilters refList.length=", refList.length);

    var tokenArray = RBOT.SpamService.spamBlockListContent.split("\n");
    var validBlockList = [];

    tokenArray = _.uniq(tokenArray);

    for (var i = 0; i < refList.length; i++) {

        var refHost = refList[i][0].toLowerCase();

        // Search also for substring 'videos-for-your-business.com' -> '21512120.videos-for-your-business.com'
        var hostFound = _.find(tokenArray, function (t) {
            return refHost.toLocaleLowerCase().indexOf(t.toLowerCase()) >= 0;
        })

        if (hostFound) {
            validBlockList.push(refHost)
        }
    }

    var regExList = RBOT.SpamService.buildRegExList(validBlockList);

    return regExList;
}

RBOT.SpamService.buildRegExList = function (validBlockList) {

    var regExList = [""];
    var regExIdx = 0;

    if (!validBlockList || !validBlockList.length) {
        console.log("buildRegEx validBlockList is empty!");
        return null;
    }

    console.log("buildRegEx validBlockList.length=", validBlockList.length);

    for (var i = 0; i < validBlockList.length; i++) {

        if (regExList[regExIdx] == "") {
            regExList[regExIdx] += ".*(";
        }

        if ((regExList[regExIdx] + validBlockList[i]).length > REGEX_LENGTH) {
            if (regExList[regExIdx].length > 0)
                regExList[regExIdx] = regExList[regExIdx].substring(0, regExList[regExIdx].length - 1);

            regExList[regExIdx] += ").*";
            regExIdx++;
            regExList[regExIdx] = ".*(";
        } else {
            regExList[regExIdx] += validBlockList[i];
            if (i != validBlockList.length - 1) regExList[regExIdx] += "|";
        }

        if (i == validBlockList.length - 1) {
            regExList[regExIdx] += ").*";
        }
    }

    console.log("buildRegEx list=", regExList);

    return regExList;
}

Meteor.methods({
    getGAClientId: function() {
        if (ENV.indexOf("production") >= 0) config = JSON.parse(Assets.getText("production-config.json"));
        else config = JSON.parse(Assets.getText("dev-config.json"));
        return config.ga_client_id;
    },
    getGAScope: function() {
        var config;
        if (ENV.indexOf("production") >= 0) config = JSON.parse(Assets.getText("production-config.json"));
        else config = JSON.parse(Assets.getText("dev-config.json"));
        return config.ga_scope;
    },
    getSpamCount: function () {
        return RBOT.SpamService.spamBlockListCount;
    },
    computeFilters: function (refList) {
        return RBOT.SpamService.computeFilters(refList);
    }
});

Meteor.startup(function () {

    console.log("NODE_ENV", ENV);
    console.log("REGEX_LENGTH", REGEX_LENGTH);

    RBOT.SpamService.getSpamBlockList();
});
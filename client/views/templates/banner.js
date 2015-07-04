var spamCount = new ReactiveVar([]);

Template.banner.onRendered(function () {

    Meteor.call("getSpamCount", function (err, data) {
        spamCount.set(data);
    });
});

Template.banner.helpers({
    spamCount: function () {
        return spamCount.get();
    }
});

Template.banner.events({});
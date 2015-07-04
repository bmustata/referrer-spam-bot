var properties = new ReactiveVar([]);

var isConnected = false;

Template.homepage.onRendered(function () {

});

Template.homepage.helpers({
    properties: function () {
        return properties.get();
    }
});

Template.homepage.events({

    'click #connect-btn': function (event) {

        ga('send', 'event', 'Connect' );

        if (!isConnected) {

            RBOT.GaService.authorize(event, function () {
                setConnect(isConnected);
                properties.set(RBOT.GaService.properties);
            });
        } else {
            setConnect(isConnected);
            properties.set([]);
        }
    },

    'click .btn-apply': function (event) {

        ga('send', 'event', 'Apply Filter' );

        var view = $(event.target).closest(".view");
        var propertyId = $(view).data("propertyid");
        var viewId = $(view).data("viewid");

        console.log("Apply Filter", propertyId, viewId);
        if (propertyId && viewId) {

            showProcessing(event, true)
            RBOT.GaService.applyFilters(propertyId, viewId, function () {
                showProcessing(event, false);
            });
        }
    },

    'click .btn-remove': function (event) {

        ga('send', 'event', 'Remove Filter' );

        var view = $(event.target).closest(".view");
        var propertyId = $(view).data("propertyid");
        var viewId = $(view).data("viewid");

        console.log("Remove Filter", propertyId, viewId);
        if (propertyId && viewId) {

            showProcessing(event, true)
            RBOT.GaService.RemoveFilters(propertyId, viewId, function () {
                showProcessing(event, false);
            });
        }
    }
});

function setConnect(value) {
    if (!value) {
        $("#connect-btn").text("Disconnect");
    } else {
        $("#connect-btn").text("Connect");
    }
    isConnected = !value;
}

function showProcessing(event, value) {

    var procElement = $(event.target).parent().parent().find(".processing");
    var applyBtn = $(".btn-apply");
    var removeBtn = $(".btn-remove");

    if (value) {
        $(procElement).show();
        $(applyBtn).prop('disabled', true);
        $(removeBtn).prop('disabled', true);
        $("#connect-btn").prop('disabled', true);
    } else {
        $(procElement).hide();
        $(applyBtn).prop('disabled', false);
        $(removeBtn).prop('disabled', false);
        $("#connect-btn").prop('disabled', false);
    }
}
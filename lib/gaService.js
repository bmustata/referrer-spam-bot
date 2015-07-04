RBOT.GaService = {}

// Replace with your client ID from the developer console
// Ex: <long-id>.apps.googleusercontent.com
var CLIENT_ID = '';

// Set authorized scope
// Ex: [ "https://www.googleapis.com/auth/analytics.readonly", "https://www.googleapis.com/auth/analytics", "https://www.googleapis.com/auth/analytics.edit" ]
var SCOPES = [];

var PREFIX_FILTER = "RefSpamBot";

RBOT.GaService.account = null;
RBOT.GaService.accountId = null;
RBOT.GaService.properties = [];

Meteor.startup(function () {

    Meteor.call("getGAClientId", function (err, data) {
        CLIENT_ID = data;
    });
    Meteor.call("getGAScope", function (err, data) {
        SCOPES = data;
    });
});

// Docs: https://developers.google.com/analytics/devguides/config/mgmt/v3/mgmtAuthorization
RBOT.GaService.authorize = function (event, done) {

    // Handles the authorization flow.
    var useImmdiate = event ? false : true;
    var authData = {
        client_id: CLIENT_ID,
        scope: SCOPES,
        immediate: useImmdiate
    };

    gapi.auth.authorize(authData, function (response) {

        if (response.error) {
            console.log("GA connect error", response.error);
        }
        else {
            console.log("GA connect ok");

            Promise.try(RBOT.GaService.queryAccounts)
                .then(RBOT.GaService.queryProperties)
                .map(function (p) {
                    return RBOT.GaService.queryViews(p.id);
                })
                .all()
                //.then(function () {
                //    return RBOT.GaService.buildQuerySession();
                //})
                //.then(function (data) {
                //    return RBOT.GaService.queryReferral(data[0]);
                //})
                .then(RBOT.GaService.getFilters)
                .then(function () {
                    console.log("GA init done");
                    if (typeof done != 'undefined') done();
                })
        }
    });
}

RBOT.GaService.queryAccounts = function () {

    return new Promise(function (resolve, reject) {

        // Load the Google Analytics client library
        gapi.client.load('analytics', 'v3').then(function () {

            // Get a list of all Google Analytics accounts for this user
            gapi.client.analytics.management.accounts.list().then(function (model) {

                if (model.result.items && model.result.items.length) {
                    RBOT.GaService.account = model.result.items[0];
                    RBOT.GaService.accountId = model.result.items[0].id;

                    console.log("GA account accountId=", RBOT.GaService.accountId);

                } else {
                    console.log('No accounts found for this user');
                }

                return resolve();
            })
        });
    });
}

RBOT.GaService.queryProperties = function () {

    return new Promise(function (resolve, reject) {

        // Get a list of all the properties for the account.
        gapi.client.analytics.management.webproperties.list({'accountId': RBOT.GaService.accountId})
            .then(function (model) {

                if (model.result.items && model.result.items.length) {

                    RBOT.GaService.properties = [];

                    _.each(model.result.items, function (prop) {

                        console.log("GA Property id=", prop.id, "name=", prop.name);

                        prop.subname = prop.name.substring(0, 2);
                        RBOT.GaService.properties.push(prop);
                    });

                } else {
                    console.log('No properties found for this user');
                }

                return resolve(RBOT.GaService.properties);
            });
    });
}

RBOT.GaService.queryViews = function (propertyId) {

    return new Promise(function (resolve, reject) {

        // Get a list of all Views (Profiles) for the first property
        gapi.client.analytics.management.profiles.list({
            'accountId': RBOT.GaService.accountId,
            'webPropertyId': propertyId
        })
            .then(function (model) {

                if (model.result.items && model.result.items.length) {

                    _.each(model.result.items, function (view) {

                        console.log("GA ", propertyId, "View id=", view.id, "name=", view.name);

                        var propFound = _.find(RBOT.GaService.properties, function (p) {
                            return p.id == propertyId
                        })

                        if (typeof propFound.views === 'undefined') {
                            propFound.views = [];
                            propFound.views.push(view);
                        } else {
                            propFound.views.push(view);
                        }

                        return resolve();
                    });

                } else {
                    console.log('No views (profiles) found for this user');
                    return resolve();
                }
            })
    });
}

RBOT.GaService.buildQuerySession = function () {

    console.log("buildQuerySession...");

    var sessionsPerViews = [];

    _.each(RBOT.GaService.properties, function (p) {

        _.each(p.views, function (v) {

            sessionsPerViews.push({view: v, viewId: v.id});
        });
    });

    return sessionsPerViews;
}

RBOT.GaService.querySession = function (data) {

    // console.log("querySession", viewId);
    return new Promise(function (resolve, reject) {

        // Query the Core Reporting API for the number sessions for
        gapi.client.analytics.data.ga.get({
            'ids': 'ga:' + data.viewId,
            'start-date': '30daysAgo',
            'end-date': 'today',
            'metrics': 'ga:sessions'
        })
            .then(function (model) {

                var totalSessions = model.result.totalsForAllResults["ga:sessions"];
                data.view.totalSessions = totalSessions;
                // console.log(totalSessions);

                return resolve();
            })
            .then(null, function (err) {

                console.log(err);
                return resolve();
            });
    });
}

RBOT.GaService.queryReferral = function (model) {

    console.log("queryReferral", model);

    return new Promise(function (resolve, reject) {

        // Query the Core Reporting API for the number sessions for
        gapi.client.analytics.data.ga.get({
            'ids': 'ga:' + model.viewId,
            'start-date': '31daysAgo',
            'end-date': 'today',
            'metrics': 'ga:sessions',
            'dimensions': 'ga:source',
            'filters': 'ga:medium==referral'
        })
            .then(function (response) {

                if (response) {

                    if (!response.result.rows || typeof response.result.rows === "undefined")
                        return reject("Referrer list is empty!");

                    return resolve({
                        propertyId: model.propertyId,
                        viewId: model.viewId,
                        refList: response.result.rows
                    });
                }
                else
                    return reject("Response is empty!");
            })
            .then(null, function (err) {

                console.log(err);
                return resolve(null);
            });
    });
}

RBOT.GaService.getFilters = function () {

    return new Promise(function (resolve, reject) {

        // Get a list of all the properties for the account.
        gapi.client.analytics.management.filters.list({'accountId': RBOT.GaService.accountId})
            .then(function (model) {

                if (model.result.items && model.result.items.length) {

                    _.each(model.result.items, function (filter) {
                        //console.log("Filter", filter);
                    });

                } else {
                    console.log('No filters found for this user');
                }

                return resolve();
            });
    });
}

RBOT.GaService.insertFilter = function (model) {

    console.log("insertFilter", model);

    return new Promise(function (resolve, reject) {

        var request = gapi.client.analytics.management.filters.insert(
            {
                'accountId': RBOT.GaService.accountId,
                'resource': {
                    'name': model.filterName,
                    'type': 'EXCLUDE',
                    'excludeDetails': {
                        'field': 'CAMPAIGN_SOURCE',
                        'matchType': 'MATCHES',
                        'expressionValue': model.filterData,
                        'caseSensitive': false
                    }
                }
            });

        request.execute(function (response) {

            // console.log("insertFilter response=", response);
            console.log("insertFilter done");

            gapi.client.analytics.management.profileFilterLinks.insert(
                {
                    'accountId': RBOT.GaService.accountId,
                    'webPropertyId': model.propertyId,
                    'profileId': model.viewId,
                    'resource': {
                        'filterRef': {
                            'id': response.id
                        }
                    }
                })
                .execute(function (response) {
                    // console.log("profileFilterLinks response=", response);
                    console.log("profileFilterLinks done");
                    return resolve();
                });
        });
    });
}

RBOT.GaService.computeFilters = function (model) {

    var refList = model.refList;
    console.log("computeFilters refList.length=", refList.length);

    return new Promise(function (resolve, reject) {

        Meteor.call('computeFilters', refList, function (err, data) {
            console.log("computeFilters done data=", data);

            var botFilters = [];
            _.each(data, function (regex, index) {
                botFilters.push({
                    propertyId: model.propertyId,
                    viewId: model.viewId,
                    filterName: PREFIX_FILTER + " #" + index,
                    filterData: regex
                });
            });

            return resolve(botFilters);
        })
    });
}

RBOT.GaService.getBotFiltersForView = function (model) {

    console.log("getFiltersForView propertyId=", model.propertyId, "viewId=", model.viewId);

    return new Promise(function (resolve, reject) {

        gapi.client.analytics.management.profileFilterLinks.list(
            {
                'accountId': RBOT.GaService.accountId,
                'webPropertyId': model.propertyId,
                'profileId': model.viewId,
            })
            .execute(function (response) {

                var filters = [];
                if (response && response.items.length > 0) {

                    _.each(response.items, function (i) {

                        // Check for bot filters PREFIX_FILTER
                        if (i.filterRef.name.toLowerCase().indexOf(PREFIX_FILTER.toLowerCase()) >= 0) {

                            filters.push({
                                propertyId: model.propertyId,
                                viewId: model.viewId,
                                filterLinkId: i.id,
                                filterId: i.filterRef.id,
                                filterName: i.filterRef.name
                            })
                        }
                    });
                }

                console.log("profileFilterLinks filters=", filters);

                return resolve(filters);
            });
    });
}

RBOT.GaService.removeBotFiltersForView = function (model) {

    console.log("removeBotFiltersForView model=", model);

    return new Promise(function (resolve, reject) {

        var request = gapi.client.analytics.management.profileFilterLinks.delete(
            {
                'accountId': RBOT.GaService.accountId,
                'webPropertyId': model.propertyId,
                'profileId': model.viewId,
                'linkId': model.filterLinkId
            });

        request.execute(function (response) {
            console.log("removeFilterLink done", response);

            gapi.client.analytics.management.filters.delete(
                {
                    'accountId': RBOT.GaService.accountId,
                    'filterId': model.filterId
                })
                .execute(function (response) {
                    console.log("removeFilter done", response);
                    return resolve();
                });
        });
    });
}

RBOT.GaService.insertBotFiltersForView = function (botFilter) {

    console.log("insertBotFiltersForView botFilter=", botFilter);

    return RBOT.GaService.insertFilter(botFilter);
}

RBOT.GaService.applyFilters = function (propertyId, viewId, done) {

    Promise
        .try(function () {
            return {propertyId: propertyId, viewId: viewId};
        })
        .then(RBOT.GaService.getBotFiltersForView)
        .each(RBOT.GaService.removeBotFiltersForView)
        .then(function () {
            return {propertyId: propertyId, viewId: viewId};
        })
        .then(RBOT.GaService.queryReferral)
        .then(RBOT.GaService.computeFilters)
        .each(RBOT.GaService.insertBotFiltersForView)
        .then(function () {
            console.log("Done");
            if (typeof done != 'undefined') done();
        })
        .catch(function (e) {
            console.error("Error", e);
            if (typeof done != 'undefined') done();
        });
}

RBOT.GaService.RemoveFilters = function (propertyId, viewId, done) {

    Promise
        .try(function () {
            return {propertyId: propertyId, viewId: viewId};
        })
        .then(RBOT.GaService.getBotFiltersForView)
        .each(RBOT.GaService.removeBotFiltersForView)
        .then(function () {
            console.log("Done");
            if (typeof done != 'undefined') done();
        })
        .catch(function (e) {
            console.error("Error", e);
            if (typeof done != 'undefined') done();
        });
}
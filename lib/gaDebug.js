printFilters = function(filter) {

    console.log('Account Id: ' + filter.accountId);
    console.log('Filter Id: ' + filter.id);
    console.log('Filter Kind: ' + filter.kind);
    console.log('Filter Name: ' + filter.name);
    console.log('Filter Created: ' + filter.created);
    console.log('Filter Updated: ' + filter.updated);

    // Get the filter type.
    var filterType = filter.type;
    console.log('Filter Type: ' + filter.type);

    // Print the properties if the filter is of type 'Exclude'.
    if (filterType == 'EXCLUDE') {
        var details = filter.excludeDetails;
        console.log('Exclude field: ' + details.field);
        console.log('Exclude match type: ' + details.matchType);
        console.log('Exclude expression value: ' + details.expressionValue);
        console.log('Exclude case sensitive: ' + details.caseSensitive);
    }

    // Print the properties if the filter is of type 'INCLUDE'.
    if (filterType == 'INCLUDE') {
        var details = filter.includeDetails;
        console.log('Include field: ' + details.field);
        console.log('Include match type: ' + details.matchType);
        console.log('Include expression value: ' + details.expressionValue);
        console.log('Include case sensitive: ' + details.caseSensitive);
    }

    // Print the properties if the filter is of type 'LOWERCASE'.
    if (filterType == 'LOWERCASE') {
        var details = filter.lowercaseDetails;
        console.log('Lowercase field: ' + details.field);
    }

    // Print the properties if the filter is of type 'UPPERCASE'.
    if (filterType == 'UPPERCASE') {
        var details = filter.lowercaseDetails;
        console.log('Uppercase field: ' + details.field);
    }

    // Print the properties if the filter is of type 'SEARCH_AND_REPLACE'.
    if (filterType == 'SEARCH_AND_REPLACE') {
        var details = filter.searchAndReplaceDetails;
        console.log('Search and replace field: ' + details.field);
        console.log('Search string: ' + details.searchString);
        console.log('Replace string: ' + details.replaceString);
        console.log('Search case sensitive: ' + details.caseSensitive);
    }

    // Print the properties if the filter is of type 'ADVANCED'.
    if (filterType == 'ADVANCED') {
        var details = filter.advancedDetails;
        console.log('Advanced field A: ' + details.fieldA);
        console.log('Advanced extract A: ' + details.extractA);
        console.log('Advanced field B: ' + details.fieldB);
        console.log('Advanced extract B: ' + details.extractB);
        console.log('Advanced output field: ' + details.outputToField);
        console.log('Advanced output constructor: '
            + details.outputConstructor);
        console.log('Advanced field A required: ' + details.fieldARequired);
        console.log('Advanced field B required: ' + details.fieldBRequired);
        console.log('Advanced override output field: '
            + details.overrideOutputField);
        console.log('Advanced case sensitive: ' + details.caseSensitive);
    }
}
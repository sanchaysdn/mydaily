"use strict"

angular.module("Cms")

.factory('CmsService', ['$http', 'communicationService', '$resource', function($http, communicationService, $resource) {

    var getCmsList = function() {
        return $resource('/api/getAllCmsList', null, {
            save: {
                method: 'POST'
            }
        });
    }

    var getCmsById = function() {
        return $resource('/api/getCmsByID', null, {
            save: {
                method: 'POST',
                id: '@id'
            }
        });
    }

    var updateCms = function() {
        return $resource('/api/updateCms', null, {
            save: {
                method: 'POST'
            }
        });
    }
    return {
        getCmsList: getCmsList,
        updateCms: updateCms,
        getCmsById: getCmsById,
    }

}]);

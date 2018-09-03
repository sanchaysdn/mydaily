"use strict"

// angular.module("Product")

neoApp.factory('CrewService', ['$http', 'communicationService', '$resource', function($http, communicationService, $resource) {

    var getCrewList = function() {
        return $resource('/api/getCrewList', null, {
            save: {
                method: 'Post'
            }
        });
    }
    var addUpdateCrewsData = function() {
        return $resource('/api/addUpdateCrewsData', null, {
            save: {
                method: 'Post'
            }
        });
    }

     var getCrewsById = function() {
        return $resource('/api/getCrewById/:id', null, {
            get: {
                method: 'GET',
                id: '@id'
            }
        });
    }

    var deleteCrews = function() {
        return $resource('/api/deleteCrewsById/:id', null, {
            delete: {
                method: 'DELETE',
                id: '@id'
            }
        });
    }

    
    return {
        getCrewList: getCrewList,
        addUpdateCrewsData:addUpdateCrewsData,
        getCrewsById:getCrewsById,
        deleteCrews:deleteCrews
    }

}]);

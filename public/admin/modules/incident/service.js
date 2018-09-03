"use strict"

// angular.module("Product")

neoApp.factory('IncidentService', ['$http', 'communicationService', '$resource', function ($http, communicationService, $resource) {

    var getIncidentList = function () {
        return $resource(' /api/getIncidentListByAdmin', null, {
            save: {
                method: 'Post'
            }
        });
    }

    var deleteIncidentId = function () {
        return $resource('/api/deleteIncidentId/:id', null, {
            delete: {
                method: 'DELETE',
                id: '@id'
            }
        });
    }
    var getIncidentById = function () {
        return $resource('/api/getIncidentById/:id', null, {
            get: {
                method: 'GET',
                id: '@id'
            }
        });
    }
    var addUpdateIncidentData = function () {
        return $resource('/api/addUpdateincident', null, {
            save: {
                method: 'Post'
            }
        });
    }
    var downloadIncidentPdf = function () {
        console.log("inside service")
        return $resource('/api/downloadIncidentPdf', null, {
            save: {
                method: 'Post'
            }
        });
    }
    var updateIncidentStatus = function () {
        console.log("inside service")
        return $resource('/api/updateIncidentStatus', null, {
            save: {
                method: 'Post'
            }
        });
    }
    var saveViewEditIncident = function () {
        console.log("inside service saveViewEditIncident ");
        return $resource('/api/saveViewEditIncident', null, {
            save: {
                method: 'Post'
            }
        });
    }
    var downloadMultiplePdf = function () {
        return $resource('/api/downloadMultiplePdf', null, {
            save: {
                method: 'Post'
            }
        });
    }
    var getIncidentByDate = function () {
        return $resource('/api/getIncidentByDate', null, {
            save: {
                method: 'Post'
            }
        });
    }
    return {
        addUpdateIncidentData: addUpdateIncidentData,
        getIncidentList: getIncidentList,
        deleteIncidentId: deleteIncidentId,
        getIncidentById: getIncidentById,
        downloadIncidentPdf: downloadIncidentPdf,
        updateIncidentStatus: updateIncidentStatus,
        saveViewEditIncident: saveViewEditIncident,
        downloadMultiplePdf: downloadMultiplePdf,
        getIncidentByDate: getIncidentByDate

    }

}]);
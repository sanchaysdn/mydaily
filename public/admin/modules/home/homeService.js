"use strict"

angular.module("Home")

.factory('HomeService', ['$http', 'communicationService', '$resource', function($http, communicationService, $resource) {

    var getCounts = function() {
        return $resource('/api/dashboardCount', null, {
            get: {
                method: 'GET'
            }
        });
    }

    var getCmsPageByName = function() {
        return $resource('/api/getCmsPageByName', null, {
            save: {
                method: 'POST'
            }
        });
    }   
    var getjobMapData = function() {
     
        return $resource('/api/getJobmapdata', null, {
            save: {
                method: 'POST'
            }
        });
    }   
    var getjobMapById = function() {
        
        return $resource('/api/getjobMapById', null, {
            save: {
                method: 'POST'
            }
        });
    }     
      var getForemenReport = function() {
        return $resource('/api/getForemenReport', null, {
            get: {
                method: 'GET'
            }
        });
    }
   var purchaseDailies = function() {
        
        return $resource('/api/purchaseDailies', null, {
            save: {
                method: 'POST'
            }
        });
    }






  

    return {
        getCounts: getCounts,
        getCmsPageByName: getCmsPageByName,
        getjobMapData:getjobMapData,
        getjobMapById:getjobMapById,
        getForemenReport:getForemenReport,
        purchaseDailies:purchaseDailies
    }

}]);

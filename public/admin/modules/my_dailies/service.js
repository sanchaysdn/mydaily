"use strict"

// angular.module("Product")

neoApp.factory('DailiesService', ['$http', 'communicationService', '$resource', function ($http, communicationService, $resource) {

    var getDailiesList = function () {
        return $resource('/api/listMyDailiesByAdmin', null, {
            save: {
                method: 'Post'
            }
        });
    }
    var getDailiesByID = function () {
        return $resource('/api/getDailiesByID', null, {
            save: {
                method: 'Post'
            }
        });
    }
    var deleteDailies = function () {
        return $resource('/api/deleteDailiesByID/:id', null, {
            delete: {
                method: 'DELETE',
                id: '@id'
            }
        });
    }

    var downloadpdf = function () {
        return $resource('/api/downloadPdf', null, {
            save: {
                method: 'Post'
            }
        });
    }

    var downloadxls = function () {
        return $resource('/api/downloadXls', null, {
            save: {
                method: 'Post'
            }
        });
    }
    var updateDailyStatus = function () {
        return $resource('/api/updateDailyStatus', null, {
            save: {
                method: 'Post'
            }
        });
    }
    var saveViewEdit = function () {
        return $resource('/api/saveViewEdit', null, {
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
    var getDailiesDate = function () {
        return $resource('/api/getDailiesDate', null, {
            save: {
                method: 'Post'
            }
        });
    }
   var getDeletedDailies = function () {
        return $resource('/api/getDeletedDailies', null, {
            save: {
                method: 'Post'
            }
        });
    }
      var archiveDailies = function () {
          console.log("fddasfkjsa")
        return $resource('/api/archiveDailies', null, {
            save: {
                method: 'Post'
            }
        });
    }
    // var getDailiesListByDate = function () {
    //     console.log("inside downloadMultiplePdf")
    //     return $resource('/api/getDailiesListByDate', null, {
    //         save: {
    //             method: 'Post'
    //         }
    //     });
    // }

    return {
        getDailiesList: getDailiesList,
        getDailiesByID: getDailiesByID,
        deleteDailies: deleteDailies,
        downloadpdf: downloadpdf,
        downloadxls: downloadxls,
        updateDailyStatus: updateDailyStatus,
        saveViewEdit: saveViewEdit,
        downloadMultiplePdf: downloadMultiplePdf,
        getDailiesDate: getDailiesDate,
        getDeletedDailies:getDeletedDailies,
        archiveDailies: archiveDailies
        // getDailiesListByDate: getDailiesListByDate,

    }

}]);
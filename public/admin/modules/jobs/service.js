"use strict"

// angular.module("Product")

neoApp.factory('JobService', ['$http', 'communicationService', '$resource', function($http, communicationService, $resource) {
   
    var getJobListAdmin = function() {
        return $resource('/api/getJobListAdmin', null, {
            save: {
                method: 'Post'
            }
        });
    }
    var addUpdateGeneralData = function() {
        return $resource('/api/addUpdateGeneralData', null, {
            save: {
                method: 'Post'
            }
        });
    }

    var listAllBillableItem = function() {
        return $resource('/api/listAllBillableItem/:id', null, {
            get: {
                method: 'GET',
                id: '@id'
            }
        });
    }

    var getbillableList = function(){
      
        return $resource('/api/getbillableList', null, {
            save: {
                method: 'Post'
            }
        });   
    }

    var addUpdateBillingInfoData = function(){
        return $resource('/api/addUpdateBillingInfoData', null, {
            save: {
                method: 'Post'
            }
        });
    }

    var addUpdateDailyPathData = function(){
        return $resource('/api/addUpdateDailyPathData', null, {
            save: {
                method: 'Post'
            }
        });
    }

    var addBillableItem = function(){
        return $resource('/api/addBillableItem', null, {
            save: {
                method: 'Post'
            }
        });
    }

    var getJobInfoById = function() {
        return $resource('/api/getJobInfoById/:id', null, {
            get: {
                method: 'GET',
                id: '@id'
            }
        });
    }

    var getSupervisorJobInfoById = function() {
        return $resource('/api/getSupervisorJobInfoById/:id', null, {
            get: {
                method: 'GET',
                id: '@id'
            }
        });
    }

    var getItemInfoById = function(){
        return $resource('/api/getItemInfoById/:id', null, {
            get: {
                method: 'GET',
                id: '@id'
            }
        });   
    }

    var deleteItem = function() {
        return $resource('/api/deleteItemById/:id', null, {
            delete: {
                method: 'DELETE',
                id: '@id'
            }
        });
    }

    var deleteJob = function() {
        return $resource('/api/deleteJobById/:id', null, {
            delete: {
                method: 'DELETE',
                id: '@id'
            }
        });
    }

    var getAllSupervisor = function() {
        return $resource('/api/getAllSupervisor/:id', null, {
            get: {
                method: 'GET',
                id:'@id'
            }
        });

    }

    var InviteJob = function(){
        return $resource('/api/jobInvites', null, {
            save: {
                method: 'Post'
            }
        });
    }
     var getJobId = function() {
        return $resource('/api/getJobId', null, {
            save: {
                method: 'Post'
            }
        });
    }
    var shareJobAcceptence = function() {
        return $resource('/api/shareJobAcceptence', null, {
            save: {
                method: 'Post'
            }
        });
    }
    var getInvite_Supervisor_Id = function() {
        return $resource('/api/getInvite_Supervisor_Id', null, {
            save: {
                method: 'Post'
            }
        });
    }

    var getBillableItem = function(){
        return $resource('/api/getBillableItem/:id', null, {
            get: {
                method: 'GET',
                id:'@id'
            }
        });
    }
     var matchToken = function(){
         console.log('YESSS')
        return $resource('/api/matchToken', null, {
            get: {
                method: 'GET'
                // id:'@id'
            }
        });
    }
        var addSubJobs = function(){
            console.log("inside Service")

        return $resource('/api/addSubJobs', null, {
            save: {
                method: 'Post'
            }
        });
    }
    return {
      
        getJobListAdmin: getJobListAdmin,
        addUpdateGeneralData:addUpdateGeneralData,
        listAllBillableItem:listAllBillableItem,
        addUpdateBillingInfoData:addUpdateBillingInfoData,
        getJobInfoById:getJobInfoById,
        addBillableItem:addBillableItem,
        getbillableList:getbillableList,
        getItemInfoById:getItemInfoById,
        deleteItem:deleteItem,
        getAllSupervisor:getAllSupervisor,
        addUpdateDailyPathData:addUpdateDailyPathData,
        getSupervisorJobInfoById:getSupervisorJobInfoById,
        InviteJob:InviteJob,
        getJobId:getJobId,
        shareJobAcceptence:shareJobAcceptence,
        getInvite_Supervisor_Id:getInvite_Supervisor_Id,
        deleteJob:deleteJob,
        getBillableItem:getBillableItem,
        matchToken:matchToken,
        addSubJobs:addSubJobs,
    }

}]);

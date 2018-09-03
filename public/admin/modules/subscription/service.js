"use strict"


neoApp.factory('SubscriptionService', ['$http', 'communicationService', '$resource', function($http, communicationService, $resource) {

    var getSubscriptionList = function() {
        return $resource('/api/getSubscriptionList', null, {
            save: {
                method: 'Post'
            }
        });
    }

    var getActivePlan = function() {
        return $resource('/api/getActivePlan', null, {
            save: {
                method: 'Post'
            }
        });
    }

    var addUpdateSubscriptionData = function() {
        return $resource('/api/addUpdateSubscriptionData', null, {
            save: {
                method: 'Post'
            }
        });
    }

     var getSubscriptionById = function() {
        return $resource('/api/getSubscriptionById/:id', null, {
            get: {
                method: 'GET',
                id: '@id'
            }
        });
    }

    var deleteSubscription = function() {
        return $resource('/api/deleteSubscriptionById/:id', null, {
            delete: {
                method: 'DELETE',
                id: '@id'
            }
        });
    }

    var enableDisableSubscription = function() {
        return $resource('/api/enableDisableSubscription', null, {
            save: {
                method: 'POST'
            }
        });
    }
     var subscriptionCount = function() {
        return $resource('/api/subscriptionCount', null, {
            save: {
                method: 'POST'
            }
        });
    }

    
    return {
        getSubscriptionList: getSubscriptionList,
        addUpdateSubscriptionData:addUpdateSubscriptionData,
        getSubscriptionById:getSubscriptionById,
        deleteSubscription:deleteSubscription,
        enableDisableSubscription:enableDisableSubscription,
        getActivePlan:getActivePlan,
        subscriptionCount:subscriptionCount
    }

}]);

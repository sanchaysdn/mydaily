"use strict"

angular.module("Users")

.factory('PaymentService', ['$http', 'communicationService', '$resource', function($http, communicationService, $resource) {

    var getPaymentList = function() {
        return $resource('/api/getPaymentList', null, {
            get: {
                method: 'GET'
            }
        });
    }
    var addSubscription = function() {
        return $resource('/api/addSubscription', null, {
            save: {
                method: 'POST'
            }
        });
    }

    return {
        getPaymentList: getPaymentList,
        addSubscription: addSubscription
    }

}]);

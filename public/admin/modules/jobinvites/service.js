"use strict"

// angular.module("Product")

neoApp.factory('InvitiesService', ['$http', 'communicationService', '$resource', function($http, communicationService, $resource) {

    var getInvitiesList = function() {
        return $resource('/api/getInvitiesList', null, {
            save: {
                method: 'Post'
            }
        });
    }

    var getInvitie = function(){
        return $resource('/api/getjobInvites', null, {
            save: {
                method: 'Post'
            }
        });
    }

    var acceptInvite = function(){

        return $resource('/api/acceptJobInvite', null, {
            save: {
                method: 'Post'
            }
        });
    }

    var rejectInvite = function(){

            return $resource('/api/rejectJobInvite', null, {
                save: {
                    method: 'Post'
                }
            });
        }
    
    
    return {
        getInvitiesList: getInvitiesList,
        getInvitie:getInvitie,
        acceptInvite:acceptInvite,
        rejectInvite:rejectInvite
    }

}]);

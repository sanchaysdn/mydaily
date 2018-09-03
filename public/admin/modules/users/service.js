"use strict"

angular.module("Users")

    .factory('UserService', ['$http', 'communicationService', '$resource', function ($http, communicationService, $resource) {

        var getUsersList = function () {
            return $resource('/api/getUserList', null, {
                get: {
                    method: 'GET'
                }
            });
        }

        var getSupervisorList = function () {
            return $resource('/api/getSupervisorList', null, {
                get: {
                    method: 'GET'
                }
            });
        }

        var getForemenList = function () {
            return $resource('/api/getForemenList', null, {
                get: {
                    method: 'POST'
                }
            });
        }

        var getForemenDetail = function () {
            return $resource('/api/getForemenDetail', null, {
                get: {
                    method: 'POST'
                }
            });
        }



        var getAllSupervisor = function () {
            return $resource('/api/getAllSupervisor/:id', null, {
                get: {
                    method: 'GET',
                    id: '@id'
                }
            });
        }

        var getRoleList = function () {
            return $resource('/api/getRoleList', null, {
                get: {
                    method: 'GET'
                }
            });
        }

        var getUserById = function () {
            return $resource('/api/getUserByIdAdmin/:id', null, {
                get: {
                    method: 'GET',
                    id: '@id'
                }
            });
        }

        var addUpdateUser = function () {
            return $resource('/api/updateUserData', null, {
                save: {
                    method: 'POST'
                }
            });
        }
        var updateUserStatus = function () {
            console.log("inside service")
            return $resource('/api/updateUserStatus', null, {
                save: {
                    method: 'POST',

                }
            })
        }

        var addContractor = function () {
            return $resource('/api/addContractor', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        var addSupervisor = function () {
            return $resource('/api/addSupervisor', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        var addForemen = function () {
            return $resource('/api/addForemen', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        var enableDisableUser = function () {
            return $resource('/api/enableDisableUser', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        var getUserBidList = function () {
            return $resource('/api/getUserBidListAdmin', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        var changePassword = function () {
            return $resource('/api/changePassword', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        var adminProfileUpdate = function () {
            return $resource('/api/adminProfileUpdate', null, {
                save: {
                    method: 'POST'
                }
            });
        }

        var updateUserPic = function () {
            return $resource('/api/updateUserPic', null, {
                save: {
                    method: 'POST',
                    headers: {
                        'Content-Type': undefined
                    }
                }
            });
        }

        var deleteUser = function () {
            return $resource('/api/deleteUserById/:id/:parent_id', null, {
                delete: {
                    method: 'DELETE',
                    id: '@id'
                }
            });
        }

        var getSubcontractorList = function () {
            return $resource('/api/getSubcontractorList', null, {
                get: {
                    method: 'POST'
                }
            });
        }
        var downloadPath = function () {
            return $resource('/api/getSupervisorList', null, {
                get: {
                    method: 'POST'
                }
            });
        }






        var addSubcontractor = function () {
            return $resource('/api/addSubcontractor', null, {
                save: {
                    method: 'POST'
                }
            });

        }
        var contractorCount = function () {
            return $resource('/api/contractorCount', null, {
                save: {
                    method: 'POST'
                }
            });

        }
        var uploadImage = function () {
            return $resource(webservices.uploadImage, null, {
                save: {
                    method: 'POST',
                    headers: {
                        'Content-Type': undefined
                    }
                }
            });
        }
        var extendUserTrial = function () {
            return $resource('/api/extendUserTrial', null, {
                save: {
                    method: 'POST'
                }
            });

        }





        return {
            getUsersList: getUsersList,
            getSupervisorList: getSupervisorList,
            getForemenList: getForemenList,
            getForemenDetail: getForemenDetail,
            addUpdateUser: addUpdateUser,
            addContractor: addContractor,
            addForemen: addForemen,
            addSupervisor: addSupervisor,
            getRoleList: getRoleList,
            getAllSupervisor: getAllSupervisor,
            updateUserPic: updateUserPic,
            getUserById: getUserById,
            deleteUser: deleteUser,
            enableDisableUser: enableDisableUser,
            changePassword: changePassword,
            adminProfileUpdate: adminProfileUpdate,
            getUserBidList: getUserBidList,
            getSubcontractorList: getSubcontractorList,
            addSubcontractor: addSubcontractor,
            contractorCount: contractorCount,
            uploadImage: uploadImage,
            updateUserStatus: updateUserStatus,
            downloadPath: downloadPath,
            extendUserTrial: extendUserTrial
        }

    }]);
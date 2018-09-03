"use strict";


angular.module("Authentication");

neoApp.controller('loginController', ['$scope', '$rootScope', '$location', 'AuthenticationService', '$localStorage', 'logger', '$cookies',
    function ($scope, $rootScope, $location, AuthenticationService, $localStorage, logger, $cookies) {

        var inputJSON = "";
        $scope.user = {};

        $scope.user.email = $cookies.get('email');
        $scope.user.password = $cookies.get('password');
        $scope.user.remember = $cookies.get('remember');
        $scope.isRemebercheck = $scope.user.remember ? true : false

        $scope.forgotPass = {};
        $scope.isPasswordSent = false;
        $scope.disabled = false;
        $scope.loader = false;

        $scope.login = function (form) {
            if (form.$valid) {
                if ($scope.user.remember == true) {
                    var exp = moment().add(30, 'days').format("YYYY-MM-DD");
                    $cookies.put('email', $scope.user.email, {
                        expires: exp
                    });
                    $cookies.put('password', $scope.user.password, {
                        expires: exp
                    });
                    $cookies.put('remember', $scope.user.remember, {
                        expires: exp
                    });
                } else if ($scope.user.remember == false) {
                    $cookies.remove("email");
                    $cookies.remove("password");
                    $cookies.remove("remember");
                } else {
                    var exp = moment().add(30, 'days').format("YYYY-MM-DD");
                    $cookies.put('email', $scope.user.email, {
                        expires: exp
                    });
                    $cookies.put('password', $scope.user.password, {
                        expires: exp
                    });
                    $cookies.put('remember', true, {
                        expires: exp
                    });
                }
                $scope.disabled = true;
                $scope.loader = true;
                AuthenticationService.Login($scope.user, function (response) {
                    var errorMessage = '';
                    $scope.disabled = false;
                    $scope.loader = false;
                    if (response.code == 200) {
                        $localStorage.userLoggedIn = true;
                        $localStorage.token = response.data.token;
                        $localStorage.Id=response.data._id;
                        if(response.data.role.code == 'Contractor') $location.path('/dailies');

                        if(response.data.role.code == 'ADMIN') $location.path('/dashboard');
                    } else {
                        logger.logError(response.message);
                    }
                });
            }
        };

        //logout
        $scope.logout = function () {
            delete $localStorage.token;
            delete $rootScope.user_level;
            $rootScope.userLoggedIn = false;
            $location.path('/login');
        }


        //forgot password
        $scope.resendPassword = function (form) {
            if (form.$valid) {
                $scope.disabled = true;
                $scope.loader = true;
                AuthenticationService.resendPassword($scope.forgotPass, function (response) {
                    $scope.disabled = false;
                    $scope.loader = false;
                    if (response.code == 200) {
                        $scope.isPasswordSent = true;
                        logger.logSuccess(response.message);
                    } else {
                        logger.logError(response.message);
                    }
                });
            }
        }
    }
]);
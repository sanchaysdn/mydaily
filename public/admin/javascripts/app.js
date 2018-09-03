"use strict";
angular.module("Authentication", []);
angular.module("Home", []);
angular.module("communicationModule", []);
angular.module("Users", []);
angular.module("Roles", []);
angular.module("Cms", []);
angular.module("Jobinvities", []);
angular.module("Subscription", []);
angular.module("Payments", []),
    angular.module("Incident", [])
angular.module("Dailies", [])


var neoApp = angular.module('neoApp', ['ui.router', 'ngRoute', 'ngStorage', 'ngTable', 'ngResource', 'Authentication',
        'Home', 'communicationModule', 'Users', 'ui.bootstrap', 'ui.tinymce', 'Cms', 'Jobinvities', 'Subscription', 'Payments', 'Incident', 'Dailies', 'credit-cards', 'nya.bootstrap.select', 'angularMoment', 'ngCookies', 'ngMap', 'daterangepicker',
    ])
    .factory("CommonService", ["$http", "$resource", "$rootScope", function ($http, $resource, $rootScope) {

        var user = {};
        var getUser = function () {
            return user;
        };
        var setUser = function (userData) {
            user = '';
            user = userData;
        };
        return {
            getUser: getUser,
            setUser: setUser
        }
    }])
    .service('dataService', function () {

        var myData = {};

        var setData = function (newData) {
            myData = newData;
        }

        var getData = function () {
            console.log("mydata",myData)
            return myData;
        }

        return {
            setData: setData,
            getData: getData
        };
    })
    .filter('sumOfValue', function () {
        return function (data, key) {
            if (angular.isUndefined(data) || angular.isUndefined(key))
                return 0;
            var sum = 0;
            angular.forEach(data, function (value) {
                sum = sum + parseInt(value[key], 10);
            });
            return sum;
        }
    })

    .config(['$routeProvider', '$httpProvider', '$locationProvider', '$stateProvider', '$urlRouterProvider', function ($routeProvider, $httpProvider, $locationProvider, $stateProvider, $urlRouterProvider) {

        $httpProvider.interceptors.push(function ($q, $location, $localStorage) {
            return {
                request: function (config) {
                    config.headers = config.headers || {};
                    // config.headers['Authorization'] = 'Basic d2VudHdvcnRobWFuOkNoYW5nZV9tZQ==';
                    config.headers['authorization'] = 'admin_bearer ' + $localStorage.token;
                    config.headers['client-type'] = 'browser'; // this is used to detect the request is from the browser
                    return config;
                },
                response: function (response) {
                    if (response.data.code == 401) {
                        delete $localStorage.token;
                        // handle the case where the user is not authenticated
                        $location.path('/login');
                    }
                    return response || $q.when(response);
                }
            };
        });

        var checkLoggedin = function ($q, $timeout, $http, $location, $rootScope, $state, CommonService) {
            // Initialize a new promise
            var deferred = $q.defer();

            // Make an AJAX call to check if the user is logged in
            $http.get('/api/loggedin').success(function (response) {
                // Authenticated
                var user = response.user;
                if (response.status == 'OK') {
                    // this will set the user in the session to the application model
                    CommonService.setUser(user);

if (response.user.role.code == 'Contractor') {
       $state.go('dailies');
}
    if(response.user.role.code == 'ADMIN'){
                 $state.go('dashboard');
                    }    
            }
                // // Not Authenticated
                else {
                    $timeout(function () {
                        deferred.resolve();
                    }, 0);
                }
            }).error(function (error) {
                $timeout(function () {
                    deferred.resolve();
                }, 0);
            });
            return deferred.promise;
        };

        var checkLoggedout = function () {
            return ['$q', '$timeout', '$http', '$location', '$rootScope', '$state', 'CommonService',
                function ($q, $timeout, $http, $location, $rootScope, $state, CommonService) {
                    // Initialize a new promise

                    var deferred = $q.defer();
                    // Make an AJAX call to check if the user is logged in
                    $http.get('/api/loggedin').success(function (response) {
                        console.log('asdasd', response.status);
                        // Authenticated
                        if (response.status == 'OK') {
                            var user = response.user;
                            CommonService.setUser(user);
                            // $state.go('effort');
                            $timeout(deferred.resolve, 0);
                        }
                        // Not Authenticated
                        else {
                            $timeout(function () {
                                deferred.resolve();
                            }, 0);
                            $state.go('login');
                        }
                    }).error(function (error) {
                        $timeout(function () {
                            deferred.resolve();
                        }, 0);
                        $state.go('login');
                    });
                    return deferred.promise;
                }

            ];
        };

        $urlRouterProvider.otherwise('/login');
        $stateProvider
            // // HOME STATES AND NESTED VIEWS ========================================
            // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
            .state('login', {
                url: '/login',
                views: {
                    'content': {
                        templateUrl: '/admin/modules/authentication/views/login.html',
                        controller: "loginController"
                    }
                },
                data: {
                    isAuthenticate: false
                },
                resolve: {
                    loggedin: checkLoggedin,
                    // loadPlugin: function($ocLazyLoad) {
                    //     return $ocLazyLoad.load([
                    //         '/admin/admin/modules/auth/controllers/loginController.js',
                    //         '/admin/admin/modules/auth/services/authService.js'
                    //     ]);
                    // }
                }
            })
            .state('verifying_link', {
                url: '/verifying-link',
                views: {
                    'content': {
                        templateUrl: '/admin/modules/home/views/verifying_link.html',
                        controller: "homeController"
                    }
                },
                data: {},
                resolve: {}
            })
            .state('forgot_password', {
                url: '/forgot-password',
                views: {
                    'content': {
                        templateUrl: '/admin/modules/authentication/views/forgot-password.html',
                        controller: "loginController"
                    }
                },
                data: {},
                resolve: {
                    loggedin: checkLoggedin,
                }
            })
            .state('terms&condition', {
                url: '/terms-and-condition',
                views: {
                    'content': {
                        templateUrl: '/admin/modules/home/views/terms-and-condition.html',
                        controller: "homeController"
                    }
                },
                data: {},
                resolve: {
                    // loggedin: checkLoggedin,
                }
            })
            .state('privacy', {
                url: '/privacy',
                views: {
                    'content': {
                        templateUrl: '/admin/modules/home/views/privacy.html',
                        controller: "homeController"
                    }
                },
                data: {},
                resolve: {
                    // loggedin: checkLoggedin,
                }
            })
            .state('helpCenter', {
                url: '/help-center',
                views: {
                    'content': {
                        templateUrl: '/admin/modules/home/views/help-center.html',
                        controller: "homeController"
                    }
                },
                data: {},
                resolve: {
                    // loggedin: checkLoggedin,
                }
            })
                .state('dashboard', {
                    url: '/dashboard',
                    views: {
                        'header': {
                            templateUrl: '/admin/modules/home/views/header.html',
                            controller: "homeController"
                        },
                        'leftBar': {
                            templateUrl: '/admin/modules/home/views/leftBar.html'
                        },
                        'content': {
                            templateUrl: '/admin/modules/home/views/home.html',
                            controller: "homeController"
                        }
                    },
                    data: {
                        isAuthenticate: true
                    },
                    resolve: {
                        loggedin: checkLoggedout()
                    }
                })
            .state('users', {
                url: '/users',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html',
                        controller: "homeController"
                    },
                    'content': {
                        templateUrl: '/admin/modules/users/views/listuser.html',
                        controller: "userController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('paymentList', {
                url: '/paymentList',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html',
                        controller: "homeController"
                    },
                    'content': {
                        templateUrl: '/admin/modules/payments/views/listpayment.html',
                        controller: "paymentController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('supervisor', {
                url: '/supervisor',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html',
                        controller: "homeController"
                    },
                    'content': {
                        templateUrl: '/admin/modules/users/views/listsupervisor.html',
                        controller: "userController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('foremen', {
                url: '/foremen',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html',
                        controller: "homeController"
                    },
                    'content': {
                        templateUrl: '/admin/modules/users/views/listforemen.html',
                        controller: "userController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })

            .state('subcontractor', {
                url: '/subcontractor',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html',
                        controller: "homeController"
                    },
                    'content': {
                        templateUrl: '/admin/modules/jobinvites/views/listjobinvitesto.html',
                        controller: "invitiesController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('newJob', {
                url: '/newJob',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html',
                        controller: "homeController"
                    },
                    'content': {
                        templateUrl: '/admin/modules/jobinvites/views/newInvitieJob.html',
                        controller: "invitiesController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('contractor_signup', {
                url: '/contractor/signup',
                views: {
                    'content': {
                        templateUrl: '/admin/modules/users/views/contractor_signup.html',
                        controller: "userController"
                    }
                },
                data: {
                    isAuthenticate: false
                },
                resolve: {
                    loggedin: checkLoggedin
                }
            })
            .state('plan', {
                url: '/plan',
                views: {

                    'content': {
                        templateUrl: '/admin/modules/payments/views/plans.html',
                        controller: "paymentController"
                    }
                }
            })
            .state('supervisor_signup', {
                url: '/supervisor/signup',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html',
                        controller: "homeController"
                    },
                    'content': {
                        templateUrl: '/admin/modules/users/views/supervisor_signup.html',
                        controller: "userController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('foremen_signup', {
                url: '/formen/signup',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html',
                        controller: "homeController"
                    },
                    'content': {
                        templateUrl: '/admin/modules/users/views/foremen_signup.html',
                        controller: "userController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })

            .state('crews', {
                url: '/crews/:id',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/admin/modules/crews/views/listCrews.html',
                        controller: "crewsController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('subscribe_account', {
                url: '/subscribe_account/:email',
                views: {
                    'content': {
                        templateUrl: '/admin/modules/payments/views/subscribe_account.html',
                        controller: "paymentController"
                    }
                }
            })
            .state('crews_signup', {
                url: '/crews_signup/:id',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/admin/modules/crews/views/addCrews.html',
                        controller: "crewsController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('crews_edit', {
                url: '/crews_edit/:id',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/admin/modules/crews/views/edit_crews.html',
                        controller: "crewsController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('billableItems', {
                url: '/billableItems',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html',
                        controller: "homeController"
                    },
                    'content': {
                        templateUrl: '/admin/modules/jobs/views/listBillableItem.html',
                        controller: "jobController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('addItems', {
                url: '/addItems',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html',
                        controller: "homeController"
                    },
                    'content': {
                        templateUrl: '/admin/modules/jobs/views/addItems.html',
                        controller: "jobController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('item-edit', {
                url: '/item-edit/:id',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/admin/modules/jobs/views/addItems.html',
                        controller: "jobController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('job', {
                url: '/job',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html',
                        controller: "homeController"
                    },
                    'content': {
                        templateUrl: '/admin/modules/jobs/views/listJob.html',
                        controller: "jobController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('addJob', {
                url: '/addJob',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html',
                        controller: "homeController"
                    },
                    'content': {
                        templateUrl: '/admin/modules/jobs/views/addJob.html',
                        controller: "jobController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('billingInfo', {
                url: '/billingInfo/:id/:job_id',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html',
                        controller: "homeController"
                    },
                    'content': {
                        templateUrl: '/admin/modules/jobs/views/billing_info.html',
                        controller: "jobController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('daily-path', {
                url: '/daily-path/:id/:job_id',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/admin/modules/jobs/views/dailyPath.html',
                        controller: "jobController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('job-edit', {
                url: '/job-edit/:id/:job_id',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/admin/modules/jobs/views/addJob.html',
                        controller: "jobController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })

             .state('job-share', {
                url: '/job-share/:id/:job_id',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/admin/modules/jobs/views/dailyPath.html',
                        controller: "jobController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })

        



            .state('inviteJob', {
                url: '/inviteJob/:id/:job_id',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html',
                        controller: "homeController"
                    },
                    'content': {
                        templateUrl: '/admin/modules/jobs/views/sharejob.html',
                        controller: "jobController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })

            .state('users_edit', {
                url: '/user-edit/:id',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/admin/modules/users/views/adduser.html',
                        controller: "userController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })

            .state('purhaseDailes', {
                url: '/purhaseDailes',
                views: {

                    'content': {
                        templateUrl: '/admin/modules/home/views/purchase_dailies.html',
                        controller: "purhaseDailesController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
             .state('extendUserTrial', {
                url: '/extendUserTrial/:id',
                views: {

                    'content': {
                        templateUrl: '/admin/modules/users/views/extendUserTrial.html',
                        controller: "extendUserTrialController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })




            .state('profile', {
                url: '/profile',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/admin/modules/users/views/profile.html',
                        controller: "userController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('products', {
                url: '/products',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/admin/modules/products/views/listProduct.html',
                        controller: "productController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('orders', {
                url: '/orders',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/admin/modules/orders/views/listOrder.html',
                        controller: "orderController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('cms', {
                url: '/cms',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html',
                        controller: "homeController"
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/admin/modules/cms/views/listCms.html',
                        controller: "CmsController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('cms_edit', {
                url: '/cms-edit/:id',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/admin/modules/cms/views/editCms.html',
                        controller: "CmsController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('subscription', {
                url: '/subscription',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html',
                        controller: "homeController"
                    },
                    'content': {
                        templateUrl: '/admin/modules/subscription/views/listsubscription.html',
                        controller: "subscriptionController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('addsubscription', {
                url: '/addsubscription',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html',
                        controller: "homeController"
                    },
                    'content': {
                        templateUrl: '/admin/modules/subscription/views/addsubscription.html',
                        controller: "subscriptionController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('subscription-edit', {
                url: '/subscription-edit/:id',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/admin/modules/subscription/views/subscription_edit.html',
                        controller: "subscriptionController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('incident', {
                url: '/incident',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html',
                        controller: "homeController"
                    },
                    'content': {
                        templateUrl: '/admin/modules/incident/views/list_incident.html',
                        controller: "incidentController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('incident_edit', {
                url: '/incident_edit/:id',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBar.html'
                    },
                    'content': {
                        templateUrl: '/admin/modules/incident/views/edit_incident.html',
                        controller: "incidentController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })
            .state('dailies', {
                url: '/dailies',
                views: {
                    'header': {
                        templateUrl: '/admin/modules/home/views/header.html'
                    },
                    'leftBar': {
                        templateUrl: '/admin/modules/home/views/leftBarDailies.html',
                        controller: "homeController"
                    },
                    'content': {
                        templateUrl: '/admin/modules/my_dailies/views/list_dailies.html',
                        controller: "dailiesController"
                    }
                },
                data: {
                    isAuthenticate: true
                },
                resolve: {
                    loggedin: checkLoggedout()
                }
            })


        //to remove the # from the URL
        //$locationProvider.html5Mode({enabled : true, requireBase : false});
    }])

    .run(['$rootScope', '$location', '$http', '$localStorage', '$state', 'ngTableParamsService',
        function ($rootScope, $location, $http, $localStorage, $state, ngTableParamsService) {
            $rootScope.baseUrl = baseUrl;
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {

                /*  $http.get('/api/getUsersPermission').then(function (response) {

                   }); */

                if (fromState.name != 'worker') {
                    ngTableParamsService.set('', '', '', '', '');
                }
                if (toState.data) {
                    if (!$localStorage.token && toState.data.isAuthenticate) {
                        event.preventDefault();
                        $state.go('login');
                    }
                }
            });

            $rootScope.buttonToggle = function () {
                //If window is small enough, enable sidebar push menu
                if ($(window).width() <= 992) {
                    $('.row-offcanvas').toggleClass('active');
                    $('.left-side').removeClass("collapse-left");
                    $(".right-side").removeClass("strech");
                    $('.row-offcanvas').toggleClass("relative");
                } else {
                    //Else, enable content streching
                    $('.left-side').toggleClass("collapse-left");
                    $(".right-side").toggleClass("strech");
                }
            }

        }
    ]).filter('capitalize', function () {   
        return function (input) {
            return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        }
    }).filter('textLengthCheck', function () {
        return function (input) {
            if (!input) {
                return '-';
            } else {
                if (input.length > 20) {
                    return input.substr(0, 20) + '...'
                } else if (input.length == 0) {
                    return '-';
                } else {
                    return input
                }
            }
        }
    })

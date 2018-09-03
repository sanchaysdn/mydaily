"use strict";
angular.module("Authentication", []), angular.module("Home", []), angular.module("communicationModule", []), angular.module("Users", []), angular.module("Roles", []), angular.module("Schools", []), angular.module("Cms", []);
var neoApp = angular.module("neoApp", ["ui.router", "ngRoute", "ngStorage", "ngTable", "ngResource", "Authentication", "Home", "communicationModule", "Users", "Schools", "ui.bootstrap", "ui.tinymce", "Cms"]).factory("CommonService", ["$http", "$resource", "$rootScope", function($http, $resource, $rootScope) {
    var user = {},
        getUser = function() { return user },
        setUser = function(userData) { user = "", user = userData };
    return { getUser: getUser, setUser: setUser }
}]).config(["$routeProvider", "$httpProvider", "$locationProvider", "$stateProvider", "$urlRouterProvider", function($routeProvider, $httpProvider, $locationProvider, $stateProvider, $urlRouterProvider) {
    $httpProvider.interceptors.push(function($q, $location, $localStorage) { return { request: function(config) { return config.headers = config.headers || {}, config.headers.authorization = "admin_bearer " + $localStorage.token, config.headers["client-type"] = "browser", config }, response: function(response) { return 401 == response.data.code && (delete $localStorage.token, $location.path("/login")), response || $q.when(response) } } });
    var checkLoggedin = function($q, $timeout, $http, $location, $rootScope, $state, CommonService) { var deferred = $q.defer(); return $http.get("/api/loggedin").success(function(response) { var user = response.user; "OK" == response.status ? (CommonService.setUser(user), $state.go("dashboard")) : $timeout(function() { deferred.resolve() }, 0) }).error(function(error) { $timeout(function() { deferred.resolve() }, 0) }), deferred.promise },
        checkLoggedout = function() {
            return ["$q", "$timeout", "$http", "$location", "$rootScope", "$state", "CommonService", function($q, $timeout, $http, $location, $rootScope, $state, CommonService) {
                var deferred = $q.defer();
                return $http.get("/api/loggedin").success(function(response) {
                    if ("OK" == response.status) {
                        var user = response.user;
                        CommonService.setUser(user), $timeout(deferred.resolve, 0)
                    } else $timeout(function() { deferred.resolve() }, 0), $state.go("login")
                }).error(function(error) { $timeout(function() { deferred.resolve() }, 0), $state.go("login") }), deferred.promise
            }]
        };
    $urlRouterProvider.otherwise("/dashboard"), $stateProvider.state("login", { url: "/login", views: { content: { templateUrl: "/admin/modules/authentication/views/login.html", controller: "loginController" } }, data: { isAuthenticate: !1 }, resolve: { loggedin: checkLoggedin } }).state("verifying_link", { url: "/verifying-link", views: { content: { templateUrl: "/admin/modules/home/views/verifying_link.html", controller: "homeController" } }, data: {}, resolve: {} }).state("forgot_password", { url: "/forgot-password", views: { content: { templateUrl: "/admin/modules/authentication/views/forgot-password.html", controller: "loginController" } }, data: {}, resolve: { loggedin: checkLoggedin } }).state("terms&condition", { url: "/terms-and-condition", views: { content: { templateUrl: "/admin/modules/home/views/terms-and-condition.html", controller: "homeController" } }, data: {}, resolve: {} }).state("privacy", { url: "/privacy", views: { content: { templateUrl: "/admin/modules/home/views/privacy.html", controller: "homeController" } }, data: {}, resolve: {} }).state("helpCenter", { url: "/help-center", views: { content: { templateUrl: "/admin/modules/home/views/help-center.html", controller: "homeController" } }, data: {}, resolve: {} }).state("dashboard", { url: "/dashboard", views: { header: { templateUrl: "/admin/modules/home/views/header.html" }, leftBar: { templateUrl: "/admin/modules/home/views/leftBar.html" }, content: { templateUrl: "/admin/modules/home/views/home.html", controller: "homeController" } }, data: { isAuthenticate: !0 }, resolve: { loggedin: checkLoggedout() } }).state("users", { url: "/users", views: { header: { templateUrl: "/admin/modules/home/views/header.html" }, leftBar: { templateUrl: "/admin/modules/home/views/leftBar.html" }, content: { templateUrl: "/admin/modules/users/views/listuser.html", controller: "userController" } }, data: { isAuthenticate: !0 }, resolve: { loggedin: checkLoggedout() } }).state("users_add", { url: "/users/add", views: { header: { templateUrl: "/admin/modules/home/views/header.html" }, leftBar: { templateUrl: "/admin/modules/home/views/leftBar.html" }, content: { templateUrl: "/admin/modules/users/views/adduser.html", controller: "userController" } }, data: { isAuthenticate: !0 }, resolve: { loggedin: checkLoggedout() } }).state("users_edit", { url: "/user-edit/:id", views: { header: { templateUrl: "/admin/modules/home/views/header.html" }, leftBar: { templateUrl: "/admin/modules/home/views/leftBar.html" }, content: { templateUrl: "/admin/modules/users/views/adduser.html", controller: "userController" } }, data: { isAuthenticate: !0 }, resolve: { loggedin: checkLoggedout() } }).state("institute", { url: "/institute", views: { header: { templateUrl: "/admin/modules/home/views/header.html" }, leftBar: { templateUrl: "/admin/modules/home/views/leftBar.html" }, content: { templateUrl: "/admin/modules/schools/views/listschool.html", controller: "schoolController" } }, data: { isAuthenticate: !0 }, resolve: { loggedin: checkLoggedout() } }).state("institute_add", { url: "/institute/add", views: { header: { templateUrl: "/admin/modules/home/views/header.html" }, leftBar: { templateUrl: "/admin/modules/home/views/leftBar.html" }, content: { templateUrl: "/admin/modules/schools/views/addschool.html", controller: "schoolController" } }, data: { isAuthenticate: !0 }, resolve: { loggedin: checkLoggedout() } }).state("institute_edit", { url: "/institute-edit/:id", views: { header: { templateUrl: "/admin/modules/home/views/header.html" }, leftBar: { templateUrl: "/admin/modules/home/views/leftBar.html" }, content: { templateUrl: "/admin/modules/schools/views/addschool.html", controller: "schoolController" } }, data: { isAuthenticate: !0 }, resolve: { loggedin: checkLoggedout() } }).state("profile", { url: "/profile", views: { header: { templateUrl: "/admin/modules/home/views/header.html" }, leftBar: { templateUrl: "/admin/modules/home/views/leftBar.html" }, content: { templateUrl: "/admin/modules/users/views/profile.html", controller: "userController" } }, data: { isAuthenticate: !0 }, resolve: { loggedin: checkLoggedout() } }).state("products", { url: "/products", views: { header: { templateUrl: "/admin/modules/home/views/header.html" }, leftBar: { templateUrl: "/admin/modules/home/views/leftBar.html" }, content: { templateUrl: "/admin/modules/products/views/listProduct.html", controller: "productController" } }, data: { isAuthenticate: !0 }, resolve: { loggedin: checkLoggedout() } }).state("orders", { url: "/orders", views: { header: { templateUrl: "/admin/modules/home/views/header.html" }, leftBar: { templateUrl: "/admin/modules/home/views/leftBar.html" }, content: { templateUrl: "/admin/modules/orders/views/listOrder.html", controller: "orderController" } }, data: { isAuthenticate: !0 }, resolve: { loggedin: checkLoggedout() } }).state("cms", { url: "/cms", views: { header: { templateUrl: "/admin/modules/home/views/header.html" }, leftBar: { templateUrl: "/admin/modules/home/views/leftBar.html" }, content: { templateUrl: "/admin/modules/cms/views/listCms.html", controller: "CmsController" } }, data: { isAuthenticate: !0 }, resolve: { loggedin: checkLoggedout() } }).state("cms_edit", { url: "/cms-edit/:id", views: { header: { templateUrl: "/admin/modules/home/views/header.html" }, leftBar: { templateUrl: "/admin/modules/home/views/leftBar.html" }, content: { templateUrl: "/admin/modules/cms/views/editCms.html", controller: "CmsController" } }, data: { isAuthenticate: !0 }, resolve: { loggedin: checkLoggedout() } })
}]).run(["$rootScope", "$location", "$http", "$localStorage", "$state", "ngTableParamsService", function($rootScope, $location, $http, $localStorage, $state, ngTableParamsService) { $rootScope.baseUrl = baseUrl, $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState) { "worker" != fromState.name && ngTableParamsService.set("", "", "", "", ""), toState.data && !$localStorage.token && toState.data.isAuthenticate && (event.preventDefault(), $state.go("login")) }), $rootScope.buttonToggle = function() { $(window).width() <= 992 ? ($(".row-offcanvas").toggleClass("active"), $(".left-side").removeClass("collapse-left"), $(".right-side").removeClass("strech"), $(".row-offcanvas").toggleClass("relative")) : ($(".left-side").toggleClass("collapse-left"), $(".right-side").toggleClass("strech")) } }]).filter("capitalize", function() { return function(input) { return input ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : "" } }).filter("textLengthCheck", function() { return function(input) { return input ? input.length > 20 ? input.substr(0, 20) + "..." : 0 == input.length ? "-" : input : "-" } });
angular.module("Authentication"), neoApp.controller("loginController", ["$scope", "$rootScope", "$location", "AuthenticationService", "$localStorage", "logger", function($scope, $rootScope, $location, AuthenticationService, $localStorage, logger) { $scope.user = {}, $scope.forgotPass = {}, $scope.isPasswordSent = !1, $scope.disabled = !1, $scope.loader = !1, $scope.login = function(form) { form.$valid && ($scope.disabled = !0, $scope.loader = !0, AuthenticationService.Login($scope.user, function(response) { $scope.disabled = !1, $scope.loader = !1, 200 == response.code ? ($localStorage.userLoggedIn = !0, $localStorage.token = response.data.token, $location.path("/dashboard")) : logger.logError(response.message) })) }, $scope.logout = function() { delete $localStorage.token, $rootScope.userLoggedIn = !1, $location.path("/login") }, $scope.resendPassword = function(form) { form.$valid && ($scope.disabled = !0, $scope.loader = !0, $scope.forgotPass.isAdmin = !0, AuthenticationService.resendPassword($scope.forgotPass, function(response) { $scope.disabled = !1, $scope.loader = !1, 200 == response.code ? ($scope.isPasswordSent = !0, logger.logSuccess(response.message)) : logger.logError(response.message) })) } }]), angular.module("Authentication").factory("AuthenticationService", ["communicationService", "$rootScope", function(communicationService, $rootScope) { var service = {}; return service.Login = function(inputJsonString, callback) { communicationService.resultViaPost(webservices.authenticate, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) { callback(response.data) }) }, service.resendPassword = function(inputJsonString, callback) { communicationService.resultViaPost(webservices.forgot_password, appConstants.authorizationKey, headerConstants.json, inputJsonString, function(response) { callback(response.data) }) }, service }]), neoApp.service("ngTableParamsService", function() {
    var params = { page: 1, count: 5, searchText: void 0, sorting: { _id: -1 } },
        setParams = function(Npage, Ncount, Nfilter, Nsorting, Type) {
            if (void 0 === Nfilter) var filter = "";
            else var filter = Nfilter;
            params.page = Npage ? Npage : 1, params.count = Ncount ? Ncount : 5, params.searchText = filter, params.sorting = Nsorting ? Nsorting : { _id: -1 }
        },
        getParams = function() { return params };
    return { set: setParams, get: getParams }
}), neoApp.factory("logger", [function() { var logIt, clear; return toastr.options = { closeButton: !0, preventDuplicates: !0, positionClass: "toast-top-right", onclick: null, timeOut: "3000", showMethod: "fadeIn", hideMethod: "fadeOut" }, logIt = function(message, type, timeOut) { return timeOut ? (toastr.options.timeOut = timeOut, toastr.options.extendedTimeOut = timeOut, toastr.options.tapToDismiss = !1) : toastr.options.tapToDismiss = !0, toastr[type](message) }, clear = function() { toastr.clear() }, { log: function(message) { logIt(message, "info") }, logWarning: function(message) { logIt(message, "warning") }, logSuccess: function(message) { logIt(message, "success") }, logError: function(message, timeOut) { logIt(message, "error", timeOut) }, clear: function() { clear() } } }]), angular.module("Home"), neoApp.controller("homeController", ["$scope", "$rootScope", "$localStorage", "$location", "HomeService", function($scope, $rootScope, $localStorage, $location, HomeService) { $scope.counts = {}, $scope.activationMessage = function() { $scope.parmas = $location.search(), $scope.success = $scope.parmas.success, console.log($scope.success) }, $scope.getCounts = function() { HomeService.getCounts().get(function(response) { 200 == response.code && ($scope.counts = response.data) }) }, $scope.getCmsPage = function(name) { HomeService.getCmsPageByName().save({ name: name }, function(response) { 200 == response.code && ($scope.cmsPage = response.data) }) } }]), angular.module("Home").factory("HomeService", ["$http", "communicationService", "$resource", function($http, communicationService, $resource) {
    var getCounts = function() { return $resource("/api/dashboardCount", null, { get: { method: "GET" } }) },
        getCmsPageByName = function() { return $resource("/api/getCmsPageByName", null, { save: { method: "POST" } }) };
    return { getCounts: getCounts, getCmsPageByName: getCmsPageByName }
}]), angular.module("Users"), neoApp.controller("userController", ["$scope", "$rootScope", "$localStorage", "UserService", "ngTableParams", "$routeParams", "$route", "$location", "logger", "ngTableParamsService", "$state", "$stateParams", "SchoolService", "$http", "CommonService", "$uibModal", function($scope, $rootScope, $localStorage, UserService, ngTableParams, $routeParams, $route, $location, logger, ngTableParamsService, $state, $stateParams, SchoolService, $http, CommonService, $uibModal) {
    $scope.user = {}, $scope.profile = {}, $scope.changePass = {}, $scope.imageBase64 = "";
    var formDataFileUpload = "";
    $scope.profile.email = CommonService.getUser().email, $scope.disabled = !1, $scope.loader = !1, $scope.disabledUpdate = !1, $scope.loaderChangePass = !1, $(document).ready(function() { $(".fancybox").fancybox() }), $scope.message = "", $scope.findOne = function() {
        document.getElementById("filePicker").addEventListener("change", function(evt) {
            var files = evt.target.files,
                file = files[0];
            if (files && file) {
                var splitFileName = file.name.split("."),
                    ext = splitFileName[splitFileName.length - 1].toLowerCase();
                if ("jpg" == ext || "jpeg" == ext || "png" == ext)
                    if (file.size > 6291456) logger.log("File size cannot exceed limit of 6 mb"), document.getElementById("filePicker").value = "";
                    else {
                        formDataFileUpload = file;
                        var reader = new FileReader;
                        reader.onload = function(readerEvt) { $scope.imageBase64 = btoa(readerEvt.target.result), $scope.$apply(), document.getElementById("imgTag").src = "data:image/" + ext + ";base64," + $scope.imageBase64 }, reader.readAsBinaryString(file)
                    }
                else document.getElementById("filePicker").value = "", bootbox.alert("Invalid image format")
            }
        }, !1), $stateParams.id && UserService.getUserById().get({ id: $stateParams.id }, function(response) { 200 == response.code && ($scope.user = response.data, $scope.imageBase64 = "/" + $scope.user.profile_image, delete $scope.user.profile_image) })
    }, $scope.getInstituteList = function() { SchoolService.getInstituteList().get(function(response) { 200 == response.code && ($scope.instituteList = response.data) }) }, $scope.changePassword = function(form) { form.$valid && ($scope.disabledUpdate = !0, $scope.loaderChangePass = !0, $scope.changePass.userId = CommonService.getUser()._id, $scope.changePass.isAdmin = !0, UserService.changePassword().save($scope.changePass, function(response) { $scope.disabledUpdate = !1, $scope.loaderChangePass = !1, 200 == response.code ? ($state.reload(), logger.logSuccess(response.message)) : logger.logError(response.message) })) }, $scope.profileUpdate = function(form) { form.$valid && ($scope.disabled = !0, $scope.loader = !0, $scope.profile.userId = CommonService.getUser()._id, UserService.adminProfileUpdate().save($scope.profile, function(response) { $scope.disabled = !1, $scope.loader = !1, 200 == response.code ? ($state.reload(), logger.logSuccess(response.message)) : logger.logError(response.message) })) }, $scope.addUpdateData = function(form) {
        form.$valid && ($scope.disabled = !0, $scope.loader = !0, UserService.addUpdateUser().save($scope.user, function(response) {
            if ($scope.disabled = !1, $scope.loader = !1, 200 == response.code) {
                if (formDataFileUpload) {
                    var formData = new FormData;
                    formData.append("id", response.data._id), formData.append("file", formDataFileUpload), UserService.updateUserPic().save(formData, function(resp) { 200 != response.code && logger.logError(response.message) })
                }
                $location.path("/users"), logger.logSuccess(response.message)
            } else logger.logError(response.message)
        }))
    }, $scope.enableDisableUser = function(id, status) { UserService.enableDisableUser().save({ userId: id, status: status }, function(response) { 200 == response.code ? ($scope.getAllUsers(), logger.logSuccess(response.message)) : logger.logError(response.message) }) }, $scope.getAllUsers = function() {
        $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
            counts: [],
            getData: function($defer, params) {
                ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting()), $scope.paramUrl = params.url(), $scope.tableLoader = !0, $scope.usersList = [], UserService.getUsersList().get($scope.paramUrl, function(response) {
                    $scope.tableLoader = !1, $scope.usersList = response.data;
                    var data = response.data;
                    $scope.totalLength = response.totalLength, params.total(response.totalLength), $defer.resolve(data)
                })
            }
        })
    };
    var getData = ngTableParamsService.get();
    $scope.searchTextField = getData.searchText, $scope.searching = function() {
        ngTableParamsService.set("", "", $scope.searchTextField, ""), $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
            counts: [],
            getData: function($defer, params) {
                ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting()), $scope.paramUrl = params.url(), $scope.tableLoader = !0, $scope.usersList = [], UserService.getUsersList().get($scope.paramUrl, function(response) {
                    $scope.tableLoader = !1, $scope.usersList = response.data;
                    var data = response.data;
                    $scope.totalLength = response.totalLength, params.total(response.totalLength), $defer.resolve(data)
                })
            }
        })
    }, $scope.deleteUser = function(id) { bootbox.confirm("Are you sure you want to delete this user", function(r) { r && UserService.deleteUser()["delete"]({ id: id }, function(response) { 200 == response.code ? ($scope.getAllUsers(), logger.logSuccess(response.message)) : logger.logError(response.message) }) }) }, $scope.viewUserOrders = function(userDetails) { $uibModal.open({ animation: $scope.animationsEnabled, templateUrl: "/admin/modules/orders/views/viewUserOrders.html", controller: "userOrderPopupCtrl", windowClass: "zindex", size: "lg", resolve: { userDetails: userDetails } }) }, $scope.viewUserBids = function(userDetails) { $uibModal.open({ animation: $scope.animationsEnabled, templateUrl: "/admin/modules/users/views/viewUserBids.html", controller: "userBidPopupCtrl", windowClass: "zindex", size: "lg", resolve: { userDetails: userDetails } }) }
}]), neoApp.controller("userBidPopupCtrl", function($scope, $uibModalInstance, $location, logger, userDetails, ngTableParamsService, ngTableParams, UserService, $uibModal, ProductService) {
    $scope.userDetails = userDetails, $scope.categoryList = [];
    var catId = "";
    $scope.catTitle = "", ngTableParamsService.set("", "", "", ""), $scope.cancel = function() { $uibModalInstance.dismiss("cancel") }, $scope.ok = function() { $uibModalInstance.dismiss("cancel") }, $(document).ready(function() { $(".fancybox").fancybox() }), $scope.getCagegoryList = function() { ProductService.getCagegoryList().get(function(response) { 200 == response.code ? ($scope.categoryList = response.data, $scope.moveTabContents($scope.categoryList[0]._id, $scope.categoryList[0].title)) : logger.logError(response.message) }) }, $scope.getCagegoryList(), $scope.moveTabContents = function(id, title) { $scope.activeTab = id, catId = id, $scope.searchTextField = "", ngTableParamsService.set("", "", "", ""), $scope.getUserBidList(), $scope.catTitle = title }, $scope.viewProduct = function(product) { $uibModal.open({ animation: $scope.animationsEnabled, templateUrl: "/admin/modules/products/views/viewProduct.html", controller: "viewProductCtrl", windowClass: "zindex", resolve: { product: product } }) }, $scope.disabled = !1, $scope.loader = !1, $scope.getUserBidList = function() {
        $scope.userBidsTableParams = new ngTableParams(ngTableParamsService.get(), {
            counts: [],
            getData: function($defer, params) {
                ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting()), $scope.paramUrl = params.url(), $scope.tableLoader = !0, $scope.userBidsList = [], $scope.paramUrl.userId = $scope.userDetails._id, $scope.paramUrl.category = catId, UserService.getUserBidList().save($scope.paramUrl, function(response) {
                    $scope.tableLoader = !1, $scope.userBidsList = response.data;
                    var data = response.data;
                    $scope.totalLength = response.totalLength, params.total(response.totalLength), $defer.resolve(data)
                })
            }
        })
    }
}), angular.module("Users").factory("UserService", ["$http", "communicationService", "$resource", function($http, communicationService, $resource) {
    var getUsersList = function() { return $resource("/api/getUserList", null, { get: { method: "GET" } }) },
        getUserById = function() { return $resource("/api/getUserByIdAdmin/:id", null, { get: { method: "GET", id: "@id" } }) },
        addUpdateUser = function() { return $resource("/api/addUpdateUser", null, { save: { method: "POST" } }) },
        enableDisableUser = function() { return $resource("/api/enableDisableUser", null, { save: { method: "POST" } }) },
        getUserBidList = function() { return $resource("/api/getUserBidListAdmin", null, { save: { method: "POST" } }) },
        changePassword = function() { return $resource("/api/changePassword", null, { save: { method: "POST" } }) },
        adminProfileUpdate = function() { return $resource("/api/adminProfileUpdate", null, { save: { method: "POST" } }) },
        updateUserPic = function() { return $resource("/api/updateUserPic", null, { save: { method: "POST", headers: { "Content-Type": void 0 } } }) },
        deleteUser = function() { return $resource("/api/deleteUserById/:id", null, { "delete": { method: "DELETE", id: "@id" } }) };
    return { getUsersList: getUsersList, addUpdateUser: addUpdateUser, updateUserPic: updateUserPic, getUserById: getUserById, deleteUser: deleteUser, enableDisableUser: enableDisableUser, changePassword: changePassword, adminProfileUpdate: adminProfileUpdate, getUserBidList: getUserBidList }
}]), angular.module("Schools"), neoApp.controller("schoolController", ["$scope", "$rootScope", "$localStorage", "SchoolService", "ngTableParams", "$routeParams", "$route", "$location", "ngTableParamsService", "logger", "$stateParams", "$state", function($scope, $rootScope, $localStorage, SchoolService, ngTableParams, $routeParams, $route, $location, ngTableParamsService, logger, $stateParams, $state) {
    $localStorage.userLoggedIn ? ($rootScope.userLoggedIn = !0, $rootScope.loggedInUser = $localStorage.loggedInUsername) : $rootScope.userLoggedIn = !1, "" != $rootScope.message && ($scope.message = $rootScope.message), $scope.institute = {}, $scope.message = "", $scope.findOne = function() { $stateParams.id && SchoolService.getInstituteById().get({ id: $stateParams.id }, function(response) { 200 == response.code && ($scope.institute = response.data) }) }, $scope.disabled = !1, $scope.loader = !1, $scope.addUpdateData = function(form) { form.$valid && ($scope.disabled = !0, $scope.loader = !0, $scope.institute._id ? SchoolService.updateInstitute().save($scope.institute, function(response) { $scope.disabled = !1, $scope.loader = !1, 200 == response.code ? ($location.path("/institute"), logger.logSuccess(response.message)) : logger.logError(response.message) }) : SchoolService.saveInstitute().save($scope.institute, function(response) { $scope.disabled = !1, $scope.loader = !1, 200 == response.code ? ($location.path("/institute"), logger.logSuccess(response.message)) : logger.logError(response.message) })) }, $scope.getAllInstitute = function() {
        $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
            counts: [],
            getData: function($defer, params) {
                ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting()), $scope.paramUrl = params.url(), $scope.tableLoader = !0, SchoolService.getInstituteList().get($scope.paramUrl, function(response) {
                    $scope.tableLoader = !1, $scope.instituteList = response.data, $scope.instituteDataLength = response.totalLength;
                    var data = response.data;
                    $scope.totalLength = response.totalLength, params.total(response.totalLength), $defer.resolve(data)
                })
            }
        })
    };
    var getData = ngTableParamsService.get();
    $scope.searchTextField = getData.searchText, $scope.searching = function() {
        ngTableParamsService.set("", "", $scope.searchTextField, ""), $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
            counts: [],
            getData: function($defer, params) {
                ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting()), $scope.paramUrl = params.url(), $scope.tableLoader = !0, SchoolService.getInstituteList().get($scope.paramUrl, function(response) {
                    $scope.tableLoader = !1, $scope.instituteList = response.data, $scope.instituteDataLength = response.totalLength;
                    var data = response.data;
                    $scope.totalLength = response.totalLength, params.total(response.totalLength), $defer.resolve(data)
                })
            }
        })
    }, $scope.deleteInstitute = function(id) { bootbox.confirm("Are you sure you want to delete this institute, it will delete all users of this institute", function(r) { r && SchoolService.deleteInstitute().save({ instituteId: id }, function(response) { 200 == response.code ? ($state.reload(), logger.logSuccess(response.message)) : logger.logError(response.message) }) }) }
}]), angular.module("Schools").factory("SchoolService", ["$http", "communicationService", "$resource", function($http, communicationService, $resource) {
    var getInstituteList = function() { return $resource("/api/getInstituteList", null, { get: { method: "GET" } }) },
        getInstituteById = function() { return $resource("/api/getInstituteById/:id", null, { get: { method: "GET", id: "@id" } }) },
        saveInstitute = function() { return $resource("/api/addInstitute", null, { save: { method: "POST" } }) },
        updateInstitute = function() { return $resource("/api/updateInstitute", null, { save: { method: "POST" } }) },
        deleteInstitute = function() { return $resource("/api/deleteInstitute", null, { save: { method: "POST" } }) };
    return { getInstituteList: getInstituteList, saveInstitute: saveInstitute, updateInstitute: updateInstitute, getInstituteById: getInstituteById, deleteInstitute: deleteInstitute }
}]), angular.module("communicationModule").factory("communicationService", ["$http", function($http) { var service = {}; return service.resultViaGet = function(serviceUrl, authenticationKey, headerString, callback) { void 0 != authenticationKey && ($http.defaults.headers.common.Authorization = "Basic " + authenticationKey), void 0 != headerString && (headerString = '{"ContentType":' + headerString + '"}'), $http.get(serviceUrl, headerString).then(function(response) { callback(response) }, function(response) { callback(response) }) }, service.resultViaPost = function(serviceUrl, authenticationKey, headerString, postData, callback) { void 0 != headerString && (headerString = '{"ContentType":' + headerString + '"}'), $http.post(serviceUrl, postData, headerString).then(function(response) { callback(response) }, function(response) { callback(response) }) }, service }]), neoApp.directive("validPasswordC", function() { return { require: "ngModel", scope: { reference: "=validPasswordC" }, link: function(scope, elm, attrs, ctrl) { ctrl.$parsers.unshift(function(viewValue, $scope) { var noMatch = viewValue != scope.reference; return ctrl.$setValidity("noMatch", !noMatch), noMatch ? noMatch : !noMatch }), scope.$watch("reference", function(value) { ctrl.$setValidity("noMatch", value === ctrl.$viewValue) }) } } }), neoApp.directive("raty", function() { return { restrict: "AE", link: function(scope, elem, attrs) { $(elem).raty({ score: attrs.score, number: attrs.number, readOnly: attrs.readonly }) } } }), neoApp.filter("trust", ["$sce", function($sce) { return function(htmlCode) { return $sce.trustAsHtml(htmlCode) } }]), neoApp.controller("productController", ["$scope", "$rootScope", "$localStorage", "ngTableParams", "$routeParams", "$route", "$location", "logger", "ngTableParamsService", "$state", "$stateParams", "ProductService", "CommonService", "$uibModal", function($scope, $rootScope, $localStorage, ngTableParams, $routeParams, $route, $location, logger, ngTableParamsService, $state, $stateParams, ProductService, CommonService, $uibModal) {
    $scope.product = {}, $scope.disabled = !1, $scope.loader = !1, $scope.categoryList = [];
    var catId = "";
    $scope.catTitle = "", $(document).ready(function() { $(".fancybox").fancybox() }), $scope.getCagegoryList = function() { ProductService.getCagegoryList().get(function(response) { 200 == response.code ? ($scope.categoryList = response.data, $scope.moveTabContents($scope.categoryList[0]._id, $scope.categoryList[0].title)) : logger.logError(response.message) }) }, $scope.productStatusChange = function(id, status) { ProductService.productStatusChange().save({ product_id: id, status: status }, function(response) { 200 == response.code ? ($scope.getAllProducts(), logger.logSuccess(response.message)) : logger.logError(response.message) }) }, $scope.moveTabContents = function(id, title) { $scope.activeTab = id, catId = id, $scope.searchTextField = "", ngTableParamsService.set("", "", "", ""), $scope.getAllProducts(), $scope.catTitle = title }, $scope.getAllProducts = function(id) {
        $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
            counts: [],
            getData: function($defer, params) {
                ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting()), $scope.paramUrl = params.url(), $scope.paramUrl.category = catId, $scope.tableLoader = !0, $scope.productList = [], ProductService.getProductList().save($scope.paramUrl, function(response) {
                    $scope.tableLoader = !1, $scope.productList = response.data;
                    var data = response.data;
                    $scope.totalLength = response.totalLength, params.total(response.totalLength), $defer.resolve(data)
                })
            }
        })
    }, $scope.viewProduct = function(product) { $uibModal.open({ animation: $scope.animationsEnabled, templateUrl: "/admin/modules/products/views/viewProduct.html", controller: "viewProductCtrl", windowClass: "zindex", resolve: { product: product } }) };
    var getData = ngTableParamsService.get();
    $scope.searchTextField = getData.searchText, $scope.searching = function() {
        ngTableParamsService.set("", "", $scope.searchTextField, ""), $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
            counts: [],
            getData: function($defer, params) {
                ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting()), $scope.paramUrl = params.url(), $scope.paramUrl.category = catId, $scope.tableLoader = !0, $scope.productList = [], ProductService.getProductList().save($scope.paramUrl, function(response) {
                    $scope.tableLoader = !1, $scope.productList = response.data;
                    var data = response.data;
                    $scope.totalLength = response.totalLength, params.total(response.totalLength), $defer.resolve(data)
                })
            }
        })
    }, $scope.deleteProduct = function(id) { bootbox.confirm("Are you sure you want to delete this product", function(r) { r && ProductService.deleteProduct().save({ product_id: id }, function(response) { 200 == response.code ? ($scope.getAllProducts(), logger.logSuccess(response.message)) : logger.logError(response.message) }) }) }
}]), neoApp.controller("viewProductCtrl", function($scope, $uibModalInstance, $location, logger, product) { $scope.product = product, $scope.cancel = function() { $uibModalInstance.dismiss("cancel") }, $scope.ok = function() { $uibModalInstance.dismiss("cancel") }, $(document).ready(function() { $(".fancybox").fancybox() }) }), neoApp.factory("ProductService", ["$http", "communicationService", "$resource", function($http, communicationService, $resource) {
    var getProductList = function() { return $resource("/api/getProductListAdmin", null, { save: { method: "POST" } }) },
        productStatusChange = function() { return $resource("/api/productStatusChange", null, { get: { method: "POST" } }) },
        getProductById = function() { return $resource("/api/getUserById/:id", null, { get: { method: "GET", id: "@id" } }) },
        getCagegoryList = function() { return $resource("/api/getProductCategoryList", null, { get: { method: "GET", id: "@id" } }) },
        deleteProduct = function() { return $resource("/api/deleteProduct", null, { save: { method: "POST" } }) };
    return { getProductList: getProductList, getProductById: getProductById, getCagegoryList: getCagegoryList, productStatusChange: productStatusChange, deleteProduct: deleteProduct }
}]), neoApp.controller("orderController", ["$scope", "$rootScope", "$localStorage", "ngTableParams", "$routeParams", "$route", "$location", "logger", "ngTableParamsService", "$state", "$stateParams", "OrderService", "CommonService", "$uibModal", function($scope, $rootScope, $localStorage, ngTableParams, $routeParams, $route, $location, logger, ngTableParamsService, $state, $stateParams, OrderService, CommonService, $uibModal) {
    $scope.disabled = !1, $scope.loader = !1, $scope.getOrderList = function() {
        $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
            counts: [],
            getData: function($defer, params) {
                ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting()), $scope.paramUrl = params.url(), $scope.tableLoader = !0, $scope.orderList = [], OrderService.getOrderList().get($scope.paramUrl, function(response) {
                    $scope.tableLoader = !1, $scope.orderList = response.data;
                    var data = response.data;
                    $scope.totalLength = response.totalLength, params.total(response.totalLength), $defer.resolve(data)
                })
            }
        })
    }, $scope.viewProduct = function(product) { $uibModal.open({ animation: $scope.animationsEnabled, templateUrl: "/admin/modules/products/views/viewProduct.html", controller: "viewProductCtrl", windowClass: "zindex", resolve: { product: product } }) };
    var getData = ngTableParamsService.get();
    $scope.searchTextField = getData.searchText, $scope.searching = function() {
        ngTableParamsService.set("", "", $scope.searchTextField, ""), $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
            counts: [],
            getData: function($defer, params) {
                ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting()),
                    $scope.paramUrl = params.url(), $scope.tableLoader = !0, $scope.orderList = [], OrderService.getOrderList().get($scope.paramUrl, function(response) {
                        $scope.tableLoader = !1, $scope.orderList = response.data;
                        var data = response.data;
                        $scope.totalLength = response.totalLength, params.total(response.totalLength), $defer.resolve(data)
                    })
            }
        })
    }, $scope.viewUserOrders = function(userDetails) { $uibModal.open({ animation: $scope.animationsEnabled, templateUrl: "/admin/modules/orders/views/viewUserOrders.html", controller: "userOrderPopupCtrl", windowClass: "zindex", size: "lg", resolve: { userDetails: userDetails } }) }
}]), neoApp.controller("userOrderPopupCtrl", function($scope, $uibModalInstance, $location, logger, userDetails, ngTableParamsService, ngTableParams, OrderService) {
    $scope.userDetails = userDetails, ngTableParamsService.set("", "", "", ""), $scope.cancel = function() { $uibModalInstance.dismiss("cancel") }, $scope.ok = function() { $uibModalInstance.dismiss("cancel") }, $(document).ready(function() { $(".fancybox").fancybox() }), $scope.disabled = !1, $scope.loader = !1, $scope.getUserOrderList = function() {
        $scope.userOrdersTableParams = new ngTableParams(ngTableParamsService.get(), {
            counts: [],
            getData: function($defer, params) {
                ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting()), $scope.paramUrl = params.url(), $scope.tableLoader = !0, $scope.userOrderList = [], $scope.paramUrl.userId = $scope.userDetails._id, OrderService.getOrderList().get($scope.paramUrl, function(response) {
                    $scope.tableLoader = !1, $scope.userOrderList = response.data;
                    var data = response.data;
                    $scope.totalLength = response.totalLength, params.total(response.totalLength), $defer.resolve(data)
                })
            }
        })
    }
}), neoApp.factory("OrderService", ["$http", "communicationService", "$resource", function($http, communicationService, $resource) { var getOrderList = function() { return $resource("/api/getOrderList", null, { get: { method: "POST" } }) }; return { getOrderList: getOrderList } }]);
var baseUrl = location.protocol + "//" + location.hostname + (location.port ? ":" + location.port : ""),
    webservices = { authenticate: baseUrl + "/api/adminLogin", forgot_password: baseUrl + "/api/forgotPassword", addUser: baseUrl + "/users/add", userList: baseUrl + "/users/list", findOneUser: baseUrl + "/users/userOne", bulkUpdateUser: baseUrl + "/users/bulkUpdate", update: baseUrl + "/users/update", addSchool: baseUrl + "/schools/add", schoolList: baseUrl + "/api/getInstituteList", findOneSchool: baseUrl + "/schools/schoolOne", bulkUpdateSchool: baseUrl + "/schools/bulkUpdate", update: baseUrl + "/schools/update" },
    appConstants = { authorizationKey: "dGF4aTphcHBsaWNhdGlvbg==" },
    headerConstants = { json: "application/json" };
angular.module("Cms"), neoApp.controller("CmsController", ["$scope", "$rootScope", "$localStorage", "CmsService", "ngTableParams", "$routeParams", "$route", "$location", "logger", "ngTableParamsService", "$state", "$stateParams", "SchoolService", "$http", "CommonService", "$uibModal", function($scope, $rootScope, $localStorage, CmsService, ngTableParams, $routeParams, $route, $location, logger, ngTableParamsService, $state, $stateParams, SchoolService, $http, CommonService, $uibModal) {
    $scope.cms = {}, $scope.disabled = !1, $scope.loader = !1, $scope.cmsList = [], $scope.baseUrl = baseUrl, $scope.tinymceOptions = { plugins: "link image code", toolbar: "undo redo | bold italic | alignleft aligncenter alignright | code" }, $scope.findOne = function() { $stateParams.id && CmsService.getCmsById().save({ id: $stateParams.id }, function(response) { 200 == response.code && ($scope.cms = response.data) }) }, $scope.updateCms = function(form) { form.$valid && ($scope.disabled = !0, $scope.loader = !0, CmsService.updateCms().save($scope.cms, function(response) { $scope.disabled = !1, $scope.loader = !1, 200 == response.code ? ($state.go("cms"), logger.logSuccess(response.message)) : logger.logError(response.message) })) }, $scope.getAllCms = function() {
        $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
            counts: [],
            getData: function($defer, params) {
                ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting()), $scope.paramUrl = params.url(), $scope.tableLoader = !0, $scope.cmsList = [], CmsService.getCmsList().save($scope.paramUrl, function(response) {
                    for (var i in response.data) {
                        var decData = response.data[i].description.replace(/<\/?[^>]+(>|$)/g, "");
                        decData = decData.replace(/&amp;/g, ""), decData.length > 60 && (decData = decData.substr(0, 60) + "..."), response.data[i].description = decData
                    }
                    $scope.tableLoader = !1, $scope.cmsList = response.data;
                    var data = response.data;
                    $scope.totalLength = response.totalLength, params.total(response.totalLength), $defer.resolve(data)
                })
            }
        })
    };
    var getData = ngTableParamsService.get();
    $scope.searchTextField = getData.searchText, $scope.searching = function() {
        ngTableParamsService.set("", "", $scope.searchTextField, ""), $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
            counts: [],
            getData: function($defer, params) {
                ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting()), $scope.paramUrl = params.url(), $scope.tableLoader = !0, $scope.cmsList = [], CmsService.getCmsList().save($scope.paramUrl, function(response) {
                    $scope.tableLoader = !1, $scope.cmsList = response.data;
                    var data = response.data;
                    $scope.totalLength = response.totalLength, params.total(response.totalLength), $defer.resolve(data)
                })
            }
        })
    }
}]), angular.module("Cms").factory("CmsService", ["$http", "communicationService", "$resource", function($http, communicationService, $resource) {
    var getCmsList = function() { return $resource("/api/getAllCmsList", null, { save: { method: "POST" } }) },
        getCmsById = function() { return $resource("/api/getCmsByID", null, { save: { method: "POST", id: "@id" } }) },
        updateCms = function() { return $resource("/api/updateCms", null, { save: { method: "POST" } }) };
    return { getCmsList: getCmsList, updateCms: updateCms, getCmsById: getCmsById }
}]);
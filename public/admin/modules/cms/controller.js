	"use strict";

	angular.module("Cms")

	neoApp.controller("CmsController", ['$scope', '$rootScope', '$localStorage', 'CmsService', 'ngTableParams', '$routeParams', '$route', '$location', 'logger', 'ngTableParamsService', '$state', '$stateParams', '$http', 'CommonService', '$uibModal',
	    function($scope, $rootScope, $localStorage, CmsService, ngTableParams, $routeParams, $route, $location, logger, ngTableParamsService, $state, $stateParams, $http, CommonService, $uibModal) {
	        $scope.cms = {};
	        $scope.disabled = false;
	        $scope.loader = false;
	        $scope.cmsList = [];
	        $scope.baseUrl = baseUrl;
              $scope.tinymceOptions = {
	            plugins: 'link image code',
	            toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code'
	        };
	        $scope.findOne = function() {
	            if ($stateParams.id) {
	                CmsService.getCmsById().save({ id: $stateParams.id }, function(response) {
	                    if (response.code == 200) {
	                        $scope.cms = response.data;
	                    }
	                });
	            }
	        }

	        $scope.updateCms = function(form) {
	            if (form.$valid) {
	                $scope.disabled = true;
	                $scope.loader = true;

	                CmsService.updateCms().save($scope.cms, function(response) {
	                    $scope.disabled = false;
	                    $scope.loader = false;
	                    if (response.code == 200) {
	                        $state.go('cms');
	                        logger.logSuccess(response.message);
	                    } else {
	                        logger.logError(response.message);
	                    }
	                });
	            }
	        }

	        $scope.getAllCms = function() {
				console.log('Hello');
	            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
	                counts: [],
	                getData: function($defer, params) {
	                    // send an ajax request to your server. in my case MyResource is a $resource.
	                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
	                    $scope.paramUrl = params.url();
	                    $scope.tableLoader = true;
	                    $scope.cmsList = [];
	                    CmsService.getCmsList().save($scope.paramUrl, function(response) {
	                    	for (var i in response.data) {
	                    		var decData = response.data[i].description.replace(/<\/?[^>]+(>|$)/g, '');
	                    		decData = decData.replace(/&amp;/g, '');
	                    		if (decData.length > 60) {
	                    			decData = decData.substr(0, 60)+'...';
	                    		}
	                    		response.data[i].description = decData;
	                    	}
	                        $scope.tableLoader = false;
	                        // $scope.paramUrlActive = paramUrl;
	                        $scope.cmsList = response.data;
	                        var data = response.data;
	                        $scope.totalLength = response.totalLength;
	                        params.total(response.totalLength);
	                        $defer.resolve(data);
	                    });
	                }
	            });
	        }
	        var getData = ngTableParamsService.get();
	        $scope.searchTextField = getData.searchText;
	        $scope.searching = function() {
	            ngTableParamsService.set('', '', $scope.searchTextField, '');
	            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
	                counts: [],
	                getData: function($defer, params) {
	                    // send an ajax request to your server. in my case MyResource is a $resource.
	                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
	                    $scope.paramUrl = params.url();
	                    $scope.tableLoader = true;
	                    $scope.cmsList = [];
	                    CmsService.getCmsList().save($scope.paramUrl, function(response) {
	                        $scope.tableLoader = false;
	                        // $scope.paramUrlActive = paramUrl;
	                        $scope.cmsList = response.data;
	                        var data = response.data;
	                        $scope.totalLength = response.totalLength;
	                        params.total(response.totalLength);
	                        $defer.resolve(data);
	                    });
	                }
	            });
	        }
	    }
	]);
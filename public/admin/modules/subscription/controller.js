	"use strict";

	angular.module("Subscription")

	neoApp.controller("subscriptionController", ['$scope', '$rootScope', '$localStorage', 'UserService', 'ngTableParams', '$routeParams', '$route', '$location', 'logger', 'ngTableParamsService', '$state', '$stateParams', '$http', 'CommonService', '$uibModal','SubscriptionService',
	    function($scope, $rootScope, $localStorage, UserService, ngTableParams, $routeParams, $route, $location, logger, ngTableParamsService, $state, $stateParams, $http, CommonService, $uibModal,SubscriptionService) {
	        $scope.crew = {};
	        $scope.disabled = false;
	        $scope.loader = false;
	        ngTableParamsService.set('', '','', '');

	        $(document).ready(function() {
	            $(".fancybox").fancybox();
	        });

	        $scope.getSubscriptionList = function() {
	       	$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
	                counts: [],
	                getData: function($defer, params) {
	                    // send an ajax request to your server. in my case MyResource is a $resource.
	                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
	                    $scope.paramUrl = params.url();
	                    //$scope.paramUrl.parent_id = $stateParams.id;
	                    $scope.tableLoader = true;
	                   
	                    SubscriptionService.getSubscriptionList().save($scope.paramUrl, function(response) {
	                    	
	                        //$scope.paramUrlActive = paramUrl;
	                        $scope.tableLoader = false;
	                        $scope.subscriptionList = response.data;
	                        var data = response.data;
	                        $scope.totalLength = response.totalLength;
	                        params.total(response.totalLength);
	                        $defer.resolve(data);
	                    });

	                }
	            }); 
	    	};

	    	$scope.addUpdateData = function(form){
	        	if (form.$valid) {
	                $scope.disabled = true;
	                $scope.loader = true;
	                SubscriptionService.addUpdateSubscriptionData().save($scope.subscription, function(response) {
	                    $scope.disabled = false;
	                    $scope.loader = false;
	                    if (response.code == 200) {
	                        $location.path("/subscription");
	                        logger.logSuccess(response.message);
	                    } else {
	                        logger.logError(response.message);
	                    }
	                });
	            }
	        }

	        $scope.back = function(){
	        	
	        	$location.path("/crews/"+$stateParams.id);;
	        }

	        $scope.findOne = function() {
	            if ($stateParams.id) {
	                SubscriptionService.getSubscriptionById().get({ id: $stateParams.id }, function(response) {
	                    if (response.code == 200) {
	                    	console.log(response.data)
	                        $scope.subscription = response.data;
	                    }
	                });
	            }
	        }


	        $scope.deleteSubscription = function(id) {
	            bootbox.confirm('Are you sure you want to delete this subscription', function(r) {
	                if (r) {
	                    SubscriptionService.deleteSubscription().delete({ id: id }, function(response) {
	                        if (response.code == 200) {
	                            $scope.getSubscriptionList();
	                            logger.logSuccess(response.message);
	                        } else {
	                            logger.logError(response.message);
	                        }
	                    });
	                }
	            })
	        }

	        $scope.viewsubscriptionDetail = function(subscription, status) {
			    
			    console.log("subscription",subscription)
			     
			         var modalInstance = $uibModal.open({
			             animation: $scope.animationsEnabled,
			             templateUrl: '/admin/modules/subscription/views/viewsubscription.html',
			             controller: 'subscription_detail',
			             windowClass: 'zindex',
			             // size: size,
			             resolve: {
			                 subscription: subscription
			             }
			         });

			    
			 }

	         $scope.enableDisableSuper = function(id, status) {
	        	let msg = 'Are you sure you want to' +" "+ status+" "+ 'this subscription';
	        	  bootbox.confirm(msg, function(r) {
	        	  if(r == true){
	        	  		 SubscriptionService.enableDisableSubscription().save({ subscriptionId: id, status: status }, function(response) {
		                if (response.code == 200) {
		                    $scope.getSubscriptionList();
		                    logger.logSuccess(response.message);
		                } else {
		                    logger.logError(response.message);
		                }
		            });
	        	  }else{
	        	  	
	        	  }
		           
		        })
	        }



	        var getData = ngTableParamsService.get();
	        $scope.searchTextField = getData.searchText;
	        $scope.searchingSubscription = function() {
	            ngTableParamsService.set('', '', $scope.searchTextField, '');
	            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
	                counts: [],
	                getData: function($defer, params) {
	                    // send an ajax request to your server. in my case MyResource is a $resource.
	                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
	                    $scope.paramUrl = params.url();
	                   // $scope.paramUrl.parent_id = $stateParams.id;
	                    $scope.tableLoader = true;
	                     SubscriptionService.getSubscriptionList().save($scope.paramUrl, function(response) {
	                    	
	                        //$scope.paramUrlActive = paramUrl;
	                        $scope.tableLoader = false;
	                        $scope.subscriptionList = response.data;
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

	neoApp.controller('subscription_detail', function($scope, $uibModalInstance, $location, logger,subscription) {
	 
	    $scope.subscription = subscription;

 	   console.log("11111", $scope.subscription)
	    $scope.cancel = function() {
	        $uibModalInstance.dismiss('cancel');
	    };
	    $scope.ok = function() {
	        $uibModalInstance.dismiss('cancel');
	    };
		

	    $(document).ready(function() {
	        $(".fancybox").fancybox();
	    });
	     
	})



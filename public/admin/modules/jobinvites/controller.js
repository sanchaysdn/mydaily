	"use strict";

	neoApp.controller("invitiesController", ['$scope', '$rootScope', '$localStorage', 'ngTableParams', '$routeParams', '$route', '$location', 'logger', 'ngTableParamsService', '$state', '$stateParams', 'InvitiesService', 'CommonService', '$uibModal','$filter','JobService',
	    function($scope, $rootScope, $localStorage, ngTableParams, $routeParams, $route, $location, logger, ngTableParamsService, $state, $stateParams, InvitiesService, CommonService, $uibModal,$filter,JobService) {

	        $scope.invities = {};
	        $scope.disabled = false;
	        $scope.loader = false;
	        
	        ngTableParamsService.set('', '','', '');
	        
	        $(document).ready(function() {
	            $(".fancybox").fancybox();
	        });

	    	$scope.getInvitiesList = function() {
	       	$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
	                counts: [],
	                getData: function($defer, params) {
	                    // send an ajax request to your server. in my case MyResource is a $resource.
	                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
	                    $scope.paramUrl = params.url();
	                    $scope.paramUrl.users_id = CommonService.getUser()._id;
	                    $scope.tableLoader = true;
	                    $scope.jobList = [];
	                    InvitiesService.getInvitiesList().save($scope.paramUrl, function(response) {
	                    	
	                        // $scope.paramUrlActive = paramUrl;
	                        $scope.tableLoader = false;
	                        $scope.invitesList = response.data;
	                        var data = response.data;
	                        $scope.totalLength = response.totalLength;
	                        params.total(response.totalLength);
	                        $defer.resolve(data);
	                    });

	                }
	            }); 
	   		}


	   		$scope.getNewJobInvities = function(){
		    	$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
	            counts: [],
	            getData: function($defer, params) {
	                // send an ajax request to your server. in my case MyResource is a $resource.
	                ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
	                $scope.paramUrl = params.url();
	                $scope.paramUrl.users_id = CommonService.getUser()._id;
	                $scope.tableLoader = true;
	                $scope.invitesList = [];
	                InvitiesService.getInvitie().save($scope.paramUrl, function(response) {
	                    //$scope.paramUrlActive = paramUrl;
	                    $scope.tableLoader = false;
	                    $scope.invitesList = response.data;
	                    var data = response.data;
	                    $scope.totalLength = response.totalLength;
	                    params.total(response.totalLength);
	                    $defer.resolve(data);
	                });

	            }
				});
	        }

	        $scope.view_inviteJob = function(job) {
	        
			    JobService.getAllSupervisor().get({ id: CommonService.getUser()._id }, function(response) {
			        if (response.code == 200) {
			            $scope.superVisorList = response.data;
			           	job.supervisor = $scope.superVisorList;		           
			   			JobService.getJobId().save({user_id : CommonService.getUser()._id}, function(response) {
	                    	//$scope.paramUrlActive = paramUrl;
	                        $scope.tableLoader = false;
	                        $scope.jobList = response.data;
	                        job.jobLists = $scope.jobList	         
	                       
	                    });
	                }
	           
			            var modalInstance = $uibModal.open({
			                animation: $scope.animationsEnabled,
			                templateUrl: '/admin/modules/jobinvites/views/view_invite_job.html',
			                controller: 'viewInvitiesJobCtrl',
			                windowClass: 'zindex',
			                // size: size,
			                resolve: {
			                    job: job

			                }
			            });			          
			        
			    });
			}
	     }

	]);

	neoApp.controller('viewInvitiesJobCtrl', function($scope, $uibModalInstance, $location, logger, job,InvitiesService,CommonService) {

	    $scope.job = job;
	    $scope.option = {};
	    $scope.cancel = function() {
	        $uibModalInstance.dismiss('cancel');
	    };
	    $scope.ok = function() {
	        $uibModalInstance.dismiss('cancel');
	    };
	    $(document).ready(function() {
	        $(".fancybox").fancybox();
	    });

	    $scope.accept = function(job,option) {	    	
	    		    option.job_details = job.job_details;
	                option.job_assign_by = CommonService.getUser()._id;	       
	                option.invite_job_id = job._id	
	             
	       InvitiesService.acceptInvite().save({option}, function(response) {
	                    if (response.code == 200) {
	                        logger.logSuccess(response.message);                       
	                        $location.path("/job");	
	                        $uibModalInstance.dismiss('cancel');

	                        logger.logSuccess(response.message);
	                        $location.path('/job')
	                        $uibModalInstance.dismiss('cancel');
	                    } else {
	                        logger.logError(response.message);
	                        $uibModalInstance.dismiss('cancel');
	                    }
	        });
	    };


	     $scope.reject = function(job) {
	       InvitiesService.rejectInvite().save({job}, function(response) {
	                    if (response.code == 200) {
	                    	$location.path("/job");	
	                        logger.logSuccess(response.message);
	                        $uibModalInstance.dismiss('cancel');
	                    } else {
	                        logger.logError(response.message);
	                        $uibModalInstance.dismiss('cancel');
	                    }
	        });

	       $uibModalInstance.dismiss('cancel');
	    };
	})
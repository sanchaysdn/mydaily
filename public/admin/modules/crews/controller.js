	"use strict";

	neoApp.controller("crewsController", ['$scope', '$rootScope', '$localStorage', 'ngTableParams', '$routeParams', '$route', '$location', 'logger', 'ngTableParamsService', '$state', '$stateParams','CommonService', '$uibModal','$filter','UserService','CrewService',
	    function($scope, $rootScope, $localStorage, ngTableParams, $routeParams, $route, $location, logger, ngTableParamsService, $state, $stateParams,CommonService, $uibModal,$filter,UserService,CrewService) {

	        $scope.crew = {};
	        $scope.disabled = false;
	        $scope.loader = false;
	        ngTableParamsService.set('', '','', '');

	        $(document).ready(function() {
	            $(".fancybox").fancybox();
	        });

	        $scope.getCrewList = function() {
	        
	       	$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
	                counts: [],
	                getData: function($defer, params) {
	                    //send an ajax request to your server. in my case MyResource is a $resource.
	                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
	                    $scope.paramUrl = params.url();
	                    $scope.paramUrl.parent_id = $stateParams.id;
	                    $scope.tableLoader = true;
	                    $scope.crewList = [];
	                    CrewService.getCrewList().save($scope.paramUrl, function(response) {
	                        //$scope.paramUrlActive = paramUrl;
	                        $scope.tableLoader = false;
	                        $scope.crewList = response.data;
	                        var data = response.data;
	                        $scope.totalLength = response.totalLength;
	                        params.total(response.totalLength);
	                        $defer.resolve(data);
	                    });

	                }
	            }); 
	    	};

	    	$scope.addCrewData = function(form){
	        	if (form.$valid) {
	                $scope.disabled = true;
	                $scope.loader = true;
	                $scope.crew.parent_id = $stateParams.id; 	
	                CrewService.addUpdateCrewsData().save($scope.crew, function(response) {
	                    $scope.disabled = false;
	                    $scope.loader = false;
	                    if (response.code == 200) {
	                        $location.path("/crews/"+response.data._id);
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

	        $scope.viewUserDetail = function(crews) {
			         var modalInstance = $uibModal.open({
			             animation: $scope.animationsEnabled,
			             templateUrl: '/admin/modules/crews/views/crew_view.html',
			             controller: 'crew_detail',
			             windowClass: 'zindex',
			             resolve: {
			                 crews: crews
			             }
			         });			    
			     }


	        $scope.findOne = function() {
	        	/*document.getElementById('filePicker').addEventListener('change', function(evt) {
	                var files = evt.target.files;
	                var file = files[0];
	                if (files && file) {
	                    var splitFileName = file.name.split('.');
	                    var ext = splitFileName[splitFileName.length - 1].toLowerCase();
	                    if (ext == 'jpg' || ext == 'jpeg' || ext == 'png') {
	                        if (file.size > 6291456) {
	                            logger.log('File size cannot exceed limit of 6 mb');
	                            document.getElementById("filePicker").value = "";
	                        } else {
	                            formDataFileUpload = file;
	                            // formDataFileUpload.append('file', file);
	                            var reader = new FileReader();
	                            reader.onload = function(readerEvt) {
	                                $scope.imageBase64 = btoa(readerEvt.target.result);
	                                $scope.$apply();
	                                document.getElementById('imgTag').src = 'data:image/' + ext + ';base64,' + $scope.imageBase64;
	                            };
	                            reader.readAsBinaryString(file);
	                        }
	                    } else {
	                        document.getElementById("filePicker").value = "";
	                        bootbox.alert('Invalid image format');
	                    }
	                }
	            }, false);*/
	            if ($stateParams.id) {
	                CrewService.getCrewsById().get({ id: $stateParams.id }, function(response) {
	                    if (response.code == 200) {
	                        $scope.crew = response.data;
	                    }
	                });
	            }
	        }


	        $scope.deleteCrews = function(id) {
	            bootbox.confirm('Are you sure you want to delete this crews', function(r) {
	                if (r) {
	                    CrewService.deleteCrews().delete({ id: id }, function(response) {
	                        if (response.code == 200) {
	                            $scope.getCrewList();
	                            logger.logSuccess(response.message);
	                        } else {
	                            logger.logError(response.message);
	                        }
	                    });
	                }
	            })
	        }


	        var getData = ngTableParamsService.get();
	        $scope.searchTextField = getData.searchText;
	        $scope.searchingCrews = function() {
	            ngTableParamsService.set('', '', $scope.searchTextField, '');
	            $scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
	                counts: [],
	                getData: function($defer, params) {
	                    // send an ajax request to your server. in my case MyResource is a $resource.
	                    ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
	                    $scope.paramUrl = params.url();
	                    $scope.paramUrl.parent_id = $stateParams.id;
	                    $scope.tableLoader = true;
	                    $scope.crewList = [];
	                    CrewService.getCrewList().save($scope.paramUrl, function(response) {
	                        //$scope.paramUrlActive = paramUrl;
	                        $scope.tableLoader = false;
	                        $scope.crewList = response.data;
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

	neoApp.controller('crew_detail', function($scope, $uibModalInstance, $location, logger, crews) {
	 
	    $scope.crew = crews;
 	   
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
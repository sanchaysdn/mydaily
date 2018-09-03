"use strict";

neoApp.controller("jobController", ['$scope', '$rootScope', '$localStorage', 'ngTableParams', '$routeParams', '$route', '$location', 'logger', 'ngTableParamsService', '$state', '$stateParams', 'JobService', 'CommonService', '$uibModal', '$filter', 'UserService', 'InvitiesService',
	function ($scope, $rootScope, $localStorage, ngTableParams, $routeParams, $route, $location, logger, ngTableParamsService, $state, $stateParams, JobService, CommonService, $uibModal, $filter, UserService, InvitiesService) {

		$scope.job = {};
		$scope.disabled = false;
		$scope.loader = false;

		$scope.JobLocation = $location.path().split('/');
		$scope.locationPath = $scope.JobLocation[1];
		$rootScope.jobID = $stateParams.id;
		$rootScope.job_ID = $stateParams.job_id;

		if ($rootScope.jobID) {
			$scope.isLinkDisabled = true;
		} else {
			$scope.isLinkDisabled = false;
		}
		//console.log($scope.locationPath);

		//$rootScope.user_level = CommonService.getUser().role.code;

		ngTableParamsService.set('', '', '', '');

		$(document).ready(function () {
			$(".fancybox").fancybox();
		});
		$scope.example1model = [];
		$scope.example1data = [{
			id: 1,
			label: "David"
		}, {
			id: 2,
			label: "Jhon"
		}, {
			id: 3,
			label: "Danny"
		}];
$scope.choices = [{ 
				 name: ''} 
				 ];





		$scope.getJobListAdmin = function () {

			$scope.getSupervisor();
			$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
				counts: [],
				getData: function ($defer, params) {
					// send an ajax request to your server. in my case MyResource is a $resource.
					ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
					$scope.paramUrl = params.url();
					$scope.paramUrl.users_id = CommonService.getUser()._id;
					$scope.tableLoader = true;
					$scope.jobList = [];
					JobService.getJobListAdmin().save($scope.paramUrl, function (response) {
						//$scope.paramUrlActive = paramUrl;
						$scope.tableLoader = false;
						$scope.jobList = response.data;
						$scope.compareDate = response.today
						var data = response.data;
						$scope.totalLength = response.totalLength;
						$scope.totalInvities = response.totalInvities;
						params.total(response.totalLength);
						$defer.resolve(data);
						delete $rootScope.jobID
					});

				}
			});
		};










		
		$scope.getforemanList = function () {
			$scope.ctrl = {};
			$scope.foremenList = [];
			$scope.ctrl.parent_id = CommonService.getUser()._id;
			//console.log("$scope.ctrl",$scope.ctrl)
			UserService.getForemenList().get($scope.ctrl, function (response) {

				//console.log(response)
				$scope.foremenList = response.data;


			});
			//console.log('Hello', $scope.foremenList);
		}

   
   $scope.addNewChoice = function(choice) {
	   console.log("$scope.choices",choice)


    //  var newItemNo = $scope.choices.length+1;
	 $scope.choices.push({'name' : '' });
	 
   };
   
   $scope.removeNewChoice = function(i) {
     var newItemNo = $scope.choices.length-1;
     if ( newItemNo !== 0 ) {
	//   $scope.choices.pop();
	   $scope.choices.splice(i,1);
     }
   };
   
   $scope.showAddChoice = function(choice) {
     return choice.id === $scope.choices[$scope.choices.length-1].id;
   };
   
 

// $scope.saveSubJob = function(saveSubjob) {
//     // $scope.segments = {}
// 	// 	// segments=  $scope.segments
// 	// 	$scope.segments.job_id =  $stateParams.id;
// 		console.log("$stateParams.id",$stateParams.id)
// // $scope.jobinvite.job_id = $stateParams.id;
// //   $scope.segments = $stateParams.id;
// //    console.log(segments,"segments>>>>")
// 		//    var segments= $scope.choices;		 


// 			JobService.addSubJobs().save({segments:$scope.choices}, function (response) {
// 					  console.log("response is here >>>>",response)
					
// 					});

// console.log("$scope.choices>",$scope.choices)

// }


$scope.saveSubJob = function(saveSubjob) {
    // $scope.segments = {}
	// 	// segments=  $scope.segments
	// 	$scope.segments.job_id =  $stateParams.id;
		console.log("$stateParams.id",$stateParams.id)
// $scope.jobinvite.job_id = $stateParams.id;
//   $scope.segments = $stateParams.id;
//    console.log(segments,"segments>>>>")
		//    var segments= $scope.choices;		 
         $scope.segments = {}
			  $scope.segments.choices = $scope.choices;
			  $scope.segments.job_id = $stateParams.id
			JobService.addSubJobs().save($scope.segments, function (response) {
					  console.log("response is here >>>>",response)
						if (response.code == 200) {
							logger.logSuccess(response.message);
							$location.path('/job')
						} else {
							logger.logError(response.message);
						}
					});

console.log("$scope.choices>",$scope.choices)

}



$scope.cancelSubjob = function(){
	$scope.segments = ''
// A.splice(0,A.length)
     $scope.choices.splice(0,$scope.choices.length-1)
	// $location.path("/job");
}













		$scope.getInviteList = function () {
			$scope.tableParam = new ngTableParams(ngTableParamsService.get(), {
				counts: [],
				getData: function ($defer, params) {
					// send an ajax request to your server. in my case MyResource is a $resource.
					ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
					$scope.paramUrl = params.url();
					$scope.paramUrl.users_id = CommonService.getUser()._id;
					$scope.paramUrl.job_id = $stateParams.id;

					$scope.tableLoader = true;
					$scope.jobList = [];
					InvitiesService.getInvitiesList().save($scope.paramUrl, function (response) {

						$scope.tableLoader = false;
						$scope.invitesList = response.data;
				    	$scope.simpleList = response.data;

						var data = response.data;
						$scope.totalLength = response.totalLength;
						params.total(response.totalLength);
						$defer.resolve(data);
							// $scope.checkboxes = {
							// 	checked: false,
							// 	items: {}
							// };
					});

				}
			});
		}
		$scope.shared = false;
		$scope.getUrl = function () {
			var url = window.location.href;
			url = url.split('/#/')[1].split('/')[0];
			if(url == 'job-share'){
				$scope.shared = true;
			}else{
				$scope.shared = false;
			}
			return false;
		}

/**********Multiple checkbox Job share *************/




// $scope.noDataFlag = false;
// 			//Toggle multilpe checkbox selection
// 			$scope.selection = [];
// 			$scope.selectionAll;
// 			$scope.toggleSelection = function toggleSelection(user) {
// 				console.log("user",user);
// 				$scope.user = user;
//                    $scope.repeatflag=false;

// 				//Check for single checkbox selection
// 				if (user) {
// 				if($scope.selection.length>0){
//             $scope.selection.forEach(function(data,index){
//                 if(data.id==user._id){
// 				   $scope.selection.splice(index,1);
// 			       $scope.repeatflag=true;
// 				}
// 					   })
					
//      				if(!$scope.repeatflag){
// 						$scope.selection.push({
// 						id: user._id,
// 							// incident_number: incident.incident_number,
// 						})              
// 				  }


			
// 					} else{
// 					 	$scope.selection.push({
// 						id: user._id,
// 							// incident_number: incident.incident_number,
// 						})
					
// 				}
				
				
// 				}
// 				//Check for all checkbox selection
// 				else {
// 					//Check for all checked checkbox for uncheck
// 					if ($scope.selection.length > 0 && $scope.selectionAll) {
// 						$scope.selection = [];
// 						$scope.checkboxes = {
// 							checked: false,
// 							items: {}
// 						};
// 						$scope.selectionAll = false;
// 					}
// 					//Check for all un checked checkbox for check
// 					else {
// 						$scope.selectionAll = true
// 						$scope.selection = [];
// 						angular.forEach($scope.simpleList, function (item) {
// 							$scope.checkboxes.items[item._id] = $scope.checkboxes.checked;
// 							$scope.selection.push({
// 								id: item._id
// 							});
// 						});
// 					}
// 				}
// 			};


// $scope.shareJobWithMultipleContractor = function (user) {
// 	console.log("user",user)
// 				var roleLength = $scope.selection.length;
// 				var updatedData = [];
// 				$scope.selectedActionn = selectedActionn.value;
// 				var actionValue = '';

// 				// $scope.users.parent_id = CommonService.getUser()._id;



// 				if ($scope.selectedActionn == 0 || $scope.selection.length == 0)
// 					console.log("inside if")
// 				else {
				

// 						for (var i = 0; i < roleLength; i++) {
// 							var id = $scope.selection[i].id;
// 							var firstname = $scope.selection[i].firstname;
// 							var lastname = $scope.selection[i].lastname;
// 							var email = $scope.selection[i].email

// 							if ($scope.selectedAction == 3) {
// 								updatedData.push({
// 									_id: id,
// 									deleted: true,
// 									parent_id: CommonService.getUser()._id
// 								});
// 							} else if ($scope.selectedAction == 1) {
// 								updatedData.push({
// 									_id: id,
// 									email: email,
// 									firstName: firstname,
// 									lastName: lastname,
// 									parent_id: CommonService.getUser()._id
// 								});
// 							} else if ($scope.selectedActionn == 2) {
// 								updatedData.push({
// 									_id: id,
// 									// is_active: false
// 									parent_id: CommonService.getUser()._id,
// 									invite_assign_by : CommonService.getUser()._id,
// 									invite_assign_to : id,
// 									job_id : $stateParams.id
									
// 								});
// 							} else if ($scope.selectedAction == 4) {
// 								updatedData.push({
// 									_id: id,
// 									parent_id: CommonService.getUser()._id
// 									// is_membership: true
// 								});
// 							} else if ($scope.selectedAction == 5) {
// 								updatedData.push({
// 									_id: id,
// 									// is_membership: false
// 									parent_id: CommonService.getUser()._id
// 								});
// 							}


// 						}
// 						var inputJson = {
// 							data: updatedData
// 						}

// 						inputJson.data.forEach(function (element) {
// 						$scope.loader = true;
// 							JobService.InviteJob().save(element, function (response) {
// 													$scope.loader = false;
	
// 									if (response.code == 200) {
// 							logger.logSuccess(response.message);
// 						} else {
// 							logger.logError(response.message);
// 						}
								
// 							});
// 						});

// 				}

// 			}


		$scope.invitesupervisor = function (user) {
			$scope.jobinvite = {}
			$scope.jobinvite.invite_assign_by = CommonService.getUser()._id;
			$scope.jobinvite.invite_assign_to = user._id;
			$scope.jobinvite.job_id = $stateParams.id;
			var msg = 'Are you sure you want to share job ' + $stateParams.job_id + ' with ' + user.company_name + '?';
			bootbox.confirm(msg, function (r) {
				if (r) {

					JobService.InviteJob().save($scope.jobinvite, function (response) {
						$scope.disabled = false;
						$scope.loader = false;
						if (response.code == 200) {
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
		$scope.currentuser = CommonService.getUser()._id;
		$scope.searchingContractor = function () {
			$scope.isDataLoad = true;
			ngTableParamsService.set('', '', $scope.searchTextField, '');
			$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
				counts: [],
				getData: function ($defer, params) {
					// send an ajax request to your server. in my case MyResource is a $resource.
					ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
					$scope.paramUrl = params.url();
					$scope.paramUrl.user = $scope.currentuser
					$scope.tableLoader = true;
					$scope.usersList = [];
					UserService.getUsersList().get($scope.paramUrl, function (response) {
						$scope.tableLoader = false;
						$scope.usersList = response.data;
					    $scope.simpleList = response.data;
                        var data = response.data;
						$scope.totalLength = response.totalLength;
						params.total(response.totalLength);
						$defer.resolve(data);
						// 	$scope.checkboxes = {
						// 	checked: false,
						// 	items: {}
						// };
					});
				}
			});
		}




		var getData = ngTableParamsService.get();
		$scope.searchTextField = getData.searchText;
		$scope.searchJob = function () {
			$scope.isDataLoad = true;
			ngTableParamsService.set('', '', $scope.searchTextField, '');
			$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
				counts: [],
				getData: function ($defer, params) {
					// send an ajax request to your server. in my case MyResource is a $resource.
					ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
					$scope.paramUrl = params.url();
					$scope.paramUrl.users_id = CommonService.getUser()._id;
					$scope.tableLoader = true;
					$scope.jobList = [];
					JobService.getJobListAdmin().save($scope.paramUrl, function (response) {
						//$scope.paramUrlActive = paramUrl;
						$scope.tableLoader = false;
						$scope.jobList = response.data;
						var data = response.data;
						$scope.totalLength = response.totalLength;
						params.total(response.totalLength);
						$defer.resolve(data);
					});
				}
			});
		}

		$scope.addUpdateGeneralData = function (form) {
			//console.log(form, "formdata")
			if (form.$valid) {
				$scope.disabled = true;
				$scope.loader = true;
				$scope.job.job_added_by = CommonService.getUser()._id;
				$scope.job.latitude = angular.element("#lat").val();
				$scope.job.longitude = angular.element("#long").val();
				$scope.job.address = angular.element("#address").val();
				JobService.addUpdateGeneralData().save($scope.job, function (response) {
					$scope.disabled = false;
					$scope.loader = false;
					if (response.code == 200) {
						// $location.path("/job");	
						$location.path("/billingInfo/" + response.data._id + '/' + response.data.job_id);
						logger.logSuccess(response.message);
					} else {
						logger.logError(response.message);
					}
				});
			}
		}

		/** Getting Billable Itemes **/
		$scope.getBillableList = function () {
			JobService.listAllBillableItem().get({
				id: CommonService.getUser()._id
			}, function (response) {
				$scope.billableItemList = response.data;
				$scope.billing_info.billable_items.push(response.data[response.data.length - 1])
			});
		}

		$scope.getSupervisor = function () {
			JobService.getAllSupervisor().get({
				id: CommonService.getUser()._id
			}, function (response) {
				if (response.code == 200) {
					$scope.superVisorList = response.data;
					
					

				}
			});
		}


		$scope.addUpdateBillingInfo = function (form) {
			if (form.$valid) {
				$scope.disabled = true;
				$scope.loader = true;
				$scope.billing_info.job_id = $stateParams.id;

				JobService.addUpdateBillingInfoData().save($scope.billing_info, function (response) {
					$scope.disabled = false;
					$scope.loader = false;
					if (response.code == 200) {
						$location.path("/daily-path/" + response.data._id + '/' + response.data.job_id);
						// $location.path("/job");	
						logger.logSuccess(response.message);
					} else {
						logger.logError(response.message);
					}
				});
			}
		}


		$scope.addUpdateDailyPath = function (form) { 
			console.log("form>>>>>",form);
			var SupervisordeleteIdarray=[];
			var SupervisoraddIdarray=[];
			var ForemendeleteIdarray=[];
			var ForemenaddIdarray=[];
			var newSupervisorIdarray=[];
			var newForemenIdarray=[];
			var supervisorarray=[];
			var foremenarray=[];			
			if (form.$valid) {
				$scope.disabled = true;
				$scope.loader = true;
				$scope.dailypath.job_id = $stateParams.id;
				console.log("dailypath",$scope.dailypath.job_id)
				angular.forEach($scope.dailypath.supervisor,function(name,index){
					console.log($scope.login_Id,name.parent_id)
					if($scope.SupervisorIDs.length>0){
					console.log("name is here>>>",name,'$scope.SupervisorIDs>>>.',$scope.SupervisorIDs)
					supervisorarray.push(name._id);
					if($scope.SupervisorIDs.indexOf(name._id)==-1)
						newSupervisorIdarray.push(name._id);
					}
				if($scope.SupervisorIDs.length==0)
					newSupervisorIdarray.push(name._id);
				})
				angular.forEach($scope.dailypath.foremen,function(name,index){
					// && $scope.login_Id==name.parent_id
					if($scope.ForemenIDs.length>0 ){					
					foremenarray.push(name._id);
					if($scope.ForemenIDs.indexOf(name._id)==-1)
						newForemenIdarray.push(name._id);
					}
					if($scope.ForemenIDs.length==0)
					newForemenIdarray.push(name._id);
				})
				SupervisordeleteIdarray= _.difference($scope.SupervisorIDs, supervisorarray);
	            console.log($scope.SupervisorIDs,'>>',newSupervisorIdarray,'>>>>>>>>>>>>>>>')
				SupervisoraddIdarray= _.difference(newSupervisorIdarray,$scope.SupervisorIDs);
				ForemendeleteIdarray= _.difference($scope.ForemenIDs, foremenarray);
				ForemenaddIdarray= _.difference(newForemenIdarray,$scope.ForemenIDs);
				$scope.dailypath.SupervisoraddIdarray=SupervisoraddIdarray;
				$scope.dailypath.SupervisordeleteIdarray=SupervisordeleteIdarray;
				$scope.dailypath.ForemenaddIdarray=ForemenaddIdarray;				
				$scope.dailypath.ForemendeleteIdarray=ForemendeleteIdarray;
				// var dailypath={
				// 	SupervisoraddIdarray:SupervisoraddIdarray,
				// 	SupervisordeleteIdarray:SupervisordeleteIdarray,
				// 	ForemenaddIdarray:ForemenaddIdarray,
				// 	ForemendeleteIdarray:ForemendeleteIdarray,
				// 	dailypath:$scope.dailypath
				// }			
				JobService.addUpdateDailyPathData().save($scope.dailypath
					, function (response) {
					//console.log(response,"response")
					$scope.disabled = false;
					$scope.loader = false;
					if (response.code == 200) {
						$location.path("/job");
						logger.logSuccess(response.message);
					} else {
						logger.logError(response.message);
					}
				});
			}
		}

		$scope.findOneJobInfo = function () {
			$scope.isDisabled = false;
			if ($stateParams.id) {
				JobService.getJobInfoById().get({
					id: $stateParams.id
				}, function (response) {
					if (response.code == 200) {
						$scope.job = response.data.job_details;
						if (response.data.job_details.start_date) {
							$scope.job.start_date = new Date(response.data.job_details.start_date);
						}
						if (response.data.job_details.projected_end_date) {
							$scope.job.projected_end_date = new Date(response.data.job_details.projected_end_date);
						}
						if (response.data.job_details.actual_end_date) {
							$scope.job.actual_end_date = new Date(response.data.job_details.actual_end_date);
						}
						$scope.billing_info = response.data.job_details.billing_info;
						$scope.dailypath = response.data.job_details;
						$scope.isDisabled = true;

					}
				});
			}
		}
	$scope.findOneSupervisorJobInfo = function () {	
			if ($stateParams.id) {
				var arr = [];
				
                   				// $scope.loader = true;

				JobService.getSupervisorJobInfoById().get({
					id: $stateParams.id
				}, function (response) {
					if (response.code == 200) {
						$scope.dailypath = response.data;						
						// $scope.dailypath_supervisor = response.data.supervisor;
						// console.log($scope.dailypath_supervisor)
						$scope.SupervisorIDs =  [];
						$scope.ForemenIDs =  [];						
					angular.forEach($scope.dailypath.supervisor,function(Snames,i){					
						   $scope.SupervisorIDs.push(Snames._id)
						console.log("data>>>>>",":::::",$scope.SupervisorIDs,$localStorage.Id)						   
					})
					angular.forEach($scope.dailypath.foremen,function(Snames,i){					
						   $scope.ForemenIDs.push(Snames._id)
						console.log("data>>>>>",":::::",$scope.ForemenIDs)						   
					})
						
														   $scope.loader = false;
														if($scope.dailypath.share_status!=true)   {
														   $scope.Show = true;
														}
																							  
						
						// alert($scope.dailypath.share_status)
						//$scope.dailys = ["59b76427f16cb30edcd9d68e","59b7abc67e27dd111e71b37f"];
						//arr.push()


					}
				});
			}
		}


$scope.matchToken = function(){
	var token = {
           userToken:$localStorage.token
	} 
	console.log("token is here", token);
	JobService.matchToken().get(
		// {token}
				 function (response) {
					$scope.login_Id= response.data._id
				
			});
}

$scope.addSubjob = function(){
	console.log("aaddSubjob")
}




		if ($state.current.name == "daily-path") {

			$scope.findOneSupervisorJobInfo();
		}


		$scope.viewJob = function (job, status) {

			job.superDropOpt = status;
			job.supervisor = $scope.superVisorList;

			JobService.getInvite_Supervisor_Id().save({
				job_id: job._id
			}, function (response) {
				if (response.data) {
					job.assign_super = response.data.job_assign_to;
				}

				var modalInstance = $uibModal.open({
					animation: $scope.animationsEnabled,
					templateUrl: '/admin/modules/jobs/views/viewJob.html',
					controller: 'jobDetail',
					windowClass: 'zindex',
					// size: size,
					resolve: {
						job: job
					}
				});

			});
		}


		$scope.today = function () {
			// $scope.job.start_date = new Date();
			// $scope.job.projected_end_date = new Date();
			// $scope.job.actual_end_date = new Date();
		};
		$scope.today();

		$scope.clear = function () {
			$scope.job.start_date = null;
			$scope.job.projected_end_date = null;
			$scope.job.actual_end_date = null;
		};

		/*$scope.dateOptions = {
		  minDate: new Date()
		};*/

		// Disable weekend selection

		$scope.startDate = function () {
			$scope.start_date.opened = true;
		};

		$scope.projectedEndDate = function () {
			$scope.projected_end_date.opened = true;
		};
		$scope.actualEndDate = function () {
			$scope.actual_end_date.opened = true;
		};

		$scope.setDate = function (year, month, day) {
			//$scope.job.start_date = new Date(year, month, day);
			//$scope.job.projected_end_date = new Date(year, month, day);
			//$scope.job.actual_end_date = new Date(year, month, day);
		};

		$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		$scope.format = $scope.formats[0];
		$scope.altInputFormats = ['M!/d!/yyyy'];

		$scope.start_date = {
			opened: false
		};

		$scope.projected_end_date = {
			opened: false
		};

		$scope.actual_end_date = {
			opened: false
		};

		$scope.addNew = false;
		$scope.addNewbillable = function () {
			$scope.addNew = true;
		};

		$scope.addBillableItem = function (form) {
			if (form.$valid) {
				console.log("form.valid>>>")
				//console.log($scope.item); return false;
				if ($scope.item.popup_flag == false) {
					console.log("addbillable item")
                     bootbox.dialog({
						message: "Are you sure you want to update the billable item name? This will change the item name in every job and daily it's connected to.",
						buttons: {
							ok: {
								label: "Yes",
								className: 'btn-info',
								callback: function () {
									$scope.disabled = true;
									$scope.loader = true;
									$scope.item.user_id = CommonService.getUser()._id;
        JobService.addBillableItem().save($scope.item, function (response) {
						$scope.disabled = false;
						$scope.loader = false;
						if (response.code == 200) {
							console.log("response>>>>1",response)
							$location.path("/billableItems");
							logger.logSuccess(response.message);
						} else {
							logger.logError(response.message);
						}
					});
								}
							},
							cancel: {
								label: "No",
								className: 'btn-danger',
								callback: function () {

								}
							},
							noclose: {
								label: "Don't ask me",
								className: 'btn-warning',
								callback: function () {
									$scope.disabled = true;
									$scope.loader = true;
									$scope.item.user_id = CommonService.getUser()._id;
									$scope.item.popup_flag = true;

								JobService.addBillableItem().save($scope.item, function (response) {
						$scope.disabled = false;
						$scope.loader = false;
						if (response.code == 200) {
							console.log("response>>>>1",response)
							$location.path("/billableItems");
							logger.logSuccess(response.message);
						} else {
							logger.logError(response.message);
						}
					});
								}
							}

						}
					});
				} else {
					
									$scope.disabled = true;
									$scope.loader = true;
									$scope.item.user_id = CommonService.getUser()._id;
JobService.addBillableItem().save($scope.item, function (response) {
										$scope.disabled = false;
										$scope.loader = false;
										if (response.code == 200) {
												console.log("response>>>>2",response)
						
											$location.path("/billableItems");
											logger.logSuccess(response.message);
										} else {
											logger.logError(response.message);
										}
									});
								}
							
		}
		}

			$scope.addItem = function (form) {
			//console.log('IRM', form)
			if (form) {
				$scope.disabled = true;
				$scope.loader = true;
				form.user_id = CommonService.getUser()._id;
				//console.log('$scope.billing_info.billable_items--->..',$scope.billing_info.billable_items);
				var selectedItemsBefore = $scope.billing_info.billable_items;
				JobService.addBillableItem().save(form, function (response) {
					$scope.disabled = false;
					$scope.loader = false;
					if (response.code == 200) {
						$scope.getBillableList();
						$scope.addNew = false;
						logger.logSuccess(response.message);
						
						selectedItemsBefore.push({"_id":response._id,"name":form.name})
						$scope.billing_info.billable_items = selectedItemsBefore;
					
					
					} else {
						logger.logError(response.message);
					}
				});
				//$scope.billing_info.billable_items = form
			}
		}

		$scope.getBillableItemList = function () {
			$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
				counts: [],
				getData: function ($defer, params) {
					// send an ajax request to your server. in my case MyResource is a $resource.
					ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
					$scope.paramUrl = params.url();
					$scope.paramUrl.users_id = CommonService.getUser()._id;
					$scope.tableLoader = true;
					$scope.billableList = [];
					JobService.getbillableList().save($scope.paramUrl, function (response) {
						// $scope.paramUrlActive = paramUrl;
						$scope.tableLoader = false;
						$scope.billableList = response.data;
						var data = response.data;
						$scope.totalLength = response.totalLength;
						params.total(response.totalLength);
						$defer.resolve(data);
					});

				}
			});
		}

		$scope.findOneItemInfo = function () {
			
			if ($stateParams.id) {
				JobService.getItemInfoById().get({
					id: $stateParams.id
				}, function (response) {
					if (response.code == 200) {
						$scope.item = response.data;
						$scope.item.old_name = response.data.name;
					}
				});
			}
		}

		$scope.deleteItem = function (id) {
			bootbox.confirm('Are you sure you want to delete this item', function (r) {
				if (r) {
					JobService.deleteItem().delete({
						id: id
					}, function (response) {
						if (response.code == 200) {
							$scope.getBillableItemList();
							logger.logSuccess(response.message);
						} else {
							logger.logError(response.message);
						}
					});
				}
			})
		}

		$scope.deleteJob = function (id) {
			bootbox.confirm('Are you sure you want to delete this item', function (r) {
				if (r) {
					JobService.deleteJob().delete({
						id: id
					}, function (response) {
						if (response.code == 200) {
							$scope.getJobListAdmin();
							logger.logSuccess(response.message);
						} else {
							logger.logError(response.message);
						}
					});
				}
			})
		}

		$scope.func = function (data) {
			// console.log('$event', data)
			// $scope.some = data[0].name
		}

		$scope.func2 = function (data) {
			console.log('$event', data)

			$scope.some = data
		}
		var getData = ngTableParamsService.get();
		$scope.searchTextField = getData.searchText;
		$scope.searchingItem = function () {
			ngTableParamsService.set('', '', $scope.searchTextField, '');
			$scope.tableParams = new ngTableParams(ngTableParamsService.get(), {
				counts: [],
				getData: function ($defer, params) {
					// send an ajax request to your server. in my case MyResource is a $resource.
					ngTableParamsService.set(params.page(), params.count(), $scope.searchTextField, params.sorting());
					$scope.paramUrl = params.url();
					$scope.paramUrl.users_id = CommonService.getUser()._id;
					$scope.tableLoader = true;
					$scope.usersList = [];
					JobService.getbillableList().save($scope.paramUrl, function (response) {
						$scope.tableLoader = false;
						// $scope.paramUrlActive = paramUrl;
						$scope.billableList = response.data;
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

neoApp.controller('jobDetail', function ($scope, $uibModalInstance, $location, logger, job, JobService) {

	$scope.job = job;


	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};
	$scope.ok = function () {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.accept = function (jobID, assignID) {
		$scope.params = {}
		$scope.params.job_id = jobID;
		$scope.params.job_assign_to = assignID;

		JobService.shareJobAcceptence().save($scope.params, function (response) {
			if (response.code == 200) {
				logger.logSuccess(response.message);
				$location.path("/job");
				$uibModalInstance.dismiss('cancel');

			} else {
				logger.logError(response.message);
				$uibModalInstance.dismiss('cancel');
			}
		});

	}

	$(document).ready(function () {
		$(".fancybox").fancybox();
	});

})
(function(angular){
	"use strict";
  // Home page frontend
  // |
  // V
	app.controller('showProblemController', function(UserResource, UtilService, ProblemResource, Socket, $scope, $interval, $parse, $http){
    Socket.connectUser();
    Socket.on('notifyUserEmit', function(data){
      toastr.success(data.message, 'Rukhell');
    });
    $scope.init = function(loggedUser){
      $scope.loading = true;
      $scope.showNoFound = false;
      $scope.taskTypeIncludes = [];
      $scope.taskObj = {};
      //if user has 'regular' role
      if (loggedUser.role_id == 1) {
        UserResource.getLoggedUserTasks(1).then(function(loggedUserTasks){
            $scope.taskObj.problemsData = allTasks.data;
            $scope.taskObj.problemsMeta = allTasks.meta;
        }).finally(function() {
          $scope.loading = false;
        });
      }else{
        ProblemResource.getAllTasks(1).then(function(allTasks){
            $scope.taskObj.problemsData = allTasks.data;
            $scope.taskObj.problemsMeta = allTasks.meta;
        }).finally(function() {
          $scope.loading = false;
        });
        Socket.forward('addNewTaskEmit', $scope);
      }
      Socket.forward('updateTaskOffersEmit', $scope);
    }
    //fill filter list of task types
    $scope.includeTaskType = function(taskType) {
      var i = $.inArray(taskType, $scope.taskTypeIncludes);
      if (i > -1) {
        $scope.taskTypeIncludes.splice(i, 1);
      } else {
        $scope.taskTypeIncludes.push(taskType);
      }
    }
    //filter and search for paginated tasks
    $scope.taskSearchFilter = function () {
        ProblemResource.getAllTasks(1,$scope.product_name, $scope.programming, $scope.math, $scope.physics).then(function (allTasks) {
            $scope.taskObj.problemsData = allTasks.data;
            $scope.taskObj.problemsMeta = UtilService.makePages(allTasks.meta);
        });
    }
    $scope.$on('socket:addNewTaskEmit', function(ev, data){
      console.log(data.data);
      if (data.data.time_ends_at.date) {
        data.data.time_ends_at.date = data.data.time_ends_at;
      }
      console.log(data.data);
      $scope.problems.push(data.data);
    })
    //upadate 'regular' user bast offer offer
    $scope.$on('socket:updateTaskOffersEmit', function(ev, data){
      ProblemResource.getAllTasks().then(function(allTasks){
        $scope.problems= allTasks;
      });
    });
});

app.directive('problemShowDirective', function (UserResource, ProblemResource, UtilService, Socket, $timeout) {
  return {
    templateUrl: '/js/templates/taskInfoTemplate.html',
    restrict: 'A',
    scope: { 
      problem: '=',
      user: '='
    },
    link: function (scope, element, attrs) {
      //if user has 'regular' role
      if (scope.user.role_id == 1) {
        if (scope.problem.took == 0) {
          if(scope.problem.offers.length > 0){
            var minOffer = UtilService.findMin(scope.problem);
            UtilService.STATUS.MIN_OFFER.price = '$'+minOffer.price;
            scope.problem.status = UtilService.STATUS.MIN_OFFER;
          }else{
            if (scope.problem.waiting == 1) {
              scope.problem.status = UtilService.STATUS.WAITING_OFFERS;
            }else{
              scope.problem.showLink = true;
              scope.problem.status = UtilService.STATUS.NO_OFFERS;
            } 
          }
        }else if(scope.problem.waiting == 0 && scope.problem.took == 1){
          scope.problem.status = UtilService.STATUS.UNDER_WORK;
        }else if(scope.problem.waiting == 0 && scope.problem.took == 2){
            scope.problem.status = UtilService.STATUS.FINISHED;
        }
      }else{
        if (scope.problem.offers.length == 0) {
          scope.problem.status = UtilService.STATUS.NO_OFFERS;
        }else{
          UtilService.STATUS.MY_OFFER.count = scope.problem.offers.length + ' total';
          angular.forEach(scope.problem.offers, function(value, key) {
            if (value.person_from == scope.user) {

              scope.problem.status = UtilService.STATUS.MY_OFFER;
            }
          });
          scope.problem.status = UtilService.STATUS.MY_OFFER;
        }
      }
      
      scope.requestAgain = function(prob){
        ProblemResource.getProblemReset(prob.id).then(function(updatedTask){
          scope.problem.waiting = 1;
          scope.problem.time_ends_at = updatedTask.time_ends_at.date;
          var data = {
            id: updatedTask.id,
            time: updatedTask.time_ends_at.date
          }
          UserResource.getAllModerators().then(function(allModerators){
            Socket.emit('updateAdminTime', {emailTo: allModerators, data: data});
          });
          if(scope.user.role_id === 1){
            scope.problem.showLink = false;
            scope.problem.status = UtilService.STATUS.WAITING_OFFERS;
          }
        });
      }
    }
  }
});

app.directive('confirmationDirective', function (ProblemResource, Socket, UtilService) {
  return {
    templateUrl: '/js/templates/confirmationTemplate.html',
    restrict: 'A',
    scope: { 
      problem: '=',
      problems: '=',
      index: '@'
    },
    link: function (scope) {
      if(scope.problem.offers.length > 0 && scope.problem.waiting === 0 && scope.problem.took === 0){
        scope.problem.showConfirmation = true;
      }else if(scope.problem.offers.length > 0 && scope.problem.waiting === 0 && (scope.problem.took === 1 || scope.problem.took === 2) && scope.problem.paid === 0){
        scope.problem.showMakePayment = true;
      }
      //Decline offer
      scope.declineOffer = function(problem){
        ProblemResource.putTaskInactive(problem.id).then(function(updatedTask){
          scope.problems.splice(scope.index, 1);
        });
      }
      //Accept offer
      scope.acceptOffer = function(problem){
        var minOffer = UtilService.findMin(problem);
        ProblemResource.postAcceptOffer(problem.id, minOffer.person_from).then(function(updatedTask){
          scope.problem.showConfirmation = false;
          scope.problem.showMakePayment = true;
          Socket.emit('addToAssigned', {emailTo: updatedTask.main_solver.email, data: problem});
        });
      }
    }
  }
});

app.directive('timerDirective', function(ProblemResource, UtilService, Socket, $interval){
  return {
    template: '<sapnconfirmation-directive><i ng-show=\"problem.showLoading\" class="fa fa-circle-o-notch fa-spin fa-1x fa-fw"></i>{{problem.timer}}</span>',
    restrict: 'A',
    scope: { 
      problem: '=',
      user: '='
    },
    link: function (scope) {
      scope.problem.showLoading = true;
      scope.$watch('problem.time_ends_at', function(newValue, oldValue){
        var x = $interval(function() {
          var timeVals = UtilService.timeDifference(scope.problem);
          scope.problem.showLoading = false;
          scope.problem.timer = timeVals['minutes'] + "m " + timeVals['seconds'] + "s ";
          if(timeVals['difference'] < 0){
            scope.problem.timer = "Expired";
            if(scope.problem.waiting != 0){
              // Set waiting on false(0)
              ProblemResource.putResetTaskWaiting(scope.problem.id).then(function(updatedTask){
                if (scope.user.role_id === 1) {
                  if(scope.problem.offers.length > 0 && scope.problem.took === 0){
                    scope.problem.showConfirmation = true;
                  }else if(scope.problem.offers.length == 0){
                    scope.problem.showLink = true;
                    scope.problem.status = UtilService.STATUS.NO_OFFERS;
                  }
                }
                scope.problem.showBiddingForm = false;
              });
            }
            $interval.cancel(x);
          }
        }, 1000);
      }, true); 
      Socket.on('updateAdminTimeEmit', function(data){
        if (data.data.id === scope.problem.id) {
          scope.problem.time_ends_at = data.data.time;
        }
        scope.problem.showBiddingForm = true;
      });
    }
  }
});

app.controller('paginationController', function ($scope) {

});

app.directive('pageLinksDirective', function (ProblemResource, UtilService) {
    return {
        templateUrl: '/js/templates/pageLinksTemplate.html',
        restrict: 'A',
        scope: {
            problemsd: '=',
            problemsm: '=',
            user: '='
        },
        link: function (scope) {
            UtilService.makePages(scope.problemsm);
            scope.changePage = function (pageNum) {
                if (scope.user.role_id == 1) {
                    UserResource.getLoggedUserTasks(pageNum).then(function(loggedUserTasks){
                        $scope.problemsd = allTasks.data;
                        $scope.problemsm = UtilService.makePages(allTasks.meta);
                    });
                }else{
                     ProblemResource.getAllTasks(pageNum).then(function (allTasks) {
                         scope.problemsd = allTasks.data;
                         scope.problemsm = UtilService.makePages(allTasks.meta);
                     });
                }
            }
        }
    }
});

//Problem page frontend
// |
// V
app.controller('ProblemController',  function(ProblemResource, Socket, $scope){
  Socket.connectUser();
  Socket.on('notifyUserEmit', function(data){
    toastr.success(data.message, 'Rukhell');
  });
  $scope.init = function(problemId){
    ProblemResource.getProblem(problemId).then(function(problem){
      $scope.prob = problem;
      $scope.dataHasLoaded = true;
    });
  };
});

app.directive('biddingDirective', function(ProblemResource, UserResource, UtilService, AlertSerice, Socket){
  return {
    templateUrl: '/js/templates/bidTemplate.html',
    restrict: 'A',
    scope: { 
      problem: '=',
      user: '='
    },
    link: function (scope) {
      var hasMyOffer = UtilService.hasMyOffer(scope.problem, scope.user);
      var timeVals = UtilService.timeDifference(scope.problem);
      //if user has not 'regular' role
      if (scope.user.role_id != 1) {
        if (scope.problem.offers.length === 0 && timeVals['difference'] > 0) {
          scope.problem.showBiddingForm = true;
        }else if(scope.problem.offers.length !== 0){
          if (hasMyOffer) {
            scope.problem.myOffer = hasMyOffer.price;
            scope.problem.showMyBid = true;
          }else{
            scope.problem.showBiddingForm = true;
          }
        }
      }
      scope.placeBid = function(problem){    
        ProblemResource.postPlaceOffer(scope.problem.id, scope.biddingOffer, scope.biddingDescription).then(function(offer){
          AlertSerice.sweet('Success', 'success', 'Successfully bidded $'+scope.biddingOffer+' on this task');
          problem.myOffer = offer.price;
          scope.problem.showBiddingForm = false;
          scope.problem.showMyBid = true;

          Socket.emit('updateTaskOffers', {emailTo: problem.user_from.email});
        });
      };
    }
  }
});
// Assigned page fronend
// |
// V
app.controller('assignedController', function(ProblemResource, Socket, $scope){
  Socket.connectUser();
  Socket.on('notifyUserEmit', function(data){
    toastr.success(data.message, 'Rukhell');
  });
  $scope.loading = true;
  $scope.init = function(loggedUser){
    ProblemResource.getAssignedToMe().then(function(assignedTasks){
      $scope.problems = assignedTasks;
    }).finally(function(){
      $scope.loading = false;
    });
    Socket.forward('addToAssignedEmit', $scope);
  }

  $scope.$on('socket:addToAssignedEmit', function(ev, data){
    $scope.$apply(function(){
      $scope.problems.push(data.data);
    })
  })
});

app.directive('assignDirective', function(){
  return {
    templateUrl: '/js/templates/assignIconTemplate.html',
    restrict: 'A',
    scope: { 
      problem: '=',
      user: '='
    },
    link: function (scope) {
      if (scope.problem.main_slovler === scope.user.id) {
        scope.problem.showStar = true;
      }else{
        scope.problem.showPen = true;
      }
    }
  }
});
//New problem page
// |
// V
app.controller('newProblemController', function(ProblemResource, UserResource, DropzoneService, UtilService, AlertSerice, Socket, $scope, $window, $interval){
  
  $scope.init = function(problem, user){
    if(problem === undefined && user === undefined){
      Socket.connectUser();
      var time = new Date();
      ProblemResource.getTaskCategories().then(function(taskCategories){
        $scope.categories = taskCategories;
      });
    }else{
      var isMainSolver = UtilService.mainSolver(problem, user);
      if (!isMainSolver || problem.took === 2) {
        $scope.showSolutionDropzone = false;
      }else{
        $scope.showSolutionDropzone = true;
      }
    }
  };
  //Handle callbacks for dropzone
  $scope.dzCallbacks = {
    'sending': function(file, xhr, formData){
      formData.append('type', $('#taskType').val());
    },
    'addedfile' : function(file){
      console.log(DropzoneService.currentFiles);
      for (var i = DropzoneService.currentFiles.length - 1; i >= 0; i--) {
        if (DropzoneService.currentFiles[i].name === file.name && DropzoneService.currentFiles[i].size === file.size ) {
            AlertSerice.sweet('Error', 'error', "Can't upload same picture!");
            removeDuplicate(DropzoneService.addedFiles, DropzoneService.currentFiles, file);
            var _ref;
            return (_ref = file.previewElement) != null ? _ref.parentNode.removeChild(file.previewElement) : void 0; 
        }
      }
    },
    'removedfile': function(file){
      removeDuplicate(DropzoneService.addedFiles, DropzoneService.currentFiles, file);
    },
    'processing': function(file){
      $scope.filesLoading = true;
    },
    'success' : function(file, response){
      var newFile = {
        'name': response[0],
        'size': file.size
      }
      DropzoneService.addedFiles.push(newFile);
      DropzoneService.currentFiles.push({
        'name': file.name,
        'size': file.size
      });

      $scope.fileList = DropzoneService.addedFiles;
    },
    queuecomplete: function(file){
      $scope.filesLoading = false;
    }
  };

  function removeDuplicate(addedFiles, currentFiles, file){
    for (var i = addedFiles.length - 1; i >= 0; i--) {
      var media = addedFiles[i];
      if (media.name.indexOf(file.name) !== -1) {
        ProblemResource.postDeleteFile({'name': media.name, 'type': $('#taskType').val()});
        addedFiles.splice(addedFiles.indexOf(media), 1);

      }
    }
    for (var i = currentFiles.length - 1; i >= 0; i--) {
      var media = currentFiles[i];
      if (media.name.indexOf(file.name) !== -1) {
        currentFiles.splice(currentFiles.indexOf(media), 1);
      }
    }
  }

  $scope.addProblemSubmit = function(){
    var data = {
      probName: $scope.probName,
      probDescription: $scope.probDescription,
      probType: $scope.answer,
      selectedFiles: DropzoneService.addedFiles,
    }
    ProblemResource.postNewTask(data).then(function(response){
      UserResource.getAllModerators().then(function(allModerators){
        Socket.emit('addNewTask', {emailTo: allModerators, data: response});
      });
      
      AlertSerice.sweet('Success', 'success', 'Successfully submitted new task');
      $interval(function() {
          $window.location.href = '/home';
      }, 1800);
    });
  }

  $scope.addSolutionSubmit = function(task){
    var data = {
      probDescription: $scope.probDescription,
      selectedFiles: DropzoneService.addedFiles,
      task_id: task.id
    }
    ProblemResource.postTaskSolution(data).then(function(){
      AlertSerice.sweet('Success', 'success', 'Successfully submitted solution for this task');
      $interval(function() {
          $window.location.reload();
      }, 1800);
    });
  }
  // Summernote options
  $scope.summernoteOptions = {
    height:300,
    toolbar: [
      ['style', ['bold', 'italic', 'underline', 'clear']],
      ['fontsize', ['fontsize']],
      ['color', ['color']],
      ['para', ['ul', 'ol', 'paragraph']],
    ]
  };
});

})(angular);
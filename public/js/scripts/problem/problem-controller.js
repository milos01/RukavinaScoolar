(function(angular){
	"use strict";
  // Home page frontend
  // |
  // V
	app.controller('showProblemController', function(UserResource, UtilService, ProblemResource, $scope, $interval, $parse, $http){
    $scope.init = function(loggedUser){
      $scope.loading = true;
      $scope.taskTypeIncludes = [];
      //if user has 'regular' role
      if (loggedUser.role_id == 1) {
        UserResource.getLoggedUserTasks().then(function(loggedUserTasks){
          $scope.problems = loggedUserTasks;
          $scope.requestAgain = function(){
            socket.emit('updateAdminTime', {emailTo: "milosa942@gmail.com"});
          }
        }).finally(function() {
          $scope.loading = false;
        });
      }else{
        ProblemResource.getAllTasks().then(function(allTasks){
          $scope.problems = allTasks;
        }).finally(function() {
          $scope.loading = false;
        });
      }
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
});

app.directive('problemShowDirective', function (UtilService) {
  return {
    templateUrl: 'js/templates/taskInfoTemplate.html',
    restrict: 'A',
    scope: { 
      problem: '=',
      user: '='
    },
    link: function (scope, element, attrs) {
      //if user has 'regular' role
      if (scope.user.role_id == 1) {
        if (scope.problem.waiting == 0 && scope.problem.took == 0) {
          if(scope.problem.offers.length > 0){
            var minOffer = UtilService.findMin(scope.problem);
            UtilService.STATUS.MIN_OFFER.price = '$'+minOffer.price;
            scope.problem.status = UtilService.STATUS.MIN_OFFER;
          }else{
            scope.problem.showLink = true;
            scope.problem.status = UtilService.STATUS.NO_OFFERS;
          }
        }else if(scope.problem.waiting == 0 && scope.problem.took == 1){
          scope.problem.status = UtilService.STATUS.UNDER_WORK;
        }else if(scope.problem.waiting == 0 && scope.problem.took == 2){
            scope.problem.status = UtilService.STATUS.FINISHED;
        }else if(scope.problem.waiting == 1){
            scope.problem.status = UtilService.STATUS.WAITING_OFFERS;
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
    }
  }
});

app.directive('confirmationDirective', function (ProblemResource, UtilService) {
  return {
    templateUrl: 'js/templates/confirmationTemplate.html',
    restrict: 'A',
    scope: { 
      problem: '=',
      problems: '=',
      index: '@'
    },
    link: function (scope) {
      if(scope.problem.offers.length > 0 && scope.problem.waiting === 0 && scope.problem.took === 0){
        scope.problem.showConfirmation = true;
      }else if(scope.problem.offers.length > 0 && scope.problem.waiting === 0 && scope.problem.took === 1){
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
        ProblemResource.postAcceptOffer(problem.id, minOffer.person_from).then(function(){
          scope.problem.showConfirmation = false;
          scope.problem.showMakePayment = true;
        });
      }
    }
  }
});

app.directive('timerDirective', function(ProblemResource, UtilService, $interval){
  return {
    template: '<sapn class="badge"><i ng-show=\"problem.showLoading\" class="fa fa-circle-o-notch fa-spin fa-1x fa-fw"></i>{{problem.timer}}</span>',
    restrict: 'A',
    scope: { 
      problem: '=',
    },
    link: function (scope) {
      scope.problem.showLoading = true;
      var x = $interval(function() {
        var timeVals = UtilService.timeDifference(scope.problem);
        scope.problem.showLoading = false;
        // Display the result in the element with id="demo"
        scope.problem.timer = timeVals['minutes'] + "m " + timeVals['seconds'] + "s ";

        if(timeVals['difference'] < 0){
          scope.problem.timer = "Expired";
          if(scope.problem.waiting !== 0){
            // Set waiting on false(0)
            ProblemResource.putResetTaskWaiting(scope.problem.id).then(function(updatedTask){
              // socket.emit('updateProblemStatus', {emailTo: problem.user_from.email, problem_id: problem.id});
            });
          }
          $interval.cancel(x);
        }
      }, 1000);
    }
  }
});
//New problem page
// |
// V
app.controller('newProblemController', function($scope, $http, alertSerice, selectedFilesService, removeFileS3Service){
  $http({
      method: 'GET',
      url: '/home/api/application/categories',
      headers: {
          "Content-Type": "application/json"
      },
      data: {}
  }).then(function(res){
    $scope.categories = res.data;
  });
  $scope.summernoteOptions = {
    height:300,
    toolbar: [
          ['style', ['bold', 'italic', 'underline', 'clear']],
          ['fontsize', ['fontsize']],
          ['color', ['color']],
          ['para', ['ul', 'ol', 'paragraph']],
          // ['height', ['height']]
        ]
  }
  $scope.addProblemSubmit = function(){
    return $http({
        method: 'POST',
        url: '/home/api/application/newproblemsubmit',
        headers: {
            "Content-Type": "application/json"
        },
        data: {probName: $scope.probName, probDescription: $scope.probDescription, probType: $scope.answer, selectedFiles: selectedFilesService.selectedFiles}
    }).then(function(res){
      alertSerice.successSweet('Success', 'success', 'Successfully submitted new task');
      $('#showNewProblemForm').hide();
      $('#showProblemConfirm').show();


    }).finally(function() {
      // called no matter success or failure
    });

  }
  if($('#uploadHolderr').is(':visible')){
                $("#showSubmitButton2").show();
                Dropzone.options.dropzoneForm = {
                    addRemoveLinks: true,
                    maxFilesize: 15,
                    acceptedFiles: ".png, .jpg, .jpeg, .zip, .rar, .pdf, .tex, .docx, .xlsx, .tar, .gz , .bz2, .7z, .s7z",
                    removedfile: function(file){
                      var _ref;
                      var name = file.name;
                      selectedFilesService.selectedFiles.splice(file.name, 1);
                      removeFileS3Service.remove(name).then(function (){});
                      return (_ref = file.previewElement) != null ? _ref.parentNode.removeChild(file.previewElement) : void 0;

                    },
                    paramName: "file", // The name that will be used to transfer the file
                    dictDefaultMessage: "<strong>Drop files or click here to upload. (max. 15MB)<br>Accepted files: .png, .jpg, .jpeg, .zip, .rar, .pdf, .tex, .docx, .xlsx, .tar, .gz , .bz2, .7z, .s7z</strong>",
                    accept: function(file, done) {
                        if(selectedFilesService.selectedFiles.length >= 0){
                            $("#showSubmitButton2").hide();
                        }
                        selectedFilesService.selectedFiles.push(file.name);

                        if (file.name == "a.jpg") {
                          done("Naha, you don't.");
                        }
                        else { done(); }
                    },
                    queuecomplete: function(file){
                        $("#showSubmitButton").fadeIn(100);

                    },
                };
  }
});
app.controller('bidingController', function(UserResource, alertSerice, $scope, $http, $compile, $element){

  $scope.init = function(id){
    UserResource.user().then(function(d) {
  
    var lUser = d;
    if (lUser.role.name != 'regular') {
    var check = false;
    var check02 = false;
    return $http({
            method: 'POST',
            url: '/home/api/application/getProblem',
            headers: {
                "Content-Type": "application/json"
            },
            data: {probId: id}
        }).then(function(res){

          var formBidElement = '<form name="offerForm" ng-submit="placeBid(id)" novalidate><div class = "input-group pull-left" style="width:150px;margin-right:10px"><span class = "input-group-addon">$</span><div class="form-group" ng-class="{ '+"'has-error'"+' : offerForm.biddingOffer.$invalid && !offerForm.biddingOffer.$pristine}"><input type = "number" min="1" class ="form-control" ng-model="biddingOffer" name="biddingOffer" style="height:54px;" required></div></div><div class="form-group" ng-class="{ '+"'has-error'"+' : offerForm.biddingDescription.$invalid && !offerForm.biddingDescription.$pristine}"><textarea class="form-control" placeholder="e.g. Problem can be solved in 10 mins with 1 file attached..." style="width:500px;resize:none" ng-model="biddingDescription" name="biddingDescription" required></textarea></div><button class="btn btn-primary" type="submit" style="float:left;border-radius: 0px;margin-top:5px" ng-disabled="offerForm.$invalid">Bid for this task</button></form>';



          var countDownDate = new Date(res.data.time_ends_at).getTime();
          // Get todays date and time
          var now = new Date().getTime();
          // Find the distance between now an the count down date
          var distance = countDownDate - now;
          // console.log(distance);
          if(distance < 0){
              var el = angular.element('<hr><h3><span style="padding:13px 0px;position:absolute">Time expired! Can\'t bid anymore</span></h3>');
              $compile(el)($scope);
              elm = $element.find("#offerPlace");
              elm.append(el);
          }else{
            var offers = res.data.offers;

            if (offers.length == 0) {
              var el3 = angular.element(formBidElement);
              $compile(el3)($scope);
              elm3 = $element.find("#offerPlace");
              elm3.append(el3);
            }else{
              angular.forEach(offers, function(value, key) {
                  if (lUser.id != value.person_from) {
                    check = true;
                  }else{
                    check02 = true;
                  }
              });
              if (check && !check02) {
                var el3 = angular.element(formBidElement);
                $compile(el3)($scope);
                elm3 = $element.find("#offerPlace");
                elm3.append(el3);
              }else if(check02){
                angular.forEach(offers, function(value, key) {
                  if (lUser.id == value.person_from) {
                    var el3 = angular.element('<hr><h3><span style="padding:13px 0px;position:absolute">Already bidded $'+value.price+'</span></h3>');
                    $compile(el3)($scope);
                    elm3 = $element.find("#offerPlace");
                    elm3.append(el3);
                  }
                });

              }
            }
          }
          $scope.placeBid = function(problemId){
            
            var offer = $scope.biddingOffer;
            var desc = $scope.biddingDescription;
              return $http({
                  method: 'POST',
                  url: '/home/api/application/placeOffer',
                  headers: {
                      "Content-Type": "application/json"
                  },
                  data: {probId: id, price: offer, description: desc}
              }).then(function(resp){

                alertSerice.successSweet('Success', 'success', 'Successfully bidded $'+offer+' on this task');
                $("#offerPlace").html('<span style="padding:13px 0px;position:absolute">Already bidded $'+offer+'</span>');
                //emit event
                var newOffer = {
                  price: offer,
                  description: desc,
                  problem_id: id,
                  user_from: d,
                  created_at: new Date()
                }
                socket.emit('updateTaskOffers', {emailTo: res.data.user_from.email, offer: newOffer});
              });
          };
        }).finally(function(){
          // $scope.loading02 = false;
        });
    }
  });
};

});
})(angular);
//SOCKETS
//|
//V
// socket.on('updateTaskOffersEmit',function(data){
//   angular.forEach(res.data, function(problem) {
//     if(problem.id == data.offer.problem_id){
//       var newOffer = {
//         created_at: data.offer.created_at,
//         description:data.offer.description,
//         price:data.offer.price,
//         persFrom:{
//           name: data.offer.user_from.name,
//           lastName: data.offer.user_from.lastName
//         }
//       }
//       problem.offers.push(newOffer);

//     }
//   });
//   $scope.$apply(function () {
//     $scope.problems = res.data;
//   });
// });

// socket.on('updateProblemStatusEmit', function(data){
//   var retVal = {};
//   var newProblems =  $http({
//   method: 'GET',
//   url: 'home/api/application/getOneUserProblems',
//   headers: {
//       "Content-Type": "application/json"
//   },
//   data: {}
// }).then(function(ress){
  
  
//     $scope.problems = ress.data;
  
// });
// // $scope.$apply(function () {
  
// // }          
//   // angular.forEach(res.data, function(problem) {
//   //   if(problem.id == data.problem_id){

//   //   }
//   // });
// });

// socket.on('updateAdminTimeEmit', function(){
//             $http({
//               method: 'GET',
//               url: 'home/api/application/getuserproblems',
//               headers: {
//                   "Content-Type": "application/json"
//               },
//               data: {}
//             }).then(function(ress){
//               $http({
//               method: 'GET',
//               url: 'home/problem/1/reset',
//               headers: {
//                   "Content-Type": "application/json"
//               },
//               data: {}
//             }).then(function(resss){
          
//             });
//               // console.log(ress.data);
       
      
//             });
//           });
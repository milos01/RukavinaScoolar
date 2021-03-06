
(function (angular) {
  angular.module('kbkApp').directive('fooRepeatDone', function() {
    return function($scope, element) {
        if ($scope.$last) { // all are rendered
            $('.table').trigger('footable_redraw');
        }
    }
})
  angular.module('kbkApp').controller('showProblemController', function($scope, $http, $interval, $parse){
    $scope.loading = true;
    $scope.limit = 20;

    $scope.colourIncludes = [];
    $scope.noFound = 'No tasks found!';
    $http({
        method: 'GET',
        url: 'home/api/application/user',
        headers: {
            "Content-Type": "application/json"
        },
        data: {}
    }).then(function(res){
        var loggedUser = res.data;
        if (res.data.role.name == "regular") {
          console.log('regular');
          $scope.showOffersManu = false;
          $http({
            method: 'GET',
            url: 'home/api/application/getOneUserProblems',
            headers: {
                "Content-Type": "application/json"
            },
            data: {}
          }).then(function(res){

          $scope.problems = res.data;
          socket.on('updateTaskOffersEmit',function(data){
            angular.forEach(res.data, function(problem) {
              if(problem.id == data.offer.problem_id){
                var newOffer = {
                  created_at: data.offer.created_at,
                  description:data.offer.description,
                  price:data.offer.price,
                  persFrom:{
                    name: data.offer.user_from.name,
                    lastName: data.offer.user_from.lastName
                  }
                }
                problem.offers.push(newOffer);

              }
            });
            $scope.$apply(function () {
              $scope.problems = res.data;
            });
          });

          socket.on('updateProblemStatusEmit', function(data){
            var retVal = {};
            var newProblems =  $http({
            method: 'GET',
            url: 'home/api/application/getOneUserProblems',
            headers: {
                "Content-Type": "application/json"
            },
            data: {}
          }).then(function(ress){
            
            
              $scope.problems = ress.data;
            
          });
          // $scope.$apply(function () {
            
          // }          
            // angular.forEach(res.data, function(problem) {
            //   if(problem.id == data.problem_id){

            //   }
            // });
          });
          // console.log($scope.problems);
          //show accept and decline
          for (var i = res.data.length - 1; i >= 0; i--) {
            var min = 100000;
            var minOffer;

            if(res.data[i].offers.length > 0 && res.data[i].waiting === 0 && res.data[i].took === 0){
              angular.forEach(res.data[i].offers, function(value, key) {
                if(value.price < min){
                  min = value.price;
                  minOffer = value;
                }
              })
              $scope.mOffer = minOffer;
              model0 = $parse("showAcceptDecline"+res.data[i].id);
              var model2 = $parse('mOffer'+res.data[i].id);
              // Assigns a value to it
              model0.assign($scope, true);
              model2.assign($scope, minOffer);
              // $scope.showAcceptDecline+res.data[i].id = true;
            }
          }

          $scope.includeColour = function(colour) {
              var i = $.inArray(colour, $scope.colourIncludes);
              if (i > -1) {
                  $scope.colourIncludes.splice(i, 1);
              } else {
                  $scope.colourIncludes.push(colour);
              }
           }

           $scope.colourFilter = function(fruit) {

              if ($scope.colourIncludes.length > 0) {
                  if ($.inArray(fruit.problem_type, $scope.colourIncludes) < 0)
                      return;
              }

              return fruit;
            }

            $scope.tookFilter = function(problem){
              if(problem.inactive == 0){
                return problem;
              }
            }

            $scope.requestAgain = function(){
              socket.emit('updateAdminTime', {emailTo: "milosa942@gmail.com"});
            }

          });
        }else{
        console.log('admin/moderator');
        $scope.showOffersManu = true;
        $http({
            method: 'GET',
            url: 'home/api/application/getuserproblems',
            headers: {
                "Content-Type": "application/json"
            },
            data: {}
        }).then(function(res){

          
          $scope.problems = res.data;
          // for (i = res.data.length - 1; i >= 0; i--) {
          //   console.log(i);
          //   c = i;
          //   $http({
          //   method: 'POST',
          //   url: 'home/api/application/getuserproblemoffer',
          //   headers: {
          //       "Content-Type": "application/json"
          //   },
          //   data: {probId: res.data[i].id}
          //   }).then(function(offers){
          //     console.log(c);
          //     // for (var i = res.data.length - 1; i >= 0; i--) {

          //      // res.data[i].offersList = offers.data;
          //     // }
          //   });
          // }
          
          socket.on('updateAdminTimeEmit', function(){
            $http({
              method: 'GET',
              url: 'home/api/application/getuserproblems',
              headers: {
                  "Content-Type": "application/json"
              },
              data: {}
            }).then(function(ress){
              $http({
              method: 'GET',
              url: 'home/problem/1/reset',
              headers: {
                  "Content-Type": "application/json"
              },
              data: {}
            }).then(function(resss){
                 var x = $interval(function() {
console.log("vrti");
                var doneCounters = [];

                for (var i = resss.data.length - 1; i >= 0; i--) {

                  var countDownDate = new Date(resss.data[i].time_ends_at).getTime();



                  // Get todays date and time
                  var now = new Date().getTime();

                  // Find the distance between now an the count down date
                  var distance = countDownDate - now;
                  doneCounters[i] = distance;

                  // Time calculations for days, hours, minutes and seconds
                  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

                  // Display the result in the element with id="demo"
                  resss.data[i].timer = minutes + "m " + seconds + "s ";

                  if(distance < 0){
                    console.log("oma usoopo");
                    resss.data[i].timer = "Expired";
                    problem = resss.data[i];
                    if(resss.data[i].waiting !== 0){
                      // Set waiting on false(0)
                      $http({
                          method: 'PUT',
                          url: 'home/api/problem/'+resss.data[i].id+'/resetWaiting',
                          headers: {
                              "Content-Type": "application/json"
                          },
                          data: {}
                      }).then(function(ress1){
                         console.log(problem);
                        //socket emit event for changing task status
                        socket.emit('updateProblemStatus', {emailTo: problem.user_from.email, problem_id: problem.id});
                      });
                    }
                  }

                  //If the count down is finished, write some text

                }

                var checkClearInterval = false;
                for (var i = doneCounters.length - 1; i >= 0; i--) {
                  if (doneCounters[i] > 0) {
                    checkClearInterval = true;
                  }
                }
                if(!checkClearInterval){
                  $interval.cancel(x);
                }

              }, 1000);

            });
              // console.log(ress.data);
             
            
            });
          });

          for (var i = res.data.length - 1; i >= 0; i--) {
            res.data[i].isCollapsed = true;

            if(res.data[i].offers.length === 0){
              res.data[i].showDown = false;
              res.data[i].showUp = false;
            }else{
              res.data[i].showDown = true;
            }


          }
          var x = $interval(function() {

                var doneCounters = [];

                for (var i = res.data.length - 1; i >= 0; i--) {

                  var countDownDate = new Date(res.data[i].time_ends_at).getTime();



                  // Get todays date and time
                  var now = new Date().getTime();

                  // Find the distance between now an the count down date
                  var distance = countDownDate - now;
                  doneCounters[i] = distance;

                  // Time calculations for days, hours, minutes and seconds
                  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

                  // Display the result in the element with id="demo"
                  res.data[i].timer = minutes + "m " + seconds + "s ";

                  if(distance < 0){
                    res.data[i].timer = "Expired";
                    problem = res.data[i];
                    if(res.data[i].waiting !== 0){
                      // Set waiting on false(0)
                      $http({
                          method: 'PUT',
                          url: 'home/api/problem/'+res.data[i].id+'/resetWaiting',
                          headers: {
                              "Content-Type": "application/json"
                          },
                          data: {}
                      }).then(function(ress){
                         console.log(problem);
                        //socket emit event for changing task status
                        socket.emit('updateProblemStatus', {emailTo: problem.user_from.email, problem_id: problem.id});
                      });
                    }
                  }

                  //If the count down is finished, write some text

                }

                var checkClearInterval = false;
                for (var i = doneCounters.length - 1; i >= 0; i--) {
                  if (doneCounters[i] > 0) {
                    checkClearInterval = true;
                  }
                }
                if(!checkClearInterval){
                  $interval.cancel(x);
                }

              }, 1000);

          $scope.includeColour = function(colour) {
              var i = $.inArray(colour, $scope.colourIncludes);
              if (i > -1) {
                  $scope.colourIncludes.splice(i, 1);
              } else {
                  $scope.colourIncludes.push(colour);
              }
           }

           $scope.colourFilter = function(fruit) {

              if ($scope.colourIncludes.length > 0) {
                  if ($.inArray(fruit.problem_type, $scope.colourIncludes) < 0)
                      return;
              }

              return fruit;
            }
            $scope.tookFilter = function(problem){
              if(problem.took == '0'){
                return problem;
              }
            }




          // console.log($scope.colourIncludes);
        });






      }
    }).finally(function() {
      // called no matter success or failure
      $scope.loading = false;
    });

    $scope.acceptOffer = function(problem){
      var min = 100000;
      var minOffer;

      angular.forEach(problem.offers, function(value, key) {
        if(value.price < min){
          min = value.price;
          minOffer = value;
        }
      })

      console.log(minOffer);
      $http({
          method: 'PUT',
          url: 'home/api/application/makePayment',
          headers: {
              "Content-Type": "application/json"
          },
          data: {probId: problem.id,
                sloId: minOffer.person_from,
          }
      }).then(function(){
        var model = $parse('showMakePayment'+problem.id);
        var model2 = $parse('showAcceptDecline'+problem.id);
        // Assigns a value to it
        model.assign($scope, true);
        model2.assign($scope, false);
      });
    }

    $scope.declineOffer = function(problemId){
      // Set inactive on true(1)
      $http({
          method: 'PUT',
          url: 'home/api/problem/'+problemId+'/inactive',
          headers: {
              "Content-Type": "application/json"
          },
          data: {}
      }).then(function(res){
        console.log(res);
        angular.forEach($scope.problems, function(value, key) {
          if(res.data.id == value.id && res.data.inactive === 1){
            $scope.problems.splice(key, 1);
          }
        });
      });


    }

    $scope.collapseMotion = function(problem){

        problem.isCollapsed = !problem.isCollapsed;
        if(problem.isCollapsed == true){
          problem.showDown = true;
          problem.showUp = false;
        }else{


          problem.showDown = false;
          problem.showUp = true;
        }

    }


    // $scope.loadMore = function() {
    //   // var increamented =
    //   alert("uso");
    //   $scope.limit += 10;
    //   // $scope.limit = increamented > $scope.problems.length ? $scope.problems.length : increamented;
    // };

  });
})(angular);

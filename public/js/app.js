
var app = angular.module('kbkApp', [], function($interpolateProvider) {
        $interpolateProvider.startSymbol('<%');
        $interpolateProvider.endSymbol('%>');
 });
// var $cont = $(".chDiscussion");
// $cont[0].scrollTop = $cont[0].scrollHeight;
app.controller('sendMessageController', function($scope, $http ) {
	 $scope.submitMessageForm = function() {
	 	var message = $scope.message;
	 	var id = $('#userId').val();
    console.log(id);
	 	$http({
  			method: 'POST',
  			url: '/home/inbox/sendMessage',
  			data: {message: message, id: id}
		}).then(function successCallback(response) {
        $(".messInput").val("");
        // $( ".chDiscussion" ).load( " .chDiscussion" );
        alert(response.data.variable1);
        $("#leftUserMessage").find("#messageBox").text(response.data.variable1);
        var messageDiv = $("#leftUserMessage");

        $(".chDiscussion").css('padding','0px');
        $(".chDiscussion").append('<div class="chat-message left" style="width:60%" id="leftUserMessage"><img class="message-avatar" src="../../../img/{{Auth::user()->picture}}" alt="" style="border-radius: 50%"><div class="message"><a class="message-author" href="#"></span><span class="message-content" id="messageBox">'+response.data.variable1+'</span></div></div>');
	    	// var res = JSON.stringify(response.data);
	    	// alert(res);
  		}, function errorCallback(response) {
    		alert('ne valja');
  		});
    };
});

app.directive('capitalizeFirst', function($parse) {
   return {
     require: 'ngModel',
     link: function(scope, element, attrs, modelCtrl) {
        var capitalize = function(inputValue) {
           if (inputValue === undefined) { inputValue = ''; }
           var capitalized = inputValue.charAt(0).toUpperCase() +
                             inputValue.substring(1);
           if(capitalized !== inputValue) {
              modelCtrl.$setViewValue(capitalized);
              modelCtrl.$render();
            }         
            return capitalized;
         }
         modelCtrl.$parsers.push(capitalize);
         capitalize($parse(attrs.ngModel)(scope)); // capitalize initial value
     }
   };
});

app.directive('passwordLength', function($timeout, $q, $http){
  return {
  require: 'ngModel',
  link: function(scope, elm, attr, model) {
            model.$asyncValidators.passwordLen = function() {
                console.log(model.$viewValue.length);
                if(model.$viewValue.length >= 4 && model.$viewValue.length <= 10){
                  model.$setValidity('passlen', true);
                  return $q.resolve();
                }else{
                  model.$setValidity('passlen', false);
                  return $q.reject();
                }
            };
        }
  }
});

app.directive("passwordVerify", function() {
    return {
        require: "ngModel",
        scope: {
            passwordVerify: '='
        },
        link: function(scope, element, attrs, ctrl) {
            scope.$watch(function() {
                var combined;

                if (scope.passwordVerify || ctrl.$viewValue) {
                    combined = scope.passwordVerify + '_' + ctrl.$viewValue;
                }
                return combined;
            }, function(value) {
                if (value) {
                    ctrl.$parsers.unshift(function(viewValue) {
                        var origin = scope.passwordVerify;
                        if (origin !== viewValue) {
                            ctrl.$setValidity("passwordVerify", false);
                            return undefined;
                        } else {
                            ctrl.$setValidity("passwordVerify", true);
                            return viewValue;
                        }
                    });
                }
            });
        }
    };
});

$(document).mouseup(function (e)
{
    var container = $("#responseDiv");
    var container2 = $("#responseDiv2");

    if (!container.is(e.target) // if the target of the click isn't the container...
        && container.has(e.target).length === 0 || !container2.is(e.target) // if the target of the click isn't the container...
        && container2.has(e.target).length === 0) // ... nor a descendant of the container
    {
        $("#responseDiv").hide();
        $("#responseDiv2").hide();
    }
});

app.controller('userSearchController',function($scope, $compile, $http, searchService, searchService2){ 
    var problemId = $("#problemId").val();
    $scope.search = function(){

        searchService.search($scope.keywords).then(function(response){
          console.log(response.data);
          if( !$("#searchInput").val() ){
              $("#responseDiv").hide();
            }else{
            $("#responseDiv").text("");

            $("#responseDiv").fadeIn(150);
            if(response.data.length === 0){
                $("#responseDiv").html("<div style='padding-top:6px;padding-bottom:6px;text-align:center'>No result found</div>");
            }else{
              for (var i = response.data.length - 1; i >= 0; i--) {
                  
                  var divDiv = "<div style='padding:10px' class='searchResults' ng-click='addMateFunction("+response.data[i].id+","+problemId+")'>"+response.data[i].name+" "+response.data[i].lastName+"</div>";
    
                  angular.element(document.getElementById('responseDiv')).append($compile(divDiv)($scope));
                  $scope.addMateFunction = function(userId, problemId){
                      $http({
                          method: 'POST',
                          url: '/home/api/application/addModerator',
                          data: {userId: userId, problemId: problemId}
                      }).then(function successCallback(response) {
                          console.log(response.data);
                          // var item = $("#menuSearchItem").text("aa");
                          $("#itemsHolder").append(" <div class='' id='menuSearchItem' style='border-bottom:2px solid red;max-width: 100px;height: 33px;background-color: #F3F3F4;border-radius: 3px; text-align: center;padding-top: 7px;float: left;margin-left: 10px;padding-left: 5px;padding-right:5px'>"+response.data.name +" "+response.data.lastName+"</div>");
                      }, function errorCallback(response) {
                          alert('ne valja');
                      });
                  };
                  
              }
            };
          }
        });
    };

    $scope.search2 = function(){
            
        searchService2.search($scope.keywords).then(function(response){
          console.log(response.data);
            if( !$("#top-search").val() ){
              $("#responseDiv2").hide();
            }else{

            $("#responseDiv2").text("");

            $("#responseDiv2").fadeIn(150);
            if(response.data.length === 0){
                $("#responseDiv2").html("<div style='padding-top:6px;padding-bottom:6px;text-align:center'>No result found</div>");
            }else{
              for (var i = response.data.length - 1; i >= 0; i--) {
                  
                  var divDiv = "<a href='/home/user/"+response.data[i].id+"'><div style='padding:10px;color:black' class='searchResults'>"+response.data[i].name+" "+response.data[i].lastName+"</div></a>";
    
                  angular.element(document.getElementById('responseDiv2')).append($compile(divDiv)($scope));
                  $scope.addMateFunction = function(userId, problemId){
                      $http({
                          method: 'POST',
                          url: '/home/api/application/addModerator',
                          data: {userId: userId, problemId: problemId}
                      }).then(function successCallback(response) {
                          console.log(response.data);
                          // var item = $("#menuSearchItem").text("aa");
                          $("#itemsHolder").append(" <div class='' id='menuSearchItem' style='border-bottom:2px solid red;max-width: 100px;height: 33px;background-color: #F3F3F4;border-radius: 3px; text-align: center;padding-top: 7px;float: left;margin-left: 10px;padding-left: 5px;padding-right:5px'>"+response.data.name +" "+response.data.lastName+"</div>");
                      }, function errorCallback(response) {
                          alert('ne valja');
                      });
                  };
                  
              }
            };
          }
        });

    };
  

});

app.controller('sendDirectMessageController', function($scope, $http){
  $scope.submitMessageForm = function(){
    var message2 = $scope.message;
    var id2 = $('#userID').val();
    alert(message2 + ' ' + id2);
    $http({
        method: 'POST',
        url: '/home/inbox/sendMessage',
        data: {message: message2, id: id2}
    }).then(function successCallback(response) {
        alert('radi');
      }, function errorCallback(response) {
        alert('ne valja');
    });
  }
});

app.service('searchService', function($http){
    return {
        search: function(keywords, problemId){
            console.log(keywords);
            console.log(problemId);
            
            return $http.post('/home/api/application/getusers', { "username" : keywords, "problemId" : problemId});
        }
    }
});

app.service('searchService2', function($http){
    return {
        search: function(keywords, problemId){
            console.log(keywords);
            console.log(problemId);
            
            return $http.post('/home/api/application/getusers2', { "username" : keywords, "problemId" : problemId});
        }
    }
});
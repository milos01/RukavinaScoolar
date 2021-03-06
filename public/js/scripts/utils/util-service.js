(function(angular){
app.factory('UtilService', function(){
    return {
        findMin: function(task){
        	var min = Number.MAX_SAFE_INTEGER;
            var minOffer;

            angular.forEach(task.offers, function(value, key) {
                if(value.price < min){
                  min = value.price;
                  minOffer = value;
                }
             })

            return minOffer;
        },
        hasMyOffer: function(task, user){
            var myOffer = false;
            angular.forEach(task.offers, function(value, key) {
                if (user.id === value.person_from) {
                    myOffer = value;
                }
            });

            return myOffer;
        },
        mainSolver: function(task, user){
            if (task.took === 1 && task.main_slovler === user.id) {
                return true;
            }
            return false;
        },
        STATUS: {
        	MIN_OFFER : {message: "Offer:"},
        	NO_OFFERS : {message: "No offers"},
        	UNDER_WORK : {message: "Under work..."},
        	FINISHED : {message: "Finished"},
        	WAITING_OFFERS : {message: "Waiting for offers"},
        	MY_OFFER : {message: "(You bidded)"}

        },

        timeDifference: function(task){
        	var countDownDate = new Date(task.time_ends_at).getTime();
        	var now = new Date().getTime();
        	var difference = countDownDate - now;
        	var days = Math.floor(difference / (1000 * 60 * 60 * 24));
          	var hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          	var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          	var seconds = Math.floor((difference % (1000 * 60)) / 1000);

        	// Find the distance between now an the count down date
        	return {
        		difference: difference,
        		days: days,
        		hours: hours,
        		minutes: minutes,
        		seconds: seconds
        	}

        },

        makePages: function (meta) {
            var pages = [];
            for(var i = 1; i <= meta.total_pages; i++){
                pages.push(i);
            }
            meta.paging = pages;
            return meta;
        }
    }
});
})(angular);
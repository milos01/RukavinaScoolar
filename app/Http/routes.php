<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/
    Route::get('/', ['middleware' => 'guest', function () {
    	return view('welcome');

	}]);
	Route::get('auth/{provider}', 'Auth\AuthController@redirectToProvider');
	Route::get('auth/{provider}/callback', 'Auth\AuthController@handleProviderCallback');
    Route::get('docs', function(){
        return View::make('docs.home.index');
    });
	Route::auth();
	Route::get('/api/application/getuserbyemail','UserController@getApiUsersEmail');
	Route::group(['middleware' => 'auth'], function () {
		Route::get('/', 'HomeController@index');

		//User routes
		Route::get('edit', 'UserController@editUser');
		Route::post('updateUser', 'UserController@updateUser');
		Route::get('user/{id}', 'UserController@showUserProfile');
		Route::post('updatePassword', 'UserController@updatePassword');

		//User api routes
		Route::get('api/application/user', 'UserController@getLoggedUser'); // getuser
		Route::get('api/application/user/{id}', 'UserController@findUserById'); // finduserbid
		Route::post('api/application/getusers','UserController@getApiUsers');
		Route::post('api/application/getusers2','UserController@getApiUsers2');

		//Problem routes
		Route::get('problem/{id}', 'ProblemController@showProblem');
		Route::get('problem/{id}/download', 'ProblemController@problemDownload');
    	Route::get('problem/{id}/reset', 'ProblemController@updateProblemExpireTime');
    	Route::put('api/application/problem/{id}/resetWaiting', 'ProblemController@resetWaiting');
    	Route::put('api/application/problem/{id}/inactive', 'ProblemController@inactiveProblem');
		Route::get('myproblem/{id}', 'ProblemController@showMyProblem');
		Route::get('takeProblem/{id}', 'ProblemController@takeProblem');
		Route::get('assigned', 'ProblemController@assigned');
		Route::get('newproblem', 'ProblemController@newProblem');
		Route::get('api/application/problem/{id}', 'ProblemController@getProblem');
		Route::post('api/application/addModerator', 'ProblemController@addMate');
		Route::post('api/application/deleteWorker', 'ProblemController@deleteWorker');
		Route::get('api/application/getuserproblems', 'ProblemController@getAllProblems');
		Route::post('api/application/newproblemsubmit', 'ProblemController@newproblemsubmit');
		Route::post('api/application/getuserproblemoffer', 'ProblemController@getproblemoffers');
		Route::get('api/application/getOneUserProblems', 'ProblemController@getOneUserProblems');
		// Route::post('api/application/getProblem', 'ProblemController@getProblem');
    	Route::post('api/application/acceptProblem', 'ProblemController@acceptProblem');

		//Uplaod routes
		Route::post('api/application/saveImage', 'UploadController@saveImage');
		Route::post('api/application/uploadProblem', 'UploadController@uploadProblem');
		Route::post('api/application/uploadSolution', 'UploadController@uploadSolution');
		Route::post('api/application/removeUploadedFile', 'UploadController@removeUploadedFile');

		//Payment routes
		Route::get('problem/{id}/payment/{pyid}', 'PaymentController@problemPaymentShow');
		Route::post('api/application/placeOffer', 'PaymentController@placeOffer');

    //Settings routes
    Route::get('settings', 'SettingsController@showSettingsPage')->name('showSettingsPage');
    Route::post('settings/category', 'SettingsController@addNewCategory')->name('addNewCategory');
    Route::delete('settings/category', 'SettingsController@deleteCategory')->name('deleteCategory');
    Route::put('settings/category', 'SettingsController@activateCategory')->name('activateCategory');
    Route::get('api/application/categories', 'SettingsController@getAllCategories');

		//Inbox/Messages routes
		Route::get('inbox', 'InboxController@showInbox');
		Route::get('inbox/{id}', 'InboxController@showUsersMessages');
		Route::post('inbox/sendMessage', 'InboxController@sendMessage');

		//Admin routes
		Route::group(['middleware' => 'admin'], function(){

			//Admin-User routes
			Route::get('manage', 'UserController@showManage');
			Route::get('manage/upgrade/{id}', 'UserController@upgradeAdmin');
			Route::get('manage/downgrade/{id}', 'UserController@donwgradeAdmin');
			Route::get('manage/deleteUser/{id}', 'UserController@deleteUser');
			Route::get('manage/activateUser/{id}', 'UserController@activateUser');
			Route::post('manage/addStaff', 'UserController@addStaff');
		});

		//Paypal routes
		// Route::get('checkout', 'PaypalController@checkout');
		// Route::get('getDone', 'PaypalController@getDone');
		// Route::get('all', 'PaypalController@all');

		//Braintree routes
		Route::get('api/application/generateToken', 'BraintreeController@generateToken');


	});

Route::auth();
Route::get('user/activation/{token}', 'Auth\AuthController@activateUser')->name('user.activate');
Route::get('privacy_policy', function(){
  return view('privacyPolicy');
})->name('privacyPolicy');

Route::get('customer_agreement', function(){
  return view('customerAgreement');
})->name('customerAgreement');

Route::get('/home', 'HomeController@index');

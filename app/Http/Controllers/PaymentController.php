<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Problem;
use App\Offer;
use App\User;
use Auth;
use App\Http\Requests;

class PaymentController extends Controller
{
    public function problemPaymentShow($problemId, $offerId){
    	$problem = Problem::findorFail($problemId);
    	$offer = Offer::with('personFrom')->findorFail($offerId);
    	// dd($offer);
    	$myMessagess = Auth::user()->fromMessages()->where('last', 1)->orWhere('user_to', Auth::user()->id)->where('last', 1)->groupBy('group_start','group_end')->orderBy('id', 'DESC')->get();
        $count = 0;
        foreach ($myMessagess as $key => $message) {
            if ($message->pivot->read == 0 and $message->pivot->user_to == Auth::id()) {
               $count++;
            }
        }
    	return view('payment')->with('problem', $problem)->with('myMessagesCount', $count)->with('offer', $offer);
    }

    public function placeOffer(Request $request){
    	$problemDesc = $request->description;
    	$problem = Problem::findorFail($request->id);
    	$price = $request->offer;

    	$offer = new Offer();
    	$offer->problem()->associate($problem);
    	$offer->personFrom()->associate(Auth::user());
        $offer->price = $price;
    	$offer->description = $problemDesc;
        $offer->save();

        return $offer;
    }

}

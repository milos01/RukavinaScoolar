<?php

namespace App;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use SoftDeletes;

    /**
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $dates = ['deleted_at'];
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'lastName', 'username', 'role_id', 'email', 'password', 'provider', 'provider_id', 'picture'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    public function is($role)
    {
        if ($this->role->name == $role)
        {
            return true;
        }
        return false;
    }

    /**
     * The roles that belong to the user.
     */
    public function role()
    {
        return $this->belongsTo('App\Role');
    }

    public function myProblems(){
        return $this->hasMany('App\Problem', 'person_from');
    }


    public function fromMessages()
    {
        return $this->belongsToMany('App\User', 'messages','user_from','user_to')->withPivot('created_at', 'message','read', 'id','last');
    }

    public function toMessages()
    {
        return $this->belongsToMany('App\User', 'messages','user_from','user_to')->withPivot('created_at', 'message','read', 'id', 'last');
    }

    public function problems()
    {
        return $this->belongsToMany('App\Problem', 'user_problem', 'user_id', 'problem_id')->withPivot('read')->withTimestamps();
    }

}

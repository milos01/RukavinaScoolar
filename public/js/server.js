var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(3000);
users = {};

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

function emailExists(email){
  return (email in users) ? true : false;
}

io.on('connection', function (socket) {
  socket.on('connect-user', function(data){
      socket.nick = data.email;
      users[socket.nick] = socket.id;
      console.log(users);
  });

  socket.on('updateTaskOffers', function (data) {
    if(emailExists(data.emailTo)){
      socket.broadcast.to(users[data.emailTo]).emit('updateTaskOffersEmit');
      socket.broadcast.to(users[data.emailTo]).emit('notifyUserEmit', {message: 'You recieved new offer!'});
    }
  }); 

  socket.on('updateAdminTime', function (data) {
    for (var i = data.emailTo.length - 1; i >= 0; i--) {
      if(emailExists(data.emailTo[i].email)){
        socket.broadcast.to(users[data.emailTo[i].email]).emit('updateAdminTimeEmit', {data: data.data});
      }
    }
  }); 

  socket.on('addToAssigned', function (data) {
    if(emailExists(data.emailTo)){
      socket.broadcast.to(users[data.emailTo]).emit('addToAssignedEmit', {data: data.data});
    }
  });  

  socket.on('updateProblemStatus', function (data) {
    if(emailExists(data.emailTo)){
      socket.broadcast.to(users[data.emailTo]).emit('updateProblemStatusEmit', {problem_id: data.problem_id});
    }
  });

  socket.on('addNewTask', function (data) {
    for (var i = data.emailTo.length - 1; i >= 0; i--) {
      if(emailExists(data.emailTo[i].email)){
        socket.broadcast.to(users[data.emailTo[i].email]).emit('addNewTaskEmit', {data: data.data.data});
      }
    }
  });

  socket.on('disconnect', function(){
    if(!socket.nick){
      return;
    }else{
      delete users[socket.nick];
    }
  });
});
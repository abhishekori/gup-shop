var express = require('express');
var app = express();

app.get("/",function(req,res){
	res.send("your app is running");
});


app.set('port', (process.env.PORT) || 5000)
// SPIN UP SERVER
app.listen(app.get('port'), function () {

  console.log('Running on port', app.get('port'))
})

const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.static('public'));
app.use(express.json());
app.use(cors());

// app.use('/', require('./routes/api'));
app.use('/', require('./routes/transcribe'));
// app.use('/', require('./routes/recorder'));

app.use(function(err,req,res,next){
    res.status(422).send({error: err.message});
});

app.listen(process.env.PORT || 4000, function(){
    console.log('Ready to Go!');
});

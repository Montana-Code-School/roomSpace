import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000
app.use(express.static('src/public'));

app.get('/',(req,res)=>{
  res.sendFile('index.html');
});

app.listen(port,()=>console.log("listening on port 3000"));

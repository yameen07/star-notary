
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);


    // Get data from levelDB with key (Promise)
    function getLevelDBData(key){
        
        return new Promise((resolve, reject) => {
            db.get(key,function(err,value){
                
                    if(err) reject(err);
                    else {
                
                        resolve(value);}
                });

        });
    }
    module.exports.getLevelDBData= getLevelDBData;

    // Add data to levelDB with key and value (Promise)
   function addLevelDBData(key, value) {
          return new Promise((resolve, reject)=>{
          db.put(key,value,function(err){
           if(err){
             console.log('Failed to submit Block ', err);
                    reject(err);
           }else{
            console.log('success to submit Block '); 
            resolve(value);}
           
          }); 
        });
    }
    module.exports.addLevelDBData= addLevelDBData;

    // Method that return the height
   function getHeight() {
        let i=-1;
        return new Promise((resolve, reject)=>{
            
            db.createKeyStream()
             .on('data', ()=> {
      // Count each object inserted
              i++;
              

             })
              .on('error', (err)=> {
    // reject with error
             console.log('unable to read data stream',err);
             reject(err);
            })
              .on('close', ()=> {
    //resolve with the count value
            
            resolve(i);
            });
        });
    }
    module.exports.getHeight= getHeight;


    // Get block by hash
   function getBlockByHash(hash) {
       
       let block = null;
       return new Promise(function(resolve, reject){
           db.createReadStream()
           .on('data', function (data) {
             let _block= JSON.parse(data.value);

               if(_block.hash === hash){
                   block = data.value;
               }
           })
           .on('error', function (err) {
               reject(err)
           })
           .on('close', function () {
               resolve(block);
           });
       });
   }
   module.exports.getBlockByHash= getBlockByHash;
  
  // get data with Address
   function getBlockByWalletAddress(address){
      let temp=[];
      return new Promise(function(resolve, reject){
        db.createReadStream()
        .on('data', function(data){
         let _block= JSON.parse(data.value);

          if(_block.body.address===address){

           temp.push(_block);
          }
        }).on('error',function(err){
          reject(err);
        }).on('close',function(){
          resolve(temp);
        });
      });

   }
   module.exports.getBlockByWalletAddress= getBlockByWalletAddress;

   // Get data from levelDB with height
  function getBlockByHeight(height){
      let temp= null;
      return new Promise(function(resolve, reject){
        db.createReadStream()
        .on('data', function(data){
         let _block= JSON.parse(data.value);

          if(_block.height==height){

           temp=_block;
          }
        }).on('error',function(err){
          reject(err);
        }).on('close',function(){
          resolve(temp);
        });
      });

   }
    module.exports.getBlockByHeight= getBlockByHeight;


  





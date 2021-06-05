
const Block= require('./BlockChain.js');
const SHA256= require('crypto-js/sha256');
const bitcoinmsg= require('bitcoinjs-message');
const hex2ascii= require('hex2ascii');
 
const fix = 'starRegistry';


class blockController{

constructor(app){
this.app=app;
this.TimeoutRequestsWindowTime = 5*60*1000;
this.block=[];
this.timeRequests= new Map();
this.mempool= new Map();
this.mempoolValid= new Map();

this.postRequestValidation();
this.postMessageSignature();
this.postNewBlock();
this.getStarsHash();
this.getStarsAddress();
this.getStarsHeight();

this.blockChainService= new Block.Blockchain();
}




postRequestValidation(){
//request validation
this.app.post("/requestValidation", (req, res) => { 
    if(this.timeRequests.get(req.body.address)){
    	//check mempool and return it
    	//getting validation window
    	let validationWindow= this.calculateValidationWindow(req);
    	let response= this.mempool.get(req.body.address);
    	response.validationWindow=validationWindow;
    	res.json(response);

    }else{
    //process a new request
    var self=this;
    let requestTimeout=setTimeout(function(){
     self.removeValidationRequest(req.body.address);
      }, this.TimeoutRequestsWindowTime );

    this.timeRequests.set(req.body.address,requestTimeout);
     
    //getiing validation window
    let validationWindow= this.calculateValidationWindow(req)
    let response= this.getRequestObject(req,validationWindow);
    //store in mempool
    this.mempool.set(req.body.address,response);
    res.json(response);
    }

  });}

postMessageSignature(){
//validate message signature
this.app.post('/message-signature/validate',(req,res)=>{
  if(req.body.address&&req.body.signature){
  	
  	//verify window time
  	if(this.timeRequests.get(req.body.address)==='nudefined'){
  		res.status('400');
  		res.json({error: 'expired window time for address'});
  		return;
  	}
    
    //verify whether it exists in the mempool
    let memPoolData= this.mempool.get(req.body.address);
    if(!memPoolData){
    	res.status('400');
  		res.json({error: 'invalid address wallet in the memory pool'});
  		return;
    }

    //verify the signature
    let isSigValid=this.verifySignature(req.body);
    let validationWindow= this.calculateValidationWindow(req)
    let validRequest= this.createValidRequest(true, memPoolData, validationWindow, isSigValid);

    if(isSigValid){
    	this.mempoolValid.set(req.body.address, validRequest);
    }

   res.json(validRequest);
  }else{
   res.json({error:'invalid address'});
  }


});
}

postNewBlock(){
//star information
this.app.post('/block',(req,res)=>{
	if(req.body.address&&req.body.star){
		if(!this.mempoolValid.get(req.body.address)){
			res.status('400');
  		res.json({error: 'invalid address and wallet signature'});
  		return;
		}
		
		let starbody=req.body;
		if(!starbody.star.story || !starbody.star.dec || !starbody.star.ra){
			res.status('400');
  		res.json({error: 'invalid star body'});
  		return;
		}

		starbody.star.story=Buffer(starbody.star.story).toString('hex');

		let block= new Block.Block(starbody);
		this.blockChainService.addBlock(block).then(_block =>{
			//remove address from mempool
			this.removeValidationRequest(req.body.address);
			res.json(block);
		}).catch(err=>{
			res.status('500');
  		res.json({error: 'cant add to blockchain'});
  		
		});

	}else{
		res.status('400');
  		res.json({error: 'invalid address'});
  	
	}
});
}


getStarsHash(){
//get star block by hash
this.app.get('/stars/hash::data',(req,res)=>{
	 if(!req.params.data){
    	res.status('400');
  		res.json({error: 'invalid hash address'});
  		return;
    }
	this.blockChainService.getByHash(req.params.data)
	.then(block=> {
		let blockdata= JSON.parse(block);
		blockdata.body.star.storyDecoded= hex2ascii(blockdata.body.star.story);
		res.json(blockdata);
	}).catch(err =>{
		res.status('500');
  		res.json({error: 'invalid block '});
  		return;
	})
});
}

//get star block by address
getStarsAddress(){
this.app.get('/stars/address::data',(req,res)=>{
	if(!req.params.data){
    	res.status('400');
  		res.json({error: 'invalid wallet address'});
  		return;
    }
	this.blockChainService.getByAddress(req.params.data)
	.then(block=> {
		block.forEach( blockdata=>{
		blockdata.body.star.storyDecoded= hex2ascii(blockdata.body.star.story);

	});
		res.json(block);
	}).catch(err =>{
		res.status('500');
  		res.json({error: 'invalid block address'});
  		return;
	})
});
}

//get star block by height
getStarsHeight(){
this.app.get('/block/:data',(req,res)=>{
	if(!req.params.data){
    	res.status('400');
  		res.json({error: 'invalid height'});
  		return;
    }
	this.blockChainService.getByHeight(req.params.data)
	.then(block=> {
	
		block.body.star.storyDecoded= hex2ascii(block.body.star.story);

	                
		res.json(block);
	}).catch(err =>{
		res.status('500');
  		res.json({error: 'invalid block height'});
  		return;
	});
});
}

//calculate validation window

calculateValidationWindow(req){
   let preres=this.mempool.get(req.body.address);
   let timeElapse=0;
   if(preres){
   	timeElapse=req.requestTimeStamp - preres.requestTimeStamp;
   }else{
   	timeElapse = (new Date().getTime().toString().slice(0,-3)) - req.requestTimeStamp;
   }
   
   let timeLeft = (this.TimeoutRequestsWindowTime/1000) - timeElapse;
   return timeLeft;

}

removeValidationRequest(address){
	this.timeRequests.delete(address);
	this.mempool.delete(address);
	this.mempoolValid.delete(address);
}

getRequestObject(req,validationWindow){
	let requestObject={walletAddress:'',requestTimeStamp:'',message:'', validationWindow:''};
	requestObject.walletAddress=req.body.address;
	requestObject.requestTimeStamp=req.requestTimeStamp;
	requestObject.message=(requestObject.walletAddress+':'+req.requestTimeStamp+':'+fix);
	requestObject.validationWindow=validationWindow;
	return requestObject;
}





//verify the signature of query based on address and signature
verifySignature(reqq){
	if(reqq.address && reqq.signature){
		let memdata=this.mempool.get(reqq.address); 
		console.log(memdata.message);
	    let response= bitcoinmsg.verify(memdata.message, reqq.address, reqq.signature);
	    return response;
	}return false;
}

createValidRequest(isRegisterStart, poolData, validationWindow, isValid){
	let validRequestObject={};
	validRequestObject.registerStart= isRegisterStart;
	validRequestObject.status={};
	validRequestObject.status.address= poolData.walletAddress;
	validRequestObject.status.message= poolData.message;
   validRequestObject.status.validationWindow= validationWindow;
   validRequestObject.status.messageSignature= isValid;
   return validRequestObject;
}






/**
     * Help method to inizialized Mock dataset, adds 10 test blocks to the blocks array
     */
    initializeMockData() {
        if(this.blocks.length === 0){
            for (let index = 0; index < 10; index++) {
                let blockAux = new Block.Block(`Test Data #${index}`);
                blockAux.height = index;
                blockAux.hash = SHA256(JSON.stringify(blockAux)).toString();
                this.blocks.push(blockAux);
            }
        }
    }
}

module.exports=(app)=>{return new blockController(app);}

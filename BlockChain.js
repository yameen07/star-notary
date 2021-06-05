class Block {
    constructor(data){
         this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}
module.exports.Block= Block;


const SHA256 = require('crypto-js/sha256');
const db= require('./LevelSandbox.js');

class Blockchain {
  
    constructor() {
        this.generateGenesisBlock();
    }
   
    // Get block height, it is a helper method that return the height of the blockchain
    getBlockHeight() {
      return new Promise((resolve,reject)=>{
        db.getHeight().then((height)=>{
        
            resolve(height);

        }).catch((err) =>{
        
            reject(err);
        });
      });
    }


    // Get Block By Height
    getBlock(height) {
        return new Promise((resolve,reject)=>{
            db.getLevelDBData(height).then((value)=>{
                resolve(JSON.parse(value));
            }).catch((err)=>{
                reject(err);
            });
        });
    }

     // Get Block By Hash
    getByHash(hash) {
        return new Promise((resolve,reject)=>{
            db.getBlockByHash(hash).then(block =>{
                resolve(block);
            }).catch((err)=>{
                reject(err);
            });
        });
    }

   // Get Block By Height
    getByHeight(height) {
        return new Promise((resolve,reject)=>{
            db.getBlockByHeight(height).then(block =>{
                resolve(block);
            }).catch(err=>{
                reject(err);
            });
        });
    }

     // Get Block By address
    getByAddress(address) {
        return new Promise((resolve,reject)=>{
            db.getBlockByWalletAddress(address).then(blocks =>{
                resolve(blocks);
            }).catch((err)=>{
                reject(err);
            });
        });
    }



    // Add new block
    addBlock(newBlock) {
        return new Promise((resolve,reject)=>{
            this.getBlockHeight().then((height)=>{
                
                    newBlock.height=height+1;
                
                    // UTC timestamp
                    newBlock.time = new Date().getTime().toString().slice(0,-3);


                    this.getBlock(height).then((block)=>{
                    newBlock.previousBlockHash=block.hash;

                    // Block hash with SHA256 using newBlock and converting to a string
                    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                    // Adding block object to chain
                    db.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString())
                    .then((value)=>{
                    if(value){
                         console.log('block created');
                         resolve(value);
                    }else{
                         console.log('error adding block');
                         reject(undefined);
                        }
                     });

                    }).catch((err) => {
                    reject('Unable to get previous block! => block not added.', err);
                });
                
            }).catch((err)=>{
                        reject('unable to get block height',err);
                    });
        
        });
     }


    async generateGenesisBlock(){ 
        const h=(await this.getBlockHeight());
        if(h<0){
    let gb=(new Block("First block in the chain - Genesis block"));

      gb.time = new Date().getTime().toString().slice(0,-3);
    
    // Block hash with SHA256 using newBlock and converting to a string
    gb.hash = SHA256(JSON.stringify(gb)).toString();
    // Adding block object to chain
    db.addLevelDBData(0, JSON.stringify(gb).toString())
    .then((value)=>{
        if(value){
            console.log('genesis block created');
        }else{
            console.log('error adding genesis block');
        }
    });
    }
   }



    // Validate if Block is being tampered by Block Height
    validateBlock(height) {
        return new Promise((resolve,reject)=>{
            this.getBlock(height).then((block)=>{
                let blockhash= block.hash;
                block.hash='';
                let validblockhash = SHA256(JSON.stringify(block)).toString();
                if(blockhash==validblockhash){
                    console.log('valid block')
                    resolve(true);
                }else{
                    reject('invalid hash');
                }
            }).catch((err)=>{
                console.log('unable to get block '+height);
                reject(err);
            });
        });
    }

    async validateEachBlock(height){
        let errorLog=[];
        for (let i=0; i<= height;i++){
            try{
                await this.validateBlock(i);//use blockheight
            } catch (err){
                console.log('validate each block:',err);
                errorLog.push(i);
            }
        }return errorLog;
    }

    async validateBlockConnectivity(height){
        let erorLog=[];
        for (let i=0;i<height;i++){
            try{
                let currentBlock= await this.getBlock(i);
                let nextBlock= await this.getBlock(i+1);
                if(currentBlock.hash!== nextBlock.previousBlockHash){
                    errorLog.push(i);
                }
            }catch(err){
                console.log('validateBlockConnectivity: unable to recieve.',err);
            }
        }return errorLog;
    }

    // Validate Blockchain
    async validateChain() {
        let errorLog=[];

        try{
               errorLog.concat(errorLogBuf);
            errorLogBuf= await this.validateEachBlock(blockheight);
            errorLog.concat(errorLogBuf);
            }
            catch(err){
                console.log('validateChain:',err);
            }
            return errorLog;
    }

    
   
}

module.exports.Blockchain = Blockchain;

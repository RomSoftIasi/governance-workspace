
function generatePassword(){
    const passLength = 20;
    const result           = [];
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < passLength; i++ ) {
        result.push(characters.charAt(Math.floor(Math.random() *
            charactersLength)));
    }
    return result.join('');
}

function createAdmAcc(callback){

    const keythereum = require('keythereum');
    const params = {keyBytes: 32, ivBytes: 16};
    const dk = keythereum.create(params);
    const password = generatePassword();
// Note: if options is unspecified, the values in keythereum.constants are used.
    const options = {
        kdf: "scrypt", // "pbkdf2" or "scrypt" to use
        cipher: "aes-128-ctr",
        kdfparams: {
            c: 262144,
            dklen: 32,
            prf: "hmac-sha256"
        }
    };

    // synchronous
    const keyObject = keythereum.dump(password, dk.privateKey, dk.salt, dk.iv, options);

    keythereum.exportToFile(keyObject, 'keystore',(output) => {
        if (output instanceof Error){
            console.log('Failed to generate data key store', output);
            return callback(output);
        }
        console.log('Data key store generated.');
        storeAdmAccToFile({
            privateKey : dk.privateKey,
            password: password,
            account: keyObject.address,
            keystoreFile: output
        })
        return callback(undefined);
    });
}

function storeAdmAccToFile(admAccData){
    const fs = require('fs');
    const data = JSON.stringify(admAccData);
    fs.writeFileSync('./stages/AdmAcc/admAcc.json',data);
}


module.exports = {
    createAdmAcc
}



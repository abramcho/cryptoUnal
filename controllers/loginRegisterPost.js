const {verify_user, verify_email , add_user_db} = require('../models/connectUserDb')
const {createEthereumWallet} = require('../utils/createWallet')
const {decrypt_wallet} = require('../utils/decrypt_wallet')
const {consultBalance} = require('../utils/getBalance')
const {getHistorial} = require('../utils/getHistorial')
const {getHistorical} = require('../utils/historicalPrice')
const {hashPassword, comparePassword} = require('../utils/hashPassword')
const {add_Wallet, get_Wallet} = require('../models/connectWalletDb')
const {update_transaction, get_transaction} = require('../models/retrieveTransactionDb')
const fs = require('fs').promises;

// La función getUserLogin es asincrona y espera el resultado de la promesa de verify_user
const getUserLogin = async (req, res) => {
    web3.eth.accounts.wallet.clear();
    const { email, password } = req.body;   
    let result = await verify_user(email); 
    
    if (result[0].length !== 0 ){                      
        let compare = await comparePassword(password, result[0][0].hash_password); // Verificar que la contraseña ingresada corresponda con el hash de la db
        if(compare){        
                
            req.session.username =  result[0][0].username;                
            req.session.iduser = result[0][0].iduser;        
            let cartera = await get_Wallet(req.session.iduser);
            cartera = cartera[0][0].wallet_address;            
            cartera = await decrypt_wallet(cartera, password);             
            req.session.publicKey = cartera[0].address;
            req.session.privateKey = cartera[0].privateKey.slice(2);
            req.session.balance = await consultBalance(req.session.publicKey);
            req.session.transaction=await getHistorial(req.session.publicKey);
            req.session.historical= await getHistorical();
       
            
            // Recuperar las transacciones de la base de datos en caso de que no se pueda acceder a la api
            if(req.session.transaction === "Error en la consulta"){
                try{
                    let transaction = await get_transaction(req.session.iduser);
                    console.log(transaction);
                    req.session.transaction = transaction[0][0].transactions_content.content;
                }
                catch(error){
                    req.session.transaction = {};
                    update_transaction(req.session.iduser, req.session.transaction);                        
                }                
            }
            else{
                update_transaction(req.session.iduser, req.session.transaction);
            }           
            
            res.status(200).redirect('/home?authenticated=true');      
        }       
    }
    else{
        res.status(401).redirect('/home')
    }    
}

const registerUser = async(req,res) => {
    const {name, email, password, password_confirmation, bitcoin, ethereum} = req.body;   

    result = await verify_email(email);    
    if (result[0].length === 0){
        if (password !== password_confirmation){
            res.send('<script> alert("The password confirmation does not match"); window.location.href = "/register"; </script>');        
        }        
        else if (password.length < 8){
            res.send('<script> alert("The password should be longer than 8 characters"); window.location.href = "/register"; </script>');        
        }
        else{
            const hashedPassword = await hashPassword(password)
            let id = await add_user_db(name,email,hashedPassword);                     
            let cartera;
            if(ethereum === 'on'){                
                cartera = await createEthereumWallet(password);
                id = id[0][0].iduser;                
                console.log(cartera);
                await add_Wallet(id,'eth', cartera[0]);
                res.send('<script> alert("The account has been created with an ethereum wallet encrypted using your account password. Don not share it!"); window.location.href = "/"; </script>');           
            }
            else{
                res.send('<script> alert("The account has been created with no wallets"); window.location.href = "/"; </script>');}           
            
        }
    }else
        res.send('<script> alert("The email is already registered"); window.location.href = "/register"; </script>');    
}

module.exports = {getUserLogin, registerUser}; 
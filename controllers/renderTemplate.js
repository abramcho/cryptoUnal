const { render } = require('express/lib/response');
const { getBalance } = require('../utils/getBalance')

const renderLogin = (req, res) => {
    req.session.destroy();
    // console.log(req.session);
    res.render('index', {
        title: `Welcome to cryptoUNAL`
    })
}

const renderRegister = (req, res) => {
    res.render('register', {
        title: `User registration`,
        confirmationError: "true",
        emailError: "false"
    })
}

const renderTransaction = (req, res) => {
    // console.log('TRANSACTIONS', req.session.publicKey, req.session.privateKey)
    res.render('transaction', {
        title: 'Transactions',
        publicKey: req.session.publicKey,
        privateKey: req.session.privateKey
    })
}

const renderProfile = (req, res) => {
    // console.log('TRANSACTIONS', req.session.publicKey, req.session.privateKey)
    res.render('profile', {
        title: 'profile',
        publicKey: req.session.publicKey,
        privateKey: req.session.privateKey,
        password: req.session.password
    })
}

const renderNewEmail = (req, res) => {
    res.render('newEmail', {
        title: 'Update Email',
        password: req.session.password
    })
}

const renderNewUsername = (req, res) => {
    res.render('newUsername', {
        title: 'Update Username',
        username: req.session.username
    })
}

const renderHomepage = (req, res) => {
        if (req.query.authenticated === 'true' && req.session.iduser){        
            //console.log(req.session);
            // console.log(req.session.transaction);
            res.render('home' , {            
                title: 'Welcome',            
                name: req.session.username,
                balance:  req.session.balance,
                transactions: req.session.transaction,
                historical: req.session.historical,
                last_value_eth: req.session.historical[1][req.session.historical[1].length -1]
        })        
    }
    else{
        res.send('<script> alert("The user does not exist or you entered a wrong password"); window.location.href = "/"; </script>');  
    }
    
}



module.exports = { renderLogin, renderRegister, renderTransaction, renderHomepage, renderProfile, renderNewEmail, renderNewUsername }
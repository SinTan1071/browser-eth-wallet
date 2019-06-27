'use strict'

// const isBrowser = typeof process === "undefined" || !process.nextTick || Boolean(process.browser)
// const keythereum = isBrowser ? require("keythereum-spa") : require("keythereum")
const keythereum = require("keythereum-spa")
const Tx = require('ethereumjs-tx')
const bip39 = require("bip39")
const Web3 = require('web3')
const prefix0x = "0x"
const dataPrefix = "70a08231000000000000000000000000"
const CHINESE_SIMPLIFIED_WORDLIST = require('./chinese.json')

module.exports = Wallet

function Wallet(web3ProviderHost) {
    // this.web3ProviderHost = web3ProviderHost
    if (typeof this.web3 !== 'undefined') {
        this.web3 = new Web3(this.web3.currentProvider)
    } else {
        this.web3 = new Web3(new Web3.providers.HttpProvider(web3ProviderHost))
    }
}

/**
 * 创建账户
 * @param {string=} password 
 * @return {Promise} resolve {object=} keyObject 带有公钥地址的对象， mnemonic 助记词
 */
Wallet.prototype.createAccount = function (password) {
    return new Promise(function (resolve, reject) {
        if (!password) reject(new Error("password is required!!"))
        var words = bip39.generateMnemonic(null, null, CHINESE_SIMPLIFIED_WORDLIST)
        // var privateKey = bip39.mnemonicToSeedHex(words).slice(0, 64)
        var privateKey = bip39.mnemonicToEntropy(words, CHINESE_SIMPLIFIED_WORDLIST) + bip39.mnemonicToSeedHex(words).slice(0, 32)
        var keyObject = getKeyObject(privateKey, password)
        resolve({
            keyObject: keyObject,
            mnemonic: words
        })
    })
}

/**
 * 密码鉴权
 * @param {string=} password 
 * @param {object=} keyObject 
 * @return {Promise} resolve {string=} 私钥
 */
// Wallet.prototype.passwordAuth = function (password, keyObject, callback) {
Wallet.prototype.passwordAuth = function (password, keyObject) {
    // if (isFunction(callback)) return keythereum.recover(password, keyObject, callback)
    return new Promise(function (resolve, reject) {
        if (!password || !keyObject) reject(new Error("password keyObject are required!!"))
        try {
            var res = keythereum.recover(password, keyObject)
            resolve(res.toString("hex"))
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * 助记词恢复账户
 * @param {string=} words 
 * @param {string=} newpassword 
 * @param {object=} keyObject 
 * @return {Promise} resolve {object=} keyObject 带有公钥地址的对象
 */
Wallet.prototype.mnemonicRecover = function (words, newpassword/*, keyObject*/) {
    return new Promise(function (resolve, reject) {
        if (!words || !newpassword /*|| !keyObject*/) reject(new Error("words newpassword keyObject are required!!"))
        // var privateKey = bip39.mnemonicToSeedHex(words).slice(0, 64)
        var privateKey = bip39.mnemonicToEntropy(words, CHINESE_SIMPLIFIED_WORDLIST) + bip39.mnemonicToSeedHex(words).slice(0, 32)
        var recoverKeyObject = getKeyObject(privateKey, newpassword)
        // if (recoverKeyObject.address != keyObject.address) reject(new Error("wrong mnemonic words !!"))
        resolve({
            keyObject: recoverKeyObject
        })
    })

}

/** 
 * 获取以太币
 * @param {string=} address
 * @return {Promise} resolve {string=} 以太币的数额
 */
// Wallet.prototype.getEthBalance = function (address, callback) {
Wallet.prototype.getEthBalance = function (address) {
    // if (callback && !isFunction(callback)) throw new Error("callback must be a function !!")
    var that = this
    return new Promise(function (resolve, reject) {
        if (!address) reject(new Error("address is required!!"))
        that.web3.eth.getBalance(formatWeb3Hex(address), function (err, res) {
            err ? reject(err) : resolve(res)
        })
    })
}

/**
 * 获取erc20代币
 * @param {string=} address 
 * @param {string=} contract  
 * @return {Promise} resolve {string=} 代币数额
 */
// Wallet.prototype.getErc20Balance = (address, contract, decimals, callback) {
Wallet.prototype.getErc20Balance = function (address, contract) {
    // if (callback && !isFunction(callback)) throw new Error("callback must be a function !!")
    var that = this
    return new Promise(function (resolve, reject) {
        if (!address || !contract) reject(new Error("address contract are required!!"))
        var obj = {
            from: formatWeb3Hex(address),
            to: formatWeb3Hex(contract),
            data: formatWeb3Hex(dataPrefix + address)
        }
        that.web3.eth.call(obj, function (err, result) {
            if (!err) {
                result = result.replace(prefix0x, "")
                var balance = scale16to10(result)
                resolve(balance)
                // var balance = new Number(parseInt(result, 16))
                // var balance = new Number(parseInt(result, 16) / Math.pow(10, decimals))
                // if (callback) callback(balance)
            } else {
                reject(err)
            }
        })
    })
}

/**
 * 发起一笔以太币交易
 * @param {string=} fromAddress 
 * @param {string=} toAddress 
 * @param {number=} value 
 * @param {string=} privateKey 
 * @return {Promise} resolve {string=} 交易的哈希
 */
// Wallet.prototype.sendEthTransaction = function (fromAddress, toAddress, value, gas, privateKey, callback) {
Wallet.prototype.sendEthTransaction = function (fromAddress, toAddress, value, privateKey) {
    // if (callback && !isFunction(callback)) throw new Error("callback must be a function !!")
    var that = this
    var gasPrice = 0.000000001
    return new Promise(function (resolve, reject) {
        if (!fromAddress || !toAddress || !value || !privateKey) reject(new Error("fromAddress toAddress value privateKey are required!!"))
        // if (!fromAddress || !toAddress || !value || !gas || !privateKey) reject(new Error("fromAddress toAddress value gas privateKey are required!!"))
        // if (gas < gasPrice) reject(new Error("low gas, you should give more than 0.00001 gas"))
        // var gasLimit = gas / gasPrice
        var gasLimit = 300000
        value = scale10to16(value * Math.pow(10, 18))
        that.web3.eth.getTransactionCount(formatWeb3Hex(fromAddress), function (err, nonce) {
            if (!err) {
                var rawTx = {
                    nonce: nonce,
                    gasPrice: formatWeb3Hex(scale10to16(gasPrice * Math.pow(10, 18))),
                    gasLimit: formatWeb3Hex(scale10to16(gasLimit)),
                    to: formatWeb3Hex(toAddress),
                    value: formatWeb3Hex(value),
                    // data: ''
                }
                var tx = new Tx(rawTx)
                var bufferPk = new Buffer(privateKey, 'hex')
                tx.sign(bufferPk)
                var serializedTx = tx.serialize()
                that.web3.eth.sendSignedTransaction(formatWeb3Hex(serializedTx.toString('hex')), function (err, hash) {
                    err ? reject(err) : resolve(hash)
                })
            } else {
                reject(err)
            }
        })
    })
}

/**
 * 发起一笔erc20代币币交易
 * @param {string=} fromAddress 
 * @param {string=} toAddress 
 * @param {string=} contract 
 * @param {number=} value 
 * @param {number=} gas 
 * @param {string=} privateKey 
 * @return {Promise} resolve {string=} 交易的哈希
 */
// Wallet.prototype.sendErc20Transaction = function (fromAddress, toAddress, contract, value, gas, privateKey, callback) {
Wallet.prototype.sendErc20Transaction = function (fromAddress, toAddress, contract, value, privateKey) {
    // if (callback && !isFunction(callback)) throw new Error("callback must be a function !!")
    var that = this
    var gasPrice = 0.000000001
    return new Promise(function (resolve, reject) {
        if (!fromAddress || !toAddress || !contract || !value || !privateKey) reject(new Error("fromAddress toAddress contract value privateKey are required!!"))
        // if (!fromAddress || !toAddress || !contract || !value || !gas || !privateKey) reject(new Error("fromAddress toAddress value gas privateKey are required!!"))
        // if (gas < gasPrice) reject(new Error("low gas, you should give more than 0.00001 gas"))
        // var gasLimit = gas / gasPrice
        var gasLimit = 300000
        var functionSig = that.web3.utils.sha3("transfer(address,uint256)").substr(2, 8)
        value = scale10to16(value * Math.pow(10, 18))
        that.web3.eth.getTransactionCount(formatWeb3Hex(fromAddress), function (err, nonce) {
            if (!err) {
                var rawTx = {
                    nonce: nonce,
                    gasPrice: formatWeb3Hex(scale10to16(gasPrice * Math.pow(10, 18))),
                    gasLimit: formatWeb3Hex(scale10to16(gasLimit)),
                    // 注意这里是代币合约地址    
                    to: formatWeb3Hex(contract),
                    from: formatWeb3Hex(fromAddress),
                    // data的组成，由：0x + 要调用的合约方法的function signature + 要传递的方法参数，每个参数都为64位(对transfer来说，第一个是接收人的地址去掉0x，第二个是代币数量的16进制表示，去掉前面0x，然后补齐为64位)
                    data: formatWeb3Hex(functionSig + addPreZero(toAddress) + addPreZero(value))
                }
                var tx = new Tx(rawTx)
                var bufferPk = new Buffer(privateKey, 'hex')
                tx.sign(bufferPk)
                var serializedTx = tx.serialize()
                that.web3.eth.sendSignedTransaction(formatWeb3Hex(serializedTx.toString('hex')), function (err, hash) {
                    err ? reject(err) : resolve(hash)
                })
            } else {
                reject(err)
            }
        })
    })
}

/** 
 * 查看交易
 * @param {string=} txHash
 * @return {Promise} resolve 交易结果
 */
// Wallet.prototype.getTransaction = function (txHash, callback) {
Wallet.prototype.getTransaction = function (txHash) {
    // if (callback && !isFunction(callback)) throw new Error("callback must be a function !!")
    var that = this
    return new Promise(function (resolve, reject) {
        if (!txHash) reject(new Error("txHash is required!!"))
        that.web3.eth.getTransaction(txHash, function (err, result) {
            err ? reject(err) : resolve(result)
        })
    })
}

// 生成公钥地址
function getKeyObject(privateKey, password) {
    if (!privateKey) throw new Error("privateKey is required !!")
    var params = {
        keyBytes: 32,
        ivBytes: 16
    }
    var dk = keythereum.create(params)
    var options = {
        kdf: "pbkdf2",
        cipher: "aes-128-ctr",
        kdfparams: {
            c: 262144,
            dklen: 32,
            prf: "hmac-sha256"
        }
    }
    password = password || ''
    return keythereum.dump(password, privateKey, dk.salt, dk.iv, options)
}

// 补齐64位，不够前面用0补齐
function addPreZero(num) {
    var t = (num + '').length,
        s = ''
    for (var i = 0; i < 64 - t; i++) {
        s += '0'
    }
    return s + num
}

// 格式化web3请求参数
function formatWeb3Hex(str) {
    return havePrefix0x(str) ? str : prefix0x + str
}

// 16进制转10进制
function scale16to10(num16) {
    return parseInt(num16, 16)
}

// 10进制转16进制
function scale10to16(num10) {
    return parseInt(num10).toString("16")
}

// 判断是否有prefix
function havePrefix0x(str) {
    return str.slice(0, 2) == prefix0x
}

// 判断是否为函数
function isFunction(f) {
    return typeof f === "function"
}
const Wallet = require('../lib/Wallet')
const expect = require('chai').expect
const assert = require('assert')
const wal = new Wallet("https://rinkeby.infura.io/6e4c0183d45e45d681bc94da2b751801")
// const wal = new Wallet("http://localhost:8545")
let keyObject = {
    address: '6df0a1724cac1e1d82425066694c1fe633e949bf',
    crypto: {
        cipher: 'aes-128-ctr',
        ciphertext: '430a6cde97217e43c0a19e3907a60ec9df07d5f3c2b39ffa4d8ee33811bdb8f0',
        cipherparams: {
            iv: 'b008e3eacdfc97f652466d510db904dc'
        },
        mac: 'a7132fd1beff669bfbc08a46be90b3f5674200604aff38a5c5d3e9b259fd8415',
        kdf: 'pbkdf2',
        kdfparams: {
            c: 262144,
            dklen: 32,
            prf: 'hmac-sha256',
            salt: 'f3976d6963d2fe48b2b8fcfae03d31476fe84452ea65d8a7b4bee51743b5a179'
        }
    },
    id: 'ac452a7f-bc58-4298-b8e3-4bf070a86901',
    version: 3
}
let words = "wasp shuffle brush wife post above lounge couch wood shoe unlock napkin"
let erc20Contract = '41bedac4687adf0da84aed0df4ce1b9304ac1d88' // 个人测试代币SYB
let toAddress = "7d9e28d55825de6db54a15d0657775273661d947"

describe('创建账户', function () {
    it('createAccount', function () {
        let password = "123qwe"
        return wal.createAccount(password).then(res=>{
            console.log("[result] ---", res)
            assert.ok(true)
        })
    })
})

describe('密码鉴权', function () {
    it('passwordAuth !@#123qwe pass', function () {
        let password = "!@#123qwe"
        return wal.passwordAuth(password, keyObject).then(res => {
            console.log("[result] ---", res)
            assert.ok(true)
        }).catch(e => {
            console.log("[error] ---", e.toString())
            assert.ok(false)
        })
    })

    it('passwordAuth 6666666 failed', function () {
        let password = "6666666"
        return wal.passwordAuth(password, keyObject).then(res => {
            console.log("[result] ---", res)
            assert.ok(false)
        }).catch(e => {
            console.log("[error] ---", e.toString())
            assert.ok(true)
        })
    })
})

describe('助记词恢复账户', function () {
    it('mnemonicRecover failed with wrong words', function () {
        let newpassword = "6666666"
        return wal.mnemonicRecover("wrong words", newpassword, keyObject).then(res=>{
            console.log("[res] ---", res)
            assert.ok(false)
        }).catch(e=>{
            console.log("[error] ---", e.toString())
            assert.ok(true)
        })
    })

    it('mnemonicRecover pass', function () {
        let newpassword = "6666666"
        return wal.mnemonicRecover(words, newpassword, keyObject).then(res=>{
            console.log("[old keyObject] ---", keyObject)
            keyObject = res.keyObject
            console.log("[new keyObject] ---", keyObject)
            expect(keyObject).to.be.deep.equal(res.keyObject)

            wal.passwordAuth(newpassword, keyObject).then(res => {
                console.log("[result] ---", res)
                assert.ok(true)
            }).catch(e => {
                console.log("[error] ---", e.toString())
                assert.ok(false)
            })

        })

    })
})

describe('获取以太币', function () {
    it('getEthBalance from address before', function () {
        return wal.getEthBalance(keyObject.address).then(res => {
            console.log("[result] ---", res)
            assert.ok(true)
        }).catch(e => {
            console.log("[error] ---", e.toString())
            assert.ok(false)
        })
    })

    it('getEthBalance to address before', function () {
        return wal.getEthBalance(toAddress).then(res => {
            console.log("[result] ---", res)
            assert.ok(true)
        }).catch(e => {
            console.log("[error] ---", e.toString())
            assert.ok(false)
        })
    })
})

describe('获取erc20代币', function () {
    it('getErc20Balance', function () {
        return wal.getErc20Balance(keyObject.address, erc20Contract).then(res => {
            console.log("[result] ---", res)
            assert.ok(true)
        }).catch(e => {
            console.log("[error] ---", e.toString())
            assert.ok(false)
        })
    })
})

describe('发起一笔以太币交易', function() {
    it('sendEthTransaction', function () {
        let password = "6666666"
        let value = 1.2
        this.timeout(5000)
        return wal.passwordAuth(password, keyObject).then(res => {
            wal.sendEthTransaction(keyObject.address, toAddress, value, res).then(res => {
                console.log("[result hash] ---", res)
                assert.ok(true)
            }).catch(e => {
	            console.log("[error] ---", e.toString())
	            assert.ok(false)
	        })
        }).catch(e => {
            console.log("[error] ---", e.toString())
            assert.ok(false)
        })
    })

    it('getEthBalance from address after', function () {
        return wal.getEthBalance(keyObject.address).then(res => {
            console.log("[result] ---", res)
            assert.ok(true)
        }).catch(e => {
            console.log("[error] ---", e.toString())
            assert.ok(false)
        })
    })

    it('getEthBalance to address after', function () {
        return wal.getEthBalance(toAddress).then(res => {
            console.log("[result] ---", res)
            assert.ok(true)
        }).catch(e => {
            console.log("[error] ---", e.toString())
            assert.ok(false)
        })
    })
})

describe('发起一笔erc20代币交易', function () {
    it('sendErc20Transaction', function () {
        let password = "6666666"
        let value = 66
        this.timeout(5000)
        return wal.passwordAuth(password, keyObject).then(res => {
            wal.sendErc20Transaction(keyObject.address, toAddress, erc20Contract, value, res).then(res => {
                console.log("[result hash] ---", res)
                assert.ok(true)
            }).catch(e => {
	            console.log("[error] ---", e.toString())
	            assert.ok(false)
	        })
        }).catch(e => {
            console.log("[error] ---", e.toString())
            assert.ok(false)
        })
    })

    it('sendErc20Transaction from address after', function () {
        return wal.getErc20Balance(keyObject.address, erc20Contract).then(res => {
            console.log("[result] ---", res)
            assert.ok(true)
        }).catch(e => {
            console.log("[error] ---", e.toString())
            assert.ok(false)
        })
    })

    it('sendErc20Transaction to address after', function () {
        return wal.getErc20Balance(toAddress, erc20Contract).then(res => {
            console.log("[result] ---", res)
            assert.ok(true)
        }).catch(e => {
            console.log("[error] ---", e.toString())
            assert.ok(false)
        })
    })
})

describe('查看交易', function () {
    it('getTransaction right', function () {
        let rightTxHash = "0xe7165a6ea3f4f831c1fc1ca0df4ddc01cb7b5032e86bf3616919f6c825bc586d"
        return wal.getTransaction(rightTxHash).then(res => {
            console.log("[result] ---", res)
            assert.ok(true)
        }).catch(e => {
            console.log("[error] ---", e.toString())
            assert.ok(false)
        })
    })

    it('getTransaction wrong', function () {
        let wrongTxHash = "0xeddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd"
        return wal.getTransaction(wrongTxHash).then(res => {
            console.log("[result] ---", res)
            assert.ok(true)
        }).catch(e => {
            console.log("[error] ---", e.toString())
            assert.ok(false)
        })
    })
})
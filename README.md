# BrowserEthereumWallet
一个基于以太坊web3的OnChain轻钱包

## 安装

```ssh
$ sudo npm i browser-eth-wallet
```

或者您可以使用dist目录下的打包好的压缩包，甚至您可以自己使用webpack来进行打包

```ssh
$ webpack
```

然后在.html文件的脚本中这样引入：

```html
<script src="dist/browser-eth-wallet.min.js"></script>
```

## 单元测试

您可以打开test目录，使用[mocha](https://mochajs.org/)来进行单元测试，或者打开wallet.test.html文件进行测试

## 使用

* 首先你需要一个以太坊的节点，搭配以太坊 [geth](https://geth.ethereum.org/) 使用，或者（推荐）使用 [infura](https://infura.io/)

```javascript
const Wallet = require('browser-eth-wallet')
const wallet = new Wallet("your provider host")
```

或者

```html
<script>
    var wallet = new Wallet('your provider host')
    console.log("wallet web3 version", wallet.web3.version)
</script>
```

## API调用

> ### 写在前面
> > * 友情提醒
> > 
> > 对于刚入手开发区块链钱包的童鞋，可以先了解下市面上的钱包产品如何工作的，然后可以扩展下自己的思路，下面推荐一块钱包产品，可以自己玩玩看（需要谷歌浏览器和科学上网  &#x1F60E; ）
> > 
> > > [MetaMask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=zh-CN)
> > 
> > * 特别注意
> > 
> > <span style="color:red;">助记词</span>、用户<span style="color:red;">密码</span> 以及用户的<span style="color:red;">私钥</span>，<span style="color:red;font-size:17px;">请绝对绝对不要触网存储</span>，你可以在Promise或者回调函数中使用获取到的私钥以及助记词，助记词和私钥需要<span style="color:red;font-size:17px;">用户自己备份</span>
> > 
> > * 字段说明
> > 
> > ```javascript
> > // keyObject 对一个用户的账户需要本地存储keyObject
> > {
> >     address: '6df0a1724cac1e1d82425066694c1fe633e949bf', // 生成用户账户后的公钥地址
> >     // 下面这些都可以不用管...
> >     crypto: {
> >         cipher: 'aes-128-ctr',
> >         ciphertext: '430a6cde97217e43c0a19e3907a60ec9df07d5f3c2b39ffa4d8ee33811bdb8f0',
> >         cipherparams: {
> >             iv: 'b008e3eacdfc97f652466d510db904dc'
> >         },
> >         mac: 'a7132fd1beff669bfbc08a46be90b3f5674200604aff38a5c5d3e9b259fd8415',
> >         kdf: 'pbkdf2',
> >         kdfparams: {
> >             c: 262144,
> >             dklen: 32,
> >             prf: 'hmac-sha256',
> >             salt: 'f3976d6963d2fe48b2b8fcfae03d31476fe84452ea65d8a7b4bee51743b5a179'
> >         }
> >     },
> >     id: 'ac452a7f-bc58-4298-b8e3-4bf070a86901',
> >     version: 3
> > }
> > ```


### 创建账户

> wallet.createAccount()

####  参数

| 字段                     |   属性            |   类型及范围    | 说明                               |
|:-------------------------|:----------------- |:----------------|:-----------------------------------|
| password | 必传参数 | string | 用户的密码 |
| Promise | 返回 | function | resolve一个Object，其中包含两个字段，keyObject（带有公钥地址的对象） 和 mnemonic（助记词） |
####  示例

```javascript
// 创建账户
wallet.createAccount("password").then(res=>{
    console.log("[keyObject] ---", res.keyObject)
    console.log("[mnemonic] ---", res.mnemonic)
})
```

### 密码鉴权

> wallet.passwordAuth()

####  参数

| 字段                     |   属性            |   类型及范围    | 说明                               |
|:-------------------------|:----------------- |:----------------|:-----------------------------------|
| password | 必传参数 | string | 密码 |
| keyObject | 必传参数 | object | 带有公钥地址的对象 |
| Promise | 返回 | function | resolve用户的私钥 |

####  示例

```javascript
// 密码鉴权
wallet.passwordAuth(password, keyObject).then(res => {
    console.log("[privateKey] ---", res)
})
```

### 助记词恢复账户

> wallet.mnemonicRecover()

####  参数

| 字段                     |   属性            |   类型及范围    | 说明                               |
|:-------------------------|:----------------- |:----------------|:-----------------------------------|
| words | 必传参数 | string | 用户的助记词 |
| newpassword | 必传参数 | string | 用户的需要设置的新密码 |
| keyObject | 必传参数 | object | 带有公钥地址的对象 |
| Promise | 返回 | function | resolve一个Object，keyObject（带有公钥地址的对象） |

####  示例

```javascript
// 助记词恢复账户
wal.mnemonicRecover("aaa ddd ddddc casdc words", newpassword, keyObject).then(res=>{
    console.log("[keyObject] ---", res.keyObject)
})
```

### 获取以太币

> wallet.getEthBalance()

####  参数

| 字段                     |   属性            |   类型及范围    | 说明                               |
|:-------------------------|:----------------- |:----------------|:-----------------------------------|
| address | 必传参数 | string | 用户的公钥地址 |
| Promise | 返回 | function | resolve一个以太币的数额（注意需要除以以太币的decimals） |

####  示例

```javascript
// 获取以太币
wal.getEthBalance(keyObject.address).then(res => {
    console.log("[balance] ---", res)
})
```

### 获取erc20代币

> wallet.getErc20Balance()

####  参数

| 字段                     |   属性            |   类型及范围    | 说明                               |
|:-------------------------|:----------------- |:----------------|:-----------------------------------|
| address | 必传参数 | string | 用户的公钥地址 |
| contract | 必传参数 | string | 代币的合约地址 |
| Promise | 返回 | function | resolve一个代币数额（注意需要除以代币的decimals） |

####  示例

```javascript
// 获取erc20代币
wal.getErc20Balance(keyObject.address, erc20Contract).then(res => {
    console.log("[balance] ---", res)
})
```

### 发起一笔以太币交易

> wallet.sendEthTransaction()

####  参数

| 字段                     |   属性            |   类型及范围    | 说明                               |
|:-------------------------|:----------------- |:----------------|:-----------------------------------|
| fromAddress | 必传参数 | string | 发起交易的用户公钥地址 |
| toAddress | 必传参数 | string | 收取交易的用户公钥地址 |
| value | 必传参数 | int | 交易数额 |
| privateKey | 必传参数 | string | 用户私钥|
| Promise | 返回 | function | resolve一个交易的hash |

####  示例

```javascript
// 发起一笔以太币交易
wal.passwordAuth(password, keyObject).then(res => {
    console.log("[privateKey] ---", res)
    wal.sendEthTransaction(keyObject.address, toAddress, 1.2, res).then(res => {
        console.log("[txHash] ---", res)
    })
})
```

### 发起一笔erc20代币币交易

> wallet.sendErc20Transaction()

####  参数

| 字段                     |   属性            |   类型及范围    | 说明                               |
|:-------------------------|:----------------- |:----------------|:-----------------------------------|
| fromAddress | 必传参数 | string | 发起交易的用户公钥地址 |
| toAddress | 必传参数 | string | 收取交易的用户公钥地址 |
| contract | 必传参数 | string | 代币的合约地址 |
| value | 必传参数 | int | 交易数额 |
| privateKey | 必传参数 | string | 用户私钥|
| Promise | 返回 | function | resolve一个交易的hash |

####  示例

```javascript
// 发起一笔erc20代币币交易
wal.passwordAuth(password, keyObject).then(res => {
    console.log("[privateKey] ---", res)
    wal.sendErc20Transaction(keyObject.address, toAddress, erc20Contract, 1.2, res).then(res => {
        console.log("[txHash] ---", res)
    })
})
```

### 查看交易

> wallet.getTransaction()

####  参数

| 字段                     |   属性            |   类型及范围    | 说明                               |
|:-------------------------|:----------------- |:----------------|:-----------------------------------|
| txHash | 必传参数 | string | 交易的hash |
| Promise | 返回 | function | resolve交易的结果 |

####  示例

```javascript
// 查看交易
wal.getTransaction(txHash).then(res => {
    console.log("[txHash] ---", res)
})
```
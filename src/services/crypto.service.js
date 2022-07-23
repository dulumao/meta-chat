
import cryptico from 'cryptico-es6'
import bip39 from 'bip39'

export const generatePassphrase = () => {
  return bip39.generateMnemonic()
}

export const generateKeyPair = (passphrase) => {
  const key = cryptico.generateRSAKey(passphrase, 1024)
  return {
    privateKey: key,
    publicKey: cryptico.publicKeyString(key)
  }
}

export const getKeypairFromSecret = (privateKey) => {
  return {
    privateKey,
    publicKey: cryptico.publicKeyString(privateKey)
  }
}

export const generateRandomKeyPair = () => {
  return generateKeyPair(generatePassphrase())
}

export const encrypt = (message, publicKey) => {
  return cryptico.encrypt(message, publicKey)
}

export const decrypt = (cipher, privateKey) => {
  return cryptico.decrypt(cipher, privateKey)
}

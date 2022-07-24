export const IPFS = window.IpfsCore;

export const Database = OrbitDB;

export const ipfsConfig = {
  Addresses: {
    Swarm: [
      '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
        '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
    ],
  },
}

export const dbConfig = {
  // If database doesn't exist, create it
  create: true,
  // Don't wait to load from the network
  sync: true,
  accessController: {
    write: ['*'],
  }
}

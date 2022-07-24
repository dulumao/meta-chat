import { createStore } from 'vuex'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

export default createStore({
  state: {
    ipfsNode: null,
    user: null,
    DBController: null,
    mainDB: null
  },
  mutations: {
    setIpfsNode(state, node) {
      state.ipfsNode = node
    },
    setUser(state, user) {
      state.user = user
    },
    setDBController(state, controller) {
      state.DBController = controller
    },
    setMainDatabase(state, db) {
      state.mainDB = db
    }
  }
})
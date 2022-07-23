import { createStore } from 'vuex'

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
<template>
  <div class="w-screen h-screen overflow-hidden relative bg-gray-900">
    <router-view v-slot="{ Component }">
      <transition name="fade">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script>
import { getUser } from './services/localstorage.service.js';
import { IPFS, ipfsConfig as config, Database, dbConfig } from './services/storage.service.js'
import { mapMutations, mapState } from 'vuex'
export default {
  methods: {
    ...mapMutations(['setUser', 'setIpfsNode', 'setMainDatabase', 'setDBController'])
  },
  computed: {
    ...mapState(['ipfsNode'])
  },
  inject: ['mq'],
  async mounted() {
    const session = await getUser();
    this.setUser(session)
    if (session && !this.ipfsNode) { 
      this.setIpfsNode(await IPFS.create({ repo: "devSend", config }));
      const controller = await Database.createInstance(this.ipfsNode);
      this.setDBController(controller);
      const db = await controller.docs('desend-staging', dbConfig);
      await db.load()
      this.setMainDatabase(db);
    }
    this.$router.beforeEach(async (to, from, next) => {
      const user = await getUser()
      if (to.meta.requiresLogout && user) return next({ name: 'app' })
      if (to.meta.requiresAuth && !user) return next({ name: 'connect', query: { redirect: to.fullPath } })
      document.title = to.meta.title
      next()
    })
  }
}
</script>

<style scoped>
.fade-enter-active {
  animation: fadeInRight; /* referring directly to the animation's @keyframe declaration */
  animation-duration: .8s; /* don't forget to set a duration! */
}
.fade-leave-active {
  animation: fadeOutLeft;
  animation-duration: .8s;
}

*::-webkit-scrollbar {
  display: none;
}

</style>

<template>
  <div
    class="
      w-full
      h-screen
      absolute
      text-center
      flex
      justify-center
      items-center
    "
  >
    <div class="flex flex-col">
      <div class="py-10 flex flex-col text-center justify-center items-center">
        <h1 class="text-6xl font-bold text-indigo-600">Connect your account</h1>
        <p class="mt-5 text-sm max-w-lg text-gray-500">
          We are using your metamask public key means your eth address as the id. sothat it secure the privacy no one can access you chat.
        </p>
      </div>
      <div class="relative">
        <div v-show="isLoading" class="absolute flex items-center justify-center w-full h-full z-10 bg-gray-800">
          <loader/>
        </div>
        <div class="grid grid-cols-4">
          <button @click="isGen = true; getAccount()" :class="[isGen ? 'border-indigo-600 text-indigo-600 border-b-gray-700' : 'text-white border-gray-700 border-b-indigo-600']" class="hover:border-indigo-600 hover:text-indigo-600 border rounded-tl-lg col-span-2 px-10 py-2 border-dashed">Register</button>
          <button @click="isGen = false; clear()" :class="[!isGen ? 'border-indigo-600 text-indigo-600 border-b-gray-700' : 'text-white border-gray-700 border-b-indigo-600']" class="hover:border-indigo-600 hover:text-indigo-600 border rounded-tr-lg col-span-2 px-10 py-2 border-dashed">Login</button>
        </div>
        <div v-show="isGen" class="border grid grid-cols-3 border-indigo-600 border-t-transparent border-dashed rounded-bl-lg rounded-br-lg">
          <div class="col-span-3 pt-10 pb-2 flex items-center justify-center">
            <div :style="{ backgroundImage: `url('${userForm.avatar}')` }" class="w-32 h-32 bg-center bg-contain bg-no-repeat">

            </div>
          </div>
          <div class="text-white flex flex-col text-sm uppercase justify-start px-2 py-5">
            <h1>Username</h1>
            <input v-model="userForm.username" class="text-gray-500 text-center bg-transparent border-transparent outline-none" placeholder="type an username" type="text">
          </div>
          <div class="text-white flex flex-col text-sm uppercase justify-start px-2 py-5">
            <h1>Avatar</h1>
            <input v-model="userForm.avatar" class="text-gray-500 text-center bg-transparent border-transparent outline-none" placeholder="paste an picture" type="text">
          </div>
          <div @click="copy" class="text-white cursor-pointer flex flex-col text-sm uppercase justify-start px-2 py-5">
            <h1>ID</h1>
            <input disabled v-model="userForm.id" class="text-gray-500 text-center bg-transparent border-transparent outline-none" placeholder="type an username" type="text">
          </div>
        </div>
        <div v-show="!isGen" class="border border-t-transparent grid grid-cols-3 border-indigo-600 border-dashed rounded-bl-lg rounded-br-lg">
          <div class="col-span-3 pt-10 pb-2 flex items-center justify-center">
            <div :style="{ filter: 'invert(100%)', backgroundImage: `url('http://www.team-energy.nl/wp-content/uploads/2019/12/HandschoenRechts-1.png')` }" class="w-32 h-32 bg-center bg-contain bg-no-repeat">

            </div>
          </div>
          <div class="text-white flex flex-col text-sm col-start-2 uppercase justify-start px-2 py-5">
            <h1>ID</h1>
            <input disabled v-model="userForm.id" class="text-gray-500 text-center bg-transparent border-transparent outline-none" placeholder="type your id" type="text">
          </div>
        </div>
      </div>
      <div class="grid grid-cols-3 mt-10 gap-10">
        <button @click="$router.go(-1)" class="hover:border-indigo-600 hover:text-indigo-600 p-2 col-span-2 10 border border-gray-700 border-dashed rounded-lg text-sm text-white">Get me back</button>
        <button @click="next" class="border border-transparent hover:border-indigo-600 hover:bg-transparent p-2 10 bg-indigo-600 text-white rounded-lg">Continue</button>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapMutations } from "vuex";
import { setUser } from "../services/localstorage.service.js";
import { createUser, validateCreation } from "../services/account.service.js";
import Loader from '../components/Loader.vue'
import { ipfsConfig as config, IPFS, Database, dbConfig } from "../services/storage.service.js";
export default {
  data() {
    return {
      isGen: true,
      isLoading: false,
      userForm: {
        username: "",
        avatar: "",
        id: "",
      },
    };
  },
  computed: {
    ...mapState(["ipfsNode", "user", "DBController"]),
  },
  methods: {
    ...mapMutations(["setIpfsNode", "setDBController", "setMainDatabase", "setUser"]),
    async connect(user) {
      const node = await IPFS.create({
        repo: 'devSend',
        config
      });
      this.setIpfsNode(node);
      const controller = await Database.createInstance(this.ipfsNode);
      this.setDBController(controller);
      const db = await controller.docs('desend-staging', dbConfig);
      await db.load();
      this.setMainDatabase(db);
      if (this.isGen) { 
        const chatsDb = await controller.docs(`${user.id}-chats`, dbConfig);
        await chatsDb.load();
        const addr = await chatsDb.address.toString();
        return await db.put({
          _id: user.id,
          data: user,
          chats: addr
        }, {
          pin: true
        });
      }
      const found = await db.get(user.id);
      if (found.length) return this.userForm = {
        ...this.userForm,
        username: found[0].data.username,
        avatar: found[0].data.avatar
      };
      await this.DBController.stop();
      this.setDBController(null)
      this.setMainDatabase(null)
      await this.ipfsNode.stop();
      this.setIpfsNode(null)
      throw new Error("User not found");
    },
    async getAccount() {
      this.userForm = await createUser();
    },
    async copy() {
      await navigator.clipboard.writeText(this.userForm.id);
      this.$toasts.success('ID copied')
    },
    clear() {
      for (var key in this.userForm) this.userForm[key] = ""
    },
    async next() {
      this.isLoading = true;
      const { status, errors } = await validateCreation(this.userForm)
      if (!status && this.isGen) return errors.forEach(e => {
        this.isLoading = false;
        this.$toasts.error(e.message)
      })
      await this.copy()
      try {
        await this.connect(this.userForm);
        this.$toasts.success('Successful connection.')
        setUser(this.userForm)
        this.setUser(this.userForm)
        this.isLoading = false
        this.$router.push('/app')
      } catch (e) {
        this.isLoading = false
        return this.$toasts.error(e.message)
      }
    }
  },
  async mounted() {
    const user = this.user;
    this.isLoading = true;
    if (user) {
      try {
        await this.connect(user);
      } catch (e) {
        this.$toasts.error(e.message)
      }
      return this.$router.push("/app");
    }
    await this.getAccount();
    this.isLoading = false;
  },
  components: {
    Loader
  }
};
</script>
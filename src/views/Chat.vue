<template>
  <div @click="onClickOutside" class="w-full h-screen absolute text-center flex justify-center items-center">
    <div class="w-screen h-screen md:w-3/4 md:h-4/5 flex relative border rounded-lg border-blue-300 overflow-hidden">
      <!-- left -->
      <transition-group :name="currentChat.visible ? 'fade' : 'fadeBack'">
        <div v-if="!currentChat.visible && mq.smMinus || mq.smPlus" key="smleft" class="md:border-r w-full h-full md:w-auto top-0 left-0 absolute md:relative border-blue-300 min-w-7xl flex flex-col">
          <div class="flex relative items-center px-8 py-3 border-b border-indigo-600">
            <div class="w-10 h-10 md:w-14 md:h-14 bg-center bg-no-repeat bg-cover" :style="{backgroundImage:`url(${user.avatar})`}"></div>
            <div class="flex-col text-left mx-5 text-white">
              <div class="text-md font-bold">{{ user.username }}</div>
              <div class="text-xs text-indigo-600">{{ user.id }}</div>
            </div>
            <div ref="menuButton" class="md:hidden ml-auto">
              <button class="text-white p-2 rounded-full cursor-pointer" @click="menuOpen = !menuOpen"><MenuIcon class="h-5 w-5 text-white"/></button>
            </div>
            <div ref="menu" class="hidden md:flex ml-5">
              <button class="text-white p-2 rounded-full cursor-pointer" @click="setLocation('new')"><PlusIcon class="h-5 w-5 text-white"/></button>
              <button class="text-white p-2 ml-2 rounded-full cursor-pointer" @click="setLocation('chats')"><ChatAlt2Icon class="h-5 w-5 text-white"/></button>
              <button class="text-white p-2 ml-2 rounded-full cursor-pointer" @click="setLocation('config')"><CogIcon class="h-5 w-5 text-white"/></button>
            </div>
            <transition name="message">
              <div v-if="menuOpen && mq.smMinus" class="flex z-10 absolute right-5 top-20 bg-slate-800 border rounded-md border-blue-300 px-5 md:hidden ml-5">
                <button class="text-white p-2 rounded-full cursor-pointer" @click="setLocation('new')"><PlusIcon class="h-5 w-5 text-white"/></button>
                <button class="text-white p-2 ml-2 rounded-full cursor-pointer" @click="setLocation('chats')"><ChatAlt2Icon class="h-5 w-5 text-white"/></button>
                <button class="text-white p-2 ml-2 rounded-full cursor-pointer" @click="setLocation('config')"><CogIcon class="h-5 w-5 text-white"/></button>
              </div>
            </transition>
          </div>
          <div class="h-full overflow-hidden">
            <div class="h-full max-h-full relative">
              <transition-group :name="transitionName">
                <div class="absolute flex items-center justify-center w-full h-full z-10 bg-gray-800" key="loading" v-if="isLoading">
                  <div class="flex justify-center items-center flex-col">
                    <div class="loader animate-spin ease-linear rounded-full border-4 border-t-4 border-gray-700 border-t-indigo-600 h-10 w-10"></div>
                    <div>
                      <div class="text-sm text-gray-600 font-bold mt-5">Loading chats</div>
                    </div>
                  </div>
                </div>
                <div class="absolute w-full h-full" key="chats" v-if="chats.length && location === 'chats'">
                  <div class="w-full overflow-auto h-full flex flex-col scrollbar scrollbar-thin scrollbar-thumb-gray-900 scrollbar-track-gray-800">
                    <transition-group name="message">
                      <div @click="loadChat(chat)" :class="[ chat === chats[0] ? 'mt-5' : 'mt-2', chat._id === currentChat.id ? 'bg-gray-900 border-transparent' : 'bg-gray-800']" v-for="chat in chats" :key="chat._id" class="hover:bg-gray-900 cursor-pointer border-transparent transition items-center grid grid-cols-6 mb-2 mx-5 p-5 max-w-full rounded-lg">
                        <div :style="{ backgroundImage: `url(${chat.peer?.avatar})`}" class="w-14 h-14 col-end-2 bg-center bg-no-repat bg-cover rounded-full">
                        </div>
                        <div class="col-span-3 col-start-2 flex-col max-w-full text-left mx-5 text-white">
                          <div class="text-md font-bold">{{ chat.peer?.username }}</div>
                          <div class=" w-9/12">
                            <div :ref="`snapshot-${chat.peer?.id}`" class="text-sm truncate max-w-full text-gray-600">{{ chat.snapshot }}</div>
                          </div>
                        </div>
                      </div>
                    </transition-group>
                  </div>
                </div>
                <div class="w-full h-full absolute" key="no-chats" v-if="!chats.length && location === 'chats'">
                  <div class="text-center -mt-10 flex flex-col justify-center items-center h-full text-gray-600 text-sm">
                    <ExclamationCircleIcon class="w-14 h-14 mb-5 text-indigo-600" />
                    <div class="text-gray-600 text-sm">No chats yet</div>
                    <div class="text-gray-600 text-sm">Start chatting with your friends</div>
                    <button class="hover:border-indigo-600 border-transparent border mt-5 text-indigo-600 rounded-lg px-4 py-2" @click="setLocation('new')">Start Chatting</button>
                  </div>
                </div>
                <div class="w-full h-full absolute" key="new" v-if="location === 'new'">
                  <div class="text-center -mt-10 flex flex-col justify-center items-center h-full text-gray-600 text-sm">
                    <img class=" w-5/12" :src="qrCode" alt="" title="" />
                    <p class="mt-5 font-bold">Share this address to start a chat</p>
                    <div class="text-white font-bold text-xl mt-5">{{ user.id }}</div>
                    <input v-model="connectId" class="text-center bg-transparent font-bold border-none mt-5" type="text" placeholder="Type here an address">
                    <div>
                      <button class="hover:border-indigo-600 border-transparent border mt-5 text-indigo-600 rounded-lg px-4 py-2" @click="setLocation('chats')">Go Back</button>
                      <button class="border-indigo-600 hover:bg-transparent ml-5 hover:text-indigo-600 bg-indigo-600 border-transparent border mt-5 text-white rounded-lg px-4 py-2" @click="newChat">Connect chat</button>
                    </div>
                  </div>
                </div>
                <div class="w-full h-full absolute" key="config" v-if="location === 'config'">
                  <div>config</div>
                  <button @click="goBack()">Go back</button>
                </div>
              </transition-group>
            </div>
          </div>
        </div>
        <!-- right -->
        <div v-if="currentChat.visible && mq.smMinus || mq.smPlus" key="smright" class="top-0 left-0 w-full h-full bg-slate-800 absolute md:relative overflow-hidden">
          <transition-group :name="currentChat.visible ? 'fadeBack' : 'fade'">
            <div v-if="currentChat.visible" key="chat-view" class="chatContainer absolute w-full h-full">
              <div class="relative w-full h-full flex flex-col">
                <div class="chatHeader flex items-center px-8 py-3 border-b border-indigo-600">
                  <div>
                    <ArrowLeftIcon class="h-5 w-5 text-white cursor-pointer" @click="unloadChat"/>
                  </div>
                  <div v-show="currentChat.typing" id="wave" class="ml-10 flex">
                    <h1 class="text-sm md:text-md mr-4 text-indigo-600">Typing</h1>
                    <div v-show="!mq.mdMinus">
                      <span class="dot inline-block w-1.5 h-1.5 rounded-full mr-1 bg-indigo-600"></span>
                      <span class="dot inline-block w-1.5 h-1.5 delay-100 rounded-full mr-1 bg-indigo-600"></span>
                      <span class="dot inline-block w-1.5 h-1.5 delay-200 rounded-full mr-1 bg-indigo-600"></span>
                    </div>
                  </div>
                  <div class="flex-col text-right ml-auto mx-5 text-white">
                    <div class="text-md font-bold">{{ currentChat.peer?.username }}</div>
                    <div class="text-xs text-indigo-600">{{ currentChat.peer?.id }}</div>
                  </div>
                  <div class="w-10 h-10 md:w-14 md:h-14 bg-center bg-no-repeat bg-cover" :style="{backgroundImage:`url(${currentChat.peer?.avatar})`}"></div>
                </div>
                <div class="relative overflow-hidden w-full h-full opacity-50">
                  <div ref="msgContainer" :class="[ currentChat.allowScrollAnimation ? 'scroll-smooth' : '' ]" class="overflow-auto flex relative h-full scrollbar scrollbar-thin scrollbar-thumb-gray-900 scrollbar-track-gray-800">
                    <div class="mt-auto pt-5 bottom-0 w-full">
                      <transition-group name="message">
                        <div v-for="(message, i) in currentChat.messages" :class="[ message.sender !== currentChat.messages[i+1]?.sender ? 'mb-5' : 'mb-1' ]" :key="message._id"  class="text-white text-left flex px-10 md:px-20">
                          <div :class="[message.sender !== currentChat.messages[i-1]?.sender ? 'rounded-tr-sm' : 'rounded-tr-md']" class="ml-auto py-1 px-2 max-w-lg flex items-baseline text-white rounded-md bg-indigo-600" v-if="message.sender === user.id">
                            <p class="text-white break-all">
                              {{ message.content }}
                            </p>
                            <span class="text-xs ml-5 mt-auto font-thin">
                              {{ timeStampToHour(message.timestamp) }}
                            </span>
                          </div>
                          <div :class="[message.sender !== currentChat.messages[i-1]?.sender ? 'rounded-tl-sm' : 'rounded-tl-md']" class="py-1 px-2 max-w-lg text-white rounded-md flex items-baseline bg-gray-700" v-else>
                            <p class="text-white break-all">
                              {{ message.content }}
                            </p>
                            <span class="text-xs ml-5 mt-auto font-thin">
                              {{ timeStampToHour(message.timestamp) }}
                            </span>
                          </div>
                        </div>
                      </transition-group>
                    </div>
                  </div>
                </div>
                <div class="chatFooter flex items-center px-8 py-3 border-t border-t-indigo-600">
                  <div>
                    
                  </div>
                  <div class="w-full">
                    <input @keydown="typingController" @keydown.enter="sendMessage" v-model="currentChat.currentMessage" style="outline: none" type="text" class="w-full focus:ring-0 text-white outline-none bg-transparent border-none" placeholder="Type a message here">
                  </div>
                </div>
              </div>
            </div>
            <div v-if="!currentChat.visible" key="no-chat-view" class="w-full h-full flex absolute items-center justify-center">
              <div class="flex-col items-center justify-center text-center">
                <svg class="ml-auto mr-auto" width="200" viewBox="0 0 594 437" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M146 119C146 95.2518 165.252 76 189 76H476C499.748 76 519 95.2518 519 119V232C519 255.748 499.748 275 476 275H189C165.252 275 146 255.748 146 232V119Z" class="fill-current text-gray-600"/>
                  <rect x="202" y="142" width="132" height="14" rx="7" fill="white"/>
                  <rect x="202" y="186" width="242" height="14" rx="7" fill="white"/>
                  <g filter="url(#filter0_d)">
                  <path d="M65 252C65 228.252 84.2518 209 108 209H395C418.748 209 438 228.252 438 252V365C438 388.748 418.748 408 395 408H108C84.2518 408 65 388.748 65 365V252Z" class="fill-current text-indigo-600" />
                  <rect x="121" y="275" width="132" height="14" rx="7" fill="white"/>
                  <rect x="121" y="319" width="242" height="14" rx="7" fill="white"/>
                  </g>
                  <circle cx="56" cy="151" r="9" fill="#C4C4C4"/>
                  <circle cx="480" cy="317" r="9" fill="#C4C4C4"/>
                  <circle cx="510" cy="9" r="7.5" stroke="#CDCDCD" stroke-width="3"/>
                  <circle cx="121" cy="57" r="7.5" stroke="#CDCDCD" stroke-width="3"/>
                  <rect x="594" y="187" width="4" height="21" rx="2" transform="rotate(90 594 187)" fill="#C4C4C4"/>
                  <rect x="586" y="200" width="4" height="21" rx="2" transform="rotate(-180 586 200)" fill="#C4C4C4"/>
                  <rect x="344" y="35" width="4" height="21" rx="2" transform="rotate(90 344 35)" fill="#C4C4C4"/>
                  <rect x="336" y="48" width="4" height="21" rx="2" transform="rotate(-180 336 48)" fill="#C4C4C4"/>
                  <rect x="21" y="313" width="4" height="21" rx="2" transform="rotate(90 21 313)" fill="#C4C4C4"/>
                  <rect x="13" y="326" width="4" height="21" rx="2" transform="rotate(-180 13 326)" fill="#C4C4C4"/>
                  <defs>
                  <filter id="filter0_d" x="40" y="188" width="423" height="249" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                  <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                  <feOffset dy="4"/>
                  <feGaussianBlur stdDeviation="12.5"/>
                  <feComposite in2="hardAlpha" operator="out"/>
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
                  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
                  </filter>
                  </defs>
                </svg>
                <div>
                  <h1 class="text-indigo-600 font-bold mt-5 text-2xl">Is nice to chat with someone</h1>
                  <p class="text-gray-600 mt-5 text-sm max-w-md">
                    You can select a chat with someone by clicking on their name in the left sidebar
                  </p>
                  <hr class="my-5 border-gray-600 border-dashed"/>
                  <p class="text-gray-600 mt-5 text-sm">
                    Or start a new chat by clicking <span @click="setLocation('new')" class="text-indigo-600 cursor-pointer">here</span>
                  </p>
                </div>
              </div>
            </div>
          </transition-group>
        </div>  
      </transition-group>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { createMessage, chatModel } from '../services/chats.service.js'
import notification from '../assets/notification.wav'
import { PlusIcon, CogIcon, ChatAlt2Icon, ExclamationCircleIcon, ArrowLeftIcon, MenuIcon } from "@heroicons/vue/outline"
import {getAccount} from '../views/meta.vue';

import { dbConfig } from '../services/storage.service.js'
import RtManager from '../services/pubsub.service.js'
export default {
  data() {
    return {
      rtm: null,
      menuOpen: false,
      generalChannel: null,
      location: "chats",
      transitionName: "fade",
      locationHistory: [],
      chats: [],
      isLoading: true,
      contacts: [],
      currentChat: {
        channel: null,
        allowScrollAnimation: true,
        visible: false,
        id: "",
        name: "",
        peer: {
          id: "",
          name: "",
          avatar: ""
        },
        db: null,
        currentMessage: "",
        typing: false,
        typingTimeout: null,
        messages: []
      },
      connectId: "",
    }
  },
  inject: ['mq'],
  computed: {
    ...mapState(['mainDB', 'user', 'DBController', 'ipfsNode']),
    qrCode() {
      return `https://api.qrserver.com/v1/create-qr-code/?data=${this.user.id}&size=700x700&color=4f46e5&bgcolor=1f2937`
    },
    timeStampToHour() {
      return (timestamp) => {
        let date = new Date(timestamp);
        let hours = date.getHours();
        let minutes = "0" + date.getMinutes();
        return hours + ':' + minutes.substr(-2);
      }
    }
  },
  methods: {
    async getAllUsers() {
      const users = await this.mainDB.get('')
      console.log(users)
    },
    onClickOutside(event) {
      if (this.menuOpen && !this.$refs.menu.contains(event.target) && !this.$refs.menuButton.contains(event.target)) this.menuOpen = false
    },
    async setLocation(location) {
      if (this.location === location) return;
      if (this.locationHistory.slice(-1)[0] === location) return this.goBack();
      this.transitionName = "fade"
      this.locationHistory.push(this.location)
      this.location = location;
      if (location === 'chats') { 
        this.locationHistory = []
        await this.loadChats()
      };
    },
    async goBack() {
      if (this.locationHistory.length === 0) return;
      this.transitionName = "fadeBack"
      this.location = this.locationHistory.pop();
      if (this.location === 'chats') { 
        await this.loadChats()
      };
    },
    async newChat() {
      await this.mainDB.load();
      await this.mainDB.get('');
      const peer = await this.mainDB.get(this.connectId)
      const me = await this.mainDB.get(this.user.id);
      if (!peer.length) return this.$toasts.error("No peer found");
      if (peer[0]._id === me[0]._id) return this.$toasts.error("You can't connect to yourself");
      const peerChats = await this.DBController.docs(peer[0].chats);
      const meChats = await this.DBController.docs(me[0].chats);
      await peerChats.load();
      await meChats.load();
      console.log(await peerChats.get(''), await meChats.get(''));
      const checkExist = await peerChats.query(chat => chat.peers.some(p => p === me[0]._id));
      const checkExis2 = await meChats.query(chat => chat.peers.some(p => p === peer[0]._id));
      if (checkExist.length || checkExis2.length || this.chats.some(p => p.peers.some(e => e === peer[0]._id))) return this.$toasts.error("You are already connected to this user");
      const id = getAccount()
      const chatDB = await this.DBController.docs(`chat-${id}`, dbConfig);
      const address = await chatDB.address.toString();
      const chat = chatModel([me[0]._id, peer[0]._id], id, address);
      await peerChats.put(chat, { pin: true });
      await meChats.put(chat, { pin: true });
      await this.loadChats();
      this.isLoading = false;
      this.setLocation('chats');
      this.generalChannel.broadcast(`create_chat@${this.connectId}`, {})
      this.connectId = "";
    },
    async unloadChat() {
      this.currentChat.visible = false;
      this.currentChat.id = "";
      this.currentChat.name = "";
      this.currentChat.peer = {
        id: "",
        name: "",
        avatar: ""
      };
      this.currentChat.currentMessage = "";
      this.currentChat.messages = [];
      this.currentChat.db = null;
      await this.currentChat.channel.unsubscribe();
      this.currentChat.channel = null;
    },
    async loadChat(chatObj) {
      if (this.currentChat.channel) await this.currentChat.channel.unsubscribe();
      this.currentChat.channel = await this.rtm.subscribe(chatObj._id);
      this.currentChat.channel.on('new_message', (message) => {
        this.currentChat.messages.push(message);
        this.scrollContainerToBottom();
      });
      this.currentChat.channel.on('peer_typing', m => this.currentChat.typing = true); 
      this.currentChat.channel.on('peer_typing_stop', m => this.currentChat.typing = false); 
      const messages = await this.DBController.docs(chatObj.address, dbConfig);
      await messages.load(50);
      this.currentChat.visible = true;
      this.currentChat.id = chatObj._id;
      this.currentChat.name = chatObj.name;
      this.currentChat.peer = chatObj.peer;
      this.currentChat.messages = await messages.get('').sort((a, b) => a.timestamp - b.timestamp);
      this.currentChat.db = messages;
      this.scrollContainerToBottom(true);
    },
    async sendMessage() {
      if (!this.currentChat.currentMessage) return;
      const message = createMessage(this.currentChat.currentMessage, this.user.id);
      this.currentChat.db.put(message, { pin: true });
      this.currentChat.db.load();
      this.currentChat.channel.broadcast('new_message', message);
      this.currentChat.messages.push(message)
      this.currentChat.currentMessage = "";
      const modifiedSender = {...message, sender: this.currentChat.peer.id, emitter: this.user.id}
      this.sendNotification(this.currentChat.peer.id, message);
      this.sendNotification(this.user.id, modifiedSender);
      this.sortChats(modifiedSender);
      this.scrollContainerToBottom();
    },
    typingController(e) {
      if (e.code === 'Backspace' || e.code === 'Enter') return this.currentChat.channel.broadcast('peer_typing_stop');
      if (this.currentChat.typingTimeout) clearTimeout(this.currentChat.typingTimeout);
      this.currentChat.typingTimeout = setTimeout(() => {
        this.currentChat.channel.broadcast('peer_typing_stop');
        this.currentChat.typingTimeout = null;
      }, 3000);
      this.currentChat.channel.broadcast('peer_typing');
    },
    scrollContainerToBottom(transition) {
      if (transition) this.currentChat.allowScrollAnimation = false;
      this.$nextTick(() => {
        this.$refs?.msgContainer?.scrollTo(0, this.$refs.msgContainer.scrollHeight);
        if (transition) this.currentChat.allowScrollAnimation = true;
      })
    },
    async loadPeerData(id) {
      const peer = await this.mainDB.get(id);
      if (!peer.length) return '';
      const avatar = peer[0].data.avatar;
      return {
        avatar,
        username: peer[0].data.username,
        id: peer[0]._id
      };
    },
    async sendNotification(id, message) {
      this.generalChannel.broadcast(`notification@${id}`, message);
    },
    async loadChats(sort = true) {
      const me = await this.mainDB.get(this.user.id);
      const chatsDBAdrress = me[0].chats;
      const chatsDB = await this.DBController.docs(chatsDBAdrress);
      await chatsDB.load();
      const chats = await chatsDB.get('');      
      const loaded = await Promise.all(chats.map(async chat => {
        const doc = await this.DBController.docs(chat.address, dbConfig)
        await doc.load(4);
        const current = await doc.get('').sort((a, b) => a.timestamp - b.timestamp).pop()
        chat.lastUpdated = current?.timestamp || 0;
        chat.snapshot = current?.content || '';
        chat.peer = await this.loadPeerData(chat.peers.filter(c => c !== this.user.id)[0]);
        return chat;
      }));
      if (JSON.stringify(loaded) !== JSON.stringify(this.chats)) this.chats = loaded;
      if (sort) this.chats = this.chats.sort((a, b) => b.lastUpdated - a.lastUpdated);
      this.setLocation('chats');
      this.isLoading = false;
    },
    async sortChats(message) {
      const chat = this.chats.find(c => c.peer.id === message.sender);
      if (!chat) return;
      chat.lastUpdated = message.timestamp;
      this.$refs[`snapshot-${message.sender}`]?.classList.add('message-enter-active')
      chat.snapshot = message.content;
      await new Promise(resolve => setTimeout(resolve, 300));
      this.$refs[`snapshot-${message.sender}`]?.classList.remove('message-enter-active')
      this.chats.sort((a, b) => b.lastUpdated - a.lastUpdated);
    },
    async waitForDBLoad() {
      if (this.mainDB === null) return setTimeout(() => this.waitForDBLoad(), 100);
      await this.loadChats();
      this.rtm = new RtManager(this.ipfsNode.pubsub, 'devsend-app');
      this.generalChannel = await this.rtm.subscribe('general');
      this.generalChannel.on(`create_chat@${this.user.id}`, async () => {
        await this.loadChats();
      });
      this.generalChannel.on(`notification@${this.user.id}`, async (message) => {
        if (message.emitter === this.user.id) return 
        this.sortChats(message);
        if (this.currentChat.peer.id === message.sender) return;
        new Audio(notification).play();
        this.$toasts.success(`${message.sender} sent you a message`);
      });
      const { chat: chatLocation } = this.$route.query;
      if (chatLocation) {
        const chat = this.chats.find(c => c.peer.id === chatLocation);
        console.log(chat);
        if (chat) await this.loadChat(chat);
        else this.$toasts.error(`Chat with ${chatLocation} not found`);
      }
      setTimeout(async () => await this.loadChats(), 5000);
    }
  },
  async mounted() {
    await this.waitForDBLoad();
    //this.mockChats();
    //this.chats = this.chats.map(async e => e.peer = await this.loadPeerData(this.chats.peers.filter(c => c !== this.user.id)[0]));
  },
  components: {
    PlusIcon,
    CogIcon,
    ChatAlt2Icon,
    ExclamationCircleIcon,
    ArrowLeftIcon,
    MenuIcon
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
.fadeBack-enter-active {
  animation: fadeInLeft; /* referring directly to the animation's @keyframe declaration */
  animation-duration: .8s; /* don't forget to set a duration! */
}
.fadeBack-leave-active {
  animation: fadeOutRight;
  animation-duration: .8s;
}
.message-enter-active {
  animation: fadeInUp; /* referring directly to the animation's @keyframe declaration */
  animation-duration: .2s; /* don't forget to set a duration! */
}

.message-leave-active {
  animation: fadeOutDown;
  animation-duration: .2s;
}

.message-move {
  transition: transform .2s;
}
.dot{
  animation: wave 1.3s linear infinite;
}

.dot:nth-child(2) {
  animation-delay: -1.1s;
}
.dot:nth-child(3) {
  animation-delay: -0.9s;
}

@keyframes wave {
  0%, 60%, 100% {
    transform: initial;
  }
  30% {
    transform: translateY(-5px);
  }
}

</style>

import EventEmitter from 'events'
import {getAccount} from '../views/meta.vue';

export default class RtManager extends EventEmitter {
  constructor (pubSub, identifier = 'rtm_') {
    super();
    this._pubSub = pubSub;
    this._id = identifier;
    this._stamp = getAccount();
    this._channels = [];
  }

  async subscribe(channel_name) {
    const channelName = `${this._id}:${channel_name}`
    const foundChannel = this._channels.find((v) => v.channelName == channelName);
    if (foundChannel) return foundChannel.addSubscriber();
    const channel = new Channel(channelName, this._pubSub);
    const subscriber = await channel.init();
    this._channels.push(channel)
    return subscriber;
  }

  async unsubscribe(channel_name) {
    const channelName = `${this._id}:${channel_name}`
    const channel = this._channels.find((v) => v.channelName === channelName);
    if (!channel) return
    const index = this._channels.indexOf(channel);
    await channel.end();
    const formated = this.formatChannel(channel);
    this.emit('unsubscribed', formated);
    this._channels.splice(index, 1);
    return formated
  }

  async ls() {
    return await Promise.all(this._channels.map((v) => { 
      return this.formatChannel(v);
    }));
  }

  async removeSubscriberFromChannel(channel_name, subscriber_id) {
    const channelName = `${this._id}:${channel_name}`
    const channel = this._channels.find((v) => v.channelName === channelName);
    if (!channel) return
    const subscriber = channel.subscribers.find((v) => v.id === subscriber_id);
    if (!subscriber) return
    await subscriber.unsubscribe();
    const formated = this.formatSubscriber(subscriber);
    this.emit('unsubscribed', formated);
    return formated
  }

  formatSubscriber(subscriber) {
    return {
      id: subscriber._id,
      channelName: subscriber.channelName,
      isSubscribed: subscriber.available    
    }
  }

  flushChannels() {
    const channels = this._channels.filter((v) => v._subscribers.length === 0);
    channels.forEach((v) => {
      v.end();
      this._channels.splice(this._channels.indexOf(v), 1);
    });
  }

  formatChannel(channel) { 
    return {
      pubSubChannel: channel.channelName,
      name: channel.channelName.split(':')[1],
      identifier: channel.channelName.split(':')[0],
      id: channel._id,
      subscribers: channel._subscribers.map((v) => v._id)
    }
  }
}

class Channel {
  constructor (channelName, pubSub) {
    this.channelName = channelName;
    this.pubSub = pubSub;
    this._id = getAccount();
    this._subscribers = [];
  }

  async init() {
      const firstSubscriber = this.addSubscriber();
      await this.pubSub.subscribe(this.channelName, async msg => {
          const prepare = JSON.parse(typeof msg.data === 'string' ? msg.data : new TextDecoder().decode(msg.data));
          await Promise.all(this._subscribers.map(s => prepare.broadcast === s._id ? null : s.emit(prepare.eventName, prepare.data, msg)))
      })
    return firstSubscriber;
  }

  async removeSubscriber(id) { 
    const index = this._subscribers.findIndex(s => s._id === id);
    const sub = this._subscribers.find(s => s._id === id);
    if (index == -1) return;
    sub.kill();
    this._subscribers.splice(index, 1);
  }

  addSubscriber() { 
    const subscriber = new Subscriber(this.pubSub, this.channelName);
    subscriber.on('unsubscribe', async (id) => {  
      await this.removeSubscriber(id)
    });
    this._subscribers.push(subscriber);
    return subscriber;
  }

  trigger(eventName, data) {
    this.pubSub.publish(this.channelName, JSON.stringify({
      eventName,
      data,
      stamp: this._id
    }));
  }

  async end() {
    await this.pubSub.unsubscribe(this.channelName, () => {});
    await Promise.all(this._subscribers.map(s => {
      s.kill()
      this.removeSubscriber(s._id);
    }));
  }
}

class Subscriber extends EventEmitter {
  constructor(pubSub, channelName) {
    super();
    this._id = getAccount();
    this._pubSub = pubSub;
    this.channelName = channelName;
    this.available = true;
  }

  async trigger(eventName, data) {
    if (!this.available) return;
    const prepare = JSON.stringify({ eventName, data });
    await this._pubSub.publish(this.channelName, prepare);
  }

  async broadcast(eventName, data) {
    if (!this.available) return;
    const prepare = JSON.stringify({ eventName, data, broadcast: this._id });
    await this._pubSub.publish(this.channelName, prepare);
  }

  async unsubscribe() {
    await Promise.resolve(this.emit('unsubscribe', this._id));
    await Promise.resolve(this.emit('flush', this.channelName));
  }
  
  kill() {
    this.available = false;
    this.emit('end', this._id)
    //this.removeAllListeners();
  }
}
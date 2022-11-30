import Vue from 'vue';
import Vuex from 'vuex';
import login from './login.js';
import auxiliarySystem from './auxiliarySystem.js';
Vue.use(Vuex);
export default new Vuex.Store({
    modules: {
        login,
        auxiliarySystem
    }
});
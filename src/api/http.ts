import Vue from 'vue'
import VueResource from 'vue-resource'
import store from '@/store'

Vue.use(VueResource)

const http = (Vue as any).http as VueResource.Http

http.interceptors.push(request => {
  request.headers.set('Authorization', `Bearer ${store.state.OAuthInfo.accessToken}`);
})

export default http

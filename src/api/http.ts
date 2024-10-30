import store from "@/store";
import http from 'axios'

// Axios is not a good option, but it works for now

http.interceptors.request.use(request => {
  request.headers.set('Authorization', `Bearer ${store.state.OAuthInfo.accessToken}`);
  return request
})

export default http

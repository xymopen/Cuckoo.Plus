import { TimeLineTypes } from "../constant";

import Loading from 'muse-ui-loading'
import Vue from 'vue'
import Router, { Route, NavigationGuard } from 'vue-router'
import store from '../store'
import { RoutersInfo } from '@/constant'
import * as Api from '@/api'
import { createWS } from "@/api/streaming";
import { isBaseTimeLine, checkShouldRegisterApplication } from '@/util'
import { deleteStatus, updateStatus } from "@/pages-components/timelines/edit-status";

// Import generated routes
import routes from 'vue-auto-routing'

Vue.use(Router)

const homePath = '/timelines/home'
const localPath = '/timelines/local'
const publicPath = '/timelines/public'

const timelinesRouteIndex = routes.findIndex(route => route.path === '/timelines')
const timelinesRoute = routes[timelinesRouteIndex]!
routes.splice(timelinesRouteIndex, 1)

const router = new Router({
  routes: [
    {
      path: RoutersInfo.empty.path,
      redirect: homePath
    },

    {
      path: '/timelines',
      redirect: homePath
    },

    // timelines alias

    {
      ...timelinesRoute,
      path: RoutersInfo.defaulttimelines.path,
      name: RoutersInfo.defaulttimelines.name,
      meta: {
        ...timelinesRoute.meta,
        keepAlive: true
      },
      beforeEnter(to, from, next) {
        if (!isBaseTimeLine(to.params.timeLineType)) {
          return next(homePath)
        }

        next()
      }
    },
    {
      ...timelinesRoute,
      path: RoutersInfo.tagtimelines.path,
      name: RoutersInfo.tagtimelines.name,
      meta: {
        ...timelinesRoute.meta,
        keepAlive: true
      }
    },
    {
      ...timelinesRoute,
      path: RoutersInfo.listtimelines.path,
      name: RoutersInfo.listtimelines.name,
      meta: {
        ...timelinesRoute.meta,
        keepAlive: true
      }
    },
    ...routes
  ]
});



export const openUserConnection = () => {
}

export const openLocalConnection = () => {
}

export const openPublicConnection = () => {
}

const statusInitManager = new class {

  private hasInitFetchNotifications = false

  private closeStreamConnection: null | (() => void) = null
  private closeLocalStreamConnection: null | (() => void) = null
  private closePublicStreamConnection: null | (() => void) = null

  private hasUpdateOAuthAccessToken = false

  private hasUpdateCurrentUserAccount = false

  private hasUpdateCustomEmojis = false

  private loadingInstance = null

  private loadingProcessCount = 0

  private startLoading (process: string) {
    if (this.loadingProcessCount === 0) {
      this.loadingInstance = Loading()
    }
    this.loadingProcessCount += 1
  }

  private endLoading () {
    this.loadingProcessCount -= 1
    if (this.loadingProcessCount === 0 && this.loadingInstance != null) {
      this.loadingInstance.close()
    }
  }

  public initFetchNotifications () {
    if (!store.state.notifications.length && !this.hasInitFetchNotifications) {
      store.dispatch('updateNotifications')
      this.hasInitFetchNotifications = true
    }
  }

  public initStreamConnection () {
    if (this.closeStreamConnection == null) {
      const ejectOnUpdate = createWS({ stream: 'user' }, 'update', payload => updateStatus(payload, TimeLineTypes.HOME))
      const ejectOnDelete = createWS({ stream: 'user' }, 'delete', deleteStatus)

      this.closeStreamConnection = () => {
        ejectOnUpdate()
        ejectOnDelete()
      }
    }
  }

  public initLocalStreamConnection () {
    if (this.closeLocalStreamConnection == null) {
      const ejectOnUpdate = createWS({ stream: 'public:local' }, 'update', payload => updateStatus(payload, TimeLineTypes.LOCAL))
      const ejectOnDelete = createWS({ stream: 'public:local' }, 'delete', deleteStatus)

      this.closeLocalStreamConnection = () => {
        ejectOnUpdate()
        ejectOnDelete()
      }
    }
  }

  public destroyLocalStreamConnection () {
    if (this.closeLocalStreamConnection != null) {
      this.closeLocalStreamConnection()
      this.closeLocalStreamConnection = null
    }
  }

  public initPublicStreamConnection () {
    if (this.closePublicStreamConnection == null) {
      const ejectOnUpdate = createWS({ stream: 'public' }, 'update', payload => updateStatus(payload, TimeLineTypes.PUBLIC))
      const ejectOnDelete = createWS({ stream: 'public' }, 'delete', deleteStatus)

      this.closePublicStreamConnection = () => {
        ejectOnUpdate()
        ejectOnDelete()
      }
    }
  }

  public destroyPublicStreamConnection () {
    if (this.closePublicStreamConnection != null) {
      this.closePublicStreamConnection()
      this.closePublicStreamConnection = null
    }
  }


  public async updateCurrentUserAccount () {
    if (!this.hasUpdateCurrentUserAccount) {

      if (!store.state.currentUserAccount) {
        this.startLoading('hasUpdateCurrentUserAccount')
        await store.dispatch('updateCurrentUserAccount')
      } else {
        store.dispatch('updateCurrentUserAccount')
      }

      this.hasUpdateCurrentUserAccount = true
      this.endLoading()
    }
  }

  public async updateOAuthAccessToken () {
    if (store.state.OAuthInfo.accessToken) {
      this.hasUpdateOAuthAccessToken = true
    } else if (!this.hasUpdateOAuthAccessToken) {
      this.startLoading('updateOAuthAccessToken')
      const result = await Api.oauth.fetchOAuthToken()
      store.commit('updateOAuthAccessToken', result.data.access_token)
      this.hasUpdateOAuthAccessToken = true
      this.endLoading()
    }
  }

  public async updateCustomEmojis () {
    if (!this.hasUpdateCustomEmojis) {

      if (!store.state.customEmojis.length) {
        this.startLoading('hasUpdateCustomEmojis')
        await store.dispatch('updateCustomEmojis')
      } else {
        store.dispatch('updateCustomEmojis')
      }

      this.hasUpdateCustomEmojis = true
      this.endLoading()
    }
  }


}

const hasUpdateCurrentUserAccount = false

const beforeEachHooks: { [key: string]: NavigationGuard } = {
  async beforeEachRoute (to, from, next) {

    await statusInitManager.updateCustomEmojis()

    next()
  },

  async beforeNeedOAuthRoutes (to, from, next) {
    if (to.meta.needOAuth) {

      // check if need to register
      if (checkShouldRegisterApplication(to, from)) {
        store.commit('clearAllOAuthInfo')
        return next('/oauth')
      }

      // check if need to get token

      // check if should to be blocked by user fetch
      try {
        await statusInitManager.updateOAuthAccessToken()
        await statusInitManager.updateCurrentUserAccount()
      } catch (e) {
        store.commit('clearAllOAuthInfo')
        return next('/oauth')
      }

      // should fetch notifications
      statusInitManager.initFetchNotifications()
    }

    next()
  },

  beforeHomeTimeLine (to, from, next) {
    if (to.path === homePath) {
      statusInitManager.initStreamConnection()
    }

    next()
  },

  beforeLocalTimeLine (to, from, next) {
    if (to.path === localPath) {
      statusInitManager.initLocalStreamConnection()
    }

    next()
  },

  afterLocalTimeLine (to, from, next) {
    if (from.path === localPath) {
      statusInitManager.destroyLocalStreamConnection()
    }

    next()
  },

  beforePublicTimeLine (to, from, next) {
    if (to.path === publicPath) {
      statusInitManager.initPublicStreamConnection()
    }

    next()
  },

  afterPublicTimeLine (to, from, next) {
    if (from.path === publicPath) {
      statusInitManager.destroyPublicStreamConnection()
    }

    next()
  }
}

Object.keys(beforeEachHooks).forEach(key => {
  router.beforeEach(beforeEachHooks[key])
})

export default router

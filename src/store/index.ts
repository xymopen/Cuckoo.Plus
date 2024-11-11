import Vue from 'vue'
import Vuex, {
  GetterTree as VuexGetterTree,
  ActionTree as VuexActionTree,
  MutationTree as VuexMutationTree,
  ModuleTree as VuexModuleTree,
  Plugin as VuexPlugin,
} from 'vuex'
import mutations from './mutations'
import actions from './actions'
import getters from './getters'
import { mastodonentities } from '@/interface/entities'
import { UiWidthCheckConstants, ThemeNames, I18nLocales, VisibilityTypes } from '@/constant'
import { TimeLineTypes } from '@/constant'

Vue.use(Vuex)

function getLocalSetting (tag, defaultValue) {
  const stringData = localStorage.getItem(tag)

  if (!stringData) return defaultValue

  const parsedData = JSON.parse(stringData)

  if (Object.keys(parsedData).length >= 500) return defaultValue

  return parsedData
}

const state = {

  OAuthInfo: {
    // todo encode
    clientId: localStorage.getItem('clientId') || '',
    clientSecret: localStorage.getItem('clientSecret') || '',
    accessToken: localStorage.getItem('accessToken') || '',
    code: localStorage.getItem('code') || ''
  },

  mastodonServerUri: localStorage.getItem('mastodonServerUri') || '',

  currentUserAccount: getLocalSetting('currentUserAccount', null) as mastodonentities.Account | null,

  noLoadMoreTimeLineList: [] as string[],

  timelines: {
    home: getLocalSetting('home', []) as string[],
    public: [] as string[],
    direct: [] as string[],
    local: [] as string[],
    tag: {} as Record<string, string[]>,
    list: {} as Record<string, string[]>
  },

  streamStatusesPool: {
    home: [] as string[],
    public: [] as string[],
    direct: [] as string[],
    local: [] as string[],
    tag: {} as Record<string, string[]>,
    list: {} as Record<string, string[]>
  },

  contextMap: getLocalSetting('contextMap', {}) as {
    [statusId: string]: {
      ancestors: Array<string>
      descendants: Array<string>
    }
  },

  statusMap: getLocalSetting('statusMap', {}) as {
    [statusId: string]: mastodonentities.Status
  },

  cardMap: getLocalSetting('cardMap', {}) as {
    [statusId: string]: mastodonentities.Card
  },

  customEmojis: getLocalSetting('customEmojis', []) as mastodonentities.Emoji[],

  notifications: [] as mastodonentities.Notification[],

  relationships: {} as {
    [id: string]: mastodonentities.Relationship
  },

  appStatus: {
    documentWidth: window.innerWidth,

    unreadNotificationCount: 0,

    isEditingThemeMode: false,

    shouldShowThemeEditPanel: false,

    settings: {
      multiLineMode: getLocalSetting('multiLineMode', true) as boolean,
      maximumNumberOfColumnsInMultiLineMode: getLocalSetting('maximumNumberOfColumnsInMultiLineMode', 3) as number,
      showSensitiveContentMode: getLocalSetting('showSensitiveContentMode', false) as boolean,
      realTimeLoadStatusMode: getLocalSetting('realTimeLoadStatusMode', false) as boolean,
      autoExpandSpoilerTextMode: getLocalSetting('autoExpandSpoilerTextMode', false) as boolean,
      postMediaAsSensitiveMode: getLocalSetting('postMediaAsSensitiveMode', false) as boolean,
      theme: localStorage.getItem('theme') || ThemeNames.GOOGLE_PLUS,
      tags: getLocalSetting('tags', ['hello']) as string[],
      locale: localStorage.getItem('locale') || I18nLocales.EN as string,
      postPrivacy: localStorage.getItem('postPrivacy') || VisibilityTypes.PUBLIC as string,
      onlyMentionTargetUserMode: getLocalSetting('onlyMentionTargetUserMode', false) as boolean,
      muteMap: {
        statusList: getLocalSetting('statusMuteList', []) as string[],
        userList: getLocalSetting('userMuteList', []) as string[]
      },
    },

  }
}

const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters
})

export type State = typeof state
export type GetterTree = VuexGetterTree<typeof state, typeof state>;
export type ActionTree = VuexActionTree<typeof state, typeof state>;
export type MutationTree = VuexMutationTree<typeof state>;
export type ModuleTree = VuexModuleTree<typeof state>;
export type Plugin = VuexPlugin<typeof state>[];

// TODO: We properly need to find a better persist solution
// Also localStorage is not considered secured and
// should not be used to store sensitive data
window.addEventListener('unload', () => {
  // save timelines
  localStorage.setItem(TimeLineTypes.HOME, JSON.stringify(store.state.timelines[TimeLineTypes.HOME]))

  // save contextMap
  localStorage.setItem('contextMap', JSON.stringify(store.state.contextMap))

  // save statusMap
  localStorage.setItem('statusMap', JSON.stringify(store.state.statusMap))

  localStorage.setItem('cardMap', JSON.stringify(store.state.cardMap))
})

export default store

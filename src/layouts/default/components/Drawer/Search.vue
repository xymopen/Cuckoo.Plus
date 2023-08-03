<template>
  <div class="search-area-container">
    <div class="search-bar">
      <mu-icon value="search" style="margin-right: 10px" />
      <mu-text-field class="search-input" v-model="searchKey" @keydown.stop="onKeyDown" @keydown.enter.stop="onSearch"
        :placeholder="$t($i18nTags.drawer.search_input_placeholder)"
        :action-icon="shouldShowSearchActionIcon ? 'search' : 'cancel'" :action-click="onSearchInputActionClick" />
    </div>
    <div class="search-results default-theme-bg-color" :style="resultPanelStyle">
      <mu-list>
        <mu-sub-header>{{ $t($i18nTags.drawer.search_result_people_label) }}</mu-sub-header>
        <people-result-card v-for="(account, index) in searchResults.accounts" :account="account" :key="index" />
      </mu-list>

      <mu-divider></mu-divider>

      <mu-list>

        <mu-sub-header>{{ $t($i18nTags.drawer.search_result_hashtag_label) }}</mu-sub-header>

        <mu-list-item v-for="(hashTag, index) in searchResults.hashtags" :key="index" class="hashtag-result-card"
          :ripple="false">
          <mu-list-item-title class="hash-tag ellipsis-text primary-read-text-color" v-html="hashTag"
            @click="onCheckHashTagTimeLine(hashTag)" />
          <mu-list-item-action v-if="!appStatus.settings.tags.includes(hashTag)">
            <mu-icon class="operate-btn" value="playlist_add" @click="onSaveHashTag(hashTag)" />
          </mu-list-item-action>
        </mu-list-item>

      </mu-list>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator'
import { State, Action, Mutation } from 'vuex-class'
import * as Api from '@/api'
import { mastodonentities } from '@/interface'
import { UiWidthCheckConstants } from '@/constant'
import PeopleResultCard from './PeopleResultCard.vue'
import { Lg } from "packages/breakpoints/mixins"

@Component({
  components: {
    'people-result-card': PeopleResultCard
  }
})
class Search extends Mixins(Vue.extend(Lg('isNotMobileMode'))) {

  @State('relationships') relationships: {
    [id: string]: mastodonentities.Relationship
  }
  @State('appStatus') appStatus

  @Action('updateRelationships') updateRelationships

  @Mutation('updateTags') updateTags

  searchKey = ''

  currentSearchKey = ''

  shouldShowResultPanel = false

  searchResults: mastodonentities.SearchResults = {
    accounts: [],
    hashtags: [],
    statuses: []
  }

  get shouldShowSearchActionIcon () {
    return !this.searchKey.length && !this.shouldShowResultPanel
  }

  get resultPanelStyle () {
    return {
      height: `calc(100vh - 68px${this.isNotMobileMode ? ' - 64px' : ''})`,
      left: this.shouldShowResultPanel ? '0' : `-${this.isNotMobileMode ? UiWidthCheckConstants.DRAWER_DESKTOP_WIDTH : UiWidthCheckConstants.DRAWER_MOBILE_WIDTH}px`
    }
  }

  async onSearchInputActionClick () {
    if (this.shouldShowSearchActionIcon) return

    this.searchKey = ''
    this.currentSearchKey = ''
    this.shouldShowResultPanel = false
  }

  async onSearch () {
    if (this.searchKey === this.currentSearchKey) return

    this.currentSearchKey = this.searchKey

    const result = await Api.search.getSearchResults(this.searchKey)

    this.searchResults = result.data

    this.updateRelationship()

    this.shouldShowResultPanel = true
  }

  updateRelationship () {
    const newAccountResultList = this.searchResults.accounts.filter(account => !this.relationships[account.id])
    this.updateRelationships({ idList: newAccountResultList.map(account => account.id) })
  }

  onCheckHashTagTimeLine (hashTagName: string) {
    this.$router.push({
      name: this.$routersInfo.tagtimelines.name,
      params: {
        tagName: hashTagName
      }
    })
  }

  onSaveHashTag (hashTagName: string) {
    this.updateTags([...this.appStatus.settings.tags, hashTagName])
  }

  onKeyDown () { }
}

export default Search
</script>

<style lang="less" scoped>
.ellipsis-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.operate-btn {
  cursor: pointer;
}

.search-area-container {
  position: relative;

  .search-bar {
    display: flex;
    align-items: center;
    height: 68px;
    padding: 0 16px;

    .search-input {
      min-height: unset;
      margin: 0;
      padding: 0;
    }
  }

  .search-results {
    position: absolute;
    // todo 在iPhone X上失效
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    top: 68px;
    width: 100%;
    z-index: 1;
    -webkit-transition: left .45s cubic-bezier(.23, 1, .32, 1);
    -moz-transition: left .45s cubic-bezier(.23, 1, .32, 1);
    -ms-transition: left .45s cubic-bezier(.23, 1, .32, 1);
    -o-transition: left .45s cubic-bezier(.23, 1, .32, 1);
    transition: left .45s cubic-bezier(.23, 1, .32, 1);

    .hashtag-result-card {
      .hash-tag {
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>

<style lang="less">
.search-area-container {
  .search-input {

    .mu-input-line,
    .mu-input-focus-line {
      display: none;
    }
  }
}
</style>

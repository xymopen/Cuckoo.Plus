import * as Api from '@/api'
import { mastodonentities } from "@/interface"
import { ActionTree } from ".."

const relationships: ActionTree = {
  async updateRelationships ({ commit }, { idList }: { idList: Array<string> }) {
    try {
      const result = await Api.accounts.fetchRelationships(idList || [])
      const relationshipList: Array<mastodonentities.Relationship> = result.data

      const relationshipMap = {}
      relationshipList.forEach(relationship => {
        relationshipMap[relationship.id] = relationship
      })

      commit('updateRelationships', relationshipMap)
    } catch (e) {

    }
  }
}

export default relationships

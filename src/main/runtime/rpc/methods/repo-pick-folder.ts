import { defineMethod, type RpcMethod } from '../core'

export const REPO_PICK_FOLDER_METHODS: RpcMethod[] = [
  defineMethod({
    name: 'repo.pickFolder',
    params: null,
    handler: async (_params, { runtime }) => ({
      path: await runtime.pickRepoFolder()
    })
  })
]

import DynamoService from "./DynamoService"
import {IDynamoAddFollowersItem, IDynamoFollowersItem, IDynamoGetItem, IDynamoService} from "./interfaces"


const addFollowersItem = async (service: IDynamoService, addItem: IDynamoAddFollowersItem) => {
  return await service.addFollowersItem(addItem)
}

const getFollowersItem = async (service: IDynamoService, getItem: IDynamoGetItem) => {
  const item: IDynamoFollowersItem = await service.getFollowersItem(getItem)
  console.log(item)

  return Promise.resolve()
}


(async () => {
  const service = new DynamoService()
  const id = '3017325194'
  const maxId = undefined

  const addItem = { table: 'FOLLOWERS', item: { id, maxId } }
  const getItem = { table: 'FOLLOWERS', id }

  await addFollowersItem(service, addItem)
  await getFollowersItem(service, getItem)

  process.exit(0)
})()

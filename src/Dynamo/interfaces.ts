export interface IDynamoFollowersItem {
  id: string,
  maxId?: number,
}

export interface IDynamoAddFollowersItem {
  table: string,
  item: IDynamoFollowersItem,
}

export interface IDynamoGetItem {
  table: string,
  id: string,
}

export interface IDynamoService {
  addFollowersItem: (item: IDynamoAddFollowersItem) => Promise<void>,
  getFollowersItem: (item: IDynamoGetItem) => Promise<IDynamoFollowersItem>,
}

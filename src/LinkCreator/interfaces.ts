export interface ILinkCreator {
  generateLongUrl: (campaignUrl: string, name: string, username: string, imageUrl: string) => string
  create: (longUrl: string) => Promise<string>
}

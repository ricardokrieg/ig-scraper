export interface IImageDownloader {
  download: (username: string, imageUrl: string) => Promise<string>
}

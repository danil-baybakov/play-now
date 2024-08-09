declare module 'image-thumbnail' {
  export declare interface ImageThumbnailOptions {
    percentage?: number;
    width?: number;
    height?: number;
    responseType?: string;
    fit?: string;
    failOnError?: boolean;
    withMetaData?: boolean;
  }

  const imageThumbnail: (
    path: string | Buffer,
    options?: ImageThumbnailOptions,
  ) => Promise<string>;

  export = imageThumbnail;
}

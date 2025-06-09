declare module 'browser-image-compression' {
  interface Options {
    /** @default Number.POSITIVE_INFINITY */
    maxSizeMB?: number;
    /** @default undefined */
    maxWidthOrHeight?: number;
    /** @default true */
    useWebWorker?: boolean;
    /** @default 10 */
    maxIteration?: number;
    /** @default undefined */
    exifOrientation?: number;
    /** @default true */
    onProgress?: (progress: number) => void;
    /** @default 'image/jpeg' */
    fileType?: string;
    /** @default 0.4 */
    initialQuality?: number;
    /** @default false */
    alwaysKeepResolution?: boolean;
    /** @default undefined */
    signal?: AbortSignal;
    /** @default false */
    preserveExif?: boolean;
    /** @default 'https://cdn.jsdelivr.net/npm/browser-image-compression/dist/browser-image-compression.js' */
    libURL?: string;
  }

  function imageCompression(file: File, options?: Options): Promise<File>;

  export = imageCompression;
}

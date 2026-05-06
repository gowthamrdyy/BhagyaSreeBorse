declare module 'dom-to-image-more' {
  interface Options {
    bgcolor?: string;
    quality?: number;
    width?: number;
    height?: number;
    style?: object;
    filter?: (node: Node) => boolean;
    cacheBust?: boolean;
  }

  interface DomToImage {
    toBlob(node: Node, options?: Options): Promise<Blob>;
    toPng(node: Node, options?: Options): Promise<string>;
    toJpeg(node: Node, options?: Options): Promise<string>;
    toSvg(node: Node, options?: Options): Promise<string>;
    toPixelData(node: Node, options?: Options): Promise<Uint8ClampedArray>;
  }

  const domToImage: DomToImage;
  export default domToImage;
}

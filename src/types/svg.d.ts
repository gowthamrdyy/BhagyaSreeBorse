declare module '*.svg' {
  import { StaticImageData } from 'next/image';
  const content: StaticImageData;
  export default content;
}

declare module '*.svg?url' {
  const content: string;
  export default content;
}

declare module 'jsmediatags' {
  interface Tags {
    title?: string;
    artist?: string;
    album?: string;
    year?: string;
    comment?: string;
    track?: string;
    genre?: string;
    picture?: {
      format: string;
      data: number[];
      description: string;
    };
  }

  interface Callbacks {
    onSuccess: (tags: { tags: Tags }) => void;
    onError: (error: any) => void;
  }

  function read(file: File, callbacks: Callbacks): void;
  export = { read };
}

declare module 'piexifjs' {
  interface ExifData {
    [key: string]: any;
  }

  const TAGS: {
    [key: string]: any;
  };

  function load(data: string): ExifData;
  function dump(exifObj: ExifData): string;
  function insert(exifStr: string, jpegStr: string): string;
  function remove(jpegStr: string): string;
  function getExifFromXMP(xmpStr: string): ExifData;

  export = {
    load,
    dump,
    insert,
    remove,
    getExifFromXMP,
    TAGS
  };
}

declare module 'exifreader' {
  interface ExifData {
    [key: string]: {
      description: string;
      value: any;
    };
  }

  const load: (file: File) => Promise<ExifData>;
  export default load;
}

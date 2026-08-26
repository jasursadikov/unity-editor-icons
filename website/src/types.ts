export interface Icon {
  name: string;
  width: number;
  height: number;
  size: string;
  fileId: string;
  img: string;
  meta: string;
  dark: boolean;
}

export interface IconsData {
  version: string;
  icons: Icon[];
}

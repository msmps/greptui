type Theme = {
  borderColor: string;
  textColor: string;
  selectedBorderColor: string;
  infoBorderColor: string;
  errorBorderColor: string;
};

export const darkTheme: Theme = {
  borderColor: "gray",
  textColor: "white",
  selectedBorderColor: "cyan",
  infoBorderColor: "yellow",
  errorBorderColor: "red",
};

export function getCurrentTheme() {
  return darkTheme;
}

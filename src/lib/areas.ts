export const DHAKA_AREAS = [
  "Badda",
  "Banani",
  "Bashundhara",
  "Dhanmondi",
  "Farmgate",
  "Gulshan",
  "Jatrabari",
  "Khilgaon",
  "Lalbagh",
  "Malibagh",
  "Mirpur",
  "Mohammadpur",
  "Motijheel",
  "Rampura",
  "Shyamoli",
  "Tejgaon",
  "Uttara",
  "Wari",
];

export const mapLink = (latitude: number, longitude: number) =>
  `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;

// background colors
// maybe add this color value consts to another color.js separate file.
const background_color = "whitesmoke"; // "#e4e4e4";
const lightOther = "#d4d4d4"
const darkBackground = "#999999"
const background_model_color = "#e4f2e3"
const line_color = "#6b6b6b";
const strength_difference_color = "#dad7cd";
const nucleotide_color = "black";

// bar colors
var inclusion_color = "";
var inclusion_highlight_color = "";
var skipping_color = "";
var skipping_highlight_color = "";
// org colors
const org_inclusion_color = "#c5d6fb";
const org_inclusion_highlight_color = "#669aff";
const org_skipping_color = "#f6c3c2";
const org_skipping_highlight_color = "#ff6666";
//alternative colors
const ltr_inclusion_color = "#B2DAEF";
const ltr_skipping_color = "#F9C4D2";
const ltr_inclusion_highlight_color = "#3BBAE2";
const ltr_skipping_highlight_color = "#F16A92";

// Define the image arrays, each with a unique feature identifier
const imagesData = {
  inclusion: [
    { url: "static/transparent/incl_1.png", feature: "incl_1" },
    { url: "static/transparent/incl_2.png", feature: "incl_2" },
    { url: "static/transparent/incl_3.png", feature: "incl_3" },
    { url: "static/transparent/incl_4.png", feature: "incl_4" },
    { url: "static/transparent/incl_5.png", feature: "incl_5" },
    { url: "static/transparent/incl_6.png", feature: "incl_6" },
    { url: "static/transparent/incl_7.png", feature: "incl_7" },
  ],
  skipping: [
    { url: "static/transparent/skip_1.png", feature: "skip_1" },
    { url: "static/transparent/skip_2.png", feature: "skip_2" },
    { url: "static/transparent/skip_3.png", feature: "skip_3" },
    { url: "static/transparent/skip_4.png", feature: "skip_4" },
    { url: "static/transparent/skip_5.png", feature: "skip_5" },
    { url: "static/transparent/skip_6.png", feature: "skip_6" },
  ],
  longSkipping: [
    { url: "static/transparent/g_poor.png", feature: "skip_struct_1" },
    { url: "static/transparent/skip_struct.png", feature: "skip_struct_2" }
  ]
};

const newImagesData = {
  inclusion: [
    { url: "static/transparent/incl_1.png", feature: "incl_1" },
    { url: "static/transparent/incl_2.png", feature: "incl_2" },
    { url: "static/transparent/incl_3.png", feature: "incl_3" },
    { url: "static/transparent/incl_4.png", feature: "incl_4" },
    { url: "static/transparent/incl_5.png", feature: "incl_5" },
    { url: "static/transparent/incl_6.png", feature: "incl_6" },
    { url: "static/transparent/incl_7.png", feature: "incl_7" },
    { url: "static/transparent/incl_8.png", feature: "incl_8" },
    { url: "static/transparent/incl_9.png", feature: "incl_9" },
  ],
  skipping: [
    { url: "static/transparent/skip_1.png", feature: "skip_1" },
    { url: "static/transparent/skip_2.png", feature: "skip_2" },
    { url: "static/transparent/skip_3.png", feature: "skip_3" },
    { url: "static/transparent/skip_4.png", feature: "skip_4" },
    { url: "static/transparent/skip_5.png", feature: "skip_5" },
    { url: "static/transparent/skip_6.png", feature: "skip_6" },
    { url: "static/transparent/skip_7.png", feature: "skip_7" },
    { url: "static/transparent/skip_8.png", feature: "skip_8" },
    { url: "static/transparent/skip_9.png", feature: "skip_9" },
  ],
  longSkipping: [
    { url: "static/transparent/g_poor.png", feature: "skip_struct_1" },
    { url: "static/transparent/skip_struct.png", feature: "skip_struct_2" }
  ]
};

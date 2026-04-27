import { collection, addDoc, getDocs, deleteDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "../services/firebase";

// Verified Unsplash flat-lay photos (no models) — only used where description matches exactly
const U = (id) => `https://images.unsplash.com/photo-${id}?w=400&h=500&fit=crop&q=80`;
// null = user will add photo later via Edit button

const SAREES = [
  // Your 9 sarees — photos to be added via Edit
  { name:"Blue Silk Saree",                                    color:"blue",    purchasePrice:45000, brand:"Kanjivaram", description:"Rich blue silk Kanjivaram with gold zari border. Grand occasions & weddings.",                 imageUrl:null },
  { name:"Baby Pink Banarasi Saree",                           color:"pink",    purchasePrice:6500,  brand:"Banarasi",   description:"Soft baby pink Banarasi silk with gold border. Festive & family occasions.",                  imageUrl:null },
  { name:"Dark Green Kanjivaram Silk Saree",                   color:"green",   purchasePrice:2500,  brand:"Kanjivaram", description:"Deep forest green Kanjivaram with gold & navy border. Temple & cultural events.",              imageUrl:null },
  { name:"Deep Wine with Red Border Kanjivaram Silk Saree",    color:"maroon",  purchasePrice:12500, brand:"Kanjivaram", description:"Deep wine Kanjivaram with vibrant red & gold border. Weddings & receptions.",                 imageUrl:null },
  { name:"Aqua Blue Kanjivaram Silk Saree",                    color:"teal",    purchasePrice:14500, brand:"Kanjivaram", description:"Bright aqua blue Kanjivaram with silver zari motifs. Festive & formal occasions.",             imageUrl:null },
  { name:"Bright Red with Cream Border Kanjivaram Silk Saree", color:"red",     purchasePrice:2500,  brand:"Kanjivaram", description:"Classic bright red Kanjivaram with cream zari border. Auspicious occasions & puja.",          imageUrl:null },
  { name:"Organza Designer Saree",                             color:"pink",    purchasePrice:15000, brand:"Designer",   description:"Blush pink organza with heavy silver embroidery & matching blouse. Weddings & receptions.",    imageUrl:null },
  { name:"Dark Red Sequin Saree",                              color:"maroon",  purchasePrice:54000, brand:"Designer",   description:"Stunning dark red sequin net saree. Grand parties, receptions & award nights.",               imageUrl:null },
  { name:"Pink Organza Saree",                                 color:"pink",    purchasePrice:12000, brand:"Designer",   description:"Delicate blush pink organza with floral embroidery border. Weddings & cocktail parties.",      imageUrl:null },
  // Additional sarees
  { name:"Gold Kanjivaram Silk Saree",                         color:"gold",    purchasePrice:35000, brand:"Kanjivaram", description:"Opulent gold Kanjivaram with heavy zari. Weddings & grand occasions.",                       imageUrl:null },
  { name:"Purple Silk Saree",                                  color:"purple",  purchasePrice:18000, brand:"Kanjivaram", description:"Royal purple silk with gold border. Festive & cultural events.",                             imageUrl:null },
  { name:"Cream Tussar Silk Saree",                            color:"cream",   purchasePrice:8500,  brand:"Fabindia",   description:"Natural Tussar silk with tribal embroidery. Parties & events.",                              imageUrl:null },
  { name:"Maroon Silk Saree",                                  color:"maroon",  purchasePrice:18000, brand:"Fabindia",   description:"Rich maroon silk with gold zari. Weddings & festive occasions.",                             imageUrl:null },
  { name:"Teal Pochampally Ikat Saree",                        color:"teal",    purchasePrice:8500,  brand:"Pochampally",description:"Geometric ikat pattern. Office & semi-formal events.",                                       imageUrl:null },
  { name:"Coral Georgette Saree",                              color:"coral",   purchasePrice:1299,  brand:"Meena Bazaar",description:"Flowy georgette with simple border. Everyday office wear.",                                 imageUrl:null },
  { name:"White Cotton Tant Saree",                            color:"white",   purchasePrice:650,   brand:"Handloom",   description:"Breathable cotton tant. Perfect for summer daily wear.",                                     imageUrl:null },
  { name:"Lavender Chiffon Saree",                             color:"lavender",purchasePrice:999,   brand:"Meena Bazaar",description:"Lightweight chiffon. Easy to drape for office & casual occasions.",                        imageUrl:null },
  { name:"Navy Blue Linen Saree",                              color:"navy",    purchasePrice:1499,  brand:"Fabindia",   description:"Crisp linen saree. Ideal for office & casual meetings.",                                     imageUrl:null },
  { name:"Mustard Handloom Cotton Saree",                      color:"gold",    purchasePrice:1099,  brand:"Handloom",   description:"Traditional handloom weave. Daily wear & casual occasions.",                                 imageUrl:null },
  { name:"Beige Khadi Cotton Saree",                           color:"beige",   purchasePrice:899,   brand:"Khadi India",description:"Handspun khadi cotton. Comfortable for everyday use.",                                      imageUrl:null },
];

const TRADITIONAL = [
  { name:"Pink Anarkali Suit",              color:"pink",    purchasePrice:8999,  brand:"Biba",       description:"Flared Anarkali with embroidery. Festive & family occasions.",                imageUrl:null },
  { name:"Teal Salwar Kameez",              color:"teal",    purchasePrice:5999,  brand:"W",          description:"Elegant teal salwar set. Office & casual festive.",                           imageUrl:null },
  { name:"White Cotton Kurti",              color:"white",   purchasePrice:2499,  brand:"Fabindia",   description:"Chikankari embroidered kurti. Daily wear & casual occasions.",                imageUrl:null },
  { name:"Navy Blue Lehenga",               color:"navy",    purchasePrice:35000, brand:"Ritu Kumar", description:"Regal navy lehenga with silver embroidery. Weddings & receptions.",           imageUrl:null },
  { name:"Gold Embroidered Lehenga",        color:"gold",    purchasePrice:45000, brand:"Sabyasachi", description:"Heavy gold lehenga with zardozi work. Grand weddings & receptions.",          imageUrl:null },
  { name:"Beige Printed Kurti",             color:"beige",   purchasePrice:1999,  brand:"Fabindia",   description:"Casual printed kurti. Daily wear & casual outings.",                          imageUrl:null },
  { name:"Purple Churidar Suit",            color:"purple",  purchasePrice:6999,  brand:"Biba",       description:"Elegant churidar set. Festive & family occasions.",                           imageUrl:null },
  { name:"Mint Green Sharara",              color:"mint",    purchasePrice:9999,  brand:"Global Desi",description:"Flared sharara with embroidery. Sangeet & festive occasions.",                imageUrl:null },
  { name:"Red Anarkali Gown",               color:"red",     purchasePrice:12000, brand:"Biba",       description:"Floor-length red Anarkali. Weddings & grand occasions.",                      imageUrl:null },
  { name:"Coral Kurti with Palazzo",        color:"coral",   purchasePrice:3499,  brand:"W",          description:"Matching kurti-palazzo set. Casual & festive.",                               imageUrl:null },
];

const DRESSES = [
  { name:"Black Wrap Dress",          color:"black",    purchasePrice:5999,  brand:"Zara",       description:"Versatile wrap dress. Casual & smart casual.",                imageUrl:U("1595777457583-95e059d581b8") },
  { name:"Floral Midi Dress",         color:"pink",     purchasePrice:4999,  brand:"H&M",        description:"Feminine floral midi. Casual & brunch.",                      imageUrl:U("1612336307429-8a898d10e223") },
  { name:"Navy Maxi Dress",           color:"navy",     purchasePrice:6999,  brand:"Mango",      description:"Elegant navy maxi. Parties & formal occasions.",               imageUrl:U("1566174053879-31528523f8ae") },
  { name:"Red Cocktail Dress",        color:"red",      purchasePrice:8999,  brand:"AND",        description:"Bold red cocktail. Parties & date nights.",                    imageUrl:U("1502716119720-b23a93e5fe1b") },
  { name:"Emerald Evening Gown",      color:"green",    purchasePrice:18999, brand:"Ritu Kumar", description:"Stunning emerald gown. Galas & grand events.",                 imageUrl:U("1539008835657-9e8e9680c956") },
  { name:"Lavender Mini Dress",       color:"lavender", purchasePrice:4999,  brand:"Zara",       description:"Dreamy lavender mini. Casual parties & brunch.",               imageUrl:U("1585487000160-6ebcfceb0d03") },
  { name:"White Sundress",            color:"white",    purchasePrice:3999,  brand:"Zara",       description:"Flowy white sundress. Beach & summer casual.",                 imageUrl:U("1515372039744-b8f02a3ae446") },
  { name:"Burgundy Midi Dress",       color:"burgundy", purchasePrice:6499,  brand:"Zara",       description:"Rich burgundy midi. Parties & formal dinners.",                imageUrl:U("1550639525-c97d455acf70") },
  { name:"Rose Gold Sequin Gown",     color:"pink",     purchasePrice:14999, brand:"AND",        description:"Shimmering sequin gown. New Year parties & celebrations.",     imageUrl:U("1518611012118-696072aa579a") },
  { name:"Beige Shirt Dress",         color:"beige",    purchasePrice:4499,  brand:"H&M",        description:"Casual shirt dress. Everyday & brunch.",                       imageUrl:U("1496747611176-843222e1e57c") },
  { name:"Coral Sundress",            color:"coral",    purchasePrice:3499,  brand:"H&M",        description:"Bright coral sundress. Summer & beach.",                       imageUrl:U("1572804013309-59a88b7e92f1") },
  { name:"Yellow Maxi Dress",         color:"yellow",   purchasePrice:5999,  brand:"Global Desi",description:"Vibrant yellow maxi. Casual & festive.",                      imageUrl:null },
  { name:"Black Formal Dress",        color:"black",    purchasePrice:9999,  brand:"Mango",      description:"Sleek black formal. Office events & formal dinners.",          imageUrl:U("1539008835657-9e8e9680c956") },
  { name:"Teal Wrap Dress",           color:"teal",     purchasePrice:5499,  brand:"AND",        description:"Elegant teal wrap. Smart casual & parties.",                   imageUrl:null },
  { name:"Pink Off-Shoulder Dress",   color:"pink",     purchasePrice:4299,  brand:"Zara",       description:"Romantic off-shoulder. Date nights & parties.",                imageUrl:null },
  { name:"Navy Bodycon Dress",        color:"navy",     purchasePrice:3999,  brand:"H&M",        description:"Fitted bodycon. Parties & nights out.",                        imageUrl:null },
  { name:"Olive Shirt Dress",         color:"olive",    purchasePrice:3799,  brand:"Mango",      description:"Casual olive shirt dress. Everyday & travel.",                 imageUrl:null },
  { name:"Cream Lace Dress",          color:"cream",    purchasePrice:6999,  brand:"Zara",       description:"Delicate lace dress. Weddings & garden parties.",              imageUrl:null },
  { name:"Maroon Velvet Dress",       color:"maroon",   purchasePrice:7999,  brand:"Mango",      description:"Rich velvet. Winter parties & formal dinners.",                imageUrl:null },
  { name:"Gold Shimmer Dress",        color:"gold",     purchasePrice:8999,  brand:"AND",        description:"Gold shimmer fabric. Award nights & grand celebrations.",      imageUrl:null },
];

const TOPS = [
  { name:"White Cotton T-Shirt",      type:"t-shirt",  color:"white",    purchasePrice:1299,  brand:"H&M",         description:"Classic white tee. Everyday casual wear.",                imageUrl:U("1521572163474-6864f9cf17ab") },
  { name:"Black V-Neck T-Shirt",      type:"t-shirt",  color:"black",    purchasePrice:1499,  brand:"Zara",        description:"Versatile black V-neck. Casual & smart casual.",          imageUrl:U("1583743814966-8936f5b7be1a") },
  { name:"Navy Striped T-Shirt",      type:"t-shirt",  color:"navy",     purchasePrice:1599,  brand:"M&S",         description:"Classic stripes. Casual outings & brunch.",               imageUrl:null },
  { name:"Blush Pink Crop Top",       type:"crop-top", color:"pink",     purchasePrice:1899,  brand:"Zara",        description:"Trendy crop top. Casual & party wear.",                   imageUrl:U("1618354691373-d851c5c3a990") },
  { name:"Yellow Crop Top",           type:"crop-top", color:"yellow",   purchasePrice:1599,  brand:"H&M",         description:"Bright yellow crop. Summer casual wear.",                 imageUrl:null },
  { name:"Lavender Crop Top",         type:"crop-top", color:"lavender", purchasePrice:1799,  brand:"Zara",        description:"Soft lavender crop. Casual & brunch.",                    imageUrl:null },
  { name:"White Linen Shirt",         type:"shirt",    color:"white",    purchasePrice:2499,  brand:"Fabindia",    description:"Breathable linen. Office & smart casual.",                imageUrl:U("1596755094514-f87e34085b2c") },
  { name:"Light Blue Oxford Shirt",   type:"shirt",    color:"blue",     purchasePrice:2999,  brand:"Arrow",       description:"Classic Oxford. Office & formal occasions.",              imageUrl:U("1602810318383-e386cc2a3ccf") },
  { name:"Beige Oversized Shirt",     type:"shirt",    color:"beige",    purchasePrice:2199,  brand:"H&M",         description:"Relaxed oversized fit. Casual & travel.",                 imageUrl:U("1598033129183-c4f50c736f10") },
  { name:"Olive Green Shirt",         type:"shirt",    color:"olive",    purchasePrice:2299,  brand:"H&M",         description:"Earthy olive. Casual & outdoor wear.",                    imageUrl:null },
  { name:"Black Satin Blouse",        type:"blouse",   color:"black",    purchasePrice:3499,  brand:"Zara",        description:"Elegant satin. Parties & formal dinners.",                imageUrl:U("1564257631407-4deb1f99d992") },
  { name:"Ivory Silk Blouse",         type:"blouse",   color:"cream",    purchasePrice:4999,  brand:"AND",         description:"Luxe silk blouse. Office & formal events.",               imageUrl:U("1551163943-3f7253a97e52") },
  { name:"Coral Floral Blouse",       type:"blouse",   color:"coral",    purchasePrice:2799,  brand:"Global Desi", description:"Floral print. Casual & festive occasions.",               imageUrl:U("1572804013309-59a88b7e92f1") },
  { name:"Teal Printed Blouse",       type:"blouse",   color:"teal",     purchasePrice:2599,  brand:"W",           description:"Vibrant teal print. Office & casual.",                    imageUrl:null },
  { name:"Pink Floral Blouse",        type:"blouse",   color:"pink",     purchasePrice:2199,  brand:"Global Desi", description:"Feminine floral. Casual & brunch.",                       imageUrl:null },
  { name:"Mustard Peplum Blouse",     type:"blouse",   color:"gold",     purchasePrice:2999,  brand:"AND",         description:"Peplum silhouette. Office & parties.",                    imageUrl:null },
  { name:"White Embroidered Blouse",  type:"blouse",   color:"white",    purchasePrice:3299,  brand:"Fabindia",    description:"Chikankari embroidery. Festive & casual.",                imageUrl:null },
  { name:"Grey Marl Hoodie",          type:"hoodie",   color:"gray",     purchasePrice:3999,  brand:"Nike",        description:"Cosy hoodie. Casual & gym wear.",                         imageUrl:U("1556821840-3a63f15732ce") },
  { name:"Black Zip Hoodie",          type:"hoodie",   color:"black",    purchasePrice:4499,  brand:"Adidas",      description:"Zip-up hoodie. Casual & sporty.",                         imageUrl:U("1509942774463-acf339cf87d5") },
  { name:"Cream Knit Sweater",        type:"sweater",  color:"cream",    purchasePrice:5999,  brand:"Mango",       description:"Soft knit. Casual & winter wear.",                        imageUrl:U("1576566588028-4147f3842f27") },
  { name:"Burgundy Turtleneck",       type:"sweater",  color:"burgundy", purchasePrice:4999,  brand:"Zara",        description:"Classic turtleneck. Winter & smart casual.",              imageUrl:U("1608744882201-52a7f7f3dd60") },
  { name:"Lavender Crop Sweater",     type:"sweater",  color:"lavender", purchasePrice:3499,  brand:"Mango",       description:"Cropped knit. Casual & trendy.",                          imageUrl:U("1620799140408-edc6dcb6d633") },
  { name:"Brown Knit Sweater",        type:"sweater",  color:"brown",    purchasePrice:4499,  brand:"Mango",       description:"Earthy brown knit. Casual & cosy.",                       imageUrl:null },
  { name:"Mustard Knit Sweater",      type:"sweater",  color:"gold",     purchasePrice:3999,  brand:"H&M",         description:"Bold mustard. Casual & autumn wear.",                     imageUrl:null },
  { name:"White Camisole",            type:"camisole", color:"white",    purchasePrice:999,   brand:"H&M",         description:"Basic camisole. Layering & casual.",                      imageUrl:U("1503342217505-b0a15ec3261c") },
  { name:"Black Camisole",            type:"camisole", color:"black",    purchasePrice:999,   brand:"H&M",         description:"Versatile black cami. Layering & casual.",                imageUrl:null },
  { name:"Olive Green Tank Top",      type:"tank",     color:"olive",    purchasePrice:1199,  brand:"H&M",         description:"Casual tank. Gym & outdoor wear.",                        imageUrl:null },
  { name:"White Tank Top",            type:"tank",     color:"white",    purchasePrice:999,   brand:"H&M",         description:"Basic white tank. Gym & casual.",                         imageUrl:null },
  { name:"Black Bodysuit",            type:"bodysuit", color:"black",    purchasePrice:2499,  brand:"Zara",        description:"Sleek bodysuit. Parties & smart casual.",                 imageUrl:null },
  { name:"Red Polo Shirt",            type:"polo",     color:"red",      purchasePrice:2299,  brand:"Lacoste",     description:"Classic polo. Casual & sporty.",                          imageUrl:null },
  { name:"Navy Polo Shirt",           type:"polo",     color:"navy",     purchasePrice:2499,  brand:"Lacoste",     description:"Navy polo. Smart casual & sports.",                       imageUrl:null },
  { name:"Peach Puff Sleeve Top",     type:"blouse",   color:"coral",    purchasePrice:2799,  brand:"Zara",        description:"Trendy puff sleeves. Casual & parties.",                  imageUrl:null },
  { name:"Rust Wrap Top",             type:"blouse",   color:"maroon",   purchasePrice:2599,  brand:"AND",         description:"Wrap style. Casual & smart casual.",                      imageUrl:null },
  { name:"Gold Sequin Top",           type:"blouse",   color:"gold",     purchasePrice:3499,  brand:"AND",         description:"Sequin party top. New Year & celebrations.",              imageUrl:null },
  { name:"Silver Metallic Top",       type:"blouse",   color:"silver",   purchasePrice:3299,  brand:"Zara",        description:"Metallic finish. Parties & events.",                      imageUrl:null },
  { name:"Pink Ruffle Blouse",        type:"blouse",   color:"pink",     purchasePrice:2999,  brand:"Zara",        description:"Ruffle detail. Romantic & casual occasions.",             imageUrl:null },
  { name:"Black Lace Top",            type:"blouse",   color:"black",    purchasePrice:3199,  brand:"Mango",       description:"Delicate lace. Parties & date nights.",                   imageUrl:null },
  { name:"Coral Smocked Top",         type:"blouse",   color:"coral",    purchasePrice:2299,  brand:"Zara",        description:"Smocked waist. Casual & beach wear.",                     imageUrl:null },
  { name:"Teal Cold Shoulder Top",    type:"blouse",   color:"teal",     purchasePrice:2599,  brand:"AND",         description:"Cold shoulder cut. Parties & casual.",                    imageUrl:null },
  { name:"Cream Peasant Top",         type:"blouse",   color:"cream",    purchasePrice:1999,  brand:"Fabindia",    description:"Boho peasant style. Casual & festive.",                   imageUrl:null },
  { name:"Lavender Tie-Front Top",    type:"blouse",   color:"lavender", purchasePrice:2199,  brand:"H&M",         description:"Tie-front detail. Casual & brunch.",                      imageUrl:null },
];

const BOTTOMS = [
  { name:"Blue Skinny Jeans",         type:"jeans",    color:"blue",     purchasePrice:3999,  brand:"Levis",       description:"Classic skinny jeans. Everyday casual wear.",             imageUrl:U("1542272604-787c3835535d") },
  { name:"Black Slim Jeans",          type:"jeans",    color:"black",    purchasePrice:4499,  brand:"Zara",        description:"Versatile black jeans. Casual & smart casual.",           imageUrl:U("1541099649105-f69ad21f3246") },
  { name:"White Wide Leg Jeans",      type:"jeans",    color:"white",    purchasePrice:3999,  brand:"H&M",         description:"Trendy wide leg. Casual & brunch.",                       imageUrl:null },
  { name:"Denim Mini Skirt",          type:"skirt",    color:"blue",     purchasePrice:2999,  brand:"Zara",        description:"Classic denim mini. Casual & parties.",                   imageUrl:U("1583496661160-fb5886a0aaaa") },
  { name:"Black Midi Skirt",          type:"skirt",    color:"black",    purchasePrice:3499,  brand:"Mango",       description:"Elegant midi length. Office & smart casual.",             imageUrl:U("1577900232427-18219b9166a0") },
  { name:"Pink Pleated Skirt",        type:"skirt",    color:"pink",     purchasePrice:2999,  brand:"Zara",        description:"Flirty pleated skirt. Casual & parties.",                 imageUrl:U("1572804013427-4d7ca7268217") },
  { name:"Mustard Midi Skirt",        type:"skirt",    color:"gold",     purchasePrice:3299,  brand:"H&M",         description:"Bold mustard midi. Casual & autumn.",                     imageUrl:null },
  { name:"Emerald Satin Skirt",       type:"skirt",    color:"green",    purchasePrice:4499,  brand:"Mango",       description:"Luxe satin midi. Parties & events.",                      imageUrl:null },
  { name:"Beige Chinos",              type:"chinos",   color:"beige",    purchasePrice:3299,  brand:"M&S",         description:"Smart chinos. Office & smart casual.",                    imageUrl:U("1473966968600-fa801b869a1a") },
  { name:"Black Leggings",            type:"leggings", color:"black",    purchasePrice:1499,  brand:"Nike",        description:"Comfortable leggings. Gym & casual.",                     imageUrl:U("1506629082955-511b1aa562c8") },
  { name:"Navy Palazzo Pants",        type:"palazzo",  color:"navy",     purchasePrice:2499,  brand:"W",           description:"Flowy palazzo. Casual & festive.",                        imageUrl:U("1509631179647-0177331693ae") },
  { name:"Teal Palazzo",              type:"palazzo",  color:"teal",     purchasePrice:2299,  brand:"W",           description:"Vibrant teal palazzo. Casual & festive.",                 imageUrl:null },
  { name:"Grey Joggers",              type:"joggers",  color:"gray",     purchasePrice:2499,  brand:"Adidas",      description:"Comfortable joggers. Gym & casual.",                      imageUrl:U("1552902865-b72c031ac5ea") },
  { name:"Navy Formal Trousers",      type:"trousers", color:"navy",     purchasePrice:4999,  brand:"Van Heusen",  description:"Tailored trousers. Office & formal.",                     imageUrl:U("1560243563-062bfc001d68") },
  { name:"Black Formal Trousers",     type:"trousers", color:"black",    purchasePrice:4499,  brand:"Arrow",       description:"Classic black trousers. Office & formal.",                imageUrl:U("1624378439575-d8705ad7ae80") },
  { name:"Cream Linen Trousers",      type:"trousers", color:"cream",    purchasePrice:3499,  brand:"Fabindia",    description:"Breathable linen. Summer office wear.",                   imageUrl:null },
  { name:"Burgundy Culottes",         type:"culottes", color:"burgundy", purchasePrice:2799,  brand:"AND",         description:"Trendy culottes. Smart casual & office.",                 imageUrl:null },
  { name:"Rust Flared Trousers",      type:"trousers", color:"maroon",   purchasePrice:3299,  brand:"Zara",        description:"Flared silhouette. Casual & parties.",                    imageUrl:null },
  { name:"Olive Cargo Pants",         type:"trousers", color:"olive",    purchasePrice:3999,  brand:"H&M",         description:"Utility cargo. Casual & outdoor.",                        imageUrl:null },
  { name:"White Shorts",              type:"shorts",   color:"white",    purchasePrice:1999,  brand:"Zara",        description:"Classic white shorts. Summer casual.",                    imageUrl:null },
];

const OUTERWEAR = [
  { name:"Black Leather Jacket",      type:"jacket",   color:"black",    purchasePrice:12999, brand:"Zara",        description:"Classic leather jacket. Casual & party wear.",            imageUrl:U("1551028719-00167b16eac5") },
  { name:"Camel Trench Coat",         type:"coat",     color:"beige",    purchasePrice:15999, brand:"Mango",       description:"Timeless trench coat. Office & smart casual.",            imageUrl:U("1539533018447-63fcce2678e3") },
  { name:"Navy Blazer",               type:"blazer",   color:"navy",     purchasePrice:8999,  brand:"Van Heusen",  description:"Structured blazer. Office & formal events.",              imageUrl:U("1507679799987-c73779587ccf") },
  { name:"White Blazer",              type:"blazer",   color:"white",    purchasePrice:7999,  brand:"Zara",        description:"Crisp white blazer. Smart casual & parties.",             imageUrl:null },
  { name:"Denim Jacket",              type:"jacket",   color:"blue",     purchasePrice:5999,  brand:"Levis",       description:"Classic denim. Casual & everyday.",                       imageUrl:U("1523205771623-e0faa4d2813d") },
  { name:"Burgundy Cardigan",         type:"cardigan", color:"burgundy", purchasePrice:4999,  brand:"Mango",       description:"Cosy cardigan. Casual & winter layering.",                imageUrl:U("1434389677669-e08b4cac3105") },
  { name:"Cream Shawl",               type:"shawl",    color:"cream",    purchasePrice:2999,  brand:"Fabindia",    description:"Elegant shawl. Traditional outfit layering.",             imageUrl:null },
  { name:"Gold Dupatta Shawl",        type:"shawl",    color:"gold",     purchasePrice:3499,  brand:"Fabindia",    description:"Embroidered shawl. Traditional outfit layering.",         imageUrl:null },
  { name:"Grey Wool Coat",            type:"coat",     color:"gray",     purchasePrice:18999, brand:"M&S",         description:"Classic wool coat. Winter & formal.",                     imageUrl:U("1548624313-0396c75e4b1a") },
  { name:"Black Formal Blazer",       type:"blazer",   color:"black",    purchasePrice:9999,  brand:"Arrow",       description:"Tailored black blazer. Office & formal.",                 imageUrl:null },
];

const SHOES = [
  { name:"White Sneakers",            type:"sneakers",     color:"white", purchasePrice:7999,  brand:"Nike",         description:"Classic white sneakers. Casual & everyday.",              imageUrl:U("1542291026-7eec264c27ff") },
  { name:"Black Ankle Boots",         type:"boots",        color:"black", purchasePrice:9999,  brand:"Zara",         description:"Versatile ankle boots. Casual & smart casual.",           imageUrl:U("1543163521-1bf539c55dd2") },
  { name:"Nude Block Heels",          type:"heels",        color:"beige", purchasePrice:5999,  brand:"Steve Madden", description:"Comfortable block heels. Office & parties.",              imageUrl:U("1515347619252-60a4bf4fff4f") },
  { name:"Gold Strappy Sandals",      type:"sandals",      color:"gold",  purchasePrice:4999,  brand:"Aldo",         description:"Elegant strappy sandals. Parties & events.",              imageUrl:U("1603487742131-4160ec999306") },
  { name:"Black Ballet Flats",        type:"ballet-flats", color:"black", purchasePrice:3999,  brand:"Mango",        description:"Classic flats. Office & casual.",                         imageUrl:U("1560343090-f0409e92791a") },
  { name:"Red Stilettos",             type:"stilettos",    color:"red",   purchasePrice:8999,  brand:"Steve Madden", description:"Bold red heels. Parties & date nights.",                  imageUrl:null },
  { name:"White Slip-On Sneakers",    type:"sneakers",     color:"white", purchasePrice:4999,  brand:"Vans",         description:"Casual slip-ons. Everyday & travel.",                     imageUrl:null },
  { name:"Brown Loafers",             type:"loafers",      color:"brown", purchasePrice:6999,  brand:"Clarks",       description:"Classic loafers. Office & smart casual.",                 imageUrl:null },
  { name:"Navy Wedges",               type:"wedges",       color:"navy",  purchasePrice:5499,  brand:"Aldo",         description:"Comfortable wedges. Casual & parties.",                   imageUrl:null },
  { name:"Silver Heels",              type:"heels",        color:"silver",purchasePrice:6499,  brand:"Steve Madden", description:"Metallic silver heels. Parties & events.",                imageUrl:null },
];

const ACCESSORIES = [
  { name:"Black Leather Handbag",     type:"handbag",  color:"black",     purchasePrice:8999,  brand:"Zara",              description:"Classic handbag. Everyday & office.",                  imageUrl:U("1548036328-c9fa89d128fa") },
  { name:"Tan Tote Bag",              type:"bag",      color:"brown",     purchasePrice:6999,  brand:"Mango",             description:"Spacious tote. Office & casual.",                      imageUrl:U("1590874103328-eac38a683ce7") },
  { name:"Gold Statement Necklace",   type:"jewelry",  color:"gold",      purchasePrice:3999,  brand:"Accessorize",       description:"Bold necklace. Parties & festive occasions.",          imageUrl:U("1599643478518-a784e5dc4c8f") },
  { name:"Black Leather Belt",        type:"belt",     color:"black",     purchasePrice:2499,  brand:"Zara",              description:"Classic belt. Everyday & formal.",                     imageUrl:null },
  { name:"Rose Gold Watch",           type:"watch",    color:"pink",      purchasePrice:12999, brand:"Daniel Wellington", description:"Elegant watch. Everyday & formal.",                    imageUrl:U("1523275335684-37898b6baf30") },
  { name:"Beige Clutch Bag",          type:"clutch",   color:"beige",     purchasePrice:4999,  brand:"Aldo",              description:"Evening clutch. Parties & formal events.",             imageUrl:U("1566150905458-1bf1fc113f0d") },
  { name:"Silver Hoop Earrings",      type:"jewelry",  color:"silver",    purchasePrice:1999,  brand:"Accessorize",       description:"Classic hoops. Everyday & casual.",                    imageUrl:U("1535632066927-ab7c9ab60908") },
  { name:"Brown Sling Bag",           type:"bag",      color:"brown",     purchasePrice:4499,  brand:"Mango",             description:"Casual sling bag. Everyday & travel.",                 imageUrl:null },
  { name:"Navy Blue Scarf",           type:"scarf",    color:"navy",      purchasePrice:1999,  brand:"Fabindia",          description:"Classic scarf. Winter & casual.",                      imageUrl:null },
  { name:"Silver Watch",              type:"watch",    color:"silver",    purchasePrice:9999,  brand:"Titan",             description:"Classic silver watch. Everyday & formal.",             imageUrl:null },
  { name:"Gold Bangles Set",          type:"jewelry",  color:"gold",      purchasePrice:5999,  brand:"Tanishq",           description:"Traditional gold bangles. Festive & traditional wear.", imageUrl:null },
  { name:"Pearl Necklace",            type:"jewelry",  color:"white",     purchasePrice:8999,  brand:"Tanishq",           description:"Classic pearl necklace. Formal & traditional.",        imageUrl:null },
  { name:"Red Clutch",                type:"clutch",   color:"red",       purchasePrice:3499,  brand:"Aldo",              description:"Bold red clutch. Parties & date nights.",              imageUrl:null },
  { name:"Black Backpack",            type:"backpack", color:"black",     purchasePrice:5999,  brand:"Wildcraft",         description:"Casual backpack. College & travel.",                   imageUrl:null },
  { name:"Tan Leather Wallet",        type:"bag",      color:"brown",     purchasePrice:2999,  brand:"Fossil",            description:"Classic leather wallet. Everyday use.",                imageUrl:null },
];

// ── BUILD ALL_ITEMS ───────────────────────────────────────────────────────
const ALL_ITEMS = [
  ...SAREES.map(i => ({ ...i, category:"traditional", type:"saree", size:"Free size" })),
  ...TRADITIONAL.map(i => ({ ...i, category:"traditional", type: i.type || "other", size:"M" })),
  ...DRESSES.map(i => ({ ...i, category:"dress", size:"M" })),
  ...TOPS.map(i => ({ ...i, category:"top", size:"M" })),
  ...BOTTOMS.map(i => ({ ...i, category:"bottom", size:"M" })),
  ...OUTERWEAR.map(i => ({ ...i, category:"outerwear", size:"M" })),
  ...SHOES.map(i => ({ ...i, category:"shoes", size:"M" })),
  ...ACCESSORIES.map(i => ({ ...i, category:"accessory", size:"Free size" })),
];

const SAMPLE_LOGS = [
  { name:"Blue Silk Saree",                                    date:"2026-01-15", occasion:"wedding",   mood:"excited",   description:"Wore to cousin's wedding reception" },
  { name:"Baby Pink Banarasi Saree",                           date:"2026-02-10", occasion:"festival",  mood:"happy",     description:"Wore for Pongal celebrations" },
  { name:"Dark Green Kanjivaram Silk Saree",                   date:"2026-01-26", occasion:"religious", mood:"peaceful",  description:"Temple visit on Republic Day" },
  { name:"Aqua Blue Kanjivaram Silk Saree",                    date:"2026-03-08", occasion:"party",     mood:"confident", description:"Women's Day office celebration" },
  { name:"Bright Red with Cream Border Kanjivaram Silk Saree", date:"2026-01-14", occasion:"religious", mood:"happy",     description:"Pongal puja at home" },
  { name:"Baby Pink Banarasi Saree",                           date:"2025-12-25", occasion:"party",     mood:"excited",   description:"Christmas family gathering" },
  { name:"Blue Silk Saree",                                    date:"2025-11-01", occasion:"wedding",   mood:"excited",   description:"Friend's engagement ceremony" },
  { name:"Organza Designer Saree",                             date:"2026-02-14", occasion:"party",     mood:"romantic",  description:"Valentine's Day dinner" },
  { name:"Deep Wine with Red Border Kanjivaram Silk Saree",    date:"2025-10-24", occasion:"festival",  mood:"happy",     description:"Diwali celebration" },
  { name:"Aqua Blue Kanjivaram Silk Saree",                    date:"2025-09-15", occasion:"religious", mood:"peaceful",  description:"Onam sadya" },
  { name:"Dark Red Sequin Saree",                              date:"2026-03-15", occasion:"party",     mood:"confident", description:"Annual company gala night" },
  { name:"Pink Organza Saree",                                 date:"2026-01-20", occasion:"wedding",   mood:"romantic",  description:"Friend's wedding reception" },
  { name:"Black Wrap Dress",                                   date:"2026-02-20", occasion:"casual",    mood:"relaxed",   description:"Casual Friday brunch" },
  { name:"Red Cocktail Dress",                                 date:"2026-03-01", occasion:"party",     mood:"excited",   description:"Birthday party" },
  { name:"White Cotton T-Shirt",                               date:"2026-04-01", occasion:"casual",    mood:"good",      description:"Everyday office wear" },
  { name:"Blue Skinny Jeans",                                  date:"2026-04-01", occasion:"casual",    mood:"good",      description:"Everyday office wear" },
  { name:"Navy Maxi Dress",                                    date:"2026-03-20", occasion:"party",     mood:"confident", description:"Office farewell party" },
  { name:"Emerald Evening Gown",                               date:"2026-02-28", occasion:"formal",    mood:"excited",   description:"Annual awards night" },
  { name:"Pink Anarkali Suit",                                 date:"2026-01-26", occasion:"festival",  mood:"happy",     description:"Republic Day celebration" },
  { name:"White Linen Shirt",                                  date:"2026-04-05", occasion:"work",      mood:"professional", description:"Client meeting" },
  { name:"Black Slim Jeans",                                   date:"2026-04-05", occasion:"work",      mood:"professional", description:"Client meeting" },
  { name:"Navy Blazer",                                        date:"2026-04-05", occasion:"work",      mood:"professional", description:"Client meeting" },
  { name:"Coral Floral Blouse",                                date:"2026-03-25", occasion:"casual",    mood:"happy",     description:"Weekend brunch with friends" },
  { name:"Beige Chinos",                                       date:"2026-03-25", occasion:"casual",    mood:"happy",     description:"Weekend brunch with friends" },
  { name:"Burgundy Midi Dress",                                date:"2026-03-10", occasion:"date",      mood:"romantic",  description:"Anniversary dinner" },
  { name:"Gold Strappy Sandals",                               date:"2026-03-10", occasion:"date",      mood:"romantic",  description:"Anniversary dinner" },
  { name:"Teal Salwar Kameez",                                 date:"2026-02-05", occasion:"religious", mood:"peaceful",  description:"Temple visit" },
  { name:"White Cotton Kurti",                                 date:"2026-04-10", occasion:"casual",    mood:"relaxed",   description:"Casual day out" },
  { name:"Grey Marl Hoodie",                                   date:"2026-04-08", occasion:"casual",    mood:"relaxed",   description:"Gym session" },
  { name:"Black Leggings",                                     date:"2026-04-08", occasion:"casual",    mood:"relaxed",   description:"Gym session" },
  // ── EVERYDAY WEAR (recent — boosts utilization) ──────────────────────
  { name:"White Cotton T-Shirt",                               date:"2026-04-20", occasion:"casual",    mood:"relaxed",      description:"Sunday morning errands" },
  { name:"Blue Skinny Jeans",                                  date:"2026-04-20", occasion:"casual",    mood:"relaxed",      description:"Sunday morning errands" },
  { name:"White Cotton T-Shirt",                               date:"2026-04-18", occasion:"casual",    mood:"good",         description:"Grocery run" },
  { name:"Black Leggings",                                     date:"2026-04-18", occasion:"casual",    mood:"good",         description:"Grocery run" },
  { name:"White Cotton T-Shirt",                               date:"2026-04-15", occasion:"casual",    mood:"good",         description:"Work from home" },
  { name:"Black Slim Jeans",                                   date:"2026-04-15", occasion:"casual",    mood:"good",         description:"Work from home" },
  { name:"White Linen Shirt",                                  date:"2026-04-14", occasion:"work",      mood:"professional", description:"Monday office" },
  { name:"Navy Formal Trousers",                               date:"2026-04-14", occasion:"work",      mood:"professional", description:"Monday office" },
  { name:"Navy Blazer",                                        date:"2026-04-14", occasion:"work",      mood:"professional", description:"Monday office" },
  { name:"Blush Pink Crop Top",                                date:"2026-04-13", occasion:"casual",    mood:"happy",        description:"Brunch with friends" },
  { name:"White Shorts",                                       date:"2026-04-13", occasion:"casual",    mood:"happy",        description:"Brunch with friends" },
  { name:"Coral Floral Blouse",                                date:"2026-04-12", occasion:"casual",    mood:"happy",        description:"Weekend outing" },
  { name:"Beige Chinos",                                       date:"2026-04-12", occasion:"casual",    mood:"happy",        description:"Weekend outing" },
  { name:"Grey Marl Hoodie",                                   date:"2026-04-11", occasion:"casual",    mood:"relaxed",      description:"Gym morning" },
  { name:"Black Leggings",                                     date:"2026-04-11", occasion:"sport",     mood:"energetic",    description:"Gym morning" },
  { name:"Black V-Neck T-Shirt",                               date:"2026-04-10", occasion:"casual",    mood:"good",         description:"Casual Thursday" },
  { name:"Blue Skinny Jeans",                                  date:"2026-04-10", occasion:"casual",    mood:"good",         description:"Casual Thursday" },
  { name:"Ivory Silk Blouse",                                  date:"2026-04-09", occasion:"work",      mood:"professional", description:"Client presentation" },
  { name:"Black Formal Trousers",                              date:"2026-04-09", occasion:"work",      mood:"professional", description:"Client presentation" },
  { name:"White Cotton T-Shirt",                               date:"2026-04-08", occasion:"casual",    mood:"relaxed",      description:"Home day" },
  { name:"Grey Joggers",                                       date:"2026-04-08", occasion:"casual",    mood:"relaxed",      description:"Home day" },
  { name:"Cream Knit Sweater",                                 date:"2026-04-07", occasion:"casual",    mood:"cosy",         description:"Cool evening walk" },
  { name:"Black Slim Jeans",                                   date:"2026-04-07", occasion:"casual",    mood:"cosy",         description:"Cool evening walk" },
  { name:"White Linen Shirt",                                  date:"2026-04-06", occasion:"casual",    mood:"relaxed",      description:"Sunday brunch" },
  { name:"Beige Chinos",                                       date:"2026-04-06", occasion:"casual",    mood:"relaxed",      description:"Sunday brunch" },
  { name:"Teal Salwar Kameez",                                 date:"2026-04-05", occasion:"religious", mood:"peaceful",     description:"Saturday temple visit" },
  { name:"White Cotton Kurti",                                 date:"2026-04-04", occasion:"casual",    mood:"relaxed",      description:"Casual Friday at home" },
  { name:"Black Leggings",                                     date:"2026-04-04", occasion:"casual",    mood:"relaxed",      description:"Casual Friday at home" },
  { name:"Coral Floral Blouse",                                date:"2026-04-03", occasion:"work",      mood:"happy",        description:"Thursday office" },
  { name:"Navy Palazzo Pants",                                 date:"2026-04-03", occasion:"work",      mood:"happy",        description:"Thursday office" },
  { name:"Grey Marl Hoodie",                                   date:"2026-04-02", occasion:"casual",    mood:"relaxed",      description:"Morning jog" },
  { name:"Grey Joggers",                                       date:"2026-04-02", occasion:"sport",     mood:"energetic",    description:"Morning jog" },
  { name:"Black V-Neck T-Shirt",                               date:"2026-04-01", occasion:"casual",    mood:"good",         description:"Everyday wear" },
  { name:"Blue Skinny Jeans",                                  date:"2026-04-01", occasion:"casual",    mood:"good",         description:"Everyday wear" },
  // ── MARCH LOGS ────────────────────────────────────────────────────────
  { name:"White Cotton T-Shirt",                               date:"2026-03-30", occasion:"casual",    mood:"good",         description:"Sunday errands" },
  { name:"Black Leggings",                                     date:"2026-03-30", occasion:"casual",    mood:"good",         description:"Sunday errands" },
  { name:"Ivory Silk Blouse",                                  date:"2026-03-28", occasion:"work",      mood:"professional", description:"Friday office" },
  { name:"Black Formal Trousers",                              date:"2026-03-28", occasion:"work",      mood:"professional", description:"Friday office" },
  { name:"Blush Pink Crop Top",                                date:"2026-03-27", occasion:"casual",    mood:"happy",        description:"Shopping trip" },
  { name:"Denim Mini Skirt",                                   date:"2026-03-27", occasion:"casual",    mood:"happy",        description:"Shopping trip" },
  { name:"Burgundy Turtleneck",                                date:"2026-03-25", occasion:"casual",    mood:"cosy",         description:"Cool day out" },
  { name:"Black Slim Jeans",                                   date:"2026-03-25", occasion:"casual",    mood:"cosy",         description:"Cool day out" },
  { name:"White Linen Shirt",                                  date:"2026-03-24", occasion:"work",      mood:"professional", description:"Monday meeting" },
  { name:"Navy Formal Trousers",                               date:"2026-03-24", occasion:"work",      mood:"professional", description:"Monday meeting" },
  { name:"Coral Floral Blouse",                                date:"2026-03-22", occasion:"casual",    mood:"happy",        description:"Weekend brunch" },
  { name:"Pink Pleated Skirt",                                 date:"2026-03-22", occasion:"casual",    mood:"happy",        description:"Weekend brunch" },
  { name:"Grey Marl Hoodie",                                   date:"2026-03-20", occasion:"sport",     mood:"energetic",    description:"Gym session" },
  { name:"Black Leggings",                                     date:"2026-03-20", occasion:"sport",     mood:"energetic",    description:"Gym session" },
  { name:"White Cotton Kurti",                                 date:"2026-03-19", occasion:"casual",    mood:"relaxed",      description:"Home day" },
  { name:"Black Leggings",                                     date:"2026-03-19", occasion:"casual",    mood:"relaxed",      description:"Home day" },
  { name:"Navy Blazer",                                        date:"2026-03-18", occasion:"work",      mood:"professional", description:"Wednesday office" },
  { name:"White Linen Shirt",                                  date:"2026-03-18", occasion:"work",      mood:"professional", description:"Wednesday office" },
  { name:"Black Formal Trousers",                              date:"2026-03-18", occasion:"work",      mood:"professional", description:"Wednesday office" },
  { name:"Lavender Crop Top",                                  date:"2026-03-16", occasion:"casual",    mood:"happy",        description:"Sunday outing" },
  { name:"White Wide Leg Jeans",                               date:"2026-03-16", occasion:"casual",    mood:"happy",        description:"Sunday outing" },
  { name:"Black V-Neck T-Shirt",                               date:"2026-03-14", occasion:"casual",    mood:"relaxed",      description:"Casual Saturday" },
  { name:"Grey Joggers",                                       date:"2026-03-14", occasion:"casual",    mood:"relaxed",      description:"Casual Saturday" },
  { name:"Teal Salwar Kameez",                                 date:"2026-03-12", occasion:"religious", mood:"peaceful",     description:"Temple visit" },
  { name:"White Cotton Kurti",                                 date:"2026-03-10", occasion:"casual",    mood:"relaxed",      description:"Work from home" },
  { name:"Navy Palazzo Pants",                                 date:"2026-03-10", occasion:"casual",    mood:"relaxed",      description:"Work from home" },
  { name:"Cream Knit Sweater",                                 date:"2026-03-08", occasion:"party",     mood:"confident",    description:"Women's Day celebration" },
  { name:"Black Midi Skirt",                                   date:"2026-03-08", occasion:"party",     mood:"confident",    description:"Women's Day celebration" },
  { name:"Coral Floral Blouse",                                date:"2026-03-06", occasion:"work",      mood:"happy",        description:"Thursday office" },
  { name:"Beige Chinos",                                       date:"2026-03-06", occasion:"work",      mood:"happy",        description:"Thursday office" },
  { name:"White Cotton T-Shirt",                               date:"2026-03-04", occasion:"casual",    mood:"relaxed",      description:"Tuesday home" },
  { name:"Black Leggings",                                     date:"2026-03-04", occasion:"casual",    mood:"relaxed",      description:"Tuesday home" },
  { name:"Grey Marl Hoodie",                                   date:"2026-03-02", occasion:"casual",    mood:"relaxed",      description:"Sunday morning" },
  { name:"Blue Skinny Jeans",                                  date:"2026-03-02", occasion:"casual",    mood:"relaxed",      description:"Sunday morning" },];

export const seedWardrobe = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return { success: false, message: "Not logged in" };
  try {
    const wardrobeRef = collection(db, "users", userId, "wardrobe");
    const existing = await getDocs(wardrobeRef);
    await Promise.all(existing.docs.map(d => deleteDoc(d.ref)));

    const addedItems = [];
    const nn = (v) => (v === undefined || v === null) ? null : v;
    for (const item of ALL_ITEMS) {
      const ref = await addDoc(wardrobeRef, {
        name:          nn(item.name) || "Unnamed",
        category:      nn(item.category) || "top",
        type:          nn(item.type) || "other",
        color:         nn(item.color) || "black",
        purchasePrice: nn(item.purchasePrice) || 0,
        size:          nn(item.size) || "M",
        brand:         nn(item.brand),
        description:   nn(item.description),
        imageUrl:      nn(item.imageUrl),
        wearCount:     0, lastWorn: null,
        purchaseDate:  "2024-01-01", createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
      addedItems.push({ id: ref.id, ...item });
    }

    const logsRef = collection(db, "users", userId, "outfitLogs");
    const existingLogs = await getDocs(logsRef);
    await Promise.all(existingLogs.docs.map(d => deleteDoc(d.ref)));

    const wearCounts = {};
    const lastWornDates = {};

    for (const log of SAMPLE_LOGS) {
      const item = addedItems.find(i => i.name === log.name);
      if (!item) continue;
      await addDoc(logsRef, {
        date: log.date, occasion: log.occasion, mood: log.mood,
        itemIds: [item.id], itemCount: 1, description: log.description,
        totalOutfitValue: item.purchasePrice, createdAt: serverTimestamp(),
      });
      wearCounts[item.id] = (wearCounts[item.id] || 0) + 1;
      if (!lastWornDates[item.id] || log.date > lastWornDates[item.id]) {
        lastWornDates[item.id] = log.date;
      }
    }

    for (const [itemId, count] of Object.entries(wearCounts)) {
      await updateDoc(doc(db, "users", userId, "wardrobe", itemId), {
        wearCount: count, lastWorn: lastWornDates[itemId] || null, updatedAt: serverTimestamp(),
      });
    }

    try {
      const totalValue = ALL_ITEMS.reduce((s, i) => s + (i.purchasePrice || 0), 0);
      await updateDoc(doc(db, "users", userId), {
        "stats.totalItems": ALL_ITEMS.length,
        "stats.totalWardrobeValue": totalValue,
        "stats.totalOutfitLogs": SAMPLE_LOGS.length,
        "stats.lastUpdated": serverTimestamp(),
      });
    } catch (_) {}

    return { success: true, message: "Added " + ALL_ITEMS.length + " items + " + SAMPLE_LOGS.length + " outfit logs! Tap Edit on items with blank photos to add your pictures." };
  } catch (err) {
    return { success: false, message: "Error: " + err.message };
  }
};

export const clearWardrobe = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return { success: false, message: "Not logged in" };
  try {
    const wardrobeRef = collection(db, "users", userId, "wardrobe");
    const existing = await getDocs(wardrobeRef);
    await Promise.all(existing.docs.map(d => deleteDoc(d.ref)));
    return { success: true, message: "Wardrobe cleared!" };
  } catch (err) {
    return { success: false, message: "Error: " + err.message };
  }
};


/**
 * Adds everyday outfit logs to the EXISTING wardrobe without replacing any items.
 * Matches log names to existing wardrobe items and updates wear counts.
 */
export const addOutfitLogs = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return { success: false, message: "Not logged in" };
  try {
    // Load existing wardrobe
    const wardrobeRef = collection(db, "users", userId, "wardrobe");
    const wardrobeSnap = await getDocs(wardrobeRef);
    const wardrobe = wardrobeSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (wardrobe.length === 0) {
      return { success: false, message: "Your wardrobe is empty. Load sample items first." };
    }

    const logsRef = collection(db, "users", userId, "outfitLogs");
    const wearCounts = {};
    const lastWornDates = {};
    let logsAdded = 0;

    for (const log of SAMPLE_LOGS) {
      const item = wardrobe.find(i => i.name === log.name);
      if (!item) continue;
      await addDoc(logsRef, {
        date: log.date, occasion: log.occasion, mood: log.mood,
        itemIds: [item.id], itemCount: 1, description: log.description,
        totalOutfitValue: item.purchasePrice || 0, createdAt: serverTimestamp(),
      });
      wearCounts[item.id] = (wearCounts[item.id] || 0) + 1;
      if (!lastWornDates[item.id] || log.date > lastWornDates[item.id]) {
        lastWornDates[item.id] = log.date;
      }
      logsAdded++;
    }

    // Update wear counts on wardrobe items
    const { updateDoc, doc } = await import("firebase/firestore");
    for (const [itemId, count] of Object.entries(wearCounts)) {
      const existing = wardrobe.find(i => i.id === itemId);
      const currentWears = existing?.wearCount || 0;
      await updateDoc(doc(db, "users", userId, "wardrobe", itemId), {
        wearCount: currentWears + count,
        lastWorn: lastWornDates[itemId] || null,
        updatedAt: serverTimestamp(),
      });
    }

    // Update user stats
    try {
      const { updateDoc: ud, doc: d, increment } = await import("firebase/firestore");
      await ud(d(db, "users", userId), {
        "stats.totalOutfitLogs": increment(logsAdded),
        "stats.lastUpdated": serverTimestamp(),
      });
    } catch (_) {}

    return { success: true, message: `Added ${logsAdded} outfit logs to your existing wardrobe!` };
  } catch (err) {
    return { success: false, message: "Error: " + err.message };
  }
};
export const SEED_ITEMS = ALL_ITEMS;
export const FEMALE_ITEMS = ALL_ITEMS;
